import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useTheme } from './ThemeProvider';
import { useFontSize } from './FontSizeController';
import { colors, spacing, breakpoints } from '../../styles/designTokens';

const AccessibilityWrapper = styled.div`
  position: relative;
  outline: none;
  
  &:focus {
    outline: 3px solid ${colors.primary};
    outline-offset: 2px;
    z-index: 10;
  }
  
  &:focus:not(:focus-visible) {
    outline: none;
  }
  
  &:focus-visible {
    outline: 3px solid ${colors.primary};
    outline-offset: 2px;
    z-index: 10;
  }
`;

const FocusIndicator = styled.div`
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid ${colors.primary};
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
  z-index: 5;
  
  ${props => props.isActive && `
    opacity: 1;
  `}
`;

const AccessibilityControls = styled.div`
  position: fixed;
  bottom: ${spacing.lg};
  left: ${spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  z-index: 1000;
  background-color: ${props => props.theme === 'dark' ? colors.surface : colors.background};
  padding: ${spacing.sm};
  border-radius: ${spacing.md};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const AccessibilityButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background-color: ${colors.primary};
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${colors.primaryHover};
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:focus {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
  
  &:disabled {
    background-color: ${colors.disabled};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const AccessibilityPanel = styled.div`
  position: fixed;
  bottom: ${spacing.lg};
  left: ${spacing.lg};
  background-color: ${props => props.theme === 'dark' ? colors.surface : colors.background};
  padding: ${spacing.md};
  border-radius: ${spacing.md};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-width: 300px;
  transform: translateY(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
`;

const AccessibilityOption = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${spacing.sm};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const AccessibilityToggle = styled.label`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  cursor: pointer;
  font-size: 14px;
`;

const AccessibilitySlider = styled.input`
  width: 40px;
  height: 20px;
  -webkit-appearance: none;
  appearance: none;
  background: ${colors.disabled};
  border-radius: 10px;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${colors.primary};
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${colors.primary};
    cursor: pointer;
    border: none;
  }
`;

const AccessibilityInfo = styled.div`
  font-size: 12px;
  color: ${props => props.theme === 'dark' ? colors.textSecondary : colors.textSecondary};
  margin-top: ${spacing.sm};
  padding-top: ${spacing.sm};
  border-top: 1px solid ${props => props.theme === 'dark' ? colors.border : colors.border};
`;

const AccessibilityKeyboard = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${props => props.theme === 'dark' ? colors.surface : colors.background};
  padding: ${spacing.sm};
  border-top: 1px solid ${props => props.theme === 'dark' ? colors.border : colors.border};
  z-index: 999;
  display: ${props => props.show ? 'flex' : 'none'};
  justify-content: center;
  gap: ${spacing.sm};
  flex-wrap: wrap;
`;

const KeyboardKey = styled.div`
  background-color: ${colors.background};
  border: 1px solid ${colors.border};
  border-radius: ${spacing.sm};
  padding: ${spacing.xs} ${spacing.sm};
  font-size: 12px;
  min-width: 30px;
  text-align: center;
`;

