import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import sentryClient from './config/sentry';
import logger from './services/logger';
import App from './App';
import { CriticalResourceLoader } from './components/common/CriticalResourceLoader';
import { PerformanceMonitor } from './components/common/PerformanceMonitor';
import { NetworkErrorBoundary } from './components/common/NetworkErrorBoundary';

// Инициализация Sentry для мониторинга ошибок
const sentryInitialized = sentryClient.init();

// Настройка React Query для кэширования и оптимизации запросов
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут
      cacheTime: 10 * 60 * 1000, // 10 минут
      retry: (failureCount, error) => {
        // Не повторять запросы для ошибок 4xx
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Максимум 3 попытки для других ошибок
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
  },
});

// Инициализация логгера
logger.info('Приложение запускается...');

// Глобальная обработка ошибок
window.addEventListener('error', (event) => {
  logger.error('Глобальная ошибка:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
  
  if (sentryInitialized) {
    sentryClient.captureException(event.error, {
      tags: { source: 'window.onerror' },
      extra: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  }
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Необработанный промис:', {
    reason: event.reason,
    promise: event.promise
  });
  
  if (sentryInitialized) {
    sentryClient.captureException(event.reason, {
      tags: { source: 'unhandledrejection' }
    });
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <NetworkErrorBoundary>
        <PerformanceMonitor enableMonitoring={process.env.NODE_ENV === 'production'}>
          <CriticalResourceLoader>
            <App />
            <ReactQueryDevtools initialIsOpen={false} />
          </CriticalResourceLoader>
        </PerformanceMonitor>
      </NetworkErrorBoundary>
    </QueryClientProvider>
  </React.StrictMode>,
);
