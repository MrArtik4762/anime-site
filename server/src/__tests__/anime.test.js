const request = require('supertest');
const app = require('../../app');
const db = require('../../db/knex');

describe('Anime API Endpoints', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Создаем тестового пользователя
    const user = await db('users').insert({
      username: 'animeuser',
      email: 'anime@example.com',
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'user',
      created_at: new Date(),
      updated_at: new Date(),
    }).returning('*');

    userId = user[0].id;

    // Получаем токен авторизации
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'animeuser',
        password: 'password',
      });

    authToken = loginResponse.body.token;

    // Вставляем тестовые данные
    await db('anime').insert([
      {
        id: 1,
        title: 'Тестовое аниме 1',
        title_eng: 'Test Anime 1',
        title_jpn: 'テストアニメ1',
        kind: 'tv',
        status: 'ongoing',
        episodes: 12,
        episodes_aired: 8,
        duration: 24,
        rating: 'PG-13',
        description: 'Описание тестового аниме 1',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        title: 'Тестовое аниме 2',
        title_eng: 'Test Anime 2',
        title_jpn: 'テストアニメ2',
        kind: 'movie',
        status: 'released',
        episodes: 1,
        episodes_aired: 1,
        duration: 120,
        rating: 'R',
        description: 'Описание тестового аниме 2',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    await db('anime_genres').insert([
      { anime_id: 1, genre: 'приключения' },
      { anime_id: 1, genre: 'фэнтези' },
      { anime_id: 2, genre: 'драма' },
    ]);

    await db('anime_episodes').insert([
      {
        id: 1,
        anime_id: 1,
        episode: 1,
        title: 'Эпизод 1',
        description: 'Описание эпизода 1',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        anime_id: 1,
        episode: 2,
        title: 'Эпизод 2',
        description: 'Описание эпизода 2',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  });

  afterAll(async () => {
    // Очищаем тестовые данные
    await db('anime_episodes').del();
    await db('anime_genres').del();
    await db('anime').del();
    await db('users').where({ id: userId }).del();
    await db.destroy();
  });

  describe('GET /api/anime', () => {
    it('возвращает список аниме', async () => {
      const response = await request(app)
        .get('/api/anime')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('поддерживает пагинацию', async () => {
      const response = await request(app)
        .get('/api/anime?page=1&limit=1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.length).toBeLessThanOrEqual(1);
      expect(response.body).toHaveProperty('pagination');
    });

    it('поддерживает фильтрацию по статусу', async () => {
      const response = await request(app)
        .get('/api/anime?status=ongoing')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.every(anime => anime.status === 'ongoing')).toBe(true);
    });

    it('поддерживает фильтрацию по типу', async () => {
      const response = await request(app)
        .get('/api/anime?kind=movie')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.every(anime => anime.kind === 'movie')).toBe(true);
    });

    it('поддерживает поиск по названию', async () => {
      const response = await request(app)
        .get('/api/anime?search=Тестовое аниме 1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].title).toBe('Тестовое аниме 1');
    });

    it('поддерживает сортировку', async () => {
      const response = await request(app)
        .get('/api/anime?sort=title&order=asc')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      const titles = response.body.data.map(anime => anime.title);
      expect(titles).toEqual([...titles].sort());
    });
  });

  describe('GET /api/anime/:id', () => {
    it('возвращает аниме по ID', async () => {
      const response = await request(app)
        .get('/api/anime/1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty('title', 'Тестовое аниме 1');
      expect(response.body.data).toHaveProperty('genres');
      expect(Array.isArray(response.body.data.genres)).toBe(true);
    });

    it('возвращает 404 для несуществующего аниме', async () => {
      const response = await request(app)
        .get('/api/anime/999')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Anime not found');
    });
  });

  describe('POST /api/anime', () => {
    it('создает новое аниме (только для админов)', async () => {
      const newAnime = {
        title: 'Новое аниме',
        title_eng: 'New Anime',
        title_jpn: '新しいアニメ',
        kind: 'tv',
        status: 'ongoing',
        episodes: 24,
        episodes_aired: 12,
        duration: 24,
        rating: 'PG-13',
        description: 'Описание нового аниме',
        genres: ['приключения', 'фэнтези'],
      };

      const response = await request(app)
        .post('/api/anime')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newAnime)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('title', 'Новое аниме');
      expect(response.body.data).toHaveProperty('id');
    });

    it('возвращает ошибку без авторизации', async () => {
      const newAnime = {
        title: 'Новое аниме',
        title_eng: 'New Anime',
        kind: 'tv',
        status: 'ongoing',
        episodes: 24,
        duration: 24,
        rating: 'PG-13',
        description: 'Описание нового аниме',
      };

      const response = await request(app)
        .post('/api/anime')
        .send(newAnime)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('возвращает ошибку при невалидных данных', async () => {
      const invalidAnime = {
        title: '',
        kind: 'invalid',
        status: 'invalid',
        episodes: -1,
        duration: -1,
      };

      const response = await request(app)
        .post('/api/anime')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidAnime)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('PUT /api/anime/:id', () => {
    it('обновляет аниме (только для админов)', async () => {
      const updateData = {
        title: 'Обновленное аниме',
        description: 'Обновленное описание',
        status: 'released',
      };

      const response = await request(app)
        .put('/api/anime/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('title', 'Обновленное аниме');
      expect(response.body.data).toHaveProperty('description', 'Обновленное описание');
      expect(response.body.data).toHaveProperty('status', 'released');
    });

    it('возвращает ошибку для несуществующего аниме', async () => {
      const updateData = {
        title: 'Обновленное аниме',
      };

      const response = await request(app)
        .put('/api/anime/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Anime not found');
    });
  });

  describe('DELETE /api/anime/:id', () => {
    it('удаляет аниме (только для админов)', async () => {
      const response = await request(app)
        .delete('/api/anime/2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Anime deleted successfully');

      // Проверяем, что аниме действительно удалено
      const getResponse = await request(app)
        .get('/api/anime/2')
        .expect(404);

      expect(getResponse.body).toHaveProperty('success', false);
    });

    it('возвращает ошибку для несуществующего аниме', async () => {
      const response = await request(app)
        .delete('/api/anime/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Anime not found');
    });
  });

  describe('GET /api/anime/:id/episodes', () => {
    it('возвращает эпизоды аниме', async () => {
      const response = await request(app)
        .get('/api/anime/1/episodes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('возвращает пустой массив для аниме без эпизодов', async () => {
      // Создаем аниме без эпизодов
      await db('anime').insert({
        id: 3,
        title: 'Аниме без эпизодов',
        kind: 'tv',
        status: 'ongoing',
        episodes: 0,
        duration: 24,
        description: 'Описание',
        created_at: new Date(),
        updated_at: new Date(),
      });

      const response = await request(app)
        .get('/api/anime/3/episodes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);

      // Удаляем тестовое аниме
      await db('anime').where({ id: 3 }).del();
    });
  });

  describe('GET /api/anime/search', () => {
    it('ищет аниме по запросу', async () => {
      const response = await request(app)
        .get('/api/anime/search?q=Тестовое')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.every(anime => 
        anime.title.toLowerCase().includes('тестовое') ||
        anime.title_eng?.toLowerCase().includes('test') ||
        anime.title_jpn?.toLowerCase().includes('テスト')
      )).toBe(true);
    });

    it('возвращает пустой массив для пустого поиска', async () => {
      const response = await request(app)
        .get('/api/anime/search?q=несуществующее')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('GET /api/anime/genres', () => {
    it('возвращает список жанров', async () => {
      const response = await request(app)
        .get('/api/anime/genres')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.includes('приключения')).toBe(true);
      expect(response.body.data.includes('фэнтези')).toBe(true);
      expect(response.body.data.includes('драма')).toBe(true);
    });
  });

  describe('GET /api/anime/stats', () => {
    it('возвращает статистику по аниме', async () => {
      const response = await request(app)
        .get('/api/anime/stats')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total_anime');
      expect(response.body.data).toHaveProperty('total_episodes');
      expect(response.body.data).toHaveProperty('status_distribution');
      expect(response.body.data).toHaveProperty('kind_distribution');
      expect(typeof response.body.data.total_anime).toBe('number');
      expect(typeof response.body.data.total_episodes).toBe('number');
      expect(typeof response.body.data.status_distribution).toBe('object');
      expect(typeof response.body.data.kind_distribution).toBe('object');
    });
  });
});