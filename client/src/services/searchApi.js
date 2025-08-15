import api from './apiClient';

/**
 * Сервис для работы с поиском аниме
 */
export const searchApi = {
  /**
   * Поиск аниме с автодополнением
   * @param {string} query - Поисковый запрос
   * @param {number} limit - Лимит результатов (максимум 6)
   * @returns {Promise} - Промис с результатами поиска
   */
  searchAnime: async (query, limit = 6) => {
    try {
      // При пустом запросе возвращаем пустой массив
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return {
          success: true,
          data: {
            anime: [],
            query: '',
            count: 0
          }
        };
      }

      const response = await api.get('/anime/search', {
        params: {
          q: query.trim(),
          limit: Math.min(limit, 6) // Гарантируем, что лимит не превышает 6
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error searching anime:', error);
      
      // При ошибке возвращаем пустой массив
      return {
        success: false,
        data: {
          anime: [],
          query: query || '',
          count: 0
        },
        error: error.message || 'Ошибка поиска'
      };
    }
  },

  /**
   * Получение предложений для автодополнения
   * @param {string} query - Поисковый запрос
   * @returns {Promise} - Промис с предложениями
   */
  getSearchSuggestions: async (query) => {
    try {
      const result = await searchApi.searchAnime(query, 6);
      
      // Форматируем результаты для автодополнения
      if (result.success && result.data.anime) {
        return {
          success: true,
          suggestions: result.data.anime.map(anime => ({
            id: anime._id,
            title: anime.title,
            year: anime.year,
            poster: anime.poster
          }))
        };
      }
      
      return {
        success: false,
        suggestions: []
      };
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return {
        success: false,
        suggestions: []
      };
    }
  }
};

export default searchApi;