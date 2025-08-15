import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { styled } from 'styled-components';

// Стилизованный контейнер для рейтинга
const RatingContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xsmall};
  
  ${props => props.size === 'small' && `
    gap: ${props.theme.spacing.xxsmall};
  `}
  
  ${props => props.size === 'large' && `
    gap: ${props.theme.spacing.small};
  `}
  
  ${props => props.vertical && `
    flex-direction: column;
    align-items: flex-start;
  `}
  
  ${props => props.disabled && `
    opacity: 0.6;
    cursor: not-allowed;
  `}
  
  ${props => props.readonly && `
    cursor: default;
  `}
`;

// Стилизованная звезда рейтинга
const Star = styled.button`
  background: none;
  border: none;
  cursor: ${props => props.disabled || props.readonly ? 'default' : 'pointer'};
  padding: 0;
  margin: 0;
  font-size: ${props => {
    if (props.size === 'small') return props.theme.iconSizes.sm;
    if (props.size === 'large') return props.theme.iconSizes.lg;
    return props.theme.iconSizes.md;
  }};
  color: ${props => {
    if (props.filled) return props.theme.colors.warning;
    if (props.hovered) return props.theme.colors.warning;
    return props.theme.colors.border;
  }};
  transition: all ${props => props.theme.transitions.fast} ease;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary};
  }
  
  ${props => props.size === 'small' && `
    font-size: ${props.theme.iconSizes.sm};
  `}
  
  ${props => props.size === 'large' && `
    font-size: ${props.theme.iconSizes.lg};
  `}
`;

// Стилизованный текст рейтинга
const RatingText = styled.span`
  font-size: ${props => {
    if (props.size === 'small') return props.theme.fontSizes.sm;
    if (props.size === 'large') return props.theme.fontSizes.lg;
    return props.theme.fontSizes.base;
  }};
  color: ${props => props.theme.colors.textSecondary};
  margin-left: ${props => props.theme.spacing.xsmall};
  
  ${props => props.size === 'small' && `
    font-size: ${props.theme.fontSizes.xs};
    margin-left: ${props.theme.spacing.xxsmall};
  `}
  
  ${props => props.size === 'large' && `
    font-size: ${props.theme.fontSizes.md};
    margin-left: ${props.theme.spacing.small};
  `}
  
  ${props => props.bold && `
    font-weight: ${props.theme.fontWeights.semibold};
    color: ${props.theme.colors.text};
  `}
  
  ${props => props.showCount && `
    font-weight: ${props.theme.fontWeights.semibold};
    color: ${props.theme.colors.text};
  `}
`;

// Стилизованный контейнер для прогресса рейтинга
const RatingProgress = styled.div`
  width: 100%;
  height: ${props => {
    if (props.size === 'small') return props.theme.sizes.progressHeightSmall;
    if (props.size === 'large') return props.theme.sizes.progressHeightLarge;
    return props.theme.sizes.progressHeight;
  }};
  background-color: ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.border.radius.sm};
  overflow: hidden;
  margin-top: ${props => props.theme.spacing.small};
  
  ${props => props.size === 'small' && `
    height: ${props.theme.sizes.progressHeightSmall};
    margin-top: ${props.theme.spacing.xsmall};
  `}
  
  ${props => props.size === 'large' && `
    height: ${props.theme.sizes.progressHeightLarge};
    margin-top: ${props.theme.spacing.medium};
  `}
`;

// Стилизованный заполнитель прогресса рейтинга
const RatingProgressFill = styled.div`
  height: 100%;
  background-color: ${props => props.theme.colors.warning};
  border-radius: ${props => props.theme.border.radius.sm};
  transition: width ${props => props.theme.transitions.medium} ease;
  
  ${props => props.size === 'small' && `
    height: ${props.theme.sizes.progressHeightSmall};
  `}
  
  ${props => props.size === 'large' && `
    height: ${props.theme.sizes.progressHeightLarge};
  `}
