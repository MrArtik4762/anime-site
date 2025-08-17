/**
 * server/routes/proxy.js
 *
 * Endpoint: GET /api/proxy?url=<external_url>
 * - Проксирует m3u8/.ts и другие файлы через сервер
 * - Форвардит Range и User-Agent (важно для HLS)
 * - Добавляет CORS заголовки, и при возможности проксирует заголовки контента upstream
 * - Улучшенная безопасность с whitelist и обработкой ошибок
 */

import express from 'express';
import axios from 'axios';
import { URL } from 'url';

const router = express.Router();

// Enhanced whitelist from env (comma-separated)
const WHITELIST = (process.env.PROXY_WHITELIST || '').split(',').map(s => s.trim()).filter(Boolean);

// Additional security checks
const ALLOWED_PROTOCOLS = ['http:', 'https:'];
const ALLOWED_CONTENT_TYPES = [
  'application/vnd.apple.mpegurl', // HLS m3u8
  'application/x-mpegURL',        // Alternative HLS m3u8
  'video/mp2t',                   // HLS .ts segments
  'video/mp4',                    // MP4 video
  'video/webm',                   // WebM video
  'audio/mp4',                    // MP4 audio
  'audio/webm',                   // WebM audio
  'text/plain',                   // Plain text files
  'text/vtt',                     // WebVTT subtitles
  'application/octet-stream'      // Binary/octet-stream
];

function isAllowedTarget(targetUrl) {
  try {
    const u = new URL(targetUrl);
    
    // Check protocol
    if (!ALLOWED_PROTOCOLS.includes(u.protocol)) {
      console.warn(`Blocked request: Protocol ${u.protocol} not allowed for ${targetUrl}`);
      return false;
    }
    
    // Check if hostname is IP address (block for security)
    if (/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname) || /^\[([0-9a-fA-F:]+)\]$/.test(u.hostname)) {
      console.warn(`Blocked request: IP address not allowed for ${targetUrl}`);
      return false;
    }
    
    // Check whitelist if configured
    if (WHITELIST.length > 0) {
      const isWhitelisted = WHITELIST.some(domain => {
        // Exact match or subdomain match
        return u.hostname === domain || u.hostname.endsWith('.' + domain);
      });
      
      if (!isWhitelisted) {
        console.warn(`Blocked request: Domain ${u.hostname} not in whitelist`);
        return false;
      }
    }
    
    return true;
  } catch (e) {
    console.error('URL validation error:', e.message);
    return false;
  }
}

router.get('/proxy', async (req, res) => {
  const target = req.query.url;
  if (!target) {
    return res.status(400).json({
      error: 'Missing url parameter',
      message: 'The url parameter is required'
    });
  }

  if (!isAllowedTarget(target)) {
    return res.status(403).json({
      error: 'Forbidden target',
      message: 'The requested target is not allowed by proxy configuration'
    });
  }

  // Build headers to upstream: forward Range + basic headers
  const forwardHeaders = {
    'User-Agent': req.get('User-Agent') || 'anime-site-proxy/1.0',
    Accept: '*/*',
    Referer: req.get('Referer') || '',
    'Accept-Encoding': 'gzip, deflate, br',
  };
  
  // Forward Range header if present (important for HLS streaming)
  const rangeHeader = req.get('Range');
  if (rangeHeader) {
    forwardHeaders['Range'] = rangeHeader;
  }

  // Request upstream as stream with enhanced error handling
  let upstreamResponse;
  try {
    const timeoutMs = parseInt(process.env.PROXY_TIMEOUT_MS || '30000', 10);
    
    upstreamResponse = await axios.get(target, {
      headers: forwardHeaders,
      responseType: 'stream',
      validateStatus: (s) => s < 500,
      timeout: timeoutMs,
      maxRedirects: 5,
      decompress: true,
      // Add response type validation for security
      responseType: 'stream'
    });

    // Validate content type
    const contentType = upstreamResponse.headers['content-type']?.split(';')[0] || '';
    if (!ALLOWED_CONTENT_TYPES.includes(contentType) &&
        !contentType.startsWith('video/') &&
        !contentType.startsWith('audio/') &&
        !contentType.startsWith('text/')) {
      console.warn(`Blocked request: Content type ${contentType} not allowed for ${target}`);
      return res.status(403).json({
        error: 'Forbidden content type',
        message: 'The requested content type is not allowed'
      });
    }

    // Set enhanced CORS headers so browser can fetch .m3u8/.ts via this endpoint
    const corsOrigin = process.env.CORS_ALLOW_ORIGIN || '*';
    res.set({
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type, Authorization, X-Requested-With',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges, ETag, Last-Modified, Cache-Control',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    // Copy relevant upstream headers with security considerations
    const copyHeaders = [
      'content-type', 'content-length', 'content-range',
      'accept-ranges', 'etag', 'last-modified',
      'cache-control', 'content-disposition'
    ];
    
    copyHeaders.forEach(h => {
      const headerKey = h.toLowerCase();
      const v = upstreamResponse.headers[headerKey];
      if (v) {
        // Sanitize headers to prevent header injection
        const sanitizedValue = String(v).replace(/[\r\n]/g, '');
        res.setHeader(h, sanitizedValue);
      }
    });

    // Handle upstream status codes appropriately
    const upstreamStatus = upstreamResponse.status;
    if (upstreamStatus >= 400 && upstreamStatus < 500) {
      res.status(upstreamStatus);
    } else if (upstreamStatus >= 500) {
      console.error(`Upstream server error: ${upstreamStatus} for ${target}`);
      res.status(502).json({
        error: 'Bad Gateway',
        message: 'Upstream server returned an error'
      });
      return;
    }

    // Enhanced stream handling with error recovery
    const upstreamStream = upstreamResponse.data;
    
    // Handle stream errors
    upstreamStream.on('error', (err) => {
      console.error('Upstream stream error:', err.message || err);
      try {
        if (!res.headersSent) {
          res.status(502).json({
            error: 'Stream Error',
            message: 'Error occurred while streaming data'
          });
        } else {
          res.end();
        }
      } catch (e) {
        console.error('Error handling stream error:', e.message);
      }
    });

    // Handle response end
    upstreamStream.on('end', () => {
      if (!res.headersSent) {
        res.end();
      }
    });

    // Handle response close
    upstreamStream.on('close', () => {
      if (!res.headersSent) {
        res.end();
      }
    });

    // Pipe stream with error handling
    upstreamStream.pipe(res);
    
  } catch (err) {
    console.error('Proxy fetch error:', err.message || err);
    
    // Handle different types of errors
    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: 'Gateway Timeout',
        message: 'Request to upstream server timed out'
      });
    } else if (err.code === 'ENOTFOUND') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Upstream server could not be found'
      });
    } else if (err.response) {
      // Axios response error
      const upstreamStatus = err.response.status;
      const upstreamMessage = err.response.statusText || 'Upstream error';
      
      // Log the full error for debugging
      console.error(`Upstream responded with status ${upstreamStatus}:`, err.response.data);
      
      return res.status(upstreamStatus).json({
        error: upstreamMessage,
        status: upstreamStatus,
        message: 'Upstream server returned an error response'
      });
    } else {
      // Network or other errors
      return res.status(502).json({
        error: 'Bad Gateway',
        message: 'Failed to connect to upstream server'
      });
    }
  }
});

// Handle OPTIONS requests for CORS preflight
router.options('/proxy', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': process.env.CORS_ALLOW_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Range, Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400' // 24 hours
  });
  res.status(204).end();
});

export default router;