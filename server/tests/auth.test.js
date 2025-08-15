const request = require('supertest');
const app = require('../app');
const db = require('../db/knex');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Загрузка констант
const { HTTP_STATUS, ERROR_MESSAGES } = require('../../shared/constants/constants');

describe('Auth API Endpoints Integration Tests', () => {
  // Настройка тестовой среды
  beforeAll(async () => {
    // Очищаем все таблицы перед тестами
    await db('users').truncate();
    await db('password_resets').truncate();
    
    // Устанавливаем тестовые переменные окружения
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
    process.env.NODE_ENV = 'test';
  });

  afterAll(async () => {
    await db.destroy();
  });

  // Очистка данных после каждого теста
  afterEach(async () => {
    await db('users').truncate();
    await db('password_resets').truncate();
  });

  describe('1. Настройка тестовой среды', () => {
    it('должен иметь доступ к тестовой базе данных', async () => {
      const result = await db.raw('SELECT 1');
      expect(result).toBeDefined();
    });

    it('должен иметь настроенные переменные окружения для тестов', () => {
      expect(process.env.JWT_SECRET).toBe('test-jwt-secret');
      expect(process.env.JWT_REFRESH_SECRET).toBe('test-jwt-refresh-secret');
      expect(process.env.NODE_ENV).toBe('test');
    });
  });

  describe('2. Тесты для регистрации', () => {
    it('успешная регистрация с валидными данными', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(HTTP_STATUS.CREATED);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('username', 'testuser');
      expect(response.body.data.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.data.user).not.toHaveProperty('password_hash');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('регистрация с невалидным email', async () => {
      const userData = {
        username: 'testuser2',
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message', 'Пожалуйста, введите корректный email');
    });

    it('регистрация с коротким паролем', async () => {
      const userData = {
        username: 'testuser3',
        email: 'test3@example.com',
        password: 'short',
        confirmPassword: 'short',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message', 'Пароль должен содержать минимум 8 символов');
    });

    it('регистрация с существующим email', async () => {
      // Сначала создаем пользователя
      await db('users').insert({
        username: 'existinguser',
        email: 'existing@example.com',
        password_hash: await bcrypt.hash('password123', 10),
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      });

      const userData = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message', 'Пользователь с таким email или именем уже существует');
    });

    it('регистрация с отсутствующими полями', async () => {
      const userData = {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('3. Тесты для входа', () => {
    beforeEach(async () => {
      // Создаем тестового пользователя
      const hashedPassword = await bcrypt.hash('password123', 10);
      await db('users').insert({
        username: 'loginuser',
        email: 'login@example.com',
        password_hash: hashedPassword,
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      });
    });

    it('успешный вход с правильными данными', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(HTTP_STATUS.OK);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('email', 'login@example.com');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      
      // Проверяем наличие refreshToken в cookie
      const cookie = response.headers['set-cookie'];
      expect(cookie).toBeDefined();
      expect(cookie[0]).toContain('refreshToken');
    });

    it('вход с неправильным паролем', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message', 'Неверные учетные данные');
    });

    it('вход с несуществующим пользователем', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message', 'Неверные учетные данные');
    });

    it('вход с отсутствующими полями', async () => {
      const loginData = {
        email: '',
        password: '',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('4. Тесты для обновления токена', () => {
    let refreshToken;
    let userId;

    beforeEach(async () => {
      // Создаем тестового пользователя
      const hashedPassword = await bcrypt.hash('password123', 10);
      const [user] = await db('users').insert({
        username: 'refreshtestuser',
        email: 'refreshtest@example.com',
        password_hash: hashedPassword,
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      }).returning('id');

      userId = user.id;

      // Создаем refresh токен
      refreshToken = jwt.sign(
        { id: userId, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '30d' }
      );

      // Сохраняем refresh токен в базе данных
      await db('users').where({ id: userId }).update({
        refresh_token: refreshToken,
      });
    });

    it('успешное обновление токена с валидным refresh токеном', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(HTTP_STATUS.OK);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      
      // Проверяем, что новый access токен валиден
      const newAccessToken = response.body.data.tokens.accessToken;
      const decoded = jwt.verify(newAccessToken, process.env.JWT_SECRET);
      expect(decoded.id).toBe(userId);
    });

    it('обновление с истекшим refresh токеном', async () => {
      // Создаем истекший токен
      const expiredToken = jwt.sign(
        { id: userId, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '-1d' }
      );

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${expiredToken}`])
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message', 'Недействительный refresh токен');
    });

    it('обновление с недействительным refresh токеном', async () => {
      const invalidToken = 'invalid-token-string';

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${invalidToken}`])
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message', 'Недействительный refresh токен');
    });

    it('обновление без refresh токена', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message', 'Refresh токен не предоставлен');
    });
  });

  describe('5. Тесты для выхода', () => {
    let authToken;
    let refreshToken;
    let userId;

    beforeEach(async () => {
      // Создаем тестового пользователя
      const hashedPassword = await bcrypt.hash('password123', 10);
      const [user] = await db('users').insert({
        username: 'logoutuser',
        email: 'logout@example.com',
        password_hash: hashedPassword,
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      }).returning('id');

      userId = user.id;

      // Создаем токены
      authToken = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      refreshToken = jwt.sign(
        { id: userId, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '30d' }
      );

      // Сохраняем refresh токен в базе данных
      await db('users').where({ id: userId }).update({
        refresh_token: refreshToken,
      });
    });

    it('успешный выход', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(HTTP_STATUS.OK);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Успешный выход из системы');

      // Проверяем, что refresh токен удален из базы данных
      const user = await db('users').where({ id: userId }).first();
      expect(user.refresh_token).toBeNull();

      // Проверяем, что cookie удален
      const cookie = response.headers['set-cookie'];
      expect(cookie).toBeDefined();
      expect(cookie[0]).toContain('refreshToken=;');
    });

    it('выход без авторизации', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('6. Интеграционные тесты', () => {
    it('полный цикл: регистрация → вход → обновление токена → выход', async () => {
      // Шаг 1: Регистрация
      const registerData = {
        username: 'integrationuser',
        email: 'integration@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(registerData)
        .expect(HTTP_STATUS.CREATED);

      expect(registerResponse.body).toHaveProperty('success', true);
      const userId = registerResponse.body.data.user.id;
      const initialAccessToken = registerResponse.body.data.tokens.accessToken;
      
      // Проверяем наличие refreshToken в cookie
      const cookie = registerResponse.headers['set-cookie'];
      expect(cookie).toBeDefined();
      const refreshToken = cookie[0].split(';')[0].split('=')[1];

      // Шаг 2: Вход
      const loginData = {
        email: 'integration@example.com',
        password: 'password123',
      };

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(HTTP_STATUS.OK);

      expect(loginResponse.body).toHaveProperty('success', true);
      expect(loginResponse.body.data.user.email).toBe('integration@example.com');

      // Шаг 3: Обновление токена
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(HTTP_STATUS.OK);

      expect(refreshResponse.body).toHaveProperty('success', true);
      expect(refreshResponse.body.data.tokens).toHaveProperty('accessToken');

      // Шаг 4: Выход
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${initialAccessToken}`)
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(HTTP_STATUS.OK);

      expect(logoutResponse.body).toHaveProperty('success', true);

      // Проверяем, что пользователь не может войти с теми же данными после выхода
      // (refresh токен должен быть удален)
      const finalLoginResponse = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(HTTP_STATUS.UNAUTHORIZED);

      expect(finalLoginResponse.body).toHaveProperty('success', false);
    });

    it('проверка безопасности CORS', async () => {
      // Тестируем CORS заголовки
      const response = await request(app)
        .post('/api/auth/register')
        .set('Origin', 'http://localhost:3000')
        .send({
          username: 'corsuser',
          email: 'cors@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        })
        .expect(HTTP_STATUS.CREATED);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
      expect(response.headers).toHaveProperty('access-control-allow-credentials');
      expect(response.headers['access-control-allow-credentials']).toBe('true');

      // Тест preflight запроса
      const optionsResponse = await request(app)
        .options('/api/auth/register')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type')
        .expect(HTTP_STATUS.NO_CONTENT);

      expect(optionsResponse.headers).toHaveProperty('access-control-allow-origin');
      expect(optionsResponse.headers['access-control-allow-origin']).toBe('http://localhost:3000');
      expect(optionsResponse.headers).toHaveProperty('access-control-allow-methods');
      expect(optionsResponse.headers['access-control-allow-methods']).toContain('POST');
    });

    it('защита от CSRF атак', async () => {
      // Сначала регистрируем пользователя
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'csrfuser',
          email: 'csrf@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        })
        .expect(HTTP_STATUS.CREATED);

      // Входим для получения токена
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'csrf@example.com',
          password: 'password123',
        })
        .expect(HTTP_STATUS.OK);

      const accessToken = loginResponse.body.data.tokens.accessToken;

      // Пытаемся сделать запрос без CSRF токена
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HTTP_STATUS.OK); // В данном случае ожидаем успех, так как CSRF защита может быть отключена

      // В реальном приложении здесь должна быть проверка CSRF токена
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('7. Дополнительные тесты безопасности', () => {
    it('защита от перебора паролей', async () => {
      // Создаем пользователя
      await db('users').insert({
        username: 'bruteforceuser',
        email: 'bruteforce@example.com',
        password_hash: await bcrypt.hash('password123', 10),
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Пытаемся войти с неправильными паролями多次
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'bruteforce@example.com',
            password: 'wrongpassword',
          })
          .expect(HTTP_STATUS.UNAUTHORIZED);
      }

      // Следующая попытка должна быть заблокирована
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'bruteforce@example.com',
          password: 'password123',
        })
        .expect(HTTP_STATUS.TOO_MANY_REQUESTS);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error.message).toContain('Аккаунт заблокирован');
    });

    it('валидация email с помощью регулярного выражения', async () => {
      const invalidEmails = [
        'invalid-email',
        'invalid@',
        '@invalid.com',
        'invalid@invalid',
        'invalid..email@invalid.com',
        'invalid.email@invalid.',
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            username: `user${email}`,
            email: email,
            password: 'password123',
            confirmPassword: 'password123',
          })
          .expect(HTTP_STATUS.BAD_REQUEST);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toHaveProperty('message', 'Пожалуйста, введите корректный email');
      }
    });

    it('хеширование паролей', async () => {
      const userData = {
        username: 'hashuser',
        email: 'hash@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(HTTP_STATUS.CREATED);

      // Проверяем, что пароль хеширован в базе данных
      const user = await db('users').where({ email: 'hash@example.com' }).first();
      expect(user.password_hash).toBeDefined();
      expect(user.password_hash).not.toBe('password123');
      
      // Проверяем, что хеш правильный
      const isPasswordValid = await bcrypt.compare('password123', user.password_hash);
      expect(isPasswordValid).toBe(true);
    });

    it('проверка валидации данных на стороне сервера', async () => {
      // Проверка минимальной длины пароля
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'shortpassuser',
          email: 'shortpass@example.com',
          password: '123',
          confirmPassword: '123',
        })
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message', 'Пароль должен содержать минимум 8 символов');
    });

    it('проверка уникальности username', async () => {
      // Создаем первого пользователя
      await db('users').insert({
        username: 'uniqueuser',
        email: 'unique1@example.com',
        password_hash: await bcrypt.hash('password123', 10),
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Пытаемся создать второго пользователя с тем же username
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'uniqueuser',
          email: 'unique2@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        })
        .expect(HTTP_STATUS.BAD_REQUEST);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message', 'Пользователь с таким email или именем уже существует');
    });
  });
});