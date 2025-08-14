import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Контейнер для тега
const TagContainer = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${props => props.padding || `${props.theme.spacing[1]} ${props.theme.spacing[2]}`};
  border-radius: ${props => props.shape === 'pill' ? props.theme.borderRadius.full : props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.xs[0]};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  line-height: 1;
  white-space: nowrap;
  text-transform: ${props => props.uppercase ? 'uppercase' : 'none'};
  letter-spacing: ${props => props.uppercase ? '0.5px' : 'normal'};
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: ${props => props.theme.transitions.normal};
  user-select: none;
  
  // Цвета
  ${props => {
    if (props.color) {
      return `
        background-color: ${props.theme.colors[props.color] + '20'};
        color: ${props.theme.colors[props.color]};
        border: 1px solid ${props.theme.colors[props.color] + '40'};
      `;
    }
    
    switch (props.variant) {
      case 'primary':
        return `
          background-color: ${props.theme.colors.primary + '10'};
          color: ${props.theme.colors.primary};
          border: 1px solid ${props.theme.colors.primary + '30'};
        `;
      case 'secondary':
        return `
          background-color: ${props.theme.colors.border.light};
          color: ${props.theme.colors.text.primary};
          border: 1px solid ${props.theme.colors.border.medium};
        `;
      case 'success':
        return `
          background-color: ${props.theme.colors.success + '10'};
          color: ${props.theme.colors.success};
          border: 1px solid ${props.theme.colors.success + '30'};
        `;
      case 'danger':
        return `
          background-color: ${props.theme.colors.danger + '10'};
          color: ${props.theme.colors.danger};
          border: 1px solid ${props.theme.colors.danger + '30'};
        `;
      case 'warning':
        return `
          background-color: ${props.theme.colors.warning + '10'};
          color: ${props.theme.colors.warning};
          border: 1px solid ${props.theme.colors.warning + '30'};
        `;
      case 'info':
        return `
          background-color: ${props.theme.colors.info + '10'};
          color: ${props.theme.colors.info};
          border: 1px solid ${props.theme.colors.info + '30'};
        `;
      default:
        return `
          background-color: ${props.theme.colors.border.light};
          color: ${props.theme.colors.text.primary};
          border: 1px solid ${props.theme.colors.border.medium};
        `;
    }
  }}
  
  // Размеры
  ${props => {
    switch (props.size) {
      case 'small':
        return `
          padding: ${props.theme.spacing[0.5]} ${props.theme.spacing[1.5]};
          font-size: ${props.theme.typography.fontSize.xxs[0]};
        `;
      case 'large':
        return `
          padding: ${props.theme.spacing[1.5]} ${props.theme.spacing[3]};
          font-size: ${props.theme.typography.fontSize.sm[0]};
        `;
      default:
        return '';
    }
  }}
  
  // Состояния
  ${props => {
    if (props.disabled) {
      return `
        opacity: ${props.theme.opacity[50]};
        cursor: not-allowed;
      `;
    }
    
    if (props.clickable) {
      return `
        &:hover {
          opacity: ${props.theme.opacity[80]};
          transform: translateY(-1px);
        }
        
        &:active {
          transform: translateY(0);
        }
      `;
    }
    
    return '';
  }}
  
  // Границы
  ${props => {
    if (props.outlined) {
      return `
        background-color: transparent;
      `;
    }
    
    return '';
  }}
  
  // Растягивание
  ${props => {
    if (props.stretch) {
      return `
        width: 100%;
        justify-content: center;
      `;
    }
    
    return '';
  }}
`;

// Иконка в теге
const TagIcon = styled.span`
  margin-right: ${props => props.theme.spacing[1]};
  
  ${props => props.iconPosition === 'right' && `
    margin-right: 0;
    margin-left: ${props => props.theme.spacing[1]};
  `}
`;

// Кнопка удаления тега
const RemoveButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-left: ${props => props.theme.spacing[1]};
  padding: 0;
  color: ${props => {
    if (props.color) {
      return props.theme.colors[props.color];
    }
    
    switch (props.variant) {
      case 'primary':
        return props.theme.colors.primary;
      case 'secondary':
        return props.theme.colors.text.tertiary;
      case 'success':
        return props.theme.colors.success;
      case 'danger':
        return props.theme.colors.danger;
      case 'warning':
        return props.theme.colors.warning;
      case 'info':
        return props.theme.colors.info;
      default:
        return props.theme.colors.text.tertiary;
    }
  }};
  transition: ${props => props.theme.transitions.normal};
  
  &:hover {
    opacity: ${props => props.theme.opacity[70]};
  }
  
  &:focus {
    outline: none;
    
    &::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border: 1px solid ${props => props.theme.colors.primary};
      border-radius: ${props => props.theme.borderRadius.full};
    }
  }
`;

// Компонент Tag
const Tag = ({
  children,
  variant = 'secondary',
  color,
  size = 'medium',
  shape = 'default',
  outlined = false,
  uppercase = false,
  disabled = false,
  clickable = false,
  removable = false,
  onRemove,
  icon,
  iconPosition = 'left',
  stretch = false,
  className = '',
  ...props
}) => {
  return (
    <TagContainer
      variant={variant}
      color={color}
      size={size}
      shape={shape}
      outlined={outlined}
      uppercase={uppercase}
      disabled={disabled}
      clickable={clickable}
      removable={removable}
      stretch={stretch}
      className={`${className} tag ${variant}${color ? ` ${color}` : ''}${size ? ` ${size}` : ''}${shape ? ` ${shape}` : ''}${outlined ? ' outlined' : ''}${uppercase ? ' uppercase' : ''}${disabled ? ' disabled' : ''}${clickable ? ' clickable' : ''}${removable ? ' removable' : ''}${stretch ? ' stretch' : ''}`}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <TagIcon iconPosition={iconPosition}>
          {icon}
        </TagIcon>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && (
        <TagIcon iconPosition={iconPosition}>
          {icon}
        </TagIcon>
      )}
      
      {removable && (
        <RemoveButton
          variant={variant}
          color={color}
          onClick={onRemove}
          aria-label="Удалить тег"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </RemoveButton>
      )}
    </TagContainer>
  );
};

