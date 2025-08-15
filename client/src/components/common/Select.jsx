import React, { useState, useEffect, useRef, forwardRef, memo } from 'react';
import PropTypes from 'prop-types';
import { styled } from 'styled-components';
import { useResponsive } from './Responsive';

// Стилизованный компонент для select
const StyledSelect = styled.select`
  width: 100%;
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
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right ${props => props.theme.spacing.medium} center;
  background-size: 12px;
  padding-right: ${props => props.theme.spacing.large};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &:hover:not(:disabled) {
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
    color: ${props => props.theme.colors.textSecondary};
    cursor: not-allowed;
    opacity: 0.7;
    
    &:hover {
      border-color: ${props.theme.colors.border};
    }
  `}
  
  /* Адаптивность */
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing.xsmall} ${props => props.theme.spacing.medium};
    font-size: ${props => props.theme.fontSizes.sm};
    background-position: right ${props => props.theme.spacing.small} center;
    padding-right: ${props => props.theme.spacing.medium};
  }
  
  /* Размеры */
  ${props => props.size === 'small' && `
    padding: ${props => props.theme.spacing.xsmall} ${props.theme.spacing.small};
    font-size: ${props.theme.fontSizes.sm};
  `}
  
  ${props => props.size === 'large' && `
    padding: ${props.theme.spacing.medium} ${props.theme.spacing.large};
    font-size: ${props.theme.fontSizes.lg};
  `}
  
  /* Стиль для групп */
  ${props => props.grouped && `
    padding-right: ${props.theme.spacing.medium};
    background-image: none;
  `}
`;

// Стилизованный компонент для option
const StyledOption = styled.option`
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
  
  &:disabled {
    color: ${props => props.theme.colors.textSecondary};
    cursor: not-allowed;
  }
  
  ${props => props.group && `
    font-weight: ${props => props.theme.fontWeights.medium};
    color: ${props => props.theme.colors.textSecondary};
    background-color: ${props => props.theme.colors.backgroundSecondary};
  `}
`;

// Компонент для обертки select с меткой и ошибками
const SelectWrapper = styled.div`
  position: relative;
  margin-bottom: ${props => props.theme.spacing.medium};
  
  .select-label {
    display: block;
    margin-bottom: ${props => props.theme.spacing.xsmall};
    font-weight: ${props => props.theme.fontWeights.medium};
    color: ${props => props.theme.colors.text};
    font-size: ${props => props.theme.fontSizes.sm};
    
    @media (max-width: 768px) {
      font-size: ${props => props.theme.fontSizes.xs};
    }
  }
  
  .select-description {
    display: block;
    margin-bottom: ${props => props.theme.spacing.xsmall};
    font-size: ${props => props.theme.fontSizes.sm};
    color: ${props => props.theme.colors.textSecondary};
    
    @media (max-width: 768px) {
      font-size: ${props => props.theme.fontSizes.xs};
    }
  }
  
  .select-error {
    display: block;
    margin-top: ${props => props.theme.spacing.xsmall};
    font-size: ${props => props.theme.fontSizes.xs};
    color: ${props => props.theme.colors.error};
    
    @media (max-width: 768px) {
      font-size: ${props => props.theme.fontSizes.xs};
    }
  }
  
  .select-suffix {
    position: absolute;
    right: ${props => props.theme.spacing.medium};
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: ${props => props.theme.colors.textSecondary};
    font-size: ${props => props.theme.fontSizes.sm};
    
    @media (max-width: 768px) {
      right: ${props => props.theme.spacing.small};
      font-size: ${props => props.theme.fontSizes.xs};
    }
  }
  
  .select-clear {
    position: absolute;
    right: ${props => props.theme.spacing.medium};
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: ${props => props.theme.colors.textSecondary};
    padding: 4px;
    
    &:hover {
      color: ${props => props.theme.colors.text};
    }
    
    @media (max-width: 768px) {
      right: ${props => props.theme.spacing.small};
    }
  }
