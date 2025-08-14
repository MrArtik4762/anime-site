import React, { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import Icon from './Icon';
import styled from 'styled-components';

// Стили для компонента пункта меню
const NavItemContainer = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.borderRadius.lg};
  transition: ${props => props.theme.transitions.normal};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.isActive ? props.theme.colors.text.inverse : props.theme.colors.text.primary};
  background-color: ${props => props.isActive ? props.theme.colors.primary : 'transparent'};
  
  &:hover {
    background-color: ${props => props.isActive ? props.theme.colors.primary : props.theme.colors.surface.secondary};
  }
  
  ${props => props.theme.media.coarse} {
    padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[5]};
  }
`;

// Стили для баджа
const Badge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background-color: ${props => props.theme.colors.error};
  color: ${props => props.theme.colors.text.inverse};
  font-size: ${props => props.theme.typography.fontSize.xs[0]};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  border-radius: ${props => props.theme.borderRadius.full};
  height: ${props => props.theme.spacing[5]};
  width: ${props => props.theme.spacing[5]};
`;

// Компонент пункта меню
const NavItem = ({
  to,
  icon,
  label,
  badge,
  isActive,
  onClick,
  className = ''
}) => {
  const { theme } = useTheme();
  
  return (
    <NavItemContainer
      to={to}
      onClick={onClick}
      isActive={isActive}
      className={className}
      aria-current={isActive ? 'page' : undefined}
    >
      {icon && (
        <div className="flex-shrink-0">
          <Icon
            name={icon}
            size={20}
            color={isActive ? theme.colors.text.inverse : theme.colors.text.primary}
          />
        </div>
      )}
      <span>{label}</span>
      {badge && <Badge>{badge}</Badge>}
    </NavItemContainer>
  );
};

NavItem.propTypes = {
  to: PropTypes.string.isRequired,
  icon: PropTypes.string,
  label: PropTypes.string.isRequired,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

// Стили для выпадающего меню
const DropdownMenuContainer = styled.div`
  position: relative;
  ${props => props.className};
`;

const DropdownTrigger = styled.div`
  cursor-pointer;
`;

const DropdownContent = styled.div`
  position: absolute;
  z-index: 50;
  width: 12rem;
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadow.lg};
  background-color: ${props => props.theme.colors.surface.primary};
  border: 1px solid ${props => props.theme.colors.border.medium};
  
  ${props => {
    switch (props.position) {
      case 'bottom-right':
        return 'top: 100%; right: 0; margin-top: 0.5rem;';
      case 'bottom-left':
        return 'top: 100%; left: 0; margin-top: 0.5rem;';
      case 'top-right':
        return 'bottom: 100%; right: 0; margin-bottom: 0.5rem;';
      case 'top-left':
        return 'bottom: 100%; left: 0; margin-bottom: 0.5rem;';
      default:
        return 'top: 100%; right: 0; margin-top: 0.5rem;';
    }
  }}
  
  ${props => props.theme.media.coarse} {
    width: 14rem;
  }
`;

const DropdownItemsContainer = styled.div`
  padding: 0.25rem 0;
`;

const DropdownItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  font-size: ${props => props.theme.typography.fontSize.sm[0]};
  cursor: pointer;
  transition: ${props => props.theme.transitions.normal};
  color: ${props => props.theme.colors.text.primary};
  
  &:hover {
    background-color: ${props => props.theme.colors.surface.secondary};
  }
  
  ${props => props.divider && `
    border-top: 1px solid ${props.theme.colors.border.medium};
    margin: 0.25rem 0;
  `}
`;

const DropdownShortcut = styled.span`
  margin-left: auto;
  font-size: ${props => props.theme.typography.fontSize.xs[0]};
  color: ${props => props.theme.colors.text.tertiary};
`;

// Компонент выпадающего меню
const DropdownMenu = ({
  trigger,
  items,
  position = 'bottom-right',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const closeDropdown = () => {
    setIsOpen(false);
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.dropdown-container')) {
        closeDropdown();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  return (
    <DropdownMenuContainer className={`dropdown-container ${className}`}>
      <DropdownTrigger onClick={toggleDropdown}>
        {trigger}
      </DropdownTrigger>
      
      {isOpen && (
        <DropdownContent position={position}>
          <DropdownItemsContainer>
            {items.map((item, index) => (
              <DropdownItem
                key={index}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  closeDropdown();
                }}
                divider={item.divider}
              >
                {item.icon && (
                  <Icon name={item.icon} size={16} color={theme.colors.text.secondary} />
                )}
                <span>{item.label}</span>
                {item.shortcut && (
                  <DropdownShortcut>
                    {item.shortcut}
                  </DropdownShortcut>
                )}
              </DropdownItem>
            ))}
          </DropdownItemsContainer>
        </DropdownContent>
      )}
    </DropdownMenuContainer>
  );
};

DropdownMenu.propTypes = {
  trigger: PropTypes.node.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.string,
      shortcut: PropTypes.string,
      onClick: PropTypes.func,
      divider: PropTypes.bool,
    })
  ).isRequired,
  position: PropTypes.oneOf(['bottom-right', 'bottom-left', 'top-right', 'top-left']),
  className: PropTypes.string,
};

// Стили для основного компонента навигации
const NavigationContainer = styled.nav`
  background-color: ${props => props.theme.colors.surface.primary};
  box-shadow: ${props => props.theme.shadow.md};
  
  ${props => props.theme.media.medium} {
    max-width: 1280rem;
    margin: 0 auto;
    padding-left: ${props => props.theme.spacing[6]};
    padding-right: ${props => props.theme.spacing[6]};
  }
  
  ${props => props.theme.media.large} {
    padding-left: ${props => props.theme.spacing[8]};
    padding-right: ${props => props.theme.spacing[8]};
  }
`;

const NavigationInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
  
  ${props => props.theme.media.medium} {
    height: 4rem;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  cursor: pointer;
`;

const LogoText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.lg[0]};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const DesktopMenu = styled.div`
  display: none;
  
  ${props => props.theme.media.medium} {
    display: block;
    margin-left: ${props => props.theme.spacing[10]};
    display: flex;
    align-items: baseline;
    gap: ${props => props.theme.spacing[4]};
  }
`;

