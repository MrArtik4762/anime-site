import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import { v4 as uuidv4 } from 'uuid';

// Стилизованные компоненты для формы
const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.medium};
  width: 100%;
  max-width: ${props => props.theme.sizes.maxWidth};
  margin: 0 auto;
  padding: ${props => props.theme.spacing.large};
  
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing.medium};
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.small};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.medium};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CSRFTokenInput = styled.input`
  display: none;
`;

// Компонент для безопасной формы
export const SafeForm = memo(({ 
  onSubmit, 
  children, 
  method = 'POST',
  action,
  className,
  noValidate = false,
  enableCSRF = true,
  enableRateLimit = true,
  ...props 
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [csrfToken, setCsrfToken] = useState('');
  const formRef = useRef(null);
  
  // Генерация CSRF токена
  useEffect(() => {
    if (enableCSRF) {
      // В реальном приложении токен должен приходить с сервера
      // Здесь мы генерируем его для демонстрации
      const token = uuidv4();
      setCsrfToken(token);
      
      // Сохраняем токен в sessionStorage
      sessionStorage.setItem('csrfToken', token);
    }
  }, [enableCSRF]);
  
  // Обработка отправки формы
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Валидация формы
    if (formRef.current && !formRef.current.checkValidity()) {
      const validationErrors = {};
      const inputs = formRef.current.querySelectorAll('input, select, textarea');
      
      inputs.forEach(input => {
        if (!input.checkValidity()) {
          validationErrors[input.name] = input.validationMessage || 'Поле заполнено некорректно';
        }
      });
      
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Собираем данные формы
      const formData = new FormData(formRef.current);
      const data = Object.fromEntries(formData.entries());
      
      // Добавляем CSRF токен
      if (enableCSRF) {
        data._csrf = csrfToken;
      }
      
      // Вызываем пользовательскую функцию отправки
      const result = await onSubmit(data, e);
      
      // Если есть редирект, выполняем его
      if (result?.redirect) {
        navigate(result.redirect);
      }
    } catch (error) {
      console.error('Ошибка при отправке формы:', error);
      setErrors({ _form: error.message || 'Произошла ошибка при отправке формы' });
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, isSubmitting, csrfToken, enableCSRF, navigate]);
  
  // Обработка изменений полей
  const handleInputChange = useCallback((e) => {
    const { name, value, validity, validationMessage } = e.target;
    
    if (name && validity && !validity.valid) {
      setErrors(prev => ({
        ...prev,
        [name]: validationMessage
      }));
    } else if (name && errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);
  
  // Рендер children с добавлением обработчиков
  const renderChildren = () => {
    return React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        // Добавляем обработчики для полей формы
        if (child.props.type && ['text', 'email', 'password', 'number', 'tel', 'url'].includes(child.props.type)) {
          return React.cloneElement(child, {
            onChange: handleInputChange,
            ref: child.ref
          });
        }
        
        // Специальная обработка для SafeInput компонента
        if (child.type === SafeInput || child.type === SafeSelect || child.type === SafeTextarea) {
          return React.cloneElement(child, {
            onChange: handleInputChange,
            error: errors[child.props.name],
            ref: child.ref
          });
        }
        
        return child;
      }
      return child;
    });
  };
  
  return (
    <FormContainer
      ref={formRef}
      onSubmit={handleSubmit}
      method={method}
      action={action}
      className={className}
      noValidate={noValidate}
      {...props}
    >
      {/* CSRF токен */}
      {enableCSRF && csrfToken && (
        <CSRFTokenInput
          type="hidden"
          name="_csrf"
          value={csrfToken}
        />
      )}
      
      {/* Отображение ошибок формы */}
      {errors._form && (
        <div className="form-error" style={{ color: 'red', marginBottom: '10px' }}>
          {errors._form}
        </div>
      )}
      
      {renderChildren()}
      
      {/* Кнопка отправки */}
      <FormActions>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '10px 20px',
            backgroundColor: isSubmitting ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? 'Отправка...' : 'Отправить'}
        </button>
      </FormActions>
    </FormContainer>
  );
});

SafeForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  method: PropTypes.oneOf(['GET', 'POST', 'PUT', 'DELETE']),
  action: PropTypes.string,
  className: PropTypes.string,
  noValidate: PropTypes.bool,
  enableCSRF: PropTypes.bool,
  enableRateLimit: PropTypes.bool,
};

