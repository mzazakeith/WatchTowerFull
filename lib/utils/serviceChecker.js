import axios from 'axios';
import dns from 'dns';
import { promisify } from 'util';
import https from 'https';
import net from 'net';
import ping from 'ping';
import { exec } from 'child_process';

const dnsLookup = promisify(dns.lookup);
const dnsResolve = promisify(dns.resolve);
const execPromise = promisify(exec);

/**
 * Main function to check a service based on its type
 */
export async function checkService(service) {
  try {
    const timestamp = new Date();
    let result;

    switch (service.checkType) {
      case 'http':
        result = await performHttpCheck(service);
        break;
      case 'ping':
        result = await performPingCheck(service);
        break;
      case 'tcp':
        result = await performTcpCheck(service);
        break;
      case 'dns':
        result = await performDnsCheck(service);
        break;
      case 'port':
        result = await performPortCheck(service);
        break;
      case 'ssl':
        result = await performSslCheck(service);
        break;
      case 'custom':
        result = await performCustomCheck(service);
        break;
      default:
        throw new Error(`Unsupported check type: ${service.checkType}`);
    }

    return {
      ...result,
      timestamp,
      serviceId: service._id,
    };
  } catch (error) {
    console.error(`Error checking service ${service.name}:`, error);
    return {
      status: 'down',
      responseTime: 0,
      error: error.message,
      timestamp: new Date(),
      serviceId: service._id,
    };
  }
}

/**
 * Perform an HTTP/HTTPS check on a service
 */
export async function performHttpCheck(service) {
  console.log("Starting HTTP check for", service.name);
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
        rejectUnauthorized: service.verifySSL !== false,
      }),
    };

    console.log(`Making ${requestOptions.method} request to ${requestOptions.url} with timeout ${requestOptions.timeout}ms`);

    // Add headers if specified - Fix for Map or Object type headers
    if (service.requestHeaders) {
      // Convert Map to plain object if needed
      let headers = {};
      
      if (service.requestHeaders instanceof Map) {
        // If it's a Map, convert to object
        service.requestHeaders.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (typeof service.requestHeaders === 'object') {
        // If it's already an object
        headers = Object.fromEntries(
          Object.entries(service.requestHeaders).filter(([_, v]) => v !== null && v !== undefined)
        );
      }
      
      // Ensure all header values are strings
      Object.keys(headers).forEach(key => {
        if (headers[key] !== null && headers[key] !== undefined) {
          headers[key] = String(headers[key]);
        }
      });
      
      requestOptions.headers = headers;
      console.log("Request headers:", headers);
    }

    try {
      const response = await axios(requestOptions);
      console.log(`Received response with status code ${response.status}`);
      
      statusCode = response.status;
      responseSize = JSON.stringify(response.data).length;
      
      // Check if status code matches expected
      if (service.expectedStatusCode && response.status !== service.expectedStatusCode) {
        status = 'warning';
        error = `Unexpected status code: ${response.status}, expected: ${service.expectedStatusCode}`;
      }
      
      // Check if response contains expected content
      if (service.expectedResponseContent && 
          !JSON.stringify(response.data).includes(service.expectedResponseContent)) {
        status = 'warning';
        error = `Response does not contain expected content`;
      }
      
      // Check response time thresholds
      const responseTime = Date.now() - startTime;
      if (service.alertThresholds?.responseTime) {
        if (responseTime >= service.alertThresholds.responseTime.critical) {
          status = 'critical';
        } else if (responseTime >= service.alertThresholds.responseTime.warning && status === 'healthy') {
          status = 'degraded';
        }
      }
      
      metadata = {
        statusCode,
        responseSize,
        headers: response.headers,
      };

      console.log(`HTTP check completed with status: ${status}, responseTime: ${Date.now() - startTime}ms`);
      
      return {
        status,
        responseTime: Date.now() - startTime,
        error,
        metadata,
      };
    } catch (axiosError) {
      console.error(`Axios error for ${service.name}:`, axiosError.message);
      if (axiosError.response) {
        console.error(`Response status: ${axiosError.response.status}`);
        statusCode = axiosError.response.status;
      } else if (axiosError.request) {
        console.error('No response received from server');
      }
      throw axiosError;
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`HTTP check failed for ${service.name}: ${error.message}`);
    
    return {
      status: 'down',
      responseTime,
      error: error.message,
      metadata: {
        statusCode,
        responseSize,
      },
    };
  }
}

/**
 * Perform a ping check on a service
 */
export async function performPingCheck(service) {
  const startTime = Date.now();
  
  try {
    const res = await ping.promise.probe(service.url, {
      timeout: service.timeout,
    });
    
    const responseTime = res.time;
    let status = 'healthy';
    
    if (!res.alive) {
      status = 'down';
    } else if (service.alertThresholds?.responseTime) {
      if (responseTime >= service.alertThresholds.responseTime.critical) {
        status = 'critical';
      } else if (responseTime >= service.alertThresholds.responseTime.warning) {
        status = 'degraded';
      }
    }
    
    return {
      status,
      responseTime,
      error: res.alive ? null : 'Host is not reachable',
      metadata: {
        packetLoss: res.packetLoss,
        numeric_host: res.numeric_host,
      },
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'down',
      responseTime,
      error: error.message,
    };
  }
}

/**
 * Perform a TCP check on a service
 */
