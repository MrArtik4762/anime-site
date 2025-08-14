import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Линейный прогресс-бар
const LinearProgressContainer = styled.div`
  width: 100%;
  background-color: ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
  height: ${props => props.size === 'small' ? '4px' : props.size === 'medium' ? '8px' : '12px'};
  
  .progress-bar {
    height: 100%;
    background-color: ${props => {
      if (props.color) {
        return props.theme.colors[props.color];
      }
      
      switch (props.variant) {
        case 'primary':
          return props.theme.colors.primary;
        case 'success':
          return props.theme.colors.success;
        case 'danger':
          return props.theme.colors.danger;
        case 'warning':
          return props.theme.colors.warning;
        case 'info':
          return props.theme.colors.info;
        default:
          return props.theme.colors.primary;
      }
    }};
    border-radius: ${props => props.theme.borderRadius.full};
    transition: ${props => props.theme.transitions.normal};
    position: relative;
    overflow: hidden;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background-image: linear-gradient(
        -45deg,
        rgba(255, 255, 255, 0.2) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.2) 50%,
        rgba(255, 255, 255, 0.2) 75%,
        transparent 75%,
        transparent
      );
      background-size: 50px 50px;
      animation: progress-animation 1s linear infinite;
    }
  }
  
  @keyframes progress-animation {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 50px 50px;
    }
  }
`;

// Контейнер для прогресс-бара с меткой
const ProgressWithLabelContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  
  .progress-container {
    flex: 1;
  }
  
  .progress-label {
    font-size: ${props => props.theme.typography.fontSize.sm[0]};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    color: ${props => props.theme.colors.text.primary};
    min-width: ${props => props.showPercentage ? '45px' : 'auto'};
    text-align: ${props => props.showPercentage ? 'right' : 'left'};
  }
`;

// Круговой прогресс-бар
const CircularProgressContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  svg {
    transform: rotate(-90deg);
  }
  
  .progress-text {
    position: absolute;
    font-size: ${props => {
      if (props.size === 'small') return '12px';
      if (props.size === 'medium') return '16px';
      return '20px';
    }};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.theme.colors.text.primary};
  }
`;

// Компонент LinearProgress
const LinearProgress = ({
  value,
  max = 100,
  variant = 'primary',
  color,
  size = 'medium',
  showLabel = false,
  showPercentage = false,
  className = '',
  ...props
}) => {
  const percentage = Math.round((value / max) * 100);
  
  if (showLabel) {
    return (
      <ProgressWithLabelContainer
        showPercentage={showPercentage}
        className={`${className} progress-with-label`}
        {...props}
      >
        <div className="progress-container">
          <LinearProgressContainer
            value={value}
            max={max}
            variant={variant}
            color={color}
            size={size}
            className="linear-progress"
          >
            <div
              className="progress-bar"
              style={{ width: `${percentage}%` }}
            ></div>
          </LinearProgressContainer>
        </div>
        <div className="progress-label">
          {showPercentage && `${percentage}%`}
        </div>
      </ProgressWithLabelContainer>
    );
  }
  
  return (
    <LinearProgressContainer
      value={value}
      max={max}
      variant={variant}
      color={color}
      size={size}
      className={`${className} linear-progress`}
      {...props}
    >
      <div
        className="progress-bar"
        style={{ width: `${percentage}%` }}
      ></div>
    </LinearProgressContainer>
  );
};

// Пропс-types для LinearProgress
LinearProgress.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number,
  variant: PropTypes.oneOf(['primary', 'success', 'danger', 'warning', 'info']),
  color: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showLabel: PropTypes.bool,
  showPercentage: PropTypes.bool,
  className: PropTypes.string,
};

// Компонент CircularProgress
const CircularProgress = ({
  value,
  max = 100,
  variant = 'primary',
  color,
  size = 'medium',
  thickness = 10,
  showLabel = false,
  showPercentage = false,
  className = '',
  ...props
}) => {
  const percentage = Math.round((value / max) * 100);
  const radius = size === 'small' ? 20 : size === 'medium' ? 30 : 40;
  const normalizedRadius = radius - thickness / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  if (showLabel) {
    return (
      <ProgressWithLabelContainer
        showPercentage={showPercentage}
        className={`${className} circular-progress-with-label`}
        {...props}
      >
        <div className="progress-container">
          <CircularProgressContainer
            value={value}
            max={max}
            variant={variant}
            color={color}
            size={size}
            className="circular-progress"
          >
            <svg width={radius * 2} height={radius * 2}>
              <circle
                className="progress-background"
                stroke={props.theme.colors.border.light}
                strokeWidth={thickness}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                className="progress-bar"
                stroke={color ? props.theme.colors[color] : 
                        variant === 'primary' ? props.theme.colors.primary :
                        variant === 'success' ? props.theme.colors.success :
                        variant === 'danger' ? props.theme.colors.danger :
                        variant === 'warning' ? props.theme.colors.warning :
                        variant === 'info' ? props.theme.colors.info :
                        props.theme.colors.primary}
                strokeWidth={thickness}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                fill="transparent"
              />
            </svg>
            <div className="progress-text">{percentage}%</div>
          </CircularProgressContainer>
        </div>
        <div className="progress-label">
          {showPercentage && `${percentage}%`}
        </div>
      </ProgressWithLabelContainer>
    );
  }
  
  return (
    <CircularProgressContainer
      value={value}
      max={max}
      variant={variant}
      color={color}
      size={size}
      className={`${className} circular-progress`}
      {...props}
    >
      <svg width={radius * 2} height={radius * 2}>
        <circle
          className="progress-background"
          stroke={props.theme.colors.border.light}
          strokeWidth={thickness}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          className="progress-bar"
          stroke={color ? props.theme.colors[color] : 
                  variant === 'primary' ? props.theme.colors.primary :
                  variant === 'success' ? props.theme.colors.success :
                  variant === 'danger' ? props.theme.colors.danger :
                  variant === 'warning' ? props.theme.colors.warning :
                  variant === 'info' ? props.theme.colors.info :
                  props.theme.colors.primary}
          strokeWidth={thickness}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          fill="transparent"
        />
      </svg>
      {showLabel && (
        <div className="progress-text">{percentage}%</div>
      )}
    </CircularProgressContainer>
  );
};

