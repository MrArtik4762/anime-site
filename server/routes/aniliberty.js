const express = require('express');
const axios = require('axios');
const router = express.Router();

// Базовый URL API AniLiberty
const ANILIBERTY_BASE_URL = 'https://aniliberty.top/api/v1';

// Функция для создания HTTP клиента с retry логикой
const createApiClient = () => {
  const client = axios.create({
    baseURL: ANILIBERTY_BASE_URL,
    timeout: 10000,
    headers: {
      'User-Agent': 'AnimeApp/1.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  // Добавляем retry логику для обработки ошибок
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response && error.response.status >= 500) {
        // Повторяем запрос через 1 секунду при ошибке сервера
        await new Promise(resolve => setTimeout(resolve, 1000));
        return client.request(error.config);
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// Получение конкретного эпизода с данными об озвучках
router.get('/episodes/:episodeId', async (req, res) => {
  try {
    const { episodeId } = req.params;
    const client = createApiClient();

    console.log(`[AniLiberty API] Запрос эпизода: ${episodeId}`);

    // Получаем данные об эпизоде
    const episodeResponse = await client.get(`/anime/releases/episodes/${episodeId}`);
    const episodeData = episodeResponse.data;

    if (!episodeData || !episodeData.release) {
      return res.status(404).json({ 
        error: 'Episode not found', 
        message: 'Эпизод не найден' 
      });
    }

    // Получаем участников релиза (озвучки)
    const membersResponse = await client.get(`/anime/releases/${episodeData.release.id}/members`);
    const members = membersResponse.data || [];

    // Фильтруем только озвучивателей
    const voices = members
      .filter(member => member.role && member.role.value === 'voicing')
      .map(member => ({
        id: member.id,
        name: member.nickname,
        language: 'ru' // По умолчанию русский, так как это русская озвучка
      }));

    // Собираем доступные качества видео
    const availableQualities = [];
    if (episodeData.hls_480) availableQualities.push({ quality: '480p', url: episodeData.hls_480 });
    if (episodeData.hls_720) availableQualities.push({ quality: '720p', url: episodeData.hls_720 });
    if (episodeData.hls_1080) availableQualities.push({ quality: '1080p', url: episodeData.hls_1080 });

    // Формируем моковые субтитры (пока нет в API)
    const subtitles = [
      {
        language: 'ru',
        label: 'Русские',
        url: null // Пока нет данных о субтитрах в API
      }
    ];

    // Формируем ответ в формате, ожидаемом компонентами
    const response = {
      ...episodeData,
      voices,
      qualities: availableQualities,
      subtitles,
      // Дополнительные поля для совместимости
      videoUrl: episodeData.hls_720 || episodeData.hls_480 || episodeData.hls_1080,
      defaultQuality: '720p'
    };

    console.log(`[AniLiberty API] Эпизод получен: ${episodeData.name}, озвучек: ${voices.length}, качеств: ${availableQualities.length}`);

    res.json(response);
  } catch (error) {
    console.error('[AniLiberty API] Ошибка получения эпизода:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: 'AniLiberty API error', 
        message: error.response.data?.message || error.message 
      });
    }

    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Внутренняя ошибка сервера' 
    });
  }
});

// Получение релиза с эпизодами
router.get('/releases/:releaseId', async (req, res) => {
  try {
    const { releaseId } = req.params;
    const client = createApiClient();

    console.log(`[AniLiberty API] Запрос релиза: ${releaseId}`);

    // Получаем релиз с эпизодами
    const response = await client.get(`/anime/releases/${releaseId}?include=episodes`);
    const releaseData = response.data;

    // Получаем участников релиза
    const membersResponse = await client.get(`/anime/releases/${releaseId}/members`);
    const members = membersResponse.data || [];

    // Добавляем информацию об озвучках к релизу
    const voices = members
      .filter(member => member.role && member.role.value === 'voicing')
      .map(member => ({
        id: member.id,
        name: member.nickname,
        language: 'ru'
      }));

    res.json({
      ...releaseData,
      voices,
      members
    });

  } catch (error) {
    console.error('[AniLiberty API] Ошибка получения релиза:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: 'AniLiberty API error', 
        message: error.response.data?.message || error.message 
      });
    }

    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Внутренняя ошибка сервера' 
    });
  }
});

// Получение последних релизов
router.get('/releases/latest', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const client = createApiClient();

    console.log(`[AniLiberty API] Запрос последних релизов: ${limit}`);

    const response = await client.get(`/anime/releases/latest?limit=${limit}`);
    res.json(response.data);

  } catch (error) {
    console.error('[AniLiberty API] Ошибка получения последних релизов:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: 'AniLiberty API error', 
        message: error.response.data?.message || error.message 
      });
    }

    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Внутренняя ошибка сервера' 
    });
  }
});

// Поиск релизов
router.get('/search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Bad request', 
        message: 'Параметр query обязателен' 
      });
    }

    const client = createApiClient();
    console.log(`[AniLiberty API] Поиск: ${query}`);

    const response = await client.get(`/app/search/releases?search=${encodeURIComponent(query)}&limit=${limit}`);
    res.json(response.data);

  } catch (error) {
    console.error('[AniLiberty API] Ошибка поиска:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: 'AniLiberty API error', 
        message: error.response.data?.message || error.message 
      });
    }

    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Внутренняя ошибка сервера' 
    });
  }
});

// Проверка статуса API
router.get('/status', async (req, res) => {
  try {
    const client = createApiClient();
    const response = await client.get('/app/status');
    
    res.json({
      status: 'ok',
      aniliberty_status: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[AniLiberty API] Ошибка проверки статуса:', error.message);
    
    res.status(503).json({
      status: 'error',
      error: 'Service unavailable',
      message: 'AniLiberty API недоступен'
    });
  }
});

module.exports = router;