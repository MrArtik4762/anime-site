import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from './ThemeProvider';
import Loading from './Loading';

// Хук для оптимизации производительности на мобильных устройствах
const useMobilePerformance = (options = {}) => {
  const {
    enableHardwareAcceleration = true,
    enableReducedMotion = true,
    enableOptimizedScrolling = true,
    enableTouchOptimization = true,
  } = options;
  
  // Применение аппаратного ускорения
  useEffect(() => {
    if (enableHardwareAcceleration) {
      document.body.classList.add('mobile-hardware-acceleration');
    } else {
      document.body.classList.remove('mobile-hardware-acceleration');
    }
    
    return () => {
      document.body.classList.remove('mobile-hardware-acceleration');
    };
  }, [enableHardwareAcceleration]);
  
  // Применение уменьшенной анимации
  useEffect(() => {
    if (enableReducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
    
    return () => {
      document.body.classList.remove('reduced-motion');
    };
  }, [enableReducedMotion]);
  
  // Оптимизация прокрутки
  useEffect(() => {
    if (enableOptimizedScrolling) {
      document.body.classList.add('optimized-scrolling');
    } else {
      document.body.classList.remove('optimized-scrolling');
    }
    
    return () => {
      document.body.classList.remove('optimized-scrolling');
    };
  }, [enableOptimizedScrolling]);
  
  // Оптимизация touch-событий
  useEffect(() => {
    if (enableTouchOptimization) {
      document.body.classList.add('touch-optimized');
    } else {
      document.body.classList.remove('touch-optimized');
    }
    
    return () => {
      document.body.classList.remove('touch-optimized');
    };
  }, [enableTouchOptimization]);
  
  // Оптимизация отрисовки
  const optimizeRendering = useCallback((element) => {
    if (!element) return;
    
    // Использование will-change для оптимизации отрисовки
    element.style.willChange = 'transform, opacity';
    
    // Использование transform вместо top/left для анимаций
    element.style.transform = 'translateZ(0)';
    
    return () => {
      element.style.willChange = 'auto';
      element.style.transform = 'none';
    };
  }, []);
  
  // Оптимизация памяти
  const optimizeMemory = useCallback(() => {
    // Принудительный сборка мусора (если поддерживается)
    if (window.gc) {
      window.gc();
    }
    
    // Очистка кэша изображений
    const images = document.getElementsByTagName('img');
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img.hasAttribute('data-keep')) {
        img.src = '';
      }
    }
  }, []);
  
  // Оптимизация сетевых запросов
  const optimizeNetwork = useCallback(() => {
    // Отключение анимаций при медленном соединении
    if ('connection' in navigator) {
      const connection = navigator.connection;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        document.body.classList.add('slow-connection');
        return true;
      }
    }
    document.body.classList.remove('slow-connection');
    return false;
  }, []);
  
  return {
    optimizeRendering,
    optimizeMemory,
    optimizeNetwork,
  };
};

