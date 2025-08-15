import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './common/ThemeProvider';
import { useBreakpoint } from './common/Responsive';
import styled from 'styled-components';
import Button from './common/Button';
import LazyLoad from './common/LazyLoad';

// Стили для HeroCarousel с использованием дизайн-токенов
const HeroCarouselContainer = styled.div`
  position: relative;
  width: 100%;
  height: ${props => props.isMobile ? '400px' : props.isTablet ? '500px' : '600px'};
  overflow: hidden;
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadow.lg};
  margin-bottom: ${props => props.theme.spacing.xxxl};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    height: 350px;
    border-radius: ${props => props.theme.borderRadius.lg};
  }
`;

const HeroSlide = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: ${props => props.isActive ? 1 : 0};
  transition: opacity ${props => props.theme.transitions.normal} ease-in-out;
  pointer-events: ${props => props.isActive ? 'auto' : 'none'};
`;

const HeroSlideImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: ${props => `url(${props.backgroundImage})`};
  background-size: cover;
  background-position: center;
  filter: brightness(${props => props.isMobile ? 0.3 : 0.4});
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    background-position: top center;
    filter: brightness(0.3);
  }
`;

const HeroSlideOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.5) 30%,
    rgba(0, 0, 0, 0.8) 70%,
    rgba(0, 0, 0, 0.9) 100%
  );
`;

const HeroSlideContent = styled.div`
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: ${props => props.isMobile ? props.theme.spacing.xl : props.theme.spacing.xxxl};
  max-width: ${props => props.isMobile ? '90%' : '1200px'};
  margin-left: ${props => props.isMobile ? props.theme.spacing.lg : 'auto'};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.lg};
    max-width: '95%';
  }
`;

const HeroSlideTitle = styled.h1`
  font-size: ${props => props.isMobile ? '2rem' : '3.5rem'};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
  line-height: 1.2;
  max-width: 800px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 1.8rem;
    max-width: 100%;
  }
`;

const HeroSlideSubtitle = styled.p`
  font-size: ${props => props.isMobile ? '1.1rem' : '1.4rem'};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xl};
  max-width: 600px;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 1rem;
    max-width: 100%;
  }
`;

const HeroSlideActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column;
    width: 100%;
    gap: ${props => props.theme.spacing.sm};
  }
`;

const HeroSlideMeta = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  margin-top: ${props => props.theme.spacing.xl};
  flex-wrap: wrap;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    gap: ${props => props.theme.spacing.md};
    margin-top: ${props => props.theme.spacing.lg};
  }
`;

const HeroSlideMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.text.tertiary};
  font-size: ${props => props.theme.typography.fontSize.sm[0]};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: ${props => props.theme.typography.fontSize.xs[0]};
  }
`;

const HeroSlideMetaIcon = styled.span`
  font-size: 1.2rem;
`;

const HeroCarouselDots = styled.div`
  position: absolute;
  bottom: ${props => props.theme.spacing.lg};
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  z-index: 10;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    bottom: ${props => props.theme.spacing.md};
    gap: ${props => props.theme.spacing[2]};
  }
`;

const HeroCarouselDot = styled.button`
  width: ${props => props.isActive ? '12px' : '8px'};
  height: ${props => props.isActive ? '12px' : '8px'};
  border-radius: 50%;
  background: ${props => props.isActive ? props.theme.colors.primary : props.theme.colors.text.tertiary};
  border: none;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast} ease;
  opacity: ${props => props.isActive ? 1 : 0.5};
  
  @media (hover: hover) {
    &:hover {
      opacity: 1;
      transform: scale(1.2);
    }
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: ${props => props.isActive ? '10px' : '6px'};
    height: ${props => props.isActive ? '10px' : '6px'};
  }
`;

const HeroCarouselArrows = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 ${props => props.theme.spacing.xl};
  z-index: 10;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: 0 ${props => props.theme.spacing.lg};
  }
`;

const HeroCarouselArrow = styled.button`
  width: ${props => props.isMobile ? '40px' : '48px'};
  height: ${props => props.isMobile ? '40px' : '48px'};
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast} ease;
  font-size: 1.2rem;
  
  @media (hover: hover) {
    &:hover {
      background: rgba(0, 0, 0, 0.7);
      transform: scale(1.1);
    }
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    
    @media (hover: hover) {
      &:hover {
        transform: none;
        background: rgba(0, 0, 0, 0.5);
      }
    }
  }
