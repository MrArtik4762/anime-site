import React, { useState, useEffect, useRef, forwardRef, memo } from 'react';
import PropTypes from 'prop-types';
import { styled } from 'styled-components';
import { useResponsive } from './Responsive';

// Стилизованный компонент для radio
const StyledRadio = styled.input`
  position: absolute;
  opacity: 0;
  cursor: pointer;
  
  &:not(:disabled) ~ .radio-custom {
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
  
  &:not(:disabled):focus ~ .radio-custom {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &:checked ~ .radio-custom {
    background-color: ${props => props.theme.colors.primary};
    border-color: ${props => props.theme.colors.primary};
    
    &::after {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  &:disabled ~ .radio-custom {
    background-color: ${props => props.theme.colors.backgroundSecondary};
    border-color: ${props => props.theme.colors.border};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

// Стилизованный компонент для кастомного radio
const RadioCustom = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.small};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  user-select: none;
  
  .radio-custom {
    position: relative;
    width: ${props => props.theme.sizes.radioSize};
    height: ${props => props.theme.sizes.radioSize};
    border: ${props => props.theme.border.width.sm} solid ${props => props.theme.colors.border};
    border-radius: 50%;
    background-color: ${props => props.theme.colors.background};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all ${props => props.theme.transitions.fast};
    
    &::after {
      content: '';
      position: absolute;
      width: ${props => props.theme.sizes.radioSizeInner};
      height: ${props => props.theme.sizes.radioSizeInner};
      border-radius: 50%;
      background-color: white;
      opacity: 0;
      transform: scale(0);
      transition: all ${props => props.theme.transitions.fast};
    }
  }
  
  .radio-label {
    font-size: ${props => props.theme.fontSizes.md};
    color: ${props => props.theme.colors.text};
    font-weight: ${props => props.theme.fontWeights.normal};
    
    @media (max-width: 768px) {
      font-size: ${props => props.theme.fontSizes.sm};
    }
  }
  
  .radio-description {
    font-size: ${props => props.theme.fontSizes.sm};
    color: ${props => props.theme.colors.textSecondary};
    margin-top: ${props => props.theme.spacing.xsmall};
    
    @media (max-width: 768px) {
      font-size: ${props => props.theme.fontSizes.xs};
    }
  }
  
  .radio-error {
    font-size: ${props => props.theme.fontSizes.xs};
    color: ${props => props.theme.colors.error};
    margin-top: ${props => props.theme.spacing.xsmall};
    
    @media (max-width: 768px) {
      font-size: ${props => props.theme.fontSizes.xs};
    }
  }
`;

// Компонент для группы radio
const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.small};
  
  .radio-group-title {
    font-weight: ${props => props.theme.fontWeights.medium};
    color: ${props => props.theme.colors.text};
    margin-bottom: ${props => props.theme.spacing.small};
    font-size: ${props => props.theme.fontSizes.md};
    
    @media (max-width: 768px) {
      font-size: ${props => props.theme.fontSizes.sm};
    }
  }
  
  .radio-group-description {
    font-size: ${props => props.theme.fontSizes.sm};
    color: ${props => props.theme.colors.textSecondary};
    margin-bottom: ${props => props.theme.spacing.medium};
    
    @media (max-width: 768px) {
      font-size: ${props => props.theme.fontSizes.xs};
    }
  }
  
  .radio-group-error {
    font-size: ${props => props.theme.fontSizes.xs};
    color: ${props => props.theme.colors.error};
    margin-top: ${props => props.theme.spacing.small};
    
    @media (max-width: 768px) {
      font-size: ${props => props.theme.fontSizes.xs};
    }
  }
`;

// Компонент для горизонтальной группы radio
const RadioGroupHorizontal = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.medium};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.small};
  }
`;

// Основной компонент Radio
export const Radio = memo(forwardRef(({
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
  const radioRef = useRef(ref);
  
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
  const radioId = id || `radio-${name || Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <RadioCustom 
      className={className} 
      style={style}
      disabled={disabled}
    >
      <input
        type="radio"
        id={radioId}
        name={name}
        value={value}
        checked={isChecked}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        disabled={disabled}
        ref={radioRef}
        {...props}
      />
      <div className="radio-custom" />
      <div>
        {label && <span className="radio-label">{label}</span>}
        {description && <span className="radio-description">{description}</span>}
        {error && <span className="radio-error">{error}</span>}
      </div>
    </RadioCustom>
  );
}));

Radio.propTypes = {
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

// Компонент для группы Radio
export const RadioGroupComponent = memo(({ 
  title, 
  description, 
  options = [], 
  value = '', 
  onChange,
  error,
  disabled = false,
  required = false,
  horizontal = false,
  className,
  style,
  ...props
}) => {
  const handleChange = (optionValue) => {
    if (onChange) {
      onChange(optionValue);
    }
  };
  
  const isChecked = (optionValue) => value === optionValue;
  
  return (
    <RadioGroup 
      className={className} 
      style={style}
      error={!!error}
    >
      {title && <div className="radio-group-title">{title}</div>}
      {description && <div className="radio-group-description">{description}</div>}
      
      {horizontal ? (
        <RadioGroupHorizontal>
          {options.map((option) => (
            <Radio
              key={option.value}
              name={props.name}
              value={option.value}
              checked={isChecked(option.value)}
              onChange={() => handleChange(option.value)}
              label={option.label}
              description={option.description}
              disabled={disabled || option.disabled}
              required={required}
              {...props}
            />
          ))}
        </RadioGroupHorizontal>
      ) : (
        options.map((option) => (
          <Radio
            key={option.value}
            name={props.name}
            value={option.value}
            checked={isChecked(option.value)}
            onChange={() => handleChange(option.value)}
            label={option.label}
            description={option.description}
            disabled={disabled || option.disabled}
            required={required}
            {...props}
          />
        ))
      )}
      
      {error && <div className="radio-group-error">{error}</div>}
    </RadioGroup>
  );
});

RadioGroupComponent.propTypes = {
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
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  onChange: PropTypes.func,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  horizontal: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Хук для управления состоянием radio
export const useRadio = (initialValue = '', options = []) => {
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
    radioProps: {
      value,
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched ? error : undefined
    }
  };
};

export default Radio;