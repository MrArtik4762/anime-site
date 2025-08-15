import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { styled } from 'styled-components';

// Стилизованный компонент для алерта
const StyledAlert = styled.div`
  display: flex;
  align-items: flex-start;
  padding: ${props => {
    if (props.size === 'small') return `${props.theme.spacing.small} ${props.theme.spacing.medium}`;
    if (props.size === 'large') return `${props.theme.spacing.medium} ${props.theme.spacing.large}`;
    return `${props.theme.spacing.medium} ${props.theme.spacing.medium}`;
  }};
  background-color: ${props => {
    if (props.variant === 'info') return props.theme.colors.infoBg;
    if (props.variant === 'success') return props.theme.colors.successBg;
    if (props.variant === 'warning') return props.theme.colors.warningBg;
    if (props.variant === 'error') return props.theme.colors.errorBg;
    if (props.variant === 'dark') return props.theme.colors.darkBg;
    return props.theme.colors.infoBg;
  }};
  border-left: ${props => props.theme.border.width.md} solid ${props => {
    if (props.variant === 'info') return props.theme.colors.info;
    if (props.variant === 'success') return props.theme.colors.success;
    if (props.variant === 'warning') return props.theme.colors.warning;
    if (props.variant === 'error') return props.theme.colors.error;
    if (props.variant === 'dark') return props.theme.colors.dark;
    return props.theme.colors.info;
  }};
  border-radius: ${props => props.theme.border.radius.md};
  margin-bottom: ${props => props.theme.spacing.medium};
  box-shadow: ${props => props.theme.shadows.sm};
  transition: all ${props => props.theme.transitions.medium} ease;
  position: relative;
  overflow: hidden;
  
  ${props => props.closable && `
    padding-right: ${props.theme.spacing.large};
  `}
  
  ${props => props.outlined && `
    background-color: transparent;
    border: ${props => props.theme.border.width.sm} solid ${props => {
      if (props.variant === 'info') return props.theme.colors.info;
      if (props.variant === 'success') return props.theme.colors.success;
      if (props.variant === 'warning') return props.theme.colors.warning;
      if (props.variant === 'error') return props.theme.colors.error;
      if (props.variant === 'dark') return props.theme.colors.dark;
      return props.theme.colors.info;
    }};
    box-shadow: none;
  `}
  
  ${props => props.shadow && `
    box-shadow: ${props => props.theme.shadows.md};
  `}
  
  ${props => props.rounded && `
    border-radius: ${props => props.theme.border.radius.lg};
  `}
  
  ${props => props.bordered && `
    border: ${props => props.theme.border.width.sm} solid ${props => {
      if (props.variant === 'info') return props.theme.colors.info;
      if (props.variant === 'success') return props.theme.colors.success;
      if (props.variant === 'warning') return props.theme.colors.warning;
      if (props.variant === 'error') return props.theme.colors.error;
      if (props.variant === 'dark') return props.theme.colors.dark;
      return props.theme.colors.info;
    }};
  `}
  
  ${props => props.showIcon && `
    &::before {
      content: '';
      position: absolute;
      left: ${props.theme.spacing.medium};
      top: 50%;
      transform: translateY(-50%);
      width: ${props.theme.iconSizes.md};
      height: ${props.theme.iconSizes.md};
      background-color: ${props => {
        if (props.variant === 'info') return props.theme.colors.info;
        if (props.variant === 'success') return props.theme.colors.success;
        if (props.variant === 'warning') return props.theme.colors.warning;
        if (props.variant === 'error') return props.theme.colors.error;
        if (props.variant === 'dark') return props.theme.colors.dark;
        return props.theme.colors.info;
      }};
      border-radius: 50%;
      opacity: 0.2;
    }
  `}
  
  ${props => props.size === 'small' && `
    padding: ${props.theme.spacing.small} ${props.theme.spacing.medium};
    font-size: ${props.theme.fontSizes.sm};
    
    ${props => props.showIcon && `
      &::before {
        width: ${props.theme.iconSizes.sm};
        height: ${props.theme.iconSizes.sm};
        left: ${props.theme.spacing.small};
      }
    `}
  `}
  
  ${props => props.size === 'large' && `
    padding: ${props.theme.spacing.medium} ${props.theme.spacing.large};
    font-size: ${props.theme.fontSizes.lg};
    
    ${props => props.showIcon && `
      &::before {
        width: ${props.theme.iconSizes.lg};
        height: ${props.theme.iconSizes.lg};
        left: ${props.theme.spacing.medium};
      }
    `}
  `}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
  
  @media (max-width: 768px) {
    ${props => props.size === 'small' && `
      padding: ${props.theme.spacing.xsmall} ${props.theme.spacing.small};
      font-size: ${props.theme.fontSizes.xs};
    `}
    
    ${props => props.size === 'large' && `
      padding: ${props.theme.spacing.small} ${props.theme.spacing.medium};
      font-size: ${props.theme.fontSizes.md};
    `}
    
    ${props => props.shadow && `
      box-shadow: ${props => props.theme.shadows.sm};
    `}
  }
`;

