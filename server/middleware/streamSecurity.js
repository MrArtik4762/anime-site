const { URL } = require('url');
const logger = require('../config/logger');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../../shared/constants/constants');

/**
 * Enhanced whitelist from environment variables (comma-separated)
 * Can be configured via STREAM_WHITELIST env var
 */
const STREAM_WHITELIST = (process.env.STREAM_WHITELIST || '').split(',').map(s => s.trim()).filter(Boolean);

/**
 * Additional security checks for streaming
 */
const ALLOWED_PROTOCOLS = ['http:', 'https:'];
const BLOCKED_IP_RANGES = [
  // Private IP ranges
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^127\./,
  // localhost
  /^localhost$/,
  /^127\.0\.0\.1$/,
  // Loopback
  /^::1$/,
  /^fe80::/
];

/**
 * Middleware для проверки безопасности стриминга
 */
const streamSecurityMiddleware = (req, res, next) => {
  try {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.BAD_REQUEST,
          details: 'URL parameter is required'
        }
      });
    }

    // Проверяем URL на безопасность
    if (!isAllowedTarget(targetUrl)) {
      logger.warn('Blocked streaming request', { 
        url: targetUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.FORBIDDEN,
          details: 'The requested streaming target is not allowed by security policy'
        }
      });
    }

    // Проверяем на подозрительные паттерны в URL
    if (hasSuspiciousPatterns(targetUrl)) {
      logger.warn('Suspicious streaming request', { 
        url: targetUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.FORBIDDEN,
          details: 'The requested URL contains suspicious patterns'
        }
      });
    }

    // Проверяем Referrer header если есть
    const referrer = req.get('Referer');
    if (referrer && !isValidReferrer(referrer, targetUrl)) {
      logger.warn('Invalid referrer for streaming', { 
        url: targetUrl,
        referrer: referrer,
        ip: req.ip
      });
      
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.FORBIDDEN,
          details: 'Invalid referrer for streaming request'
        }
      });
    }

    next();
    
  } catch (error) {
    logger.error('Stream security middleware error', { 
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      url: req.query.url
    });
    
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.SERVER_ERROR,
        details: 'Security validation error'
      }
    });
  }
};

/**
 * Проверяет, является ли целевой URL разрешенным
 */
function isAllowedTarget(targetUrl) {
  try {
    const u = new URL(targetUrl);
    
    // Check protocol
    if (!ALLOWED_PROTOCOLS.includes(u.protocol)) {
      logger.warn(`Blocked request: Protocol ${u.protocol} not allowed for ${targetUrl}`);
      return false;
    }
    
    // Check if hostname is IP address (block for security)
    if (isIpAddress(u.hostname)) {
      logger.warn(`Blocked request: IP address not allowed for ${targetUrl}`);
      return false;
    }
    
    // Check if hostname is in blocked IP ranges
    for (const blockedRange of BLOCKED_IP_RANGES) {
      if (blockedRange.test(u.hostname)) {
        logger.warn(`Blocked request: Hostname ${u.hostname} is in blocked range for ${targetUrl}`);
        return false;
      }
    }
    
    // Check whitelist if configured
    if (STREAM_WHITELIST.length > 0) {
      const isWhitelisted = STREAM_WHITELIST.some(domain => {
        // Exact match or subdomain match
        return u.hostname === domain || u.hostname.endsWith('.' + domain);
      });
      
      if (!isWhitelisted) {
        logger.warn(`Blocked request: Domain ${u.hostname} not in streaming whitelist`);
        return false;
      }
    }
    
    // Additional security checks for known malicious patterns
    if (hasMaliciousPatterns(targetUrl)) {
      logger.warn(`Blocked request: Malicious patterns detected in ${targetUrl}`);
      return false;
    }
    
    return true;
  } catch (e) {
    logger.error('URL validation error:', e.message);
    return false;
  }
}

/**
 * Проверяет, является ли строка IP адресом
 */
function isIpAddress(hostname) {
  const ipv4Regex = /^\d+\.\d+\.\d+\.\d+$/;
  const ipv6Regex = /^\[([0-9a-fA-F:]+)\]$/;
  
  return ipv4Regex.test(hostname) || ipv6Regex.test(hostname);
}

/**
 * Проверяет наличие подозрительных паттернов в URL
 */
function hasSuspiciousPatterns(url) {
  const suspiciousPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /about:/i,
    /file:/i,
    /ftp:/i,
    /blob:/i,
    /chrome-extension:/i,
    /moz-extension:/i,
    /file:\/\//i,
    /\/\.\.\//i,  // Directory traversal
    /\/\.\//i,   // Hidden files
    /%2e%2e/i,   // Encoded directory traversal
    /%2e/i,      // Encoded hidden files
    /<script/i,  // XSS attempts
    /iframe/i,
    /<object/i,
    /<embed/i,
    /on\w+\s*=/i  // Event handlers
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(url));
}

