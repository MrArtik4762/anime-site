import React, { useState, useEffect, useRef, forwardRef, memo } from 'react';
import PropTypes from 'prop-types';
import { styled } from 'styled-components';
import { useResponsive } from './Responsive';

// Стилизованный компонент для textarea
const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: ${props => props.theme.sizes.minTextareaHeight};
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
  font-size: ${props => props.theme.fontSizes.md};
  font-family: ${props => props.theme.fonts.body};
  border: ${props => props.theme.border.width.sm} solid ${props => {
    if (props.error) return props.theme.colors.error;
    if (props.focused) return props.theme.colors.primary;
    return props.theme.colors.border;
  }};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  transition: all ${props => props.theme.transitions.fast};
  resize: ${props => props.resizable ? 'vertical' : 'none'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
  
  /* Состояния */
  ${props => props.error && `
    border-color: ${props.theme.colors.error};
    
    &:focus {
      box-shadow: 0 0 0 3px ${props.theme.colors.error}20;
    }
  `}
  
  ${props => props.disabled && `
    background-color: ${props.theme.colors.backgroundSecondary};
    color: ${props.theme.colors.textSecondary};
    cursor: not-allowed;
    opacity: 0.7;
  `}
  
  /* Адаптивность */
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing.xsmall} ${props => props.theme.spacing.medium};
    font-size: ${props => props.theme.fontSizes.sm};
    min-height: ${props => props.theme.sizes.minTextareaHeightMobile};
  }
  
  /* Размеры */
  ${props => props.size === 'small' && `
    padding: ${props => props.theme.spacing.xsmall} ${props.theme.spacing.small};
    font-size: ${props.theme.fontSizes.sm};
    min-height: ${props => props.theme.sizes.minTextareaHeightSmall};
  `}
  
  ${props => props.size === 'large' && `
    padding: ${props.theme.spacing.medium} ${props.theme.spacing.large};
    font-size: ${props.theme.fontSizes.lg};
    min-height: ${props => props.theme.sizes.minTextareaHeightLarge};
  `}
  
  /* Автоматическая высота */
  ${props => props.autoResize && `
    overflow-y: hidden;
    min-height: auto;
  `}
`;

// Компонент для обертки textarea с меткой и ошибками
const TextareaWrapper = styled.div`
  position: relative;
  margin-bottom: ${props => props.theme.spacing.medium};
  
  .textarea-label {
    display: block;
    margin-bottom: ${props => props.theme.spacing.xsmall};
    font-weight: ${props => props.theme.fontWeights.medium};
    color: ${props => props.theme.colors.text};
    font-size: ${props => props.theme.fontSizes.sm};
    
    @media (max-width: 768px) {
      font-size: ${props => props.theme.fontSizes.xs};
    }
  }
  
  .textarea-description {
    display: block;
    margin-bottom: ${props => props.theme.spacing.xsmall};
    font-size: ${props => props.theme.fontSizes.sm};
    color: ${props => props.theme.colors.textSecondary};
    
    @media (max-width: 768px) {
      font-size: ${props => props.theme.fontSizes.xs};
    }
  }
  
  .textarea-error {
    display: block;
    margin-top: ${props => props.theme.spacing.xsmall};
    font-size: ${props => props.theme.fontSizes.xs};
    color: ${props => props.theme.colors.error};
    
    @media (max-width: 768px) {
      font-size: ${props => props.theme.fontSizes.xs};
    }
  }
  
  .textarea-counter {
    position: absolute;
    bottom: ${props => props.theme.spacing.xsmall};
    right: ${props => props.theme.spacing.medium};
    font-size: ${props => props.theme.fontSizes.xs};
    color: ${props => props.theme.colors.textSecondary};
    
    @media (max-width: 768px) {
      right: ${props => props.theme.spacing.small};
      font-size: ${props => props.theme.fontSizes.xxs};
    }
    
    ${props => props.error && `
      color: ${props.theme.colors.error};
    `}
  }
  
  .textarea-character-limit {
    position: absolute;
    bottom: ${props => props.theme.spacing.xsmall};
    right: ${props => props.theme.spacing.medium};
    font-size: ${props => props.theme.fontSizes.xs};
    color: ${props => {
      if (props.error) return props.theme.colors.error;
      if (props.warning) return props.theme.colors.warning;
      return props.theme.colors.textSecondary;
    }};
    
    @media (max-width: 768px) {
      right: ${props => props.theme.spacing.small};
      font-size: ${props => props.theme.fontSizes.xxs};
    }
  }
