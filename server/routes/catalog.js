const express = require('express');
const router = express.Router();
const catalogService = require('../services/catalogService');
const analyticsService = require('../services/analyticsService');
const cacheService = require('../services/cacheService');
const { logger } = require('../utils/logger');

// Основной эндпоинт каталога
router.get('/', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 24,
      genres,
      year,
      season,
      order,
      sort,
      filter
    } = req.query;
    
    const startTime = Date.now();
    
    // Логирование запроса к каталогу
    console.log('📚 [CATALOG] Запрос к основному каталогу:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      query: req.query,
      hasAuth: !!req.user,
      userId: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
    
    console.log('📚 [CATALOG] Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
    console.log('📚 [CATALOG] Cookies:', Object.keys(req.cookies));
    
    // Определяем тип запроса на основе параметров
    const type = filter || (order === 'popular' ? 'popular' : 'all');
    
    const options = {
      type,
      page: Number(page),
      limit: Math.min(Number(limit) || 24, 60),
      genres: genres ? String(genres).split(',') : [],
      year: year ? Number(year) : undefined,
      sortBy: order || sort || 'rating',
      sortOrder: 'desc'
    };
    
    const result = await catalogService.getAnimeWithFallback(options);
    
    // Формируем стандартный ответ
    const response = {
      success: true,
      data: {
        items: result.list,
        total: result.pagination.total,
        page: result.pagination.page,
        pages: result.pagination.pages,
        limit: result.pagination.limit,
        filter: type,
        source: result.source,
        timestamp: result.timestamp,
        error: result.error || null
      }
    };
    
    // Устанавливаем заголовки кэширования
    res.set({
      'Cache-Control': `public, s-maxage=300, stale-while-revalidate=600`,
      'X-Data-Source': result.source
    });
    
    // Логирование ответа
    console.log('📚 [CATALOG] Ответ отправлен:', {
      statusCode: res.statusCode,
      itemCount: result.list?.length || 0,
      source: result.source,
      hasError: !!result.error,
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
    
    res.json(response);
    
  } catch (error) {
    logger.error('Catalog route error:', error);
    next(error);
  }
});

// Эндпоинт для популярных аниме
router.get('/popular', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 24,
      genres,
      year,
      season,
      type: animeType
    } = req.query;
    
    // Используем сервис каталога для получения популярных аниме
    const result = await catalogService.getAnimeWithFallback({
      type: 'popular',
      page: Number(page),
      limit: Math.min(Number(limit) || 24, 60),
      genres: genres ? String(genres).split(',') : [],
      year: year ? Number(year) : undefined,
      season: season || undefined,
      type: animeType || undefined,
      sortBy: 'rating_score',
      sortOrder: 'desc'
    });
    
    const response = {
      success: true,
      data: {
        items: result.list,
        total: result.pagination.total,
        page: result.pagination.page,
        pages: result.pagination.pages,
        limit: result.pagination.limit,
        filter: 'popular',
        source: result.source,
        timestamp: result.timestamp,
        error: result.error || null
      }
    };
    
    res.set({
      'Cache-Control': `public, s-maxage=300, stale-while-revalidate=600`,
      'X-Data-Source': result.source
    });
    
    res.json(response);
    
  } catch (error) {
    logger.error('Popular catalog route error:', error);
    next(error);
  }
});

// Эндпоинт для новых эпизодов
router.get('/new-episodes', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 24,
      genres,
      year,
      season,
      type: animeType
    } = req.query;
    
    // Используем сервис каталога для получения последних эпизодов
    const result = await catalogService.getAnimeWithFallback({
      type: 'new-episodes',
      page: Number(page),
      limit: Math.min(Number(limit) || 24, 60),
      genres: genres ? String(genres).split(',') : [],
      year: year ? Number(year) : undefined,
      season: season || undefined,
      type: animeType || undefined,
      sortBy: 'updated_at',
      sortOrder: 'desc'
    });
    
    const response = {
      success: true,
      data: {
        items: result.list,
        total: result.pagination.total,
        page: result.pagination.page,
        pages: result.pagination.pages,
        limit: result.pagination.limit,
        filter: 'new-episodes',
        source: result.source,
        timestamp: result.timestamp,
        error: result.error || null
      }
    };
    
    res.set({
      'Cache-Control': `public, s-maxage=60, stale-while-revalidate=120`,
      'X-Data-Source': result.source
    });
    
    res.json(response);
    
  } catch (error) {
    logger.error('New episodes catalog route error:', error);
    next(error);
  }
});

// Эндпоинт для новых аниме
router.get('/new', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 24,
      days = 7,
      genres,
      year,
      season,
      type: animeType
    } = req.query;
    
    // Используем сервис каталога для получения новых аниме
    const result = await catalogService.getAnimeWithFallback({
      type: 'new',
      page: Number(page),
      limit: Math.min(Number(limit) || 24, 60),
      genres: genres ? String(genres).split(',') : [],
      year: year ? Number(year) : undefined,
      season: season || undefined,
      type: animeType || undefined,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
    
    const response = {
      success: true,
      data: {
        items: result.list,
        total: result.pagination.total,
        page: result.pagination.page,
        pages: result.pagination.pages,
        limit: result.pagination.limit,
        filter: 'new',
        source: result.source,
        timestamp: result.timestamp,
        error: result.error || null
      }
    };
    
    res.set({
      'Cache-Control': `public, s-maxage=300, stale-while-revalidate=600`,
      'X-Data-Source': result.source
    });
    
    res.json(response);
    
  } catch (error) {
    logger.error('New catalog route error:', error);
    next(error);
  }
});