/**
 * Проверяет наличие вредоносных паттернов
 */
function hasMaliciousPatterns(url) {
  const maliciousPatterns = [
    /eval\(/i,
    /expression\(/i,
    /javascript:/i,
    /vbscript:/i,
    /data:text\/html/i,
    /data:application\/x-javascript/i,
    /data:application\/javascript/i,
    /data:text\/javascript/i,
    /mhtml:/i,
    /res:/i,
    /about:/i,
    /chrome:/i,
    /opera:/i,
    /applewebkit\/\d+/i
  ];
  
  return maliciousPatterns.some(pattern => pattern.test(url));
}

/**
 * Проверяет валидность Referrer заголовка
 */
function isValidReferrer(referrer, targetUrl) {
  try {
    // Если реферера нет, разрешаем
    if (!referrer) return true;
    
    const referrerUrl = new URL(referrer);
    const targetUrlObj = new URL(targetUrl);
    
    // Проверяем, что реферер использует безопасный протокол
    if (!ALLOWED_PROTOCOLS.includes(referrerUrl.protocol)) {
      return false;
    }
    
    // Проверяем, что домены совпадают или реферер из whitelist
    if (referrerUrl.hostname !== targetUrlObj.hostname) {
      // Проверяем whitelist для рефереров
      const referrerWhitelist = (process.env.REFERRER_WHITELIST || '').split(',').map(s => s.trim()).filter(Boolean);
      
      if (referrerWhitelist.length > 0) {
        const isWhitelisted = referrerWhitelist.some(domain => {
          return referrerUrl.hostname === domain || referrerUrl.hostname.endsWith('.' + domain);
        });
        
        if (!isWhitelisted) {
          return false;
        }
      } else {
        return false;
      }
    }
    
    return true;
  } catch (e) {
    logger.error('Referrer validation error:', e.message);
    return false;
  }
}

/**
 * Middleware для проверки частоты запросов к одному и тому же URL
 */
const rateLimitByUrl = (req, res, next) => {
  try {
    const targetUrl = req.query.url;
    const clientIp = req.ip;
    
    // Здесь можно добавить логику для отслеживания частоты запросов
    // Например, использовать Redis для подсчета запросов с одного IP к одному URL
    
    // Временная заглушка - можно расширить с использованием Redis
    const requestKey = `stream_rate_limit:${clientIp}:${Buffer.from(targetUrl).toString('base64')}`;
    
    // TODO: Реализовать подсчет запросов через Redis
    // const requestCount = await redis.incr(requestKey);
    // if (requestCount === 1) {
    //   await redis.expire(requestKey, 60); // 1 минута
    // }
    
    // Если запросов слишком много, блокируем
    // if (requestCount > 10) { // 10 запросов в минуту
    //   return res.status(HTTPStatus.TOO_MANY_REQUESTS).json({
    //     success: false,
    //     error: {
    //       message: 'Too many streaming requests to the same URL',
    //       code: 'STREAM_RATE_LIMIT_EXCEEDED'
    //     }
    //   });
    // }
    
    next();
    
  } catch (error) {
    logger.error('Stream rate limit error:', error);
    next(); // Пропускаем ошибку, чтобы не блокировать легитимные запросы
  }
};

/**
 * Middleware для проверки User-Agent
 */
const validateUserAgent = (req, res, next) => {
  try {
    const userAgent = req.get('User-Agent');
    
    if (!userAgent) {
      logger.warn('Streaming request without User-Agent', { ip: req.ip });
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.BAD_REQUEST,
          details: 'User-Agent header is required'
        }
      });
    }
    
    // Проверяем на подозрительные User-Agent
    const suspiciousUserAgents = [
      /curl\/\d+\.\d+/i,
      /wget\/\d+\.\d+/i,
      /python-requests\/\d+\.\d+/i,
      /java\/\d+\.\d+/i,
      /postmanruntime/i,
      /insomnia/i,
      /axios\/\d+\.\d+/i
    ];
    
    for (const pattern of suspiciousUserAgents) {
      if (pattern.test(userAgent)) {
        logger.warn('Suspicious User-Agent detected', { 
          userAgent, 
          ip: req.ip,
          url: req.query.url 
        });
        
        // Можно либо блокировать, либо просто логировать
        // return res.status(HTTP_STATUS.FORBIDDEN).json({
        //   success: false,
        //   error: {
        //     message: ERROR_MESSAGES.FORBIDDEN,
        //     details: 'Suspicious User-Agent detected'
        //   }
        // });
        break;
      }
    }
    
    next();
    
  } catch (error) {
    logger.error('User-Agent validation error:', error);
    next();
  }
};

module.exports = {
  streamSecurityMiddleware,
  rateLimitByUrl,
  validateUserAgent
};