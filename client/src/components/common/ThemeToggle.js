import React from 'react';
import { styled } from 'styled-components';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';

// Дополнительные стили для современного ThemeToggle
const { spacing, colors, gradients, animations, shadows } = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#94a3b8'
    },
    surface: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9'
    },
    border: {
      light: '#e2e8f0',
      medium: '#cbd5e1',
      heavy: '#94a3b8'
    }
  },
  gradients: {
    primary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    secondary: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
    accent: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    sun: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    moon: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
  },
  animations: {
    durations: {
      fast: '0.15s',
      normal: '0.3s',
      slow: '0.5s'
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0, 1)'
    },
    keyframes: {
      rotate: `
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `,
      pulse: `
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
      `
    }
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(59, 130, 246, 0.5)'
  }
};

// Контейнер переключателя
const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

// Кнопка переключателя
const ToggleButton = styled(motion.button)`
  position: relative;
  width: ${props => props.size === 'small' ? '48px' : props.size === 'large' ? '64px' : '56px'};
  height: ${props => props.size === 'small' ? '24px' : props.size === 'large' ? '32px' : '28px'};
  background: ${props => props.isDark ? gradients.moon : gradients.sun};
  border: none;
  border-radius: ${props => props.size === 'small' ? '12px' : props.size === 'large' ? '16px' : '14px'};
  cursor: pointer;
  transition: all ${animations.durations.normal} ${animations.easing.ease};
  outline: none;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
    border-radius: inherit;
    opacity: 0;
    transition: opacity ${animations.durations.normal} ${animations.easing.ease};
  }
  
  &:hover {
    transform: scale(1.02);
    box-shadow: ${shadows.md};
  }
  
  &:hover::before {
    opacity: 1;
  }
  
  &:focus {
    box-shadow: 0 0 0 3px ${colors.primary}40;
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

// Переключатель
const ToggleThumb = styled(motion.div)`
  position: absolute;
  top: ${props => props.size === 'small' ? '2px' : props.size === 'large' ? '4px' : '2px'};
  left: ${props => props.isDark ?
    (props.size === 'small' ? '26px' : props.size === 'large' ? '36px' : '30px') :
    (props.size === 'small' ? '2px' : props.size === 'large' ? '4px' : '2px')
  };
  width: ${props => props.size === 'small' ? '20px' : props.size === 'large' ? '24px' : '22px'};
  height: ${props => props.size === 'small' ? '20px' : props.size === 'large' ? '24px' : '22px'};
  background: ${props => props.theme.colors.surface.primary};
  border-radius: 50%;
  box-shadow: ${shadows.md};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${animations.durations.normal} ${animations.easing.ease};
`;

// Иконка солнца
const SunIcon = styled.svg`
  width: ${props => props.size === 'small' ? '10px' : props.size === 'large' ? '14px' : '12px'};
  height: ${props => props.size === 'small' ? '10px' : props.size === 'large' ? '14px' : '12px'};
  color: ${props => props.theme.colors.warning};
  
  animation: ${animations.keyframes.rotate} 20s linear infinite;
`;

// Иконка луны
const MoonIcon = styled.svg`
  width: ${props => props.size === 'small' ? '10px' : props.size === 'large' ? '14px' : '12px'};
  height: ${props => props.size === 'small' ? '10px' : props.size === 'large' ? '14px' : '12px'};
  color: ${props => props.theme.colors.accent};
`;

// Подпись
const ToggleLabel = styled.span`
  font-size: ${props => props.size === 'small' ? '12px' : props.size === 'large' ? '16px' : '14px'};
  font-weight: 500;
  color: ${props => props.theme.colors.text.secondary};
  user-select: none;
  transition: color ${animations.durations.normal} ${animations.easing.ease};
