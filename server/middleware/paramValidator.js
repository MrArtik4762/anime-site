import { paramSchemas, querySchemas } from '../middleware/validation.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../../shared/constants/constants.js';

/**
 * Middleware для валидации параметров URL
 */
const validateUrlParams = (schemaType) => {
  return (req, res, next) => {
    try {
      let schema;
      
      switch (schemaType) {
        case 'objectId':
          schema = paramSchemas.objectId;
          break;
        case 'userId':
          schema = paramSchemas.userId;
          break;
        case 'animeEpisode':
          schema = paramSchemas.animeEpisode;
          break;
        default:
          return next();
      }
      
      const { error } = schema.validate(req.params);
      
      if (error) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Неверные параметры URL',
            details: error.details[0].message
          }
        });
      }
      
      next();
    } catch (error) {
      console.error('Parameter validation error:', error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  };
};

/**
 * Middleware для валидации query параметров
 */
const validateQueryParams = (schemaType) => {
  return (req, res, next) => {
    try {
      let schema;
      
      switch (schemaType) {
        case 'pagination':
          schema = querySchemas.pagination;
          break;
        case 'animeSearch':
          schema = querySchemas.animeSearch;
          break;
        default:
          return next();
      }
      
      const { error, value } = schema.validate(req.query, {
        allowUnknown: true,
        stripUnknown: true
      });
      
      if (error) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Неверные параметры запроса',
            details: error.details[0].message
          }
        });
      }
      
      req.query = value;
      next();
    } catch (error) {
      console.error('Query validation error:', error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  };
};

/**
 * Middleware для защиты от SQL инъекций
 */
const preventSqlInjection = (req, res, next) => {
  try {
    // Проверяем параметры запроса
    const checkValue = (value) => {
      if (typeof value === 'string') {
        // Проверяем на SQL инъекции
        const sqlInjectionPatterns = [
          /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|EXECUTE|CREATE|ALTER|TRUNCATE)\b)/gi,
          /(;|'|"|--|\/\*|\*\/|@@|xp_|sp_|;)/g,
          /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi
        ];
        
        for (const pattern of sqlInjectionPatterns) {
          if (pattern.test(value)) {
            throw new Error('Обнаружена попытка SQL инъекции');
          }
        }
      }
      
      if (Array.isArray(value)) {
        value.forEach(checkValue);
      }
      
      return true;
    };
    
    // Проверяем body
    if (req.body) {
      Object.values(req.body).forEach(checkValue);
    }
    
    // Проверяем query параметры
    if (req.query) {
      Object.values(req.query).forEach(checkValue);
    }
    
    // Проверяем параметры
    if (req.params) {
      Object.values(req.params).forEach(checkValue);
    }
    
    next();
  } catch (error) {
    console.error('SQL injection prevention error:', error);
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        message: 'Недопустимые символы в запросе',
        code: 'SQL_INJECTION_ATTEMPT'
      }
    });
  }
};

/**
 * Middleware для проверки Content-Type
 */
const validateContentType = (allowedTypes = ['application/json']) => {
  return (req, res, next) => {
    try {
      const contentType = req.headers['content-type'];
      
      if (req.method !== 'GET' && req.method !== 'HEAD' && contentType) {
        const isValid = allowedTypes.some(type => contentType.includes(type));
        
        if (!isValid) {
          return res.status(HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE).json({
            success: false,
            error: {
              message: `Неподдерживаемый Content-Type. Разрешенные: ${allowedTypes.join(', ')}`
            }
          });
        }
      }
      
      next();
    } catch (error) {
      console.error('Content type validation error:', error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  };
};

/**
 * Middleware для проверки размера запроса
 */
const validateRequestSize = (maxSize = '10mb') => {
  return (req, res, next) => {
    try {
      const contentLength = req.headers['content-length'];
      
      if (contentLength) {
        const bytes = parseSize(maxSize);
        
        if (parseInt(contentLength) > bytes) {
          return res.status(HTTP_STATUS.REQUEST_ENTITY_TOO_LARGE).json({
            success: false,
            error: {
              message: `Размер запроса превышает максимальный размер ${maxSize}`
            }
          });
        }
      }
      
      next();
    } catch (error) {
      console.error('Request size validation error:', error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR
        }
      });
    }
  };
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
  validateUrlParams,
  validateQueryParams,
  preventSqlInjection,
  validateContentType,
  validateRequestSize
};