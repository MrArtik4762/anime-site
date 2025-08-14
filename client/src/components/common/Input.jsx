import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Основной инпут
const BaseInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  font-size: ${props => props.theme.typography.fontSize.base[0]};
  font-weight: ${props => props.theme.typography.fontWeight.normal};
  line-height: ${props => props.theme.typography.lineHeight.normal};
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.surface.primary};
  border: ${props => props.theme.form.input.border} solid ${props => props.theme.colors.border.medium};
  border-radius: ${props => props.theme.borderRadius.lg};
  transition: ${props => props.theme.transitions.normal};
  outline: none;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &:disabled {
    opacity: ${props => props.theme.opacity[50]};
    cursor: not-allowed;
  }
  
  &:read-only {
    background: ${props => props.theme.colors.surface.tertiary};
    cursor: default;
  }
  
  /* Placeholder */
  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
  
  /* Для мобильных устройств */
  ${props => props.theme.media.coarse} {
    font-size: ${props => props.theme.typography.fontSize.lg[0]};
    padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[5]};
  }
`;

// Инпут с иконкой слева
const InputWithLeftIcon = styled(BaseInput)`
  padding-left: ${props => props.theme.spacing[8]};
  
  & + .input-icon-left {
    position: absolute;
    left: ${props => props.theme.spacing[4]};
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.colors.text.tertiary};
    pointer-events: none;
    z-index: 1;
  }
`;

// Инпут с иконкой справа
const InputWithRightIcon = styled(BaseInput)`
  padding-right: ${props => props.theme.spacing[8]};
  
  & + .input-icon-right {
    position: absolute;
    right: ${props => props.theme.spacing[4]};
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.colors.text.tertiary};
    cursor: pointer;
    z-index: 1;
    
    &:hover {
      color: ${props => props.theme.colors.text.primary};
    }
  }
`;

// Инпут с обеими иконками
const InputWithIcons = styled(BaseInput)`
  padding-left: ${props => props.theme.spacing[8]};
  padding-right: ${props => props.theme.spacing[8]};
  
  & + .input-icon-left {
    position: absolute;
    left: ${props => props.theme.spacing[4]};
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.colors.text.tertiary};
    pointer-events: none;
    z-index: 1;
  }
  
  & + .input-icon-right {
    position: absolute;
    right: ${props => props.theme.spacing[4]};
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.colors.text.tertiary};
    cursor: pointer;
    z-index: 1;
    
    &:hover {
      color: ${props => props.theme.colors.text.primary};
    }
  }
`;

// Контейнер для инпута с иконками
const InputContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

// Состояния инпута
const ValidInput = styled(BaseInput)`
  &:focus {
    border-color: ${props => props.theme.colors.success};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.success}20;
  }
`;

const InvalidInput = styled(BaseInput)`
  &:focus {
    border-color: ${props => props.theme.colors.error};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.error}20;
  }
`;

// Поле ввода с меткой
const LabeledInput = styled.div`
  margin-bottom: ${props => props.theme.spacing[4]};
  
  label {
    display: block;
    font-size: ${props => props.theme.typography.fontSize.sm[0]};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    color: ${props => props.theme.colors.text.primary};
    margin-bottom: ${props => props.theme.spacing[2]};
    
    .required {
      color: ${props => props.theme.colors.error};
    }
  }
  
  .input-description {
    font-size: ${props => props.theme.typography.fontSize.xs[0]};
    color: ${props => props.theme.colors.text.tertiary};
    margin-top: ${props => props.theme.spacing[1]};
  }
  
  .input-error {
    font-size: ${props => props.theme.typography.fontSize.xs[0]};
    color: ${props => props.theme.colors.error};
    margin-top: ${props => props.theme.spacing[1]};
  }
`;

// Компонент Input
const Input = ({
  label,
  required = false,
  error,
  description,
  leftIcon,
  rightIcon,
  valid = false,
  invalid = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Определяем тип инпута на основе наличия иконок
  const getInputType = () => {
    if (props.type === 'password' && rightIcon) {
      return showPassword ? 'text' : 'password';
    }
    return props.type || 'text';
  };
  
  // Определяем стили в зависимости от пропсов
  const getInputStyle = () => {
    if (valid) return ValidInput;
    if (invalid) return InvalidInput;
    return BaseInput;
  };
  
  // Определяем стили в зависимости от иконок
  const getIconStyle = () => {
    if (leftIcon && rightIcon) return InputWithIcons;
    if (leftIcon) return InputWithLeftIcon;
    if (rightIcon) return InputWithRightIcon;
    return BaseInput;
  };
  
  const InputStyle = getInputStyle();
  const IconStyle = getIconStyle();
  const CombinedInput = IconStyle.withComponent(InputStyle);
  
  // Обработка клика на правой иконке
  const handleRightIconClick = (e) => {
    e.stopPropagation();
    if (props.type === 'password') {
      setShowPassword(!showPassword);
    }
    if (props.onRightIconClick) {
      props.onRightIconClick(e);
    }
  };
  
  return (
    <LabeledInput className={className}>
      {label && (
        <label htmlFor={props.id}>
          {label}
          {required && <span className="required"> *</span>}
        </label>
      )}
      
      <InputContainer>
        <CombinedInput
          id={props.id}
          type={getInputType()}
          onFocus={(e) => {
            setIsFocused(true);
            if (props.onFocus) props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (props.onBlur) props.onBlur(e);
          }}
          {...props}
        />
        
        {leftIcon && (
          <span className="input-icon-left">
            {leftIcon}
          </span>
        )}
        
        {rightIcon && (
          <span 
            className="input-icon-right" 
            onClick={handleRightIconClick}
          >
            {props.type === 'password' 
              ? (showPassword ? '👁️' : '👁️‍🗨️') 
              : rightIcon
            }
          </span>
        )}
      </InputContainer>
      
      {description && !error && (
        <div className="input-description">
          {description}
        </div>
      )}
      
      {error && (
        <div className="input-error">
          {error}
        </div>
      )}
    </LabeledInput>
  );
};

// Пропс-types для TypeScript
Input.propTypes = {
  id: PropTypes.string,
  type: PropTypes.oneOf(['text', 'password', 'email', 'number', 'tel', 'url', 'search']),
  label: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  description: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  valid: PropTypes.bool,
  invalid: PropTypes.bool,
  className: PropTypes.string,
  onRightIconClick: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
};

// Экспорт всех типов инпутов
export const InputVariants = {
  Base: BaseInput,
  WithLeftIcon: InputWithLeftIcon,
  WithRightIcon: InputWithRightIcon,
  WithIcons: InputWithIcons,
  Valid: ValidInput,
  Invalid: InvalidInput,
};

// Экспорт контейнера
export const InputContainerComponent = InputContainer;

// Экспорт основного компонента
export default Input;