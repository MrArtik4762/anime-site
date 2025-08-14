import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from './ThemeProvider';
import Button from './Button';

// Хук для отслеживания жестов
const useTouchGestures = (options = {}) => {
  const {
    threshold = 50,
    velocityThreshold = 0.5,
    longPressDelay = 500,
    doubleTapDelay = 300,
  } = options;
  
  const [gestures, setGestures] = useState({
    touchStart: null,
    touchEnd: null,
    isLongPress: false,
    isDoubleTap: false,
    lastTap: 0,
  });
  
  const touchTimeoutRef = useRef(null);
  const longPressTimeoutRef = useRef(null);
  
  // Обработчик начала касания
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    setGestures(prev => ({
      ...prev,
      touchStart: { x: touch.clientX, y: touch.clientY },
      touchEnd: null,
      isLongPress: false,
    }));
    
    // Проверка на двойное нажатие
    const now = Date.now();
    if (now - prev.lastTap < doubleTapDelay) {
      setGestures(prev => ({
        ...prev,
        isDoubleTap: true,
        lastTap: 0,
      }));
      
      // Сброс двойного нажатия после задержки
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = setTimeout(() => {
        setGestures(prev => ({ ...prev, isDoubleTap: false }));
      }, 100);
    } else {
      setGestures(prev => ({ ...prev, lastTap: now }));
    }
    
    // Запуск таймера для долгого нажатия
    clearTimeout(longPressTimeoutRef.current);
    longPressTimeoutRef.current = setTimeout(() => {
      setGestures(prev => ({ ...prev, isLongPress: true }));
    }, longPressDelay);
  }, [doubleTapDelay, longPressDelay]);
  
  // Обработчик движения касания
  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0];
    setGestures(prev => ({
      ...prev,
      touchEnd: { x: touch.clientX, y: touch.clientY },
    }));
    
    // Отмена долгого нажатия при движении
    if (prev.touchStart) {
      const deltaX = touch.clientX - prev.touchStart.x;
      const deltaY = touch.clientY - prev.touchStart.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance > threshold) {
        clearTimeout(longPressTimeoutRef.current);
        setGestures(prev => ({ ...prev, isLongPress: false }));
      }
    }
  }, [threshold]);
  
  // Обработчик окончания касания
  const handleTouchEnd = useCallback(() => {
    clearTimeout(longPressTimeoutRef.current);
    touchTimeoutRef.current = setTimeout(() => {
      setGestures(prev => ({
        ...prev,
        touchStart: null,
        touchEnd: null,
      }));
    }, 100);
  }, []);
  
  // Расчет направления жеста
  const getGestureDirection = useCallback(() => {
    if (!gestures.touchStart || !gestures.touchEnd) return null;
    
    const deltaX = gestures.touchEnd.x - gestures.touchStart.x;
    const deltaY = gestures.touchEnd.y - gestures.touchStart.y;
    
    if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) return null;
    
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
    
    if (angle >= -45 && angle <= 45) return 'right';
    if (angle >= 45 && angle <= 135) return 'down';
    if (angle >= 135 || angle <= -135) return 'left';
    return 'up';
  }, [gestures.touchStart, gestures.touchEnd, threshold]);
  
  // Расчет скорости жеста
  const getGestureVelocity = useCallback(() => {
    if (!gestures.touchStart || !gestures.touchEnd) return 0;
    
    const deltaX = gestures.touchEnd.x - gestures.touchStart.x;
    const deltaY = gestures.touchEnd.y - gestures.touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Время в секундах
    const time = (Date.now() - gestures.lastTap) / 1000;
    
    return time > 0 ? distance / time : 0;
  }, [gestures.touchStart, gestures.touchEnd, gestures.lastTap]);
  
  // Проверка, является ли жест свайпом
  const isSwipe = useCallback(() => {
    const direction = getGestureDirection();
    const velocity = getGestureVelocity();
    
    return direction && velocity > velocityThreshold;
  }, [getGestureDirection, getGestureVelocity, velocityThreshold]);
  
  // Проверка, является ли жест тапом
  const isTap = useCallback(() => {
    return gestures.touchStart && gestures.touchEnd && 
           Math.abs(gestures.touchStart.x - gestures.touchEnd.x) < threshold &&
           Math.abs(gestures.touchStart.y - gestures.touchEnd.y) < threshold;
  }, [gestures.touchStart, gestures.touchEnd, threshold]);
  
  // Очистка таймеров
  useEffect(() => {
    return () => {
      clearTimeout(touchTimeoutRef.current);
      clearTimeout(longPressTimeoutRef.current);
    };
  }, []);
  
  return {
    gestures,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    getGestureDirection,
    getGestureVelocity,
    isSwipe,
    isTap,
    isLongPress: gestures.isLongPress,
    isDoubleTap: gestures.isDoubleTap,
  };
};

