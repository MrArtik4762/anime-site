import React from 'react';
import PropTypes from 'prop-types';
import { colors, spacing, borderRadius } from '../../styles/designTokens';
import { cn } from '../../styles/tailwindUtils';

// Компонент Card
const Card = ({
  title,
  description,
  children,
  footer,
  image,
  imageHeight,
  badge,
  badgeColor,
  className = '',
  variant = 'default',
  clickable = false,
  fullHeight = false,
  onClick,
  ...props
}) => {
  const cardClasses = cn(
    'relative flex flex-col w-full rounded-lg border transition-all duration-200 ease-out overflow-hidden',
    {
      'bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-sm': variant === 'default' && !clickable,
      'hover:shadow-lg hover:border-blue-500 hover:-translate-y-1': clickable && variant === 'default',
      'cursor-pointer': clickable,
      'bg-transparent border-2 border-slate-300': variant === 'outlined',
      'shadow-xl': variant === 'elevated',
      'h-full': fullHeight,
    },
    className
  );

  const headerClasses = cn(
    'p-6 border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white',
    {
      'border-slate-300': variant === 'outlined',
    }
  );

  const titleClasses = cn(
    'text-lg font-semibold text-slate-900 m-0 leading-tight',
    {
      'text-slate-800': variant === 'outlined',
    }
  );

  const descriptionClasses = cn(
    'text-sm text-slate-600 mt-2 leading-normal',
    {
      'text-slate-500': variant === 'outlined',
    }
  );

  const bodyClasses = cn(
    'p-6 flex-grow bg-gradient-to-br from-slate-25 to-slate-50',
    {
      'bg-transparent': variant === 'outlined',
    }
  );

  const footerClasses = cn(
    'p-6 border-t border-slate-200 bg-gradient-to-br from-slate-50 to-white',
    {
      'border-slate-300': variant === 'outlined',
    }
  );

  const imageClasses = cn(
    'w-full rounded-md mb-6 transition-transform duration-200 ease-out',
    {
      'hover:scale-102 hover:rounded-lg': clickable,
    }
  );

  const imageWrapperClasses = cn(
    'relative mb-6 overflow-hidden rounded-md',
    {
      'hover:rounded-lg': clickable,
    }
  );

  const badgeClasses = cn(
    'absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full shadow-md backdrop-blur-sm',
    {
      'bg-gradient-to-r from-red-500 to-purple-600 text-white': badgeColor === 'default',
      'bg-gradient-to-r from-blue-500 to-blue-600 text-white': badgeColor === 'blue',
      'bg-gradient-to-r from-green-500 to-green-600 text-white': badgeColor === 'green',
      'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white': badgeColor === 'yellow',
      'bg-gradient-to-r from-purple-500 to-purple-600 text-white': badgeColor === 'purple',
    }
  );

  return (
    <div className={cardClasses} onClick={clickable ? onClick : undefined} {...props}>
      {image && (
        <div className={imageWrapperClasses}>
          <img
            src={image}
            alt={title}
            height={imageHeight}
            className={imageClasses}
          />
          {badge && (
            <span className={badgeClasses}>
              {badge}
            </span>
          )}
        </div>
      )}
      
      {(title || description) && (
        <div className={headerClasses}>
          {title && <h3 className={titleClasses}>{title}</h3>}
          {description && <p className={descriptionClasses}>{description}</p>}
        </div>
      )}
      
      {children && (
        <div className={bodyClasses}>
          {children}
        </div>
      )}
      
      {footer && (
        <div className={footerClasses}>
          {footer}
        </div>
      )}
    </div>
  );
};

// Пропс-types для TypeScript
Card.propTypes = {
  title: PropTypes.node,
  description: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node,
  image: PropTypes.string,
  imageHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  badge: PropTypes.node,
  badgeColor: PropTypes.oneOf(['default', 'blue', 'green', 'yellow', 'purple']),
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'outlined', 'elevated']),
  clickable: PropTypes.bool,
  fullHeight: PropTypes.bool,
  onClick: PropTypes.func,
};

// Компонент CardGroup для группы карточек
const CardGroup = ({
  children,
  className = '',
  gap,
  responsive,
  minWidth,
  ...props
}) => {
  const groupClasses = cn(
    'grid grid-cols-1',
    {
      'gap-6': !gap,
      [`gap-${gap}`]: gap,
      'md:grid-cols-2 lg:grid-cols-3': responsive?.md === 2 && responsive?.sm === 1,
      'md:grid-cols-3 lg:grid-cols-4': responsive?.md === 3 && responsive?.sm === 1,
      'min-w-[300px]': minWidth,
    },
    className
  );

  return (
    <div className={groupClasses} {...props}>
      {children}
    </div>
  );
};

// Пропс-types для CardGroup
CardGroup.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  gap: PropTypes.oneOf(['1', '2', '3', '4', '5', '6']),
  responsive: PropTypes.shape({
    md: PropTypes.number,
    sm: PropTypes.number,
  }),
  minWidth: PropTypes.string,
};

// Компонент CardGrid для сетки карточек
const CardGrid = ({
  children,
  className = '',
  columns = 3,
  gap,
  responsive,
  ...props
}) => {
  const gridClasses = cn(
    'grid grid-cols-1',
    {
      'gap-6': !gap,
      [`gap-${gap}`]: gap,
      [`grid-cols-${columns}`]: columns,
      'md:grid-cols-2': responsive?.md === 2,
      'md:grid-cols-3': responsive?.md === 3,
      'sm:grid-cols-1': responsive?.sm === 1,
    },
    className
  );

  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  );
};

// Пропс-types для CardGrid
CardGrid.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  columns: PropTypes.number,
  gap: PropTypes.oneOf(['1', '2', '3', '4', '5', '6']),
  responsive: PropTypes.shape({
    md: PropTypes.number,
    sm: PropTypes.number,
  }),
};

// Компонент CardList для списка карточек
const CardList = ({
  children,
  className = '',
  gap,
  ...props
}) => {
  const listClasses = cn(
    'flex flex-col',
    {
      'gap-6': !gap,
      [`gap-${gap}`]: gap,
    },
    className
  );

  return (
    <div className={listClasses} {...props}>
      {children}
    </div>
  );
};

// Пропс-types для CardList
CardList.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  gap: PropTypes.oneOf(['1', '2', '3', '4', '5', '6']),
};

// Экспорт компонентов
export { Card, CardGroup, CardGrid, CardList };