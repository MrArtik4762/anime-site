#!/bin/bash

# Скрипт для установки и настройки Docker окружения аниме-сайта

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка Docker и Docker Compose
check_prerequisites() {
    log_info "Проверка предпосылок..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker не установлен. Пожалуйста, установите Docker."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose не установлен. Пожалуйста, установите Docker Compose."
        exit 1
    fi
    
    log_info "Docker и Docker Compose установлены."
}

# Создание директорий
create_directories() {
    log_info "Создание необходимых директорий..."
    
    mkdir -p ssl
    mkdir -p logs
    mkdir -p data/postgres
    mkdir -p data/redis
    mkdir -p data/hls
    
    log_info "Директории созданы."
}

# Копирование .env файла
copy_env_file() {
    if [ ! -f .env ]; then
        log_info "Копирование .env файла..."
        cp .env.example .env
        log_warn "Пожалуйста, отредактируйте .env файл перед запуском."
        log_warn "Особенно измените JWT_SECRET и другие секретные ключи."
    else
        log_info "Файл .env уже существует."
    fi
}

# Проверка и создание SSL сертификатов (опционально)
setup_ssl() {
    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
        log_warn "SSL сертификаты не найдены. Создание самоподписанных сертификатов..."
        
        openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
            -subj "/C=RU/ST=Moscow/L=Moscow/O=AnimeSite/CN=localhost"
        
        log_info "SSL сертификаты созданы."
    else
        log_info "SSL сертификаты уже существуют."
    fi
}

# Построение образов Docker
build_images() {
    log_info "Построение Docker образов..."
    docker-compose build --no-cache
    log_info "Docker образы построены."
}

# Запуск сервисов
start_services() {
    log_info "Запуск сервисов..."
    docker-compose up -d
    
    log_info "Ожидание запуска сервисов..."
    sleep 10
    
    # Проверка состояния сервисов
    log_info "Проверка состояния сервисов..."
    docker-compose ps
}

# Инициализация базы данных
init_database() {
    log_info "Инициализация базы данных..."
    
    # Ожидание запуска PostgreSQL
    until docker-compose exec -T postgres pg_isready -U anime -d anime_db; do
        >&2 echo "PostgreSQL недоступен - ожидание..."
        sleep 2
    done
    
    log_info "PostgreSQL готов к работе."
    
    # Запуск миграций
    log_info "Запуск миграций базы данных..."
    docker-compose exec server npm run migrate:latest
    
    log_info "База данных инициализирована."
}

# Основная функция
main() {
    log_info "Начало установки Docker окружения для AnimeSite..."
    
    check_prerequisites
    create_directories
    copy_env_file
    setup_ssl
    build_images
    start_services
    init_database
    
    log_info "Установка Docker окружения завершена!"
    log_info "Сервисы доступны по адресу: http://localhost:8080"
    log_info "API доступен по адресу: http://localhost:8080/api"
    log_info "Для просмотра логов используйте: docker-compose logs -f [service_name]"
    log_info "Для остановки сервисов используйте: docker-compose down"
}

# Запуск основной функции
main "$@"