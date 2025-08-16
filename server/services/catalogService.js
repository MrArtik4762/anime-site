const NodeCache = require('node-cache');
const anilibriaV1 = require('./anilibriaV1');
const { logger } = require('../utils/logger');
const { db } = require('../db/knex');
const cacheService = require('./cacheService');

class CatalogService {
  constructor() {
    // Инициализация NodeCache с временем жизни 10 минут (для fallback)
    this.fallbackCache = new NodeCache({
      stdTTL: 600, // 10 минут
      checkperiod: 60,
      useClones: false
    });

    // Ключи для разных типов запросов
    this.cacheKeys = {
      popular: 'popular',
      new: 'new',
      rating: 'rating',
      search: 'search',
      all: 'all'
    };

    logger.info('CatalogService initialized with Redis cache and NodeCache fallback');
  }

  /**
   * Получить аниме с поддержкой fallback на локальную базу
   * @param {Object} options - Опции запроса
   * @param {string} options.type - Тип запроса (popular, new, rating, search)
   * @param {string} options.query - Поисковый запрос
   * @param {number} options.page - Номер страницы
   * @param {number} options.limit - Лимит элементов
   * @param {Array} options.genres - Жанры для фильтрации
   * @param {number} options.year - Год для фильтрации
   * @param {string} options.sortBy - Поле для сортировки
   * @param {string} options.sortOrder - Порядок сортировки
   * @returns {Promise<Object>} - Результат с аниме и пагинацией
   */
  async getAnimeWithFallback(options = {}) {
    const {
      type = 'all',
      query = '',
      page = 1,
      limit = 24,
      genres = [],
      year,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = options;

    const cacheKey = this.generateCacheKey({
      type,
      query,
      page,
      limit,
      genres,
      year,
      sortBy,
      sortOrder
    });

    // Проверяем Redis кэш сначала
    let cached = await cacheService.get(cacheKey, 'catalog:');
    if (cached) {
      logger.debug(`Redis cache hit for key: ${cacheKey}`);
      return cached;
    }

    // Fallback на локальный кэш
    cached = this.fallbackCache.get(cacheKey);
    if (cached) {
      logger.debug(`Fallback cache hit for key: ${cacheKey}`);
      return cached;
    }

    logger.debug(`Cache miss for key: ${cacheKey}`);

    try {
      console.log(`📡 [catalogService] Попытка получения данных из AniLibria API для ключа: ${cacheKey}`);
      // Пробуем получить данные из AniLibria API
      const apiData = await this.fetchFromAniLibria({
        type,
        query,
        page,
        limit,
        genres,
        year,
        sortBy,
        sortOrder
      });

      if (apiData && apiData.list && apiData.list.length > 0) {
        console.log(`✅ [catalogService] Успешно получено ${apiData.list.length} элементов из AniLibria API`);
        // Кэшируем успешный ответ API в Redis и fallback
        await cacheService.set(cacheKey, apiData, 'catalog:');
        this.fallbackCache.set(cacheKey, apiData);
        logger.debug(`API data cached for key: ${cacheKey}`);
        return apiData;
      } else {
        console.log(`⚠️ [catalogService] AniLibria API вернул пустые данные, переходим к fallback`);
      }
    } catch (apiError) {
      console.log(`❌ [catalogService] Ошибка AniLibria API: ${apiError.message}, переходим к fallback`);
      logger.warn(`API request failed, falling back to database: ${apiError.message}`);
    }

    // Fallback на локальную базу данных
    console.log(`💾 [catalogService] Запрос к локальной базе данных для ключа: ${cacheKey}`);
    let fallbackData = await this.fetchFromDatabase({
      type,
      query,
      page,
      limit,
      genres,
      year,
      sortBy,
      sortOrder
    });

    console.log(`📊 [catalogService] Получено из БД: ${fallbackData.list.length} элементов, источник: ${fallbackData.source}`);

    // Если локальная база пуста, используем надежный fallback с mock данными
    if (fallbackData.list.length === 0) {
      console.log(`⚠️ [catalogService] База данных пуста для ключа: ${cacheKey}, используем mock fallback данные`);
      logger.warn(`Database is empty for key: ${cacheKey}, using mock fallback data`);
      fallbackData = this.generateMockData({
        type,
        query,
        page,
        limit,
        genres,
        year,
        sortBy,
        sortOrder
      });
      console.log(`✅ [catalogService] Сгенерировано mock данных: ${fallbackData.list.length} элементов`);
    }

    // Кэшируем результат fallback в Redis и fallback кэш
    await cacheService.set(cacheKey, fallbackData, 'catalog:');
    this.fallbackCache.set(cacheKey, fallbackData);
    logger.debug(`Fallback data cached for key: ${cacheKey}`);

    return fallbackData;
  }

  /**
   * Получить данные из AniLibria API
   */
  async fetchFromAniLibria(options) {
    const { type, query, page, limit, genres, year, sortBy, sortOrder } = options;

    try {
      let result;

      if (query) {
        // Поиск
        result = await anilibriaV1.searchTitles({
          query,
          page,
          limit,
          sort: sortBy
        });
      } else {
        // Каталог
        result = await anilibriaV1.getCatalog({
          page,
          limit,
          genres,
          year,
          order: this.mapSortToApi(sortBy)
        });
      }

      if (!result || !result.list || result.list.length === 0) {
        throw new Error('No data from AniLibria API');
      }

      // Трансформируем данные в формат, совместимый с локальной БД
      return {
        list: result.list.map(item => this.transformAniLibriaItem(item)),
        pagination: result.pagination || {
          total: result.list.length,
          page,
          limit
        },
        source: 'anilibria',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`AniLibria API error: ${error.message}`);
      throw error; // Пробрасываем ошибку для активации fallback
    }
  }

  /**
   * Получить данные из локальной базы данных (fallback)
   */
  async fetchFromDatabase(options) {
    const { type, query, page, limit, genres, year, season, sortBy, sortOrder } = options;
    
    try {
      console.log(`🔍 [catalogService.fetchFromDatabase] Запрос к БД:`, {
        type, query, page, limit, genres: genres?.length, year, season, sortBy, sortOrder
      });
      
      const skip = (page - 1) * limit;
      let sortQuery = {};

      // Построение запроса для SQLite
      let queryBuilder = db('animes')
        .select('*')
        .where({ is_active: true, is_approved: true });

      // Фильтрация
      if (query) {
        queryBuilder = queryBuilder.where(function() {
          this.where('title', 'like', `%${query}%`)
              .orWhere('english_title', 'like', `%${query}%`)
              .orWhere('japanese_title', 'like', `%${query}%`)
              .orWhere('romaji_title', 'like', `%${query}%`);
        });
      }

      if (genres && genres.length > 0) {
        // Временно отключаем фильтрацию по жанрам, так как она вызывает зависание сервера
        // TODO: Исправить фильтрацию по жанрам для SQLite
        console.log('Genre filtering disabled temporarily. Genres:', genres);
      }

      if (year) {
        queryBuilder = queryBuilder.where({ year });
      }

      if (type && type !== 'all') {
        queryBuilder = queryBuilder.where({ type });
      }

      if (season) {
        queryBuilder = queryBuilder.where({ season });
      }

      // Сортировка
      let orderClause = '';
      if (sortBy === 'popular') {
        orderClause = `popularity ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
      } else if (sortBy === 'new' || sortBy === 'new-anime') {
        orderClause = `created_at ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
      } else if (sortBy === 'new-episodes') {
        orderClause = `updated_at ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
      } else if (sortBy === 'rating') {
        orderClause = `rating_score ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
      } else {
        orderClause = `updated_at ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
      }

      // Получение общего количества
      const totalCountResult = await queryBuilder.clone().count('id as count').first();
      const totalCount = parseInt(totalCountResult.count);

      // Получение списка с пагинацией
      const animeList = await queryBuilder
        .offset(skip)
        .limit(limit)
        .orderByRaw(orderClause);

      const result = {
        list: animeList.map(anime => this.transformAnimeDocument(anime)),
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit)
        },
        source: 'database',
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ [catalogService.fetchFromDatabase] Успешный запрос к БД:`, {
        totalCount,
        returnedItems: animeList.length,
        page,
        limit,
        sortBy,
        sortOrder
      });
      
      return result;

    } catch (error) {
      logger.error(`Database fallback error: ${error.message}`);
      // Возвращаем пустые данные, чтобы не сломать приложение
      return {
        list: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0
        },
        source: 'database',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Трансформировать запись SQLite в формат API
   */
  transformAnimeDocument(anime) {
    return {
      id: anime.id,
      title: anime.title || 'Без названия',
      english_title: anime.english_title || anime.title || 'No Title',
      japanese_title: anime.japanese_title || anime.title || 'タイトルなし',
      names: {
        ru: anime.title || 'Без названия',
        en: anime.english_title || anime.title || 'No Title',
        jp: anime.japanese_title || anime.title || 'タイトルなし'
      },
      description: anime.synopsis || 'Описание отсутствует',
      poster: anime.poster_url || 'https://anilibria.top/poster.jpg',
      posters: {
        small: anime.poster_url || 'https://anilibria.top/poster.jpg',
        original: anime.poster_url || 'https://anilibria.top/poster.jpg'
      },
      year: anime.year,
      status: this.mapStatus(anime.status),
      genres: anime.genres ? JSON.parse(anime.genres) : [],
      episodes: anime.episodes || 0,
      type: this.mapType(anime.type),
      season: anime.season || '',
      rating: anime.rating_score || 0,
      votes: anime.rating_votes || 0,
      weeklyViews: Math.floor(Math.random() * 10000), // Генерируем случайное количество просмотров
      createdAt: anime.created_at,
      updatedAt: anime.updated_at,
      fresh_at: anime.updated_at, // Добавляем поле для новых аниме
      name: {
        main: anime.title || 'Без названия',
        english: anime.english_title || anime.title || 'No Title',
        alternative: []
      }
    };
  }

  /**
   * Трансформировать элемент AniLibria в формат API
   */
  transformAniLibriaItem(item) {
    return {
      id: item.id,
      title: item.names?.ru || item.names?.en || 'Без названия',
      english_title: item.names?.en || item.names?.ru || 'No Title',
      japanese_title: item.names?.jp || item.names?.en || 'タイトルなし',
      names: {
        ru: item.names?.ru || item.names?.en || 'Без названия',
        en: item.names?.en || item.names?.ru || 'No Title',
        jp: item.names?.jp || item.names?.en || 'タイトルなし'
      },
      description: item.description || 'Описание отсутствует',
      poster: item.posters?.small?.url || item.posters?.original?.url || 'https://anilibria.top/poster.jpg',
      posters: {
        small: item.posters?.small?.url || item.posters?.original?.url || 'https://anilibria.top/poster.jpg',
        original: item.posters?.original?.url || item.posters?.small?.url || 'https://anilibria.top/poster.jpg'
      },
      year: item.year,
      status: item.status || 'Онгоинг',
      genres: item.genres || [],
      episodes: item.episodes?.length || 0,
      type: item.type || 'ТВ',
      season: item.season || '',
      rating: item.score || 0,
      votes: item.votes || 0,
      weeklyViews: item.views || 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      fresh_at: item.updatedAt, // Добавляем поле для новых аниме
      name: {
        main: item.names?.ru || item.names?.en || 'Без названия',
        english: item.names?.en || item.names?.ru || 'No Title',
        alternative: item.names?.alt || []
      }
    };
  }

  /**
   * Сгенерировать ключ для кэша
   */
  generateCacheKey(options) {
    const { type, query, page, limit, genres, year, sortBy, sortOrder } = options;
    
    const keyParts = [
      this.cacheKeys[type] || this.cacheKeys.all,
      query ? `:${query}` : '',
      page,
      limit,
      genres.length > 0 ? `:${genres.sort().join(',')}` : '',
      year ? `:${year}` : '',
      sortBy,
      sortOrder
    ];

    return keyParts.join('').replace(/[:\s]/g, '_');
  }

  /**
   * Отобразить тип сортировки в формате AniLibria API
   */
  mapSortToApi(sortBy) {
    const mapping = {
      'popular': 'popular',
      'new': 'updated',
      'rating': 'rating',
      'updated': 'updated'
    };
    return mapping[sortBy] || 'updated';
  }

  /**
   * Отобразить статус
   */
  mapStatus(status) {
    const mapping = {
      'Finished Airing': 'Завершено',
      'Currently Airing': 'Онгоинг',
      'Not yet aired': 'Анонс'
    };
    return mapping[status] || status;
  }

  /**
   * Отобразить тип
   */
  mapType(type) {
    const mapping = {
      'TV': 'ТВ',
      'Movie': 'Фильм',
      'OVA': 'OVA',
      'ONA': 'ONA',
      'Special': 'Спешл',
      'Music': 'Музыка'
    };
    return mapping[type] || type;
  }

  /**
   * Очистить кэш
   */
  clearCache() {
    if (this.cache && typeof this.cache.clear === 'function') {
      this.cache.clear();
    }
    if (this.fallbackCache && typeof this.fallbackCache.clear === 'function') {
      this.fallbackCache.clear();
    }
    logger.info('Catalog cache cleared');
  }

  /**
   * Получить статистику кэша
   */
  getCacheStats() {
    return {
      redisCache: {
        enabled: cacheService && typeof cacheService.getKeys === 'function',
        size: 'N/A',
        maxSize: 'N/A',
        itemCount: 'N/A',
        ttl: 'N/A'
      },
      fallbackCache: {
        size: this.fallbackCache ? this.fallbackCache.getStats().keys : 0,
        maxSize: this.fallbackCache ? this.fallbackCache.getStats().maxKeys : 'N/A',
        itemCount: this.fallbackCache ? this.fallbackCache.getStats().keys : 0,
        ttl: this.fallbackCache ? this.fallbackCache.options.stdTTL : 'N/A'
      }
    };
  }

  /**
   * Генерировать mock данные для fallback
   */
  generateMockData(options = {}) {
    const {
      type = 'all',
      query = '',
      page = 1,
      limit = 24,
      genres = [],
      year,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = options;
    
    console.log(`🎭 [catalogService.generateMockData] Генерация mock данных:`, {
      type, query, page, limit, genres: genres?.length, year, sortBy, sortOrder
    });

    const mockAnimeList = [
      {
        id: `mock_${Date.now()}_1`,
        names: { ru: 'Демон-убийца: Клинок, рассекающий демонов', en: 'Demon Slayer: Kimetsu no Yaiba', jp: '鬼滅の刃' },
        description: 'Тандзиро Камадо становится охотником на демонов после того, как его семья была убита, а его младшая сестра Нэзуко превращена в демона.',
        posters: { small: 'https://anilibria.top/poster1.jpg', original: 'https://anilibria.top/poster1.jpg' },
        year: 2019,
        status: 'Онгоинг',
        genres: ['аниме', 'сэйнэн', 'приключения', 'фэнтези', 'боевик'],
        episodes: 26,
        type: 'ТВ',
        season: 'весна',
        rating: 8.7,
        votes: 2500000,
        weeklyViews: 150000,
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        updatedAt: new Date().toISOString(),
        fresh_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        name: { main: 'Демон-убийца: Клинок, рассекающий демонов', english: 'Demon Slayer', alternative: [] }
      },
      {
        id: `mock_${Date.now()}_2`,
        names: { ru: 'Врата Штейна: Эффект Хиггса', en: 'Steins;Gate: The Higuchi Field Effect', jp: 'シュタインズ・ゲート' },
        description: 'Группа друзей создает машину, способную отправлять сообщения в прошлое, но их эксперименты приводят к непредвиденным последствиям.',
        posters: { small: 'https://anilibria.top/poster2.jpg', original: 'https://anilibria.top/poster2.jpg' },
        year: 2011,
        status: 'Завершено',
        genres: ['аниме', 'сэйнэн', 'драма', 'научная фантастика', 'триллер'],
        episodes: 24,
        type: 'ТВ',
        season: 'весна',
        rating: 9.2,
        votes: 2200000,
        weeklyViews: 95000,
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        fresh_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        name: { main: 'Врата Штейна: Эффект Хиггса', english: 'Steins;Gate', alternative: [] }
      },
      {
        id: `mock_${Date.now()}_3`,
        names: { ru: 'Атака Титанов: Финальный сезон', en: 'Attack on Titan: Final Season', jp: '進撃の巨人 最终季' },
        description: 'Финальная сага эпической истории о борьбе человечества против Титанов.',
        posters: { small: 'https://anilibria.top/poster3.jpg', original: 'https://anilibria.top/poster3.jpg' },
        year: 2023,
        status: 'Завершено',
        genres: ['аниме', 'сэйнэн', 'фэнтези', 'драма', 'боевик'],
        episodes: 35,
        type: 'ТВ',
        season: 'зима',
        rating: 9.1,
        votes: 2800000,
        weeklyViews: 180000,
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        fresh_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        name: { main: 'Атака Титанов: Финальный сезон', english: 'Attack on Titan', alternative: [] }
      },
      {
        id: `mock_${Date.now()}_4`,
        names: { ru: 'Магическая битва', en: 'Jujutsu Kaisen', jp: '呪術廻戦' },
        description: 'Юдзи Итадори поглощает могущественную проклятую сущность, чтобы спасти своих друзей, и становится учеником школы магии.',
        posters: { small: 'https://anilibria.top/poster4.jpg', original: 'https://anilibria.top/poster4.jpg' },
        year: 2020,
        status: 'Онгоинг',
        genres: ['аниме', 'сэйнэн', 'суперъестественное', 'боевик', 'школа'],
        episodes: 24,
        type: 'ТВ',
        season: 'осень',
        rating: 8.5,
        votes: 1800000,
        weeklyViews: 120000,
        createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        fresh_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        name: { main: 'Магическая битва', english: 'Jujutsu Kaisen', alternative: [] }
      },
      {
        id: `mock_${Date.now()}_5`,
        names: { ru: 'Токийские мстители', en: 'Tokyo Revengers', jp: '東京リベンジャーズ' },
        description: 'Такемити Ханагаки узнает, что его бывшая девушка была убита бандой Токийских мстителей, и получает шанс изменить прошлое.',
        posters: { small: 'https://anilibria.top/poster5.jpg', original: 'https://anilibria.top/poster5.jpg' },
        year: 2021,
        status: 'Онгоинг',
        genres: ['аниме', 'сэйнэн', 'драма', 'боевик', 'криминал'],
        episodes: 37,
        type: 'ТВ',
        season: 'весна',
        rating: 8.2,
        votes: 1500000,
        weeklyViews: 85000,
        createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        fresh_at: new Date(Date.now() - 86400000 * 4).toISOString(),
        name: { main: 'Токийские мстители', english: 'Tokyo Revengers', alternative: [] }
      }
    ];

    // Генерируем дополнительные записи для пагинации
    const additionalItems = Math.max(0, limit - mockAnimeList.length);
    for (let i = 0; i < additionalItems; i++) {
      mockAnimeList.push({
        id: `mock_${Date.now()}_${i + 6}`,
        names: { ru: `Тестовое аниме ${i + 6}`, en: `Test Anime ${i + 6}`, jp: `テストアニメ${i + 6}` },
        description: `Это тестовое описание для аниме ${i + 6}. Создано для демонстрации работы каталога.`,
        posters: { small: 'https://anilibria.top/poster_default.jpg', original: 'https://anilibria.top/poster_default.jpg' },
        year: 2023 + (i % 3),
        status: i % 2 === 0 ? 'Онгоинг' : 'Завершено',
        genres: ['аниме', 'тест', 'демонстрация'],
        episodes: 12 + (i % 12),
        type: 'ТВ',
        season: ['весна', 'лето', 'осень', 'зима'][i % 4],
        rating: 7.5 + (i % 20) * 0.1,
        votes: 500000 + (i % 1000000),
        weeklyViews: 10000 + (i % 50000),
        createdAt: new Date(Date.now() - 86400000 * (5 + i)).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * (2 + i % 3)).toISOString(),
        fresh_at: new Date(Date.now() - 86400000 * (2 + i % 3)).toISOString(),
        name: { main: `Тестовое аниме ${i + 6}`, english: `Test Anime ${i + 6}`, alternative: [] }
      });
    }

    // Сортируем данные в соответствии с параметрами
    let sortedList = [...mockAnimeList];
    if (sortBy === 'rating') {
      sortedList.sort((a, b) => sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating);
    } else if (sortBy === 'new' || sortBy === 'new-anime') {
      sortedList.sort((a, b) => sortOrder === 'desc' ?
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() :
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'new-episodes') {
      sortedList.sort((a, b) => sortOrder === 'desc' ?
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() :
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    } else {
      sortedList.sort((a, b) => sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating);
    }

    // Применяем пагинацию
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedList = sortedList.slice(startIndex, endIndex);

    const result = {
      list: paginatedList,
      pagination: {
        total: sortedList.length,
        page,
        limit,
        pages: Math.ceil(sortedList.length / limit)
      },
      source: 'mock_fallback',
      timestamp: new Date().toISOString(),
      error: 'Используются тестовые данные, так как основная база данных пуста'
    };
    
    console.log(`✅ [catalogService.generateMockData] Mock данные сгенерированы:`, {
      totalItems: sortedList.length,
      returnedItems: paginatedList.length,
      page,
      limit,
      sortBy,
      sortOrder
    });
    
    return result;
  }
}

// Создаем singleton экземпляр
const catalogService = new CatalogService();

module.exports = catalogService;