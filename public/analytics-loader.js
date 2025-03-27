// WTower Analytics Loader
(function() {
  // Configuration defaults
  const DEFAULT_CONFIG = {
    endpoint: '/api/analytics/collect',
    sampleRate: 1.0,
    batchSize: 2,
    batchInterval: 30000,
    retryAttempts: 5,
    retryBackoff: 2000,
    respectDoNotTrack: false,
    maskIpAddress: false,
    storageKey: 'wtower_analytics',
    sessionTimeout: 30 * 60 * 1000,
    fingerprinting: true,
    cookieFallback: true,
    trackClicks: true,
    trackScrollDepth: true,
    trackTimeOnPage: true,
    debug: false,
    siteId: 'default'
  };

  // State management
  let config = { ...DEFAULT_CONFIG };
  let queue = [];
  let visitorId = null;
  let sessionId = null;
  let pageLoadTime = null;
  let batchTimer = null;
  let isInitialized = false;
  let storage = null;
  let currentPage = null;
  let pageStartTime = null;

  // Initialize the analytics system
  function initAnalytics(userConfig = {}) {
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
    
    // Track initial pageview
    trackPageview();
    
    // Start batch timer
    startBatchTimer();
    
    isInitialized = true;
    if (config.debug) console.log('Analytics initialized with config:', config);
    if (config.debug) console.log('Visitor ID:', visitorId);
    if (config.debug) console.log('Session ID:', sessionId);
    
    return getPublicApi();
  }

  // Check if Do Not Track is enabled
  function isDoNotTrackEnabled() {
    return navigator.doNotTrack === '1' || 
           navigator.doNotTrack === 'yes' ||
           navigator.msDoNotTrack === '1' ||
           window.doNotTrack === '1';
  }

  // Initialize storage
  function initStorage() {
    try {
      storage = localStorage;
      if (config.debug) console.log('Using localStorage for analytics storage');
    } catch (e) {
      console.error('Failed to initialize storage for analytics', e);
    }
  }

  // Generate browser fingerprint
  function generateBrowserFingerprint() {
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

  // Generate a unique ID
  function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Identify visitor
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

  // Get page load performance data
  function getPageLoadTime() {
    if (!window.performance) return null;
    
    try {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      return pageLoadTime > 0 ? pageLoadTime : null;
    } catch (e) {
      return null;
    }
  }

  // Track a pageview
  function trackPageview(path) {
    if (!isInitialized) return;
    
    const pageData = {
      path: path || window.location.pathname,
      referrer: document.referrer || null,
      title: document.title,
      url: window.location.href,
      loadTime: pageLoadTime,
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      timestamp: new Date().toISOString()
    };
    
    queueEvent('pageview', pageData);
    if (config.debug) console.log('Pageview tracked:', pageData);
  }

  // Track a custom event
  function trackEvent(eventName, eventData = {}) {
    if (!isInitialized) return;
    
    const data = {
      ...eventData,
      timestamp: eventData.timestamp || new Date().toISOString(),
      path: eventData.path || window.location.pathname
    };
    
    queueEvent(eventName, data);
    if (config.debug) console.log(`Event "${eventName}" tracked:`, data);
  }

  // Queue an event for sending
  function queueEvent(type, data) {
    const event = {
      type,
      visitorId,
      sessionId,
      timestamp: new Date().toISOString(),
      data
    };
    
    queue.push(event);
    
    // Send immediately if we've reached the batch size
    if (queue.length >= config.batchSize) {
      sendEvents();
    }
  }

  // Start the batch timer
  function startBatchTimer() {
    if (batchTimer) clearInterval(batchTimer);
    
    batchTimer = setInterval(() => {
      if (queue.length > 0) {
        sendEvents();
      }
    }, config.batchInterval);
  }

  // Send events to the server
  function sendEvents() {
    if (queue.length === 0) return;
    
    const events = [...queue];
    queue = [];
    
    const payload = {
      siteId: config.siteId,
      events
    };
    
    fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      // Use keepalive to ensure the request completes even if the page is unloaded
      keepalive: true
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (config.debug) console.log('Analytics events sent successfully:', data);
    })
    .catch(error => {
      if (config.debug) console.error('Failed to send analytics events:', error);
      // Put the events back in the queue for retry
      queue = [...events, ...queue];
    });
  }

  // Public API
  function getPublicApi() {
    return {
      trackPageview,
      trackEvent,
      getVisitorId: () => visitorId,
      getSessionId: () => sessionId
    };
  }

  // Expose the API globally
  window.initAnalytics = initAnalytics;
  window.trackPageview = trackPageview;
  window.trackEvent = trackEvent;
})();