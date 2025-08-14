import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Контейнер для breadcrumb
const BreadcrumbContainer = styled.nav`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: ${props => props.theme.spacing[2]} 0;
  color: ${props => props.theme.colors.text.tertiary};
  
  ol {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
`;

// Элемент breadcrumb
const BreadcrumbItem = styled.li`
  display: flex;
  align-items: center;
  
  &:not(:last-child)::after {
    content: '/';
    margin: 0 ${props => props.theme.spacing[2]};
    color: ${props => props.theme.colors.border.medium};
  }
  
  .link {
    color: ${props => props.theme.colors.text.tertiary};
    text-decoration: none;
    font-size: ${props => props.theme.typography.fontSize.sm[0]};
    transition: ${props => props.theme.transitions.normal};
    
    &:hover {
      color: ${props => props.theme.colors.primary};
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
        border: 2px solid ${props => props.theme.colors.primary};
        border-radius: ${props => props.theme.borderRadius.sm};
      }
    }
    
    ${props => props.active && `
      color: ${props.theme.colors.text.primary};
      font-weight: ${props.theme.typography.fontWeight.medium};
      cursor: default;
      
      &:hover {
        color: ${props.theme.colors.text.primary};
      }
    `}
  }
`;

// Компонент Breadcrumb
const Breadcrumb = ({
  items,
  separator = '/',
  className = '',
  ...props
}) => {
  return (
    <BreadcrumbContainer className={`${className} breadcrumb`} {...props}>
      <ol>
        {items.map((item, index) => (
          <BreadcrumbItem key={index}>
            {item.href && !item.active ? (
              <a
                href={item.href}
                className="link"
                aria-current={item.active ? 'page' : undefined}
              >
                {item.label}
              </a>
            ) : (
              <span className={`link ${item.active ? 'active' : ''}`}>
                {item.label}
              </span>
            )}
          </BreadcrumbItem>
        ))}
      </ol>
    </BreadcrumbContainer>
  );
};

// Пропс-types для TypeScript
Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
      active: PropTypes.bool,
    })
  ).isRequired,
  separator: PropTypes.string,
  className: PropTypes.string,
};

// Компонент BreadcrumbWithHome для breadcrumb с домашней страницей
const BreadcrumbWithHomeContainer = styled(BreadcrumbContainer)`
  .home-icon {
    margin-right: ${props => props.theme.spacing[1]};
  }
  
  .home-link {
    color: ${props => props.theme.colors.text.tertiary};
    text-decoration: none;
    transition: ${props => props.theme.transitions.normal};
    
    &:hover {
      color: ${props => props.theme.colors.primary};
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
        border: 2px solid ${props => props.theme.colors.primary};
        border-radius: ${props => props.theme.borderRadius.sm};
      }
    }
  }
`;

// Компонент BreadcrumbWithHome
const BreadcrumbWithHome = ({
  items,
  homeHref = '/',
  homeLabel = 'Главная',
  separator = '/',
  className = '',
  ...props
}) => {
  const homeItem = {
    label: homeLabel,
    href: homeHref,
    active: false,
  };
  
  return (
    <BreadcrumbWithHomeContainer className={`${className} breadcrumb-with-home`} {...props}>
      <ol>
        <BreadcrumbItem>
          <a href={homeHref} className="home-link">
            <svg
              className="home-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            {homeLabel}
          </a>
        </BreadcrumbItem>
        
        {items.map((item, index) => (
          <BreadcrumbItem key={index}>
            {item.href && !item.active ? (
              <a
                href={item.href}
                className="link"
                aria-current={item.active ? 'page' : undefined}
              >
                {item.label}
              </a>
            ) : (
              <span className={`link ${item.active ? 'active' : ''}`}>
                {item.label}
              </span>
            )}
          </BreadcrumbItem>
        ))}
      </ol>
    </BreadcrumbWithHomeContainer>
  );
};

// Пропп-types для BreadcrumbWithHome
BreadcrumbWithHome.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
      active: PropTypes.bool,
    })
  ).isRequired,
  homeHref: PropTypes.string,
  homeLabel: PropTypes.string,
  separator: PropTypes.string,
  className: PropTypes.string,
};

