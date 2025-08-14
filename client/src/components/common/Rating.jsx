import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Контейнер для рейтинга
const RatingContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.gap || props.theme.spacing[1]};
  
  .star {
    cursor: ${props => props.disabled ? 'default' : 'pointer'};
    transition: ${props => props.theme.transitions.normal};
    
    &:hover {
      transform: ${props => props.disabled ? 'none' : 'scale(1.1)'};
    }
    
    ${props => props.size === 'small' && `
      width: 16px;
      height: 16px;
    `}
    
    ${props => props.size === 'medium' && `
      width: 20px;
      height: 20px;
    `}
    
    ${props => props.size === 'large' && `
      width: 24px;
      height: 24px;
    `}
    
    ${props => props.readonly && `
      cursor: default;
    `}
  }
`;

// Заполненная звезда
const StarFilled = styled.svg`
  fill: ${props => props.theme.colors.warning};
  stroke: ${props => props.theme.colors.warning};
  stroke-width: 1;
`;

// Пустая звезда
const StarEmpty = styled.svg`
  fill: ${props => props.theme.colors.border.light};
  stroke: ${props => props.theme.colors.border.light};
  stroke-width: 1;
`;

// Полузаполненная звезда
const StarHalf = styled.svg`
  fill: ${props => props.theme.colors.warning};
  stroke: ${props => props.theme.colors.warning};
  stroke-width: 1;
  
  .half {
    fill: ${props => props.theme.colors.border.light};
  }
`;

// Компонент Star
const Star = ({
  filled,
  half,
  size,
  disabled,
  readonly,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className = '',
  ...props
}) => {
  if (half) {
    return (
      <StarHalf
        size={size}
        disabled={disabled}
        readonly={readonly}
        className={`star half ${className}`}
        viewBox="0 0 24 24"
        {...props}
      >
        <defs>
          <linearGradient id="half-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor={props.theme.colors.warning} />
            <stop offset="50%" stopColor={props.theme.colors.border.light} />
          </linearGradient>
        </defs>
        <path
          className="half"
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </StarHalf>
    );
  }
  
  if (filled) {
    return (
      <StarFilled
        size={size}
        disabled={disabled}
        readonly={readonly}
        className={`star ${className}`}
        viewBox="0 0 24 24"
        {...props}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </StarFilled>
    );
  }
  
  return (
    <StarEmpty
      size={size}
      disabled={disabled}
      readonly={readonly}
      className={`star ${className}`}
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </StarEmpty>
  );
};

// Компонент Rating
const Rating = ({
  value = 0,
  max = 5,
  size = 'medium',
  disabled = false,
  readonly = false,
  showValue = false,
  precision = 1,
  onChange,
  className = '',
  ...props
}) => {
  const [hoverValue, setHoverValue] = useState(0);
  
  const handleClick = (rating) => {
    if (disabled || readonly || !onChange) return;
    onChange(rating);
  };
  
  const handleMouseEnter = (rating) => {
    if (disabled || readonly) return;
    setHoverValue(rating);
  };
  
  const handleMouseLeave = () => {
    if (disabled || readonly) return;
    setHoverValue(0);
  };
  
  const displayValue = hoverValue || value;
  const stars = [];
  
  for (let i = 1; i <= max; i++) {
    let filled = false;
    let half = false;
    
    if (displayValue >= i) {
      filled = true;
    } else if (displayValue > i - 1 && displayValue < i) {
      half = true;
    }
    
    stars.push(
      <Star
        key={i}
        filled={filled}
        half={half}
        size={size}
        disabled={disabled}
        readonly={readonly}
        onClick={() => handleClick(i)}
        onMouseEnter={() => handleMouseEnter(i)}
        onMouseLeave={handleMouseLeave}
      />
    );
  }
  
  return (
    <RatingContainer
      size={size}
      disabled={disabled}
      readonly={readonly}
      className={`${className} rating ${size}${disabled ? ' disabled' : ''}${readonly ? ' readonly' : ''}`}
      {...props}
    >
      {stars}
      {showValue && (
        <span className="rating-value">
          {value.toFixed(precision)}
        </span>
      )}
    </RatingContainer>
  );
};

// Пропс-types для TypeScript
Rating.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  showValue: PropTypes.bool,
  precision: PropTypes.number,
  onChange: PropTypes.func,
  className: PropTypes.string,
};

// Компонент RatingWithLabel для рейтинга с меткой
const RatingWithLabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  
  .label {
    font-size: ${props => props.theme.typography.fontSize.sm[0]};
    color: ${props => props.theme.colors.text.tertiary};
  }
  
  .rating-container {
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing[2]};
  }
  
  .rating-value {
    font-size: ${props => props.theme.typography.fontSize.lg[0]};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    color: ${props => props.theme.colors.text.primary};
    min-width: ${props => props.showValue ? '40px' : 'auto'};
    text-align: ${props => props.showValue ? 'right' : 'left'};
  }
`;

