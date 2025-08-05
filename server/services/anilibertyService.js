const axios = require('axios');

/**
 * Сервис для работы с AniLiberty API
 * Обеспечивает получение данных об аниме, эпизодах, поиск и другие операции
 * @class AnilibertyService
 */
class AnilibertyService {
  /**
   * Создает экземпляр AnilibertyService
   * @constructor
   */
  constructor() {
    /**
     * Базовый URL для AniLiberty API
     * @type {string}
     */
    this.baseURL = process.env.ANILIBERTY_API_BASE || 'https://aniliberty.top/api/v1';

    /**
     * HTTP клиент для запросов к API
     * @type {axios.AxiosInstance}
     */
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
      headers: {
        'User-Agent': 'AnimeHub/1.0.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Настройка интерцепторов для обработки ошибок
    this.client.interceptors.response.use(
      response => response,
      async error => {
        console.error('AniLiberty API Error:', error.message);

        // Логирование для отладки
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Получение популярных аниме
   * @param {number} limit - количество результатов (по умолчанию 10)
   * @returns {Promise<Object>} объект с результатами
   * @returns {Promise<Object>} объект.success - статус успешности операции
   * @returns {Promise<Array>} объект.data - массив популярных аниме
   * @returns {Promise<Object>} объект.pagination - информация о пагинации
   */
  async getPopularAnime(limit = 10) {
    try {
      const response = await this.client.get('/releases', {
        params: {
          perPage: limit,
          orderBy: 'popularity',
          sort: 'desc'
        }
      });

      return {
        success: true,
        data: response.data?.data || [],
        pagination: response.data?.pagination || { total: 0 }
      };
    } catch (error) {
      console.error('Error fetching popular anime from AniLiberty:', error);
      return this.handleError('Ошибка получения популярных аниме от AniLiberty API');
    }
  }

  /**
   * Получение новых эпизодов
   * @param {number} limit - количество результатов (по умолчанию 15)
   * @returns {Promise<Object>} объект с результатами
   * @returns {Promise<boolean>} объект.success - статус успешности операции
   * @returns {Promise<Array>} объект.data - массив новых эпизодов
   * @returns {Promise<Object>} объект.pagination - информация о пагинации
   */
  async getNewEpisodes(limit = 15) {
    try {
      const response = await this.client.get('/releases', {
        params: {
          perPage: limit,
          orderBy: 'updated_at',
          sort: 'desc'
        }
      });

      return {
        success: true,
        data: response.data?.data || [],
        pagination: response.data?.pagination || { total: 0 }
      };
    } catch (error) {
      console.error('Error fetching new episodes from AniLiberty:', error);
      return this.handleError('Ошибка получения новых эпизодов от AniLiberty API');
    }
  }

  /**
   * Получение информации о конкретном аниме
   * @param {number} id - ID аниме в системе AniLiberty
   * @returns {Promise<Object>} объект с результатами
   * @returns {Promise<boolean>} объект.success - статус успешности операции
   * @returns {Promise<Object|null>} объект.data - данные аниме или null если не найдено
   */
  async getAnimeDetails(id) {
    try {
      const response = await this.client.get(`/releases/${id}`);

      return {
        success: true,
        data: response.data || null
      };
    } catch (error) {
      console.error(`Error fetching anime details ${id} from AniLiberty:`, error);
      return this.handleError('Ошибка получения деталей аниме от AniLiberty API');
    }
  }

  /**
   * Получение данных эпизода
   * @param {number} episodeId - ID эпизода в системе AniLiberty
   * @returns {Promise<Object>} объект с результатами
   * @returns {Promise<boolean>} объект.success - статус успешности операции
   * @returns {Promise<Object|null>} объект.data - данные эпизода включая видео и субтитры
   */
  async getEpisodeData(episodeId) {
    try {
      const response = await this.client.get(`/episodes/${episodeId}`);

      return {
        success: true,
        data: response.data || null
      };
    } catch (error) {
      console.error(`Error fetching episode data ${episodeId} from AniLiberty:`, error);
      return this.handleError('Ошибка получения данных эпизода от AniLiberty API');
    }
  }

  /**
   * Поиск аниме по названию
   * @param {string} query - поисковый запрос (название аниме)
   * @param {number} limit - количество результатов (по умолчанию 20)
   * @returns {Promise<Object>} объект с результатами поиска
   * @returns {Promise<boolean>} объект.success - статус успешности операции
   * @returns {Promise<Array>} объект.data - массив найденных аниме
   * @returns {Promise<Object>} объект.pagination - информация о пагинации
   */
  async searchAnime(query, limit = 20) {
    try {
      const response = await this.client.get('/search', {
        params: {
          query: query,
          perPage: limit
        }
      });

      return {
        success: true,
        data: response.data?.data || [],
        pagination: response.data?.pagination || { total: 0 }
      };
    } catch (error) {
      console.error('Error searching anime in AniLiberty:', error);
      return this.handleError('Ошибка поиска в AniLiberty API');
    }
  }

  /**
   * Получение списка доступных жанров
   * @returns {Promise<Object>} объект с результатами
   * @returns {Promise<boolean>} объект.success - статус успешности операции
   * @returns {Promise<Array>} объект.data - массив жанров
   */
  async getGenres() {
    try {
      const response = await this.client.get('/genres');

      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching genres from AniLiberty:', error);
      return this.handleError('Ошибка получения жанров от AniLiberty API');
    }
  }

  /**
   * Получение каталога аниме с фильтрацией
   * @param {Object} params - параметры фильтрации
   * @param {number} [params.page=1] - номер страницы
   * @param {number} [params.perPage=20] - количество элементов на странице
   * @param {Array|string} [params.genres] - фильтр по жанрам
   * @param {number} [params.year] - фильтр по году выпуска
   * @param {string} [params.season] - фильтр по сезону
   * @param {string} [params.status] - фильтр по статусу
   * @param {string} [params.type] - фильтр по типу
   * @param {string} [params.orderBy='updated_at'] - поле для сортировки
   * @param {string} [params.sort='desc'] - направление сортировки
   * @returns {Promise<Object>} объект с результатами каталога
   * @returns {Promise<boolean>} объект.success - статус успешности операции
   * @returns {Promise<Array>} объект.data - массив аниме
   * @returns {Promise<Object>} объект.pagination - информация о пагинации
   */
  async getCatalog(params = {}) {
    try {
      const {
        page = 1,
        perPage = 20,
        genres,
        year,
        season,
        status,
        type,
        orderBy = 'updated_at',
        sort = 'desc'
      } = params;

      const queryParams = {
        page,
        perPage,
        orderBy,
        sort
      };

      if (genres && genres.length > 0) {
        queryParams.genres = Array.isArray(genres) ? genres.join(',') : genres;
      }
      if (year) queryParams.year = year;
      if (season) queryParams.season = season;
      if (status) queryParams.status = status;
      if (type) queryParams.type = type;

      const response = await this.client.get('/catalog', { params: queryParams });

      return {
        success: true,
        data: response.data?.data || [],
        pagination: response.data?.pagination || { total: 0 }
      };
    } catch (error) {
      console.error('Error fetching catalog from AniLiberty:', error);
      return this.handleError('Ошибка получения каталога от AniLiberty API');
    }
  }

  /**
   * Получение расписания релизов
   * @returns {Promise<Object>} объект с результатами
   * @returns {Promise<boolean>} объект.success - статус успешности операции
   * @returns {Promise<Array>} объект.data - массив релизов в расписании
   */
  async getSchedule() {
    try {
      const response = await this.client.get('/schedule');

      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching schedule from AniLiberty:', error);
      return this.handleError('Ошибка получения расписания от AniLiberty API');
    }
  }

  /**
   * Конвертация данных AniLiberty в формат нашей модели
   * @param {Object} anilibertyData - сырые данные от AniLiberty API
   * @param {number} anilibertyData.id - ID аниме в AniLiberty
   * @param {Object} anilibertyData.title - объект с названиями
   * @param {string} anilibertyData.description - описание аниме
   * @param {string} anilibertyData.type - тип аниме (TV, Movie, etc.)
   * @param {string} anilibertyData.status - статус аниме
   * @param {Array} anilibertyData.genres - массив жанров
   * @param {number} anilibertyData.year - год выпуска
   * @param {string} anilibertyData.season - сезон
   * @param {Object} anilibertyData.poster - объект с постерами
   * @param {Object} anilibertyData.episodes - информация об эпизодах
   * @param {string} anilibertyData.updated_at - дата последнего обновления
   * @param {Object} anilibertyData.rating - рейтинг аниме
   * @returns {Object} конвертированные данные в формате нашей модели
   * @throws {Error} если произошла ошибка конвертации
   */
  convertToAnimeModel(anilibertyData) {
    try {
      const {
        id,
        title,
        description,
        type,
        status,
        genres,
        year,
        season,
        poster,
        episodes,
        updated_at,
        rating
      } = anilibertyData;

      return {
        // Внешние идентификаторы
        anilibertyId: id,

        // Основная информация
        title: {
          english: title?.en || '',
          japanese: title?.jp || '',
          romaji: title?.romaji || '',
          synonyms: title?.synonyms || []
        },

        synopsis: description || '',

        // Классификация
        type: type || 'TV',
        status: status || 'Unknown',

        // Временные характеристики
        episodes: episodes?.total || 0,

        // Даты
        year: year || new Date().getFullYear(),
        season: season || 'Unknown',

        // Жанры
        genres: genres || [],

        // Изображения
        images: {
          poster: {
            small: poster?.small || null,
            medium: poster?.medium || null,
            large: poster?.large || null
          }
        },

        // Рейтинг
        rating: {
          average: rating?.average || 0,
          count: rating?.count || 0
        },

        // Метаданные
        source: 'aniliberty',
        lastSynced: new Date(),
        updated_at: updated_at ? new Date(updated_at) : new Date(),

        // Кеширование
        cached: true,
        approved: true,
        isActive: true
      };
    } catch (error) {
      console.error('Error converting AniLiberty data:', error);
      throw new Error('Ошибка конвертации данных AniLiberty');
    }
  }

  /**
   * Обработка ошибок API
   * @param {string} message - сообщение об ошибке для пользователя
   * @returns {Object} стандартизированный объект ошибки
   * @returns {boolean} объект.success - всегда false для ошибок
   * @returns {string} объект.error - сообщение об ошибке
   * @returns {Array} объект.data - пустой массив данных
   */
  handleError(message) {
    return {
      success: false,
      error: message,
      data: []
    };
  }

  /**
   * Проверка статуса AniLiberty API
   * @returns {Promise<Object>} объект с результатами проверки
   * @returns {Promise<boolean>} объект.success - статус успешности операции
   * @returns {Promise<Object>} объект.data - данные о статусе API
   */
  async checkStatus() {
    try {
      const response = await this.client.get('/status');

      return {
        success: true,
        data: response.data || { status: 'unknown' }
      };
    } catch (error) {
      console.error('Error checking AniLiberty API status:', error);
      return this.handleError('Ошибка проверки статуса AniLiberty API');
    }
  }
}

module.exports = new AnilibertyService();
