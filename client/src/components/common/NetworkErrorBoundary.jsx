import React, { Component, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import logger from '../../services/logger';

/**
 * Компонент для обработки сетевых ошибок и отображения fallback UI
 */
export class NetworkErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasNetworkError: false,
      error: null,
      isOffline: !navigator.onLine,
      retryCount: 0,
      showDetails: false
    };
    
    this.retryTimeout = null;
    this.onlineHandler = this.handleOnline.bind(this);
    this.offlineHandler = this.handleOffline.bind(this);
  }
  
  static getDerivedStateFromError(error) {
    return { hasNetworkError: true, error };
  }
  
  componentDidMount() {
    // Слушаем события онлайн/оффлайн
    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);
    
    // Проверяем текущее состояние сети
    this.setState({ isOffline: !navigator.onLine });
    
    // Мониторинг сетевых запросов
    this.setupNetworkMonitoring();
  }
  
  componentWillUnmount() {
    window.removeEventListener('online', this.onlineHandler);
    window.removeEventListener('offline', this.offlineHandler);
    
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }
  
  setupNetworkMonitoring = () => {
    // Перехватываем fetch запросы для мониторинга
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Проверяем на ошибки HTTP
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response;
      } catch (error) {
        // Логируем сетевые ошибки
        logger.error('Network request failed:', {
          url: args[0],
          method: args[1]?.method || 'GET',
          error: error.message
        });
        
        // Если это не оффлайн режим, показываем ошибку
        if (navigator.onLine) {
          this.setState({ hasNetworkError: true, error });
        }
        
        throw error;
      }
    };
  };
  
  handleOnline = () => {
    logger.info('Network connection restored');
    this.setState({ 
      isOffline: false,
      hasNetworkError: false,
      error: null,
      retryCount: 0
    });
    
    // Уведомляем пользователя о восстановлении соединения
    if (this.props.onNetworkRestore) {
      this.props.onNetworkRestore();
    }
  };
  
  handleOffline = () => {
    logger.warn('Network connection lost');
    this.setState({ 
      isOffline: true,
      hasNetworkError: true,
      error: new Error('Потеряно соединение с интернетом')
    });
  };
  
  handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;
    
    this.setState({ 
      retryCount: newRetryCount,
      hasNetworkError: false,
      error: null
    });
    
    // Уведомляем родителя о необходимости повторить запрос
    if (this.props.onRetry) {
      this.props.onRetry(newRetryCount);
    }
    
    // Если нет обработчика onRetry, пробуем через некоторое время
    if (!this.props.onRetry) {
      this.retryTimeout = setTimeout(() => {
        this.setState({ hasNetworkError: true, error: new Error('Повторная попытка не удалась') });
      }, 5000);
    }
  };
  
  handleToggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };
  
  render() {
    if (this.state.hasNetworkError) {
      return (
        <div className="network-error-boundary p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {this.state.isOffline ? 'Нет соединения с интернетом' : 'Сетевая ошибка'}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {this.state.isOffline 
                ? 'Проверьте ваше интернет-соединение и попробуйте снова.'
                : 'Произошла ошибка при загрузке данных. Пожалуйста, попробуйте снова.'
              }
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                {this.state.isOffline ? 'Проверить соединение' : 'Попробовать снова'}
              </button>
              
              <button
                onClick={this.handleToggleDetails}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 font-medium"
              >
                {this.state.showDetails ? 'Скрыть детали' : 'Показать детали'}
              </button>
            </div>
            
            {this.state.showDetails && this.state.error && (
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-left">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Детали ошибки:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {this.state.error.message}
                </p>
                {this.state.retryCount > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Попыток: {this.state.retryCount}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

NetworkErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onRetry: PropTypes.func,
  onNetworkRestore: PropTypes.func
};

// Обертка для функциональных компонентов
export const withNetworkErrorBoundary = (Component, fallback = null) => {
  return function WrappedComponent(props) {
    return (
      <NetworkErrorBoundary
        onRetry={fallback?.onRetry}
        onNetworkRestore={fallback?.onNetworkRestore}
      >
        <Component {...props} />
      </NetworkErrorBoundary>
    );
  };
};

// Хук для отслеживания состояния сети
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkInfo, setNetworkInfo] = useState({
    effectiveType: '',
    downlink: 0,
    rtt: 0
  });
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    // Поддержка Network Information API
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      const updateNetworkInfo = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        });
      };
      
      updateNetworkInfo();
      connection.addEventListener('change', updateNetworkInfo);
      
      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return { isOnline, networkInfo };
};

export default NetworkErrorBoundary;