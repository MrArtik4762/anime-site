import { querySchemas } from './validation.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../../shared/constants/constants.js';

/**
 * Middleware для валидации query параметров стриминга
 */
const validateStreamQuery = (req, res, next) => {
  try {
    // Используем существующую схему валидации для query параметров
    const { error, value } = querySchemas.stream.validate(req.query, {
      allowUnknown: true,
      stripUnknown: true
    });
    
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.BAD_REQUEST,
          details: 'Неверные параметры стриминга',
          validationErrors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }
    
    // Сохраняем валидированные значения
    req.query = value;
    next();
    
  } catch (error) {
    console.error('Stream validation error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.SERVER_ERROR,
        details: 'Ошибка при валидации параметров стриминга'
      }
    });
  }
};

/**
 * Middleware для проверки формата URL стриминга
 */
const validateStreamUrl = (req, res, next) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.BAD_REQUEST,
          details: 'URL параметр обязателен'
        }
      });
    }
    
    // Проверяем базовый формат URL
    try {
      new URL(url);
    } catch (urlError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.BAD_REQUEST,
          details: 'Неверный формат URL'
        }
      });
    }
    
    // Проверяем, что URL содержит протокол
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.BAD_REQUEST,
          details: 'URL должен начинаться с http:// или https://'
        }
      });
    }
    
    next();
    
  } catch (error) {
    console.error('Stream URL validation error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.SERVER_ERROR,
        details: 'Ошибка при проверке URL стриминга'
      }
    });
  }
};

/**
 * Middleware для проверки Range заголовков
 */
const validateRangeHeader = (req, res, next) => {
  try {
    const rangeHeader = req.headers.range;
    
    if (rangeHeader) {
      // Проверяем формат Range заголовка: bytes=start-end
      const rangeRegex = /^bytes=\d+-\d*$/;
      if (!rangeRegex.test(rangeHeader)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: ERROR_MESSAGES.BAD_REQUEST,
            details: 'Неверный формат Range заголовка. Ожидается: bytes=start-end'
          }
        });
      }
      
      // Извлекаем start и end
      const rangeMatch = rangeHeader.match(/^bytes=(\d+)-(\d*)$/);
      const start = parseInt(rangeMatch[1], 10);
      const end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : null;
      
      // Проверяем валидность диапазона
      if (start < 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: ERROR_MESSAGES.BAD_REQUEST,
            details: 'Начало диапазона не может быть отрицательным'
          }
        });
      }
      
      if (end !== null && end < start) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: ERROR_MESSAGES.BAD_REQUEST,
            details: 'Конец диапазона не может быть меньше начала'
          }
        });
      }
    }
    
    next();
    
  } catch (error) {
    console.error('Range header validation error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.SERVER_ERROR,
        details: 'Ошибка при проверке Range заголовка'
      }
    });
  }
};

/**
 * Middleware для проверки размера запроса
 */
const validateStreamSize = (req, res, next) => {
  try {
    const contentLength = req.headers['content-length'];
    const maxStreamSize = process.env.MAX_STREAM_SIZE || '100mb'; // 100MB по умолчанию
    
    if (contentLength) {
      const bytes = this.parseSize(maxStreamSize);
      
      if (parseInt(contentLength) > bytes) {
        return res.status(HTTP_STATUS.REQUEST_ENTITY_TOO_LARGE).json({
          success: false,
          error: {
            message: ERROR_MESSAGES.PAYLOAD_TOO_LARGE,
            details: `Размер стрима превышает максимальный размер ${maxStreamSize}`
          }
        });
      }
    }
    
    next();
    
  } catch (error) {
    console.error('Stream size validation error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.SERVER_ERROR,
        details: 'Ошибка при проверке размера стрима'
      }
    });
  }
};

/**
 * Парсинг размера в байты
 */
function parseSize(size) {
  const units = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024
  };
  
  const match = size.toLowerCase().match(/^(\d+)(b|kb|mb|gb)$/i);
  
  if (!match) {
    throw new Error('Invalid size format');
  }
  
  return parseInt(match[1]) * units[match[2]];
}

export {
  validateStreamQuery,
  validateStreamUrl,
  validateRangeHeader,
  validateStreamSize,
  parseSize
};