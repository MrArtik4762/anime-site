import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const router = express.Router();
import { logger } from '../config/logger.js';
import { AppError } from '../utils/errors.js';
import { metricsConfig } from '../config/metrics.js';

/**
 * Health Check роуты для мониторинга состояния приложения
 */

/**
 * Базовый health check
 */
router.get('/', (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.RELEASE || 'unknown',
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      checks: {
        database: false,
        redis: false,
        storage: false
      }
    };

    // Проверка базы данных
    health.checks.database = checkDatabase(req);
    
    // Проверка Redis (если используется)
    if (req.app.get('redisClient')) {
      health.checks.redis = checkRedis(req, req.app.get('redisClient'));
    }
    
    // Проверка хранилища
    health.checks.storage = checkStorage(req);

    // Определяем общий статус на основе проверок
    const allChecksOk = Object.values(health.checks).every(check => check === true);
    health.status = allChecksOk ? 'ok' : 'degraded';

    // Записываем метрику
    metricsConfig.httpRequestsTotal.inc({
      method: req.method,
      route: req.path,
      status_code: res.statusCode,
      user_agent: req.get('User-Agent') || 'unknown'
    });

    res.status(health.status === 'ok' ? 200 : 503).json(health);
  } catch (error) {
    logger.error('Health check failed', { error: error.message, stack: error.stack });
    
    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      uptime: process.uptime()
    };
    
    res.status(500).json(errorResponse);
  }
});

/**
 * Детализированный health check
 */
router.get('/detailed', async (req, res) => {
  try {
    const detailedHealth = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.RELEASE || 'unknown',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        rss: process.memoryUsage().rss,
        heapTotal: process.memoryUsage().heapTotal,
        heapUsed: process.memoryUsage().heapUsed,
        external: process.memoryUsage().external,
        arrayBuffers: process.memoryUsage().arrayBuffers
      },
      cpu: {
        user: process.cpuUsage().user,
        system: process.cpuUsage().system
      },
      checks: {
        database: {
          status: false,
          latency: null,
          lastChecked: null
        },
        redis: {
          status: false,
          latency: null,
          lastChecked: null
        },
        storage: {
          status: false,
          latency: null,
          lastChecked: null
        },
        externalServices: {
          status: false,
          services: {}
        }
      },
      dependencies: {
        node: process.version,
        npm: process.env.npm_package_version || 'unknown',
        express: require('express').version,
        postgresql: 'unknown',
        redis: req.app.get('redisClient') ? 'connected' : 'not connected'
      }
    };

    // Проверка базы данных
    detailedHealth.checks.database = await checkDatabaseDetailed(req);
    
    // Проверка Redis
    if (req.app.get('redisClient')) {
      detailedHealth.checks.redis = await checkRedisDetailed(req.app.get('redisClient'));
    }
    
    // Проверка хранилища
    detailedHealth.checks.storage = await checkStorageDetailed(req);
    
    // Проверка внешних сервисов
    detailedHealth.checks.externalServices = await checkExternalServices(req.app);

    // Определяем общий статус
    const criticalChecks = [
      detailedHealth.checks.database.status,
      detailedHealth.checks.storage.status
    ];
    
    const allCriticalOk = criticalChecks.every(check => check === true);
    detailedHealth.status = allCriticalOk ? 'ok' : 'degraded';

    res.status(detailedHealth.status === 'ok' ? 200 : 503).json(detailedHealth);
  } catch (error) {
    logger.error('Detailed health check failed', { error: error.message, stack: error.stack });
    
    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      uptime: process.uptime()
    };
    
    res.status(500).json(errorResponse);
  }
});

/**
 * Проверка работоспособности базы данных
 */
function checkDatabase(req) {
  try {
    const db = req.app.get('db');
    if (!db) return false;
    
    // Простая проверка подключения
    return db.raw('SELECT 1').then(() => true).catch(() => false);
  } catch (error) {
    return false;
  }
}

/**
 * Детальная проверка базы данных
 */
async function checkDatabaseDetailed(req) {
  const check = {
    status: false,
    latency: null,
    lastChecked: new Date().toISOString()
  };
  
  try {
    const start = Date.now();
    const db = req.app.get('db');
    
    if (!db) {
      throw new Error('Database not connected');
    }
    
    await db.raw('SELECT 1');
    check.latency = Date.now() - start;
    check.status = true;
  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    check.error = error.message;
  }
  
  return check;
}

/**
 * Проверка Redis
 */
