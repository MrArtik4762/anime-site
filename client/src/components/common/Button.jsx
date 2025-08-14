import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Основная стилизованная кнопка
const BaseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[5]};
  font-size: ${props => props.theme.typography.fontSize.base[0]};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  line-height: ${props => props.theme.typography.lineHeight.tight};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: ${props => props.theme.form.input.border};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: ${props => props.theme.transitions.normal};
  min-height: ${props => props.theme.form.button.height};
  position: relative;
  overflow: hidden;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &:disabled {
    opacity: ${props => props.theme.opacity[50]};
    cursor: not-allowed;
  }
  
  /* Иконки */
  svg {
    width: ${props => props.theme.spacing[4]};
    height: ${props => props.theme.spacing[4]};
    flex-shrink: 0;
  }
  
  /* Загрузка состояния */
  .loading-spinner {
    width: ${props => props.theme.spacing[3]};
    height: ${props => props.theme.spacing[3]};
    border: 2px solid ${props => props.theme.colors.border};
    border-top: 2px solid ${props => props.theme.colors.primary};
    border-radius: 50%;
    animation: ${props => props.theme.animation.keyframes.spin} 1s linear infinite;
  }
`;

// Кнопки с разными вариантами
const PrimaryButton = styled(BaseButton)`
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.text.inverse};
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.elevation[2]};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled(BaseButton)`
  background: ${props => props.theme.colors.surface.secondary};
  color: ${props => props.theme.colors.text.primary};
  border-color: ${props => props.theme.colors.border.medium};
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.surface.tertiary};
    border-color: ${props => props.theme.colors.border.dark};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.elevation[2]};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const OutlineButton = styled(BaseButton)`
  background: transparent;
  color: ${props => props.theme.colors.primary};
  border-color: ${props => props.theme.colors.primary};
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primary}10;
    border-color: ${props => props.theme.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.elevation[2]};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const GhostButton = styled(BaseButton)`
  background: transparent;
  color: ${props => props.theme.colors.text.primary};
  border: none;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.surface.secondary};
    transform: translateY(-1px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const DangerButton = styled(BaseButton)`
  background: ${props => props.theme.colors.error};
  color: ${props => props.theme.colors.text.inverse};
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.error}Dark;
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.elevation[2]};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const SuccessButton = styled(BaseButton)`
  background: ${props => props.theme.colors.success};
  color: ${props => props.theme.colors.text.inverse};
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.success}Dark;
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.elevation[2]};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

// Размеры кнопок
const SmallButton = styled(BaseButton)`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  font-size: ${props => props.theme.typography.fontSize.sm[0]};
  min-height: ${props => props.theme.spacing[9]};
  
  svg {
    width: ${props => props.theme.spacing[3]};
    height: ${props => props.theme.spacing[3]};
  }
`;

const LargeButton = styled(BaseButton)`
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
  font-size: ${props => props.theme.typography.fontSize.lg[0]};
  min-height: ${props => props.theme.spacing[12]};
  
  svg {
    width: ${props => props.theme.spacing[5]};
    height: ${props => props.theme.spacing[5]};
  }
`;

// Полная ширина
const FullWidthButton = styled(BaseButton)`
  width: 100%;
`;

// Круглая кнопка
const CircleButton = styled(BaseButton)`
  border-radius: ${props => props.theme.borderRadius.full};
  width: ${props => props.theme.spacing[10]};
  height: ${props => props.theme.spacing[10]};
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: ${props => props.theme.spacing[5]};
    height: ${props => props.theme.spacing[5]};
  }
`;

// Компонент кнопки
const Button = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  circle = false,
  children,
  leftIcon,
  rightIcon,
  ...props
}) => {
  // Определяем стили в зависимости от пропсов
  const getButtonStyle = () => {
    if (circle) return CircleButton;
    if (fullWidth) return FullWidthButton;
    
    switch (size) {
      case 'small':
        return SmallButton;
      case 'large':
        return LargeButton;
      default:
        return BaseButton;
    }
  };
  
  // Определяем вариант стиля
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return SecondaryButton;
      case 'outline':
        return OutlineButton;
      case 'ghost':
        return GhostButton;
      case 'danger':
        return DangerButton;
      case 'success':
        return SuccessButton;
      default:
        return PrimaryButton;
    }
  };
  
  const ButtonStyle = getButtonStyle();
  const VariantStyle = getVariantStyle();
  const CombinedButton = VariantStyle.withComponent(ButtonStyle);
  
  return (
    <CombinedButton
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="loading-spinner" />
      )}
      
      {!loading && leftIcon && (
        <span className="left-icon">
          {leftIcon}
        </span>
      )}
      
      <span className="button-content">
        {children}
      </span>
      
      {!loading && rightIcon && (
        <span className="right-icon">
          {rightIcon}
        </span>
      )}
    </CombinedButton>
  );
};

// Пропс-types для TypeScript
Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger', 'success']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  circle: PropTypes.bool,
  children: PropTypes.node.isRequired,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
};

// Экспорт всех вариантов кнопок
export const ButtonVariants = {
  Primary: PrimaryButton,
  Secondary: SecondaryButton,
  Outline: OutlineButton,
  Ghost: GhostButton,
  Danger: DangerButton,
  Success: SuccessButton,
};

// Экспорт размеров кнопок
export const ButtonSizes = {
  Small: SmallButton,
  Medium: BaseButton,
  Large: LargeButton,
};

// Экспорт специальных кнопок
export const FullWidthButtonComponent = FullWidthButton;
export const CircleButtonComponent = CircleButton;

// Экспорт основного компонента
export default Button;