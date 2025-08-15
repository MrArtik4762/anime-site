const logger = require('../config/logger');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../../shared/constants/constants');

/**
 * Middleware для логирования запросов стриминга
 */
const streamLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const { url } = req.query;
  const clientIp = req.ip;
  const userAgent = req.get('User-Agent') || 'unknown';
  const rangeHeader = req.get('Range') || 'none';
  const referer = req.get('Referer') || 'none';
  
  // Логируем начало запроса
  logger.info('Stream request started', {
    method: req.method,
    url: url,
    clientIp: clientIp,
    userAgent: userAgent,
    rangeHeader: rangeHeader,
    referer: referer,
    timestamp: new Date().toISOString()
  });

  // Перехватываем событие завершения ответа
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const contentLength = res.get('Content-Length') || 'unknown';
    
    // Логируем результат запроса
    logger.info('Stream request completed', {
      method: req.method,
      url: url,
      clientIp: clientIp,
      userAgent: userAgent,
      statusCode: statusCode,
      contentLength: contentLength,
      duration: duration,
      rangeHeader: rangeHeader,
      referer: referer,
      timestamp: new Date().toISOString(),
      success: statusCode < 400
    });
  });

  // Перехватываем ошибки
  res.on('error', (error) => {
    const duration = Date.now() - startTime;
    
    logger.error('Stream request failed', {
      method: req.method,
      url: url,
      clientIp: clientIp,
      userAgent: userAgent,
      error: error.message,
      stack: error.stack,
      duration: duration,
      rangeHeader: rangeHeader,
      referer: referer,
      timestamp: new Date().toISOString()
    });
  });

  next();
};

/**
 * Middleware для сбора метрик стриминга
 */
const streamMetricsMiddleware = (req, res, next) => {
  const { url } = req.query;
  const clientIp = req.ip;
  
  // Инициализируем счетчики для этого запроса
  req.streamMetrics = {
    startTime: Date.now(),
    bytesTransferred: 0,
    chunksCount: 0,
    error: null
  };

  // Слушаем событие данных для подсчета переданных байт
  const originalWrite = res.write;
  const originalEnd = res.end;
  
  let bytesWritten = 0;
  
  res.write = function(chunk) {
    if (chunk) {
      bytesWritten += chunk.length;
    }
    return originalWrite.apply(this, arguments);
  };
  
  res.end = function(chunk) {
    if (chunk) {
      bytesWritten += chunk.length;
    }
    
    // Обновляем метрики
    if (req.streamMetrics) {
      req.streamMetrics.bytesTransferred = bytesWritten;
    }
    
    return originalEnd.apply(this, arguments);
  };

  // Перехватываем ошибки
  res.on('error', (error) => {
    if (req.streamMetrics) {
      req.streamMetrics.error = error.message;
    }
  });

  // Логируем метрики при завершении
  res.on('finish', () => {
    if (req.streamMetrics) {
      const duration = Date.now() - req.streamMetrics.startTime;
      
      logger.info('Stream metrics', {
        url: url,
        clientIp: clientIp,
        duration: duration,
        bytesTransferred: req.streamMetrics.bytesTransferred,
        chunksCount: req.streamMetrics.chunksCount,
        success: !req.streamMetrics.error,
        error: req.streamMetrics.error,
        timestamp: new Date().toISOString()
      });

      // Здесь можно отправлять метрики в систему мониторинга
      // Например, в Prometheus, StatsD или другую систему
    }
  });

  next();
};

/**
 * Middleware для детального логирования больших запросов
 */
