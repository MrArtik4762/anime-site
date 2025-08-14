import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useTheme } from './ThemeProvider';
import { colors, spacing } from '../../styles/designTokens';

const ScreenReaderContentWrapper = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
  
  /* Ensure it's accessible to screen readers but hidden visually */
  &:focus {
    width: auto;
    height: auto;
    padding: ${spacing.sm};
    margin: ${spacing.sm};
    overflow: visible;
    clip: auto;
    white-space: normal;
    background-color: ${colors.background};
    border: 2px solid ${colors.primary};
    outline: none;
  }
`;

const ScreenReaderContent = ({ 
  children, 
  id, 
  as: Component = 'div',
  announceToScreenReader = false,
  announceMessage = ''
}) => {
  const { theme } = useTheme();
  const [isAnnouncing, setIsAnnouncing] = useState(false);

  useEffect(() => {
    if (announceToScreenReader && announceMessage) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.style.position = 'absolute';
      announcement.style.left = '-10000px';
      announcement.style.width = '1px';
      announcement.style.height = '1px';
      announcement.style.overflow = 'hidden';
      document.body.appendChild(announcement);
      
      announcement.textContent = announceMessage;
      
      setTimeout(() => {
        document.body.removeChild(announcement);
        setIsAnnouncing(false);
      }, 1000);
      
      setIsAnnouncing(true);
    }
  }, [announceToScreenReader, announceMessage]);

  return (
    <ScreenReaderContentWrapper 
      id={id} 
      as={Component}
      aria-live={announceToScreenReader ? 'polite' : 'off'}
      aria-atomic="true"
    >
      {children}
    </ScreenReaderContentWrapper>
  );
};

ScreenReaderContent.propTypes = {
  children: PropTypes.node.isRequired,
  id: PropTypes.string,
  as: PropTypes.elementType,
  announceToScreenReader: PropTypes.bool,
  announceMessage: PropTypes.string,
};

ScreenReaderContent.defaultProps = {
  id: undefined,
  as: 'div',
  announceToScreenReader: false,
  announceMessage: '',
};

export default ScreenReaderContent;