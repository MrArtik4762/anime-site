import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Контейнер бейджа
const BadgeContainer = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.padding || `${props.theme.spacing[1]} ${props.theme.spacing[2]}`};
  border-radius: ${props => props.shape === 'pill' ? props.theme.borderRadius.full : props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.xs[0]};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  line-height: 1;
  white-space: nowrap;
  text-transform: ${props => props.uppercase ? 'uppercase' : 'none'};
  letter-spacing: ${props => props.uppercase ? '0.5px' : 'normal'};
  
  // Цвета
  ${props => {
    if (props.color) {
      return `
        background-color: ${props.theme.colors[props.color]};
        color: white;
      `;
    }
    
    switch (props.variant) {
      case 'primary':
        return `
          background-color: ${props.theme.colors.primary};
          color: white;
        `;
      case 'secondary':
        return `
          background-color: ${props.theme.colors.border.medium};
          color: ${props.theme.colors.text.primary};
        `;
      case 'success':
        return `
          background-color: ${props.theme.colors.success};
          color: white;
        `;
      case 'danger':
        return `
          background-color: ${props.theme.colors.danger};
          color: white;
        `;
      case 'warning':
        return `
          background-color: ${props.theme.colors.warning};
          color: ${props.theme.colors.text.primary};
        `;
      case 'info':
        return `
          background-color: ${props.theme.colors.info};
          color: white;
        `;
      default:
        return `
          background-color: ${props.theme.colors.border.medium};
          color: ${props.theme.colors.text.primary};
        `;
    }
  }}
  
  // Размеры
  ${props => {
    switch (props.size) {
      case 'small':
        return `
          padding: ${props.theme.spacing[0.5]} ${props.theme.spacing[1.5]};
          font-size: ${props.theme.typography.fontSize.xxs[0]};
        `;
      case 'large':
        return `
          padding: ${props.theme.spacing[1.5]} ${props.theme.spacing[3]};
          font-size: ${props.theme.typography.fontSize.sm[0]};
        `;
      default:
        return '';
    }
  }}
  
  // Состояния
  ${props => {
    if (props.disabled) {
      return `
        opacity: ${props.theme.opacity[50]};
        cursor: not-allowed;
      `;
    }
    
    if (props.clickable) {
      return `
        cursor: pointer;
        transition: ${props.theme.transitions.normal};
        
        &:hover {
          opacity: ${props.theme.opacity[80]};
        }
        
        &:active {
          transform: scale(0.98);
        }
      `;
    }
    
    return '';
  }}
  
  // Границы
  ${props => {
    if (props.outlined) {
      return `
        border: 1px solid ${props => {
          if (props.color) {
            return props.theme.colors[props.color];
          }
          
          switch (props.variant) {
            case 'primary':
              return props.theme.colors.primary;
            case 'secondary':
              return props.theme.colors.border.medium;
            case 'success':
              return props.theme.colors.success;
            case 'danger':
              return props.theme.colors.danger;
            case 'warning':
              return props.theme.colors.warning;
            case 'info':
              return props.theme.colors.info;
            default:
              return props.theme.colors.border.medium;
          }
        }};
        background-color: transparent;
        color: ${props => {
          if (props.color) {
            return props.theme.colors[props.color];
          }
          
          switch (props.variant) {
            case 'primary':
              return props.theme.colors.primary;
            case 'secondary':
              return props.theme.colors.text.primary;
            case 'success':
              return props.theme.colors.success;
            case 'danger':
              return props.theme.colors.danger;
            case 'warning':
              return props.theme.colors.warning;
            case 'info':
              return props.theme.colors.info;
            default:
              return props.theme.colors.text.primary;
          }
        }};
      `;
    }
    
    return '';
  }}
`;

// Иконка в бейдже
const BadgeIcon = styled.span`
  margin-right: ${props => props.theme.spacing[1]};
  
  ${props => props.iconPosition === 'right' && `
    margin-right: 0;
    margin-left: ${props => props.theme.spacing[1]};
  `}
