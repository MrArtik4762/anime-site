import axios from 'axios';

/**
 * Безопасный API клиент с защитой от CSRF, CORS и других угроз
 */
class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || '/api',
      timeout: 10000,
      withCredentials: true, // Включаем cookies для CSRF защиты
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    // Перехватчик запросов
    this.client.interceptors.request.use(
      this.handleRequest.bind(this),
      this.handleRequestError.bind(this)
    );

    // Перехватчик ответов
    this.client.interceptors.response.use(
      this.handleResponse.bind(this),
      this.handleResponseError.bind(this)
    );
  }

  /**
   * Обработка исходящего запроса
   */
  async handleRequest(config) {
    // Добавление CSRF токена в заголовки
    const csrfToken = this.getCookie('csrf_token');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    // Проверка и очистка URL параметров
    if (config.params) {
      config.params = this.sanitizeParams(config.params);
    }

    // Проверка и очистка данных
    if (config.data) {
      config.data = this.sanitizeData(config.data);
    }

    return config;
  }

  /**
   * Обработка ошибки запроса
   */
  handleRequestError(error) {
    console.error('Request error:', error);
    return Promise.reject(error);
  }

  /**
   * Обработка ответа
   */
  handleResponse(response) {
    // Проверка CSRF токена в ответе
    if (response.headers['x-csrf-token']) {
      this.updateCsrfToken(response.headers['x-csrf-token']);
    }

    // Проверка на suspicious responses
    if (this.isSuspiciousResponse(response)) {
      console.warn('Suspicious response detected:', response);
      // Здесь можно добавить логику для обработки подозрительных ответов
    }

    return response;
  }

  /**
   * Обработка ошибки ответа
   */
  handleResponseError(error) {
    if (error.response) {
      // Обработка ошибок аутентификации
      if (error.response.status === 401) {
        this.handleUnauthorized();
      }
      
      // Обработка ошибок CSRF
      if (error.response.status === 403 && error.response.data?.error === 'INVALID_CSRF_TOKEN') {
        this.refreshCsrfToken();
      }
    }

    return Promise.reject(error);
  }

  /**
   * Получение CSRF токена из cookie
   */
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  /**
   * Обновление CSRF токена
   */
  updateCsrfToken(token) {
    if (token) {
      document.cookie = `csrf_token=${token}; path=/; secure; HttpOnly; SameSite=Strict`;
    }
  }

  /**
   * Обновление CSRF токена
   */
  async refreshCsrfToken() {
    try {
      const response = await this.client.get('/auth/csrf-token');
      if (response.data?.csrf_token) {
        this.updateCsrfToken(response.data.csrf_token);
      }
    } catch (error) {
      console.error('Failed to refresh CSRF token:', error);
    }
  }

  /**
   * Обработка неавторизованного доступа
   */
  handleUnauthorized() {
    // Здесь можно добавить логику для перенаправления на страницу входа
    console.warn('Unauthorized access detected');
    // window.location.href = '/login';
  }

  /**
   * Очистка параметров URL
   */
  sanitizeParams(params) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'number') {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? this.sanitizeString(item) : item
        );
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeParams(value);
      }
    }
    
    return sanitized;
  }

  /**
   * Очистка данных запроса
   */
  sanitizeData(data) {
    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = {};
      
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          sanitized[key] = this.sanitizeString(value);
        } else if (typeof value === 'number') {
          sanitized[key] = value;
        } else if (Array.isArray(value)) {
          sanitized[key] = value.map(item => 
            typeof item === 'string' ? this.sanitizeString(item) : item
          );
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = this.sanitizeData(value);
        } else {
          sanitized[key] = value;
        }
      }
      
      return sanitized;
    }
    
    return data;
  }

  /**
   * Очистка строки
   */
  sanitizeString(str) {
    if (!str || typeof str !== 'string') return str;
    
    // Удаление потенциально опасных символов
    return str
      .replace(/script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<script>/gi, '');
  }

  /**
   * Проверка на подозрительный ответ
   */
  isSuspiciousResponse(response) {
    // Проверка на подозрительные заголовки
    const suspiciousHeaders = [
      'xss-protection',
      'content-security-policy',
      'strict-transport-security'
    ];
    
    for (const header of suspiciousHeaders) {
      if (!response.headers[header]) {
        return true;
      }
    }
    
    // Проверка на подозрительное содержимое
    if (response.data && typeof response.data === 'string') {
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i
      ];
      
      return suspiciousPatterns.some(pattern => pattern.test(response.data));
    }
    
    return false;
  }

  /**
   * GET запрос
   */
  async get(url, config = {}) {
    return this.client.get(url, config);
  }

  /**
   * POST запрос
   */
  async post(url, data = {}, config = {}) {
    return this.client.post(url, data, config);
  }

  /**
   * PUT запрос
   */
  async put(url, data = {}, config = {}) {
    return this.client.put(url, data, config);
  }

  /**
   * PATCH запрос
   */
  async patch(url, data = {}, config = {}) {
    return this.client.patch(url, data, config);
  }

  /**
   * DELETE запрос
   */
  async delete(url, config = {}) {
    return this.client.delete(url, config);
  }

  /**
   * Загрузка файла
   */
  async uploadFile(url, file, onProgress = null, config = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadConfig = {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers,
      },
      onUploadProgress: onProgress ? (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      } : undefined,
    };
    
    return this.client.post(url, formData, uploadConfig);
  }
}

// Создаем экземпляр API клиента
const apiClient = new ApiClient();

export default apiClient;