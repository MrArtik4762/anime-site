/**
 * Клиентский сервис логирования для аниме-сайта
 */

// Уровни логирования
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

// Имена уровней для отображения
const LOG_LEVEL_NAMES = {
  0: 'ERROR',
  1: 'WARN',
  2: 'INFO',
  3: 'DEBUG',
  4: 'TRACE'
};

// Цвета для консоли
const LOG_COLORS = {
  ERROR: '#FF0000',
  WARN: '#FFA500',
  INFO: '#0000FF',
  DEBUG: '#008000',
  TRACE: '#808080'
};

/**
 * Класс Logger для клиентского логирования
 */
class Logger {
  constructor(options = {}) {
    this.level = options.level || (process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG);
    this.enableConsole = options.enableConsole !== false;
    this.enableServer = options.enableServer !== false;
    this.serverEndpoint = options.serverEndpoint || '/api/logs';
    this.context = options.context || {};
    this.maxBatchSize = options.maxBatchSize || 10;
    this.batchTimeout = options.batchTimeout || 5000;
    
    // Буфер для пакетной отправки
    this.logBuffer = [];
    this.batchTimer = null;
    
    // Подписка на глобальные события
    this.setupGlobalHandlers();
  }

  /**
   * Настройка обработчиков глобальных событий
   */
  setupGlobalHandlers() {
    // Обработка ошибок JavaScript
    window.addEventListener('error', (event) => {
      this.error('JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Обработка отклоненных промисов
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise
      });
    });

    // Обработка сетевых ошибок
    window.addEventListener('offline', () => {
      this.warn('Network connection lost');
    });

