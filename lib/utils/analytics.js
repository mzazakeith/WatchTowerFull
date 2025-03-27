/**
 * WTower Analytics - Lightweight, privacy-first visitor analytics
 * 
 * This module provides a non-blocking, performance-optimized way to collect
 * visitor analytics data while respecting user privacy preferences.
 */

// Configuration defaults
const DEFAULT_CONFIG = {
  endpoint: '/api/analytics/collect',
  sampleRate: 1.0, // 100% of visitors
  batchSize: 10, // Number of events to batch before sending
  batchInterval: 30000, // 30 seconds between batch sends
  retryAttempts: 3,
  retryBackoff: 2000, // Base retry delay in ms (will be multiplied by 2^attempt)
  respectDoNotTrack: true,
  maskIpAddress: true,
  storageKey: 'wtower_analytics',
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  fingerprinting: true, // Use browser fingerprinting for visitor identification
  cookieFallback: true, // Use cookies as fallback if fingerprinting fails
  trackClicks: true,
  trackScrollDepth: true,
  trackTimeOnPage: true,
  debug: false
};

// State management
let config = { ...DEFAULT_CONFIG };
let queue = [];
let visitorId = null;
let sessionId = null;
let pageLoadTime = null;
let batchTimer = null;
let retryQueue = [];
let isInitialized = false;
let storage = null;
let currentPage = null;
let pageStartTime = null;
let maxScrollDepth = 0;
let clickCount = 0;
let pageInteractions = 0;

/**
 * Initialize the analytics system
 * @param {Object} userConfig - User configuration to override defaults
 * @returns {Object} - The analytics API
 */
export function initAnalytics(userConfig = {}) {
  if (isInitialized) return getPublicApi();
  
  // Merge user config with defaults
  config = { ...DEFAULT_CONFIG, ...userConfig };
  
  // Check if analytics should be disabled based on user preferences
  if (config.respectDoNotTrack && isDoNotTrackEnabled()) {
    if (config.debug) console.log('Analytics disabled: Do Not Track is enabled');
    return getPublicApi();
  }
  
  // Initialize storage
  initStorage();
  
  // Generate or retrieve visitor and session IDs
  identifyVisitor();
  
  // Set current page and start time
  currentPage = window.location.pathname;
  pageStartTime = Date.now();
  pageLoadTime = getPageLoadTime();
  
  // Set up event listeners
  if (typeof window !== 'undefined') {
    // Track page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Track clicks if enabled
    if (config.trackClicks) {
      document.addEventListener('click', handleClick);
    }
    
    // Track scroll depth if enabled
    if (config.trackScrollDepth) {
      window.addEventListener('scroll', handleScroll);
    }
    
    // Track page unload
    window.addEventListener('beforeunload', handleUnload);
    
    // Send initial pageview
    trackPageview();
    
    // Start batch timer
    startBatchTimer();
  }
  
  isInitialized = true;
  return getPublicApi();
}

/**
 * Check if Do Not Track is enabled in the browser
 */
function isDoNotTrackEnabled() {
  if (typeof window === 'undefined') return false;
  
  const dnt = 
    navigator.doNotTrack === '1' || 
    navigator.doNotTrack === 'yes' ||
    navigator.msDoNotTrack === '1' ||
    window.doNotTrack === '1';
  
  return dnt;
}

/**
 * Initialize storage for analytics data
 */
function initStorage() {
  try {
    // Try to use IndexedDB first
    if (window.indexedDB) {
      // IndexedDB implementation would go here
      // For simplicity, we'll use localStorage for now
      storage = localStorage;
    } else {
      storage = localStorage;
    }
    
    // Load any queued events from storage
    const storedData = storage.getItem(config.storageKey);
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        if (data.queue && Array.isArray(data.queue)) {
          queue = data.queue;
        }
        if (data.retryQueue && Array.isArray(data.retryQueue)) {
          retryQueue = data.retryQueue;
        }
      } catch (e) {
        if (config.debug) console.error('Failed to parse stored analytics data', e);
      }
    }
  } catch (e) {
    if (config.debug) console.error('Failed to initialize storage for analytics', e);
  }
}

/**
 * Generate a visitor ID using browser fingerprinting or cookies
 */
