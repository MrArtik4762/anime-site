import express from 'express';
import { Router } from 'express';
import watchController from '../controllers/watchController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, watchProgressSchemas } from '../middleware/validation.js';

const router = Router();

// POST /api/watch/progress - Сохранение прогресса просмотра
router.post('/progress',
  authenticate,
  validate(watchProgressSchemas.saveProgress),
  watchController.saveProgress
);

// GET /api/watch/progress - Получение прогресса просмотра
router.get('/progress',
  authenticate,
  validate(watchProgressSchemas.getProgress),
  watchController.getProgress
);

// GET /api/watch/stats - Получение статистики просмотра
router.get('/stats',
  authenticate,
  watchController.getProgressStats
);

// GET /api/watch/continue - Получение списка для продолжения просмотра
router.get('/continue',
  authenticate,
  watchController.getContinueWatching
);

// POST /api/watch/progress/batch - Парное сохранение прогресса
router.post('/progress/batch',
  authenticate,
  watchController.batchSaveProgress
);

export default router;