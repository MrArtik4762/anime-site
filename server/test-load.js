const SourcesFetcher = require('./services/sourcesFetcher');
const { performance } = require('perf_hooks');

async function runLoadTests() {
  try {
    console.log('🚀 Запуск нагрузочного тестирования...');
    
    // Тест 1: Последовательные запросы
    console.log('\n🔍 Тест 1: Последовательные запросы (50 запросов)');
    const sequentialStart = performance.now();
    const sequentialResults = [];
    
    for (let i = 0; i < 50; i++) {
      const start = performance.now();
      try {
        const result = await SourcesFetcher.getEpisodeSources('50d4b7663de0007e5d000003', {
          providers: ['anilibria', 'shikimori'],
          enableRetry: false
        });
        const end = performance.now();
        sequentialResults.push(end - start);
        
        if (i % 10 === 0) {
          console.log(`   Запрос ${i + 1}: ${(end - start).toFixed(2)}ms, источников: ${result.total}`);
        }
      } catch (error) {
        const end = performance.now();
        sequentialResults.push(end - start);
        console.log(`   Запрос ${i + 1}: ${(end - start).toFixed(2)}ms, ошибка: ${error.message}`);
      }
    }
    
    const sequentialEnd = performance.now();
    const sequentialAvg = sequentialResults.reduce((a, b) => a + b, 0) / sequentialResults.length;
    console.log(`✅ Результаты последовательных запросов:`);
    console.log(`   - Общее время: ${(sequentialEnd - sequentialStart).toFixed(2)}ms`);
    console.log(`   - Среднее время на запрос: ${sequentialAvg.toFixed(2)}ms`);
    console.log(`   - Минимальное время: ${Math.min(...sequentialResults).toFixed(2)}ms`);
    console.log(`   - Максимальное время: ${Math.max(...sequentialResults).toFixed(2)}ms`);
    
    // Тест 2: Параллельные запросы
    console.log('\n🔍 Тест 2: Параллельные запросы (20 одновременных запросов)');
    const parallelStart = performance.now();
    const parallelPromises = [];
    
    for (let i = 0; i < 20; i++) {
      parallelPromises.push(
        SourcesFetcher.getEpisodeSources('50d4b7663de0007e5d000003', {
          providers: ['anilibria', 'jikan'],
          enableRetry: false
        }).catch(error => ({ error: error.message }))
      );
    }
    
    const parallelResults = await Promise.all(parallelPromises);
    const parallelEnd = performance.now();
    
    const successfulRequests = parallelResults.filter(r => !r.error).length;
    const failedRequests = parallelResults.filter(r => r.error).length;
    
    console.log(`✅ Результаты параллельных запросов:`);
    console.log(`   - Общее время: ${(parallelEnd - parallelStart).toFixed(2)}ms`);
    console.log(`   - Успешных запросов: ${successfulRequests}`);
    console.log(`   - Неуспешных запросов: ${failedRequests}`);
    console.log(`   - Среднее время на успешный запрос: ${(parallelEnd - parallelStart) / successfulRequests || 0}ms`);
    
    // Тест 3: Проверка кэширования
    console.log('\n🔍 Тест 3: Проверка эффективности кэширования');
    const cacheStart = performance.now();
    
    // Первый запрос (без кэша)
    const firstResult = await SourcesFetcher.getEpisodeSources('50d4b7663de0007e5d000003', {
      providers: ['anilibria'],
      enableCache: true,
      enableRetry: false
    });
    
    const firstEnd = performance.now();
    const firstTime = firstEnd - cacheStart;
    
    // Второй запрос (из кэша)
    const secondStart = performance.now();
    const secondResult = await SourcesFetcher.getEpisodeSources('50d4b7663de0007e5d000003', {
      providers: ['anilibria'],
      enableCache: true,
      enableRetry: false
    });
    const secondEnd = performance.now();
    const secondTime = secondEnd - secondStart;
    
    console.log(`✅ Результаты проверки кэширования:`);
    console.log(`   - Первый запрос (без кэша): ${firstTime.toFixed(2)}ms`);
    console.log(`   - Второй запрос (из кэша): ${secondTime.toFixed(2)}ms`);
    console.log(`   - Ускорение: ${firstTime > 0 ? (firstTime / secondTime).toFixed(2) : '∞'}x`);
    
    // Тест 4: Нагрузка с разными провайдерами
    console.log('\n🔍 Тест 4: Нагрузка с разными провайдерами');
    const providersTestStart = performance.now();
    
    const providerTests = [
      { name: 'anilibria', providers: ['anilibria'] },
      { name: 'shikimori', providers: ['shikimori'] },
      { name: 'jikan', providers: ['jikan'] },
      { name: 'all', providers: ['anilibria', 'shikimori', 'jikan'] }
    ];
    
    for (const test of providerTests) {
      const testStart = performance.now();
      try {
        const result = await SourcesFetcher.getEpisodeSources('50d4b7663de0007e5d000003', {
          providers: test.providers,
          enableRetry: false
        });
        const testEnd = performance.now();
        console.log(`   - ${test.name}: ${(testEnd - testStart).toFixed(2)}ms, источников: ${result.total}`);
      } catch (error) {
        const testEnd = performance.now();
        console.log(`   - ${test.name}: ${(testEnd - testStart).toFixed(2)}ms, ошибка: ${error.message}`);
      }
    }
    
    const providersTestEnd = performance.now();
    console.log(`   - Общее время теста: ${(providersTestEnd - providersTestStart).toFixed(2)}ms`);
    
    // Тест 5: Проверка лимитов запросов
    console.log('\n🔍 Тест 5: Проверка лимитов запросов (быстрые последовательные запросы)');
    const rateLimitStart = performance.now();
    let rateLimitErrors = 0;
    
    for (let i = 0; i < 15; i++) {
      try {
        await SourcesFetcher.getEpisodeSources('50d4b7663de0007e5d000003', {
          providers: ['anilibria'],
          enableRetry: false
        });
        
        // Имитация быстрого succession запросов
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          rateLimitErrors++;
        }
      }
    }
    
    const rateLimitEnd = performance.now();
    console.log(`✅ Результаты проверки лимитов запросов:`);
    console.log(`   - Общее время: ${(rateLimitEnd - rateLimitStart).toFixed(2)}ms`);
    console.log(`   - Ошибок ограничения скорости: ${rateLimitErrors}`);
    
    console.log('\n✅ Нагрузочное тестирование завершено успешно');
    
  } catch (error) {
    console.error('❌ Ошибка при нагрузочном тестировании:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Запускаем тесты
runLoadTests();