import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from './ThemeProvider';
import Skeleton from './Skeleton';

// Компонент для ленивой загрузки контента
const LazyLoad = ({ 
  children, 
  height = 200, 
  placeholder = true,
  threshold = 0.1,
  rootMargin = '0px',
  className = '',
  onLoad,
  ...props 
}) => {
  const { colors } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef(null);
  
  // Callback для Intersection Observer
  const callback = useCallback((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        setHasLoaded(true);
        if (onLoad) onLoad();
      }
    });
  }, [onLoad]);
  
  // Создание Intersection Observer
  useEffect(() => {
    if (elementRef.current && !isVisible) {
      const observer = new IntersectionObserver(callback, {
        threshold,
        rootMargin,
      });
      
      observer.observe(elementRef.current);
      
      return () => {
        observer.unobserve(elementRef.current);
      };
    }
  }, [callback, isVisible, threshold, rootMargin]);
  
  return (
    <div 
      ref={elementRef} 
      className={`lazy-load ${className}`}
      style={{ height }}
      {...props}
    >
      {isVisible ? children : placeholder && <Skeleton height={height} />}
    </div>
  );
};

LazyLoad.propTypes = {
  children: PropTypes.node.isRequired,
  height: PropTypes.number,
  placeholder: PropTypes.bool,
  threshold: PropTypes.number,
  rootMargin: PropTypes.string,
  className: PropTypes.string,
  onLoad: PropTypes.func,
};

// Компонент для бесконечной прокрутки
const InfiniteScroll = ({ 
  children, 
  hasMore, 
  loadMore, 
  threshold = 0.8,
  loadingText = 'Загрузка...',
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const observer = useRef();
  
  // Callback для Intersection Observer
  const lastElementRef = useCallback((node) => {
    if (isLoading || !hasMore) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsLoading(true);
        loadMore();
      }
    }, {
      rootMargin: '0px',
      threshold,
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, loadMore, threshold]);
  
  // Сброс состояния загрузки после завершения
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  return (
    <div className={`infinite-scroll ${className}`} {...props}>
      {children}
      
      {/* Индикатор загрузки */}
      <div ref={lastElementRef} className="py-4 text-center">
        {isLoading && (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {loadingText}
            </span>
          </div>
        )}
        
        {!hasMore && !isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Больше контента нет
          </p>
        )}
      </div>
    </div>
  );
};

InfiniteScroll.propTypes = {
  children: PropTypes.node.isRequired,
  hasMore: PropTypes.bool.isRequired,
  loadMore: PropTypes.func.isRequired,
  threshold: PropTypes.number,
  loadingText: PropTypes.string,
  className: PropTypes.string,
};

// Компонент для виртуализированного списка
const VirtualizedList = ({ 
  items, 
  itemHeight, 
  height, 
  renderItem,
  overscanCount = 5,
  className = '',
  ...props 
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  
  // Вычисляем видимую область
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscanCount);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + height) / itemHeight) + overscanCount
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  
  // Обработка прокрутки
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className={`virtualized-list ${className}`}
      style={{ height, overflowY: 'auto' }}
      onScroll={handleScroll}
      {...props}
    >
      {/* Скрытый контент для правильной высоты */}
      <div 
        style={{ 
          height: `${items.length * itemHeight}px`,
          position: 'relative'
        }}
      >
        {/* Отступ сверху для первой видимой строки */}
        <div 
          style={{ 
            height: `${startIndex * itemHeight}px`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        />
        
        {/* Видимые элементы */}
        {visibleItems.map((item, index) => (
          <div
            key={`${startIndex + index}`}
            style={{
              position: 'absolute',
              top: `${(startIndex + index) * itemHeight}px`,
              left: 0,
              right: 0,
              height: `${itemHeight}px`
            }}
          >
            {renderItem(item, startIndex + index)}
          </div>
        ))}
      </div>
    </div>
  );
};

VirtualizedList.propTypes = {
  items: PropTypes.array.isRequired,
  itemHeight: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  renderItem: PropTypes.func.isRequired,
  overscanCount: PropTypes.number,
  className: PropTypes.string,
};

// Компонент для предзагрузки изображений
const ImagePreloader = ({ 
  src, 
  alt = '', 
  className = '', 
  placeholder = true,
  onLoad,
  onError,
  ...props 
}) => {
  const { colors } = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isPreloading, setIsPreloading] = useState(true);
  
  // Предзагрузка изображения
  useEffect(() => {
    if (!src) return;
    
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageLoaded(true);
      setIsPreloading(false);
      if (onLoad) onLoad();
    };
    
    img.onerror = () => {
      setImageError(true);
      setIsPreloading(false);
      if (onError) onError();
    };
  }, [src, onLoad, onError]);
  
  if (imageError) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}>
        <Icon name="image" size={24} color={colors.text.tertiary} />
      </div>
    );
  }
  
  return (
    <div className={`relative overflow-hidden ${className}`} {...props}>
      {isPreloading && placeholder && (
        <Skeleton className="absolute inset-0" />
      )}
      
      {imageLoaded && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isPreloading ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}
    </div>
  );
};

ImagePreloader.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
  placeholder: PropTypes.bool,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

// Компонент для предзагрузки ресурсов
const ResourcePreloader = ({ 
  resources, 
  type = 'image', 
  onLoad,
  onError,
  className = '',
  ...props 
}) => {
  const [loadedCount, setLoadedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const totalResources = resources.length;
  
  // Предзагрузка ресурсов
  useEffect(() => {
    if (totalResources === 0) return;
    
    let loaded = 0;
    let errors = 0;
    
    const handleLoad = () => {
      loaded++;
      setLoadedCount(loaded);
      if (loaded + errors === totalResources && onLoad) {
        onLoad();
      }
    };
    
    const handleError = () => {
      errors++;
      setErrorCount(errors);
      if (loaded + errors === totalResources && onError) {
        onError();
      }
    };
    
    resources.forEach((resource) => {
      if (type === 'image') {
        const img = new Image();
        img.src = resource;
        img.onload = handleLoad;
        img.onerror = handleError;
      } else if (type === 'script') {
        const script = document.createElement('script');
        script.src = resource;
        script.onload = handleLoad;
        script.onerror = handleError;
        document.head.appendChild(script);
      } else if (type === 'style') {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = resource;
        link.onload = handleLoad;
        link.onerror = handleError;
        document.head.appendChild(link);
      }
    });
  }, [resources, type, totalResources, onLoad, onError]);
  
  return (
    <div className={`resource-preloader ${className}`} {...props}>
      {totalResources > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Предзагрузка: {loadedCount}/{totalResources} 
          {errorCount > 0 && ` (${errorCount} ошибок)`}
        </div>
      )}
    </div>
  );
};

ResourcePreloader.propTypes = {
  resources: PropTypes.arrayOf(PropTypes.string).isRequired,
  type: PropTypes.oneOf(['image', 'script', 'style']),
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  className: PropTypes.string,
};

export default LazyLoad;
export { InfiniteScroll, VirtualizedList, ImagePreloader, ResourcePreloader };