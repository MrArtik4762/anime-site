import { Router } from 'express';
import anilibertyController from '../controllers/anilibertyController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { checkStatus } from '../services/anilibertyService.js';

const router = Router();

/**
 * Поиск аниме (должен быть перед :id маршрутом)
 * GET /api/anime/search
 */
router.get('/anime/search', anilibertyController.searchAnime);

/**
 * Получение каталога аниме с фильтрацией
 * GET /api/anime/catalog
 */
router.get('/anime/catalog', anilibertyController.getCatalog);

/**
 * Получение жанров
 * GET /api/anime/genres
 */
router.get('/anime/genres', anilibertyController.getGenres);

/**
 * Получение популярных аниме
 * GET /api/anime/popular
 */
router.get('/anime/popular', anilibertyController.getPopularAnime);

/**
 * Получение новых эпизодов
 * GET /api/anime/new-episodes
 */
router.get('/anime/new-episodes', anilibertyController.getNewEpisodes);

/**
 * Получение деталей аниме (должен быть после специфичных маршрутов)
 * GET /api/anime/:id
 */
router.get('/anime/:id', optionalAuth, anilibertyController.getAnimeDetails);

/**
 * Синхронизация с AniLiberty API (только для администраторов)
 * POST /api/anime/sync
 */
router.post('/anime/sync', authenticate, anilibertyController.syncWithAPI);

/**
 * Проверка статуса API
 * GET /api/status
 */
router.get('/status', async (req, res) => {
  try {
    const result = await checkStatus();
    
    res.json({
      success: true,
      aniliberty: result.success ? result.data : { status: 'error', error: result.error },
      server: {
        status: 'running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }
    });
  } catch (error) {
    console.error('Error in status route:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера',
      message: 'Ошибка проверки статуса'
    });
  }
});

export default router;