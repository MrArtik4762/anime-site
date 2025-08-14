const request = require('supertest');
const app = require('../../app');
const db = require('../../db/knex');

describe('WatchList API Endpoints', () => {
  let authToken;
  let userId;
  let adminToken;

  beforeAll(async () => {
    // Создаем тестового пользователя
    const user = await db('users').insert({
      username: 'watchlistuser',
      email: 'watchlist@example.com',
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'user',
      avatar: null,
      created_at: new Date(),
      updated_at: new Date(),
    }).returning('*');

    userId = user[0].id;

    // Создаем админ пользователя
    const admin = await db('users').insert({
      username: 'adminwatchlistuser',
      email: 'adminwatchlist@example.com',
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'admin',
      avatar: null,
      created_at: new Date(),
      updated_at: new Date(),
    }).returning('*');

    // Получаем токены авторизации
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'watchlistuser',
        password: 'password',
      });

    authToken = loginResponse.body.token;

    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'adminwatchlistuser',
        password: 'password',
      });

    adminToken = adminLoginResponse.body.token;

    // Добавляем тестовые аниме
    await db('anime').insert([
      {
        id: 1,
        title: 'Тестовое аниме 1',
        title_eng: 'Test Anime 1',
        kind: 'tv',
        status: 'ongoing',
        episodes: 12,
        duration: 24,
        description: 'Описание тестового аниме 1',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        title: 'Тестовое аниме 2',
        title_eng: 'Test Anime 2',
        kind: 'movie',
        status: 'released',
        episodes: 1,
        duration: 120,
        description: 'Описание тестового аниме 2',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        title: 'Тестовое аниме 3',
        title_eng: 'Test Anime 3',
        kind: 'ova',
        status: 'released',
        episodes: 2,
        duration: 30,
        description: 'Описание тестового аниме 3',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Добавляем тестовые данные в watchlist
    await db('watchlist').insert([
      {
        user_id: userId,
        anime_id: 1,
        status: 'watching',
        episodes_watched: 5,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: userId,
        anime_id: 2,
        status: 'completed',
        episodes_watched: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: userId,
        anime_id: 3,
        status: 'planned',
        episodes_watched: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Добавляем данные для другого пользователя
    const otherUser = await db('users').insert({
      username: 'otheruser',
      email: 'other@example.com',
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      role: 'user',
      created_at: new Date(),
      updated_at: new Date(),
    }).returning('*');

    await db('watchlist').insert([
      {
        user_id: otherUser[0].id,
        anime_id: 1,
        status: 'watching',
        episodes_watched: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  });

  afterAll(async () => {
    // Очищаем тестовые данные
    await db('watchlist').del();
    await db('anime').del();
    await db('users').where({ id: userId }).orWhere({ id: adminToken?.userId }).orWhere({ username: 'otheruser' }).del();
    await db.destroy();
  });

  describe('GET /api/watchlist', () => {
    it('возвращает watchlist текущего пользователя', async () => {
      const response = await request(app)
        .get('/api/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(3);
      
      const firstItem = response.body.data[0];
      expect(firstItem).toHaveProperty('anime');
      expect(firstItem).toHaveProperty('status');
      expect(firstItem).toHaveProperty('episodes_watched');
    });

    it('поддерживает фильтрацию по статусу', async () => {
      const response = await request(app)
        .get('/api/watchlist?status=watching')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.every(item => item.status === 'watching')).toBe(true);
    });

    it('поддерживает пагинацию', async () => {
      const response = await request(app)
        .get('/api/watchlist?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body).toHaveProperty('pagination');
    });

    it('возвращает ошибку без авторизации', async () => {
      const response = await request(app)
        .get('/api/watchlist')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'No token provided');
    });
  });

  describe('POST /api/watchlist', () => {
    it('добавляет аниме в watchlist', async () => {
      const watchlistData = {
        anime_id: 1,
        status: 'dropped',
        episodes_watched: 2,
      };

      const response = await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send(watchlistData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('anime_id', 1);
      expect(response.body.data).toHaveProperty('status', 'dropped');
      expect(response.body.data).toHaveProperty('episodes_watched', 2);
    });

    it('возвращает ошибку при добавлении уже существующего аниме', async () => {
      const watchlistData = {
        anime_id: 2,
        status: 'completed',
        episodes_watched: 1,
      };

      const response = await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send(watchlistData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Anime already in watchlist');
    });

    it('возвращает ошибку при добавлении несуществующего аниме', async () => {
      const watchlistData = {
        anime_id: 999,
        status: 'planned',
        episodes_watched: 0,
      };

      const response = await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send(watchlistData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Anime not found');
    });

    it('возвращает ошибку без авторизации', async () => {
      const watchlistData = {
        anime_id: 1,
        status: 'planned',
        episodes_watched: 0,
      };

      const response = await request(app)
        .post('/api/watchlist')
        .send(watchlistData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'No token provided');
    });
  });

  describe('PUT /api/watchlist/:animeId', () => {
    it('обновляет запись в watchlist', async () => {
      const updateData = {
        status: 'completed',
        episodes_watched: 12,
      };

      const response = await request(app)
        .put('/api/watchlist/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', 'completed');
      expect(response.body.data).toHaveProperty('episodes_watched', 12);
    });

    it('возвращает ошибку для несуществующей записи', async () => {
      const updateData = {
        status: 'watching',
        episodes_watched: 1,
      };

      const response = await request(app)
        .put('/api/watchlist/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Watchlist entry not found');
    });

    it('возвращает ошибку без авторизации', async () => {
      const updateData = {
        status: 'watching',
        episodes_watched: 1,
      };

      const response = await request(app)
        .put('/api/watchlist/1')
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'No token provided');
    });
  });

  describe('DELETE /api/watchlist/:animeId', () => {
    it('удаляет запись из watchlist', async () => {
      const response = await request(app)
        .delete('/api/watchlist/3')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Watchlist entry deleted successfully');

      // Проверяем, что запись действительно удалена
      const getResponse = await request(app)
        .get('/api/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const animeIds = getResponse.body.data.map(item => item.anime.id);
      expect(animeIds).not.toContain(3);
    });

    it('возвращает ошибку для несуществующей записи', async () => {
      const response = await request(app)
        .delete('/api/watchlist/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Watchlist entry not found');
    });

    it('возвращает ошибку без авторизации', async () => {
      const response = await request(app)
        .delete('/api/watchlist/1')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'No token provided');
    });
  });

  describe('GET /api/watchlist/stats', () => {
    it('возвращает статистику watchlist', async () => {
      const response = await request(app)
        .get('/api/watchlist/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total_entries');
      expect(response.body.data).toHaveProperty('status_distribution');
      expect(response.body.data).toHaveProperty('total_episodes_watched');
      expect(response.body.data).toHaveProperty('total_watch_time');
      expect(typeof response.body.data.total_entries).toBe('number');
      expect(typeof response.body.data.total_episodes_watched).toBe('number');
      expect(typeof response.body.data.total_watch_time).toBe('number');
    });

    it('возвращает ошибку без авторизации', async () => {
      const response = await request(app)
        .get('/api/watchlist/stats')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'No token provided');
    });
  });

  describe('GET /api/watchlist/export', () => {
    it('экспортирует watchlist в формате JSON', async () => {
      const response = await request(app)
        .get('/api/watchlist/export')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.headers['content-type']).toMatch(/json/);
      
      const data = response.body.data;
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('возвращает ошибку без авторизации', async () => {
      const response = await request(app)
        .get('/api/watchlist/export')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'No token provided');
    });
  });

  describe('POST /api/watchlist/import', () => {
    it('импортирует watchlist из формата JSON', async () => {
      const importData = [
        {
          anime_id: 1,
          status: 'completed',
          episodes_watched: 12,
        },
        {
          anime_id: 2,
          status: 'watching',
          episodes_watched: 0,
        }
      ];

      const response = await request(app)
        .post('/api/watchlist/import')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ data: importData })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Watchlist imported successfully');
      expect(response.body).toHaveProperty('imported_count', 2);
    });

    it('возвращает ошибку при импорте невалидных данных', async () => {
      const importData = [
        {
          anime_id: 'invalid',
          status: 'invalid',
          episodes_watched: 'invalid',
        }
      ];

      const response = await request(app)
        .post('/api/watchlist/import')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ data: importData })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid import data format');
    });

    it('возвращает ошибку без авторизации', async () => {
      const importData = [
        {
          anime_id: 1,
          status: 'watching',
          episodes_watched: 0,
        }
      ];

      const response = await request(app)
        .post('/api/watchlist/import')
        .send({ data: importData })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'No token provided');
    });
  });

  describe('GET /api/watchlist/shared/:userId', () => {
    it('возвращает публичный watchlist пользователя', async () => {
      const otherUserId = (await db('users').where({ username: 'otheruser' }).select('id').first()).id;

      const response = await request(app)
        .get(`/api/watchlist/shared/${otherUserId}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
      
      const firstItem = response.body.data[0];
      expect(firstItem).toHaveProperty('anime');
      expect(firstItem).toHaveProperty('status');
      expect(firstItem).toHaveProperty('episodes_watched');
    });

    it('возвращает 404 для несуществующего пользователя', async () => {
      const response = await request(app)
        .get('/api/watchlist/shared/999')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('возвращает пустой массив для пользователя без watchlist', async () => {
      // Создаем пользователя без watchlist
      const user = await db('users').insert({
        username: 'emptywatchlistuser',
        email: 'empty@example.com',
        password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      }).returning('*');

      const response = await request(app)
        .get(`/api/watchlist/shared/${user[0].id}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);

      // Удаляем тестового пользователя
      await db('users').where({ id: user[0].id }).del();
    });
  });

  describe('GET /api/watchlist/suggestions', () => {
    it('возвращает рекомендации на основе watchlist', async () => {
      const response = await request(app)
        .get('/api/watchlist/suggestions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      const firstSuggestion = response.body.data[0];
      expect(firstSuggestion).toHaveProperty('anime');
      expect(firstSuggestion).toHaveProperty('score');
      expect(firstSuggestion).toHaveProperty('reason');
    });

    it('возвращает пустой массив без рекомендаций', async () => {
      // Создаем пользователя с пустым watchlist
      const user = await db('users').insert({
        username: 'suggestionsuser',
        email: 'suggestions@example.com',
        password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      }).returning('*');

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'suggestionsuser',
          password: 'password',
        });

      const userToken = loginResponse.body.token;

      const response = await request(app)
        .get('/api/watchlist/suggestions')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);

      // Удаляем тестового пользователя
      await db('users').where({ id: user[0].id }).del();
    });

    it('возвращает ошибку без авторизации', async () => {
      const response = await request(app)
        .get('/api/watchlist/suggestions')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'No token provided');
    });
  });
});