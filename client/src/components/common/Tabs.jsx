import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { styled } from 'styled-components';

// Стилизованная панель вкладок
const StyledTabs = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.border.radius.md};
  box-shadow: ${props => props.theme.shadows.sm};
  overflow: hidden;
  
  ${props => props.variant === 'pills' && `
    background-color: transparent;
    box-shadow: none;
    
    ${props => props.size === 'small' && `
      gap: ${props => props.theme.spacing.xsmall};
    `}
    
    ${props => props.size === 'medium' && `
      gap: ${props => props.theme.spacing.small};
    `}
    
    ${props => props.size === 'large' && `
      gap: ${props => props.theme.spacing.medium};
    `}
  `}
  
  ${props => props.variant === 'vertical' && `
    flex-direction: row;
    
    ${props => props.size === 'small' && `
      gap: ${props => props.theme.spacing.xsmall};
    `}
    
    ${props => props.size === 'medium' && `
      gap: ${props => props.theme.spacing.small};
    `}
    
    ${props => props.size === 'large' && `
      gap: ${props => props.theme.spacing.medium};
    `}
  `}
  
  @media (max-width: 768px) {
    ${props => props.variant === 'vertical' && `
      flex-direction: column;
    `}
  }
`;

// Стилизованная панель заголовков вкладок
const StyledTabHeader = styled.div`
  display: flex;
  background-color: ${props => props.theme.colors.background};
  border-bottom: ${props => props.theme.border.width.sm} solid ${props => props.theme.colors.border};
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: ${props => props.theme.colors.border} transparent;
  
  &::-webkit-scrollbar {
    height: ${props => props.theme.sizes.scrollbarHeight};
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.border.radius.sm};
  }
  
  ${props => props.variant === 'pills' && `
    background-color: transparent;
    border-bottom: none;
    flex-wrap: wrap;
    
    ${props => props.size === 'small' && `
      padding: ${props => props.theme.spacing.xsmall};
    `}
    
    ${props => props.size === 'medium' && `
      padding: ${props => props.theme.spacing.small};
    `}
    
    ${props => props.size === 'large' && `
      padding: ${props => props.theme.spacing.medium};
    `}
  `}
  
  ${props => props.variant === 'vertical' && `
    flex-direction: column;
    border-bottom: none;
    border-right: ${props => props.theme.border.width.sm} solid ${props => props.theme.colors.border};
    
    ${props => props.size === 'small' && `
      padding: ${props => props.theme.spacing.xsmall};
    `}
    
    ${props => props.size === 'medium' && `
      padding: ${props => props.theme.spacing.small};
    `}
    
    ${props => props.size === 'large' && `
      padding: ${props => props.theme.spacing.medium};
    `}
  `}
  
  ${props => props.centered && `
    justify-content: center;
  `}
  
  ${props => props.justified && `
    justify-content: space-between;
  `}
  
  ${props => props.fullWidth && `
    width: 100%;
  `}
  
  @media (max-width: 768px) {
    ${props => props.variant === 'vertical' && `
      border-right: none;
      border-bottom: ${props => props.theme.border.width.sm} solid ${props => props.theme.colors.border};
    `}
  }
