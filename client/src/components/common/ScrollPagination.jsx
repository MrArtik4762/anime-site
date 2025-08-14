import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from './ThemeProvider';
import Button from './Button';
import Loading from './Loading';

// Компонент для бесшовной прокрутки с пагинацией
const ScrollPagination = ({ 
  children, 
  loadMore, 
  hasMore, 
  threshold = 200,
  loadingText = 'Загрузка...',
  endText = 'Больше контента нет',
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const scrollContainerRef = useRef(null);
  const sentinelRef = useRef(null);
  
  // Проверка, достигнут ли конец списка
  const checkEnd = useCallback(() => {
    if (!hasMore || isLoading) return;
    
    const container = scrollContainerRef.current;
    const sentinel = sentinelRef.current;
    
    if (!container || !sentinel) return;
    
    const containerRect = container.getBoundingClientRect();
    const sentinelRect = sentinel.getBoundingClientRect();
    
    // Если sentinel виден в контейнере, загружаем больше
    if (sentinelRect.top - containerRect.bottom < threshold) {
      setIsLoading(true);
      loadMore();
    }
  }, [hasMore, isLoading, threshold, loadMore]);
  
  // Обработка прокрутки
  const handleScroll = useCallback(() => {
    checkEnd();
  }, [checkEnd]);
  
  // Сброс состояния загрузки
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  // Обновление состояния конца списка
  useEffect(() => {
    setIsEnd(!hasMore);
  }, [hasMore]);
  
  // Настройка Intersection Observer для sentinel
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isLoading && hasMore) {
          setIsLoading(true);
          loadMore();
        }
      });
    }, {
      root: scrollContainerRef.current,
      rootMargin: `${threshold}px`,
      threshold: 0.1
    });
    
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    
    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [threshold, isLoading, hasMore, loadMore]);
  
  return (
    <div 
      ref={scrollContainerRef}
      className={`scroll-pagination ${className}`}
      onScroll={handleScroll}
      {...props}
    >
      {children}
      
      {/* Индикатор загрузки */}
      <div ref={sentinelRef} className="py-4 text-center">
        {isLoading && (
          <div className="flex flex-col items-center gap-2">
            <Loading size="small" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {loadingText}
            </span>
          </div>
        )}
        
        {isEnd && !isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {endText}
          </p>
        )}
      </div>
    </div>
  );
};

ScrollPagination.propTypes = {
  children: PropTypes.node.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
  threshold: PropTypes.number,
  loadingText: PropTypes.string,
  endText: PropTypes.string,
  className: PropTypes.string,
};

// Компонент для бесконечной прокрутки с кнопкой "Показать еще"
const ShowMorePagination = ({ 
  children, 
  loadMore, 
  hasMore, 
  itemsPerLoad = 12,
  initialLoad = 12,
  showMoreText = 'Показать еще',
  loadingText = 'Загрузка...',
  endText = 'Больше контента нет',
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [visibleItems, setVisibleItems] = useState(initialLoad);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  
  // Загрузка дополнительных элементов
  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    // Ожидание завершения загрузки
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setVisibleItems(prev => prev + itemsPerLoad);
    setIsLoading(false);
    
    // Проверяем, достигнут ли конец
    if (visibleItems + itemsPerLoad >= React.Children.count(children)) {
      setIsEnd(true);
    }
  }, [isLoading, hasMore, itemsPerLoad, visibleItems, children]);
  
  // Проверка, достигнут ли конец при изменении children
  useEffect(() => {
    if (React.Children.count(children) <= visibleItems) {
      setIsEnd(true);
    } else {
      setIsEnd(false);
    }
  }, [children, visibleItems]);
  
  return (
    <div className={`show-more-pagination ${className}`} {...props}>
      {/* Видимые элементы */}
      <div>
        {React.Children.toArray(children).slice(0, visibleItems)}
      </div>
      
      {/* Кнопка "Показать еще" */}
      <div className="flex justify-center mt-6">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loading size="small" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {loadingText}
            </span>
          </div>
        ) : hasMore && !isEnd ? (
          <Button
            variant="outline"
            onClick={handleLoadMore}
            className="px-6"
          >
            {showMoreText}
          </Button>
        ) : isEnd && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {endText}
          </p>
        )}
      </div>
    </div>
  );
};

