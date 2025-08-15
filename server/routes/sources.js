const express = require('express');
const SourcesController = require('../controllers/sourcesController');
const router = express.Router();

/**
 * Маршруты для работы с источниками эпизодов
 */

// Получение источников эпизодов для аниме
router.get('/anime/:animeId/sources', SourcesController.getEpisodeSources);

// Получение лучших источников для эпизода
router.get('/anime/:animeId/episode/:episodeNumber/best-sources', SourcesController.getBestSources);

// Получение активных источников для эпизода
router.get('/anime/:animeId/episode/:episodeNumber/active-sources', SourcesController.getActiveSources);

// Обновление статуса доступности источника
router.patch('/sources/:sourceId/availability', SourcesController.updateSourceAvailability);

// Проверка статуса провайдеров
router.get('/providers/status', SourcesController.checkProvidersStatus);

// Массовое обновление источников для нескольких аниме
router.post('/sources/batch-update', SourcesController.batchUpdateSources);

// Получение статистики по источникам
router.get('/anime/:animeId/sources/stats', SourcesController.getSourcesStats);
router.get('/sources/stats', SourcesController.getSourcesStats); // Общая статистика

// Очистка старых неактивных источников
router.delete('/sources/cleanup', SourcesController.cleanupOldSources);

// Получение источников эпизода с проверкой доступности и priority sorting
router.get('/anime/:id/episode/:num/sources', SourcesController.getEpisodeSourcesWithStatus);

module.exports = router;