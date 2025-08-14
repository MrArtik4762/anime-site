const jwt = require('jsonwebtoken');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../../shared/constants/constants');

/**
 * Middleware для установки JWT токенов в HttpOnly cookies
 */
const setAuthCookies = (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.body;
    
    if (!accessToken || !refreshToken) {
      return next();
    }

    // Устанавливаем access token в HttpOnly cookie с безопасными настройками
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Только HTTPS в продакшене
      sameSite: 'strict', // Защита от CSRF
      maxAge: 15 * 60 * 1000, // 15 минут
      path: '/'
    });

    // Устанавливаем refresh token в HttpOnly cookie с безопасными настройками
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      path: '/'
    });

    next();

  } catch (error) {
    console.error('Cookie auth error:', error);
    next(error);
  }
};

/**
 * Middleware для извлечения JWT токенов из cookies
 */
const extractTokenFromCookie = (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    
    if (!token) {
      return next();
    }

    // Валидация токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Добавляем пользователя в запрос
    req.user = decoded;
    next();

  } catch (error) {
    // Если токен недействителен, удаляем cookie
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    next();
  }
};

/**
 * Middleware для обновления access token с помощью refresh token
 */
const refreshTokenFromCookie = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return next();
    }

    // Валидация refresh токена
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    // Генерируем новый access token
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Обновляем cookie с новым access token
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/'
    });

    // Добавляем пользователя в запрос
    req.user = decoded;
    next();

  } catch (error) {
    // Если refresh токен недействителен, удаляем все cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    next();
  }
};

/**
 * Middleware для очистки auth cookies
 */
const clearAuthCookies = (req, res, next) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  next();
};

/**
 * Middleware для проверки CSRF токена
 */
const verifyCSRFToken = (req, res, next) => {
  try {
    const csrfToken = req.headers['x-csrf-token'];
    const sessionCsrfToken = req.session.csrfToken;

    if (!csrfToken || !sessionCsrfToken || csrfToken !== sessionCsrfToken) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          message: 'CSRF токен недействителен',
          code: 'INVALID_CSRF_TOKEN'
        }
      });
    }

    next();

  } catch (error) {
    console.error('CSRF verification error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.SERVER_ERROR
      }
    });
  }
};

/**
 * Middleware для генерации CSRF токена
 */
const generateCSRFToken = (req, res, next) => {
  try {
    const csrfToken = require('crypto').randomBytes(64).toString('hex');
    
    // Сохраняем токен в сессии
    req.session.csrfToken = csrfToken;
    
    // Добавляем в заголовки ответа
    res.setHeader('X-CSRF-Token', csrfToken);
    
    next();

  } catch (error) {
    console.error('CSRF generation error:', error);
    next(error);
  }
};

/**
 * Middleware для безопасной установки session cookie
 */
const setSecureSession = (req, res, next) => {
  try {
    // Устанавливаем безопасные настройки для session cookie
    const sessionOptions = {
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 часа
      }
    };

    // Применяем настройки к сессии
    if (req.sessionID) {
      req.session.cookie = { ...req.session.cookie, ...sessionOptions.cookie };
    }

    next();

  } catch (error) {
    console.error('Secure session error:', error);
    next(error);
  }
};

module.exports = {
  setAuthCookies,
  extractTokenFromCookie,
  refreshTokenFromCookie,
  clearAuthCookies,
  verifyCSRFToken,
  generateCSRFToken,
  setSecureSession
};