import client from 'prom-client';

// Настройка сбора метрик по умолчанию
const register = new client.Registry();

// Добавляем метрики по умолчанию
client.collectDefaultMetrics({
  register,
  prefix: 'anime_site_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5]
});

// HTTP запросы
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'anime_site_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code', 'user_agent'],
  buckets: [0.1, 0.5, 1, 1.5, 2, 5]
});

// HTTP запросы (общий счетчик)
const httpRequestCounter = new client.Counter({
  name: 'anime_site_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code', 'user_agent']
});

// Активные соединения
const activeConnections = new client.Gauge({
  name: 'anime_site_active_connections',
  help: 'Number of active connections',
  labelNames: ['type']
});

// WebSocket соединения
const websocketConnections = new client.Gauge({
  name: 'anime_site_websocket_connections',
  help: 'Number of active WebSocket connections'
});

// WebSocket сообщения
const websocketMessages = new client.Counter({
  name: 'anime_site_websocket_messages_total',
  help: 'Total number of WebSocket messages',
  labelNames: ['direction', 'type']
});

// База данных операций
const dbOperations = new client.Counter({
  name: 'anime_site_db_operations_total',
  help: 'Total number of database operations',
  labelNames: ['operation', 'table', 'status']
});

const dbOperationDuration = new client.Histogram({
  name: 'anime_site_db_operation_duration_seconds',
  help: 'Duration of database operations in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5]
});

// Redis операции
const redisOperations = new client.Counter({
  name: 'anime_site_redis_operations_total',
  help: 'Total number of Redis operations',
  labelNames: ['operation', 'key', 'status']
});

const redisOperationDuration = new client.Histogram({
  name: 'anime_site_redis_operation_duration_seconds',
  help: 'Duration of Redis operations in seconds',
  labelNames: ['operation'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25]
});

// Кеш операции
const cacheOperations = new client.Counter({
  name: 'anime_site_cache_operations_total',
  help: 'Total number of cache operations',
  labelNames: ['operation', 'cache_type', 'result']
});

const cacheHitRate = new client.Gauge({
  name: 'anime_site_cache_hit_rate',
  help: 'Cache hit rate',
  labelNames: ['cache_type']
});

// Ошибки
const errorsCounter = new client.Counter({
  name: 'anime_site_errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'component', 'severity']
});

// Время ответа API
const apiResponseTime = new client.Histogram({
  name: 'anime_site_api_response_time_seconds',
  help: 'Response time from external APIs',
  labelNames: ['api_name', 'endpoint', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

// Бизнес метрики
const userRegistrations = new client.Counter({
  name: 'anime_site_user_registrations_total',
  help: 'Total number of user registrations',
  labelNames: ['source']
});

const userLogins = new client.Counter({
  name: 'anime_site_user_logins_total',
  help: 'Total number of user logins',
  labelNames: ['success']
});

const animeViews = new client.Counter({
  name: 'anime_site_anime_views_total',
  help: 'Total number of anime views',
  labelNames: ['anime_id', 'source']
});

const episodePlays = new client.Counter({
  name: 'anime_site_episode_plays_total',
  help: 'Total number of episode plays',
  labelNames: ['episode_id', 'quality']
});

const searchQueries = new client.Counter({
  name: 'anime_site_search_queries_total',
  help: 'Total number of search queries',
  labelNames: ['query_type', 'results_count']
});

// Health check метрики
const healthCheckStatus = new client.Gauge({
  name: 'anime_site_health_check_status',
  help: 'Health check status (0=unhealthy, 1=healthy)',
  labelNames: ['component']
});

// Регистрируем все метрики
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestCounter);
register.registerMetric(activeConnections);
register.registerMetric(websocketConnections);
register.registerMetric(websocketMessages);
register.registerMetric(dbOperations);
register.registerMetric(dbOperationDuration);
register.registerMetric(redisOperations);
register.registerMetric(redisOperationDuration);
register.registerMetric(cacheOperations);
register.registerMetric(cacheHitRate);
register.registerMetric(errorsCounter);
register.registerMetric(apiResponseTime);
register.registerMetric(userRegistrations);
register.registerMetric(userLogins);
register.registerMetric(animeViews);
register.registerMetric(episodePlays);
register.registerMetric(searchQueries);
register.registerMetric(healthCheckStatus);

// Middleware для сбора HTTP метрик
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    
    httpRequestCounter.inc({
      method: req.method,
      route: req.route?.path || req.path,
      code: res.statusCode,
      user_agent: req.headers['user-agent'] ? req.headers['user-agent'].substring(0, 100) : 'unknown'
    });
    
    httpRequestDurationMicroseconds.observe(
      {
        method: req.method,
        route: req.route?.path || req.path,
        code: res.statusCode,
        user_agent: req.headers['user-agent'] ? req.headers['user-agent'].substring(0, 100) : 'unknown'
      },
      duration
    );
    
    // Логируем ошибки
    if (res.statusCode >= 400) {
      errorsCounter.inc({
        type: 'http_error',
        component: 'express',
        severity: res.statusCode >= 500 ? 'critical' : 'warning'
      });
    }
  });
  
  next();
};