const detailedLoggingMiddleware = (req, res, next) => {
  const { url } = req.query;
  const clientIp = req.ip;
  
  // Логируем только большие запросы (> 10MB) или запросы с ошибками
  const logLargeRequests = process.env.LOG_LARGE_STREAM_REQUESTS === 'true';
  
  if (!logLargeRequests) {
    return next();
  }

  let bytesTransferred = 0;
  const threshold = 10 * 1024 * 1024; // 10MB
  
  const originalWrite = res.write;
  const originalEnd = res.end;
  
  res.write = function(chunk) {
    if (chunk) {
      bytesTransferred += chunk.length;
      
      // Проверяем превысили ли порог
      if (bytesTransferred >= threshold && !req._loggedLargeRequest) {
        req._loggedLargeRequest = true;
        
        logger.warn('Large stream request detected', {
          url: url,
          clientIp: clientIp,
          userAgent: req.get('User-Agent'),
          bytesTransferred: bytesTransferred,
          threshold: threshold,
          timestamp: new Date().toISOString()
        });
      }
    }
    return originalWrite.apply(this, arguments);
  };
  
  res.end = function(chunk) {
    if (chunk) {
      bytesTransferred += chunk.length;
    }
    
    // Логируем итоговый размер если запрос был большим
    if (bytesTransferred >= threshold) {
      logger.info('Large stream request completed', {
        url: url,
        clientIp: clientIp,
        userAgent: req.get('User-Agent'),
        totalBytes: bytesTransferred,
        duration: Date.now() - (req.startTime || Date.now()),
        timestamp: new Date().toISOString()
      });
    }
    
    return originalEnd.apply(this, arguments);
  };

  next();
};

/**
 * Middleware для анализа паттернов запросов
 */
const patternAnalysisMiddleware = (req, res, next) => {
  const { url } = req.query;
  const clientIp = req.ip;
  const userAgent = req.get('User-Agent') || 'unknown';
  
  // Анализируем паттерны URL
  const urlPattern = analyzeUrlPattern(url);
  
  // Анализируем User-Agent
  const userAgentPattern = analyzeUserAgentPattern(userAgent);
  
  // Логируем подозрительные паттерны
  if (urlPattern.suspicious || userAgentPattern.suspicious) {
    logger.warn('Suspicious stream request pattern', {
      url: url,
      urlPattern: urlPattern,
      userAgent: userAgent,
      userAgentPattern: userAgentPattern,
      clientIp: clientIp,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

/**
 * Анализирует паттерны URL
 */
function analyzeUrlPattern(url) {
  const patterns = {
    hasQueryParams: /\?.+/,
    hasFragments: /#.+/,
    hasMultipleExtensions: /\.[a-zA-Z0-9]+\.([a-zA-Z0-9]+)/,
    hasSuspiciousChars: /[>'"`]/,
    isLong: url.length > 2048,
    hasEncodedChars: /%[0-9A-Fa-f]{2}/,
    hasIpAddress: /\d+\.\d+\.\d+\.\d+/,
    hasPort: /:\d+$/,
    suspicious: false
  };
  
  // Определяем подозрительные паттерны
  patterns.suspicious = 
    patterns.hasSuspiciousChars ||
    patterns.isLong ||
    (patterns.hasIpAddress && !patterns.hasQueryParams) ||
    (patterns.hasPort && parseInt(url.split(':')[2]) > 80 && parseInt(url.split(':')[2]) < 443);
  
  return patterns;
}

/**
 * Анализирует паттерны User-Agent
 */
function analyzeUserAgentPattern(userAgent) {
  const patterns = {
    isBot: /bot|crawler|spider|scraper|curl|wget|python/i,
    isMobile: /mobile|android|iphone/i,
    isDesktop: /windows|macintosh|linux/i,
    isBrowser: /(chrome|firefox|safari|edge|opera)/i,
    suspicious: false
  };
  
  // Определяем подозрительные паттерны
  patterns.suspicious = 
    patterns.isBot && !patterns.isBrowser;
  
  return patterns;
}

/**
 * Middleware для выборочной выборки запросов для анализа
 */
const samplingMiddleware = (req, res, next) => {
  const { url } = req.query;
  const clientIp = req.ip;
  
  // Конфигурация выборки
  const samplingRate = parseFloat(process.env.STREAM_SAMPLING_RATE || '0.01'); // 1% по умолчанию
  const shouldSample = Math.random() < samplingRate;
  
  if (shouldSample) {
    req._shouldSample = true;
    
    logger.info('Stream request sampled for analysis', {
      url: url,
      clientIp: clientIp,
      userAgent: req.get('User-Agent'),
      samplingRate: samplingRate,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

module.exports = {
  streamLoggingMiddleware,
  streamMetricsMiddleware,
  detailedLoggingMiddleware,
  patternAnalysisMiddleware,
  samplingMiddleware
};