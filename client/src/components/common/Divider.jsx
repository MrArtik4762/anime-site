import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { styled } from 'styled-components';

// Стилизованный компонент для разделителя
const StyledDivider = styled.div`
  width: 100%;
  border: none;
  margin: ${props => props.theme.spacing.medium} 0;
  
  ${props => props.variant === 'horizontal' && `
    height: ${props => props.theme.border.width.sm};
    background-color: ${props => props.theme.colors.border};
  `}
  
  ${props => props.variant === 'vertical' && `
    width: ${props => props.theme.border.width.sm};
    min-height: ${props => props.theme.sizes.dividerMinHeight};
    background-color: ${props => props.theme.colors.border};
    display: inline-block;
    margin: 0 ${props => props.theme.spacing.medium};
    vertical-align: middle;
  `}
  
  ${props => props.variant === 'dashed' && `
    height: ${props => props.theme.border.width.sm};
    background-image: repeating-linear-gradient(
      90deg,
      ${props => props.theme.colors.border},
      ${props => props.theme.colors.border} 4px,
      transparent 4px,
      transparent 8px
    );
  `}
  
  ${props => props.variant === 'dotted' && `
    height: ${props => props.theme.border.width.sm};
    background-image: repeating-linear-gradient(
      90deg,
      ${props => props.theme.colors.border},
      ${props => props.theme.colors.border} 2px,
      transparent 2px,
      transparent 6px
    );
  `}
  
  ${props => props.variant === 'double' && `
    height: ${props => props.theme.border.width.md};
    background: linear-gradient(
      to bottom,
      transparent 33%,
      ${props => props.theme.colors.border} 33%,
      ${props => props.theme.colors.border} 66%,
      transparent 66%
    );
  `}
  
  ${props => props.variant === 'shadow' && `
    height: ${props => props.theme.border.width.sm};
    background-color: transparent;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  `}
  
  ${props => props.orientation === 'left' && `
    margin-left: 0;
    margin-right: auto;
    max-width: ${props => props.theme.sizes.dividerMaxWidth};
  `}
  
  ${props => props.orientation === 'right' && `
    margin-left: auto;
    margin-right: 0;
    max-width: ${props => props.theme.sizes.dividerMaxWidth};
  `}
  
  ${props => props.orientation === 'center' && `
    margin-left: auto;
    margin-right: auto;
    max-width: ${props => props.theme.sizes.dividerMaxWidth};
  `}
  
  ${props => props.size === 'small' && `
    margin: ${props => props.theme.spacing.small} 0;
    
    ${props => props.variant === 'horizontal' && `
      height: ${props => props.theme.border.width.xs};
    `}
    
    ${props => props.variant === 'vertical' && `
      width: ${props => props.theme.border.width.xs};
      min-height: ${props => props.theme.sizes.dividerMinHeightSmall};
    `}
  `}
  
  ${props => props.size === 'large' && `
    margin: ${props => props.theme.spacing.large} 0;
    
    ${props => props.variant === 'horizontal' && `
      height: ${props => props.theme.border.width.md};
    `}
    
    ${props => props.variant === 'vertical' && `
      width: ${props => props.theme.border.width.md};
      min-height: ${props => props.theme.sizes.dividerMinHeightLarge};
    `}
  `}
  
  ${props => props.color && `
    background-color: ${props.color};
    
    ${props => props.variant === 'dashed' && `
      background-image: repeating-linear-gradient(
        90deg,
        ${props.color},
        ${props.color} 4px,
        transparent 4px,
        transparent 8px
      );
    `}
    
    ${props => props.variant === 'dotted' && `
      background-image: repeating-linear-gradient(
        90deg,
        ${props.color},
        ${props.color} 2px,
        transparent 2px,
        transparent 6px
      );
    `}
    
    ${props => props.variant === 'double' && `
      background: linear-gradient(
        to bottom,
        transparent 33%,
        ${props.color} 33%,
        ${props.color} 66%,
        transparent 66%
      );
    `}
  `}
  
  ${props => props.inset && `
    margin-left: ${props.theme.spacing.large};
    margin-right: ${props.theme.spacing.large};
  `}
  
  @media (max-width: 768px) {
    ${props => props.size === 'small' && `
      margin: ${props => props.theme.spacing.xsmall} 0;
    `}
    
    ${props => props.size === 'large' && `
      margin: ${props => props.theme.spacing.medium} 0;
    `}
    
    ${props => props.inset && `
      margin-left: ${props.theme.spacing.medium};
      margin-right: ${props.theme.spacing.medium};
    `}
  }
`;

