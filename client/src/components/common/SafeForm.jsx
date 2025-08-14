import React, { useState, useEffect, useRef } from 'react';
import { validateInput, sanitizeInput } from '../../utils/sanitizeInput';

/**
 * Компонент для безопасной формы с защитой от CSRF и XSS
 */
const SafeForm = ({ 
  onSubmit, 
  children, 
  className,
  method = 'POST',
  action,
  enableCSRF = true,
  enableXSSProtection = true,
  ...props 
}) => {
  const [csrfToken, setCsrfToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);

  // Получение CSRF токена из cookie
  useEffect(() => {
    if (enableCSRF) {
      const token = getCookie('csrf_token');
      if (token) {
        setCsrfToken(token);
      } else {
        // Генерация CSRF токена если отсутствует
        generateCsrfToken();
      }
    }
  }, [enableCSRF]);

  // Функция для получения cookie
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  // Функция для генерации CSRF токена
  const generateCsrfToken = () => {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    document.cookie = `csrf_token=${token}; path=/; secure; HttpOnly; SameSite=Strict`;
    setCsrfToken(token);
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Собираем данные формы
      const formData = new FormData(formRef.current);
      const formDataObj = {};
      
      // Обрабатываем каждое поле формы
      for (let [key, value] of formData.entries()) {
        if (enableXSSProtection) {
          // Валидация и очистка ввода
          const validationResult = validateInput(key, value);
          if (!validationResult.isValid) {
            throw new Error(validationResult.error || `Invalid input for field: ${key}`);
          }
          
          // Очистка данных
          formDataObj[key] = sanitizeInput(value);
        } else {
          formDataObj[key] = value;
        }
      }
      
      // Добавляем CSRF токен если включен
      if (enableCSRF && csrfToken) {
        formDataObj.csrf_token = csrfToken;
      }
      
      // Вызываем колбэк отправки
      await onSubmit(formDataObj, e);
      
    } catch (error) {
      console.error('Form submission error:', error);
      // Здесь можно добавить обработку ошибок
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Рендерим скрытое поле с CSRF токеном
  const renderCsrfField = () => {
    if (!enableCSRF || !csrfToken) return null;
    
    return (
      <input
        type="hidden"
        name="csrf_token"
        value={csrfToken}
      />
    );
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      method={method}
      action={action}
      className={className}
      noValidate
      {...props}
    >
      {renderCsrfField()}
      {children}
      {isSubmitting && (
        <div className="submitting-indicator">
          {/* Индикатор загрузки */}
          <div>Отправка...</div>
        </div>
      )}
    </form>
  );
};

/**
 * Безопасный компонент ввода
 */
const SafeInput = ({ 
  type = 'text', 
  name, 
  value, 
  onChange,
  className,
  validate = true,
  required = false,
  pattern,
  minLength,
  maxLength,
  ...props 
}) => {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  // Валидация при изменении
  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    if (validate) {
      const validationResult = validateInput(name, inputValue);
      if (!validationResult.isValid) {
        setError(validationResult.error || 'Invalid input');
      } else {
        setError('');
      }
    }
    
    setTouched(true);
    
    if (onChange) {
      onChange(e);
    }
  };

  // Валидация при потере фокуса
  const handleBlur = (e) => {
    setTouched(true);
    
    if (validate) {
      const inputValue = e.target.value;
      const validationResult = validateInput(name, inputValue);
      
      if (!validationResult.isValid) {
        setError(validationResult.error || 'Invalid input');
      } else {
        setError('');
      }
    }
  };

  const hasError = touched && error;
  const inputClasses = `${className || ''} ${hasError ? 'error' : ''}`.trim();

  return (
    <div className="form-group">
      <label htmlFor={name}>{props.label || name}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={inputClasses}
        required={required}
        pattern={pattern}
        minLength={minLength}
        maxLength={maxLength}
        {...props}
      />
      {hasError && <div className="error-message">{error}</div>}
    </div>
  );
};

/**
 * Безопасный компонент текстовой области
 */
const SafeTextarea = ({ 
  name, 
  value, 
  onChange,
  className,
  validate = true,
  required = false,
  minLength,
  maxLength,
  rows = 4,
  ...props 
}) => {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    if (validate) {
      const validationResult = validateInput(name, inputValue);
      if (!validationResult.isValid) {
        setError(validationResult.error || 'Invalid input');
      } else {
        setError('');
      }
    }
    
    setTouched(true);
    
    if (onChange) {
      onChange(e);
    }
  };

  const handleBlur = (e) => {
    setTouched(true);
    
    if (validate) {
      const inputValue = e.target.value;
      const validationResult = validateInput(name, inputValue);
      
      if (!validationResult.isValid) {
        setError(validationResult.error || 'Invalid input');
      } else {
        setError('');
      }
    }
  };

  const hasError = touched && error;
  const textareaClasses = `${className || ''} ${hasError ? 'error' : ''}`.trim();

  return (
    <div className="form-group">
      <label htmlFor={name}>{props.label || name}</label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={textareaClasses}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        rows={rows}
        {...props}
      />
      {hasError && <div className="error-message">{error}</div>}
    </div>
  );
};

/**
 * HOC для защиты форм
 */
export const withFormProtection = (WrappedComponent) => {
  return function ProtectedFormComponent(props) {
    const { onSubmit, ...restProps } = props;
    
    const protectedOnSubmit = async (formData, event) => {
      // Здесь можно добавить дополнительную логику защиты
      if (onSubmit) {
        return onSubmit(formData, event);
      }
    };

    return <WrappedComponent onSubmit={protectedOnSubmit} {...restProps} />;
  };
};

export { SafeForm, SafeInput, SafeTextarea };