import { colors, typography, spacing, borderRadius, animation, transitions, breakpoints, zIndex, opacity, elevation, form, card, utils } from './designTokens';

// Светлая тема
export const lightTheme = {
  name: 'light',
  colors: {
    // Основные цвета
    primary: colors.primary[500],
    primaryLight: colors.primary[300],
    primaryDark: colors.primary[700],
    secondary: colors.secondary[500],
    secondaryLight: colors.secondary[300],
    secondaryDark: colors.secondary[700],
    
    // Акцентные цвета
    accent: colors.accent,
    
    // Текстовые цвета - улучшенные для новой цветовой схемы
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      tertiary: colors.text.tertiary,
      disabled: colors.text.disabled,
      inverse: colors.text.inverse,
      // Улучшенная контрастность для темной темы
      dark: {
        primary: colors.text.dark.primary,
        secondary: colors.text.dark.secondary,
        tertiary: colors.text.dark.tertiary,
        disabled: colors.text.dark.disabled,
      },
    },
    
    // Фоновые цвета
    background: {
      primary: colors.background.primary,
      secondary: colors.background.secondary,
      tertiary: colors.background.tertiary,
      dark: colors.background.dark,
      darkSecondary: colors.background.darkSecondary,
      darkTertiary: colors.background.darkTertiary,
    },
    
    // Поверхности
    surface: {
      primary: colors.surface.primary,
      secondary: colors.surface.secondary,
      tertiary: colors.surface.tertiary,
      dark: colors.surface.dark,
      darkSecondary: colors.surface.darkSecondary,
      darkTertiary: colors.surface.darkTertiary,
    },
    
    // Границы и разделители
    border: {
      light: colors.border.light,
      medium: colors.border.medium,
      dark: colors.border.dark,
      lightDark: colors.border.lightDark,
      mediumDark: colors.border.mediumDark,
      darkDark: colors.border.darkDark,
    },
    
    // Тени
    shadow: {
      sm: colors.shadow.sm,
      md: colors.shadow.md,
      lg: colors.shadow.lg,
      xl: colors.shadow.xl,
      dark: colors.shadow.dark,
    },
    
    // Градиенты
    gradients: {
      primary: colors.gradients.primary,
      secondary: colors.gradients.secondary,
      sunset: colors.gradients.sunset,
      ocean: colors.gradients.ocean,
      fire: colors.gradients.fire,
      dark: colors.gradients.dark,
    },
    
    // Семантические цвета
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    
    // Аниме-специфичные цвета
    anime: {
      ongoing: colors.anime.ongoing,
      completed: colors.anime.completed,
      upcoming: colors.anime.upcoming,
      hiatus: colors.anime.hiatus,
      masterpiece: colors.anime.masterpiece,
      great: colors.anime.great,
      good: colors.anime.good,
      average: colors.anime.average,
      bad: colors.anime.bad,
      sub: colors.anime.sub,
      dub: colors.anime.dub,
      raw: colors.anime.raw,
    },
    
    // Непрозрачность
    opacity: opacity,
  },
  
  // Типографика
  typography: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize,
    fontWeight: typography.fontWeight,
    lineHeight: typography.lineHeight,
    letterSpacing: typography.letterSpacing,
  },
  
  // Размеры и отступы
  spacing: spacing,
  
  // Радиусы скругления
  borderRadius: borderRadius,
  
  // Анимации
  animation: {
    duration: animation.duration,
    easing: animation.easing,
    keyframes: animation.keyframes,
  },
  
  // Точки останова для адаптивности
  breakpoints: breakpoints,
  
  // Z-индексы
  zIndex: zIndex,
  
  // Непрозрачность
  opacity: opacity,
  
  // Тени для глубины
  elevation: elevation,
  
  // Стили для форм
  form: {
    ...form,
    // Добавляем стили для наших компонентов форм
    input: {
      base: `
        width: 100%;
        padding: ${spacing[3]} ${spacing[4]};
        border: 1px solid ${colors.border.medium};
        border-radius: ${borderRadius.md};
        font-size: ${typography.fontSize.sm};
        transition: all ${transitions.normal};
        
        &:focus {
          outline: none;
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px ${opacity['20']};
        }
        
        &:disabled {
          background-color: ${colors.surface.tertiary};
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        &.error {
          border-color: ${colors.error};
        }
        
        &.success {
          border-color: ${colors.success};
        }
      `,
      icon: `
        padding-left: ${spacing[10]};
      `,
      iconRight: `
        padding-right: ${spacing[10]};
      `,
    },
    
    select: {
      base: `
        width: 100%;
        padding: ${spacing[3]} ${spacing[4]};
        border: 1px solid ${colors.border.medium};
        border-radius: ${borderRadius.md};
        font-size: ${typography.fontSize.sm};
        background-color: ${colors.surface.primary};
        transition: all ${transitions.normal};
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right ${spacing[3]} center;
        padding-right: ${spacing[10]};
        
        &:focus {
          outline: none;
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px ${opacity['20']};
        }
        
        &:disabled {
          background-color: ${colors.surface.tertiary};
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        &.error {
          border-color: ${colors.error};
        }
        
        &.success {
          border-color: ${colors.success};
        }
      `,
    },
    
    textarea: {
      base: `
        width: 100%;
        padding: ${spacing[3]} ${spacing[4]};
        border: 1px solid ${colors.border.medium};
        border-radius: ${borderRadius.md};
        font-size: ${typography.fontSize.sm};
        font-family: ${typography.fontFamily};
        resize: vertical;
        min-height: 100px;
        transition: all ${transitions.normal};
        
        &:focus {
          outline: none;
          border-color: ${colors.primary};
          box-shadow: 0 0 0 3px ${opacity['20']};
        }
        
        &:disabled {
          background-color: ${colors.surface.tertiary};
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        &.error {
          border-color: ${colors.error};
        }
        
        &.success {
          border-color: ${colors.success};
        }
      `,
    },
    
    checkbox: {
      base: `
        width: 20px;
        height: 20px;
        border: 2px solid ${colors.border.medium};
        border-radius: ${borderRadius.sm};
        cursor: pointer;
        transition: all ${transitions.normal};
        appearance: none;
        position: relative;
        
        &:checked {
          background-color: ${colors.primary};
          border-color: ${colors.primary};
        }
        
        &:checked::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 14px;
          font-weight: bold;
        }
        
        &:focus {
          outline: none;
          box-shadow: 0 0 0 3px ${opacity['20']};
        }
        
        &:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        &.error {
          border-color: ${colors.error};
        }
        
        &.success {
          border-color: ${colors.success};
        }
      `,
    },
    
    radio: {
      base: `
        width: 20px;
        height: 20px;
        border: 2px solid ${colors.border.medium};
        border-radius: 50%;
        cursor: pointer;
        transition: all ${transitions.normal};
        appearance: none;
        position: relative;
        
        &:checked {
          border-color: ${colors.primary};
        }
        
        &:checked::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: ${colors.primary};
        }
        
        &:focus {
          outline: none;
          box-shadow: 0 0 0 3px ${opacity['20']};
        }
        
        &:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        &.error {
          border-color: ${colors.error};
        }
        
        &.success {
          border-color: ${colors.success};
        }
      `,
    },
    
    switch: {
      base: `
        position: relative;
        width: 48px;
        height: 24px;
        cursor: pointer;
        
        input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: ${colors.border.medium};
          transition: ${transitions.normal};
          border-radius: 24px;
        }
        
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: ${transitions.normal};
          border-radius: 50%;
        }
        
        input:checked + .slider {
          background-color: ${colors.primary};
        }
        
        input:checked + .slider:before {
          transform: translateX(24px);
        }
        
        input:focus + .slider {
          box-shadow: 0 0 0 3px ${opacity['20']};
        }
        
        input:disabled + .slider {
          cursor: not-allowed;
          opacity: 0.6;
        }
      `,
    },
  },
  
  // Стили для карточек
  card: {
    ...card,
    // Добавляем стили для наших компонентов карточек
    base: `
      background-color: ${colors.surface.primary};
      border-radius: ${borderRadius.lg};
      box-shadow: ${colors.shadow.sm};
      transition: all ${transitions.normal};
      overflow: hidden;
      
      &:hover {
        box-shadow: ${colors.shadow.md};
        transform: translateY(-2px);
      }
    `,
    header: `
      padding: ${spacing[4]};
      border-bottom: 1px solid ${colors.border.light};
    `,
    body: `
      padding: ${spacing[4]};
    `,
    footer: `
      padding: ${spacing[4]};
      border-top: 1px solid ${colors.border.light};
    `,
    image: `
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: ${borderRadius.md} ${borderRadius.md} 0 0;
    `,
    badge: `
      position: absolute;
      top: ${spacing[3]};
      right: ${spacing[3]};
      padding: ${spacing[1]} ${spacing[3]};
      border-radius: ${borderRadius.full};
      font-size: ${typography.fontSize.xs};
      font-weight: ${typography.fontWeight.medium};
    `,
  },
  
  // Утилиты
  utils: {
    ...utils,
    // Добавляем утилиты для наших компонентов
    tooltip: `
      position: relative;
      
      .tooltip-content {
        position: absolute;
        background-color: ${colors.background.dark};
        color: ${colors.text.inverse};
        padding: ${spacing[2]} ${spacing[3]};
        border-radius: ${borderRadius.md};
        font-size: ${typography.fontSize.xs};
        white-space: nowrap;
        z-index: ${zIndex.tooltip};
        opacity: 0;
        pointer-events: none;
        transition: opacity ${transitions.normal};
        
        &::before {
          content: '';
          position: absolute;
          width: 0;
          height: 0;
        }
      }
      
      &:hover .tooltip-content {
        opacity: 1;
      }
    `,
    
    avatar: `
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid ${colors.border.light};
      
      &.small {
        width: 32px;
        height: 32px;
      }
      
      &.large {
        width: 48px;
        height: 48px;
      }
      
      &.circle {
        border-radius: 50%;
      }
      
      &.square {
        border-radius: ${borderRadius.md};
      }
    `,
    
    badge: `
      display: inline-flex;
      align-items: center;
      padding: ${spacing[1]} ${spacing[3]};
      border-radius: ${borderRadius.full};
      font-size: ${typography.fontSize.xs};
      font-weight: ${typography.fontWeight.medium};
      line-height: 1;
      
      &.primary {
        background-color: ${colors.primary};
        color: ${colors.text.inverse};
      }
      
      &.secondary {
        background-color: ${colors.secondary};
        color: ${colors.text.inverse};
      }
      
      &.success {
        background-color: ${colors.success};
        color: ${colors.text.inverse};
      }
      
      &.warning {
        background-color: ${colors.warning};
        color: ${colors.text.inverse};
      }
      
      &.error {
        background-color: ${colors.error};
        color: ${colors.text.inverse};
      }
      
      &.info {
        background-color: ${colors.info};
        color: ${colors.text.inverse};
      }
      
      &.ghost {
        background-color: transparent;
        color: ${colors.text.secondary};
        border: 1px solid ${colors.border.medium};
      }
      
      &.pill {
        border-radius: ${borderRadius.full};
      }
      
      &.dot {
        padding: ${spacing[1]};
        border-radius: 50%;
        width: 8px;
        height: 8px;
        min-width: 8px;
        min-height: 8px;
      }
      
      &.with-icon {
        padding-left: ${spacing[2]};
      }
    `,
    
    divider: `
      width: 100%;
      height: 1px;
      background-color: ${colors.border.light};
      margin: ${spacing[4]} 0;
      
      &.vertical {
        width: 1px;
        height: 100%;
        margin: 0 ${spacing[4]};
      }
      
      &.dashed {
        background-image: linear-gradient(90deg, transparent, ${colors.border.light}, transparent);
        background-size: 8px 1px;
        background-repeat: repeat-x;
      }
      
      &.dotted {
        background-image: radial-gradient(${colors.border.light} 30%, transparent 30%);
        background-size: 8px 8px;
        background-position: center;
      }
      
      &.inset {
        margin-left: ${spacing[8]};
      }
      
      &.outset {
        margin: 0;
      }
    `,
    
    tabs: `
      display: flex;
      border-bottom: 1px solid ${colors.border.light};
      
      .tab-list {
        display: flex;
        list-style: none;
        padding: 0;
        margin: 0;
        
        .tab {
          padding: ${spacing[3]} ${spacing[4]};
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all ${transitions.normal};
          font-weight: ${typography.fontWeight.medium};
          
          &:hover {
            color: ${colors.primary};
          }
          
          &.active {
            color: ${colors.primary};
            border-bottom-color: ${colors.primary};
          }
          
          &.disabled {
            cursor: not-allowed;
            opacity: 0.6;
          }
        }
      }
      
      .tab-content {
        padding: ${spacing[4]};
        
        .tab-panel {
          display: none;
          
          &.active {
            display: block;
          }
        }
      }
    `,
    
    alert: `
      padding: ${spacing[4]};
      border-radius: ${borderRadius.md};
      border-left: 4px solid;
      margin-bottom: ${spacing[4]};
      
      &.info {
        background-color: ${opacity['10']};
        border-left-color: ${colors.info};
        color: ${colors.text.primary};
      }
      
      &.success {
        background-color: ${colors.success}20;
        border-left-color: ${colors.success};
        color: ${colors.text.primary};
      }
      
      &.warning {
        background-color: ${colors.warning}20;
        border-left-color: ${colors.warning};
        color: ${colors.text.primary};
      }
      
      &.error {
        background-color: ${colors.error}20;
        border-left-color: ${colors.error};
        color: ${colors.text.primary};
      }
      
      &.with-icon {
        display: flex;
        align-items: flex-start;
        gap: ${spacing[3]};
      }
      
      .alert-icon {
        flex-shrink: 0;
        margin-top: 2px;
      }
      
      .alert-content {
        flex: 1;
      }
      
      .alert-title {
        font-weight: ${typography.fontWeight.medium};
        margin-bottom: ${spacing[1]};
      }
      
      .alert-description {
        font-size: ${typography.fontSize.sm};
        color: ${colors.text.secondary};
      }
      
      .alert-close {
        flex-shrink: 0;
        background: none;
        border: none;
        cursor: pointer;
        color: ${colors.text.secondary};
        padding: 0;
        font-size: ${typography.fontSize.lg};
        line-height: 1;
        
        &:hover {
          color: ${colors.text.primary};
        }
      }
    `,
    
    progress: `
      width: 100%;
      height: 8px;
      background-color: ${colors.border.light};
      border-radius: ${borderRadius.full};
      overflow: hidden;
      
      .progress-bar {
        height: 100%;
        background-color: ${colors.primary};
        border-radius: ${borderRadius.full};
        transition: width ${transitions.normal};
        
        &.success {
          background-color: ${colors.success};
        }
        
        &.warning {
          background-color: ${colors.warning};
        }
        
        &.error {
          background-color: ${colors.error};
        }
        
        &.info {
          background-color: ${colors.info};
        }
        
        .progress-value {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: ${typography.fontSize.xs};
          font-weight: ${typography.fontWeight.medium};
          color: ${colors.text.inverse};
        }
      }
      
      &.circular {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        position: relative;
        
        .progress-circle {
          transform: rotate(-90deg);
        }
        
        .progress-value {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: ${typography.fontSize.lg};
          font-weight: ${typography.fontWeight.medium};
        }
      }
      
      &.with-label {
        display: flex;
        flex-direction: column;
        gap: ${spacing[2]};
        
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .progress-label {
          font-size: ${typography.fontSize.sm};
          font-weight: ${typography.fontWeight.medium};
        }
        
        .progress-percentage {
          font-size: ${typography.fontSize.sm};
          color: ${colors.text.secondary};
        }
      }
    `,
    
    rating: `
      display: flex;
      align-items: center;
      gap: ${spacing[1]};
      
      .star {
        cursor: pointer;
        transition: all ${transitions.normal};
        color: ${colors.border.medium};
        
        &:hover,
        &.active {
          color: ${colors.warning};
        }
        
        &.disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
      }
      
      .rating-value {
        margin-left: ${spacing[2]};
        font-size: ${typography.fontSize.sm};
        color: ${colors.text.secondary};
      }
      
      &.readonly {
        .star {
          cursor: default;
        }
      }
    `,
    
    tag: `
      display: inline-flex;
      align-items: center;
      padding: ${spacing[1]} ${spacing[3]};
      border-radius: ${borderRadius.md};
      font-size: ${typography.fontSize.xs};
      font-weight: ${typography.fontWeight.medium};
      gap: ${spacing[1]};
      
      &.primary {
        background-color: ${colors.primary}20;
        color: ${colors.primary};
        border: 1px solid ${colors.primary}40;
      }
      
      &.secondary {
        background-color: ${colors.secondary}20;
        color: ${colors.secondary};
        border: 1px solid ${colors.secondary}40;
      }
      
      &.success {
        background-color: ${colors.success}20;
        color: ${colors.success};
        border: 1px solid ${colors.success}40;
      }
      
      &.warning {
        background-color: ${colors.warning}20;
        color: ${colors.warning};
        border: 1px solid ${colors.warning}40;
      }
      
      &.error {
        background-color: ${colors.error}20;
        color: ${colors.error};
        border: 1px solid ${colors.error}40;
      }
      
      &.info {
        background-color: ${colors.info}20;
        color: ${colors.info};
        border: 1px solid ${colors.info}40;
      }
      
      &.ghost {
        background-color: transparent;
        color: ${colors.text.secondary};
        border: 1px solid ${colors.border.medium};
      }
      
      .tag-close {
        cursor: pointer;
        opacity: 0.7;
        transition: opacity ${transitions.normal};
        
        &:hover {
          opacity: 1;
        }
      }
      
      &.removable {
        padding-right: ${spacing[2]};
      }
    `,
    
    breadcrumb: `
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: ${spacing[1]};
      font-size: ${typography.fontSize.sm};
      
      .breadcrumb-item {
        display: flex;
        align-items: center;
        
        .breadcrumb-link {
          color: ${colors.text.secondary};
          text-decoration: none;
          transition: color ${transitions.normal};
          
          &:hover {
            color: ${colors.primary};
          }
          
          &.active {
            color: ${colors.text.primary};
            font-weight: ${typography.fontWeight.medium};
            cursor: default;
          }
        }
        
        .breadcrumb-separator {
          color: ${colors.text.tertiary};
          margin: 0 ${spacing[1]};
        }
      }
    `,
    
    skeleton: `
      background: linear-gradient(90deg, ${colors.border.light} 25%, ${colors.border.medium} 50%, ${colors.border.light} 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: ${borderRadius.md};
      
      @keyframes loading {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
      
      &.text {
        height: ${spacing[2]};
        margin-bottom: ${spacing[2]};
      }
      
      &.title {
        height: ${spacing[4]};
        width: 40%;
        margin-bottom: ${spacing[4]};
      }
      
      &.avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }
      
      &.image {
        width: 100%;
        height: 200px;
      }
      
      &.button {
        height: 40px;
        width: 120px;
      }
      
      &.card {
        display: flex;
        flex-direction: column;
        gap: ${spacing[4]};
        padding: ${spacing[4]};
        border-radius: ${borderRadius.lg};
      }
      
      &.list {
        display: flex;
        flex-direction: column;
        gap: ${spacing[4]};
      }
      
      &.rectangular {
        border-radius: ${borderRadius.md};
      }
      
      &.circular {
        border-radius: 50%;
      }
    `,
    
    timeline: `
      position: relative;
      padding-left: ${spacing[6]};
      
      &::before {
        content: '';
        position: absolute;
        left: ${spacing[3]};
        top: 0;
        bottom: 0;
        width: 2px;
        background-color: ${colors.border.light};
      }
      
      .timeline-item {
        position: relative;
        padding-bottom: ${spacing[6]};
        
        .timeline-marker {
          position: absolute;
          left: -${spacing[5]};
          top: 0;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: ${colors.background.primary};
          border: 2px solid ${colors.border.medium};
          z-index: 1;
        }
        
        .timeline-content {
          background-color: ${colors.surface.primary};
          padding: ${spacing[4]};
          border-radius: ${borderRadius.md};
          box-shadow: ${colors.shadow.sm};
        }
        
        .timeline-time {
          position: absolute;
          left: -${spacing[20]};
          top: 0;
          font-size: ${typography.fontSize.xs};
          color: ${colors.text.tertiary};
          white-space: nowrap;
        }
        
        .timeline-title {
          font-weight: ${typography.fontWeight.medium};
          margin-bottom: ${spacing[1]};
        }
        
        .timeline-description {
          font-size: ${typography.fontSize.sm};
          color: ${colors.text.secondary};
        }
        
        &.last {
          padding-bottom: 0;
        }
        
        &.success .timeline-marker {
          background-color: ${colors.success};
          border-color: ${colors.success};
        }
        
        &.error .timeline-marker {
          background-color: ${colors.error};
          border-color: ${colors.error};
        }
        
        &.warning .timeline-marker {
          background-color: ${colors.warning};
          border-color: ${colors.warning};
        }
        
        &.info .timeline-marker {
          background-color: ${colors.info};
          border-color: ${colors.info};
        }
      }
      
      &.horizontal {
        display: flex;
        flex-direction: column;
        padding-left: 0;
        
        &::before {
          display: none;
        }
        
        .timeline-item {
          display: flex;
          align-items: center;
          padding-bottom: ${spacing[4]};
          
          .timeline-marker {
            position: static;
            margin-right: ${spacing[4]};
          }
          
          .timeline-content {
            flex: 1;
          }
          
          .timeline-time {
            position: static;
            margin-right: ${spacing[4]};
          }
        }
      }
      
      &.steps {
        padding-left: 0;
        
        &::before {
          display: none;
        }
        
        .timeline-item {
          display: flex;
          align-items: flex-start;
          padding-bottom: ${spacing[6]};
          
          .timeline-marker {
            position: static;
            margin-right: ${spacing[4]};
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            font-size: ${typography.fontSize.sm};
            font-weight: ${typography.fontWeight.medium};
            color: ${colors.text.inverse};
          }
          
          .timeline-content {
            flex: 1;
          }
          
          .timeline-time {
            position: static;
            margin-top: ${spacing[1]};
            font-size: ${typography.fontSize.xs};
            color: ${colors.text.tertiary};
          }
          
          &.completed .timeline-marker {
            background-color: ${colors.success};
            border-color: ${colors.success};
          }
          
          &.active .timeline-marker {
            background-color: ${colors.primary};
            border-color: ${colors.primary};
          }
          
          &.disabled .timeline-marker {
            background-color: ${colors.border.medium};
            border-color: ${colors.border.medium};
            color: ${colors.text.tertiary};
          }
        }
      }
    `,
  },
  
  // Дополнительные настройки
  transitions: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease',
    slower: '700ms ease',
  },
  
  // Отступы для контейнера
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// Темная тема
export const darkTheme = {
  name: 'dark',
  colors: {
    // Основные цвета (остаются теми же для узнаваемости)
    primary: colors.primary[500],
    primaryLight: colors.primary[300],
    primaryDark: colors.primary[700],
    secondary: colors.secondary[500],
    secondaryLight: colors.secondary[300],
    secondaryDark: colors.secondary[700],
    
    // Акцентные цвета
    accent: colors.accent,
    
    // Текстовые цвета (улучшенные для темной темы)
    text: {
      primary: colors.text.dark.primary,
      secondary: colors.text.dark.secondary,
      tertiary: colors.text.dark.tertiary,
      disabled: colors.text.dark.disabled,
      inverse: colors.text.primary,
    },
    
    // Фоновые цвета (темные)
    background: {
      primary: colors.background.dark,
      secondary: colors.background.darkSecondary,
      tertiary: colors.background.darkTertiary,
      dark: colors.background.primary,
      darkSecondary: colors.background.secondary,
      darkTertiary: colors.background.tertiary,
    },
    
    // Поверхности (темные) - улучшенные для новой схемы
    surface: {
      primary: colors.surface.dark,
      secondary: colors.surface.darkSecondary,
      tertiary: colors.surface.darkTertiary,
      dark: colors.surface.primary,
      darkSecondary: colors.surface.secondary,
      darkTertiary: colors.surface.tertiary,
      // Добавляем новые поверхности для лучшей иерархии
      card: colors.background.darkSecondary,
      cardBorder: colors.border.lightDark,
    },
    
    // Границы и разделители (темные)
    border: {
      light: colors.border.lightDark,
      medium: colors.border.mediumDark,
      dark: colors.border.darkDark,
      lightDark: colors.border.light,
      mediumDark: colors.border.medium,
      darkDark: colors.border.dark,
    },
    
    // Тени (более сильные для темной темы)
    shadow: {
      sm: colors.shadow.dark.sm,
      md: colors.shadow.dark.md,
      lg: colors.shadow.dark.lg,
      xl: colors.shadow.dark.xl,
      dark: colors.shadow.dark,
    },
    
    // Градиенты (остаются теми же, но могут быть адаптированы)
    gradients: {
      primary: colors.gradients.primary,
      secondary: colors.gradients.secondary,
      sunset: colors.gradients.sunset,
      ocean: colors.gradients.ocean,
      fire: colors.gradients.fire,
      dark: colors.gradients.dark,
    },
    
    // Семантические цвета (более яркие для темной темы)
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
    
    // Аниме-специфичные цвета (остаются теми же)
    anime: {
      ongoing: colors.anime.ongoing,
      completed: colors.anime.completed,
      upcoming: colors.anime.upcoming,
      hiatus: colors.anime.hiatus,
      masterpiece: colors.anime.masterpiece,
      great: colors.anime.great,
      good: colors.anime.good,
      average: colors.anime.average,
      bad: colors.anime.bad,
      sub: colors.anime.sub,
      dub: colors.anime.dub,
      raw: colors.anime.raw,
    },
    
    // Непрозрачность
    opacity: opacity,
  },
  
  // Типографика (остается той же)
  typography: {
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize,
    fontWeight: typography.fontWeight,
    lineHeight: typography.lineHeight,
    letterSpacing: typography.letterSpacing,
  },
  
  // Размеры и отступы (остаются теми же)
  spacing: spacing,
  
  // Радиусы скругления (остаются теми же)
  borderRadius: borderRadius,
  
  // Анимации (улучшенные для новой схемы)
  animation: {
    duration: animation.duration,
    easing: animation.easing,
    keyframes: animation.keyframes,
    // Добавляем новые анимации для улучшенного UX
    shimmer: animation.shimmer,
    float: animation.float,
    wiggle: animation.wiggle,
    slideFadeIn: animation.slideFadeIn,
  },
  
  // Точки останова для адаптивности (остаются теми же)
  breakpoints: breakpoints,
  
  // Z-индексы (остаются теми же)
  zIndex: zIndex,
  
  // Непрозрачность (остается той же)
  opacity: opacity,
  
  // Тени для глубины (остаются теми же)
  elevation: elevation,
  
  // Стили для форм (остаются теми же)
  form: {
    ...form,
    // Добавляем стили для наших компонентов форм (темная версия)
    input: `
      width: 100%;
      padding: ${spacing[3]} ${spacing[4]};
      border: 1px solid ${colors.border.mediumDark};
      border-radius: ${borderRadius.md};
      font-size: ${typography.fontSize.sm};
      background-color: ${colors.surface.dark};
      color: ${colors.text.primary};
      transition: all ${transitions.normal};
      
      &:focus {
        outline: none;
        border-color: ${colors.primary};
        box-shadow: 0 0 0 3px ${opacity['20']};
      }
      
      &:disabled {
        background-color: ${colors.surface.darkTertiary};
        cursor: not-allowed;
        opacity: 0.6;
      }
      
      &.error {
        border-color: ${colors.error};
      }
      
      &.success {
        border-color: ${colors.success};
      }
    `,
  },
  
  // Стили для карточек (остаются теми же)
  card: {
    ...card,
    // Добавляем стили для наших компонентов карточек (темная версия)
    base: `
      background-color: ${colors.surface.dark};
      border-radius: ${borderRadius.lg};
      box-shadow: ${colors.shadow.dark};
      transition: all ${transitions.normal};
      overflow: hidden;
      
      &:hover {
        box-shadow: ${colors.shadow.lg};
        transform: translateY(-2px);
      }
    `,
    header: `
      padding: ${spacing[4]};
      border-bottom: 1px solid ${colors.border.mediumDark};
    `,
    body: `
      padding: ${spacing[4]};
    `,
    footer: `
      padding: ${spacing[4]};
      border-top: 1px solid ${colors.border.mediumDark};
    `,
    image: `
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: ${borderRadius.md} ${borderRadius.md} 0 0;
    `,
    badge: `
      position: absolute;
      top: ${spacing[3]};
      right: ${spacing[3]};
      padding: ${spacing[1]} ${spacing[3]};
      border-radius: ${borderRadius.full};
      font-size: ${typography.fontSize.xs};
      font-weight: ${typography.fontWeight.medium};
    `,
  },
  
  // Утилиты (остаются теми же)
  utils: {
    ...utils,
    // Добавляем утилиты для наших компонентов (темная версия)
    tooltip: `
      position: relative;
      
      .tooltip-content {
        position: absolute;
        background-color: ${colors.surface.dark};
        color: ${colors.text.primary};
        padding: ${spacing[2]} ${spacing[3]};
        border-radius: ${borderRadius.md};
        font-size: ${typography.fontSize.xs};
        white-space: nowrap;
        z-index: ${zIndex.tooltip};
        opacity: 0;
        pointer-events: none;
        transition: opacity ${transitions.normal};
        box-shadow: ${colors.shadow.dark};
        
        &::before {
          content: '';
          position: absolute;
          width: 0;
          height: 0;
        }
      }
      
      &:hover .tooltip-content {
        opacity: 1;
      }
    `,
    
    avatar: `
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid ${colors.border.mediumDark};
      
      &.small {
        width: 32px;
        height: 32px;
      }
      
      &.large {
        width: 48px;
        height: 48px;
      }
      
      &.circle {
        border-radius: 50%;
      }
      
      &.square {
        border-radius: ${borderRadius.md};
      }
    `,
    
    badge: `
      display: inline-flex;
      align-items: center;
      padding: ${spacing[1]} ${spacing[3]};
      border-radius: ${borderRadius.full};
      font-size: ${typography.fontSize.xs};
      font-weight: ${typography.fontWeight.medium};
      line-height: 1;
      
      &.primary {
        background-color: ${colors.primary};
        color: ${colors.text.inverse};
      }
      
      &.secondary {
        background-color: ${colors.secondary};
        color: ${colors.text.inverse};
      }
      
      &.success {
        background-color: ${colors.success};
        color: ${colors.text.inverse};
      }
      
      &.warning {
        background-color: ${colors.warning};
        color: ${colors.text.inverse};
      }
      
      &.error {
        background-color: ${colors.error};
        color: ${colors.text.inverse};
      }
      
      &.info {
        background-color: ${colors.info};
        color: ${colors.text.inverse};
      }
      
      &.ghost {
        background-color: transparent;
        color: ${colors.text.secondary};
        border: 1px solid ${colors.border.mediumDark};
      }
      
      &.pill {
        border-radius: ${borderRadius.full};
      }
      
      &.dot {
        padding: ${spacing[1]};
        border-radius: 50%;
        width: 8px;
        height: 8px;
        min-width: 8px;
        min-height: 8px;
      }
      
      &.with-icon {
        padding-left: ${spacing[2]};
      }
    `,
  },
  
  // Дополнительные настройки
  transitions: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease',
    slower: '700ms ease',
  },
  
  // Отступы для контейнера (остаются теми же)
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// Утилиты для работы с темой
export const getTheme = (isDark = false) => isDark ? darkTheme : lightTheme;

