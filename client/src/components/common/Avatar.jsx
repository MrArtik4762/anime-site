import React, { useState, useRef, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { styled } from 'styled-components';
import { useResponsive } from './Responsive';

// Стилизованный компонент для аватара
const StyledAvatar = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: ${props => props.theme.borderRadius.full};
  background-color: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.textSecondary};
  font-weight: ${props => props.theme.fontWeights.medium};
  font-size: ${props => props.theme.fontSizes.lg};
  transition: all ${props => props.theme.transitions.fast};
  
  ${props => props.size === 'small' && `
    width: ${props => props.theme.sizes.avatarSizeSmall};
    height: ${props => props.theme.sizes.avatarSizeSmall};
    font-size: ${props => props.theme.fontSizes.md};
  `}
  
  ${props => props.size === 'medium' && `
    width: ${props => props.theme.sizes.avatarSizeMedium};
    height: ${props => props.theme.sizes.avatarSizeMedium};
    font-size: ${props => props.theme.fontSizes.lg};
  `}
  
  ${props => props.size === 'large' && `
    width: ${props => props.theme.sizes.avatarSizeLarge};
    height: ${props => props.theme.sizes.avatarSizeLarge};
    font-size: ${props => props.theme.fontSizes.xl};
  `}
  
  ${props => props.size === 'xlarge' && `
    width: ${props => props.theme.sizes.avatarSizeXLarge};
    height: ${props => props.theme.sizes.avatarSizeXLarge};
    font-size: ${props => props.theme.fontSizes.xxl};
  `}
  
  ${props => props.variant === 'circle' && `
    border-radius: ${props => props.theme.borderRadius.full};
  `}
  
  ${props => props.variant === 'square' && `
    border-radius: ${props => props.theme.borderRadius.md};
  `}
  
  ${props => props.variant === 'rounded' && `
    border-radius: ${props => props.theme.borderRadius.lg};
  `}
  
  ${props => props.src && `
    background-image: url(${props.src});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  `}
  
  ${props => props.status && `
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      right: 0;
      width: ${props => props.theme.sizes.avatarStatusSize};
      height: ${props => props.theme.sizes.avatarStatusSize};
      border-radius: ${props => props.theme.borderRadius.full};
      border: 2px solid ${props => props.theme.colors.background};
      transition: all ${props => props.theme.transitions.fast};
    }
  `}
  
  ${props => props.status === 'online' && `
    &::after {
      background-color: ${props => props.theme.colors.success};
    }
  `}
  
  ${props => props.status === 'offline' && `
    &::after {
      background-color: ${props => props.theme.colors.textSecondary};
    }
  `}
  
  ${props => props.status === 'away' && `
    &::after {
      background-color: ${props => props.theme.colors.warning};
    }
  `}
  
  ${props => props.status === 'busy' && `
    &::after {
      background-color: ${props => props.theme.colors.error};
    }
  `}
  
  ${props => props.status === 'dnd' && `
    &::after {
      background-color: ${props => props.theme.colors.error};
    }
  `}
  
  ${props => props.onClick && `
    cursor: pointer;
    
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    &:active {
      transform: scale(0.98);
    }
  `}
  
  ${props => props.disabled && `
    opacity: 0.5;
    cursor: not-allowed;
  `}
  
  ${props => props.loading && `
    animation: pulse 1.5s ease-in-out infinite;
  `}
  
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    ${props => props.size === 'small' && `
      width: ${props => props.theme.sizes.avatarSizeSmallMobile};
      height: ${props => props.theme.sizes.avatarSizeSmallMobile};
      font-size: ${props => props.theme.fontSizes.sm};
    `}
    
    ${props => props.size === 'medium' && `
      width: ${props => props.theme.sizes.avatarSizeMediumMobile};
      height: ${props => props.theme.sizes.avatarSizeMediumMobile};
      font-size: ${props => props.theme.fontSizes.md};
    `}
    
    ${props => props.size === 'large' && `
      width: ${props => props.theme.sizes.avatarSizeLargeMobile};
      height: ${props => props.theme.sizes.avatarSizeLargeMobile};
      font-size: ${props => props.theme.fontSizes.lg};
    `}
    
    ${props => props.size === 'xlarge' && `
      width: ${props => props.theme.sizes.avatarSizeXLargeMobile};
      height: ${props => props.theme.sizes.avatarSizeXLargeMobile};
      font-size: ${props => props.theme.fontSizes.xl};
    `}
  }
