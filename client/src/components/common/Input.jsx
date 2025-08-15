import React, { useState, useEffect, useRef, forwardRef, memo } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../styles/tailwindUtils';

// Основной компонент Input
export const Input = memo(forwardRef(({
  type = 'text',
  label,
  description,
  error,
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  disabled = false,
  required = false,
  readOnly = false,
  autoFocus = false,
  maxLength,
  minLength,
  pattern,
  min,
  max,
  step,
  size = 'medium',
  icon,
  suffix,
  clearable = false,
  groupAddon,
  groupButton,
  className,
  style,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value || '');
  const inputRef = useRef(ref);
  
  // Синхронизация внутреннего значения с внешним
  useEffect(() => {
    setInternalValue(value);
  }, [value]);
  
  // Обработка изменений
  const handleChange = (e) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    
    if (onChange) {
      onChange(e);
    }
  };
  
  // Обработка потери фокуса
  const handleBlur = (e) => {
    setFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };
  
  // Обработка получения фокуса
  const handleFocus = (e) => {
    setFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };
  
  // Очистка значения
  const handleClear = () => {
    setInternalValue('');
    if (onChange) {
      const event = {
        target: {
          name: props.name,
          value: ''
        }
      };
      onChange(event);
    }
    
    // Возвращаем фокус на input после очистки
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };
  
  // Генерация уникального ID
  const inputId = props.id || `input-${props.name || Math.random().toString(36).substr(2, 9)}`;
  
  // Определяем, показывать ли кнопку очистки
  const showClearButton = clearable && internalValue && !disabled;
  
  // Определяем классы для input
  const getInputClasses = () => {
    const baseClasses = 'w-full rounded-lg border transition-all duration-200 ease-out';
    const sizeClasses = {
      small: 'px-3 py-2 text-sm',
      medium: 'px-4 py-2.5 text-base',
      large: 'px-5 py-3 text-lg',
    };
    
    const stateClasses = cn(
      {
        'border-slate-300 bg-white text-slate-900 placeholder:text-slate-500': !error && !focused,
        'border-blue-500 bg-white text-slate-900 placeholder:text-slate-500': focused,
        'border-red-500 bg-red-50 text-red-900 placeholder:text-red-500': error,
        'border-slate-300 bg-slate-100 text-slate-500 cursor-not-allowed': disabled,
        'border-slate-300 bg-slate-50 text-slate-700 cursor-not-allowed': readOnly,
      }
    );
    
    const focusClasses = focused && !error ? 'ring-2 ring-blue-500 ring-offset-2' : '';
    const errorClasses = error ? 'ring-2 ring-red-500 ring-offset-2' : '';
    
    return cn(
      baseClasses,
      sizeClasses[size],
      stateClasses,
      focusClasses,
      errorClasses,
      className
    );
  };
  
  // Определяем классы для wrapper
  const wrapperClasses = cn(
    'relative mb-4',
    {
      'mb-6': error,
    }
  );
  
  // Определяем классы для label
  const labelClasses = cn(
    'block mb-2 font-medium text-sm text-slate-700',
    {
      'text-red-600': error,
      'text-slate-500': disabled,
    }
  );
  
  // Определяем классы для description
  const descriptionClasses = 'block mb-1 text-sm text-slate-500';
  
  // Определяем классы для error
  const errorClasses = 'block mt-1 text-xs text-red-600';
  
  // Определяем классы для suffix
  const suffixClasses = 'absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none';
  
  // Определяем классы для clear button
  const clearButtonClasses = 'absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors duration-200';
  
  // Определяем классы для group
  const groupClasses = 'flex items-stretch';
  
  // Определяем классы для group addon
  const addonClasses = 'flex items-center px-4 bg-slate-100 border border-slate-300 border-r-0 text-slate-600 text-sm rounded-l-lg';
  
  // Определяем классы для group input
  const groupInputClasses = cn(
    getInputClasses(),
    'rounded-l-none border-l-0'
  );
  
  // Определяем классы для group button
  const groupButtonClasses = 'flex items-center px-4 bg-slate-100 border border-slate-300 border-l-0 text-slate-600 text-sm rounded-r-lg hover:bg-slate-200 transition-colors duration-200';
  
  return (
    <div className={wrapperClasses} style={style}>
      {label && (
        <label 
          htmlFor={inputId} 
          className={labelClasses}
        >
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {description && (
        <span className={descriptionClasses}>{description}</span>
      )}
      
      {groupAddon ? (
        <div className={groupClasses}>
          <div className={addonClasses}>{groupAddon}</div>
          <input
            type={type}
            id={inputId}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            autoFocus={autoFocus}
            maxLength={maxLength}
            minLength={minLength}
            pattern={pattern}
            min={min}
            max={max}
            step={step}
            className={groupInputClasses}
            ref={inputRef}
            {...props}
          />
          {suffix && <div className={suffixClasses}>{suffix}</div>}
          {showClearButton && (
            <button 
              type="button" 
              className={clearButtonClasses}
              onClick={handleClear}
              aria-label="Очистить поле"
            >
              ✕
            </button>
          )}
        </div>
      ) : groupButton ? (
        <div className={groupClasses}>
          <input
            type={type}
            id={inputId}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            autoFocus={autoFocus}
            maxLength={maxLength}
            minLength={minLength}
            pattern={pattern}
            min={min}
            max={max}
            step={step}
            className={getInputClasses()}
            ref={inputRef}
            {...props}
          />
          <button 
            type="button" 
            className={groupButtonClasses}
            onClick={groupButton.onClick}
            disabled={disabled}
          >
            {groupButton.children}
          </button>
        </div>
      ) : (
        <>
          <input
            type={type}
            id={inputId}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            autoFocus={autoFocus}
            maxLength={maxLength}
            minLength={minLength}
            pattern={pattern}
            min={min}
            max={max}
            step={step}
            className={getInputClasses()}
            ref={inputRef}
            {...props}
          />
          {suffix && <div className={suffixClasses}>{suffix}</div>}
          {showClearButton && (
            <button 
              type="button" 
              className={clearButtonClasses}
              onClick={handleClear}
              aria-label="Очистить поле"
            >
              ✕
            </button>
          )}
        </>
      )}
      
      {error && <span className={errorClasses}>{error}</span>}
    </div>
  );
}));

Input.propTypes = {
  type: PropTypes.oneOf([
    'text', 'email', 'password', 'number', 'tel', 'url', 
    'search', 'date', 'time', 'datetime-local', 'month', 'week'
  ]),
  label: PropTypes.string,
  description: PropTypes.string,
  error: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  readOnly: PropTypes.bool,
  autoFocus: PropTypes.bool,
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
  pattern: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  icon: PropTypes.string,
  suffix: PropTypes.node,
  clearable: PropTypes.bool,
  groupAddon: PropTypes.node,
  groupButton: PropTypes.shape({
    onClick: PropTypes.func,
    children: PropTypes.node
  }),
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для группы Input
export const InputGroup = memo(({ children, className, style }) => {
  const groupClasses = cn('flex items-stretch', className);
  
  return (
    <div className={groupClasses} style={style}>
      {children}
    </div>
  );
});

InputGroup.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Хук для управления состоянием input
export const useInput = (initialValue = '', options = {}) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  
  const handleChange = (e) => {
    setValue(e.target.value);
    
    // Валидация при изменении
    if (options.validate) {
      const validationError = options.validate(e.target.value);
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
  
  const isValid = !error && (options.required ? value !== '' : true);
  
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
    inputProps: {
      value,
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched ? error : undefined
    }
  };
};

export default Input;