// Функция для инкремента счетчиков WebSocket
const incrementWebSocketMessage = (direction, type) => {
  websocketMessages.inc({ direction, type });
};

// Функция для обновления счетчиков базы данных
const recordDbOperation = (operation, table, status = 'success') => {
  dbOperations.inc({ operation, table, status });
};

// Функция для измерения времени операций базы данных
const measureDbOperation = (operation, table) => {
  return (fn) => {
    return async (...args) => {
      const start = Date.now();
      try {
        const result = await fn(...args);
        dbOperationDuration.observe({ operation, table }, (Date.now() - start) / 1000);
        dbOperations.inc({ operation, table, status: 'success' });
        return result;
      } catch (error) {
        dbOperationDuration.observe({ operation, table }, (Date.now() - start) / 1000);
        dbOperations.inc({ operation, table, status: 'error' });
        throw error;
      }
    };
  };
};

// Функция для записи метрик API
const recordApiCall = (apiName, endpoint, statusCode, duration) => {
  apiResponseTime.observe(
    { api_name: apiName, endpoint, status_code: statusCode },
    duration
  );
};

// Функция для записи бизнес-метрик
const recordBusinessMetric = (metricName, labels = {}) => {
  const metric = register.getSingleMetric(metricName);
  if (metric) {
    if (metric instanceof client.Counter) {
      metric.inc(labels);
    } else if (metric instanceof client.Gauge) {
      metric.set(labels, 1);
    }
  }
};

// Функция для обновления health check статуса
const updateHealthCheckStatus = (component, status) => {
  healthCheckStatus.set({ component }, status ? 1 : 0);
};

// Функция для сбора метрик
const getMetrics = async () => {
  return await register.metrics();
};

// Функция для сбора метрик в формате JSON
const getMetricsJSON = async () => {
  return await register.metrics();
};

// Объект с метриками для удобного доступа
const metrics = {
  httpRequestDurationMicroseconds,
  httpRequestCounter,
  activeConnections,
  websocketConnections,
  websocketMessages,
  dbOperations,
  dbOperationDuration,
  redisOperations,
  redisOperationDuration,
  cacheOperations,
  cacheHitRate,
  errorsCounter,
  apiResponseTime,
  userRegistrations,
  userLogins,
  animeViews,
  episodePlays,
  searchQueries,
  healthCheckStatus
};

export {
  register,
  metricsMiddleware,
  incrementWebSocketMessage,
  recordDbOperation,
  measureDbOperation,
  recordApiCall,
  recordBusinessMetric,
  updateHealthCheckStatus,
  getMetrics,
  getMetricsJSON,
  metrics
};