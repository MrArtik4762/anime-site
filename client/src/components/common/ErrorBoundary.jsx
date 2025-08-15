import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { logger } from '../utils/logger';
import { Button } from './Button';

// Дополнительные стили для современного ErrorBoundary
const { spacing, colors, gradients, animations, shadows } = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#94a3b8'
    },
    surface: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9'
    },
    border: {
      light: '#e2e8f0',
      medium: '#cbd5e1',
      heavy: '#94a3b8'
    }
  },
  gradients: {
    primary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    secondary: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    accent: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
  },
  animations: {
    durations: {
      fast: '0.15s',
      normal: '0.3s',
      slow: '0.5s'
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0, 1)'
    },
    keyframes: {
      shake: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `,
      fadeIn: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `,
      pulse: `
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `
    }
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    error: '0 0 0 3px rgba(239, 68, 68, 0.3)'
  }
};

// Контейнер для ErrorBoundary
const ErrorBoundaryContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${spacing.lg};
  background: linear-gradient(135deg, ${props => props.theme.colors.surface.secondary} 0%, ${props => props.theme.colors.surface.tertiary} 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23e2e8f0" fill-opacity="0.05"><path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/></g></g></svg>');
    opacity: 0.5;
    pointer-events: none;
  }
`;

// Карточка ошибки
const ErrorCard = styled.div`
  background: ${props => props.theme.colors.surface.primary};
  border-radius: ${spacing.lg};
  box-shadow: ${shadows.xl};
  max-width: 600px;
  width: 100%;
  overflow: hidden;
  border: 1px solid ${props => props.theme.colors.border.light};
  animation: ${animations.keyframes.fadeIn} 0.5s ease-out;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${gradients.error};
    border-radius: ${spacing.lg} ${spacing.lg} 0 0;
  }
`;

// Заголовок ошибки
const ErrorHeader = styled.div`
  padding: ${spacing.lg} ${spacing.lg} ${spacing.md};
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
  display: flex;
  align-items: center;
  gap: ${spacing.md};
`;

// Иконка ошибки
const ErrorIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${gradients.error};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
  box-shadow: ${shadows.error};
  animation: ${animations.keyframes.pulse} 2s ease-in-out infinite;
`;

// Заголовок
const ErrorTitle = styled.h2`
  margin: 0;
  font-size: ${spacing.xl};
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  letter-spacing: -0.025em;
`;

// Тело ошибки
const ErrorBody = styled.div`
  padding: ${spacing.lg};
`;

// Сообщение об ошибке
const ErrorMessage = styled.div`
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${spacing.md};
  padding: ${spacing.md};
  margin-bottom: ${spacing.lg};
  
  p {
    margin: 0;
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.typography.fontSize.base[0]};
    line-height: 1.6;
  }
`;

// Детали ошибки
const ErrorDetails = styled.div`
  background: ${props => props.theme.colors.surface.secondary};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${spacing.md};
  padding: ${spacing.md};
  margin-bottom: ${spacing.lg};
  font-family: 'Courier New', monospace;
  font-size: ${props => props.theme.typography.fontSize.sm[0]};
  max-height: 300px;
  overflow-y: auto;
  
  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
    color: ${props => props.theme.colors.text.tertiary};
  }
  
  h5 {
    margin: 0 0 ${spacing.sm} 0;
    color: ${props => props.theme.colors.text.secondary};
    font-size: ${props => props.theme.typography.fontSize.base[0]};
    font-weight: 600;
  }
`;

// Кнопки действий
const ErrorActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  flex-wrap: wrap;
  margin-bottom: ${spacing.md};
`;

// ID события
const ErrorEventId = styled.div`
  padding: ${spacing.sm};
  background: ${props => props.theme.colors.surface.secondary};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.xs[0]};
  color: ${props => props.theme.colors.text.tertiary};
  text-align: center;
  font-family: 'Courier New', monospace;