function identifyVisitor() {
  // Try to get existing IDs from storage
  try {
    const storedIds = storage.getItem(`${config.storageKey}_ids`);
    if (storedIds) {
      const { visitor, session, timestamp } = JSON.parse(storedIds);
      visitorId = visitor;
      
      // Check if the session is still valid
      if (session && timestamp && (Date.now() - timestamp) < config.sessionTimeout) {
        sessionId = session;
      } else {
        sessionId = generateId();
      }
    }
  } catch (e) {
    if (config.debug) console.error('Failed to retrieve stored visitor ID', e);
  }
  
  // If no visitor ID exists, create one
  if (!visitorId) {
    if (config.fingerprinting) {
      visitorId = generateBrowserFingerprint();
    }
    
    // Fallback to random ID if fingerprinting fails or is disabled
    if (!visitorId) {
      visitorId = generateId();
    }
  }
  
  // If no session ID exists, create one
  if (!sessionId) {
    sessionId = generateId();
  }
  
  // Store the IDs
  try {
    storage.setItem(`${config.storageKey}_ids`, JSON.stringify({
      visitor: visitorId,
      session: sessionId,
      timestamp: Date.now()
    }));
  } catch (e) {
    if (config.debug) console.error('Failed to store visitor ID', e);
  }
}

/**
 * Generate a unique ID
 */
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a browser fingerprint based on browser and device characteristics
 */
function generateBrowserFingerprint() {
  if (typeof window === 'undefined') return null;
  
  try {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      !!window.sessionStorage,
      !!window.localStorage,
      !!window.indexedDB,
      navigator.hardwareConcurrency || 'unknown',
      navigator.deviceMemory || 'unknown',
      navigator.platform || 'unknown'
    ];
    
    // Simple hash function
    const hash = components.join('###');
    let result = 0;
    for (let i = 0; i < hash.length; i++) {
      result = ((result << 5) - result) + hash.charCodeAt(i);
      result = result & result; // Convert to 32bit integer
    }
    
    return 'fp_' + Math.abs(result).toString(16);
  } catch (e) {
    if (config.debug) console.error('Failed to generate browser fingerprint', e);
    return null;
  }
}

/**
 * Get page load performance data
 */
function getPageLoadTime() {
  if (typeof window === 'undefined' || !window.performance) return null;
  
  try {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    return pageLoadTime > 0 ? pageLoadTime : null;
  } catch (e) {
    return null;
  }
}

/**
 * Handle page visibility changes
 */
function handleVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    // User is leaving the page, record time spent
    const timeSpent = Date.now() - pageStartTime;
    
    if (timeSpent > 0 && config.trackTimeOnPage) {
      trackEvent('page_exit', {
        timeSpent,
        maxScrollDepth,
        interactions: pageInteractions
      });
    }
    
    // Send any queued events immediately
    if (queue.length > 0) {
      sendBatch();
    }
  } else if (document.visibilityState === 'visible') {
    // User returned to the page, reset timer
    pageStartTime = Date.now();
  }
}

/**
 * Handle click events
 */
function handleClick(e) {
  clickCount++;
  pageInteractions++;
  
  // Get information about the clicked element
  const target = e.target;
  let elementType = target.tagName.toLowerCase();
  let elementId = target.id || null;
  let elementClass = target.className || null;
  
  if (typeof elementClass === 'string') {
    // Limit class names to avoid large payloads
    elementClass = elementClass.split(' ').slice(0, 3).join(' ');
  } else {
    elementClass = null;
  }
  
  // Check if it's a link or button
  if (elementType === 'a') {
    trackEvent('link_click', {
      href: target.href,
      text: target.innerText.substring(0, 50),
      id: elementId,
      class: elementClass
    });
  } else if (elementType === 'button' || target.type === 'button' || target.type === 'submit') {
    trackEvent('button_click', {
      text: target.innerText.substring(0, 50),
      id: elementId,
      class: elementClass
    });
  }
}

/**
 * Handle scroll events (throttled)
 */
