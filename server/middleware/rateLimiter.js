const rateLimit = require('express-rate-limit');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../../shared/constants/constants');

/**
 * Middleware для ограничения количества запросов
 * Предотвращает злоупотребления API и защищает от DDoS атак
 */

/**
 * Лимитер для видео запросов
 * Более строгие ограничения для ресурсоемких операций
 */
const videoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов за окно
  message: {
    success: false,
    error: {
      message: 'Слишком много запросов на видео. Попробуйте позже.',
      code: 'VIDEO_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true, // Возвращает информацию о лимите в заголовках `RateLimit-*`
  legacyHeaders: false, // Отключает заголовки `X-RateLimit-*`
  keyGenerator: (req) => {
    // Используем IP адрес и user ID (если авторизован) для более точного лимитирования
    return req.user?.id ? `${req.ip}:${req.user.id}` : req.ip;
  },
  skip: (req) => {
    // Пропускаем лимитирование для админов
    return req.user?.role === 'admin';
  },
  onLimitReached: (req, res, options) => {
    console.warn(`Video rate limit exceeded for ${req.ip}`, {
      ip: req.ip,
      userId: req.user?.id,
      userAgent: req.get('User-Agent')
    });
  }
});

/**
 * Общий лимитер для API запросов
 * Базовые ограничения для всех эндпоинтов
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 1000, // максимум 1000 запросов за окно
  message: {
    success: false,
    error: {
      message: 'Слишком много запросов. Попробуйте позже.',
      code: 'GENERAL_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id ? `${req.ip}:${req.user.id}` : req.ip;
  },
  skip: (req) => {
    return req.user?.role === 'admin';
  }
});

/**
 * Строгий лимитер для аутентификации
 * Защита от брутфорс атак на логин/регистрацию
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток за окно
  message: {
    success: false,
    error: {
      message: 'Слишком много попыток входа. Попробуйте позже.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Не считаем успешные запросы
  onLimitReached: (req, res, options) => {
    console.warn(`Auth rate limit exceeded for ${req.ip}`, {
      ip: req.ip,
      endpoint: req.path,
      userAgent: req.get('User-Agent')
    });
  }
});

/**
 * Лимитер для поиска
 * Предотвращает злоупотребления поисковыми запросами
 */
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 30, // максимум 30 поисковых запросов в минуту
  message: {
    success: false,
    error: {
      message: 'Слишком много поисковых запросов. Попробуйте позже.',
      code: 'SEARCH_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id ? `${req.ip}:${req.user.id}` : req.ip;
  },
  skip: (req) => {
    return req.user?.role === 'admin';
  }
});

/**
 * Лимитер для API внешних сервисов
 * Ограничения для запросов к AniLiberty, AniLibria и другим внешним API
 */
const externalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 60, // максимум 60 запросов в минуту
  message: {
    success: false,
    error: {
      message: 'Слишком много запросов к внешним API. Попробуйте позже.',
      code: 'EXTERNAL_API_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id ? `${req.ip}:${req.user.id}` : req.ip;
  },
  skip: (req) => {
    return req.user?.role === 'admin';
  }
});

/**
 * Лимитер для загрузки файлов
 * Строгие ограничения для операций загрузки
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 10, // максимум 10 загрузок в час
  message: {
    success: false,
    error: {
      message: 'Слишком много загрузок файлов. Попробуйте позже.',
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id ? `${req.ip}:${req.user.id}` : req.ip;
  },
  skip: (req) => {
    return req.user?.role === 'admin' || req.user?.role === 'moderator';
  }
});

/**
 * Создание кастомного лимитера с заданными параметрами
 * @param {Object} options - параметры лимитера
 * @param {number} options.windowMs - окно времени в миллисекундах
 * @param {number} options.max - максимальное количество запросов
 * @param {string} options.message - сообщение об ошибке
 * @param {string} options.code - код ошибки
 * @returns {Function} middleware функция
 */
const createCustomLimiter = (options) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Слишком много запросов',
    code = 'RATE_LIMIT_EXCEEDED'
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        message,
        code
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.user?.id ? `${req.ip}:${req.user.id}` : req.ip;
    },
    skip: (req) => {
      return req.user?.role === 'admin';
    }
  });
};

/**
 * Middleware для логирования превышений лимитов
 * @param {Object} req - объект запроса Express
 * @param {Object} res - объект ответа Express
 * @param {Function} next - следующий middleware
 */
const rateLimitLogger = (req, res, next) => {
  const originalSend = res.send;

  res.send = function(data) {
    if (res.statusCode === HTTP_STATUS.TOO_MANY_REQUESTS) {
      console.warn('Rate limit exceeded:', {
        ip: req.ip,
        userId: req.user?.id,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

module.exports = {
  videoLimiter,
  generalLimiter,
  authLimiter,
  searchLimiter,
  externalApiLimiter,
  uploadLimiter,
  createCustomLimiter,
  rateLimitLogger
};
