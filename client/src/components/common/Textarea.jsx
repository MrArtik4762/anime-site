import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Основной textarea
const BaseTextarea = styled.textarea`
  width: 100%;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  font-size: ${props => props.theme.typography.fontSize.base[0]};
  font-weight: ${props => props.theme.typography.fontWeight.normal};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.surface.primary};
  border: ${props => props.theme.form.input.border} solid ${props => props.theme.colors.border.medium};
  border-radius: ${props => props.theme.borderRadius.lg};
  transition: ${props => props.theme.transitions.normal};
  outline: none;
  resize: ${props => props.resize || 'vertical'};
  min-height: ${props => props.minHeight || '120px'};
  
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
  
  /* Для мобильных устройств */
  ${props => props.theme.media.coarse} {
    font-size: ${props => props.theme.typography.fontSize.lg[0]};
    padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[5]};
  }
`;

// Textarea с иконкой слева
const TextareaWithLeftIcon = styled(BaseTextarea)`
  padding-left: ${props => props.theme.spacing[8]};
  
  & + .textarea-icon-left {
    position: absolute;
    left: ${props => props.theme.spacing[4]};
    top: ${props => props.theme.spacing[4]};
    color: ${props => props.theme.colors.text.tertiary};
    pointer-events: none;
    z-index: 1;
  }
`;

// Textarea с иконкой справа
const TextareaWithRightIcon = styled(BaseTextarea)`
  padding-right: ${props => props.theme.spacing[8]};
  
  & + .textarea-icon-right {
    position: absolute;
    right: ${props => props.theme.spacing[4]};
    top: ${props => props.theme.spacing[4]};
    color: ${props => props.theme.colors.text.tertiary};
    cursor: pointer;
    z-index: 1;
    
    &:hover {
      color: ${props => props.theme.colors.text.primary};
    }
  }
`;

// Textarea с обеими иконками
const TextareaWithIcons = styled(BaseTextarea)`
  padding-left: ${props => props.theme.spacing[8]};
  padding-right: ${props => props.theme.spacing[8]};
  
  & + .textarea-icon-left {
    position: absolute;
    left: ${props => props.theme.spacing[4]};
    top: ${props => props.theme.spacing[4]};
    color: ${props => props.theme.colors.text.tertiary};
    pointer-events: none;
    z-index: 1;
  }
  
  & + .textarea-icon-right {
    position: absolute;
    right: ${props => props.theme.spacing[4]};
    top: ${props => props.theme.spacing[4]};
    color: ${props => props.theme.colors.text.tertiary};
    cursor: pointer;
    z-index: 1;
    
    &:hover {
      color: ${props => props.theme.colors.text.primary};
    }
  }
`;

// Контейнер для textarea с иконками
const TextareaContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

// Состояния textarea
const ValidTextarea = styled(BaseTextarea)`
  &:focus {
    border-color: ${props => props.theme.colors.success};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.success}20;
  }
`;

const InvalidTextarea = styled(BaseTextarea)`
  &:focus {
    border-color: ${props => props.theme.colors.error};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.error}20;
  }
`;

// Поле textarea с меткой
const LabeledTextarea = styled.div`
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
  
  .textarea-description {
    font-size: ${props => props.theme.typography.fontSize.xs[0]};
    color: ${props => props.theme.colors.text.tertiary};
    margin-top: ${props => props.theme.spacing[1]};
  }
  
  .textarea-error {
    font-size: ${props => props.theme.typography.fontSize.xs[0]};
    color: ${props => props.theme.colors.error};
    margin-top: ${props => props.theme.spacing[1]};
  }
  
  .char-counter {
    font-size: ${props => props.theme.typography.fontSize.xs[0]};
    color: ${props => props.theme.colors.text.tertiary};
    text-align: right;
    margin-top: ${props => props.theme.spacing[1]};
  }
`;

// Компонент Textarea
const Textarea = ({
  label,
  required = false,
  error,
  description,
  leftIcon,
  rightIcon,
  valid = false,
  invalid = false,
  maxLength,
  showCharCounter = false,
  className = '',
  ...props
}) => {
  // Определяем стили в зависимости от пропсов
  const getTextareaStyle = () => {
    if (valid) return ValidTextarea;
    if (invalid) return InvalidTextarea;
    return BaseTextarea;
  };
  
  // Определяем стили в зависимости от иконок
  const getIconStyle = () => {
    if (leftIcon && rightIcon) return TextareaWithIcons;
    if (leftIcon) return TextareaWithLeftIcon;
    if (rightIcon) return TextareaWithRightIcon;
    return BaseTextarea;
  };
  
  const TextareaStyle = getTextareaStyle();
  const IconStyle = getIconStyle();
  const CombinedTextarea = IconStyle.withComponent(TextareaStyle);
  
  // Подсчет символов
  const charCount = props.value ? props.value.length : 0;
  const isNearLimit = maxLength && charCount > maxLength * 0.8;
  
  return (
    <LabeledTextarea className={className}>
      {label && (
        <label htmlFor={props.id}>
          {label}
          {required && <span className="required"> *</span>}
        </label>
      )}
      
      <TextareaContainer>
        <CombinedTextarea
          id={props.id}
          {...props}
        />
        
        {leftIcon && (
          <span className="textarea-icon-left">
            {leftIcon}
          </span>
        )}
        
        {rightIcon && (
          <span className="textarea-icon-right">
            {rightIcon}
          </span>
        )}
      </TextareaContainer>
      
      {description && !error && (
        <div className="textarea-description">
          {description}
        </div>
      )}
      
      {error && (
        <div className="textarea-error">
          {error}
        </div>
      )}
      
      {maxLength && showCharCounter && (
        <div className={`char-counter ${isNearLimit ? 'warning' : ''}`}>
          {charCount} / {maxLength} символов
        </div>
      )}
    </LabeledTextarea>
  );
};

// Пропс-types для TypeScript
Textarea.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  description: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  valid: PropTypes.bool,
  invalid: PropTypes.bool,
  maxLength: PropTypes.number,
  showCharCounter: PropTypes.bool,
  className: PropTypes.string,
  resize: PropTypes.oneOf(['none', 'both', 'horizontal', 'vertical']),
  minHeight: PropTypes.string,
};

// Экспорт всех типов textarea
export const TextareaVariants = {
  Base: BaseTextarea,
  WithLeftIcon: TextareaWithLeftIcon,
  WithRightIcon: TextareaWithRightIcon,
  WithIcons: TextareaWithIcons,
  Valid: ValidTextarea,
  Invalid: InvalidTextarea,
};

// Экспорт контейнера
export const TextareaContainerComponent = TextareaContainer;

// Экспорт основного компонента
export default Textarea;