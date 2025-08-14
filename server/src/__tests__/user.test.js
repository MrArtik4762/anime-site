const request = require('supertest');
const app = require('../../app');
const db = require('../../db/knex');

describe('User API Endpoints', () => {
  let authToken;
  let userId;
  let adminToken;

  beforeAll(async () => {
    // Создаем тестового пользователя
    const user = await db('users').insert({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'user',
      avatar: null,
      created_at: new Date(),
      updated_at: new Date(),
    }).returning('*');

    userId = user[0].id;

    // Создаем админ пользователя
    const admin = await db('users').insert({
      username: 'adminuser',
      email: 'admin@example.com',
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
        username: 'testuser',
        password: 'password',
      });

    authToken = loginResponse.body.token;

    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'adminuser',
        password: 'password',
      });

    adminToken = adminLoginResponse.body.token;

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
    ]);

    // Добавляем тестовые данные в watch progress
    await db('watch_progress').insert([
      {
        user_id: userId,
        anime_id: 1,
        episode_id: 1,
        progress: 45.5,
        completed: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: userId,
        anime_id: 1,
        episode_id: 2,
        progress: 0,
        completed: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

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
    ]);
  });

  afterAll(async () => {
    // Очищаем тестовые данные
    await db('watch_progress').del();
    await db('watchlist').del();
    await db('anime').del();
    await db('users').where({ id: userId }).orWhere({ id: adminToken?.userId }).del();
    await db.destroy();
  });

  describe('GET /api/users/me', () => {
    it('возвращает данные текущего пользователя', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('username', 'testuser');
      expect(response.body.data).toHaveProperty('email', 'test@example.com');
      expect(response.body.data).toHaveProperty('role', 'user');
    });

    it('возвращает ошибку без авторизации', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'No token provided');
    });
  });

  describe('PUT /api/users/me', () => {
    it('обновляет профиль пользователя', async () => {
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com',
        preferences: {
          theme: 'dark',
          language: 'ru',
        },
      };

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('username', 'updateduser');
      expect(response.body.data).toHaveProperty('email', 'updated@example.com');
      expect(response.body.data).toHaveProperty('preferences');
      expect(response.body.data.preferences).toHaveProperty('theme', 'dark');
    });

    it('возвращает ошибку при дублировании username', async () => {
      // Сначала создаем пользователя с таким username
      await db('users').insert({
        username: 'existinguser',
        email: 'existing@example.com',
        password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      });

      const updateData = {
        username: 'existinguser',
      };

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Username already exists');

      // Удаляем тестового пользователя
      await db('users').where({ username: 'existinguser' }).del();
    });

    it('возвращает ошибку при дублировании email', async () => {
      // Сначала создаем пользователя с таким email
      await db('users').insert({
        username: 'existingemailuser',
        email: 'existing@example.com',
        password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      });

      const updateData = {
        email: 'existing@example.com',
      };

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Email already exists');

      // Удаляем тестового пользователя
      await db('users').where({ username: 'existingemailuser' }).del();
    });
  });

  describe('PUT /api/users/me/password', () => {
    it('обновляет пароль пользователя', async () => {
      const passwordData = {
        currentPassword: 'password',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };

      const response = await request(app)
        .put('/api/users/me/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Password updated successfully');

      // Проверяем, что новый пароль работает
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'newpassword123',
        });

      expect(loginResponse.body).toHaveProperty('success', true);
    });

    it('возвращает ошибку при неверном текущем пароле', async () => {
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };

      const response = await request(app)
        .put('/api/users/me/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Current password is incorrect');
    });

    it('возвращает ошибку при несовпадении паролей', async () => {
      const passwordData = {
        currentPassword: 'password',
        newPassword: 'newpassword123',
        confirmPassword: 'differentpassword',
      };

      const response = await request(app)
        .put('/api/users/me/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'New passwords do not match');
    });
  });

  describe('POST /api/users/me/avatar', () => {
    it('загружает аватар пользователя', async () => {
      const avatarData = {
        avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU7jgAAAABJRU5ErkJggg==',
      };

      const response = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${authToken}`)
        .send(avatarData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('avatar');
      expect(typeof response.body.data.avatar).toBe('string');
    });

    it('возвращает ошибку при невалидном формате аватара', async () => {
      const avatarData = {
        avatar: 'invalid-base64-data',
      };

      const response = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${authToken}`)
        .send(avatarData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid avatar format');
    });
  });

  describe('DELETE /api/users/me/avatar', () => {
    it('удаляет аватар пользователя', async () => {
      // Сначала загружаем аватар
      await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU7jgAAAABJRU5ErkJggg==',
        });

      const response = await request(app)
        .delete('/api/users/me/avatar')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Avatar deleted successfully');
    });
  });

  describe('GET /api/users/me/watchlist', () => {
    it('возвращает список аниме в watchlist пользователя', async () => {
      const response = await request(app)
        .get('/api/users/me/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      const firstItem = response.body.data[0];
      expect(firstItem).toHaveProperty('anime');
      expect(firstItem).toHaveProperty('status');
      expect(firstItem).toHaveProperty('episodes_watched');
    });

    it('поддерживает пагинацию', async () => {
      const response = await request(app)
        .get('/api/users/me/watchlist?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.length).toBeLessThanOrEqual(1);
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('POST /api/users/me/watchlist', () => {
    it('добавляет аниме в watchlist', async () => {
      const watchlistData = {
        anime_id: 1,
        status: 'planned',
        episodes_watched: 0,
      };

      const response = await request(app)
        .post('/api/users/me/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send(watchlistData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('anime_id', 1);
      expect(response.body.data).toHaveProperty('status', 'planned');
    });

    it('возвращает ошибку при добавлении уже существующего аниме', async () => {
      const watchlistData = {
        anime_id: 1,
        status: 'watching',
        episodes_watched: 0,
      };

      const response = await request(app)
        .post('/api/users/me/watchlist')
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
        .post('/api/users/me/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send(watchlistData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Anime not found');
    });
  });

  describe('PUT /api/users/me/watchlist/:animeId', () => {
    it('обновляет статус аниме в watchlist', async () => {
      const updateData = {
        status: 'completed',
        episodes_watched: 12,
      };

      const response = await request(app)
        .put('/api/users/me/watchlist/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', 'completed');
      expect(response.body.data).toHaveProperty('episodes_watched', 12);
    });

    it('возвращает ошибку для несуществующего аниме в watchlist', async () => {
      const updateData = {
        status: 'completed',
        episodes_watched: 1,
      };

      const response = await request(app)
        .put('/api/users/me/watchlist/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Anime not found in watchlist');
    });
  });

  describe('DELETE /api/users/me/watchlist/:animeId', () => {
    it('удаляет аниме из watchlist', async () => {
      const response = await request(app)
        .delete('/api/users/me/watchlist/2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Anime removed from watchlist');

      // Проверяем, что аниме действительно удалено
      const getResponse = await request(app)
        .get('/api/users/me/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const animeIds = getResponse.body.data.map(item => item.anime.id);
      expect(animeIds).not.toContain(2);
    });

    it('возвращает ошибку для несуществующего аниме в watchlist', async () => {
      const response = await request(app)
        .delete('/api/users/me/watchlist/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Anime not found in watchlist');
    });
  });

  describe('GET /api/users/me/stats', () => {
    it('возвращает статистику пользователя', async () => {
      const response = await request(app)
        .get('/api/users/me/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total_anime');
      expect(response.body.data).toHaveProperty('completed_anime');
      expect(response.body.data).toHaveProperty('watching_anime');
      expect(response.body.data).toHaveProperty('planned_anime');
      expect(response.body.data).toHaveProperty('total_episodes_watched');
      expect(response.body.data).toHaveProperty('total_watch_time');
      expect(typeof response.body.data.total_anime).toBe('number');
      expect(typeof response.body.data.completed_anime).toBe('number');
    });
  });

  describe('GET /api/users/:username', () => {
    it('возвращает публичные данные пользователя', async () => {
      const response = await request(app)
        .get('/api/users/testuser')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('username', 'testuser');
      expect(response.body.data).toHaveProperty('role');
      expect(response.body.data).not.toHaveProperty('email'); // Email не должен быть публичным
    });

    it('возвращает 404 для несуществующего пользователя', async () => {
      const response = await request(app)
        .get('/api/users/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'User not found');
    });
  });

  describe('GET /api/users/:username/watchlist', () => {
    it('возвращает публичный watchlist пользователя', async () => {
      const response = await request(app)
        .get('/api/users/testuser/watchlist')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      const firstItem = response.body.data[0];
      expect(firstItem).toHaveProperty('anime');
      expect(firstItem).toHaveProperty('status');
      expect(firstItem).not.toHaveProperty('episodes_watched'); // Не должен быть публичным
    });

    it('возвращает пустой массив для пользователя без watchlist', async () => {
      // Создаем пользователя без watchlist
      const user = await db('users').insert({
        username: 'nolistuser',
        email: 'nolist@example.com',
        password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      }).returning('*');

      const response = await request(app)
        .get('/api/users/nolistuser/watchlist')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);

      // Удаляем тестового пользователя
      await db('users').where({ id: user[0].id }).del();
    });
  });
});