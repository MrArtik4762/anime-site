import React from 'react';

// Утилита для логирования на клиенте
class ClientLogger {
  constructor() {
    this.logLevel = process.env.NODE_ENV === 'production' ? 'error' : 'debug';
    this.logs = [];
    this.maxLogs = 100;
    this.enableConsole = process.env.NODE_ENV !== 'production';
  }

  /**
   * Логирование сообщения
   */
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Сохраняем в память
    this.logs.push(logEntry);
    
    // Ограничиваем количество логов в памяти
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Выводим в консоль, если включено
    if (this.enableConsole) {
      this._logToConsole(level, message, data);
    }

    // Отправляем в Sentry, если настроен
    this._sendToSentry(level, logEntry);
  }

  /**
   * Различные уровни логирования
   */
  debug(message, data = {}) {
    this.log('debug', message, data);
  }

  info(message, data = {}) {
    this.log('info', message, data);
  }

  warn(message, data = {}) {
    this.log('warn', message, data);
  }

  error(message, data = {}) {
    this.log('error', message, data);
  }

  /**
   * Логирование ошибок
   */
  logError(error, context = {}) {
    const errorData = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...context
    };

    this.error('Client error occurred', errorData);

    // Отправляем в Sentry
    if (window.Sentry) {
      window.Sentry.withScope((scope) => {
        Object.keys(context).forEach(key => {
          scope.setExtra(key, context[key]);
        });
        window.Sentry.captureException(error);
      });
    }
  }

  /**
   * Логирование API запросов
   */
  logApiRequest(method, url, status, duration, requestData = {}, responseData = {}) {
    const logData = {
      method,
      url,
      status,
      duration,
      requestData,
      responseData
    };

    if (status >= 400) {
      this.error(`API Error: ${method} ${url}`, logData);
    } else {
      this.info(`API Request: ${method} ${url}`, logData);
    }
  }

  /**
   * Логирование производительности
   */
  logPerformance(name, duration, data = {}) {
    const perfData = {
      name,
      duration,
      ...data
    };

    this.info('Performance metric', perfData);
  }

  /**
   * Логирование пользовательских действий
   */
  logUserAction(action, data = {}) {
    this.info('User action', {
      action,
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Логирование бизнес-событий
   */
  logBusinessEvent(event, data = {}) {
    this.info('Business event', {
      event,
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Получение всех логов
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Получение логов по уровню
   */
  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Очистка логов
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Вывод в консоль
   */
  _logToConsole(level, message, data) {
    const logMethod = level === 'error' ? 'error' : 
                     level === 'warn' ? 'warn' : 
                     level === 'info' ? 'info' : 'log';

    console[logMethod](`[${level.toUpperCase()}] ${message}`, data);
  }

  /**
   * Отправка в Sentry
   */
  _sendToSentry(level, logEntry) {
    if (!window.Sentry || level === 'debug') {
      return;
    }

    const severity = {
      error: 'error',
      warn: 'warning',
      info: 'info',
      debug: 'debug'
    }[level] || 'info';

    window.Sentry.addBreadcrumb({
      message: logEntry.message,
      level: severity,
      category: 'client',
      data: logEntry.data,
      timestamp: Date.now() / 1000
    });
  }

  /**
   * Настройка контекста пользователя
   */
  setUserContext(user) {
    if (window.Sentry) {
      window.Sentry.setUser(user);
    }
  }

  /**
   * Очистка контекста пользователя
   */
  clearUserContext() {
    if (window.Sentry) {
      window.Sentry.setUser(null);
    }
  }

  /**
   * Создание транзакции для Sentry
   */
  startTransaction(name, op = 'http.client') {
    if (!window.Sentry) {
      return null;
    }

    return window.Sentry.startTransaction({
      name,
      op,
      tags: {
        environment: process.env.NODE_ENV || 'development'
      }
    });
  }
}

// Создаем и экспортируем экземпляр
const clientLogger = new ClientLogger();

// HOC для добавления логирования к компонентам
export const withLogging = (WrappedComponent, componentName) => {
  return class extends React.Component {
    componentDidMount() {
      clientLogger.info(`Component mounted: ${componentName}`, {
        props: this.props
      });
    }

    componentWillUnmount() {
      clientLogger.info(`Component unmounted: ${componentName}`, {
        props: this.props
      });
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
};

// Хук для логирования в функциональных компонентах
export const useLogger = (componentName) => {
  return {
    log: (level, message, data) => {
      clientLogger.log(level, `[${componentName}] ${message}`, data);
    },
    debug: (message, data) => clientLogger.debug(`[${componentName}] ${message}`, data),
    info: (message, data) => clientLogger.info(`[${componentName}] ${message}`, data),
    warn: (message, data) => clientLogger.warn(`[${componentName}] ${message}`, data),
    error: (message, data) => clientLogger.error(`[${componentName}] ${message}`, data),
    logError: (error, context) => clientLogger.logError(error, { component: componentName, ...context })
  };
};

export default clientLogger;