import express from 'express';
import { Router } from 'express';
import { userController, avatarUpload } from '../controllers/userController.js';
import { authenticate, checkSelfOrAdmin } from '../middleware/auth.js';
import { validate, validateParams, userSchemas, paramSchemas } from '../middleware/validation.js';

const router = Router();

// GET /api/users/profile - Получение собственного профиля
router.get('/profile', authenticate, userController.getProfile);

// PUT /api/users/profile - Обновление профиля
router.put('/profile',
  authenticate,
  validate(userSchemas.updateProfile),
  userController.updateProfile
);

// POST /api/users/change-password - Смена пароля
router.post('/change-password',
  authenticate,
  validate(userSchemas.changePassword),
  userController.changePassword
);

// POST /api/users/upload-avatar - Загрузка аватара
router.post('/upload-avatar',
  authenticate,
  avatarUpload.single('avatar'),
  userController.uploadAvatar
);

// GET /api/users/:userId - Получение публичного профиля
router.get('/:userId',
  validateParams(paramSchemas.userId),
  userController.getPublicProfile
);

// GET /api/users/:userId/stats - Статистика пользователя
router.get('/:userId/stats',
  authenticate,
  validateParams(paramSchemas.userId),
  checkSelfOrAdmin('userId'),
  userController.getUserStats
);

// DELETE /api/users/account - Удаление аккаунта
router.delete('/account',
  authenticate,
  userController.deleteAccount
);

// GET /api/users/watchlist - Список просмотра (будет перенесен в отдельный роут)
router.get('/watchlist', authenticate, (req, res) => {
  res.json({
    message: 'Этот endpoint перенесен в /api/watchlist',
    redirect: '/api/watchlist'
  });
});

export default router;