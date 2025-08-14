const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');
const TracingExtensions = require('@sentry/tracing');
const logger = require('./logger');

/**
 * Конфигурация Sentry для error tracking
 */
class SentryConfig {
  constructor() {
    this.dsn = process.env.SENTRY_DSN;
    this.environment = process.env.NODE_ENV || 'development';
    this.release = process.env.RELEASE || 'unknown';
    this.tracesSampleRate = parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.2');
    this.profilesSampleRate = parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '1.0');
  }

  /**
   * Инициализация Sentry
   */
  init() {
    if (!this.dsn) {
      logger.warn('SENTRY_DSN not provided, skipping Sentry initialization');
      return false;
    }

    try {
      // Инициализация Sentry
      Sentry.init({
        dsn: this.dsn,
        environment: this.environment,
        release: this.release,
        integrations: [
          // Интеграция для Express
          new Sentry.Integrations.Http({ tracing: true }),
          new TracingIntegration.ExpressIntegration({ app: this.app }),
          
          // Интеграция для базы данных
          new Sentry.Integrations.Mongo(),
          
          // Интеграция для Redis (если используется)
          // new Sentry.Integrations.Redis(),
          
          // Интеграция для HTTP запросов
          new Sentry.Integrations.Http({
            breadcrumbs: true,
            tracing: true,
          }),
          
          // Интеграция для консольных логов
          new Sentry.Integrations.Console({
            levels: ['error'],
          }),
        ],
        
        // Настройки трассировки
        tracesSampleRate: this.tracesSampleRate,
        
        // Настройки профилирования
        profilesSampleRate: this.profilesSampleRate,
        
        // Настройки сессий
        autoSessionTracking: true,
        
        // Настройки replays
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        
        // Настройки sampling
        sampleRate: 1.0,
        
        // Фильтрация ошибок
        beforeSend: (event, hint) => {
          // Фильтруем ошибки от health check
          if (event.request?.url?.includes('/health')) {
            return null;
          }
          
          // Фильтруем ошибки от тестов
          if (event.request?.url?.includes('/test')) {
            return null;
          }
          
          // Фильтруем ошибки от определенных путей
          const filteredPaths = ['/metrics', '/metrics/*'];
          if (filteredPaths.some(path => event.request?.url?.includes(path))) {
            return null;
          }
          
          return event;
        },
        
        // Настройки контекста
        maxBreadcrumbs: 100,
        maxValueLength: 2500,
      });

      // Добавляем интеграцию для профилирования
      if (this.profilesSampleRate > 0) {
        Sentry.addIntegration(new ProfilingIntegration());
      }

      logger.info('Sentry initialized successfully', {
        environment: this.environment,
        release: this.request,
        tracesSampleRate: this.tracesSampleRate,
        profilesSampleRate: this.profilesSampleRate
      });

      return true;
    } catch (error) {
      logger.error('Failed to initialize Sentry', {
        error: error.message,
        stack: error.stack
      });
      return false;
    }
  }

  /**
   * Настройка middleware для Express
   */
  setupMiddleware(app) {
    if (!this.dsn) {
      return;
    }

    try {
      // Middleware для трассировки HTTP запросов
      app.use(Sentry.Handlers.requestHandler({
        // Фильтрация запросов
        requestHandler: (request) => {
          // Пропускаем health check
          if (request.path === '/health') {
            return null;
          }
          
          // Пропускаем тесты
          if (request.path.startsWith('/test')) {
            return null;
          }
          
          return request;
        }
      }));

      // Middleware для трассирования
      app.use(Sentry.Handlers.tracingHandler());

      // Middleware для обработки ошибок
      app.use(Sentry.Handlers.errorHandler({
        shouldHandleError: (error) => {
          // Обрабатываем только определенные типы ошибок
          return error instanceof Error || 
                 error.status >= 500 ||
                 error.code === 'INTERNAL_SERVER_ERROR';
        }
      }));

      logger.info('Sentry middleware configured');
    } catch (error) {
      logger.error('Failed to configure Sentry middleware', {
        error: error.message,
        stack: error.stack
      });
    }
  }

  /**
   * Отправка кастомного события в Sentry
   */
  captureMessage(message, level = 'info', extra = {}) {
    if (!this.dsn) {
      return;
    }

    try {
      Sentry.captureMessage(message, level, extra);
    } catch (error) {
      logger.error('Failed to capture message in Sentry', {
        message,
        level,
        error: error.message
      });
    }
  }

  /**
   * Отправка исключения в Sentry
   */
  captureException(error, extra = {}) {
    if (!this.dsn) {
      return;
    }

    try {
      Sentry.captureException(error, extra);
    } catch (captureError) {
      logger.error('Failed to capture exception in Sentry', {
        originalError: error.message,
        captureError: captureError.message
      });
    }
  }

  /**
   * Отправка транзакции в Sentry
   */
  startTransaction(name, op = 'task', customSamplingContext = {}) {
    if (!this.dsn) {
      return null;
    }

    try {
      return Sentry.startTransaction({
        name,
        op,
        ...customSamplingContext
      });
    } catch (error) {
      logger.error('Failed to start transaction in Sentry', {
        name,
        op,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Создание span для операции
   */
  startSpan(name, parentSpan = null, attributes = {}) {
    if (!this.dsn) {
      return null;
    }

    try {
      return Sentry.startSpan({ name, attributes }, parentSpan);
    } catch (error) {
      logger.error('Failed to start span in Sentry', {
        name,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Установка контекста пользователя
   */
  setUser(user) {
    if (!this.dsn) {
      return;
    }

    try {
      Sentry.setUser(user);
    } catch (error) {
      logger.error('Failed to set user context in Sentry', {
        userId: user?.id,
        error: error.message
      });
    }
  }

  /**
   * Очистка контекста пользователя
   */
  clearUser() {
    if (!this.dsn) {
      return;
    }

    try {
      Sentry.setUser(null);
    } catch (error) {
      logger.error('Failed to clear user context in Sentry', {
        error: error.message
      });
    }
  }

  /**
   * Установка тегов
   */
  setTags(tags) {
    if (!this.dsn) {
      return;
    }

    try {
      Sentry.configureScope((scope) => {
        Object.entries(tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      });
    } catch (error) {
      logger.error('Failed to set tags in Sentry', {
        tags,
        error: error.message
      });
    }
  }

  /**
   * Установка extra контекста
   */
  setExtras(extras) {
    if (!this.dsn) {
      return;
    }

    try {
      Sentry.configureScope((scope) => {
        Object.entries(extras).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      });
    } catch (error) {
      logger.error('Failed to set extras in Sentry', {
        extras,
        error: error.message
      });
    }
  }

  /**
   * Получение текущего контекста
   */
  getCurrentScope() {
    if (!this.dsn) {
      return null;
    }

    try {
      return Sentry.getCurrentScope();
    } catch (error) {
      logger.error('Failed to get current scope in Sentry', {
        error: error.message
      });
      return null;
    }
  }

  /**
   * Закрытие Sentry при завершении работы
   */
  close() {
    if (!this.dsn) {
      return;
    }

    try {
      Sentry.close();
      logger.info('Sentry closed successfully');
    } catch (error) {
      logger.error('Failed to close Sentry', {
        error: error.message
      });
    }
  }
}

// Создаем экземпляр конфигурации
const sentryConfig = new SentryConfig();

// Экспортируем класс и экземпляр
module.exports = { Sentry, SentryConfig, sentryConfig };