# 🐳 Руководство по Docker развертыванию аниме-сайта

## 📋 Содержание
- [Предварительные требования](#предварительные-требования)
- [Быстрый старт](#быстрый-старт)
- [Конфигурация окружения](#конфигурация-окружения)
- [Режимы развертывания](#режимы-развертывания)
- [Мониторинг и логирование](#мониторинг-и-логирование)
- [Безопасность](#безопасность)
- [Устранение неполадок](#устранение-неполадок)
- [Производительность](#производительность)

## 🔧 Предварительные требования

### Системные требования
- **Docker**: версия 20.10 или выше
- **Docker Compose**: версия 2.0 или выше
- **Оперативная память**: минимум 4GB, рекомендуется 8GB
- **Дисковое пространство**: минимум 10GB свободного места
- **CPU**: минимум 2 ядра

### Проверка установки
```bash
# Проверка версии Docker
docker --version

# Проверка версии Docker Compose
docker compose version

# Проверка доступных ресурсов
docker system df
```

## 🚀 Быстрый старт

### 1. Клонирование и подготовка
```bash
# Переход в директорию проекта
cd C:\Users\oarte\Documents\anime-site

# Создание файла переменных окружения
cp .env.example .env

# Редактирование переменных окружения (обязательно!)
notepad .env
```

### 2. Развертывание для разработки
```bash
# Запуск в режиме разработки
docker compose -f docker-compose.dev.yml up -d

# Просмотр логов
docker compose -f docker-compose.dev.yml logs -f

# Остановка
docker compose -f docker-compose.dev.yml down
```

### 3. Развертывание для продакшена
```bash
# Сборка образов
docker compose build

# Запуск всех сервисов
docker compose up -d

# Проверка статуса
docker compose ps

# Просмотр логов
docker compose logs -f
```

## ⚙️ Конфигурация окружения

### Обязательные переменные для продакшена
```bash
# Безопасность (ОБЯЗАТЕЛЬНО изменить!)
JWT_SECRET=ваш-супер-секретный-ключ-минимум-32-символа
JWT_REFRESH_SECRET=ваш-секретный-ключ-для-refresh-токенов
MONGO_PASSWORD=безопасный-пароль-для-mongodb

# Основные настройки
NODE_ENV=production
CLIENT_URL=https://ваш-домен.com

# Мониторинг
GRAFANA_PASSWORD=безопасный-пароль-для-grafana
```

### Опциональные переменные
```bash
# Внешние API
MAL_CLIENT_ID=ваш-myanimelist-client-id
ANILIST_CLIENT_ID=ваш-anilist-client-id
KITSU_API_KEY=ваш-kitsu-api-key

# Email уведомления
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=ваш-email@gmail.com
EMAIL_PASS=пароль-приложения
```

## 🎯 Режимы развертывания

### Режим разработки
```bash
# Запуск с hot-reload и отладкой
docker compose -f docker-compose.dev.yml up -d

# Доступ к приложению
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# MongoDB: localhost:27017
# Redis: localhost:6379
```

### Продакшн режим
```bash
# Полное развертывание с nginx, мониторингом
docker compose up -d

# Доступ к приложению
# Приложение: http://localhost
# Grafana: http://localhost:3001
# Prometheus: http://localhost:9090
```

### Режим с мониторингом
```bash
# Запуск с включенным мониторингом
docker compose --profile monitoring up -d

# Дополнительные сервисы:
# - Prometheus для сбора метрик
# - Grafana для визуализации
```

## 📊 Мониторинг и логирование

### Просмотр логов
```bash
# Все сервисы
docker compose logs -f

# Конкретный сервис
docker compose logs -f server
docker compose logs -f client
docker compose logs -f mongodb

# Последние N строк
docker compose logs --tail=100 server
```

### Мониторинг ресурсов
```bash
# Использование ресурсов контейнерами
docker stats

# Информация о томах
docker volume ls
docker volume inspect anime-site_mongodb_data

# Информация о сети
docker network ls
docker network inspect anime-site_anime-site-network
```

### Health checks
```bash
# Проверка здоровья всех сервисов
docker compose ps

# Ручная проверка API
curl http://localhost/health
curl http://localhost/api/health

# Проверка базы данных
docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Проверка Redis
docker compose exec redis redis-cli ping
```

## 🔒 Безопасность

### Обязательные меры безопасности

1. **Изменение паролей по умолчанию**
```bash
# В файле .env измените:
JWT_SECRET=ваш-уникальный-секрет
MONGO_PASSWORD=сложный-пароль
GRAFANA_PASSWORD=сложный-пароль
```

2. **Настройка HTTPS (для продакшена)**
```bash
# Создание директории для SSL сертификатов
mkdir -p nginx/ssl

# Размещение сертификатов
# nginx/ssl/cert.pem
# nginx/ssl/key.pem

# Раскомментирование HTTPS блока в nginx/conf.d/default.conf
```

3. **Ограничение доступа к портам**
```bash
# В продакшене закройте прямой доступ к:
# - MongoDB (27017)
# - Redis (6379)
# - Backend API (5000)

# Оставьте открытыми только:
# - HTTP (80)
# - HTTPS (443)
```

### Резервное копирование
```bash
# Создание бэкапа MongoDB
docker compose exec mongodb mongodump --out /data/backup

# Копирование бэкапа на хост
docker cp anime-site-mongodb:/data/backup ./backup

# Восстановление из бэкапа
docker compose exec mongodb mongorestore /data/backup
```

## 🔧 Устранение неполадок

### Частые проблемы и решения

#### 1. Контейнер не запускается
```bash
# Проверка логов
docker compose logs имя-сервиса

# Проверка конфигурации
docker compose config

# Пересборка образа
docker compose build --no-cache имя-сервиса
```

#### 2. Проблемы с подключением к базе данных
```bash
# Проверка статуса MongoDB
docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Проверка переменных окружения
docker compose exec server env | grep MONGODB

# Перезапуск сервисов
docker compose restart mongodb server
```

#### 3. Проблемы с файлами uploads
```bash
# Проверка прав доступа
docker compose exec server ls -la /app/uploads

# Создание директории если отсутствует
docker compose exec server mkdir -p /app/uploads
docker compose exec server chown -R nodejs:nodejs /app/uploads
```

#### 4. Проблемы с памятью
```bash
# Проверка использования памяти
docker stats

# Увеличение лимитов в docker-compose.yml
services:
  server:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

### Команды для диагностики
```bash
# Проверка всех контейнеров
docker ps -a

# Проверка образов
docker images

# Проверка сетей
docker network ls

# Проверка томов
docker volume ls

# Очистка неиспользуемых ресурсов
docker system prune -a
```

## ⚡ Производительность

### Оптимизация для продакшена

#### 1. Настройка ресурсов
```yaml
# В docker-compose.yml добавьте лимиты ресурсов
services:
  server:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
        reservations:
          cpus: '1.0'
          memory: 512M
```

#### 2. Кэширование
```bash
# Настройка Redis для кэширования
# Уже включен в конфигурацию

# Проверка работы кэша
docker compose exec redis redis-cli info memory
```

#### 3. Мониторинг производительности
```bash
# Доступ к Grafana
http://localhost:3001
# Логин: admin
# Пароль: из переменной GRAFANA_PASSWORD

# Доступ к Prometheus
http://localhost:9090
```

### Масштабирование
```bash
# Запуск нескольких экземпляров сервера
docker compose up -d --scale server=3

# Проверка балансировки нагрузки
docker compose ps server
```

## 🔄 Обновление приложения

### Обновление кода
```bash
# Остановка сервисов
docker compose down

# Получение обновлений
git pull origin main

# Пересборка образов
docker compose build

# Запуск обновленных сервисов
docker compose up -d
```

### Миграция данных
```bash
# Создание бэкапа перед обновлением
docker compose exec mongodb mongodump --out /data/backup

# После обновления при необходимости
docker compose exec server npm run migrate
```

## 📞 Поддержка

### Полезные команды
```bash
# Полная очистка и перезапуск
docker compose down -v
docker system prune -a
docker compose up -d

# Экспорт/импорт образов
docker save anime-site-server:latest | gzip > anime-site-server.tar.gz
docker load < anime-site-server.tar.gz

# Мониторинг в реальном времени
watch docker compose ps
```

### Контакты для поддержки
- **Документация**: README.md
- **Логи**: `docker compose logs -f`
- **Мониторинг**: http://localhost:3001 (Grafana)

---

**Примечание**: Данное руководство предполагает базовые знания Docker и Docker Compose. Для продакшн развертывания рекомендуется дополнительная настройка безопасности и мониторинга.