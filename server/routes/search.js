const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// GET /api/anime/search?q=&limit=6 - Поиск с автодополнением
router.get('/anime/search', searchController.searchAnime);

module.exports = router;