const express = require('express');
const router = express.Router();
const anilibriaV1Controller = require('../controllers/anilibriaV1Controller');

// Получить популярные аниме
router.get('/popular', anilibriaV1Controller.getPopular);

// Получить новые эпизоды
router.get('/new-episodes', anilibriaV1Controller.getNewEpisodes);

// Получить новые аниме
router.get('/new-anime', anilibriaV1Controller.getNewAnime);

// Поиск аниме
router.get('/search', anilibriaV1Controller.searchAnime);

// Получить аниме по ID
router.get('/anime/:id', anilibriaV1Controller.getAnimeById);

// Получить эпизоды аниме
router.get('/anime/:id/episodes', anilibriaV1Controller.getAnimeEpisodes);

// Универсальный прокси для AniLibria V1 API
router.all('/proxy/:endpoint*', anilibriaV1Controller.proxyRequest);

module.exports = router;