// Эндпоинт для высокорейтинговых аниме
router.get('/rating', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 24,
      genres,
      year,
      season,
      type: animeType
    } = req.query;
    
    const result = await catalogService.getAnimeWithFallback({
      type: 'rating',
      page: Number(page),
      limit: Math.min(Number(limit) || 24, 60),
      genres: genres ? String(genres).split(',') : [],
      year: year ? Number(year) : undefined,
      season: season || undefined,
      type: animeType || undefined,
      sortBy: 'rating_score',
      sortOrder: 'desc'
    });
    
    const response = {
      success: true,
      data: {
        items: result.list,
        total: result.pagination.total,
        page: result.pagination.page,
        pages: result.pagination.pages,
        limit: result.pagination.limit,
        filter: 'rating',
        source: result.source,
        timestamp: result.timestamp,
        error: result.error || null
      }
    };
    
    res.set({
      'Cache-Control': `public, s-maxage=300, stale-while-revalidate=600`,
      'X-Data-Source': result.source
    });
    
    res.json(response);
    
  } catch (error) {
    logger.error('Rating catalog route error:', error);
    next(error);
  }
});

// Эндпоинт для трендовых аниме
router.get('/trending', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 24,
      genres,
      year,
      season,
      type: animeType
    } = req.query;
    
    // Используем сервис каталога для получения трендовых аниме
    const result = await catalogService.getAnimeWithFallback({
      type: 'trending',
      page: Number(page),
      limit: Math.min(Number(limit) || 24, 60),
      genres: genres ? String(genres).split(',') : [],
      year: year ? Number(year) : undefined,
      season: season || undefined,
      type: animeType || undefined,
      sortBy: 'popularity',
      sortOrder: 'desc'
    });
    
    const response = {
      success: true,
      data: {
        items: result.list,
        total: result.pagination.total,
        page: result.pagination.page,
        pages: result.pagination.pages,
        limit: result.pagination.limit,
        filter: 'trending',
        source: result.source,
        timestamp: result.timestamp,
        error: result.error || null
      }
    };
    
    res.set({
      'Cache-Control': `public, s-maxage=300, stale-while-revalidate=600`,
      'X-Data-Source': result.source
    });
    
    res.json(response);
    
  } catch (error) {
    logger.error('Trending catalog route error:', error);
    next(error);
  }
});

// Эндпоинт для поиска
router.get('/search', async (req, res, next) => {
  try {
    const { q, page = 1, limit = 24, sort } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Поисковый запрос обязателен'
      });
    }
    
    const result = await catalogService.getAnimeWithFallback({
      type: 'search',
      query: String(q).trim(),
      page: Number(page),
      limit: Math.min(Number(limit) || 24, 60),
      sortBy: sort || 'rating',
      sortOrder: 'desc'
    });
    
    const response = {
      success: true,
      data: {
        items: result.list,
        total: result.pagination.total,
        page: result.pagination.page,
        pages: result.pagination.pages,
        limit: result.pagination.limit,
        query: q,
        filter: 'search',
        source: result.source,
        timestamp: result.timestamp,
        error: result.error || null
      }
    };
    
    // Для поисковых запросов используем более короткое кэширование
    res.set({
      'Cache-Control': `public, s-maxage=60, stale-while-revalidate=120`,
      'X-Data-Source': result.source
    });
    
    res.json(response);
    
  } catch (error) {
    logger.error('Search catalog route error:', error);
    next(error);
  }
});

// Эндпоинт для получения конкретного аниме
router.get('/title/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Ищем в кэше или базе данных
    const result = await catalogService.getAnimeWithFallback({
      type: 'search',
      query: id,
      limit: 1
    });
    
    if (!result.list || result.list.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Аниме не найдено'
      });
    }
    
    const response = {
      success: true,
      data: {
        item: result.list[0],
        source: result.source,
        timestamp: result.timestamp
      }
    };
    
    res.json(response);
    
  } catch (error) {
    logger.error('Title catalog route error:', error);
    next(error);
  }
});

// Эндпоинт для очистки кэша
router.delete('/cache', async (req, res, next) => {
  try {
    catalogService.clearCache();
    
    res.json({
      success: true,
      message: 'Кэш каталога очищен',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Cache clear error:', error);
    next(error);
  }
});

// Эндпоинт для статистики кэша
router.get('/cache/stats', async (req, res, next) => {
  try {
    const stats = catalogService.getCacheStats();
    
    res.json({
      success: true,
      data: {
        ...stats,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    logger.error('Cache stats error:', error);
    next(error);
  }
});

module.exports = router;