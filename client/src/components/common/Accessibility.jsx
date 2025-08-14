import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from './ThemeProvider';
import Button from './Button';

// Компонент для управления контрастностью текста
const TextContrastController = ({ 
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [contrastMode, setContrastMode] = useState('normal'); // 'normal', 'high', 'custom'
  const [customContrast, setCustomContrast] = useState(4.5);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Применение контрастности
  useEffect(() => {
    const root = document.documentElement;
    
    switch (contrastMode) {
      case 'high':
        root.style.setProperty('--text-contrast', 'high');
        root.style.setProperty('--bg-contrast', 'high');
        break;
      case 'custom':
        root.style.setProperty('--text-contrast', customContrast);
        break;
      default:
        root.style.setProperty('--text-contrast', 'normal');
        root.style.setProperty('--bg-contrast', 'normal');
    }
  }, [contrastMode, customContrast]);
  
  return (
    <div className={`text-contrast-controller ${className}`} {...props}>
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Контрастность
        </Button>
        
        {isExpanded && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Настройки контрастности
              </h3>
              
              <div className="space-y-3">
                <Button
                  variant={contrastMode === 'normal' ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setContrastMode('normal')}
                >
                  Стандартная
                </Button>
                
                <Button
                  variant={contrastMode === 'high' ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setContrastMode('high')}
                >
                  Высокая
                </Button>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={contrastMode === 'custom' ? 'primary' : 'ghost'}
                    size="sm"
                    className="flex-1 justify-start"
                    onClick={() => setContrastMode('custom')}
                  >
                    Пользовательская
                  </Button>
                  
                  {contrastMode === 'custom' && (
                    <input
                      type="range"
                      min="3"
                      max="7"
                      step="0.1"
                      value={customContrast}
                      onChange={(e) => setCustomContrast(parseFloat(e.target.value))}
                      className="w-20"
                    />
                  )}
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Текущий уровень: {contrastMode === 'custom' ? customContrast : 'стандартный'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

TextContrastController.propTypes = {
  className: PropTypes.string,
};

// Компонент для управления размером шрифта
const FontSizeController = ({ 
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [fontSize, setFontSize] = useState('normal'); // 'small', 'normal', 'large', 'x-large'
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Применение размера шрифта
  useEffect(() => {
    const root = document.documentElement;
    
    switch (fontSize) {
      case 'small':
        root.style.setProperty('--font-size-scale', '0.875');
        break;
      case 'normal':
        root.style.setProperty('--font-size-scale', '1');
        break;
      case 'large':
        root.style.setProperty('--font-size-scale', '1.125');
        break;
      case 'x-large':
        root.style.setProperty('--font-size-scale', '1.25');
        break;
    }
  }, [fontSize]);
  
  return (
    <div className={`font-size-controller ${className}`} {...props}>
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Шрифт
        </Button>
        
        {isExpanded && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Размер шрифта
              </h3>
              
              <div className="space-y-2">
                <Button
                  variant={fontSize === 'small' ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setFontSize('small')}
                >
                  Маленький
                </Button>
                
                <Button
                  variant={fontSize === 'normal' ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setFontSize('normal')}
                >
                  Стандартный
                </Button>
                
                <Button
                  variant={fontSize === 'large' ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setFontSize('large')}
                >
                  Большой
                </Button>
                
                <Button
                  variant={fontSize === 'x-large' ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setFontSize('x-large')}
                >
                  Оочень большой
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

FontSizeController.propTypes = {
  className: PropTypes.string,
};

// Компонент для управления фокусом клавиатуры
const KeyboardFocusIndicator = ({ 
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [isActive, setIsActive] = useState(false);
  
  // Отслеживание клавиатурного фокуса
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        setIsActive(true);
      }
    };
    
    const handleMouseDown = () => {
      setIsActive(false);
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
  
  // Применение стилей к элементам с фокусом
  useEffect(() => {
    if (isActive) {
      const style = document.createElement('style');
      style.textContent = `
        *:focus {
          outline: 3px solid #3b82f6 !important;
          outline-offset: 2px !important;
        }
        *:focus:not(:focus-visible) {
          outline: none !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [isActive]);
  
  return (
    <div className={`keyboard-focus-indicator ${className}`} {...props}>
      <div className={`fixed bottom-4 right-4 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg shadow-lg transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        Режим навигации клавиатурой активен
      </div>
    </div>
  );
};

KeyboardFocusIndicator.propTypes = {
  className: PropTypes.string,
};

// Компонент для управления screen reader announcements
const ScreenReaderAnnouncer = ({ 
  message = '',
  priority = 'polite', // 'polite', 'assertive'
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const announceRef = useRef(null);
  
  // Объявление сообщения для screen reader
  useEffect(() => {
    if (message && announceRef.current) {
      announceRef.current.textContent = message;
      
      // Сброс сообщения после задержки
      const timer = setTimeout(() => {
        announceRef.current.textContent = '';
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [message]);
  
  return (
    <div 
      ref={announceRef}
      aria-live={priority}
      aria-atomic="true"
      className={`sr-only ${className}`}
      {...props}
    >
      {message}
    </div>
  );
};

ScreenReaderAnnouncer.propTypes = {
  message: PropTypes.string,
  priority: PropTypes.oneOf(['polite', 'assertive']),
  className: PropTypes.string,
};

// Компонент для управления сенсорным доступом
const TouchAccessibilityController = ({ 
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [tapTargetSize, setTapTargetSize] = useState('normal'); // 'small', 'normal', 'large'
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Применение размера тап-целей
  useEffect(() => {
    const root = document.documentElement;
    
    switch (tapTargetSize) {
      case 'small':
        root.style.setProperty('--tap-target-size', '44px');
        break;
      case 'normal':
        root.style.setProperty('--tap-target-size', '48px');
        break;
      case 'large':
        root.style.setProperty('--tap-target-size', '56px');
        break;
    }
  }, [tapTargetSize]);
  
  return (
    <div className={`touch-accessibility-controller ${className}`} {...props}>
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          Сенсорный доступ
        </Button>
        
        {isExpanded && (
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Размер элементов управления
              </h3>
              
              <div className="space-y-2">
                <Button
                  variant={tapTargetSize === 'small' ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setTapTargetSize('small')}
                >
                  Маленький
                </Button>
                
                <Button
                  variant={tapTargetSize === 'normal' ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setTapTargetSize('normal')}
                >
                  Стандартный
                </Button>
                
                <Button
                  variant={tapTargetSize === 'large' ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setTapTargetSize('large')}
                >
                  Большой
                </Button>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Размер тап-целей: {tapTargetSize === 'small' ? '44px' : tapTargetSize === 'normal' ? '48px' : '56px'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

TouchAccessibilityController.propTypes = {
  className: PropTypes.string,
};

// Компонент для управления цветовой схемой для дальтоников
// Компонент для управления цветовой схемой для дальтоников
const ColorBlindnessController = ({ 
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [colorMode, setColorMode] = useState('normal'); // 'normal', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Применение цветовой схемы
  useEffect(() => {
    const root = document.documentElement;
    
    switch (colorMode) {
      case 'protanopia':
        root.style.setProperty('--color-blind-filter', 'url(#protanopia)');
        break;
      case 'deuteranopia':
        root.style.setProperty('--color-blind-filter', 'url(#deuteranopia)');
        break;
      case 'tritanopia':
        root.style.setProperty('--color-blind-filter', 'url(#tritanopia)');
        break;
      case 'achromatopsia':
        root.style.setProperty('--color-blind-filter', 'grayscale(100%)');
        break;
      default:
        root.style.setProperty('--color-blind-filter', 'none');
    }
  }, [colorMode]);
  
  return (
    <div className={`color-blindness-controller ${className}`} {...props}>
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Цветовая схема
        </Button>
        
        {isExpanded && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Цветовая схема для дальтоников
              </h3>
              
              <div className="space-y-2">
                <Button
                  variant={colorMode === 'normal' ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setColorMode('normal')}
                >
                  Стандартная
                </Button>
                
                <Button
                  variant={colorMode === 'protanopia' ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setColorMode('protanopia')}
                >
                  Протанопия (красный)
                </Button>
                
                <Button
                  variant={colorMode === 'deuteranopia' ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setColorMode('deuteranopia')}
                >
                  Дейтеранопия (зеленый)
                </Button>
                
                <Button
                  variant={colorMode === 'tritanopia' ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setColorMode('tritanopia')}
                >
                  Тританопия (синий)
                </Button>
                
                <Button
                  variant={colorMode === 'achromatopsia' ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setColorMode('achromatopsia')}
                >
                  Ахроматопсия (ч/б)
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ColorBlindnessController.propTypes = {
  className: PropTypes.string,
};

// Компонент для управления анимациями
const AnimationController = ({ 
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [animationMode, setAnimationMode] = useState('normal'); // 'normal', 'reduced', 'none'
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Применение настроек анимации
  useEffect(() => {
    const root = document.documentElement;
    
    switch (animationMode) {
      case 'reduced':
        root.style.setProperty('--animation-speed', '0.5s');
        break;
      case 'none':
        root.style.setProperty('--animation-speed', '0s');
        break;
      default:
        root.style.setProperty('--animation-speed', '0.3s');
    }
  }, [animationMode]);
  
  return (
    <div className={`animation-controller ${className}`} {...props}>
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Анимации
        </Button>
        
        {isExpanded && (
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Настройки анимации
              </h3>
              
              <div className="space-y-2">
                <Button
                  variant={animationMode === 'normal' ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setAnimationMode('normal')}
                >
                  Стандартные
                </Button>
                
                <Button
                  variant={animationMode === 'reduced' ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setAnimationMode('reduced')}
                >
                  Уменьшенные
                </Button>
                
                <Button
                  variant={animationMode === 'none' ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setAnimationMode('none')}
                >
                  Отключить
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

AnimationController.propTypes = {
  className: PropTypes.string,
};

// Компонент-обертка для улучшения доступности
const AccessibilityWrapper = ({ 
  children, 
  ariaLabel,
  ariaDescribedBy,
  role = 'region',
  tabIndex = 0,
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      tabIndex={tabIndex}
      className={`accessibility-wrapper ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

AccessibilityWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  role: PropTypes.string,
  tabIndex: PropTypes.number,
  className: PropTypes.string,
};

// Основной компонент управления доступностью
const AccessibilityController = ({ 
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className={`accessibility-controller ${className}`} {...props}>
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
          aria-label="Настройки доступности"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Доступность
        </Button>
        
        {isExpanded && (
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Настройки доступности
              </h3>
              
              <div className="space-y-3">
                <TextContrastController />
                <FontSizeController />
                <TouchAccessibilityController />
                <ColorBlindnessController />
                <AnimationController />
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Настройки сохраняются для текущей сессии
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <KeyboardFocusIndicator />
      <ScreenReaderAnnouncer />
    </div>
  );
};

AccessibilityController.propTypes = {
  className: PropTypes.string,
};

export default AccessibilityController;
export {
  TextContrastController,
  FontSizeController,
  KeyboardFocusIndicator,
  ScreenReaderAnnouncer,
  TouchAccessibilityController,
  ColorBlindnessController,
  AnimationController,
  AccessibilityWrapper
};