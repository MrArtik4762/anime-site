import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { styled } from 'styled-components';

// Стилизованный компонент для прогресс-бара
const StyledProgressBar = styled.div`
  width: 100%;
  height: ${props => {
    if (props.size === 'small') return props.theme.sizes.progressHeightSmall;
    if (props.size === 'large') return props.theme.sizes.progressHeightLarge;
    return props.theme.sizes.progressHeight;
  }};
  background-color: ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.border.radius.sm};
  overflow: hidden;
  position: relative;
  
  ${props => props.animated && `
    position: relative;
    overflow: visible;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
      );
      background-size: ${props.theme.sizes.progressStripesSize};
      animation: progress-bar-stripes ${props.theme.animations.progressDuration} linear infinite;
    }
  `}
  
  ${props => props.striped && `
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: ${props.theme.sizes.progressStripesSize};
  `}
  
  ${props => props.variant === 'success' && `
    background-color: ${props.theme.colors.successBg};
  `}
  
  ${props => props.variant === 'warning' && `
    background-color: ${props.theme.colors.warningBg};
  `}
  
  ${props => props.variant === 'error' && `
    background-color: ${props.theme.colors.errorBg};
  `}
  
  ${props => props.variant === 'info' && `
    background-color: ${props.theme.colors.infoBg};
  `}
  
  ${props => props.showValue && `
    position: relative;
    
    &::after {
      content: '${props => props.value}%';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: ${props => props.theme.colors.text};
      font-size: ${props.theme.fontSizes.sm};
      font-weight: ${props.theme.fontWeights.semibold};
      text-shadow: 0 0 3px rgba(255, 255, 255, 0.5);
    }
  `}
  
  ${props => props.size === 'small' && `
    height: ${props.theme.sizes.progressHeightSmall};
    
    ${props => props.showValue && `
      &::after {
        font-size: ${props.theme.fontSizes.xs};
      }
    `}
  `}
  
  ${props => props.size === 'large' && `
    height: ${props.theme.sizes.progressHeightLarge};
    
    ${props => props.showValue && `
      &::after {
        font-size: ${props.theme.fontSizes.base};
      }
    `}
  `}
  
  @keyframes progress-bar-stripes {
    0% {
      background-position: 40px 0;
    }
    100% {
      background-position: 0 0;
    }
  }
`;

// Стилизованный заполнитель прогресса
const ProgressFill = styled.div`
  height: 100%;
  background-color: ${props => {
    if (props.variant === 'success') return props.theme.colors.success;
    if (props.variant === 'warning') return props.theme.colors.warning;
    if (props.variant === 'error') return props.theme.colors.error;
    if (props.variant === 'info') return props.theme.colors.info;
    return props.theme.colors.primary;
  }};
  border-radius: ${props => props.theme.border.radius.sm};
  transition: width ${props => props.theme.transitions.medium} ease;
  
  ${props => props.animated && `
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: ${props.theme.sizes.progressStripesSize};
    animation: progress-bar-stripes ${props.theme.animations.progressDuration} linear infinite;
  `}
  
  ${props => props.striped && `
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: ${props.theme.sizes.progressStripesSize};
  `}
  
  ${props => props.multicolor && `
    background: linear-gradient(
      to right,
      ${props.theme.colors.primary} 0%,
      ${props.theme.colors.info} 33%,
      ${props.theme.colors.success} 66%,
      ${props.theme.colors.warning} 100%
    );
  `}
  
  ${props => props.size === 'small' && `
    height: ${props.theme.sizes.progressHeightSmall};
  `}
  
  ${props => props.size === 'large' && `
    height: ${props.theme.sizes.progressHeightLarge};
  `}
`;