// Стилизованный заголовок алерта
const AlertTitle = styled.h3`
  font-size: ${props => {
    if (props.size === 'small') return props.theme.fontSizes.sm;
    if (props.size === 'large') return props.theme.fontSizes.lg;
    return props.theme.fontSizes.base;
  }};
  font-weight: ${props => props.theme.fontWeights.semibold};
  margin: 0 0 ${props => props.theme.spacing.small} 0;
  color: ${props => {
    if (props.variant === 'info') return props.theme.colors.info;
    if (props.variant === 'success') return props.theme.colors.success;
    if (props.variant === 'warning') return props.theme.colors.warning;
    if (props.variant === 'error') return props.theme.colors.error;
    if (props.variant === 'dark') return props.theme.colors.dark;
    return props.theme.colors.info;
  }};
  
  ${props => props.size === 'small' && `
    font-size: ${props.theme.fontSizes.xs};
    margin-bottom: ${props.theme.spacing.xsmall};
  `}
  
  ${props => props.size === 'large' && `
    font-size: ${props.theme.fontSizes.xl};
    margin-bottom: ${props.theme.spacing.medium};
  `}
`;

// Стилизованное содержимое алерта
const AlertContent = styled.div`
  flex: 1;
  color: ${props => props.theme.colors.text};
  font-size: ${props => {
    if (props.size === 'small') return props.theme.fontSizes.sm;
    if (props.size === 'large') return props.theme.fontSizes.lg;
    return props.theme.fontSizes.base;
  }};
  line-height: ${props => props.theme.lineHeights.normal};
  
  ${props => props.size === 'small' && `
    font-size: ${props.theme.fontSizes.xs};
  `}
  
  ${props => props.size === 'large' && `
    font-size: ${props.theme.fontSizes.md};
  `}
  
  p {
    margin: 0 0 ${props => props.theme.spacing.small} 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

// Стилизованная кнопка закрытия
const CloseButton = styled.button`
  position: absolute;
  top: ${props => props.theme.spacing.small};
  right: ${props => props.theme.spacing.small};
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: ${props => props.theme.spacing.xsmall};
  border-radius: ${props => props.theme.border.radius.sm};
  transition: all ${props => props.theme.transitions.fast} ease;
  
  &:hover {
    background-color: ${props => props.theme.colors.hover};
    color: ${props => props.theme.colors.text};
  }
  
  ${props => props.size === 'small' && `
    top: ${props.theme.spacing.xsmall};
    right: ${props.theme.spacing.xsmall};
    padding: ${props.theme.spacing.xsmall};
  `}
  
  ${props => props.size === 'large' && `
    top: ${props.theme.spacing.medium};
    right: ${props.theme.spacing.medium};
    padding: ${props.theme.spacing.small};
  `}
