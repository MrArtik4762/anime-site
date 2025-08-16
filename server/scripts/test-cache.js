#!/usr/bin/env node

/**
 * Скрипт тестирования кэширования
 * Проверяет работу Redis и в памяти кэширования
 */

const fs = require('fs').promises;
const path = require('path');

// Импортируем сервис кэширования и логгер
const cacheService = require('../services/cacheService');
const { logger } = require('../utils/logger');

// Тестовые данные
const testData = {
  anime: [
    { id: 1, title: 'Тестовое аниме 1', year: 2023 },
    { id: 2, title: 'Тестовое аниме 2', year: 2024 }
  ],
  episodes: [
    { id: 1, animeId: 1, title: 'Эпизод 1', number: 1 },
    { id: 2, animeId: 1, title: 'Эпизод 2', number: 2 }
  ],
  search: 'тестовый поиск',
  popular: { count: 10, items: ['anime1', 'anime2'] }
};

// Функция для паузы
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Основная функция тестирования
async function runCacheTests() {
  logger.info('🚀 Запуск тестирования кэширования...');
  
  try {
    // 1. Тест подключения к Redis
    logger.info('📡 Тест подключения к Redis...');
    const connectionStatus = await cacheService.testConnection();
    logger.info(`📊 Статус подключения: ${connectionStatus.connected ? '✅ Успешно' : '❌ Не удалось'}`);
    
    if (connectionStatus.connected) {
      logger.info(`🔌 Используется: ${connectionStatus.type === 'redis' ? 'Redis' : 'NodeCache (резерв)'}`);
    } else {
      logger.warn('⚠️  Redis недоступен, используется только NodeCache');
    }
    
    // 2. Тест базовых операций кэширования
    logger.info('\n🔧 Тест базовых операций кэширования...');
    
    // Тест set/get
    const testKey = 'test:basic';
    await cacheService.set(testKey, testData.anime, 60);
    logger.info(`✅ Данные сохранены в кэш по ключу: ${testKey}`);
    
    sleep(500).then(async () => {
      const cachedData = await cacheService.get(testKey);
      if (cachedData && cachedData.length === testData.anime.length) {
        logger.info('✅ Данные успешно извлечены из кэша');
      } else {
        logger.error('❌ Не удалось извлечь данные из кэша');
      }
    });
    
    await sleep(1000);
    
    // 3. Тест TTL
    logger.info('\n⏱️  Тест TTL (время жизни кэша)...');
    const ttlKey = 'test:ttl';
    const shortTTL = 2; // 2 секунды
    
    await cacheService.set(ttlKey, testData.episodes, shortTTL);
    logger.info(`✅ Данные сохранены с TTL ${shortTTL} секунд`);
    
    // Проверяем сразу после сохранения
    let exists = await cacheService.get(ttlKey);
    if (exists) {
      logger.info('✅ Данные доступны сразу после сохранения');
    } else {
      logger.error('❌ Данные не найдены сразу после сохранения');
    }
    
    // Ждем истечения TTL
    await sleep((shortTTL + 1) * 1000);
    
    exists = await cacheService.get(ttlKey);
    if (!exists) {
      logger.info('✅ Данные автоматически удалены после истечения TTL');
    } else {
      logger.error('❌ Данные не были удалены после истечения TTL');
    }
    
    // 4. Тест специализированных методов
    logger.info('\n🎯 Тест специализированных методов кэширования...');
    
    // Тест кэширования аниме
    await cacheService.cacheAnime(testData.anime[0], testData.anime[0].id);
    const cachedAnime = await cacheService.getAnime(testData.anime[0].id);
    if (cachedAnime && cachedAnime.id === testData.anime[0].id) {
      logger.info('✅ Метод cacheAnime/getAnime работает корректно');
    } else {
      logger.error('❌ Метод cacheAnime/getAnime не работает');
    }
    
    // Тест кэширования эпизодов
    await cacheService.cacheEpisodes(testData.episodes, testData.anime[0].id);
    const cachedEpisodes = await cacheService.getEpisodes(testData.anime[0].id);
    if (cachedEpisodes && cachedEpisodes.length === testData.episodes.length) {
      logger.info('✅ Метод cacheEpisodes/getEpisodes работает корректно');
    } else {
      logger.error('❌ Метод cacheEpisodes/getEpisodes не работает');
    }
    
    // Тест кэширования популярных аниме
    await cacheService.cachePopularAnime(testData.anime);
    const cachedPopular = await cacheService.getPopularAnime();
    if (cachedPopular && cachedPopular.length === testData.anime.length) {
      logger.info('✅ Метод cachePopularAnime/getPopularAnime работает корректно');
    } else {
      logger.error('❌ Метод cachePopularAnime/getPopularAnime не работает');
    }
    
    // Тест кэширования результатов поиска
    await cacheService.cacheSearch(testData.anime, testData.search);
    const cachedSearch = await cacheService.getSearch(testData.search);
    if (cachedSearch && cachedSearch.length === testData.anime.length) {
      logger.info('✅ Метод cacheSearch/getSearch работает корректно');
    } else {
      logger.error('❌ Метод cacheSearch/getSearch не работает');
    }
    
    // 5. Тест удаления данных
    logger.info('\n🗑️  Тест удаления данных...');
    await cacheService.invalidateAnimeCache(testData.anime[0].id);
    const deletedAnime = await cacheService.getAnime(testData.anime[0].id);
    if (!deletedAnime) {
      logger.info('✅ Данные успешно удалены');
    } else {
      logger.error('❌ Не удалось удалить данные');
    }
    
    // 6. Тест очистки кэша
    logger.info('\n🧹 Тест очистки кэша...');
    await cacheService.clear();
    logger.info('✅ Кэш очищен');
    
    // 7. Тест производительности
    logger.info('\n⚡ Тест производительности...');
    const perfKey = 'test:performance';
    const iterations = 100;
    
    const startTime = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      await cacheService.set(perfKey, { iteration: i, data: testData.anime }, 60);
      await cacheService.get(perfKey);
    }
    
    const endTime = Date.now();
    const avgTime = (endTime - startTime) / iterations;
    
    logger.info(`✅ Среднее время операции кэширования: ${avgTime.toFixed(2)} мс (${iterations} операций)`);
    
    // 8. Тест работы с префиксами
    logger.info('\n🏷️  Тест работы с префиксами...');
    const prefixedKey = cacheService.generateKey('test', 'catalog');
    await cacheService.set('test', testData.anime, 60, 'catalog');
    const prefixedData = await cacheService.get('test', 'catalog');
    
    if (prefixedData && prefixedData.length === testData.anime.length) {
      logger.info('✅ Кэширование с префиксами работает корректно');
    } else {
      logger.error('❌ Кэширование с префиксами не работает');
    }
    
    logger.info('\n🎉 Тестирование кэширования завершено успешно!');
    
    // 9. Вывод статистики
    const stats = await cacheService.getStats();
    logger.info('\n📈 Статистика кэширования:');
    logger.info(`   - Redis статус: ${stats.redis}`);
    logger.info(`   - Fallback статус: ${stats.fallback || 'доступен'}`);
    logger.info(`   - Статус: ${stats.status}`);
    
  } catch (error) {
    logger.error('❌ Ошибка при тестировании кэширования:', error);
    process.exit(1);
  }
  
  logger.info('\n👋 Завершение работы скрипта тестирования...');
  process.exit(0);
}

// Обработка ошибок
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Необработанный Promise отклонение:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('❌ Необработанное исключение:', error);
  process.exit(1);
});

// Запуск тестов
if (require.main === module) {
  runCacheTests();
}

module.exports = { runCacheTests };