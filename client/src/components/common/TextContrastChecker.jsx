import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colors } from '../../styles/designTokens';

const ContrastCheckerWrapper = styled.div`
  position: relative;
  padding: ${props => props.padding || '1rem'};
  border-radius: ${props => props.borderRadius || '0.25rem'};
  margin: ${props => props.margin || '0.5rem 0'};
  background-color: ${props => props.backgroundColor || colors.background};
  border: ${props => props.contrastLevel === 'low' ? '2px solid #ff0000' : 
          props.contrastLevel === 'medium' ? '2px solid #ffaa00' : 
          '2px solid #00aa00'};
`;

const ContrastInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.gap || '0.5rem'};
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const ContrastIndicator = styled.div`
  width: ${props => props.size || '12px'};
  height: ${props => props.size || '12px'};
  border-radius: 50%;
  background-color: ${props => 
    props.contrastLevel === 'low' ? '#ff0000' : 
    props.contrastLevel === 'medium' ? '#ffaa00' : 
    '#00aa00'};
`;

const ContrastRatioDisplay = styled.div`
  font-weight: bold;
  color: ${props => props.contrastLevel === 'low' ? '#ff0000' : 
          props.contrastLevel === 'medium' ? '#cc6600' : 
          '#006600'};
`;

const TextContrastChecker = ({ 
  children, 
  textColor, 
  backgroundColor, 
  fontSize,
  fontWeight,
  padding,
  margin,
  borderRadius,
  showInfo = true,
  minContrastRatio = 4.5,
  id
}) => {
  const [contrastRatio, setContrastRatio] = useState(0);
  const [contrastLevel, setContrastLevel] = useState('low');

  const calculateContrast = (color1, color2) => {
    // Convert hex to RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const getLuminance = (r, g, b) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) return 0;

    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const getContrastLevel = (ratio) => {
    if (ratio >= 7) return 'high';
    if (ratio >= 4.5) return 'medium';
    return 'low';
  };

  useEffect(() => {
    const ratio = calculateContrast(textColor, backgroundColor);
    setContrastRatio(ratio);
    setContrastLevel(getContrastLevel(ratio));
  }, [textColor, backgroundColor]);

  const isAccessible = contrastRatio >= minContrastRatio;

  return (
    <ContrastCheckerWrapper 
      contrastLevel={contrastLevel}
      textColor={textColor}
      backgroundColor={backgroundColor}
      padding={padding}
      margin={margin}
      borderRadius={borderRadius}
      id={id}
      aria-label={`Контрастность текста: ${contrastRatio.toFixed(2)}:1 (${contrastLevel} уровень)`}
    >
      {children}
      
      {showInfo && (
        <ContrastInfo>
          <ContrastIndicator contrastLevel={contrastLevel} />
          <span>Контрастность:</span>
          <ContrastRatioDisplay contrastLevel={contrastLevel}>
            {contrastRatio.toFixed(2)}:1
          </ContrastRatioDisplay>
          <span>({contrastLevel} уровень)</span>
          {!isAccessible && (
            <span style={{ color: '#ff0000', marginLeft: '0.5rem' }}>
              (Недостаточная контрастность)
            </span>
          )}
        </ContrastInfo>
      )}
    </ContrastCheckerWrapper>
  );
};

TextContrastChecker.propTypes = {
  children: PropTypes.node.isRequired,
  textColor: PropTypes.string.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  fontSize: PropTypes.string,
  fontWeight: PropTypes.string,
  padding: PropTypes.string,
  margin: PropTypes.string,
  borderRadius: PropTypes.string,
  showInfo: PropTypes.bool,
  minContrastRatio: PropTypes.number,
  id: PropTypes.string,
};

TextContrastChecker.defaultProps = {
  fontSize: '16px',
  fontWeight: 'normal',
  padding: '1rem',
  margin: '0.5rem 0',
  borderRadius: '0.25rem',
  showInfo: true,
  minContrastRatio: 4.5,
  id: undefined,
};

export default TextContrastChecker;