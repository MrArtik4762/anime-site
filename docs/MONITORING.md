# Мониторинг, логирование и обработка ошибок

## Описание

В этом документе описана система мониторинга, логирования и обработки ошибок для аниме-сайта. Система включает в себя:

1. **Логирование**: структурированное логирование с Winston/Bunyan, логи разных уровней, форматирование JSON, логирование запросов и ответов API, логирование ошибок с stack trace.
2. **Обработка ошибок**: централизованный обработчик ошибок, кастомные классы ошибок, глобальный error boundary для React, обработка ошибок базы данных, обработка ошибок API и сети.
3. **Мониторинг**: интеграция с Sentry для error tracking, Prometheus метрики для приложения, Health check endpoints, Performance monitoring, Аналитика ошибок.
4. **Dashboard и оповещения**: настройка Grafana dashboard, Alertmanager для оповещений, Уведомления по Slack/Email, Лог агрегация с ELK stack.

## Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Monitoring    │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ErrorBoundary│ │    │ │ErrorHandler │ │    │ │   Sentry    │ │
│ │   + Logger  │ │    │ │   + Logger  │ │    │ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ │ Prometheus  │ │
│ │   Metrics   │ │    │ │   Metrics   │ │    │ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Storage       │
                    │                 │
                    │ ┌─────────────┐ │
                    │ │   Logs      │ │
                    │ │   + Metrics │ │
                    │ └─────────────┘ │
                    └─────────────────┘
```

## Логирование

### Серверное логирование

Конфигурация логирования находится в `server/config/logger.js`.

#### Функциональность:

- **Уровни логирования**: error, warn, info, debug, trace
- **Форматирование**: JSON для продакшена, текст для разработки
- **Транспорт**: файлы, консоль, удаленный сервер (опционально)
- **Метаданные**: requestId, userId, ip, userAgent
- **Логирование запросов**: middleware для логирования HTTP запросов
- **Логирование ошибок**: автоматическое логирование с stack trace

#### Пример использования:

```javascript
const logger = require('./config/logger');

// Базовое логирование
logger.info('User logged in', { userId: 123, ip: '192.168.1.1' });

// Логирование ошибки
logger.error('Database connection failed', { error: error.message, stack: error.stack });

// Логирование с контекстом
const childLogger = logger.child({ service: 'auth' });
childLogger.debug('Authentication attempt', { email: 'user@example.com' });
```

### Клиентское логирование

Конфигурация логирования находится в `client/src/services/logger.js`.

#### Функциональность:

- **Уровни логирования**: error, warn, info, debug, trace
- **Форматирование**: консоль, отправка на сервер
- **Пакетная отправка**: группировка логов для уменьшения запросов
- **Глобальные обработчики**: errors, unhandledrejection, offline/online
- **Контекст**: версия приложения, URL, пользовательский агент

#### Пример использования:

```javascript
import logger from '../services/logger';

// Базовое логирование
logger.info('Page loaded', { page: '/anime', loadTime: 1500 });

// Логирование ошибки
logger.error('Failed to load anime data', { animeId: 456, error: error.message });

// Логирование с контекстом
const appLogger = logger.child({ module: 'videoPlayer' });
appLogger.debug('Video started', { videoId: 'abc123', quality: '1080p' });
```

## Обработка ошибок

### Серверная обработка ошибок

Централизованный обработчик ошибок находится в `server/middleware/errorHandler.js`.

#### Кастомные классы ошибок

Конфигурация находится в `server/utils/errors.js`.

```javascript
const { 
  AppError, 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  ExternalServiceError
} = require('../utils/errors');

