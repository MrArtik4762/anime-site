# Настройка секретов GitHub для CI/CD Pipeline

Этот документ описывает, как настроить необходимые секреты для работы CI/CD pipeline вашего аниме-сайта.

## Необходимые секреты

### 1. Slack Webhook URL
Для отправки уведомлений в Slack канал.

**Как получить:**
1. Зайдите в ваш Slack workspace
2. Перейдите в https://my.slack.com/apps/manage/custom-integrations
3. Выберите "Incoming Webhooks"
4. Нажмите "Add Configuration"
5. Выберите канал, в который будут приходить уведомления
6. Скопуйте Webhook URL

**Добавление в GitHub:**
1. Перейдите в ваш репозиторий на GitHub
2. Зайдите в Settings → Secrets and variables → Actions
3. Нажмите "New repository secret"
4. В поле "Name" введите: `SLACK_WEBHOOK_URL`
5. В поле "Secret" вставьте скопированный URL
6. Нажмите "Add secret"

### 2. Docker Registry Credentials
Для аутентификации в Docker registry (GitHub Container Registry).

**Как настроить:**
GitHub Actions автоматически использует `GITHUB_TOKEN` для аутентификации в GitHub Container Registry (ghcr.io). Дополнительные секреты не требуются.

### 3. Дополнительные секреты (опционально)

#### Для развертывания на серверах:
Если вы планируете развертывать приложение на внешних серверах, добавьте следующие секреты:

- `SSH_PRIVATE_KEY`: Приватный ключ для подключения к серверам
- `SSH_HOST`: Адрес сервера для развертывания
- `SSH_USER`: Имя пользователя для подключения
- `DEPLOY_PATH`: Путь на сервере для развертывания

#### Для внешних сервисов:
- `ANILIBERTY_API_BASE`: URL для Aniliberty API
- `DATABASE_URL`: URL подключения к базе данных
- `REDIS_URL`: URL подключения к Redis
- `JWT_SECRET`: Секретный ключ для JWT
- `JWT_REFRESH_SECRET`: Секретный ключ для JWT refresh токенов

#### Для тестовой среды (CI/CD):
- `POSTGRES_TEST_PASSWORD`: Пароль для PostgreSQL в тестовой среде
- `REDIS_TEST_PASSWORD`: Пароль для Redis в тестовой среде
- `JWT_TEST_SECRET`: Секретный ключ для JWT в тестовой среде
- `JWT_REFRESH_TEST_SECRET`: Секретный ключ для JWT refresh в тестовой среде

## Проверка настроек

После добавления секретов вы можете проверить их работу, запустив любой из workflow:

1. Сделайте push в ветку main или develop
2. Перейдите во вкладку Actions в вашем репозитории
3. Выберите нужный workflow и проверьте его выполнение

## Безопасность

- Никогда не добавляйте секреты в код или коммиты
- Регулярно обновляйте секреты
- Используйте разные секреты для разных сред (staging/production)
- Ограничьте доступ к секретам только необходимым пользователям

## Пример использования секретов в workflow

```yaml
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Login to Container Registry
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
```

## Устранение проблем

Если workflow не работают с секретами:

1. Проверьте, что секреты добавлены правильно
2. Убедитесь, что имена секретов совпадают с теми, что используются в workflow
3. Проверьте права доступа к репозиторию
4. Убедитесь, что workflow запускаются от имени пользователя с доступом к секретам

## Дополнительные ресурсы

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
## Пример использования секретов в workflow

```yaml
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: anime_test_user
          POSTGRES_PASSWORD: ${{ secrets.POSTGRES_TEST_PASSWORD }}
          POSTGRES_DB: anime_test_db
          POSTGRES_INITDB_ARGS: "--auth-host=scram-sha-256 --auth-local=scram-sha-256"
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
          --health-start-period 30s

      redis:
        image: redis:7-alpine
        command: redis-server --appendonly yes --requirepass ${{ secrets.REDIS_TEST_PASSWORD }}
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Run tests
        run: |
          cd server && npm run test:coverage
        env:
          NODE_ENV: test
          DATABASE_URL: "postgresql://anime_test_user:${{ secrets.POSTGRES_TEST_PASSWORD }}@localhost:5432/anime_test_db"
          REDIS_URL: "redis://:${{ secrets.REDIS_TEST_PASSWORD }}@localhost:6379"
          JWT_SECRET: ${{ secrets.JWT_TEST_SECRET }}
          JWT_REFRESH_SECRET: ${{ secrets.JWT_REFRESH_TEST_SECRET }}
```