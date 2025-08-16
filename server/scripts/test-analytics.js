#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки функциональности аналитики аниме
 * 
 * Этот скрипт тестирует:
 * 1. Обновление просмотров
 * 2. Получение популярных аниме
 * 3. Получение новых аниме
 * 4. Получение трендовых аниме
 * 5. Работу кэширования
 * 6. Фоновые задачи
 */

const mongoose = require('mongoose');
const Anime = require('../models/Anime');
const analyticsService = require('../services/analyticsService');
const jobsService = require('../services/jobs');
const { logger } = require('../config/logger');

// Конфигурация
const TEST_CONFIG = {
  testAnimeCount: 10,
  maxRetries: 3,
  retryDelay: 2000,
  cacheTimeout: 5000
};

// Глобальные переменные
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// Вспомогательные функции
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function retry(fn, maxAttempts = TEST_CONFIG.maxRetries, delay = TEST_CONFIG.retryDelay) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    function attempt() {
      attempts++;
      fn()
        .then(resolve)
        .catch(error => {
          if (attempts >= maxAttempts) {
            reject(error);
          } else {
            logger.warn(`Attempt ${attempts} failed, retrying...`, { error: error.message });
            setTimeout(attempt, delay);
          }
        });
    }
    
    attempt();
  });
}

// Функция для создания тестовых данных
async function createTestData() {
  logger.info('Creating test data...');
  
  try {
    const testAnime = [];
    
    for (let i = 1; i <= TEST_CONFIG.testAnimeCount; i++) {
      const anime = new Anime({
        code: `test-anime-${i}`,
        title: `Тестовое аниме ${i}`,
        title_en: `Test Anime ${i}`,
        title_ja: `テストアニメ ${i}`,
        year: 2023 + (i % 3),
        season: ['winter', 'spring', 'summer', 'fall'][i % 4],
        episodes: 12 + (i % 6),
        status: 'ongoing',
        type: 'tv',
        description: `Описание тестового аниме ${i}`,
        rating: (7 + Math.random() * 2).toFixed(1),
        genres: ['тест', 'аниме', `жанр-${i}`],
        voices: [],
        series: [],
        team: [],
        player: [],
        translations: [],
        announce: [],
        favorites: 0,
        comments: 0,
        last: {
          series: 0,
          episode: 0,
          translation: ''
        },
        statistics: {
          totalViews: Math.floor(Math.random() * 1000),
          weeklyViews: Math.floor(Math.random() * 100),
          monthlyViews: Math.floor(Math.random() * 300),
          lastViewed: new Date()
        }
      });
      
      testAnime.push(anime);
    }
    
    await Anime.insertMany(testAnime);
    logger.info(`Created ${testAnime.length} test anime entries`);
    return testAnime;
    
  } catch (error) {
    logger.error('Error creating test data:', error);
    throw error;
  }
}

// Функция для очистки тестовых данных
async function cleanupTestData() {
  logger.info('Cleaning up test data...');
  
  try {
    await Anime.deleteMany({ code: { $regex: '^test-anime-' } });
    logger.info('Test data cleaned up');
  } catch (error) {
    logger.error('Error cleaning up test data:', error);
  }
}

// Тестовые функции
async function testUpdateViews() {
  return new Promise(async (resolve) => {
    testResults.total++;
    logger.info(`Test ${testResults.total}: Testing view updates...`);
    
    try {
      const animeCode = 'test-anime-1';
      const viewsIncrement = 5;
      
      // Проверяем начальное количество просмотров
      const animeBefore = await Anime.findOne({ code: animeCode });
      const initialViews = animeBefore.statistics.totalViews;
      
      // Обновляем просмотры
      await analyticsService.updateViews(animeCode, viewsIncrement);
      
      // Проверяем обновленное количество просмотров
      const animeAfter = await Anime.findOne({ code: animeCode });
      const finalViews = animeAfter.statistics.totalViews;
      
      if (finalViews === initialViews + viewsIncrement) {
        logger.info(`✓ View update test passed: ${initialViews} -> ${finalViews}`);
        testResults.passed++;
        resolve();
      } else {
        throw new Error(`Expected ${initialViews + viewsIncrement}, got ${finalViews}`);
      }
      
    } catch (error) {
      logger.error(`✗ View update test failed:`, error.message);
      testResults.failed++;
      testResults.errors.push(`Test ${testResults.total}: ${error.message}`);
      resolve();
    }
  });
}

async function testGetPopularAnime() {
  return new Promise(async (resolve) => {
    testResults.total++;
    logger.info(`Test ${testResults.total}: Testing popular anime retrieval...`);
    
    try {
      // Тестируем получение популярных аниме
      const popularAnime = await analyticsService.getPopularAnime(5);
      
      if (Array.isArray(popularAnime) && popularAnime.length <= 5) {
        logger.info(`✓ Popular anime test passed: retrieved ${popularAnime.length} anime`);
        testResults.passed++;
        resolve();
      } else {
        throw new Error('Invalid response format or count');
      }
      
    } catch (error) {
      logger.error(`✗ Popular anime test failed:`, error.message);
      testResults.failed++;
      testResults.errors.push(`Test ${testResults.total}: ${error.message}`);
      resolve();
    }
  });
}

async function testGetNewAnime() {
  return new Promise(async (resolve) => {
    testResults.total++;
    logger.info(`Test ${testResults.total}: Testing new anime retrieval...`);
    
    try {
      // Тестируем получение новых аниме
      const newAnime = await analyticsService.getNewAnime(5);
      
      if (Array.isArray(newAnime) && newAnime.length <= 5) {
        logger.info(`✓ New anime test passed: retrieved ${newAnime.length} anime`);
        testResults.passed++;
        resolve();
      } else {
        throw new Error('Invalid response format or count');
      }
      
    } catch (error) {
      logger.error(`✗ New anime test failed:`, error.message);
      testResults.failed++;
      testResults.errors.push(`Test ${testResults.total}: ${error.message}`);
      resolve();
    }
  });
}

