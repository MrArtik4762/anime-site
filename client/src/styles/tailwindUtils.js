// Кастомные утилиты для Tailwind CSS

// Экспорт кастомных классов для темной темы
export const darkThemeUtils = {
  // Темные версии цветов
  colors: {
    'dark-background-primary': '#0F172A',
    'dark-background-secondary': '#1E293B',
    'dark-background-tertiary': '#334155',
    'dark-surface-primary': '#1E293B',
    'dark-surface-secondary': '#334155',
    'dark-surface-tertiary': '#475569',
    'dark-text-primary': '#F8FAFC',
    'dark-text-secondary': '#CBD5E1',
    'dark-text-tertiary': '#94A3B8',
    'dark-border-light': '#334155',
    'dark-border-medium': '#475569',
    'dark-border-dark': '#64748B',
  },
  
  // Кастомные классы для темной темы
  classes: {
    'dark-bg-primary': 'bg-[#0F172A]',
    'dark-bg-secondary': 'bg-[#1E293B]',
    'dark-bg-tertiary': 'bg-[#334155]',
    'dark-surface-primary': 'bg-[#1E293B]',
    'dark-surface-secondary': 'bg-[#334155]',
    'dark-surface-tertiary': 'bg-[#475569]',
    'dark-text-primary': 'text-[#F8FAFC]',
    'dark-text-secondary': 'text-[#CBD5E1]',
    'dark-text-tertiary': 'text-[#94A3B8]',
    'dark-border-light': 'border-[#334155]',
    'dark-border-medium': 'border-[#475569]',
    'dark-border-dark': 'border-[#64748B]',
    'dark-shadow': 'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.4),_0_2px_4px_-1px_rgba(0,0,0,0.3)]',
  },
};

// Адаптивные утилиты
export const responsiveUtils = {
  // Мобильные-first breakpoints
  breakpoints: {
    mobile: '320px',
    mobileSm: '375px',
    mobileMd: '425px',
    mobileLg: '480px',
    tablet: '768px',
    tabletSm: '834px',
    tabletMd: '1024px',
    desktop: '1280px',
    desktopSm: '1440px',
    desktopLg: '1536px',
  },
  
  // Адаптивные классы для контейнеров
  containers: {
    mobile: 'px-4',
    tablet: 'px-6',
    desktop: 'px-8',
    large: 'px-12',
  },
  
  // Адаптивные отступы
  spacing: {
    mobile: '1rem',
    tablet: '1.5rem',
    desktop: '2rem',
    large: '3rem',
  },
  
  // Адаптивные размеры шрифтов
  fontSize: {
    mobile: {
      'text-xs': ['0.75rem', '1rem'],
      'text-sm': ['0.875rem', '1.25rem'],
      'text-base': ['1rem', '1.5rem'],
      'text-lg': ['1.125rem', '1.75rem'],
    },
    tablet: {
      'text-xs': ['0.875rem', '1.25rem'],
      'text-sm': ['1rem', '1.5rem'],
      'text-base': ['1.125rem', '1.75rem'],
      'text-lg': ['1.25rem', '2rem'],
    },
    desktop: {
      'text-xs': ['0.875rem', '1.25rem'],
      'text-sm': ['1rem', '1.5rem'],
      'text-base': ['1.125rem', '1.75rem'],
      'text-lg': ['1.25rem', '2rem'],
      'text-xl': ['1.5rem', '2rem'],
    },
  },
};

// Анимационные утилиты
export const animationUtils = {
  // Кастомные анимации
  animations: {
    'fade-in': 'fadeIn 0.3s ease-in-out',
    'fade-out': 'fadeOut 0.3s ease-in-out',
    'slide-up': 'slideUp 0.3s ease-out',
    'slide-down': 'slideDown 0.3s ease-out',
    'slide-left': 'slideLeft 0.3s ease-out',
    'slide-right': 'slideRight 0.3s ease-out',
    'scale-in': 'scaleIn 0.3s ease-out',
    'float': 'float 3s ease-in-out infinite',
    'wiggle': 'wiggle 1s ease-in-out',
    'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
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
    slideUp: {
      '0%': { transform: 'translateY(100%)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    slideDown: {
      '0%': { transform: 'translateY(-100%)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    slideLeft: {
      '0%': { transform: 'translateX(-100%)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' },
    },
    slideRight: {
      '0%': { transform: 'translateX(100%)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' },
    },
    scaleIn: {
      '0%': { transform: 'scale(0.95)', opacity: '0' },
      '100%': { transform: 'scale(1)', opacity: '1' },
    },
    float: {
      '0%, 100%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-20px)' },
    },
    wiggle: {
      '0%, 7%': { transform: 'rotateZ(0)' },
      '15%': { transform: 'rotateZ(-15deg)' },
      '20%': { transform: 'rotateZ(10deg)' },
      '25%': { transform: 'rotateZ(-10deg)' },
      '30%': { transform: 'rotateZ(6deg)' },
      '35%': { transform: 'rotateZ(-4deg)' },
      '40%, 100%': { transform: 'rotateZ(0)' },
    },
    bounceGentle: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' },
    },
  },
};

