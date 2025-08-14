import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Контейнер для алерта
const AlertContainer = styled.div`
  display: flex;
  align-items: flex-start;
  padding: ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing[3]};
  border: 1px solid;
  background-color: ${props => {
    switch (props.variant) {
      case 'success':
        return props.theme.colors.success + '10';
      case 'error':
        return props.theme.colors.danger + '10';
      case 'warning':
        return props.theme.colors.warning + '10';
      case 'info':
        return props.theme.colors.info + '10';
      default:
        return props.theme.colors.border.light;
    }
  }};
  border-color: ${props => {
    switch (props.variant) {
      case 'success':
        return props.theme.colors.success;
      case 'error':
        return props.theme.colors.danger;
      case 'warning':
        return props.theme.colors.warning;
      case 'info':
        return props.theme.colors.info;
      default:
        return props.theme.colors.border.medium;
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'success':
        return props.theme.colors.success;
      case 'error':
        return props.theme.colors.danger;
      case 'warning':
        return props.theme.colors.warning;
      case 'info':
        return props.theme.colors.info;
      default:
        return props.theme.colors.text.primary;
    }
  }};
  transition: ${props => props.theme.transitions.normal};
  
  ${props => props.closable && `
    position: relative;
    
    .close-button {
      position: absolute;
      top: ${props.theme.spacing[2]};
      right: ${props.theme.spacing[2]};
      background: none;
      border: none;
      cursor: pointer;
      padding: ${props.theme.spacing[0.5]};
      border-radius: ${props.theme.borderRadius.sm};
      color: ${props => {
        switch (props.variant) {
          case 'success':
            return props.theme.colors.success;
          case 'error':
            return props.theme.colors.danger;
          case 'warning':
            return props.theme.colors.warning;
          case 'info':
            return props.theme.colors.info;
          default:
            return props.theme.colors.text.tertiary;
        }
      }};
      transition: ${props => props.theme.transitions.normal};
      
      &:hover {
        background-color: ${props => props.theme.colors.border.light};
      }
      
      &:focus {
        outline: none;
        
        &::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border: 2px solid ${props => props.theme.colors.primary};
          border-radius: ${props => props.theme.borderRadius.sm};
        }
      }
    }
  `}
  
  ${props => props.withIcon && `
    padding-left: ${props.theme.spacing[4]};
    
    .icon {
      flex-shrink: 0;
      width: ${props.theme.spacing[4]};
      height: ${props.theme.spacing[4]};
      margin-right: ${props.theme.spacing[2]};
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: ${props.theme.borderRadius.md};
      background-color: ${props => {
        switch (props.variant) {
          case 'success':
            return props.theme.colors.success + '20';
          case 'error':
            return props.theme.colors.danger + '20';
          case 'warning':
            return props.theme.colors.warning + '20';
          case 'info':
            return props.theme.colors.info + '20';
          default:
            return props.theme.colors.border.light;
        }
      }};
      
      svg {
        width: ${props.theme.spacing[3]};
        height: ${props.theme.spacing[3]};
        stroke: ${props => {
          switch (props.variant) {
            case 'success':
              return props.theme.colors.success;
            case 'error':
              return props.theme.colors.danger;
            case 'warning':
              return props.theme.colors.warning;
            case 'info':
              return props.theme.colors.info;
            default:
              return props.theme.colors.text.primary;
          }
        }};
      }
    }
  `}
  
  ${props => props.shadow && `
    box-shadow: ${props => props.theme.shadow.md};
  `}
  
  ${props => props.rounded && `
    border-radius: ${props.theme.borderRadius.lg};
  `}
  
  ${props => props.outlined && `
    background-color: transparent;
  `}
`;

// Содержимое алерта
const AlertContent = styled.div`
  flex: 1;
  
  .title {
    font-size: ${props => props.theme.typography.fontSize.base[0]};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    margin-bottom: ${props => props.theme.spacing[1]};
    color: ${props => props.theme.colors.text.primary};
  }
  
  .description {
    font-size: ${props => props.theme.typography.fontSize.sm[0]};
    line-height: ${props => props.theme.typography.lineHeight.normal};
    color: ${props => props.theme.colors.text.secondary};
  }
`;

// Действия в алерте
const AlertActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  margin-top: ${props => props.theme.spacing[2]};
  
  button {
    font-size: ${props => props.theme.typography.fontSize.sm[0]};
  }
