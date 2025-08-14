const { logger } = require('../utils/logger');
const { updateHealthCheckStatus } = require('../utils/metrics');
const { DatabaseError, NetworkError } = require('../utils/errors');

class HealthController {
  constructor() {
    this.checks = {
      database: this.checkDatabase.bind(this),
      redis: this.checkRedis.bind(this),
      externalApis: this.checkExternalApis.bind(this),
      memory: this.checkMemory.bind(this),
      disk: this.checkDisk.bind(this)
    };
  }

  /**
   * Основной health check endpoint
   */
  async getHealth(req, res) {
    const startTime = Date.now();
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      checks: {},
      responseTime: 0
    };

    try {
      // Выполняем все проверки параллельно
      const checkPromises = Object.entries(this.checks).map(async ([name, check]) => {
        try {
          const result = await check();
          healthStatus.checks[name] = {
            status: result.status,
            message: result.message,
            responseTime: result.responseTime || 0
          };
          
          // Обновляем метрику health check
          updateHealthCheckStatus(name, result.status === 'healthy');
          
          // Если какая-то проверка не здорова, весь сервис считается нездоровым
          if (result.status !== 'healthy') {
            healthStatus.status = 'unhealthy';
          }
        } catch (error) {
          healthStatus.checks[name] = {
            status: 'unhealthy',
            error: error.message,
            responseTime: 0
          };
          
          // Обновляем метрику health check
          updateHealthCheckStatus(name, false);
          
          healthStatus.status = 'unhealthy';
        }
      });

      await Promise.all(checkPromises);
      
      healthStatus.responseTime = Date.now() - startTime;
      
      // Логируем результат health check
      logger.info('Health check completed', {
        status: healthStatus.status,
        checks: Object.keys(healthStatus.checks).length,
        responseTime: healthStatus.responseTime
      });

      // Определяем статус ответа
      const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
      
      res.status(statusCode).json(healthStatus);
    } catch (error) {
      healthStatus.status = 'unhealthy';
      healthStatus.error = error.message;
      healthStatus.responseTime = Date.now() - startTime;
      
      // Логируем ошибку health check
      logger.error('Health check failed', {
        error: error.message,
        stack: error.stack,
        responseTime: healthStatus.responseTime
      });
      
      res.status(503).json(healthStatus);
    }
  }

  /**
   * Проверка базы данных
   */
  async checkDatabase() {
    const startTime = Date.now();
    
    try {
      // Проверяем соединение с базой данных
      const db = req.app.get('db');
      await db.raw('SELECT 1');
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        message: 'Database connection successful',
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      logger.error('Database health check failed', {
        error: error.message,
        responseTime
      });
      
      throw new DatabaseError('Database connection failed', { error: error.message });
    }
  }

  /**
   * Проверка Redis
   */
  async checkRedis() {
    const startTime = Date.now();
    
    try {
      const redis = req.app.get('redis');
      await redis.ping();
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        message: 'Redis connection successful',
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      logger.error('Redis health check failed', {
        error: error.message,
        responseTime
      });
      
      throw new NetworkError('Redis connection failed', 'redis');
    }
  }

  /**
   * Проверка внешних API
   */
  async checkExternalApis() {
    const startTime = Date.now();
    const results = {};
    
    const externalServices = [
      { name: 'anilibria', url: 'https://api.anilibria.tv/v3/title/random' },
      { name: 'jikan', url: 'https://api.jikan.moe/v4/random/anime' }
    ];
    
    try {
      const axios = require('axios');
      
      for (const service of externalServices) {
        try {
          const response = await axios.get(service.url, {
            timeout: 5000,
            validateStatus: (status) => status < 500
          });
          
          results[service.name] = {
            status: response.status < 400 ? 'healthy' : 'degraded',
            statusCode: response.status,
            responseTime: 0
          };
        } catch (error) {
          results[service.name] = {
            status: 'unhealthy',
            error: error.message,
            responseTime: 0
          };
        }
      }
      
      const responseTime = Date.now() - startTime;
      
      // Определяем общий статус
      const hasHealthy = Object.values(results).some(r => r.status === 'healthy');
      const hasUnhealthy = Object.values(results).some(r => r.status === 'unhealthy');
      
      const overallStatus = hasUnhealthy ? 'degraded' : (hasHealthy ? 'healthy' : 'unhealthy');
      
      return {
        status: overallStatus,
        message: `External APIs check completed (${Object.keys(results).length} services)`,
        responseTime,
        services: results
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      logger.error('External APIs health check failed', {
        error: error.message,
        responseTime
      });
      
      throw new NetworkError('External APIs check failed', 'external_apis');
    }
  }

  /**
   * Проверка памяти
   */
  async checkMemory() {
    const startTime = Date.now();
    const used = process.memoryUsage();
    const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024 * 100) / 100;
    const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024 * 100) / 100;
    const externalMB = Math.round(used.external / 1024 / 1024 * 100) / 100;
    
    // Пороги предупреждения и критического состояния
    const WARNING_THRESHOLD = 500; // MB
    const CRITICAL_THRESHOLD = 800; // MB
    
    let status = 'healthy';
    let message = `Memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB`;
    
    if (heapUsedMB > CRITICAL_THRESHOLD) {
      status = 'unhealthy';
      message += ' (CRITICAL)';
    } else if (heapUsedMB > WARNING_THRESHOLD) {
      status = 'degraded';
      message += ' (WARNING)';
    }
    
    const responseTime = Date.now() - startTime;
    
    return {
      status,
      message,
      responseTime,
      details: {
        heapUsed: `${heapUsedMB}MB`,
        heapTotal: `${heapTotalMB}MB`,
        external: `${externalMB}MB`,
        rss: `${Math.round(used.rss / 1024 / 1024 * 100) / 100}MB`
      }
    };
  }

  /**
   * Проверка дискового пространства
   */
  async checkDisk() {
    const startTime = Date.now();
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Проверяем доступное место в директории приложения
      const appDir = process.cwd();
      const stats = fs.statfsSync(appDir);
      
      const blockSize = stats.bsize;
      const totalBlocks = stats.blocks;
      const freeBlocks = stats.bfree;
      const availableBlocks = stats.bavail;
      
      const totalSpace = totalBlocks * blockSize / 1024 / 1024;
      const freeSpace = freeBlocks * blockSize / 1024 / 1024;
      const availableSpace = availableBlocks * blockSize / 1024 / 1024;
      
      const usagePercent = ((totalSpace - availableSpace) / totalSpace) * 100;
      
      let status = 'healthy';
      let message = `Disk usage: ${usagePercent.toFixed(1)}% (${availableSpace.toFixed(1)}MB available)`;
      
      // Пороги предупреждения и критического состояния
      if (usagePercent > 95) {
        status = 'unhealthy';
        message += ' (CRITICAL)';
      } else if (usagePercent > 85) {
        status = 'degraded';
        message += ' (WARNING)';
      }
      
      const responseTime = Date.now() - startTime;
      
      return {
        status,
        message,
        responseTime,
        details: {
          totalSpace: `${totalSpace.toFixed(1)}MB`,
          freeSpace: `${freeSpace.toFixed(1)}MB`,
          availableSpace: `${availableSpace.toFixed(1)}MB`,
          usagePercent: `${usagePercent.toFixed(1)}%`
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      logger.error('Disk health check failed', {
        error: error.message,
        responseTime
      });
      
      return {
        status: 'unhealthy',
        message: 'Disk check failed',
        responseTime,
        error: error.message
      };
    }
  }

  /**
   * Readiness probe
   */
  async getReadiness(req, res) {
    const readinessStatus = {
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {}
    };

    try {
      // Проверяем только критические компоненты
      const criticalChecks = ['database', 'redis'];
      
      for (const checkName of criticalChecks) {
        const check = this.checks[checkName];
        try {
          const result = await check();
          readinessStatus.checks[checkName] = {
            status: result.status,
            message: result.message
          };
          
          if (result.status !== 'healthy') {
            readinessStatus.status = 'not_ready';
          }
        } catch (error) {
          readinessStatus.checks[checkName] = {
            status: 'unhealthy',
            error: error.message
          };
          
          readinessStatus.status = 'not_ready';
        }
      }
      
      const statusCode = readinessStatus.status === 'ready' ? 200 : 503;
      res.status(statusCode).json(readinessStatus);
    } catch (error) {
      readinessStatus.status = 'not_ready';
      readinessStatus.error = error.message;
      
      res.status(503).json(readinessStatus);
    }
  }

  /**
   * Liveness probe
   */
  getLiveness(req, res) {
    const livenessStatus = {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    };
    
    res.status(200).json(livenessStatus);
  }
}

module.exports = new HealthController();