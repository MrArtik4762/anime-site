// Расширенные токены дизайна для аниме-сайта

// Цветовая палитра
export const colors = {
  // Основные цвета
  primary: {
    50: '#FFF5F5',
    100: '#FFE4E4',
    200: '#FFCCCC',
    300: '#FF9999',
    400: '#FF6666',
    500: '#FF4D4D', // Основной красный
    600: '#E55555', // Темный красный
    700: '#CC4444',
    800: '#B33333',
    900: '#992222',
  },
  
  secondary: {
    50: '#F0FFFE',
    100: '#CCFFFE',
    200: '#99FFFE',
    300: '#66FFFE',
    400: '#33FFFE',
    500: '#00FFFF', // Циановый
    600: '#00CCCC',
    700: '#009999',
    800: '#006666',
    900: '#003333',
  },
  
  accent: {
    pink: '#FF6B9D',
    purple: '#C44569',
    blue: '#4ECDC4',
    teal: '#44A08D',
    orange: '#FFA726',
    yellow: '#FFD54F',
    green: '#66BB6A',
    red: '#EF5350',
  },
  
  // Семантические цвета
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Текстовые цвета
  text: {
    primary: '#1A1A1A',
    secondary: '#4A4A4A',
    tertiary: '#7A7A7A',
    disabled: '#BDBDBD',
    inverse: '#FFFFFF',
  },
  
  // Фоновые цвета
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#EEEEEE',
    dark: '#121212',
    darkSecondary: '#1E1E1E',
    darkTertiary: '#2A2A2A',
  },
  
  // Поверхности
  surface: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F5F5F5',
    dark: '#1E1E1E',
    darkSecondary: '#2A2A2A',
    darkTertiary: '#363636',
  },
  
  // Границы и разделители
  border: {
    light: '#E0E0E0',
    medium: '#BDBDBD',
    dark: '#9E9E9E',
    lightDark: '#2F2F2F',
    mediumDark: '#424242',
    darkDark: '#616161',
  },
  
  // Тени
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    dark: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    }
  },
  
  // Градиенты
  gradients: {
    primary: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
    secondary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    sunset: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 52%, #2BFF88 90%)',
    ocean: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
    fire: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
    dark: 'linear-gradient(135deg, #0F1419 0%, #1A1F29 100%)',
  },
  
  // Аниме-специфичные цвета
  anime: {
    // Статусы
    ongoing: '#4CAF50', // Зеленый
    completed: '#2196F3', // Синий
    upcoming: '#FF9800', // Оранжевый
    hiatus: '#9C27B0', // Фиолетовый
    
    // Рейтинги
    masterpiece: '#FFD700', // Золотой
    great: '#4CAF50', // Зеленый
    good: '#2196F3', // Синий
    average: '#FF9800', // Оранжевый
    bad: '#F44336', // Красный
    
    // Типы контента
    sub: '#00BCD4', // Бирюзовый
    dub: '#9C27B0', // Фиолетовый
    raw: '#795548', // Коричневый
  },
};

