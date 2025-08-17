import prometheus from 'prom-client';
import { logger } from './logger.js';

/**
 * Конфигурация Prometheus для сбора метрик
 */
class MetricsConfig {
  constructor() {
    this.register = new prometheus.Registry();
    this.defaultLabels = {
      app: 'anime-site',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.RELEASE || 'unknown'
    };
    
    // Настройка глобальных меток
    prometheus.setDefaultLabels(this.defaultLabels);
    
    // Регистрация собственных метрик
    this.setupMetrics();
    
    // Сбор метрик Node.js
    this.collectNodeMetrics();
    
    // Сбор метрик приложения
    this.collectAppMetrics();
  }

  /**
   * Настройка кастомных метрик
   */
  setupMetrics() {
    // HTTP запросы
    this.httpRequestsTotal = new prometheus.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code', 'user_agent'],
      registers: [this.register]
    });

    this.httpRequestDuration = new prometheus.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.register]
    });

    // База данных
    this.dbQueryDuration = new prometheus.Histogram({
      name: 'db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
      registers: [this.register]
    });

    this.dbConnections = new prometheus.Gauge({
      name: 'db_connections_active',
      help: 'Number of active database connections',
      labelNames: ['database'],
      registers: [this.register]
    });

    // Кэш
    this.cacheHits = new prometheus.Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_type'],
      registers: [this.register]
    });

    this.cacheMisses = new prometheus.Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_type'],
      registers: [this.register]
    });

    // Пользователи
    this.usersTotal = new prometheus.Gauge({
      name: 'users_total',
      help: 'Total number of users',
      registers: [this.register]
    });

    this.usersActive = new prometheus.Gauge({
      name: 'users_active',
      help: 'Number of active users',
      registers: [this.register]
    });

    // Видео
    this.videosTotal = new prometheus.Gauge({
      name: 'videos_total',
      help: 'Total number of videos',
      registers: [this.register]
    });

    this.videosViews = new prometheus.Counter({
      name: 'videos_views_total',
      help: 'Total number of video views',
      labelNames: ['video_id'],
      registers: [this.register]
    });

    this.videosWatchTime = new prometheus.Counter({
      name: 'videos_watch_time_seconds_total',
      help: 'Total video watch time in seconds',
      labelNames: ['video_id'],
      registers: [this.register]
    });

    // HLS потоков
    this.hlsStreamsTotal = new prometheus.Counter({
      name: 'hls_streams_total',
      help: 'Total number of HLS streams',
      labelNames: ['quality', 'anime_id'],
      registers: [this.register]
    });

    this.hlsBandwidth = new prometheus.Gauge({
      name: 'hls_bandwidth_bytes',
      help: 'Current HLS bandwidth usage in bytes',
      labelNames: ['quality'],
      registers: [this.register]
    });

    // Ошибки
    this.errorsTotal = new prometheus.Counter({
      name: 'errors_total',
      help: 'Total number of errors',
      labelNames: ['error_type', 'endpoint'],
      registers: [this.register]
    });

    // Система
    this.memoryUsage = new prometheus.Gauge({
      name: 'memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['type'],
      registers: [this.register]
    });

    this.cpuUsage = new prometheus.Gauge({
      name: 'cpu_usage_percent',
      help: 'CPU usage percentage',
      registers: [this.register]
    });

    // Асинхронные операции
    this.asyncOperations = new prometheus.Gauge({
      name: 'async_operations_active',
      help: 'Number of active async operations',
      labelNames: ['operation_type'],
      registers: [this.register]
    });

    this.asyncOperationsDuration = new prometheus.Histogram({
      name: 'async_operations_duration_seconds',
      help: 'Duration of async operations in seconds',
      labelNames: ['operation_type'],
      buckets: [0.1, 0.5, 1, 5, 10, 30, 60],
      registers: [this.register]
    });

    logger.info('Prometheus metrics initialized');
  }

  /**
   * Сбор метрик Node.js
   */
  collectNodeMetrics() {
    prometheus.collectDefaultMetrics({
      register: this.register,
      prefix: 'node_',
      labels: this.defaultLabels
    });
  }

  /**
   * Сбор метрик приложения
   */
  collectAppMetrics() {
    // Интервал сбора метрик
    setInterval(() => {
      this.collectSystemMetrics();
      this.collectApplicationMetrics();
    }, 10000); // Каждые 10 секунд
  }

  /**
   * Сбор системных метрик
   */
  collectSystemMetrics() {
    const memUsage = process.memoryUsage();
    
    this.memoryUsage.set({ type: 'rss' }, memUsage.rss);
    this.memoryUsage.set({ type: 'heapTotal' }, memUsage.heapTotal);
    this.memoryUsage.set({ type: 'heapUsed' }, memUsage.heapUsed);
    this.memoryUsage.set({ type: 'external' }, memUsage.external);
    
    // CPU usage (упрощенный расчет)
    const usage = process.cpuUsage();
    const cpuPercent = (usage.user + usage.system) / 1000000; // Преобразование в секунды
    this.cpuUsage.set(cpuPercent);
  }

  /**
   * Сбор метрик приложения
   */
  collectApplicationMetrics() {
    // Здесь можно добавлять специфичные для приложения метрики
    // Например, количество активных пользователей, просмотров видео и т.д.
  }

  /**
   * Middleware для трассировки HTTP запросов
   */
  httpMetrics() {
    return (req, res, next) => {
      const start = Date.now();
      
      // Отслеживаем завершение запроса
      res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route?.path || req.path;
        
        // Обновляем счетчики
        this.httpRequestsTotal.inc({
          method: req.method,
          route: route,
          status_code: res.statusCode,
          user_agent: req.get('User-Agent')?.substring(0, 100) || 'unknown'
        });
        
        this.httpRequestDuration.observe({
          method: req.method,
          route: route,
          status_code: res.statusCode
        }, duration);
        
        // Отслеживаем ошибки
        if (res.statusCode >= 400) {
          this.errorsTotal.inc({
            error_type: res.statusCode < 500 ? 'client_error' : 'server_error',
            endpoint: route
          });
        }
      });
      
      next();
    };
  }

  /**
   * Middleware для трассирования запросов к базе данных
   */
  dbMetrics(operation, table) {
    const start = Date.now();
    
    return (result) => {
      const duration = (Date.now() - start) / 1000;
      
      this.dbQueryDuration.observe({
        operation,
        table
      }, duration);
      
      return result;
    };
  }

  /**
   * Инкремент счетчиков кэша
   */
  recordCacheHit(cacheType) {
    this.cacheHits.inc({ cache_type: cacheType });
  }

  recordCacheMiss(cacheType) {
    this.cacheMisses.inc({ cache_type: cacheType });
  }

  /**
   * Обновление метрик пользователей
   */
  updateUserMetrics(totalUsers, activeUsers) {
    this.usersTotal.set(totalUsers);
    this.usersActive.set(activeUsers);
  }

  /**
   * Обновление метрик видео
   */
  updateVideoMetrics(totalVideos) {
    this.videosTotal.set(totalVideos);
  }

  /**
   * Регистрация просмотра видео
   */
  recordVideoView(videoId) {
    this.videosViews.inc({ video_id: videoId });
  }

  /**
   * Регистрация времени просмотра
   */
  recordVideoWatchTime(videoId, seconds) {
    this.videosWatchTime.inc({ video_id: videoId }, seconds);
  }

  /**
   * Регистрация HLS потока
   */
  recordHlsStream(quality, animeId) {
    this.hlsStreamsTotal.inc({ quality, anime_id: animeId });
  }

  /**
   * Обновление метрик HLS
   */
  updateHlsBandwidth(quality, bandwidth) {
    this.hlsBandwidth.set({ quality }, bandwidth);
  }

  /**
   * Отслеживание асинхронных операций
   */
  trackAsyncOperation(operationType, callback) {
    this.asyncOperations.inc({ operation_type: operationType });
    
    const start = Date.now();
    
    return Promise.resolve(callback())
      .finally(() => {
        const duration = (Date.now() - start) / 1000;
        
        this.asyncOperations.dec({ operation_type: operationType });
        this.asyncOperationsDuration.observe({
          operation_type: operationType
        }, duration);
      });
  }

  /**
   * Экспорт метрик
   */
  async getMetrics() {
    try {
      return await this.register.metrics();
    } catch (error) {
      logger.error('Failed to get metrics', { error: error.message });
      return '';
    }
  }

  /**
   * Получение метрик в формате JSON
   */
  async getMetricsAsJson() {
    try {
      return await this.register.getSingleMetricAsString();
    } catch (error) {
      logger.error('Failed to get metrics as JSON', { error: error.message });
      return '';
    }
  }

  /**
   * Очистка метрик
   */
  reset() {
    this.register.clear();
    this.setupMetrics();
  }
}

// Создаем экземпляр конфигурации
const metricsConfig = new MetricsConfig();

// Экспортируем класс и экземпляр
export { MetricsConfig, metricsConfig };