`;

// Стилизованная кнопка вкладки
const StyledTabButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => {
    if (props.size === 'small') return `${props.theme.spacing.xsmall} ${props.theme.spacing.small}`;
    if (props.size === 'large') return `${props.theme.spacing.small} ${props.theme.spacing.medium}`;
    return `${props.theme.spacing.small} ${props.theme.spacing.medium}`;
  }};
  background-color: transparent;
  border: none;
  border-radius: ${props => props.theme.border.radius.md};
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => {
    if (props.size === 'small') return props.theme.fontSizes.sm;
    if (props.size === 'large') return props.theme.fontSizes.md;
    return props.theme.fontSizes.base;
  }};
  font-weight: ${props => props.theme.fontWeights.normal};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast} ease;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  
  &:hover {
    color: ${props => props.theme.colors.text};
    background-color: ${props => props.theme.colors.hover};
  }
  
  ${props => props.active && `
    color: ${props => props.theme.colors.primary};
    font-weight: ${props => props.theme.fontWeights.semibold};
    
    ${props => props.variant === 'default' && `
      border-bottom: ${props => props.theme.border.width.md} solid ${props => props.theme.colors.primary};
    `}
    
    ${props => props.variant === 'pills' && `
      background-color: ${props => props.theme.colors.primary};
      color: ${props => props.theme.colors.background};
    `}
    
    ${props => props.variant === 'vertical' && `
      border-right: ${props => props.theme.border.width.md} solid ${props => props.theme.colors.primary};
    `}
  `}
  
  ${props => props.disabled && `
    color: ${props => props.theme.colors.textDisabled};
    cursor: not-allowed;
    opacity: 0.6;
    
    &:hover {
      background-color: transparent;
    }
  `}
  
  ${props => props.icon && `
    svg {
      margin-right: ${props.theme.spacing.xsmall};
      width: ${props.theme.iconSizes.sm};
      height: ${props.theme.iconSizes.sm};
    }
    
    ${props => props.active && `
      svg {
        color: ${props => props.theme.colors.primary};
      }
    `}
  `}
  
  ${props => props.size === 'small' && `
    padding: ${props.theme.spacing.xsmall} ${props.theme.spacing.small};
    font-size: ${props.theme.fontSizes.sm};
    
    svg {
      width: ${props.theme.iconSizes.xs};
      height: ${props.theme.iconSizes.xs};
    }
  `}
  
  ${props => props.size === 'large' && `
    padding: ${props.theme.spacing.small} ${props.theme.spacing.medium};
    font-size: ${props.theme.fontSizes.md};
    
    svg {
      width: ${props.theme.iconSizes.md};
      height: ${props.theme.iconSizes.md};
    }
  `}
  
  ${props => props.fullWidth && `
    flex: 1;
    min-width: 0;
  `}
  
  @media (max-width: 768px) {
    ${props => props.variant === 'vertical' && `
      border-right: none;
      border-bottom: ${props => props.theme.border.width.md} solid ${props => props.active ? props.theme.colors.primary : 'transparent'};
    `}
  }
`;

// Стилизованная панель содержимого вкладок
const StyledTabContent = styled.div`
  padding: ${props => {
    if (props.size === 'small') return `${props.theme.spacing.small} ${props.theme.spacing.medium}`;
    if (props.size === 'large') return `${props.theme.spacing.medium} ${props.theme.spacing.large}`;
    return `${props.theme.spacing.medium} ${props.theme.spacing.medium}`;
  }};
  background-color: ${props => props.theme.colors.background};
  min-height: ${props => props.theme.sizes.tabContentMinHeight};
  
  ${props => props.variant === 'pills' && `
    padding: ${props => {
      if (props.size === 'small') return `${props.theme.spacing.small} ${props.theme.spacing.medium}`;
      if (props.size === 'large') return `${props.theme.spacing.medium} ${props.theme.spacing.large}`;
      return `${props.theme.spacing.medium} ${props.theme.spacing.medium}`;
    }};
  `}
  
  ${props => props.variant === 'vertical' && `
    padding: ${props => {
      if (props.size === 'small') return `${props.theme.spacing.small} ${props.theme.spacing.medium}`;
      if (props.size === 'large') return `${props.theme.spacing.medium} ${props.theme.spacing.large}`;
      return `${props.theme.spacing.medium} ${props.theme.spacing.medium}`;
    }};
  `}
  
  ${props => props.noPadding && `
    padding: 0;
  `}
  
  ${props => props.fit && `
    padding: 0;
  `}
  
  ${props => props.center && `
    display: flex;
    align-items: center;
    justify-content: center;
  `}
`;

// Стилизованный индикатор активной вкладки
const TabIndicator = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: ${props => props.theme.border.width.md};
  background-color: ${props => props.theme.colors.primary};
  transition: all ${props => props.theme.transitions.medium} ease;
  
  ${props => props.variant === 'pills' && `
    border-radius: ${props => props.theme.border.radius.md};
    bottom: auto;
    top: 0;
  `}
  
  ${props => props.variant === 'vertical' && `
    width: ${props => props.theme.border.width.md};
    height: auto;
    top: 0;
    bottom: auto;
    left: auto;
    right: 0;
  `}
