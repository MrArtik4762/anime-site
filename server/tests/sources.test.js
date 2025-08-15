const request = require('supertest');
const mongoose = require('mongoose');
const { app, connectDB } = require('../app');
const SourcesFetcher = require('../services/sourcesFetcher');
const EpisodeSource = require('../models/EpisodeSource');
const Anime = require('../models/Anime');

describe('Sources API', () => {
  let animeId;

  beforeAll(async () => {
    // Подключаемся к тестовой базе данных
    await connectDB();
    
    // Создаем тестовое аниме
    const testAnime = new Anime({
      title: {
        english: 'Test Anime',
        japanese: 'テストアニメ',
        romaji: 'Tesuto Anime'
      },
      synopsis: 'Test anime description',
      type: 'TV',
      status: 'Finished Airing',
      episodes: 12,
      year: 2023,
      genres: ['Action', 'Adventure'],
      images: {
        poster: {
          small: 'test.jpg',
          medium: 'test.jpg',
          large: 'test.jpg'
        }
      },
      source: 'test',
      cached: true,
      approved: true,
      isActive: true
    });
    
    await testAnime.save();
    animeId = testAnime._id;
  });

  afterAll(async () => {
    // Очищаем тестовую базу данных
    await EpisodeSource.deleteMany({});
    await Anime.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Очищаем коллекцию источников перед каждым тестом
    await EpisodeSource.deleteMany({});
  });

  describe('GET /api/anime/:animeId/sources', () => {
    it('should return sources for existing anime', async () => {
      const response = await request(app)
        .get(`/api/anime/${animeId}/sources`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 404 for non-existent anime', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/anime/${nonExistentId}/sources`)
        .expect(404);
    });

    it('should accept providers parameter', async () => {
      const response = await request(app)
        .get(`/api/anime/${animeId}/sources?providers=aniliberty`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.providers).toBe(1);
    });
  });

  describe('GET /api/anime/:animeId/episode/:episodeNumber/best-sources', () => {
    it('should return best sources for existing episode', async () => {
      // Сначала создаем тестовые источники
      const testSource = new EpisodeSource({
        episodeNumber: 1,
        sourceUrl: 'https://test.com/video.mp4',
        quality: '720p',
        title: 'Test Source',
        provider: 'aniliberty',
        priority: 1,
        animeId: animeId
      });
      await testSource.save();

      const response = await request(app)
        .get(`/api/anime/${animeId}/episode/1/best-sources`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 400 for missing episode number', async () => {
      await request(app)
        .get(`/api/anime/${animeId}/episode/best-sources`)
        .expect(400);
    });
  });

  describe('GET /api/anime/:id/episode/:num/sources', () => {
    beforeEach(async () => {
      // Создаем тестовые источники
      const testSources = [
        {
          episodeNumber: 1,
          sourceUrl: 'https://working-source.com/video1.mp4',
          quality: '720p',
          title: 'Working Source 1',
          provider: 'aniliberty',
          priority: 1,
          animeId: animeId
        },
        {
          episodeNumber: 1,
          sourceUrl: 'https://broken-source.com/video2.mp4',
          quality: '1080p',
          title: 'Broken Source 2',
          provider: 'anilibria',
          priority: 2,
          animeId: animeId
        },
        {
          episodeNumber: 2,
          sourceUrl: 'https://working-source.com/video3.mp4',
          quality: '480p',
          title: 'Working Source 3',
          provider: 'aniliberty',
          priority: 1,
          animeId: animeId
        }
      ];

      await EpisodeSource.insertMany(testSources);
    });

    it('should return sources with status for existing anime and episode', async () => {
      const response = await request(app)
        .get(`/api/anime/${animeId}/episode/1/sources`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.episode).toBe(1);
      expect(response.body.data.sources).toBeDefined();
      expect(Array.isArray(response.body.data.sources)).toBe(true);
      
      // Проверяем наличие полей status и lastChecked
      response.body.data.sources.forEach(source => {
        expect(source).toHaveProperty('id');
        expect(source).toHaveProperty('episode');
        expect(source).toHaveProperty('sourceUrl');
        expect(source).toHaveProperty('quality');
        expect(source).toHaveProperty('title');
        expect(source).toHaveProperty('provider');
        expect(source).toHaveProperty('priority');
        expect(source).toHaveProperty('status');
        expect(source).toHaveProperty('lastChecked');
        expect(['available', 'unavailable']).toContain(source.status);
      });
    });

    it('should return sources sorted by priority', async () => {
      const response = await request(app)
        .get(`/api/anime/${animeId}/episode/1/sources`)
        .expect(200);

      const sources = response.body.data.sources;
      // Проверяем что источники отсортированы по приоритету
      for (let i = 0; i < sources.length - 1; i++) {
        expect(sources[i].priority).toBeLessThanOrEqual(sources[i + 1].priority);
      }
    });

    it('should filter by quality parameter', async () => {
      const response = await request(app)
        .get(`/api/anime/${animeId}/episode/1/sources?quality=720p`)
        .expect(200);

      const sources = response.body.data.sources;
      expect(sources.length).toBeGreaterThan(0);
      sources.forEach(source => {
        expect(source.quality).toBe('720p');
      });
    });

    it('should limit results with limit parameter', async () => {
      const response = await request(app)
        .get(`/api/anime/${animeId}/episode/1/sources?limit=1`)
        .expect(200);

      const sources = response.body.data.sources;
      expect(sources.length).toBeLessThanOrEqual(1);
    });

    it('should return 404 for non-existent anime', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/anime/${nonExistentId}/episode/1/sources`)
        .expect(404);
    });

    it('should return 400 for invalid episode number', async () => {
      await request(app)
        .get(`/api/anime/${animeId}/episode/invalid/sources`)
        .expect(400);
    });

    it('should return 400 for negative episode number', async () => {
      await request(app)
        .get(`/api/anime/${animeId}/episode/-1/sources`)
        .expect(400);
    });

    it('should return cached result on second request', async () => {
      // Первый запрос
      const response1 = await request(app)
        .get(`/api/anime/${animeId}/episode/1/sources`)
        .expect(200);

      expect(response1.body.success).toBe(true);

      // Второй запрос
      const response2 = await request(app)
        .get(`/api/anime/${animeId}/episode/1/sources`)
        .expect(200);

      expect(response2.body.success).toBe(true);
      expect(response2.body.cached).toBe(true);
    });

    it('should bypass cache with forceRefresh parameter', async () => {
      // Первый запрос
      const response1 = await request(app)
        .get(`/api/anime/${animeId}/episode/1/sources`)
        .expect(200);

      expect(response1.body.success).toBe(true);
      expect(response1.body.cached).toBeUndefined();

      // Второй запрос с forceRefresh
      const response2 = await request(app)
        .get(`/api/anime/${animeId}/episode/1/sources?forceRefresh=true`)
        .expect(200);

      expect(response2.body.success).toBe(true);
      expect(response2.body.cached).toBeUndefined();
    });

    it('should disable availability check with checkAvailability=false', async () => {
      const response = await request(app)
        .get(`/api/anime/${animeId}/episode/1/sources?checkAvailability=false`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sources).toBeDefined();
      
      // При checkAvailability=false статус должен быть available по умолчанию
      response.body.data.sources.forEach(source => {
        expect(source.status).toBe('available');
      });
    });

    it('should handle sources without availability check', async () => {
      const response = await request(app)
        .get(`/api/anime/${animeId}/episode/2/sources`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sources).toBeDefined();
      expect(response.body.data.sources.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/providers/status', () => {
    it('should return providers status', async () => {
      const response = await request(app)
        .get('/api/providers/status')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(typeof response.body.data).toBe('object');
    });
  });

  describe('PATCH /api/sources/:sourceId/availability', () => {
    it('should update source availability', async () => {
      // Создаем тестовый источник
      const testSource = new EpisodeSource({
        episodeNumber: 1,
        sourceUrl: 'https://test.com/video.mp4',
        quality: '720p',
        title: 'Test Source',
        provider: 'aniliberty',
        priority: 1,
        animeId: animeId
      });
      await testSource.save();

      const response = await request(app)
        .patch(`/api/sources/${testSource._id}/availability`)
        .send({ isAvailable: false })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isActive).toBe(false);
    });

    it('should return 400 for invalid isAvailable', async () => {
      // Создаем тестовый источник
      const testSource = new EpisodeSource({
        episodeNumber: 1,
        sourceUrl: 'https://test.com/video.mp4',
        quality: '720p',
        title: 'Test Source',
        provider: 'aniliberty',
        priority: 1,
        animeId: animeId
      });
      await testSource.save();

      await request(app)
        .patch(`/api/sources/${testSource._id}/availability`)
        .send({ isAvailable: 'invalid' })
        .expect(400);
    });
  });

  describe('POST /api/sources/batch-update', () => {
    it('should batch update sources for multiple anime', async () => {
      // Создаем второе тестовое аниме
      const testAnime2 = new Anime({
        title: {
          english: 'Test Anime 2',
          japanese: 'テストアニメ2',
          romaji: 'Tesuto Anime 2'
        },
        synopsis: 'Test anime 2 description',
        type: 'TV',
        status: 'Finished Airing',
        episodes: 12,
        year: 2023,
        genres: ['Action', 'Adventure'],
        images: {
          poster: {
            small: 'test2.jpg',
            medium: 'test2.jpg',
            large: 'test2.jpg'
          }
        },
        source: 'test',
        cached: true,
        approved: true,
        isActive: true
      });
      
      await testAnime2.save();

      const response = await request(app)
        .post('/api/sources/batch-update')
        .send({
          animeIds: [animeId.toString(), testAnime2._id.toString()],
          providers: ['aniliberty']
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalProcessed).toBe(2);
    });

    it('should return 400 for empty animeIds', async () => {
      await request(app)
        .post('/api/sources/batch-update')
        .send({
          animeIds: [],
          providers: ['aniliberty']
        })
        .expect(400);
    });
  });

  describe('SourcesFetcher', () => {
    describe('normalizeEpisodeData', () => {
      it('should normalize episode data correctly', () => {
        const rawData = [
          {
            episodeNumber: '1',
            sourceUrl: 'https://test.com/video.mp4',
            quality: 'hd',
            title: 'Test Episode 1',
            provider: 'aniliberty',
            priority: 1
          },
          {
            episodeNumber: 2,
            sourceUrl: 'https://test.com/video2.mp4',
            quality: 'fhd',
            title: 'Test Episode 2',
            provider: 'anilibria',
            priority: 2
          }
        ];

        const normalized = SourcesFetcher.normalizeEpisodeData(rawData);

        expect(normalized).toHaveLength(2);
        expect(normalized[0].episodeNumber).toBe(1);
        expect(normalized[0].quality).toBe('720p');
        expect(normalized[0].provider).toBe('aniliberty');
        expect(normalized[1].episodeNumber).toBe(2);
        expect(normalized[1].quality).toBe('1080p');
        expect(normalized[1].provider).toBe('anilibria');
      });

      it('should filter invalid data', () => {
        const rawData = [
          {
            episodeNumber: 'invalid',
            sourceUrl: 'https://test.com/video.mp4',
            quality: '720p',
            title: 'Test Episode',
            provider: 'aniliberty'
          },
          {
            episodeNumber: 2,
            // Отсутствует provider
            sourceUrl: 'https://test.com/video2.mp4',
            quality: '720p',
            title: 'Test Episode 2'
          }
        ];

        const normalized = SourcesFetcher.normalizeEpisodeData(rawData);

        expect(normalized).toHaveLength(0);
      });
    });

    describe('getDefaultPriority', () => {
      it('should return correct priority for each provider', () => {
        expect(SourcesFetcher.getDefaultPriority('aniliberty')).toBe(1);
        expect(SourcesFetcher.getDefaultPriority('anilibria')).toBe(2);
        expect(SourcesFetcher.getDefaultPriority('shikimori')).toBe(3);
        expect(SourcesFetcher.getDefaultPriority('jikan')).toBe(4);
        expect(SourcesFetcher.getDefaultPriority('unknown')).toBe(5);
      });
    });
  });
});