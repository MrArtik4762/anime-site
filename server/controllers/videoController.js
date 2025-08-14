const axios = require('axios');
const { promisify } = require('util');
const redis = require('../config/redis');
const { createError } = require('../utils/errors');
const { metrics } = require('../utils/metrics');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../../shared/constants/constants');

const CACHE_TTL = 3600; // 1 С‡Р°СЃ
const get = promisify(redis.get).bind(redis);
const set = promisify(redis.set).bind(redis);

const ANICLI_API_URL = process.env.ANICLI_API_URL || 'http://anicli_api:8000';
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://python-service:8000';

/**
 * РљРѕРЅС‚СЂРѕР»Р»РµСЂ РґР»СЏ СЂР°Р±РѕС‚С‹ СЃ РІРёРґРµРѕ РєРѕРЅС‚РµРЅС‚РѕРј
 * РћР±РµСЃРїРµС‡РёРІР°РµС‚ РїРѕР»СѓС‡РµРЅРёРµ РІРёРґРµРѕ РїРѕС‚РѕРєРѕРІ, РєР°С‡РµСЃС‚РІ, РѕР·РІСѓС‡РµРє Рё СЃСѓР±С‚РёС‚СЂРѕРІ
 */

/**
 * РџРѕР»СѓС‡РµРЅРёРµ РІРёРґРµРѕ РїРѕС‚РѕРєР°
 * @param {Object} req - РѕР±СЉРµРєС‚ Р·Р°РїСЂРѕСЃР° Express
 * @param {Object} res - РѕР±СЉРµРєС‚ РѕС‚РІРµС‚Р° Express
 * @returns {Promise<void>}
 */
exports.getVideoStream = async (req, res) => {
  const { anime_id, episode, quality = 'auto', voice = 0 } = req.query;
  const userId = req.user?.id;

  try {
    if (!anime_id || !episode) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: 'РџР°СЂР°РјРµС‚СЂС‹ anime_id Рё episode РѕР±СЏР·Р°С‚РµР»СЊРЅС‹'
        }
      });
    }

    metrics.videoRequests.inc({ anime_id, quality });

    // РџСЂРѕРІРµСЂСЏРµРј РїСЂР°РІР° РґРѕСЃС‚СѓРїР°
    if (!await checkVideoAccess(userId, anime_id)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: {
          message: 'РќРµС‚ РґРѕСЃС‚СѓРїР° Рє РІРёРґРµРѕ'
        }
      });
    }

    // РЎРЅР°С‡Р°Р»Р° РїСЂРѕР±СѓРµРј РїРѕР»СѓС‡РёС‚СЊ С‡РµСЂРµР· Python СЃРµСЂРІРёСЃ (AniLiberty)
    try {
      const response = await axios.get(`${PYTHON_SERVICE_URL}/video`, {
        params: { anime_id, episode, quality, voice },
        timeout: 30000
      });

      if (response.status === 200) {
        return res.json({
          success: true,
          videoUrl: response.data.url || response.data.videoUrl,
          quality: response.data.quality || quality,
          voice: response.data.voice || voice,
          source: 'aniliberty'
        });
      }
    } catch (pythonError) {
      console.log('Python service failed, trying fallback:', pythonError.message);
    }

    // Fallback Рє СЃС‚Р°СЂРѕРјСѓ AniliCLI API
    const response = await axios.get(`${ANICLI_API_URL}/get-anime-video`, {
      params: { anime_id, episode, quality },
      responseType: 'stream',
      timeout: 30000
    });

    // Р”РѕР±Р°РІР»СЏРµРј Р·Р°РіРѕР»РѕРІРєРё РґР»СЏ СЃС‚СЂРёРјРёРЅРіР°
    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Content-Length', response.headers['content-length']);
    res.setHeader('Accept-Ranges', 'bytes');

    response.data.pipe(res);
  } catch (error) {
    console.error('Video streaming error:', error);
    metrics.videoErrors.inc({ anime_id, error: error.code });

    res.status(error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error.message || ERROR_MESSAGES.SERVER_ERROR
      }
    });
  }
};

