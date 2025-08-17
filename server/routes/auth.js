import express from 'express';
import router from 'express-promise-router';
import authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, authSchemas } from '../middleware/validation.js';
import { accountLockout, resetAttempts } from '../middleware/accountLockout.js';
import { require2FA } from '../middleware/2fa.js';
import { setAuthCookies, extractTokenFromCookie, refreshTokenFromCookie, clearAuthCookies } from '../middleware/cookieAuth.js';

const authRouter = router();

// POST /api/auth/register - Регистрация пользователя
authRouter.post('/register',
  [
    validate(authSchemas.register),
    (req, res, next) => {
      // Дополнительная валидация на уровне роута
      const { email, username, password } = req.body;
      
      // Проверка уникальности email
      if (email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Неверный формат email',
            code: 'INVALID_EMAIL_FORMAT'
          }
        });
      }
      
      // Проверка сложности пароля
      if (password && password.length < 8) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Пароль должен содержать минимум 8 символов',
            code: 'PASSWORD_TOO_SHORT',
            minLength: 8
          }
        });
      }
      
      next();
    }
  ],
  authController.register
);

// POST /api/auth/login - Вход в систему
authRouter.post('/login',
  [
    accountLockout,
    validate(authSchemas.login),
    (req, res, next) => {
      // Дополнительная валидация на уровне роута
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Email и пароль обязательны',
            code: 'EMAIL_PASSWORD_REQUIRED'
          }
        });
      }
      
      next();
    }
  ],
  authController.login,
  resetAttempts
);

// POST /api/auth/refresh - Обновление токена
authRouter.post('/refresh', [
  (req, res, next) => {
    // Проверяем наличие refresh токена в cookie
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Refresh токен не предоставлен',
          code: 'NO_REFRESH_TOKEN'
        }
      });
    }
    
    next();
  }
], authController.refreshToken);

// POST /api/auth/logout - Выход из системы
authRouter.post('/logout', [
  authenticate,
  (req, res, next) => {
    // Проверяем, что пользователь аутентифицирован
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Пользователь не аутентифицирован',
          code: 'USER_NOT_AUTHENTICATED'
        }
      });
    }
    
    next();
  }
], authController.logout);

// GET /api/auth/me - Получение текущего пользователя
authRouter.get('/me', [
  authenticate,
  (req, res, next) => {
    // Проверяем, что пользователь аутентифицирован
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Пользователь не аутентифицирован',
          code: 'USER_NOT_AUTHENTICATED'
        }
      });
    }
    
    next();
  }
], authController.getMe);

// POST /api/auth/forgot-password - Забыли пароль
authRouter.post('/forgot-password', [
  validate(authSchemas.forgotPassword),
  (req, res, next) => {
    // Дополнительная валидация на уровне роута
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email обязателен',
          code: 'EMAIL_REQUIRED'
        }
      });
    }
    
    next();
  }
], authController.forgotPassword);

// POST /api/auth/reset-password - Сброс пароля
authRouter.post('/reset-password', [
  validate(authSchemas.resetPassword),
  (req, res, next) => {
    // Дополнительная валидация на уровне роута
    const { token, password } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Токен сброса пароля обязателен',
          code: 'RESET_TOKEN_REQUIRED'
        }
      });
    }
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Новый пароль обязателен',
          code: 'PASSWORD_REQUIRED'
        }
      });
    }
    
    // Проверка сложности пароля
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Пароль должен содержать минимум 8 символов',
          code: 'PASSWORD_TOO_SHORT',
          minLength: 8
        }
      });
    }
    
    next();
  }
], authController.resetPassword);

// GET /api/auth/verify-email/:token - Верификация email
authRouter.get('/verify-email/:token', [
  (req, res, next) => {
    // Проверяем наличие токена
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Токен верификации обязателен',
          code: 'VERIFICATION_TOKEN_REQUIRED'
        }
      });
    }
    
    next();
  }
], authController.verifyEmail);

// POST /api/auth/2fa/generate - Генерация 2FA секрета
authRouter.post('/2fa/generate', [
  (req, res, next) => {
    // Проверяем наличие email
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email обязателен',
          code: 'EMAIL_REQUIRED'
        }
      });
    }
    
    // Проверка формата email
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Неверный формат email',
          code: 'INVALID_EMAIL_FORMAT'
        }
      });
    }
    
    next();
  }
], authController.generate2FASecret);

// POST /api/auth/2fa/enable - Включение 2FA
authRouter.post('/2fa/enable', [
  authenticate,
  (req, res, next) => {
    // Проверяем, что пользователь аутентифицирован
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Пользователь не аутентифицирован',
          code: 'USER_NOT_AUTHENTICATED'
        }
      });
    }
    
    next();
  }
], authController.enable2FA);

// POST /api/auth/2fa/disable - Отключение 2FA
authRouter.post('/2fa/disable', [
  authenticate,
  (req, res, next) => {
    // Проверяем, что пользователь аутентифицирован
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Пользователь не аутентифицирован',
          code: 'USER_NOT_AUTHENTICATED'
        }
      });
    }
    
    next();
  }
], authController.disable2FA);

// POST /api/auth/2fa/verify - Проверка 2FA токена
authRouter.post('/2fa/verify', [
  authenticate,
  require2FA,
  (req, res, next) => {
    // Проверяем, что пользователь аутентифицирован
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Пользователь не аутентифицирован',
          code: 'USER_NOT_AUTHENTICATED'
        }
      });
    }
    
    next();
  }
], authController.verify2FA);

// GET /api/auth/test - Тестовый endpoint
authRouter.get('/test', (req, res) => {
  res.json({
    message: 'Auth routes working!',
    timestamp: new Date().toISOString()
  });
});

export default authRouter;