import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Граница обработки ошибок для всего приложения
 * Перехватывает ошибки рендеринга и жизненного цикла
 */
export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      showRetry: false
    };
  }

  static getDerivedStateFromError(error) {
    // Обновляем состояние, чтобы следующий рендер показал fallback UI
    return { 
      hasError: true,
      error,
      showRetry: true
    };
  }

  componentDidCatch(error, errorInfo) {
    // Логируем ошибку
    console.error('App Error Boundary caught an error:', {
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount
    });

    // Можно отправить ошибку в сервис мониторинга
    // this.logErrorToService(error, errorInfo);

    this.setState({
      errorInfo
    });
  }

  handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;
    
    if (newRetryCount >= 3) {
      // После 3 попыток показываем сообщение о фатальной ошибке
      this.setState({
        showRetry: false,
        error: new Error('Произошла фатальная ошибка. Пожалуйста, обновите страницу.')
      });
      return;
    }

    this.setState({
      retryCount: newRetryCount,
      hasError: false,
      error: null,
      errorInfo: null,
      showRetry: false
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
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
                Что-то пошло не так
              </h1>
              <p className="text-gray-600 mb-6">
                Произошла ошибка при загрузке приложения. Мы работаем над её исправлением.
              </p>
            </div>

            {this.state.showRetry && (
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  Попробовать снова
                </button>
                <button
                  onClick={this.handleReload}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                >
                  Обновить страницу
                </button>
              </div>
            )}

            {!this.state.showRetry && (
              <div className="text-sm text-gray-500">
                <p>Пожалуйста, обновите страницу или попробуйте зайти позже.</p>
                <button
                  onClick={this.handleReload}
                  className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Обновить страницу
                </button>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  Техническая информация (только для разработчиков)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-600 overflow-auto max-h-40">
                  <p className="mb-1"><strong>Ошибка:</strong> {this.state.error.message}</p>
                  {this.state.errorInfo && (
                    <>
                      <p className="mb-1"><strong>Стек вызовов:</strong></p>
                      <pre className="whitespace-pre-wrap break-words">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

AppErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

// Обертка для функциональных компонентов
export const withErrorBoundary = (Component, fallback = null) => {
  return function WrappedComponent(props) {
    return (
      <AppErrorBoundary fallback={fallback}>
        <Component {...props} />
      </AppErrorBoundary>
    );
  };
};

export default AppErrorBoundary;