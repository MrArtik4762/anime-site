import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const router = express.Router();
import { metricsConfig } from '../config/metrics.js';
import { logger } from '../config/logger.js';

/**
 * Роуты для сбора метрик Prometheus
 */

/**
 * Базовый endpoint для сбора метрик
 */
router.get('/', async (req, res) => {
  try {
    const metrics = await metricsConfig.getMetrics();
    
    // Устанавливаем правильный заголовок для Prometheus
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
    
    // Логируем запрос метрик
    logger.debug('Metrics endpoint accessed', {
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  } catch (error) {
    logger.error('Failed to get metrics', { error: error.message, stack: error.stack });
    
    res.status(500).send('Error: Failed to get metrics');
  }
});

/**
 * Endpoint для метрик в формате JSON
 */
router.get('/json', async (req, res) => {
  try {
    const metrics = await metricsConfig.getMetricsAsJson();
    
    res.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString(),
      metadata: {
        version: process.env.RELEASE || 'unknown',
        environment: process.env.NODE_ENV || 'development',
        app: 'anime-site'
      }
    });
  } catch (error) {
    logger.error('Failed to get metrics as JSON', { error: error.message, stack: error.stack });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get metrics',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Endpoint для сбора метрик по конкретным метрикам
 */
router.get('/specific/:metricName', async (req, res) => {
  try {
    const { metricName } = req.params;
    
    // Проверяем, существует ли запрошенная метрика
    const metric = metricsConfig.register.getSingleMetricAsString(metricName);
    
    if (!metric) {
      return res.status(404).json({
        success: false,
        error: `Metric '${metricName}' not found`,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      metric: metricName,
      value: metric,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get specific metric', { 
      metricName: req.params.metricName,
      error: error.message,
      stack: error.stack 
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get metric',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Endpoint для сбора метрик по категориям
 */
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const allMetrics = await metricsConfig.getMetrics();
    
    // Фильтруем метрики по категории
    const filteredMetrics = allMetrics
      .split('\n')
      .filter(line => line.startsWith(`${category}_`))
      .join('\n');
    
    if (!filteredMetrics) {
      return res.status(404).json({
        success: false,
        error: `No metrics found for category '${category}'`,
        timestamp: new Date().toISOString()
      });
    }
    
    res.set('Content-Type', 'text/plain');
    res.send(filteredMetrics);
  } catch (error) {
    logger.error('Failed to get metrics by category', { 
      category: req.params.category,
      error: error.message,
      stack: error.stack 
    });
    
    res.status(500).send('Error: Failed to get metrics by category');
  }
});

/**
 * Endpoint для сбора метрик за определенный период
 */
router.get('/range', async (req, res) => {
  try {
    const { start, end } = req.query;
    
    // В реальном приложении здесь была бы логика сбора метрик за период
    // Для примера просто возвращаем текущие метрики с информацией о периоде
    const metrics = await metricsConfig.getMetrics();
    
    res.json({
      success: true,
      metrics,
      period: {
        start: start || null,
        end: end || null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get metrics range', { 
      start: req.query.start,
      end: req.query.end,
      error: error.message,
      stack: error.stack 
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get metrics range',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Endpoint для сбора метрик по тегам
 */
router.get('/tags/:tags', async (req, res) => {
  try {
    const { tags } = req.params;
    const tagList = tags.split(',');
    
    const allMetrics = await metricsConfig.getMetrics();
    
    // Фильтруем метрики по тегам
    const filteredMetrics = allMetrics
      .split('\n')
      .filter(line => {
        // Ищем метрики, которые содержат хотя бы один из указанных тегов
        return tagList.some(tag => line.includes(`{${tag}}`));
      })
      .join('\n');
    
    if (!filteredMetrics) {
      return res.status(404).json({
        success: false,
        error: `No metrics found for tags: ${tags}`,
        timestamp: new Date().toISOString()
      });
    }
    
    res.set('Content-Type', 'text/plain');
    res.send(filteredMetrics);
  } catch (error) {
    logger.error('Failed to get metrics by tags', { 
      tags: req.params.tags,
      error: error.message,
      stack: error.stack 
    });
    
    res.status(500).send('Error: Failed to get metrics by tags');
  }
});

/**
 * Endpoint для сбора метрик с фильтрацией по значению
 */
router.get('/filter', async (req, res) => {
  try {
    const { operator, value, metricName } = req.query;
    
    // В реальном приложении здесь была бы логика фильтрации метрик
    // Для примера просто возвращаем текущие метрики
    const metrics = await metricsConfig.getMetrics();
    
    res.json({
      success: true,
      metrics,
      filter: {
        operator,
        value,
        metricName
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get filtered metrics', { 
      operator: req.query.operator,
      value: req.query.value,
      metricName: req.query.metricName,
      error: error.message,
      stack: error.stack 
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get filtered metrics',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Endpoint для сбора метрик в формате OpenMetrics
 */
router.get('/openmetrics', async (req, res) => {
  try {
    const metrics = await metricsConfig.getMetrics();
    
    // OpenMetrics использует немного другой формат, чем Prometheus
    // Для примера просто возвращаем стандартные метрики
    res.set('Content-Type', 'application/openmetrics-text; version=1.0.0; charset=utf-8');
    res.send(metrics);
  } catch (error) {
    logger.error('Failed to get OpenMetrics', { error: error.message, stack: error.stack });
    
    res.status(500).send('Error: Failed to get OpenMetrics');
  }
});

/**
 * Endpoint для сбора метрик с аутентификацией (для внутреннего использования)
 */
router.get('/internal', async (req, res) => {
  try {
    // Проверяем аутентификацию (в реальном приложении здесь была бы проверка токена)
    const authHeader = req.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        timestamp: new Date().toISOString()
      });
    }
    
    const metrics = await metricsConfig.getMetrics();
    
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    logger.error('Failed to get internal metrics', { error: error.message, stack: error.stack });
    
    res.status(500).send('Error: Failed to get internal metrics');
  }
});

/**
 * Endpoint для сбора метрик с ограниченным доступом
 */
router.get('/restricted', async (req, res) => {
  try {
    // Проверяем IP адрес (в реальном приложении здесь была бы проверка IP)
    const allowedIPs = process.env.ALLOWED_METRICS_IPS ? 
      process.env.ALLOWED_METRICS_IPS.split(',') : 
      ['127.0.0.1', '::1'];
    
    const clientIP = req.ip;
    if (!allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        timestamp: new Date().toISOString()
      });
    }
    
    const metrics = await metricsConfig.getMetrics();
    
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    logger.error('Failed to get restricted metrics', { error: error.message, stack: error.stack });
    
    res.status(500).send('Error: Failed to get restricted metrics');
  }
});

export default router;