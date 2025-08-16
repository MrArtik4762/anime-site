const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Регистрация нового пользователя
router.post('/register', authController.register);

// Вход в систему
router.post('/login', authController.login);

// Обновление токена
router.post('/refresh', authController.refreshToken);

// Выход из системы
router.post('/logout', authController.logout);

// Получение текущего пользователя
router.get('/me', authController.getMe);

// Забыли пароль
router.post('/forgot-password', authController.forgotPassword);

// Сброс пароля
router.post('/reset-password', authController.resetPassword);

// Верификация email
router.get('/verify-email/:token', authController.verifyEmail);

// Двухфакторная аутентификация
router.post('/2fa/generate', authController.generate2FASecret);
router.post('/2fa/enable', authController.enable2FA);
router.post('/2fa/disable', authController.disable2FA);
router.post('/2fa/verify', authController.verify2FA);

module.exports = router;