`;

// Стилизованный компонент для группы аватаров
const AvatarGroup = styled.div`
  display: flex;
  align-items: center;
  
  .avatar {
    border: 2px solid ${props => props.theme.colors.background};
    margin-left: -${props => props.theme.spacing.xsmall};
    transition: all ${props => props.theme.transitions.fast};
    
    &:hover {
      z-index: 1;
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    &:first-child {
      margin-left: 0;
    }
  }
`;

// Основной компонент Avatar
export const Avatar = memo(({
  src,
  alt,
  name,
  size = 'medium',
  variant = 'circle',
  status,
  disabled = false,
  loading = false,
  onClick,
  className,
  style,
  ...props
}) => {
  const { isMobile } = useResponsive();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const avatarRef = useRef(null);
  
  // Обработка ошибок загрузки изображения
  const handleError = () => {
    setImageError(true);
  };
  
  // Об успешной загрузке изображения
  const handleLoad = () => {
    setImageLoaded(true);
  };
  
  // Получение initials из имени
  const getInitials = (name) => {
    if (!name) return '';
    
    const words = name.split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return words[0].charAt(0).toUpperCase() + words[words.length - 1].charAt(0).toUpperCase();
  };
  
  // Генерация цвета на основе имени
  const generateColor = (name) => {
    if (!name) return '#6b7280';
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };
  
  // Отображение контента аватара
  const renderAvatarContent = () => {
    if (src && !imageError) {
      return (
        <img
          src={src}
          alt={alt}
          onError={handleError}
          onLoad={handleLoad}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: imageLoaded ? 'block' : 'none'
          }}
        />
      );
    }
    
    if (name) {
      const initials = getInitials(name);
      const color = generateColor(name);
      
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: color,
            color: 'white'
          }}
        >
          {initials}
        </div>
      );
    }
    
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ?
      </div>
    );
  };
  
  return (
    <StyledAvatar
      ref={avatarRef}
      size={size}
      variant={variant}
      src={src && !imageError ? src : undefined}
      status={status}
      disabled={disabled}
      loading={loading}
      onClick={onClick}
      className={className}
      style={style}
      {...props}
    >
      {renderAvatarContent()}
    </StyledAvatar>
  );
});

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  variant: PropTypes.oneOf(['circle', 'square', 'rounded']),
  status: PropTypes.oneOf(['online', 'offline', 'away', 'busy', 'dnd']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для группы аватаров
export const AvatarGroupComponent = memo(({
  avatars = [],
  maxAvatars = 5,
  size = 'medium',
  variant = 'circle',
  showTooltip = true,
  className,
  style,
  ...props
}) => {
  const { isMobile } = useResponsive();
  
  // Ограничиваем количество отображаемых аватаров
  const displayAvatars = avatars.slice(0, maxAvatars);
  const remainingCount = avatars.length - maxAvatars;
  
  return (
    <AvatarGroup className={className} style={style} {...props}>
      {displayAvatars.map((avatar, index) => (
        <Avatar
          key={avatar.id || index}
          src={avatar.src}
          alt={avatar.alt}
          name={avatar.name}
          size={size}
          variant={variant}
          status={avatar.status}
          disabled={avatar.disabled}
          loading={avatar.loading}
          onClick={avatar.onClick}
          style={{
            zIndex: displayAvatars.length - index,
            marginLeft: index > 0 ? `-${isMobile ? '6px' : '8px'}` : '0'
          }}
        />
      ))}
      
      {remainingCount > 0 && (
        <Avatar
          size={size}
          variant={variant}
          style={{
            backgroundColor: `${props.theme.colors.backgroundSecondary}80`,
            color: props.theme.colors.text,
            marginLeft: `-${isMobile ? '6px' : '8px'}`,
            border: `2px solid ${props.theme.colors.background}`,
            zIndex: 0
          }}
        >
          +{remainingCount}
        </Avatar>
      )}
    </AvatarGroup>
  );
});

AvatarGroupComponent.propTypes = {
  avatars: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      src: PropTypes.string,
      alt: PropTypes.string,
      name: PropTypes.string,
      status: PropTypes.oneOf(['online', 'offline', 'away', 'busy', 'dnd']),
      disabled: PropTypes.bool,
      loading: PropTypes.bool,
      onClick: PropTypes.func
    })
  ),
  maxAvatars: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  variant: PropTypes.oneOf(['circle', 'square', 'rounded']),
  showTooltip: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};

// Компонент для аватара с градиентом
export const GradientAvatar = memo(({
  colors = ['#6366f1', '#8b5cf6'],
  name,
  size = 'medium',
  variant = 'circle',
  ...props
}) => {
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <Avatar
      size={size}
      variant={variant}
      style={{
        background: `linear-gradient(135deg, ${colors.join(', ')})`,
        ...props.style
      }}
      {...props}
    >
      {name ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      ) : null}
    </Avatar>
  );
});

GradientAvatar.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string),
  name: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  variant: PropTypes.oneOf(['circle', 'square', 'rounded']),
  ...Avatar.propTypes
};

// Хук для управления состоянием аватара
export const useAvatar = (initialState = {}) => {
  const [state, setState] = useState({
    src: initialState.src || '',
    alt: initialState.alt || '',
    name: initialState.name || '',
    size: initialState.size || 'medium',
    variant: initialState.variant || 'circle',
    status: initialState.status || null,
    disabled: initialState.disabled || false,
    loading: initialState.loading || false,
    ...initialState
  });
  
  const updateAvatar = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };
  
  const resetAvatar = () => {
    setState(initialState);
  };
  
  return {
    ...state,
    updateAvatar,
    resetAvatar,
    avatarProps: {
      src: state.src,
      alt: state.alt,
      name: state.name,
      size: state.size,
      variant: state.variant,
      status: state.status,
      disabled: state.disabled,
      loading: state.loading,
      onClick: state.onClick
    }
  };
};

export default Avatar;