let scrollTimeout = null;
function handleScroll() {
  if (scrollTimeout) return;
  
  scrollTimeout = setTimeout(() => {
    scrollTimeout = null;
    
    // Calculate scroll depth as percentage
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    
    const scrollPercentage = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
    
    // Update max scroll depth if needed
    if (scrollPercentage > maxScrollDepth) {
      maxScrollDepth = scrollPercentage;
      
      // Track significant scroll depth milestones
      if (maxScrollDepth === 25 || maxScrollDepth === 50 || maxScrollDepth === 75 || maxScrollDepth === 100) {
        trackEvent('scroll_depth', { depth: maxScrollDepth });
      }
    }
    
    pageInteractions++;
  }, 200); // Throttle to 5 times per second maximum
}

/**
 * Handle page unload
 */
function handleUnload() {
  // Record final stats for the page
  const timeSpent = Date.now() - pageStartTime;
  
  if (timeSpent > 0 && config.trackTimeOnPage) {
    trackEvent('page_exit', {
      timeSpent,
      maxScrollDepth,
      interactions: pageInteractions
    });
  }
  
  // Try to send any remaining data
  if (queue.length > 0) {
    // Use sendBeacon if available for more reliable data transmission during page unload
    if (navigator.sendBeacon) {
      const batch = {
        visitorId,
        sessionId,
        events: queue,
        timestamp: Date.now()
      };
      
      navigator.sendBeacon(config.endpoint, JSON.stringify(batch));
      queue = [];
    } else {
      // Fallback to synchronous XHR
      sendBatchSync();
    }
  }
  
  // Save any unsent data to storage
  persistQueue();
}

/**
 * Track a pageview
 */
export function trackPageview(url = null) {
  if (!isInitialized) return;
  
  const path = url || window.location.pathname;
  const referrer = document.referrer || null;
  const title = document.title || null;
  
  trackEvent('pageview', {
    path,
    referrer,
    title,
    loadTime: pageLoadTime
  });
  
  // Reset page-specific metrics
  currentPage = path;
  pageStartTime = Date.now();
  maxScrollDepth = 0;
  clickCount = 0;
  pageInteractions = 0;
}

/**
 * Track a custom event
 * @param {string} eventName - Name of the event
 * @param {Object} eventData - Additional data for the event
 */
export function trackEvent(eventName, eventData = {}) {
  if (!isInitialized) return;
  
  // Apply sampling if configured
  if (config.sampleRate < 1.0 && Math.random() > config.sampleRate) {
    return;
  }
  
  const event = {
    type: eventName,
    visitorId,
    sessionId,
    timestamp: Date.now(),
    page: currentPage,
    data: eventData,
    userAgent: navigator.userAgent
  };
  
  // Add to queue
  queue.push(event);
  
  // Send immediately if batch size reached
  if (queue.length >= config.batchSize) {
    sendBatch();
  }
}

/**
 * Start the batch timer
 */
function startBatchTimer() {
  if (batchTimer) clearInterval(batchTimer);
  
  batchTimer = setInterval(() => {
    if (queue.length > 0) {
      sendBatch();
    }
    
    // Also try to send any events in the retry queue
    if (retryQueue.length > 0) {
      retryFailedBatch();
    }
  }, config.batchInterval);
}

/**
 * Send batched events to the server
 */
