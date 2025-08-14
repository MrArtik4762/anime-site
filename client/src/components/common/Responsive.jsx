import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from './ThemeProvider';
import Button from './Button';

// Хук для получения текущего размера экрана
const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState({
    isXs: false,
    isSm: false,
    isMd: false,
    isLg: false,
    isXl: false,
    is2xl: false,
    width: 0,
    height: 0,
  });
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setBreakpoint({
        isXs: width < 640,
        isSm: width >= 640 && width < 768,
        isMd: width >= 768 && width < 1024,
        isLg: width >= 1024 && width < 1280,
        isXl: width >= 1280 && width < 1536,
        is2xl: width >= 1536,
        width,
        height,
      });
    };
    
    // Инициализация при монтировании
    handleResize();
    
    // Добавление обработчика события
    window.addEventListener('resize', handleResize);
    
    // Очистка при размонтировании
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return breakpoint;
};

// Компонент для адаптивного контейнера
const ResponsiveContainer = ({ 
  children, 
  className = '',
  xs,
  sm,
  md,
  lg,
  xl,
  xxl,
  ...props 
}) => {
  const breakpoint = useBreakpoint();
  const containerRef = useRef(null);
  
  // Определение текущего размера контейнера
  const getCurrentSize = useCallback(() => {
    if (breakpoint.isXs && xs) return xs;
    if (breakpoint.isSm && sm) return sm;
    if (breakpoint.isMd && md) return md;
    if (breakpoint.isLg && lg) return lg;
    if (breakpoint.isXl && xl) return xl;
    if (breakpoint.is2xl && xxl) return xxl;
    return 'full'; // Размер по умолчанию
  }, [breakpoint, xs, sm, md, lg, xl, xxl]);
  
  const currentSize = getCurrentSize();
  
  // Определение классов для текущего размера
  const getSizeClasses = useCallback((size) => {
    switch (size) {
      case 'xs':
        return 'max-w-xs mx-auto';
      case 'sm':
        return 'max-w-sm mx-auto';
      case 'md':
        return 'max-w-md mx-auto';
      case 'lg':
        return 'max-w-lg mx-auto';
      case 'xl':
        return 'max-w-xl mx-auto';
      case '2xl':
        return 'max-w-2xl mx-auto';
      case '3xl':
        return 'max-w-3xl mx-auto';
      case '4xl':
        return 'max-w-4xl mx-auto';
      case '5xl':
        return 'max-w-5xl mx-auto';
      case '6xl':
        return 'max-w-6xl mx-auto';
      case '7xl':
        return 'max-w-7xl mx-auto';
      case 'full':
        return 'w-full';
      default:
        return 'w-full';
    }
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className={`${getSizeClasses(currentSize)} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

ResponsiveContainer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  xs: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'full']),
  sm: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'full']),
  md: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'full']),
  lg: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'full']),
  xl: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'full']),
  xxl: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'full']),
};

// Компонент для адаптивной сетки
const ResponsiveGrid = ({ 
  children, 
  className = '',
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 },
  gap = { xs: 4, sm: 6, md: 8 },
  ...props 
}) => {
  const breakpoint = useBreakpoint();
  
  // Определение количества колонок для текущего размера
  const getCurrentCols = useCallback(() => {
    if (breakpoint.isXs) return cols.xs || 1;
    if (breakpoint.isSm) return cols.sm || 2;
    if (breakpoint.isMd) return cols.md || 3;
    if (breakpoint.isLg) return cols.lg || 4;
    if (breakpoint.isXl) return cols.xl || 5;
    if (breakpoint.is2xl) return cols.xxl || 6;
    return 1; // Значение по умолчанию
  }, [breakpoint, cols]);
  
  // Определение промежутков для текущего размера
  const getCurrentGap = useCallback(() => {
    if (breakpoint.isXs) return gap.xs || 4;
    if (breakpoint.isSm) return gap.sm || 6;
    if (breakpoint.isMd) return gap.md || 8;
    if (breakpoint.isLg) return gap.lg || 8;
    if (breakpoint.isXl) return gap.xl || 8;
    if (breakpoint.is2xl) return gap.xxl || 8;
    return 4; // Значение по умолчанию
  }, [breakpoint, gap]);
  
  const currentCols = getCurrentCols();
  const currentGap = getCurrentGap();
  
  return (
    <div 
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${currentCols}, minmax(0, 1fr))`,
        gap: `${currentGap}px`,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

ResponsiveGrid.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  cols: PropTypes.shape({
    xs: PropTypes.number,
    sm: PropTypes.number,
    md: PropTypes.number,
    lg: PropTypes.number,
    xl: PropTypes.number,
    xxl: PropTypes.number,
  }),
  gap: PropTypes.shape({
    xs: PropTypes.number,
    sm: PropTypes.number,
    md: PropTypes.number,
    lg: PropTypes.number,
    xl: PropTypes.number,
    xxl: PropTypes.number,
  }),
};

// Компонент для адаптивного отступа
const ResponsiveSpacing = ({ 
  children, 
  className = '',
  top,
  right,
  bottom,
  left,
  all,
  ...props 
}) => {
  const breakpoint = useBreakpoint();
  
  // Определение отступов для текущего размера
  const getSpacing = useCallback((size) => {
    if (all) return all[size] || all;
    if (top) return top[size] || top;
    if (right) return right[size] || right;
    if (bottom) return bottom[size] || bottom;
    if (left) return left[size] || left;
    return 0; // Значение по умолчанию
  }, [all, top, right, bottom, left]);
  
  const spacing = {
    top: getSpacing('xs'),
    right: getSpacing('xs'),
    bottom: getSpacing('xs'),
    left: getSpacing('xs'),
  };
  
  if (breakpoint.isSm) {
    spacing.top = getSpacing('sm');
    spacing.right = getSpacing('sm');
    spacing.bottom = getSpacing('sm');
    spacing.left = getSpacing('sm');
  }
  
  if (breakpoint.isMd) {
    spacing.top = getSpacing('md');
    spacing.right = getSpacing('md');
    spacing.bottom = getSpacing('md');
    spacing.left = getSpacing('md');
  }
  
  if (breakpoint.isLg) {
    spacing.top = getSpacing('lg');
    spacing.right = getSpacing('lg');
    spacing.bottom = getSpacing('lg');
    spacing.left = getSpacing('lg');
  }
  
  if (breakpoint.isXl) {
    spacing.top = getSpacing('xl');
    spacing.right = getSpacing('xl');
    spacing.bottom = getSpacing('xl');
    spacing.left = getSpacing('xl');
  }
  
  if (breakpoint.is2xl) {
    spacing.top = getSpacing('xxl');
    spacing.right = getSpacing('xxl');
    spacing.bottom = getSpacing('xxl');
    spacing.left = getSpacing('xxl');
  }
  
  const spacingStyle = {
    paddingTop: `${spacing.top}px`,
    paddingRight: `${spacing.right}px`,
    paddingBottom: `${spacing.bottom}px`,
    paddingLeft: `${spacing.left}px`,
  };
  
  return (
    <div 
      className={className}
      style={spacingStyle}
      {...props}
    >
      {children}
    </div>
  );
};

ResponsiveSpacing.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  top: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      xs: PropTypes.number,
      sm: PropTypes.number,
      md: PropTypes.number,
      lg: PropTypes.number,
      xl: PropTypes.number,
      xxl: PropTypes.number,
    }),
  ]),
  right: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      xs: PropTypes.number,
      sm: PropTypes.number,
      md: PropTypes.number,
      lg: PropTypes.number,
      xl: PropTypes.number,
      xxl: PropTypes.number,
    }),
  ]),
  bottom: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      xs: PropTypes.number,
      sm: PropTypes.number,
      md: PropTypes.number,
      lg: PropTypes.number,
      xl: PropTypes.number,
      xxl: PropTypes.number,
    }),
  ]),
  left: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      xs: PropTypes.number,
      sm: PropTypes.number,
      md: PropTypes.number,
      lg: PropTypes.number,
      xl: PropTypes.number,
      xxl: PropTypes.number,
    }),
  ]),
  all: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      xs: PropTypes.number,
      sm: PropTypes.number,
      md: PropTypes.number,
      lg: PropTypes.number,
      xl: PropTypes.number,
      xxl: PropTypes.number,
    }),
  ]),
};

