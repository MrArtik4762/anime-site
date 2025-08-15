import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { breakpoints, spacing } from '../../styles/designTokens';

// Создаем медиа-запросы как CSS переменные
export const media = {
  xs: `(max-width: ${breakpoints.maxSm})`,
  sm: `(min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.maxMd})`,
  md: `(min-width: ${breakpoints.md}) and (max-width: ${breakpoints.maxLg})`,
  lg: `(min-width: ${breakpoints.lg}) and (max-width: ${breakpoints.maxXl})`,
  xl: `(min-width: ${breakpoints.xl}) and (max-width: ${breakpoints.max2xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`,
};

// Компонент для скрытия контента на определенных размерах
export const Hide = styled.div`
  display: block;
  
  @media ${media.xs} {
    display: ${props => props.xs ? 'none' : 'block'};
  }
  
  @media ${media.sm} {
    display: ${props => props.sm ? 'none' : 'block'};
  }
  
  @media ${media.md} {
    display: ${props => props.md ? 'none' : 'block'};
  }
  
  @media ${media.lg} {
    display: ${props => props.lg ? 'none' : 'block'};
  }
  
  @media ${media.xl} {
    display: ${props => props.xl ? 'none' : 'block'};
  }
  
  @media ${media['2xl']} {
    display: ${props => props.x2xl ? 'none' : 'block'};
  }
`;

Hide.propTypes = {
  xs: PropTypes.bool,
  sm: PropTypes.bool,
  md: PropTypes.bool,
  lg: PropTypes.bool,
  xl: PropTypes.bool,
  x2xl: PropTypes.bool,
};

// Компонент для показа контента только на определенных размерах
export const Show = styled.div`
  display: none;
  
  @media ${media.xs} {
    display: ${props => props.xs ? 'block' : 'none'};
  }
  
  @media ${media.sm} {
    display: ${props => props.sm ? 'block' : 'none'};
  }
  
  @media ${media.md} {
    display: ${props => props.md ? 'block' : 'none'};
  }
  
  @media ${media.lg} {
    display: ${props => props.lg ? 'block' : 'none'};
  }
  
  @media ${media.xl} {
    display: ${props => props.xl ? 'block' : 'none'};
  }
  
  @media ${media['2xl']} {
    display: ${props => props.x2xl ? 'block' : 'none'};
  }
`;

Show.propTypes = {
  xs: PropTypes.bool,
  sm: PropTypes.bool,
  md: PropTypes.bool,
  lg: PropTypes.bool,
  xl: PropTypes.bool,
  x2xl: PropTypes.bool,
};

// Адаптивный контейнер
export const Container = styled.div`
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: ${spacing.md};
  padding-right: ${spacing.md};
  
  @media ${media.sm} {
    max-width: 640px;
    padding-left: ${spacing.lg};
    padding-right: ${spacing.lg};
  }
  
  @media ${media.md} {
    max-width: 768px;
    padding-left: ${spacing.xl};
    padding-right: ${spacing.xl};
  }
  
  @media ${media.lg} {
    max-width: 1024px;
    padding-left: ${spacing.xxl};
    padding-right: ${spacing.xxl};
  }
  
  @media ${media.xl} {
    max-width: 1280px;
    padding-left: ${spacing.xxxl};
    padding-right: ${spacing.xxxl};
  }
  
  @media ${media['2xl']} {
    max-width: 1536px;
    padding-left: ${spacing.xxxxl || spacing.xxxl};
    padding-right: ${spacing.xxxxl || spacing.xxxl};
  }
`;

// Адаптивная сетка
export const Grid = styled.div`
  display: grid;
  gap: ${spacing.lg};
  
  ${props => {
    switch (props.columns) {
      case 1:
        return 'grid-template-columns: 1fr;';
      case 2:
        return `
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
          
          @media ${media.sm} {
            grid-template-columns: repeat(2, 1fr);
          }
        `;
      case 3:
        return `
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
          
          @media ${media.sm} {
            grid-template-columns: repeat(2, 1fr);
          }
          
          @media ${media.md} {
            grid-template-columns: repeat(3, 1fr);
          }
        `;
      case 4:
        return `
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
          
          @media ${media.sm} {
            grid-template-columns: repeat(2, 1fr);
          }
          
          @media ${media.md} {
            grid-template-columns: repeat(3, 1fr);
          }
          
          @media ${media.lg} {
            grid-template-columns: repeat(4, 1fr);
          }
        `;
      case 5:
        return `
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
          
          @media ${media.sm} {
            grid-template-columns: repeat(2, 1fr);
          }
          
          @media ${media.md} {
            grid-template-columns: repeat(3, 1fr);
          }
          
          @media ${media.lg} {
            grid-template-columns: repeat(4, 1fr);
          }
          
          @media ${media.xl} {
            grid-template-columns: repeat(5, 1fr);
          }
        `;
      case 6:
        return `
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
          
          @media ${media.sm} {
            grid-template-columns: repeat(2, 1fr);
          }
          
          @media ${media.md} {
            grid-template-columns: repeat(3, 1fr);
          }
          
          @media ${media.lg} {
            grid-template-columns: repeat(4, 1fr);
          }
          
          @media ${media.xl} {
            grid-template-columns: repeat(5, 1fr);
          }
          
          @media ${media['2xl']} {
            grid-template-columns: repeat(6, 1fr);
          }
        `;
      default:
        return 'grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));';
    }
  }}
  
  ${props => props.gap && `
    gap: ${props.gap};
  `}
`;