// Медиа-запросы
export const media = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
  
  maxSm: `@media (max-width: ${breakpoints.maxSm})`,
  maxMd: `@media (max-width: ${breakpoints.maxMd})`,
  maxLg: `@media (max-width: ${breakpoints.maxLg})`,
  maxXl: `@media (max-width: ${breakpoints.maxXl})`,
  max2xl: `@media (max-width: ${breakpoints.max2xl})`,
  
  // Специальные медиа-запросы
  hover: `@media (hover: hover)`,
  pointer: `@media (pointer: fine)`,
  coarse: `@media (pointer: coarse)`,
  reducedMotion: `@media (prefers-reduced-motion: reduce)`,
  darkMode: `@media (prefers-color-scheme: dark)`,
  lightMode: `@media (prefers-color-scheme: light)`,
  portrait: `@media (orientation: portrait)`,
  landscape: `@media (orientation: landscape)`,
};

// Миксины для часто используемых стилей
export const mixins = {
  // Flexbox
  flexCenter: `
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  
  flexBetween: `
    display: flex;
    align-items: center;
    justify-content: space-between;
  `,
  
  flexAround: `
    display: flex;
    align-items: center;
    justify-content: space-around;
  `,
  
  flexEvenly: `
    display: flex;
    align-items: center;
    justify-content: space-evenly;
  `,
  
  // Position
  absoluteCenter: `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `,
  
  // Text
  truncateText: `
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  
  // Scrollbar
  hideScrollbar: `
    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  `,
  
  // Grid
  gridCenter: `
    display: grid;
    place-items: center;
  `,
  
  // Анимации
  fadeIn: `
    animation: fadeIn 0.3s ease-in-out;
  `,
  
  slideInUp: `
    animation: slideInUp 0.3s ease-out;
  `,
  
  slideInDown: `
    animation: slideInDown 0.3s ease-out;
  `,
  
  slideInLeft: `
    animation: slideInLeft 0.3s ease-out;
  `,
  
  slideInRight: `
    animation: slideInRight 0.3s ease-out;
  `,
  
  scaleIn: `
    animation: scaleIn 0.3s ease-out;
  `,
  
  pulse: `
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  `,
  
  spin: `
    animation: spin 1s linear infinite;
  `,
  
  // Hover effects
  hoverLift: `
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${elevation[2]};
    }
  `,
  
  hoverScale: `
    transition: transform 0.2s ease;
    &:hover {
      transform: scale(1.05);
    }
  `,
  
  // Focus styles
  focusVisible: `
    &:focus-visible {
      outline: 2px solid ${lightTheme.colors.primary};
      outline-offset: 2px;
    }
  `,
  
  // Responsive container
  container: `
    max-width: ${lightTheme.container.lg};
    margin: 0 auto;
    padding-left: ${spacing[4]};
    padding-right: ${spacing[4]};
    
    ${media.sm} {
      padding-left: ${spacing[6]};
      padding-right: ${spacing[6]};
    }
    
    ${media.lg} {
      padding-left: ${spacing[8]};
      padding-right: ${spacing[8]};
    }
  `,
};

// Функции для работы с цветами
export const colorUtils = {
  // Получение оттенка цвета
  getShade: (color, percent) => {
    // Реализация функции для получения оттенка цвета
    // Это упрощенная версия, в реальном проекте лучше использовать библиотеку типа chroma-js
    return color;
  },
  
  // Получение прозрачности цвета
  withOpacity: (color, opacity) => {
    // Реализация функции для добавления прозрачности к цвету
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  },
  
  // Проверка контрастности
  getContrastRatio: (color1, color2) => {
    // Реализация функции для расчета контрастности
    // Это упрощенная версия, в реальном проекте лучше использовать библиотеку типа chroma-js
    return 4.5; // Возвращаем примерное значение
  },
  
  // Определение контрастного цвета
  getContrastColor: (color) => {
    // Простая реализация для определения контрастного цвета
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? '#000000' : '#FFFFFF';
    }
    return '#000000';
  },
};

// Экспорт всех тем для удобства
export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

// Экспорт всех утилит
export const themeUtils = {
  ...mixins,
  ...colorUtils,
  media,
};
