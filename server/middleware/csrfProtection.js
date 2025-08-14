const crypto = require('crypto');

/**
 * Middleware для генерации и проверки CSRF токенов
 */
const csrfProtection = (req, res, next) => {
  try {
    // Если это GET запрос, просто генерируем токен
    if (req.method === 'GET') {
      const csrfToken = generateCSRFToken();
      
      // Сохраняем токен в сессии
      req.session.csrfToken = csrfToken;
      
      // Добавляем в заголовки и локальные переменные
      res.locals.csrfToken = csrfToken;
      res.setHeader('X-CSRF-Token', csrfToken);
      
      return next();
    }
    
    // Для POST, PUT, DELETE проверяем токен
    const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
    
    if (!csrfToken) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'CSRF токен отсутствует',
          code: 'CSRF_TOKEN_MISSING'
        }
      });
    }
    
    // Проверяем токен
    if (csrfToken !== req.session.csrfToken) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'CSRF токен недействителен',
          code: 'CSRF_TOKEN_INVALID'
        }
      });
    }
    
    // Удаляем использованный токен
    req.session.csrfToken = null;
    
    next();
  } catch (error) {
    console.error('CSRF protection error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Внутренняя ошибка сервера'
      }
    });
  }
};

/**
 * Генерация CSRF токена
 */
function generateCSRFToken() {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Middleware для добавления CSRF токена в формы
 */
const addCSRFToken = (req, res, next) => {
  res.locals.csrfToken = req.session.csrfToken || generateCSRFToken();
  next();
};

/**
 * Middleware для проверки Referer и Origin заголовков
 */
const validateReferer = (req, res, next) => {
  try {
    const referer = req.headers.referer;
    const origin = req.headers.origin;
    
    // В продакшене проверяем Referer
    if (process.env.NODE_ENV === 'production') {
      const allowedDomains = [
        'https://anime-site.com',
        'https://www.anime-site.com'
      ];
      
      if (referer) {
        const refererDomain = new URL(referer).hostname;
        if (!allowedDomains.includes(refererDomain)) {
          return res.status(403).json({
            success: false,
            error: {
              message: 'Недопустимый Referer',
              code: 'INVALID_REFERER'
            }
          });
        }
      }
      
      if (origin) {
        const originDomain = new URL(origin).hostname;
        if (!allowedDomains.includes(originDomain)) {
          return res.status(403).json({
            success: false,
            error: {
              message: 'Недопустимый Origin',
              code: 'INVALID_ORIGIN'
            }
          });
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Referer validation error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Внутренняя ошибка сервера'
      }
    });
  }
};

/**
 * Middleware для SameSite cookie политики
 */
const setSameSiteCookies = (req, res, next) => {
  try {
    const cookies = res.getHeader('Set-Cookie');
    
    if (Array.isArray(cookies)) {
      const updatedCookies = cookies.map(cookie => {
        if (cookie.includes('HttpOnly')) {
          return cookie.replace(/(; ?)?SameSite=[LlaxSs]*/g, '') + '; SameSite=Strict';
        }
        return cookie;
      });
      
      res.setHeader('Set-Cookie', updatedCookies);
    }
    
    next();
  } catch (error) {
    console.error('SameSite cookie error:', error);
    next();
  }
};

module.exports = {
  csrfProtection,
  addCSRFToken,
  validateReferer,
  setSameSiteCookies,
  generateCSRFToken
};