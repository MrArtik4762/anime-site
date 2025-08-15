const SourcesFetcher = require('./services/sourcesFetcher');
const { performance } = require('perf_hooks');

async function runPerformanceTests() {
  try {
    console.log('🚀 Запуск тестирования производительности и кэширования...');
    
    // Тест 1: Первоначальное время загрузки (без кэша)
    console.log('\n🔍 Тест 1: Первоначальное время загрузки (без кэша)');
    const coldStart = performance.now();
    
    const coldResult = await SourcesFetcher.getEpisodeSources('50d4b7663de0007e5d000003', {
      providers: ['anilibria', 'shikimori'],
      enableCache: false,
      enableRetry: false
    });
    
    const coldEnd = performance.now();
    const coldTime = coldEnd - coldStart;
    
    console.log(`✅ Результаты холодного старта:`);
    console.log(`   - Время загрузки: ${coldTime.toFixed(2)}ms`);
    console.log(`   - Источников найдено: ${coldResult.total}`);
    
    // Тест 2: Повторная загрузка (с кэшированием)
    console.log('\n🔍 Тест 2: Повторная загрузка (с кэшированием)');
    const cachedStart = performance.now();
    
    const cachedResult = await SourcesFetcher.getEpisodeSources('50d4b7663de0007e5d000003', {
      providers: ['anilibria', 'shikimori'],
      enableCache: true,
      enableRetry: false
    });
    
    const cachedEnd = performance.now();
    const cachedTime = cachedEnd - cachedStart;
    
    console.log(`✅ Результаты загрузки из кэша:`);
    console.log(`   - Время загрузки: ${cachedTime.toFixed(2)}ms`);
    console.log(`   - Источников найдено: ${cachedResult.total}`);
    console.log(`   - Ускорение: ${coldTime > 0 ? (coldTime / cachedTime).toFixed(2) : '∞'}x`);
    
    // Тест 3: Нагрузка на кэш (множественные запросы)
    console.log('\n🔍 Тест 3: Нагрузка на кэш (10 запросов)');
    const cacheLoadStart = performance.now();
    const cacheLoadPromises = [];
    
    for (let i = 0; i < 10; i++) {
      cacheLoadPromises.push(
        SourcesFetcher.getEpisodeSources('50d4b7663de0007e5d000003', {
          providers: ['shikimori'],
          enableCache: true,
          enableRetry: false
        })
      );
    }
    
    const cacheLoadResults = await Promise.all(cacheLoadPromises);
    const cacheLoadEnd = performance.now();
    const cacheLoadTime = cacheLoadEnd - cacheLoadStart;
    
    console.log(`✅ Результаты нагрузки на кэш:`);
    console.log(`   - Общее время: ${cacheLoadTime.toFixed(2)}ms`);
    console.log(`   - Запросов: 10`);
    console.log(`   - Среднее время на запрос: ${(cacheLoadTime / 10).toFixed(2)}ms`);
    console.log(`   - Источников в каждом запросе: ${cacheLoadResults[0].total}`);
    
    // Тест 4: Производительность разных провайдеров
    console.log('\n🔍 Тест 4: Производительность разных провайдеров');
    const providers = ['anilibria', 'shikimori', 'jikan'];
    const providerResults = {};
    
    for (const provider of providers) {
      const providerStart = performance.now();
      
      try {
        const result = await SourcesFetcher.getEpisodeSources('50d4b7663de0007e5d000003', {
          providers: [provider],
          enableCache: false,
          enableRetry: false
        });
        
        const providerEnd = performance.now();
        const providerTime = providerEnd - providerStart;
        
        providerResults[provider] = {
          time: providerTime,
          sources: result.total,
          success: true
        };
        
        console.log(`   - ${provider}: ${providerTime.toFixed(2)}ms, источников: ${result.total}`);
      } catch (error) {
        const providerEnd = performance.now();
        const providerTime = providerEnd - providerStart;
        
        providerResults[provider] = {
          time: providerTime,
          sources: 0,
          success: false,
          error: error.message
        };
        
        console.log(`   - ${provider}: ${providerTime.toFixed(2)}ms, ошибка: ${error.message}`);
      }
    }
    
    // Тест 5: Смешанная нагрузка (кэш + новые запросы)
    console.log('\n🔍 Тест 5: Смешанная нагрузка');
    const mixedStart = performance.now();
    
    // Сначала запрос с кэшированием
    await SourcesFetcher.getEpisodeSources('50d4b7663de0007e5d000003', {
      providers: ['anilibria'],
      enableCache: true,
      enableRetry: false
    });
    
    // Затем новый запрос без кэширования
    await SourcesFetcher.getEpisodeSources('50d4b7663de0007e5d000003', {
      providers: ['shikimori'],
      enableCache: false,
      enableRetry: false
    });
    
    // И снова с кэшированием
    await SourcesFetcher.getEpisodeSources('50d4b7663de0007e5d000003', {
      providers: ['anilibria'],
      enableCache: true,
      enableRetry: false
    });
    
    const mixedEnd = performance.now();
    const mixedTime = mixedEnd - mixedStart;
    
    console.log(`✅ Результаты смешанной нагрузки:`);
    console.log(`   - Общее время: ${mixedTime.toFixed(2)}ms`);
    console.log(`   - Запросов: 3 (1 из кэша, 1 новый, 1 из кэша)`);
    console.log(`   - Среднее время на запрос: ${(mixedTime / 3).toFixed(2)}ms`);
    
    // Тест 6: Проверка эффективности кэширования по времени
    console.log('\n🔍 Тест 6: Эффективность кэширования по времени');
    
    const testIterations = 5;
    const timesWithoutCache = [];
    const timesWithCache = [];
    
    for (let i = 0; i < testIterations; i++) {
      // Без кэша
      const noCacheStart = performance.now();
      await SourcesFetcher.getEpisodeSources('50d4b7663de0007e5d000003', {
        providers: ['jikan'],
        enableCache: false,
        enableRetry: false
      });
      const noCacheEnd = performance.now();
      timesWithoutCache.push(noCacheEnd - noCacheStart);
      
      // С кэшем
      const withCacheStart = performance.now();
      await SourcesFetcher.getEpisodeSources('50d4b7663de0007e5d000003', {
        providers: ['jikan'],
        enableCache: true,
        enableRetry: false
      });
      const withCacheEnd = performance.now();
      timesWithCache.push(withCacheEnd - withCacheStart);
    }
    
    const avgNoCache = timesWithoutCache.reduce((a, b) => a + b, 0) / timesWithoutCache.length;
    const avgWithCache = timesWithCache.reduce((a, b) => a + b, 0) / timesWithCache.length;
    
    console.log(`✅ Результаты эффективности кэширования (${testIterations} итераций):`);
    console.log(`   - Среднее время без кэша: ${avgNoCache.toFixed(2)}ms`);
    console.log(`   - Среднее время с кэшем: ${avgWithCache.toFixed(2)}ms`);
    console.log(`   - Среднее ускорение: ${avgNoCache > 0 ? (avgNoCache / avgWithCache).toFixed(2) : '∞'}x`);
    
    console.log('\n✅ Тестирование производительности и кэширования завершено успешно');
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании производительности:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Запускаем тесты
runPerformanceTests();