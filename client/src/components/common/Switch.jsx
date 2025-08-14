import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Контейнер для переключателя
const SwitchContainer = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  user-select: none;
  
  &:hover ${SwitchInput} ~ ${SwitchTrack} {
    background-color: ${props => props.theme.colors.border.medium};
  }
  
  &:hover ${SwitchInput}:checked ~ ${SwitchTrack} {
    background-color: ${props => props.theme.colors.primary};
  }
`;

// Скрытый инпут
const SwitchInput = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  
  &:focus + ${SwitchTrack} {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
  
  &:disabled ~ ${SwitchTrack} {
    opacity: ${props => props.theme.opacity[50]};
    cursor: not-allowed;
  }
  
  &:checked ~ ${SwitchTrack} {
    background-color: ${props => props.theme.colors.primary};
  }
`;

// Трек переключателя
const SwitchTrack = styled.span`
  position: relative;
  width: ${props => props.theme.spacing[10]};
  height: ${props => props.theme.spacing[5]};
  background-color: ${props => props.theme.colors.border.medium};
  border-radius: ${props => props.theme.spacing[5]};
  transition: ${props => props.theme.transitions.normal};
  
  ${SwitchInput}:checked ~ & {
    background-color: ${props => props.theme.colors.primary};
  }
`;

// Кнопка переключателя
const SwitchThumb = styled.span`
  position: absolute;
  top: ${props => props.theme.spacing[0.5]};
  left: ${props => props.theme.spacing[0.5]};
  width: ${props => props.theme.spacing[4]};
  height: ${props => props.theme.spacing[4]};
  background-color: white;
  border-radius: 50%;
  transition: ${props => props.theme.transitions.normal};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  ${SwitchInput}:checked ~ ${SwitchTrack} & {
    transform: translateX(${props => props.theme.spacing[5]});
  }
`;

// Текст переключателя
const SwitchLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSize.base[0]};
  line-height: ${props => props.theme.typography.lineHeight.normal};
  color: ${props => props.disabled ? props.theme.colors.text.disabled : props.theme.colors.text.primary};
  
  ${props => props.disabled && `
    cursor: not-allowed;
    opacity: ${props.theme.opacity[50]};
  `}
`;

// Описание переключателя
const SwitchDescription = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm[0]};
  color: ${props => props.theme.colors.text.tertiary};
  margin-top: ${props => props.theme.spacing[1]};
  display: block;
`;

// Компонент Switch
const Switch = ({
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
    <SwitchContainer className={className} disabled={disabled}>
      <SwitchInput
        id={id}
        checked={checked}
        disabled={disabled}
        required={required}
        onChange={onChange}
        name={name}
        value={value}
        {...props}
      />
      <SwitchTrack>
        <SwitchThumb />
      </SwitchTrack>
      <div>
        <SwitchLabel disabled={disabled}>
          {label}
          {required && <span style={{ color: 'red' }}> *</span>}
        </SwitchLabel>
        {description && (
          <SwitchDescription>
            {description}
          </SwitchDescription>
        )}
      </div>
    </SwitchContainer>
  );
};

// Пропс-types для TypeScript
Switch.propTypes = {
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

// Экспорт компонента
export default Switch;