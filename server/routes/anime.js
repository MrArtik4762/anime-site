// server/routes/anime.js
import { Router } from 'express';
import { getPopular, getNewEpisodes, getCatalog } from '../services/anilibertyService.js';

const router = Router();

router.get('/popular', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 12);
    const data = await getPopular(limit);
    res.json({ items: data });
  } catch (e) {
    console.error('Error in /api/anime/popular:', e);
    next(e);
  }
});

router.get('/new-episodes', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 12);
    const data = await getNewEpisodes(limit);
    res.json({ items: data });
  } catch (e) {
    console.error('Error in /api/anime/new-episodes:', e);
    next(e);
  }
});

router.get('/catalog', async (req, res, next) => {
  try {
    const data = await getCatalog(req.query);
    res.json(data);
  } catch (e) {
    console.error('Error in /api/anime/catalog:', e);
    next(e);
  }
});

export default router;