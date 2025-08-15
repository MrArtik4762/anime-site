import api from './apiClient';

/**
 * Сервис для работы с источниками эпизодов аниме
 */
class EpisodeSourcesService {
  /**
   * Получение источников эпизода для аниме
   * @param {string} animeId - ID аниме
   * @param {number} episodeNumber - номер эпизода
   * @param {Object} options - опции запроса
   * @param {string} options.quality - фильтр по качеству
   * @param {number} options.limit - лимит результатов
   * @param {boolean} options.checkAvailability - проверять доступность
   * @param {boolean} options.forceRefresh - принудительное обновление
   * @returns {Promise<Object>} - объект с источниками
   */
  static async getEpisodeSources(animeId, episodeNumber, options = {}) {
    try {
      const {
        quality,
        limit = 20,
        checkAvailability = true,
        forceRefresh = false
      } = options;

      const response = await api.get(`/anime/${animeId}/episode/${episodeNumber}/sources`, {
        params: {
          quality,
          limit,
          checkAvailability,
          forceRefresh
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching episode sources:', error);
      throw error;
    }
  }

  /**
   * Получение лучших источников для эпизода
   * @param {string} animeId - ID аниме
   * @param {number} episodeNumber - номер эпизода
   * @returns {Promise<Array>} - массив лучших источников
   */
  static async getBestSources(animeId, episodeNumber) {
    try {
      const response = await api.get(`/anime/${animeId}/episode/${episodeNumber}/best-sources`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching best sources:', error);
      throw error;
    }
  }

  /**
   * Получение активных источников для эпизода
   * @param {string} animeId - ID аниме
   * @param {number} episodeNumber - номер эпизода
   * @returns {Promise<Array>} - массив активных источников
   */
  static async getActiveSources(animeId, episodeNumber) {
    try {
      const response = await api.get(`/anime/${animeId}/episode/${episodeNumber}/active-sources`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching active sources:', error);
      throw error;
    }
  }

  /**
   * Обновление статуса доступности источника
   * @param {string} sourceId - ID источника
   * @param {boolean} isAvailable - доступен ли источник
   * @returns {Promise<Object>} - обновленный источник
   */
  static async updateSourceAvailability(sourceId, isAvailable) {
    try {
      const response = await api.patch(`/sources/${sourceId}/availability`, {
        isAvailable
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating source availability:', error);
      throw error;
    }
  }

  /**
   * Проверка статуса провайдеров
   * @returns {Promise<Object>} - статус провайдеров
   */
  static async checkProvidersStatus() {
    try {
      const response = await api.get('/providers/status');
      return response.data.data;
    } catch (error) {
      console.error('Error checking providers status:', error);
      throw error;
    }
  }

  /**
   * Получение статистики по источникам
   * @param {string} animeId - ID аниме (опционально)
   * @returns {Promise<Object>} - статистика источников
   */
  static async getSourcesStats(animeId) {
    try {
      const url = animeId ? `/anime/${animeId}/sources/stats` : '/sources/stats';
      const response = await api.get(url);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching sources stats:', error);
      throw error;
    }
  }

  /**
   * Очистка старых неактивных источников
   * @param {number} days - количество дней для очистки
   * @returns {Promise<Object>} - результат очистки
   */
  static async cleanupOldSources(days = 7) {
    try {
      const response = await api.delete('/sources/cleanup', {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Error cleaning up old sources:', error);
      throw error;
    }
  }

  /**
   * Массовое обновление источников для нескольких аниме
   * @param {Array} animeIds - массив ID аниме
   * @param {Array} providers - массив провайдеров
   * @returns {Promise<Object>} - результат обновления
   */
  static async batchUpdateSources(animeIds, providers = ['aniliberty', 'anilibria', 'shikimori', 'jikan']) {
    try {
      const response = await api.post('/sources/batch-update', {
        animeIds,
        providers
      });
      return response.data.data;
    } catch (error) {
      console.error('Error batch updating sources:', error);
      throw error;
    }
  }

  /**
   * Форматирование относительного времени
   * @param {Date} date - дата для форматирования
   * @returns {string} - относительное время
   */
  static formatRelativeTime(date) {
    if (!date) return 'Никогда';
    
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Только что';
    if (diffMinutes < 60) return `${diffMinutes} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} дн. назад`;
    
    return past.toLocaleDateString('ru-RU');
  }

  /**
   * Получение иконки для провайдера
   * @param {string} provider - название провайдера
   * @returns {string} - название иконки
   */
  static getProviderIcon(provider) {
    const iconMap = {
      aniliberty: 'anime',
      anilibria: 'manga',
      shikimori: 'star',
      jikan: 'tv'
    };
    return iconMap[provider] || 'video';
  }

  /**
   * Получение цвета для статуса
   * @param {string} status - статус источника
   * @returns {string} - вариант для бейджа
   */
  static getStatusVariant(status) {
    switch (status) {
      case 'available':
        return 'success';
      case 'unavailable':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  /**
   * Получение цвета для качества
   * @param {string} quality - качество видео
   * @returns {string} - цвет для бейджа
   */
  static getQualityColor(quality) {
    const colorMap = {
      '360p': 'secondary',
      '480p': 'info',
      '720p': 'primary',
      '1080p': 'success',
      '1440p': 'warning',
      '2160p': 'danger'
    };
    return colorMap[quality] || 'secondary';
  }
}

export default EpisodeSourcesService;