`;

// Компонент Alert
const Alert = ({
  title,
  description,
  variant = 'info',
  withIcon = true,
  closable = false,
  shadow = false,
  rounded = false,
  outlined = false,
  actions,
  className = '',
  onClose,
  ...props
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      case 'error':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      case 'warning':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      case 'info':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
      default:
        return null;
    }
  };
  
  return (
    <AlertContainer
      variant={variant}
      withIcon={withIcon}
      closable={closable}
      shadow={shadow}
      rounded={rounded}
      outlined={outlined}
      className={`${className} alert ${variant}${withIcon ? ' with-icon' : ''}${closable ? ' closable' : ''}${shadow ? ' shadow' : ''}${rounded ? ' rounded' : ''}${outlined ? ' outlined' : ''}`}
      {...props}
    >
      {withIcon && (
        <div className="icon">
          {getIcon()}
        </div>
      )}
      
      <AlertContent>
        {title && <div className="title">{title}</div>}
        {description && <div className="description">{description}</div>}
        
        {actions && (
          <AlertActions>
            {actions}
          </AlertActions>
        )}
      </AlertContent>
      
      {closable && (
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Закрыть уведомление"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </AlertContainer>
  );
};

// Пропс-types для TypeScript
Alert.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  variant: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  withIcon: PropTypes.bool,
  closable: PropTypes.bool,
  shadow: PropTypes.bool,
  rounded: PropTypes.bool,
  outlined: PropTypes.bool,
  actions: PropTypes.node,
  className: PropTypes.string,
  onClose: PropTypes.func,
};

// Компонент AlertGroup для группы алертов
const AlertGroupContainer = styled.div`
  position: fixed;
  top: ${props => props.theme.spacing[4]};
    right: ${props => props.theme.spacing[4]};
  z-index: ${props => props.theme.zIndex.alert};
  max-width: 400px;
  width: 100%;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    left: ${props => props.theme.spacing[4]};
    right: ${props => props.theme.spacing[4]};
  }
`;

// Компонент AlertGroup
const AlertGroup = ({
  alerts,
  onDismiss,
  className = '',
  ...props
}) => {
  return (
    <AlertGroupContainer className={`${className} alert-group`} {...props}>
      {alerts.map((alert, index) => (
        <Alert
          key={alert.id || index}
          {...alert}
          onClose={() => onDismiss(alert.id || index)}
        />
      ))}
    </AlertGroupContainer>
  );
};

// Пропп-types для AlertGroup
AlertGroup.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      description: PropTypes.string,
      variant: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
      withIcon: PropTypes.bool,
      closable: PropTypes.bool,
      shadow: PropTypes.bool,
      rounded: PropTypes.bool,
      outlined: PropTypes.bool,
      actions: PropTypes.node,
    })
  ).isRequired,
  onDismiss: PropTypes.func.isRequired,
  className: PropTypes.string,
};

// Компонент Banner для баннеров
const BannerContainer = styled(AlertContainer)`
  position: relative;
  border-radius: 0;
  margin: 0;
  border: none;
  border-bottom: 1px solid ${props => props.theme.colors.border.medium};
  
  ${props => props.variant === 'success' && `
    background-color: ${props.theme.colors.success + '05'};
    color: ${props.theme.colors.success};
  `}
  
  ${props => props.variant === 'error' && `
    background-color: ${props.theme.colors.danger + '05'};
    color: ${props.theme.colors.danger};
  `}
  
  ${props => props.variant === 'warning' && `
    background-color: ${props.theme.colors.warning + '05'};
    color: ${props.theme.colors.warning};
  `}
  
  ${props => props.variant === 'info' && `
    background-color: ${props.theme.colors.info + '05'};
    color: ${props.theme.colors.info};
  `}
`;

// Компонент Banner
const Banner = ({
  title,
  description,
  variant = 'info',
  withIcon = true,
  closable = false,
  actions,
  className = '',
  onClose,
  ...props
}) => {
  return (
    <BannerContainer
      variant={variant}
      withIcon={withIcon}
      closable={closable}
      className={`${className} banner ${variant}${withIcon ? ' with-icon' : ''}${closable ? ' closable' : ''}`}
      {...props}
    >
      {withIcon && (
        <div className="icon">
          <Alert variant={variant} withIcon={true}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
          </Alert>
        </div>
      )}
      
      <AlertContent>
        {title && <div className="title">{title}</div>}
        {description && <div className="description">{description}</div>}
        
        {actions && (
          <AlertActions>
            {actions}
          </AlertActions>
        )}
      </AlertContent>
      
      {closable && (
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Закрыть баннер"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </BannerContainer>
  );
};

// Пропс-types для Banner
Banner.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  variant: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  withIcon: PropTypes.bool,
  closable: PropTypes.bool,
  actions: PropTypes.node,
  className: PropTypes.string,
  onClose: PropTypes.func,
};

// Экспорт компонентов
export { Alert, AlertGroup as AlertGroupComponent, Banner };