ShowMorePagination.propTypes = {
  children: PropTypes.node.isRequired,
  loadMore: PropTypes.func,
  hasMore: PropTypes.bool,
  itemsPerLoad: PropTypes.number,
  initialLoad: PropTypes.number,
  showMoreText: PropTypes.string,
  loadingText: PropTypes.string,
  endText: PropTypes.string,
  className: PropTypes.string,
};

// Компонент для бесконечной прокрутки с автоматической загрузкой
const AutoScrollPagination = ({ 
  children, 
  loadMore, 
  hasMore, 
  threshold = 0.8,
  loadingText = 'Загрузка...',
  endText = 'Больше контента нет',
  debounceTime = 300,
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const containerRef = useRef(null);
  const debounceTimeout = useRef(null);
  
  // Проверка прокрутки
  const checkScroll = useCallback(() => {
    if (!hasMore || isLoading) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    // Если достигнут порог, загружаем больше
    if (scrollPercentage >= threshold) {
      setIsLoading(true);
      loadMore();
    }
  }, [hasMore, isLoading, threshold, loadMore]);
  
  // Обработка прокрутки с debounce
  const handleScroll = useCallback(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(() => {
      checkScroll();
    }, debounceTime);
  }, [checkScroll, debounceTime]);
  
  // Сброс состояния загрузки
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  // Обновление состояния конца списка
  useEffect(() => {
    setIsEnd(!hasMore);
  }, [hasMore]);
  
  return (
    <div 
      ref={containerRef}
      className={`auto-scroll-pagination ${className}`}
      onScroll={handleScroll}
      {...props}
    >
      {children}
      
      {/* Индикатор загрузки */}
      <div className="py-4 text-center">
        {isLoading && (
          <div className="flex flex-col items-center gap-2">
            <Loading size="small" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {loadingText}
            </span>
          </div>
        )}
        
        {isEnd && !isLoading && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {endText}
          </p>
        )}
      </div>
    </div>
  );
};

AutoScrollPagination.propTypes = {
  children: PropTypes.node.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
  threshold: PropTypes.number,
  loadingText: PropTypes.string,
  endText: PropTypes.string,
  debounceTime: PropTypes.number,
  className: PropTypes.string,
};

// Компонент для бесшовной прокрутки с индикатором прогресса
const ProgressScrollPagination = ({ 
  children, 
  loadMore, 
  hasMore, 
  totalItems = 0,
  threshold = 0.8,
  loadingText = 'Загрузка...',
  endText = 'Загрузка завершена',
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const containerRef = useRef(null);
  
  // Расчет прогресса
  const progress = totalItems > 0 ? (React.Children.count(children) / totalItems) * 100 : 0;
  
  // Проверка прокрутки
  const checkScroll = useCallback(() => {
    if (!hasMore || isLoading) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    // Если достигнут порог, загружаем больше
    if (scrollPercentage >= threshold) {
      setIsLoading(true);
      loadMore();
    }
  }, [hasMore, isLoading, threshold, loadMore]);
  
  // Обработка прокрутки
  const handleScroll = useCallback(() => {
    checkScroll();
  }, [checkScroll]);
  
  // Сброс состояния загрузки
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  // Обновление состояния конца списка
  useEffect(() => {
    setIsEnd(!hasMore);
  }, [hasMore]);
  
  return (
    <div className={`progress-scroll-pagination ${className}`} {...props}>
      {/* Прогресс бар */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
          <span>Прогресс загрузки</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Контейнер с прокруткой */}
      <div 
        ref={containerRef}
        className="max-h-[70vh] overflow-y-auto"
        onScroll={handleScroll}
      >
        {children}
        
        {/* Индикатор загрузки */}
        <div className="py-4 text-center">
          {isLoading && (
            <div className="flex flex-col items-center gap-2">
              <Loading size="small" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {loadingText}
              </span>
            </div>
          )}
          
          {isEnd && !isLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {endText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

ProgressScrollPagination.propTypes = {
  children: PropTypes.node.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool.isRequired,
  totalItems: PropTypes.number,
  threshold: PropTypes.number,
  loadingText: PropTypes.string,
  endText: PropTypes.string,
  className: PropTypes.string,
};

export default ScrollPagination;
export { ShowMorePagination, AutoScrollPagination, ProgressScrollPagination };