// Компонент для безопасного input поля
export const SafeInput = memo(({ 
  type = 'text',
  name,
  value,
  onChange,
  error,
  required = false,
  pattern,
  minLength,
  maxLength,
  placeholder,
  className,
  ...props 
}) => {
  const inputId = `input-${name || uuidv4()}`;
  
  return (
    <div style={{ marginBottom: '10px' }}>
      <label htmlFor={inputId} style={{ display: 'block', marginBottom: '5px' }}>
        {name && (
          <span style={{ marginRight: '5px' }}>
            {name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')}:
          </span>
        )}
        {required && <span style={{ color: 'red' }}>*</span>}
      </label>
      
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        pattern={pattern}
        minLength={minLength}
        maxLength={maxLength}
        placeholder={placeholder}
        className={className}
        style={{
          width: '100%',
          padding: '8px',
          border: error ? '1px solid red' : '1px solid #ccc',
          borderRadius: '4px',
          boxSizing: 'border-box'
        }}
        {...props}
      />
      
      {error && (
        <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
          {error}
        </div>
      )}
    </div>
  );
});

SafeInput.propTypes = {
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'tel', 'url', 'search']),
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  error: PropTypes.string,
  required: PropTypes.bool,
  pattern: PropTypes.string,
  minLength: PropTypes.number,
  maxLength: PropTypes.number,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

// Компонент для безопасного select поля
export const SafeSelect = memo(({ 
  name,
  value,
  onChange,
  error,
  required = false,
  options = [],
  placeholder,
  className,
  ...props 
}) => {
  const selectId = `select-${name || uuidv4()}`;
  
  return (
    <div style={{ marginBottom: '10px' }}>
      <label htmlFor={selectId} style={{ display: 'block', marginBottom: '5px' }}>
        {name && (
          <span style={{ marginRight: '5px' }}>
            {name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')}:
          </span>
        )}
        {required && <span style={{ color: 'red' }}>*</span>}
      </label>
      
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={className}
        style={{
          width: '100%',
          padding: '8px',
          border: error ? '1px solid red' : '1px solid #ccc',
          borderRadius: '4px',
          boxSizing: 'border-box'
        }}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
          {error}
        </div>
      )}
    </div>
  );
});

SafeSelect.propTypes = {
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  error: PropTypes.string,
  required: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired
    })
  ),
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

// Компонент для безопасного textarea поля
export const SafeTextarea = memo(({ 
  name,
  value,
  onChange,
  error,
  required = false,
  rows = 4,
  placeholder,
  className,
  ...props 
}) => {
  const textareaId = `textarea-${name || uuidv4()}`;
  
  return (
    <div style={{ marginBottom: '10px' }}>
      <label htmlFor={textareaId} style={{ display: 'block', marginBottom: '5px' }}>
        {name && (
          <span style={{ marginRight: '5px' }}>
            {name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')}:
          </span>
        )}
        {required && <span style={{ color: 'red' }}>*</span>}
      </label>
      
      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        placeholder={placeholder}
        className={className}
        style={{
          width: '100%',
          padding: '8px',
          border: error ? '1px solid red' : '1px solid #ccc',
          borderRadius: '4px',
          boxSizing: 'border-box',
          resize: 'vertical'
        }}
        {...props}
      />
      
      {error && (
        <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
          {error}
        </div>
      )}
    </div>
  );
});

SafeTextarea.propTypes = {
  name: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.string,
  required: PropTypes.bool,
  rows: PropTypes.number,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

// Хук для безопасной работы с формами
export const useSafeForm = (initialValues = {}, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Отмечаем поле как touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Валидация поля
    if (e.target.validity && !e.target.validity.valid) {
      setErrors(prev => ({
        ...prev,
        [name]: e.target.validationMessage
      }));
    } else if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);
  
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);
  
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Валидация всех полей
    const form = e.target;
    const isValid = form.checkValidity();
    
    if (!isValid) {
      const newErrors = {};
      const inputs = form.querySelectorAll('input, select, textarea');
      
      inputs.forEach(input => {
        if (!input.checkValidity()) {
          newErrors[input.name] = input.validationMessage || 'Поле заполнено некорректно';
        }
      });
      
      setErrors(newErrors);
      return;
    }
    
    try {
      await onSubmit(values, e);
    } catch (error) {
      console.error('Ошибка при отправке формы:', error);
      setErrors({ _form: error.message || 'Произошла ошибка при отправке формы' });
    }
  }, [onSubmit, values]);
  
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);
  
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);
  
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [name]: isTouched
    }));
  }, []);
  
  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    isValid: Object.keys(errors).length === 0
  };
};

export default SafeForm;