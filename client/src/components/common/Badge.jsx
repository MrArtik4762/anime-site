import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../styles/tailwindUtils';

// Компонент Badge
const Badge = ({
  children,
  variant = 'secondary',
  color,
  size = 'medium',
  shape = 'default',
  outlined = false,
  uppercase = false,
  disabled = false,
  clickable = false,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  // Определяем классы для разных вариантов
  const getVariantClasses = () => {
    if (outlined) {
      switch (variant) {
        case 'primary':
          return 'border-blue-500 text-blue-500 bg-transparent';
        case 'success':
          return 'border-green-500 text-green-500 bg-transparent';
        case 'danger':
          return 'border-red-500 text-red-500 bg-transparent';
        case 'warning':
          return 'border-yellow-500 text-yellow-500 bg-transparent';
        case 'info':
          return 'border-blue-500 text-blue-500 bg-transparent';
        default:
          return 'border-slate-300 text-slate-700 bg-transparent';
      }
    }
    
    if (color) {
      const colorMap = {
        blue: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
        purple: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
        green: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
        red: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
        yellow: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
        indigo: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white',
        pink: 'bg-gradient-to-r from-pink-500 to-pink-600 text-white',
        teal: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white',
      };
      
      return colorMap[color] || 'bg-gradient-to-r from-slate-500 to-slate-600 text-white';
    }
    
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-[0_2px_4px_rgba(59,130,246,0.2)]';
      case 'secondary':
        return 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.05)]';
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-[0_2px_4px_rgba(34,197,94,0.2)]';
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-[0_2px_4px_rgba(239,68,68,0.2)]';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-[0_2px_4px_rgba(245,158,11,0.2)]';
      case 'info':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-[0_2px_4px_rgba(59,130,246,0.2)]';
      default:
        return 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.05)]';
    }
  };

  // Определяем классы для размеров
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-2 py-1 text-xs';
      case 'large':
        return 'px-3 py-1.5 text-sm';
      default:
        return 'px-2.5 py-1.5 text-xs';
    }
  };

  // Определяем классы для формы
  const getShapeClasses = () => {
    switch (shape) {
      case 'pill':
        return 'rounded-full';
      default:
        return 'rounded-lg';
    }
  };

  // Определяем классы для состояний
  const getStateClasses = () => {
    if (disabled) {
      return 'opacity-50 cursor-not-allowed';
    }
    
    if (clickable) {
      return 'cursor-pointer transition-all duration-200 ease-out hover:scale-105 hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)] active:scale-95';
    }
    
    return '';
  };

  // Определяем классы для текста
  const getTextClasses = () => {
    let classes = 'font-medium leading-none whitespace-nowrap';
    
    if (uppercase) {
      classes += ' uppercase tracking-wider';
    }
    
    return classes;
  };

  // Собираем все классы
  const badgeClasses = cn(
    'inline-flex items-center justify-center',
    getVariantClasses(),
    getSizeClasses(),
    getShapeClasses(),
    getStateClasses(),
    getTextClasses(),
    className
  );

  return (
    <span className={badgeClasses} {...props}>
      {icon && iconPosition === 'left' && (
        <span className="mr-1.5 transition-transform duration-200 hover:scale-110">
          {icon}
        </span>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && (
        <span className="ml-1.5 transition-transform duration-200 hover:scale-110">
          {icon}
        </span>
      )}
    </span>
  );
};

// Пропс-types для TypeScript
Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info']),
  color: PropTypes.oneOf(['blue', 'purple', 'green', 'red', 'yellow', 'indigo', 'pink', 'teal']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  shape: PropTypes.oneOf(['default', 'pill']),
  outlined: PropTypes.bool,
  uppercase: PropTypes.bool,
  disabled: PropTypes.bool,
  clickable: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
};

// Компонент BadgeDot для точечных бейджей
const BadgeDot = ({
  children,
  variant = 'danger',
  color,
  size = 'medium',
  className = '',
  ...props
}) => {
  // Определяем классы для цвета точки
  const getDotColorClasses = () => {
    if (color) {
      const colorMap = {
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
        green: 'bg-green-500',
        red: 'bg-red-500',
        yellow: 'bg-yellow-500',
        indigo: 'bg-indigo-500',
        pink: 'bg-pink-500',
        teal: 'bg-teal-500',
      };
      
      return colorMap[color] || 'bg-slate-500';
    }
    
    switch (variant) {
      case 'primary':
        return 'bg-blue-500';
      case 'success':
        return 'bg-green-500';
      case 'danger':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-slate-500';
    }
  };

  // Определяем классы для размера точки
  const getDotSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-1.5 h-1.5';
      case 'large':
        return 'w-2.5 h-2.5';
      default:
        return 'w-2 h-2';
    }
  };

  const dotClasses = cn(
    'rounded-full mr-2',
    getDotColorClasses(),
    getDotSizeClasses(),
    className
  );

  return (
    <span className="inline-flex items-center" {...props}>
      <span className={dotClasses}></span>
      {children}
    </span>
  );
};

// Пропс-types для BadgeDot
BadgeDot.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'success', 'danger', 'warning']),
  color: PropTypes.oneOf(['blue', 'purple', 'green', 'red', 'yellow', 'indigo', 'pink', 'teal']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
};

// Компонент BadgeGroup для группы бейджей
const BadgeGroup = ({
  children,
  gap = 2,
  className = '',
  ...props
}) => {
  const groupClasses = cn(
    'inline-flex flex-wrap',
    {
      'gap-2': gap === 2,
      'gap-3': gap === 3,
      'gap-4': gap === 4,
    },
    className
  );

  return (
    <div className={groupClasses} {...props}>
      {children}
    </div>
  );
};

// Пропс-types для BadgeGroup
BadgeGroup.propTypes = {
  children: PropTypes.node.isRequired,
  gap: PropTypes.oneOf([2, 3, 4]),
  className: PropTypes.string,
};

// Компонент BadgeStatus для статусных бейджей
const BadgeStatus = ({
  status,
  size = 'medium',
  children,
  className = '',
  ...props
}) => {
  // Определяем классы для статуса
  const getStatusClasses = () => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-slate-400';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-slate-400';
    }
  };

  // Определяем классы для размера точки
  const getDotSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-1.5 h-1.5';
      case 'large':
        return 'w-2.5 h-2.5';
      default:
        return 'w-2 h-2';
    }
  };

  const dotClasses = cn(
    'rounded-full mr-2',
    getStatusClasses(),
    getDotSizeClasses(),
    className
  );

  return (
    <span className="inline-flex items-center" {...props}>
      <span className={dotClasses}></span>
      {children}
    </span>
  );
};

// Пропс-types для BadgeStatus
BadgeStatus.propTypes = {
  status: PropTypes.oneOf(['online', 'offline', 'away', 'busy']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  children: PropTypes.node,
  className: PropTypes.string,
};

// Экспорт компонентов
export { Badge, BadgeDot, BadgeGroup, BadgeStatus };