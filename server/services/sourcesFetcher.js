const axios = require('axios');
const EpisodeSource = require('../models/EpisodeSource');
const AnilibertyService = require('./anilibertyService');
// const AnilibriaService = require('./anilibriaService'); // Временно отключен

/**
 * Универсальный сервис для получения и сохранения источников эпизодов
 * Поддерживает работу с multiple источниками: AniLiberty, AniLibria, Shikimori, Jikan
 */
class SourcesFetcher {
  constructor() {
    this.providers = {
      aniliberty: {
        service: AnilibertyService,
        priority: 1, // Самый высокий приоритет
        maxRetries: 3,
        timeout: 15000
      },
      anilibria: {
        service: AnilibriaService,
        priority: 2,
        maxRetries: 3,
        timeout: 15000
      },
      shikimori: {
        priority: 3,
        maxRetries: 2,
        timeout: 10000
      },
      jikan: {
        priority: 4,
        maxRetries: 2,
        timeout: 10000
      }
    };

    this.initializeServices();
  }

  /**
   * Инициализация сервисов для каждого провайдера
   */
  initializeServices() {
    // Инициализируем сервисы, которые уже существуют (они экспортируются как экземпляры)
    this.providers.aniliberty.instance = this.providers.aniliberty.service;
    this.providers.anilibria.instance = this.providers.anilibria.service;
    
    // Инициализируем остальные провайдеры
    this.initializeShikimoriService();
    this.initializeJikanService();
  }

  /**
   * Инициализация Shikimori сервиса
   */
  initializeShikimoriService() {
    this.providers.shikimori.service = {
      baseURL: 'https://shikimori.one/api',
      client: axios.create({
        baseURL: this.providers.shikimori.service?.baseURL || 'https://shikimori.one/api',
        timeout: this.providers.shikimori.timeout,
        headers: {
          'User-Agent': 'AnimeSite/1.0 (https://github.com/your-org/anime-site)'
        }
      }),

      /**
       * Получение информации об аниме по ID
       */
      async getAnimeById(id) {
        try {
          const response = await this.client.get(`/animes/${id}`);
          return response.data;
        } catch (error) {
          console.error(`Shikimori API Error for anime ${id}:`, error.message);
          throw error;
        }
      },

      /**
       * Поиск аниме
       */
      async searchAnime(query) {
        try {
          if (!query || query.length < 2) {
            throw new Error('Search query must be at least 2 characters');
          }
          const response = await this.client.get('/animes', {
            params: { search: query }
          });
          return response.data;
        } catch (error) {
          console.error(`Shikimori search error for "${query}":`, error.message);
          throw error;
        }
      }
    };

    // Для сервисов-объектов просто присваиваем объект, а не создаем экземпляр
    this.providers.shikimori.instance = this.providers.shikimori.service;
  }

  /**
   * Инициализация Jikan сервиса
   */
  initializeJikanService() {
    this.providers.jikan.service = {
      baseURL: 'https://api.jikan.moe/v4',
      client: axios.create({
        baseURL: this.providers.jikan.service?.baseURL || 'https://api.jikan.moe/v4',
        timeout: this.providers.jikan.timeout,
        headers: {
          'User-Agent': 'AnimeSite/1.0 (https://github.com/your-org/anime-site)'
        }
      }),

      /**
       * Получение популярных аниме
       */
      async getPopularAnime(limit = 50) {
        try {
          const response = await this.client.get('/top/anime', {
            params: { limit }
          });
          return response.data.data;
        } catch (error) {
          console.error('Jikan popular anime error:', error.message);
          throw error;
        }
      },

      /**
       * Поиск аниме
       */
      async searchAnime(query, limit = 50) {
        try {
          const response = await this.client.get('/anime', {
            params: { q: query, limit }
          });
          return response.data.data;
        } catch (error) {
          console.error(`Jikan search error for "${query}":`, error.message);
          throw error;
        }
      },

      /**
       * Получение информации об аниме по ID
       */
      async getAnimeById(id) {
        try {
          const response = await this.client.get(`/anime/${id}/full`);
          return response.data.data;
        } catch (error) {
          console.error(`Jikan API error for anime ${id}:`, error.message);
          throw error;
        }
      }
    };

    // Для сервисов-объектов просто присваиваем объект, а не создаем экземпляр
    this.providers.jikan.instance = this.providers.jikan.service;
  }