`;

// Основной компонент Tabs
export const Tabs = memo(({
  children,
  defaultActiveKey,
  activeKey,
  onChange,
  variant = 'default',
  size = 'medium',
  centered = false,
  justified = false,
  fullWidth = false,
  disabled = false,
  className,
  style,
  ...props
}) => {
  const [internalActiveKey, setInternalActiveKey] = useState(defaultActiveKey);
  const currentActiveKey = activeKey !== undefined ? activeKey : internalActiveKey;
  
  const handleTabChange = (key) => {
    if (disabled) return;
    
    if (activeKey === undefined) {
      setInternalActiveKey(key);
    }
    
    if (onChange) {
      onChange(key);
    }
  };
  
  return (
    <StyledTabs
      variant={variant}
      size={size}
      className={className}
      style={style}
      {...props}
    >
      <StyledTabHeader
        variant={variant}
        size={size}
        centered={centered}
        justified={justified}
        fullWidth={fullWidth}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            const key = child.key || `tab-${index}`;
            const isActive = key === currentActiveKey;
            
            return React.cloneElement(child, {
              ...child.props,
              key,
              active: isActive,
              disabled: disabled || child.props.disabled,
              variant,
              size,
              onClick: () => handleTabChange(key),
            });
          }
          return child;
        })}
      </StyledTabHeader>
      
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const key = child.key || `tab-${React.Children.toArray(children).indexOf(child)}`;
          const isActive = key === currentActiveKey;
          
          if (isActive) {
            return React.cloneElement(child, {
              ...child.props,
              active: true,
              variant,
              size,
            });
          }
        }
        return null;
      })}
    </StyledTabs>
  );
});

Tabs.propTypes = {
  children: PropTypes.node.isRequired,
  defaultActiveKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  activeKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'pills', 'vertical']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  centered: PropTypes.bool,
  justified: PropTypes.bool,
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент Tab для вкладки
export const Tab = memo(({
  children,
  title,
  icon,
  disabled = false,
  className,
  style,
  ...props
}) => {
  return (
    <>
      <StyledTabButton
        className={className}
        style={style}
        disabled={disabled}
        icon={icon}
        {...props}
      >
        {icon}
        {title}
      </StyledTabButton>
      {props.active && (
        <StyledTabContent variant={props.variant} size={props.size} noPadding={props.noPadding} fit={props.fit} center={props.center}>
          {children}
        </StyledTabContent>
      )}
    </>
  );
});

Tab.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  icon: PropTypes.node,
  disabled: PropTypes.bool,
  active: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'pills', 'vertical']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  noPadding: PropTypes.bool,
  fit: PropTypes.bool,
  center: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент TabPane для содержимого вкладки
export const TabPane = memo(({
  children,
  tab,
  icon,
  disabled = false,
  className,
  style,
  ...props
}) => {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
});

TabPane.propTypes = {
  children: PropTypes.node,
  tab: PropTypes.string,
  icon: PropTypes.node,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для табов с индикатором
export const TabsWithIndicator = memo(({
  children,
  defaultActiveKey,
  activeKey,
  onChange,
  variant = 'default',
  size = 'medium',
  centered = false,
  justified = false,
  fullWidth = false,
  disabled = false,
  className,
  style,
  ...props
}) => {
  const [internalActiveKey, setInternalActiveKey] = useState(defaultActiveKey);
  const currentActiveKey = activeKey !== undefined ? activeKey : internalActiveKey;
  
  const handleTabChange = (key) => {
    if (disabled) return;
    
    if (activeKey === undefined) {
      setInternalActiveKey(key);
    }
    
    if (onChange) {
      onChange(key);
    }
  };
  
  return (
    <StyledTabs
      variant={variant}
      size={size}
      className={className}
      style={style}
      {...props}
    >
      <StyledTabHeader
        variant={variant}
        size={size}
        centered={centered}
        justified={justified}
        fullWidth={fullWidth}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            const key = child.key || `tab-${index}`;
            const isActive = key === currentActiveKey;
            
            return React.cloneElement(child, {
              ...child.props,
              key,
              active: isActive,
              disabled: disabled || child.props.disabled,
              variant,
              size,
              onClick: () => handleTabChange(key),
            });
          }
          return child;
        })}
      </StyledTabHeader>
      
      <TabIndicator
        variant={variant}
        style={{
          width: `${100 / React.Children.toArray(children).length}%`,
          transform: `translateX(${React.Children.toArray(children).findIndex(child => 
            React.isValidElement(child) && 
            (child.key || `tab-${React.Children.toArray(children).indexOf(child)}`) === currentActiveKey
          ) * 100}%)`,
        }}
      />
      
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const key = child.key || `tab-${React.Children.toArray(children).indexOf(child)}`;
          const isActive = key === currentActiveKey;
          
          if (isActive) {
            return React.cloneElement(child, {
              ...child.props,
              active: true,
              variant,
              size,
            });
          }
        }
        return null;
      })}
    </StyledTabs>
  );
});

TabsWithIndicator.propTypes = {
  children: PropTypes.node.isRequired,
  defaultActiveKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  activeKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'pills', 'vertical']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  centered: PropTypes.bool,
  justified: PropTypes.bool,
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Tabs;