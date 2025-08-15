import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

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
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
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
      spin: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `,
      pulse: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `,
      bounce: `
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `,
      shimmer: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `
    }
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  }
};

// Контейнер для индикатора загрузки
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.padding || spacing.lg};
  min-height: ${props => props.minHeight || '100px'};
  width: 100%;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
    border-radius: ${spacing.md};
    z-index: -1;
  }
`;

// Спиннер
const Spinner = styled.div`
  width: ${props => {
    switch (props.size) {
      case 'small': return '24px';
      case 'large': return '64px';
      default: return '40px';
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'small': return '24px';
      case 'large': return '64px';
      default: return '40px';
    }
  }};
  border-radius: 50%;
  background: ${gradients.primary};
  position: relative;
  animation: spin 1s linear infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    bottom: 4px;
    background: ${props => props.theme.colors.surface.primary};
    border-radius: 50%;
    z-index: -1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    height: 60%;
    background: ${props => props.theme.colors.surface.secondary};
    border-radius: 50%;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  ${animations.keyframes.spin}
`;

// Текст загрузки
const LoadingText = styled.div`
  margin-top: ${spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.sm[0]};
  color: ${props => props.theme.colors.text.secondary};
  text-align: center;
  font-weight: 500;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  background: linear-gradient(135deg, ${props => props.theme.colors.text.primary} 0%, ${props => props.theme.colors.text.secondary} 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 2s ease-in-out infinite;
`;

// Точки анимации
const Dots = styled.div`
  display: flex;
  gap: ${spacing.sm};
  
  span {
    width: ${props => {
      switch (props.size) {
        case 'small': return '8px';
        case 'large': return '12px';
        default: return '10px';
      }
    }};
    height: ${props => {
      switch (props.size) {
        case 'small': return '8px';
        case 'large': return '12px';
        default: return '10px';
      }
    }};
    background: ${gradients.primary};
    border-radius: 50%;
    box-shadow: ${shadows.md};
    animation: bounce 1.4s infinite ease-in-out both;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%);
      border-radius: 50%;
      animation: shimmer 1.5s ease-in-out infinite;
    }
    
    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
    
    &:nth-child(3) {
      animation-delay: 0s;
    }
    
    ${animations.keyframes.bounce}
    ${animations.keyframes.shimmer}
  }
`;

// Линии анимации
const Bars = styled.div`
  display: flex;
  gap: ${spacing.sm};
  
  span {
    width: ${props => {
      switch (props.size) {
        case 'small': return '4px';
        case 'large': return '8px';
        default: return '6px';
      }
    }};
    height: ${props => {
      switch (props.size) {
        case 'small': return '16px';
        case 'large': return '32px';
        default: return '24px';
      }
    }};
    background: ${gradients.primary};
    border-radius: ${spacing.xs};
    box-shadow: ${shadows.md};
    animation: stretch 1.2s infinite ease-in-out;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%);
      border-radius: ${spacing.xs};
      animation: shimmer 1.5s ease-in-out infinite;
    }
    
    &:nth-child(1) {
      animation-delay: -1.2s;
      height: ${props => {
        switch (props.size) {
          case 'small': return '12px';
          case 'large': return '24px';
          default: return '18px';
        }
      }};
    }
    
    &:nth-child(2) {
      animation-delay: -1.1s;
      height: ${props => {
        switch (props.size) {
          case 'small': return '20px';
          case 'large': return '36px';
          default: return '28px';
        }
      }};
    }
    
    &:nth-child(3) {
      animation-delay: -1s;
      height: ${props => {
        switch (props.size) {
          case 'small': return '16px';
          case 'large': return '32px';
          default: return '24px';
        }
      }};
    }
    
    &:nth-child(4) {
      animation-delay: -0.9s;
      height: ${props => {
        switch (props.size) {
          case 'small': return '24px';
          case 'large': return '40px';
          default: return '32px';
        }
      }};
    }
    
    &:nth-child(5) {
      animation-delay: -0.8s;
      height: ${props => {
        switch (props.size) {
          case 'small': return '18px';
          case 'large': return '32px';
          default: return '26px';
        }
      }};
    }
    
    @keyframes stretch {
      0%, 40%, 100% {
        transform: scaleY(0.4);
      }
      20% {
        transform: scaleY(1);
      }
    }
    
    ${animations.keyframes.shimmer}
  }
`;