`;

// Основной компонент Alert
export const Alert = memo(({
  title,
  children,
  variant = 'info',
  size = 'medium',
  closable = false,
  outlined = false,
  shadow = false,
  rounded = false,
  bordered = false,
  showIcon = false,
  onClose,
  className,
  style,
  ...props
}) => {
  const handleClose = (e) => {
    e.preventDefault();
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <StyledAlert
      variant={variant}
      size={size}
      closable={closable}
      outlined={outlined}
      shadow={shadow}
      rounded={rounded}
      bordered={bordered}
      showIcon={showIcon}
      className={className}
      style={style}
      {...props}
    >
      {showIcon && (
        <div
          style={{
            marginRight: props.theme.spacing.medium,
            color: variant === 'info' ? props.theme.colors.info :
                   variant === 'success' ? props.theme.colors.success :
                   variant === 'warning' ? props.theme.colors.warning :
                   variant === 'error' ? props.theme.colors.error :
                   props.theme.colors.dark,
            flexShrink: 0,
            marginTop: props.size === 'small' ? '2px' : '4px'
          }}
        >
          {variant === 'info' && 'ℹ️'}
          {variant === 'success' && '✅'}
          {variant === 'warning' && '⚠️'}
          {variant === 'error' && '❌'}
          {variant === 'dark' && '🔒'}
        </div>
      )}
      
      <div style={{ flex: 1 }}>
        {title && (
          <AlertTitle variant={variant} size={size}>
            {title}
          </AlertTitle>
        )}
        <AlertContent size={size}>
          {children}
        </AlertContent>
      </div>
      
      {closable && (
        <CloseButton
          size={size}
          onClick={handleClose}
          aria-label="Закрыть"
        >
          ×
        </CloseButton>
      )}
    </StyledAlert>
  );
});

Alert.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'error', 'dark']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  closable: PropTypes.bool,
  outlined: PropTypes.bool,
  shadow: PropTypes.bool,
  rounded: PropTypes.bool,
  bordered: PropTypes.bool,
  showIcon: PropTypes.bool,
  onClose: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент AlertGroup для группировки алертов
export const AlertGroup = memo(({
  children,
  className,
  style,
  ...props
}) => {
  return (
    <div className={className} style={style} {...props}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            style: {
              marginBottom: index === React.Children.count(children) - 1 ? 0 : child.props.theme.spacing.medium,
              ...child.props.style
            }
          });
        }
        return child;
      })}
    </div>
  );
});

AlertGroup.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент AlertBanner для баннеров
export const AlertBanner = memo(({
  title,
  children,
  variant = 'info',
  size = 'medium',
  closable = false,
  onClose,
  className,
  style,
  ...props
}) => {
  return (
    <Alert
      title={title}
      variant={variant}
      size={size}
      closable={closable}
      onClose={onClose}
      className={className}
      style={{
        borderRadius: 0,
        marginBottom: 0,
        ...style
      }}
      {...props}
    >
      {children}
    </Alert>
  );
});

AlertBanner.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'error', 'dark']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  closable: PropTypes.bool,
  onClose: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент Toast для всплывающих уведомлений
export const Toast = memo(({
  title,
  children,
  variant = 'info',
  size = 'medium',
  duration = 5000,
  onClose,
  className,
  style,
  ...props
}) => {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);
  
  return (
    <Alert
      title={title}
      variant={variant}
      size={size}
      closable={true}
      onClose={onClose}
      className={className}
      style={{
        position: 'fixed',
        top: props.theme.spacing.medium,
        right: props.theme.spacing.medium,
        zIndex: props.theme.zIndex.toast,
        minWidth: '300px',
        maxWidth: '500px',
        ...style
      }}
      {...props}
    >
      {children}
    </Alert>
  );
});

Toast.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'error', 'dark']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  duration: PropTypes.number,
  onClose: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент AlertList для списка алертов
export const AlertList = memo(({
  alerts,
  onDismiss,
  className,
  style,
  ...props
}) => {
  return (
    <div className={className} style={style} {...props}>
      {alerts.map((alert, index) => (
        <Alert
          key={alert.id || index}
          title={alert.title}
          variant={alert.variant}
          size={alert.size}
          closable={true}
          onClose={() => onDismiss(alert.id)}
          style={{
            marginBottom: index === alerts.length - 1 ? 0 : props.theme.spacing.medium,
            ...alert.style
          }}
        >
          {alert.message}
        </Alert>
      ))}
    </div>
  );
});

AlertList.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      message: PropTypes.node,
      variant: PropTypes.oneOf(['info', 'success', 'warning', 'error', 'dark']),
      size: PropTypes.oneOf(['small', 'medium', 'large']),
      style: PropTypes.object,
    })
  ),
  onDismiss: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Alert;