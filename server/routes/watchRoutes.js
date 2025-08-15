const express = require('express');
const router = express.Router();
const watchController = require('../controllers/watchController');
const { authenticate } = require('../middleware/auth');
const { validate, watchProgressSchemas } = require('../middleware/validation');

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

module.exports = router;