`;

const ThemeToggle = ({ showLabel = true, size = 'medium' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const handleToggle = () => {
    toggleTheme();
  };

  return (
    <ToggleContainer>
      {showLabel && (
        <ToggleLabel size={size}>
          {isDarkMode ? 'Темная' : 'Светлая'}
        </ToggleLabel>
      )}
      
      <ToggleButton
        size={size}
        isDark={isDarkMode}
        onClick={handleToggle}
        aria-label={`Переключить на ${isDarkMode ? 'светлую' : 'темную'} тему`}
        title={`Переключить на ${isDarkMode ? 'светлую' : 'темную'} тему`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ToggleThumb
          size={size}
          isDark={isDarkMode}
          animate={{ x: isDarkMode ?
            (size === 'small' ? 24 : size === 'large' ? 32 : 28) : 0
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        >
          {isDarkMode ? (
            <MoonIcon
              size={size}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </MoonIcon>
          ) : (
            <SunIcon
              size={size}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2m0 16v2M4.22 4.22l1.42 1.42m11.31 11.31l1.42 1.42M1 12h2m16 0h2M4.22 19.78l1.42-1.42m11.31-11.31l1.42-1.42" />
            </SunIcon>
          )}
        </ToggleThumb>
      </ToggleButton>
    </ToggleContainer>
  );
};

// Компактная версия переключателя для мобильных устройств
export const CompactThemeToggle = ({ size = 'medium' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const CompactButton = styled(motion.button)`
    width: ${props => props.size === 'small' ? '40px' : props.size === 'large' ? '56px' : '48px'};
    height: ${props => props.size === 'small' ? '40px' : props.size === 'large' ? '56px' : '48px'};
    border-radius: 50%;
    border: 1px solid ${props => props.theme.colors.border};
    background: ${props => props.theme.colors.surface};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all ${animations.durations.normal} ${animations.easing.ease};
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
      border-radius: inherit;
      opacity: 0;
      transition: opacity ${animations.durations.normal} ${animations.easing.ease};
    }
    
    &:hover {
      background: ${props => props.theme.colors.surfaceSecondary};
      border-color: ${props => props.theme.colors.primary};
      transform: scale(1.05);
      box-shadow: ${shadows.md};
    }
    
    &:hover::before {
      opacity: 1;
    }
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px ${colors.primary}40;
    }
    
    &:active {
      transform: scale(0.95);
    }
  `;

  return (
    <CompactButton
      size={size}
      onClick={toggleTheme}
      aria-label={`Переключить на ${isDarkMode ? 'светлую' : 'темную'} тему`}
      title={`Переключить на ${isDarkMode ? 'светлую' : 'темную'} тему`}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
    >
      {isDarkMode ? (
        <MoonIcon
          size={size}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </MoonIcon>
      ) : (
        <SunIcon
          size={size}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2m0 16v2M4.22 4.22l1.42 1.42m11.31 11.31l1.42 1.42M1 12h2m16 0h2M4.22 19.78l1.42-1.42m11.31-11.31l1.42-1.42" />
        </SunIcon>
      )}
    </CompactButton>
  );
};

// Текстовая версия переключателя
export const TextThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const TextButton = styled(motion.button)`
    background: none;
    border: none;
    color: ${props => props.theme.colors.text.secondary};
    cursor: pointer;
    font-size: ${props => props.theme.typography.fontSize.sm[0]};
    font-weight: 500;
    padding: ${spacing.sm} ${spacing.md};
    border-radius: ${spacing.sm};
    transition: all ${animations.durations.normal} ${animations.easing.ease};
    display: flex;
    align-items: center;
    gap: ${spacing.sm};
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${props => props.theme.colors.surfaceSecondary};
      border-radius: inherit;
      opacity: 0;
      transition: opacity ${animations.durations.normal} ${animations.easing.ease};
      z-index: -1;
    }
    
    &:hover {
      color: ${props => props.theme.colors.primary};
    }
    
    &:hover::before {
      opacity: 1;
    }
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px ${colors.primary}40;
    }
    
    &:active {
      transform: scale(0.95);
    }
  `;

  return (
    <TextButton
      onClick={toggleTheme}
      aria-label={`Переключить на ${isDarkMode ? 'светлую' : 'темную'} тему`}
      whileTap={{ scale: 0.95 }}
      position="relative"
    >
      {isDarkMode ? (
        <>
          <MoonIcon size="small" />
          🌙 Темная тема
        </>
      ) : (
        <>
          <SunIcon size="small" />
          ☀️ Светлая тема
        </>
      )}
    </TextButton>
  );
};

// Компонент для отображения текущей темы
export const ThemeIndicator = ({ className = '' }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
      isDarkMode
        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
        : 'bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900'
    } ${className}`}>
      {isDarkMode ? (
        <>
          <MoonIcon size="small" />
          Тёмная тема
        </>
      ) : (
        <>
          <SunIcon size="small" />
          Светлая тема
        </>
      )}
    </div>
  );
};

export default ThemeToggle;
