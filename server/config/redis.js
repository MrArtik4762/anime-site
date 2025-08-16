const Redis = require('ioredis');
const NodeCache = require('node-cache');
const { logger } = require('../utils/logger');

// Проверяем, доступен ли Redis
const redisAvailable = process.env.REDIS_DISABLED !== 'true' && process.env.REDIS_ENABLED !== 'false';

// Конфигурация Redis
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  connectTimeout: 5000,
  commandTimeout: 5000,
  enableReadyCheck: true,
  autoResubscribe: true,
  autoResendUnfulfilledCommands: true
};

// Создаем экземпляр Redis клиента (только если Redis доступен)
const redisClient = redisAvailable ? new Redis(redisConfig) : null;

// Создаем fallback cache на основе NodeCache
const fallbackCache = new NodeCache({
  stdTTL: 600, // 10 минут по умолчанию
  checkperiod: 60,
  useClones: false,
  deleteOnExpire: true
});

// Обработка ошибок Redis (только если Redis доступен)
if (redisClient) {
  redisClient.on('error', (error) => {
    logger.error('Redis connection error:', error);
  });

  redisClient.on('connect', () => {
    logger.info('Redis connected successfully');
  });

  redisClient.on('ready', () => {
    logger.info('Redis client is ready');
  });

  redisClient.on('reconnecting', () => {
    logger.warn('Redis client is reconnecting...');
  });

  redisClient.on('end', () => {
    logger.warn('Redis client connection ended');
  });
} else {
  logger.info('Redis is disabled, using NodeCache fallback only');
}

// Функция для тестирования соединения
const testConnection = async () => {
  if (!redisClient) {
    logger.info('Redis is disabled, using NodeCache fallback only');
    return {
      status: 'disabled',
      message: 'Redis is disabled, using NodeCache fallback',
      fallback: {
        keys: fallbackCache.keys().length,
        hits: fallbackCache.getStats().hits || 0,
        misses: fallbackCache.getStats().misses || 0,
        ksize: fallbackCache.getStats().vsize || 0
      }
    };
  }
  
  try {
    const pingResult = await redisClient.ping();
    logger.info('Redis connection test successful');
    return { status: 'connected', ping: pingResult };
  } catch (error) {
    logger.error('Redis connection test failed:', error);
    return {
      status: 'disconnected',
      error: error.message,
      fallback: {
        keys: fallbackCache.keys().length,
        hits: fallbackCache.getStats().hits || 0,
        misses: fallbackCache.getStats().misses || 0,
        ksize: fallbackCache.getStats().vsize || 0
      }
    };
  }
};

