const db = require('../../db/knex');
const { UserKnex } = require('../../models/UserKnex');
const { WatchProgressKnex } = require('../../models/WatchProgressKnex');
const { WatchListKnex } = require('../../models/WatchListKnex');

describe('Database Models and Operations', () => {
  beforeAll(async () => {
    // Убеждаемся, что таблицы существуют
    await db.migrate.latest();
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('User Model', () => {
    let userId;

    beforeEach(async () => {
      // Создаем тестового пользователя
      const user = await db('users').insert({
        username: 'dbtestuser',
        email: 'dbtest@example.com',
        password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'user',
        avatar: null,
        created_at: new Date(),
        updated_at: new Date(),
      }).returning('id');

      userId = user[0];
    });

    afterEach(async () => {
      // Удаляем тестового пользователя
      await db('users').where({ id: userId }).del();
    });

    test('создание пользователя', async () => {
      const user = await UserKnex.create({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'user',
      });

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('username', 'newuser');
      expect(user).toHaveProperty('email', 'newuser@example.com');
      expect(user).toHaveProperty('role', 'user');
      expect(user).toHaveProperty('password_hash');
      expect(user.password_hash).not.toBe('password123'); // Пароль должен быть хеширован
    });

    test('поиск пользователя по ID', async () => {
      const user = await UserKnex.findById(userId);
      
      expect(user).toHaveProperty('id', userId);
      expect(user).toHaveProperty('username', 'dbtestuser');
      expect(user).toHaveProperty('email', 'dbtest@example.com');
    });

    test('поиск пользователя по username', async () => {
      const user = await UserKnex.findByUsername('dbtestuser');
      
      expect(user).toHaveProperty('id', userId);
      expect(user).toHaveProperty('username', 'dbtestuser');
      expect(user).toHaveProperty('email', 'dbtest@example.com');
    });

    test('поиск пользователя по email', async () => {
      const user = await UserKnex.findByEmail('dbtest@example.com');
      
      expect(user).toHaveProperty('id', userId);
      expect(user).toHaveProperty('username', 'dbtestuser');
      expect(user).toHaveProperty('email', 'dbtest@example.com');
    });

    test('обновление пользователя', async () => {
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com',
        preferences: {
          theme: 'dark',
          language: 'ru',
        },
      };

      const user = await UserKnex.update(userId, updateData);
      
      expect(user).toHaveProperty('id', userId);
      expect(user).toHaveProperty('username', 'updateduser');
      expect(user).toHaveProperty('email', 'updated@example.com');
      expect(user).toHaveProperty('preferences');
      expect(user.preferences).toHaveProperty('theme', 'dark');
    });

    test('удаление пользователя', async () => {
      const result = await UserKnex.delete(userId);
      
      expect(result).toBe(1); // Количество удаленных строк
      
      // Проверяем, что пользователь действительно удален
      const user = await UserKnex.findById(userId);
      expect(user).toBeUndefined();
    });

    test('проверка существования пользователя по username', async () => {
      const exists = await UserKnex.usernameExists('dbtestuser');
      expect(exists).toBe(true);

      const notExists = await UserKnex.usernameExists('nonexistent');
      expect(notExists).toBe(false);
    });

    test('проверка существования пользователя по email', async () => {
      const exists = await UserKnex.emailExists('dbtest@example.com');
      expect(exists).toBe(true);

      const notExists = await UserKnex.emailExists('nonexistent@example.com');
      expect(notExists).toBe(false);
    });

    test('проверка пароля', async () => {
      const user = await UserKnex.findById(userId);
      
      const validPassword = await UserKnex.checkPassword(user, 'password');
      expect(validPassword).toBe(true);

      const invalidPassword = await UserKnex.checkPassword(user, 'wrongpassword');
      expect(invalidPassword).toBe(false);
    });

    test('хеширование пароля', async () => {
      const password = 'testpassword123';
      const hash = await UserKnex.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
      
      // Проверяем, что хеш валиден
      const isValid = await UserKnex.checkPassword({ password_hash: hash }, password);
      expect(isValid).toBe(true);
    });

    test('получение всех пользователей', async () => {
      // Создаем еще одного пользователя
      await db('users').insert({
        username: 'anothertestuser',
        email: 'another@example.com',
        password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      });

      const users = await UserKnex.findAll();
      
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
      expect(users.some(u => u.username === 'dbtestuser')).toBe(true);
      expect(users.some(u => u.username === 'anothertestuser')).toBe(true);
    });
  });

  describe('WatchProgress Model', () => {
    let userId;
    let animeId;
    let episodeId;

    beforeAll(async () => {
      // Создаем тестовые данные
      const user = await db('users').insert({
        username: 'watchprogresstestuser',
        email: 'watchprogress@example.com',
        password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      }).returning('id');

      userId = user[0];

      const anime = await db('anime').insert({
        title: 'Тестовое аниме для прогресса',
        kind: 'tv',
        status: 'ongoing',
        episodes: 12,
        duration: 24,
        description: 'Описание',
        created_at: new Date(),
        updated_at: new Date(),
      }).returning('id');

      animeId = anime[0];

      const episode = await db('anime_episodes').insert({
        anime_id: animeId,
        episode: 1,
        title: 'Эпизод 1',
        description: 'Описание эпизода',
        created_at: new Date(),
        updated_at: new Date(),
      }).returning('id');

      episodeId = episode[0];
    });

    afterAll(async () => {
      // Очищаем тестовые данные
      await db('watch_progress').del();
      await db('anime_episodes').del();
      await db('anime').del();
      await db('users').where({ id: userId }).del();
    });

    test('создание прогресса просмотра', async () => {
      const progress = await WatchProgressKnex.create({
        user_id: userId,
        anime_id: animeId,
        episode_id: episodeId,
        progress: 45.5,
        completed: false,
      });

      expect(progress).toHaveProperty('id');
      expect(progress).toHaveProperty('user_id', userId);
      expect(progress).toHaveProperty('anime_id', animeId);
      expect(progress).toHaveProperty('episode_id', episodeId);
      expect(progress).toHaveProperty('progress', 45.5);
      expect(progress).toHaveProperty('completed', false);
    });

    test('получение прогресса по ID', async () => {
      // Создаем прогресс
      const createdProgress = await WatchProgressKnex.create({
        user_id: userId,
        anime_id: animeId,
        episode_id: episodeId,
        progress: 30.0,
        completed: false,
      });

      const progress = await WatchProgressKnex.findById(createdProgress.id);
      
      expect(progress).toHaveProperty('id', createdProgress.id);
      expect(progress).toHaveProperty('progress', 30.0);
    });

    test('получение прогресса пользователя для аниме', async () => {
      // Создаем прогресс для другого эпизода
      const anotherEpisode = await db('anime_episodes').insert({
        anime_id: animeId,
        episode: 2,
        title: 'Эпизод 2',
        description: 'Описание эпизода 2',
        created_at: new Date(),
        updated_at: new Date(),
      }).returning('id');

      await WatchProgressKnex.create({
        user_id: userId,
        anime_id: animeId,
        episode_id: anotherEpisode[0],
        progress: 60.0,
        completed: false,
      });

      const progress = await WatchProgressKnex.getUserAnimeProgress(userId, animeId);
      
      expect(Array.isArray(progress)).toBe(true);
      expect(progress.length).toBe(2);
      expect(progress.every(p => p.user_id === userId && p.anime_id === animeId)).toBe(true);
    });

    test('обновление прогресса', async () => {
      // Создаем прогресс
      const createdProgress = await WatchProgressKnex.create({
        user_id: userId,
        anime_id: animeId,
        episode_id: episodeId,
        progress: 25.0,
        completed: false,
      });

      const updateData = {
        progress: 75.0,
        completed: true,
      };

      const progress = await WatchProgressKnex.update(createdProgress.id, updateData);
      
      expect(progress).toHaveProperty('id', createdProgress.id);
      expect(progress).toHaveProperty('progress', 75.0);
      expect(progress).toHaveProperty('completed', true);
    });

    test('удаление прогресса', async () => {
      // Создаем прогресс
      const createdProgress = await WatchProgressKnex.create({
        user_id: userId,
        anime_id: animeId,
        episode_id: episodeId,
        progress: 50.0,
        completed: false,
      });

      const result = await WatchProgressKnex.delete(createdProgress.id);
      
      expect(result).toBe(1); // Количество удаленных строк
      
      // Проверяем, что прогресс действительно удален
      const progress = await WatchProgressKnex.findById(createdProgress.id);
      expect(progress).toBeUndefined();
    });

    test('получение статистики прогресса пользователя', async () => {
      // Создаем несколько записей прогресса
      await WatchProgressKnex.create({
        user_id: userId,
        anime_id: animeId,
        episode_id: episodeId,
        progress: 100.0,
        completed: true,
      });

      const stats = await WatchProgressKnex.getUserProgressStats(userId);
      
      expect(stats).toHaveProperty('total_episodes');
      expect(stats).toHaveProperty('completed_episodes');
      expect(stats).toHaveProperty('total_progress');
      expect(stats).toHaveProperty('average_progress');
      expect(typeof stats.total_episodes).toBe('number');
      expect(typeof stats.completed_episodes).toBe('number');
    });

    test('получение прогресса для конкретного эпизода', async () => {
      // Создаем прогресс
      const createdProgress = await WatchProgressKnex.create({
        user_id: userId,
        anime_id: animeId,
        episode_id: episodeId,
        progress: 40.0,
        completed: false,
      });

      const progress = await WatchProgressKnex.getUserEpisodeProgress(userId, episodeId);
      
      expect(progress).toHaveProperty('id', createdProgress.id);
      expect(progress).toHaveProperty('progress', 40.0);
    });
  });

  describe('WatchList Model', () => {
    let userId;
    let animeId;

    beforeAll(async () => {
      // Создаем тестовые данные
      const user = await db('users').insert({
        username: 'watchlisttestuser',
        email: 'watchlist@example.com',
        password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      }).returning('id');

      userId = user[0];

      const anime = await db('anime').insert({
        title: 'Тестовое аниме для вatchlist',
        kind: 'tv',
        status: 'ongoing',
        episodes: 12,
        duration: 24,
        description: 'Описание',
        created_at: new Date(),
        updated_at: new Date(),
      }).returning('id');

      animeId = anime[0];
    });

    afterAll(async () => {
      // Очищаем тестовые данные
      await db('watchlist').del();
      await db('anime').del();
      await db('users').where({ id: userId }).del();
    });

    test('создание записи в watchlist', async () => {
      const watchlistItem = await WatchListKnex.create({
        user_id: userId,
        anime_id: animeId,
        status: 'watching',
        episodes_watched: 5,
      });

      expect(watchlistItem).toHaveProperty('id');
      expect(watchlistItem).toHaveProperty('user_id', userId);
      expect(watchlistItem).toHaveProperty('anime_id', animeId);
      expect(watchlistItem).toHaveProperty('status', 'watching');
      expect(watchlistItem).toHaveProperty('episodes_watched', 5);
    });

    test('получение записи по ID', async () => {
      // Создаем запись
      const createdItem = await WatchListKnex.create({
        user_id: userId,
        anime_id: animeId,
        status: 'planned',
        episodes_watched: 0,
      });

      const item = await WatchListKnex.findById(createdItem.id);
      
      expect(item).toHaveProperty('id', createdItem.id);
      expect(item).toHaveProperty('status', 'planned');
    });

    test('получение watchlist пользователя', async () => {
      // Создаем еще одну запись
      const anotherAnime = await db('anime').insert({
        title: 'Еще одно тестовое аниме',
        kind: 'movie',
        status: 'released',
        episodes: 1,
        duration: 120,
        description: 'Описание',
        created_at: new Date(),
        updated_at: new Date(),
      }).returning('id');

      await WatchListKnex.create({
        user_id: userId,
        anime_id: anotherAnime[0],
        status: 'completed',
        episodes_watched: 1,
      });

      const watchlist = await WatchListKnex.getUserWatchlist(userId);
      
      expect(Array.isArray(watchlist)).toBe(true);
      expect(watchlist.length).toBe(2);
      expect(watchlist.every(item => item.user_id === userId)).toBe(true);
    });

    test('проверка существования аниме в watchlist', async () => {
      // Создаем запись
      await WatchListKnex.create({
        user_id: userId,
        anime_id: animeId,
        status: 'watching',
        episodes_watched: 0,
      });

      const exists = await WatchListKnex.animeInWatchlist(userId, animeId);
      expect(exists).toBe(true);

      const notExists = await WatchListKnex.animeInWatchlist(userId, 999);
      expect(notExists).toBe(false);
    });

    test('обновление записи в watchlist', async () => {
      // Создаем запись
      const createdItem = await WatchListKnex.create({
        user_id: userId,
        anime_id: animeId,
        status: 'planned',
        episodes_watched: 0,
      });

      const updateData = {
        status: 'completed',
        episodes_watched: 12,
      };

      const item = await WatchListKnex.update(createdItem.id, updateData);
      
      expect(item).toHaveProperty('id', createdItem.id);
      expect(item).toHaveProperty('status', 'completed');
      expect(item).toHaveProperty('episodes_watched', 12);
    });

    test('удаление записи из watchlist', async () => {
      // Создаем запись
      const createdItem = await WatchListKnex.create({
        user_id: userId,
        anime_id: animeId,
        status: 'watching',
        episodes_watched: 5,
      });

      const result = await WatchListKnex.delete(createdItem.id);
      
      expect(result).toBe(1); // Количество удаленных строк
      
      // Проверяем, что запись действительно удалена
      const item = await WatchListKnex.findById(createdItem.id);
      expect(item).toBeUndefined();
    });

    test('удаление записи по user_id и anime_id', async () => {
      // Создаем запись
      const createdItem = await WatchListKnex.create({
        user_id: userId,
        anime_id: animeId,
        status: 'watching',
        episodes_watched: 5,
      });

      const result = await WatchListKnex.deleteByUserAndAnime(userId, animeId);
      
      expect(result).toBe(1); // Количество удаленных строк
      
      // Проверяем, что запись действительно удалена
      const exists = await WatchListKnex.animeInWatchlist(userId, animeId);
      expect(exists).toBe(false);
    });

    test('получение статистики watchlist', async () => {
      // Создаем записи с разными статусами
      await WatchListKnex.create({
        user_id: userId,
        anime_id: animeId,
        status: 'completed',
        episodes_watched: 12,
      });

      const stats = await WatchListKnex.getUserWatchlistStats(userId);
      
      expect(stats).toHaveProperty('total_entries');
      expect(stats).toHaveProperty('status_distribution');
      expect(stats).toHaveProperty('total_episodes_watched');
      expect(stats).toHaveProperty('total_watch_time');
      expect(typeof stats.total_entries).toBe('number');
      expect(typeof stats.total_episodes_watched).toBe('number');
      expect(typeof stats.total_watch_time).toBe('number');
    });
  });

  describe('Database Transactions', () => {
    let userId;
    let animeId;

    beforeAll(async () => {
      // Создаем тестовые данные
      const user = await db('users').insert({
        username: 'transactiontestuser',
        email: 'transaction@example.com',
        password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      }).returning('id');

      userId = user[0];

      const anime = await db('anime').insert({
        title: 'Тестовое аниме для транзакций',
        kind: 'tv',
        status: 'ongoing',
        episodes: 12,
        duration: 24,
        description: 'Описание',
        created_at: new Date(),
        updated_at: new Date(),
      }).returning('id');

      animeId = anime[0];
    });

    afterAll(async () => {
      // Очищаем тестовые данные
      await db('watchlist').del();
      await db('watch_progress').del();
      await db('anime').del();
      await db('users').where({ id: userId }).del();
    });

    test('успешная транзакция', async () => {
      await db.transaction(async (trx) => {
        // Создаем запись в watchlist
        const watchlistItem = await WatchListKnex.create({
          user_id: userId,
          anime_id: animeId,
          status: 'watching',
          episodes_watched: 0,
        }, trx);

        // Создаем прогресс для первого эпизода
        const episode = await db('anime_episodes').insert({
          anime_id: animeId,
          episode: 1,
          title: 'Эпизод 1',
          description: 'Описание эпизода',
          created_at: new Date(),
          updated_at: new Date(),
        }).returning('id');

        await WatchProgressKnex.create({
          user_id: userId,
          anime_id: animeId,
          episode_id: episode[0],
          progress: 0,
          completed: false,
        }, trx);

        // Возвращаем созданные данные
        return { watchlistItem, episodeId: episode[0] };
      });

      // Проверяем, что данные были созданы
      const watchlist = await WatchListKnex.getUserWatchlist(userId);
      expect(watchlist.length).toBe(1);

      const progress = await WatchProgressKnex.getUserAnimeProgress(userId, animeId);
      expect(progress.length).toBe(1);
    });

    test('откат транзакции при ошибке', async () => {
      try {
        await db.transaction(async (trx) => {
          // Создаем запись в watchlist
          await WatchListKnex.create({
            user_id: userId,
            anime_id: animeId,
            status: 'watching',
            episodes_watched: 0,
          }, trx);

          // Вызываем ошибку
          throw new Error('Тестовая ошибка');
        });
      } catch (error) {
        expect(error.message).toBe('Тестовая ошибка');
      }

      // Проверяем, что данные не были созданы из-за отката
      const watchlist = await WatchListKnex.getUserWatchlist(userId);
      expect(watchlist.length).toBe(0);
    });
  });
});