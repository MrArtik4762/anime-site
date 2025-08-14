const { logger, requestLoggerMiddleware } = require('../utils/logger');
const { recordDbOperation } = require('../utils/metrics');
const { v4: uuidv4 } = require('uuid');

// Middleware для генерации ID запроса и добавления контекста
const requestIdMiddleware = (req, res, next) => {
  req.id = uuidv4();
  res.set('X-Request-ID', req.id);
  next();
};

// Middleware для логирования запросов
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Добавляем контекст к логгеру
  const requestLogger = logger.child({ requestId: req.id });
  
  // Логируем начало запроса
  requestLogger.info('Request started', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id
  });

  // Перехватываем событие завершения ответа
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Логируем завершение запроса
    requestLogger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      contentLength: res.get('content-length'),
      responseTime: `${duration}ms`
    });
    
    // Записываем метрики
    if (res.statusCode >= 500) {
      recordDbOperation('http_request', 'api', 'error');
    } else {
      recordDbOperation('http_request', 'api', 'success');
    }
  });

  // Перехватываем ошибку
  res.on('error', (error) => {
    const duration = Date.now() - start;
    
    requestLogger.error('Request failed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      error: error.message,
      stack: error.stack
    });
  });

  next();
};

// Middleware для логирования SQL запросов (для Knex)
const sqlLogger = (knex) => {
  return knex.client.logger = {
    enableColors: false,
    debug: (msg) => {
      logger.debug('SQL Query', { query: msg });
    },
    deprecate: (msg, args) => {
      logger.warn('SQL Deprecation', { message: msg, args });
    },
    warn: (msg) => {
      logger.warn('SQL Warning', { message: msg });
    }
  };
};

// Middleware для логирования Redis операций
const redisLogger = (client) => {
  const originalSendCommand = client.sendCommand;
  
  client.sendCommand = function (command) {
    const args = Array.from(arguments).slice(1);
    const startTime = Date.now();
    
    logger.debug('Redis Command', {
      command: command.name,
      args: args,
      key: args[0]
    });
    
    return originalSendCommand.apply(this, arguments).then((result) => {
      const duration = Date.now() - startTime;
      logger.debug('Redis Command completed', {
        command: command.name,
        duration: `${duration}ms`,
        success: true
      });
      return result;
    }).catch((error) => {
      const duration = Date.now() - startTime;
      logger.error('Redis Command failed', {
        command: command.name,
        duration: `${duration}ms`,
        error: error.message,
        success: false
      });
      throw error;
    });
  };
};

// Middleware для логирования запросов к внешним API
const externalApiLogger = (config = {}) => {
  return async (req, res, next) => {
    const { 
      serviceName, 
      endpoint,
      method = 'GET',
      timeout = 5000 
    } = config;
    
    const startTime = Date.now();
    logger.info('External API request started', {
      serviceName,
      endpoint,
      method,
      timeout
    });
    
    try {
      await next();
      const duration = Date.now() - startTime;
      
      logger.info('External API request completed', {
        serviceName,
        endpoint,
        method,
        duration: `${duration}ms`,
        statusCode: res.statusCode
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('External API request failed', {
        serviceName,
        endpoint,
        method,
        duration: `${duration}ms`,
        error: error.message,
        stack: error.stack
      });
      
      throw error;
    }
  };
};

// Middleware для логирования аутентификации
const authLogger = (req, res, next) => {
  const authLogger = logger.child({ 
    component: 'auth',
    requestId: req.id 
  });
  
  authLogger.debug('Authentication attempt', {
    method: req.method,
    url: req.url,
    ip: req.ip
  });
  
  // Логируем успешную аутентификацию
  const originalSend = res.send;
  res.send = function (body) {
    if (res.statusCode === 200 && req.path.includes('/login')) {
      authLogger.info('User login successful', {
        userId: req.user?.id,
        ip: req.ip
      });
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};

// Middleware для логирования бизнес-событий
const businessEventLogger = (event, data) => {
  return (req, res, next) => {
    const eventLogger = logger.child({ 
      component: 'business',
      requestId: req.id 
    });
    
    eventLogger.info('Business event', {
      event,
      data: {
        ...data,
        userId: req.user?.id,
        ip: req.ip
      }
    });
    
    next();
  };
};

module.exports = {
  requestIdMiddleware,
  requestLogger,
  requestLoggerMiddleware,
  sqlLogger,
  redisLogger,
  externalApiLogger,
  authLogger,
  businessEventLogger
};