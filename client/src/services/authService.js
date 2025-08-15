import api from './api';

// In-memory storage for tokens
let accessToken = null;

export const authService = {
  // Set access token in memory
  setToken(token) {
    accessToken = token;
  },

  // Get access token from memory
  getToken() {
    return accessToken;
  },

  // Clear access token
  clearToken() {
    accessToken = null;
  },

  // Вход пользователя
  async login(credentials) {
    try {
      const response = await api.post('/api/auth/login', credentials, {
        credentials: 'include',
      });
      
      // Store token in memory
      if (response.data.tokens?.accessToken) {
        this.setToken(response.data.tokens.accessToken);
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = this._handleError(error);
      throw new Error(errorMessage);
    }
  },

  // Регистрация пользователя
  async register(userData) {
    try {
      const response = await api.post('/api/auth/register', userData, {
        credentials: 'include',
      });
      
      // Store token in memory
      if (response.data.tokens?.accessToken) {
        this.setToken(response.data.tokens.accessToken);
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = this._handleError(error);
      throw new Error(errorMessage);
    }
  },

  // Обновление токена
  async refresh() {
    try {
      const response = await api.post('/api/auth/refresh', {}, {
        credentials: 'include',
      });
      
      // Store new token in memory
      if (response.data.tokens?.accessToken) {
        this.setToken(response.data.tokens.accessToken);
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = this._handleError(error);
      throw new Error(errorMessage);
    }
  },

  // Получение текущего пользователя
  async getCurrentUser() {
    try {
      const response = await api.get('/api/auth/me', {
        credentials: 'include',
      });
      return response.data;
    } catch (error) {
      const errorMessage = this._handleError(error);
      throw new Error(errorMessage);
    }
  },

  // Обновление профиля
  async updateProfile(userData) {
    try {
      const response = await api.put('/api/users/profile', userData, {
        credentials: 'include',
      });
      return response.data;
    } catch (error) {
      const errorMessage = this._handleError(error);
      throw new Error(errorMessage);
    }
  },

  // Смена пароля
  async changePassword(passwordData) {
    try {
      const response = await api.put('/api/users/change-password', passwordData, {
        credentials: 'include',
      });
      return response.data;
    } catch (error) {
      const errorMessage = this._handleError(error);
      throw new Error(errorMessage);
    }
  },

  // Загрузка аватара
  async uploadAvatar(formData) {
    try {
      const response = await api.post('/api/users/avatar', formData, {
        credentials: 'include',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      const errorMessage = this._handleError(error);
      throw new Error(errorMessage);
    }
  },

  // Восстановление пароля
  async forgotPassword(email) {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      const errorMessage = this._handleError(error);
      throw new Error(errorMessage);
    }
  },

  // Сброс пароля
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/api/auth/reset-password', {
        token,
        password: newPassword,
      });
      return response.data;
    } catch (error) {
      const errorMessage = this._handleError(error);
      throw new Error(errorMessage);
    }
  },

  // Выйти из аккаунта
  async logout() {
    try {
      await api.post('/api/auth/logout', {}, {
        credentials: 'include',
      });
    } catch (error) {
      // Не выбрасывать ошибку при выходе, даже если запрос не удался
      console.warn('Logout request failed:', error);
    } finally {
      // Всегда очищаем токен
      this.clearToken();
    }
  },

  // Обработка ошибок API
  _handleError(error) {
    if (!error.response) {
      return 'Сетевая ошибка. Проверьте подключение к интернету.';
    }

    const { status, data } = error.response;

    switch (status) {
      case 400:
        return data?.message || 'Неверные данные запроса';
      case 401:
        return data?.message || 'Неверные учетные данные';
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
  },
};
