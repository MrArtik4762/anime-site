const axios = require('axios');
const { HTTP_STATUS } = require('../../shared/constants/constants');

/**
 * Единый прокси для AniLibria V1 API
 * Обход CORS-ограничений и обеспечение стабильной работы
 */
class AnilibriaV1Controller {
  constructor() {
    this.baseURL = 'https://anilibria.top/api/v1';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
      headers: {
        'User-Agent': 'AnimeHub/1.0.0',
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Проксирует запрос к API AniLibria
   */
  async proxyRequest(req, res) {
    try {
      const { endpoint } = req.params;
      const { method = 'get' } = req;
      
      // Фильтруем и преобразуем параметры запроса
      const queryParams = { ...req.query };
      
      // Преобразуем параметры для совместимости с AniLibria V1
      if (queryParams.items_per_page) {
        queryParams.perPage = queryParams.items_per_page;
        delete queryParams.items_per_page;
      }
      
      if (queryParams.itemsPerPage) {
        queryParams.perPage = queryParams.itemsPerPage;
        delete queryParams.itemsPerPage;
      }
      
      if (queryParams.sort_by) {
        queryParams.sort = queryParams.sort_by;
        delete queryParams.sort_by;
      }
      
      if (queryParams.order_by) {
        queryParams.order = queryParams.order_by;
        delete queryParams.order_by;
      }

      console.log(`🔄 Проксируем запрос к AniLibria V1: ${method.toUpperCase()} /${endpoint}`, {
        params: queryParams,
        headers: { ...req.headers }
      });

      // Выполняем запрос к AniLibria API
      const response = await this.client.request({
        method: method.toLowerCase(),
        url: `/${endpoint}`,
        params: queryParams,
        headers: {
          // Передаем необходимые заголовки, но без CORS-заголовков
          'User-Agent': 'AnimeHub/1.0.0',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // Возвращаем ответ с сохранением структуры данных
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: response.data,
        timestamp: new Date().toISOString(),
        source: 'anilibria_v1'
      });

    } catch (error) {
      console.error('❌ Ошибка при проксировании запроса к AniLibria V1:', error.message);
      
      // Возвращаем ошибку в формате JSON
      res.status(error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: 'Ошибка при обращении к AniLibria API',
          details: error.message,
          code: error.response?.status || 500
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Получение популярных аниме
   */
  async getPopular(req, res) {
    try {
      const { limit = 20, page = 1 } = req.query;
      
      const response = await this.client.get('/catalog', {
        params: {
          perPage: parseInt(limit),
          page: parseInt(page),
          sort: 'id',
          order: 'desc'
        }
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: response.data?.data || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: response.data?.pagination?.total || 0
        },
        timestamp: new Date().toISOString(),
        source: 'anilibria_v1'
      });

    } catch (error) {
      console.error('Ошибка при получении популярных аниме:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: 'Ошибка при получении популярных аниме',
          details: error.message
        }
      });
    }
  }

  /**
   * Получение новых эпизодов
   */
  async getNewEpisodes(req, res) {
    try {
      const { limit = 20, page = 1 } = req.query;
      
      const response = await this.client.get('/catalog', {
        params: {
          perPage: parseInt(limit),
          page: parseInt(page),
          sort: 'updated_at',
          order: 'desc'
        }
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: response.data?.data || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: response.data?.pagination?.total || 0
        },
        timestamp: new Date().toISOString(),
        source: 'anilibria_v1'
      });

    } catch (error) {
      console.error('Ошибка при получении новых эпизодов:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: 'Ошибка при получении новых эпизодов',
          details: error.message
        }
      });
    }
  }

  /**
   * Получение новых аниме
   */
  async getNewAnime(req, res) {
    try {
      const { limit = 20, page = 1 } = req.query;
      
      const response = await this.client.get('/catalog', {
        params: {
          perPage: parseInt(limit),
          page: parseInt(page),
          sort: 'id',
          order: 'desc'
        }
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: response.data?.data || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: response.data?.pagination?.total || 0
        },
        timestamp: new Date().toISOString(),
        source: 'anilibria_v1'
      });

    } catch (error) {
      console.error('Ошибка при получении новых аниме:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: 'Ошибка при получении новых аниме',
          details: error.message
        }
      });
    }
  }

  /**
   * Поиск аниме
   */
  async searchAnime(req, res) {
    try {
      const { 
        search: query, 
        limit = 20, 
        page = 1,
        year,
        season,
        genres,
        type,
        status
      } = req.query;

      if (!query || query.trim().length < 2) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Поисковый запрос должен содержать минимум 2 символа'
          }
        });
      }

      const response = await this.client.get('/catalog/search', {
        params: {
          search: query.trim(),
          perPage: parseInt(limit),
          page: parseInt(page),
          ...(year && { year: parseInt(year) }),
          ...(season && { season }),
          ...(genres && { genres: Array.isArray(genres) ? genres.join(',') : genres }),
          ...(type && { type }),
          ...(status && { status })
        }
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: response.data?.data || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: response.data?.pagination?.total || 0
        },
        timestamp: new Date().toISOString(),
        source: 'anilibria_v1'
      });

    } catch (error) {
      console.error('Ошибка при поиске аниме:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: 'Ошибка при поиске аниме',
          details: error.message
        }
      });
    }
  }

  /**
   * Получение аниме по ID
   */
  async getAnimeById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID аниме обязателен'
          }
        });
      }

      const response = await this.client.get('/release', {
        params: { id: parseInt(id) }
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: response.data,
        timestamp: new Date().toISOString(),
        source: 'anilibria_v1'
      });

    } catch (error) {
      console.error('Ошибка при получении аниме по ID:', error);
      res.status(error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: 'Аниме не найдено',
          details: error.message
        }
      });
    }
  }

  /**
   * Получение эпизодов аниме
   */
  async getAnimeEpisodes(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID аниме обязателен'
          }
        });
      }

      const response = await this.client.get('/release', {
        params: { id: parseInt(id) }
      });

      // Извлекаем эпизоды из данных
      const episodes = [];
      if (response.data?.player?.list) {
        Object.entries(response.data.player.list).forEach(([episodeNum, episodeData]) => {
          episodes.push({
            id: parseInt(episodeNum),
            number: parseInt(episodeNum),
            title: episodeData.name || `Эпизод ${episodeNum}`,
            description: episodeData.description || '',
            duration: episodeData.duration || 0,
            thumbnail: episodeData.preview || null,
            sources: episodeData.hls ? Object.entries(episodeData.hls).map(([quality, url]) => ({
              quality: quality === 'fhd' ? '1080p' : quality === 'hd' ? '720p' : '480p',
              url: url,
              player: 'hls'
            })) : []
          });
        });
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: episodes,
        animeId: parseInt(id),
        timestamp: new Date().toISOString(),
        source: 'anilibria_v1'
      });

    } catch (error) {
      console.error('Ошибка при получении эпизодов аниме:', error);
      res.status(error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: 'Ошибка при получении эпизодов аниме',
          details: error.message
        }
      });
    }
  }
}

module.exports = new AnilibriaV1Controller();