// Пропс-types для CircularProgress
CircularProgress.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number,
  variant: PropTypes.oneOf(['primary', 'success', 'danger', 'warning', 'info']),
  color: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  thickness: PropTypes.number,
  showLabel: PropTypes.bool,
  showPercentage: PropTypes.bool,
  className: PropTypes.string,
};

// Компонент Progress для совместимости
const Progress = ({
  type = 'linear',
  ...props
}) => {
  if (type === 'circular') {
    return <CircularProgress {...props} />;
  }
  
  return <LinearProgress {...props} />;
};

// Пропс-types для Progress
Progress.propTypes = {
  type: PropTypes.oneOf(['linear', 'circular']),
  value: PropTypes.number.isRequired,
  max: PropTypes.number,
  variant: PropTypes.oneOf(['primary', 'success', 'danger', 'warning', 'info']),
  color: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  thickness: PropTypes.number,
  showLabel: PropTypes.bool,
  showPercentage: PropTypes.bool,
  className: PropTypes.string,
};

// Компонент ProgressSteps для шагового прогресса
const ProgressStepsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    
    &:not(:last-child) {
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        top: 15px;
        left: 50%;
        width: 100%;
        height: 2px;
        background-color: ${props => props.theme.colors.border.light};
        z-index: 0;
      }
      
      ${props => props.activeStep > props.stepIndex && `
        &::after {
          background-color: ${props => props.theme.colors.primary};
        }
      `}
    }
    
    .step-circle {
      width: ${props => props.theme.spacing[5]};
      height: ${props => props.theme.spacing[5]};
      border-radius: 50%;
      background-color: ${props => props.theme.colors.border.light};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${props => props.theme.typography.fontSize.sm[0]};
      font-weight: ${props => props.theme.typography.fontWeight.semibold};
      color: ${props => props.theme.colors.text.tertiary};
      position: relative;
      z-index: 1;
      transition: ${props => props.theme.transitions.normal};
      
      ${props => props.activeStep > props.stepIndex && `
        background-color: ${props => props.theme.colors.primary};
        color: white;
      `}
      
      ${props => props.activeStep === props.stepIndex && `
        background-color: ${props => props.theme.colors.primary};
        color: white;
      `}
      
      ${props => props.activeStep < props.stepIndex && `
        background-color: ${props => props.theme.colors.border.light};
        color: ${props => props.theme.colors.text.tertiary};
      `}
    }
    
    .step-label {
      margin-top: ${props => props.theme.spacing[2]};
      font-size: ${props => props.theme.typography.fontSize.xs[0]};
      color: ${props => props.theme.colors.text.tertiary};
      text-align: center;
      
      ${props => props.activeStep >= props.stepIndex && `
        color: ${props => props.theme.colors.text.primary};
        font-weight: ${props => props.theme.typography.fontWeight.medium};
      `}
    }
  }
`;

// Компонент ProgressSteps
const ProgressSteps = ({
  steps,
  activeStep,
  className = '',
  ...props
}) => {
  return (
    <ProgressStepsContainer
      activeStep={activeStep}
      className={`${className} progress-steps`}
      {...props}
    >
      {steps.map((step, index) => (
        <div
          key={index}
          className="step"
          stepIndex={index}
        >
          <div className="step-circle">
            {step.completed ? '✓' : index + 1}
          </div>
          <div className="step-label">{step.label}</div>
        </div>
      ))}
    </ProgressStepsContainer>
  );
};

// Пропс-types для ProgressSteps
ProgressSteps.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      completed: PropTypes.bool,
    })
  ).isRequired,
  activeStep: PropTypes.number.isRequired,
  className: PropTypes.string,
};

// Экспорт компонентов
export {
  LinearProgress,
  CircularProgress,
  Progress,
  ProgressSteps as ProgressStepsComponent,
};