// Компонент RatingWithLabel
const RatingWithLabel = ({
  value = 0,
  max = 5,
  size = 'medium',
  disabled = false,
  readonly = false,
  showValue = true,
  precision = 1,
  onChange,
  label,
  className = '',
  ...props
}) => {
  return (
    <RatingWithLabelContainer
      showValue={showValue}
      className={`${className} rating-with-label`}
      {...props}
    >
      {label && <div className="label">{label}</div>}
      <div className="rating-container">
        <Rating
          value={value}
          max={max}
          size={size}
          disabled={disabled}
          readonly={readonly}
          showValue={showValue}
          precision={precision}
          onChange={onChange}
        />
        {showValue && (
          <div className="rating-value">
            {value.toFixed(precision)}
          </div>
        )}
      </div>
    </RatingWithLabelContainer>
  );
};

// Пропп-types для RatingWithLabel
RatingWithLabel.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  showValue: PropTypes.bool,
  precision: PropTypes.number,
  onChange: PropTypes.func,
  label: PropTypes.string,
  className: PropTypes.string,
};

// Компонент RatingGroup для группы рейтингов
const RatingGroupContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[3]};
  
  .rating-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${props => props.theme.spacing[2]} 0;
    border-bottom: 1px solid ${props => props.theme.colors.border.light};
    
    &:last-child {
      border-bottom: none;
    }
    
    .rating-label {
      font-size: ${props => props.theme.typography.fontSize.base[0]};
      color: ${props => props.theme.colors.text.primary};
      flex: 1;
    }
    
    .rating-value {
      font-size: ${props => props.theme.typography.fontSize.sm[0]};
      color: ${props => props.theme.colors.text.tertiary};
      margin-right: ${props => props.theme.spacing[3]};
    }
  }
`;

// Компонент RatingGroup
const RatingGroup = ({
  ratings,
  size = 'medium',
  disabled = false,
  readonly = true,
  showValue = true,
  precision = 1,
  className = '',
  ...props
}) => {
  return (
    <RatingGroupContainer className={`${className} rating-group`} {...props}>
      {ratings.map((rating, index) => (
        <div key={index} className="rating-item">
          <div className="rating-label">{rating.label}</div>
          <div className="rating-value">
            {rating.value.toFixed(precision)}
          </div>
          <Rating
            value={rating.value}
            max={rating.max || 5}
            size={size}
            disabled={disabled}
            readonly={readonly}
            showValue={false}
            precision={precision}
          />
        </div>
      ))}
    </RatingGroupContainer>
  );
};

// Пропп-types для RatingGroup
RatingGroup.propTypes = {
  ratings: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      max: PropTypes.number,
    })
  ).isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  showValue: PropTypes.bool,
  precision: PropTypes.number,
  className: PropTypes.string,
};

// Компонент StarRating для обратной совместимости
const StarRating = (props) => {
  return <Rating {...props} />;
};

// Пропп-types для StarRating
StarRating.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  readonly: PropTypes.bool,
  showValue: PropTypes.bool,
  precision: PropTypes.number,
  onChange: PropTypes.func,
  className: PropTypes.string,
};

// Экспорт компонентов
export {
  Rating,
  RatingWithLabel as RatingWithLabelComponent,
  RatingGroup as RatingGroupComponent,
  StarRating,
};