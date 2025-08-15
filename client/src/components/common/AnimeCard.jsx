import React, { useState, memo, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import Icon from './Icon';
import Button from './Button';
import Badge from './Badge';
import Rating from './Rating';
import styled from 'styled-components';

// Стили для карточки аниме с использованием дизайн-токенов - современный дизайн с полной адаптивностью
const AnimeCardContainer = styled.div`
  position: relative;
  border-radius: ${props => props.theme.borderRadius.xl};
  overflow: hidden;
  background: linear-gradient(135deg, ${props => props.theme.colors.surface.primary} 0%, ${props => props.theme.colors.surface.secondary} 100%);
  box-shadow: ${props => props.theme.shadow.md};
  transition: all ${props => props.theme.transitions.normal} cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  transform: translateY(0);
  touch-action: manipulation; // Улучшение для touch-устройств
  
  @media (hover: hover) {
    &:hover {
      transform: translateY(-6px) scale(1.02);
      box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04),
        0 0 0 1px ${props => props.theme.colors.primary}20;
    }
  }
  
  &:active {
    transform: translateY(-2px) scale(1.01);
  }
  
  // Адаптивные размеры с использованием clamp()
  ${props => props.responsive && `
    width: clamp(160px, 20vw, 256px);
    height: clamp(240px, 28vw, 384px);
  `}
  
  ${props => !props.responsive && `
    ${props => props.size === 'small' && `
      width: 192px;
      height: 288px;
    `}
    
    ${props => props.size === 'medium' && `
      width: 224px;
      height: 320px;
    `}
    
    ${props => props.size === 'large' && `
      width: 256px;
      height: 384px;
    `}
  `}
  
  // Анимация появления с задержкой для последовательного появления
  animation: fadeInUp 0.6s ease-out;
  animation-delay: ${props => props.animationDelay || '0ms'};
  animation-fill-mode: both;
  
  // Эффект стекирования для больших сеток
  ${props => props.isStacked && `
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
    
    @media (hover: hover) {
      &:hover {
        z-index: 10;
      }
    }
  `}
  
  // Улучшенный touch-эффект для мобильных устройств
  @media (hover: none) {
    &:active {
      transform: scale(0.98);
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.15),
        0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }
`;

const AnimeCardImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: ${props => props.responsive ? 'clamp(160px, 20vw, 256px)' : '66.66%'};
  overflow: hidden;
  background: linear-gradient(135deg, ${props => props.theme.colors.surface.tertiary} 0%, ${props => props.theme.colors.surface.dark} 100%);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform ${props => props.theme.transitions.slow} ease-out;
    
    @media (hover: hover) {
      &:hover {
        transform: scale(1.1);
      }
    }
  }
  
  // Progress Bar Overlay для показа прогресса просмотра
  ${props => props.showProgress && props.progress > 0 && `
    .progress-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: rgba(0, 0, 0, 0.5);
      z-index: 5;
      
      .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.secondary} 100%);
        transition: width ${props => props.theme.transitions.normal} ease-out;
        box-shadow: 0 0 10px rgba(${props => props.theme.colors.primary}, 0.5);
      }
      
      .progress-text {
        position: absolute;
        top: -20px;
        right: 8px;
        font-size: ${props => props.theme.typography.fontSize.xs[0]};
        color: ${props => props.theme.colors.text.primary};
        font-weight: ${props => props.theme.typography.fontWeight.medium};
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
      }
    }
  `}
  
  // Эффект свечения для премиум контента
  ${props => props.isPremium && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg,
        transparent 30%,
        ${props => props.theme.colors.primary}20 50%,
        transparent 70%);
      background-size: 200% 200%;
      animation: ${props => props.theme.animation.keyframes.shimmer} 3s infinite;
      pointer-events: none;
    }
  `}
  
  // Оптимизация для мобильных устройств
  @media (max-width: 768px) {
    height: ${props => props.responsive ? 'clamp(140px, 18vw, 200px)' : '60%'};
    
    .progress-overlay {
      height: 3px;
      
      .progress-text {
        font-size: ${props => props.theme.typography.fontSize.xs[0]};
      }
    }
  }
`;

const AnimeCardImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom,
    ${props => props.theme.colors.black}00 0%,
    ${props => props.theme.colors.black}80 100%);
  opacity: 0;
  transition: all ${props => props.theme.transitions.normal} cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  
  @media (hover: hover) {
    ${props => props.isHovered && `
      opacity: 1;
      background: linear-gradient(to bottom,
        ${props => props.theme.colors.black}20 0%,
        ${props => props.theme.colors.black}90 100%);
    `}
  }
  
  // Кнопки действия с улучшенным дизайном и адаптивностью
  .action-buttons {
    display: flex;
    gap: ${props => props.theme.spacing[2]};
    transform: translateY(20px);
    opacity: 0;
    transition: all ${props => props.theme.transitions.normal} cubic-bezier(0.4, 0, 0.2, 1);
    
    @media (hover: hover) {
      ${props => props.isHovered && `
        transform: translateY(0);
        opacity: 1;
      `}
    }
    
    button {
      background: ${props => props.theme.colors.primary};
      border: none;
      border-radius: 50%;
      width: ${props => props.responsive ? 'clamp(40px, 5vw, 48px)' : '48px'};
      height: ${props => props.responsive ? 'clamp(40px, 5vw, 48px)' : '48px'};
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all ${props => props.theme.transitions.fast};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      min-width: 44px; // Минимальный размер для touch-целей
      animation: scaleIn 0.3s ease-out;
      
      @media (hover: hover) {
        &:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
          animation: pulse 1s ease infinite;
        }
      }
      
      &:active {
        transform: scale(0.95);
        animation: shake 0.3s ease-in-out;
      }
      
      svg {
        width: ${props => props.responsive ? 'clamp(16px, 3vw, 24px)' : '24px'};
        height: ${props => props.responsive ? 'clamp(16px, 3vw, 24px)' : '24px'};
        color: white;
      }
    }
  }
  
  // Показываем кнопки на мобильных устройствах при длительном нажатии
  @media (hover: none) {
    opacity: 1;
    background: linear-gradient(to bottom,
      ${props => props.theme.colors.black}20 0%,
      ${props => props.theme.colors.black}90 100%);
    
    .action-buttons {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const AnimeCardImageError = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.theme.colors.surface.tertiary};
`;

const AnimeCardInfo = styled.div`
  width: 100%;
  height: ${props => props.responsive ? 'clamp(60px, 8vw, 120px)' : '33.33%'};
  padding: ${props => props.responsive ? `clamp(${props.theme.spacing[2]}, 2vw, ${props.theme.spacing[3]})` : props.theme.spacing[3]};
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, ${props => props.theme.colors.surface.primary} 0%, ${props => props.theme.colors.surface.secondary} 100%);
  border-top: 1px solid ${props => props.theme.colors.border.lightDark};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg,
      ${props => props.theme.colors.primary} 0%,
      ${props => props.theme.colors.secondary} 50%,
      ${props => props.theme.colors.primary} 100%);
    background-size: 200% 100%;
    animation: ${props => props.theme.animation.keyframes.shimmer} 3s infinite;
    opacity: 0.1;
  }
  
  ${props => !props.responsive && `
    ${props => props.size === 'small' && `
      font-size: ${props => props.theme.typography.fontSize.sm[0]};
    `}
    
    ${props => props.size === 'medium' && `
      font-size: ${props => props.theme.typography.fontSize.base[0]};
    `}
    
    ${props => props.size === 'large' && `
      font-size: ${props => props.theme.typography.fontSize.lg[0]};
    `}
  `}
  
  // Адаптивные стили для мобильных устройств
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing[2]};
    height: ${props => props.responsive ? 'clamp(50px, 7vw, 100px)' : '30%'};
  }
`;

const AnimeCardTitle = styled(Link)`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  line-clamp: 2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-decoration: none;
  transition: all ${props => props.theme.transitions.normal} cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (hover: hover) {
    &:hover {
      color: ${props => props.theme.colors.primary};
      transform: translateX(2px);
    }
  }
`;

const AnimeCardRussianTitle = styled.p`
  font-size: ${props => props.responsive ? `clamp(${props.theme.typography.fontSize.xs[0]}, 0.75rem, 0.875rem)` : props.theme.typography.fontSize.xs[0]};
  color: ${props => props.theme.colors.text.tertiary};
  margin-top: ${props => props.responsive ? `clamp(${props.theme.spacing[0.5]}, 0.5vw, ${props.theme.spacing[1]})` : props.theme.spacing[1]};
  line-clamp: 1;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  transition: color ${props => props.theme.transitions.fast};
  
  @media (hover: hover) {
    &:hover {
      color: ${props => props.theme.colors.text.secondary};
    }
  }