`;

// Компонент Badge
const Badge = ({
  children,
  variant = 'secondary',
  color,
  size = 'medium',
  shape = 'default',
  outlined = false,
  uppercase = false,
  disabled = false,
  clickable = false,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  return (
    <BadgeContainer
      variant={variant}
      color={color}
      size={size}
      shape={shape}
      outlined={outlined}
      uppercase={uppercase}
      disabled={disabled}
      clickable={clickable}
      className={`${className} badge ${variant}${color ? ` ${color}` : ''}${size ? ` ${size}` : ''}${shape ? ` ${shape}` : ''}${outlined ? ' outlined' : ''}${uppercase ? ' uppercase' : ''}${disabled ? ' disabled' : ''}${clickable ? ' clickable' : ''}`}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <BadgeIcon iconPosition={iconPosition}>
          {icon}
        </BadgeIcon>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && (
        <BadgeIcon iconPosition={iconPosition}>
          {icon}
        </BadgeIcon>
      )}
    </BadgeContainer>
  );
};

// Пропс-types для TypeScript
Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info']),
  color: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  shape: PropTypes.oneOf(['default', 'pill']),
  outlined: PropTypes.bool,
  uppercase: PropTypes.bool,
  disabled: PropTypes.bool,
  clickable: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
};

// Компонент BadgeDot для точечных бейджей
const BadgeDotContainer = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  .dot {
    width: ${props => props.size === 'small' ? '6px' : props.size === 'medium' ? '8px' : '10px'};
    height: ${props => props.size === 'small' ? '6px' : props.size === 'medium' ? '8px' : '10px'};
    border-radius: 50%;
    margin-right: ${props => props.theme.spacing[1]};
    
    ${props => {
      if (props.color) {
        return `
          background-color: ${props.theme.colors[props.color]};
        `;
      }
      
      switch (props.variant) {
        case 'primary':
          return `background-color: ${props.theme.colors.primary};`;
        case 'success':
          return `background-color: ${props.theme.colors.success};`;
        case 'danger':
          return `background-color: ${props.theme.colors.danger};`;
        case 'warning':
          return `background-color: ${props.theme.colors.warning};`;
        default:
          return `background-color: ${props.theme.colors.danger};`;
      }
    }}
  }
`;

// Компонент BadgeDot
const BadgeDot = ({
  children,
  variant = 'danger',
  color,
  size = 'medium',
  className = '',
  ...props
}) => {
  return (
    <BadgeDotContainer
      variant={variant}
      color={color}
      size={size}
      className={`${className} badge-dot ${variant}${color ? ` ${color}` : ''}${size ? ` ${size}` : ''}`}
      {...props}
    >
      <span className="dot"></span>
      {children}
    </BadgeDotContainer>
  );
};

// Пропс-types для BadgeDot
BadgeDot.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'success', 'danger', 'warning']),
  color: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
};

// Компонент BadgeGroup для группы бейджей
const BadgeGroup = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: ${props => props.gap || props.theme.spacing[2]};
  
  .badge {
    margin: 0;
  }
`;

// Компонент BadgeGroup
const BadgeGroupComponent = ({
  children,
  gap,
  className = '',
  ...props
}) => {
  return (
    <BadgeGroup
      gap={gap}
      className={`${className} badge-group`}
      {...props}
    >
      {children}
    </BadgeGroup>
  );
};

// Пропс-types для BadgeGroup
BadgeGroupComponent.propTypes = {
  children: PropTypes.node.isRequired,
  gap: PropTypes.string,
  className: PropTypes.string,
};

// Компонент BadgeStatus для статусных бейджей
const BadgeStatusContainer = styled.span`
  display: inline-flex;
  align-items: center;
  
  .status-dot {
    width: ${props => props.size === 'small' ? '6px' : props.size === 'medium' ? '8px' : '10px'};
    height: ${props => props.size === 'small' ? '6px' : props.size === 'medium' ? '8px' : '10px'};
    border-radius: 50%;
    margin-right: ${props => props.theme.spacing[1]};
    
    ${props => {
      switch (props.status) {
        case 'online':
          return `background-color: ${props.theme.colors.success};`;
        case 'offline':
          return `background-color: ${props.theme.colors.text.disabled};`;
        case 'away':
          return `background-color: ${props.theme.colors.warning};`;
        case 'busy':
          return `background-color: ${props.theme.colors.danger};`;
        default:
          return `background-color: ${props.theme.colors.text.disabled};`;
      }
    }}
  }
`;

// Компонент BadgeStatus
const BadgeStatus = ({
  status,
  size = 'medium',
  children,
  className = '',
  ...props
}) => {
  return (
    <BadgeStatusContainer
      status={status}
      size={size}
      className={`${className} badge-status ${status}`}
      {...props}
    >
      <span className="status-dot"></span>
      {children}
    </BadgeStatusContainer>
  );
};

// Пропс-types для BadgeStatus
BadgeStatus.propTypes = {
  status: PropTypes.oneOf(['online', 'offline', 'away', 'busy']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  children: PropTypes.node,
  className: PropTypes.string,
};

// Экспорт компонентов
export { Badge, BadgeDot as BadgeDotComponent, BadgeGroup as BadgeGroupComponent, BadgeStatus };