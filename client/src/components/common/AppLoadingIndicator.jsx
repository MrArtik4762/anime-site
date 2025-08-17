import React from 'react';
import PropTypes from 'prop-types';

/**
 * Глобальный индикатор загрузки приложения
 * Отображается во время инициализации AuthContext и ThemeProvider
 */
export const AppLoadingIndicator = ({ 
  isLoading = true, 
  message = 'Загрузка приложения...', 
  subMessage = 'Пожалуйста, подождите' 
}) => {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-95 transition-opacity duration-300">
      <div className="text-center">
        {/* Анимированный логотип загрузки */}
        <div className="relative mb-6">
          <div className="w-16 h-16 mx-auto">
            <svg 
              className="w-full h-full text-blue-500 animate-spin" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              ></circle>
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          
          {/* Пульсирующий круг вокруг логотипа */}
          <div className="absolute inset-0 w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping"></div>
          </div>
        </div>

        {/* Основное сообщение */}
        <h2 className="text-xl font-semibold text-white mb-2">
          {message}
        </h2>
        
        {/* Дополнительное сообщение */}
        <p className="text-gray-300 text-sm">
          {subMessage}
        </p>

        {/* Прогресс-индикатор */}
        <div className="mt-6 w-48 mx-auto">
          <div className="bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: '60%' }}
            ></div>
          </div>
        </div>

        {/* Вспомогательные точки */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

AppLoadingIndicator.propTypes = {
  isLoading: PropTypes.bool,
  message: PropTypes.string,
  subMessage: PropTypes.string,
};

export default AppLoadingIndicator;