`;

// Mock data для HeroCarousel
const mockHeroSlides = [
  {
    id: 1,
    title: 'Атака Титанов: Финал',
    subtitle: 'Человечество на грани уничтожения. Последняя битва за свободу начинается!',
    image: '/images/anime/attack-on-titan-final.jpg',
    rating: 9.2,
    episodes: 75,
    year: 2023,
    genres: ['Экшн', 'Драма', 'Фэнтези'],
    action: () => console.log('Смотреть Атака Титанов')
  },
  {
    id: 2,
    title: 'Магическая битва',
    subtitle: 'Самые сильные проклятия ждут своего носителя. Юджи Итадори готов к битве!',
    image: '/images/anime/jujutsu-kaisen.jpg',
    rating: 8.7,
    episodes: 24,
    year: 2023,
    genres: ['Экшн', 'Супернатуральное', 'Школа'],
    action: () => console.log('Смотреть Магическая битва')
  },
  {
    id: 3,
    title: 'Клинок, рассекающий демонов',
    subtitle: 'Танджиро Камадо становится охотником на демонов, чтобы спасти свою сестру!',
    image: '/images/anime/demon-slayer.jpg',
    rating: 8.9,
    episodes: 26,
    year: 2023,
    genres: ['Экшн', 'Фэнтези', 'Исторический'],
    action: () => console.log('Смотреть Клинок, рассекающий демонов')
  }
];

const HeroCarousel = memo(() => {
  const { theme } = useTheme();
  const { isMobile, isTablet } = useBreakpoint();
  const navigate = useNavigate();
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Автоматическая смена слайдов
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        nextSlide();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentSlide, isTransitioning]);
  
  const nextSlide = () => {
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === mockHeroSlides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };
  
  const prevSlide = () => {
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === 0 ? mockHeroSlides.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };
  
  const goToSlide = (index) => {
    if (index !== currentSlide && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };
  
  const handleWatchClick = (anime) => {
    navigate(`/anime/${anime.id}`);
  };
  
  return (
    <HeroCarouselContainer isMobile={isMobile} isTablet={isTablet} theme={theme}>
      {/* Слайды */}
      {mockHeroSlides.map((slide, index) => (
        <LazyLoad key={slide.id} once>
          <HeroSlide isActive={index === currentSlide}>
            <HeroSlideImage backgroundImage={slide.image} />
            <HeroSlideOverlay />
            <HeroSlideContent isMobile={isMobile}>
              <HeroSlideTitle isMobile={isMobile}>
                {slide.title}
              </HeroSlideTitle>
              <HeroSlideSubtitle isMobile={isMobile}>
                {slide.subtitle}
              </HeroSlideSubtitle>
              <HeroSlideActions>
                <Button 
                  variant="primary" 
                  size="large"
                  onClick={() => handleWatchClick(slide)}
                >
                  📺 Смотреть
                </Button>
                <Button 
                  variant="outline" 
                  size="large"
                  onClick={() => navigate(`/anime/${slide.id}`)}
                >
                  Подробнее
                </Button>
              </HeroSlideActions>
              <HeroSlideMeta>
                <HeroSlideMetaItem>
                  <HeroSlideMetaIcon>⭐</HeroSlideMetaIcon>
                  <span>{slide.rating}</span>
                </HeroSlideMetaItem>
                <HeroSlideMetaItem>
                  <HeroSlideMetaIcon>📺</HeroSlideMetaIcon>
                  <span>{slide.episodes} эп.</span>
                </HeroSlideMetaItem>
                <HeroSlideMetaItem>
                  <HeroSlideMetaIcon>📅</HeroSlideMetaIcon>
                  <span>{slide.year}</span>
                </HeroSlideMetaItem>
              </HeroSlideMeta>
            </HeroSlideContent>
          </HeroSlide>
        </LazyLoad>
      ))}
      
      {/* Стрелки навигации */}
      <HeroCarouselArrows>
        <HeroCarouselArrow 
          onClick={prevSlide}
          disabled={isTransitioning}
          isMobile={isMobile}
        >
          ‹
        </HeroCarouselArrow>
        <HeroCarouselArrow 
          onClick={nextSlide}
          disabled={isTransitioning}
          isMobile={isMobile}
        >
          ›
        </HeroCarouselArrow>
      </HeroCarouselArrows>
      
      {/* Точки навигации */}
      <HeroCarouselDots>
        {mockHeroSlides.map((_, index) => (
          <HeroCarouselDot
            key={index}
            isActive={index === currentSlide}
            onClick={() => goToSlide(index)}
          />
        ))}
      </HeroCarouselDots>
    </HeroCarouselContainer>
  );
});

HeroCarousel.propTypes = {
  // Можно добавить пропсы для кастомизации
};

HeroCarousel.defaultProps = {
  // Значения по умолчанию
};

export default HeroCarousel;