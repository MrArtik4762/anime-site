import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { styled } from 'styled-components';

// Стилизованный контейнер для навигационной цепочки
const BreadcrumbContainer = styled.nav`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.xxsmall};
  font-size: ${props => {
    if (props.size === 'small') return props.theme.fontSizes.xs;
    if (props.size === 'large') return props.theme.fontSizes.sm;
    return props.theme.fontSizes.base;
  }};
  color: ${props => props.theme.colors.textSecondary};
  user-select: none;
  
  ${props => props.size === 'small' && `
    font-size: ${props.theme.fontSizes.xs};
  `}
  
  ${props => props.size === 'large' && `
    font-size: ${props.theme.fontSizes.sm};
  `}
  
  ${props => props.align === 'center' && `
    justify-content: center;
  `}
  
  ${props => props.align === 'right' && `
    justify-content: flex-end;
  `}
  
  ${props => props.align === 'start' && `
    justify-content: flex-start;
  `}
  
  ${props => props.vertical && `
    flex-direction: column;
    align-items: flex-start;
  `}
`;

// Стилизованный элемент навигационной цепочки
const BreadcrumbItem = styled.span`
  display: flex;
  align-items: center;
  color: ${props => {
    if (props.active) return props.theme.colors.text;
    if (props.disabled) return props.theme.colors.border;
    return props.theme.colors.textSecondary;
  }};
  cursor: ${props => props.disabled ? 'not-allowed' : (props.clickable ? 'pointer' : 'default')};
  transition: all ${props => props.theme.transitions.fast} ease;
  position: relative;
  
  &:hover {
    ${props => !props.disabled && props.clickable && `
      color: ${props.theme.colors.primary};
    `}
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary};
  }
  
  ${props => props.disabled && `
    opacity: 0.6;
    cursor: not-allowed;
  `}
  
  ${props => props.active && `
    font-weight: ${props => props.theme.fontWeights.semibold};
    color: ${props.theme.colors.text};
  `}
  
  ${props => props.size === 'small' && `
    font-size: ${props.theme.fontSizes.xs};
  `}
  
  ${props => props.size === 'large' && `
    font-size: ${props.theme.fontSizes.sm};
  `}
`;

// Стилизованный разделитель навигационной цепочки
const BreadcrumbSeparator = styled.span`
  color: ${props => props.theme.colors.border};
  margin: 0 ${props => props.theme.spacing.xxsmall};
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => props.size === 'small' && `
    font-size: ${props.theme.fontSizes.xs};
    margin: 0 ${props.theme.spacing.xxxsmall};
  `}
  
  ${props => props.size === 'large' && `
    font-size: ${props.theme.fontSizes.sm};
    margin: 0 ${props.theme.spacing.xsmall};
  `}
  
  ${props => props.hidden && `
    visibility: hidden;
  `}
  
  ${props => props.vertical && `
    margin: ${props => props.theme.spacing.xxsmall} 0;
  `}
`;

// Стилизованная иконка навигационной цепочки
const BreadcrumbIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: ${props => props.theme.spacing.xxsmall};
  font-size: ${props => {
    if (props.size === 'small') return props.theme.iconSizes.xs;
    if (props.size === 'large') return props.theme.iconSizes.sm;
    return props.theme.iconSizes.base;
  }};
  color: ${props => props.theme.colors.textSecondary};
  
  ${props => props.size === 'small' && `
    font-size: ${props.theme.iconSizes.xs};
    margin-right: ${props.theme.spacing.xxxsmall};
  `}
  
  ${props => props.size === 'large' && `
    font-size: ${props.theme.iconSizes.sm};
    margin-right: ${props.theme.spacing.xsmall};
  `}
  
  ${props => props.active && `
    color: ${props.theme.colors.text};
  `}