`;

const AnimeCardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${props => props.responsive ? `clamp(${props.theme.spacing[1]}, 1vw, ${props.theme.spacing[2]})` : props.theme.spacing[2]};
  position: relative;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[1]};
  
  &::after {
    content: '';
    position: absolute;
    bottom: -${props => props.responsive ? `clamp(${props.theme.spacing[1]}, 1vw, ${props.theme.spacing[2]})` : props.theme.spacing[2]};
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg,
      transparent 0%,
      ${props => props.theme.colors.border.lightDark} 50%,
      transparent 100%);
    opacity: 0.5;
  }
  
  @media (max-width: 768px) {
    justify-content: flex-start;
  }
`;

const AnimeCardRatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.responsive ? `clamp(${props.theme.spacing[0.5]}, 0.5vw, ${props.theme.spacing[1]})` : props.theme.spacing[1]};
  transition: transform ${props => props.theme.transitions.fast};
  
  @media (hover: hover) {
    &:hover {
      transform: scale(1.05);
    }
  }
`;

const AnimeCardRatingCount = styled.span`
  font-size: ${props => props.responsive ? `clamp(${props.theme.typography.fontSize.xs[0]}, 0.625rem, 0.75rem)` : props.theme.typography.fontSize.xs[0]};
  color: ${props => props.theme.colors.text.tertiary};
  font-weight: ${props => props.theme.typography.fontWeight.normal};
`;

const AnimeCardEpisodeCount = styled.span`
  font-size: ${props => props.responsive ? `clamp(${props.theme.typography.fontSize.xs[0]}, 0.625rem, 0.75rem)` : props.theme.typography.fontSize.xs[0]};
  color: ${props => props.theme.colors.text.tertiary};
  font-weight: ${props => props.theme.typography.fontWeight.normal};
  display: flex;
  align-items: center;
  gap: ${props => props.responsive ? `clamp(${props.theme.spacing[0.5]}, 0.5vw, ${props.theme.spacing[1]})` : props.theme.spacing[1]};
  
  svg {
    width: ${props => props.responsive ? 'clamp(10px, 2vw, 14px)' : '14px'};
    height: ${props => props.responsive ? 'clamp(10px, 2vw, 14px)' : '14px'};
    color: ${props => props.theme.colors.secondary};
  }
`;

const AnimeCardGenres = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.responsive ? `clamp(${props.theme.spacing[0.5]}, 0.5vw, ${props.theme.spacing[1]})` : props.theme.spacing[1]};
  margin-top: ${props => props.responsive ? `clamp(${props.theme.spacing[1]}, 1vw, ${props.theme.spacing[2]})` : props.theme.spacing[2]};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -${props => props.responsive ? `clamp(${props.theme.spacing[0.5]}, 0.5vw, ${props.theme.spacing[1]})` : props.theme.spacing[1]};
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg,
      ${props => props.theme.colors.border.lightDark} 0%,
      transparent 100%);
    opacity: 0.3;
  }
  
  @media (max-width: 768px) {
    gap: ${props => props.theme.spacing[0.5]};
  }
`;

const AnimeCardGenre = styled.span`
  font-size: ${props => props.responsive ? `clamp(${props.theme.typography.fontSize.xs[0]}, 0.75rem, 0.875rem)` : props.theme.typography.fontSize.xs[0]};
  padding: ${props => props.responsive ? `clamp(${props.theme.spacing[0.5]}, 0.5vw, ${props.theme.spacing[1]}) clamp(${props.theme.spacing[1]}, 1vw, ${props.theme.spacing[2]})` : `${props.theme.spacing[1]} ${props.theme.spacing[2]}`};
  background: linear-gradient(135deg, ${props => props.theme.colors.surface.secondary} 0%, ${props => props.theme.colors.surface.tertiary} 100%);
  color: ${props => props.theme.colors.text.secondary};
  border-radius: ${props => props.theme.borderRadius.full};
  border: 1px solid ${props => props.theme.colors.border.lightDark};
  transition: all ${props => props.theme.transitions.fast};
  white-space: nowrap;
  
  @media (hover: hover) {
    &:hover {
      background: linear-gradient(135deg, ${props => props.theme.colors.primary}10 0%, ${props => props.theme.colors.primary}20 100%);
      color: ${props => props.theme.colors.primary};
      border-color: ${props => props.theme.colors.primary}40;
      transform: translateY(-1px);
    }
  }
  
  @media (max-width: 768px) {
    font-size: ${props => props.theme.typography.fontSize.xs[0]};
    padding: ${props => props.theme.spacing[0.5]} ${props.theme.spacing[1]};
  }
`;