// Компонент для оптимизации изображений на мобильных устройствах
const MobileOptimizedImage = ({ 
  src, 
  alt = '', 
  lowQualitySrc = '',
  placeholder = true,
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLowQuality, setIsLowQuality] = useState(false);
  const imgRef = useRef(null);
  const { optimizeNetwork } = useMobilePerformance();
  
  // Проверка качества соединения
  useEffect(() => {
    const isSlowConnection = optimizeNetwork();
    if (isSlowConnection && lowQualitySrc) {
      setIsLowQuality(true);
    }
  }, [optimizeNetwork, lowQualitySrc]);
  
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
  }, []);
  
  const handleError = useCallback(() => {
    setIsLoaded(false);
    setHasError(true);
  }, []);
  
  // Предзагрузка изображений
  useEffect(() => {
    if (!isLowQuality && src) {
      const img = new Image();
      img.src = src;
      img.onload = handleLoad;
      img.onerror = handleError;
    }
  }, [src, isLowQuality, handleLoad, handleError]);
  
  return (
    <div className={`mobile-optimized-image relative ${className}`} {...props}>
      {placeholder && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <Loading size="small" />
        </div>
      )}
      
      {hasError ? (
        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Изображение недоступно</p>
          </div>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={isLowQuality ? lowQualitySrc : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
};

MobileOptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  lowQualitySrc: PropTypes.string,
  placeholder: PropTypes.bool,
  className: PropTypes.string,
};

// Компонент для оптимизации списков на мобильных устройствах
const MobileOptimizedList = ({ 
  children, 
  height = 400, 
  itemHeight = 50,
  overscanCount = 3,
  loading = false,
  loadingText = 'Загрузка...',
  emptyText = 'Нет данных для отображения',
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef(null);
  const scrollTimeout = useRef(null);
  const { optimizeRendering } = useMobilePerformance();
  
  // Оптимизация контейнера
  useEffect(() => {
    if (containerRef.current) {
      const cleanup = optimizeRendering(containerRef.current);
      return cleanup;
    }
  }, [optimizeRendering]);
  
  // Расчет видимых элементов
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscanCount);
    const endIndex = Math.min(
      React.Children.count(children) - 1,
      Math.ceil((scrollTop + height) / itemHeight) + overscanCount
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, height, itemHeight, children, overscanCount]);
  
  // Обработчик прокрутки с оптимизацией
  const handleScroll = useCallback((e) => {
    const scrollTop = e.target.scrollTop;
    setScrollTop(scrollTop);
    setIsScrolling(true);
    
    // Сброс состояния прокрутки с задержкой
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);
  
  // Рендеринг элементов с оптимизацией
  const renderItems = useMemo(() => {
    if (loading) {
      return Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      ));
    }
    
    if (React.Children.count(children) === 0) {
      return (
        <div className="flex items-center justify-center h-full py-8">
          <p className="text-gray-500 dark:text-gray-400">{emptyText}</p>
        </div>
      );
    }
    
    const { startIndex, endIndex } = visibleRange;
    const visibleChildren = React.Children.toArray(children).slice(startIndex, endIndex + 1);
    
    return visibleChildren.map((child, index) => {
      const actualIndex = startIndex + index;
      return (
        <div
          key={actualIndex}
          className={isScrolling ? 'opacity-75' : 'opacity-100'}
          style={{
            position: 'absolute',
            top: actualIndex * itemHeight,
            width: '100%',
            height: itemHeight,
            willChange: 'transform',
            transform: isScrolling ? 'translateZ(0)' : 'none',
          }}
        >
          {child}
        </div>
      );
    });
  }, [children, visibleRange, loading, emptyText, isScrolling, itemHeight]);
  
  return (
    <div 
      ref={containerRef}
      className={`mobile-optimized-list ${className}`}
      style={{
        height: `${height}px`,
        overflow: 'auto',
        position: 'relative',
        WebkitOverflowScrolling: 'touch',
      }}
      onScroll={handleScroll}
      {...props}
    >
      {/* Обертка для элементов */}
      <div
        style={{
          height: `${React.Children.count(children) * itemHeight}px`,
          position: 'relative',
        }}
      >
        {renderItems}
      </div>
    </div>
  );
};

MobileOptimizedList.propTypes = {
  children: PropTypes.node.isRequired,
  height: PropTypes.number,
  itemHeight: PropTypes.number,
  overscanCount: PropTypes.number,
  loading: PropTypes.bool,
  loadingText: PropTypes.string,
  emptyText: PropTypes.string,
  className: PropTypes.string,
};

// Компонент для оптимизации анимаций на мобильных устройствах
const MobileOptimizedAnimation = ({ 
  children, 
  type = 'fade', // 'fade', 'slide', 'scale'
  duration = 300,
  delay = 0,
  disabled = false,
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);
  const { optimizeRendering } = useMobilePerformance();
  
  // Оптимизация элемента
  useEffect(() => {
    if (elementRef.current) {
      const cleanup = optimizeRendering(elementRef.current);
      return cleanup;
    }
  }, [optimizeRendering]);
  
  // Появление элемента с отложенным выполнением
  useEffect(() => {
    if (!disabled) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [delay, disabled]);
  
  // Определение классов анимации
  const getAnimationClasses = useCallback(() => {
    if (disabled || !isVisible) return '';
    
    switch (type) {
      case 'fade':
        return 'opacity-100 transition-opacity duration-300';
      case 'slide':
        return 'translate-y-0 opacity-100 transition-all duration-300';
      case 'scale':
        return 'scale-100 opacity-100 transition-all duration-300';
      default:
        return '';
    }
  }, [type, disabled, isVisible]);
  
  // Определение начальных стилей
  const getInitialStyles = useCallback(() => {
    if (disabled || isVisible) return {};
    
    switch (type) {
      case 'fade':
        return { opacity: 0 };
      case 'slide':
        return { transform: 'translateY(20px)', opacity: 0 };
      case 'scale':
        return { transform: 'scale(0.95)', opacity: 0 };
      default:
        return {};
    }
  }, [type, disabled, isVisible]);
  
  return (
    <div
      ref={elementRef}
      className={`mobile-optimized-animation ${getAnimationClasses()} ${className}`}
      style={{
        ...getInitialStyles(),
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        willChange: 'transform, opacity',
      }}
      {...props}
    >
      {children}
    </div>
  );
};

MobileOptimizedAnimation.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['fade', 'slide', 'scale']),
  duration: PropTypes.number,
  delay: PropTypes.number,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