// Компонент для свайпов
const Swipeable = ({ 
  children, 
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const touchRef = useRef(null);
  const {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    getGestureDirection,
    isSwipe,
  } = useTouchGestures({ threshold });
  
  // Обработчик жеста
  const handleGesture = useCallback(() => {
    if (!isSwipe()) return;
    
    const direction = getGestureDirection();
    
    switch (direction) {
      case 'left':
        onSwipeLeft && onSwipeLeft();
        break;
      case 'right':
        onSwipeRight && onSwipeRight();
        break;
      case 'up':
        onSwipeUp && onSwipeUp();
        break;
      case 'down':
        onSwipeDown && onSwipeDown();
        break;
    }
  }, [isSwipe, getGestureDirection, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);
  
  // Добавление обработчиков событий
  useEffect(() => {
    const element = touchRef.current;
    if (!element) return;
    
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleGesture);
    element.addEventListener('touchcancel', handleTouchEnd);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleGesture);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleGesture, handleTouchEnd]);
  
  return (
    <div 
      ref={touchRef}
      className={`swipeable ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

Swipeable.propTypes = {
  children: PropTypes.node.isRequired,
  onSwipeLeft: PropTypes.func,
  onSwipeRight: PropTypes.func,
  onSwipeUp: PropTypes.func,
  onSwipeDown: PropTypes.func,
  threshold: PropTypes.number,
  className: PropTypes.string,
};

// Компонент для долгого нажатия
const LongPressable = ({ 
  children, 
  onLongPress,
  delay = 500,
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const touchRef = useRef(null);
  const {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isLongPress,
  } = useTouchGestures({ longPressDelay: delay });
  
  // Обработчик долгого нажатия
  useEffect(() => {
    if (isLongPress && onLongPress) {
      onLongPress();
    }
  }, [isLongPress, onLongPress]);
  
  // Добавление обработчиков событий
  useEffect(() => {
    const element = touchRef.current;
    if (!element) return;
    
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchEnd);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
  
  return (
    <div 
      ref={touchRef}
      className={`long-pressable ${className} ${isLongPress ? 'long-press-active' : ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

LongPressable.propTypes = {
  children: PropTypes.node.isRequired,
  onLongPress: PropTypes.func,
  delay: PropTypes.number,
  className: PropTypes.string,
};

// Компонент для двойного нажатия
const DoubleTapable = ({ 
  children, 
  onDoubleTap,
  delay = 300,
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const touchRef = useRef(null);
  const {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isDoubleTap,
  } = useTouchGestures({ doubleTapDelay: delay });
  
  // Обработчик двойного нажатия
  useEffect(() => {
    if (isDoubleTap && onDoubleTap) {
      onDoubleTap();
    }
  }, [isDoubleTap, onDoubleTap]);
  
  // Добавление обработчиков событий
  useEffect(() => {
    const element = touchRef.current;
    if (!element) return;
    
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchEnd);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
  
  return (
    <div 
      ref={touchRef}
      className={`double-tapable ${className} ${isDoubleTap ? 'double-tap-active' : ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

DoubleTapable.propTypes = {
  children: PropTypes.node.isRequired,
  onDoubleTap: PropTypes.func,
  delay: PropTypes.number,
  className: PropTypes.string,
};

// Компонент для pinch-жеста
const Pinchable = ({ 
  children, 
  onPinchStart,
  onPinchMove,
  onPinchEnd,
  minScale = 0.5,
  maxScale = 3,
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const touchRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [startDistance, setStartDistance] = useState(0);
  const [isPinching, setIsPinching] = useState(false);
  
  // Расчет расстояния между двумя точками касания
  const calculateDistance = useCallback((touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);
  
  // Обработчик начала касания
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      const distance = calculateDistance(e.touches);
      setStartDistance(distance);
      setIsPinching(true);
      onPinchStart && onPinchStart();
    }
  }, [calculateDistance, onPinchStart]);
  
  // Обработчик движения касания
  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2 && isPinching) {
      const distance = calculateDistance(e.touches);
      const newScale = Math.max(minScale, Math.min(maxScale, distance / startDistance));
      setScale(newScale);
      onPinchMove && onPinchMove(newScale);
    }
  }, [calculateDistance, isPinching, startDistance, minScale, maxScale, onPinchMove]);
  
  // Обработчик окончания касания
  const handleTouchEnd = useCallback((e) => {
    if (isPinching) {
      setIsPinching(false);
      setScale(1);
      onPinchEnd && onPinchEnd();
    }
  }, [isPinching, onPinchEnd]);
  
  // Добавление обработчиков событий
  useEffect(() => {
    const element = touchRef.current;
    if (!element) return;
    
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchEnd);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
  
  return (
    <div 
      ref={touchRef}
      className={`pinchable ${className}`}
      style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
      {...props}
    >
      {children}
    </div>
  );
};

Pinchable.propTypes = {
  children: PropTypes.node.isRequired,
  onPinchStart: PropTypes.func,
  onPinchMove: PropTypes.func,
  onPinchEnd: PropTypes.func,
  minScale: PropTypes.number,
  maxScale: PropTypes.number,
  className: PropTypes.string,
};

// Компонент для виртуальной клавиатуры
const VirtualKeyboard = ({ 
  onKeyPress,
  onBackspace,
  onSubmit,
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const [layout, setLayout] = useState('qwerty'); // 'qwerty', 'numeric', 'symbol'
  
  // Клавиатурные раскладки
  const layouts = {
    qwerty: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
      ['space', 'backspace', 'enter']
    ],
    numeric: [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['0', '.', 'backspace']
    ],
    symbol: [
      ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
      ['_', '+', '-', '=', '{', '}', '[', ']', '|', '\\'],
      [':', ';', '"', "'", '<', '>', ',', '.', '?', '/'],
      ['space', 'backspace', 'enter']
    ]
  };
  
  // Обработчик нажатия клавиши
  const handleKeyPress = useCallback((key) => {
    switch (key) {
      case 'space':
        onKeyPress && onKeyPress(' ');
        break;
      case 'backspace':
        onBackspace && onBackspace();
        break;
      case 'enter':
        onSubmit && onSubmit();
        break;
      default:
        onKeyPress && onKeyPress(key);
        break;
    }
  }, [onKeyPress, onBackspace, onSubmit]);
  
  // Переключение раскладки
  const switchLayout = useCallback((newLayout) => {
    setLayout(newLayout);
  }, []);
  
  return (
    <div className={`virtual-keyboard ${className}`} {...props}>
      {/* Переключатели раскладки */}
      <div className="keyboard-layout-switcher flex justify-center gap-2 mb-2">
        <Button
          variant={layout === 'qwerty' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => switchLayout('qwerty')}
        >
          ABC
        </Button>
        <Button
          variant={layout === 'numeric' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => switchLayout('numeric')}
        >
          123
        </Button>
        <Button
          variant={layout === 'symbol' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => switchLayout('symbol')}
        >
          +=#
        </Button>
      </div>
      
      {/* Клавиши */}
      <div className="keyboard-keys space-y-1">
        {layouts[layout].map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row flex justify-center gap-1">
            {row.map((key, keyIndex) => (
              <Button
                key={`${rowIndex}-${keyIndex}`}
                variant="ghost"
                size="sm"
                className={`keyboard-key ${key === 'space' ? 'keyboard-key-space' : ''} ${key === 'backspace' ? 'keyboard-key-backspace' : ''} ${key === 'enter' ? 'keyboard-key-enter' : ''}`}
                onClick={() => handleKeyPress(key)}
              >
                {key === 'space' ? 'Пробел' : 
                 key === 'backspace' ? '⌫' : 
                 key === 'enter' ? 'Enter' : 
                 key}
              </Button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

VirtualKeyboard.propTypes = {
  onKeyPress: PropTypes.func,
  onBackspace: PropTypes.func,
  onSubmit: PropTypes.func,
  className: PropTypes.string,
};

// Компонент для touch-кнопок
const TouchButton = ({ 
  children, 
  onPress,
  onLongPress,
  onPressStart,
  onPressEnd,
  className = '',
  ...props 
}) => {
  const { colors } = useTheme();
  const touchRef = useRef(null);
  const {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isLongPress,
    isDoubleTap,
  } = useTouchGestures({ longPressDelay: 500 });
  
  // Обработчик начала нажатия
  const handlePressStart = useCallback(() => {
    onPressStart && onPressStart();
  }, [onPressStart]);
  
  // Обработчик окончания нажатия
  const handlePressEnd = useCallback(() => {
    onPressEnd && onPressEnd();
  }, [onPressEnd]);
  
  // Обработчик нажатия
  const handlePress = useCallback(() => {
    if (!isLongPress && !isDoubleTap) {
      onPress && onPress();
    }
  }, [onPress, isLongPress, isDoubleTap]);
  
  // Обработчик долгого нажатия
  useEffect(() => {
    if (isLongPress && onLongPress) {
      onLongPress();
    }
  }, [isLongPress, onLongPress]);
  
  // Обработчик двойного нажатия
  useEffect(() => {
    if (isDoubleTap && onPress) {
      onPress();
    }
  }, [isDoubleTap, onPress]);
  
  // Добавление обработчиков событий
  useEffect(() => {
    const element = touchRef.current;
    if (!element) return;
    
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handlePress);
    element.addEventListener('touchcancel', handleTouchEnd);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handlePress);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handlePress, handleTouchEnd]);
  
  return (
    <button
      ref={touchRef}
      className={`touch-button ${className} ${isLongPress ? 'touch-button-long-press' : ''} ${isDoubleTap ? 'touch-button-double-tap' : ''}`}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      {...props}
    >
      {children}
    </button>
  );
};

TouchButton.propTypes = {
  children: PropTypes.node.isRequired,
  onPress: PropTypes.func,
  onLongPress: PropTypes.func,
  onPressStart: PropTypes.func,
  onPressEnd: PropTypes.func,
  className: PropTypes.string,
};

export default useTouchGestures;
export { Swipeable, LongPressable, DoubleTapable, Pinchable, VirtualKeyboard, TouchButton };