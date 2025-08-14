const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, authSchemas } = require('../middleware/validation');
const { accountLockout, resetAttempts } = require('../middleware/accountLockout');
const { require2FA } = require('../middleware/2fa');
const { setAuthCookies, extractTokenFromCookie, refreshTokenFromCookie, clearAuthCookies } = require('../middleware/cookieAuth');

// POST /api/auth/register - Регистрация пользователя
router.post('/register',
  validate(authSchemas.register),
  authController.register
);

// POST /api/auth/login - Вход в систему
router.post('/login',
  accountLockout,
  validate(authSchemas.login),
  authController.login,
  resetAttempts
);

// POST /api/auth/refresh - Обновление токена
router.post('/refresh', authController.refreshToken);

// POST /api/auth/logout - Выход из системы
router.post('/logout', authenticate, authController.logout);

// GET /api/auth/me - Получение текущего пользователя
router.get('/me', authenticate, authController.getMe);

// POST /api/auth/forgot-password - Забыли пароль
router.post('/forgot-password',
  validate(authSchemas.forgotPassword),
  authController.forgotPassword
);

// POST /api/auth/reset-password - Сброс пароля
router.post('/reset-password',
  validate(authSchemas.resetPassword),
  authController.resetPassword
);

// GET /api/auth/verify-email/:token - Верификация email
router.get('/verify-email/:token', authController.verifyEmail);

// POST /api/auth/2fa/generate - Генерация 2FA секрета
router.post('/2fa/generate', authController.generate2FASecret);

// POST /api/auth/2fa/enable - Включение 2FA
router.post('/2fa/enable', authenticate, authController.enable2FA);

// POST /api/auth/2fa/disable - Отключение 2FA
router.post('/2fa/disable', authenticate, authController.disable2FA);

// POST /api/auth/2fa/verify - Проверка 2FA токена
router.post('/2fa/verify', authenticate, require2FA, authController.verify2FA);

// GET /api/auth/test - Тестовый endpoint
router.get('/test', (req, res) => {
  res.json({
    message: 'Auth routes working!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;