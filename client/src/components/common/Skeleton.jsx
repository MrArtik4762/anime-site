import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Анимация скелетона
const shimmer = `
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

// Базовый компонент скелетона
const SkeletonBase = styled.div`
  background: linear-gradient(
    to right,
    ${props => props.theme.colors.border.light} 8%,
    ${props => props.theme.colors.border.lighter} 18%,
    ${props => props.theme.colors.border.light} 33%
  );
  background-size: 800px 104px;
  animation: ${shimmer} 1.5s linear infinite;
  border-radius: ${props => props.theme.borderRadius.md};
  
  ${props => props.rounded && `
    border-radius: ${props.theme.borderRadius.full};
  `}
  
  ${props => props.circle && `
    border-radius: 50%;
  `}
`;

// Скелетон для текста
const SkeletonText = styled(SkeletonBase)`
  height: ${props => props.height || props.theme.typography.fontSize.base[0]};
  margin-bottom: ${props => props.gap || props.theme.spacing[2]};
  width: ${props => props.width || '100%'};
  
  &:last-child {
    margin-bottom: 0;
  }
  
  ${props => props.lines > 1 && `
    &:not(:last-child) {
      margin-bottom: ${props => props.gap || props.theme.spacing[2]};
    }
  `}
`;

// Скелетон для изображения
const SkeletonImage = styled(SkeletonBase)`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '200px'};
  
  ${props => props.circle && `
    width: ${props => props.size || '100px'};
    height: ${props => props.size || '100px'};
  `}
`;

// Скелетон для аватара
const SkeletonAvatar = styled(SkeletonBase)`
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border-radius: 50%;
`;

// Скелетон для заголовка
const SkeletonTitle = styled(SkeletonBase)`
  height: ${props => props.theme.typography.fontSize.lg[0]};
  width: ${props => props.width || '60%'};
  margin-bottom: ${props => props.theme.spacing[3]};
`;

// Скелетон для кнопки
const SkeletonButton = styled(SkeletonBase)`
  height: ${props => props.size === 'small' ? '32px' : props.size === 'medium' ? '40px' : '48px'};
  width: ${props => props.width || '120px'};
  border-radius: ${props => props.theme.borderRadius.md};
  
  ${props => props.variant === 'pill' && `
    border-radius: ${props.theme.borderRadius.full};
  `}
`;

// Скелетон для карточки
const SkeletonCard = styled.div`
  background-color: ${props => props.theme.colors.surface.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadow.sm};
  
  .skeleton-image {
    width: 100%;
    height: ${props => props.imageHeight || '200px'};
    background: linear-gradient(
      to right,
      ${props => props.theme.colors.border.light} 8%,
      ${props => props.theme.colors.border.lighter} 18%,
      ${props => props.theme.colors.border.light} 33%
    );
    background-size: 800px 104px;
    animation: ${shimmer} 1.5s linear infinite;
  }
  
  .skeleton-content {
    padding: ${props => props.theme.spacing[4]};
    
    .skeleton-title {
      height: ${props => props.theme.typography.fontSize.lg[0]};
      width: ${props => props.titleWidth || '60%'};
      margin-bottom: ${props => props.theme.spacing[3]};
      background: linear-gradient(
        to right,
        ${props => props.theme.colors.border.light} 8%,
        ${props => props.theme.colors.border.lighter} 18%,
        ${props => props.theme.colors.border.light} 33%
      );
      background-size: 800px 104px;
      animation: ${shimmer} 1.5s linear infinite;
      border-radius: ${props => props.theme.borderRadius.md};
    }
    
    .skeleton-text {
      height: ${props => props.theme.typography.fontSize.base[0]};
      margin-bottom: ${props => props.theme.spacing[2]};
      background: linear-gradient(
        to right,
        ${props => props.theme.colors.border.light} 8%,
        ${props => props.theme.colors.border.lighter} 18%,
        ${props => props.theme.colors.border.light} 33%
      );
      background-size: 800px 104px;
      animation: ${shimmer} 1.5s linear infinite;
      border-radius: ${props => props.theme.borderRadius.md};
    }
    
    .skeleton-footer {
      display: flex;
      justify-content: space-between;
      margin-top: ${props => props.theme.spacing[4]};
      
      .skeleton-button {
        height: ${props => props.theme.typography.fontSize.base[0]};
        width: ${props => props.buttonWidth || '100px'};
        background: linear-gradient(
          to right,
          ${props => props.theme.colors.border.light} 8%,
          ${props => props.theme.colors.border.lighter} 18%,
          ${props => props.theme.colors.border.light} 33%
        );
        background-size: 800px 104px;
        animation: ${shimmer} 1.5s linear infinite;
        border-radius: ${props => props.theme.borderRadius.md};
      }
    }
  }