// Типографика
export const typography = {
  // Семейства шрифтов
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    mono: "'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'Courier New', monospace",
    display: "'Playfair Display', 'Georgia', serif",
  },
  
  // Размеры шрифтов
  fontSize: {
    xs: ['12px', '16px'],
    sm: ['14px', '20px'],
    base: ['16px', '24px'],
    lg: ['18px', '28px'],
    xl: ['20px', '28px'],
    '2xl': ['24px', '32px'],
    '3xl': ['30px', '36px'],
    '4xl': ['36px', '40px'],
    '5xl': ['48px', '48px'],
    '6xl': ['60px', '72px'],
    '7xl': ['72px', '84px'],
  },
  
  // Толщины шрифтов
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  
  // Высоты строк
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // Отступы между буквами
  letterSpacing: {
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// Размеры и отступы
export const spacing = {
  // Микро-уровень
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  
  // Мега-уровень
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  56: '224px',
  64: '256px',
};

// Радиусы скругления
export const borderRadius = {
  none: '0',
  sm: '2px',
  md: '4px',
  lg: '6px',
  xl: '8px',
  '2xl': '12px',
  '3xl': '16px',
  full: '9999px',
  pill: '999px',
  circle: '50%',
};

// Анимации
export const animation = {
  // Длительности
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },
  
  // Функции анимации
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Ключевые кадры
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    fadeOut: {
      '0%': { opacity: '1' },
      '100%': { opacity: '0' },
    },
    slideInUp: {
      '0%': { transform: 'translateY(100%)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    slideInDown: {
      '0%': { transform: 'translateY(-100%)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    slideInLeft: {
      '0%': { transform: 'translateX(-100%)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' },
    },
    slideInRight: {
      '0%': { transform: 'translateX(100%)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' },
    },
    scaleIn: {
      '0%': { transform: 'scale(0.95)', opacity: '0' },
      '100%': { transform: 'scale(1)', opacity: '1' },
    },
    bounce: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' },
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
    spin: {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
  },
};

// Точки останова для адаптивности
export const breakpoints = {
  // Mobile first
  xs: '320px',
  sm: '480px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  
  // Максимальные ширины
  maxSm: '479px',
  maxMd: '767px',
  maxLg: '1023px',
  maxXl: '1279px',
  max2xl: '1535px',
};

// Z-индексы
export const zIndex = {
  auto: 'auto',
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  // Контекстные уровни
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
  loading: 1090,
  navbar: 1100,
};

// Непрозрачность
export const opacity = {
  0: '0',
  25: '0.25',
  50: '0.5',
  75: '0.75',
  100: '1',
};

// Тени для глубины
export const elevation = {
  0: 'none',
  1: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  2: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
  3: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  4: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
  5: '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)',
};

// Стили для форм
export const form = {
  input: {
    height: '44px',
    padding: '0 16px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '2px solid',
    focusBorder: '2px solid',
    transition: 'all 0.2s ease',
  },
  
  select: {
    height: '44px',
    padding: '0 16px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '2px solid',
    focusBorder: '2px solid',
    transition: 'all 0.2s ease',
  },
  
  button: {
    height: '44px',
    padding: '0 24px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    minHeight: '44px',
  },
};

// Стили для карточек
export const card = {
  padding: '24px',
  borderRadius: '12px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  transition: 'all 0.3s ease',
  
  hover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
};

// Транзиции
export const transitions = {
  // Транзиции для интерактивных элементов
  interactive: 'all 0.2s ease',
  
  // Транзиции для анимаций
  animation: 'all 0.3s ease',
  
  // Транзиции для модальных окон
  modal: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Транзиции для карточек
  card: 'all 0.3s ease',
  
  // Транзиции для кнопок
  button: 'all 0.2s ease',
  
  // Транзиции для форм
  form: 'all 0.2s ease',
};

// Утилиты
export const utils = {
  // Flexbox
  flex: {
    center: 'display: flex; align-items: center; justify-content: center;',
    between: 'display: flex; align-items: center; justify-content: space-between;',
    around: 'display: flex; align-items: center; justify-content: space-around;',
    evenly: 'display: flex; align-items: center; justify-content: space-evenly;',
    start: 'display: flex; align-items: center; justify-content: flex-start;',
    end: 'display: flex; align-items: center; justify-content: flex-end;',
  },
  
  // Position
  position: {
    absolute: 'position: absolute;',
    relative: 'position: relative;',
    fixed: 'position: fixed;',
    sticky: 'position: sticky;',
  },
  
  // Overflow
  overflow: {
    hidden: 'overflow: hidden;',
    auto: 'overflow: auto;',
    scroll: 'overflow: scroll;',
    visible: 'overflow: visible;',
  },
  
  // Text
  text: {
    truncate: 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;',
    center: 'text-align: center;',
    left: 'text-align: left;',
    right: 'text-align: right;',
    justify: 'text-align: justify;',
    uppercase: 'text-transform: uppercase;',
    lowercase: 'text-transform: lowercase;',
    capitalize: 'text-transform: capitalize;',
  },
  
  // Cursor
  cursor: {
    pointer: 'cursor: pointer;',
    notAllowed: 'cursor: not-allowed;',
    default: 'cursor: default;',
    help: 'cursor: help;',
    wait: 'cursor: wait;',
    move: 'cursor: move;',
    grab: 'cursor: grab;',
    grabbing: 'cursor: grabbing;',
  },
  
  // Display
  display: {
    none: 'display: none;',
    block: 'display: block;',
    inline: 'display: inline;',
    inlineBlock: 'display: inline-block;',
    grid: 'display: grid;',
    inlineGrid: 'display: inline-grid;',
    flex: 'display: flex;',
    inlineFlex: 'display: inline-flex;',
  },
};