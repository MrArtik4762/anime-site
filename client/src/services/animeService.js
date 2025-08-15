import api from './api';

// Получение списка аниме
export const getAnimeList = async (page = 1, limit = 20, filters = {}) => {
  try {
    const response = await api.get('/anime', {
      params: { page, limit, ...filters }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime list:', error);
    throw error;
  }
};

// Получение деталей аниме по ID
export const getAnimeById = async (id) => {
  try {
    const response = await api.get(`/anime/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching anime details:', error);
    throw error;
  }
};

// Поиск аниме
export const searchAnime = async (query, page = 1, limit = 20) => {
  try {
    const response = await api.get('/anime/search', {
      params: { query, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching anime:', error);
    throw error;
  }
};

// Получение популярных аниме
export const getPopularAnime = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/anime/popular', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular anime:', error);
    throw error;
  }
};

// Получение недавно добавленных аниме
export const getRecentAnime = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/anime/recent', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent anime:', error);
    throw error;
  }
};

// Получение аниме по жанрам
export const getAnimeByGenres = async (genres, page = 1, limit = 20) => {
  try {
    const response = await api.get('/anime/genres', {
      params: { genres, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime by genres:', error);
    throw error;
  }
};

// Получение аниме по студии
export const getAnimeByStudio = async (studioId, page = 1, limit = 20) => {
  try {
    const response = await api.get('/anime/studio', {
      params: { studioId, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime by studio:', error);
    throw error;
  }
};

// Получение аниме по году
export const getAnimeByYear = async (year, page = 1, limit = 20) => {
  try {
    const response = await api.get('/anime/year', {
      params: { year, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime by year:', error);
    throw error;
  }
};

// Получение аниме по сезону
export const getAnimeBySeason = async (season, year, page = 1, limit = 20) => {
  try {
    const response = await api.get('/anime/season', {
      params: { season, year, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime by season:', error);
    throw error;
  }
};

// Получение аниме по типу
export const getAnimeByType = async (type, page = 1, limit = 20) => {
  try {
    const response = await api.get('/anime/type', {
      params: { type, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime by type:', error);
    throw error;
  }
};

// Получение аниме по статусу
export const getAnimeByStatus = async (status, page = 1, limit = 20) => {
  try {
    const response = await api.get('/anime/status', {
      params: { status, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime by status:', error);
    throw error;
  }
};

// Получение аниме по рейтингу
export const getAnimeByRating = async (minRating = 0, maxRating = 10, page = 1, limit = 20) => {
  try {
    const response = await api.get('/anime/rating', {
      params: { minRating, maxRating, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime by rating:', error);
    throw error;
  }
};

// Получение аниме по фильтрам
export const getAnimeByFilters = async (filters, page = 1, limit = 20) => {
  try {
    const response = await api.get('/anime/filters', {
      params: { ...filters, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime by filters:', error);
    throw error;
  }
};

// Получение аниме по сортировке
export const getAnimeBySort = async (sort, order = 'desc', page = 1, limit = 20) => {
  try {
    const response = await api.get('/anime/sort', {
      params: { sort, order, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime by sort:', error);
    throw error;
  }
};

// Получение аниме по комбинации фильтров и сортировки
export const getAnimeByFiltersAndSort = async (filters, sort, order = 'desc', page = 1, limit = 20) => {
  try {
    const response = await api.get('/anime/filters-sort', {
      params: { ...filters, sort, order, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime by filters and sort:', error);
    throw error;
  }
};

// Получение рекомендованного аниме для пользователя
export const getRecommendedAnime = async (userId, page = 1, limit = 20) => {
  try {
    const response = await api.get(`/anime/recommended/${userId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recommended anime:', error);
    throw error;
  }
};

// Получение аниме из списка просмотра пользователя
export const getWatchlistAnime = async (userId, page = 1, limit = 20) => {
  try {
    const response = await api.get(`/anime/watchlist/${userId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching watchlist anime:', error);
    throw error;
  }
};

// Получение аниме из избранного пользователя
export const getFavoritesAnime = async (userId, page = 1, limit = 20) => {
  try {
    const response = await api.get(`/anime/favorites/${userId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching favorites anime:', error);
    throw error;
  }
};

// Получение аниме из истории пользователя
export const getHistoryAnime = async (userId, page = 1, limit = 20) => {
  try {
    const response = await api.get(`/anime/history/${userId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching history anime:', error);
    throw error;
  }
};

// Добавление аниме в список просмотра
export const addToWatchlist = async (animeId, userId) => {
  try {
    const response = await api.post('/anime/watchlist', { animeId, userId });
    return response.data;
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }
};

// Удаление аниме из списка просмотра
export const removeFromWatchlist = async (animeId, userId) => {
  try {
    const response = await api.delete(`/anime/watchlist/${animeId}`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
};

// Добавление аниме в избранное
export const addToFavorites = async (animeId, userId) => {
  try {
    const response = await api.post('/anime/favorites', { animeId, userId });
    return response.data;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

// Удаление аниме из избранного
export const removeFromFavorites = async (animeId, userId) => {
  try {
    const response = await api.delete(`/anime/favorites/${animeId}`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

// Проверка, есть ли аниме в списке просмотра
export const checkInWatchlist = async (animeId, userId) => {
  try {
    const response = await api.get(`/anime/watchlist/check/${animeId}`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error checking watchlist:', error);
    throw error;
  }
};

// Проверка, есть ли аниме в избранном
export const checkInFavorites = async (animeId, userId) => {
  try {
    const response = await api.get(`/anime/favorites/check/${animeId}`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error checking favorites:', error);
    throw error;
  }
};

// Получение похожего аниме
export const getSimilarAnime = async (animeId, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/anime/similar/${animeId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching similar anime:', error);
    throw error;
  }
};

// Получение аниме по тегам
export const getAnimeByTags = async (tags, page = 1, limit = 20) => {
  try {
    const response = await api.get('/anime/tags', {
      params: { tags, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime by tags:', error);
    throw error;
  }
};

// Получение аниме по категориям
export const getAnimeByCategories = async (categories, page = 1, limit = 20) => {
  try {
    const response = await api.get('/anime/categories', {
      params: { categories, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime by categories:', error);
    throw error;
  }
};

// Получение аниме по языку озвучки
export const getAnimeByLanguage = async (language, page = 1, limit = 20) => {
  try {
    const response = await api.get('/anime/language', {
      params: { language, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime by language:', error);
    throw error;
  }
};

// Получение аниме по качеству
export const getAnimeByQuality = async (quality, page = 1, limit = 20) => {
  try {
    const response = await api.get('/anime/quality', {
      params: { quality, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime by quality:', error);
    throw error;
  }
};

// Получение аниме по формату
export const getAnimeByFormat = async (format, page = 1, limit = 20) => {
  try {
    const response = await api.get('/anime/format', {
      params: { format, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime by format:', error);
    throw error;
  }
};

// Получение аниме по длительности
export const getAnimeByDuration = async (minDuration, maxDuration, page = 1, limit = 20) => {
  try {
    const response = await api.get('/anime/duration', {
      params: { minDuration, maxDuration, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime by duration:', error);
    throw error;
  }
};

// Получение аниме по возрастному рейтингу
export const getAnimeByAgeRating = async (ageRating, page = 1, limit = 20) => {
  try {
    const response = await api.get('/anime/age-rating', {
      params: { ageRating, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime by age rating:', error);
    throw error;
  }
};

// Получение аниме по стране
export const getAnimeByCountry = async (country, page = 1, limit = 20) => {
  try {
    const response = await api.get('/anime/country', {
      params: { country, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime by country:', error);
    throw error;
  }
};

// Получение аниме по году выпуска
export const getAnimeByReleaseYear = async (releaseYear, page = 1, limit = 20) => {
  try {
    const response = await api.get('/anime/release-year', {
      params: { releaseYear, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime by release year:', error);
    throw error;
  }
};

// Получение аниме по месяцу выпуска

// Экспорт animeService как объекта для совместимости
export const animeService = {
  getAnimeList,
  getAnimeById,
  searchAnime,
  getPopularAnime,
  getRecentAnime,
  getAnimeByGenres,
  getAnimeByStudio,
  getAnimeByYear,
  getAnimeBySeason,
  getAnimeByType,
  getAnimeByStatus,
  getAnimeByRating,
  getAnimeByFilters,
  getAnimeBySort,
  getAnimeByFiltersAndSort,
  getRecommendedAnime,
  getWatchlistAnime,
  getFavoritesAnime,
  getHistoryAnime,
  addToWatchlist,
  removeFromWatchlist,
  addToFavorites,
  removeFromFavorites,
  checkInWatchlist,
  checkInFavorites,
  getSimilarAnime,
  getAnimeByTags,
  getAnimeByCategories,
  getAnimeByLanguage,
  getAnimeByQuality,
  getAnimeByFormat,
  getAnimeByDuration,
  getAnimeByAgeRating,
  getAnimeByCountry,
  getAnimeByReleaseYear
};