`;

// Компонент Skeleton
const Skeleton = ({
  type = 'text',
  height,
  width,
  size,
  gap,
  lines,
  rounded,
  circle,
  variant,
  className = '',
  ...props
}) => {
  switch (type) {
    case 'text':
      return (
        <SkeletonText
          height={height}
          width={width}
          gap={gap}
          lines={lines}
          rounded={rounded}
          circle={circle}
          className={`${className} skeleton-text`}
          {...props}
        />
      );
    
    case 'image':
      return (
        <SkeletonImage
          height={height}
          width={width}
          size={size}
          circle={circle}
          className={`${className} skeleton-image`}
          {...props}
        />
      );
    
    case 'avatar':
      return (
        <SkeletonAvatar
          size={size}
          className={`${className} skeleton-avatar`}
          {...props}
        />
      );
    
    case 'title':
      return (
        <SkeletonTitle
          height={height}
          width={width}
          rounded={rounded}
          className={`${className} skeleton-title`}
          {...props}
        />
      );
    
    case 'button':
      return (
        <SkeletonButton
          height={height}
          width={width}
          size={size}
          variant={variant}
          rounded={rounded}
          className={`${className} skeleton-button`}
          {...props}
        />
      );
    
    case 'card':
      return (
        <SkeletonCard
          height={height}
          width={width}
          size={size}
          gap={gap}
          rounded={rounded}
          circle={circle}
          variant={variant}
          className={`${className} skeleton-card`}
          {...props}
        />
      );
    
    default:
      return (
        <SkeletonBase
          height={height}
          width={width}
          size={size}
          gap={gap}
          rounded={rounded}
          circle={circle}
          variant={variant}
          className={`${className} skeleton`}
          {...props}
        />
      );
  }
};

// Пропс-types для TypeScript
Skeleton.propTypes = {
  type: PropTypes.oneOf(['text', 'image', 'avatar', 'title', 'button', 'card']),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  gap: PropTypes.string,
  lines: PropTypes.number,
  rounded: PropTypes.bool,
  circle: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'pill']),
  className: PropTypes.string,
};

// Компонент SkeletonList для списка скелетонов
const SkeletonListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.gap || props.theme.spacing[4]};
`;

// Компонент SkeletonList
const SkeletonList = ({
  count = 3,
  type = 'card',
  gap,
  className = '',
  ...props
}) => {
  return (
    <SkeletonListContainer
      gap={gap}
      className={`${className} skeleton-list`}
      {...props}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} type={type} {...props} />
      ))}
    </SkeletonListContainer>
  );
};

// Пропп-types для SkeletonList
SkeletonList.propTypes = {
  count: PropTypes.number,
  type: PropTypes.oneOf(['text', 'image', 'avatar', 'title', 'button', 'card']),
  gap: PropTypes.string,
  className: PropTypes.string,
};

// Компонент SkeletonTable для таблиц скелетонов
const SkeletonTableContainer = styled.div`
  width: 100%;
  overflow: hidden;
  
  .skeleton-table-header {
    display: grid;
    grid-template-columns: ${props => props.columns};
    gap: ${props => props.theme.spacing[3]};
    margin-bottom: ${props => props.theme.spacing[3]};
    
    .skeleton-cell {
      height: ${props => props.theme.typography.fontSize.base[0]};
      background: linear-gradient(
        to right,
        ${props => props.theme.colors.border.light} 8%,
        ${props => props.theme.colors.border.lighter} 18%,
        ${props => props.theme.colors.border.light} 33%
      );
      background-size: 800px 104px;
      animation: ${shimmer} 1.5s linear infinite;
      border-radius: ${props => props.theme.borderRadius.md};
    }
  }
  
  .skeleton-table-row {
    display: grid;
    grid-template-columns: ${props => props.columns};
    gap: ${props => props.theme.spacing[3]};
    margin-bottom: ${props => props.theme.spacing[3]};
    
    .skeleton-cell {
      height: ${props => props.theme.typography.fontSize.base[0]};
      background: linear-gradient(
        to right,
        ${props => props.theme.colors.border.light} 8%,
        ${props => props.theme.colors.border.lighter} 18%,
        ${props => props.theme.colors.border.light} 33%
      );
      background-size: 800px 104px;
      animation: ${shimmer} 1.5s linear infinite;
      border-radius: ${props => props.theme.borderRadius.md};
    }
  }
`;