const AnimeCardWatchlistIndicator = styled.div`
  position: absolute;
  top: ${props => props.responsive ? `clamp(${props.theme.spacing[2]}, 1.5vw, ${props.theme.spacing[3]})` : props.theme.spacing[3]};
  left: ${props => props.responsive ? `clamp(${props.theme.spacing[2]}, 1.5vw, ${props.theme.spacing[3]})` : props.theme.spacing[3]};
  background: linear-gradient(135deg, ${props => props.theme.colors.success} 0%, ${props => props.theme.colors.primary} 100%);
  color: white;
  border-radius: ${props => props.theme.borderRadius.full};
  padding: ${props => props.responsive ? `clamp(${props.theme.spacing[0.5]}, 0.5vw, ${props.theme.spacing[1]}) clamp(${props.theme.spacing[1]}, 1vw, ${props.theme.spacing[2]})` : `${props.theme.spacing[1]} ${props.theme.spacing[2]}`};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.responsive ? `clamp(${props.theme.spacing[0.5]}, 0.5vw, ${props.theme.spacing[1]})` : props.theme.spacing[1]};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  animation: ${props => props.theme.animation.keyframes.float} 3s ease-in-out infinite;
  z-index: 10;
  
  svg {
    width: ${props => props.responsive ? 'clamp(12px, 2vw, 16px)' : '16px'};
    height: ${props => props.responsive ? 'clamp(12px, 2vw, 16px)' : '16px'};
  }
  
  &::after {
    content: 'В списке';
    font-size: ${props => props.responsive ? `clamp(${props.theme.typography.fontSize.xs[0]}, 0.625rem, 0.75rem)` : props.theme.typography.fontSize.xs[0]};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    white-space: nowrap;
  }
`;

const AnimeCardPremiumIndicator = styled.div`
  position: absolute;
  top: ${props => props.responsive ? `clamp(${props.theme.spacing[2]}, 1.5vw, ${props.theme.spacing[3]})` : props.theme.spacing[3]};
  right: ${props => props.responsive ? `clamp(${props.theme.spacing[2]}, 1.5vw, ${props.theme.spacing[3]})` : props.theme.spacing[3]};
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: white;
  width: ${props => props.responsive ? 'clamp(24px, 3vw, 32px)' : '32px'};
  height: ${props => props.responsive ? 'clamp(24px, 3vw, 32px)' : '32px'};
  border-radius: ${props => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.responsive ? 'clamp(10px, 1.5vw, 14px)' : '14px'};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
  z-index: 10;
  
  .premium-glow {
    position: absolute;
    top: ${props => props.responsive ? 'clamp(-6px, -1vw, -4px)' : '-4px'};
    left: ${props => props.responsive ? 'clamp(-6px, -1vw, -4px)' : '-4px'};
    right: ${props => props.responsive ? 'clamp(-6px, -1vw, -4px)' : '-4px'};
    bottom: ${props => props.responsive ? 'clamp(-6px, -1vw, -4px)' : '-4px'};
    background: radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, rgba(255, 215, 0, 0) 70%);
    border-radius: ${props => props.theme.borderRadius.full};
    animation: ${props => props.theme.animation.keyframes.pulse} 2s infinite;
  }
  
  animation: ${props => props.theme.animation.keyframes.float} 3s ease-in-out infinite;
  
  @media (hover: hover) {
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(255, 215, 0, 0.6);
    }
  }
  
  svg {
    width: ${props => props.responsive ? 'clamp(14px, 2vw, 20px)' : '20px'};
    height: ${props => props.responsive ? 'clamp(14px, 2vw, 20px)' : '20px'};
    color: white;
  }
`;