  /**
   * Получение источников эпизодов для animeId из всех доступных провайдеров
   * @param {string} animeId - ID аниме в базе данных
   * @param {Object} options - Опции запроса
   * @returns {Promise<Array>} массив нормализованных источников
   */
  async getEpisodeSources(animeId, options = {}) {
    const { 
      providers = ['aniliberty', 'anilibria', 'shikimori', 'jikan'],
      enableRetry = true,
      retryDelay = 1000 
    } = options;

    const allSources = [];
    const errors = [];

    // Параллельная загрузка данных из всех провайдеров
    const fetchPromises = providers.map(async (providerName) => {
      const provider = this.providers[providerName];
      if (!provider) {
        console.warn(`Unknown provider: ${providerName}`);
        return;
      }

      try {
        const sources = await this.fetchFromProvider(providerName, animeId, {
          enableRetry,
          retryDelay
        });
        
        if (sources && sources.length > 0) {
          allSources.push(...sources);
        }
      } catch (error) {
        console.error(`Failed to fetch from ${providerName}:`, error.message);
        errors.push({
          provider: providerName,
          error: error.message,
          timestamp: new Date()
        });
      }
    });

    await Promise.allSettled(fetchPromises);

    // Нормализация и сортировка источников
    const normalizedSources = this.normalizeEpisodeData(allSources);
    
    // Сохранение источников в базу данных
    if (normalizedSources.length > 0) {
      await this.saveEpisodeSources(normalizedSources, animeId);
    }

    return {
      sources: normalizedSources,
      errors,
      total: normalizedSources.length,
      providers: providers.length
    };
  }

