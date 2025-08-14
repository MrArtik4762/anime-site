/**
 * server/routes/episode.js
 *
 * Endpoint: GET /api/episode/:id
 * - Запрашивает данные эпизода у внешнего API (ANILIBERTY_API_BASE)
 * - Кэширует ответ в Redis (если указан REDIS_URL)
 * - Возвращает фронтенду унифицированную структуру:
 *   { id, title, description, sources: [{ url, quality, subtitles }], sourceUrl }
 * - Улучшенная нормализация sources и обработка ошибок
 */

const express = require('express');
const axios = require('axios');
const { URL } = require('url');

const router = express.Router();

// Попытка подключить Redis, но не фейлить если его нет
let redis = null;
let redisConnected = false;
try {
  const Redis = require('ioredis');
  const REDIS_URL = process.env.REDIS_URL || null;
  if (REDIS_URL) {
    redis = new Redis(REDIS_URL, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableReadyCheck: true,
      connectTimeout: 5000,
      commandTimeout: 5000
    });
    
    // Test Redis connection
    redis.on('connect', () => {
      console.log('Redis connected successfully');
      redisConnected = true;
    });
    
    redis.on('error', (err) => {
      console.warn('Redis connection error:', err.message);
      redisConnected = false;
    });
    
    redis.on('ready', () => {
      console.log('Redis ready for commands');
      redisConnected = true;
    });
    
    redis.on('close', () => {
      console.log('Redis connection closed');
      redisConnected = false;
    });
  }
} catch (e) {
  // no redis installed / configured — fallback to no-cache mode
  console.warn('Redis not available, using fallback caching');
  redis = null;
}

const ANILIB_BASE = process.env.ANILIBERTY_API_BASE || process.env.ANILIB_API_BASE || 'https://anilibria.top/api';
const CACHE_TTL = parseInt(process.env.EPISODE_CACHE_TTL, 10) || 60 * 5; // 5 мин
const API_TIMEOUT = parseInt(process.env.EPISODE_API_TIMEOUT, 10) || 15000; // 15 сек
const MAX_RETRIES = parseInt(process.env.EPISODE_MAX_RETRIES, 10) || 2;

// Enhanced URL validation and normalization
function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

// Enhanced source normalization with better error handling
function normalizeSource(source, index) {
  if (!source || typeof source !== 'object') {
    console.warn(`Invalid source at index ${index}:`, source);
    return null;
  }
  
  // Extract URL from various possible fields
  const rawUrl = source.url || source.file || source.link || source.src;
  if (!rawUrl || !isValidUrl(rawUrl)) {
    console.warn(`Invalid URL for source at index ${index}:`, rawUrl);
    return null;
  }
  
  // Normalize quality
  const quality = source.quality || source.label || source.resolution ||
                  source.height || source.bitrate || 'auto';
  
  // Normalize type
  let type = source.type || 'hls';
  if (rawUrl.includes('.mp4')) type = 'mp4';
  else if (rawUrl.includes('.webm')) type = 'webm';
  else if (rawUrl.includes('.m3u8')) type = 'hls';
  
  // Normalize subtitles
  const subtitles = [];
  if (Array.isArray(source.subtitles || source.subs)) {
    (source.subtitles || source.subs).forEach((sub, subIndex) => {
      if (sub && typeof sub === 'object') {
        const subUrl = sub.url || sub.file || sub.link;
        if (subUrl && isValidUrl(subUrl)) {
          subtitles.push({
            lang: sub.lang || sub.language || sub.code || 'unknown',
            url: proxiedUrlFor(subUrl),
            label: sub.label || sub.lang || sub.language || sub.title || `Subtitles ${subIndex + 1}`,
            kind: sub.kind || 'subtitles',
            default: sub.default || false
          });
        }
      }
    });
  }
  
  return {
    url: proxiedUrlFor(rawUrl),
    quality: String(quality),
    type: type.toLowerCase(),
    subtitles: subtitles.length > 0 ? subtitles : undefined,
    size: source.size || undefined,
    bitrate: source.bitrate || undefined,
    fps: source.fps || undefined,
    codec: source.codec || undefined
  };
}

