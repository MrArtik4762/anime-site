const winston = require('winston');
const { combine, timestamp, errors, json, printf, colorize } = winston.format;

// Формат для консольного вывода с цветами
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(meta).length > 0) {
    msg += ` ${JSON.stringify(meta, null, 2)}`;
  }
  
  return msg;
});

// Формат для JSON логов (для файлов и внешних сервисов)
const jsonFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// Создание логгера
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'anime-site-api' },
  transports: [
    // Логи ошибок в отдельный файл
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: jsonFormat
    }),
    
    // Все логи в один файл
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: jsonFormat
    }),
    
    // Логи запросов в отдельный файл
    new winston.transports.File({
      filename: 'logs/requests.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: jsonFormat,
      level: 'http'
    })
  ],
  
  // Исключение логов в продакшене
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: 'logs/exceptions.log',
      format: jsonFormat
    })
  ],
  
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: 'logs/rejections.log',
      format: jsonFormat
    })
  ]
});

// Добавляем консольный транспорт только не в продакшене
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      consoleFormat
    )
  }));
}

// Дополнительный транспорт для Sentry (если настроен)
if (process.env.SENTRY_DSN) {
  const SentryTransport = require('winston-transport-sentry');
  logger.add(new SentryTransport({
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.npm_package_version || '1.0.0'
    },
    level: 'error'
  }));
}

// Дополнительный транспорт для LogDNA (если настроен)
if (process.env.LOGDNA_API_KEY) {
  const LogdnaTransport = require('winston-logdna');
  logger.add(new LogdnaTransport({
    key: process.env.LOGDNA_API_KEY,
    environment: process.env.NODE_ENV || 'development',
    app: 'anime-site-api',
    level: process.env.LOG_LEVEL || 'info'
  }));
}

// Создаем HTTP логгер для запросов
const httpLogger = winston.createLogger({
  level: 'http',
  format: combine(
    timestamp(),
    json()
  ),
  defaultMeta: { service: 'anime-site-http' },
  transports: [
    new winston.transports.File({
      filename: 'logs/http.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: jsonFormat
    })
  ]
});

// Хелпер для логирования запросов
const logRequest = (req, res, startTime) => {
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  httpLogger.info('HTTP Request', {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    contentLength: res.get('Content-Length'),
    userId: req.user?.id || 'anonymous'
  });
};

module.exports = { logger, httpLogger, logRequest };