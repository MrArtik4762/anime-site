import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Контейнер для компонента с подсказкой
const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
`;

// Содержимое компонента
const TooltipContent = styled.div`
  display: inline-block;
`;

// Всплывающая подсказка
const TooltipPopup = styled.div`
  position: absolute;
  bottom: ${props => props.placement === 'top' ? 'calc(100% + 8px)' : 'auto'};
  top: ${props => props.placement === 'bottom' ? 'calc(100% + 8px)' : 'auto'};
  left: 50%;
  transform: translateX(-50%);
  background-color: ${props => props.theme.colors.surface.secondary};
  color: ${props => props.theme.colors.text.primary};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm[0]};
  white-space: nowrap;
  box-shadow: ${props => props.theme.shadow.md};
  z-index: ${props => props.theme.zIndex.tooltip};
  opacity: ${props => props.visible ? 1 : 0};
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  transition: ${props => props.theme.transitions.normal};
  pointer-events: none;
  
  ${props => props.placement === 'left' && `
    right: calc(100% + 8px);
    left: auto;
    top: 50%;
    transform: translateY(-50%);
  `}
  
  ${props => props.placement === 'right' && `
    left: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
  `}
  
  ${props => props.placement === 'top' && `
    bottom: calc(100% + 8px);
    top: auto;
    left: 50%;
    transform: translateX(-50%);
  `}
  
  ${props => props.placement === 'bottom' && `
    top: calc(100% + 8px);
    bottom: auto;
    left: 50%;
    transform: translateX(-50%);
  `}
  
  // Стрелка для подсказки
  &::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    
    ${props => props.placement === 'left' && `
      right: -6px;
      top: 50%;
      transform: translateY(-50%);
      border-width: 6px 0 6px 6px;
      border-color: transparent transparent transparent ${props => props.theme.colors.surface.secondary};
    `}
    
    ${props => props.placement === 'right' && `
      left: -6px;
      top: 50%;
      transform: translateY(-50%);
      border-width: 6px 6px 6px 0;
      border-color: transparent ${props => props.theme.colors.surface.secondary} transparent transparent;
    `}
    
    ${props => props.placement === 'top' && `
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 6px 6px 0;
      border-color: ${props => props.theme.colors.surface.secondary} transparent transparent transparent;
    `}
    
    ${props => props.placement === 'bottom' && `
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 0 6px 6px;
      border-color: transparent transparent ${props => props.theme.colors.surface.secondary} transparent;
    `}
  }
`;

// Компонент Tooltip
const Tooltip = ({
  content,
  placement = 'top',
  delay = 200,
  children,
  className = '',
  visible: controlledVisible,
  ...props
}) => {
  const [visible, setVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);
  
  // Используем управляемое состояние, если оно передано
  const isVisible = controlledVisible !== undefined ? controlledVisible : visible;
  
  // Показать подсказку
  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
      setIsMounted(true);
    }, delay);
  };
  
  // Скрыть подсказку
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setVisible(false);
    
    // Даем время на завершение анимации перед размонтированием
    setTimeout(() => {
      setIsMounted(false);
    }, 300);
  };
  
  // Очистка таймеров при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return (
    <TooltipContainer
      ref={containerRef}
      className={`${className} tooltip-container`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      {...props}
    >
      <TooltipContent>
        {children}
      </TooltipContent>
      
      {isMounted && (
        <TooltipPopup
          placement={placement}
          visible={isVisible}
          className="tooltip-popup"
        >
          {content}
        </TooltipPopup>
      )}
    </TooltipContainer>
  );
};

// Пропс-types для TypeScript
Tooltip.propTypes = {
  content: PropTypes.node.isRequired,
  placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  delay: PropTypes.number,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  visible: PropTypes.bool,
};

// Компонент Tooltip с возможностью интерактивности
const InteractiveTooltip = ({
  content,
  placement = 'top',
  delay = 200,
  children,
  className = '',
  interactive = false,
  ...props
}) => {
  const [visible, setVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);
  
  // Показать подсказку
  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
      setIsMounted(true);
    }, delay);
  };
  
  // Скрыть подсказку
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setVisible(false);
    
    // Даем время на завершение анимации перед размонтированием
    setTimeout(() => {
      setIsMounted(false);
    }, 300);
  };
  
  // Очистка таймеров при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return (
    <TooltipContainer
      ref={containerRef}
      className={`${className} tooltip-container interactive`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      {...props}
    >
      <TooltipContent>
        {children}
      </TooltipContent>
      
      {isMounted && (
        <TooltipPopup
          placement={placement}
          visible={visible}
          className="tooltip-popup interactive"
          style={{
            pointerEvents: interactive ? 'auto' : 'none',
            whiteSpace: interactive ? 'normal' : 'nowrap',
            maxWidth: interactive ? '300px' : 'none',
          }}
        >
          {content}
        </TooltipPopup>
      )}
    </TooltipContainer>
  );
};

// Пропс-types для InteractiveTooltip
InteractiveTooltip.propTypes = {
  content: PropTypes.node.isRequired,
  placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  delay: PropTypes.number,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  interactive: PropTypes.bool,
};

// Компонент TooltipWrapper для обертывания контента
const TooltipWrapper = styled.div`
  display: inline-block;
`;

// Компонент TooltipWrapper
const TooltipWrapperComponent = ({
  tooltip,
  placement = 'top',
  delay = 200,
  children,
  className = '',
  ...props
}) => {
  return (
    <TooltipWrapper className={`${className} tooltip-wrapper`} {...props}>
      <Tooltip content={tooltip} placement={placement} delay={delay}>
        {children}
      </Tooltip>
    </TooltipWrapper>
  );
};

// Пропс-types для TooltipWrapper
TooltipWrapperComponent.propTypes = {
  tooltip: PropTypes.node.isRequired,
  placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  delay: PropTypes.number,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// Экспорт компонентов
export { Tooltip, InteractiveTooltip, TooltipWrapper as TooltipWrapperComponent };