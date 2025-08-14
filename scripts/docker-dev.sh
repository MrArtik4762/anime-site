#!/bin/bash

# Скрипт для разработки с Docker

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_command() {
    echo -e "${BLUE}[CMD]${NC} $1"
}

# Проверка аргументов
if [ $# -eq 0 ]; then
    echo "Использование: $0 [command]"
    echo "Команды:"
    echo "  up        - Запустить сервисы в режиме разработки"
    echo "  down      - Остановить сервисы"
    echo "  restart   - Перезапустить сервисы"
    echo "  logs      - Показать логи"
    echo "  logs [service] - Показать логи конкретного сервиса"
    echo "  status    - Показать статус сервисов"
    echo "  shell [service] - Открыть shell в сервисе"
    echo "  exec [service] [command] - Выполнить команду в сервисе"
    echo "  dev       - Запустить в режиме разработки с hot-reload"
    exit 1
fi

# Основные команды
case "$1" in
    "up")
        log_info "Запуск сервисов в режиме разработки..."
        docker-compose up -d
        sleep 5
        log_info "Проверка состояния сервисов..."
        docker-compose ps
        ;;
        
    "down")
        log_info "Остановка сервисов..."
        docker-compose down
        ;;
        
    "restart")
        log_info "Перезапуск сервисов..."
        docker-compose restart
        ;;
        
    "logs")
        if [ -n "$2" ]; then
            log_command "docker-compose logs -f $2"
            docker-compose logs -f "$2"
        else
            log_command "docker-compose logs -f"
            docker-compose logs -f
        fi
        ;;
        
    "status")
        log_info "Статус сервисов:"
        docker-compose ps
        ;;
        
    "shell")
        if [ -z "$2" ]; then
            log_error "Укажите сервис для открытия shell"
            exit 1
        fi
        log_command "docker-compose exec $2 sh"
        docker-compose exec "$2" sh
        ;;
        
    "exec")
        if [ -z "$2" ] || [ -z "$3" ]; then
            log_error "Использование: $0 exec [service] [command]"
            exit 1
        fi
        shift
        shift
        log_command "docker-compose exec $@"
        docker-compose exec "$@"
        ;;
        
    "dev")
        log_info "Запуск в режиме разработки с hot-reload..."
        
        # Запуск зависимостей
        log_info "Запуск зависимостей (PostgreSQL, Redis, Nginx)..."
        docker-compose up -d postgres redis nginx hls
        
        # Ожидание запуска базы данных
        log_info "Ожидание запуска базы данных..."
        until docker-compose exec -T postgres pg_isready -U anime -d anime_db; do
            >&2 echo "PostgreSQL недоступен - ожидание..."
            sleep 2
        done
        
        # Запуск сервера в режиме разработки
        log_info "Запуск сервера в режиме разработки..."
        docker-compose up -d server
        
        # Мониторинг логов
        log_info "Мониторинг логов (Ctrl+C для остановки)..."
        docker-compose logs -f server
        ;;
        
    "build")
        log_info "Построение образов..."
        docker-compose build --no-cache "$2"
        ;;
        
    "clean")
        log_info "Остановка и очистка контейнеров и образов..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        ;;
        
    "health")
        log_info "Проверка здоровья сервисов..."
        services=("postgres" "redis" "server" "client" "nginx")
        for service in "${services[@]}"; do
            if docker-compose ps "$service" | grep -q "Up"; then
                log_info "$service: Запущен"
                
                # Проверка healthcheck для сервисов, где он есть
                case "$service" in
                    "postgres")
                        if docker-compose exec -T postgres pg_isready -U anime -d anime_db > /dev/null 2>&1; then
                            log_info "$service: База данных доступна"
                        else
                            log_warn "$service: База данных недоступна"
                        fi
                        ;;
                    "redis")
                        if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
                            log_info "$service: Redis доступен"
                        else
                            log_warn "$service: Redis недоступен"
                        fi
                        ;;
                esac
            else
                log_error "$service: Остановлен"
            fi
        done
        ;;
        
    "migrate")
        log_info "Запуск миграций базы данных..."
        docker-compose exec server npm run migrate:latest
        ;;
        
    "seed")
        log_info "Заполнение базы данных тестовыми данными..."
        docker-compose exec server npm run seed:run
        ;;
        
    *)
        log_error "Неизвестная команда: $1"
        echo "Использование: $0 [command]"
        echo "Команды:"
        echo "  up        - Запустить сервисы"
        echo "  down      - Остановить сервисы"
        echo "  restart   - Перезапустить сервисы"
        echo "  logs      - Показать логи"
        echo "  logs [service] - Показать логи конкретного сервиса"
        echo "  status    - Показать статус сервисов"
        echo "  shell [service] - Открыть shell в сервисе"
        echo "  exec [service] [command] - Выполнить команду в сервисе"
        echo "  dev       - Запустить в режиме разработки"
        echo "  build [service] - Построить образ сервиса"
        echo "  clean     - Очистка"
        echo "  health    - Проверка здоровья сервисов"
        echo "  migrate   - Запустить миграции"
        echo "  seed      - Заполнить тестовыми данными"
        exit 1
        ;;
esac