// Компонент для оптимизации памяти на мобильных устройствах
const MemoryOptimizer = ({ 
  children, 
  threshold = 100, // Количество элементов после которого начинается оптимизация
  cleanupInterval = 30000, // Интервал очистки в миллисекундах
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [itemsCount, setItemsCount] = useState(0);
  const cleanupTimerRef = useRef(null);
  const { optimizeMemory } = useMobilePerformance();
  
  // Подсчет элементов
  useEffect(() => {
    const countElements = (element) => {
      let count = 0;
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_ELEMENT,
        null,
        false
      );
      
      while (walker.nextNode()) {
        count++;
      }
      
      return count;
    };
    
    if (props.elementRef) {
      const count = countElements(props.elementRef.current);
      setItemsCount(count);
    }
  }, [props.elementRef]);
  
  // Автоматическая очистка памяти
  useEffect(() => {
    if (itemsCount > threshold) {
      cleanupTimerRef.current = setInterval(() => {
        optimizeMemory();
      }, cleanupInterval);
    }
    
    return () => {
      if (cleanupTimerRef.current) {
        clearInterval(cleanupTimerRef.current);
      }
    };
  }, [itemsCount, threshold, cleanupInterval, optimizeMemory]);
  
  // Ручная очистка памяти
  const handleCleanup = useCallback(() => {
    optimizeMemory();
  }, [optimizeMemory]);
  
  return (
    <div className={`memory-optimizer ${className}`} {...props}>
      {children}
      {itemsCount > threshold && (
        <button
          onClick={handleCleanup}
          className="fixed bottom-4 right-4 bg-red-500 text-white px-3 py-1 rounded-lg text-sm shadow-lg z-50"
        >
          Очистить память
        </button>
      )}
    </div>
  );
};

MemoryOptimizer.propTypes = {
  children: PropTypes.node.isRequired,
  threshold: PropTypes.number,
  cleanupInterval: PropTypes.number,
  className: PropTypes.string,
  elementRef: PropTypes.object,
};

// Компонент для мониторинга производительности на мобильных устройствах
const PerformanceMonitor = ({ 
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    network: 'unknown',
    devicePixelRatio: 1,
  });
  
  // Мониторинг FPS
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let fpsInterval;
    
    const updateFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setMetrics(prev => ({ ...prev, fps }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      fpsInterval = requestAnimationFrame(updateFPS);
    };
    
    fpsInterval = requestAnimationFrame(updateFPS);
    
    return () => {
      cancelAnimationFrame(fpsInterval);
    };
  }, []);
  
  // Мониторинг памяти
  useEffect(() => {
    if ('memory' in performance) {
      const updateMemory = () => {
        const memory = performance.memory;
        if (memory) {
          setMetrics(prev => ({
            ...prev,
            memory: Math.round(memory.usedJSHeapSize / 1048576), // В мегабайтах
          }));
        }
      };
      
      updateMemory();
      const interval = setInterval(updateMemory, 5000);
      
      return () => clearInterval(interval);
    }
  }, []);
  
  // Мониторинг сети
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const updateNetwork = () => {
        setMetrics(prev => ({
          ...prev,
          network: connection.effectiveType || 'unknown',
        }));
      };
      
      updateNetwork();
      connection.addEventListener('change', updateNetwork);
      
      return () => {
        connection.removeEventListener('change', updateNetwork);
      };
    }
  }, []);
  
  // Получение информации об устройстве
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      devicePixelRatio: window.devicePixelRatio || 1,
    }));
  }, []);
  
  // Определение статуса производительности
  const getPerformanceStatus = useCallback(() => {
    if (metrics.fps > 50) return 'excellent';
    if (metrics.fps > 30) return 'good';
    if (metrics.fps > 20) return 'fair';
    return 'poor';
  }, [metrics.fps]);
  
  const status = getPerformanceStatus();
  
  return (
    <div className={`performance-monitor fixed bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs p-3 rounded-lg shadow-lg z-50 ${className}`} {...props}>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>FPS:</span>
          <span className={metrics.fps < 30 ? 'text-red-400' : 'text-green-400'}>
            {metrics.fps}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Память:</span>
          <span>{metrics.memory} MB</span>
        </div>
        <div className="flex justify-between">
          <span>Сеть:</span>
          <span>{metrics.network}</span>
        </div>
        <div className="flex justify-between">
          <span>DPR:</span>
          <span>{metrics.devicePixelRatio}x</span>
        </div>
        <div className="flex justify-between">
          <span>Статус:</span>
          <span className={
            status === 'excellent' ? 'text-green-400' :
            status === 'good' ? 'text-yellow-400' :
            status === 'fair' ? 'text-orange-400' :
            'text-red-400'
          }>
            {status === 'excellent' ? 'Отлично' :
             status === 'good' ? 'Хорошо' :
             status === 'fair' ? 'Удовлетворительно' :
             'Плохо'}
          </span>
        </div>
      </div>
    </div>
  );
};

PerformanceMonitor.propTypes = {
  className: PropTypes.string,
};

export default useMobilePerformance;
export { 
  MobileOptimizedImage, 
  MobileOptimizedList, 
  MobileOptimizedAnimation, 
  MemoryOptimizer, 
  PerformanceMonitor 
};