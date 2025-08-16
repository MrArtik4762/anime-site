const { logger } = require('../config/logger');
const cacheService = require('../services/cacheService');

/**
 * Middleware для кэширования статичных ответов
 * @param {Object} options - Опции кэширования
 * @param {number} options.ttl - Время жизни кэша в секундах
 * @param {string} options.prefix - Префикс для ключей кэша
 * @param {Array} options.excludePaths - Пути, которые нужно исключить из кэширования
 * @param {Array} options.methods - HTTP методы, которые нужно кэшировать
 * @returns {Function} Middleware функция
 */
const cacheMiddleware = (options = {}) => {
  const {
    ttl = 300, // 5 минут по умолчанию
    prefix = 'static',
    excludePaths = ['/health', '/metrics'],
    methods = ['GET']
  } = options;

  return async (req, res, next) => {
    // Пропускаем не GET запросы
    if (!methods.includes(req.method)) {
      return next();
    }

    // Пропускаем исключенные пути
    if (excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Пропускаем не статичные ответы
    if (res.statusCode !== 200) {
      return next();
    }

    // Формируем ключ кэша на основе пути и параметров запроса
    const cacheKey = `${prefix}:${req.originalUrl}${JSON.stringify(req.query)}`;
    
    try {
      // Проверяем наличие в кэше
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        logger.debug(`Cache hit for key: ${cacheKey}`);
        return res.json(cachedData);
      }

      // Сохраняем оригинальный метод json
      const originalJson = res.json;
      
      // Перехватываем вызов res.json
      res.json = function(data) {
        // Сохраняем ответ в кэш
        cacheService.set(cacheKey, data, ttl)
          .then(() => logger.debug(`Cache set for key: ${cacheKey} with TTL: ${ttl}s`))
          .catch(err => logger.warn(`Failed to cache data for key: ${cacheKey}`, err));
        
        // Вызываем оригинальный метод
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Специализированный middleware для кэширования популярных и новых аниме
 */
const cachePopularAnime = cacheMiddleware({
  ttl: 300, // 5 минут
  prefix: 'popular',
  methods: ['GET'],
  excludePaths: ['/health', '/metrics']
});

/**
 * Специализированный middleware для кэширования каталога
 */
const cacheCatalog = cacheMiddleware({
  ttl: 600, // 10 минут
  prefix: 'catalog',
  methods: ['GET'],
  excludePaths: ['/health', '/metrics']
});

/**
 * Специализированный middleware для кэширования поисковых запросов
 */
const cacheSearch = cacheMiddleware({
  ttl: 180, // 3 минуты
  prefix: 'search',
  methods: ['GET'],
  excludePaths: ['/health', '/metrics']
});

module.exports = {
  cacheMiddleware,
  cachePopularAnime,
  cacheCatalog,
  cacheSearch
};