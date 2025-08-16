const Anime = require('../models/Anime');
const cacheService = require('./cacheService');
const { redisWithFallback } = require('../config/redis');
const { logger } = require('../utils/logger');
const moment = require('moment');

class AnalyticsService {
  constructor() {
    this.cachePrefix = 'analytics:';
    this.defaultTTL = {
      popular: 900,      // 15 минут
      new: 300,          // 5 минут
      trending: 600,     // 10 минут
      weekly: 3600       // 1 час
    };
  }

  /**
   * Обновить просмотры для аниме
   * @param {string} animeId - ID аниме
   * @param {number} views - Количество просмотров
   * @param {string} userId - ID пользователя (опционально)
   * @returns {Promise<Object>} - Результат обновления
   */
  async updateViews(animeId, views = 1, userId = null) {
    try {
      const anime = await Anime.findById(animeId);
      if (!anime) {
        throw new Error('Anime not found');
      }

      // Обновляем общие просмотры
      anime.statistics.totalViews += views;
      
      // Обновляем еженедельные просмотры
      anime.statistics.weeklyViews += views;

      // Обновляем индекс популярности (трендовость)
      // Формула: (weeklyViews * 0.7) + (totalViews * 0.3) + (rating.score * 10)
      const trendingScore = Math.round(
        (anime.statistics.weeklyViews * 0.7) + 
        (anime.statistics.totalViews * 0.3) + 
        ((anime.rating.score || 0) * 10)
      );
      
      anime.trendingScore = trendingScore;

      // Обновляем lastUpdated
      anime.lastUpdated = new Date();

      await anime.save();

      // Инвалидируем кэш для этого аниме
      await cacheService.invalidateAnimeCache(animeId);

      logger.info(`Views updated for anime ${animeId}: +${views} views, total: ${anime.statistics.totalViews}`);

      return {
        success: true,
        animeId,
        totalViews: anime.statistics.totalViews,
        weeklyViews: anime.statistics.weeklyViews,
        trendingScore: anime.trendingScore
      };

    } catch (error) {
      logger.error(`Error updating views for anime ${animeId}:`, error);
      throw error;
    }
  }

  /**
   * Агрегировать популярные аниме на основе weeklyViews
   * @param {number} limit - Лимит результатов
   * @param {boolean} useCache - Использовать кэш
   * @returns {Promise<Array>} - Список популярных аниме
   */
  async getPopularAnime(limit = 20, useCache = true) {
    try {
      const cacheKey = `popular:${limit}`;
      
      if (useCache) {
        const cached = await cacheService.get(cacheKey, this.cachePrefix);
        if (cached) {
          logger.debug(`Cache hit for popular anime: ${cacheKey}`);
          return cached;
        }
      }

      // Агрегация по weeklyViews за последнюю неделю
      const oneWeekAgo = moment().subtract(1, 'week').toDate();
      
      const popularAnime = await Anime.find({
        isActive: true,
        approved: true,
        lastUpdated: { $gte: oneWeekAgo }
      })
      .sort({ 'statistics.weeklyViews': -1, trendingScore: -1 })
      .limit(limit)
      .select('title images statistics weeklyViews trendingScore rating')
      .lean();

      logger.info(`Aggregated ${popularAnime.length} popular anime`);

      // Кэшируем результат
      await cacheService.set(cacheKey, popularAnime, this.cachePrefix, this.defaultTTL.popular);

      return popularAnime;

    } catch (error) {
      logger.error('Error getting popular anime:', error);
      throw error;
    }
  }

