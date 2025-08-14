import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import Icon from './Icon';
import Button from './Button';
import Badge from './Badge';
import Rating from './Rating';
import styled from 'styled-components';

// Стили для карточки аниме с использованием дизайн-токенов
const AnimeCardContainer = styled.div`
  position: relative;
  border-radius: ${props => props.theme.borderRadius.xl};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadow.md};
  transition: ${props => props.theme.transitions.normal};
  background-color: ${props => props.theme.colors.surface.primary};
  
  &:hover {
    box-shadow: ${props => props.theme.shadow.lg};
    transform: translateY(-4px);
  }
  
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
`;

const AnimeCardImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 66.66%;
  overflow: hidden;
  background-color: ${props => props.theme.colors.surface.tertiary};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AnimeCardImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${props => props.theme.colors.black};
  opacity: 0;
  transition: ${props => props.theme.transitions.normal};
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => props.isHovered && `
    opacity: 0.7;
  `}
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
  height: 33.33%;
  padding: ${props => props.theme.spacing[3]};
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.colors.surface.primary};
  
  ${props => props.size === 'small' && `
    font-size: ${props => props.theme.typography.fontSize.sm[0]};
  `}
  
  ${props => props.size === 'medium' && `
    font-size: ${props => props.theme.typography.fontSize.base[0]};
  `}
  
  ${props => props.size === 'large' && `
    font-size: ${props => props.theme.typography.fontSize.lg[0]};
  `}
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
  transition: ${props => props.theme.transitions.normal};
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const AnimeCardRussianTitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.xs[0]};
  color: ${props => props.theme.colors.text.tertiary};
  margin-top: ${props => props.theme.spacing[1]};
  line-clamp: 1;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
`;

const AnimeCardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${props => props.theme.spacing[2]};
`;

const AnimeCardRatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
`;

const AnimeCardRatingCount = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs[0]};
  color: ${props => props.theme.colors.text.tertiary};
`;

const AnimeCardEpisodeCount = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs[0]};
  color: ${props => props.theme.colors.text.tertiary};
`;

const AnimeCardGenres = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing[1]};
  margin-top: ${props => props.theme.spacing[2]};
`;

const AnimeCardGenre = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs[0]};
  padding: ${props => props.theme.spacing[1]} ${props => props.theme.spacing[2]};
  background-color: ${props => props.theme.colors.surface.secondary};
  color: ${props => props.theme.colors.text.secondary};
  border-radius: ${props => props.theme.borderRadius.full};
`;

const AnimeCardWatchlistIndicator = styled.div`
  position: absolute;
  top: ${props => props.theme.spacing[3]};
  left: ${props => props.theme.spacing[3]};
  background-color: ${props => props.theme.colors.success};
  color: white;
  border-radius: ${props => props.theme.borderRadius.full};
  padding: ${props => props.theme.spacing[1]};
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${props => props.theme.animation.keyframes.pulse} 2s infinite;
`;

// Оптимизированный компонент карточки аниме
const AnimeCard = memo(({ 
  anime, 
  className = '',
  showRating = true,
  showStatus = true,
  showEpisodeCount = true,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  isInWatchlist,
  size = 'medium' // small, medium, large
}) => {
  const { colors } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Определяем статус аниме
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
  
  // Рендеринг карточки
  return (
    <AnimeCardContainer 
      size={size}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Изображение */}
      <AnimeCardImageContainer>
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
            
            {/* Оверлей при наведении */}
            <AnimeCardImageOverlay isHovered={isHovered}>
              {isHovered && (
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link to={`/anime/${anime.id}`}>
                    <Button 
                      variant="primary" 
                      size="small"
                      className="p-2"
                      aria-label="Просмотреть аниме"
                    >
                      <Icon name="play" size={16} />
                    </Button>
                  </Link>
                  
                  {onAddToWatchlist && (
                    <Button 
                      variant="outline" 
                      size="small"
                      className="p-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToWatchlist(anime);
                      }}
                      aria-label={isInWatchlist ? "Удалить из списка" : "Добавить в список"}
                    >
                      <Icon name={isInWatchlist ? "heart" : "heart"} size={16} fill={isInWatchlist ? "currentColor" : "none"} />
                    </Button>
                  )}
                </div>
              )}
            </AnimeCardImageOverlay>
          </>
        )}
        
        {/* Бейдж статуса */}
        {showStatus && anime.status && (
          <div className="absolute top-2 right-2">
            <Badge 
              variant={getStatusColor(anime.status)} 
              size="small"
              className="text-xs"
            >
              {anime.status === 'ongoing' && 'В эфире'}
              {anime.status === 'completed' && 'Завершено'}
              {anime.status === 'upcoming' && 'Скоро'}
              {anime.status === 'hiatus' && 'Перерыв'}
            </Badge>
          </div>
        )}
        
        {/* Бейдж возрастного рейтинга */}
        {anime.rating && (
          <div className="absolute top-2 left-2">
            <Badge 
              variant="error" 
              size="small"
              className="text-xs"
            >
              {anime.rating}
            </Badge>
          </div>
        )}
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
              {anime.episodeCount} эп.
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
        <AnimeCardWatchlistIndicator>
          <Icon name="check" size={16} />
        </AnimeCardWatchlistIndicator>
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
    genres: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  className: PropTypes.string,
  showRating: PropTypes.bool,
  showStatus: PropTypes.bool,
  showEpisodeCount: PropTypes.bool,
  onAddToWatchlist: PropTypes.func,
  onRemoveFromWatchlist: PropTypes.func,
  isInWatchlist: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
};

// Компонент группы карточек аниме
const AnimeCardGroup = ({ 
  animes, 
  className = '',
  columns = 4,
  ...cardProps 
}) => {
  // Определяем классы колонок
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2 sm:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
  };
  
  return (
    <div className={`grid gap-6 ${columnClasses[columns]} ${className}`}>
      {animes.map((anime, index) => (
        <AnimeCard
          key={anime.id || index}
          anime={anime}
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
  ...AnimeCard.propTypes,
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