// Компонентные утилиты
export const componentUtils = {
  // Утилиты для кнопок
  buttons: {
    sizes: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl',
    },
    variants: {
      primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
      secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700',
      outline: 'border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white',
      ghost: 'text-primary-500 hover:bg-primary-50',
      success: 'bg-success text-white hover:bg-opacity-90',
      warning: 'bg-warning text-white hover:bg-opacity-90',
      error: 'bg-error text-white hover:bg-opacity-90',
    },
  },
  
  // Утилиты для карточек
  cards: {
    variants: {
      default: 'bg-surface-primary rounded-xl shadow-sm border border-border-light hover:shadow-md',
      elevated: 'bg-surface-primary rounded-xl shadow-lg border border-border-light hover:shadow-xl',
      flat: 'bg-surface-primary rounded-lg border border-border-light',
      outlined: 'bg-surface-primary rounded-xl border-2 border-border-light',
    },
    sizes: {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    },
  },
  
  // Утилиты для форм
  forms: {
    input: {
      base: 'w-full px-3 py-2 text-sm border border-border-medium rounded-lg transition-all duration-200 bg-surface-primary text-text-primary focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20',
      error: 'border-error',
      success: 'border-success',
      disabled: 'bg-surface-tertiary text-text-disabled cursor-not-allowed opacity-60',
    },
    select: {
      base: 'w-full px-3 py-2 text-sm border border-border-medium rounded-lg transition-all duration-200 bg-surface-primary text-text-primary focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 appearance-none',
      icon: 'pr-10',
    },
    textarea: {
      base: 'w-full px-3 py-2 text-sm border border-border-medium rounded-lg transition-all duration-200 bg-surface-primary text-text-primary focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 resize-vertical',
      minH: 'min-h-[100px]',
    },
  },
};

// Утилиты для аниме-специфичных компонентов
export const animeUtils = {
  // Статусы аниме
  statuses: {
    ongoing: 'bg-green-100 text-green-800 border border-green-200',
    completed: 'bg-blue-100 text-blue-800 border border-blue-200',
    upcoming: 'bg-amber-100 text-amber-800 border border-amber-200',
    hiatus: 'bg-purple-100 text-purple-800 border border-purple-200',
    cancelled: 'bg-red-100 text-red-800 border border-red-200',
  },
  
  // Рейтинги
  ratings: {
    masterpiece: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    great: 'bg-green-100 text-green-800 border border-green-200',
    good: 'bg-blue-100 text-blue-800 border border-blue-200',
    average: 'bg-amber-100 text-amber-800 border border-amber-200',
    bad: 'bg-red-100 text-red-800 border border-red-200',
  },
  
  // Типы озвучки
  audioTypes: {
    sub: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
    dub: 'bg-purple-100 text-purple-800 border border-purple-200',
    raw: 'bg-gray-100 text-gray-800 border border-gray-200',
  },
  
  // Утилиты для видео плеера
  videoPlayer: {
    controls: {
      base: 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4',
      button: 'w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors',
      progress: 'w-full h-1 bg-white/30 rounded-full overflow-hidden',
      volume: 'w-24 h-1 bg-white/30 rounded-full overflow-hidden',
    },
  },
};

// Экспорт всех утилит
export const tailwindUtils = {
  ...darkThemeUtils,
  ...responsiveUtils,
  ...animationUtils,
  ...componentUtils,
  ...animeUtils,
};

// Пример использования в CSS
export const tailwindUtilsCSS = `
  /* Темная тема */
  .dark .dark-bg-primary { background-color: #0F172A; }
  .dark .dark-bg-secondary { background-color: #1E293B; }
  .dark .dark-bg-tertiary { background-color: #334155; }
  .dark .dark-text-primary { color: #F8FAFC; }
  .dark .dark-text-secondary { color: #CBD5E1; }
  .dark .dark-text-tertiary { color: #94A3B8; }
  .dark .dark-border-light { border-color: #334155; }
  .dark .dark-border-medium { border-color: #475569; }
  .dark .dark-border-dark { border-color: #64748B; }
  
  /* Адаптивные классы */
  @media (max-width: 480px) {
    .responsive-mobile { padding: 1rem; }
    .responsive-mobile-text { font-size: 0.875rem; }
  }
  
  @media (min-width: 768px) {
    .responsive-tablet { padding: 1.5rem; }
    .responsive-tablet-text { font-size: 1rem; }
  }
  
  @media (min-width: 1280px) {
    .responsive-desktop { padding: 2rem; }
    .responsive-desktop-text { font-size: 1.125rem; }
  }
  
  /* Кастомные анимации */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes slideDown {
    from { transform: translateY(-100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes slideLeft {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  
  @keyframes wiggle {
    0%, 7% { transform: rotateZ(0); }
    15% { transform: rotateZ(-15deg); }
    20% { transform: rotateZ(10deg); }
    25% { transform: rotateZ(-10deg); }
    30% { transform: rotateZ(6deg); }
    35% { transform: rotateZ(-4deg); }
    40%, 100% { transform: rotateZ(0); }
  }
  
  @keyframes bounceGentle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;