const request = require('supertest');
const app = require('../../app');
const db = require('../../db/knex');

describe('Auth API Endpoints', () => {
  beforeAll(async () => {
    // Очищаем таблицу пользователей перед тестами
    await db('users').truncate();
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('POST /api/auth/register', () => {
    it('успешно регистрирует нового пользователя', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', 'testuser');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('возвращает ошибку при несовпадении паролей', async () => {
      const userData = {
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'password123',
        confirmPassword: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Passwords do not match');
    });

    it('возвращает ошибку при существующем username', async () => {
      const userData = {
        username: 'testuser',
        email: 'test3@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Username already exists');
    });

    it('возвращает ошибку при существующем email', async () => {
      const userData = {
        username: 'testuser3',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Email already exists');
    });

    it('возвращает ошибку при невалидных данных', async () => {
      const userData = {
        username: '',
        email: 'invalid-email',
        password: 'short',
        confirmPassword: 'short',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Создаем тестового пользователя
      await db('users').insert({
        username: 'loginuser',
        email: 'login@example.com',
        password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      });
    });

    afterEach(async () => {
      // Удаляем тестового пользователя
      await db('users').where({ username: 'loginuser' }).del();
    });

    it('успешно авторизует пользователя', async () => {
      const loginData = {
        username: 'loginuser',
        password: 'password',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', 'loginuser');
    });

    it('возвращает ошибку при неверном пароле', async () => {
      const loginData = {
        username: 'loginuser',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('возвращает ошибку при несуществующем пользователе', async () => {
      const loginData = {
        username: 'nonexistent',
        password: 'password',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken;

    beforeEach(async () => {
      // Создаем тестового пользователя
      const user = await db('users').insert({
        username: 'meuser',
        email: 'me@example.com',
        password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      }).returning('*');

      // Получаем токен
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'meuser',
          password: 'password',
        });

      authToken = loginResponse.body.token;
    });

    afterEach(async () => {
      // Удаляем тестового пользователя
      await db('users').where({ username: 'meuser' }).del();
    });

    it('возвращает данные текущего пользователя', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', 'meuser');
      expect(response.body.user).toHaveProperty('email', 'me@example.com');
    });

    it('возвращает ошибку при отсутствии токена', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'No token provided');
    });

    it('возвращает ошибку при неверном токене', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid token');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      // Создаем тестового пользователя
      await db('users').insert({
        username: 'forgotuser',
        email: 'forgot@example.com',
        password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      });
    });

    afterEach(async () => {
      // Удаляем тестового пользователя
      await db('users').where({ username: 'forgotuser' }).del();
    });

    it('успешно отправляет письмо для восстановления пароля', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'forgot@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Password reset email sent');
    });

    it('возвращает ошибку при несуществующем email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'User not found');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let resetToken;

    beforeEach(async () => {
      // Создаем тестового пользователя
      const user = await db('users').insert({
        username: 'resetuser',
        email: 'reset@example.com',
        password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      }).returning('*');

      // Генерируем токен сброса пароля
      resetToken = 'reset-token-' + user[0].id;
    });

    afterEach(async () => {
      // Удаляем тестового пользователя
      await db('users').where({ username: 'resetuser' }).del();
    });

    it('успешно сбрасывает пароль', async () => {
      const resetData = {
        token: resetToken,
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      };

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Password reset successfully');

      // Проверяем, что новый пароль работает
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'resetuser',
          password: 'newpassword123',
        });

      expect(loginResponse.body).toHaveProperty('success', true);
    });

    it('возвращает ошибку при неверном токене', async () => {
      const resetData = {
        token: 'invalid-token',
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      };

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid or expired token');
    });

    it('возвращает ошибку при несовпадении паролей', async () => {
      const resetData = {
        token: resetToken,
        password: 'newpassword123',
        confirmPassword: 'differentpassword',
      };

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Passwords do not match');
    });
  });
});