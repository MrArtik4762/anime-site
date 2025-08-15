const express = require('express');
const router = express.Router();
const v1 = require('../services/anilibriaV1');

router.get('/', async (req, res, next) => {
  try {
    const { page, limit, genres, year, season, order } = req.query;
    const data = await v1.getCatalog({
      page: Number(page) || 1,
      limit: Math.min(Number(limit) || 24, 60),
      genres: genres ? String(genres).split(',') : [],
      year: year ? Number(year) : undefined,
      season, order,
    });
    res.json(data);
  } catch (e) { next(e); }
});

router.get('/search', async (req, res, next) => {
  try {
    const { q, page, limit, sort } = req.query;
    const data = await v1.searchTitles({
      query: q || '',
      page: Number(page) || 1,
      limit: Math.min(Number(limit) || 24, 60),
      sort: sort || 'updated',
    });
    res.json(data);
  } catch (e) { next(e); }
});

router.get('/title/:id', async (req, res, next) => {
  try {
    const t = await v1.getTitleById(req.params.id);
    res.json(t);
  } catch (e) { next(e); }
});

module.exports = router;