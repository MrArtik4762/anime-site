import axios from 'axios';

// URL для API прокси на сервере
const PROXY_BASE_URL = process.env.NODE_ENV === 'production'
  ? '/api/anilibria'
  : 'http://localhost:5000/api/anilibria';

// URL для прямого доступа к AniLibria API (для разработки)
const DIRECT_API_BASE = 'https://anilibria.top/api/v1';

// Создаем прокси клиент
const proxyClient = axios.create({
  baseURL: PROXY_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Создаем клиент для прямых запросов (для разработки)
const directClient = axios.create({
  baseURL: DIRECT_API_BASE,
  timeout: 15000,
  headers: {
    'User-Agent': 'AnimeHub/1.0.0',
    'Accept': 'application/json'
  }
});

// Обработчик ошибок для прокси
proxyClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Proxy API Error:', error);
    throw error;
  }
);

// Обработчик ошибок для прямых запросов
directClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Direct API Error:', error);
    throw error;
  }
);

/**
 * Единый сервис для работы с AniLibria API v1
 * Заменяет anilibriaService.js и anilibriaV2Service.js
 */
export const anilibriaService = {
  // Получить популярные аниме с поддержкой пагинации
  async getPopularAnime(params = {}) {
    try {
      // Сначала пробуем через прокси
      const response = await proxyClient.get('/popular', {
        params: {
          limit: params.perPage || 100,
          page: params.page || 1
        }
      });
      return response.data;
    } catch (proxyError) {
      console.warn('Proxy request failed, trying direct API:', proxyError.message);
      
      // Если прокси не работает, пробуем прямой запрос
      try {
        const { perPage = 100, page = 1 } = params;
        const directResponse = await directClient.get('/catalog', {
          params: {
            perPage: perPage,
            page: page,
            sort: 'id',
            order: 'desc'
          }
        });
        
        // Конвертируем ответ в формат, ожидаемый клиентом
        return {
          success: true,
          data: directResponse.data?.data || [],
          pagination: {
            page: page,
            limit: perPage,
            total: directResponse.data?.pagination?.total || 0
          },
          source: 'direct'
        };
      } catch (directError) {
        console.error('Direct API request failed:', directError.message);
        throw proxyError; // Бросаем ошибку прокси, так как оба способа не сработали
      }
    }
  },

  // Получить новые эпизоды (через latest releases)
  async getNewEpisodes(params = {}) {
    try {
      // Сначала пробуем через прокси
      const response = await proxyClient.get('/new-episodes', {
        params: {
          limit: params.perPage || 10,
          page: params.page || 1
        }
      });
      return response.data;
    } catch (proxyError) {
      console.warn('Proxy request failed, trying direct API:', proxyError.message);
      
      // Если прокси не работает, пробуем прямой запрос
      try {
        const { perPage = 10, page = 1 } = params;
        const directResponse = await directClient.get('/catalog', {
          params: {
            perPage: perPage,
            page: page,
            sort: 'updated_at',
            order: 'desc'
          }
        });
        
        // Конвертируем ответ в формат, ожидаемый клиентом
        return {
          success: true,
          data: directResponse.data?.data || [],
          pagination: {
            page: page,
            limit: perPage,
            total: directResponse.data?.pagination?.total || 0
          },
          source: 'direct'
        };
      } catch (directError) {
        console.error('Direct API request failed:', directError.message);
        throw proxyError; // Бросаем ошибку прокси, так как оба способа не сработали
      }
    }
  },

  // Получить новые аниме (используем latest)
  async getNewAnime(params = {}) {
    try {
      // Сначала пробуем через прокси
      const response = await proxyClient.get('/new-anime', {
        params: {
          limit: params.perPage || 10,
          page: params.page || 1
        }
      });
      return response.data;
    } catch (proxyError) {
      console.warn('Proxy request failed, trying direct API:', proxyError.message);
      
      // Если прокси не работает, пробуем прямой запрос
      try {
        const { perPage = 10, page = 1 } = params;
        const directResponse = await directClient.get('/catalog', {
          params: {
            perPage: perPage,
            page: page,
            sort: 'id',
            order: 'desc'
          }
        });
        
        // Конвертируем ответ в формат, ожидаемый клиентом
        return {
          success: true,
          data: directResponse.data?.data || [],
          pagination: {
            page: page,
            limit: perPage,
            total: directResponse.data?.pagination?.total || 0
          },
          source: 'direct'
        };
      } catch (directError) {
        console.error('Direct API request failed:', directError.message);
        throw proxyError; // Бросаем ошибку прокси, так как оба способа не сработали
      }
    }
  },

  // Получить информацию об аниме по ID
  async getAnimeById(id) {
    try {
      // Сначала пробуем через прокси
      const response = await proxyClient.get(`/anime/${id}`);
      return response.data;
    } catch (proxyError) {
      console.warn('Proxy request failed, trying direct API:', proxyError.message);
      
      // Если прокси не работает, пробуем прямой запрос
      try {
        const directResponse = await directClient.get('/release', {
          params: { id: parseInt(id) }
        });
        
        // Конвертируем ответ в формат, ожидаемый клиентом
        return {
          success: true,
          data: directResponse.data,
          source: 'direct'
        };
      } catch (directError) {
        console.error('Direct API request failed:', directError.message);
        throw proxyError; // Бросаем ошибку прокси, так как оба способа не сработали
      }
    }
  },

  // Получить эпизоды аниме по ID
  async getAnimeEpisodes(id) {
    try {
      // Сначала пробуем через прокси
      const response = await proxyClient.get(`/anime/${id}/episodes`);
      return response.data;
    } catch (proxyError) {
      console.warn('Proxy request failed, trying direct API:', proxyError.message);
      
      // Если прокси не работает, пробуем прямой запрос
      try {
        const directResponse = await directClient.get('/release', {
          params: { id: parseInt(id) }
        });
        
        // Извлекаем эпизоды из данных
        const episodes = [];
        if (directResponse.data?.player?.list) {
          Object.entries(directResponse.data.player.list).forEach(([episodeNum, episodeData]) => {
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
        
        return {
          success: true,
          data: episodes,
          animeId: parseInt(id),
          source: 'direct'
        };
      } catch (directError) {
        console.error('Direct API request failed:', directError.message);
        throw proxyError; // Бросаем ошибку прокси, так как оба способа не сработали
      }
    }
  },

  // Получить конкретный эпизод по episodeId
  async getEpisodeById(episodeId) {
    try {
      // Сначала пробуем через прокси
      const response = await proxyClient.get(`/episodes/${episodeId}`);
      return response.data;
    } catch (proxyError) {
      console.warn('Proxy request failed, trying direct API:', proxyError.message);
      
      // Если прокси не работает, пробуем прямой запрос
      try {
        const directResponse = await directClient.get('/anime/releases/episodes', {
          params: { id: episodeId }
        });
        
        return {
          success: true,
          data: directResponse.data,
          source: 'direct'
        };
      } catch (directError) {
        console.error('Direct API request failed:', directError.message);
        throw proxyError; // Бросаем ошибку прокси, так как оба способа не сработали
      }
    }
  },

  // Поиск аниме по названию с поддержкой пагинации и русского языка
  async searchAnime(query, params = {}) {
    try {
      // Сначала пробуем через прокси
      const response = await proxyClient.get('/search', {
        params: {
          search: query,
          limit: params.perPage || 50,
          page: params.page || 1,
          ...(params.year && { year: params.year }),
          ...(params.season && { season: params.season }),
          ...(params.genres && { genres: params.genres }),
          ...(params.type && { type: params.type })
        }
      });
      return response.data;
    } catch (proxyError) {
      console.warn('Proxy request failed, trying direct API:', proxyError.message);
      
      // Если прокси не работает, пробуем прямой запрос
      try {
        const { perPage = 50, page = 1, ...filters } = params;
        const directResponse = await directClient.get('/catalog/search', {
          params: {
            search: query,
            perPage: perPage,
            page: page,
            ...filters
          }
        });
        
        // Конвертируем ответ в формат, ожидаемый клиентом
        return {
          success: true,
          data: directResponse.data?.data || [],
          pagination: {
            page: page,
            limit: perPage,
            total: directResponse.data?.pagination?.total || 0
          },
          source: 'direct'
        };
      } catch (directError) {
        console.error('Direct API request failed:', directError.message);
        throw proxyError; // Бросаем ошибку прокси, так как оба способа не сработали
      }
    }
  },

  // УСТАРЕВШИЕ МЕТОДЫ ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ
  // Получить последние релизы (для обратной совместимости)
  async getLatestReleases(limit = 50) {
    try {
      return await this.getNewEpisodes({ perPage: limit });
    } catch (error) {
      throw new Error(`Ошибка получения последних релизов: ${error.message}`);
    }
  },

  // Получить случайные релизы (fallback к популярным)
  async getRandomReleases(limit = 10) {
    try {
      return await this.getPopularAnime({ perPage: limit });
    } catch (error) {
      throw new Error(`Ошибка получения случайных релизов: ${error.message}`);
    }
  },

  // Получить релиз (для старого кода)
  async getRelease(idOrAlias, include = '') {
    try {
      return await this.getAnimeById(idOrAlias);
    } catch (error) {
      throw new Error(`Ошибка получения релиза ${idOrAlias}: ${error.message}`);
    }
  },

  // Получить релиз с эпизодами (для старого кода)
  async getReleaseWithEpisodes(idOrAlias) {
    try {
      const [anime, episodes] = await Promise.all([
        this.getAnimeById(idOrAlias),
        this.getAnimeEpisodes(idOrAlias)
      ]);

      return {
        ...anime,
        episodes: episodes
      };
    } catch (error) {
      throw new Error(`Ошибка получения релиза с эпизодами ${idOrAlias}: ${error.message}`);
    }
  },

  // Вспомогательные методы для работы с видео

  // Получить URL видео для эпизода в указанном качестве
  getVideoUrl(episode, quality = '720') {
    if (!episode) return null;

    // Новая структура API - поддержка react-player
    if (episode.video_url) return episode.video_url;

    const qualityMap = {
      '1080': episode.hls_1080 || episode.video_1080,
      '720': episode.hls_720 || episode.video_720,
      '480': episode.hls_480 || episode.video_480,
    };

    // Возвращаем запрошенное качество или fallback к доступному
    return qualityMap[quality] ||
           episode.hls_1080 || episode.video_1080 ||
           episode.hls_720 || episode.video_720 ||
           episode.hls_480 || episode.video_480 ||
           null;
  },

  // Получить все доступные качества для эпизода
  getAvailableQualities(episode) {
    if (!episode) return [];

    const qualities = [];
    if (episode.hls_1080 || episode.video_1080) {
      qualities.push({
        height: 1080,
        src: episode.hls_1080 || episode.video_1080,
        label: '1080p'
      });
    }
    if (episode.hls_720 || episode.video_720) {
      qualities.push({
        height: 720,
        src: episode.hls_720 || episode.video_720,
        label: '720p'
      });
    }
    if (episode.hls_480 || episode.video_480) {
      qualities.push({
        height: 480,
        src: episode.hls_480 || episode.video_480,
        label: '480p'
      });
    }

    return qualities;
  },

  // Конвертировать данные аниме в унифицированный формат с приоритетом русского языка
  convertAnimeToFormat(anime) {
    if (!anime) return null;

    // Получаем русское название с приоритетом
    const getRussianTitle = (nameObj) => {
      if (!nameObj) return 'Без названия';
      if (typeof nameObj === 'string') return nameObj;
      
      // Приоритет русского названия
      return nameObj.main || nameObj.ru || nameObj.russian || 
             nameObj.en || nameObj.english || nameObj.alternative || 'Без названия';
    };

    return {
      id: anime.id,
      title: getRussianTitle(anime.name) || anime.title || 'Без названия',
      titleEnglish: anime.name?.english || anime.title_english,
      titleAlternative: anime.name?.alternative || anime.title_alternative,
      alias: anime.alias,
      year: anime.year,
      type: anime.type?.description || anime.type?.value || anime.type,
      status: this.getStatusText(anime),
      poster: this.getOptimizedImageUrl(anime.poster),
      description: anime.description,
      episodes: anime.episodes_total || anime.episodes,
      genres: this.getGenres(anime.genres),
      rating: anime.rating || anime.average_rating,
      ageRating: anime.age_rating?.label || anime.age_rating,
      season: anime.season?.description || anime.season,
      duration: anime.average_duration_of_episode || anime.duration,
      // Дополнительные поля
      publishDay: anime.publish_day?.description,
      isOngoing: anime.is_ongoing,
      isInProduction: anime.is_in_production,
      favorites: anime.added_in_users_favorites,
      fresh_at: anime.fresh_at,
      updated_at: anime.updated_at,
    };
  },

  // Конвертировать данные эпизода в унифицированный формат
  convertEpisodeToFormat(episode) {
    if (!episode) return null;

    return {
      id: episode.id,
      number: episode.ordinal || episode.number,
      title: (episode.name && typeof episode.name === 'object')
        ? (episode.name.main || episode.name.english || episode.name.alternative)
        : (episode.name || episode.title) || `Эпизод ${episode.ordinal || episode.number}`,
      titleEnglish: episode.name_english || episode.title_english,
      duration: episode.duration,
      sortOrder: episode.sort_order || episode.number,
      preview: this.getOptimizedImageUrl(episode.preview),

      // Видео URL'ы
      videoUrl: this.getVideoUrl(episode, '720'),
      videoUrls: {
        '480': episode.hls_480 || episode.video_480,
        '720': episode.hls_720 || episode.video_720,
        '1080': episode.hls_1080 || episode.video_1080,
      },

      // Тайм-коды для скипа опенинга/эндинга
      opening: episode.opening,
      ending: episode.ending,

      // Внешние плееры
      rutubeId: episode.rutube_id,
      youtubeId: episode.youtube_id,

      updated_at: episode.updated_at,
      animeId: episode.anime_id || episode.release_id,
    };
  },

  // Получить статус аниме
  getStatusText(anime) {
    if (anime.is_ongoing) return 'Онгоинг';
    if (anime.status) {
      if (typeof anime.status === 'string') return anime.status;
      if (anime.status.description) return anime.status.description;
    }
    return 'Завершён';
  },

  // Получить жанры
  getGenres(genres) {
    if (!genres) return [];
    if (Array.isArray(genres)) {
      return genres.map(genre =>
        typeof genre === 'string' ? genre : genre.name || genre.title
      );
    }
    return [];
  },

  // Получить оптимизированный URL изображения
  getOptimizedImageUrl(imageObject) {
    if (!imageObject) return null;

    // Если это уже готовый URL
    if (typeof imageObject === 'string') {
      return imageObject.startsWith('http') ? imageObject : `https://anilibria.top${imageObject}`;
    }

    // Приоритет: optimized > preview > src > thumbnail
    if (imageObject.optimized?.preview) {
      return `https://anilibria.top${imageObject.optimized.preview}`;
    }
    if (imageObject.preview) {
      return `https://anilibria.top${imageObject.preview}`;
    }
    if (imageObject.src) {
      return `https://anilibria.top${imageObject.src}`;
    }
    if (imageObject.thumbnail) {
      return `https://anilibria.top${imageObject.thumbnail}`;
    }

    return null;
  },

  // Методы для совместимости с старым кодом

  // Форматирование данных аниме (для старого кода)
  formatAnimeData(anilibriaData) {
    if (!anilibriaData) return null;

    return {
      id: anilibriaData.id,
      title: {
        ru: anilibriaData.names?.ru || '',
        en: anilibriaData.names?.en || '',
        alternative: anilibriaData.names?.alternative || '',
      },
      description: anilibriaData.description || '',
      poster: anilibriaData.poster?.src ? `https://www.anilibria.tv${anilibriaData.poster.src}` : null,
      year: anilibriaData.year,
      season: anilibriaData.season?.string || '',
      type: anilibriaData.type?.string || '',
      status: anilibriaData.status?.string || '',
      genres: anilibriaData.genres?.map(g => g.name) || [],
      episodes: anilibriaData.player?.episodes?.last || 0,
      rating: anilibriaData.rating || 0,
      updated: anilibriaData.updated,
      blocked: anilibriaData.blocked?.blocked || false,
      team: anilibriaData.team || {},
      player: anilibriaData.player || {},
    };
  },

  // Получение URL постера (для старого кода)
  getPosterUrl(poster) {
    if (!poster?.src) return null;

    const baseUrl = 'https://www.anilibria.tv';
    return `${baseUrl}${poster.src}`;
  },

  // Получение URL видео (для старого кода)
  getVideoUrlLegacy(player, episode, quality = '720p') {
    if (!player?.list?.[episode]?.hls) return null;

    const baseUrl = 'https://www.anilibria.tv';
    const episodeData = player.list[episode];
    const videoPath = episodeData.hls[quality.replace('p', '')] ||
                     Object.values(episodeData.hls)[0];

    return videoPath ? `${baseUrl}${videoPath}` : null;
  },

  // Проверка доступности эпизода (для старого кода)
  isEpisodeAvailable(player, episode) {
    return !!(player?.list?.[episode]?.hls &&
             Object.keys(player.list[episode].hls).length > 0);
  },

  // Получение списка доступных качеств (для старого кода)
  getAvailableQualitiesLegacy(player, episode) {
    if (!player?.list?.[episode]?.hls) return [];

    return Object.keys(player.list[episode].hls).map(q => `${q}p`);
  },

  // Поиск с fallback на локальные данные
  async searchWithFallback(query, limit = 20) {
    try {
      // Сначала пытаемся найти в AniLibria
      const anilibriaResults = await this.searchAnime(query, { perPage: limit });
      
      if (anilibriaResults && anilibriaResults.length > 0) {
        // Конвертируем результаты
        const convertedResults = anilibriaResults.map(title => 
          this.convertAnimeToFormat(title)
        );
        
        return {
          source: 'anilibria',
          data: convertedResults,
          total: convertedResults.length
        };
      }
    } catch (error) {
      console.warn('AniLibria search failed:', error);
    }

    // Fallback на локальные данные (заглушка)
    return {
      source: 'local',
      data: [],
      total: 0
    };
  },

  // Получение случайного аниме
  async getRandomTitle() {
    try {
      // Сначала пробуем через прокси
      const response = await proxyClient.get('/random');
      return response.data;
    } catch (proxyError) {
      console.warn('Proxy request failed, trying direct API:', proxyError.message);
      
      // Если прокси не работает, пробуем прямой запрос
      try {
        const directResponse = await directClient.get('/anime/releases/random');
        return {
          success: true,
          data: directResponse.data,
          source: 'direct'
        };
      } catch (directError) {
        console.error('Direct API request failed:', directError.message);
        throw proxyError; // Бросаем ошибку прокси, так как оба способа не сработали
      }
    }
  },

  // Получение случайных тайтлов
  async getRandom(params = {}) {
    try {
      const { limit = 1 } = params;
      const promises = [];
      for (let i = 0; i < limit; i++) {
        promises.push(this.getRandomTitle());
      }
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      throw new Error(`Ошибка получения случайных тайтлов: ${error.message}`);
    }
  },


  // Получение расписания
  async getSchedule(params = {}) {
    try {
      const { days } = params;
      const queryParams = {};
      if (days) queryParams.days = Array.isArray(days) ? days.join(',') : days;
      
      const response = await proxyClient.get('/schedule', { params: queryParams });
      return response.data;
    } catch (proxyError) {
      console.warn('Proxy request failed, trying direct API:', proxyError.message);
      
      // Если прокси не работает, пробуем прямой запрос
      try {
        const directResponse = await directClient.get('/anime/releases/schedule', { params: { days: params.days } });
        return {
          success: true,
          data: directResponse.data,
          source: 'direct'
        };
      } catch (directError) {
        console.error('Direct API request failed:', directError.message);
        throw proxyError; // Бросаем ошибку прокси, так как оба способа не сработали
      }
    }
  },

  // Получение YouTube данных
  async getYouTube(params = {}) {
    try {
      const { limit = 5 } = params;
      const response = await proxyClient.get('/youtube', {
        params: { limit }
      });
      return response.data;
    } catch (proxyError) {
      console.warn('Proxy request failed, trying direct API:', proxyError.message);
      
      // Если прокси не работает, пробуем прямой запрос
      try {
        const directResponse = await directClient.get('/youtube', {
          params: { limit: params.limit || 5 }
        });
        return {
          success: true,
          data: directResponse.data,
          source: 'direct'
        };
      } catch (directError) {
        console.error('Direct API request failed:', directError.message);
        throw proxyError; // Бросаем ошибку прокси, так как оба способа не сработали
      }
    }
  },

  // Проверка доступности AniLibria API
  async checkApiStatus() {
    try {
      // Проверяем прокси
      const proxyResponse = await proxyClient.get('/health');
      return {
        success: true,
        available: true,
        source: 'proxy',
        data: proxyResponse.data
      };
    } catch (proxyError) {
      console.warn('Proxy health check failed:', proxyError.message);
      
      // Если прокси не работает, проверяем прямой API
      try {
        const directResponse = await directClient.get('/health');
        return {
          success: true,
          available: true,
          source: 'direct',
          data: directResponse.data
        };
      } catch (directError) {
        console.error('Direct API health check failed:', directError.message);
        return {
          success: false,
          available: false,
          error: proxyError.message,
          source: 'none'
        };
      }
    }
  }
};

export default anilibriaService;