`;

// Компонент для группы select
const SelectGroup = styled.div`
  display: flex;
  align-items: stretch;
  
  .select-group-addon {
    display: flex;
    align-items: center;
    padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
    background-color: ${props => props.theme.colors.backgroundSecondary};
    border: ${props => props.theme.border.width.sm} solid ${props => props.theme.colors.border};
    border-right: none;
    border-radius: ${props => props.theme.borderRadius.md} 0 0 ${props => props.theme.borderRadius.md};
    color: ${props => props.theme.colors.textSecondary};
    font-size: ${props => props.theme.fontSizes.sm};
    
    @media (max-width: 768px) {
      padding: ${props => props.theme.spacing.xsmall} ${props => props.theme.spacing.small};
      font-size: ${props => props.theme.fontSizes.xs};
    }
  }
  
  .select-group-select {
    border-radius: 0 ${props => props.theme.borderRadius.md} ${props => props.theme.borderRadius.md} 0;
    border-left: none;
  }
  
  .select-group-button {
    display: flex;
    align-items: center;
    padding: 0 ${props => props.theme.spacing.medium};
    background-color: ${props => props.theme.colors.backgroundSecondary};
    border: ${props => props.theme.border.width.sm} solid ${props => props.theme.colors.border};
    border-left: none;
    border-radius: 0 ${props => props.theme.borderRadius.md} ${props => props.theme.borderRadius.md} 0;
    cursor: pointer;
    transition: background-color ${props => props.theme.transitions.fast};
    
    &:hover {
      background-color: ${props => props.theme.colors.hover};
    }
    
    @media (max-width: 768px) {
      padding: 0 ${props => props.theme.spacing.small};
    }
  }