/**
 * РџРѕР»СѓС‡РµРЅРёРµ РґРѕСЃС‚СѓРїРЅС‹С… РєР°С‡РµСЃС‚РІ РІРёРґРµРѕ
 * @param {Object} req - РѕР±СЉРµРєС‚ Р·Р°РїСЂРѕСЃР° Express
 * @param {Object} res - РѕР±СЉРµРєС‚ РѕС‚РІРµС‚Р° Express
 * @returns {Promise<void>}
 */
exports.getAvailableQualities = async (req, res) => {
  const { anime_id, episode } = req.query;
  const cacheKey = `qualities:${anime_id}:${episode}`;

  try {
    if (!anime_id || !episode) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: 'РџР°СЂР°РјРµС‚СЂС‹ anime_id Рё episode РѕР±СЏР·Р°С‚РµР»СЊРЅС‹'
        }
      });
    }

    // РџСЂРѕРІРµСЂСЏРµРј РєСЌС€
    const cached = await get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // РџСЂРѕР±СѓРµРј Python СЃРµСЂРІРёСЃ (AniLiberty)
    try {
      const response = await axios.get(`${PYTHON_SERVICE_URL}/qualities`, {
        params: { anime_id, episode }
      });

      if (response.status === 200 && response.data.success) {
        const result = {
          success: true,
          qualities: response.data.qualities,
          source: 'aniliberty'
        };

        // РљСЌС€РёСЂСѓРµРј СЂРµР·СѓР»СЊС‚Р°С‚
        await set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL);
        return res.json(result);
      }
    } catch (pythonError) {
      console.log('Python service qualities failed, trying fallback:', pythonError.message);
    }

    // Fallback Рє СЃС‚Р°СЂРѕРјСѓ API
    const response = await axios.get(`${ANICLI_API_URL}/get-qualities`, {
      params: { anime_id, episode }
    });

    const result = {
      success: true,
      qualities: response.data.qualities || response.data,
      source: 'anicli'
    };

    // РљСЌС€РёСЂСѓРµРј СЂРµР·СѓР»СЊС‚Р°С‚
    await set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL);

    res.json(result);
  } catch (error) {
    console.error('Get qualities error:', error);
    res.status(error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error.message || ERROR_MESSAGES.SERVER_ERROR
      }
    });
  }
};

/**
 * РџРѕР»СѓС‡РµРЅРёРµ РґРѕСЃС‚СѓРїРЅС‹С… РѕР·РІСѓС‡РµРє
 * @param {Object} req - РѕР±СЉРµРєС‚ Р·Р°РїСЂРѕСЃР° Express
 * @param {Object} res - РѕР±СЉРµРєС‚ РѕС‚РІРµС‚Р° Express
 * @returns {Promise<void>}
 */
