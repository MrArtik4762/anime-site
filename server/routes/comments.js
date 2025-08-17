import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const router = express.Router();

// GET /api/comments/:animeId
router.get('/:animeId', (req, res) => {
  res.json({ 
    message: 'Comments for anime endpoint',
    animeId: req.params.animeId,
    comments: []
  });
});

// POST /api/comments
router.post('/', (req, res) => {
  res.json({ message: 'Create comment endpoint' });
});

export default router;