// Компонент SkeletonTable
const SkeletonTable = ({
  rows = 5,
  columns = '1fr 2fr 1fr 1fr',
  gap,
  className = '',
  ...props
}) => {
  return (
    <SkeletonTableContainer
      columns={columns}
      gap={gap}
      className={`${className} skeleton-table`}
      {...props}
    >
      <div className="skeleton-table-header">
        {Array.from({ length: columns.split(' ').length }).map((_, index) => (
          <div key={`header-${index}`} className="skeleton-cell" />
        ))}
      </div>
      
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="skeleton-table-row">
          {Array.from({ length: columns.split(' ').length }).map((_, cellIndex) => (
            <div key={`cell-${rowIndex}-${cellIndex}`} className="skeleton-cell" />
          ))}
        </div>
      ))}
    </SkeletonTableContainer>
  );
};

// Пропп-types для SkeletonTable
SkeletonTable.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.string,
  gap: PropTypes.string,
  className: PropTypes.string,
};

// Компонент SkeletonForm для форм скелетонов
const SkeletonFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.gap || props.theme.spacing[4]};
  
  .skeleton-form-row {
    display: flex;
    flex-direction: column;
    gap: ${props => props.theme.spacing[2]};
    
    .skeleton-label {
      height: ${props => props.theme.typography.fontSize.sm[0]};
      width: ${props => props.labelWidth || '30%'};
      background: linear-gradient(
        to right,
        ${props => props.theme.colors.border.light} 8%,
        ${props => props.theme.colors.border.lighter} 18%,
        ${props => props.theme.colors.border.light} 33%
      );
      background-size: 800px 104px;
      animation: ${shimmer} 1.5s linear infinite;
      border-radius: ${props => props.theme.borderRadius.md};
    }
    
    .skeleton-input {
      height: ${props => props.theme.spacing[6]};
      background: linear-gradient(
        to right,
        ${props => props.theme.colors.border.light} 8%,
        ${props => props.theme.colors.border.lighter} 18%,
        ${props => props.theme.colors.border.light} 33%
      );
      background-size: 800px 104px;
      animation: ${shimmer} 1.5s linear infinite;
      border-radius: ${props => props.theme.borderRadius.md};
    }
  }
  
  .skeleton-form-actions {
    display: flex;
    justify-content: flex-end;
    gap: ${props => props.theme.spacing[2]};
    margin-top: ${props => props.theme.spacing[4]};
    
    .skeleton-button {
      height: ${props => props.theme.spacing[7]};
      width: ${props => props.buttonWidth || '120px'};
      background: linear-gradient(
        to right,
        ${props => props.theme.colors.border.light} 8%,
        ${props => props.theme.colors.border.lighter} 18%,
        ${props => props.theme.colors.border.light} 33%
      );
      background-size: 800px 104px;
      animation: ${shimmer} 1.5s linear infinite;
      border-radius: ${props => props.theme.borderRadius.md};
    }
  }
`;

// Компонент SkeletonForm
const SkeletonForm = ({
  rows = 3,
  gap,
  labelWidth,
  buttonWidth,
  className = '',
  ...props
}) => {
  return (
    <SkeletonFormContainer
      gap={gap}
      labelWidth={labelWidth}
      buttonWidth={buttonWidth}
      className={`${className} skeleton-form`}
      {...props}
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div key={`row-${index}`} className="skeleton-form-row">
          <div className="skeleton-label" />
          <div className="skeleton-input" />
        </div>
      ))}
      
      <div className="skeleton-form-actions">
        <div className="skeleton-button" />
        <div className="skeleton-button" />
      </div>
    </SkeletonFormContainer>
  );
};

// Пропп-types для SkeletonForm
SkeletonForm.propTypes = {
  rows: PropTypes.number,
  gap: PropTypes.string,
  labelWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  buttonWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
};

// Экспорт компонентов
export {
  Skeleton,
  SkeletonList as SkeletonListComponent,
  SkeletonTable as SkeletonTableComponent,
  SkeletonForm as SkeletonFormComponent,
};