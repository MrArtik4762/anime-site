const axios = require('axios');
const SourcesFetcher = require('../services/sourcesFetcher');
const EpisodeSource = require('../models/EpisodeSource');
const Anime = require('../models/Anime');
const logger = require('../utils/logger');

// Простой кэш в памяти для результатов API
const sourcesCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

/**
 * Получение данных из кэша
 */
function getFromCache(key) {
  const cached = sourcesCache.get(key);
  if (!cached) return null;
  
  // Проверяем истекло ли время жизни кэша
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    sourcesCache.delete(key);
    return null;
  }
  
  return cached.data;
}

/**
 * Сохранение данных в кэш
 */
function setToCache(key, data) {
  sourcesCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

/**
 * Очистка устаревших записей кэша
 */
function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of sourcesCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      sourcesCache.delete(key);
    }
  }
}

// Регулярная очистка кэша
setInterval(cleanupCache, 60 * 1000); // Каждую минуту

/**
 * Контроллер для работы с источниками эпизодов
 */
class SourcesController {
  /**
   * Получение источников эпизодов для аниме
   */
  static async getEpisodeSources(req, res) {
    try {
      const { animeId } = req.params;
      const { 
        providers = ['aniliberty', 'anilibria', 'shikimori', 'jikan'],
        enableRetry = true,
        forceRefresh = false
      } = req.query;

      if (!animeId) {
        return res.status(400).json({
          success: false,
          error: 'animeId обязателен'
        });
      }

      // Проверяем существует ли аниме
      const anime = await Anime.findById(animeId);
      if (!anime) {
        return res.status(404).json({
          success: false,
          error: 'Аниме не найдено'
        });
      }

      // Если не требуется принудительное обновление, проверяем существующие источники
      if (!forceRefresh) {
        const existingSources = await EpisodeSource.getActiveSources(animeId);
        if (existingSources.length > 0) {
          return res.json({
            success: true,
            data: existingSources,
            total: existingSources.length,
            fromCache: true,
            animeId
          });
        }
      }

      // Получаем новые источники
      const result = await SourcesFetcher.getEpisodeSources(animeId, {
        providers: providers.split(','),
        enableRetry: enableRetry === 'true'
      });

      res.json({
        success: true,
        data: result.sources,
        total: result.total,
        providers: result.providers,
        errors: result.errors,
        fromCache: false,
        animeId
      });

    } catch (error) {
      logger.error('Error in getEpisodeSources:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения источников эпизодов',
        details: error.message
      });
    }
  }

  /**
   * Получение лучших источников для эпизода
   */
  static async getBestSources(req, res) {
    try {
      const { animeId, episodeNumber } = req.params;

      if (!animeId || !episodeNumber) {
        return res.status(400).json({
          success: false,
          error: 'animeId и episodeNumber обязательны'
        });
      }

      const sources = await SourcesFetcher.getBestSources(animeId, parseInt(episodeNumber));

      res.json({
        success: true,
        data: sources,
        total: sources.length,
        animeId,
        episodeNumber
      });

    } catch (error) {
      logger.error('Error in getBestSources:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения лучших источников',
        details: error.message
      });
    }
  }

  /**
   * Получение активных источников для эпизода
   */
  static async getActiveSources(req, res) {
    try {
      const { animeId, episodeNumber } = req.params;

      if (!animeId || !episodeNumber) {
        return res.status(400).json({
          success: false,
          error: 'animeId и episodeNumber обязательны'
        });
      }

      const sources = await SourcesFetcher.getActiveSources(animeId, parseInt(episodeNumber));

      res.json({
        success: true,
        data: sources,
        total: sources.length,
        animeId,
        episodeNumber
      });

    } catch (error) {
      logger.error('Error in getActiveSources:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения активных источников',
        details: error.message
      });
    }
  }

  /**
   * Обновление статуса доступности источника
   */
  static async updateSourceAvailability(req, res) {
    try {
      const { sourceId } = req.params;
      const { isAvailable } = req.body;

      if (typeof isAvailable !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'isAvailable должно быть boolean'
        });
      }

      const source = await SourcesFetcher.updateSourceAvailability(sourceId, isAvailable);

      res.json({
        success: true,
        data: source.getSourceInfo(),
        message: `Источник ${isAvailable ? 'активирован' : 'деактивирован'}`
      });

    } catch (error) {
      logger.error('Error in updateSourceAvailability:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка обновления статуса источника',
        details: error.message
      });
    }
  }

  /**
   * Проверка статуса провайдеров
   */
  static async checkProvidersStatus(req, res) {
    try {
      const status = await SourcesFetcher.checkProvidersStatus();

      res.json({
        success: true,
        data: status,
        timestamp: new Date()
      });

    } catch (error) {
      logger.error('Error in checkProvidersStatus:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка проверки статуса провайдеров',
        details: error.message
      });
    }
  }

  /**
   * Массовое обновление источников для нескольких аниме
   */
  static async batchUpdateSources(req, res) {
    try {
      const { animeIds, providers = ['aniliberty', 'anilibria', 'shikimori', 'jikan'] } = req.body;

      if (!Array.isArray(animeIds) || animeIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'animeIds должен быть непустым массивом'
        });
      }

      const results = [];
      const errors = [];

      // Обрабатываем каждое аниме параллельно
      const promises = animeIds.map(async (animeId) => {
        try {
          const result = await SourcesFetcher.getEpisodeSources(animeId, {
            providers: providers.split(','),
            enableRetry: true
          });
          
          results.push({
            animeId,
            success: true,
            total: result.total,
            errors: result.errors
          });
        } catch (error) {
          errors.push({
            animeId,
            error: error.message
          });
          
          results.push({
            animeId,
            success: false,
            error: error.message
          });
        }
      });

      await Promise.all(promises);

      res.json({
        success: true,
        data: {
          totalProcessed: animeIds.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          results,
          errors
        },
        timestamp: new Date()
      });

    } catch (error) {
      logger.error('Error in batchUpdateSources:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка массового обновления источников',
        details: error.message
      });
    }
  }

  /**
   * Получение статистики по источникам
   */
  static async getSourcesStats(req, res) {
    try {
      const { animeId } = req.params;

      const stats = await EpisodeSource.aggregate([
        ...(animeId ? [{ $match: { animeId: animeId } }] : []),
        {
          $group: {
            _id: '$provider',
            total: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
            inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
            averagePriority: { $avg: '$priority' },
            qualities: { $push: '$quality' }
          }
        },
        {
          $project: {
            provider: '$_id',
            total: 1,
            active: 1,
            inactive: 1,
            averagePriority: { $round: ['$averagePriority', 2] },
            qualities: { $setUnion: '$qualities' },
            uptime: { $divide: ['$active', '$total'] }
          }
        }
      ]);

      // Общая статистика
      const totalStats = await EpisodeSource.aggregate([
        ...(animeId ? [{ $match: { animeId: animeId } }] : []),
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
            providers: { $addToSet: '$provider' },
            qualities: { $addToSet: '$quality' }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          byProvider: stats,
          total: totalStats[0] || { total: 0, active: 0, providers: [], qualities: [] },
          animeId
        },
        timestamp: new Date()
      });

    } catch (error) {
      logger.error('Error in getSourcesStats:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения статистики источников',
        details: error.message
      });
    }
  }

  /**
   * Очистка старых неактивных источников
   */
  static async cleanupOldSources(req, res) {
    try {
      const { days = 7 } = req.query;
      const threshold = new Date();
      threshold.setDate(threshold.getDate() - parseInt(days));

      const result = await EpisodeSource.updateMany(
        {
          lastChecked: { $lt: threshold },
          isActive: true
        },
        {
          isActive: false,
          updatedAt: new Date()
        }
      );

      logger.info(`Cleaned up ${result.modifiedCount} old inactive sources`);

      res.json({
        success: true,
        message: `Очищено ${result.modifiedCount} старых неактивных источников`,
        threshold,
        modifiedCount: result.modifiedCount
      });

    } catch (error) {
      logger.error('Error in cleanupOldSources:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка очистки старых источников',
        details: error.message
      });
    }
  }

  /**
   * Получение источников эпизода с проверкой доступности и priority sorting
   */
  static async getEpisodeSourcesWithStatus(req, res) {
    try {
      const { id: animeId, num: episodeNumber } = req.params;
      const {
        quality,
        limit = 20,
        checkAvailability = true,
        forceRefresh = false
      } = req.query;

      if (!animeId || !episodeNumber) {
        return res.status(400).json({
          success: false,
          error: 'animeId и episodeNumber обязательны'
        });
      }

      const episodeNum = parseInt(episodeNumber);
      if (isNaN(episodeNum) || episodeNum < 1) {
        return res.status(400).json({
          success: false,
          error: 'Номер эпизода должен быть положительным числом'
        });
      }

      // Формируем ключ для кэша
      const cacheKey = `anime:${animeId}:episode:${episodeNum}:quality:${quality || 'all'}:limit:${limit}:checkAvail:${checkAvailability}`;

      // Проверяем кэш если не требуется принудительное обновление
      if (forceRefresh !== 'true') {
        const cachedResult = getFromCache(cacheKey);
        if (cachedResult) {
          logger.info(`Returning cached result for ${cacheKey}`);
          return res.json({
            ...cachedResult,
            cached: true,
            timestamp: new Date()
          });
        }
      }

      // Проверяем существует ли аниме
      const anime = await Anime.findById(animeId);
      if (!anime) {
        return res.status(404).json({
          success: false,
          error: 'Аниме не найдено'
        });
      }

      // Формируем запрос для поиска источников
      const query = {
        animeId,
        episodeNumber: episodeNum,
        isActive: true
      };

      // Добавляем фильтрацию по качеству если указано
      if (quality) {
        query.quality = quality;
      }

      // Ищем источники в базе данных
      let sources = await EpisodeSource.find(query)
        .sort({ priority: 1, quality: -1 })
        .limit(parseInt(limit))
        .populate('anime', 'title images episodes year')
        .lean();

      // Если нет источников или требуется принудительное обновление
      if (sources.length === 0 || forceRefresh === 'true') {
        logger.info(`Fetching new sources for anime ${animeId}, episode ${episodeNum}`);
        
        // Получаем новые источники
        const fetchResult = await SourcesFetcher.getEpisodeSources(animeId, {
          enableRetry: true
        });

        // Фильтруем по эпизоду и качеству
        let newSources = fetchResult.sources.filter(source =>
          source.episodeNumber === episodeNum &&
          (!quality || source.quality === quality)
        );

        // Сортируем и ограничиваем
        newSources = newSources
          .sort((a, b) => a.priority - b.priority ||
            ({'360p':1,'480p':2,'720p':3,'1080p':4,'1440p':5,'2160p':6}[b.quality] || 0) -
            ({'360p':1,'480p':2,'720p':3,'1080p':4,'1440p':5,'2160p':6}[a.quality] || 0))
          .slice(0, parseInt(limit));

        sources = newSources;
      }

      // Проверяем доступность источников если требуется
      if (checkAvailability === 'true' && sources.length > 0) {
        logger.info(`Checking availability for ${sources.length} sources`);
        
        const sourcesWithStatus = await Promise.all(
          sources.map(async (source) => {
            try {
              const isAvailable = await this.checkSourceAvailability(source.sourceUrl);
              
              // Обновляем lastChecked и статус в базе данных
              await EpisodeSource.findByIdAndUpdate(
                source._id,
                {
                  lastChecked: new Date(),
                  isActive: isAvailable
                }
              );

              return {
                ...source,
                status: isAvailable ? 'available' : 'unavailable',
                lastChecked: new Date()
              };
            } catch (error) {
              logger.warn(`Failed to check availability for source ${source._id}:`, error.message);
              
              return {
                ...source,
                status: 'unavailable',
                lastChecked: new Date(),
                error: error.message
              };
            }
          })
        );

        // Фильтруем только доступные источники если они есть
        const availableSources = sourcesWithStatus.filter(s => s.status === 'available');
        sources = availableSources.length > 0 ? availableSources : sourcesWithStatus;
      }

      // Финальная сортировка и форматирование ответа
      const responseSources = sources.map(source => ({
        id: source._id,
        episode: source.episodeNumber,
        sourceUrl: source.sourceUrl,
        quality: source.quality,
        title: source.title,
        provider: source.provider,
        priority: source.priority,
        status: source.status || (source.isActive ? 'available' : 'unavailable'),
        lastChecked: source.lastChecked,
        createdAt: source.createdAt,
        updatedAt: source.updatedAt
      }));

      const responseData = {
        success: true,
        data: {
          episode: episodeNum,
          sources: responseSources
        },
        total: responseSources.length,
        animeId,
        episodeNumber: episodeNum,
        filters: {
          quality,
          limit,
          checkAvailability: checkAvailability === 'true',
          forceRefresh: forceRefresh === 'true'
        },
        timestamp: new Date()
      };

      // Сохраняем результат в кэш если не было принудительного обновления
      if (forceRefresh !== 'true') {
        setToCache(cacheKey, responseData);
        logger.info(`Cached result for ${cacheKey}`);
      }

      res.json(responseData);

    } catch (error) {
      logger.error('Error in getEpisodeSourcesWithStatus:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка получения источников эпизода',
        details: error.message
      });
    }
  }

  /**
   * Проверка доступности источника
   */
  static async checkSourceAvailability(url) {
    if (!url || url.trim() === '') {
      return false;
    }

    try {
      // Простой HEAD запрос для проверки доступности
      const response = await axios.head(url, {
        timeout: 10000,
        validateStatus: (status) => status < 500 // Принимаем все статусы кроме 5xx
      });

      // Проверяем успешные статусы (200-299) и редиректы (300-399)
      return response.status >= 200 && response.status < 400;
    } catch (error) {
      // Если ошибка таймаута или сетевая проблема, считаем источник недоступным
      if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
        return false;
      }
      
      // Для других ошибок возвращаем false
      return false;
    }
  }
}

module.exports = SourcesController;