  /**
   * Агрегировать новые аниме на основе даты добавления
   * @param {number} limit - Лимит результатов
   * @param {number} days - За последние N дней
   * @param {boolean} useCache - Использовать кэш
   * @returns {Promise<Array>} - Список новых аниме
   */
  async getNewAnime(limit = 20, days = 7, useCache = true) {
    try {
      const cacheKey = `new:${limit}:${days}`;
      
      if (useCache) {
        const cached = await cacheService.get(cacheKey, this.cachePrefix);
        if (cached) {
          logger.debug(`Cache hit for new anime: ${cacheKey}`);
          return cached;
        }
      }

      const cutoffDate = moment().subtract(days, 'days').toDate();
      
      const newAnime = await Anime.find({
        isActive: true,
        approved: true,
        createdAt: { $gte: cutoffDate }
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title images statistics createdAt trendingScore rating')
      .lean();

      logger.info(`Aggregated ${newAnime.length} new anime from last ${days} days`);

      // Кэшируем результат
      await cacheService.set(cacheKey, newAnime, this.cachePrefix, this.defaultTTL.new);

      return newAnime;

    } catch (error) {
      logger.error('Error getting new anime:', error);
      throw error;
    }
  }

  /**
   * Агрегировать трендовые аниме на основе trendingScore
   * @param {number} limit - Лимит результатов
   * @param {boolean} useCache - Использовать кэш
   * @returns {Promise<Array>} - Список трендовых аниме
   */
  async getTrendingAnime(limit = 20, useCache = true) {
    try {
      const cacheKey = `trending:${limit}`;
      
      if (useCache) {
        const cached = await cacheService.get(cacheKey, this.cachePrefix);
        if (cached) {
          logger.debug(`Cache hit for trending anime: ${cacheKey}`);
          return cached;
        }
      }

      const trendingAnime = await Anime.find({
        isActive: true,
        approved: true,
        trendingScore: { $gt: 0 }
      })
      .sort({ trendingScore: -1 })
      .limit(limit)
      .select('title images statistics trendingScore rating weeklyViews totalViews')
      .lean();

      logger.info(`Aggregated ${trendingAnime.length} trending anime`);

      // Кэшируем результат
      await cacheService.set(cacheKey, trendingAnime, this.cachePrefix, this.defaultTTL.trending);

      return trendingAnime;

    } catch (error) {
      logger.error('Error getting trending anime:', error);
      throw error;
    }
  }

  /**
   * Сбросить еженедельную статистику просмотров
   * @returns {Promise<Object>} - Результат операции
   */
  async resetWeeklyViews() {
    try {
      const result = await Anime.updateMany(
        {},
        { 
          $set: { 
            'statistics.weeklyViews': 0,
            'statistics.totalViews': 0,
            trendingScore: 0
          } 
        }
      );

      logger.info(`Reset weekly views for ${result.modifiedCount} anime`);

      // Инвалидируем все кэши аналитики
      await this.invalidateAllCaches();

      return {
        success: true,
        modifiedCount: result.modifiedCount
      };

    } catch (error) {
      logger.error('Error resetting weekly views:', error);
      throw error;
    }
  }

  /**
   * Получить статистику аналитики
   * @returns {Promise<Object>} - Статистика
   */
  async getAnalyticsStats() {
    try {
      const totalAnime = await Anime.countDocuments({ isActive: true, approved: true });
      const totalViews = await Anime.aggregate([
        { $group: { _id: null, total: { $sum: '$statistics.totalViews' } } }
      ]);
      
      const totalWeeklyViews = await Anime.aggregate([
        { $group: { _id: null, total: { $sum: '$statistics.weeklyViews' } } }
      ]);

      const avgTrendingScore = await Anime.aggregate([
        { $match: { trendingScore: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$trendingScore' } } }
      ]);

      const topViewed = await Anime.find({
        isActive: true,
        approved: true
      })
      .sort({ 'statistics.totalViews': -1 })
      .limit(5)
      .select('title statistics.totalViews');

      return {
        totalAnime,
        totalViews: totalViews[0]?.total || 0,
        totalWeeklyViews: totalWeeklyViews[0]?.total || 0,
        avgTrendingScore: avgTrendingScore[0]?.avg || 0,
        topViewed,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error getting analytics stats:', error);
      throw error;
    }
  }

  /**
   * Инвалидирует все кэши аналитики
   * @returns {Promise<boolean>} - Успешность операции
   */
  async invalidateAllCaches() {
    try {
      // Удаляем все ключи с префиксом аналитики
      const keys = await redisWithFallback.keys(`${this.cachePrefix}*`);
      
      if (keys.length > 0) {
        await redisWithFallback.del(...keys);
        logger.info(`Invalidated ${keys.length} analytics cache keys`);
      }

      return true;

    } catch (error) {
      logger.error('Error invalidating analytics caches:', error);
      return false;
    }
  }

  /**
   * Получить аниме с наибольшим приростом просмотров за неделю
   * @param {number} limit - Лимит результатов
   * @returns {Promise<Array>} - Список аниме с приростом
   */
  async getGrowingAnime(limit = 10) {
    try {
      // Для простоты используем weeklyViews как индикатор роста
      // В реальной системе здесь был бы сложный расчет прироста
      const growingAnime = await Anime.find({
        isActive: true,
        approved: true,
        'statistics.weeklyViews': { $gt: 0 }
      })
      .sort({ 'statistics.weeklyViews': -1 })
      .limit(limit)
      .select('title images statistics.weeklyViews trendingScore')
      .lean();

      return growingAnime;

    } catch (error) {
      logger.error('Error getting growing anime:', error);
      throw error;
    }
  }

  /**
   * Закешировать данные
   * @param {string} key - Ключ кеша
   * @param {any} data - Данные для кеширования
   * @param {number} ttl - Время жизни в секундах
   * @returns {Promise<boolean>} - Успешность операции
   */
  async cacheData(key, data, ttl = 300) {
    try {
      const fullKey = `${this.cachePrefix}${key}`;
      await cacheService.set(fullKey, data, this.cachePrefix, ttl);
      logger.debug(`Data cached with key: ${fullKey}`);
      return true;
    } catch (error) {
      logger.error(`Error caching data with key ${key}:`, error);
      return false;
    }
  }

  /**
   * Получить данные из кеша
   * @param {string} key - Ключ кеша
   * @returns {Promise<any|null>} - Данные из кеша или null
   */
  async getCachedData(key) {
    try {
      const fullKey = `${this.cachePrefix}${key}`;
      const data = await cacheService.get(fullKey, this.cachePrefix);
      logger.debug(`Cache data retrieved for key: ${fullKey}`);
      return data;
    } catch (error) {
      logger.error(`Error getting cached data for key ${key}:`, error);
      return null;
    }
  }
}

// Создаем singleton экземпляр
const analyticsService = new AnalyticsService();

module.exports = analyticsService;