import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Включаем поддержку кук
});

// Интерцептор для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    // Берем токен из памяти (устанавливается authService)
    const token = authService?.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Интерцептор для обработки ответов
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 и это не запрос на обновление токена
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Пытаемся обновить токен
        await authService.refresh();
        // Повторяем оригинальный запрос с новым токеном
        return api(originalRequest);
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
      error.message = error.response.data?.error?.message || error.response.data?.message || 'Произошла ошибка сервера';
    }

    return Promise.reject(error);
  },
);

export default api;