    window.addEventListener('online', () => {
      this.info('Network connection restored');
    });
  }

  /**
   * Форматирование сообщения лога
   */
  formatMessage(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: LOG_LEVEL_NAMES[level],
      message,
      data,
      context: this.context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      version: process.env.REACT_APP_VERSION || 'unknown'
    };

    return logEntry;
  }

  /**
   * Отправка логов на сервер
   */
  async sendToServer(logs) {
    if (!this.enableServer || !logs.length) return;

    try {
      const response = await fetch(this.serverEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ logs })
      });

      if (!response.ok) {
        console.warn('Failed to send logs to server:', response.status, response.statusText);
      }
    } catch (error) {
      console.warn('Error sending logs to server:', error);
    }
  }

  /**
   * Пакетная отправка логов
   */
  flushLogs() {
    if (this.logBuffer.length === 0) return;

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    clearTimeout(this.batchTimer);
    this.batchTimer = null;

    this.sendToServer(logsToSend);
  }

  /**
   * Добавление лога в буфер
   */
  addToBuffer(logEntry) {
    this.logBuffer.push(logEntry);

    // Отправляем, если достигли максимального размера
    if (this.logBuffer.length >= this.maxBatchSize) {
      this.flushLogs();
    }
    // Иначе устанавливаем таймер для пакетной отправки
    else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flushLogs(), this.batchTimeout);
    }
  }

  /**
   * Вывод в консоль
   */
  toConsole(level, message, data = {}) {
    if (!this.enableConsole) return;

    const logEntry = this.formatMessage(level, message, data);
    const color = LOG_COLORS[LOG_LEVEL_NAMES[level]];
    const style = `color: ${color}; font-weight: bold;`;

    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(`%c${logEntry.level}: ${logEntry.message}`, style, logEntry);
        break;
      case LOG_LEVELS.WARN:
        console.warn(`%c${logEntry.level}: ${logEntry.message}`, style, logEntry);
        break;
      case LOG_LEVELS.INFO:
        console.info(`%c${logEntry.level}: ${logEntry.message}`, style, logEntry);
        break;
      case LOG_LEVELS.DEBUG:
        console.debug(`%c${logEntry.level}: ${logEntry.message}`, style, logEntry);
        break;
      case LOG_LEVELS.TRACE:
        console.trace(`%c${logEntry.level}: ${logEntry.message}`, style, logEntry);
        break;
    }
  }

  /**
   * Логирование ошибки
   */
  error(message, data = {}) {
    if (this.level >= LOG_LEVELS.ERROR) {
      const logEntry = this.formatMessage(LOG_LEVELS.ERROR, message, data);
      this.toConsole(LOG_LEVELS.ERROR, message, data);
      this.addToBuffer(logEntry);
    }
  }

  /**
   * Логирование предупреждения
   */
  warn(message, data = {}) {
    if (this.level >= LOG_LEVELS.WARN) {
      const logEntry = this.formatMessage(LOG_LEVELS.WARN, message, data);
      this.toConsole(LOG_LEVELS.WARN, message, data);
      this.addToBuffer(logEntry);
    }
  }

  /**
   * Логирование информации
   */
  info(message, data = {}) {
    if (this.level >= LOG_LEVELS.INFO) {
      const logEntry = this.formatMessage(LOG_LEVELS.INFO, message, data);
      this.toConsole(LOG_LEVELS.INFO, message, data);
      this.addToBuffer(logEntry);
    }
  }

  /**
   * Логирование отладочной информации
   */
  debug(message, data = {}) {
    if (this.level >= LOG_LEVELS.DEBUG) {
      const logEntry = this.formatMessage(LOG_LEVELS.DEBUG, message, data);
      this.toConsole(LOG_LEVELS.DEBUG, message, data);
      this.addToBuffer(logEntry);
    }
  }

  /**
   * Логирование трассировки
   */
  trace(message, data = {}) {
    if (this.level >= LOG_LEVELS.TRACE) {
      const logEntry = this.formatMessage(LOG_LEVELS.TRACE, message, data);
      this.toConsole(LOG_LEVELS.TRACE, message, data);
      this.addToBuffer(logEntry);
    }
  }

  /**
   * Изменение уровня логирования
   */
  setLevel(level) {
    this.level = level;
  }

  /**
   * Добавление контекста
   */
  addContext(key, value) {
    this.context[key] = value;
  }

  /**
   * Удаление контекста
   */
  removeContext(key) {
    delete this.context[key];
  }

  /**
   * Очистка контекста
   */
  clearContext() {
    this.context = {};
  }

  /**
   * Создание дочернего логгера с расширенным контекстом
   */
  child(context = {}) {
    return new Logger({
      level: this.level,
      enableConsole: this.enableConsole,
      enableServer: this.enableServer,
      serverEndpoint: this.serverEndpoint,
      context: { ...this.context, ...context },
      maxBatchSize: this.maxBatchSize,
      batchTimeout: this.batchTimeout
    });
  }

  /**
   * Форматирование объекта для логирования
   */
  stringify(obj) {
    try {
      return JSON.stringify(obj, (key, value) => {
        // Специальная обработка объектов Error
        if (value instanceof Error) {
          return {
            name: value.name,
            message: value.message,
            stack: value.stack
          };
        }
        
        // Специальная обработка DOM элементов
        if (value instanceof HTMLElement) {
          return {
            tagName: value.tagName,
            id: value.id,
            className: value.className,
            innerText: value.innerText
          };
        }
        
        return value;
      }, 2);
    } catch (e) {
      return `[Unable to stringify object: ${e.message}]`;
    }
  }
}

// Создаем экземпляр логгера
const logger = new Logger({
  level: process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG,
  enableConsole: true,
  enableServer: true
});

// Экспортируем класс и экземпляр
export { Logger, LOG_LEVELS, LOG_LEVEL_NAMES };
export default logger;

// Экспортируем удобные функции
export const logError = (message, data) => logger.error(message, data);
export const logWarn = (message, data) => logger.warn(message, data);
export const logInfo = (message, data) => logger.info(message, data);
export const logDebug = (message, data) => logger.debug(message, data);
export const logTrace = (message, data) => logger.trace(message, data);