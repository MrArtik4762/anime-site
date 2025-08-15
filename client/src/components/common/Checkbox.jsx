import React, { useState, useEffect, useRef, forwardRef, memo } from 'react';
import PropTypes from 'prop-types';
import { styled } from 'styled-components';
import { useResponsive } from './Responsive';

// Стилизованный компонент для checkbox
const StyledCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  cursor: pointer;
  
  &:not(:disabled) ~ .checkbox-custom {
    transition: all ${props => props.theme.transitions.fast};
    cursor: pointer;
    
    &:hover {
      border-color: ${props => props.theme.colors.primary};
      background-color: ${props => props.theme.colors.backgroundSecondary};
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
  
  &:not(:disabled):focus ~ .checkbox-custom {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &:checked ~ .checkbox-custom {
    background-color: ${props => props.theme.colors.primary};
    border-color: ${props => props.theme.colors.primary};
    
    &::after {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  &:disabled ~ .checkbox-custom {
    background-color: ${props => props.theme.colors.backgroundSecondary};
    border-color: ${props => props.theme.colors.border};
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  &:indeterminate ~ .checkbox-custom {
    background-color: ${props => props.theme.colors.primary};
    border-color: ${props => props.theme.colors.primary};
    
    &::after {
      opacity: 1;
      transform: scale(1);
      width: 8px;
      height: 2px;
      border: none;
      background-color: white;
    }
  }
`;

// Стилизованный компонент для кастомного checkbox
const CheckboxCustom = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.small};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  user-select: none;
  
  .checkbox-custom {
    position: relative;
    width: ${props => props.theme.sizes.checkboxSize};
    height: ${props => props.theme.sizes.checkboxSize};
    border: ${props => props.theme.border.width.sm} solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.sm};
    background-color: ${props => props.theme.colors.background};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all ${props => props.theme.transitions.fast};
    
    &::after {
      content: '';
      position: absolute;
      width: 6px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg) scale(0);
      opacity: 0;
      transition: all ${props => props.theme.transitions.fast};
    }
  }
  
  .checkbox-label {
    font-size: ${props => props.theme.fontSizes.md};
    color: ${props => props.theme.colors.text};
    font-weight: ${props => props.theme.fontWeights.normal};
    
    @media (max-width: 768px) {
      font-size: ${props => props.theme.fontSizes.sm};
    }
  }
  
  .checkbox-description {
    font-size: ${props => props.theme.fontSizes.sm};
    color: ${props => props.theme.colors.textSecondary};
    margin-top: ${props => props.theme.spacing.xsmall};
    
    @media (max-width: 768px) {
      font-size: ${props => props.theme.fontSizes.xs};
    }
  }
  
  .checkbox-error {
    font-size: ${props => props.theme.fontSizes.xs};
    color: ${props => props.theme.colors.error};
    margin-top: ${props => props.theme.spacing.xsmall};
    
    @media (max-width: 768px) {
      font-size: ${props => props.theme.fontSizes.xs};
    }
  }
`;

// Компонент для группы checkbox
const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.small};
  
  .checkbox-group-title {
    font-weight: ${props => props.theme.fontWeights.medium};
    color: ${props => props.theme.colors.text};
    margin-bottom: ${props => props.theme.spacing.small};
    font-size: ${props => props.theme.fontSizes.md};
    
    @media (max-width: 768px) {
      font-size: ${props => props.theme.fontSizes.sm};
    }
  }
  
  .checkbox-group-description {
    font-size: ${props => props.theme.fontSizes.sm};
    color: ${props => props.theme.colors.textSecondary};
    margin-bottom: ${props => props.theme.spacing.medium};
    
    @media (max-width: 768px) {
      font-size: ${props => props.theme.fontSizes.xs};
    }
  }
  
  .checkbox-group-error {
    font-size: ${props => props.theme.fontSizes.xs};
    color: ${props => props.theme.colors.error};
    margin-top: ${props => props.theme.spacing.small};
    
    @media (max-width: 768px) {
      font-size: ${props => props.theme.fontSizes.xs};
    }
  }
`;

// Компонент для горизонтальной группы checkbox
const CheckboxGroupHorizontal = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.medium};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.small};
  }
`;

// Основной компонент Checkbox
export const Checkbox = memo(forwardRef(({
  id,
  name,
  value,
  checked,
  onChange,
  onBlur,
  onFocus,
  label,
  description,
  error,
  disabled = false,
  required = false,
  indeterminate = false,
  size = 'medium',
  className,
  style,
  ...props
}, ref) => {
  const { isMobile } = useResponsive();
  const [isChecked, setIsChecked] = useState(checked || false);
  const [isIndeterminate, setIsIndeterminate] = useState(indeterminate);
  const checkboxRef = useRef(ref);
  
  // Синхронизация внутреннего состояния с внешним
  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);
  
  // Синхронизация внутреннего состояния с внешним
  useEffect(() => {
    setIsIndeterminate(indeterminate);
  }, [indeterminate]);
  
  // Обработка изменений
  const handleChange = (e) => {
    const newChecked = e.target.checked;
    setIsChecked(newChecked);
    
    if (onChange) {
      onChange(e);
    }
  };
  
  // Обработка потери фокуса
  const handleBlur = (e) => {
    if (onBlur) {
      onBlur(e);
    }
  };
  
  // Обработка получения фокуса
  const handleFocus = (e) => {
    if (onFocus) {
      onFocus(e);
    }
  };
  
  // Генерация уникального ID
  const checkboxId = id || `checkbox-${name || Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <CheckboxCustom 
      className={className} 
      style={style}
      disabled={disabled}
    >
      <input
        type="checkbox"
        id={checkboxId}
        name={name}
        value={value}
        checked={isChecked}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        disabled={disabled}
        ref={checkboxRef}
        indeterminate={isIndeterminate}
        {...props}
      />
      <div className="checkbox-custom" />
      <div>
        {label && <span className="checkbox-label">{label}</span>}
        {description && <span className="checkbox-description">{description}</span>}
        {error && <span className="checkbox-error">{error}</span>}
      </div>
    </CheckboxCustom>
  );
}));

Checkbox.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  label: PropTypes.string,
  description: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  indeterminate: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для группы Checkbox
export const CheckboxGroupComponent = memo(({ 
  title, 
  description, 
  options = [], 
  value = [], 
  onChange,
  error,
  disabled = false,
  required = false,
  horizontal = false,
  className,
  style,
  ...props
}) => {
  const handleChange = (optionValue, checked) => {
    let newValue;
    
    if (checked) {
      newValue = [...value, optionValue];
    } else {
      newValue = value.filter(v => v !== optionValue);
    }
    
    if (onChange) {
      onChange(newValue);
    }
  };
  
  const isChecked = (optionValue) => value.includes(optionValue);
  
  return (
    <CheckboxGroup 
      className={className} 
      style={style}
      error={!!error}
    >
      {title && <div className="checkbox-group-title">{title}</div>}
      {description && <div className="checkbox-group-description">{description}</div>}
      
      {horizontal ? (
        <CheckboxGroupHorizontal>
          {options.map((option) => (
            <Checkbox
              key={option.value}
              name={props.name}
              value={option.value}
              checked={isChecked(option.value)}
              onChange={(e) => handleChange(option.value, e.target.checked)}
              label={option.label}
              description={option.description}
              disabled={disabled || option.disabled}
              required={required}
              {...props}
            />
          ))}
        </CheckboxGroupHorizontal>
      ) : (
        options.map((option) => (
          <Checkbox
            key={option.value}
            name={props.name}
            value={option.value}
            checked={isChecked(option.value)}
            onChange={(e) => handleChange(option.value, e.target.checked)}
            label={option.label}
            description={option.description}
            disabled={disabled || option.disabled}
            required={required}
            {...props}
          />
        ))
      )}
      
      {error && <div className="checkbox-group-error">{error}</div>}
    </CheckboxGroup>
  );
});

CheckboxGroupComponent.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]).isRequired,
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
      disabled: PropTypes.bool
    })
  ),
  value: PropTypes.array,
  onChange: PropTypes.func,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  horizontal: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для переключателя (тумблер)
export const Switch = memo(forwardRef(({
  id,
  name,
  value,
  checked,
  onChange,
  onBlur,
  onFocus,
  label,
  description,
  error,
  disabled = false,
  required = false,
  size = 'medium',
  className,
  style,
  ...props
}, ref) => {
  const { isMobile } = useResponsive();
  const [isChecked, setIsChecked] = useState(checked || false);
  const switchRef = useRef(ref);
  
  // Синхронизация внутреннего состояния с внешним
  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);
  
  // Обработка изменений
  const handleChange = (e) => {
    const newChecked = e.target.checked;
    setIsChecked(newChecked);
    
    if (onChange) {
      onChange(e);
    }
  };
  
  // Обработка потери фокуса
  const handleBlur = (e) => {
    if (onBlur) {
      onBlur(e);
    }
  };
  
  // Обработка получения фокуса
  const handleFocus = (e) => {
    if (onFocus) {
      onFocus(e);
    }
  };
  
  // Генерация уникального ID
  const switchId = id || `switch-${name || Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <CheckboxCustom 
      className={className} 
      style={style}
      disabled={disabled}
    >
      <input
        type="checkbox"
        id={switchId}
        name={name}
        value={value}
        checked={isChecked}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        disabled={disabled}
        ref={switchRef}
        {...props}
      />
      <div 
        className="checkbox-custom" 
        style={{
          width: size === 'small' ? '32px' : size === 'large' ? '48px' : '40px',
          height: size === 'small' ? '16px' : size === 'large' ? '24px' : '20px',
          borderRadius: '999px',
          backgroundColor: isChecked ? props.theme.colors.primary : props.theme.colors.border,
          border: 'none',
          
          &::after {
            content: '';
            position: absolute;
            width: size === 'small' ? '12px' : size === 'large' ? '20px' : '16px';
            height: size === 'small' ? '12px' : size === 'large' ? '20px' : '16px';
            border-radius: '50%';
            background-color: 'white';
            left: size === 'small' ? '2px' : size === 'large' ? '2px' : '2px',
            top: size === 'small' ? '2px' : size === 'large' ? '0px' : '2px',
            transform: isChecked ? `translateX(${size === 'small' ? '16px' : size === 'large' ? '24px' : '20px'})` : 'translateX(0)',
            transition: 'transform 0.2s ease',
          }
        }}
      />
      <div>
        {label && <span className="checkbox-label">{label}</span>}
        {description && <span className="checkbox-description">{description}</span>}
        {error && <span className="checkbox-error">{error}</span>}
      </div>
    </CheckboxCustom>
  );
}));

Switch.propTypes = {
  ...Checkbox.propTypes,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
};

// Хук для управления состоянием checkbox
export const useCheckbox = (initialValue = false, options = {}) => {
  const [checked, setChecked] = useState(initialValue);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  
  const handleChange = (e) => {
    const newChecked = e.target.checked;
    setChecked(newChecked);
    
    // Валидация при изменении
    if (options.validate) {
      const validationError = options.validate(newChecked);
      setError(validationError);
    }
  };
  
  const handleBlur = () => {
    setTouched(true);
    
    // Валидация при потере фокуса
    if (options.validate) {
      const validationError = options.validate(checked);
      setError(validationError);
    }
  };
  
  const reset = () => {
    setChecked(initialValue);
    setError('');
    setTouched(false);
  };
  
  const isValid = !error;
  
  return {
    checked,
    setChecked,
    error,
    setError,
    touched,
    setTouched,
    handleChange,
    handleBlur,
    reset,
    isValid,
    checkboxProps: {
      checked,
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched ? error : undefined
    }
  };
};

// Хук для управления состоянием группы checkbox
export const useCheckboxGroup = (initialValue = [], options = []) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  
  const handleChange = (newValue) => {
    setValue(newValue);
    
    // Валидация при изменении
    if (options.validate) {
      const validationError = options.validate(newValue);
      setError(validationError);
    }
  };
  
  const handleBlur = () => {
    setTouched(true);
    
    // Валидация при потере фокуса
    if (options.validate) {
      const validationError = options.validate(value);
      setError(validationError);
    }
  };
  
  const reset = () => {
    setValue(initialValue);
    setError('');
    setTouched(false);
  };
  
  const isValid = !error;
  
  return {
    value,
    setValue,
    error,
    setError,
    touched,
    setTouched,
    handleChange,
    handleBlur,
    reset,
    isValid,
    checkboxGroupProps: {
      value,
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched ? error : undefined
    }
  };
};

export default Checkbox;