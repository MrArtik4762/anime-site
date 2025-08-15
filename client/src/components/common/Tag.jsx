import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { styled } from 'styled-components';

// Стилизованный контейнер для тега
const TagContainer = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xxsmall};
  padding: ${props => {
    if (props.size === 'small') return `2px ${props.theme.spacing.xxsmall}`;
    if (props.size === 'large') return `4px ${props.theme.spacing.xsmall}`;
    return `3px ${props.theme.spacing.xsmall}`;
  }};
  background-color: ${props => {
    if (props.variant === 'primary') return props.theme.colors.primary;
    if (props.variant === 'secondary') return props.theme.colors.secondary;
    if (props.variant === 'success') return props.theme.colors.success;
    if (props.variant === 'warning') return props.theme.colors.warning;
    if (props.variant === 'error') return props.theme.colors.error;
    if (props.variant === 'info') return props.theme.colors.info;
    if (props.variant === 'dark') return props.theme.colors.dark;
    return props.theme.colors.border;
  }};
  color: ${props => {
    if (props.variant === 'primary' || props.variant === 'secondary' || 
        props.variant === 'dark' || props.variant === 'info') {
      return props.theme.colors.text;
    }
    return props.theme.colors.textSecondary;
  }};
  border-radius: ${props => {
    if (props.rounded === 'full') return '999px';
    if (props.rounded === 'small') return props.theme.border.radius.sm;
    return props.theme.border.radius.md;
  }};
  font-size: ${props => {
    if (props.size === 'small') return props.theme.fontSizes.xs;
    if (props.size === 'large') return props.theme.fontSizes.sm;
    return props.theme.fontSizes.xs;
  }};
  font-weight: ${props => {
    if (props.bold) return props.theme.fontWeights.semibold;
    return props.theme.fontWeights.normal;
  }};
  line-height: 1.2;
  text-transform: ${props => {
    if (props.uppercase) return 'uppercase';
    if (props.lowercase) return 'lowercase';
    return 'none';
  }};
  letter-spacing: ${props => {
    if (props.uppercase) return '0.5px';
    return 'normal';
  }};
  border: ${props => props.outlined ? `1px solid ${props.theme.colors.border}` : 'none'};
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: all ${props => props.theme.transitions.fast} ease;
  user-select: none;
  
  &:hover {
    ${props => props.clickable && `
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    `}
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary};
  }
  
  ${props => props.size === 'small' && `
    padding: 2px ${props.theme.spacing.xxsmall};
    font-size: ${props.theme.fontSizes.xs};
  `}
  
  ${props => props.size === 'large' && `
    padding: 4px ${props.theme.spacing.xsmall};
    font-size: ${props.theme.fontSizes.sm};
  `}
  
  ${props => props.disabled && `
    opacity: 0.6;
    cursor: not-allowed;
  `}
  
  ${props => props.variant === 'gradient' && `
    background: linear-gradient(135deg, ${props.theme.colors.primary} 0%, ${props.theme.colors.secondary} 100%);
    color: ${props.theme.colors.text};
  `}
  
  ${props => props.variant === 'outline' && `
    background-color: transparent;
    border: 1px solid ${props.theme.colors.border};
    color: ${props.theme.colors.textSecondary};
  `}
  
  ${props => props.variant === 'ghost' && `
    background-color: transparent;
    border: 1px solid transparent;
    color: ${props.theme.colors.textSecondary};
  `}
  
  ${props => props.variant === 'elevated' && `
    background-color: ${props.theme.colors.surface};
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    color: ${props.theme.colors.text};
  `}
  
  ${props => props.variant === 'filled' && `
    background-color: ${props.theme.colors.text};
    color: ${props.theme.colors.surface};
  `}
`;

// Стилизованный иконка тега
const TagIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => {
    if (props.size === 'small') return props.theme.iconSizes.xs;
    if (props.size === 'large') return props.theme.iconSizes.sm;
    return props.theme.iconSizes.xs;
  }};
  color: ${props => {
    if (props.variant === 'primary' || props.variant === 'secondary' || 
        props.variant === 'dark' || props.variant === 'info' || 
        props.variant === 'gradient' || props.variant === 'filled') {
      return props.theme.colors.text;
    }
    return props.theme.colors.textSecondary;
  }};
`;

