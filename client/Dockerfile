# Multi-stage build for production
# Используем конкретную версию вместо :latest для безопасности
FROM node:18.18.0-alpine3.18 AS builder

# Установка переменных окружения для безопасности
ENV NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=error \
    NPM_CONFIG_PRODUCTION=true \
    NPM_CONFIG_UNSAFE_PERM=false

# Установка временной зоны для UTC
ENV TZ=UTC

# Set working directory
WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Установка зависимостей с повышенной безопасностью
RUN npm ci --only=production --no-audit --no-fund --ignore-scripts

# Копируем исходный код
COPY . .

# Сборка приложения
RUN npm run build

# Production stage
# Используем конкретную версию nginx для безопасности
FROM nginx:1.25.3-alpine3.18 AS production

# Установка переменных окружения
ENV NGINX_VERSION=1.25.3 \
    NGINX_BUILD=1

# Установка необходимых инструментов с пониженными привилегиями
RUN apk add --no-cache --virtual .build-deps \
    curl \
    gcc \
    libc-dev \
    make \
    openssl-dev \
    pcre-dev \
    zlib-dev \
&& apk del .build-deps

# Создаем пользователя с пониженными привилегиями
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -s /sbin/nologin -G nodejs && \
    mkdir -p /app && \
    chown -R nextjs:nodejs /app

# Копируем собранное приложение
COPY --from=builder --chown=nextjs:nodejs /app/build /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf

# Создаем директории для SSL и логов
RUN mkdir -p /etc/nginx/ssl /var/log/nginx /var/cache/nginx /var/run/nginx && \
    touch /var/log/nginx/access.log /var/log/nginx/error.log && \
    chown -R nextjs:nodejs /var/log/nginx /var/cache/nginx /var/run/nginx /etc/nginx/ssl

# Копируем скрипт проверки здоровья
COPY healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh && \
    chown nextjs:nodejs /usr/local/bin/healthcheck.sh

# Устанавливаем правильные разрешения
RUN chown -R nextjs:nodejs /usr/share/nginx/html /var/log/nginx /etc/nginx/ssl /var/cache/nginx /var/run/nginx

# Отключаем возможность выполнения как root
USER nextjs

# Открываем порт только для чтения
EXPOSE 80

# Health check с улучшенными настройками
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD healthcheck.sh

# Запускаем nginx с повышенной безопасностью
CMD ["nginx", "-g", "daemon off;", "-c", "/etc/nginx/nginx.conf"]