function sendBatch() {
  if (queue.length === 0) return;
  
  const events = [...queue];
  queue = [];
  
  const batch = {
    visitorId,
    sessionId,
    events,
    timestamp: Date.now()
  };
  
  fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(batch),
    // Use keepalive to allow the request to complete even if the page is unloading
    keepalive: true
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Analytics API responded with status ${response.status}`);
    }
    return response.json();
  })
  .then(() => {
    if (config.debug) console.log(`Analytics: Successfully sent ${events.length} events`);
  })
  .catch(error => {
    if (config.debug) console.error('Analytics: Failed to send events', error);
    
    // Add to retry queue
    retryQueue.push({
      batch,
      attempt: 0,
      nextRetry: Date.now() + config.retryBackoff
    });
    
    // Persist the retry queue
    persistQueue();
  });
}

/**
 * Send batched events synchronously (for beforeunload)
 */
function sendBatchSync() {
  if (queue.length === 0) return;
  
  const events = [...queue];
  queue = [];
  
  const batch = {
    visitorId,
    sessionId,
    events,
    timestamp: Date.now()
  };
  
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', config.endpoint, false); // Synchronous request
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(batch));
  } catch (e) {
    if (config.debug) console.error('Analytics: Failed to send events synchronously', e);
    
    // Store in local storage for retry on next page load
    retryQueue.push({
      batch,
      attempt: 0,
      nextRetry: Date.now() + config.retryBackoff
    });
    
    persistQueue();
  }
}

/**
 * Retry sending failed batches with exponential backoff
 */
function retryFailedBatch() {
  if (retryQueue.length === 0) return;
  
  const now = Date.now();
  const itemToRetry = retryQueue.find(item => item.nextRetry <= now);
  
  if (!itemToRetry) return;
  
  // Remove from retry queue
  retryQueue = retryQueue.filter(item => item !== itemToRetry);
  
  // Check if we've exceeded retry attempts
  if (itemToRetry.attempt >= config.retryAttempts) {
    if (config.debug) console.log('Analytics: Exceeded retry attempts, discarding batch');
    return;
  }
  
  fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(itemToRetry.batch)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Analytics API responded with status ${response.status}`);
    }
    return response.json();
  })
  .then(() => {
    if (config.debug) console.log(`Analytics: Successfully sent retry batch`);
  })
  .catch(error => {
    if (config.debug) console.error('Analytics: Failed to send retry batch', error);
    
    // Calculate next retry time with exponential backoff
    const nextAttempt = itemToRetry.attempt + 1;
    const backoff = config.retryBackoff * Math.pow(2, nextAttempt);
    
    // Add back to retry queue with updated attempt count and next retry time
    retryQueue.push({
      batch: itemToRetry.batch,
      attempt: nextAttempt,
      nextRetry: Date.now() + backoff
    });
    
    // Persist the retry queue
    persistQueue();
  });
}

/**
 * Save queue to persistent storage
 */
function persistQueue() {
  try {
    storage.setItem(config.storageKey, JSON.stringify({
      queue,
      retryQueue
    }));
  } catch (e) {
    if (config.debug) console.error('Failed to persist analytics queue', e);
  }
}

/**
 * Return the public API
 */
function getPublicApi() {
  return {
    trackPageview,
    trackEvent,
    getVisitorId: () => visitorId,
    getSessionId: () => sessionId
  };
}

// Export a default instance
export default {
  init: initAnalytics,
  trackPageview,
  trackEvent
};

// Add these functions to your existing analytics.js file

/**
 * Generate a browser fingerprint
 * @returns {Promise<string>} - A hash representing the browser fingerprint
 */
async function generateFingerprint() {
  try {
    if (typeof window === 'undefined') return 'server';
    
    // Collect browser and device information
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      !!navigator.plugins.length,
      !!navigator.cookieEnabled,
      typeof window.localStorage !== 'undefined',
      typeof window.indexedDB !== 'undefined',
      typeof window.openDatabase !== 'undefined',
      navigator.platform,
      navigator.vendor || ''
    ];
    
    // Add canvas fingerprinting if available
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 200;
      canvas.height = 50;
      
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(10, 10, 100, 30);
      ctx.fillStyle = '#069';
      ctx.fillText('WTower Analytics', 2, 15);
      
      const dataUrl = canvas.toDataURL();
      components.push(dataUrl.slice(0, 100)); // Only use part of the data URL
    } catch (e) {
      components.push('canvas-not-supported');
    }
    
    // Create a string from all components
    const fingerprint = components.join('###');
    
    // Hash the fingerprint using SubtleCrypto if available
    if (window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(fingerprint);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Fallback to simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  } catch (error) {
    logError('Error generating fingerprint', error);
    return 'fingerprint-error-' + Date.now();
  }
}

/**
 * Compress data before sending to server
 * @param {Object} data - Data to compress
 * @returns {Promise<string>} - Compressed data as base64 string
 */
async function compressData(data) {
  try {
    if (typeof CompressionStream === 'undefined') {
      // Fallback if CompressionStream is not available
      return JSON.stringify(data);
    }
    
    const jsonString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(jsonString);
    
    const compressedStream = encodedData.pipeTo(new CompressionStream('gzip'));
    const reader = compressedStream.getReader();
    
    let result = new Uint8Array(0);
    let done, value;
    
    while (!done) {
      ({ done, value } = await reader.read());
      if (value) {
        const newResult = new Uint8Array(result.length + value.length);
        newResult.set(result);
        newResult.set(value, result.length);
        result = newResult;
      }
    }
    
    // Convert to base64
    return btoa(String.fromCharCode.apply(null, result));
  } catch (error) {
    logError('Error compressing data', error);
    // Fallback to uncompressed data
    return JSON.stringify(data);
  }
}

