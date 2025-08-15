const axios = require('axios');
const { URL } = require('url');
const redis = require('../config/redis');
const logger = require('../config/logger');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../../shared/constants/constants');

/**
 * Сервис для проксирования стриминга Epic D2
 * Поддерживает Range заголовки, CORS, кэширование в Redis
 */
class StreamProxyService {
  constructor() {
    this.REDIS_TTL = parseInt(process.env.STREAM_CACHE_TTL || '300', 10); // 5 минут
    this.TIMEOUT_MS = parseInt(process.env.STREAM_PROXY_TIMEOUT || '30000', 10); // 30 секунд
    this.MAX_REDIRECTS = parseInt(process.env.STREAM_MAX_REDIRECTS || '5', 10);
    
    // Разрешенные типы контента для стриминга
    this.ALLOWED_CONTENT_TYPES = [
      'application/vnd.apple.mpegurl', // HLS m3u8
      'application/x-mpegURL',        // Alternative HLS m3u8
      'video/mp2t',                   // HLS .ts segments
      'video/mp4',                    // MP4 video
      'video/webm',                   // WebM video
      'audio/mp4',                    // MP4 audio
      'audio/webm',                   // WebM audio
      'text/plain',                   // Plain text files
      'text/vtt',                     // WebVTT subtitles
      'application/octet-stream'      // Binary/octet-stream
    ];
    
    // Whitelist доменов для стриминга
    this.STREAM_WHITELIST = (process.env.STREAM_WHITELIST || '').split(',').map(s => s.trim()).filter(Boolean);
  }

