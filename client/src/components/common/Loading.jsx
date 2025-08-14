import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Контейнер для индикатора загрузки
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.padding || props.theme.spacing[4]};
  min-height: ${props => props.minHeight || '100px'};
  width: 100%;
`;

// Спиннер
const Spinner = styled.div`
  width: ${props => props.size === 'small' ? '20px' : props.size === 'medium' ? '40px' : '60px'};
  height: ${props => props.size === 'small' ? '20px' : props.size === 'medium' ? '40px' : '60px'};
  border: ${props => props.size === 'small' ? '2px' : props.size === 'medium' ? '3px' : '4px'} solid ${props => props.theme.colors.border.light};
  border-top-color: ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// Текст загрузки
const LoadingText = styled.div`
  margin-top: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.typography.fontSize.sm[0]};
  color: ${props => props.theme.colors.text.tertiary};
  text-align: center;
`;

// Точки анимации
const Dots = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[1]};
  
  span {
    width: ${props => props.size === 'small' ? '6px' : props.size === 'medium' ? '8px' : '10px'};
    height: ${props => props.size === 'small' ? '6px' : props.size === 'medium' ? '8px' : '10px'};
    background-color: ${props => props.theme.colors.primary};
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
    
    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
    
    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }
  }
`;

// Линии анимации
const Bars = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[1]};
  
  span {
    width: ${props => props.size === 'small' ? '4px' : props.size === 'medium' ? '6px' : '8px'};
    height: ${props => props.size === 'small' ? '12px' : props.size === 'medium' ? '16px' : '20px'};
    background-color: ${props => props.theme.colors.primary};
    animation: stretch 1.2s infinite ease-in-out;
    
    &:nth-child(1) {
      animation-delay: -1.2s;
    }
    
    &:nth-child(2) {
      animation-delay: -1.1s;
    }
    
    &:nth-child(3) {
      animation-delay: -1s;
    }
    
    &:nth-child(4) {
      animation-delay: -0.9s;
    }
    
    &:nth-child(5) {
      animation-delay: -0.8s;
    }
    
    @keyframes stretch {
      0%, 40%, 100% {
      transform: scaleY(0.4);
    }
    20% {
      transform: scaleY(1);
    }
  }
`;

// Круговая прогресс-бар
const CircularProgress = styled.div`
  position: relative;
  width: ${props => props.size === 'small' ? '40px' : props.size === 'medium' ? '60px' : '80px'};
  height: ${props => props.size === 'small' ? '40px' : props.size === 'medium' ? '60px' : '80px'};
  
  svg {
    transform: rotate(-90deg);
  }
  
  circle {
    fill: none;
    stroke-width: ${props => props.size === 'small' ? '3' : props.size === 'medium' ? '4' : '5'};
    stroke-linecap: round;
  }
  
  .background {
    stroke: ${props => props.theme.colors.border.light};
  }
  
  .progress {
    stroke: ${props => props.theme.colors.primary};
    stroke-dasharray: ${props => props.circumference};
    stroke-dashoffset: ${props => props.circumference * (1 - props.percentage / 100)};
    animation: progress 1s ease-out forwards;
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