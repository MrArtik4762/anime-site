import React, { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import Icon from './Icon';
import styled from 'styled-components';
import { colors, spacing, breakpoints, borderRadius, shadow, animations } from '../../styles/designTokens';

// Стили для компонента пункта меню
const NavItemContainer = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.md} ${spacing.lg};
  border-radius: ${borderRadius.lg};
  transition: all ${animations.durations.normal} cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.isActive ? colors.text.inverse : colors.text.primary};
  background: ${props => props.isActive ?
    `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` :
    'transparent'};
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.5s ease-out;
  animation-fill-mode: both;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    background: ${props => props.isActive ?
      `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` :
      'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'};
    transform: translateY(-2px);
    box-shadow: ${props => props.isActive ? 'none' : shadow.md};
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  ${props => props.theme.media.medium} {
    padding: ${spacing.lg} ${spacing.xl};
  }
`;

// Стили для баджа
const Badge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: linear-gradient(135deg, ${colors.error} 0%, ${colors.secondary} 100%);
  color: ${colors.text.inverse};
  font-size: ${props => props.theme.typography.fontSize.xs[0]};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  border-radius: ${borderRadius.full};
  height: ${spacing.md};
  width: ${spacing.md};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: ${animations.keyframes.pulse} 2s infinite;
  backdrop-filter: blur(10px);
  transition: all ${animations.durations.fast} ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
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
  transition: all ${animations.durations.fast} ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const DropdownContent = styled.div`
  position: absolute;
  z-index: 50;
  width: 12rem;
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadow.lg};
  background: ${props => props.theme === 'dark' ?
    'linear-gradient(135deg, #1E293B 0%, #334155 100%)' :
    'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'};
  border: 1px solid ${props => props.theme === 'dark' ? colors.border.lightDark : colors.border.light};
  backdrop-filter: blur(10px);
  animation: fadeInDown 0.3s ease-out;
  
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
  
  ${props => props.theme.media.medium} {
    width: 14rem;
  }
`;

const DropdownItemsContainer = styled.div`
  padding: 0.25rem 0;
`;

const DropdownItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.sm} ${spacing.md};
  font-size: ${props => props.theme.typography.fontSize.sm[0]};
  cursor: pointer;
  transition: all ${animations.durations.fast} ease;
  color: ${props => props.theme === 'dark' ? colors.text.primary : colors.text.primary};
  border-radius: ${borderRadius.md};
  margin: 2px;
  
  &:hover {
    background: ${props => props.theme === 'dark' ?
      'linear-gradient(135deg, #334155 0%, #475569 100%)' :
      'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'};
    transform: translateX(4px);
  }
  
  ${props => props.divider && `
    border-top: 1px solid ${props => props.theme === 'dark' ? colors.border.lightDark : colors.border.light};
    margin: 0.5rem 0;
  `}
`;

const DropdownShortcut = styled.span`
  margin-left: auto;
  font-size: ${props => props.theme.typography.fontSize.xs[0]};
  color: ${props => props.theme === 'dark' ? colors.text.tertiary : colors.text.tertiary};
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
  background: ${props => props.theme === 'dark' ?
    'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' :
    'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'};
  box-shadow: ${shadow.md};
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  animation: ${animations.keyframes.slideFadeIn} 0.5s ease-out;
  
  ${props => props.theme.media.medium} {
    max-width: 1280rem;
    margin: 0 auto;
    padding-left: ${spacing.xxl};
    padding-right: ${spacing.xxl};
  }
  
  ${props => props.theme.media.large} {
    padding-left: ${spacing.xxxl};
    padding-right: ${spacing.xxxl};
  }
`;

const NavigationInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 ${spacing.lg};
  
  ${props => props.theme.media.medium} {
    height: 4rem;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: all ${animations.durations.fast} ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  cursor: pointer;
  text-decoration: none;
`;

const LogoText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.lg[0]};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all ${animations.durations.normal} ease;
  
  &:hover {
    transform: translateY(-1px);
  }
`;

const DesktopMenu = styled.div`
  display: none;
  
  ${props => props.theme.media.medium} {
    display: block;
    margin-left: ${spacing.xxxl};
    display: flex;
    align-items: baseline;
    gap: ${spacing.lg};
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
    margin: 0 ${spacing.lg};
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  transition: all ${animations.durations.normal} ease;
  
  &:focus-within {
    transform: scale(1.02);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  top: 50%;
  left: ${spacing.md};
  transform: translateY(-50%);
  pointer-events: none;
  color: ${props => props.theme === 'dark' ? colors.text.tertiary : colors.text.tertiary};
  transition: all ${animations.durations.fast} ease;
  
  ${SearchContainer}:focus-within & {
    color: ${colors.primary};
    transform: translateY(-50%) scale(1.1);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${spacing.sm} ${spacing.md} ${spacing.sm} ${spacing.xl};
  border: 1px solid ${props => props.theme === 'dark' ? colors.border.lightDark : colors.border.light};
  border-radius: ${borderRadius.lg};
  background: ${props => props.theme === 'dark' ?
    'linear-gradient(135deg, #1E293B 0%, #334155 100%)' :
    'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'};
  color: ${props => props.theme === 'dark' ? colors.text.primary : colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.base[0]};
  backdrop-filter: blur(10px);
  transition: all ${animations.durations.normal} ease;
  
  &::placeholder {
    color: ${props => props.theme === 'dark' ? colors.text.tertiary : colors.text.tertiary};
  }
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px ${colors.primary}40;
    background: ${props => props.theme === 'dark' ?
      'linear-gradient(135deg, #334155 0%, #475569 100%)' :
      'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'};
  }
`;

const UserAvatar = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  cursor: pointer;
  transition: all ${animations.durations.fast} ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const AvatarCircle = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: ${borderRadius.full};
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
  color: ${colors.text.inverse};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.sm[0]};
  transition: all ${animations.durations.fast} ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const UserName = styled.span`
  display: none;
  color: ${props => props.theme === 'dark' ? colors.text.primary : colors.text.primary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  
  ${props => props.theme.medium} {
    display: block;
  }
`;

const MobileMenu = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  
  ${props => props.theme.medium} {
    display: none;
  }
`;

const MobileButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${spacing.sm};
  border-radius: ${borderRadius.md};
  color: ${props => props.theme === 'dark' ? colors.text.primary : colors.text.primary};
  transition: all ${animations.durations.fast} ease;
  background: ${props => props.theme === 'dark' ?
    'linear-gradient(135deg, #1E293B 0%, #334155 100%)' :
    'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'};
  border: 1px solid ${props => props.theme === 'dark' ? colors.border.lightDark : colors.border.light};
  cursor: pointer;
  backdrop-filter: blur(10px);
  
  &:hover {
    color: ${colors.primary};
    background: ${props => props.theme === 'dark' ?
      'linear-gradient(135deg, #334155 0%, #475569 100%)' :
      'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'};
    transform: scale(1.05);
    box-shadow: ${shadow.sm};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${colors.primary}40;
  }
`;

const MobileMenuContent = styled.div`
  display: none;
  position: fixed;
  top: 4rem;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme === 'dark' ?
    'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' :
    'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'};
  z-index: 99;
  overflow-y: auto;
  animation: slideInRight 0.3s ease-out;
  
  ${props => props.isOpen && `
    display: block;
  `}
  
  ${props => props.theme.medium} {
    display: none;
  }
`;

const MobileMenuItems = styled.div`
  padding: ${spacing.lg} ${spacing.md};
  background: ${props => props.theme === 'dark' ?
    'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' :
    'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'};
  border-top: 1px solid ${props => props.theme === 'dark' ? colors.border.lightDark : colors.border.light};
  
  ${props => props.theme.spacing[3]} {
    padding-left: ${spacing.xxl};
    padding-right: ${spacing.xxl};
  }
`;

const MobileSearch = styled.div`
  padding: ${spacing.xl} ${spacing.md};
  border-top: 1px solid ${props => props.theme === 'dark' ? colors.border.lightDark : colors.border.light};
  background: ${props => props.theme === 'dark' ?
    'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' :
    'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'};
`;

const MobileSearchInput = styled.input`
  width: 100%;
  padding: ${spacing.md} ${spacing.md} ${spacing.md} ${spacing.xl};
  border: 1px solid ${colors.border.light};
  border-radius: ${borderRadius.lg};
  background: ${props => props.theme === 'dark' ?
    'linear-gradient(135deg, #1E293B 0%, #334155 100%)' :
    'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)'};
  color: ${props => props.theme === 'dark' ? colors.text.primary : colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.base[0]};
  backdrop-filter: blur(10px);
  transition: all ${animations.durations.normal} ease;
  
  &::placeholder {
    color: ${props => props.theme === 'dark' ? colors.text.tertiary : colors.text.tertiary};
  }
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px ${colors.primary}40;
    background: ${props => props.theme === 'dark' ?
      'linear-gradient(135deg, #334155 0%, #475569 100%)' :
      'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'};
  }
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
            <MobileSearchInput
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