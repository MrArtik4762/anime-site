import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

class SentryClient {
  constructor() {
    this.dsn = process.env.REACT_APP_SENTRY_DSN;
    this.environment = process.env.NODE_ENV || 'development';
    this.release = process.env.REACT_APP_VERSION || '1.0.0';
    this.tracesSampleRate = parseFloat(process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE || '0.2');
  }

  /**
   * Инициализация Sentry для React приложения
   */
  init() {
    if (!this.dsn) {
      console.warn('REACT_APP_SENTRY_DSN not provided, Sentry integration disabled');
      return false;
    }

    try {
      // Инициализация Sentry
      Sentry.init({
        dsn: this.dsn,
        environment: this.environment,
        release: this.release,
        
        // Интеграции
        integrations: [
          new Integrations.BrowserTracing(),
          new Integrations.Breadcrumbs(),
          new Integrations.UserAgent(),
          new Integrations.GlobalHandlers({
            onerror: true,
            onunhandledrejection: true
          }),
          new Integrations.InboundFilters({
            allowUrls: [
              /localhost/,
              /anime-site\.com/,
              /your-domain\.com/
            ]
          })
        ],
        
        // Настройки трассировки
        tracesSampleRate: this.tracesSampleRate,
        
        // Настройки сэмплирования
        sampleRate: parseFloat(process.env.REACT_APP_SENTRY_SAMPLE_RATE || '1.0'),
        
        // Настройки передаваемых данных
        beforeSend: (event) => {
          // Фильтруем чувствительные данные
          if (event.request && event.request.headers) {
            // Удаляем заголовки с авторизацией
            delete event.request.headers['authorization'];
            delete event.request.headers['cookie'];
            delete event.request.headers['set-cookie'];
          }
          
          // Фильтруем тело запроса
          if (event.request && event.request.data) {
            // Маскируем пароли и другие чувствительные данные
            event.request.data = this.sanitizeData(event.request.data);
          }
          
          return event;
        },
        
        // Настройки контекста
        maxBreadcrumbs: 50,
        attachStacktrace: true,
        
        // Настройки пользователя
        user: (user) => {
          if (user && user.id) {
            return {
              id: user.id,
              username: user.username || user.email,
              email: user.email
            };
          }
          return null;
        },
        
        // Настройки для React
        reactComponentStack: true
      });

      console.info('Sentry initialized successfully', {
        environment: this.environment,
        tracesSampleRate: this.tracesSampleRate
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize Sentry', {
        error: error.message,
        stack: error.stack
      });
      return false;
    }
  }

  /**
   * Обертка для ErrorBoundary
   */
  getErrorBoundary() {
    if (!this.dsn) {
      return null;
    }

    return Sentry.ErrorBoundary;
  }

  /**
   * Обертка для React Router
   */
  getRouter() {
    if (!this.dsn) {
      return null;
    }

    return Sentry.withRouter;
  }

  /**
   * Функция для отправки пользовательских сообщений
   */
  captureMessage(message, level = 'info', context = {}) {
    if (!this.dsn) {
      return;
    }

    Sentry.captureMessage(message, level, {
      tags: context.tags || {},
      extra: context.extra || {},
      fingerprint: context.fingerprint || ['default']
    });
  }

  /**
   * Функция для отправки пользовательских ошибок
   */
  captureException(error, context = {}) {
    if (!this.dsn) {
      return;
    }

    Sentry.captureException(error, {
      tags: context.tags || {},
      extra: context.extra || {},
      fingerprint: context.fingerprint || ['default']
    });
  }

  /**
   * Функция для создания транзакции
   */
  startTransaction(name, op = 'page.load') {
    if (!this.dsn) {
      return null;
    }

    return Sentry.startTransaction({
      name,
      op,
      tags: {
        environment: this.environment,
        release: this.release
      }
    });
  }

  /**
   * Функция для добавления breadcrumb
   */
  addBreadcrumb(message, level = 'info', category = 'ui', data = {}) {
    if (!this.dsn) {
      return;
    }

    Sentry.addBreadcrumb({
      message,
      level,
      category,
      data,
      timestamp: Date.now() / 1000
    });
  }