// Стилизованный текст тега
const TagText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: ${props => props.maxWidth ? `${props.maxWidth}px` : 'none'};
`;

// Стилизованная кнопка удаления тега
const TagRemoveButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${props => {
    if (props.size === 'small') return '16px';
    if (props.size === 'large') return '20px';
    return '18px';
  }};
  height: ${props => {
    if (props.size === 'small') return '16px';
    if (props.size === 'large') return '20px';
    return '18px';
  }};
  border: none;
  background: none;
  color: ${props => {
    if (props.variant === 'primary' || props.variant === 'secondary' || 
        props.variant === 'dark' || props.variant === 'info' || 
        props.variant === 'gradient' || props.variant === 'filled') {
      return 'rgba(255, 255, 255, 0.7)';
    }
    return 'rgba(0, 0, 0, 0.5)';
  }};
  border-radius: 50%;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast} ease;
  font-size: ${props => {
    if (props.size === 'small') return '10px';
    if (props.size === 'large') return '12px';
    return '11px';
  }};
  line-height: 1;
  padding: 0;
  margin: 0;
  flex-shrink: 0;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
    color: ${props => {
      if (props.variant === 'primary' || props.variant === 'secondary' || 
          props.variant === 'dark' || props.variant === 'info' || 
          props.variant === 'gradient' || props.variant === 'filled') {
        return 'rgba(255, 255, 255, 1)';
      }
      return 'rgba(0, 0, 0, 0.8)';
    }};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary};
  }
  
  ${props => props.disabled && `
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      background-color: transparent;
    }
  `}
`;

// Основной компонент Tag
export const Tag = memo(({
  icon,
  text,
  size = 'medium',
  variant = 'primary',
  rounded = 'medium',
  bold = false,
  uppercase = false,
  lowercase = false,
  outlined = false,
  clickable = false,
  disabled = false,
  removable = false,
  onRemove,
  className,
  style,
  maxWidth,
  ...props
}) => {
  const handleRemove = (e) => {
    e.stopPropagation();
    if (disabled) return;
    if (onRemove) {
      onRemove();
    }
  };
  
  return (
    <TagContainer
      size={size}
      variant={variant}
      rounded={rounded}
      bold={bold}
      uppercase={uppercase}
      lowercase={lowercase}
      outlined={outlined}
      clickable={clickable}
      disabled={disabled}
      className={className}
      style={style}
      maxWidth={maxWidth}
      {...props}
    >
      {icon && (
        <TagIcon size={size} variant={variant}>
          {icon}
        </TagIcon>
      )}
      <TagText maxWidth={maxWidth}>
        {text}
      </TagText>
      {removable && !disabled && (
        <TagRemoveButton
          size={size}
          variant={variant}
          onClick={handleRemove}
          aria-label="Удалить тег"
          disabled={disabled}
        >
          ×
        </TagRemoveButton>
      )}
    </TagContainer>
  );
});

Tag.propTypes = {
  icon: PropTypes.node,
  text: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'info', 'dark', 'gradient', 'outline', 'ghost', 'elevated', 'filled']),
  rounded: PropTypes.oneOf(['small', 'medium', 'full']),
  bold: PropTypes.bool,
  uppercase: PropTypes.bool,
  lowercase: PropTypes.bool,
  outlined: PropTypes.bool,
  clickable: PropTypes.bool,
  disabled: PropTypes.bool,
  removable: PropTypes.bool,
  onRemove: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  maxWidth: PropTypes.number,
};

