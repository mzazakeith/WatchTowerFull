/**
 * Simple rate limiting utility
 * Adapted from Next.js examples
 */

export function rateLimit({ interval, uniqueTokenPerInterval }) {
  const tokenCache = new Map();
  
  return {
    /**
     * Check if the token has exceeded the rate limit
     * @param {string} token - Unique identifier (e.g., IP address)
     * @param {number} limit - Maximum number of requests allowed in the interval
     */
    check: (token, limit) => {
      const now = Date.now();
      const windowStart = now - interval;
      
      // Clear old entries
      const tokenTimestamps = tokenCache.get(token) || [];
      const validTimestamps = tokenTimestamps.filter(timestamp => timestamp > windowStart);
      
      // Check if limit is exceeded
      if (validTimestamps.length >= limit) {
        return Promise.reject(new Error('Rate limit exceeded'));
      }
      
      // Add current timestamp
      validTimestamps.push(now);
      tokenCache.set(token, validTimestamps);
      
      // Cleanup: remove old tokens
      if (tokenCache.size > uniqueTokenPerInterval) {
        const oldestToken = [...tokenCache.entries()]
          .sort((a, b) => a[1][0] - b[1][0])[0][0];
        tokenCache.delete(oldestToken);
      }
      
      return Promise.resolve();
    }
  };
}