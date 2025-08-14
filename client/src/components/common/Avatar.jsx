import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Контейнер аватара
const AvatarContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.size === 'small' ? '32px' : props.size === 'medium' ? '48px' : '64px'};
  height: ${props => props.size === 'small' ? '32px' : props.size === 'medium' ? '48px' : '64px'};
  border-radius: ${props => props.shape === 'circle' ? '50%' : props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.border.light};
  overflow: hidden;
  cursor: ${props => props.onClick ? 'pointer' : 'default'};
  transition: ${props => props.theme.transitions.normal};
  
  &:hover {
    transform: ${props => props.onClick ? 'scale(1.05)' : 'none'};
    box-shadow: ${props => props.theme.shadow.md};
  }
`;

// Изображение аватара
const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: ${props => props.shape === 'circle' ? '50%' : props.theme.borderRadius.md};
`;

// Инициалы аватара
const AvatarInitials = styled.div`
  font-size: ${props => {
    if (props.size === 'small') return '12px';
    if (props.size === 'medium') return '18px';
    return '24px';
  }};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  line-height: 1;
`;

// Статус аватара
const AvatarStatus = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: ${props => props.size === 'small' ? '8px' : props.size === 'medium' ? '10px' : '12px'};
  height: ${props => props.size === 'small' ? '8px' : props.size === 'medium' ? '10px' : '12px'};
  border-radius: 50%;
  border: 2px solid ${props => props.theme.colors.surface.primary};
  background-color: ${props => props.status === 'online' ? props.theme.colors.success : 
                          props.status === 'offline' ? props.theme.colors.text.disabled : 
                          props.theme.colors.warning};
`;

// Бейдж аватара
const AvatarBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.size === 'small' ? '16px' : props.size === 'medium' ? '20px' : '24px'};
  height: ${props => props.size === 'small' ? '16px' : props.size === 'medium' ? '20px' : '24px'};
  border-radius: 50%;
  background-color: ${props => props.theme.colors.danger};
  color: white;
  font-size: ${props => props.size === 'small' ? '10px' : props.size === 'medium' ? '12px' : '14px'};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  border: 2px solid ${props => props.theme.colors.surface.primary};
`;

// Компонент Avatar
const Avatar = ({
  src,
  alt,
  name,
  size = 'medium',
  shape = 'circle',
  status,
  badge,
  className = '',
  onClick,
  ...props
}) => {
  // Получаем инициалы из имени
  const getInitials = (name) => {
    if (!name) return '';
    
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };
  
  // Определяем, что отображать
  const renderContent = () => {
    if (src) {
      return <AvatarImage src={src} alt={alt || name} shape={shape} />;
    }
    
    if (name) {
      return <AvatarInitials size={size}>{getInitials(name)}</AvatarInitials>;
    }
    
    return <AvatarInitials size={size}>?</AvatarInitials>;
  };
  
  return (
    <AvatarContainer
      size={size}
      shape={shape}
      className={`${className} avatar ${shape}`}
      onClick={onClick}
      {...props}
    >
      {renderContent()}
      
      {status && (
        <AvatarStatus size={size} status={status} />
      )}
      
      {badge && (
        <AvatarBadge size={size}>
          {badge}
        </AvatarBadge>
      )}
    </AvatarContainer>
  );
};

// Пропс-types для TypeScript
Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  shape: PropTypes.oneOf(['circle', 'square']),
  status: PropTypes.oneOf(['online', 'offline', 'away']),
  badge: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

// Компонент AvatarGroup для группы аватаров
const AvatarGroup = styled.div`
  display: flex;
  align-items: center;
  
  .avatar {
    border: 2px solid ${props => props.theme.colors.surface.primary};
    margin-left: ${props => props.theme.spacing[-2]};
    
    &:first-child {
      margin-left: 0;
    }
  }
`;

// Компонент AvatarGroup
const AvatarGroupComponent = ({
  avatars,
  maxVisible = 3,
  size = 'medium',
  shape = 'circle',
  className = '',
  ...props
}) => {
  const visibleAvatars = avatars.slice(0, maxVisible);
  const remainingCount = avatars.length - maxVisible;
  
  return (
    <AvatarGroup className={`${className} avatar-group`} {...props}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          alt={avatar.alt}
          name={avatar.name}
          size={size}
          shape={shape}
          status={avatar.status}
          badge={avatar.badge}
        />
      ))}
      
      {remainingCount > 0 && (
        <Avatar
          size={size}
          shape={shape}
          className="avatar-more"
        >
          +{remainingCount}
        </Avatar>
      )}
    </AvatarGroup>
  );
};

// Пропс-types для AvatarGroup
AvatarGroupComponent.propTypes = {
  avatars: PropTypes.arrayOf(
    PropTypes.shape({
      src: PropTypes.string,
      alt: PropTypes.string,
      name: PropTypes.string,
      status: PropTypes.oneOf(['online', 'offline', 'away']),
      badge: PropTypes.node,
    })
  ).isRequired,
  maxVisible: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  shape: PropTypes.oneOf(['circle', 'square']),
  className: PropTypes.string,
};

// Компонент AvatarWithInfo для аватара с информацией
const AvatarWithInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

// Информация об аватаре
const AvatarInfo = styled.div`
  display: flex;
  flex-direction: column;
  
  .name {
    font-size: ${props => props.theme.typography.fontSize.base[0]};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    color: ${props => props.theme.colors.text.primary};
    margin-bottom: ${props => props.theme.spacing[0.5]};
  }
  
  .subtitle {
    font-size: ${props => props.theme.typography.fontSize.sm[0]};
    color: ${props => props.theme.colors.text.tertiary};
  }
`;

// Компонент AvatarWithInfo
const AvatarWithInfo = ({
  src,
  alt,
  name,
  subtitle,
  size = 'medium',
  shape = 'circle',
  status,
  badge,
  className = '',
  onClick,
  ...props
}) => {
  return (
    <AvatarWithInfoContainer className={`${className} avatar-with-info`} {...props}>
      <Avatar
        src={src}
        alt={alt}
        name={name}
        size={size}
        shape={shape}
        status={status}
        badge={badge}
        onClick={onClick}
      />
      
      {(name || subtitle) && (
        <AvatarInfo>
          {name && <div className="name">{name}</div>}
          {subtitle && <div className="subtitle">{subtitle}</div>}
        </AvatarInfo>
      )}
    </AvatarWithInfoContainer>
  );
};

// Пропс-types для AvatarWithInfo
AvatarWithInfo.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  name: PropTypes.string,
  subtitle: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  shape: PropTypes.oneOf(['circle', 'square']),
  status: PropTypes.oneOf(['online', 'offline', 'away']),
  badge: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

// Экспорт компонентов
export { Avatar, AvatarGroup as AvatarGroupComponent, AvatarWithInfo };