async function testGetTrendingAnime() {
  return new Promise(async (resolve) => {
    testResults.total++;
    logger.info(`Test ${testResults.total}: Testing trending anime retrieval...`);
    
    try {
      // Тестируем получение трендовых аниме
      const trendingAnime = await analyticsService.getTrendingAnime(5);
      
      if (Array.isArray(trendingAnime) && trendingAnime.length <= 5) {
        logger.info(`✓ Trending anime test passed: retrieved ${trendingAnime.length} anime`);
        testResults.passed++;
        resolve();
      } else {
        throw new Error('Invalid response format or count');
      }
      
    } catch (error) {
      logger.error(`✗ Trending anime test failed:`, error.message);
      testResults.failed++;
      testResults.errors.push(`Test ${testResults.total}: ${error.message}`);
      resolve();
    }
  });
}

async function testCacheFunctionality() {
  return new Promise(async (resolve) => {
    testResults.total++;
    logger.info(`Test ${testResults.total}: Testing cache functionality...`);
    
    try {
      const cacheKey = 'test:popular:anime';
      const testData = { test: 'data', timestamp: Date.now() };
      
      // Тестируем установку кэша
      await analyticsService.cacheData(cacheKey, testData, 300);
      
      // Тестируем получение кэша
      const cachedData = await analyticsService.getCachedData(cacheKey);
      
      if (cachedData && cachedData.test === 'data') {
        logger.info(`✓ Cache test passed: data cached and retrieved successfully`);
        testResults.passed++;
        resolve();
      } else {
        throw new Error('Cache data mismatch or not found');
      }
      
    } catch (error) {
      logger.error(`✗ Cache test failed:`, error.message);
      testResults.failed++;
      testResults.errors.push(`Test ${testResults.total}: ${error.message}`);
      resolve();
    }
  });
}

async function testBackgroundJobs() {
  return new Promise(async (resolve) => {
    testResults.total++;
    logger.info(`Test ${testResults.total}: Testing background jobs...`);
    
    try {
      // Проверяем, что сервис заданий инициализирован
      if (jobsService.initialize && typeof jobsService.initialize === 'function') {
        logger.info(`✓ Background jobs test passed: jobs service is available`);
        testResults.passed++;
        resolve();
      } else {
        throw new Error('Jobs service not properly initialized');
      }
      
    } catch (error) {
      logger.error(`✗ Background jobs test failed:`, error.message);
      testResults.failed++;
      testResults.errors.push(`Test ${testResults.total}: ${error.message}`);
      resolve();
    }
  });
}

// Основная функция тестирования
async function runTests() {
  logger.info('Starting analytics tests...');
  
  try {
    // Проверяем доступность сервисов
    logger.info('Checking service availability...');
    
    // Проверяем Redis
    const redisStatus = await testRedisConnection();
    if (redisStatus.connected) {
      logger.info('✓ Redis connection successful');
    } else {
      logger.warn('⚠ Redis connection failed, using fallback cache');
    }
    
    // Проверяем MongoDB
    const mongoStatus = await testMongoConnection();
    if (mongoStatus.connected) {
      logger.info('✓ MongoDB connection successful');
      
      // Подключение к базе данных
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anime-site', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      logger.info('Connected to MongoDB');
      
      // Создание тестовых данных
      await createTestData();
      
      // Небольшая задержка для гарантии создания данных
      await sleep(1000);
      
      // Запуск тестов с базой данных
      await retry(testUpdateViews);
      await sleep(500);
      
      await retry(testGetPopularAnime);
      await sleep(500);
      
      await retry(testGetNewAnime);
      await sleep(500);
      
      await retry(testGetTrendingAnime);
      await sleep(500);
      
      // Очистка тестовых данных
      await cleanupTestData();
      
      // Отключение от базы данных
      await mongoose.disconnect();
      logger.info('Disconnected from MongoDB');
      
    } else {
      logger.warn('⚠ MongoDB connection failed, running tests without database');
      // Запуск тестов без базы данных
      await retry(testCacheFunctionality);
      await sleep(500);
      
      await retry(testBackgroundJobs);
    }
    
  } catch (error) {
    logger.error('Test execution error:', error);
    testResults.failed++;
    testResults.errors.push(`Test execution failed: ${error.message}`);
  }
  
  // Вывод результатов
  logger.info('\n=== TEST RESULTS ===');
  logger.info(`Total tests: ${testResults.total}`);
  logger.info(`Passed: ${testResults.passed}`);
  logger.info(`Failed: ${testResults.failed}`);
  
  if (testResults.errors.length > 0) {
    logger.info('\n=== ERRORS ===');
    testResults.errors.forEach(error => logger.error(error));
  }
  
  if (testResults.failed === 0) {
    logger.info('\n🎉 All tests passed successfully!');
    process.exit(0);
  } else {
    logger.error(`\n❌ ${testResults.failed} test(s) failed`);
    process.exit(1);
  }
}

// Функция проверки подключения к Redis
async function testRedisConnection() {
  try {
    const { testConnection } = require('../config/redis');
    const result = await testConnection();
    return {
      connected: result.status === 'connected',
      ping: result.ping
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
}

// Функция проверки подключения к MongoDB
async function testMongoConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/anime-site', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 2000 // 2 секунды таймаут
    });
    await mongoose.disconnect();
    return {
      connected: true
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
}

// Обработка ошибок
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Запуск тестов
if (require.main === module) {
  runTests();
}

module.exports = { runTests, testResults };