// Стилизованный компонент для текстового разделителя
const TextDivider = styled.div`
  display: flex;
  align-items: center;
  margin: ${props => props.theme.spacing.medium} 0;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: ${props => props.theme.colors.border};
  }
  
  ${props => props.size === 'small' && `
    margin: ${props => props.theme.spacing.small} 0;
    font-size: ${props => props.theme.fontSizes.xs};
  `}
  
  ${props => props.size === 'large' && `
    margin: ${props => props.theme.spacing.large} 0;
    font-size: ${props => props.theme.fontSizes.md};
  `}
  
  @media (max-width: 768px) {
    ${props => props.size === 'small' && `
      margin: ${props => props.theme.spacing.xsmall} 0;
    `}
    
    ${props => props.size === 'large' && `
      margin: ${props => props.theme.spacing.medium} 0;
    `}
  }
`;

// Основной компонент Divider
export const Divider = memo(({
  variant = 'horizontal',
  orientation = 'center',
  size = 'medium',
  color,
  inset = false,
  className,
  style,
  ...props
}) => {
  return (
    <StyledDivider
      variant={variant}
      orientation={orientation}
      size={size}
      color={color}
      inset={inset}
      className={className}
      style={style}
      {...props}
    />
  );
});

Divider.propTypes = {
  variant: PropTypes.oneOf(['horizontal', 'vertical', 'dashed', 'dotted', 'double', 'shadow']),
  orientation: PropTypes.oneOf(['left', 'center', 'right']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.string,
  inset: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для текстового разделителя
export const TextDividerComponent = memo(({
  children,
  size = 'medium',
  className,
  style,
  ...props
}) => {
  return (
    <TextDivider
      size={size}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </TextDivider>
  );
});

TextDividerComponent.propTypes = {
  children: PropTypes.node,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для группового разделителя
export const DividerGroup = memo(({
  children,
  spacing = 'medium',
  className,
  style,
  ...props
}) => {
  return (
    <div className={className} style={style}>
      {React.Children.map(children, (child, index) => {
        if (index === 0) return child;
        
        return (
          <React.Fragment key={index}>
            <Divider variant="horizontal" size={spacing} />
            {child}
          </React.Fragment>
        );
      })}
    </div>
  );
});

DividerGroup.propTypes = {
  children: PropTypes.node,
  spacing: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для вложенного разделителя
export const NestedDivider = memo(({
  level = 1,
  className,
  style,
  ...props
}) => {
  const margin = level * 16; // 16px отступ на каждый уровень вложенности
  
  return (
    <Divider
      inset
      className={className}
      style={{
        marginLeft: `${margin}px`,
        marginRight: `${margin}px`,
        ...style
      }}
      {...props}
    />
  );
});

NestedDivider.propTypes = {
  level: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для адаптивного разделителя
export const ResponsiveDivider = memo(({
  vertical = false,
  className,
  style,
  ...props
}) => {
  return (
    <Divider
      variant={vertical ? 'vertical' : 'horizontal'}
      className={className}
      style={{
        display: vertical ? 'none' : 'block',
        ...style
      }}
      {...props}
    />
  );
});

ResponsiveDivider.propTypes = {
  vertical: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  ...Divider.propTypes
};

// Компонент для разделителя с анимацией
export const AnimatedDivider = memo(({
  variant = 'horizontal',
  orientation = 'center',
  size = 'medium',
  color,
  inset = false,
  duration = 1000,
  delay = 0,
  className,
  style,
  ...props
}) => {
  return (
    <StyledDivider
      variant={variant}
      orientation={orientation}
      size={size}
      color={color}
      inset={inset}
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
      {...props}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          animation: `shimmer ${duration}ms ${delay}ms infinite`
        }}
      />
      <style jsx>{`
        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </StyledDivider>
  );
});

AnimatedDivider.propTypes = {
  variant: PropTypes.oneOf(['horizontal', 'vertical', 'dashed', 'dotted', 'double', 'shadow']),
  orientation: PropTypes.oneOf(['left', 'center', 'right']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.string,
  inset: PropTypes.bool,
  duration: PropTypes.number,
  delay: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Divider;