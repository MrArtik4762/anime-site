import axios from 'axios';
import { promisify } from 'util';
import redis from '../config/redis.js';
import { createError } from '../utils/errors.js';
import { metrics } from '../utils/metrics.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../../shared/constants/constants.js';

const CACHE_TTL = 3600; // 1 час
const get = promisify(redis.get).bind(redis);
const set = promisify(redis.set).bind(redis);

const ANICLI_API_URL = process.env.ANICLI_API_URL || 'http://anicli_api:8000';
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://python-service:8000';

/**
 * Контроллер для работы с видео контентом
 * Обеспечивает получение видео потоков, качеств, озвучек и субтитров
 */
class VideoController {
  /**
   * Получение видео потока
   * @param {Object} req - объект запроса Express
   * @param {Object} res - объект ответа Express
   * @returns {Promise<void>}
   */
  async getVideoStream(req, res) {
    const { anime_id, episode, quality = 'auto', voice = 0 } = req.query;
    const userId = req.user?.id;

    try {
      if (!anime_id || !episode) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Параметры anime_id и episode обязательны'
          }
        });
      }

      metrics.videoRequests.inc({ anime_id, quality });

      // Проверяем права доступа
      if (!await this.checkVideoAccess(userId, anime_id)) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Нет доступа к видео'
          }
        });
      }

      // Сначала пробуем получить через Python сервис (AniLiberty)
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

      // Fallback к старому AniliCLI API
      const response = await axios.get(`${ANICLI_API_URL}/get-anime-video`, {
        params: { anime_id, episode, quality },
        responseType: 'stream',
        timeout: 30000
      });

      // Добавляем заголовки для стриминга
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
  }

  /**
   * Получение доступных качеств видео
   * @param {Object} req - объект запроса Express
   * @param {Object} res - объект ответа Express
   * @returns {Promise<void>}
   */
  async getAvailableQualities(req, res) {
    const { anime_id, episode } = req.query;
    const cacheKey = `qualities:${anime_id}:${episode}`;

    try {
      if (!anime_id || !episode) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Параметры anime_id и episode обязательны'
          }
        });
      }

      // Проверяем кэш
      const cached = await get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      // Пробуем Python сервис (AniLiberty)
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

          // Кэшируем результат
          await set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL);
          return res.json(result);
        }
      } catch (pythonError) {
        console.log('Python service qualities failed, trying fallback:', pythonError.message);
      }

      // Fallback к старому API
      const response = await axios.get(`${ANICLI_API_URL}/get-qualities`, {
        params: { anime_id, episode }
      });

      const result = {
        success: true,
        qualities: response.data.qualities || response.data,
        source: 'anicli'
      };

      // Кэшируем результат
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
  }

  /**
   * Получение доступных озвучек
   * @param {Object} req - объект запроса Express
   * @param {Object} res - объект ответа Express
   * @returns {Promise<void>}
   */
  async getAvailableVoices(req, res) {
    const { anime_id, episode } = req.query;
    const cacheKey = `voices:${anime_id}:${episode}`;

    try {
      if (!anime_id || !episode) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Параметры anime_id и episode обязательны'
          }
        });
      }

      // Проверяем кэш
      const cached = await get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      // Получаем данные об озвучках через AniLiberty API
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
              name: voice.name || `Озвучка ${index + 1}`,
              language: voice.language || 'ru',
              type: voice.type || 'dub',
              quality: voice.quality || 'medium',
              studio: voice.studio || 'Unknown',
              description: voice.description || ''
            })),
            source: 'aniliberty'
          };

          // Кэшируем результат
          await set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL);
          return res.json(result);
        }
      } catch (pythonError) {
        console.log('Python service voices failed:', pythonError.message);
      }

      // Fallback - возвращаем стандартные озвучки
      const fallbackVoices = [
        {
          id: 'original',
          name: 'Только оригинал',
          language: 'ja',
          type: 'original',
          quality: 'high',
          studio: 'Original',
          description: 'Оригинальная японская озвучка'
        },
        {
          id: 'anilibria',
          name: 'AniLibria',
          language: 'ru',
          type: 'dub',
          quality: 'high',
          studio: 'AniLibria',
          description: 'Русская озвучка от AniLibria'
        }
      ];

      const result = {
        success: true,
        voices: fallbackVoices,
        source: 'fallback'
      };

      // Кэшируем результат
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
  }

  /**
   * Получение субтитров
   * @param {Object} req - объект запроса Express
   * @param {Object} res - объект ответа Express
   * @returns {Promise<void>}
   */
  async getSubtitles(req, res) {
    const { anime_id, episode, language = 'ru' } = req.query;
    const cacheKey = `subtitles:${anime_id}:${episode}:${language}`;

    try {
      if (!anime_id || !episode) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Параметры anime_id и episode обязательны'
          }
        });
      }

      // Проверяем кэш
      const cached = await get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      // Получаем субтитры через AniLiberty API
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

          // Кэшируем результат
          await set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL);
          return res.json(result);
        }
      } catch (pythonError) {
        console.log('Python service subtitles failed:', pythonError.message);
      }

      // Fallback - возвращаем пустой массив
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
  }

  /**
   * Проверка доступности видео
   * @param {Object} req - объект запроса Express
   * @param {Object} res - объект ответа Express
   * @returns {Promise<void>}
   */
  async checkVideoAvailability(req, res) {
    const { anime_id, episode } = req.query;
    const cacheKey = `video-availability:${anime_id}:${episode}`;

    try {
      if (!anime_id || !episode) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Параметры anime_id и episode обязательны'
          }
        });
      }

      // Проверяем кэш
      const cached = await get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      const response = await axios.get(`${ANICLI_API_URL}/check-availability`, {
        params: { anime_id, episode }
      });

      // Кэшируем результат
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
  }

  /**
   * Обработчик получения видео (альтернативный метод)
   * @param {Object} req - объект запроса Express
   * @param {Object} res - объект ответа Express
   * @returns {Promise<void>}
   */
  async getVideoHandler(req, res) {
    const { anime_id, episode } = req.query;

    try {
      if (!anime_id || !episode) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Параметры anime_id и episode обязательны'
          }
        });
      }

      // Запрос к Python-микросервису
      const response = await axios.get('http://anicli_api:8000/video', {
        params: { anime_id, episode },
        responseType: 'stream'
      });

      // Пересылка видео потока
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
  }

  /**
   * Проверка прав доступа к видео
   * @param {string} userId - ID пользователя
   * @param {string} animeId - ID аниме
   * @returns {Promise<boolean>} - результат проверки доступа
   */
  async checkVideoAccess(userId, animeId) {
    // Здесь реализуйте проверку прав доступа к видео
    // Например, проверка подписки, возрастных ограничений и т.д.
    return true; // Заглушка
  }
}

export default new VideoController();