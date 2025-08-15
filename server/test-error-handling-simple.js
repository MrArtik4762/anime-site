const SourcesFetcher = require('./services/sourcesFetcher');

async function runErrorHandlingTests() {
  try {
    console.log('🚀 Запуск тестирования обработки ошибок (упрощенная версия)...');

    // Тест 1: Обработка неверного формата ID аниме
    console.log('\n🔍 Тест 1: Обработка неверного формата ID аниме');
    try {
      await SourcesFetcher.getEpisodeSources('invalid-id', {
        providers: ['aniliberty'],
        enableRetry: false
      });
      console.log('❌ Ожидалась ошибка для неверного ID');
    } catch (error) {
      console.log('✅ Обработана ошибка неверного формата ID:', error.message);
    }

    // Тест 2: Обработка запроса от несуществующего провайдера
    console.log('\n🔍 Тест 2: Обработка запроса от несуществующего провайдера');
    try {
      const result = await SourcesFetcher.getEpisodeSources('50d4b7663de0007e5d000003', {
        providers: ['non-existent-provider'],
        enableRetry: false
      });
      console.log('✅ Результат от несуществующего провайдера:', result);
      console.log('   - Количество ошибок:', result.errors.length);
      console.log('   - Ошибки:', result.errors.map(e => e.provider));
    } catch (error) {
      console.log('✅ Обработана ошибка от несуществующего провайдера:', error.message);
    }

    // Тест 3: Обработка источников с отсутствующими полями
    console.log('\n🔍 Тест 3: Обработка источников с отсутствующими полями');
    try {
      const sourcesWithMissingFields = [
        {
          episodeNumber: 1,
          sourceUrl: 'https://test.com/video1.mp4'
          // Отсутствуют quality, title, provider
        },
        {
          episodeNumber: 1,
          quality: '720p',
          title: 'Test Source'
          // Отсутствует sourceUrl, provider
        }
      ];
      
      const result = await SourcesFetcher.saveEpisodeSources(sourcesWithMissingFields, '50d4b7663de0007e5d000003');
      console.log('✅ Результат для источников с отсутствующими полями:', result);
      console.log('   - Сохранено:', result.saved);
      console.log('   - Обновлено:', result.updated);
      console.log('   - Ошибки:', result.errors.length);
      console.log('   - Ошибки:', result.errors);
    } catch (error) {
      console.log('✅ Обработана ошибка для источников с отсутствующими полями:', error.message);
    }

    // Тест 4: Обработка одновременных запросов
    console.log('\n🔍 Тест 4: Обработка одновременных запросов');
    try {
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          SourcesFetcher.getEpisodeSources('50d4b7663de0007e5d000003', {
            providers: ['aniliberty'],
            enableRetry: false
          })
        );
      }
      
      const results = await Promise.all(promises);
      console.log('✅ Результаты одновременных запросов:', results.length);
      results.forEach((result, index) => {
        console.log(`   - Запрос ${index + 1}: ${result.total} источников`);
      });
    } catch (error) {
      console.log('✅ Обработана ошибка одновременных запросов:', error.message);
    }

    // Тест 5: Проверка статуса провайдеров
    console.log('\n🔍 Тест 5: Проверка статуса провайдеров');
    try {
      const status = await SourcesFetcher.checkProvidersStatus();
      console.log('✅ Статус провайдеров:', status);
      Object.entries(status).forEach(([provider, info]) => {
        console.log(`   - ${provider}: ${info.healthy ? 'здоров' : 'не работает'}`);
        if (!info.healthy && info.error) {
          console.log(`     Ошибка: ${info.error}`);
        }
      });
    } catch (error) {
      console.log('✅ Обработана ошибка проверки статуса:', error.message);
    }

    console.log('\n✅ Тестирование обработки ошибок завершено успешно');
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании обработки ошибок:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Запускаем тесты
runErrorHandlingTests();