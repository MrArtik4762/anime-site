const AnimeLiberty = require('../models/AnimeLiberty');
const anilibertyService = require('../services/anilibertyService');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../../shared/constants/constants');

/**
 * Контроллер для работы с AniLiberty API
 * Обеспечивает получение данных об аниме через AniLiberty сервис
 * с кэшированием в локальной базе данных
 * @class AnilibertyController
 */
class AnilibertyController {
  /**
   * Получение популярных аниме
   * @param {Object} req - объект запроса Express
   * @param {Object} req.query - параметры запроса
   * @param {number} [req.query.limit=10] - количество результатов
   * @param {Object} res - объект ответа Express
   * @returns {Promise<void>}
   */
  async getPopularAnime(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;

      // Сначала пытаемся получить из локальной базы данных
      console.log('Fetching popular anime from cache...');
      const cachedAnime = await AnimeLiberty.getPopular(limit);
      console.log('Cached anime count:', cachedAnime ? cachedAnime.length : 0);

      if (cachedAnime && cachedAnime.length > 0) {
        return res.json({
          success: true,
          data: cachedAnime,
          source: 'cache',
          pagination: {
            total: cachedAnime.length,
            page: 1,
            perPage: limit
          }
        });
      }

      // Если кеша нет, пытаемся получить от AniLiberty API
      console.log('Fetching from AniLiberty API...');
      const result = await anilibertyService.getPopularAnime(limit);
      console.log('API result:', result);

      if (result.success && result.data && result.data.length > 0) {
        // Сохраняем в кеш
        const savedAnime = await this.cacheAnimeList(result.data);

        return res.json({
          success: true,
          data: savedAnime,
          source: 'api',
          pagination: result.pagination
        });
      }

      // Возвращаем пустой массив, если данных нет
      return res.json({
        success: true,
        data: [],
        source: 'empty',
        message: 'Нет доступных данных',
        pagination: {
          total: 0,
          page: 1,
          perPage: limit
        }
      });

    } catch (error) {
      console.error('Error in getPopularAnime:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR,
          details: 'Ошибка получения популярных аниме'
        }
      });
    }
  }

  /**
   * Получение новых эпизодов
   * @param {Object} req - объект запроса Express
   * @param {Object} req.query - параметры запроса
   * @param {number} [req.query.limit=15] - количество результатов
   * @param {Object} res - объект ответа Express
   * @returns {Promise<void>}
   */
  async getNewEpisodes(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 15;

      // Сначала пытаемся получить из локальной базы данных
      const cachedAnime = await AnimeLiberty.getNewEpisodes(limit);

      if (cachedAnime && cachedAnime.length > 0) {
        return res.json({
          success: true,
          data: cachedAnime,
          source: 'cache',
          pagination: {
            total: cachedAnime.length,
            page: 1,
            perPage: limit
          }
        });
      }

      // Если кеша нет, пытаемся получить от AniLiberty API
      const result = await anilibertyService.getNewEpisodes(limit);

      if (result.success && result.data.length > 0) {
        // Сохраняем в кеш
        const savedAnime = await this.cacheAnimeList(result.data);

        return res.json({
          success: true,
          data: savedAnime,
          source: 'api',
          pagination: result.pagination
        });
      }

      // Возвращаем ошибку если не удалось получить данные
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: result.error || 'Не удалось получить новые эпизоды',
          details: 'Попробуйте позже'
        }
      });

    } catch (error) {
      console.error('Error in getNewEpisodes:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR,
          details: 'Ошибка получения новых эпизодов'
        }
      });
    }
  }

  /**
   * Получение деталей аниме по ID
   * @param {Object} req - объект запроса Express
   * @param {Object} req.params - параметры маршрута
   * @param {string} req.params.id - ID аниме в системе AniLiberty
   * @param {Object} res - объект ответа Express
   * @returns {Promise<void>}
   */
  async getAnimeDetails(req, res) {
    try {
      const { id } = req.params;
      const anilibertyId = parseInt(id);

      if (!anilibertyId || isNaN(anilibertyId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Некорректный ID аниме',
            details: 'ID аниме должен быть числом'
          }
        });
      }

      // Сначала ищем в локальной базе данных
      let anime = await AnimeLiberty.findByAnilibertyId(anilibertyId);

      if (anime) {
        return res.json({
          success: true,
          data: anime,
          source: 'cache'
        });
      }

      // Если не найдено в кеше, запрашиваем у AniLiberty API
      const result = await anilibertyService.getAnimeDetails(anilibertyId);

      if (result.success && result.data) {
        // Конвертируем и сохраняем в кеш
        const convertedData = anilibertyService.convertToAnimeModel(result.data);
        anime = new AnimeLiberty(convertedData);
        await anime.save();

        return res.json({
          success: true,
          data: anime,
          source: 'api'
        });
      }

      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          message: result.error || 'Аниме не найдено',
          details: 'Аниме с указанным ID не существует'
        }
      });

    } catch (error) {
      console.error('Error in getAnimeDetails:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR,
          details: 'Ошибка получения деталей аниме'
        }
      });
    }
  }

  /**
   * Получение данных эпизода
   * @param {Object} req - объект запроса Express
   * @param {Object} req.params - параметры маршрута
   * @param {string} req.params.id - ID эпизода в системе AniLiberty
   * @param {Object} res - объект ответа Express
   * @returns {Promise<void>}
   */
  async getEpisodeData(req, res) {
    try {
      const { id } = req.params;
      const episodeId = parseInt(id);

      if (!episodeId || isNaN(episodeId)) {
        return res.status(400).json({
          success: false,
          error: 'Некорректный ID эпизода',
          message: 'ID эпизода должен быть числом'
        });
      }

      // Запрашиваем данные эпизода у AniLiberty API
      const result = await anilibertyService.getEpisodeData(episodeId);

      if (result.success && result.data) {
        return res.json({
          success: true,
          data: result.data
        });
      }

      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          message: result.error || 'Эпизод не найден',
          details: 'Эпизод с указанным ID не существует'
        }
      });

    } catch (error) {
      console.error('Error in getEpisodeData:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR,
          details: 'Ошибка получения данных эпизода'
        }
      });
    }
  }

  /**
   * Поиск аниме по названию
   * @param {Object} req - объект запроса Express
   * @param {Object} req.query - параметры запроса
   * @param {string} req.query.query - поисковый запрос
   * @param {number} [req.query.limit=20] - количество результатов
   * @param {Object} res - объект ответа Express
   * @returns {Promise<void>}
   */
  async searchAnime(req, res) {
    try {
      const { query, limit } = req.query;

      if (!query || query.trim().length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Поисковый запрос не может быть пустым',
            details: 'Введите название аниме для поиска'
          }
        });
      }

      const searchLimit = parseInt(limit) || 20;

      // Сначала ищем в локальной базе данных
      const cachedResults = await AnimeLiberty.searchByTitle(query.trim(), { limit: searchLimit });

      if (cachedResults && cachedResults.length > 0) {
        return res.json({
          success: true,
          data: cachedResults,
          source: 'cache',
          pagination: {
            total: cachedResults.length,
            page: 1,
            perPage: searchLimit
          }
        });
      }

      // Если в кеше ничего не найдено, ищем через API
      const result = await anilibertyService.searchAnime(query.trim(), searchLimit);

      if (result.success && result.data.length > 0) {
        // Сохраняем результаты в кеш
        const savedAnime = await this.cacheAnimeList(result.data);

        return res.json({
          success: true,
          data: savedAnime,
          source: 'api',
          pagination: result.pagination
        });
      }

      return res.json({
        success: true,
        data: [],
        message: 'По вашему запросу ничего не найдено',
        pagination: {
          total: 0,
          page: 1,
          perPage: searchLimit
        }
      });

    } catch (error) {
      console.error('Error in searchAnime:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR,
          details: 'Ошибка поиска аниме'
        }
      });
    }
  }

  /**
   * Получение каталога аниме с фильтрацией
   * @param {Object} req - объект запроса Express
   * @param {Object} req.query - параметры запроса
   * @param {number} [req.query.page=1] - номер страницы
   * @param {number} [req.query.limit=20] - количество элементов на странице
   * @param {string} [req.query.genres] - фильтр по жанрам (через запятую)
   * @param {number} [req.query.year] - фильтр по году выпуска
   * @param {string} [req.query.season] - фильтр по сезону
   * @param {string} [req.query.status] - фильтр по статусу
   * @param {string} [req.query.type] - фильтр по типу
   * @param {string} [req.query.orderBy='updated_at'] - поле для сортировки
   * @param {string} [req.query.sort='desc'] - направление сортировки
   * @param {Object} res - объект ответа Express
   * @returns {Promise<void>}
   */
  async getCatalog(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        genres,
        year,
        season,
        status,
        type,
        orderBy = 'updated_at',
        sort = 'desc'
      } = req.query;

      const options = {
        page: parseInt(page),
        perPage: parseInt(limit),
        sort: { [orderBy]: sort === 'asc' ? 1 : -1 }
      };

      if (genres) {
        options.genres = genres.split(',').map(g => g.trim()).filter(Boolean);
      }
      if (year) options.year = parseInt(year);
      if (season) options.season = season;
      if (status) options.status = status;
      if (type) options.type = type;

      // Получаем из локальной базы данных
      const catalogAnime = await AnimeLiberty.getCatalog(options);

      // Подсчитываем общее количество для пагинации
      const totalQuery = { isActive: true, approved: true };
      if (options.genres) totalQuery.genres = { $in: options.genres };
      if (options.year) totalQuery.year = options.year;
      if (options.season) totalQuery.season = options.season;
      if (options.status) totalQuery.status = options.status;
      if (options.type) totalQuery.type = options.type;

      const total = await AnimeLiberty.countDocuments(totalQuery);

      return res.json({
        success: true,
        data: catalogAnime,
        source: 'cache',
        pagination: {
          total,
          page: parseInt(page),
          perPage: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('Error in getCatalog:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR,
          details: 'Ошибка получения каталога'
        }
      });
    }
  }

  /**
   * Получение списка доступных жанров
   * @param {Object} req - объект запроса Express
   * @param {Object} res - объект ответа Express
   * @returns {Promise<void>}
   */
  async getGenres(req, res) {
    try {
      // Сначала пытаемся получить уникальные жанры из локальной базы
      const localGenres = await AnimeLiberty.distinct('genres', { isActive: true });

      if (localGenres && localGenres.length > 0) {
        return res.json({
          success: true,
          data: localGenres.sort(),
          source: 'cache'
        });
      }

      // Если локальных жанров нет, запрашиваем у API
      const result = await anilibertyService.getGenres();

      if (result.success) {
        return res.json({
          success: true,
          data: result.data,
          source: 'api'
        });
      }

      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: result.error || 'Не удалось получить жанры',
          details: 'Попробуйте позже'
        }
      });

    } catch (error) {
      console.error('Error in getGenres:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR,
          details: 'Ошибка получения жанров'
        }
      });
    }
  }

  /**
   * Вспомогательный метод для кеширования списка аниме в локальной базе данных
   * @param {Array} animeList - массив данных аниме от AniLiberty API
   * @returns {Promise<Array>} массив сохраненных объектов аниме
   * @private
   */
  async cacheAnimeList(animeList) {
    const savedAnime = [];

    for (const animeData of animeList) {
      try {
        const convertedData = anilibertyService.convertToAnimeModel(animeData);

        // Проверяем, существует ли уже такое аниме
        let existingAnime = await AnimeLiberty.findByAnilibertyId(convertedData.anilibertyId);

        if (existingAnime) {
          // Обновляем существующее аниме
          Object.assign(existingAnime, convertedData);
          existingAnime.lastSynced = new Date();
          await existingAnime.save();
          savedAnime.push(existingAnime);
        } else {
          // Создаем новое аниме
          const newAnime = new AnimeLiberty(convertedData);
          await newAnime.save();
          savedAnime.push(newAnime);
        }
      } catch (error) {
        console.error('Error caching anime:', error);
        // Пропускаем проблемные записи, но продолжаем обработку
      }
    }

    return savedAnime;
  }

  /**
   * Синхронизация данных с AniLiberty API
   * @param {Object} req - объект запроса Express
   * @param {Object} req.query - параметры запроса
   * @param {string} [req.query.type='popular'] - тип синхронизации ('popular' или 'new-episodes')
   * @param {number} [req.query.limit=50] - количество элементов для синхронизации
   * @param {Object} res - объект ответа Express
   * @returns {Promise<void>}
   */
  async syncWithAPI(req, res) {
    try {
      const { type = 'popular', limit = 50 } = req.query;

      let result;

      switch (type) {
        case 'popular':
          result = await anilibertyService.getPopularAnime(parseInt(limit));
          break;
        case 'new-episodes':
          result = await anilibertyService.getNewEpisodes(parseInt(limit));
          break;
        default:
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: {
              message: 'Неподдерживаемый тип синхронизации',
              details: 'Доступные типы: popular, new-episodes'
            }
          });
      }

      if (result.success && result.data.length > 0) {
        const syncedAnime = await this.cacheAnimeList(result.data);

        return res.json({
          success: true,
          message: `Синхронизировано ${syncedAnime.length} аниме`,
          data: {
            synced: syncedAnime.length,
            type: type
          }
        });
      }

      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: result.error || 'Ошибка синхронизации',
          details: 'Не удалось синхронизировать данные'
        }
      });

    } catch (error) {
      console.error('Error in syncWithAPI:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.SERVER_ERROR,
          details: 'Ошибка синхронизации с API'
        }
      });
    }
  }
}

module.exports = new AnilibertyController();