function checkRedis(req, redisClient) {
  try {
    if (!redisClient) return false;
    
    return redisClient.ping().then(() => true).catch(() => false);
  } catch (error) {
    return false;
  }
}

/**
 * Детальная проверка Redis
 */
async function checkRedisDetailed(redisClient) {
  const check = {
    status: false,
    latency: null,
    lastChecked: new Date().toISOString()
  };
  
  try {
    const start = Date.now();
    
    if (!redisClient) {
      throw new Error('Redis client not available');
    }
    
    await redisClient.ping();
    check.latency = Date.now() - start;
    check.status = true;
  } catch (error) {
    logger.error('Redis health check failed', { error: error.message });
    check.error = error.message;
  }
  
  return check;
}

/**
 * Проверка хранилища
 */
function checkStorage(req) {
  try {
    // Простая проверка доступности хранилища
    // В реальном приложении здесь будет проверка файловой системы или облачного хранилища
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Детальная проверка хранилища
 */
async function checkStorageDetailed() {
  const check = {
    status: false,
    latency: null,
    lastChecked: new Date().toISOString()
  };
  
  try {
    const start = Date.now();
    
    // Проверка доступности хранилища
    // В реальном приложении здесь будет проверка файловой системы или облачного хранилища
    check.latency = Date.now() - start;
    check.status = true;
  } catch (error) {
    logger.error('Storage health check failed', { error: error.message });
    check.error = error.message;
  }
  
  return check;
}

/**
 * Проверка внешних сервисов
 */
async function checkExternalServices(app) {
  const check = {
    status: false,
    services: {}
  };
  
  try {
    // Проверка внешних API
    const externalServices = [
      { name: 'anime-api', url: process.env.ANIME_API_URL },
      { name: 'video-storage', url: process.env.VIDEO_STORAGE_URL }
    ];
    
    for (const service of externalServices) {
      if (service.url) {
        check.services[service.name] = await checkServiceHealth(service.url);
      }
    }
    
    // Определяем общий статус
    const allServicesOk = Object.values(check.services).every(s => s.status === true);
    check.status = allServicesOk;
    
  } catch (error) {
    logger.error('External services health check failed', { error: error.message });
    check.error = error.message;
  }
  
  return check;
}

/**
 * Проверка работоспособности сервиса
 */
async function checkServiceHealth(url) {
  const check = {
    status: false,
    latency: null,
    lastChecked: new Date().toISOString()
  };
  
  try {
    const start = Date.now();
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      check.latency = Date.now() - start;
      check.status = true;
    }
  } catch (error) {
    logger.error(`Service health check failed for ${url}`, { error: error.message });
    check.error = error.message;
  }
  
  return check;
}

/**
 * Проверка готовности приложения (Readiness)
 */
router.get('/ready', (req, res) => {
  try {
    const readiness = {
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: checkDatabase(req),
        redis: req.app.get('redisClient') ? checkRedis(req, req.app.get('redisClient')) : true,
        storage: checkStorage(req)
      }
    };
    
    // Определяем общий статус
    const allChecksOk = Object.values(readiness.checks).every(check => check === true);
    readiness.status = allChecksOk ? 'ready' : 'not_ready';
    
    res.status(readiness.status === 'ready' ? 200 : 503).json(readiness);
  } catch (error) {
    logger.error('Readiness check failed', { error: error.message, stack: error.stack });
    
    const errorResponse = {
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: error.message
    };
    
    res.status(503).json(errorResponse);
  }
});

/**
 * Проверка живучести приложения (Liveness)
 */
router.get('/live', (req, res) => {
  try {
    const liveness = {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      pid: process.pid
    };
    
    res.status(200).json(liveness);
  } catch (error) {
    logger.error('Liveness check failed', { error: error.message, stack: error.stack });
    
    const errorResponse = {
      status: 'not_alive',
      timestamp: new Date().toISOString(),
      error: error.message
    };
    
    res.status(503).json(errorResponse);
  }
});

/**
 * Проверка зависимостей
 */
router.get('/dependencies', (req, res) => {
  try {
    const dependencies = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      dependencies: {
        node: process.version,
        npm: process.env.npm_package_version || 'unknown',
        express: require('express').version,
        postgresql: 'unknown',
        redis: req.app.get('redisClient') ? 'connected' : 'not connected',
        ffmpeg: 'unknown',
        hls: 'unknown'
      }
    };
    
    res.status(200).json(dependencies);
  } catch (error) {
    logger.error('Dependencies check failed', { error: error.message, stack: error.stack });
    
    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    };
    
    res.status(500).json(errorResponse);
  }
});

export default router;