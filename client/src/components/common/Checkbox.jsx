import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Контейнер для чекбокса
const CheckboxContainer = styled.label`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[3]};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  user-select: none;
  margin-bottom: ${props => props.theme.spacing[2]};
  
  &:hover ${CheckboxInput} ~ ${CheckboxCheckmark} {
    border-color: ${props => props.theme.colors.primary};
  }
  
  &:hover ${CheckboxInput}:checked ~ ${CheckboxCheckmark} {
    border-color: ${props => props.theme.colors.primary};
    background-color: ${props => props.theme.colors.primary};
  }
`;

// Скрытый инпут
const CheckboxInput = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  
  &:focus + ${CheckboxCheckmark} {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
  
  &:disabled ~ ${CheckboxCheckmark} {
    opacity: ${props => props.theme.opacity[50]};
    cursor: not-allowed;
  }
  
  &:checked ~ ${CheckboxCheckmark} {
    border-color: ${props => props.theme.colors.primary};
    background-color: ${props => props.theme.colors.primary};
  }
  
  &:indeterminate ~ ${CheckboxCheckmark} {
    background-color: ${props => props.theme.colors.primary};
    border-color: ${props => props.theme.colors.primary};
  }
`;

// Галочка для чекбокса
const CheckboxCheckmark = styled.span`
  position: relative;
  flex-shrink: 0;
  width: ${props => props.theme.spacing[5]};
  height: ${props => props.theme.spacing[5]};
  border: 2px solid ${props => props.theme.colors.border.medium};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.surface.primary};
  transition: ${props => props.theme.transitions.normal};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::after {
    content: '';
    position: absolute;
    display: none;
    left: ${props => props.theme.spacing[1]};
    top: ${props => props.theme.spacing[0]};
    width: ${props => props.theme.spacing[2]};
    height: ${props => props.theme.spacing[2]};
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  
  ${CheckboxInput}:checked ~ & {
    &::after {
      display: block;
    }
  }
  
  ${CheckboxInput}:indeterminate ~ & {
    &::after {
      display: block;
      border: none;
      width: ${props => props.theme.spacing[2]};
      height: ${props => props.theme.spacing[2]};
      background-color: white;
      border-radius: ${props => props.theme.borderRadius.sm};
    }
  }
`;

// Текст чекбокса
const CheckboxLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSize.base[0]};
  line-height: ${props => props.theme.typography.lineHeight.normal};
  color: ${props => props.disabled ? props.theme.colors.text.disabled : props.theme.colors.text.primary};
  padding-top: ${props => props.theme.spacing[1]};
  
  ${props => props.disabled && `
    cursor: not-allowed;
    opacity: ${props.theme.opacity[50]};
  `}
`;

// Описание чекбокса
const CheckboxDescription = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm[0]};
  color: ${props => props.theme.colors.text.tertiary};
  margin-top: ${props => props.theme.spacing[1]};
  display: block;
`;

// Группа чекбоксов
const CheckboxGroup = styled.div`
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

// Компонент Checkbox
const Checkbox = ({
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
  indeterminate = false,
  ...props
}) => {
  return (
    <CheckboxContainer className={className} disabled={disabled}>
      <CheckboxInput
        id={id}
        checked={checked}
        disabled={disabled}
        required={required}
        onChange={onChange}
        name={name}
        value={value}
        ref={input => {
          if (input) input.indeterminate = indeterminate;
        }}
        {...props}
      />
      <CheckboxCheckmark />
      <div>
        <CheckboxLabel disabled={disabled}>
          {label}
          {required && <span style={{ color: 'red' }}> *</span>}
        </CheckboxLabel>
        {description && (
          <CheckboxDescription>
            {description}
          </CheckboxDescription>
        )}
      </div>
    </CheckboxContainer>
  );
};

// Компонент CheckboxGroup
const CheckboxGroupComponent = ({
  legend,
  children,
  error,
  className = '',
  ...props
}) => {
  return (
    <CheckboxGroup className={className} {...props}>
      <fieldset>
        <legend>{legend}</legend>
        {children}
      </fieldset>
      {error && (
        <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '0.25rem' }}>
          {error}
        </div>
      )}
    </CheckboxGroup>
  );
};

// Пропс-types для TypeScript
Checkbox.propTypes = {
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
  indeterminate: PropTypes.bool,
};

CheckboxGroupComponent.propTypes = {
  legend: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  error: PropTypes.string,
  className: PropTypes.string,
};

// Экспорт компонентов
export { Checkbox, CheckboxGroup as CheckboxGroupComponent };