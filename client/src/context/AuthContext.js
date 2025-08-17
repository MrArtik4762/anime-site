import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isInitialized: false,
  networkError: false,
  retryCount: 0,
  maxRetries: 3,
  retryDelay: 1000, // 1 секунда
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null, networkError: false };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        networkError: false,
        retryCount: 0,
        isInitialized: true,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        networkError: action.type === 'NETWORK_ERROR',
        retryCount: action.retryCount || state.retryCount,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        networkError: false,
        retryCount: 0,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'INITIALIZATION_COMPLETE':
      return {
        ...state,
        isInitialized: true,
        isLoading: false,
      };
    case 'NETWORK_ERROR':
      return {
        ...state,
        networkError: true,
        isLoading: false,
        error: action.payload,
        retryCount: action.retryCount || state.retryCount + 1,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const isMounted = useRef(true);
  const retryTimeoutRef = useRef(null);

  // Проверка доступности сети
  const checkNetworkConnectivity = () => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return false;
    }
    return true;
  };

  // Экспоненциальная задержка для retry
  const getRetryDelay = (retryCount) => {
    return Math.min(initialState.retryDelay * Math.pow(2, retryCount), 10000); // Максимум 10 секунд
  };

  // Retry логика для инициализации аутентификации
  const retryAuthInitialization = async (retryCount = 0) => {
    if (!isMounted.current) return;

    const delay = getRetryDelay(retryCount);
    
    retryTimeoutRef.current = setTimeout(async () => {
      if (!checkNetworkConnectivity()) {
        dispatch({
          type: 'NETWORK_ERROR',
          payload: 'Отсутствует подключение к сети. Проверьте интернет-соединение.',
          retryCount: retryCount + 1
        });
        return;
      }

      dispatch({ type: 'AUTH_START' });
      
      try {
        // Пытаемся обновить токен через refresh endpoint
        await authService.refresh();
        
        // Если refresh успешен, получаем данные пользователя
        const response = await authService.getCurrentUser();
        dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
      } catch (error) {
        console.error(`Auth retry attempt ${retryCount + 1} failed:`, {
          error: error.message,
          status: error.response?.status,
          data: error.response?.data,
          timestamp: new Date().toISOString()
        });
        
        // Если refresh не удался, очищаем токен и сохраняем ошибку
        authService.clearToken();
        
        let errorMessage = 'Сессия истекла. Пожалуйста, войдите снова.';
        if (error.response?.status === 401) {
          errorMessage = 'Ваша сессия истекла. Пожалуйста, войдите снова.';
        } else if (error.response?.status === 500) {
          errorMessage = 'Ошибка сервера. Попробуйте обновить страницу.';
        } else if (!error.response) {
          errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
        }
        
        const newRetryCount = retryCount + 1;
        
        // Если достигли максимального количества попыток, показываем ошибку
        if (newRetryCount >= initialState.maxRetries) {
          dispatch({
            type: 'AUTH_FAILURE',
            payload: `Не удалось установить соединение. ${errorMessage}`,
            retryCount: newRetryCount
          });
          
          // Уведомляем координатор об ошибке
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('initialization-error', {
              detail: { error: new Error(errorMessage), type: 'auth' }
            }));
          }
        } else {
          // Иначе пробуем снова
          retryAuthInitialization(newRetryCount);
        }
      }
    }, delay);
  };

  // Graceful fallback для отсутствия сети
  const handleNetworkOffline = () => {
    dispatch({
      type: 'NETWORK_ERROR',
      payload: 'Приложение работает в офлайн-режиме. Некоторые функции могут быть ограничены.'
    });
  };

  const handleNetworkOnline = () => {
    if (state.networkError && !state.isAuthenticated) {
      // При восстановлении сети пробуем инициализировать снова
      retryAuthInitialization();
    }
  };

  // Автоматическое восстановление сессии при старте приложения
  useEffect(() => {
    // Проверяем доступность сети перед инициализацией
    if (!checkNetworkConnectivity()) {
      dispatch({
        type: 'NETWORK_ERROR',
        payload: 'Отсутствует подключение к сети. Проверьте интернет-соединение.'
      });
      return;
    }

    retryAuthInitialization();

    // Обработчики событий сети
    window.addEventListener('offline', handleNetworkOffline);
    window.addEventListener('online', handleNetworkOnline);

    return () => {
      isMounted.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      window.removeEventListener('offline', handleNetworkOffline);
      window.removeEventListener('online', handleNetworkOnline);
    };
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authService.login(credentials);
      const { user } = response;
      
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      return { success: true };
    } catch (error) {
      console.error('Login error:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        timestamp: new Date().toISOString()
      });
      
      let errorMessage = 'Произошла ошибка при входе. Попробуйте снова.';
      if (error.response?.status === 401) {
        errorMessage = 'Неверный email или пароль.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Неверные данные для входа.';
      } else if (!error.response) {
        errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
      }
      
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authService.register(userData);
      const { user } = response;
      
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      return { success: true };
    } catch (error) {
      console.error('Registration error:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        timestamp: new Date().toISOString()
      });
      
      let errorMessage = 'Произошла ошибка при регистрации. Попробуйте снова.';
      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Неверные данные для регистрации.';
      } else if (error.response?.status === 409) {
        errorMessage = 'Пользователь с таким email уже существует.';
      } else if (!error.response) {
        errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
      }
      
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout error:', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        timestamp: new Date().toISOString()
      });
    } finally {
      authService.clearToken();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    retryAuth: () => retryAuthInitialization(state.retryCount),
    isNetworkAvailable: checkNetworkConnectivity(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
