import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/connection';
import { AnalyticsEvent, Visitor, Session } from '@/lib/db/models';
import { rateLimit } from '@/lib/utils/rateLimit';

// Rate limiter configuration
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 unique IPs per interval
});

export async function POST(request) {
  try {
    // Apply rate limiting based on IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    try {
      await limiter.check(ip, 100); // 100 requests per minute per IP
    } catch (error) {
      return NextResponse.json(
        { error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
        { status: 429 }
      );
    }
    
    await connectToDatabase();
    
    // Check if data is compressed
    const isCompressed = request.headers.get('x-compressed') === 'true';
    
    // Get the request body
    let body;
    
    if (isCompressed) {
      // Decompress the data
      const compressedData = await request.text();
      const binaryData = Uint8Array.from(atob(compressedData), c => c.charCodeAt(0));
      
      // Use DecompressionStream if available
      if (typeof DecompressionStream !== 'undefined') {
        const decompressedStream = new ReadableStream({
          start(controller) {
            controller.enqueue(binaryData);
            controller.close();
          }
        }).pipeThrough(new DecompressionStream('gzip'));
        
        const reader = decompressedStream.getReader();
        let result = '';
        let done, value;
        
        while (!done) {
          ({ done, value } = await reader.read());
          if (value) {
            result += new TextDecoder().decode(value);
          }
        }
        
        body = JSON.parse(result);
      } else {
        // Fallback if DecompressionStream is not available
        body = JSON.parse(new TextDecoder().decode(binaryData));
      }
    } else {
      // Regular JSON parsing
      body = await request.json();
    }
    
    // Validate the request data
    const { siteId, events } = body;
    
    if (!siteId) {
      return NextResponse.json(
        { error: 'Site ID is required', code: 'MISSING_SITE_ID' },
        { status: 400 }
      );
    }
    
    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Events array is required and must not be empty', code: 'INVALID_EVENTS' },
        { status: 400 }
      );
    }
    
    // Validate each event
    for (const event of events) {
      if (!event.visitorId || !event.sessionId || !event.type || !event.timestamp || !event.data) {
        return NextResponse.json(
          { 
            error: 'Each event must include visitorId, sessionId, type, timestamp, and data',
            code: 'INVALID_EVENT_FORMAT'
          },
          { status: 400 }
        );
      }
      
      // Sanitize data to prevent injection attacks
      event.data = sanitizeData(event.data);
    }
    
    // Process each event in the batch
    const processedEvents = [];
    
    for (const event of events) {
      const { visitorId, sessionId, type, timestamp, data } = event;
      
      // Find or create visitor
      let visitor = await Visitor.findOne({ visitorId, siteId });
      
      if (!visitor) {
        visitor = await Visitor.create({
          visitorId,
          siteId,
          firstSeen: new Date(timestamp),
          lastSeen: new Date(timestamp),
          fingerprint: data.fingerprint,
          userAgent: data.userAgent,
          // Store masked IP if configured
          ipAddress: maskIpAddress(data.ipAddress || ip)
        });
      } else {
        // Update last seen time
        visitor.lastSeen = new Date(timestamp);
        await visitor.save();
      }
      
      // Find or create session
      let session = await Session.findOne({ sessionId, visitorId, siteId });
      
      if (!session) {
        session = await Session.create({
          sessionId,
          visitorId,
          siteId,
          startedAt: new Date(timestamp),
          lastActivity: new Date(timestamp),
          referrer: data.referrer,
          entryPage: data.path
        });
      } else {
        // Update session data
        session.lastActivity = new Date(timestamp);
        await session.save();
      }
      
      // Store the event
      const analyticsEvent = await AnalyticsEvent.create({
        siteId,
        visitorId,
        sessionId,
        type,
        timestamp: new Date(timestamp),
        path: data.path,
        data: data
      });
      
      processedEvents.push(analyticsEvent._id);
    }
    
    return NextResponse.json({
      success: true,
      processed: processedEvents.length
    });
  } catch (error) {
    console.error('Error processing analytics events:', error);
    
    // Determine the appropriate error code
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let statusCode = 500;
    
    if (error.name === 'ValidationError') {
      errorCode = 'VALIDATION_ERROR';
      statusCode = 400;
    } else if (error.name === 'MongoError' && error.code === 11000) {
      errorCode = 'DUPLICATE_KEY_ERROR';
      statusCode = 409;
    } else if (error.message.includes('JSON')) {
      errorCode = 'INVALID_JSON';
      statusCode = 400;
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to process analytics events', 
        code: errorCode,
        message: error.message
      },
      { status: statusCode }
    );
  }
}

/**
 * Sanitize data to prevent injection attacks
 * @param {Object} data - Data to sanitize
 * @returns {Object} - Sanitized data
 */
function sanitizeData(data) {
  // Create a new object to avoid modifying the original
  const sanitized = {};
  
  // Process each property
  for (const [key, value] of Object.entries(data)) {
    // Skip null or undefined values
    if (value == null) continue;
    
    if (typeof value === 'object' && !Array.isArray(value)) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeData(value);
    } else if (Array.isArray(value)) {
      // Sanitize arrays
      sanitized[key] = value.map(item => 
        typeof item === 'object' ? sanitizeData(item) : String(item).slice(0, 1000)
      ).slice(0, 100); // Limit array size
    } else if (typeof value === 'string') {
      // Sanitize strings and limit length
      sanitized[key] = value.slice(0, 1000);
    } else {
      // For other types (numbers, booleans), convert to string
      sanitized[key] = String(value).slice(0, 1000);
    }
  }
  
  return sanitized;
}

/**
 * Mask IP address for privacy
 * @param {string} ip - IP address to mask
 * @returns {string} - Masked IP address
 */
function maskIpAddress(ip) {
  if (!ip || ip === 'unknown') return 'unknown';
  
  // For IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.0.0`;
  }
  
  // For IPv6
  if (ip.includes(':')) {
    // Handle localhost IPv6 address (::1)
    if (ip === '::1') return '::1';
    
    // Handle regular IPv6 addresses
    const parts = ip.split(':').filter(part => part !== '');
    if (parts.length >= 4) {
      return `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}:0:0:0:0`;
    }
    return ip; // Return original if we can't parse it properly
  }
  
  return ip;
}