// Оборачиваем Redis методы с fallback на NodeCache
const redisWithFallback = {
  // Получение значения по ключу
  get: async (key) => {
    try {
      if (!redisClient) {
        // Если Redis отключен, используем только fallback
        const fallbackResult = fallbackCache.get(key);
        if (fallbackResult !== undefined) {
          logger.debug(`Fallback cache hit for key: ${key}`);
          return fallbackResult;
        }
        logger.debug(`Fallback cache miss for key: ${key}`);
        return null;
      }
      
      const result = await redisClient.get(key);
      if (result !== null) {
        logger.debug(`Redis cache hit for key: ${key}`);
        return JSON.parse(result);
      }
      logger.debug(`Redis cache miss for key: ${key}`);
      
      // Fallback на NodeCache
      const fallbackResult = fallbackCache.get(key);
      if (fallbackResult !== undefined) {
        logger.debug(`Fallback cache hit for key: ${key}`);
        return fallbackResult;
      }
      
      return null;
    } catch (error) {
      logger.warn(`Redis get error for key ${key}, using fallback:`, error.message);
      return fallbackCache.get(key) || null;
    }
  },
  
  // Установка значения по ключу с TTL
  set: async (key, value, ttl = null) => {
    try {
      if (!redisClient) {
        // Если Redis отключен, используем только fallback
        if (ttl) {
          fallbackCache.set(key, value, ttl);
        } else {
          fallbackCache.set(key, value);
        }
        logger.debug(`Value cached in fallback with key: ${key}, TTL: ${ttl || 'none'}`);
        return 'OK_FALLBACK';
      }
      
      const serializedValue = JSON.stringify(value);
      
      if (ttl) {
        await redisClient.set(key, serializedValue, 'EX', ttl);
      } else {
        await redisClient.set(key, serializedValue);
      }
      
      // Сохраняем в fallback кэш
      if (ttl) {
        fallbackCache.set(key, value, ttl);
      } else {
        fallbackCache.set(key, value);
      }
      
      logger.debug(`Value cached in Redis with key: ${key}, TTL: ${ttl || 'none'}`);
      return 'OK';
    } catch (error) {
      logger.warn(`Redis set error for key ${key}, using fallback:`, error.message);
      
      // Fallback на NodeCache
      if (ttl) {
        fallbackCache.set(key, value, ttl);
      } else {
        fallbackCache.set(key, value);
      }
      
      return 'OK_FALLBACK';
    }
  },
  
  // Удаление ключа
  del: async (key) => {
    try {
      if (!redisClient) {
        // Если Redis отключен, используем только fallback
        const fallbackResult = fallbackCache.del(key);
        logger.debug(`Key deleted from fallback cache: ${key}`);
        return fallbackResult > 0 ? 1 : 0;
      }
      
      const result = await redisClient.del(key);
      fallbackCache.del(key);
      logger.debug(`Key deleted from Redis: ${key}`);
      return result;
    } catch (error) {
      logger.warn(`Redis delete error for key ${key}, using fallback:`, error.message);
      const fallbackResult = fallbackCache.del(key);
      return fallbackResult > 0 ? 1 : 0;
    }
  },
  
  // Проверка существования ключа
  exists: async (key) => {
    try {
      if (!redisClient) {
        // Если Redis отключен, используем только fallback
        return fallbackCache.has(key) ? 1 : 0;
      }
      
      const result = await redisClient.exists(key);
      return result;
    } catch (error) {
      logger.warn(`Redis exists error for key ${key}, using fallback:`, error.message);
      return fallbackCache.has(key) ? 1 : 0;
    }
  },
  
  // Установка TTL для ключа
  expire: async (key, ttl) => {
    try {
      if (!redisClient) {
        // Если Redis отключен, используем только fallback
        fallbackCache.ttl(key, ttl);
        logger.debug(`TTL set for fallback key: ${key}, TTL: ${ttl}`);
        return 1;
      }
      
      const result = await redisClient.expire(key, ttl);
      fallbackCache.ttl(key, ttl);
      return result;
    } catch (error) {
      logger.warn(`Redis expire error for key ${key}, using fallback:`, error.message);
      fallbackCache.ttl(key, ttl);
      return 1;
    }
  },
  
  // Получение TTL ключа
  ttl: async (key) => {
    try {
      if (!redisClient) {
        // Если Redis отключен, используем только fallback
        return fallbackCache.getTtl(key) || -1;
      }
      
      const result = await redisClient.ttl(key);
      return result;
    } catch (error) {
      logger.warn(`Redis TTL error for key ${key}, using fallback:`, error.message);
      return fallbackCache.getTtl(key) || -1;
    }
  },
  
  // Очистка всех ключей
  flushdb: async () => {
    try {
      if (!redisClient) {
        // Если Redis отключен, используем только fallback
        fallbackCache.flushAll();
        logger.info('Fallback cache flushed');
        return 'OK_FALLBACK';
      }
      
      await redisClient.flushdb();
      fallbackCache.flushAll();
      logger.info('Redis database flushed');
      return 'OK';
    } catch (error) {
      logger.warn('Redis flushdb error, using fallback:', error.message);
      fallbackCache.flushAll();
      return 'OK_FALLBACK';
    }
  },
  
  // Получение статистики
  info: async () => {
    try {
      if (!redisClient) {
        // Если Redis отключен, используем только fallback
        const fallbackStats = {
          keys: fallbackCache.keys().length,
          hits: fallbackCache.getStats().hits || 0,
          misses: fallbackCache.getStats().misses || 0,
          ksize: fallbackCache.getStats().vsize || 0
        };
        
        return {
          redis: 'disabled',
          fallback: fallbackStats,
          status: 'disabled'
        };
      }
      
      const redisInfo = await redisClient.info();
      
      // Получаем статистику из fallback кэша
      const fallbackStats = {
        keys: fallbackCache.keys().length,
        hits: fallbackCache.getStats().hits || 0,
        misses: fallbackCache.getStats().misses || 0,
        ksize: fallbackCache.getStats().vsize || 0
      };
      
      return {
        redis: redisInfo,
        fallback: fallbackStats,
        status: redisClient.status
      };
    } catch (error) {
      logger.warn('Redis info error, using fallback:', error.message);
      return {
        redis: 'error',
        fallback: {
          keys: fallbackCache.keys().length,
          hits: fallbackCache.getStats().hits || 0,
          misses: fallbackCache.getStats().misses || 0,
          ksize: fallbackCache.getStats().vsize || 0
        },
        status: 'error'
      };
    }
  }
};

// Экспортируем клиент и обернутый сервис кэширования
module.exports = {
  redisClient,
  redisWithFallback,
  testConnection
};