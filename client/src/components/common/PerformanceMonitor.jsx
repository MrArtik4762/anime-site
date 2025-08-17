import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import logger from '../../services/logger';

/**
 * Компонент для мониторинга производительности приложения
 * Собирает метрики производительности и отправляет их в систему мониторинга
 */
export const PerformanceMonitor = ({ children, enableMonitoring = true }) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const metricsRef = useRef({
    navigationTiming: {},
    resourceTiming: [],
    paintTiming: {},
    memoryUsage: {},
    longTasks: [],
    interactions: []
  });
  
  const observerRef = useRef(null);

  // Собираем метрики навигации
  const collectNavigationMetrics = () => {
    if (!window.performance || !window.performance.navigation) return;
    
    const navigation = window.performance.navigation;
    const timing = window.performance.timing;
    
    if (timing) {
      metricsRef.current.navigationTiming = {
        dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
        tcpConnection: timing.connectEnd - timing.connectStart,
        serverResponse: timing.responseEnd - timing.requestStart,
        domLoading: timing.domLoading,
        domInteractive: timing.domInteractive,
        domComplete: timing.domComplete,
        loadEvent: timing.loadEventEnd - timing.loadEventStart,
        firstPaint: timing.responseStart,
        firstContentfulPaint: timing.responseStart,
        largestContentfulPaint: 0, // Будет обновлено через PerformanceObserver
        firstInputDelay: 0 // Будет обновлено через PerformanceObserver
      };
    }
  };

  // Собираем метрики ресурсов
  const collectResourceMetrics = () => {
    if (!window.performance || !window.performance.getEntriesByType) return;
    
    const resources = window.performance.getEntriesByType('resource');
    metricsRef.current.resourceTiming = resources.map(resource => ({
      name: resource.name,
      type: resource.initiatorType,
      duration: resource.duration,
      size: resource.transferSize || resource.encodedBodySize || 0,
      startTime: resource.startTime
    })).filter(resource => resource.duration > 0);
  };

  // Собираем метрики отрисовки
  const collectPaintMetrics = () => {
    if (!window.performance || !window.performance.getEntriesByType) return;
    
    const paintEntries = window.performance.getEntriesByType('paint');
    const paintMetrics = {};
    
    paintEntries.forEach(entry => {
      paintMetrics[entry.name] = entry.startTime;
    });
    
    metricsRef.current.paintTiming = paintMetrics;
  };

  // Собираем метрики памяти
  const collectMemoryMetrics = () => {
    if (!window.performance || !window.performance.memory) return;
    
    const memory = window.performance.memory;
    metricsRef.current.memoryUsage = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usedHeapPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };
  };

  // Собираем длинные задачи
  const collectLongTasks = () => {
    if (!window.PerformanceLongTaskTiming) return;
    
    observerRef.current = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      metricsRef.current.longTasks.push(...entries.map(entry => ({
        name: entry.name,
        duration: entry.duration,
        startTime: entry.startTime,
        attribution: entry.attribution
      })));
    });
    
    observerRef.current.observe({ type: 'longtask', buffered: true });
  };

  // Собираем метрики взаимодействий
  const collectInteractionMetrics = () => {
    if (!window.PerformanceEventTiming) return;
    
    const interactionObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      metricsRef.current.interactions.push(...entries.map(entry => ({
        name: entry.name,
        duration: entry.duration,
        startTime: entry.startTime,
        processingStart: entry.processingStart,
        processingEnd: entry.processingEnd,
        delay: entry.processingStart - entry.startTime,
        duration: entry.processingEnd - entry.processingStart
      })));
    });
    
    interactionObserver.observe({ type: 'first-input', buffered: true });
  };

  // Собираем Largest Contentful Paint
  const collectLCP = () => {
    if (!window.PerformanceObserver) return;
    
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        metricsRef.current.navigationTiming.largestContentfulPaint = lastEntry.startTime;
      }
    });
    
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  };

  // Собираем First Input Delay
  const collectFID = () => {
    if (!window.PerformanceObserver) return;
    
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const firstEntry = entries[0];
      if (firstEntry) {
        metricsRef.current.navigationTiming.firstInputDelay = firstEntry.processingStart - firstEntry.startTime;
      }
    });
    
    fidObserver.observe({ type: 'first-input', buffered: true });
  };

  // Отправляем метрики в систему мониторинга
  const sendMetrics = () => {
    if (!enableMonitoring) return;
    
    const metrics = {
      ...metricsRef.current,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    
    // Отправляем на сервер для хранения и анализа
    fetch('/api/metrics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metrics)
    }).catch(error => {
      logger.warn('Не удалось отправить метрики производительности:', error);
    });
    
    // Логируем критические метрики в консоль
    if (metrics.navigationTiming.firstInputDelay > 100) {
      logger.warn('Высокая задержка первого ввода:', metrics.navigationTiming.firstInputDelay);
    }
    
    if (metrics.memoryUsage.usedHeapPercentage > 80) {
      logger.warn('Высокое использование памяти:', metrics.memoryUsage.usedHeapPercentage);
    }
  };

  // Инициализация мониторинга
  useEffect(() => {
    if (!enableMonitoring) return;
    
    setIsMonitoring(true);
    logger.info('Инициализация мониторинга производительности');
    
    // Собираем метрики при монтировании компонента
    collectNavigationMetrics();
    collectResourceMetrics();
    collectPaintMetrics();
    collectMemoryMetrics();
    collectLongTasks();
    collectInteractionMetrics();
    collectLCP();
    collectFID();
    
    // Отправляем метрики каждые 30 секунд
    const intervalId = setInterval(sendMetrics, 30000);
    
    // Отправляем метрики при уходе со страницы
    const handleBeforeUnload = () => {
      sendMetrics();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      setIsMonitoring(false);
    };
  }, [enableMonitoring]);

  // Показываем индикатор мониторинга в разработке
  if (process.env.NODE_ENV === 'development' && isMonitoring) {
    return (
      <>
        {children}
        <div 
          style={{
            position: 'fixed',
            bottom: 10,
            right: 10,
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 9999
          }}
        >
          📊 Мониторинг производительности активен
        </div>
      </>
    );
  }
  
  return children;
};

PerformanceMonitor.propTypes = {
  children: PropTypes.node.isRequired,
  enableMonitoring: PropTypes.bool
};

export default PerformanceMonitor;