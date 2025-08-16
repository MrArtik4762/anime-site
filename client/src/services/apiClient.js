import axios from 'axios';
import { authService } from './authService';

// Конфигурация API
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Включаем поддержку кук для авторизации
};

// Создаем основной экземпляр axios
const apiClient = axios.create(API_CONFIG);

// Создаем экземпляр для загрузки файлов
const fileUploadClient = axios.create({
  ...API_CONFIG,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  timeout: 30000, // Увеличиваем timeout для загрузки файлов
});

// Интерцептор для добавления токена авторизации
const addAuthToken = (config) => {
  const token = authService?.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Интерцептор для обработки ответов с автоматическим обновлением токена
const handleResponse = async (error) => {
  const originalRequest = error.config;

  // Если ошибка 401 и это не запрос на обновление токена
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    
    try {
      // Пытаемся обновить токен
      await authService.refresh();
      // Повторяем оригинальный запрос с новым токеном
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Если обновление токена не удалось, перенаправляем на страницу логина
      authService.clearToken();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }

  // Обработка ошибок сети
  if (!error.response) {
    error.message = 'Ошибка сети. Проверьте подключение к интернету.';
  } else {
    error.message = error.response.data?.error?.message || 
                    error.response.data?.message || 
                    `Произошла ошибка сервера (${error.response.status})`;
  }

  return Promise.reject(error);
};

// Применяем интерцепторы
apiClient.interceptors.request.use(addAuthToken);
apiClient.interceptors.response.use(
  (response) => response,
  handleResponse
);

fileUploadClient.interceptors.request.use(addAuthToken);
fileUploadClient.interceptors.response.use(
  (response) => response,
  handleResponse
);

// API методы
export const api = {
  // Auth методы
  auth: {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => apiClient.post('/auth/register', userData),
    logout: () => apiClient.post('/auth/logout'),
    refresh: () => apiClient.post('/auth/refresh'),
    getCurrentUser: () => apiClient.get('/auth/me'),
    forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, password }),
    verifyEmail: (token) => apiClient.post(`/auth/verify-email/${token}`),
    generate2FASecret: (email) => apiClient.post('/auth/2fa/generate', { email }),
    enable2FA: (token, secret, backupCodes) => apiClient.post('/auth/2fa/enable', { token, secret, backupCodes }),
    disable2FA: (password) => apiClient.post('/auth/2fa/disable', { password }),
    verify2FA: (token) => apiClient.post('/auth/2fa/verify', { token }),
  },

  // User методы
  users: {
    getProfile: () => apiClient.get('/users/profile'),
    updateProfile: (userData) => apiClient.put('/users/profile', userData),
    changePassword: (passwordData) => apiClient.put('/users/change-password', passwordData),
    uploadAvatar: (formData) => fileUploadClient.post('/users/avatar', formData),
    deleteAvatar: () => apiClient.delete('/users/avatar'),
  },

  // Anime методы
  anime: {
    getList: (params = {}) => apiClient.get('/anime', { params }),
    getById: (id) => apiClient.get(`/anime/${id}`),
    search: (query, params = {}) => apiClient.get('/anime/search', { params: { ...params, q: query } }),
    getGenres: () => apiClient.get('/anime/genres'),
    getSeasons: () => apiClient.get('/anime/seasons'),
    getTypes: () => apiClient.get('/anime/types'),
    getStatuses: () => apiClient.get('/anime/statuses'),
  },

  // Catalog методы
  catalog: {
    getList: (params = {}) => apiClient.get('/catalog', { params }),
    getById: (id) => apiClient.get(`/catalog/${id}`),
    search: (query, params = {}) => apiClient.get('/catalog/search', { params: { ...params, q: query } }),
    getTitles: (params = {}) => apiClient.get('/catalog/titles', { params }),
    getFilters: () => apiClient.get('/catalog/filters'),
  },

  // Watchlist методы
  watchlist: {
    getList: () => apiClient.get('/watchlist'),
    add: (animeId) => apiClient.post('/watchlist', { animeId }),
    remove: (animeId) => apiClient.delete(`/watchlist/${animeId}`),
    toggle: (animeId) => apiClient.post(`/watchlist/toggle/${animeId}`),
  },

  // Watch progress методы
  progress: {
    get: (animeId) => apiClient.get(`/watch-progress/${animeId}`),
    update: (animeId, episodeId, progress) => apiClient.put(`/watch-progress/${animeId}`, { episodeId, progress }),
    getHistory: (params = {}) => apiClient.get('/watch-history', { params }),
  },

  // Comments методы
  comments: {
    getList: (animeId) => apiClient.get(`/comments/${animeId}`),
    add: (animeId, content) => apiClient.post(`/comments/${animeId}`, { content }),
    edit: (commentId, content) => apiClient.put(`/comments/${commentId}`, { content }),
    delete: (commentId) => apiClient.delete(`/comments/${commentId}`),
  },

  // Video методы
  video: {
    getSources: (animeId, episodeId) => apiClient.get(`/video/sources/${animeId}/${episodeId}`),
    getStreamUrl: (animeId, episodeId) => apiClient.get(`/video/stream/${animeId}/${episodeId}`),
    getSubtitles: (animeId, episodeId) => apiClient.get(`/video/subtitles/${animeId}/${episodeId}`),
  },

  // Health check
  health: {
    check: () => apiClient.get('/health'),
    simple: () => apiClient.get('/health/simple'),
  },
};

// Экспортируем экземпляры для прямого использования
export { apiClient, fileUploadClient };

export default api;