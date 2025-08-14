import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Контейнер вкладок
const TabsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

// Заголовок вкладок
const TabsHeader = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme.colors.border.medium};
  margin-bottom: ${props => props.theme.spacing[2]};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  ${props => props.variant === 'pills' && `
    border-bottom: none;
    flex-wrap: wrap;
    gap: ${props.theme.spacing[2]};
  `}
`;

// Кнопка вкладки
const TabButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${props => props.theme.spacing[2]} ${props.theme.spacing[3]};
  font-size: ${props => props.theme.typography.fontSize.base[0]};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.text.tertiary};
  border-bottom: ${props => props.active ? `2px solid ${props.theme.colors.primary}` : 'none'};
  transition: ${props => props.theme.transitions.normal};
  white-space: nowrap;
  position: relative;
  
  ${props => props.variant === 'pills' && `
    border-radius: ${props.theme.borderRadius.full};
    border: 1px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.border.medium};
    color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.text.tertiary};
    border-bottom: none;
    margin-bottom: 0;
    
    &:hover {
      background-color: ${props => props.theme.colors.border.light};
    }
    
    ${props => props.active && `
      background-color: ${props.theme.colors.primary};
      color: white;
    `}
  `}
  
  &:focus {
    outline: none;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: ${props => props.theme.colors.primary};
    }
  }
  
  ${props => props.disabled && `
    opacity: ${props.theme.opacity[50]};
    cursor: not-allowed;
    
    &:hover {
      background-color: transparent;
    }
  `}
`;

// Иконка в кнопке вкладки
const TabIcon = styled.span`
  margin-right: ${props => props.theme.spacing[2]};
  
  ${props => props.iconPosition === 'right' && `
    margin-right: 0;
    margin-left: ${props => props.theme.spacing[2]};
  `}
`;

// Счетчик вкладки
const TabCounter = styled.span`
  background-color: ${props => props.theme.colors.border.light};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.typography.fontSize.xs[0]};
  padding: ${props => props.theme.spacing[0.5]} ${props => props.theme.spacing[1]};
  border-radius: ${props => props.theme.borderRadius.full};
  margin-left: ${props => props.theme.spacing[2]};
  
  ${props => props.variant === 'pills' && `
    background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : props.theme.colors.border.light};
    color: ${props => props.active ? 'white' : props.theme.colors.text.primary};
  `}
`;

// Содержимое вкладок
const TabsContent = styled.div`
  flex: 1;
`;

// Панель вкладки
const TabPanel = styled.div`
  display: ${props => props.active ? 'block' : 'none'};
  animation: fadeIn ${props => props.theme.transitions.normal};
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Компонент Tabs
const Tabs = ({
  items,
  defaultActiveIndex = 0,
  variant = 'default',
  className = '',
  onChange,
  ...props
}) => {
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  
  const handleTabClick = (index) => {
    if (items[index].disabled) return;
    
    setActiveIndex(index);
    if (onChange) onChange(index, items[index]);
  };
  
  return (
    <TabsContainer className={`${className} tabs ${variant}`} {...props}>
      <TabsHeader variant={variant}>
        {items.map((item, index) => (
          <TabButton
            key={item.key || index}
            active={activeIndex === index}
            disabled={item.disabled}
            variant={variant}
            onClick={() => handleTabClick(index)}
          >
            {item.icon && (
              <TabIcon iconPosition={item.iconPosition || 'left'}>
                {item.icon}
              </TabIcon>
            )}
            {item.label}
            {item.counter && (
              <TabCounter active={activeIndex === index} variant={variant}>
                {item.counter}
              </TabCounter>
            )}
          </TabButton>
        ))}
      </TabsHeader>
      
      <TabsContent>
        {items.map((item, index) => (
          <TabPanel
            key={item.key || index}
            active={activeIndex === index}
          >
            {item.content}
          </TabPanel>
        ))}
      </TabsContent>
    </TabsContainer>
  );
};

// Пропс-types для TypeScript
Tabs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string.isRequired,
      content: PropTypes.node.isRequired,
      icon: PropTypes.node,
      iconPosition: PropTypes.oneOf(['left', 'right']),
      counter: PropTypes.node,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  defaultActiveIndex: PropTypes.number,
  variant: PropTypes.oneOf(['default', 'pills']),
  className: PropTypes.string,
  onChange: PropTypes.func,
};

// Компонент TabsWithIndicator для вкладок с индикатором
const TabsWithIndicatorContainer = styled.div`
  position: relative;
  
  .tabs-header {
    display: flex;
    border-bottom: 1px solid ${props => props.theme.colors.border.medium};
    margin-bottom: ${props => props.theme.spacing[2]};
  }
  
  .tab-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
    font-size: ${props => props.theme.typography.fontSize.base[0]};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.text.tertiary};
    transition: ${props => props.theme.transitions.normal};
    white-space: nowrap;
    position: relative;
  }
  
  .indicator {
    position: absolute;
    bottom: -1px;
    height: 2px;
    background-color: ${props => props.theme.colors.primary};
    transition: ${props => props.theme.transitions.normal};
  }
