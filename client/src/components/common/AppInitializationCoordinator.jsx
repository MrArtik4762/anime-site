import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { AppLoadingIndicator } from './AppLoadingIndicator';

/**
 * Координатор инициализации приложения
 * Управляет последовательной инициализацией AuthContext и ThemeProvider
 * Предотвращает конфликты и обеспечивает плавную загрузку
 */
export const AppInitializationCoordinator = ({ children }) => {
  const [authInitialized, setAuthInitialized] = useState(false);
  const [themeInitialized, setThemeInitialized] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Проверка завершенности инициализации
  const isFullyInitialized = authInitialized && themeInitialized;

  // Обработка ошибок инициализации
  const handleInitializationError = useCallback((error) => {
    console.error('Initialization error:', error);
    setHasError(true);
    setErrorMessage(error.message || 'Ошибка при инициализации приложения');
  }, []);

  // Retry логика для инициализации
  const retryInitialization = useCallback(async () => {
    if (isRetrying) return;
    
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    setHasError(false);
    setErrorMessage('');
    
    // Сбрасываем состояния для повторной инициализации
    setAuthInitialized(false);
    setThemeInitialized(false);
    
    // Даем время на очистку состояний
    await new Promise(resolve => setTimeout(resolve, 100));
    
    setIsRetrying(false);
  }, [isRetrying]);

  // Слушаем изменения состояния инициализации от контекстов
  useEffect(() => {
    // Перехватываем события инициализации от AuthContext
    window.addEventListener('auth-initialized', () => {
      setAuthInitialized(true);
    });

    // Перехватываем события инициализации от ThemeProvider
    window.addEventListener('theme-initialized', () => {
      setThemeInitialized(true);
    });

    // Перехватываем ошибки инициализации
    window.addEventListener('initialization-error', (event) => {
      handleInitializationError(event.detail);
    });

    return () => {
      window.removeEventListener('auth-initialized');
      window.removeEventListener('theme-initialized');
      window.removeEventListener('initialization-error');
    };
  }, [handleInitializationError]);

  // Показываем индикатор загрузки во время инициализации
  if (!isFullyInitialized && !hasError) {
    return (
      <AppLoadingIndicator 
        isLoading={true}
        message="Инициализация приложения"
        subMessage="Подготовка системы аутентификации и темы"
      />
    );
  }

  // Показываем ошибку при проблемах с инициализацией
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Ошибка инициализации
            </h1>
            <p className="text-gray-600 mb-6">
              {errorMessage}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={retryInitialization}
              disabled={isRetrying}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRetrying ? 'Повторная попытка...' : `Попробовать снова (${retryCount})`}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
            >
              Обновить страницу
            </button>
          </div>

          {retryCount >= 3 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Если проблема сохраняется, пожалуйста, очистите кеш браузера или обратитесь в поддержку.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Если все успешно, рендерим приложение
  return children;
};

AppInitializationCoordinator.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppInitializationCoordinator;