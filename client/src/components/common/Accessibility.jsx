import React, { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { useResponsive } from './Responsive';

// Компонент для управления размером шрифта
export const FontSizeController = memo(({ 
  children, 
  initialSize = 'medium',
  minSize = 'xsmall',
  maxSize = 'xlarge',
  step = 1
}) => {
  const { isMobile } = useResponsive();
  const [fontSize, setFontSize] = useState(initialSize);
  
  // Размеры шрифта в rem
  const fontSizes = {
    xsmall: '0.75rem',
    small: '0.875rem',
    medium: '1rem',
    large: '1.125rem',
    xlarge: '1.25rem'
  };
  
  const increaseFontSize = () => {
    const sizes = Object.keys(fontSizes);
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex < sizes.length - 1) {
      setFontSize(sizes[currentIndex + step]);
    }
  };
  
  const decreaseFontSize = () => {
    const sizes = Object.keys(fontSizes);
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex > 0) {
      setFontSize(sizes[currentIndex - step]);
    }
  };
  
  const resetFontSize = () => {
    setFontSize(initialSize);
  };
  
  return (
    <div style={{ fontSize: fontSizes[fontSize] }}>
      {children}
    </div>
  );
});

FontSizeController.propTypes = {
  children: PropTypes.node.isRequired,
  initialSize: PropTypes.oneOf(['xsmall', 'small', 'medium', 'large', 'xlarge']),
  minSize: PropTypes.oneOf(['xsmall', 'small', 'medium', 'large', 'xlarge']),
  maxSize: PropTypes.oneOf(['xsmall', 'small', 'medium', 'large', 'xlarge']),
  step: PropTypes.number,
};

// Компонент для управления контрастностью
export const TextContrastChecker = memo(({ 
  children, 
  backgroundColor = '#FFFFFF',
  textColor = '#000000',
  minContrast = 4.5
}) => {
  const [contrastRatio, setContrastRatio] = useState(0);
  const [isAccessible, setIsAccessible] = useState(false);
  
  useEffect(() => {
    // Расчет контрастности
    const getContrastRatio = (color1, color2) => {
      const luminance1 = getLuminance(color1);
      const luminance2 = getLuminance(color2);
      
      const lighter = Math.max(luminance1, luminance2);
      const darker = Math.min(luminance1, luminance2);
      
      return (lighter + 0.05) / (darker + 0.05);
    };
    
    const getLuminance = (color) => {
      // Упрощенный расчет яркости
      const rgb = hexToRgb(color);
      if (!rgb) return 0;
      
      const { r, g, b } = rgb;
      const rsRGB = r / 255;
      const gsRGB = g / 255;
      const bsRGB = b / 255;
      
      const r2 = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
      const g2 = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
      const b2 = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
      
      return 0.2126 * r2 + 0.7152 * g2 + 0.0722 * b2;
    };
    
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    
    const ratio = getContrastRatio(backgroundColor, textColor);
    setContrastRatio(ratio);
    setIsAccessible(ratio >= minContrast);
  }, [backgroundColor, textColor, minContrast]);
  
  return (
    <div 
      style={{ 
        backgroundColor, 
        color: textColor,
        position: 'relative'
      }}
    >
      {children}
      {process.env.NODE_ENV === 'development' && (
        <div 
          style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            fontSize: '10px',
            padding: '2px 4px',
            backgroundColor: isAccessible ? 'green' : 'red',
            color: 'white',
            borderRadius: '3px'
          }}
        >
          {contrastRatio.toFixed(2)}:1
        </div>
      )}
    </div>
  );
});

TextContrastChecker.propTypes = {
  children: PropTypes.node.isRequired,
  backgroundColor: PropTypes.string,
  textColor: PropTypes.string,
  minContrast: PropTypes.number,
};

// Компонент для управления навигацией с клавиатуры
export const KeyboardNavigation = memo(({ 
  children, 
  items = [],
  onItemSelect,
  wrapNavigation = true,
  activeIndex = 0
}) => {
  const [currentIndex, setCurrentIndex] = useState(activeIndex);
  
  const handleKeyDown = (e) => {
    const lastIndex = items.length - 1;
    
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        setCurrentIndex(prev => {
          const nextIndex = prev + 1;
          return nextIndex > lastIndex && wrapNavigation ? 0 : Math.min(nextIndex, lastIndex);
        });
        break;
        
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        setCurrentIndex(prev => {
          const nextIndex = prev - 1;
          return nextIndex < 0 && wrapNavigation ? lastIndex : Math.max(nextIndex, 0);
        });
        break;
        
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (onItemSelect && items[currentIndex]) {
          onItemSelect(items[currentIndex], currentIndex);
        }
        break;
        
      case 'Home':
        e.preventDefault();
        setCurrentIndex(0);
        break;
        
      case 'End':
        e.preventDefault();
        setCurrentIndex(lastIndex);
        break;
        
      default:
        break;
    }
  };
  
  return (
    <div 
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="navigation"
      aria-label="Клавиатурная навигация"
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isActive: index === currentIndex,
            tabIndex: index === currentIndex ? 0 : -1,
            'aria-current': index === currentIndex ? 'true' : undefined,
            'aria-posinset': index + 1,
            'aria-setsize': items.length
          });
        }
        return child;
      })}
    </div>
  );
});

KeyboardNavigation.propTypes = {
  children: PropTypes.node.isRequired,
  items: PropTypes.array,
  onItemSelect: PropTypes.func,
  wrapNavigation: PropTypes.bool,
  activeIndex: PropTypes.number,
};

// Компонент для управления фокусом
export const FocusTrap = memo(({ children, active = true }) => {
  const [firstFocusableElement, setFirstFocusableElement] = useState(null);
  const [lastFocusableElement, setLastFocusableElement] = useState(null);
  
  useEffect(() => {
    if (!active) return;
    
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      setFirstFocusableElement(focusableElements[0]);
      setLastFocusableElement(focusableElements[focusableElements.length - 1]);
    }
    
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          e.preventDefault();
          lastFocusableElement?.focus();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          e.preventDefault();
          firstFocusableElement?.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Установка фокуса на первый элемент
    firstFocusableElement?.focus();
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, firstFocusableElement, lastFocusableElement]);
  
  if (!active) {
    return children;
  }
  
  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      {children}
    </div>
  );
});

FocusTrap.propTypes = {
  children: PropTypes.node.isRequired,
  active: PropTypes.bool,
};

// Компонент для скрытия контента от визуальных читалок
export const ScreenReaderContent = memo(({ children, as = 'span' }) => {
  const Component = as;
  
  return (
    <Component
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: '0'
      }}
    >
      {children}
    </Component>
  );
});

ScreenReaderContent.propTypes = {
  children: PropTypes.node.isRequired,
  as: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.elementType
  ]),
};

// Компонент для улучшения доступности изображений
export const AccessibleImage = memo(({ 
  src, 
  alt, 
  fallbackAlt, 
  title,
  decorative = false,
  ...props
}) => {
  if (decorative) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden="true"
        {...props}
      />
    );
  }
  
  return (
    <img
      src={src}
      alt={alt || fallbackAlt}
      title={title}
      {...props}
    />
  );
});

AccessibleImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  fallbackAlt: PropTypes.string,
  title: PropTypes.string,
  decorative: PropTypes.bool,
};

// Компонент для улучшения доступности ссылок
export const AccessibleLink = memo(({ 
  children, 
  href, 
  external = false,
  newWindow = false,
  ...props
}) => {
  const linkProps = {
    ...props,
    href,
    rel: external ? 'noopener noreferrer' : undefined,
    target: newWindow ? '_blank' : undefined,
    'aria-label': typeof children === 'string' ? children : undefined
  };
  
  return (
    <a {...linkProps}>
      {children}
      {external && (
        <ScreenReaderContent>
          (открывается в новом окне)
        </ScreenReaderContent>
      )}
    </a>
  );
});

AccessibleLink.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string.isRequired,
  external: PropTypes.bool,
  newWindow: PropTypes.bool,
};

// Хук для управления состоянием высокой контрастности
export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  
  useEffect(() => {
    const checkHighContrast = () => {
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      setIsHighContrast(prefersHighContrast);
    };
    
    checkHighContrast();
    
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    mediaQuery.addEventListener('change', checkHighContrast);
    
    return () => {
      mediaQuery.removeEventListener('change', checkHighContrast);
    };
  }, []);
  
  return isHighContrast;
};

// Хук для управления состоянием уменьшенного движения
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const checkReducedMotion = () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setPrefersReducedMotion(reducedMotion);
    };
    
    checkReducedMotion();
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', checkReducedMotion);
    
    return () => {
      mediaQuery.removeEventListener('change', checkReducedMotion);
    };
  }, []);
  
  return prefersReducedMotion;
};

// Компонент-обертка для улучшения доступности
export const AccessibilityWrapper = memo(({ 
  children, 
  id,
  role,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  tabIndex,
  ...props
}) => {
  const wrapperProps = {
    ...props,
    id,
    role,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    tabIndex
  };
  
  return (
    <div {...wrapperProps}>
      {children}
    </div>
  );
});

AccessibilityWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  id: PropTypes.string,
  role: PropTypes.string,
  'aria-label': PropTypes.string,
  'aria-labelledby': PropTypes.string,
  'aria-describedby': PropTypes.string,
  tabIndex: PropTypes.number,
};

export default {
  FontSizeController,
  TextContrastChecker,
  KeyboardNavigation,
  FocusTrap,
  ScreenReaderContent,
  AccessibleImage,
  AccessibleLink,
  useHighContrast,
  useReducedMotion,
  AccessibilityWrapper,
};