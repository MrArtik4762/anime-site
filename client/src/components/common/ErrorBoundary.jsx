import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../utils/logger';
import { Button, Alert, Card, CardHeader, CardBody } from 'reactstrap';

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
        <div className="error-boundary-container">
          <Card className="border-danger">
            <CardHeader className="bg-danger text-white">
              <h4 className="mb-0">Что-то пошло не так</h4>
            </CardHeader>
            <CardBody>
              <Alert color="danger" className="mb-4">
                <strong>Произошла непредвиденная ошибка.</strong> Приносим извинения за неудобства.
              </Alert>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="error-details mb-4">
                  <h5>Детали ошибки:</h5>
                  <pre className="bg-light p-3 rounded">
                    <strong>{this.state.error.name}:</strong> {this.state.error.message}
                  </pre>
                  {this.state.error.stack && (
                    <pre className="bg-light p-3 rounded mt-2">
                      {this.state.error.stack}
                    </pre>
                  )}
                  {this.state.errorInfo && (
                    <pre className="bg-light p-3 rounded mt-2">
                      <strong>Component Stack:</strong><br />
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              <div className="error-actions">
                <Button 
                  color="primary" 
                  onClick={this.handleRetry}
                  className="me-2"
                >
                  Попробовать снова
                </Button>
                <Button 
                  color="secondary" 
                  onClick={this.handleReport}
                >
                  Сообщить об ошибке
                </Button>
              </div>

              {this.state.eventId && (
                <div className="error-event-id mt-3 text-muted small">
                  ID события: {this.state.eventId}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
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
    <div className="text-center p-4">
      <h5>Ошибка загрузки</h5>
      <p>Не удалось загрузить содержимое модального окна.</p>
    </div>
  } />
);

// ErrorBoundary для форм
export const FormErrorBoundary = (props) => (
  <ErrorBoundary {...props} fallback={
    <div className="alert alert-danger">
      Произошла ошибка при загрузке формы. Пожалуйста, обновите страницу.
    </div>
  } />
);

export default ErrorBoundary;