// Компонент для адаптивного текста
const ResponsiveText = ({ 
  children, 
  className = '',
  size = { xs: 'text-sm', sm: 'text-base', md: 'text-lg', lg: 'text-xl', xl: 'text-2xl', xxl: 'text-3xl' },
  weight = { xs: 'font-normal', sm: 'font-medium', md: 'font-semibold', lg: 'font-bold' },
  ...props 
}) => {
  const breakpoint = useBreakpoint();
  
  // Определение размера текста для текущего размера
  const getCurrentSize = useCallback(() => {
    if (breakpoint.isXs) return size.xs || 'text-sm';
    if (breakpoint.isSm) return size.sm || 'text-base';
    if (breakpoint.isMd) return size.md || 'text-lg';
    if (breakpoint.isLg) return size.lg || 'text-xl';
    if (breakpoint.isXl) return size.xl || 'text-2xl';
    if (breakpoint.is2xl) return size.xxl || 'text-3xl';
    return 'text-base'; // Значение по умолчанию
  }, [breakpoint, size]);
  
  // Определение веса текста для текущего размера
  const getCurrentWeight = useCallback(() => {
    if (breakpoint.isXs) return weight.xs || 'font-normal';
    if (breakpoint.isSm) return weight.sm || 'font-medium';
    if (breakpoint.isMd) return weight.md || 'font-semibold';
    if (breakpoint.isLg) return weight.lg || 'font-bold';
    if (breakpoint.isXl) return weight.xl || 'font-bold';
    if (breakpoint.is2xl) return weight.xxl || 'font-bold';
    return 'font-normal'; // Значение по умолчанию
  }, [breakpoint, weight]);
  
  const currentSize = getCurrentSize();
  const currentWeight = getCurrentWeight();
  
  return (
    <div 
      className={`${currentSize} ${currentWeight} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

ResponsiveText.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  size: PropTypes.shape({
    xs: PropTypes.string,
    sm: PropTypes.string,
    md: PropTypes.string,
    lg: PropTypes.string,
    xl: PropTypes.string,
    xxl: PropTypes.string,
  }),
  weight: PropTypes.shape({
    xs: PropTypes.string,
    sm: PropTypes.string,
    md: PropTypes.string,
    lg: PropTypes.string,
    xl: PropTypes.string,
    xxl: PropTypes.string,
  }),
};

// Компонент для адаптивной кнопки
const ResponsiveButton = ({ 
  children, 
  className = '',
  size = { xs: 'sm', sm: 'sm', md: 'md', lg: 'md', xl: 'lg', xxl: 'lg' },
  ...props 
}) => {
  const breakpoint = useBreakpoint();
  
  // Определение размера кнопки для текущего размера
  const getCurrentSize = useCallback(() => {
    if (breakpoint.isXs) return size.xs || 'sm';
    if (breakpoint.isSm) return size.sm || 'sm';
    if (breakpoint.isMd) return size.md || 'md';
    if (breakpoint.isLg) return size.lg || 'md';
    if (breakpoint.isXl) return size.xl || 'lg';
    if (breakpoint.is2xl) return size.xxl || 'lg';
    return 'md'; // Значение по умолчанию
  }, [breakpoint, size]);
  
  const currentSize = getCurrentSize();
  
  return (
    <Button 
      size={currentSize}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
};

ResponsiveButton.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  size: PropTypes.shape({
    xs: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
    sm: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
    md: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
    lg: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
    xl: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
    xxl: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  }),
};

// Компонент для адаптивного изображения
const ResponsiveImage = ({ 
  src, 
  alt = '', 
  className = '',
  sizes = { xs: '100vw', sm: '50vw', md: '33vw', lg: '25vw', xl: '20vw', xxl: '16vw' },
  ...props 
}) => {
  const breakpoint = useBreakpoint();
  
  // Определение размеров изображения для текущего размера
  const getCurrentSize = useCallback(() => {
    if (breakpoint.isXs) return sizes.xs || '100vw';
    if (breakpoint.isSm) return sizes.sm || '50vw';
    if (breakpoint.isMd) return sizes.md || '33vw';
    if (breakpoint.isLg) return sizes.lg || '25vw';
    if (breakpoint.isXl) return sizes.xl || '20vw';
    if (breakpoint.is2xl) return sizes.xxl || '16vw';
    return '100vw'; // Значение по умолчанию
  }, [breakpoint, sizes]);
  
  const currentSize = getCurrentSize();
  
  return (
    <img 
      src={src}
      alt={alt}
      className={`w-full h-auto object-cover ${className}`}
      sizes={currentSize}
      {...props}
    />
  );
};

ResponsiveImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
  sizes: PropTypes.shape({
    xs: PropTypes.string,
    sm: PropTypes.string,
    md: PropTypes.string,
    lg: PropTypes.string,
    xl: PropTypes.string,
    xxl: PropTypes.string,
  }),
};

// Компонент для адаптивного видео
const ResponsiveVideo = ({ 
  src, 
  controls = true,
  autoplay = false,
  muted = true,
  loop = false,
  className = '',
  ...props 
}) => {
  const breakpoint = useBreakpoint();
  
  return (
    <video 
      className={`w-full h-auto object-cover ${className}`}
      controls={controls}
      autoplay={autoplay}
      muted={muted}
      loop={loop}
      {...props}
    >
      <source src={src} type="video/mp4" />
      Ваш браузер не поддерживает видео.
    </video>
  );
};

ResponsiveVideo.propTypes = {
  src: PropTypes.string.isRequired,
  controls: PropTypes.bool,
  autoplay: PropTypes.bool,
  muted: PropTypes.bool,
  loop: PropTypes.bool,
  className: PropTypes.string,
};

// Компонент для отображения текущего размера экрана (для отладки)
const BreakpointIndicator = ({ className = '', ...props }) => {
  const breakpoint = useBreakpoint();
  
  const getBreakpointName = () => {
    if (breakpoint.isXs) return 'XS (<640px)';
    if (breakpoint.isSm) return 'SM (640-768px)';
    if (breakpoint.isMd) return 'MD (768-1024px)';
    if (breakpoint.isLg) return 'LG (1024-1280px)';
    if (breakpoint.isXl) return 'XL (1280-1536px)';
    if (breakpoint.is2xl) return '2XL (≥1536px)';
    return 'Unknown';
  };
  
  return (
    <div 
      className={`fixed bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs px-3 py-2 rounded-lg z-50 ${className}`}
      {...props}
    >
      <div>{getBreakpointName()}</div>
      <div>{breakpoint.width} × {breakpoint.height}</div>
    </div>
  );
};

BreakpointIndicator.propTypes = {
  className: PropTypes.string,
};

export default ResponsiveContainer;
export { 
  useBreakpoint, 
  ResponsiveGrid, 
  ResponsiveSpacing, 
  ResponsiveText, 
  ResponsiveButton, 
  ResponsiveImage, 
  ResponsiveVideo,
  BreakpointIndicator 
};