`;

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Обновляем состояние, чтобы следующий рендер показал fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
      eventId: null
    };
  }

  componentDidCatch(error, errorInfo) {
    // Логируем ошибку в консоль
    logger.error('ErrorBoundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // Сохраняем информацию об ошибке в состояние
    this.setState({
      error,
      errorInfo,
      eventId: this.generateEventId()
    });

    // Вызываем пользовательский обработчик ошибок, если он предоставлен
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Отправляем ошибку в Sentry, если он настроен
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.withScope((scope) => {
        scope.setExtra('componentStack', errorInfo.componentStack);
        window.Sentry.captureException(error);
      });
    }
  }

  generateEventId = () => {
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  handleRetry = () => {
    // Перезагружаем страницу при повторной попытке
    window.location.reload();
  };

  handleReport = () => {
    // Создаем отчет об ошибке
    const errorReport = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      eventId: this.state.eventId
    };

    // Копируем отчет в буфер обмена
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert('Отчет об ошибке скопирован в буфер обмена. Вы можете отправить его разработчикам.');
      })
      .catch(() => {
        // Если копирование не удалось, показываем отчет в консоли
        console.error('Error Report:', errorReport);
        alert('Не удалось скопировать отчет. Пожалуйста, свяжитесь с поддержкой.');
      });
  };

  render() {
    if (this.state.hasError) {
      // Если пользователь предоставил fallback, используем его
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Иначе показываем стандартный fallback UI
      return (
        <ErrorBoundaryContainer>
          <ErrorCard>
            <ErrorHeader>
              <ErrorIcon>⚠️</ErrorIcon>
              <ErrorTitle>Что-то пошло не так</ErrorTitle>
            </ErrorHeader>
            
            <ErrorBody>
              <ErrorMessage>
                <p><strong>Произошла непредвиденная ошибка.</strong> Приносим извинения за неудобства.</p>
              </ErrorMessage>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <ErrorDetails>
                  <h5>Детали ошибки:</h5>
                  <pre>
                    <strong>{this.state.error.name}:</strong> {this.state.error.message}
                  </pre>
                  {this.state.error.stack && (
                    <pre className="mt-2">
                      {this.state.error.stack}
                    </pre>
                  )}
                  {this.state.errorInfo && (
                    <pre className="mt-2">
                      <strong>Component Stack:</strong><br />
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </ErrorDetails>
              )}

              <ErrorActions>
                <Button
                  variant="primary"
                  size="md"
                  onClick={this.handleRetry}
                >
                  Попробовать снова
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={this.handleReport}
                >
                  Сообщить об ошибке
                </Button>
              </ErrorActions>

              {this.state.eventId && (
                <ErrorEventId>
                  ID события: {this.state.eventId}
                </ErrorEventId>
              )}
            </ErrorBody>
          </ErrorCard>
        </ErrorBoundaryContainer>
      );
    }

    // Если ошибки нет, рендерим дочерние компоненты
    return this.props.children;
  }
}

// HOC для добавления ErrorBoundary к компоненту
export const withErrorBoundary = (WrappedComponent, fallback = null) => {
  return (props) => (
    <ErrorBoundary fallback={fallback}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
};

// ErrorBoundary для специфических частей приложения
export const PageErrorBoundary = (props) => (
  <ErrorBoundary {...props} />
);

// ErrorBoundary для модальных окон
export const ModalErrorBoundary = (props) => (
  <ErrorBoundary {...props} fallback={
    <ErrorBoundaryContainer>
      <ErrorCard style={{ maxWidth: '400px' }}>
        <ErrorHeader>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Ошибка загрузки</ErrorTitle>
        </ErrorHeader>
        
        <ErrorBody>
          <ErrorMessage>
            <p>Не удалось загрузить содержимое модального окна.</p>
          </ErrorMessage>
          
          <ErrorActions>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Обновить
            </Button>
          </ErrorActions>
        </ErrorBody>
      </ErrorCard>
    </ErrorBoundaryContainer>
  } />
);

// ErrorBoundary для форм
export const FormErrorBoundary = (props) => (
  <ErrorBoundary {...props} fallback={
    <ErrorBoundaryContainer>
      <ErrorCard style={{ maxWidth: '400px' }}>
        <ErrorHeader>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Ошибка формы</ErrorTitle>
        </ErrorHeader>
        
        <ErrorBody>
          <ErrorMessage>
            <p>Произошла ошибка при загрузке формы. Пожалуйста, обновите страницу.</p>
          </ErrorMessage>
          
          <ErrorActions>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Обновить
            </Button>
          </ErrorActions>
        </ErrorBody>
      </ErrorCard>
    </ErrorBoundaryContainer>
  } />
);

export default ErrorBoundary;