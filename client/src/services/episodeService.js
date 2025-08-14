import api from './api';

// Получение деталей эпизода
export const getEpisodeById = async (id) => {
  try {
    const response = await api.get(`/episodes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching episode:', error);
    throw error;
  }
};

// Получение источников эпизода
export const getEpisodeSources = async (id) => {
  try {
    const response = await api.get(`/episodes/${id}/sources`);
    return response.data;
  } catch (error) {
    console.error('Error fetching episode sources:', error);
    throw error;
  }
};

// Обновление прогресса просмотра
export const updateProgress = async (progressData) => {
  try {
    const response = await api.post('/episodes/progress', progressData);
    return response.data;
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
};

// Получение прогресса просмотра эпизода
export const getEpisodeProgress = async (id) => {
  try {
    const response = await api.get(`/episodes/${id}/progress`);
    return response.data;
  } catch (error) {
    console.error('Error fetching episode progress:', error);
    throw error;
  }
};

// Отметить эпизод как просмотренный
export const markAsWatched = async (episodeId) => {
  try {
    const response = await api.post(`/episodes/${episodeId}/watched`);
    return response.data;
  } catch (error) {
    console.error('Error marking episode as watched:', error);
    throw error;
  }
};

// Отметить эпизод как непросмотренный
export const markAsUnwatched = async (episodeId) => {
  try {
    const response = await api.post(`/episodes/${episodeId}/unwatched`);
    return response.data;
  } catch (error) {
    console.error('Error marking episode as unwatched:', error);
    throw error;
  }
};

// Переключить статус просмотра
export const toggleWatched = async (episodeId) => {
  try {
    const response = await api.post(`/episodes/${episodeId}/toggle-watched`);
    return response.data;
  } catch (error) {
    console.error('Error toggling watched status:', error);
    throw error;
  }
};

// Получение рекомендованных эпизодов
export const getRecommendedEpisodes = async (animeId) => {
  try {
    const response = await api.get(`/episodes/recommended/${animeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recommended episodes:', error);
    throw error;
  }
};

// Получение следующих эпизодов
export const getNextEpisodes = async (currentEpisodeId) => {
  try {
    const response = await api.get(`/episodes/next/${currentEpisodeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching next episodes:', error);
    throw error;
  }
};

// Получение предыдущих эпизодов
export const getPreviousEpisodes = async (currentEpisodeId) => {
  try {
    const response = await api.get(`/episodes/previous/${currentEpisodeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching previous episodes:', error);
    throw error;
  }
};

// Получение истории просмотра
export const getWatchHistory = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/episodes/history', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching watch history:', error);
    throw error;
  }
};

// Поиск эпизодов
export const searchEpisodes = async (query, page = 1, limit = 20) => {
  try {
    const response = await api.get('/episodes/search', {
      params: { query, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching episodes:', error);
    throw error;
  }
};

// Получение популярных эпизодов
export const getPopularEpisodes = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/episodes/popular', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular episodes:', error);
    throw error;
  }
};

// Получение недавно добавленных эпизодов
export const getRecentEpisodes = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/episodes/recent', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent episodes:', error);
    throw error;
  }
};

// Получение эпизодов по аниме
export const getEpisodesByAnime = async (animeId, page = 1, limit = 20) => {
  try {
    const response = await api.get(`/anime/${animeId}/episodes`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching episodes by anime:', error);
    throw error;
  }
};

// Получение эпизодов по фильтрам
export const getEpisodesByFilters = async (filters, page = 1, limit = 20) => {
  try {
    const response = await api.get('/episodes/filters', {
      params: { ...filters, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching episodes by filters:', error);
    throw error;
  }
};

// Получение эпизодов по сортировке
export const getEpisodesBySort = async (sort, order = 'desc', page = 1, limit = 20) => {
  try {
    const response = await api.get('/episodes/sort', {
      params: { sort, order, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching episodes by sort:', error);
    throw error;
  }
};

// Получение эпизодов по комбинации фильтров и сортировки
export const getEpisodesByFiltersAndSort = async (filters, sort, order = 'desc', page = 1, limit = 20) => {
  try {
    const response = await api.get('/episodes/filters-sort', {
      params: { ...filters, sort, order, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching episodes by filters and sort:', error);
    throw error;
  }
};