  /**
   * Основной метод проксирования
   */
  async proxyStream(req, res) {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.BAD_REQUEST,
          details: 'Missing url parameter'
        }
      });
    }

    try {
      // Генерируем ключ для кэша
      const cacheKey = this.generateCacheKey(targetUrl, req.headers.range);
      
      // Проверяем кэш
      const cachedResponse = await this.getCachedResponse(cacheKey);
      if (cachedResponse) {
        logger.debug('Stream served from cache', { url: targetUrl, cacheKey });
        return this.sendCachedResponse(res, cachedResponse);
      }

      // Проксируем запрос
      const upstreamResponse = await this.fetchUpstreamStream(targetUrl, req);
      
      // Валидируем контент
      if (!this.isValidContentType(upstreamResponse.headers['content-type'])) {
        logger.warn('Forbidden content type', { 
          url: targetUrl, 
          contentType: upstreamResponse.headers['content-type'] 
        });
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Forbidden content type',
            details: 'The requested content type is not allowed for streaming'
          }
        });
      }

      // Устанавливаем заголовки ответа
      this.setResponseHeaders(res, upstreamResponse, targetUrl);
      
      // Обрабатываем поток
      await this.handleStreamResponse(res, upstreamResponse, cacheKey);
      
    } catch (error) {
      logger.error('Stream proxy error', { 
        url: targetUrl, 
        error: error.message,
        stack: error.stack 
      });
      
      return this.handleProxyError(res, error);
    }
  }

  /**
   * Генерирует ключ для кэша на основе URL и Range заголовка
   */
  generateCacheKey(targetUrl, rangeHeader) {
    const urlHash = require('crypto')
      .createHash('md5')
      .update(targetUrl)
      .digest('hex');
    
    const rangeHash = rangeHeader ? 
      require('crypto')
        .createHash('md5')
        .update(rangeHeader)
        .digest('hex') : 'full';
    
    return `stream:${urlHash}:${rangeHash}`;
  }

  /**
   * Получает закэшированный ответ
   */
  async getCachedResponse(cacheKey) {
    try {
      const cachedData = await redis.get(cacheKey);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      logger.warn('Redis cache error', { error: error.message });
      return null;
    }
  }

  /**
   * Сохраняет ответ в кэш
   */
  async cacheResponse(cacheKey, response) {
    try {
      await redis.set(
        cacheKey, 
        JSON.stringify(response), 
        'EX', 
        this.REDIS_TTL
      );
    } catch (error) {
      logger.warn('Redis cache set error', { error: error.message });
    }
  }

  /**
   * Отправляет закэшированный ответ
   */
  sendCachedResponse(res, cachedResponse) {
    res.set(cachedResponse.headers);
    res.status(cachedResponse.status);
    return res.send(cachedResponse.data);
  }

  /**
   * Запрашивает поток с upstream сервера
   */
  async fetchUpstreamStream(targetUrl, req) {
    const forwardHeaders = {
      'User-Agent': req.get('User-Agent') || 'anime-site-stream-proxy/1.0',
      Accept: '*/*',
      Referer: req.get('Referer') || '',
      'Accept-Encoding': 'gzip, deflate, br',
    };
    
    // Forward Range header if present
    const rangeHeader = req.get('Range');
    if (rangeHeader) {
      forwardHeaders['Range'] = rangeHeader;
    }

    return axios.get(targetUrl, {
      headers: forwardHeaders,
      responseType: 'stream',
      timeout: this.TIMEOUT_MS,
      maxRedirects: this.MAX_REDIRECTS,
      decompress: true,
      validateStatus: (status) => status < 500
    });
  }

  /**
   * Проверяет тип контента
   */
  isValidContentType(contentType) {
    if (!contentType) return false;
    
    const normalizedType = contentType.split(';')[0].trim();
    
    // Проверяем разрешенные типы
    if (this.ALLOWED_CONTENT_TYPES.includes(normalizedType)) {
      return true;
    }
    
    // Дополнительно проверяем video/audio/text типы
    if (normalizedType.startsWith('video/') || 
        normalizedType.startsWith('audio/') || 
        normalizedType.startsWith('text/')) {
      return true;
    }
    
    return false;
  }

  /**
   * Устанавливает заголовки ответа
   */
  setResponseHeaders(res, upstreamResponse, targetUrl) {
    const corsOrigin = process.env.CORS_ALLOW_ORIGIN || '*';
    
    // CORS заголовки
    res.set({
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type, Authorization, X-Requested-With',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges, ETag, Last-Modified, Cache-Control',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    // Копируем релевантные заголовки
    const copyHeaders = [
      'content-type', 'content-length', 'content-range',
      'accept-ranges', 'etag', 'last-modified',
      'cache-control', 'content-disposition'
    ];
    
    copyHeaders.forEach(header => {
      const headerKey = header.toLowerCase();
      const value = upstreamResponse.headers[headerKey];
      if (value) {
        // Санитизация заголовков
        const sanitizedValue = String(value).replace(/[\r\n]/g, '');
        res.setHeader(header, sanitizedValue);
      }
    });

    // Обрабатываем статус код
    const upstreamStatus = upstreamResponse.status;
    if (upstreamStatus >= 400 && upstreamStatus < 500) {
      res.status(upstreamStatus);
    } else if (upstreamStatus >= 500) {
      res.status(HTTP_STATUS.BAD_GATEWAY);
    }
  }

  /**
   * Обрабатывает поток ответа
   */
  async handleStreamResponse(res, upstreamResponse, cacheKey) {
    const upstreamStream = upstreamResponse.data;
    let chunks = [];
    let totalLength = 0;

    // Собираем данные для кэширования (если это маленький ответ)
    const shouldCache = upstreamResponse.headers['content-length'] && 
                      parseInt(upstreamResponse.headers['content-length']) < 1024 * 1024; // < 1MB

    upstreamStream.on('data', (chunk) => {
      if (shouldCache) {
        chunks.push(chunk);
        totalLength += chunk.length;
      }
      res.write(chunk);
    });

    upstreamStream.on('end', () => {
      res.end();
      
      // Кэшируем маленькие ответы
      if (shouldCache && chunks.length > 0) {
        const fullResponse = Buffer.concat(chunks);
        this.cacheResponse(cacheKey, {
          headers: upstreamResponse.headers,
          status: res.statusCode,
          data: fullResponse.toString('base64')
        }).catch(error => {
          logger.warn('Failed to cache stream response', { error: error.message });
        });
      }
    });

    upstreamStream.on('error', (error) => {
      logger.error('Upstream stream error', { error: error.message });
      if (!res.headersSent) {
        res.status(HTTP_STATUS.BAD_GATEWAY).json({
          success: false,
          error: {
            message: 'Stream error',
            details: 'Error occurred while streaming data'
          }
        });
      } else {
        res.end();
      }
    });
  }

  /**
   * Обрабатывает ошибки проксирования
   */
  handleProxyError(res, error) {
    if (error.code === 'ECONNABORTED') {
      return res.status(HTTP_STATUS.GATEWAY_TIMEOUT).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.GATEWAY_TIMEOUT,
          details: 'Request to upstream server timed out'
        }
      });
    } else if (error.code === 'ENOTFOUND') {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.NOT_FOUND,
          details: 'Upstream server could not be found'
        }
      });
    } else if (error.response) {
      const upstreamStatus = error.response.status;
      return res.status(upstreamStatus).json({
        success: false,
        error: {
          message: error.response.statusText || 'Upstream error',
          status: upstreamStatus,
          details: 'Upstream server returned an error response'
        }
      });
    } else {
      return res.status(HTTP_STATUS.BAD_GATEWAY).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.BAD_GATEWAY,
          details: 'Failed to connect to upstream server'
        }
      });
    }
  }
}

// Создаем экземпляр сервиса
const streamProxyService = new StreamProxyService();

// Экспортируем метод проксирования
module.exports = {
  proxyStream: streamProxyService.proxyStream.bind(streamProxyService)
};