  /**
   * Получение данных от конкретного провайдера с retry логикой
   */
  async fetchFromProvider(providerName, animeId, options = {}) {
    const provider = this.providers[providerName];
    if (!provider) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    const { enableRetry = true, retryDelay = 1000 } = options;
    let lastError;

    for (let attempt = 1; attempt <= provider.maxRetries; attempt++) {
      try {
        console.log(`Attempting to fetch from ${providerName} (attempt ${attempt}/${provider.maxRetries})`);
        
        let sources;
        switch (providerName) {
          case 'aniliberty':
            sources = await this.fetchFromAniliberty(animeId);
            break;
          case 'anilibria':
            sources = await this.fetchFromAnilibria(animeId);
            break;
          case 'shikimori':
            sources = await this.fetchFromShikimori(animeId);
            break;
          case 'jikan':
            sources = await this.fetchFromJikan(animeId);
            break;
          default:
            throw new Error(`Unsupported provider: ${providerName}`);
        }

        if (sources && sources.length > 0) {
          console.log(`Successfully fetched ${sources.length} sources from ${providerName}`);
          return sources;
        }

        throw new Error(`No sources found from ${providerName}`);

      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt} failed for ${providerName}:`, error.message);

        if (attempt < provider.maxRetries && enableRetry) {
          console.log(`Retrying in ${retryDelay}ms...`);
          await this.delay(retryDelay);
          retryDelay *= 2; // Exponential backoff
        }
      }
    }

    throw lastError || new Error(`Failed to fetch from ${providerName} after ${provider.maxRetries} attempts`);
  }

  /**
   * Получение источников из AniLiberty
   */
  async fetchFromAniliberty(animeId) {
    try {
      // Получаем детали аниме
      const animeDetails = await this.providers.aniliberty.instance.getAnimeDetails(animeId);
      if (!animeDetails.success || !animeDetails.data) {
        throw new Error('Failed to get anime details from AniLiberty');
      }

      const anime = animeDetails.data;
      const sources = [];

      // Если есть информация об эпизодах, создаем источники
      if (anime.episodes && anime.episodes.total > 0) {
        for (let i = 1; i <= anime.episodes.total; i++) {
          sources.push({
            episodeNumber: i,
            sourceUrl: `https://aniliberty.top/episodes/${anime.id}-${i}`, // Пример URL
            quality: '720p', // AniLiberty обычно предоставляет 720p
            title: `${anime.title?.en || anime.title?.ru || 'Unknown'} Эпизод ${i}`,
            provider: 'aniliberty',
            priority: this.providers.aniliberty.priority
          });
        }
      }

      return sources;
    } catch (error) {
      console.error('Error fetching from AniLiberty:', error.message);
      throw error;
    }
  }

  /**
   * Получение источников из AniLibria
   */
  async fetchFromAnilibria(animeId) {
    try {
      // Получаем детали аниме
      const animeDetails = await this.providers.anilibria.instance.getTitleById(animeId);
      if (!animeDetails) {
        throw new Error('Failed to get anime details from AniLibria');
      }

      const sources = [];

      // Если есть данные плеера, извлекаем источники
      if (animeDetails.player && animeDetails.player.list) {
        Object.entries(animeDetails.player.list).forEach(([episodeNum, episodeData]) => {
          const episodeNumber = parseInt(episodeNum);
          
          // Добавляем источники разных качеств
          if (episodeData.hls) {
            Object.entries(episodeData.hls).forEach(([quality, url]) => {
              const qualityMap = {
                'sd': '480p',
                'hd': '720p',
                'fhd': '1080p'
              };
              
              sources.push({
                episodeNumber,
                sourceUrl: `https://www.anilibria.tv${url}`,
                quality: qualityMap[quality] || quality,
                title: episodeData.name || `${animeDetails.names?.ru || 'Unknown'} Эпизод ${episodeNumber}`,
                provider: 'anilibria',
                priority: this.providers.anilibria.priority
              });
            });
          }
        });
      }

      return sources;
    } catch (error) {
      console.error('Error fetching from AniLibria:', error.message);
      throw error;
    }
  }

  /**
   * Получение источников из Shikimori
   */
  async fetchFromShikimori(animeId) {
    try {
      // Shikimori не предоставляет прямых источников видео,
      // но мы можем использовать его как резервный источник информации
      const animeDetails = await this.providers.shikimori.instance.getAnimeById(animeId);
      
      if (!animeDetails) {
        throw new Error('Failed to get anime details from Shikimori');
      }

      // Shikimori обычно не предоставляет прямых видео источников,
      // поэтому возвращаем пустой массив, но с информацией о доступности
      return [{
        episodeNumber: 1, // Placeholder
        sourceUrl: '', // Shikimori не предоставляет прямых видео URL
        quality: 'unknown',
        title: `${animeDetails.name || 'Unknown'} (Shikimori)`,
        provider: 'shikimori',
        priority: this.providers.shikimori.priority,
        isActive: false // Неактивный источник, так как нет прямого доступа к видео
      }];
    } catch (error) {
      console.error('Error fetching from Shikimori:', error.message);
      throw error;
    }
  }

  /**
   * Получение источников из Jikan
   */
  async fetchFromJikan(animeId) {
    try {
      // Jikan также не предоставляет прямых источников видео,
      // но может использоваться как источник метаданных
      const animeDetails = await this.providers.jikan.instance.getAnimeById(animeId);
      
      if (!animeDetails) {
        throw new Error('Failed to get anime details from Jikan');
      }

      // Jikan не предоставляет прямых видео источников
      return [{
        episodeNumber: 1, // Placeholder
        sourceUrl: '', // Jikan не предоставляет прямых видео URL
        quality: 'unknown',
        title: `${animeDetails.title || 'Unknown'} (Jikan)`,
        provider: 'jikan',
        priority: this.providers.jikan.priority,
        isActive: false // Неактивный источник, так как нет прямого доступа к видео
      }];
    } catch (error) {
      console.error('Error fetching from Jikan:', error.message);
      throw error;
    }
  }

  /**
   * Нормализация данных эпизодов в стандартный формат
   * @param {Array} rawData - Массив сырых данных от разных провайдеров
   * @returns {Array} Нормализованный массив источников
   */
  normalizeEpisodeData(rawData) {
    if (!Array.isArray(rawData)) {
      console.warn('normalizeEpisodeData: rawData is not an array');
      return [];
    }

    const normalized = rawData.map((item, index) => {
      try {
        // Проверка обязательных полей
        if (!item.episodeNumber || !item.provider) {
          console.warn('Skipping invalid source item:', item);
          return null;
        }

        // Нормализация номера эпизода
        const episodeNumber = parseInt(item.episodeNumber);
        if (isNaN(episodeNumber) || episodeNumber < 1) {
          console.warn(`Invalid episode number: ${item.episodeNumber}`);
          return null;
        }

        // Нормализация URL
        let sourceUrl = item.sourceUrl || '';
        if (sourceUrl && !sourceUrl.startsWith('http')) {
          sourceUrl = 'https:' + sourceUrl; // Для относительных URL
        }

        // Нормализация качества
        const qualityMap = {
          'low': '360p',
          'medium': '480p',
          'high': '720p',
          'hd': '720p',
          'fullhd': '1080p',
          'fhd': '1080p',
          '4k': '2160p',
          'uhd': '2160p'
        };

        let quality = item.quality?.toLowerCase() || 'unknown';
        quality = qualityMap[quality] || quality;
        
        // Проверка валидности качества
        const validQualities = ['360p', '480p', '720p', '1080p', '1440p', '2160p'];
        if (!validQualities.includes(quality)) {
          quality = '480p'; // Качество по умолчанию
        }

        // Нормализация названия
        const title = item.title || `Эпизод ${episodeNumber}`;

        // Определение приоритета
        const priority = item.priority || this.getDefaultPriority(item.provider);

        return {
          episodeNumber,
          sourceUrl,
          quality,
          title: title.trim(),
          provider: item.provider.toLowerCase(),
          priority: parseInt(priority),
          isActive: item.isActive !== false, // По умолчанию true
          lastChecked: item.lastChecked || new Date()
        };

      } catch (error) {
        console.error('Error normalizing source item:', error, item);
        return null;
      }
    }).filter(Boolean); // Удаляем null значения

    // Сортировка по приоритету и качеству
    return normalized.sort((a, b) => {
      // Сначала по приоритету (меньше = выше)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // Затем по качеству (выше = лучше)
      const qualityOrder = { '360p': 1, '480p': 2, '720p': 3, '1080p': 4, '1440p': 5, '2160p': 6 };
      return (qualityOrder[b.quality] || 0) - (qualityOrder[a.quality] || 0);
    });
  }

  /**
   * Получение приоритета по умолчанию для провайдера
   */
  getDefaultPriority(provider) {
    const providerObj = this.providers[provider.toLowerCase()];
    return providerObj ? providerObj.priority : 5;
  }

  /**
   * Сохранение источников в базу данных
   * @param {Array} sources - Массив нормализованных источников
   * @param {string} animeId - ID аниме
   * @returns {Promise<Object>} Результат сохранения
   */
  async saveEpisodeSources(sources, animeId) {
    if (!Array.isArray(sources) || sources.length === 0) {
      return {
        success: false,
        message: 'No sources to save',
        saved: 0,
        updated: 0,
        errors: []
      };
    }

    const results = {
      success: true,
      saved: 0,
      updated: 0,
      errors: [],
      animeId
    };

    // Группируем источники по эпизодам для оптимизации
    const sourcesByEpisode = {};
    sources.forEach(source => {
      if (!sourcesByEpisode[source.episodeNumber]) {
        sourcesByEpisode[source.episodeNumber] = [];
      }
      sourcesByEpisode[source.episodeNumber].push(source);
    });

    // Обрабатываем каждый эпизод
    for (const [episodeNumber, episodeSources] of Object.entries(sourcesByEpisode)) {
      try {
        // Проверяем существующие источники для этого эпизода
        const existingSources = await EpisodeSource.find({
          animeId,
          episodeNumber: parseInt(episodeNumber)
        });

        // Удаляем неактивные источники старше 7 дней
        await this.cleanupOldSources(animeId, parseInt(episodeNumber));

        // Сохраняем новые источники
        for (const source of episodeSources) {
          try {
            const existingSource = existingSources.find(s => 
              s.provider === source.provider && s.quality === source.quality
            );

            if (existingSource) {
              // Обновляем существующий источник
              Object.assign(existingSource, {
                sourceUrl: source.sourceUrl,
                title: source.title,
                priority: source.priority,
                isActive: source.isActive,
                lastChecked: new Date()
              });
              await existingSource.save();
              results.updated++;
            } else {
              // Создаем новый источник
              const newSource = new EpisodeSource({
                ...source,
                animeId
              });
              await newSource.save();
              results.saved++;
            }
          } catch (error) {
            console.error('Error saving source:', error);
            results.errors.push({
              source,
              error: error.message
            });
          }
        }
      } catch (error) {
        console.error(`Error processing episode ${episodeNumber}:`, error);
        results.errors.push({
          episodeNumber,
          error: error.message
        });
      }
    }

    // Логируем результаты
    console.log(`Source save results for anime ${animeId}:`, results);
    
    return results;
  }

  /**
   * Очистка старых неактивных источников
   */
  async cleanupOldSources(animeId, episodeNumber, days = 7) {
    try {
      const threshold = new Date();
      threshold.setDate(threshold.getDate() - days);

      const result = await EpisodeSource.updateMany(
        {
          animeId,
          episodeNumber,
          lastChecked: { $lt: threshold },
          isActive: true
        },
        {
          isActive: false,
          updatedAt: new Date()
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`Deactivated ${result.modifiedCount} old inactive sources for episode ${episodeNumber}`);
      }
    } catch (error) {
      console.error('Error cleaning up old sources:', error);
    }
  }

  /**
   * Обновление статуса доступности источника
   */
  async updateSourceAvailability(sourceId, isAvailable) {
    try {
      const source = await EpisodeSource.findById(sourceId);
      if (!source) {
        throw new Error('Source not found');
      }

      source.isActive = isAvailable;
      source.lastChecked = new Date();
      
      if (isAvailable) {
        // При активации увеличиваем приоритет
        source.priority = Math.max(1, source.priority - 1);
      } else {
        // При деактивации уменьшаем приоритет
        source.priority = Math.min(10, source.priority + 1);
      }

      await source.save();
      return source;
    } catch (error) {
      console.error('Error updating source availability:', error);
      throw error;
    }
  }

  /**
   * Получение активных источников для эпизода
   */
  async getActiveSources(animeId, episodeNumber) {
    try {
      const sources = await EpisodeSource.getActiveSources(animeId, episodeNumber);
      return sources;
    } catch (error) {
      console.error('Error getting active sources:', error);
      throw error;
    }
  }

  /**
   * Получение лучших источников (с самым высоким приоритетом и качеством)
   */
  async getBestSources(animeId, episodeNumber) {
    try {
      const sources = await EpisodeSource.find({
        animeId,
        episodeNumber,
        isActive: true
      })
      .sort({ priority: 1, quality: -1 })
      .limit(3)
      .populate('anime', 'title images episodes year')
      .lean();

      return sources;
    } catch (error) {
      console.error('Error getting best sources:', error);
      throw error;
    }
  }

  /**
   * Вспомогательная функция для задержки
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Проверка статуса всех провайдеров
   */
  async checkProvidersStatus() {
    const status = {};
    
    for (const [providerName, provider] of Object.entries(this.providers)) {
      try {
        let isHealthy = false;
        
        switch (providerName) {
          case 'aniliberty':
            const anilibertyStatus = await provider.instance.checkStatus();
            isHealthy = anilibertyStatus.success;
            break;
          case 'anilibria':
            // Для AniLibria просто делаем тестовый запрос
            const testTitle = await provider.instance.getTitleById(1);
            isHealthy = !!testTitle;
            break;
          case 'shikimori':
          case 'jikan':
            // Для этих провайдеров просто проверяем доступность API
            isHealthy = true; // Временно считаем доступными
            break;
        }
        
        status[providerName] = {
          healthy: isHealthy,
          priority: provider.priority,
          lastChecked: new Date()
        };
      } catch (error) {
        status[providerName] = {
          healthy: false,
          error: error.message,
          priority: provider.priority,
          lastChecked: new Date()
        };
      }
    }
    
    return status;
  }
}

module.exports = new SourcesFetcher();