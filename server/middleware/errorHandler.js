const logger = require('../config/logger');
const { AppError, formatErrorForResponse, logError } = require('../utils/errors');

/**
 * Централизованный обработчик ошибок для Express
 */

/**
 * Обработщик ошибок 404 (Not Found)
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Обработчик ошибок валидации (от Joi и других валидаторов)
 */
const validationErrorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const error = new AppError('Validation failed', 400, {
      details: err.details || err.message
    });
    return next(error);
  }
  
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
    
    const error = new AppError('Validation failed', 400, {
      details: errors
    });
    return next(error);
  }
  
  next(err);
};

/**
 * Обработчик ошибок базы данных
 */
const databaseErrorHandler = (err, req, res, next) => {
  // Ошибка подключения к базе данных
  if (err.name === 'SequelizeConnectionError') {
    const error = new AppError('Database connection failed', 503);
    return next(error);
  }
  
  // Ошибка таймаута базы данных
  if (err.name === 'SequelizeTimeoutError') {
    const error = new AppError('Database operation timed out', 504);
    return next(error);
  }
  
  // Другие ошибки базы данных
  if (err.name === 'SequelizeDatabaseError') {
    const error = new AppError('Database operation failed', 500);
    return next(error);
  }
  
  next(err);
};

/**
 * Обработ ошибок JWT
 */
const jwtErrorHandler = (err, req, res, next) => {
  if (err.name === 'JsonWebTokenError') {
    const error = new AppError('Invalid token', 401);
    return next(error);
  }
  
  if (err.name === 'TokenExpiredError') {
    const error = new AppError('Token expired', 401);
    return next(error);
  }
  
  next(err);
};

/**
 * Обработчик ошибок асинхронных операций
 */
const asyncErrorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(formatErrorForResponse(err));
  }
  
  // Для неизвестных ошибок
  logger.error('Unhandled error', err);
  const error = new AppError('Internal server error', 500);
  return res.status(error.statusCode).json(formatErrorForResponse(error));
};

/**
 * Обработчик ошибок для разработки (более детальная информация)
 */
const developmentErrorHandler = (err, req, res, next) => {
  logError(err, req, res);
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.name,
      message: err.message,
      stack: err.stack,
      ...(err.details && { details: err.details })
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query
    }
  });
};

/**
 * Обработчик ошибок для продакшена (минимум информации)
 */
const productionErrorHandler = (err, req, res, next) => {
  logError(err, req, res);
  
  // Операционные ошибки, которые мы доверяем
  if (err.isOperational) {
    return res.status(err.statusCode).json(formatErrorForResponse(err));
  }
  
  // Программные ошибки или неизвестные ошибки
  logger.error('Programming error 💥', err);
  
  res.status(500).json({
    success: false,
    error: {
      code: 'InternalServerError',
      message: 'Something went wrong'
    }
  });
};

/**
 * Главный обработчик ошибок
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // В зависимости от среды выбираем соответствующий обработчик
  if (process.env.NODE_ENV === 'development') {
    developmentErrorHandler(err, req, res, next);
  } else {
    productionErrorHandler(err, req, res, next);
  }
};

/**
 * Обработчик ошибок для WebSocket соединений
 */
const wsErrorHandler = (ws, error) => {
  logger.error('WebSocket error', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    connectionId: ws.id
  });
  
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'error',
      code: error.name || 'WebSocketError',
      message: error.message || 'WebSocket error occurred'
    }));
  }
};

/**
 * Обработчик ошибок для HLS потоков
 */
const hlsErrorHandler = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function (body) {
    // Проверяем, является ли ошибка HLS
    if (res.statusCode >= 400 && body) {
      try {
        const errorData = JSON.parse(body);
        if (errorData.error && errorData.error.code === 'HlsError') {
          logger.error('HLS streaming error', {
            error: errorData.error,
            url: req.url,
            userAgent: req.get('User-Agent')
          });
        }
      } catch (e) {
        // Не удалось распарсить JSON как ошибку
      }
    }
    
    originalSend.call(this, body);
  };
  
  next();
};

module.exports = {
  notFoundHandler,
  validationErrorHandler,
  databaseErrorHandler,
  jwtErrorHandler,
  asyncErrorHandler,
  errorHandler,
  wsErrorHandler,
  hlsErrorHandler
};

// Экспортируем errorHandler как отдельную функцию для app.js
module.exports.errorHandler = errorHandler;