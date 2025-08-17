import express from 'express';
import { Router } from 'express';
import searchController from '../controllers/searchController.js';

const router = Router();

// GET /api/anime/search?q=&limit=6 - Поиск с автодополнением
router.get('/anime/search', searchController.searchAnime);

export default router;