const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getVideoHandler } = require('../controllers/videoController');

// Маршрут для получения видео
router.get('/video', getVideoHandler);

// Маршрут для получения доступных качеств - временно отключен
router.get('/qualities', async (req, res) => {
  const { anime_id, episode } = req.query;
  
  try {
    // Запрос к Python-микросервису - временно отключен
    // const response = await axios.get(`http://anicli_api:8000/qualities`, {
    //   params: { anime_id, episode }
    // });
    
    res.json({
      success: true,
      data: {
        qualities: ['1080p', '720p', '480p'],
        message: 'Python сервис временно недоступен'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка получения качеств видео'
    });
  }
});

module.exports = router;