`;

// Компонент для группы textarea
const TextareaGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.small};
  
  .textarea-group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
    background-color: ${props => props.theme.colors.backgroundSecondary};
    border: ${props => props.theme.border.width.sm} solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.md} ${props => props.theme.borderRadius.md} 0 0;
    font-size: ${props => props.theme.fontSizes.sm};
    color: ${props => props.theme.colors.text};
    
    @media (max-width: 768px) {
      padding: ${props => props.theme.spacing.xsmall} ${props => props.theme.spacing.small};
      font-size: ${props => props.theme.fontSizes.xs};
    }
  }
  
  .textarea-group-body {
    border: ${props => props.theme.border.width.sm} solid ${props => props.theme.colors.border};
    border-radius: 0 0 ${props => props.theme.borderRadius.md} ${props => props.theme.borderRadius.md};
    overflow: hidden;
  }
`;

// Основной компонент Textarea
export const Textarea = memo(forwardRef(({
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
  rows = 4,
  cols,
  resize = true,
  autoResize = false,
  size = 'medium',
  showCounter = false,
  showCharacterLimit = false,
  className,
  style,
  ...props
}, ref) => {
  const { isMobile } = useResponsive();
  const [focused, setFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value || '');
  const textareaRef = useRef(ref);
  
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
  
  // Автоматическая регулировка высоты
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [internalValue, autoResize]);
  
  // Генерация уникального ID
  const textareaId = props.id || `textarea-${props.name || Math.random().toString(36).substr(2, 9)}`;
  
  // Расчет состояния счетчика символов
  const characterCount = internalValue.length;
  const characterLimit = maxLength;
  const characterPercentage = characterLimit ? (characterCount / characterLimit) * 100 : 0;
  const isCharacterLimitWarning = characterLimit && characterPercentage >= 80 && characterPercentage < 100;
  const isCharacterLimitError = characterLimit && characterPercentage >= 100;
  
  return (
    <TextareaWrapper className={className} style={style} error={!!error} warning={isCharacterLimitWarning}>
      {label && (
        <label 
          htmlFor={textareaId} 
          className="textarea-label"
        >
          {label}
          {required && <span style={{ color: 'red' }}>*</span>}
        </label>
      )}
      
      {description && (
        <span className="textarea-description">{description}</span>
      )}
      
      <StyledTextarea
        id={textareaId}
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
        rows={rows}
        cols={cols}
        resize={resize}
        autoResize={autoResize}
        size={size}
        error={!!error}
        focused={focused}
        ref={textareaRef}
        {...props}
      />
      
      {showCounter && (
        <div className="textarea-counter">
          {characterCount} {characterCount === 1 ? 'символ' : characterCount < 5 ? 'символа' : 'символов'}
        </div>
      )}
      
      {showCharacterLimit && characterLimit && (
        <div className="textarea-character-limit" error={isCharacterLimitError} warning={isCharacterLimitWarning}>
          {characterCount} / {characterLimit}
        </div>
      )}
      
      {error && <span className="textarea-error">{error}</span>}
    </TextareaWrapper>
  );
}));

Textarea.propTypes = {
  label: PropTypes.string,
  description: PropTypes.string,
  error: PropTypes.string,
  value: PropTypes.string,
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
  rows: PropTypes.number,
  cols: PropTypes.number,
  resize: PropTypes.bool,
  autoResize: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showCounter: PropTypes.bool,
  showCharacterLimit: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для группы Textarea
export const TextareaGroupComponent = memo(({ children, className, style }) => {
  return (
    <TextareaGroup className={className} style={style}>
      {children}
    </TextareaGroup>
  );
});

TextareaGroupComponent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для форматированного текста с подсветкой синтаксиса
export const CodeTextarea = memo(forwardRef(({
  language = 'javascript',
  ...props
}, ref) => {
  return (
    <Textarea
      ref={ref}
      {...props}
      style={{
        fontFamily: 'monospace',
        fontSize: '0.9em',
        lineHeight: '1.5',
        tabSize: 2
      }}
    />
  );
}));

CodeTextarea.propTypes = {
  language: PropTypes.string,
  ...Textarea.propTypes
};

// Хук для управления состоянием textarea
export const useTextarea = (initialValue = '', options = {}) => {
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
    textareaProps: {
      value,
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched ? error : undefined
    }
  };
};

export default Textarea;