// Компонент для группы тегов
export const TagGroup = memo(({
  tags,
  size = 'medium',
  variant = 'primary',
  spacing = 'small',
  maxTags,
  showMore,
  onTagClick,
  onTagRemove,
  className,
  style,
  ...props
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const displayedTags = expanded || !maxTags ? tags : tags.slice(0, maxTags);
  const remainingCount = tags.length - maxTags;
  
  const handleTagClick = (tag, index) => {
    if (onTagClick) {
      onTagClick(tag, index);
    }
  };
  
  const handleTagRemove = (tag, index) => {
    if (onTagRemove) {
      onTagRemove(tag, index);
    }
  };
  
  const handleShowMore = () => {
    setExpanded(!expanded);
  };
  
  return (
    <div className={className} style={style} {...props}>
      {displayedTags.map((tag, index) => (
        <React.Fragment key={index}>
          <Tag
            size={size}
            variant={variant}
            text={tag.text}
            icon={tag.icon}
            removable={tag.removable}
            clickable={tag.clickable}
            disabled={tag.disabled}
            onRemove={() => handleTagRemove(tag, index)}
            onClick={() => handleTagClick(tag, index)}
            style={{ marginRight: spacing === 'small' ? '4px' : spacing === 'medium' ? '8px' : '12px' }}
          />
          {index < displayedTags.length - 1 && (
            <span style={{ marginRight: spacing === 'small' ? '4px' : spacing === 'medium' ? '8px' : '12px' }}>
              {spacing === 'small' ? '•' : spacing === 'medium' ? '•' : '•'}
            </span>
          )}
        </React.Fragment>
      ))}
      
      {maxTags && tags.length > maxTags && (
        <Tag
          size={size}
          variant="outline"
          clickable
          text={expanded ? 'Скрыть' : `+${remainingCount}`}
          onClick={handleShowMore}
        />
      )}
    </div>
  );
});

TagGroup.propTypes = {
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      icon: PropTypes.node,
      removable: PropTypes.bool,
      clickable: PropTypes.bool,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'info', 'dark', 'gradient', 'outline', 'ghost', 'elevated', 'filled']),
  spacing: PropTypes.oneOf(['small', 'medium', 'large']),
  maxTags: PropTypes.number,
  showMore: PropTypes.bool,
  onTagClick: PropTypes.func,
  onTagRemove: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для облачка тегов
export const TagCloud = memo(({
  tags,
  size = 'medium',
  variant = 'primary',
  minSize = 12,
  maxSize = 24,
  weightFactor = 1,
  shuffle = false,
  onTagClick,
  className,
  style,
  ...props
}) => {
  const calculateFontSize = (count, min, max, factor) => {
    const minCount = Math.min(...tags.map(tag => tag.count));
    const maxCount = Math.max(...tags.map(tag => tag.count));
    const normalizedCount = (count - minCount) / (maxCount - minCount || 1);
    return min + normalizedCount * (max - min) * factor;
  };
  
  const processedTags = tags.map((tag, index) => ({
    ...tag,
    fontSize: calculateFontSize(tag.count, minSize, maxSize, weightFactor),
    order: shuffle ? Math.random() : index,
  })).sort((a, b) => a.order - b.order);
  
  return (
    <div className={className} style={style} {...props}>
      {processedTags.map((tag, index) => (
        <Tag
          key={index}
          size={size}
          variant={variant}
          text={tag.text}
          icon={tag.icon}
          clickable={tag.clickable}
          disabled={tag.disabled}
          onClick={() => onTagClick && onTagClick(tag, index)}
          style={{
            fontSize: `${tag.fontSize}px`,
            margin: '2px',
            display: 'inline-block',
          }}
        />
      ))}
    </div>
  );
});

TagCloud.propTypes = {
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
      icon: PropTypes.node,
      clickable: PropTypes.bool,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'info', 'dark', 'gradient', 'outline', 'ghost', 'elevated', 'filled']),
  minSize: PropTypes.number,
  maxSize: PropTypes.number,
  weightFactor: PropTypes.number,
  shuffle: PropTypes.bool,
  onTagClick: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для фильтрованных тегов
export const FilterTag = memo(({
  text,
  active = false,
  size = 'medium',
  variant = 'primary',
  removable = false,
  onToggle,
  onRemove,
  className,
  style,
  ...props
}) => {
  const handleToggle = () => {
    if (onToggle) {
      onToggle(!active);
    }
  };
  
  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };
  
  return (
    <Tag
      size={size}
      variant={active ? variant : 'outline'}
      text={text}
      rounded="full"
      clickable
      disabled={active && removable}
      removable={removable}
      onRemove={handleRemove}
      onClick={handleToggle}
      className={className}
      style={style}
      {...props}
    />
  );
});

FilterTag.propTypes = {
  text: PropTypes.string.isRequired,
  active: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'info', 'dark', 'gradient']),
  removable: PropTypes.bool,
  onToggle: PropTypes.func,
  onRemove: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Tag;