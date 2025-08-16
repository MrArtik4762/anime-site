const { redisWithFallback, testConnection } = require('../config/redis');
const { logger } = require('../utils/logger');

class CacheService {
  constructor() {
    this.cachePrefix = 'anime:';
    this.defaultTTL = {
      // Время жизни для разных типов данных в секундах
      popular: 1800,      // 30 минут
      new: 600,           // 10 минут
      catalog: 600,       // 10 минут
      search: 300,        // 5 минут
      health: 300,        // 5 минут
      anime: 3600,        // 1 час
      episode: 1800,      // 30 минут
      user: 900,          // 15 минут
      session: 1800,      // 30 минут
      static: 300         // 5 минут для статичных ответов
    };
  }

  /**
   * Сгенерировать полный ключ кэша с префиксом
   * @param {string} key - Базовый ключ
   * @param {string} prefix - Дополнительный префикс
   * @returns {string} - Полный ключ кэша
   */
  generateKey(key, prefix = '') {
    return `${this.cachePrefix}${prefix}${key}`;
  }

  /**
   * Получить данные из кэша
   * @param {string} key - Ключ кэша
   * @param {string} prefix - Префикс ключа
   * @returns {Promise<any>} - Закэшированные данные или null
   */
  async get(key, prefix = '') {
    try {
      const fullKey = this.generateKey(key, prefix);
      const data = await redisWithFallback.get(fullKey);
      
      if (data) {
        logger.debug(`Cache hit for key: ${fullKey}`);
        return data;
      }
      
      logger.debug(`Cache miss for key: ${fullKey}`);
      return null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Установить данные в кэш
   * @param {string} key - Ключ кэша
   * @param {any} value - Значение для кэширования
   * @param {string} prefix - Префикс ключа
   * @param {number} ttl - Время жизни в секундах
   * @returns {Promise<boolean>} - Успешность операции
   */
  async set(key, value, prefix = '', ttl = null) {
    try {
      const fullKey = this.generateKey(key, prefix);
      const effectiveTTL = ttl || this.defaultTTL[prefix] || this.defaultTTL.catalog;
      
      await redisWithFallback.set(fullKey, value, effectiveTTL);
      logger.debug(`Value cached with key: ${fullKey}, TTL: ${effectiveTTL}s`);
      
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Удалить данные из кэша
   * @param {string} key - Ключ кэша
   * @param {string} prefix - Префикс ключа
   * @returns {Promise<boolean>} - Успешность операции
   */
  async delete(key, prefix = '') {
    try {
      const fullKey = this.generateKey(key, prefix);
      await redisWithFallback.del(fullKey);
      logger.debug(`Key deleted from cache: ${fullKey}`);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Очистить все ключи с определенным префиксом
   * @param {string} prefix - Префикс ключа
   * @returns {Promise<boolean>} - Успешность операции
   */
  async clearByPrefix(prefix) {
    try {
      const fullPrefix = this.generateKey('', prefix);
      
      // Для Redis нужно использовать скрипт для удаления по шаблону
      // Но в fallback кэше мы можем просто очистить все
      await redisWithFallback.flushdb();
      
      logger.debug(`Cache cleared for prefix: ${fullPrefix}`);
      return true;
    } catch (error) {
      logger.error(`Cache clear error for prefix ${prefix}:`, error);
      return false;
    }
  }

  /**
   * Очистить весь кэш
   * @returns {Promise<boolean>} - Успешность операции
   */
  async clear() {
    try {
      await redisWithFallback.flushdb();
      logger.info('Entire cache cleared');
      return true;
    } catch (error) {
      logger.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Получить TTL для ключа
   * @param {string} key - Ключ кэша
   * @param {string} prefix - Префикс ключа
   * @returns {Promise<number>} - Время жизни в секундах
   */
  async getTTL(key, prefix = '') {
    try {
      const fullKey = this.generateKey(key, prefix);
      const ttl = await redisWithFallback.ttl(fullKey);
      return ttl;
    } catch (error) {
      logger.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Установить TTL для ключа
   * @param {string} key - Ключ кэша
   * @param {number} ttl - Время жизни в секундах
   * @param {string} prefix - Префикс ключа
   * @returns {Promise<boolean>} - Успешность операции
   */
  async setTTL(key, ttl, prefix = '') {
    try {
      const fullKey = this.generateKey(key, prefix);
      await redisWithFallback.expire(fullKey, ttl);
      logger.debug(`TTL set for key: ${fullKey}, TTL: ${ttl}s`);
      return true;
    } catch (error) {
      logger.error(`Cache setTTL error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Кэшировать популярные аниме
   * @param {Array} animeList - Список популярных аниме
   * @returns {Promise<boolean>} - Успешность операции
   */
  async cachePopularAnime(animeList) {
    return await this.set('popular', animeList, 'popular:', this.defaultTTL.popular);
  }

  /**
   * Получить популярные аниме из кэша
   * @returns {Promise<Array|null>} - Список популярных аниме или null
   */
  async getPopularAnime() {
    return await this.get('popular', 'popular:');
  }

  /**
   * Кэшировать новые аниме
   * @param {Array} animeList - Список новых аниме
   * @returns {Promise<boolean>} - Успешность операции
   */
  async cacheNewAnime(animeList) {
    return await this.set('new', animeList, 'new:', this.defaultTTL.new);
  }

  /**
   * Получить новые аниме из кэша
   * @returns {Promise<Array|null>} - Список новых аниме или null
   */
  async getNewAnime() {
    return await this.get('new', 'new:');
  }

  /**
   * Кэшировать каталог аниме
   * @param {Array} catalog - Каталог аниме
   * @param {string} page - Номер страницы
   * @returns {Promise<boolean>} - Успешность операции
   */
  async cacheCatalog(catalog, page = '1') {
    return await this.set(`catalog:${page}`, catalog, 'catalog:', this.defaultTTL.catalog);
  }

  /**
   * Получить каталог аниме из кэша
   * @param {string} page - Номер страницы
   * @returns {Promise<Array|null>} - Каталог аниме или null
   */
  async getCatalog(page = '1') {
    return await this.get(`catalog:${page}`, 'catalog:');
  }

  /**
   * Кэшировать результат поиска
   * @param {Array} results - Результаты поиска
   * @param {string} query - Поисковый запрос
   * @returns {Promise<boolean>} - Успешность операции
   */
  async cacheSearch(results, query) {
    return await this.set(`search:${query}`, results, 'search:', this.defaultTTL.search);
  }

  /**
   * Получить результаты поиска из кэша
   * @param {string} query - Поисковый запрос
   * @returns {Promise<Array|null>} - Результаты поиска или null
   */
  async getSearch(query) {
    return await this.get(`search:${query}`, 'search:');
  }

  /**
   * Кэшировать информацию об аниме
   * @param {Object} anime - Информация об аниме
   * @param {string} animeId - ID аниме
   * @returns {Promise<boolean>} - Успешность операции
   */
  async cacheAnime(anime, animeId) {
    return await this.set(`anime:${animeId}`, anime, 'anime:', this.defaultTTL.anime);
  }

  /**
   * Получить информацию об аниме из кэша
   * @param {string} animeId - ID аниме
   * @returns {Promise<Object|null>} - Информация об аниме или null
   */
  async getAnime(animeId) {
    return await this.get(`anime:${animeId}`, 'anime:');
  }

  /**
   * Кэшировать эпизоды аниме
   * @param {Array} episodes - Список эпизодов
   * @param {string} animeId - ID аниме
   * @returns {Promise<boolean>} - Успешность операции
   */
  async cacheEpisodes(episodes, animeId) {
    return await this.set(`episodes:${animeId}`, episodes, 'episode:', this.defaultTTL.episode);
  }

  /**
   * Получить эпизоды аниме из кэша
   * @param {string} animeId - ID аниме
   * @returns {Promise<Array|null>} - Список эпизодов или null
   */
  async getEpisodes(animeId) {
    return await this.get(`episodes:${animeId}`, 'episode:');
  }

  /**
   * Кэшировать health check
   * @param {Object} healthData - Данные health check
   * @returns {Promise<boolean>} - Успешность операции
   */
  async cacheHealthCheck(healthData) {
    return await this.set('health', healthData, 'health:', this.defaultTTL.health);
  }

  /**
   * Получить health check из кэша
   * @returns {Promise<Object|null>} - Данные health check или null
   */
  async getHealthCheck() {
    return await this.get('health', 'health:');
  }

  /**
   * Кэшировать статичный ответ
   * @param {string} key - Уникальный ключ ответа
   * @param {any} response - Ответ для кэширования
   * @returns {Promise<boolean>} - Успешность операции
   */
  async cacheStaticResponse(key, response) {
    return await this.set(`static:${key}`, response, 'static:', this.defaultTTL.static);
  }

  /**
   * Получить статичный ответ из кэша
   * @param {string} key - Уникальный ключ ответа
   * @returns {Promise<any|null>} - Закэшированный ответ или null
   */
  async getStaticResponse(key) {
    return await this.get(`static:${key}`, 'static:');
  }

  /**
   * Получить статистику кэша
   * @returns {Promise<Object>} - Статистика кэша
   */
  async getStats() {
    try {
      const stats = await redisWithFallback.info();
      return {
        redis: stats.redis || 'disconnected',
        fallback: stats.fallback,
        status: stats.status
      };
    } catch (error) {
      logger.error('Cache stats error:', error);
      return {
        redis: 'error',
        fallback: {},
        status: 'error'
      };
    }
  }

  /**
   * Проверить соединение с Redis
   * @returns {Promise<Object>} - Результат проверки соединения
   */
  async testConnection() {
    return await testConnection();
  }

  /**
   * Инвалидирует кэш для определенного аниме
   * @param {string} animeId - ID аниме
   * @returns {Promise<boolean>} - Успешность операции
   */
  async invalidateAnimeCache(animeId) {
    try {
      const keysToDelete = [
        this.generateKey(`anime:${animeId}`, 'anime:'),
        this.generateKey(`episodes:${animeId}`, 'episode:')
      ];

      for (const key of keysToDelete) {
        await redisWithFallback.del(key);
      }

      logger.debug(`Cache invalidated for anime: ${animeId}`);
      return true;
    } catch (error) {
      logger.error(`Cache invalidation error for anime ${animeId}:`, error);
      return false;
    }
  }

  /**
   * Инвалидирует кэш для всех аниме определенного типа
   * @param {string} type - Тип аниме (popular, new, catalog)
   * @returns {Promise<boolean>} - Успешность операции
   */
  async invalidateTypeCache(type) {
    try {
      await this.clearByPrefix(type);
      logger.debug(`Cache invalidated for type: ${type}`);
      return true;
    } catch (error) {
      logger.error(`Cache invalidation error for type ${type}:`, error);
      return false;
    }
  }
}

// Создаем singleton экземпляр
const cacheService = new CacheService();

module.exports = cacheService;