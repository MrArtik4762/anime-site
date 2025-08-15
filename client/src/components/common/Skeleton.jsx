import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { styled } from 'styled-components';

// Стилизованный скелетон
const SkeletonElement = styled.div`
  background: linear-gradient(
    90deg,
    ${props => props.theme.colors.border} 25%,
    ${props => props.theme.colors.surface} 37%,
    ${props => props.theme.colors.border} 63%
  );
  background-size: 400% 100%;
  animation: ${props => props.theme.animations.skeleton} 1.4s ease infinite;
  border-radius: ${props => {
    if (props.rounded === 'full') return '999px';
    if (props.rounded === 'small') return props.theme.border.radius.sm;
    if (props.rounded === 'medium') return props.theme.border.radius.md;
    if (props.rounded === 'large') return props.theme.border.radius.lg;
    return props.theme.border.radius.md;
  }};
  width: ${props => {
    if (props.width === 'auto') return 'auto';
    if (props.width === 'full') return '100%';
    if (typeof props.width === 'number') return `${props.width}px`;
    return props.width;
  }};
  height: ${props => {
    if (props.height === 'auto') return 'auto';
    if (props.height === 'full') return '100%';
    if (typeof props.height === 'number') return `${props.height}px`;
    return props.height;
  }};
  margin: ${props => props.margin || 0};
  padding: ${props => props.padding || 0};
  display: ${props => props.display || 'block'};
  flex-shrink: 0;
  
  ${props => props.variant === 'text' && `
    height: ${props.theme.fontSizes[props.size || 'base']};
    width: ${props.width || '100%'};
    margin-bottom: ${props.theme.spacing.xsmall};
  `}
  
  ${props => props.variant === 'circle' && `
    border-radius: 50%;
    width: ${props.size === 'small' ? '24px' : props.size === 'large' ? '48px' : '32px'};
    height: ${props.size === 'small' ? '24px' : props.size === 'large' ? '48px' : '32px'};
  `}
  
  ${props => props.variant === 'rect' && `
    border-radius: ${props.theme.border.radius.sm};
  `}
  
  ${props => props.variant === 'button' && `
    height: ${props.theme.sizes.buttonHeight};
    width: ${props.width || '120px'};
    border-radius: ${props.theme.border.radius.md};
  `}
  
  ${props => props.variant === 'card' && `
    border-radius: ${props.theme.border.radius.lg};
    overflow: hidden;
  `}
  
  ${props => props.variant === 'image' && `
    border-radius: ${props.theme.border.radius.md};
    background-color: ${props.theme.colors.border};
  `}
  
  ${props => props.variant === 'avatar' && `
    border-radius: 50%;
    width: ${props.size === 'small' ? '32px' : props.size === 'large' ? '64px' : '48px'};
    height: ${props.size === 'small' ? '32px' : props.size === 'large' ? '64px' : '48px'};
  `}
  
  ${props => props.variant === 'title' && `
    height: ${props.theme.fontSizes.lg};
    width: ${props.width || '60%'};
    margin-bottom: ${props.theme.spacing.small};
  `}
  
  ${props => props.variant === 'subtitle' && `
    height: ${props.theme.fontSizes.base};
    width: ${props.width || '40%'};
    margin-bottom: ${props.theme.spacing.xsmall};
  `}
  
  ${props => props.variant === 'paragraph' && `
    height: ${props.theme.fontSizes.sm};
    margin-bottom: ${props.theme.spacing.xsmall};
    width: ${props.width || '100%'};
  `}
  
  ${props => props.variant === 'list' && `
    height: ${props.theme.fontSizes.sm};
    margin-bottom: ${props.theme.spacing.xxsmall};
    width: ${props.width || '100%'};
  }}
  
  ${props => props.variant === 'chart' && `
    height: ${props.height || '200px'};
    width: ${props.width || '100%'};
    border-radius: ${props.theme.border.radius.md};
  }}
  
  ${props => props.variant === 'table' && `
    width: 100%;
    border-radius: ${props.theme.border.radius.md};
  }}
  
  ${props => props.variant === 'form' && `
    height: ${props.theme.sizes.inputHeight};
    width: ${props.width || '100%'};
    border-radius: ${props.theme.border.radius.md};
  }}
  
  ${props => props.variant === 'tabs' && `
    height: ${props.theme.sizes.tabHeight};
    width: ${props.width || 'auto'};
    border-radius: ${props.theme.border.radius.md};
  }}
  
  ${props => props.variant === 'badge' && `
    height: ${props.theme.sizes.badgeHeight};
    width: ${props.width || '60px'};
    border-radius: ${props.theme.border.radius.sm};
  }}
  
  ${props => props.variant === 'rating' && `
    display: flex;
    gap: ${props.theme.spacing.xxsmall};
    align-items: center;
  }}
  
  ${props => props.variant === 'tag' && `
    height: ${props.theme.sizes.tagHeight};
    width: ${props.width || 'auto'};
    border-radius: ${props.theme.border.radius.sm};
  }}
  
  ${props => props.variant === 'breadcrumb' && `
    display: flex;
    align-items: center;
    gap: ${props.theme.spacing.xxsmall};
  }}
  
  ${props => props.variant === 'progress' && `
    height: ${props.theme.sizes.progressHeight};
    width: ${props.width || '100%'};
    border-radius: ${props.theme.border.radius.sm};
  }}
  
  ${props => props.variant === 'divider' && `
    height: ${props.theme.sizes.dividerHeight};
    width: ${props.width || '100%'};
    border-radius: ${props.theme.border.radius.sm};
  }}
  
  ${props => props.variant === 'avatar-group' && `
    display: flex;
    align-items: center;
    gap: ${props.theme.spacing.xxsmall};
  }}
`;

// Основной компонент Skeleton
export const Skeleton = memo(({
  variant = 'text',
  size = 'medium',
  width,
  height,
  rounded = 'medium',
  margin,
  padding,
  display,
  className,
  style,
  ...props
}) => {
  return (
    <SkeletonElement
      variant={variant}
      size={size}
      width={width}
      height={height}
      rounded={rounded}
      margin={margin}
      padding={padding}
      display={display}
      className={className}
      style={style}
      {...props}
    />
  );
});

Skeleton.propTypes = {
  variant: PropTypes.oneOf([
    'text',
    'circle',
    'rect',
    'button',
    'card',
    'image',
    'avatar',
    'title',
    'subtitle',
    'paragraph',
    'list',
    'chart',
    'table',
    'form',
    'tabs',
    'badge',
    'rating',
    'tag',
    'breadcrumb',
    'progress',
    'divider',
    'avatar-group',
  ]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rounded: PropTypes.oneOf(['small', 'medium', 'large', 'full']),
  margin: PropTypes.string,
  padding: PropTypes.string,
  display: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для группы скелетонов
export const SkeletonGroup = memo(({
  count,
  variant = 'text',
  size = 'medium',
  width,
  height,
  rounded = 'medium',
  margin,
  padding,
  display,
  className,
  style,
  spacing = 'small',
  direction = 'column',
  ...props
}) => {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <Skeleton
      key={i}
      variant={variant}
      size={size}
      width={width}
      height={height}
      rounded={rounded}
      margin={margin}
      padding={padding}
      display={display}
      className={className}
      style={{
        ...style,
        marginBottom: direction === 'column' && i < count - 1 ? 
          (spacing === 'small' ? '8px' : spacing === 'medium' ? '16px' : '24px') : '0',
        marginRight: direction === 'row' && i < count - 1 ? 
          (spacing === 'small' ? '8px' : spacing === 'medium' ? '16px' : '24px') : '0',
      }}
      {...props}
    />
  ));
  
  return (
    <div style={{ display: 'flex', flexDirection: direction, ...style }}>
      {skeletons}
    </div>
  );
});

SkeletonGroup.propTypes = {
  count: PropTypes.number.isRequired,
  variant: PropTypes.oneOf([
    'text',
    'circle',
    'rect',
    'button',
    'card',
    'image',
    'avatar',
    'title',
    'subtitle',
    'paragraph',
    'list',
    'chart',
    'table',
    'form',
    'tabs',
    'badge',
    'rating',
    'tag',
    'breadcrumb',
    'progress',
    'divider',
    'avatar-group',
  ]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rounded: PropTypes.oneOf(['small', 'medium', 'large', 'full']),
  margin: PropTypes.string,
  padding: PropTypes.string,
  display: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  spacing: PropTypes.oneOf(['small', 'medium', 'large']),
  direction: PropTypes.oneOf(['row', 'column']),
};

// Компонент для скелетона карточки
export const SkeletonCard = memo(({
  width = '300px',
  height = '200px',
  rounded = 'medium',
  className,
  style,
  ...props
}) => {
  return (
    <div className={className} style={{ width, height, borderRadius: rounded, ...style }}>
      <Skeleton variant="image" height="160px" rounded={rounded} />
      <div style={{ padding: '16px' }}>
        <Skeleton variant="title" width="70%" />
        <Skeleton variant="subtitle" width="50%" />
        <SkeletonGroup count={3} variant="text" margin="8px 0" />
        <SkeletonGroup count={2} variant="button" margin="8px 8px 0 0" direction="row" />
      </div>
    </div>
  );
});

SkeletonCard.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rounded: PropTypes.oneOf(['small', 'medium', 'large', 'full']),
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для скелетона профиля
export const SkeletonProfile = memo(({
  avatarSize = 'large',
  className,
  style,
  ...props
}) => {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: '16px', ...style }}>
      <Skeleton variant="avatar" size={avatarSize} />
      <div style={{ flex: 1 }}>
        <Skeleton variant="title" width="40%" />
        <Skeleton variant="subtitle" width="60%" />
        <Skeleton variant="text" width="80%" margin="8px 0" />
        <SkeletonGroup count={2} variant="text" margin="4px 0" />
      </div>
    </div>
  );
});