export async function performTcpCheck(service) {
  const startTime = Date.now();
  const port = service.port || 80;
  
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let error = null;
    
    socket.setTimeout(service.timeout * 1000);
    
    socket.on('connect', () => {
      const responseTime = Date.now() - startTime;
      let status = 'healthy';
      
      if (service.alertThresholds?.responseTime) {
        if (responseTime >= service.alertThresholds.responseTime.critical) {
          status = 'critical';
        } else if (responseTime >= service.alertThresholds.responseTime.warning) {
          status = 'degraded';
        }
      }
      
      socket.destroy();
      resolve({
        status,
        responseTime,
        error: null,
      });
    });
    
    socket.on('timeout', () => {
      error = 'Connection timeout';
      socket.destroy();
    });
    
    socket.on('error', (err) => {
      error = err.message;
      socket.destroy();
    });
    
    socket.on('close', () => {
      if (error) {
        const responseTime = Date.now() - startTime;
        resolve({
          status: 'down',
          responseTime,
          error,
        });
      }
    });
    
    socket.connect(port, service.url);
  });
}

/**
 * Perform a DNS check on a service
 */
export async function performDnsCheck(service) {
  const startTime = Date.now();
  
  try {
    const result = await dnsResolve(service.url);
    const responseTime = Date.now() - startTime;
    
    let status = 'healthy';
    if (service.alertThresholds?.responseTime) {
      if (responseTime >= service.alertThresholds.responseTime.critical) {
        status = 'critical';
      } else if (responseTime >= service.alertThresholds.responseTime.warning) {
        status = 'degraded';
      }
    }
    
    return {
      status,
      responseTime,
      error: null,
      metadata: {
        addresses: result,
      },
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'down',
      responseTime,
      error: error.message,
    };
  }
}

/**
 * Perform a port check on a service
 */
export async function performPortCheck(service) {
  const startTime = Date.now();
  const port = service.port || 80;
  
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let error = null;
    
    socket.setTimeout(service.timeout * 1000);
    
    socket.on('connect', () => {
      const responseTime = Date.now() - startTime;
      let status = 'healthy';
      
      if (service.alertThresholds?.responseTime) {
        if (responseTime >= service.alertThresholds.responseTime.critical) {
          status = 'critical';
        } else if (responseTime >= service.alertThresholds.responseTime.warning) {
          status = 'degraded';
        }
      }
      
      socket.destroy();
      resolve({
        status,
        responseTime,
        error: null,
        metadata: {
          port,
        },
      });
    });
    
    socket.on('timeout', () => {
      error = 'Connection timeout';
      socket.destroy();
    });
    
    socket.on('error', (err) => {
      error = err.message;
      socket.destroy();
    });
    
    socket.on('close', () => {
      if (error) {
        const responseTime = Date.now() - startTime;
        resolve({
          status: 'down',
          responseTime,
          error,
          metadata: {
            port,
          },
        });
      }
    });
    
    socket.connect(port, service.url);
  });
}

/**
 * Perform an SSL certificate check on a service
 */
export async function performSslCheck(service) {
  const startTime = Date.now();
  
  try {
    // Use OpenSSL to check certificate
    const command = `echo | openssl s_client -servername ${service.url} -connect ${service.url}:443 -timeout ${service.timeout} 2>/dev/null | openssl x509 -noout -dates`;
    
    const { stdout } = await execPromise(command);
    const responseTime = Date.now() - startTime;
    
    // Parse certificate dates
    const notBefore = stdout.match(/notBefore=(.*)/)?.[1];
    const notAfter = stdout.match(/notAfter=(.*)/)?.[1];
    
    if (!notBefore || !notAfter) {
      throw new Error('Could not parse certificate dates');
    }
    
    const expiryDate = new Date(notAfter);
    const now = new Date();
    
    // Calculate days until expiry
    const daysUntilExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
    
    let status = 'healthy';
    let error = null;
    
    // Check if certificate is expired or about to expire
    if (daysUntilExpiry <= 0) {
      status = 'down';
      error = 'SSL certificate has expired';
    } else if (daysUntilExpiry <= 7) {
      status = 'critical';
      error = `SSL certificate expires in ${daysUntilExpiry} days`;
    } else if (daysUntilExpiry <= 30) {
      status = 'warning';
      error = `SSL certificate expires in ${daysUntilExpiry} days`;
    }
    
    // Check response time thresholds
    if (service.alertThresholds?.responseTime && status === 'healthy') {
      if (responseTime >= service.alertThresholds.responseTime.critical) {
        status = 'critical';
      } else if (responseTime >= service.alertThresholds.responseTime.warning) {
        status = 'degraded';
      }
    }
    
    return {
      status,
      responseTime,
      error,
      metadata: {
        validFrom: notBefore,
        validUntil: notAfter,
        daysUntilExpiry,
      },
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'down',
      responseTime,
      error: error.message,
    };
  }
}

/**
 * Perform a custom check on a service
 */
export async function performCustomCheck(service) {
  // This is a placeholder for custom checks
  // In a real implementation, this would execute custom scripts or commands
  
  const startTime = Date.now();
  
  try {
    // Simulate a check with a random result
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const responseTime = Date.now() - startTime;
    const randomValue = Math.random();
    
    let status = 'healthy';
    let error = null;
    
    if (randomValue > 0.9) {
      status = 'down';
      error = 'Custom check failed';
    } else if (randomValue > 0.7) {
      status = 'critical';
      error = 'Custom check critical threshold exceeded';
    } else if (randomValue > 0.5) {
      status = 'warning';
      error = 'Custom check warning threshold exceeded';
    }
    
    return {
      status,
      responseTime,
      error,
      metadata: {
        customValue: randomValue,
      },
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'down',
      responseTime,
      error: error.message,
    };
  }
}