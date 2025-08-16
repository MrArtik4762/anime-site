const cron = require('node-cron');
const analyticsService = require('./analyticsService');
const cacheService = require('./cacheService');
const Anime = require('../models/Anime');
const { logger } = require('../utils/logger');

class JobsService {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
    this.fallbackTimer = null;
    this.fallbackInterval = 5 * 60 * 1000; // 5 минут fallback
  }

  /**
   * Инициализировать и запустить все cron-задачи
   */
  start() {
    if (this.isRunning) {
      logger.warn('Jobs service is already running');
      return;
    }

    logger.info('Starting jobs service...');

    try {
      // Задача обновления популярных аниме (каждые 15 минут)
      this.scheduleJob(
        'update-popular',
        '*/15 * * * *',
        this.updatePopularAnime.bind(this),
        'Обновление популярных аниме'
      );

      // Задача обновления новых аниме (каждые 5 минут)
      this.scheduleJob(
        'update-new',
        '*/5 * * * *',
        this.updateNewAnime.bind(this),
        'Обновление новых аниме'
      );

      // Задача обновления трендовых аниме (каждые 10 минут)
      this.scheduleJob(
        'update-trending',
        '*/10 * * * *',
        this.updateTrendingAnime.bind(this),
        'Обновление трендовых аниме'
      );

      // Задача обновления индекса популярности (каждый час)
      this.scheduleJob(
        'update-trending-scores',
        '0 * * * *',
        this.updateTrendingScores.bind(this),
        'Обновление индексов популярности'
      );

      // Задача сброса еженедельной статистики (каждое воскресенье в 00:00)
      this.scheduleJob(
        'reset-weekly-stats',
        '0 0 * * 0',
        this.resetWeeklyStats.bind(this),
        'Сброс еженедельной статистики'
      );

      // Запуск fallback-таймера на случай если cron не работает
      this.startFallbackTimer();

      this.isRunning = true;
      logger.info('Jobs service started successfully');

    } catch (error) {
      logger.error('Error starting jobs service:', error);
      throw error;
    }
  }

  /**
   * Остановить все задачи
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('Jobs service is not running');
      return;
    }

    logger.info('Stopping jobs service...');

    try {
      // Остановка всех cron-задач
      for (const [jobName, job] of this.jobs) {
        job.stop();
        logger.info(`Stopped job: ${jobName}`);
      }

      // Остановка fallback-таймера
      if (this.fallbackTimer) {
        clearInterval(this.fallbackTimer);
        this.fallbackTimer = null;
      }

      this.jobs.clear();
      this.isRunning = false;
      logger.info('Jobs service stopped successfully');

    } catch (error) {
      logger.error('Error stopping jobs service:', error);
      throw error;
    }
  }

  /**
   * Запланировать задачу
   * @param {string} name - Имя задачи
   * @param {string} cronExpression - Cron-выражение
   * @param {Function} task - Функция задачи
   * @param {string} description - Описание задачи
   */
  scheduleJob(name, cronExpression, task, description) {
    try {
      const job = cron.schedule(cronExpression, async () => {
        try {
          logger.info(`Starting job: ${description} (${name})`);
          const startTime = Date.now();
          
          await task();
          
          const duration = Date.now() - startTime;
          logger.info(`Job completed: ${description} (${name}) - ${duration}ms`);
          
        } catch (error) {
          logger.error(`Job failed: ${description} (${name}) -`, error);
          
          // Попытка повторного выполнения через экспоненциальную задержку
          await this.retryJob(name, task, description);
        }
      }, {
        scheduled: false,
        timezone: 'Europe/Minsk'
      });

      job.start();
      this.jobs.set(name, job);
      
      logger.info(`Job scheduled: ${description} (${name}) - ${cronExpression}`);

    } catch (error) {
      logger.error(`Error scheduling job ${name}:`, error);
      throw error;
    }
  }

  /**
   * Обновить популярные аниме
   */
  async updatePopularAnime() {
    try {
      logger.info('Updating popular anime...');
      
      const popularAnime = await analyticsService.getPopularAnime(20, false);
      
      // Кэшируем результат
      await cacheService.cachePopularAnime(popularAnime);
      
      logger.info(`Updated ${popularAnime.length} popular anime`);
      return popularAnime;
      
    } catch (error) {
      logger.error('Error updating popular anime:', error);
      throw error;
    }
  }

  /**
   * Обновить новые аниме
   */
  async updateNewAnime() {
    try {
      logger.info('Updating new anime...');
      
      const newAnime = await analyticsService.getNewAnime(20, 7, false);
      
      // Кэшируем результат
      await cacheService.cacheNewAnime(newAnime);
      
      logger.info(`Updated ${newAnime.length} new anime`);
      return newAnime;
      
    } catch (error) {
      logger.error('Error updating new anime:', error);
      throw error;
    }
  }

  /**
   * Обновить трендовые аниме
   */
  async updateTrendingAnime() {
    try {
      logger.info('Updating trending anime...');
      
      const trendingAnime = await analyticsService.getTrendingAnime(20, false);
      
      // Кэшируем результат
      await cacheService.set('trending', trendingAnime, 'trending:', 600);
      
      logger.info(`Updated ${trendingAnime.length} trending anime`);
      return trendingAnime;
      
    } catch (error) {
      logger.error('Error updating trending anime:', error);
      throw error;
    }
  }

  /**
   * Обновить индексы популярности для всех аниме
   */
  async updateTrendingScores() {
    try {
      logger.info('Updating trending scores for all anime...');
      
      const result = await Anime.batchUpdateTrendingScores();
      
      logger.info(`Updated trending scores for ${result.updatedCount}/${result.total} anime`);
      
      // Инвалидируем кэш аналитики
      await analyticsService.invalidateAllCaches();
      
      return result;
      
    } catch (error) {
      logger.error('Error updating trending scores:', error);
      throw error;
    }
  }

  /**
   * Сбросить еженедельную статистику
   */
  async resetWeeklyStats() {
    try {
      logger.info('Resetting weekly statistics...');
      
      const result = await analyticsService.resetWeeklyViews();
      
      // Очищаем кэш
      await cacheService.clearByPrefix('popular:');
      await cacheService.clearByPrefix('new:');
      await cacheService.clearByPrefix('trending:');
      
      logger.info(`Weekly statistics reset completed. Modified ${result.modifiedCount} anime`);
      return result;
      
    } catch (error) {
      logger.error('Error resetting weekly stats:', error);
      throw error;
    }
  }

  /**
   * Запустить fallback-таймер
   */
  startFallbackTimer() {
    if (this.fallbackTimer) {
      clearInterval(this.fallbackTimer);
    }

    this.fallbackTimer = setInterval(async () => {
      try {
        logger.debug('Running fallback job updates...');
        
        // Проверяем, нужно ли обновлять данные
        const lastUpdate = await this.getLastUpdate();
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdate;
        
        // Если прошло более 15 минут с последнего обновления, запускаем обновление
        if (timeSinceLastUpdate > 15 * 60 * 1000) {
          logger.info('Fallback trigger: updating analytics data...');
          
          await Promise.all([
            this.updatePopularAnime(),
            this.updateNewAnime(),
            this.updateTrendingAnime()
          ]);
          
          await this.setLastUpdate(now);
        }
        
      } catch (error) {
        logger.error('Error in fallback timer:', error);
      }
    }, this.fallbackInterval);
  }

  /**
   * Получить время последнего обновления
   */
  async getLastUpdate() {
    try {
      const cached = await cacheService.get('last-analytics-update', 'system:');
      return cached || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Установить время последнего обновления
   */
  async setLastUpdate(timestamp) {
    try {
      await cacheService.set('last-analytics-update', timestamp, 'system:', 3600);
    } catch (error) {
      logger.error('Error setting last update time:', error);
    }
  }

  /**
   * Повторить выполнение задачи с экспоненциальной задержкой
   * @param {string} jobName - Имя задачи
   * @param {Function} task - Функция задачи
   * @param {string} description - Описание задачи
   */
  async retryJob(jobName, task, description, attempt = 1) {
    const maxAttempts = 3;
    const baseDelay = 5000; // 5 секунд
    
    if (attempt > maxAttempts) {
      logger.error(`Job ${jobName} failed after ${maxAttempts} attempts`);
      return;
    }
    
    const delay = baseDelay * Math.pow(2, attempt - 1);
    logger.info(`Retrying job ${jobName} in ${delay}ms (attempt ${attempt}/${maxAttempts})`);
    
    setTimeout(async () => {
      try {
        await task();
        logger.info(`Job ${jobName} succeeded on retry attempt ${attempt}`);
      } catch (error) {
        logger.warn(`Retry ${attempt} failed for job ${jobName}`);
        await this.retryJob(jobName, task, description, attempt + 1);
      }
    }, delay);
  }

  /**
   * Получить статус всех задач
   */
  getJobStatus() {
    const status = {};
    
    for (const [jobName, job] of this.jobs) {
      status[jobName] = {
        name: jobName,
        running: job.running,
        lastRun: job.lastRun ? job.lastRun.toISOString() : null,
        nextRun: job.nextRun ? job.nextRun.toISOString() : null
      };
    }
    
    return {
      isRunning: this.isRunning,
      jobs: status,
      fallbackRunning: !!this.fallbackTimer,
      lastUpdate: this.getLastUpdate()
    };
  }

  /**
   * Ручное выполнение задачи
   * @param {string} jobName - Имя задачи
   */
  async runJob(jobName) {
    const jobHandlers = {
      'update-popular': this.updatePopularAnime.bind(this),
      'update-new': this.updateNewAnime.bind(this),
      'update-trending': this.updateTrendingAnime.bind(this),
      'update-trending-scores': this.updateTrendingScores.bind(this),
      'reset-weekly-stats': this.resetWeeklyStats.bind(this)
    };
    
    if (!jobHandlers[jobName]) {
      throw new Error(`Unknown job: ${jobName}`);
    }
    
    logger.info(`Manually running job: ${jobName}`);
    return await jobHandlers[jobName]();
  }
}

// Создаем singleton экземпляр
const jobsService = new JobsService();

module.exports = jobsService;