// Круговая прогресс-бар
const CircularProgress = styled.div`
  position: relative;
  width: ${props => {
    switch (props.size) {
      case 'small': return '48px';
      case 'large': return '80px';
      default: return '64px';
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'small': return '48px';
      case 'large': return '80px';
      default: return '64px';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${gradients.primary};
    border-radius: 50%;
    opacity: 0.1;
    z-index: -1;
  }
  
  svg {
    transform: rotate(-90deg);
    width: 100%;
    height: 100%;
  }
  
  circle {
    fill: none;
    stroke-width: ${props => {
      switch (props.size) {
        case 'small': return '3';
        case 'large': return '6';
        default: return '4';
      }
    }};
    stroke-linecap: round;
  }
  
  .background {
    stroke: ${props => props.theme.colors.border.light};
    opacity: 0.2;
  }
  
  .progress {
    stroke: ${gradients.primary};
    stroke-dasharray: ${props => props.circumference};
    stroke-dashoffset: ${props => props.circumference * (1 - props.percentage / 100)};
    animation: progress 1s ease-out forwards;
    filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.5));
  }
  
  @keyframes progress {
    0% {
      stroke-dashoffset: ${props => props.circumference};
    }
    100% {
      stroke-dashoffset: ${props => props.circumference * (1 - props.percentage / 100)};
    }
  }
`;

// Компонент Loading
const Loading = ({
  type = 'spinner',
  size = 'medium',
  text,
  percentage,
  className = '',
  ...props
}) => {
  const renderLoading = () => {
    switch (type) {
      case 'spinner':
        return <Spinner size={size} />;
      
      case 'dots':
        return (
          <Dots size={size}>
            <span></span>
            <span></span>
            <span></span>
          </Dots>
        );
      
      case 'bars':
        return (
          <Bars size={size}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </Bars>
        );
      
      case 'progress':
        if (percentage === undefined) return null;
        
        const radius = size === 'small' ? 16 : size === 'medium' ? 24 : 32;
        const strokeWidth = size === 'small' ? 3 : size === 'medium' ? 4 : 5;
        const normalizedRadius = radius - strokeWidth * 2;
        const circumference = normalizedRadius * 2 * Math.PI;
        
        return (
          <CircularProgress
            size={size}
            percentage={percentage}
            circumference={circumference}
            {...props}
          >
            <svg width={radius * 2} height={radius * 2}>
              <circle
                className="background"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                className="progress"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </svg>
          </CircularProgress>
        );
      
      default:
        return <Spinner size={size} />;
    }
  };
  
  return (
    <LoadingContainer className={`${className} loading ${type}`} {...props}>
      {renderLoading()}
      {text && <LoadingText>{text}</LoadingText>}
    </LoadingContainer>
  );
};

// Пропс-types для TypeScript
Loading.propTypes = {
  type: PropTypes.oneOf(['spinner', 'dots', 'bars', 'progress']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  text: PropTypes.string,
  percentage: PropTypes.number,
  className: PropTypes.string,
};

// Компонент OverlayLoading для загрузки поверх контента
const OverlayLoading = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme.colors.overlay};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: ${props => props.theme.zIndex.overlay};
`;

// Компонент OverlayLoading
const OverlayLoadingComponent = ({
  type = 'spinner',
  size = 'large',
  text,
  percentage,
  className = '',
  ...props
}) => {
  return (
    <OverlayLoading className={`${className} overlay-loading`} {...props}>
      <Loading
        type={type}
        size={size}
        text={text}
        percentage={percentage}
      />
    </OverlayLoading>
  );
};

// Пропс-types для OverlayLoading
OverlayLoadingComponent.propTypes = {
  type: PropTypes.oneOf(['spinner', 'dots', 'bars', 'progress']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  text: PropTypes.string,
  percentage: PropTypes.number,
  className: PropTypes.string,
};

// Компонент PageLoading для загрузки страницы
const PageLoading = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme.colors.surface.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: ${props => props.theme.zIndex.pageLoading};
`;

// Компонент PageLoading
const PageLoadingComponent = ({
  type = 'spinner',
  size = 'large',
  text,
  percentage,
  className = '',
  ...props
}) => {
  return (
    <PageLoading className={`${className} page-loading`} {...props}>
      <Loading
        type={type}
        size={size}
        text={text}
        percentage={percentage}
      />
    </PageLoading>
  );
};

// Пропс-types для PageLoading
PageLoadingComponent.propTypes = {
  type: PropTypes.oneOf(['spinner', 'dots', 'bars', 'progress']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  text: PropTypes.string,
  percentage: PropTypes.number,
  className: PropTypes.string,
};

// Компонент ButtonLoading для загрузки внутри кнопки
const ButtonLoading = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
`;

// Компонент ButtonLoading
const ButtonLoadingComponent = ({
  type = 'spinner',
  size = 'small',
  text = 'Загрузка...',
  className = '',
  ...props
}) => {
  return (
    <ButtonLoading className={`${className} button-loading`} {...props}>
      <Loading type={type} size={size} />
      <span>{text}</span>
    </ButtonLoading>
  );
};

// Пропс-types для ButtonLoading
ButtonLoadingComponent.propTypes = {
  type: PropTypes.oneOf(['spinner', 'dots', 'bars', 'progress']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  text: PropTypes.string,
  className: PropTypes.string,
};

// Экспорт компонентов
export {
  Loading,
  OverlayLoading as OverlayLoadingComponent,
  PageLoading as PageLoadingComponent,
  ButtonLoading as ButtonLoadingComponent,
};