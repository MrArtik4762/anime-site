// client/src/services/http.js
/**
 * HTTP GET запрос с поддержкой конфигурации
 * @param {string} url - URL для запроса
 * @param {Object} options - Опции запроса
 * @returns {Promise} - Promise с ответом
 */
export const httpGet = async (url, options = {}) => {
  // Формируем полный URL
  const fullUrl = url;
  
  // Логируем URL в консоль
  console.log('HTTP GET запрос:', fullUrl);
  
  // Устанавливаем опции по умолчанию
  const defaultOptions = {
    method: 'GET',
    credentials: 'include', // Поддержка cookies для аутентификации
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };
  
  try {
    const response = await fetch(fullUrl, defaultOptions);
    
    // Проверяем статус ответа
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('HTTP запрос не удался:', error);
    throw error;
  }
};