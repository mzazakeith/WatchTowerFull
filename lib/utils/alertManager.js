/**
 * Generate an alert based on a service check result
 */
export function generateAlert(service, checkResult) {
  // Don't create alerts for healthy services
  if (checkResult.status === 'healthy' || checkResult.status === 'pending') {
    return null;
  }

  // Determine alert severity based on check status
  let severity;
  switch (checkResult.status) {
    case 'down':
      severity = 'down';
      break;
    case 'critical':
      severity = 'critical';
      break;
    case 'warning':
      severity = 'warning';
      break;
    case 'degraded':
      severity = 'warning';
      break;
    default:
      return null; // Don't create alerts for other statuses
  }

  // Determine the metric type that triggered the alert
  let metric = 'custom';
  let value = null;

  if (checkResult.error?.includes('status code')) {
    metric = 'status_code';
    value = checkResult.statusCode;
  } else if (checkResult.error?.includes('Response time')) {
    metric = 'response_time';
    value = checkResult.responseTime;
  } else if (checkResult.error?.includes('SSL certificate')) {
    metric = 'ssl';
    value = checkResult.error;
  }

  // Create the alert
  return {
    serviceId: service._id,
    checkId: checkResult._id, // If the check has been saved to the database
    timestamp: new Date(),
    status: 'pending',
    severity,
    metric,
    value: value || checkResult.error,
    message: checkResult.error || `Service ${service.name} is ${checkResult.status}`,
  };
}

/**
 * Check if a new alert should be created or an existing one updated
 */
export function shouldCreateNewAlert(existingAlerts, newAlert) {
  // If no existing alerts, create a new one
  if (!existingAlerts || existingAlerts.length === 0) {
    return true;
  }

  // Find the most recent unresolved alert for the same service and metric
  const matchingAlert = existingAlerts.find(a => 
    a.serviceId.toString() === newAlert.serviceId.toString() &&
    a.metric === newAlert.metric &&
    ['pending', 'acknowledged'].includes(a.status)
  );

  // If no matching alert exists, create a new one
  if (!matchingAlert) {
    return true;
  }

  // If the new alert has a different severity, create a new one
  if (matchingAlert.severity !== newAlert.severity) {
    return true;
  }

  // Otherwise, don't create a new alert (update the existing one)
  return false;
}

/**
 * Group related alerts into an incident
 */
export function groupAlertsIntoIncident(alerts, timeWindowMinutes = 15) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  // Sort alerts by timestamp
  const sortedAlerts = [...alerts].sort((a, b) => a.timestamp - b.timestamp);
  
  // Get unique services affected
  const servicesAffected = [...new Set(sortedAlerts.map(a => a.serviceId.toString()))];
  
  // If multiple services are affected within a short time window, consider it an incident
  if (servicesAffected.length > 1) {
    // Check if alerts happened within the time window
    const firstAlertTime = sortedAlerts[0].timestamp;
    const timeWindow = timeWindowMinutes * 60 * 1000; // Convert to milliseconds
    
    // Filter alerts that occurred within the time window
    const alertsInWindow = sortedAlerts.filter(a => 
      (a.timestamp - firstAlertTime) <= timeWindow
    );
    
    // If there are alerts from multiple services within the time window, create an incident
    const servicesInWindow = [...new Set(alertsInWindow.map(a => a.serviceId.toString()))];
    
    if (servicesInWindow.length > 1) {
      // Determine the highest severity from the alerts
      const severities = {
        'down': 3,
        'critical': 2,
        'warning': 1
      };
      
      const highestSeverity = alertsInWindow.reduce((highest, alert) => {
        return severities[alert.severity] > severities[highest] ? alert.severity : highest;
      }, 'warning');
      
      // Map alert severity to incident severity
      const incidentSeverity = {
        'down': 'critical',
        'critical': 'major',
        'warning': 'minor'
      }[highestSeverity];
      
      return {
        title: `Multiple services ${highestSeverity === 'down' ? 'down' : 'degraded'}`,
        services: servicesInWindow,
        severity: incidentSeverity,
        startedAt: firstAlertTime,
        status: 'investigating',
      };
    }
  }
  
  return null;
}

/**
 * Determine if an alert should be auto-resolved
 */
export function shouldAutoResolveAlert(alert, service, currentStatus) {
  // Only auto-resolve pending or acknowledged alerts
  if (!['pending', 'acknowledged'].includes(alert.status)) {
    return false;
  }
  
  // If the service is now healthy, resolve the alert
  if (currentStatus === 'healthy') {
    return true;
  }
  
  // For response time alerts, if the current response time is back below thresholds, resolve the alert
  if (alert.metric === 'response_time') {
    const warningThreshold = service.alertThresholds?.responseTime?.warning;
    if (warningThreshold && alert.value > warningThreshold && currentStatus <= warningThreshold) {
      return true;
    }
  }
  
  return false;
} 