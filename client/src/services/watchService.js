import api from './api';

// Сервис для работы с API отслеживания прогресса просмотра
export const watchService = {
  /**
   * Сохранение прогресса просмотра
   * @param {Object} progressData - Данные прогресса
   * @param {string} progressData.animeId - ID аниме
   * @param {number} progressData.episode - Номер эпизода
   * @param {number} progressData.position - Текущая позиция в секундах
   * @param {number} progressData.duration - Общая длительность в секундах
   * @returns {Promise<Object>} - Ответ от сервера
   */
  async saveProgress(progressData) {
    try {
      const response = await api.post('/api/watch/progress', progressData, {
        credentials: 'include',
      });
      return response.data;
    } catch (error) {
      const errorMessage = this._handleError(error);
      throw new Error(errorMessage);
    }
  },

  /**
   * Получение прогресса просмотра
   * @param {Object} params - Параметры запроса
   * @param {string} params.animeId - ID аниме
   * @param {number} params.episode - Номер эпизода (опционально)
   * @returns {Promise<Object>} - Данные прогресса
   */
  async getProgress(params) {
    try {
      const response = await api.get('/api/watch/progress', {
        params,
        credentials: 'include',
      });
      return response.data;
    } catch (error) {
      const errorMessage = this._handleError(error);
      throw new Error(errorMessage);
    }
  },

  /**
   * Получение статистики просмотра
   * @returns {Promise<Object>} - Статистика просмотра
   */
  async getProgressStats() {
    try {
      const response = await api.get('/api/watch/stats', {
        credentials: 'include',
      });
      return response.data;
    } catch (error) {
      const errorMessage = this._handleError(error);
      throw new Error(errorMessage);
    }
  },

  /**
   * Получение списка для продолжения просмотра
   * @returns {Promise<Object>} - Список продолжения просмотра
   */
  async getContinueWatching() {
    try {
      const response = await api.get('/api/watch/continue', {
        credentials: 'include',
      });
      return response.data;
    } catch (error) {
      const errorMessage = this._handleError(error);
      throw new Error(errorMessage);
    }
  },

  /**
   * Парное сохранение прогресса (для оптимизации)
   * @param {Array} progressArray - Массив данных прогресса
   * @returns {Promise<Object>} - Ответ от сервера
   */
  async batchSaveProgress(progressArray) {
    try {
      const response = await api.post('/api/watch/progress/batch', progressArray, {
        credentials: 'include',
      });
      return response.data;
    } catch (error) {
      const errorMessage = this._handleError(error);
      throw new Error(errorMessage);
    }
  },

  /**
   * Обработка ошибок API
   * @private
   */
  _handleError(error) {
    if (!error.response) {
      return 'Сетевая ошибка. Проверьте подключение к интернету.';
    }

    const { status, data } = error.response;

    switch (status) {
      case 400:
        return data?.message || 'Неверные данные запроса';
      case 401:
        return data?.message || 'Необходима аутентификация';
      case 403:
        return data?.message || 'Доступ запрещен';
      case 404:
        return data?.message || 'Ресурс не найден';
      case 429:
        return data?.message || 'Слишком много запросов. Попробуйте позже';
      case 500:
        return data?.message || 'Внутренняя ошибка сервера';
      default:
        return data?.message || `Произошла ошибка (${status})`;
    }
  }
};

// Экспорт отдельных функций для удобства
export const {
  saveProgress,
  getProgress,
  getProgressStats,
  getContinueWatching,
  batchSaveProgress
} = watchService;