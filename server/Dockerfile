# Multi-stage build for production
# Используем конкретную версию вместо :latest для безопасности
FROM node:18.18.0-alpine3.18 AS deps
WORKDIR /app

# Установка переменных окружения для безопасности
ENV NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=error \
    NPM_CONFIG_PRODUCTION=true \
    NPM_CONFIG_UNSAFE_PERM=false

# Установка временной зоны для UTC
ENV TZ=UTC

# Copy package files
COPY package*.json ./

# Install dependencies with enhanced security
RUN npm ci --only=production --no-audit --no-fund --ignore-scripts

# Build stage
FROM node:18.18.0-alpine3.18 AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18.18.0-alpine3.18 AS production
WORKDIR /app

# Установка переменных окружения
ENV NODE_ENV=production \
    PORT=5000 \
    PATH=/usr/local/bin:$PATH

# Create non-root user with restricted privileges
RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -s /sbin/nologin -G nodejs && \
    mkdir -p /app /app/logs /app/data /app/tmp && \
    chown -R appuser:nodejs /app

# Copy built application
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/package*.json ./

# Create directories for logs and data with proper permissions
RUN mkdir -p /app/logs /app/data /app/tmp && \
    touch /app/logs/app.log && \
    chmod 750 /app/logs /app/data /app/tmp && \
    chown -R appuser:nodejs /app/logs /app/data /app/tmp

# Set correct permissions and remove unnecessary files
RUN chown -R appuser:nodejs /app && \
    find /app -type f -name "*.js" -exec chmod 640 {} \; && \
    find /app -type f -name "*.json" -exec chmod 640 {} \; && \
    find /app -type d -exec chmod 750 {} \; && \
    rm -rf /app/.git /app/.npm /app/.cache /app/docs

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5000

# Health check with enhanced security
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); const options = { hostname: 'localhost', port: 5000, path: '/health', timeout: 5000, headers: { 'User-Agent': 'healthcheck' } }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

# Start the application with enhanced security
CMD ["node", "--max-old-space-size=512", "--no-deprecation", "--trace-warnings", "dist/index.js"]