// Пример использования
throw new NotFoundError('Anime not found');
throw new ValidationError('Invalid input', { field: 'email', message: 'Invalid email format' });
throw new ExternalServiceError('anime-api', 'Service unavailable');
```

#### Обработчики ошибок:

- **notFoundHandler**: обработка 404 ошибок
- **validationErrorHandler**: обработка ошибок валидации
- **databaseErrorHandler**: обработка ошибок базы данных
- **jwtErrorHandler**: обработка ошибок JWT
- **asyncErrorHandler**: обработка асинхронных ошибок
- **developmentErrorHandler**: детальная информация для разработки
- **productionErrorHandler**: минимальная информация для продакшена

### Клиентская обработка ошибок

Глобальный Error Boundary находится в `client/src/components/ErrorBoundary.js`.

#### Функциональность:

- **Перехват ошибок**: автоматический перехват ошибок в компонентах
- **Отправка на сервер**: логирование ошибок с Sentry
- **Отображение UI**: дружелюбный интерфейс для пользователей
- **Детали для разработки**: stack trace и компонентный стек

#### Пример использования:

```javascript
import ErrorBoundary from '../components/ErrorBoundary';

// Обертка компонента
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>

// HOC для добавления свойств
export default withErrorBoundary(MyComponent, { userId: 123 });

// Контекст для функциональных компонентов
const { logError } = useErrorHandler();
logError(error, { component: 'VideoPlayer', action: 'play' });
```

## Мониторинг

### Sentry интеграция

Конфигурация находится в `server/config/sentry.js`.

#### Функциональность:

- **Error tracking**: автоматический сбор ошибок
- **Performance monitoring**: отслеживание производительности
- **Replays**: запись сессий пользователей
- **Custom events**: кастомные события и метки
- **User context**: контекст пользователя

#### Пример использования:

```javascript
const { sentryConfig } = require('../config/sentry');

// Отправка исключения
sentryConfig.captureException(error, { extra: { userId: 123 } });

// Отправка сообщения
sentryConfig.captureMessage('User action performed', 'info', { userId: 123 });

// Создание транзакции
const transaction = sentryConfig.startTransaction('API Request', 'GET /api/anime');
```

### Prometheus метрики

Конфигурация находится в `server/config/metrics.js`.

#### Метрики:

- **HTTP запросы**: количество, продолжительность, статус коды
- **База данных**: количество запросов, время выполнения
- **Кэш**: hits/misses
- **Пользователи**: общее количество, активные пользователи
- **Видео**: общее количество, просмотры, время просмотра
- **HLS потоки**: количество потоков, пропускная способность
- **Ошибки**: общее количество, типы ошибок
- **Система**: память, CPU

#### Пример использования:

```javascript
const { metricsConfig } = require('../config/metrics');

// Регистрация просмотра видео
metricsConfig.recordVideoView(videoId);

// Обновление метрик HLS
metricsConfig.updateHlsBandwidth('1080p', 1024000);

// Отслеживание асинхронной операции
metricsConfig.trackAsyncOperation('videoDownload', async () => {
  // асинхронная операция
});
```

### Health checks

Конфигурация находится в `server/routes/health.js`.

#### Endpoints:

- **GET /health**: базовый health check
- **GET /health/detailed**: детализированный health check
- **GET /health/ready**: проверка готовности приложения
- **GET /health/live**: проверка живучести приложения
- **GET /health/dependencies**: проверка зависимостей

### Prometheus metrics endpoints

Конфигурация находится в `server/routes/metrics.js`.

#### Endpoints:

- **GET /metrics**: базовый сбор метрик
- **GET /metrics/json**: метрики в формате JSON
- **GET /metrics/specific/:metricName**: конкретная метрика
- **GET /metrics/category/:category**: метрики по категории
- **GET /metrics/tags/:tags**: метрики по тегам
- **GET /metrics/openmetrics**: метрики в формате OpenMetrics

## Настройка и конфигурация

### Environment variables

```bash
# Sentry
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_TRACES_SAMPLE_RATE=0.2
SENTRY_PROFILES_SAMPLE_RATE=1.0

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
LOG_FILE_PATH=/var/log/anime-site

# Metrics
METRICS_ENABLED=true
METRICS_PORT=9090

