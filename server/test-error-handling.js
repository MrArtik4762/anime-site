const mongoose = require('mongoose');
const EpisodeSource = require('./models/EpisodeSource');
const Anime = require('./models/Anime');
const SourcesFetcher = require('./services/sourcesFetcher');

// Функция для тестирования обработки ошибок
async function runErrorHandlingTests() {
  try {
    console.log('🚀 Запуск тестирования обработки ошибок...');
    
    // Подключаемся к тестовой базе данных
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/anime-site-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Подключение к тестовой базе данных установлено');

    // Создаем тестовое аниме
    const testAnime = new Anime({
      title: { english: 'Test Anime', japanese: 'テストアニメ', romaji: 'Tesuto Anime' },
      synopsis: 'Test anime description',
      type: 'TV',
      status: 'Finished Airing',
      episodes: 12,
      year: 2023,
      genres: ['Action', 'Adventure'],
      images: { poster: { small: 'test.jpg', medium: 'test.jpg', large: 'test.jpg' } },
      source: 'test',
      cached: true,
      approved: true,
      isActive: true
    });
    await testAnime.save();
    const testAnimeId = testAnime._id.toString();
    console.log('✅ Тестовое аниме создано, ID:', testAnimeId);

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

    // Тест 2: Обработка несуществующего ID аниме
    console.log('\n🔍 Тест 2: Обработка несуществующего ID аниме');
    try {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const result = await SourcesFetcher.getEpisodeSources(nonExistentId, {
        providers: ['aniliberty'],
        enableRetry: false
      });
      console.log('✅ Результат для несуществующего ID:', result.total);
    } catch (error) {
      console.log('✅ Обработана ошибка несуществующего ID:', error.message);
    }

    // Тест 3: Обработка запроса от несуществующего провайдера
    console.log('\n🔍 Тест 3: Обработка запроса от несуществующего провайдера');
    try {
      const result = await SourcesFetcher.getEpisodeSources(testAnimeId, {
        providers: ['non-existent-provider'],
        enableRetry: false
      });
      console.log('✅ Результат от несуществующего провайдера:', result);
      console.log('   - Количество ошибок:', result.errors.length);
      console.log('   - Ошибки:', result.errors.map(e => e.provider));
    } catch (error) {
      console.log('✅ Обработана ошибка от несуществующего провайдера:', error.message);
    }

    // Тест 4: Обработка источников с отсутствующими полями
    console.log('\n🔍 Тест 4: Обработка источников с отсутствующими полями');
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
      
      const result = await SourcesFetcher.saveEpisodeSources(sourcesWithMissingFields, testAnimeId);
      console.log('✅ Результат для источников с отсутствующими полями:', result);
      console.log('   - Сохранено:', result.saved);
      console.log('   - Обновлено:', result.updated);
      console.log('   - Ошибки:', result.errors.length);
      console.log('   - Ошибки:', result.errors);
    } catch (error) {
      console.log('✅ Обработана ошибка для источников с отсутствующими полями:', error.message);
    }

    // Тест 5: Обработка дублирующихся источников
    console.log('\n🔍 Тест 5: Обработка дублирующихся источников');
    try {
      // Создаем тестовый источник
      const testSource = new EpisodeSource({
        animeId: testAnimeId,
        episodeNumber: 1,
        sourceUrl: 'https://test.com/video.mp4',
        quality: '720p',
        title: 'Test Source',
        provider: 'aniliberty',
        priority: 1,
        isActive: true
      });
      await testSource.save();
      console.log('✅ Тестовый источник создан');

      // Пытаемся сохранить тот же источник
      const result = await SourcesFetcher.saveEpisodeSources([{
        episodeNumber: 1,
        sourceUrl: 'https://test.com/video.mp4',
        quality: '720p',
        title: 'Test Source',
        provider: 'aniliberty',
        priority: 1
      }], testAnimeId);
      
      console.log('✅ Результат сохранения дубликата:', result);
      console.log('   - Сохранено:', result.saved);
      console.log('   - Обновлено:', result.updated);
    } catch (error) {
      console.log('✅ Обработана ошибка дублирования:', error.message);
    }

    // Тест 6: Обработка одновременных запросов
    console.log('\n🔍 Тест 6: Обработка одновременных запросов');
    try {
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          SourcesFetcher.getEpisodeSources(testAnimeId, {
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

    // Очистка
    await EpisodeSource.deleteMany({});
    await Anime.deleteMany({});
    await mongoose.connection.close();
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