// Компонент BreadcrumbDropdown для breadcrumb с выпадающим меню
const BreadcrumbDropdownContainer = styled(BreadcrumbContainer)`
  .dropdown {
    position: relative;
    
    .dropdown-toggle {
      background: none;
      border: none;
      cursor: pointer;
      padding: ${props => props.theme.spacing[0.5]};
      border-radius: ${props => props.theme.borderRadius.sm};
      color: ${props => props.theme.colors.text.tertiary};
      transition: ${props => props.theme.transitions.normal};
      display: flex;
      align-items: center;
      
      &:hover {
        background-color: ${props => props.theme.colors.border.light};
        color: ${props => props.theme.colors.text.primary};
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
          border: 2px solid ${props => props.theme.colors.primary};
          border-radius: ${props => props.theme.borderRadius.sm};
        }
      }
      
      svg {
        width: 16px;
        height: 16px;
        margin-left: ${props => props.theme.spacing[1]};
      }
    }
    
    .dropdown-menu {
      position: absolute;
      top: 100%;
      left: 0;
      background-color: ${props => props.theme.colors.surface.secondary};
      border: 1px solid ${props => props.theme.colors.border.medium};
      border-radius: ${props => props.theme.borderRadius.md};
      box-shadow: ${props => props.theme.shadow.md};
      min-width: 200px;
      z-index: ${props => props.theme.zIndex.dropdown};
      margin-top: ${props => props.theme.spacing[1]};
      
      .dropdown-item {
        padding: ${props => props.theme.spacing[2]};
        color: ${props => props.theme.colors.text.primary};
        text-decoration: none;
        display: block;
        transition: ${props => props.theme.transitions.normal};
        
        &:hover {
          background-color: ${props => props.theme.colors.border.light};
          color: ${props => props.theme.colors.primary};
        }
        
        &:focus {
          outline: none;
          
          &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 2px solid ${props => props.theme.colors.primary};
            border-radius: ${props => props.theme.borderRadius.md};
          }
        }
        
        & + .dropdown-item {
          border-top: 1px solid ${props => props.theme.colors.border.medium};
        }
      }
    }
  }
`;

// Компонент BreadcrumbDropdown
const BreadcrumbDropdown = ({
  items,
  dropdownItems,
  separator = '/',
  className = '',
  ...props
}) => {
  return (
    <BreadcrumbDropdownContainer className={`${className} breadcrumb-dropdown`} {...props}>
      <ol>
        {items.map((item, index) => (
          <BreadcrumbItem key={index}>
            {item.href && !item.active ? (
              <a
                href={item.href}
                className="link"
                aria-current={item.active ? 'page' : undefined}
              >
                {item.label}
              </a>
            ) : (
              <span className={`link ${item.active ? 'active' : ''}`}>
                {item.label}
              </span>
            )}
          </BreadcrumbItem>
        ))}
        
        {dropdownItems && (
          <BreadcrumbItem>
            <div className="dropdown">
              <button className="dropdown-toggle">
                {dropdownItems[0]?.label}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              <div className="dropdown-menu">
                {dropdownItems.map((dropdownItem, dropdownIndex) => (
                  <a
                    key={dropdownIndex}
                    href={dropdownItem.href}
                    className="dropdown-item"
                  >
                    {dropdownItem.label}
                  </a>
                ))}
              </div>
            </div>
          </BreadcrumbItem>
        )}
      </ol>
    </BreadcrumbDropdownContainer>
  );
};

// Пропп-types для BreadcrumbDropdown
BreadcrumbDropdown.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
      active: PropTypes.bool,
    })
  ).isRequired,
  dropdownItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
    })
  ),
  separator: PropTypes.string,
  className: PropTypes.string,
};

// Компонент BreadcrumbIcon для breadcrumb с иконками
const BreadcrumbIconContainer = styled(BreadcrumbContainer)`
  .icon {
    margin-right: ${props => props.theme.spacing[1]};
    width: 16px;
    height: 16px;
  }
`;

// Компонент BreadcrumbIcon
const BreadcrumbIcon = ({
  items,
  separator = '/',
  className = '',
  ...props
}) => {
  return (
    <BreadcrumbIconContainer className={`${className} breadcrumb-icon`} {...props}>
      <ol>
        {items.map((item, index) => (
          <BreadcrumbItem key={index}>
            {item.href && !item.active ? (
              <a
                href={item.href}
                className="link"
                aria-current={item.active ? 'page' : undefined}
              >
                {item.icon && (
                  <svg
                    className="icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {item.icon}
                  </svg>
                )}
                {item.label}
              </a>
            ) : (
              <span className={`link ${item.active ? 'active' : ''}`}>
                {item.icon && (
                  <svg
                    className="icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {item.icon}
                  </svg>
                )}
                {item.label}
              </span>
            )}
          </BreadcrumbItem>
        ))}
      </ol>
    </BreadcrumbIconContainer>
  );
};

// Пропп-types для BreadcrumbIcon
BreadcrumbIcon.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string,
      active: PropTypes.bool,
      icon: PropTypes.node,
    })
  ).isRequired,
  separator: PropTypes.string,
  className: PropTypes.string,
};

// Экспорт компонентов
export {
  Breadcrumb,
  BreadcrumbWithHome as BreadcrumbWithHomeComponent,
  BreadcrumbDropdown as BreadcrumbDropdownComponent,
  BreadcrumbIcon as BreadcrumbIconComponent,
};