# Health checks
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_INTERVAL=30
```

### Docker конфигурация

В `docker-compose.yml` добавлены сервисы для мониторинга:

```yaml
monitoring:
  image: grafana/grafana:latest
  ports:
    - "3000:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
  volumes:
    - ./monitoring/grafana:/etc/grafana/provisioning

prometheus:
  image: prom/prometheus:latest
  ports:
    - "9090:9090"
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus_data:/prometheus
```

### Kubernetes конфигурация

Для Kubernetes доступны манифесты в `k8s/monitoring/`:

- `prometheus-deployment.yaml`
- `grafana-deployment.yaml`
- `alertmanager-config.yaml`
- `service-monitor.yaml`

## Dashboard и оповещения

### Grafana dashboard

Предоставлены дашборды для мониторинга:

1. **Application Overview**: общий обзор приложения
2. **Performance Dashboard**: производительность приложения
3. **Error Tracking Dashboard**: отслеживание ошибок
4. **User Analytics Dashboard**: аналитика пользователей
5. **Video Streaming Dashboard**: метрики стриминга

### Alertmanager

Конфигурация оповещений:

```yaml
route:
  group_by: ['alertname', 'severity']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
- name: 'web.hook'
  email_configs:
  - to: 'admin@example.com'
    subject: 'Anime Site Alert'
  slack_configs:
  - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
    channel: '#alerts'
```

## Интеграция с CI/CD

### GitHub Actions

В `.github/workflows/monitoring.yml` добавлены действия для:

- Сборки и развертывания дашбордов Grafana
- Настройки Prometheus и Alertmanager
- Интеграции с Sentry
- Проверки метрик и health checks

### Автоматическая настройка

Скрипт `scripts/setup-monitoring.sh` автоматизирует:

- Установку Prometheus
- Настройку Grafana
- Конфигурацию Alertmanager
- Импорт дашбордов

## Best practices

### Логирование

1. **Используйте правильные уровни**: error для критических ошибок, warn для предупреждений, info для важных событий
2. **Добавляйте контекст**: userId, requestId, ip, userAgent
3. **Избегайте логирования чувствительных данных**: пароли, токены, персональная информация
4. **Структурируйте логи**: используйте JSON формат для легкого парсинга
5. **Логируйте ошибки с stack trace**: для быстрого поиска причин

### Обработка ошибок

1. **Используйте кастомные классы ошибок**: для разных типов ошибок
2. **Обрабатывайте ошибки на всех уровнях**: от UI до базы данных
3. **Предоставляйте пользователю понятные сообщения**: без технических деталей
4. **Логируйте все ошибки**: для анализа и исправления
5. **Реагируйте на критические ошибки**: автоматически или через оповещения

### Мониторинг

1. **Определите ключевые метрики**: для вашего приложения
2. **Настройте автоматические оповещения**: для критических метрик
3. **Регулярно проверяйте дашборды**: для выявления аномалий
4. **Используйте A/B тестирование**: для проверки производительности
5. **Анализируйте тренды**: для прогнозирования проблем

## Расширение системы

### Добавление новых метрик

1. Определите метрику в `server/config/metrics.js`
2. Добавьте middleware для сбора данных
3. Обновите дашборды Grafana
4. Настройте оповещения для новой метрики

### Добавление новых источников логов

1. Настройте транспорт в `server/config/logger.js`
2. Добавьте форматирование для нового источника
3. Настройте агрегацию логов (ELK stack)
4. Обновите дашборды Grafana

### Интеграция с новыми системами мониторинга

1. Добавьте SDK для целевой системы
2. Настройте экспорт метрик
3. Обновите конфигурацию CI/CD
4. Документируйте новую интеграцию

## Вывод

Система мониторинга, логирования и обработки ошибок предоставляет comprehensive инструмент для обеспечения стабильности и производительности аниме-сайта. Правильная настройка и использование системы помогут быстро выявлять и исправлять проблемы, а также анализировать поведение приложения в реальном времени.