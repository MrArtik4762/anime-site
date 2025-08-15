import React, { useState, useRef, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { styled, keyframes } from 'styled-components';
import { useResponsive } from './Responsive';

// Анимации для tooltip
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// Стилизованный компонент для контейнера tooltip
const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
  
  .tooltip-trigger {
    cursor: ${props => props.disabled ? 'default' : 'help'};
  }
  
  .tooltip-content {
    position: absolute;
    z-index: ${props => props.theme.zIndex.tooltip};
    background-color: ${props => props.theme.colors.tooltipBackground};
    color: ${props => props.theme.colors.tooltipText};
    padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
    border-radius: ${props => props.theme.borderRadius.md};
    font-size: ${props => props.theme.fontSizes.sm};
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity ${props => props.theme.transitions.medium}, 
                visibility ${props => props.theme.transitions.medium};
    
    ${props => props.placement === 'top' && `
      bottom: calc(100% + ${props => props.theme.spacing.small});
      left: 50%;
      transform: translateX(-50%) translateY(-10px);
      
      &::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: ${props => props.theme.spacing.xsmall};
        border-style: solid;
        border-color: ${props => props.theme.colors.tooltipBackground} transparent transparent transparent;
      }
    `}
    
    ${props => props.placement === 'bottom' && `
      top: calc(100% + ${props => props.theme.spacing.small});
      left: 50%;
      transform: translateX(-50%) translateY(10px);
      
      &::after {
        content: '';
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: ${props => props.theme.spacing.xsmall};
        border-style: solid;
        border-color: transparent transparent ${props => props.theme.colors.tooltipBackground} transparent;
      }
    `}
    
    ${props => props.placement === 'left' && `
      right: calc(100% + ${props => props.theme.spacing.small});
      top: 50%;
      transform: translateY(-50%) translateX(-10px);
      
      &::after {
        content: '';
        position: absolute;
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        border-width: ${props => props.theme.spacing.xsmall};
        border-style: solid;
        border-color: transparent transparent transparent ${props => props.theme.colors.tooltipBackground};
      }
    `}
    
    ${props => props.placement === 'right' && `
      left: calc(100% + ${props => props.theme.spacing.small});
      top: 50%;
      transform: translateY(-50%) translateX(10px);
      
      &::after {
        content: '';
        position: absolute;
        right: 100%;
        top: 50%;
        transform: translateY(-50%);
        border-width: ${props => props.theme.spacing.xsmall};
        border-style: solid;
        border-color: transparent ${props => props.theme.colors.tooltipBackground} transparent transparent;
      }
    `}
    
    ${props => props.visible && `
      opacity: 1;
      visibility: visible;
      transform: ${props => {
        switch (props.placement) {
          case 'top': return 'translateX(-50%) translateY(0)';
          case 'bottom': return 'translateX(-50%) translateY(0)';
          case 'left': return 'translateY(-50%) translateX(0)';
          case 'right': return 'translateY(-50%) translateX(0)';
          default: return 'translateX(-50%) translateY(0)';
        }
      }};
      animation: ${fadeIn} ${props => props.theme.transitions.medium} ease-out;
    `}
    
    ${props => props.variant === 'dark' && `
      background-color: ${props => props.theme.colors.backgroundSecondary};
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `}
    
    ${props => props.variant === 'light' && `
      background-color: ${props => props.theme.colors.background};
      color: ${props => props.theme.colors.text};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border: 1px solid ${props => props.theme.colors.border};
    `}
    
    ${props => props.variant === 'success' && `
      background-color: ${props => props.theme.colors.success};
      color: white;
    `}
    
    ${props => props.variant === 'warning' && `
      background-color: ${props => props.theme.colors.warning};
      color: white;
    `}
    
    ${props => props.variant === 'error' && `
      background-color: ${props => props.theme.colors.error};
      color: white;
    `}
    
    ${props => props.size === 'small' && `
      padding: ${props => props.theme.spacing.xsmall} ${props => props.theme.spacing.small};
      font-size: ${props => props.theme.fontSizes.xs};
    `}
    
    ${props => props.size === 'large' && `
      padding: ${props => props.theme.spacing.medium} ${props => props.theme.spacing.large};
      font-size: ${props => props.theme.fontSizes.md};
      white-space: normal;
      max-width: 300px;
      text-align: center;
    }}
    
    @media (max-width: 768px) {
      font-size: ${props => props.theme.fontSizes.xs};
      padding: ${props => props.theme.spacing.xsmall} ${props => props.theme.spacing.small};
      
      ${props => props.size === 'small' && `
        padding: ${props => props.theme.spacing.xxsmall} ${props => props.theme.spacing.xsmall};
        font-size: ${props => props.theme.fontSizes.xxsmall};
      `}
      
      ${props => props.size === 'large' && `
        padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
        font-size: ${props => props.theme.fontSizes.sm};
      `}
    }
  }
`;

// Стилизованный компонент для группового tooltip
const TooltipGroup = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.small};
  
  .tooltip-group-trigger {
    cursor: ${props => props.disabled ? 'default' : 'help'};
  }
  
  .tooltip-group-content {
    position: absolute;
    z-index: ${props => props.theme.zIndex.tooltip};
    background-color: ${props => props.theme.colors.tooltipBackground};
    color: ${props => props.theme.colors.tooltipText};
    padding: ${props => props.theme.spacing.medium} ${props => props.theme.spacing.large};
    border-radius: ${props => props.theme.borderRadius.md};
    font-size: ${props => props.theme.fontSizes.sm};
    white-space: normal;
    max-width: 320px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity ${props => props.theme.transitions.medium}, 
                visibility ${props => props.theme.transitions.medium};
    
    ${props => props.visible && `
      opacity: 1;
      visibility: visible;
      animation: ${fadeIn} ${props => props.theme.transitions.medium} ease-out;
    `}
    
    ${props => props.variant === 'dark' && `
      background-color: ${props => props.theme.colors.backgroundSecondary};
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `}
    
    ${props => props.variant === 'light' && `
      background-color: ${props => props.theme.colors.background};
      color: ${props => props.theme.colors.text};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border: 1px solid ${props => props.theme.colors.border};
    }}
    
    .tooltip-group-title {
      font-weight: ${props => props.theme.fontWeights.medium};
      margin-bottom: ${props => props.theme.spacing.xsmall};
      color: ${props => props.theme.colors.text};
    }
    
    .tooltip-group-description {
      line-height: 1.5;
    }
    
    .tooltip-group-list {
      margin: ${props => props.theme.spacing.small} 0;
      padding-left: ${props => props.theme.spacing.medium};
      
      li {
        margin-bottom: ${props => props.theme.spacing.xsmall};
      }
    }
  }
`;

// Основной компонент Tooltip
export const Tooltip = memo(({
  content,
  children,
  placement = 'top',
  variant = 'default',
  size = 'medium',
  disabled = false,
  delay = 0,
  interactive = false,
  className,
  style,
  ...props
}) => {
  const { isMobile } = useResponsive();
  const [visible, setVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);
  
  // Очистка таймаута при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);
  
  // Обработка наведения
  const handleMouseEnter = () => {
    if (disabled) return;
    
    if (delay > 0) {
      const id = setTimeout(() => {
        setVisible(true);
      }, delay);
      setTimeoutId(id);
    } else {
      setVisible(true);
    }
  };
  
  // Обработка ухода курсора
  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setVisible(false);
  };
  
  // Обработка клика на мобильных устройствах
  const handleClick = () => {
    if (disabled || !isMobile) return;
    setVisible(!visible);
  };
  
  // Закрытие tooltip при клике вне элемента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        interactive && 
        visible && 
        tooltipRef.current && 
        !tooltipRef.current.contains(event.target) &&
        triggerRef.current && 
        !triggerRef.current.contains(event.target)
      ) {
        setVisible(false);
      }
    };
    
    if (interactive && visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [interactive, visible]);
  
  // Рендер children с добавлением обработчиков
  const renderChildren = () => {
    return React.cloneElement(children, {
      ref: triggerRef,
      className: `tooltip-trigger ${children.props.className || ''}`,
      onMouseEnter: (e) => {
        if (children.props.onMouseEnter) {
          children.props.onMouseEnter(e);
        }
        handleMouseEnter();
      },
      onMouseLeave: (e) => {
        if (children.props.onMouseLeave) {
          children.props.onMouseLeave(e);
        }
        handleMouseLeave();
      },
      onClick: (e) => {
        if (children.props.onClick) {
          children.props.onClick(e);
        }
        handleClick();
      }
    });
  };
  
  // Создаем portal для tooltip, чтобы избежать проблем с z-index
  const tooltipContent = (
    <TooltipContainer
      ref={tooltipRef}
      placement={placement}
      variant={variant}
      size={size}
      visible={visible}
      disabled={disabled}
      className={className}
      style={style}
      {...props}
    >
      {renderChildren()}
      <div className="tooltip-content">
        {content}
      </div>
    </TooltipContainer>
  );
  
  // Для мобильных устройств используем portal для корректного позиционирования
  if (isMobile) {
    return createPortal(tooltipContent, document.body);
  }
  
  return tooltipContent;
});

Tooltip.propTypes = {
  content: PropTypes.node.isRequired,
  children: PropTypes.element.isRequired,
  placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  variant: PropTypes.oneOf(['default', 'dark', 'light', 'success', 'warning', 'error']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  delay: PropTypes.number,
  interactive: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для группового tooltip
export const TooltipGroupComponent = memo(({
  title,
  content,
  children,
  variant = 'default',
  disabled = false,
  delay = 0,
  className,
  style,
  ...props
}) => {
  const [visible, setVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  
  // Очистка таймаута при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);
  
  // Обработка наведения
  const handleMouseEnter = () => {
    if (disabled) return;
    
    if (delay > 0) {
      const id = setTimeout(() => {
        setVisible(true);
      }, delay);
      setTimeoutId(id);
    } else {
      setVisible(true);
    }
  };
  
  // Обработка ухода курсора
  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setVisible(false);
  };
  
  return (
    <TooltipGroup
      className={className}
      style={style}
      variant={variant}
      visible={visible}
      disabled={disabled}
      {...props}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <div className="tooltip-group-content">
        {title && <div className="tooltip-group-title">{title}</div>}
        <div className="tooltip-group-description">
          {content}
        </div>
      </div>
    </TooltipGroup>
  );
});

TooltipGroupComponent.propTypes = {
  title: PropTypes.string,
  content: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'dark', 'light', 'success', 'warning', 'error']),
  disabled: PropTypes.bool,
  delay: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для иконки с tooltip
export const TooltipIcon = memo(({
  content,
  icon = 'ℹ️',
  placement = 'top',
  variant = 'default',
  size = 'medium',
  disabled = false,
  delay = 0,
  className,
  style,
  ...props
}) => {
  return (
    <Tooltip
      content={content}
      placement={placement}
      variant={variant}
      size={size}
      disabled={disabled}
      delay={delay}
      className={className}
      style={style}
      {...props}
    >
      <span style={{ fontSize: '14px', marginLeft: '4px' }}>{icon}</span>
    </Tooltip>
  );
});

TooltipIcon.propTypes = {
  content: PropTypes.node.isRequired,
  icon: PropTypes.node,
  placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  variant: PropTypes.oneOf(['default', 'dark', 'light', 'success', 'warning', 'error']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  delay: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Хук для управления состоянием tooltip
export const useTooltip = (initialState = false, options = {}) => {
  const [visible, setVisible] = useState(initialState);
  const [timeoutId, setTimeoutId] = useState(null);
  
  const show = () => {
    setVisible(true);
  };
  
  const hide = () => {
    setVisible(false);
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };
  
  const toggle = () => {
    setVisible(prev => !prev);
  };
  
  const showWithDelay = (delay) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    const id = setTimeout(() => {
      setVisible(true);
    }, delay);
    setTimeoutId(id);
  };
  
  return {
    visible,
    show,
    hide,
    toggle,
    showWithDelay,
    tooltipProps: {
      visible,
      onMouseEnter: show,
      onMouseLeave: hide,
      onClick: toggle
    }
  };
};

export default Tooltip;