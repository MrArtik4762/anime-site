import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useTheme } from './ThemeProvider';
import { colors, spacing, breakpoints } from '../../styles/designTokens';

const FontSizeContext = createContext();

const FontSizeProviderWrapper = styled.div`
  font-size: ${props => props.fontSize}px;
  
  @media (max-width: ${breakpoints.mobile}) {
    font-size: ${props => props.mobileFontSize}px;
  }
`;

const FontSizeControls = styled.div`
  position: fixed;
  bottom: ${spacing.lg};
  right: ${spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  z-index: 1000;
  background-color: ${props => props.theme === 'dark' ? colors.surface : colors.background};
  padding: ${spacing.sm};
  border-radius: ${spacing.md};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FontSizeButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background-color: ${colors.primary};
  color: white;
  font-size: 16px;
  font-weight: bold;
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

const FontSizeIndicator = styled.div`
  font-size: 12px;
  color: ${props => props.theme === 'dark' ? colors.textSecondary : colors.textSecondary};
  margin-top: ${spacing.sm};
  text-align: center;
`;

const FontSizeController = ({ 
  children, 
  defaultFontSize = 16, 
  minFontSize = 12, 
  maxFontSize = 24, 
  stepSize = 2,
  mobileDefaultFontSize = 14,
  showControls = true,
  id
}) => {
  const { theme } = useTheme();
  const [fontSize, setFontSize] = useState(defaultFontSize);
  const [mobileFontSize, setMobileFontSize] = useState(mobileDefaultFontSize);
  const [showFontSizeControls, setShowFontSizeControls] = useState(showControls);

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + stepSize, maxFontSize));
    setMobileFontSize(prev => Math.min(prev + stepSize, maxFontSize));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - stepSize, minFontSize));
    setMobileFontSize(prev => Math.max(prev - stepSize, minFontSize));
  };

  const resetFontSize = () => {
    setFontSize(defaultFontSize);
    setMobileFontSize(mobileDefaultFontSize);
  };

  const toggleFontSizeControls = () => {
    setShowFontSizeControls(!showFontSizeControls);
  };

  useEffect(() => {
    // Save font size preference to localStorage
    localStorage.setItem('preferredFontSize', fontSize.toString());
    localStorage.setItem('preferredMobileFontSize', mobileFontSize.toString());
  }, [fontSize, mobileFontSize]);

  useEffect(() => {
    // Load font size preference from localStorage
    const savedFontSize = localStorage.getItem('preferredFontSize');
    const savedMobileFontSize = localStorage.getItem('preferredMobileFontSize');
    
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
    }
    if (savedMobileFontSize) {
      setMobileFontSize(parseInt(savedMobileFontSize));
    }
  }, []);

  return (
    <FontSizeContext.Provider value={{
      fontSize,
      mobileFontSize,
      increaseFontSize,
      decreaseFontSize,
      resetFontSize,
      minFontSize,
      maxFontSize,
      stepSize
    }}>
      <FontSizeProviderWrapper 
        fontSize={fontSize} 
        mobileFontSize={mobileFontSize}
        id={id}
        aria-label="Регулятор размера шрифта"
      >
        {children}
        
        {showControls && (
          <FontSizeControls theme={theme}>
            <FontSizeButton 
              onClick={decreaseFontSize}
              disabled={fontSize <= minFontSize}
              aria-label="Уменьшить размер шрифта"
              title="Уменьшить размер шрифта"
            >
              -
            </FontSizeButton>
            <FontSizeButton 
              onClick={increaseFontSize}
              disabled={fontSize >= maxFontSize}
              aria-label="Увеличить размер шрифта"
              title="Увеличить размер шрифта"
            >
              +
            </FontSizeButton>
            <FontSizeButton 
              onClick={resetFontSize}
              aria-label="Сбросить размер шрифта"
              title="Сбросить размер шрифта"
            >
              ↺
            </FontSizeButton>
            <FontSizeButton 
              onClick={toggleFontSizeControls}
              aria-label="Скрыть/показать контроллеры размера шрифта"
              title="Скрыть/показать контроллеры размера шрифта"
            >
              {showFontSizeControls ? '✕' : '⚙'}
            </FontSizeButton>
            <FontSizeIndicator theme={theme}>
              Размер: {fontSize}px
            </FontSizeIndicator>
          </FontSizeControls>
        )}
      </FontSizeProviderWrapper>
    </FontSizeContext.Provider>
  );
};

FontSizeController.propTypes = {
  children: PropTypes.node.isRequired,
  defaultFontSize: PropTypes.number,
  minFontSize: PropTypes.number,
  maxFontSize: PropTypes.number,
  stepSize: PropTypes.number,
  mobileDefaultFontSize: PropTypes.number,
  showControls: PropTypes.bool,
  id: PropTypes.string,
};

FontSizeController.defaultProps = {
  defaultFontSize: 16,
  minFontSize: 12,
  maxFontSize: 24,
  stepSize: 2,
  mobileDefaultFontSize: 14,
  showControls: true,
  id: undefined,
};

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeController');
  }
  return context;
};

export default FontSizeController;