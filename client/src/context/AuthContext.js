import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Автоматическое восстановление сессии при старте приложения
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: 'AUTH_START' });
      
      try {
        // Пытаемся обновить токен через refresh endpoint
        await authService.refresh();
        
        // Если refresh успешен, получаем данные пользователя
        const response = await authService.getCurrentUser();
        dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
      } catch (error) {
        console.error('Session restoration failed:', {
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
        
        dispatch({
          type: 'AUTH_FAILURE',
          payload: errorMessage
        });
      }
    };

    initializeAuth();
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