// Оптимизированный компонент карточки аниме с современным дизайном и полной адаптивностью
const AnimeCard = memo(({
  anime,
  className = '',
  showRating = true,
  showStatus = true,
  showEpisodeCount = true,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  isInWatchlist,
  size = 'medium', // small, medium, large
  premium = false,
  stacked = false,
  showYear = false,
  responsive = true,
  touchTarget = true,
  showQuickActions = true,
  loading = false,
  error = false,
  showProgress = false,
  progress = 0
}) => {
  const { colors } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  
  // Оптимизация с помощью useCallback
  const handleAddToWatchlist = useCallback((e, anime) => {
    e.stopPropagation();
    setIsAnimating(true);
    
    if (onAddToWatchlist) {
      onAddToWatchlist(anime);
    }
    
    setTimeout(() => setIsAnimating(false), 600);
  }, [onAddToWatchlist]);
  
  const handleRemoveFromWatchlist = useCallback((e, anime) => {
    e.stopPropagation();
    setIsAnimating(true);
    
    if (onRemoveFromWatchlist) {
      onRemoveFromWatchlist(anime);
    }
    
    setTimeout(() => setIsAnimating(false), 600);
  }, [onRemoveFromWatchlist]);
  
  // Обработка touch-событий для мобильных устройств
  const handleTouchStart = useCallback(() => {
    if (responsive && showQuickActions) {
      setShowMobileActions(true);
    }
  }, [responsive, showQuickActions]);
  
  const handleTouchEnd = useCallback(() => {
    if (responsive && showQuickActions) {
      setShowMobileActions(false);
    }
  }, [responsive, showQuickActions]);
  
  // Определяем статус аниме с улучшенными цветами
  const getStatusColor = (status) => {
    switch (status) {
      case 'ongoing':
        return 'success';
      case 'completed':
        return 'primary';
      case 'upcoming':
        return 'warning';
      case 'hiatus':
        return 'error';
      default:
        return 'secondary';
    }
  };
  
  // Обработка ошибок загрузки изображения
  const handleImageError = () => {
    setImageError(true);
  };
  
  // Функции уже определены выше с useCallback для оптимизации
  
  // Форматирование года
  const formatYear = useCallback((year) => {
    return year ? `год ${year}` : '';
  }, []);
  
  // Оптимизация рендеринга с useMemo
  const statusBadge = useMemo(() => {
    if (!showStatus || !anime.status) return null;
    
    const statusLabels = {
      ongoing: 'В эфире',
      completed: 'Завершено',
      upcoming: 'Скоро',
      hiatus: 'Перерыв'
    };
    
    return (
      <div className="absolute top-2 right-2 z-20">
        <Badge
          variant={getStatusColor(anime.status)}
          size="small"
          className="text-xs font-medium"
        >
          {statusLabels[anime.status]}
        </Badge>
      </div>
    );
  }, [showStatus, anime.status]);
  
  const ratingBadge = useMemo(() => {
    if (!anime.rating) return null;
    
    return (
      <div className="absolute top-2 left-2 z-20">
        <Badge
          variant="error"
          size="small"
          className="text-xs font-medium"
        >
          {anime.rating}
        </Badge>
      </div>
    );
  }, [anime.rating]);
  
  const premiumBadge = useMemo(() => {
    if (!premium) return null;
    
    return (
      <div className="absolute top-2 right-2 z-20">
        <Badge
          variant="primary"
          size="small"
          className="text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
        >
          PREMIUM
        </Badge>
      </div>
    );
  }, [premium]);
  
  // Рендеринг карточки
  return (
    <AnimeCardContainer
      size={size}
      className={className}
      isStacked={stacked}
      responsive={responsive}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      premium={premium}
    >
      {/* Изображение */}
      <AnimeCardImageContainer
        isPremium={premium}
        showProgress={showProgress}
        progress={progress}
      >
        {imageError ? (
          <AnimeCardImageError>
            <Icon name="image" size={48} color={colors.text.tertiary} />
          </AnimeCardImageError>
        ) : (
          <>
            <img
              src={anime.image || 'https://via.placeholder.com/300x400'}
              alt={anime.title}
              onError={handleImageError}
            />
            
            {/* Progress Bar Overlay */}
            {showProgress && progress > 0 && (
              <div className="progress-overlay">
                <div
                  className="progress-bar"
                  style={{ width: `${progress}%` }}
                />
                <div className="progress-text">
                  {Math.round(progress)}%
                </div>
              </div>
            )}
            
            {/* Оверлей с действиями */}
            <AnimeCardImageOverlay
              isHovered={isHovered || showMobileActions}
              responsive={responsive}
            >
              {(showQuickActions && (isHovered || showMobileActions)) && (
                <div className="action-buttons">
                  <Link to={`/anime/${anime.id}`}>
                    <button
                      aria-label="Просмотреть аниме"
                      title="Просмотреть аниме"
                      responsive={responsive}
                    >
                      <Icon name="play" />
                    </button>
                  </Link>
                  
                  {onAddToWatchlist && (
                    <button
                      onClick={(e) => handleAddToWatchlist(e, anime)}
                      aria-label={isInWatchlist ? "Удалить из списка" : "Добавить в список"}
                      title={isInWatchlist ? "Удалить из списка" : "Добавить в список"}
                      responsive={responsive}
                    >
                      <Icon
                        name={isInWatchlist ? "heart" : "heart"}
                        fill={isInWatchlist ? "currentColor" : "none"}
                      />
                    </button>
                  )}
                </div>
              )}
            </AnimeCardImageOverlay>
          </>
        )}
        
        {/* Статус, рейтинг и премиум бейджи */}
        {statusBadge}
        {ratingBadge}
        {premiumBadge}
      </AnimeCardImageContainer>
      
      {/* Информация */}
      <AnimeCardInfo size={size}>
        {/* Название */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <AnimeCardTitle
            to={`/anime/${anime.id}`}
            title={anime.title}
          >
            {anime.title}
          </AnimeCardTitle>
          
          {/* Русское название */}
          {anime.russianTitle && (
            <AnimeCardRussianTitle>
              {anime.russianTitle}
            </AnimeCardRussianTitle>
          )}
        </div>
        
        {/* Нижняя информация */}
        <AnimeCardFooter>
          {/* Рейтинг */}
          {showRating && anime.ratingValue && (
            <AnimeCardRatingContainer>
              <Rating
                value={anime.ratingValue}
                readonly
                size="small"
                className="text-xs"
              />
              <AnimeCardRatingCount>
                ({anime.ratingCount || 0})
              </AnimeCardRatingCount>
            </AnimeCardRatingContainer>
          )}
          
          {/* Количество эпизодов */}
          {showEpisodeCount && anime.episodeCount && (
            <AnimeCardEpisodeCount>
              <Icon name="video" />
              {anime.episodeCount} эп.
            </AnimeCardEpisodeCount>
          )}
          
          {/* Год */}
          {showYear && anime.year && (
            <AnimeCardEpisodeCount>
              <Icon name="calendar" />
              {anime.year}
            </AnimeCardEpisodeCount>
          )}
        </AnimeCardFooter>
        
        {/* Жанры */}
        {anime.genres && anime.genres.length > 0 && (
          <AnimeCardGenres>
            {anime.genres.slice(0, 2).map((genre, index) => (
              <AnimeCardGenre key={index}>
                {genre}
              </AnimeCardGenre>
            ))}
            {anime.genres.length > 2 && (
              <AnimeCardGenre>
                +{anime.genres.length - 2}
              </AnimeCardGenre>
            )}
          </AnimeCardGenres>
        )}
      </AnimeCardInfo>
      
      {/* Анимация добавления в список */}
      {isInWatchlist && (
        <AnimeCardWatchlistIndicator isAnimating={isAnimating}>
          <Icon name="check" size={16} />
        </AnimeCardWatchlistIndicator>
      )}
      
      {/* Анимация премиум статуса */}
      {premium && (
        <AnimeCardPremiumIndicator>
          <div className="premium-glow" />
          <Icon name="crown" size={20} />
        </AnimeCardPremiumIndicator>
      )}
    </AnimeCardContainer>
  );
});

AnimeCard.propTypes = {
  anime: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    russianTitle: PropTypes.string,
    image: PropTypes.string,
    status: PropTypes.oneOf(['ongoing', 'completed', 'upcoming', 'hiatus']),
    rating: PropTypes.string,
    ratingValue: PropTypes.number,
    ratingCount: PropTypes.number,
    episodeCount: PropTypes.number,
    year: PropTypes.number,
    genres: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  className: PropTypes.string,
  showRating: PropTypes.bool,
  showStatus: PropTypes.bool,
  showEpisodeCount: PropTypes.bool,
  showYear: PropTypes.bool,
  onAddToWatchlist: PropTypes.func,
  onRemoveFromWatchlist: PropTypes.func,
  isInWatchlist: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  premium: PropTypes.bool,
  stacked: PropTypes.bool,
  responsive: PropTypes.bool,
  touchTarget: PropTypes.bool,
  showQuickActions: PropTypes.bool,
  loading: PropTypes.bool,
  error: PropTypes.bool,
  showProgress: PropTypes.bool,
  progress: PropTypes.number,
};

AnimeCard.defaultProps = {
  className: '',
  showRating: true,
  showStatus: true,
  showEpisodeCount: true,
  showYear: false,
  size: 'medium',
  premium: false,
  stacked: false,
  responsive: true,
  touchTarget: true,
  showQuickActions: true,
  loading: false,
  error: false,
  showProgress: false,
  progress: 0,
};

// Компонент группы карточек аниме с полной адаптивностью
const AnimeCardGroup = ({
  animes,
  className = '',
  columns = 4,
  responsive = true,
  gap = '6',
  ...cardProps
}) => {
  // Определяем классы колонок с улучшенной адаптивностью
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
  };
  
  // Определяем классы отступов
  const gapClasses = {
    '1': 'gap-1',
    '2': 'gap-2',
    '3': 'gap-3',
    '4': 'gap-4',
    '5': 'gap-5',
    '6': 'gap-6',
  };
  
  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {animes.map((anime, index) => (
        <AnimeCard
          key={anime.id || index}
          anime={anime}
          responsive={responsive}
          {...cardProps}
        />
      ))}
    </div>
  );
};