const RightMenu = styled.div`
  display: none;
  flex: 1;
  align-items: center;
  justify-content: flex-end;
  
  ${props => props.theme.media.medium} {
    display: flex;
    max-width: 32rem;
    margin: 0 ${props => props.theme.spacing[4]};
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchIcon = styled.div`
  position: absolute;
  top: 50%;
  left: ${props => props.theme.spacing[3]};
  transform: translateY(-50%);
  pointer-events: none;
  color: ${props => props.theme.colors.text.tertiary};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]} ${props => props.theme.spacing[2]} ${props => props.theme.spacing[8]};
  border: 1px solid ${props => props.theme.colors.border.medium};
  border-radius: ${props => props.theme.borderRadius.lg};
  background-color: ${props => props.theme.colors.surface.primary};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.base[0]};
  
  &::placeholder {
    color: ${props => props.theme.colors.text.tertiary};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const UserAvatar = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  cursor: pointer;
`;

const AvatarCircle = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: ${props => props.theme.borderRadius.full};
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.text.inverse};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.sm[0]};
`;

const UserName = styled.span`
  display: none;
  color: ${props => props.theme.colors.text.primary};
  
  ${props => props.theme.medium} {
    display: block;
  }
`;

const MobileMenu = styled.div`
  display: flex;
  align-items: center;
  
  ${props => props.theme.medium} {
    display: none;
  }
`;

const MobileButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text.primary};
  transition: ${props => props.theme.transitions.normal};
  background-color: transparent;
  border: none;
  cursor: pointer;
  
  &:hover {
    color: ${props => props.theme.colors.text.primary};
    background-color: ${props => props.theme.colors.surface.secondary};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const MobileMenuContent = styled.div`
  display: none;
  
  ${props => props.isOpen && `
    display: block;
  `}
  
  ${props => props.theme.medium} {
    display: none;
  }
`;

const MobileMenuItems = styled.div`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  background-color: ${props => props.theme.colors.surface.primary};
  border-top: 1px solid ${props => props.theme.colors.border.medium};
  
  ${props => props.theme.spacing[3]} {
    padding-left: ${props => props.theme.spacing[6]};
    padding-right: ${props => props.theme.spacing[6]};
  }
`;

const MobileSearch = styled.div`
  padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[3]};
  border-top: 1px solid ${props => props.theme.colors.border.medium};
`;

// Основной компонент навигации
const Navigation = memo(({
  items,
  userMenu,
  className = '',
  logo,
  onMobileMenuToggle,
  isMobileMenuOpen = false,
  mobileMenuBreakpoint = 'md'
}) => {
  const location = useLocation();
  const { isDarkMode, toggleTheme, theme } = useTheme();
  
  // Определяем активный пункт меню
  const getActiveItem = (path) => {
    return items.some(item => item.to === path);
  };
  
  // Обработка мобильного меню
  const handleMobileMenuClose = () => {
    if (isMobileMenuOpen && onMobileMenuToggle) {
      onMobileMenuToggle();
    }
  };
  
  // Элементы меню пользователя
  const userMenuItems = userMenu ? [
    {
      label: 'Профиль',
      icon: 'user',
      onClick: () => {
        // Навигация к профилю пользователя
      }
    },
    {
      label: 'Настройки',
      icon: 'settings',
      onClick: () => {
        // Навигация к настройкам
      }
    },
    {
      label: isDarkMode ? 'Светлая тема' : 'Тёмная тема',
      icon: isDarkMode ? 'sun' : 'moon',
      onClick: toggleTheme
    },
    {
      label: 'Выход',
      icon: 'log-out',
      onClick: () => {
        // Обработка выхода из системы
      }
    }
  ] : [];
  
  return (
    <NavigationContainer className={className} theme={theme}>
      <NavigationInner>
        {/* Логотип */}
        <LogoContainer>
          {logo ? (
            <div className="cursor-pointer">
              {logo}
            </div>
          ) : (
            <LogoLink to="/">
              <Icon name="anime" size={32} />
              <LogoText>AnimeSite</LogoText>
            </LogoLink>
          )}
        </LogoContainer>
        
        {/* Десктопное меню */}
        <DesktopMenu>
          {items.map((item, index) => (
            <NavItem
              key={index}
              to={item.to}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
              isActive={getActiveItem(location.pathname)}
              onClick={handleMobileMenuClose}
            />
          ))}
        </DesktopMenu>
        
        {/* Правая часть меню */}
        <RightMenu>
          {/* Поиск */}
          <SearchContainer>
            <SearchIcon>
              <Icon name="search" size={18} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Поиск аниме..."
            />
          </SearchContainer>
          
          {/* Пользовательское меню */}
          {userMenu && (
            <DropdownMenu
              trigger={
                <UserAvatar>
                  <AvatarCircle>
                    {userMenu.name ? userMenu.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarCircle>
                  <UserName>
                    {userMenu.name || 'Пользователь'}
                  </UserName>
                </UserAvatar>
              }
              items={userMenuItems}
            />
          )}
        </RightMenu>
        
        {/* Мобильное меню */}
        <MobileMenu>
          {/* Кнопка поиска */}
          <MobileButton>
            <Icon name="search" size={20} />
          </MobileButton>
          
          {/* Кнопка пользователя */}
          {userMenu && (
            <DropdownMenu
              trigger={
                <UserAvatar>
                  <AvatarCircle size="small">
                    {userMenu.name ? userMenu.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarCircle>
                </UserAvatar>
              }
              items={userMenuItems}
              position="bottom-right"
            />
          )}
          
          {/* Кнопка меню */}
          <MobileButton
            onClick={onMobileMenuToggle}
            aria-expanded={isMobileMenuOpen}
          >
            <span className="sr-only">Открыть главное меню</span>
            {isMobileMenuOpen ? (
              <Icon name="close" size={20} />
            ) : (
              <Icon name="menu" size={20} />
            )}
          </MobileButton>
        </MobileMenu>
      </NavigationInner>
      
      {/* Мобильное меню (выпадающее) */}
      <MobileMenuContent isOpen={isMobileMenuOpen}>
        <MobileMenuItems>
          {items.map((item, index) => (
            <NavItem
              key={index}
              to={item.to}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
              isActive={getActiveItem(location.pathname)}
              onClick={handleMobileMenuClose}
            />
          ))}
        </MobileMenuItems>
        
        {/* Мобильный поиск */}
        <MobileSearch>
          <SearchContainer>
            <SearchIcon>
              <Icon name="search" size={18} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Поиск аниме..."
            />
          </SearchContainer>
        </MobileSearch>
      </MobileMenuContent>
    </NavigationContainer>
  );
});

Navigation.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      to: PropTypes.string.isRequired,
      icon: PropTypes.string,
      label: PropTypes.string.isRequired,
      badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  userMenu: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
  }),
  className: PropTypes.string,
  logo: PropTypes.node,
  onMobileMenuToggle: PropTypes.func,
  isMobileMenuOpen: PropTypes.bool,
  mobileMenuBreakpoint: PropTypes.oneOf(['md', 'lg']),
};

export default Navigation;