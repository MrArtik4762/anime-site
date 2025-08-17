import { useState, useEffect, useCallback, useRef } from 'react';
import logger from '../services/logger';

/**
 * Хук для оптимизации сетевых запросов с кэшированием,
 * повторными попытками и обработкой ошибок
 */
export const useOptimizedFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cacheKey, setCacheKey] = useState(null);
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef(null);
  
  // Опции по умолчанию
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'default',
    retryCount: 3,
    retryDelay: 1000,
    timeout: 10000,
    ...options
  };
  
  // Генерируем ключ кэша на основе URL и опций
  useEffect(() => {
    const stringifiedOptions = JSON.stringify({
      method: defaultOptions.method,
      headers: defaultOptions.headers,
      body: defaultOptions.body
    });
    
    const key = `${url}-${stringifiedOptions}`;
    setCacheKey(key);
  }, [url, defaultOptions.method, defaultOptions.headers, defaultOptions.body]);
  
  // Проверяем наличие данных в кэше
  const getCachedData = useCallback(() => {
    if (!cacheKey) return null;
    
    try {
      const cached = localStorage.getItem(`cache_${cacheKey}`);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        // Проверяем возраст кэша (5 минут)
        const age = Date.now() - timestamp;
        if (age < 5 * 60 * 1000) {
          return cachedData;
        }
      }
    } catch (err) {
      logger.warn('Ошибка при чтении кэша:', err);
    }
    
    return null;
  }, [cacheKey]);
  
  // Сохраняем данные в кэш
  const setCachedData = useCallback((responseData) => {
    if (!cacheKey) return;
    
    try {
      const cacheEntry = {
        data: responseData,
        timestamp: Date.now()
      };
      localStorage.setItem(`cache_${cacheKey}`, JSON.stringify(cacheEntry));
    } catch (err) {
      logger.warn('Ошибка при сохранении в кэш:', err);
    }
  }, [cacheKey]);
  
  // Функция для выполнения запроса
  const fetchData = useCallback(async (isRetry = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      
      // Если это не повторная попытка, проверяем кэш
      if (!isRetry) {
        const cachedData = getCachedData();
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return cachedData;
        }
      }
      
      const response = await fetch(url, {
        ...defaultOptions,
        signal: abortControllerRef.current.signal
      });
      
      // Проверяем статус ответа
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // Сохраняем в кэш
      setCachedData(responseData);
      
      setData(responseData);
      retryCountRef.current = 0;
      return responseData;
      
    } catch (err) {
      // Игнорируем ошибки отмены запроса
      if (err.name === 'AbortError') {
        logger.info('Запрос отменен');
        return null;
      }
      
      // Обрабатываем ошибки и повторяем попытки
      retryCountRef.current++;
      
      if (retryCountRef.current < defaultOptions.retryCount) {
        logger.warn(`Попытка ${retryCountRef.current} из ${defaultOptions.retryCount}`);
        
        // Экспоненциальный рост задержки
        const delay = defaultOptions.retryDelay * Math.pow(2, retryCountRef.current - 1);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchData(true);
      } else {
        setError(err);
        logger.error('Ошибка запроса после всех попыток:', err);
        return null;
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [url, defaultOptions, getCachedData, setCachedData]);
  
  // Инициализация запроса
  useEffect(() => {
    if (url) {
      fetchData();
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, fetchData]);
  
  // Функция для повторного выполнения запроса
  const refetch = useCallback(() => {
    retryCountRef.current = 0;
    return fetchData();
  }, [fetchData]);
  
  // Функция для очистки кэша
  const clearCache = useCallback(() => {
    if (cacheKey) {
      try {
        localStorage.removeItem(`cache_${cacheKey}`);
        logger.info('Кэш очищен для ключа:', cacheKey);
      } catch (err) {
        logger.warn('Ошибка при очистке кэша:', err);
      }
    }
  }, [cacheKey]);
  
  return {
    data,
    loading,
    error,
    refetch,
    clearCache,
    retryCount: retryCountRef.current
  };
};

/**
 * Хук для оптимизации множественных запросов
 */
export const useOptimizedFetchMultiple = (requests) => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const executeRequests = useCallback(async () => {
    setLoading(true);
    setErrors({});
    
    const promises = requests.map(async (request) => {
      try {
        const { data, loading, error } = await useOptimizedFetch(request.url, request.options);
        return {
          key: request.key || request.url,
          data,
          loading,
          error
        };
      } catch (err) {
        setErrors(prev => ({
          ...prev,
          [request.key || request.url]: err
        }));
        return {
          key: request.key || request.url,
          data: null,
          loading: false,
          error: err
        };
      }
    });
    
    const results = await Promise.allSettled(promises);
    const fulfilledResults = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
    
    setResults(prev => ({
      ...prev,
      ...fulfilledResults.reduce((acc, result) => {
        acc[result.key] = result;
        return acc;
      }, {})
    }));
    
    setLoading(false);
  }, [requests]);
  
  useEffect(() => {
    if (requests.length > 0) {
      executeRequests();
    }
  }, [requests, executeRequests]);
  
  return {
    results,
    loading,
    errors,
    refetch: executeRequests
  };
};

export default useOptimizedFetch;