  /**
   * Функция для установки контекста пользователя
   */
  setUser(user) {
    if (!this.dsn) {
      return;
    }

    Sentry.setUser(user);
  }

  /**
   * Функция для очистки контекста пользователя
   */
  clearUser() {
    if (!this.dsn) {
      return;
    }

    Sentry.setUser(null);
  }

  /**
   * Функция для установки тегов
   */
  setTags(tags) {
    if (!this.dsn) {
      return;
    }

    Sentry.configureScope((scope) => {
      Object.keys(tags).forEach(key => {
        scope.setTag(key, tags[key]);
      });
    });
  }

  /**
   * Функция для установки дополнительного контекста
   */
  setContext(key, context) {
    if (!this.dsn) {
      return;
    }

    Sentry.configureScope((scope) => {
      scope.setContext(key, context);
    });
  }

  /**
   * Функция для установки extra контекста
   */
  setExtra(key, value) {
    if (!this.dsn) {
      return;
    }

    Sentry.configureScope((scope) => {
      scope.setExtra(key, value);
    });
  }

  /**
   * Функция для маскировки чувствительных данных
   */
  sanitizeData(data) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sensitiveFields = [
      'password', 'password_confirmation', 'current_password',
      'token', 'api_key', 'secret', 'key', 'credential',
      'card', 'cvv', 'expiry', 'number'
    ];

    const sanitized = Array.isArray(data) ? [] : {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Функция для настройки HTTP клиента с Sentry трассировкой
   */
  configureHttpClient(axios) {
    if (!this.dsn) {
      return axios;
    }

    // Request interceptor
    axios.interceptors.request.use((config) => {
      const span = Sentry.getCurrentScope().getSpan();
      if (span) {
        config.metadata = { ...config.metadata, span };
      }
      
      // Добавляем breadcrumb для запроса
      this.addBreadcrumb(
        `HTTP ${config.method?.toUpperCase()} ${config.url}`,
        'info',
        'http',
        {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data
        }
      );
      
      return config;
    });

    // Response interceptor
    axios.interceptors.response.use(
      (response) => {
        // Добавляем breadcrumb для успешного ответа
        this.addBreadcrumb(
          `HTTP ${response.status} ${response.config.url}`,
          'info',
          'http',
          {
            status: response.status,
            url: response.config.url,
            duration: response.headers['x-response-time']
          }
        );
        
        return response;
      },
      (error) => {
        // Добавляем breadcrumb для ошибки ответа
        this.addBreadcrumb(
          `HTTP ${error.response?.status || 'Unknown'} ${error.config?.url}`,
          'error',
          'http',
          {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message
          }
        );
        
        return Promise.reject(error);
      }
    );

    return axios;
  }

  /**
   * Функция для настройки React Router трассировки
   */
  configureReactRouter(history) {
    if (!this.dsn) {
      return;
    }

    // Подписываемся на изменения роута
    history.listen((location) => {
      const transaction = Sentry.startTransaction({
        name: location.pathname,
        op: 'navigation'
      });

      // Завершаем транзакцию при следующем рендере
      requestAnimationFrame(() => {
        transaction.finish();
      });
    });
  }

  /**
   * Функция для настройки глобальных обработчиков ошибок
   */
  setupGlobalHandlers() {
    if (!this.dsn) {
      return;
    }

    // Обработчик необработанных ошибок
    window.addEventListener('error', (event) => {
      Sentry.withScope((scope) => {
        scope.setTag('event.source', 'window.onerror');
        scope.setExtra('error', event.error);
        scope.setExtra('filename', event.filename);
        scope.setExtra('lineno', event.lineno);
        scope.setExtra('colno', event.colno);
        scope.setExtra('message', event.message);
        scope.setExtra('type', event.type);
        Sentry.captureException(event.error);
      });
    });

    // Обработчик необработанных промисов
    window.addEventListener('unhandledrejection', (event) => {
      Sentry.withScope((scope) => {
        scope.setTag('event.source', 'window.onunhandledrejection');
        scope.setExtra('reason', event.reason);
        scope.setExtra('promise', event.promise);
        Sentry.captureException(event.reason);
      });
    });
  }
}

// Создаем и экспортируем экземпляр
const sentryClient = new SentryClient();

export default sentryClient;