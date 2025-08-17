import winston from 'winston';
const { DailyRotateFile } = require('winston-daily-rotate-file');
const { ElasticsearchTransport } = require('@elastic/elasticsearch/libTransport');
const { combine, timestamp, errors, json, printf, colorize } = winston.format;
const path = require('path');

// Формат для консольного вывода (цветной)
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
  return `${timestamp} [${level}]: ${message} ${metaStr}`;
});

// Формат для файлов (JSON)
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  errors({ stack: true }),
  json()
);

// Создаем логгер
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  defaultMeta: { service: 'anime-site-server' },
  transports: [
    // Консольный вывод (только в разработке)
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: combine(
          colorize(),
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          consoleFormat
        )
      })
    ] : []),
    
    // Ошибки в отдельный файл
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d',
      maxSize: '20m'
    }),
    
    // Все логи в отдельный файл
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '20m'
    })
  ],
  
  // Не выводить ошибки, если нет активных транспортов
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: 'logs/exceptions.log',
      maxFiles: '14d',
      maxSize: '20m'
    })
  ],
  
  // Не выводить необработанные промисы
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: 'logs/rejections.log',
      maxFiles: '14d',
      maxSize: '20m'
    })
  ]
});

// Интеграция с Elasticsearch (если настроена)
if (process.env.ELASTICSEARCH_URL) {
  const esTransport = new ElasticsearchTransport({
    level: 'info',
    client: { node: process.env.ELASTICSEARCH_URL },
    index: 'anime-site-logs',
    indexPrefix: '%DATE%',
    indexSuffix: 'logs',
    transformer: (log) => {
      return {
        ...log,
        '@timestamp': log.timestamp,
        message: log.message,
        level: log.level,
        service: log.service,
        requestId: log.requestId,
        userId: log.userId,
        meta: log.meta || {}
      };
    }
  });
  
  logger.add(esTransport);
}

// HTTP логгер для express-winston
const httpLogger = winston.createLogger({
  level: 'http',
  format: combine(
    timestamp(),
    json(),
    (info) => {
      // Добавляем HTTP специфичные поля
      if (info.meta && info.meta.req) {
        return {
          ...info,
          method: info.meta.req.method,
          url: info.meta.req.url,
          userAgent: info.meta.req.headers['user-agent'],
          ip: info.meta.req.ip,
          statusCode: info.meta.res?.statusCode,
          responseTime: info.meta.responseTime,
          contentLength: info.meta.res.get('content-length')
        };
      }
      return info;
    }
  ),
  transports: [
    new DailyRotateFile({
      filename: 'logs/http-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '7d',
      maxSize: '20m'
    })
  ]
});

// Middleware для логирования запросов
const requestLoggerMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.http('HTTP request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: duration,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.id || 'unknown'
    });
  });
  
  next();
};

// Функция для создания контекстного логгера
const createContextLogger = (context = {}) => {
  return logger.child(context);
};

// Функция для логирования ошибок с Sentry контекстом
const logErrorWithSentry = (error, context = {}) => {
  const errorLogger = createContextLogger({ ...context, error: true });
  
  if (error instanceof Error) {
    errorLogger.error('Error occurred', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      ...context
    });
  } else {
    errorLogger.error('Error occurred', {
      error: error,
      ...context
    });
  }
  
  return errorLogger;
};

// Функция для логирования API запросов
const logApiRequest = (method, endpoint, statusCode, duration, context = {}) => {
  logger.info('API Request', {
    method,
    endpoint,
    statusCode,
    duration,
    ...context
  });
};

// Функция для логирования бизнес-событий
const logBusinessEvent = (event, data, context = {}) => {
  logger.info('Business Event', {
    event,
    data,
    ...context
  });
};

export {
  logger,
  httpLogger,
  requestLoggerMiddleware,
  createContextLogger,
  logErrorWithSentry,
  logApiRequest,
  logBusinessEvent
};