// Пропс-types для TypeScript
Tag.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info']),
  color: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  shape: PropTypes.oneOf(['default', 'pill']),
  outlined: PropTypes.bool,
  uppercase: PropTypes.bool,
  disabled: PropTypes.bool,
  clickable: PropTypes.bool,
  removable: PropTypes.bool,
  onRemove: PropTypes.func,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  stretch: PropTypes.bool,
  className: PropTypes.string,
};

// Компонент TagList для списка тегов
const TagListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.gap || props.theme.spacing[2]};
  
  .tag {
    margin: 0;
  }
`;

// Компонент TagList
const TagList = ({
  tags,
  gap,
  className = '',
  ...props
}) => {
  return (
    <TagListContainer
      gap={gap}
      className={`${className} tag-list`}
      {...props}
    >
      {tags.map((tag, index) => (
        <Tag
          key={index}
          {...tag}
        />
      ))}
    </TagListContainer>
  );
};

// Пропп-types для TagList
TagList.propTypes = {
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      children: PropTypes.node.isRequired,
      variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info']),
      color: PropTypes.string,
      size: PropTypes.oneOf(['small', 'medium', 'large']),
      shape: PropTypes.oneOf(['default', 'pill']),
      outlined: PropTypes.bool,
      uppercase: PropTypes.bool,
      disabled: PropTypes.bool,
      clickable: PropTypes.bool,
      removable: PropTypes.bool,
      onRemove: PropTypes.func,
      icon: PropTypes.node,
      iconPosition: PropTypes.oneOf(['left', 'right']),
      stretch: PropTypes.bool,
    })
  ).isRequired,
  gap: PropTypes.string,
  className: PropTypes.string,
};

// Компонент TagCloud для облака тегов
const TagCloudContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.gap || props.theme.spacing[2]};
  align-items: center;
  justify-content: center;
  
  .tag {
    transition: ${props => props.theme.transitions.normal};
    
    &:hover {
      transform: scale(1.05);
      z-index: 1;
    }
  }
`;

// Компонент TagCloud
const TagCloud = ({
  tags,
  gap,
  className = '',
  ...props
}) => {
  return (
    <TagCloudContainer
      gap={gap}
      className={`${className} tag-cloud`}
      {...props}
    >
      {tags.map((tag, index) => (
        <Tag
          key={index}
          {...tag}
        />
      ))}
    </TagCloudContainer>
  );
};

// Пропп-types для TagCloud
TagCloud.propTypes = {
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      children: PropTypes.node.isRequired,
      variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info']),
      color: PropTypes.string,
      size: PropTypes.oneOf(['small', 'medium', 'large']),
      shape: PropTypes.oneOf(['default', 'pill']),
      outlined: PropTypes.bool,
      uppercase: PropTypes.bool,
      disabled: PropTypes.bool,
      clickable: PropTypes.bool,
      removable: PropTypes.bool,
      onRemove: PropTypes.func,
      icon: PropTypes.node,
      iconPosition: PropTypes.oneOf(['left', 'right']),
      stretch: PropTypes.bool,
    })
  ).isRequired,
  gap: PropTypes.string,
  className: PropTypes.string,
};

// Компонент TagInput для ввода тегов
const TagInputContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[2]};
  border: 1px solid ${props => props.theme.colors.border.medium};
  border-radius: ${props => props.theme.borderRadius.md};
  min-height: ${props => props.theme.spacing[7]};
  align-items: center;
  
  &:focus-within {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
    
    &::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border: 2px solid ${props => props.theme.colors.primary};
      border-radius: ${props => props.theme.borderRadius.md};
    }
  }
  
  .tag {
    margin: 0;
  }
  
  .input {
    border: none;
    outline: none;
    flex: 1;
    min-width: 100px;
    background: transparent;
    font-size: ${props => props.theme.typography.fontSize.base[0]};
    color: ${props => props.theme.colors.text.primary};
    
    &::placeholder {
      color: ${props => props.theme.colors.text.tertiary};
    }
  }
`;

// Компонент TagInput
const TagInput = ({
  value,
  onChange,
  onRemove,
  onAdd,
  tags,
  placeholder = 'Добавить тег...',
  className = '',
  ...props
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tagValue = value.trim();
      if (tagValue) {
        onAdd(tagValue);
        onChange('');
      }
    }
  };
  
  const handleRemove = (index) => {
    onRemove(index);
  };
  
  return (
    <TagInputContainer className={`${className} tag-input`} {...props}>
      {tags.map((tag, index) => (
        <Tag
          key={index}
          removable
          onRemove={() => handleRemove(index)}
        >
          {tag}
        </Tag>
      ))}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="input"
      />
    </TagInputContainer>
  );
};

// Пропп-types для TagInput
TagInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

// Экспорт компонентов
export { Tag, TagList as TagListComponent, TagCloud as TagCloudComponent, TagInput };