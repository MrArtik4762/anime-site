import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Контейнер для радиокнопки
const RadioContainer = styled.label`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[3]};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  user-select: none;
  margin-bottom: ${props => props.theme.spacing[2]};
  
  &:hover ${RadioInput} ~ ${RadioCheckmark} {
    border-color: ${props => props.theme.colors.primary};
  }
  
  &:hover ${RadioInput}:checked ~ ${RadioCheckmark} {
    border-color: ${props => props.theme.colors.primary};
  }
`;

// Скрытый инпут
const RadioInput = styled.input.attrs({ type: 'radio' })`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  
  &:focus + ${RadioCheckmark} {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
  
  &:disabled ~ ${RadioCheckmark} {
    opacity: ${props => props.theme.opacity[50]};
    cursor: not-allowed;
  }
  
  &:checked ~ ${RadioCheckmark} {
    border-color: ${props => props.theme.colors.primary};
  }
`;

// Галочка для радиокнопки
const RadioCheckmark = styled.span`
  position: relative;
  flex-shrink: 0;
  width: ${props => props.theme.spacing[5]};
  height: ${props => props.theme.spacing[5]};
  border: 2px solid ${props => props.theme.colors.border.medium};
  border-radius: 50%;
  background-color: ${props => props.theme.colors.surface.primary};
  transition: ${props => props.theme.transitions.normal};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::after {
    content: '';
    position: absolute;
    display: none;
    width: ${props => props.theme.spacing[2]};
    height: ${props => props.theme.spacing[2]};
    border-radius: 50%;
    background-color: white;
  }
  
  ${RadioInput}:checked ~ & {
    &::after {
      display: block;
    }
  }
`;

// Текст радиокнопки
const RadioLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSize.base[0]};
  line-height: ${props => props.theme.typography.lineHeight.normal};
  color: ${props => props.disabled ? props.theme.colors.text.disabled : props.theme.colors.text.primary};
  padding-top: ${props => props.theme.spacing[1]};
  
  ${props => props.disabled && `
    cursor: not-allowed;
    opacity: ${props.theme.opacity[50]};
  `}
`;

// Описание радиокнопки
const RadioDescription = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm[0]};
  color: ${props => props.theme.colors.text.tertiary};
  margin-top: ${props => props.theme.spacing[1]};
  display: block;
`;

// Группа радиокнопок
const RadioGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing[4]};
  
  legend {
    font-size: ${props => props.theme.typography.fontSize.lg[0]};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    color: ${props => props.theme.colors.text.primary};
    margin-bottom: ${props => props.theme.spacing[3]};
    padding: 0 ${props => props.theme.spacing[2]};
  }
  
  fieldset {
    border: none;
    padding: 0;
    margin: 0;
  }
`;

// Компонент Radio
const Radio = ({
  id,
  label,
  description,
  checked,
  disabled = false,
  required = false,
  error,
  className = '',
  onChange,
  name,
  value,
  ...props
}) => {
  return (
    <RadioContainer className={className} disabled={disabled}>
      <RadioInput
        id={id}
        checked={checked}
        disabled={disabled}
        required={required}
        onChange={onChange}
        name={name}
        value={value}
        {...props}
      />
      <RadioCheckmark />
      <div>
        <RadioLabel disabled={disabled}>
          {label}
          {required && <span style={{ color: 'red' }}> *</span>}
        </RadioLabel>
        {description && (
          <RadioDescription>
            {description}
          </RadioDescription>
        )}
      </div>
    </RadioContainer>
  );
};

// Компонент RadioGroup
const RadioGroupComponent = ({
  legend,
  children,
  error,
  className = '',
  ...props
}) => {
  return (
    <RadioGroup className={className} {...props}>
      <fieldset>
        <legend>{legend}</legend>
        {children}
      </fieldset>
      {error && (
        <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '0.25rem' }}>
          {error}
        </div>
      )}
    </RadioGroup>
  );
};

// Пропс-types для TypeScript
Radio.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  onChange: PropTypes.func,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

RadioGroupComponent.propTypes = {
  legend: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  error: PropTypes.string,
  className: PropTypes.string,
};

// Экспорт компонентов
export { Radio, RadioGroup as RadioGroupComponent };