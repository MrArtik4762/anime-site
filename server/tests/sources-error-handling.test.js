const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const EpisodeSource = require('../models/EpisodeSource');
const Anime = require('../models/Anime');
const SourcesFetcher = require('../services/sourcesFetcher');

describe('Sources Error Handling Tests', () => {
  let testAnimeId;
  
  beforeAll(async () => {
    // Подключаемся к тестовой базе данных
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/anime-site-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
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
    testAnimeId = testAnime._id.toString();
  });
  
  afterAll(async () => {
    // Очищаем тестовую базу данных
    await EpisodeSource.deleteMany({});
    await Anime.deleteMany({});
    await mongoose.connection.close();
  });
  
  beforeEach(async () => {
    // Очищаем коллекцию перед каждым тестом
    await EpisodeSource.deleteMany({});
  });
  
  describe('API Error Handling', () => {
    test('should handle invalid anime ID format', async () => {
      const response = await request(app)
        .get('/api/anime/invalid-id/episode/1/sources')
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
    
    test('should handle non-existent anime ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .get(`/api/anime/${nonExistentId}/episode/1/sources`)
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
    
    test('should handle invalid episode number', async () => {
      const response = await request(app)
        .get(`/api/anime/${testAnimeId}/episode/invalid/sources`)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
    
    test('should handle negative episode number', async () => {
      const response = await request(app)
        .get(`/api/anime/${testAnimeId}/episode/-1/sources`)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
    
    test('should handle zero episode number', async () => {
      const response = await request(app)
        .get(`/api/anime/${testAnimeId}/episode/0/sources`)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
    
    test('should handle episode number greater than available episodes', async () => {
      const response = await request(app)
        .get(`/api/anime/${testAnimeId}/episode/99/sources`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.sources).toHaveLength(0);
    });
    
    test('should handle invalid quality filter', async () => {
      const response = await request(app)
        .get(`/api/anime/${testAnimeId}/episode/1/sources`)
        .query({ quality: 'invalid-quality' })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      // Должен вернуть пустой массив или источники без фильтрации
    });
    
    test('should handle invalid limit parameter', async () => {
      const response = await request(app)
        .get(`/api/anime/${testAnimeId}/episode/1/sources`)
        .query({ limit: 'invalid' })
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
    
    test('should handle negative limit parameter', async () => {
      const response = await request(app)
        .get(`/api/anime/${testAnimeId}/episode/1/sources`)
        .query({ limit: -1 })
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
    
    test('should handle zero limit parameter', async () => {
      const response = await request(app)
        .get(`/api/anime/${testAnimeId}/episode/1/sources`)
        .query({ limit: 0 })
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
    
    test('should handle very large limit parameter', async () => {
      const response = await request(app)
        .get(`/api/anime/${testAnimeId}/episode/1/sources`)
        .query({ limit: 10000 })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      // Должен вернуть источники с ограничением по умолчанию
    });
  });
  
  describe('SourcesFetcher Error Handling', () => {
    test('should handle fetch from non-existent provider', async () => {
      const result = await SourcesFetcher.getEpisodeSources(testAnimeId, {
        providers: ['non-existent-provider'],
        enableRetry: false
      });
      
      expect(result.total).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].provider).toBe('non-existent-provider');
    });
    
    test('should handle database connection errors', async () => {
      // Временно отключаем соединение с базой данных
      const originalConnect = mongoose.connect;
      mongoose.connect = jest.fn().mockRejectedValue(new Error('Database connection failed'));
      
      try {
        const result = await SourcesFetcher.getEpisodeSources(testAnimeId, {
          providers: ['aniliberty'],
          enableRetry: false
        });
        
        expect(result.total).toBe(0);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].error).toContain('Database connection failed');
      } finally {
        // Восстанавливаем оригинальную функцию
        mongoose.connect = originalConnect;
      }
    });
    
    test('should handle network timeout errors', async () => {
      // Мокаем axios для имитации таймаута
      const originalAxios = require('axios');
      jest.mock('axios');
      const mockedAxios = require('axios');
      
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error('Request timeout')),
        head: jest.fn().mockRejectedValue(new Error('Request timeout'))
      });
      
      try {
        const result = await SourcesFetcher.getEpisodeSources(testAnimeId, {
          providers: ['aniliberty'],
          enableRetry: false
        });
        
        expect(result.total).toBe(0);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].error).toContain('Request timeout');
      } finally {
        // Восстанавливаем оригинальный axios
        jest.unmock('axios');
        jest.clearAllMocks();
      }
    });
    
    test('should handle invalid response from provider', async () => {
      // Мокаем сервисы для возврата некорректных данных
      const originalAnilibertyService = require('../services/anilibertyService');
      jest.mock('../services/anilibertyService');
      const mockedService = require('../services/anilibertyService');
      
      mockedService.getEpisodeSources.mockResolvedValue({
        success: true,
        data: null // Некорректные данные
      });
      
      try {
        const result = await SourcesFetcher.getEpisodeSources(testAnimeId, {
          providers: ['aniliberty'],
          enableRetry: false
        });
        
        expect(result.total).toBe(0);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].error).toContain('Invalid data format');
      } finally {
        // Восстанавливаем оригинальный сервис
        jest.unmock('../services/anilibertyService');
        jest.clearAllMocks();
      }
    });
    
    test('should handle empty sources array', async () => {
      const result = await SourcesFetcher.getEpisodeSources(testAnimeId, {
        providers: ['aniliberty'],
        enableRetry: false
      });
      
      expect(result.total).toBe(0);
      expect(result.sources).toEqual([]);
      expect(result.errors).toHaveLength(0);
    });
    
    test('should handle sources with invalid URLs', async () => {
      // Создаем источник с некорректным URL
      const invalidSource = new EpisodeSource({
        animeId: testAnimeId,
        episodeNumber: 1,
        sourceUrl: 'invalid-url',
        quality: '720p',
        title: 'Invalid Source',
        provider: 'aniliberty',
        priority: 1,
        isActive: true
      });
      await invalidSource.save();
      
      const result = await SourcesFetcher.getEpisodeSources(testAnimeId, {
        providers: ['aniliberty'],
        enableRetry: false
      });
      
      expect(result.total).toBeGreaterThan(0);
      // Источник с некорректным URL должен быть отфильтрован или помечен как неактивный
    });
  });
  
  describe('Database Error Handling', () => {
    test('should handle database write errors', async () => {
      // Временно отключаем соединение с базой данных
      const originalSave = EpisodeSource.prototype.save;
      EpisodeSource.prototype.save = jest.fn().mockRejectedValue(new Error('Database write failed'));
      
      try {
        const result = await SourcesFetcher.saveEpisodeSources([{
          episodeNumber: 1,
          sourceUrl: 'https://test.com/video.mp4',
          quality: '720p',
          title: 'Test Source',
          provider: 'aniliberty',
          priority: 1
        }], testAnimeId);
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('Database write failed');
      } finally {
        // Восстанавливаем оригинальную функцию
        EpisodeSource.prototype.save = originalSave;
      }
    });
    
    test('should handle database query errors', async () => {
      // Временно отключаем соединение с базой данных
      const originalFind = EpisodeSource.find;
      EpisodeSource.find = jest.fn().mockRejectedValue(new Error('Database query failed'));
      
      try {
        const result = await SourcesFetcher.getActiveSources(testAnimeId, 1);
        
        expect(result).toEqual([]);
      } finally {
        // Восстанавливаем оригинальную функцию
        EpisodeSource.find = originalFind;
      }
    });
  });
  
  describe('Edge Cases', () => {
    test('should handle duplicate sources', async () => {
      // Создаем дублирующийся источник
      const source1 = new EpisodeSource({
        animeId: testAnimeId,
        episodeNumber: 1,
        sourceUrl: 'https://test.com/video.mp4',
        quality: '720p',
        title: 'Test Source',
        provider: 'aniliberty',
        priority: 1,
        isActive: true
      });
      await source1.save();
      
      // Пытаемся сохранить тот же источник
      const result = await SourcesFetcher.saveEpisodeSources([{
        episodeNumber: 1,
        sourceUrl: 'https://test.com/video.mp4',
        quality: '720p',
        title: 'Test Source',
        provider: 'aniliberty',
        priority: 1
      }], testAnimeId);
      
      expect(result.updated).toBeGreaterThan(0);
      expect(result.saved).toBe(0);
    });
    
    test('should handle sources with missing required fields', async () => {
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
      
      expect(result.success).toBe(true);
      expect(result.saved).toBe(0);
      expect(result.errors).toHaveLength(2);
    });
    
    test('should handle concurrent requests', async () => {
      // Создаем несколько одновременных запросов
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          SourcesFetcher.getEpisodeSources(testAnimeId, {
            providers: ['aniliberty'],
            enableRetry: false
          })
        );
      }
      
      const results = await Promise.all(promises);
      
      // Все запросы должны выполниться успешно
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(typeof result.total).toBe('number');
      });
    });
  });
});