`;

// Компонент TabsWithIndicator
const TabsWithIndicator = ({
  items,
  defaultActiveIndex = 0,
  className = '',
  onChange,
  ...props
}) => {
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  const indicatorRef = useRef(null);
  const tabRefs = useRef([]);
  
  const handleTabClick = (index) => {
    if (items[index].disabled) return;
    
    setActiveIndex(index);
    if (onChange) onChange(index, items[index]);
  };
  
  // Обновление позиции индикатора
  useEffect(() => {
    if (indicatorRef.current && tabRefs.current[activeIndex]) {
      const tab = tabRefs.current[activeIndex];
      indicatorRef.current.style.width = `${tab.offsetWidth}px`;
      indicatorRef.current.style.transform = `translateX(${tab.offsetLeft}px)`;
    }
  }, [activeIndex]);
  
  return (
    <TabsWithIndicatorContainer className={`${className} tabs-with-indicator`} {...props}>
      <div className="tabs-header">
        {items.map((item, index) => (
          <button
            key={item.key || index}
            ref={el => tabRefs.current[index] = el}
            className={`tab-button ${activeIndex === index ? 'active' : ''}`}
            disabled={item.disabled}
            onClick={() => handleTabClick(index)}
          >
            {item.label}
          </button>
        ))}
        <div ref={indicatorRef} className="indicator"></div>
      </div>
      
      <TabsContent>
        {items.map((item, index) => (
          <TabPanel
            key={item.key || index}
            active={activeIndex === index}
          >
            {item.content}
          </TabPanel>
        ))}
      </TabsContent>
    </TabsWithIndicatorContainer>
  );
};

// Пропс-types для TabsWithIndicator
TabsWithIndicator.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string.isRequired,
      content: PropTypes.node.isRequired,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  defaultActiveIndex: PropTypes.number,
  className: PropTypes.string,
  onChange: PropTypes.func,
};

// Компонент TabNav для навигации по вкладкам
const TabNavContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  .nav-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: ${props => props.theme.spacing[1]};
    border-radius: ${props => props.theme.borderRadius.md};
    color: ${props => props.theme.colors.text.tertiary};
    transition: ${props => props.theme.transitions.normal};
    
    &:hover {
      background-color: ${props => props.theme.colors.border.light};
      color: ${props => props.theme.colors.text.primary};
    }
    
    &:disabled {
      opacity: ${props => props.theme.opacity[50]};
      cursor: not-allowed;
    }
  }
`;

// Компонент TabNav
const TabNav = ({
  items,
  activeIndex,
  onPrev,
  onNext,
  canPrev,
  canNext,
  className = '',
  ...props
}) => {
  return (
    <TabNavContainer className={`${className} tab-nav`} {...props}>
      <button
        className="nav-button"
        onClick={onPrev}
        disabled={!canPrev}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      
      <div className="tab-labels">
        {items.map((item, index) => (
          <button
            key={item.key || index}
            className={`tab-label ${activeIndex === index ? 'active' : ''}`}
            onClick={() => item.onClick && item.onClick(index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      
      <button
        className="nav-button"
        onClick={onNext}
        disabled={!canNext}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </TabNavContainer>
  );
};

// Пропп-types для TabNav
TabNav.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func,
    })
  ).isRequired,
  activeIndex: PropTypes.number.isRequired,
  onPrev: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  canPrev: PropTypes.bool,
  canNext: PropTypes.bool,
  className: PropTypes.string,
};

// Компонент Tab для отдельной вкладки
const Tab = ({
  label,
  children,
  disabled = false,
  icon,
  iconPosition = 'left',
  counter,
  className = '',
  ...props
}) => {
  return {
    label,
    content: children,
    disabled,
    icon,
    iconPosition,
    counter,
    className,
    ...props,
  };
};

// Экспорт компонентов
export { Tabs, TabsWithIndicator as TabsWithIndicatorComponent, TabNav, Tab };