exports.getAvailableVoices = async (req, res) => {
  const { anime_id, episode } = req.query;
  const cacheKey = `voices:${anime_id}:${episode}`;

  try {
    if (!anime_id || !episode) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: 'РџР°СЂР°РјРµС‚СЂС‹ anime_id Рё episode РѕР±СЏР·Р°С‚РµР»СЊРЅС‹'
        }
      });
    }

    // РџСЂРѕРІРµСЂСЏРµРј РєСЌС€
    const cached = await get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // РџРѕР»СѓС‡Р°РµРј РґР°РЅРЅС‹Рµ РѕР± РѕР·РІСѓС‡РєР°С… С‡РµСЂРµР· AniLiberty API
    try {
      const response = await axios.get(`${PYTHON_SERVICE_URL}/voices`, {
        params: { anime_id, episode }
      });

      if (response.status === 200) {
        const voices = response.data.voices || [];
        const result = {
          success: true,
          voices: voices.map((voice, index) => ({
            id: voice.id || index,
            name: voice.name || `РћР·РІСѓС‡РєР° ${index + 1}`,
            language: voice.language || 'ru',
            type: voice.type || 'dub',
            quality: voice.quality || 'medium',
            studio: voice.studio || 'Unknown',
            description: voice.description || ''
          })),
          source: 'aniliberty'
        };

        // РљСЌС€РёСЂСѓРµРј СЂРµР·СѓР»СЊС‚Р°С‚
        await set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL);
        return res.json(result);
      }
    } catch (pythonError) {
      console.log('Python service voices failed:', pythonError.message);
    }

    // Fallback - РІРѕР·РІСЂР°С‰Р°РµРј СЃС‚Р°РЅРґР°СЂС‚РЅС‹Рµ РѕР·РІСѓС‡РєРё
    const fallbackVoices = [
      {
        id: 'original',
        name: 'РћСЂРёРіРёРЅР°Р»',
        language: 'ja',
        type: 'original',
        quality: 'high',
        studio: 'Original',
        description: 'РћСЂРёРіРёРЅР°Р»СЊРЅР°СЏ СЏРїРѕРЅСЃРєР°СЏ РѕР·РІСѓС‡РєР°'
      },
      {
        id: 'anilibria',
        name: 'AniLibria',
        language: 'ru',
        type: 'dub',
        quality: 'high',
        studio: 'AniLibria',
        description: 'Р СѓСЃСЃРєР°СЏ РѕР·РІСѓС‡РєР° РѕС‚ AniLibria'
      }
    ];

    const result = {
      success: true,
      voices: fallbackVoices,
      source: 'fallback'
    };

    // РљСЌС€РёСЂСѓРµРј СЂРµР·СѓР»СЊС‚Р°С‚
    await set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL);
    res.json(result);

  } catch (error) {
    console.error('Get voices error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error.message || ERROR_MESSAGES.SERVER_ERROR
      }
    });
  }
};

/**
 * РџРѕР»СѓС‡РµРЅРёРµ СЃСѓР±С‚РёС‚СЂРѕРІ
 * @param {Object} req - РѕР±СЉРµРєС‚ Р·Р°РїСЂРѕСЃР° Express
 * @param {Object} res - РѕР±СЉРµРєС‚ РѕС‚РІРµС‚Р° Express
 * @returns {Promise<void>}
 */
exports.getSubtitles = async (req, res) => {
  const { anime_id, episode, language = 'ru' } = req.query;
  const cacheKey = `subtitles:${anime_id}:${episode}:${language}`;

  try {
    if (!anime_id || !episode) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: 'РџР°СЂР°РјРµС‚СЂС‹ anime_id Рё episode РѕР±СЏР·Р°С‚РµР»СЊРЅС‹'
        }
      });
    }

    // РџСЂРѕРІРµСЂСЏРµРј РєСЌС€
    const cached = await get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // РџРѕР»СѓС‡Р°РµРј СЃСѓР±С‚РёС‚СЂС‹ С‡РµСЂРµР· AniLiberty API
    try {
      const response = await axios.get(`${PYTHON_SERVICE_URL}/subtitles`, {
        params: { anime_id, episode, language }
      });

      if (response.status === 200) {
        const result = {
          success: true,
          subtitles: response.data.subtitles || [],
          source: 'aniliberty'
        };

        // РљСЌС€РёСЂСѓРµРј СЂРµР·СѓР»СЊС‚Р°С‚
        await set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL);
        return res.json(result);
      }
    } catch (pythonError) {
      console.log('Python service subtitles failed:', pythonError.message);
    }

    // Fallback - РІРѕР·РІСЂР°С‰Р°РµРј РїСѓСЃС‚РѕР№ РјР°СЃСЃРёРІ
    const result = {
      success: true,
      subtitles: [],
      source: 'fallback'
    };

    res.json(result);

  } catch (error) {
    console.error('Get subtitles error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error.message || ERROR_MESSAGES.SERVER_ERROR
      }
    });
  }
};

