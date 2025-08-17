/**
 * server/routes/stream.js
 *
 * Endpoint: GET /api/stream?url=<encoded>
 * - Специализированный прокси для стриминга Epic D2
 * - Поддержка Range заголовков для стриминга с паузой
 * - CORS заголовки для кросс-доменных запросов
 * - Кэширование в Redis для снижения нагрузки
 * - Корректные Content-Type заголовков
 * - Rate limiting для защиты от злоупотреблений
 */

import express from 'express';
import { Router } from 'express';
import streamProxyService from '../services/streamProxy.js';
import { videoLimiter } from '../middleware/rateLimiter.js';
import { validateQueryParams } from '../middleware/paramValidator.js';
import * as streamValidationMiddleware from '../middleware/streamValidation.js';
import * as streamSecurityMiddleware from '../middleware/streamSecurity.js';
import * as streamLoggingMiddleware from '../middleware/streamLogging.js';

const router = Router();

// Middleware для валидации query параметров
const validateStreamQuery = validateQueryParams('stream');

// Основной endpoint для стриминга
router.get('/stream',
  videoLimiter, // Rate limiting
  streamValidationMiddleware.validateStreamQuery, // Валидация параметров
  streamValidationMiddleware.validateStreamUrl, // Проверка формата URL
  streamValidationMiddleware.validateRangeHeader, // Проверка Range заголовков
  streamSecurityMiddleware.streamSecurityMiddleware, // Проверка безопасности
  streamSecurityMiddleware.validateUserAgent, // Проверка User-Agent
  streamLoggingMiddleware.streamLoggingMiddleware, // Логирование запросов
  streamLoggingMiddleware.streamMetricsMiddleware, // Сбор метрик
  streamLoggingMiddleware.detailedLoggingMiddleware, // Детальное логирование
  streamLoggingMiddleware.patternAnalysisMiddleware, // Анализ паттернов
  streamProxyService.proxyStream // Проксирование
);

// Обработка OPTIONS запросов для CORS
router.options('/stream', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Range, Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  });
  res.status(204).end();
});

export default router;