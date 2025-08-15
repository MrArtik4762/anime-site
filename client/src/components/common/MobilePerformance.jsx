import React, { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { useResponsive } from './Responsive';

// Компонент для оптимизации производительности на мобильных устройствах
const MobilePerformance = memo(({ 
  children, 
  fallback = null, 
  threshold = 0.1,
  rootMargin = '50px',
  enableIntersectionObserver = true
}) => {
  const { isMobile } = useResponsive();
  const [isVisible, setIsVisible] = useState(!isMobile);
  const [hasIntersected, setHasIntersected] = useState(false);
  
  useEffect(() => {
    if (!isMobile || !enableIntersectionObserver) {
      setIsVisible(true);
      return;
    }
    
    // Intersection Observer для ленивой загрузки на мобильных устройствах
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasIntersected(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );
    
    const element = document.getElementById('mobile-performance-element');
    if (element) {
      observer.observe(element);
    }
    
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [isMobile, threshold, rootMargin, enableIntersectionObserver]);
  
  if (!isMobile) {
    return children;
  }
  
  if (!isVisible && enableIntersectionObserver) {
    return (
      <div 
        id="mobile-performance-element"
        style={{ minHeight: '100px' }}
      >
        {fallback}
      </div>
    );
  }
  
  return children;
});

MobilePerformance.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  threshold: PropTypes.number,
  rootMargin: PropTypes.string,
  enableIntersectionObserver: PropTypes.bool,
};

// Компонент для оптимизации изображений на мобильных устройствах
export const OptimizedImage = memo(({ 
  src, 
  alt, 
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=',
  fallbackSrc,
  loading = 'lazy',
  ...props
}) => {
  const { isMobile } = useResponsive();
  const [imageSrc, setImageSrc] = useState(isMobile ? placeholder : src);
  const [hasError, setHasError] = useState(false);
  
  const handleImageError = () => {
    if (!hasError && fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    } else {
      setImageSrc(placeholder);
    }
  };
  
  const handleLoad = () => {
    // Изображение загружено успешно
  };
  
  return (
    <img
      src={imageSrc}
      alt={alt}
      loading={loading}
      onError={handleImageError}
      onLoad={handleLoad}
      style={{
        transition: 'opacity 0.3s ease',
        opacity: imageSrc === placeholder ? 0.7 : 1
      }}
      {...props}
    />
  );
});

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  fallbackSrc: PropTypes.string,
  loading: PropTypes.oneOf(['lazy', 'eager']),
};

// Компонент для виртуализированного списка на мобильных устройствах
export const VirtualizedList = memo(({ 
  items, 
  renderItem, 
  itemHeight = 80,
  containerHeight = 400,
  overscanCount = 5
}) => {
  const { isMobile } = useResponsive();
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState(null);
  
  if (!isMobile) {
    return (
      <div style={{ height: containerHeight, overflow: 'auto' }}>
        {items.map((item, index) => (
          <div key={index} style={{ height: itemHeight }}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }
  
  // Расчет видимых элементов
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscanCount);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscanCount
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };
  
  return (
    <div
      ref={setContainerRef}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      {/* Смещение для невидимых элементов */}
      <div style={{ height: startIndex * itemHeight }} />
      
      {/* Видимые элементы */}
      {visibleItems.map((item, index) => (
        <div
          key={startIndex + index}
          style={{
            position: 'absolute',
            top: (startIndex + index) * itemHeight,
            width: '100%',
            height: itemHeight
          }}
        >
          {renderItem(item, startIndex + index)}
        </div>
      ))}
    </div>
  );
});

VirtualizedList.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  itemHeight: PropTypes.number,
  containerHeight: PropTypes.number,
  overscanCount: PropTypes.number,
};

// Компонент для отложенной загрузки контента на мобильных устройствах
export const LazyLoad = memo(({ 
  children, 
  placeholder = null,
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const { isMobile } = useResponsive();
  const [isVisible, setIsVisible] = useState(!isMobile);
  
  useEffect(() => {
    if (!isMobile) {
      setIsVisible(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );
    
    const element = document.getElementById('lazyload-element');
    if (element) {
      observer.observe(element);
    }
    
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [isMobile, threshold, rootMargin]);
  
  if (!isVisible) {
    return (
      <div id="lazyload-element">
        {placeholder || (
          <div style={{ 
            minHeight: '100px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <div className="animate-pulse">Загрузка...</div>
          </div>
        )}
      </div>
    );
  }
  
  return children;
});

LazyLoad.propTypes = {
  children: PropTypes.node.isRequired,
  placeholder: PropTypes.node,
  threshold: PropTypes.number,
  rootMargin: PropTypes.string,
};

// Компонент для оптимизации жестов на мобильных устройствах
export const TouchGestures = memo(({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeUp, 
  onSwipeDown,
  swipeThreshold = 50,
  preventDefault = true
}) => {
  const { isMobile } = useResponsive();
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  if (!isMobile) {
    return children;
  }
  
  const handleTouchStart = (e) => {
    if (preventDefault) {
      e.preventDefault();
    }
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    if (preventDefault) {
      e.preventDefault();
    }
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > swipeThreshold;
    const isRightSwipe = distance < -swipeThreshold;
    
    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    } else if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
    
    // Для вертикальных свайпов
    const touchStartY = touchStart;
    const touchEndY = touchEnd;
    const verticalDistance = touchStartY - touchEndY;
    
    if (verticalDistance > swipeThreshold && onSwipeUp) {
      onSwipeUp();
    } else if (verticalDistance < -swipeThreshold && onSwipeDown) {
      onSwipeDown();
    }
  };
  
  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: preventDefault ? 'none' : 'auto' }}
    >
      {children}
    </div>
  );
});

TouchGestures.propTypes = {
  children: PropTypes.node.isRequired,
  onSwipeLeft: PropTypes.func,
  onSwipeRight: PropTypes.func,
  onSwipeUp: PropTypes.func,
  onSwipeDown: PropTypes.func,
  swipeThreshold: PropTypes.number,
  preventDefault: PropTypes.bool,
};

// Компонент для оптимизации анимаций на мобильных устройствах
export const OptimizedAnimation = memo(({ 
  children, 
  animation, 
  disabled = false,
  reduceMotion = false
}) => {
  const { isMobile } = useResponsive();
  const [shouldAnimate, setShouldAnimate] = useState(!isMobile);
  
  useEffect(() => {
    if (reduceMotion) {
      setShouldAnimate(false);
      return;
    }
    
    if (!isMobile) {
      setShouldAnimate(true);
      return;
    }
    
    // Проверка поддержки prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setShouldAnimate(false);
    } else {
      setShouldAnimate(true);
    }
  }, [isMobile, reduceMotion]);
  
  if (disabled || !shouldAnimate) {
    return children;
  }
  
  return (
    <div style={{ animation }}>
      {children}
    </div>
  );
});

OptimizedAnimation.propTypes = {
  children: PropTypes.node.isRequired,
  animation: PropTypes.string,
  disabled: PropTypes.bool,
  reduceMotion: PropTypes.bool,
};

export default MobilePerformance;