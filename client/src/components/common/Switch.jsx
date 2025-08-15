import React, { useState, useEffect, useRef, forwardRef, memo } from 'react';
import PropTypes from 'prop-types';
import { styled } from 'styled-components';
import { useResponsive } from './Responsive';

// Стилизованный компонент для switch
const StyledSwitch = styled.input`
  position: absolute;
  opacity: 0;
  cursor: pointer;
  
  &:not(:disabled) ~ .switch-custom {
    transition: all ${props => props.theme.transitions.fast};
    cursor: pointer;
    
    &:hover {
      background-color: ${props => props.theme.colors.backgroundSecondary};
    }
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  &:not(:disabled):focus ~ .switch-custom {
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &:checked ~ .switch-custom {
    background-color: ${props => props.theme.colors.primary};
    
    .switch-handle {
      transform: translateX(${props => props.size === 'small' ? '16px' : props.size === 'large' ? '24px' : '20px'});
    }
  }
  
  &:disabled ~ .switch-custom {
    background-color: ${props => props.theme.colors.backgroundSecondary};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

// Стилизованный компонент для кастомного switch
const SwitchCustom = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.small};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  user-select: none;
  
  .switch-custom {
    position: relative;
    width: ${props => props.size === 'small' ? '32px' : props.size === 'large' ? '48px' : '40px'};
    height: ${props => props.size === 'small' ? '16px' : props.size === 'large' ? '24px' : '20px'};
    border-radius: ${props => props.theme.borderRadius.lg};
    background-color: ${props => props.theme.colors.border};
    display: flex;
    align-items: center;
    padding: 0 ${props => props.size === 'small' ? '2px' : props.size === 'large' ? '2px' : '2px'};
    transition: all ${props => props.theme.transitions.fast};
    
    .switch-handle {
      position: absolute;
      width: ${props => props.size === 'small' ? '12px' : props.size === 'large' ? '20px' : '16px'};
      height: ${props => props.size === 'small' ? '12px' : props.size === 'large' ? '20px' : '16px'};
      border-radius: '50%';
      background-color: white;
      left: ${props => props.size === 'small' ? '2px' : props.size === 'large' ? '2px' : '2px'};
      top: 50%;
      transform: translateY(-50%);
      transition: transform ${props => props.theme.transitions.fast};
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }
  
  .switch-label {
    font-size: ${props => props.theme.fontSizes.md};
    color: ${props => props.theme.colors.text};
    font-weight: ${props => props.theme.fontWeights.normal};
    
    @media (max-width: 768px) {
      font-size: ${props => props.theme.fontSizes.sm};
    }
  }
  
  .switch-description {
    font-size: ${props => props.theme.fontSizes.sm};
    color: ${props => props.theme.colors.textSecondary};
    margin-top: ${props => props.theme.spacing.xsmall};
    
    @media (max-width: 768px) {
      font-size: ${props => props.theme.fontSizes.xs};
    }
  }
  
  .switch-error {
    font-size: ${props => props.theme.fontSizes.xs};
    color: ${props => props.theme.colors.error};
    margin-top: ${props => props.theme.spacing.xsmall};
    
    @media (max-width: 768px) {
      font-size: ${props => props.theme.fontSizes.xs};
    }
  }
`;

// Основной компонент Switch
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
    <SwitchCustom 
      className={className} 
      style={style}
      disabled={disabled}
      size={size}
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
      <div className="switch-custom">
        <div className="switch-handle" />
      </div>
      <div>
        {label && <span className="switch-label">{label}</span>}
        {description && <span className="switch-description">{description}</span>}
        {error && <span className="switch-error">{error}</span>}
      </div>
    </SwitchCustom>
  );
}));

Switch.propTypes = {
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
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для группы Switch
export const SwitchGroup = memo(({ 
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
    <div className={className} style={style}>
      {title && <div style={{ fontWeight: '500', marginBottom: '8px', fontSize: '14px' }}>{title}</div>}
      {description && <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>{description}</div>}
      
      {horizontal ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {options.map((option) => (
            <Switch
              key={option.value}
              name={props.name}
              value={option.value}
              checked={isChecked(option.value)}
              onChange={(e) => handleChange(option.value, e.target.checked)}
              label={option.label}
              description={option.description}
              disabled={disabled || option.disabled}
              required={required}
              size={props.size}
              {...props}
            />
          ))}
        </div>
      ) : (
        options.map((option) => (
          <Switch
            key={option.value}
            name={props.name}
            value={option.value}
            checked={isChecked(option.value)}
            onChange={(e) => handleChange(option.value, e.target.checked)}
            label={option.label}
            description={option.description}
            disabled={disabled || option.disabled}
            required={required}
            size={props.size}
            {...props}
          />
        ))
      )}
      
      {error && <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '8px' }}>{error}</div>}
    </div>
  );
});

SwitchGroup.propTypes = {
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

// Хук для управления состоянием switch
export const useSwitch = (initialValue = false, options = {}) => {
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
    switchProps: {
      checked,
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched ? error : undefined
    }
  };
};

// Хук для управления состоянием группы switch
export const useSwitchGroup = (initialValue = [], options = []) => {
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
    switchGroupProps: {
      value,
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched ? error : undefined
    }
  };
};

export default Switch;