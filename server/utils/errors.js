/**
 * Кастомные классы ошибок для аниме-сайта
 */

class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 400);
    this.name = 'ValidationError';
    this.details = details;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429);
    this.name = 'RateLimitError';
    this.retryAfter = 60; // seconds
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 503);
    this.name = 'DatabaseError';
  }
}

class ExternalServiceError extends AppError {
  constructor(service, message = 'External service unavailable') {
    super(`${service}: ${message}`, 502);
    this.name = 'ExternalServiceError';
    this.service = service;
  }
}

class VideoProcessingError extends AppError {
  constructor(message = 'Video processing failed') {
    super(message, 500);
    this.name = 'VideoProcessingError';
  }
}

class AnimeNotFoundError extends NotFoundError {
  constructor(animeId) {
    super(`Anime with ID ${animeId} not found`);
    this.name = 'AnimeNotFoundError';
    this.animeId = animeId;
  }
}

class EpisodeNotFoundError extends NotFoundError {
  constructor(episodeId) {
    super(`Episode with ID ${episodeId} not found`);
    this.name = 'EpisodeNotFoundError';
    this.episodeId = episodeId;
  }
}

class UserNotFoundError extends NotFoundError {
  constructor(userId) {
    super(`User with ID ${userId} not found`);
    this.name = 'UserNotFoundError';
    this.userId = userId;
  }
}

/**
 * Фабрика для создания ошибок из HTTP ответов внешних сервисов
 */
class ExternalApiError extends AppError {
  constructor(service, response) {
    const { status, statusText, data } = response;
    const message = data?.error?.message || data?.message || statusText || 'Unknown error';
    super(`${service} API Error: ${message}`, status);
    this.name = 'ExternalApiError';
    this.service = service;
    this.response = response;
  }
}

/**
 * Обработчик асинхронных функций для автоматической обработки ошибок
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Форматирование ошибки для ответа API
 */
const formatErrorForResponse = (error) => {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.name,
        message: error.message,
        ...(error.details && { details: error.details }),
        ...(error.retryAfter && { retryAfter: error.retryAfter })
      }
    };
  }
  
  // Для неизвестных ошибок не раскрываем внутренние детали
  return {
    success: false,
    error: {
      code: 'InternalServerError',
      message: 'Internal server error'
    }
  };
};

/**
 * Логирование ошибки с дополнительной контекстной информацией
 */
const logError = (error, req, res) => {
  const { logger } = require('../config/logger');
  
  const errorContext = {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id
    },
    response: {
      statusCode: res.statusCode,
      requestId: res.get('X-Request-ID')
    }
  };
  
  if (error instanceof AppError) {
    logger.error('Application Error', errorContext);
  } else {
    logger.error('Unexpected Error', errorContext);
  }
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  VideoProcessingError,
  AnimeNotFoundError,
  EpisodeNotFoundError,
  UserNotFoundError,
  ExternalApiError,
  asyncHandler,
  formatErrorForResponse,
  logError
};