Grid.propTypes = {
  columns: PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
  gap: PropTypes.string,
};

// Адаптивное отступление
export const Spacer = styled.div`
  height: ${props => props.height || spacing.lg};
  width: ${props => props.width || '100%'};
  
  @media ${media.sm} {
    height: ${props => props.sm || props.height || spacing.lg};
  }
  
  @media ${media.md} {
    height: ${props => props.md || props.height || spacing.xl};
  }
  
  @media ${media.lg} {
    height: ${props => props.lg || props.height || spacing.xxl};
  }
`;

Spacer.propTypes = {
  height: PropTypes.string,
  width: PropTypes.string,
  sm: PropTypes.string,
  md: PropTypes.string,
  lg: PropTypes.string,
};

// Адаптивный текст
export const ResponsiveText = styled.p`
  font-size: ${props => props.size === 'xs' ? '12px' : 
              props.size === 'sm' ? '14px' : 
              props.size === 'base' ? '16px' : 
              props.size === 'lg' ? '18px' : 
              props.size === 'xl' ? '20px' : '16px'};
  line-height: ${props => props.size === 'xs' ? '1.5' : 
                 props.size === 'sm' ? '1.6' : 
                 props.size === 'base' ? '1.6' : 
                 props.size === 'lg' ? '1.7' : 
                 props.size === 'xl' ? '1.8' : '1.6'};
  
  @media ${media.sm} {
    font-size: ${props => props.sm || props.size};
  }
  
  @media ${media.md} {
    font-size: ${props => props.md || props.sm || props.size};
  }
  
  @media ${media.lg} {
    font-size: ${props => props.lg || props.md || props.sm || props.size};
  }
`;

ResponsiveText.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'base', 'lg', 'xl']),
  sm: PropTypes.string,
  md: PropTypes.string,
  lg: PropTypes.string,
};

// Хук для получения информации о размере экрана
export const useResponsive = () => {
  const [windowSize, setWindowSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  React.useEffect(() => {
    // Обработка SSR
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Инициализация при монтировании

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Определяем текущий размер экрана
  const isMobile = windowSize.width < parseInt(breakpoints.sm);
  const isTablet = windowSize.width >= parseInt(breakpoints.sm) && windowSize.width < parseInt(breakpoints.lg);
  const isDesktop = windowSize.width >= parseInt(breakpoints.lg);

  // Получаем текущую точку останова
  const getBreakpoint = () => {
    if (windowSize.width < parseInt(breakpoints.sm)) return 'xs';
    if (windowSize.width < parseInt(breakpoints.md)) return 'sm';
    if (windowSize.width < parseInt(breakpoints.lg)) return 'md';
    if (windowSize.width < parseInt(breakpoints.xl)) return 'lg';
    if (windowSize.width < parseInt(breakpoints['2xl'])) return 'xl';
    return '2xl';
  };

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    breakpoint: getBreakpoint(),
  };
};

// Компонент для рендеринга разных контентов на разных размерах
export const Responsive = ({ children, mobile, tablet, desktop }) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile && mobile) return mobile;
  if (isTablet && tablet) return tablet;
  if (isDesktop && desktop) return desktop;
  return children;
};

Responsive.propTypes = {
  children: PropTypes.node,
  mobile: PropTypes.node,
  tablet: PropTypes.node,
  desktop: PropTypes.node,
};

// Компонент для адаптивного изображения
export const ResponsiveImage = styled.img`
  width: 100%;
  height: auto;
  
  @media ${media.sm} {
    max-width: ${props => props.smMaxWidth || '100%'};
  }
  
  @media ${media.md} {
    max-width: ${props => props.mdMaxWidth || '100%'};
  }
  
  @media ${media.lg} {
    max-width: ${props => props.lgMaxWidth || '100%'};
  }
`;

ResponsiveImage.propTypes = {
  smMaxWidth: PropTypes.string,
  mdMaxWidth: PropTypes.string,
  lgMaxWidth: PropTypes.string,
};

// Компонент для адаптивного видео
export const ResponsiveVideo = styled.video`
  width: 100%;
  height: auto;
  
  @media ${media.sm} {
    max-width: ${props => props.smMaxWidth || '100%'};
  }
  
  @media ${media.md} {
    max-width: ${props => props.mdMaxWidth || '100%'};
  }
  
  @media ${media.lg} {
    max-width: ${props => props.lgMaxWidth || '100%'};
  }
`;

ResponsiveVideo.propTypes = {
  smMaxWidth: PropTypes.string,
  mdMaxWidth: PropTypes.string,
  lgMaxWidth: PropTypes.string,
};

export default {
  Hide,
  Show,
  Container,
  Grid,
  Spacer,
  ResponsiveText,
  useResponsive,
  Responsive,
  ResponsiveImage,
  ResponsiveVideo,
};