// Стилизованный контейнер для прогресса
const ProgressContainer = styled.div`
  width: 100%;
  margin-bottom: ${props => props.theme.spacing.medium};
  
  ${props => props.multi && `
    display: flex;
    flex-direction: column;
    gap: ${props.theme.spacing.small};
  `}
  
  ${props => props.vertical && `
    display: flex;
    flex-direction: row;
    align-items: center;
    height: ${props => props.theme.sizes.progressVerticalHeight};
    
    ${props => props.multi && `
      flex-direction: column;
      height: auto;
    `}
  `}
  
  ${props => props.stacked && `
    position: relative;
    height: ${props => {
      if (props.size === 'small') return props.theme.sizes.progressHeightSmall;
      if (props.size === 'large') return props.theme.sizes.progressHeightLarge;
      return props.theme.sizes.progressHeight;
    }};
    
    > div {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      border-radius: ${props => props.theme.border.radius.sm};
    }
  `}
`;

// Стилизованный контейнер для кольцевого прогресса
const CircularProgressContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  svg {
    transform: rotate(-90deg);
  }
`;

// Стилизованный фон кольцевого прогресса
const CircularProgressBackground = styled.circle`
  fill: none;
  stroke: ${props => props.theme.colors.border};
  stroke-width: ${props => props.size === 'small' ? 4 : props.size === 'large' ? 8 : 6};
`;

// Стилизованный прогресс кольца
const CircularProgressValue = styled.circle`
  fill: none;
  stroke: ${props => {
    if (props.variant === 'success') return props.theme.colors.success;
    if (props.variant === 'warning') return props.theme.colors.warning;
    if (props.variant === 'error') return props.theme.colors.error;
    if (props.variant === 'info') return props.theme.colors.info;
    return props.theme.colors.primary;
  }};
  stroke-width: ${props => props.size === 'small' ? 4 : props.size === 'large' ? 8 : 6};
  stroke-linecap: round;
  transition: stroke-dashoffset ${props => props.theme.transitions.medium} ease;
  
  ${props => props.animated && `
    animation: progress-circle ${props.theme.animations.progressDuration} ease-in-out infinite;
  `}
  
  ${props => props.striped && `
    stroke-dasharray: ${props.theme.sizes.progressStripesSize};
    stroke-dashoffset: 0;
  `}
`;

// Стилизованный текст для кольцевого прогресса
const CircularProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: ${props => {
    if (props.size === 'small') return props.theme.fontSizes.sm;
    if (props.size === 'large') return props.theme.fontSizes.xl;
    return props.theme.fontSizes.base;
  }};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
`;

// Основной компонент ProgressBar
export const ProgressBar = memo(({
  value = 0,
  max = 100,
  animated = false,
  striped = false,
  showValue = false,
  variant = 'primary',
  size = 'medium',
  className,
  style,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <StyledProgressBar
      value={Math.round(percentage)}
      animated={animated}
      striped={striped}
      showValue={showValue}
      variant={variant}
      size={size}
      className={className}
      style={style}
      {...props}
    >
      <ProgressFill
        width={`${percentage}%`}
        animated={animated}
        striped={striped}
        variant={variant}
        size={size}
      />
    </StyledProgressBar>
  );
});

ProgressBar.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  animated: PropTypes.bool,
  striped: PropTypes.bool,
  showValue: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'success', 'warning', 'error', 'info']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для вертикального прогресса
export const VerticalProgressBar = memo(({
  value = 0,
  max = 100,
  animated = false,
  striped = false,
  showValue = false,
  variant = 'primary',
  size = 'medium',
  className,
  style,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <ProgressContainer
      vertical
      className={className}
      style={style}
      {...props}
    >
      <StyledProgressBar
        value={Math.round(percentage)}
        animated={animated}
        striped={striped}
        showValue={showValue}
        variant={variant}
        size={size}
        style={{ width: '100%', height: 'auto' }}
      >
        <ProgressFill
          width={`${percentage}%`}
          animated={animated}
          striped={striped}
          variant={variant}
          size={size}
        />
      </StyledProgressBar>
      <div style={{ marginLeft: '10px', fontSize: '14px' }}>
        {Math.round(percentage)}%
      </div>
    </ProgressContainer>
  );
});

VerticalProgressBar.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  animated: PropTypes.bool,
  striped: PropTypes.bool,
  showValue: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'success', 'warning', 'error', 'info']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для многоуровневого прогресса