`;

// Основной компонент Select
export const Select = memo(forwardRef(({
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
  size = 'medium',
  options = [],
  grouped = false,
  clearable = false,
  groupAddon,
  groupButton,
  className,
  style,
  ...props
}, ref) => {
  const { isMobile } = useResponsive();
  const [focused, setFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const selectRef = useRef(ref);
  
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
    
    // Возвращаем фокус на select после очистки
    setTimeout(() => {
      if (selectRef.current) {
        selectRef.current.focus();
      }
    }, 0);
  };
  
  // Генерация уникального ID
  const selectId = props.id || `select-${props.name || Math.random().toString(36).substr(2, 9)}`;
  
  // Определяем, показывать ли кнопку очистки
  const showClearButton = clearable && internalValue && !disabled;
  
  return (
    <SelectWrapper className={className} style={style}>
      {label && (
        <label 
          htmlFor={selectId} 
          className="select-label"
        >
          {label}
          {required && <span style={{ color: 'red' }}>*</span>}
        </label>
      )}
      
      {description && (
        <span className="select-description">{description}</span>
      )}
      
      {groupAddon ? (
        <SelectGroup>
          <div className="select-group-addon">{groupAddon}</div>
          <StyledSelect
            id={selectId}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            autoFocus={autoFocus}
            size={size}
            error={!!error}
            focused={focused}
            ref={selectRef}
            className="select-group-select"
            {...props}
          />
          {showClearButton && (
            <button 
              type="button" 
              className="select-clear"
              onClick={handleClear}
              aria-label="Очистить выбор"
            >
              ✕
            </button>
          )}
        </SelectGroup>
      ) : groupButton ? (
        <SelectGroup>
          <StyledSelect
            id={selectId}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            autoFocus={autoFocus}
            size={size}
            error={!!error}
            focused={focused}
            ref={selectRef}
            {...props}
          />
          <button 
            type="button" 
            className="select-group-button"
            onClick={groupButton.onClick}
            disabled={disabled}
          >
            {groupButton.children}
          </button>
        </SelectGroup>
      ) : (
        <>
          <StyledSelect
            id={selectId}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            autoFocus={autoFocus}
            size={size}
            grouped={grouped}
            error={!!error}
            focused={focused}
            ref={selectRef}
            {...props}
          >
            {placeholder && (
              <StyledOption value="" disabled>
                {placeholder}
              </StyledOption>
            )}
            
            {options.map((option) => {
              if (option.options) {
                // Группа опций
                return (
                  <optgroup key={option.label} label={option.label}>
                    {option.options.map((childOption) => (
                      <StyledOption
                        key={childOption.value}
                        value={childOption.value}
                        disabled={childOption.disabled}
                        group
                      >
                        {childOption.label}
                      </StyledOption>
                    ))}
                  </optgroup>
                );
              }
              
              // Обычная опция
              return (
                <StyledOption
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </StyledOption>
              );
            })}
          </StyledSelect>
          
          {showClearButton && (
            <button 
              type="button" 
              className="select-clear"
              onClick={handleClear}
              aria-label="Очистить выбор"
            >
              ✕
            </button>
          )}
        </>
      )}
      
      {error && <span className="select-error">{error}</span>}
    </SelectWrapper>
  );
}));

Select.propTypes = {
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
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.string.isRequired,
        disabled: PropTypes.bool
      }),
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        options: PropTypes.arrayOf(
          PropTypes.shape({
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            label: PropTypes.string.isRequired,
            disabled: PropTypes.bool
          })
        ).isRequired
      })
    ])
  ),
  grouped: PropTypes.bool,
  clearable: PropTypes.bool,
  groupAddon: PropTypes.node,
  groupButton: PropTypes.shape({
    onClick: PropTypes.func,
    children: PropTypes.node
  }),
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для группы Select
export const SelectGroupComponent = memo(({ children, className, style }) => {
  return (
    <SelectGroup className={className} style={style}>
      {children}
    </SelectGroup>
  );
});

SelectGroupComponent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для мультиселекта
export const MultiSelect = memo(forwardRef(({
  ...props
}, ref) => {
  return (
    <Select
      ref={ref}
      multiple
      {...props}
    />
  );
}));

MultiSelect.propTypes = {
  ...Select.propTypes,
  multiple: PropTypes.bool
};

// Компонент для поиска с автодополнением
export const SearchSelect = memo(forwardRef(({
  onSearch,
  options = [],
  loading = false,
  debounceTime = 300,
  ...props
}, ref) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);
  
  // Обработка поиска
  const handleSearch = (term) => {
    setSearchTerm(term);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      if (onSearch) {
        setIsSearching(true);
        onSearch(term)
          .then(results => {
            setFilteredOptions(results);
          })
          .finally(() => {
            setIsSearching(false);
          });
      } else {
        // Локальная фильтрация
        const filtered = options.filter(option =>
          option.label.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredOptions(filtered);
      }
    }, debounceTime);
  };
  
  // Сброс поиска при изменении опций
  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);
  
  return (
    <Select
      ref={ref}
      {...props}
      value={searchTerm}
      onChange={(e) => handleSearch(e.target.value)}
    >
      {isSearching ? (
        <option value="" disabled>Поиск...</option>
      ) : (
        <>
          {props.placeholder && (
            <option value="" disabled>
              {props.placeholder}
            </option>
          )}
          {filteredOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </>
      )}
    </Select>
  );
}));

SearchSelect.propTypes = {
  onSearch: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired
    })
  ),
  loading: PropTypes.bool,
  debounceTime: PropTypes.number,
  ...Select.propTypes
};

// Хук для управления состоянием select
export const useSelect = (initialValue = '', options = [], validate) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  
  const handleChange = (e) => {
    setValue(e.target.value);
    
    // Валидация при изменении
    if (validate) {
      const validationError = validate(e.target.value);
      setError(validationError);
    }
  };
  
  const handleBlur = () => {
    setTouched(true);
    
    // Валидация при потере фокуса
    if (validate) {
      const validationError = validate(value);
      setError(validationError);
    }
  };
  
  const reset = () => {
    setValue(initialValue);
    setError('');
    setTouched(false);
  };
  
  const isValid = !error && (options.some(opt => opt.value === value) || value === '');
  
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
    selectProps: {
      value,
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched ? error : undefined
    }
  };
};

export default Select;