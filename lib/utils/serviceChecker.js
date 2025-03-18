import axios from 'axios';
import dns from 'dns';
import { promisify } from 'util';
import https from 'https';

const dnsLookup = promisify(dns.lookup);
const dnsResolve = promisify(dns.resolve);

/**
 * Perform an HTTP/HTTPS check on a service
 */
export async function performHttpCheck(service) {
  const startTime = Date.now();
  let status = 'healthy';
  let statusCode = null;
  let responseSize = 0;
  let error = null;
  let metadata = {};

  try {
    const requestOptions = {
      method: service.httpMethod || 'GET',
      url: service.url,
      timeout: service.timeout * 1000,
      maxRedirects: service.followRedirects ? 5 : 0,
      validateStatus: null, // Don't throw on any status code
      httpsAgent: new https.Agent({
        rejectUnauthorized: service.verifySSL,
      }),
    };

    // Add headers if specified
    if (service.requestHeaders && typeof service.requestHeaders.get === 'function') {
      requestOptions.headers = {};
      service.requestHeaders.forEach((value, key) => {
        requestOptions.headers[key] = value;
      });
    }

    // Add request body if specified and method is not GET or HEAD
    if (service.requestBody && !['GET', 'HEAD'].includes(service.httpMethod)) {
      requestOptions.data = service.requestBody;
    }

    const response = await axios(requestOptions);
    statusCode = response.status;
    responseSize = JSON.stringify(response.data).length;

    // Check for expected status code
    if (service.expectedStatusCode && response.status !== service.expectedStatusCode) {
      status = 'warning';
      error = `Expected status code ${service.expectedStatusCode}, but got ${response.status}`;
    }

    // Check for expected content
    if (service.expectedResponseContent && 
        !JSON.stringify(response.data).includes(service.expectedResponseContent)) {
      status = 'warning';
      error = `Expected response to contain "${service.expectedResponseContent}", but it was not found`;
    }

    // Check response time thresholds
    const responseTime = Date.now() - startTime;
    if (responseTime > service.alertThresholds?.responseTime?.critical) {
      status = 'critical';
      error = `Response time (${responseTime}ms) exceeded critical threshold (${service.alertThresholds.responseTime.critical}ms)`;
    } else if (responseTime > service.alertThresholds?.responseTime?.warning) {
      status = status === 'healthy' ? 'degraded' : status;
      error = `Response time (${responseTime}ms) exceeded warning threshold (${service.alertThresholds.responseTime.warning}ms)`;
    }

    metadata = {
      headers: response.headers,
    };

    return {
      status,
      responseTime: Date.now() - startTime,
      statusCode,
      responseSize,
      error,
      metadata,
    };
  } catch (err) {
    // Handle different types of errors
    if (err.code === 'ECONNREFUSED') {
      status = 'down';
      error = 'Connection refused';
    } else if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
      status = 'critical';
      error = 'Connection timed out';
    } else if (err.code === 'ENOTFOUND') {
      status = 'down';
      error = 'Host not found';
    } else if (err.code === 'CERT_HAS_EXPIRED') {
      status = 'critical';
      error = 'SSL certificate has expired';
    } else {
      status = 'down';
      error = err.message || 'Unknown error';
    }

    return {
      status,
      responseTime: Date.now() - startTime,
      statusCode,
      responseSize,
      error,
      metadata,
    };
  }
}

/**
 * Perform a ping (ICMP) check on a service
 * Note: This is a simplified ping check, as true ICMP ping requires root privileges
 * Here we use DNS lookup as a stand-in for ping
 */
export async function performPingCheck(service) {
  const startTime = Date.now();
  let status = 'healthy';
  let error = null;
  let metadata = {};

  try {
    // Extract hostname from URL
    const url = new URL(service.url);
    const hostname = url.hostname;

    // Perform DNS lookup to check if host exists
    await dnsLookup(hostname);

    // Check response time thresholds
    const responseTime = Date.now() - startTime;
    if (responseTime > service.alertThresholds?.responseTime?.critical) {
      status = 'critical';
      error = `Response time (${responseTime}ms) exceeded critical threshold (${service.alertThresholds.responseTime.critical}ms)`;
    } else if (responseTime > service.alertThresholds?.responseTime?.warning) {
      status = 'degraded';
      error = `Response time (${responseTime}ms) exceeded warning threshold (${service.alertThresholds.responseTime.warning}ms)`;
    }

    return {
      status,
      responseTime,
      error,
      metadata,
    };
  } catch (err) {
    if (err.code === 'ENOTFOUND') {
      status = 'down';
      error = 'Host not found';
    } else {
      status = 'down';
      error = err.message || 'Unknown error';
    }

    return {
      status,
      responseTime: Date.now() - startTime,
      error,
      metadata,
    };
  }
}

/**
 * Perform a DNS check on a service
 */
export async function performDnsCheck(service) {
  const startTime = Date.now();
  let status = 'healthy';
  let error = null;
  let metadata = {};

  try {
    // Extract hostname from URL
    const url = new URL(service.url);
    const hostname = url.hostname;

    // Perform DNS resolution
    const addresses = await dnsResolve(hostname);

    metadata = {
      addresses,
    };

    // Check response time thresholds
    const responseTime = Date.now() - startTime;
    if (responseTime > service.alertThresholds?.responseTime?.critical) {
      status = 'critical';
      error = `Response time (${responseTime}ms) exceeded critical threshold (${service.alertThresholds.responseTime.critical}ms)`;
    } else if (responseTime > service.alertThresholds?.responseTime?.warning) {
      status = 'degraded';
      error = `Response time (${responseTime}ms) exceeded warning threshold (${service.alertThresholds.responseTime.warning}ms)`;
    }

    return {
      status,
      responseTime,
      error,
      metadata,
    };
  } catch (err) {
    if (err.code === 'ENOTFOUND') {
      status = 'down';
      error = 'Host not found';
    } else if (err.code === 'ENODATA') {
      status = 'down';
      error = 'No DNS records found';
    } else {
      status = 'down';
      error = err.message || 'Unknown error';
    }

    return {
      status,
      responseTime: Date.now() - startTime,
      error,
      metadata,
    };
  }
}

/**
 * Perform appropriate check based on service type
 */
export async function checkService(service) {
  if (service.paused) {
    return { 
      serviceId: service._id,
      status: 'pending',
      message: 'Service checks paused',
      timestamp: new Date(),
    };
  }

  switch (service.checkType) {
    case 'http':
      return {
        serviceId: service._id,
        ...await performHttpCheck(service),
        timestamp: new Date(),
      };
    case 'ping':
      return {
        serviceId: service._id,
        ...await performPingCheck(service),
        timestamp: new Date(),
      };
    case 'dns':
      return {
        serviceId: service._id,
        ...await performDnsCheck(service),
        timestamp: new Date(),
      };
    // Additional check types can be implemented here
    default:
      return {
        serviceId: service._id,
        status: 'warning',
        error: `Unsupported check type: ${service.checkType}`,
        timestamp: new Date(),
      };
  }
} 