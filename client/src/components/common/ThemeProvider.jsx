import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { lightTheme, getTheme } from '../../styles/theme';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { useAutoThemeSwitch } from '../../utils/autoThemeSwitch';

// Создаем контекст темы
const ThemeContext = createContext();

const DEFAULT_THEME = 'light';

// Провайдер темы
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState(lightTheme); // Инициализируем с светлой темой
  const [isInitialized, setIsInitialized] = useState(false);
  const [autoThemeEnabled, setAutoThemeEnabled] = useState(false);
  const [themeError, setThemeError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const isMounted = useRef(true);

  // Безопасное получение значения из localStorage
  const getLocalStorageValue = (key, defaultValue) => {
    try {
      if (typeof window === 'undefined') return defaultValue;
      
      const value = localStorage.getItem(key);
      if (value === null) return defaultValue;
      
      // Проверяем корректность JSON
      if (key === 'theme') {
        return ['light', 'dark'].includes(value) ? value : defaultValue;
      }
      
      if (key === 'autoThemeEnabled') {
        return value === 'true';
      }
      
      return defaultValue;
    } catch (error) {
      console.error(`Error accessing localStorage for key ${key}:`, error);
      return defaultValue;
    }
  };

  // Инициализация темы при загрузке (только на клиенте)
  useEffect(() => {
    if (!isMounted.current) return;

    const initializeTheme = async () => {
      setIsInitializing(true);
      setThemeError(null);
      
      try {
        if (typeof window !== 'undefined') {
          // Проверяем доступность localStorage
          const testKey = '__test__';
          try {
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
          } catch (error) {
            throw new Error('localStorage недоступен');
          }

          const savedTheme = getLocalStorageValue('theme', DEFAULT_THEME);
          const savedAutoTheme = getLocalStorageValue('autoThemeEnabled', false);
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          
          // Проверяем системные предпочтения, если нет сохраненных настроек
          if (savedTheme === DEFAULT_THEME) {
            setIsDarkMode(prefersDark);
          } else {
            setIsDarkMode(savedTheme === 'dark');
          }
          
          setAutoThemeEnabled(savedAutoTheme);
        }
        
        setIsInitialized(true);
        
        // Уведомляем координатор об успешной инициализации
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('theme-initialized', {
            detail: { success: true, theme: isDarkMode ? 'dark' : 'light' }
          }));
        }
      } catch (error) {
        console.error('Theme initialization failed:', error);
        setThemeError('Не удалось загрузить настройки темы. Используется тема по умолчанию.');
        // При ошибке используем светлую тему
        setIsDarkMode(false);
        setAutoThemeEnabled(false);
        setIsInitialized(true);
        
        // Уведомляем координатор об ошибке
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('initialization-error', {
            detail: { error: new Error('Theme initialization failed'), type: 'theme' }
          }));
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initializeTheme();

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Обновление темы при изменении isDarkMode
  useEffect(() => {
    if (isInitialized && !isInitializing && typeof window !== 'undefined') {
      try {
        const newTheme = getTheme(isDarkMode);
        setTheme(newTheme);
        
        // Сохраняем предпочтение пользователя
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        
        // Применяем класс к body для CSS-селекторов
        if (isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (error) {
        console.error('Error updating theme:', error);
        setThemeError('Ошибка применения темы. Попробуйте обновить страницу.');
      }
    }
  }, [isDarkMode, isInitialized, isInitializing]);

  // Переключение темы
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      // Отключаем автотему при ручном переключении
      if (autoThemeEnabled) {
        setAutoThemeEnabled(false);
        localStorage.setItem('autoThemeEnabled', 'false');
      }
      return newMode;
    });
  }, [autoThemeEnabled]);

  // Установка конкретной темы
  const setMode = useCallback((mode) => {
    setIsDarkMode(mode === 'dark');
    // Отключаем автотему при ручном переключении
    if (autoThemeEnabled) {
      setAutoThemeEnabled(false);
      localStorage.setItem('autoThemeEnabled', 'false');
    }
  }, [autoThemeEnabled]);

  // Включение/выключение автоматического переключения темы
  const toggleAutoTheme = useCallback(() => {
    setAutoThemeEnabled(prev => {
      const newAutoTheme = !prev;
      localStorage.setItem('autoThemeEnabled', newAutoTheme.toString());
      return newAutoTheme;
    });
  }, []);

  // Обработка автоматического переключения темы
  const handleAutoThemeChange = useCallback((newTheme) => {
    setIsDarkMode(newTheme === 'dark');
  }, []);

  // Инициализация автоматического переключения темы
  useAutoThemeSwitch(handleAutoThemeChange);

  // Контекст значения
  const value = {
    theme,
    isDarkMode,
    toggleTheme,
    setMode,
    toggleAutoTheme,
    autoThemeEnabled,
    colors: theme.colors,
    typography: theme.typography,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    breakpoints: theme.breakpoints,
    zIndex: theme.zIndex,
    opacity: theme.opacity,
    elevation: theme.elevation,
    transitions: theme.transitions,
    isInitialized,
    isInitializing,
    themeError,
    retryTheme: () => window.location.reload(),
  };

  return (
    <ThemeContext.Provider value={value}>
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

// Хук для использования темы
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Компонент переключателя темы
export const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors duration-200 ${
        isDarkMode 
          ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500' 
          : 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
      } ${className}`}
      aria-label="Переключить тему"
      title={isDarkMode ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
    >
      {isDarkMode ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
};

// HOC для обёртки компонента с темой
export const withTheme = (Component) => {
  return function WrappedComponent(props) {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };
};

// Компонент для отображения текущей темы
export const ThemeIndicator = ({ className = '' }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
      isDarkMode 
        ? 'bg-gray-800 text-yellow-400' 
        : 'bg-yellow-100 text-gray-800'
    } ${className}`}>
      {isDarkMode ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
          Тёмная тема
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
          Светлая тема
        </>
      )}
    </div>
  );
};

// Экспортируем все компоненты и хуки
export default ThemeProvider;