AnimeCardGroup.propTypes = {
  animes: PropTypes.arrayOf(PropTypes.object).isRequired,
  className: PropTypes.string,
  columns: PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
  responsive: PropTypes.bool,
  gap: PropTypes.oneOf(['1', '2', '3', '4', '5', '6']),
  ...AnimeCard.propTypes,
};

AnimeCardGroup.defaultProps = {
  className: '',
  columns: 4,
  responsive: true,
  gap: '6',
};

// Компонент списка аниме
const AnimeList = ({ 
  animes, 
  className = '',
  ...cardProps 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {animes.map((anime, index) => (
        <div key={anime.id || index} className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex-shrink-0 w-24 h-36 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
            {anime.image ? (
              <img
                src={anime.image}
                alt={anime.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/100x150';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon name="image" size={24} color="#9CA3AF" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  <Link 
                    to={`/anime/${anime.id}`}
                    className="hover:text-primary transition-colors duration-200"
                  >
                    {anime.title}
                  </Link>
                </h3>
                {anime.russianTitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {anime.russianTitle}
                  </p>
                )}
              </div>
              
              {cardProps.onAddToWatchlist && (
                <Button
                  variant={cardProps.isInWatchlist?.(anime) ? 'primary' : 'outline'}
                  size="small"
                  onClick={() => cardProps.onAddToWatchlist(anime)}
                >
                  {cardProps.isInWatchlist?.(anime) ? 'В списке' : 'Добавить'}
                </Button>
              )}
            </div>
            
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {anime.status && (
                <span>
                  Статус: {anime.status === 'ongoing' ? 'В эфире' : 
                          anime.status === 'completed' ? 'Завершено' : 
                          anime.status === 'upcoming' ? 'Скоро' : 'Перерыв'}
                </span>
              )}
              
              {anime.episodeCount && (
                <span>
                  Эпизоды: {anime.episodeCount}
                </span>
              )}
              
              {anime.year && (
                <span>
                  Год: {anime.year}
                </span>
              )}
            </div>
            
            {anime.genres && anime.genres.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {anime.genres.map((genre, index) => (
                  <span 
                    key={index}
                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
            
            {anime.description && (
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                {anime.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

AnimeList.propTypes = {
  animes: PropTypes.arrayOf(PropTypes.object).isRequired,
  className: PropTypes.string,
  ...AnimeCard.propTypes,
};

export default AnimeCard;
export { AnimeCardGroup, AnimeList };