`;

// Основной компонент Breadcrumb
export const Breadcrumb = memo(({
  items,
  separator = '/',
  size = 'medium',
  align = 'left',
  vertical = false,
  maxItems,
  ellipsis,
  homeIcon,
  onItemClick,
  className,
  style,
  ...props
}) => {
  const handleItemClick = (item, index) => {
    if (item.disabled || !item.clickable) return;
    if (onItemClick) {
      onItemClick(item, index);
    }
  };
  
  const renderItems = () => {
    if (!items || items.length === 0) return null;
    
    const displayedItems = maxItems && items.length > maxItems
      ? [
          items[0],
          { text: ellipsis || '...', disabled: true, clickable: false },
          ...items.slice(-(maxItems - 2))
        ]
      : items;
    
    return displayedItems.map((item, index) => (
      <React.Fragment key={index}>
        <BreadcrumbItem
          size={size}
          active={item.active}
          disabled={item.disabled}
          clickable={item.clickable}
          onClick={() => handleItemClick(item, index)}
          className={item.className}
          style={item.style}
        >
          {homeIcon && index === 0 && (
            <BreadcrumbIcon size={size} active={item.active}>
              {homeIcon}
            </BreadcrumbIcon>
          )}
          
          {item.icon && (
            <BreadcrumbIcon size={size} active={item.active}>
              {item.icon}
            </BreadcrumbIcon>
          )}
          
          {item.text}
        </BreadcrumbItem>
        
        {index < displayedItems.length - 1 && (
          <BreadcrumbSeparator
            size={size}
            vertical={vertical}
            hidden={item.hidden}
          >
            {separator}
          </BreadcrumbSeparator>
        )}
      </React.Fragment>
    ));
  };
  
  return (
    <BreadcrumbContainer
      size={size}
      align={align}
      vertical={vertical}
      className={className}
      style={style}
      {...props}
    >
      {renderItems()}
    </BreadcrumbContainer>
  );
});

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      icon: PropTypes.node,
      active: PropTypes.bool,
      disabled: PropTypes.bool,
      clickable: PropTypes.bool,
      className: PropTypes.string,
      style: PropTypes.object,
    })
  ).isRequired,
  separator: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  align: PropTypes.oneOf(['left', 'center', 'right', 'start']),
  vertical: PropTypes.bool,
  maxItems: PropTypes.number,
  ellipsis: PropTypes.string,
  homeIcon: PropTypes.node,
  onItemClick: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для иерархических навигационных цепочек
export const HierarchicalBreadcrumb = memo(({
  items,
  size = 'medium',
  align = 'left',
  vertical = false,
  onItemClick,
  className,
  style,
  ...props
}) => {
  const renderItems = () => {
    if (!items || items.length === 0) return null;
    
    return items.map((item, index) => (
      <React.Fragment key={index}>
        <BreadcrumbItem
          size={size}
          active={item.active}
          disabled={item.disabled}
          clickable={item.clickable}
          onClick={() => onItemClick && onItemClick(item, index)}
          className={item.className}
          style={item.style}
        >
          {item.icon && (
            <BreadcrumbIcon size={size} active={item.active}>
              {item.icon}
            </BreadcrumbIcon>
          )}
          
          {item.text}
        </BreadcrumbItem>
        
        {index < items.length - 1 && (
          <BreadcrumbSeparator
            size={size}
            vertical={vertical}
          >
            {item.separator || '›'}
          </BreadcrumbSeparator>
        )}
      </React.Fragment>
    ));
  };
  
  return (
    <BreadcrumbContainer
      size={size}
      align={align}
      vertical={vertical}
      className={className}
      style={style}
      {...props}
    >
      {renderItems()}
    </BreadcrumbContainer>
  );
});

HierarchicalBreadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      icon: PropTypes.node,
      active: PropTypes.bool,
      disabled: PropTypes.bool,
      clickable: PropTypes.bool,
      separator: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
      className: PropTypes.string,
      style: PropTypes.object,
    })
  ).isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  align: PropTypes.oneOf(['left', 'center', 'right', 'start']),
  vertical: PropTypes.bool,
  onItemClick: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для хлебных крошек с изображениями
export const ImageBreadcrumb = memo(({
  items,
  size = 'medium',
  align = 'left',
  vertical = false,
  onItemClick,
  className,
  style,
  ...props
}) => {
  const renderItems = () => {
    if (!items || items.length === 0) return null;
    
    return items.map((item, index) => (
      <React.Fragment key={index}>
        <BreadcrumbItem
          size={size}
          active={item.active}
          disabled={item.disabled}
          clickable={item.clickable}
          onClick={() => onItemClick && onItemClick(item, index)}
          className={item.className}
          style={item.style}
        >
          {item.image && (
            <img
              src={item.image}
              alt={item.text}
              style={{
                width: size === 'small' ? '16px' : size === 'large' ? '24px' : '20px',
                height: size === 'small' ? '16px' : size === 'large' ? '24px' : '20px',
                borderRadius: '50%',
                marginRight: size === 'small' ? '4px' : size === 'large' ? '8px' : '6px',
                objectFit: 'cover',
              }}
            />
          )}
          
          {item.text}
        </BreadcrumbItem>
        
        {index < items.length - 1 && (
          <BreadcrumbSeparator
            size={size}
            vertical={vertical}
          >
            {item.separator || '›'}
          </BreadcrumbSeparator>
        )}
      </React.Fragment>
    ));
  };
  
  return (
    <BreadcrumbContainer
      size={size}
      align={align}
      vertical={vertical}
      className={className}
      style={style}
      {...props}
    >
      {renderItems()}
    </BreadcrumbContainer>
  );
});

ImageBreadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      image: PropTypes.string,
      active: PropTypes.bool,
      disabled: PropTypes.bool,
      clickable: PropTypes.bool,
      separator: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
      className: PropTypes.string,
      style: PropTypes.object,
    })
  ).isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  align: PropTypes.oneOf(['left', 'center', 'right', 'start']),
  vertical: PropTypes.bool,
  onItemClick: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для анимированных хлебных крошек
export const AnimatedBreadcrumb = memo(({
  items,
  separator = '/',
  size = 'medium',
  align = 'left',
  vertical = false,
  onItemClick,
  className,
  style,
  ...props
}) => {
  const [activeIndex, setActiveIndex] = React.useState(-1);
  
  const handleItemClick = (item, index) => {
    if (item.disabled || !item.clickable) return;
    if (onItemClick) {
      onItemClick(item, index);
    }
  };
  
  const handleMouseEnter = (index) => {
    setActiveIndex(index);
  };
  
  const handleMouseLeave = () => {
    setActiveIndex(-1);
  };
  
  const renderItems = () => {
    if (!items || items.length === 0) return null;
    
    return items.map((item, index) => (
      <React.Fragment key={index}>
        <BreadcrumbItem
          size={size}
          active={item.active || index === activeIndex}
          disabled={item.disabled}
          clickable={item.clickable}
          onClick={() => handleItemClick(item, index)}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          className={item.className}
          style={item.style}
        >
          {item.icon && (
            <BreadcrumbIcon size={size} active={item.active || index === activeIndex}>
              {item.icon}
            </BreadcrumbIcon>
          )}
          
          {item.text}
        </BreadcrumbItem>
        
        {index < items.length - 1 && (
          <BreadcrumbSeparator
            size={size}
            vertical={vertical}
            style={{
              opacity: index === activeIndex ? 1 : 0.6,
              transform: index === activeIndex ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {separator}
          </BreadcrumbSeparator>
        )}
      </React.Fragment>
    ));
  };
  
  return (
    <BreadcrumbContainer
      size={size}
      align={align}
      vertical={vertical}
      className={className}
      style={style}
      {...props}
    >
      {renderItems()}
    </BreadcrumbContainer>
  );
});

AnimatedBreadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      icon: PropTypes.node,
      active: PropTypes.bool,
      disabled: PropTypes.bool,
      clickable: PropTypes.bool,
      className: PropTypes.string,
      style: PropTypes.object,
    })
  ).isRequired,
  separator: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  align: PropTypes.oneOf(['left', 'center', 'right', 'start']),
  vertical: PropTypes.bool,
  onItemClick: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Breadcrumb;