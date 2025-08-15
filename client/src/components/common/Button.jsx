import React from 'react';
import PropTypes from 'prop-types';
import { colors, spacing, borderRadius } from '../../styles/designTokens';
import { cn } from '../../styles/tailwindUtils';

// CSS анимация для спиннера загрузки
const spinnerStyle = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Классы для разных вариантов кнопок
const getVariantClasses = (variant, darkMode = false) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 px-4 py-2 font-medium rounded-lg border transition-all duration-200 ease-out min-h-[40px] relative overflow-hidden bg-gradient-to-br backdrop-blur-sm';
  
  switch (variant) {
    case 'primary':
      return cn(
        baseClasses,
        'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-[0_4px_6px_rgba(59,130,246,0.2)]',
        'hover:shadow-[0_10px_15px_-3px_rgba(59,130,246,0.3),_0_4px_6px_-2px_rgba(59,130,246,0.1)]',
        'hover:from-blue-600 hover:to-purple-700',
        'active:shadow-[0_4px_6px_rgba(59,130,246,0.2)]',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      );
    
    case 'secondary':
      return cn(
        baseClasses,
        darkMode 
          ? 'bg-gradient-to-br from-slate-700 to-slate-600 text-slate-100 border-slate-600 shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
          : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.1)]',
        'hover:border-blue-500 hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)]',
        darkMode 
          ? 'hover:from-slate-600 hover:to-slate-500'
          : 'hover:from-slate-200 hover:to-slate-300',
        'active:shadow-[0_1px_3px_rgba(0,0,0,0.1)]',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'disabled:opacity-60 disabled:cursor-not-allowed'
      );
    
    case 'outline':
      return cn(
        baseClasses,
        'bg-transparent text-blue-500 border-blue-500 shadow-none',
        'hover:bg-blue-50 hover:border-blue-600 hover:shadow-[0_4px_6px_rgba(59,130,246,0.1)]',
        'active:shadow-none',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      );
    
    case 'ghost':
      return cn(
        baseClasses,
        'bg-transparent text-slate-800 border-transparent shadow-none',
        darkMode && 'text-slate-100',
        'hover:bg-gradient-to-br hover:from-slate-100 hover:to-slate-200 hover:border-slate-300',
        darkMode && 'hover:from-slate-700 hover:to-slate-600 hover:border-slate-600',
        'active:shadow-none',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      );
    
    case 'danger':
      return cn(
        baseClasses,
        'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-[0_4px_6px_rgba(239,68,68,0.2)]',
        'hover:shadow-[0_10px_15px_-3px_rgba(239,68,68,0.3),_0_4px_6px_-2px_rgba(239,68,68,0.1)]',
        'hover:from-red-600 hover:to-red-700',
        'active:shadow-[0_4px_6px_rgba(239,68,68,0.2)]',
        'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      );
    
    case 'success':
      return cn(
        baseClasses,
        'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_4px_6px_rgba(34,197,94,0.2)]',
        'hover:shadow-[0_10px_15px_-3px_rgba(34,197,94,0.3),_0_4px_6px_-2px_rgba(34,197,94,0.1)]',
        'hover:from-green-600 hover:to-green-700',
        'active:shadow-[0_4px_6px_rgba(34,197,94,0.2)]',
        'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      );
    
    default:
      return getVariantClasses('primary');
  }
};

// Классы для разных размеров кнопок
const getSizeClasses = (size) => {
  switch (size) {
    case 'small':
      return 'px-3 py-1.5 text-sm min-h-[32px] gap-1';
    case 'large':
      return 'px-6 py-3 text-lg min-h-[48px] gap-2';
    default:
      return 'px-4 py-2 text-base min-h-[40px] gap-2';
  }
};

// Классы для специальных кнопок
const getSpecialClasses = (circle, fullWidth) => {
  const classes = [];
  
  if (circle) {
    classes.push('rounded-full w-10 h-10 p-0 gap-0');
  }
  
  if (fullWidth) {
    classes.push('w-full');
  }
  
  return classes.join(' ');
};

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
  className,
  darkMode = false,
  ...props
}) => {
  const variantClasses = getVariantClasses(variant, darkMode);
  const sizeClasses = getSizeClasses(size);
  const specialClasses = getSpecialClasses(circle, fullWidth);
  
  const buttonClasses = cn(variantClasses, sizeClasses, specialClasses, className);
  
  return (
    <>
      <style>{spinnerStyle}</style>
      <button
        className={buttonClasses}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span 
            className="loading-spinner w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"
          />
        )}
        
        {!loading && leftIcon && (
          <span className="left-icon flex items-center justify-center">
            {leftIcon}
          </span>
        )}
        
        <span className="button-content flex items-center justify-center">
          {children}
        </span>
        
        {!loading && rightIcon && (
          <span className="right-icon flex items-center justify-center">
            {rightIcon}
          </span>
        )}
      </button>
    </>
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
  className: PropTypes.string,
  darkMode: PropTypes.bool,
};

// Экспорт всех вариантов кнопок как компонентов
export const PrimaryButton = ({ className, ...props }) => (
  <Button variant="primary" className={cn(getVariantClasses('primary'), className)} {...props} />
);

export const SecondaryButton = ({ className, darkMode = false, ...props }) => (
  <Button variant="secondary" className={cn(getVariantClasses('secondary', darkMode), className)} {...props} />
);

export const OutlineButton = ({ className, ...props }) => (
  <Button variant="outline" className={cn(getVariantClasses('outline'), className)} {...props} />
);

export const GhostButton = ({ className, darkMode = false, ...props }) => (
  <Button variant="ghost" className={cn(getVariantClasses('ghost', darkMode), className)} {...props} />
);

export const DangerButton = ({ className, ...props }) => (
  <Button variant="danger" className={cn(getVariantClasses('danger'), className)} {...props} />
);

export const SuccessButton = ({ className, ...props }) => (
  <Button variant="success" className={cn(getVariantClasses('success'), className)} {...props} />
);

// Экспорт размеров кнопок как компонентов
export const SmallButton = ({ className, ...props }) => (
  <Button size="small" className={cn(getSizeClasses('small'), className)} {...props} />
);

export const LargeButton = ({ className, ...props }) => (
  <Button size="large" className={cn(getSizeClasses('large'), className)} {...props} />
);

// Экспорт специальных кнопок как компонентов
export const FullWidthButton = ({ className, ...props }) => (
  <Button fullWidth className={cn(getSpecialClasses(false, true), className)} {...props} />
);

export const CircleButton = ({ className, ...props }) => (
  <Button circle className={cn(getSpecialClasses(true, false), className)} {...props} />
);

// Экспорт основного компонента
export default Button;