// Enhanced cache function with retry logic
async function fetchWithCache(key, url, opts = {}) {
  // Check cache first if Redis is available and connected
  if (redis && redisConnected) {
    try {
      const cached = await redis.get(key);
      if (cached) {
        console.log(`Cache hit for key: ${key}`);
        return JSON.parse(cached);
      }
    } catch (err) {
      console.warn('Redis read error:', err.message);
    }
  }
  
  // Fetch with retry logic
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Fetching episode data (attempt ${attempt}/${MAX_RETRIES}): ${url}`);
      
      const response = await axios.get(url, {
        ...opts,
        timeout: API_TIMEOUT,
        validateStatus: (status) => status < 500,
        headers: {
          'User-Agent': process.env.SERVER_USER_AGENT || 'anime-site-proxy/1.0',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate, br',
          ...opts.headers
        }
      });
      
      const data = response.data;
      
      // Cache the response if Redis is available and connected
      if (redis && redisConnected) {
        try {
          await redis.set(key, JSON.stringify(data), 'EX', CACHE_TTL);
          console.log(`Cached response for key: ${key}`);
        } catch (err) {
          console.warn('Redis set error:', err.message);
        }
      }
      
      return data;
      
    } catch (err) {
      lastError = err;
      console.warn(`Attempt ${attempt} failed:`, err.message);
      
      if (attempt === MAX_RETRIES) {
        console.error('All retry attempts exhausted');
        break;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Failed to fetch episode data');
}

// Enhanced URL proxy function with validation
function proxiedUrlFor(src) {
  if (!src || !isValidUrl(src)) {
    console.warn('Invalid URL provided to proxiedUrlFor:', src);
    return null;
  }
  return `/api/proxy?url=${encodeURIComponent(src)}`;
}

// Enhanced error response function
function createErrorResponse(message, status = 500, details = {}) {
  const error = {
    error: message,
    status: status,
    timestamp: new Date().toISOString(),
    ...details
  };
  
  if (process.env.NODE_ENV === 'development') {
    error.stack = new Error().stack;
  }
  
  return error;
}

router.get('/episode/:id', async (req, res) => {
  const id = req.params.id;
  if (!id || !/^[a-zA-Z0-9\-_]+$/.test(id)) {
    return res.status(400).json(createErrorResponse('Invalid episode ID', 400));
  }

  const cacheKey = `episode:${id}`;
  const startTime = Date.now();
  
  try {
    // Construct API URL with multiple fallback options
    const apiEndpoints = [
      `${ANILIB_BASE}/v1/episode/${encodeURIComponent(id)}`,
      `${ANILIB_BASE}/episode/${encodeURIComponent(id)}`,
      `${ANILIB_BASE}/media/${encodeURIComponent(id)}`
    ];
    
    let data = null;
    let lastApiError = null;
    
    // Try different API endpoints
    for (const apiUrl of apiEndpoints) {
      try {
        const apiOpts = {
          headers: {
            'User-Agent': process.env.SERVER_USER_AGENT || 'anime-site-proxy/1.0',
            'Accept': 'application/json',
            'Referer': req.get('Referer') || ANILIB_BASE
          },
          timeout: API_TIMEOUT
        };

        data = await fetchWithCache(cacheKey, apiUrl, apiOpts);
        if (data) break;
      } catch (err) {
        lastApiError = err;
        console.warn(`API endpoint failed: ${apiUrl}`, err.message);
        continue;
      }
    }
    
    if (!data) {
      throw lastApiError || new Error('All API endpoints failed');
    }

    // Enhanced source processing with validation
    const sourcesRaw = data.sources || data.media || data.videos || data.files || [];
    const sources = [];
    
    if (Array.isArray(sourcesRaw)) {
      sourcesRaw.forEach((source, index) => {
        const normalized = normalizeSource(source, index);
        if (normalized) {
          sources.push(normalized);
        }
      });
    } else {
      console.warn('Sources data is not an array:', sourcesRaw);
    }
    
    // Enhanced result structure
    const result = {
      id,
      title: data.title || data.name || data.anime?.title || data.series?.title || `Episode ${id}`,
      description: data.description || data.synopsis || data.summary || null,
      sources: sources.length > 0 ? sources : [],
      sourceUrl: data.url || data.source || data.origin || data.anime?.url || data.series?.url || null,
      duration: data.duration || data.episode_duration || null,
      episodeNumber: data.episode_number || data.number || null,
      season: data.season || data.anime?.season || null,
      timestamp: Date.now(),
      cacheStatus: redisConnected ? 'HIT' : 'MISS',
      responseTime: Date.now() - startTime
    };

    // Add debug info in development
    if (process.env.NODE_ENV === 'development') {
      result.debug = {
        rawSources: sourcesRaw,
        normalizedSources: sources,
        apiEndpoints: apiEndpoints,
        redisAvailable: !!redis,
        redisConnected: redisConnected
      };
    }

    return res.json(result);
    
  } catch (err) {
    const requestTime = Date.now() - startTime;
    console.error(`GET /api/episode/${id} failed after ${requestTime}ms:`, err.message);
    
    // Enhanced error handling with detailed responses
    if (err.code === 'ECONNABORTED') {
      return res.status(504).json(createErrorResponse(
        'Request timeout',
        504,
        { originalError: err.message, requestTime }
      ));
    } else if (err.code === 'ENOTFOUND') {
      return res.status(404).json(createErrorResponse(
        'API endpoint not found',
        404,
        { originalError: err.message }
      ));
    } else if (err.response) {
      // Axios response error
      const status = err.response.status;
      const message = err.response.statusText || 'API request failed';
      
      // Log detailed error for debugging
      console.error(`API responded with status ${status}:`, {
        status,
        statusText: err.response.statusText,
        data: err.response.data,
        headers: err.response.headers
      });
      
      return res.status(status).json(createErrorResponse(
        message,
        status,
        {
          originalError: err.message,
          apiResponse: err.response.data,
          requestTime
        }
      ));
    } else {
      // Network or other errors
      return res.status(502).json(createErrorResponse(
        'Failed to fetch episode data',
        502,
        { originalError: err.message, requestTime }
      ));
    }
  }
});

module.exports = router;