`;

// Основной компонент Rating
export const Rating = memo(({
  value = 0,
  max = 5,
  size = 'medium',
  readonly = false,
  disabled = false,
  showText = false,
  showProgress = false,
  precision = 0,
  onChange,
  className,
  style,
  ...props
}) => {
  const [hoveredValue, setHoveredValue] = useState(0);
  const displayValue = precision > 0 ? Math.round(value / precision) * precision : Math.round(value);
  
  const handleStarClick = (newValue) => {
    if (disabled || readonly) return;
    if (onChange) {
      onChange(newValue);
    }
  };
  
  const handleStarMouseEnter = (newValue) => {
    if (disabled || readonly) return;
    setHoveredValue(newValue);
  };
  
  const handleStarMouseLeave = () => {
    if (disabled || readonly) return;
    setHoveredValue(0);
  };
  
  const renderStars = () => {
    const stars = [];
    const displayHoverValue = hoveredValue || displayValue;
    
    for (let i = 1; i <= max; i++) {
      const filled = i <= displayHoverValue;
      const halfFilled = precision > 0 && i === Math.ceil(displayValue) && displayValue % 1 !== 0;
      
      stars.push(
        <Star
          key={i}
          size={size}
          filled={filled}
          hovered={hoveredValue >= i}
          disabled={disabled}
          readonly={readonly}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleStarMouseEnter(i)}
          onMouseLeave={handleStarMouseLeave}
          aria-label={`Оценка ${i} из ${max}`}
          aria-selected={i === displayValue}
          tabIndex={disabled || readonly ? -1 : 0}
        >
          {filled ? '★' : halfFilled ? '☆' : '☆'}
        </Star>
      );
    }
    
    return stars;
  };
  
  const getRatingText = () => {
    if (value === 0) return 'Нет оценок';
    if (value < 2) return 'Плохо';
    if (value < 3) return 'Удовлетворительно';
    if (value < 4) return 'Хорошо';
    return 'Отлично';
  };
  
  return (
    <RatingContainer
      size={size}
      disabled={disabled}
      readonly={readonly}
      vertical={props.vertical}
      className={className}
      style={style}
      {...props}
    >
      {renderStars()}
      {showText && (
        <RatingText size={size} bold>
          {value.toFixed(precision > 0 ? 1 : 0)} / {max}
        </RatingText>
      )}
      {showProgress && (
        <>
          <RatingProgress size={size}>
            <RatingProgressFill
              width={`${(value / max) * 100}%`}
              size={size}
            />
          </RatingProgress>
          <RatingText size={size} showCount>
            {value.toFixed(precision > 0 ? 1 : 0)} из {max} ({Math.round((value / max) * 100)}%)
          </RatingText>
        </>
      )}
    </RatingContainer>
  );
});

Rating.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  showText: PropTypes.bool,
  showProgress: PropTypes.bool,
  precision: PropTypes.number,
  onChange: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для рейтинга с полукруглыми звездами
export const HalfRating = memo(({
  value = 0,
  max = 5,
  size = 'medium',
  readonly = false,
  disabled = false,
  showText = false,
  onChange,
  className,
  style,
  ...props
}) => {
  const [hoveredValue, setHoveredValue] = useState(0);
  const displayValue = value;
  
  const handleStarClick = (newValue) => {
    if (disabled || readonly) return;
    if (onChange) {
      onChange(newValue);
    }
  };
  
  const handleStarMouseEnter = (newValue) => {
    if (disabled || readonly) return;
    setHoveredValue(newValue);
  };
  
  const handleStarMouseLeave = () => {
    if (disabled || readonly) return;
    setHoveredValue(0);
  };
  
  const renderStars = () => {
    const stars = [];
    const displayHoverValue = hoveredValue || displayValue;
    
    for (let i = 1; i <= max; i++) {
      const fullStar = i <= Math.floor(displayHoverValue);
      const halfStar = i === Math.ceil(displayHoverValue) && displayHoverValue % 1 !== 0;
      const emptyStar = i > Math.ceil(displayHoverValue);
      
      if (fullStar) {
        stars.push(
          <Star
            key={i}
            size={size}
            filled={true}
            disabled={disabled}
            readonly={readonly}
            onClick={() => handleStarClick(i)}
            onMouseEnter={() => handleStarMouseEnter(i)}
            onMouseLeave={handleStarMouseLeave}
            aria-label={`Полная оценка ${i} из ${max}`}
            aria-selected={i === Math.floor(displayValue)}
            tabIndex={disabled || readonly ? -1 : 0}
          >
            ★
          </Star>
        );
      } else if (halfStar) {
        stars.push(
          <Star
            key={i}
            size={size}
            filled={true}
            disabled={disabled}
            readonly={readonly}
            onClick={() => handleStarClick(i)}
            onMouseEnter={() => handleStarMouseEnter(i)}
            onMouseLeave={handleStarMouseLeave}
            aria-label={`Половина оценки ${i} из ${max}`}
            aria-selected={i === Math.ceil(displayValue)}
            tabIndex={disabled || readonly ? -1 : 0}
          >
            {hoveredValue > 0 ? '★' : '☆'}
          </Star>
        );
      } else {
        stars.push(
          <Star
            key={i}
            size={size}
            filled={false}
            disabled={disabled}
            readonly={readonly}
            onClick={() => handleStarClick(i)}
            onMouseEnter={() => handleStarMouseEnter(i)}
            onMouseLeave={handleStarMouseLeave}
            aria-label={`Пустая оценка ${i} из ${max}`}
            aria-selected={false}
            tabIndex={disabled || readonly ? -1 : 0}
          >
            ☆
          </Star>
        );
      }
    }
    
    return stars;
  };
  
  return (
    <RatingContainer
      size={size}
      disabled={disabled}
      readonly={readonly}
      className={className}
      style={style}
      {...props}
    >
      {renderStars()}
      {showText && (
        <RatingText size={size} bold>
          {value.toFixed(1)} / {max}
        </RatingText>
      )}
    </RatingContainer>
  );
});

HalfRating.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  showText: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для рейтинга с иконками вместо звезд
export const IconRating = memo(({
  value = 0,
  max = 5,
  size = 'medium',
  readonly = false,
  disabled = false,
  showText = false,
  icon = '❤️',
  emptyIcon = '🤍',
  onChange,
  className,
  style,
  ...props
}) => {
  const [hoveredValue, setHoveredValue] = useState(0);
  const displayValue = Math.round(value);
  
  const handleIconClick = (newValue) => {
    if (disabled || readonly) return;
    if (onChange) {
      onChange(newValue);
    }
  };
  
  const handleIconMouseEnter = (newValue) => {
    if (disabled || readonly) return;
    setHoveredValue(newValue);
  };
  
  const handleIconMouseLeave = () => {
    if (disabled || readonly) return;
    setHoveredValue(0);
  };
  
  const renderIcons = () => {
    const icons = [];
    const displayHoverValue = hoveredValue || displayValue;
    
    for (let i = 1; i <= max; i++) {
      const filled = i <= displayHoverValue;
      
      icons.push(
        <Star
          key={i}
          size={size}
          filled={filled}
          disabled={disabled}
          readonly={readonly}
          onClick={() => handleIconClick(i)}
          onMouseEnter={() => handleIconMouseEnter(i)}
          onMouseLeave={handleIconMouseLeave}
          aria-label={`Оценка ${i} из ${max}`}
          aria-selected={i === displayValue}
          tabIndex={disabled || readonly ? -1 : 0}
        >
          {filled ? icon : emptyIcon}
        </Star>
      );
    }
    
    return icons;
  };
  
  return (
    <RatingContainer
      size={size}
      disabled={disabled}
      readonly={readonly}
      className={className}
      style={style}
      {...props}
    >
      {renderIcons()}
      {showText && (
        <RatingText size={size} bold>
          {value} / {max}
        </RatingText>
      )}
    </RatingContainer>
  );
});

IconRating.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  showText: PropTypes.bool,
  icon: PropTypes.string,
  emptyIcon: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для рейтинга с процентами
export const PercentRating = memo(({
  value = 0,
  max = 100,
  size = 'medium',
  readonly = false,
  showText = true,
  showProgress = true,
  onChange,
  className,
  style,
  ...props
}) => {
  return (
    <div className={className} style={style} {...props}>
      {showProgress && (
        <RatingProgress size={size}>
          <RatingProgressFill
            width={`${value}%`}
            size={size}
          />
        </RatingProgress>
      )}
      {showText && (
        <RatingText size={size} bold showCount>
          {value}% ({value} из {max})
        </RatingText>
      )}
    </div>
  );
});

PercentRating.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  readonly: PropTypes.bool,
  showText: PropTypes.bool,
  showProgress: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Rating;