SkeletonProfile.propTypes = {
  avatarSize: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для скелетона списка
export const SkeletonList = memo(({
  count = 3,
  avatar = true,
  lines = 2,
  className,
  style,
  ...props
}) => {
  return (
    <div className={className} style={{ ...style }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          {avatar && <Skeleton variant="avatar" size="medium" />}
          <div style={{ flex: 1 }}>
            <Skeleton variant="title" width="60%" />
            {lines > 1 && (
              <Skeleton variant="text" width="80%" margin="8px 0" />
            )}
            {lines > 2 && (
              <Skeleton variant="text" width="70%" margin="8px 0" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

SkeletonList.propTypes = {
  count: PropTypes.number,
  avatar: PropTypes.bool,
  lines: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для скелетона таблицы
export const SkeletonTable = memo(({
  columns = 4,
  rows = 5,
  header = true,
  className,
  style,
  ...props
}) => {
  return (
    <div className={className} style={{ width: '100%', ...style }}>
      {header && (
        <div style={{ display: 'flex', marginBottom: '8px' }}>
          {Array.from({ length: columns }, (_, i) => (
            <Skeleton
              key={`header-${i}`}
              variant="text"
              width="100%"
              height="20px"
              margin="0 8px"
            />
          ))}
        </div>
      )}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex', marginBottom: '8px' }}>
          {Array.from({ length: columns }, (_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="text"
              width="100%"
              height="16px"
              margin="0 8px"
            />
          ))}
        </div>
      ))}
    </div>
  );
});

SkeletonTable.propTypes = {
  columns: PropTypes.number,
  rows: PropTypes.number,
  header: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для скелетона формы
export const SkeletonForm = memo(({
  fields = 3,
  className,
  style,
  ...props
}) => {
  return (
    <div className={className} style={{ ...style }}>
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} style={{ marginBottom: '16px' }}>
          <Skeleton variant="text" width="30%" height="16px" margin="0 0 8px 0" />
          <Skeleton variant="form" width="100%" />
        </div>
      ))}
    </div>
  );
});

SkeletonForm.propTypes = {
  fields: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для скелетона галереи
export const SkeletonGallery = memo(({
  columns = 3,
  rows = 2,
  className,
  style,
  ...props
}) => {
  return (
    <div className={className} style={{ 
      display: 'grid', 
      gridTemplateColumns: `repeat(${columns}, 1fr)`, 
      gap: '16px',
      ...style 
    }}>
      {Array.from({ length: columns * rows }, (_, i) => (
        <div key={i}>
          <Skeleton variant="image" height="200px" />
          <div style={{ padding: '12px' }}>
            <Skeleton variant="title" width="80%" />
            <Skeleton variant="text" width="60%" margin="8px 0" />
          </div>
        </div>
      ))}
    </div>
  );
});

SkeletonGallery.propTypes = {
  columns: PropTypes.number,
  rows: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Skeleton;