/**
 * РџСЂРѕРІРµСЂРєР° РґРѕСЃС‚СѓРїРЅРѕСЃС‚Рё РІРёРґРµРѕ
 * @param {Object} req - РѕР±СЉРµРєС‚ Р·Р°РїСЂРѕСЃР° Express
 * @param {Object} res - РѕР±СЉРµРєС‚ РѕС‚РІРµС‚Р° Express
 * @returns {Promise<void>}
 */
exports.checkVideoAvailability = async (req, res) => {
  const { anime_id, episode } = req.query;
  const cacheKey = `video-availability:${anime_id}:${episode}`;

  try {
    if (!anime_id || !episode) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: 'РџР°СЂР°РјРµС‚СЂС‹ anime_id Рё episode РѕР±СЏР·Р°С‚РµР»СЊРЅС‹'
        }
      });
    }

    // РџСЂРѕРІРµСЂСЏРµРј РєСЌС€
    const cached = await get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const response = await axios.get(`${ANICLI_API_URL}/check-availability`, {
      params: { anime_id, episode }
    });

    // РљСЌС€РёСЂСѓРµРј СЂРµР·СѓР»СЊС‚Р°С‚
    await set(cacheKey, JSON.stringify(response.data), 'EX', CACHE_TTL);

    res.json(response.data);
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: error.message || ERROR_MESSAGES.SERVER_ERROR
      }
    });
  }
};

/**
 * РћР±СЂР°Р±РѕС‚С‡РёРє РїРѕР»СѓС‡РµРЅРёСЏ РІРёРґРµРѕ (Р°Р»СЊС‚РµСЂРЅР°С‚РёРІРЅС‹Р№ РјРµС‚РѕРґ)
 * @param {Object} req - РѕР±СЉРµРєС‚ Р·Р°РїСЂРѕСЃР° Express
 * @param {Object} res - РѕР±СЉРµРєС‚ РѕС‚РІРµС‚Р° Express
 * @returns {Promise<void>}
 */
exports.getVideoHandler = async (req, res) => {
  const { anime_id, episode } = req.query;

  try {
    if (!anime_id || !episode) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: 'РџР°СЂР°РјРµС‚СЂС‹ anime_id Рё episode РѕР±СЏР·Р°С‚РµР»СЊРЅС‹'
        }
      });
    }

    // Р—Р°РїСЂРѕСЃ Рє Python-РјРёРєСЂРѕСЃРµСЂРІРёСЃСѓ
    const response = await axios.get('http://anicli_api:8000/video', {
      params: { anime_id, episode },
      responseType: 'stream'
    });

    // РџРµСЂРµСЃС‹Р»РєР° РІРёРґРµРѕ РїРѕС‚РѕРєР°
    response.data.pipe(res);
  } catch (error) {
    console.error('Video handler error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.SERVER_ERROR
      }
    });
  }
};

/**
 * РџСЂРѕРІРµСЂРєР° РїСЂР°РІ РґРѕСЃС‚СѓРїР° Рє РІРёРґРµРѕ
 * @param {string} userId - ID РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
 * @param {string} animeId - ID Р°РЅРёРјРµ
 * @returns {Promise<boolean>} - СЂРµР·СѓР»СЊС‚Р°С‚ РїСЂРѕРІРµСЂРєРё РґРѕСЃС‚СѓРїР°
 */
async function checkVideoAccess(userId, animeId) {
  // Р—РґРµСЃСЊ СЂРµР°Р»РёР·СѓР№С‚Рµ РїСЂРѕРІРµСЂРєСѓ РїСЂР°РІ РґРѕСЃС‚СѓРїР° Рє РІРёРґРµРѕ
  // РќР°РїСЂРёРјРµСЂ, РїСЂРѕРІРµСЂРєР° РїРѕРґРїРёСЃРєРё, РІРѕР·СЂР°СЃС‚РЅС‹С… РѕРіСЂР°РЅРёС‡РµРЅРёР№ Рё С‚.Рґ.
  return true; // Р—Р°РіР»СѓС€РєР°
}

