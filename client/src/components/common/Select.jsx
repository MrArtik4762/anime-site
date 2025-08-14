import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Основной select
const BaseSelect = styled.select`
  width: 100%;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  font-size: ${props => props.theme.typography.fontSize.base[0]};
  font-weight: ${props => props.theme.typography.fontWeight.normal};
  line-height: ${props => props.theme.typography.lineHeight.normal};
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.surface.primary};
  border: ${props => props.theme.form.input.border} solid ${props => props.theme.colors.border.medium};
  border-radius: ${props => props.theme.borderRadius.lg};
  transition: ${props => props.theme.transitions.normal};
  outline: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${props => props.theme.colors.text.tertiary}' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right ${props => props.theme.spacing[3]} center;
  background-size: ${props => props.theme.spacing[4]};
  padding-right: ${props => props.theme.spacing[10]};
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &:disabled {
    opacity: ${props => props.theme.opacity[50]};
    cursor: not-allowed;
  }
  
  &:read-only {
    background: ${props => props.theme.colors.surface.tertiary};
    cursor: default;
  }
  
  /* Placeholder */
  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
  
  /* Опции */
  option {
    background: ${props => props.theme.colors.surface.primary};
    color: ${props => props.theme.colors.text.primary};
    padding: ${props => props.theme.spacing[2]};
    
    &:disabled {
      opacity: ${props => props.theme.opacity[50]};
      cursor: not-allowed;
    }
  }
  
  /* Для мобильных устройств */
  ${props => props.theme.media.coarse} {
    font-size: ${props => props.theme.typography.fontSize.lg[0]};
    padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[5]};
    padding-right: ${props => props.theme.spacing[12]};
  }
`;

// Select с иконкой слева
const SelectWithLeftIcon = styled(BaseSelect)`
  padding-left: ${props => props.theme.spacing[8]};
  
  & + .select-icon-left {
    position: absolute;
    left: ${props => props.theme.spacing[4]};
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.colors.text.tertiary};
    pointer-events: none;
    z-index: 1;
  }
`;

// Select с иконкой справа
const SelectWithRightIcon = styled(BaseSelect)`
  padding-right: ${props => props.theme.spacing[12]};
  
  & + .select-icon-right {
    position: absolute;
    right: ${props => props.theme.spacing[4]};
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.colors.text.tertiary};
    cursor: pointer;
    z-index: 1;
    
    &:hover {
      color: ${props => props.theme.colors.text.primary};
    }
  }
`;

// Select с обеими иконками
const SelectWithIcons = styled(BaseSelect)`
  padding-left: ${props => props.theme.spacing[8]};
  padding-right: ${props => props.theme.spacing[12]};
  
  & + .select-icon-left {
    position: absolute;
    left: ${props => props.theme.spacing[4]};
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.colors.text.tertiary};
    pointer-events: none;
    z-index: 1;
  }
  
  & + .select-icon-right {
    position: absolute;
    right: ${props => props.theme.spacing[4]};
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.colors.text.tertiary};
    cursor: pointer;
    z-index: 1;
    
    &:hover {
      color: ${props => props.theme.colors.text.primary};
    }
  }
`;

// Контейнер для select с иконками
const SelectContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

// Состояния select
const ValidSelect = styled(BaseSelect)`
  &:focus {
    border-color: ${props => props.theme.colors.success};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.success}20;
  }
`;

const InvalidSelect = styled(BaseSelect)`
  &:focus {
    border-color: ${props => props.theme.colors.error};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.error}20;
  }
`;

// Select с меткой
const LabeledSelect = styled.div`
  margin-bottom: ${props => props.theme.spacing[4]};
  
  label {
    display: block;
    font-size: ${props => props.theme.typography.fontSize.sm[0]};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    color: ${props => props.theme.colors.text.primary};
    margin-bottom: ${props => props.theme.spacing[2]};
    
    .required {
      color: ${props => props.theme.colors.error};
    }
  }
  
  .select-description {
    font-size: ${props => props.theme.typography.fontSize.xs[0]};
    color: ${props => props.theme.colors.text.tertiary};
    margin-top: ${props => props.theme.spacing[1]};
  }
  
  .select-error {
    font-size: ${props => props.theme.typography.fontSize.xs[0]};
    color: ${props => props.theme.colors.error};
    margin-top: ${props => props.theme.spacing[1]};
  }
`;

// Компонент Select
const Select = ({
  label,
  required = false,
  error,
  description,
  leftIcon,
  rightIcon,
  valid = false,
  invalid = false,
  className = '',
  ...props
}) => {
  // Определяем стили в зависимости от пропсов
  const getSelectStyle = () => {
    if (valid) return ValidSelect;
    if (invalid) return InvalidSelect;
    return BaseSelect;
  };
  
  // Определяем стили в зависимости от иконок
  const getIconStyle = () => {
    if (leftIcon && rightIcon) return SelectWithIcons;
    if (leftIcon) return SelectWithLeftIcon;
    if (rightIcon) return SelectWithRightIcon;
    return BaseSelect;
  };
  
  const SelectStyle = getSelectStyle();
  const IconStyle = getIconStyle();
  const CombinedSelect = IconStyle.withComponent(SelectStyle);
  
  return (
    <LabeledSelect className={className}>
      {label && (
        <label htmlFor={props.id}>
          {label}
          {required && <span className="required"> *</span>}
        </label>
      )}
      
      <SelectContainer>
        <CombinedSelect
          id={props.id}
          {...props}
        />
        
        {leftIcon && (
          <span className="select-icon-left">
            {leftIcon}
          </span>
        )}
        
        {rightIcon && (
          <span className="select-icon-right">
            {rightIcon}
          </span>
        )}
      </SelectContainer>
      
      {description && !error && (
        <div className="select-description">
          {description}
        </div>
      )}
      
      {error && (
        <div className="select-error">
          {error}
        </div>
      )}
    </LabeledSelect>
  );
};

// Пропс-types для TypeScript
Select.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  description: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  valid: PropTypes.bool,
  invalid: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};

// Экспорт всех типов select
export const SelectVariants = {
  Base: BaseSelect,
  WithLeftIcon: SelectWithLeftIcon,
  WithRightIcon: SelectWithRightIcon,
  WithIcons: SelectWithIcons,
  Valid: ValidSelect,
  Invalid: InvalidSelect,
};

// Экспорт контейнера
export const SelectContainerComponent = SelectContainer;

// Экспорт основного компонента
export default Select;