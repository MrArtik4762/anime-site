const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const MAP_PATH = path.join(__dirname, '..', '..', 'shared', 'source-map.json');

function load() {
  const raw = fs.readFileSync(MAP_PATH, 'utf-8');
  return JSON.parse(raw);
}

router.get('/:titleId', (req, res) => {
  const id = String(req.params.titleId);
  const json = load();
  res.json({ ok: true, items: json[id] || [] });
});

router.post('/:titleId', (req, res) => {
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_SOURCEMAP_WRITE) {
    return res.status(403).json({ ok: false, message: 'Write disabled' });
  }
  const id = String(req.params.titleId);
  const json = load();
  json[id] = req.body?.items || [];
  fs.writeFileSync(MAP_PATH, JSON.stringify(json, null, 2));
  res.json({ ok: true });
});

module.exports = router;