const AccessibilityWrapperComponent = ({ 
  children, 
  showControls = true,
  enableKeyboardNavigation = true,
  enableFocusIndicators = true,
  enableHighContrast = false,
  enableReducedMotion = false,
  id
}) => {
  const { theme } = useTheme();
  const { fontSize } = useFontSize();
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [highContrast, setHighContrast] = useState(enableHighContrast);
  const [reducedMotion, setReducedMotion] = useState(enableReducedMotion);
  const wrapperRef = useRef(null);

  useEffect(() => {
    // Apply accessibility preferences to the document
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    if (reducedMotion) {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
    
    // Save preferences to localStorage
    localStorage.setItem('accessibilityPreferences', JSON.stringify({
      highContrast,
      reducedMotion,
      fontSize
    }));
  }, [highContrast, reducedMotion, fontSize]);

  useEffect(() => {
    // Load accessibility preferences from localStorage
    const savedPreferences = localStorage.getItem('accessibilityPreferences');
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences);
      setHighContrast(preferences.highContrast || false);
      setReducedMotion(preferences.reducedMotion || false);
    }
  }, []);

  const toggleAccessibilityPanel = () => {
    setShowAccessibilityPanel(!showAccessibilityPanel);
  };

  const toggleKeyboard = () => {
    setShowKeyboard(!showKeyboard);
  };

  const handleKeyDown = (e) => {
    if (!enableKeyboardNavigation) return;
    
    // Handle Tab key for better navigation
    if (e.key === 'Tab') {
      setShowKeyboard(false);
    }
  };

  return (
    <>
      <AccessibilityWrapper
        ref={wrapperRef}
        id={id}
        tabIndex={enableKeyboardNavigation ? 0 : -1}
        onKeyDown={handleKeyDown}
        aria-label="Доступная область"
      >
        {enableFocusIndicators && (
          <FocusIndicator isActive={document.activeElement === wrapperRef.current} />
        )}
        {children}
      </AccessibilityWrapper>
      
      {showControls && (
        <>
          <AccessibilityControls theme={theme}>
            <AccessibilityButton 
              onClick={toggleAccessibilityPanel}
              aria-label="Панель доступности"
              title="Панель доступности"
            >
              ♿
            </AccessibilityButton>
            <AccessibilityButton 
              onClick={toggleKeyboard}
              aria-label="Показать клавиатурные команды"
              title="Показать клавиатурные команды"
            >
              ⌨
            </AccessibilityButton>
          </AccessibilityControls>
          
          <AccessibilityPanel 
            theme={theme} 
            isOpen={showAccessibilityPanel}
            aria-label="Панель настроек доступности"
          >
            <div style={{ fontWeight: 'bold', marginBottom: spacing.sm }}>
              Настройки доступности
            </div>
            
            <AccessibilityOption>
              <AccessibilityToggle>
                <span>Высокая контрастность</span>
                <AccessibilitySlider
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  aria-label="Переключить высокую контрастность"
                />
              </AccessibilityToggle>
            </AccessibilityOption>
            
            <AccessibilityOption>
              <AccessibilityToggle>
                <span>Уменьшенная анимация</span>
                <AccessibilitySlider
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  aria-label="Переключить уменьшенную анимацию"
                />
              </AccessibilityToggle>
            </AccessibilityOption>
            
            <AccessibilityInfo>
              <div>Размер шрифта: {fontSize}px</div>
              <div>Используйте кнопки выше для управления доступностью</div>
            </AccessibilityInfo>
          </AccessibilityPanel>
          
          <AccessibilityKeyboard 
            theme={theme} 
            show={showKeyboard}
            aria-label="Клавиатурные команды"
          >
            <KeyboardTab>Tab</KeyboardTab>
            <span>навигация</span>
            <KeyboardTab>Enter</KeyboardTab>
            <span>подтверждение</span>
            <KeyboardTab>Esc</KeyboardTab>
            <span>закрыть</span>
            <KeyboardTab>Space</KeyboardTab>
            <span>выбрать</span>
          </AccessibilityKeyboard>
        </>
      )}
    </>
  );
};

AccessibilityWrapperComponent.propTypes = {
  children: PropTypes.node.isRequired,
  showControls: PropTypes.bool,
  enableKeyboardNavigation: PropTypes.bool,
  enableFocusIndicators: PropTypes.bool,
  enableHighContrast: PropTypes.bool,
  enableReducedMotion: PropTypes.bool,
  id: PropTypes.string,
};

AccessibilityWrapperComponent.defaultProps = {
  showControls: true,
  enableKeyboardNavigation: true,
  enableFocusIndicators: true,
  enableHighContrast: false,
  enableReducedMotion: false,
  id: undefined,
};

const KeyboardTab = styled(KeyboardKey)`
  background-color: ${colors.primary};
  color: white;
  font-weight: bold;
`;

export default AccessibilityWrapperComponent;