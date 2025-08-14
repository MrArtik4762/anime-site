import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../services/logger';
import { Button, Typography, Box, Card, CardContent } from '@mui/material';

// Условная загрузка Sentry
let Sentry = null;
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  try {
    Sentry = require('@sentry/react');
  } catch (e) {
    logger.warn('Sentry package not found, error reporting disabled');
  }
}

/**
 * Глобальный Error Boundary для перехвата ошибок в React приложении
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Обновляем состояние, чтобы следующий рендер показал fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Логируем ошибку с Sentry, если настроен
    if (typeof Sentry !== 'undefined') {
      Sentry.withScope((scope) => {
        scope.setTag('component', 'ErrorBoundary');
        scope.setExtra('errorInfo', errorInfo);
        Sentry.captureException(error);
      });
    }

    // Локальное логирование
    logger.error('React Error Boundary caught an error', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      }
    });

    // Генерируем ID для отслеживания ошибки
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.setState({
      error,
      errorInfo,
      errorId
    });

    // Отправляем ошибку на сервер для анализа
    this.reportErrorToServer(error, errorInfo, errorId);
  }

  /**
   * Отправка ошибки на сервер для анализа
   */
  reportErrorToServer = async (error, errorInfo, errorId) => {
    try {
      const errorReport = {
        id: errorId,
        name: error.name,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userId: this.props.userId || null,
        version: process.env.REACT_APP_VERSION || 'unknown'
      };

      await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.props.authToken || ''}`
        },
        body: JSON.stringify(errorReport)
      });
    } catch (reportError) {
      logger.error('Failed to report error to server', {
        originalError: {
          name: error.name,
          message: error.message
        },
        reportError: {
          name: reportError.name,
          message: reportError.message
        }
      });
    }
  };

  /**
   * Перезагрузка приложения
   */
  handleReload = () => {
    window.location.reload();
  };

  /**
   * Возврат к предыдущему состоянию
   */
  handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      // В продакшене показываем дружелюбный UI
      if (process.env.NODE_ENV === 'production') {
        return (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            minHeight="100vh"
            padding={2}
          >
            <Card sx={{ maxWidth: 500, width: '100%' }}>
              <CardContent>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                  Что-то пошло не так
                </Typography>
                
                <Typography variant="body1" color="text.secondary" paragraph align="center">
                  Приложение столкнулось с неожиданной ошибкой. Мы уже работаем над её устранением.
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={2} mt={3}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={this.handleReload}
                    fullWidth
                  >
                    Перезагрузить страницу
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    onClick={this.handleGoBack}
                    fullWidth
                  >
                    Вернуться назад
                  </Button>
                </Box>
                
                {process.env.NODE_ENV === 'development' && (
                  <Box mt={3} p={2} bgcolor="grey.100" borderRadius={1}>
                    <Typography variant="caption" color="error">
                      Режим разработки: {this.state.error?.message}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        );
      }

      // В режиме разработки показываем детальную информацию об ошибке
      return (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="100vh"
          padding={2}
        >
          <Card sx={{ maxWidth: 800, width: '100%' }}>
            <CardContent>
              <Typography variant="h4" component="h1" gutterBottom color="error">
                Произошла ошибка в React компоненте
              </Typography>
              
              <Typography variant="body1" paragraph>
                Мы перехватили ошибку в компоненте. Вот детали:
              </Typography>
              
              <Box mb={3}>
                <Typography variant="subtitle2" color="error">
                  Имя ошибки: {this.state.error?.name}
                </Typography>
                <Typography variant="body2" color="error">
                  Сообщение: {this.state.error?.message}
                </Typography>
                {this.state.errorId && (
                  <Typography variant="caption" color="text.secondary">
                    ID ошибки: {this.state.errorId}
                  </Typography>
                )}
              </Box>
              
              {this.state.error?.stack && (
                <Box 
                  bgcolor="grey.100" 
                  p={2} 
                  borderRadius={1} 
                  mb={3}
                  overflow="auto"
                  maxHeight="300px"
                >
                  <Typography variant="caption" fontFamily="monospace">
                    {this.state.error.stack}
                  </Typography>
                </Box>
              )}
              
              {this.state.errorInfo?.componentStack && (
                <Box 
                  bgcolor="grey.100" 
                  p={2} 
                  borderRadius={1} 
                  mb={3}
                  overflow="auto"
                  maxHeight="200px"
                >
                  <Typography variant="caption" fontFamily="monospace">
                    Stack trace React:
                    {this.state.errorInfo.componentStack}
                  </Typography>
                </Box>
              )}
              
              <Box display="flex" gap={2}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={this.handleReload}
                >
                  Перезагрузить
                </Button>
                
                <Button 
                  variant="outlined" 
                  onClick={this.handleGoBack}
                >
                  Назад
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// HOC для добавления свойств к ErrorBoundary
export const withErrorBoundary = (WrappedComponent, options = {}) => {
  return function ErrorBoundaryWrapper(props) {
    return (
      <ErrorBoundary
        userId={options.userId}
        authToken={options.authToken}
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
};

// Контекст для обработки ошибок в функциональных компонентах
export const ErrorContext = React.createContext();

export const ErrorProvider = ({ children }) => {
  const [errors, setErrors] = React.useState([]);

  const logError = React.useCallback((error, errorInfo = {}) => {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const errorReport = {
      id: errorId,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    setErrors(prev => [...prev, errorReport]);

    // Логируем ошибку
    logger.error('Error in functional component', errorReport);

    // Отправка на сервер
    fetch('/api/errors/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorReport)
    }).catch(err => {
      logger.error('Failed to report error', err);
    });

    return errorId;
  }, []);

  const clearError = React.useCallback((errorId) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  }, []);

  return (
    <ErrorContext.Provider value={{ errors, logError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
};

// Хук для обработки ошибок в функциональных компонентах
export const useErrorHandler = () => {
  const context = React.useContext(ErrorContext);
  
  if (!context) {
    throw new Error('useErrorHandler must be used within ErrorProvider');
  }
  
  return context;
};

// Компонент для отображения ошибок
export const ErrorDisplay = ({ errors }) => {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
      {errors.map((error) => (
        <Card key={error.id} sx={{ mb: 1, maxWidth: 400 }}>
          <CardContent sx={{ padding: '12px' }}>
            <Typography variant="body2" color="error">
              {error.error.message}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(error.timestamp).toLocaleTimeString()}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};