export const MultiProgressBar = memo(({
  values = [],
  labels = [],
  animated = false,
  striped = false,
  showValue = false,
  variant = 'primary',
  size = 'medium',
  className,
  style,
  ...props
}) => {
  const total = values.reduce((sum, val) => sum + val, 0);
  
  return (
    <ProgressContainer
      multi
      className={className}
      style={style}
      {...props}
    >
      {values.map((value, index) => (
        <div key={index}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px' }}>{labels[index] || `Item ${index + 1}`}</span>
            <span style={{ fontSize: '12px' }}>{value}%</span>
          </div>
          <ProgressBar
            value={value}
            animated={animated}
            striped={striped}
            showValue={false}
            variant={variant}
            size={size}
          />
        </div>
      ))}
    </ProgressContainer>
  );
});

MultiProgressBar.propTypes = {
  values: PropTypes.arrayOf(PropTypes.number),
  labels: PropTypes.arrayOf(PropTypes.string),
  animated: PropTypes.bool,
  striped: PropTypes.bool,
  showValue: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'success', 'warning', 'error', 'info']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для стопки прогресса
export const StackedProgressBar = memo(({
  values = [],
  variants = ['primary', 'success', 'warning', 'error', 'info'],
  animated = false,
  striped = false,
  showValue = false,
  size = 'medium',
  className,
  style,
  ...props
}) => {
  const total = values.reduce((sum, val) => sum + val, 0);
  
  return (
    <ProgressContainer
      stacked
      className={className}
      style={style}
      {...props}
    >
      {values.map((value, index) => (
        <ProgressFill
          key={index}
          width={`${(value / total) * 100}%`}
          animated={animated}
          striped={striped}
          variant={variants[index % variants.length]}
          size={size}
        />
      ))}
    </ProgressContainer>
  );
});

StackedProgressBar.propTypes = {
  values: PropTypes.arrayOf(PropTypes.number),
  variants: PropTypes.arrayOf(PropTypes.oneOf(['primary', 'success', 'warning', 'error', 'info'])),
  animated: PropTypes.bool,
  striped: PropTypes.bool,
  showValue: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для кольцевого прогресса
export const CircularProgress = memo(({
  value = 0,
  max = 100,
  animated = false,
  striped = false,
  showValue = true,
  variant = 'primary',
  size = 'medium',
  className,
  style,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = size === 'small' ? 20 : size === 'large' ? 40 : 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <CircularProgressContainer
      size={size}
      className={className}
      style={style}
      {...props}
    >
      <svg width={radius * 2 + 10} height={radius * 2 + 10}>
        <CircularProgressBackground
          r={radius}
          cx={radius + 5}
          cy={radius + 5}
          size={size}
        />
        <CircularProgressValue
          r={radius}
          cx={radius + 5}
          cy={radius + 5}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          animated={animated}
          striped={striped}
          variant={variant}
          size={size}
        />
      </svg>
      {showValue && (
        <CircularProgressText size={size}>
          {Math.round(percentage)}%
        </CircularProgressText>
      )}
    </CircularProgressContainer>
  );
});

CircularProgress.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  animated: PropTypes.bool,
  striped: PropTypes.bool,
  showValue: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'success', 'warning', 'error', 'info']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для спиннера загрузки
export const ProgressSpinner = memo(({
  size = 'medium',
  variant = 'primary',
  className,
  style,
  ...props
}) => {
  const spinnerSize = size === 'small' ? 20 : size === 'large' ? 40 : 30;
  
  return (
    <div
      className={className}
      style={{
        display: 'inline-block',
        width: spinnerSize,
        height: spinnerSize,
        border: `${size === 'small' ? 2 : size === 'large' ? 4 : 3}px solid ${variant === 'primary' ? 'var(--primary-color)' : 
          variant === 'success' ? 'var(--success-color)' : 
          variant === 'warning' ? 'var(--warning-color)' : 
          variant === 'error' ? 'var(--error-color)' : 
          'var(--info-color)'}`,
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        ...style
      }}
      {...props}
    />
  );
});

ProgressSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['primary', 'success', 'warning', 'error', 'info']),
  className: PropTypes.string,
  style: PropTypes.object,
};

export default ProgressBar;