/**
 * Log errors with consistent format
 * @param {string} message - Error message
 * @param {Error} error - Error object
 */
function logError(message, error) {
  if (!config.debug) return;
  
  console.error(`[WTower Analytics] ${message}:`, error);
  
  // Track error for debugging (but don't create infinite loops)
  if (isInitialized && message !== 'Error sending analytics data') {
    trackEvent('error', {
      message,
      errorMessage: error.message,
      errorStack: error.stack ? error.stack.slice(0, 500) : null,
      timestamp: Date.now()
    });
  }
}

// Update the identifyVisitor function to use our fingerprinting
async function identifyVisitor() {
  try {
    // Try to get existing IDs from storage
    const storedData = storage.getItem(config.storageKey);
    let data = storedData ? JSON.parse(storedData) : {};
    
    // Check if we need to create a new session
    const now = Date.now();
    const needNewSession = !data.sessionId || 
      !data.lastActivity || 
      (now - data.lastActivity > config.sessionTimeout);
    
    // Update last activity
    data.lastActivity = now;
    
    // Generate visitor ID if needed
    if (!data.visitorId) {
      // Use fingerprinting if enabled
      if (config.fingerprinting) {
        data.visitorId = await generateFingerprint();
      } 
      
      // Fallback to random ID if fingerprinting fails or is disabled
      if (!data.visitorId) {
        data.visitorId = 'v_' + Math.random().toString(36).substring(2, 15) + 
          Math.random().toString(36).substring(2, 15);
      }
    }
    
    // Generate session ID if needed
    if (needNewSession) {
      data.sessionId = 's_' + Math.random().toString(36).substring(2, 15) + 
        Date.now().toString(36);
    }
    
    // Save to storage
    storage.setItem(config.storageKey, JSON.stringify(data));
    
    // Set global variables
    visitorId = data.visitorId;
    sessionId = data.sessionId;
    
  } catch (error) {
    logError('Error identifying visitor', error);
    
    // Fallback to random IDs
    visitorId = 'v_' + Math.random().toString(36).substring(2, 15);
    sessionId = 's_' + Date.now().toString(36);
  }
}

// Update the sendBatch function to use compression
async function sendBatch() {
  if (queue.length === 0) return;
  
  // Take events from the queue
  const events = [...queue];
  queue = [];
  
  try {
    // Prepare the payload
    const payload = {
      siteId: config.siteId,
      events: events
    };
    
    // Compress the data
    const compressedData = await compressData(payload);
    
    // Send the data
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Compressed': typeof CompressionStream !== 'undefined' ? 'true' : 'false'
      },
      body: compressedData,
      keepalive: true
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    // Clear retry queue for these events
    retryQueue = retryQueue.filter(item => 
      !events.some(event => event.id === item.event.id));
    
  } catch (error) {
    logError('Error sending analytics data', error);
    
    // Add to retry queue
    events.forEach(event => {
      const existingRetry = retryQueue.find(item => item.event.id === event.id);
      
      if (existingRetry) {
        existingRetry.attempts++;
      } else {
        retryQueue.push({
          event,
          attempts: 1,
          nextRetry: Date.now() + config.retryBackoff
        });
      }
    });
    
    // Schedule retry
    scheduleRetry();
    
    // Store in localStorage as backup
    try {
      const storedRetries = storage.getItem('wtower_analytics_retries');
      const retries = storedRetries ? JSON.parse(storedRetries) : [];
      
      // Add new retries, avoiding duplicates
      events.forEach(event => {
        if (!retries.some(e => e.id === event.id)) {
          retries.push(event);
        }
      });
      
      // Keep only the latest 100 events to avoid storage limits
      const trimmedRetries = retries.slice(-100);
      storage.setItem('wtower_analytics_retries', JSON.stringify(trimmedRetries));
    } catch (storageError) {
      logError('Error storing retries in localStorage', storageError);
    }
  }
}

// ... existing code ...