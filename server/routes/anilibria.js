import { Router } from 'express';
import * as anilibriaController from '../controllers/anilibriaController.js';
import * as auth from '../middleware/auth.js';

const router = Router();

// Получить популярные аниме
router.get('/popular', anilibriaController.getPopular);

// Получить последние обновления
router.get('/updates', anilibriaController.getUpdates);

// Поиск аниме
router.get('/search', anilibriaController.search);

// Fallback поиск аниме
router.get('/search/fallback', anilibriaController.searchFallback);

// Получить случайное аниме
router.get('/random', anilibriaController.getRandom);

// Получить жанры
router.get('/genres', anilibriaController.getGenres);

// Получить расписание
router.get('/schedule', anilibriaController.getSchedule);

// Получить YouTube данные
router.get('/youtube', anilibriaController.getYouTube);

// Получить аниме по ID
router.get('/:id', anilibriaController.getById);

export default router;