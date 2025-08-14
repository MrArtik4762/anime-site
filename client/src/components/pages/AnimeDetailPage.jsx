import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../common/ThemeProvider';
import { useFontSize } from '../common/FontSizeController';
import { useBreakpoint } from '../common/Responsive';
import { useMobilePerformance } from '../common/MobilePerformance';
import TextContrastChecker from '../common/TextContrastChecker';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Tag from '../common/Tag';
import Rating from '../common/Rating';
import Breadcrumb from '../common/Breadcrumb';
import Skeleton from '../common/Skeleton';
import Alert from '../common/Alert';
import { colors, spacing, breakpoints } from '../../styles/designTokens';

const AnimeDetailContainer = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme === 'dark' ? colors.background : colors.background};
  color: ${props => props.theme === 'dark' ? colors.text : colors.text};
`;

const AnimeDetailHeader = styled.header`
  position: relative;
  height: 400px;
  overflow: hidden;
  margin-bottom: ${spacing.xxl};
  
  @media (max-width: ${breakpoints.tablet}) {
    height: 300px;
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    height: 200px;
  }
`;

const AnimeCover = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: ${props => `url(${props.backgroundImage})`};
  background-size: cover;
  background-position: center;
  filter: brightness(0.4);
  
  @media (max-width: ${breakpoints.mobile}) {
    background-position: top center;
  }
`;

const AnimeCoverOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.7) 50%,
    rgba(0, 0, 0, 0.9) 100%
  );
`;

const AnimeHeaderContent = styled.div`
  position: relative;
  z-index: 1;
  padding: ${spacing.xl};
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  
  @media (max-width: ${breakpoints.tablet}) {
    padding: ${spacing.lg};
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    padding: ${spacing.md};
  }
`;

const AnimeTitle = styled.h1`
  font-size: ${props => props.fontSize * 3}px;
  font-weight: bold;
  margin-bottom: ${spacing.sm};
  line-height: 1.2;
  
  @media (max-width: ${breakpoints.tablet}) {
    font-size: ${props => props.fontSize * 2.5}px;
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    font-size: ${props => props.fontSize * 2}px;
  }
`;

const AnimeSubtitles = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.sm};
  margin-bottom: ${spacing.md};
`;

const AnimeSubtitle = styled.span`
  font-size: ${props => props.fontSize * 1.1}px;
  color: ${colors.textSecondary};
  font-style: italic;
`;

const AnimeMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing.md};
  align-items: center;
  margin-bottom: ${spacing.lg};
`;

const AnimeMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  font-size: ${props => props.fontSize * 1.1}px;
  color: ${colors.textSecondary};
`;

const AnimeRating = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const AnimeDetailContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${spacing.md};
  
  @media (max-width: ${breakpoints.tablet}) {
    padding: 0 ${spacing.sm};
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    padding: 0 ${spacing.xs};
  }
`;

const AnimeInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: ${spacing.xxl};
  margin-bottom: ${spacing.xxl};
  
  @media (max-width: ${breakpoints.desktop}) {
    grid-template-columns: 250px 1fr;
    gap: ${spacing.lg};
  }
  
  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: ${spacing.lg};
  }
`;

const AnimePosterContainer = styled.div`
  position: relative;
  border-radius: ${spacing.md};
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  
  @media (max-width: ${breakpoints.tablet}) {
    max-width: 250px;
    margin: 0 auto;
  }
`;

const AnimePoster = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AnimePosterSkeleton = styled(Skeleton)`
  width: 100%;
  height: 400px;
  
  @media (max-width: ${breakpoints.tablet}) {
    height: 350px;
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    height: 300px;
  }
`;

const AnimeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const AnimeDescription = styled.div`
  line-height: 1.6;
  
  p {
    margin-bottom: ${spacing.md};
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const AnimeStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${spacing.md};
`;

const AnimeStat = styled.div`
  background-color: ${props => props.theme === 'dark' ? colors.surface : colors.background};
  padding: ${spacing.md};
  border-radius: ${spacing.md};
  text-align: center;
  border: 1px solid ${props => props.theme === 'dark' ? colors.border : colors.border};
`;

const AnimeStatValue = styled.div`
  font-size: ${props => props.fontSize * 1.5}px;
  font-weight: bold;
  color: ${colors.primary};
  margin-bottom: ${spacing.xs};
`;

const AnimeStatLabel = styled.div`
  font-size: ${props => props.fontSize * 0.9}px;
  color: ${colors.textSecondary};
`;

const AnimeDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${spacing.lg};
`;

const AnimeDetailSection = styled.div`
  background-color: ${props => props.theme === 'dark' ? colors.surface : colors.background};
  padding: ${spacing.lg};
  border-radius: ${spacing.md};
  border: 1px solid ${props => props.theme === 'dark' ? colors.border : colors.border};
`;

const AnimeDetailSectionTitle = styled.h3`
  font-size: ${props => props.fontSize * 1.3}px;
  margin-bottom: ${spacing.md};
  color: ${colors.primary};
`;

const AnimeDetailList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    margin-bottom: ${spacing.sm};
    padding-bottom: ${spacing.sm};
    border-bottom: 1px solid ${props => props.theme === 'dark' ? colors.border : colors.border};
    
    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
  }
`;

const AnimeDetailListItem = styled.span`
  display: inline-block;
  background-color: ${props => props.theme === 'dark' ? colors.border : colors.borderLight};
  padding: ${spacing.xs} ${spacing.sm};
  border-radius: ${spacing.sm};
  margin-right: ${spacing.xs};
  margin-bottom: ${spacing.xs};
  font-size: ${props => props.fontSize * 0.95}px;
`;

const AnimeActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  margin-top: ${spacing.lg};
  flex-wrap: wrap;
`;

const RelatedAnime = styled.div`
  margin-top: ${spacing.xxl};
`;

const RelatedAnimeTitle = styled.h2`
  font-size: ${props => props.fontSize * 2}px;
  margin-bottom: ${spacing.lg};
`;

const RelatedAnimeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${spacing.lg};
  
  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
`;

const RelatedAnimeCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? colors.surface : colors.background};
  border-radius: ${spacing.md};
  overflow: hidden;
  border: 1px solid ${props => props.theme === 'dark' ? colors.border : colors.border};
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const RelatedAnimePoster = styled.img`
  width: 100%;
  height: 280px;
  object-fit: cover;
  
  @media (max-width: ${breakpoints.mobile}) {
    height: 200px;
  }
`;

const RelatedAnimeInfo = styled.div`
  padding: ${spacing.sm};
`;

const RelatedAnimeTitleText = styled.h4`
  font-size: ${props => props.fontSize * 1.1}px;
  margin-bottom: ${spacing.xs};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RelatedAnimeMeta = styled.div`
  font-size: ${props => props.fontSize * 0.9}px;
  color: ${colors.textSecondary};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${spacing.xxxl};
`;

const ErrorState = styled.div`
  text-align: center;
  padding: ${spacing.xxxl};
  color: ${colors.error};
`;

// Mock data - replace with actual API calls
const mockAnimeData = {
  id: 1,
  title: 'Атака Титанов',
  titleEn: 'Attack on Titan',
  titleJp: '進撃の巨人',
  description: `
    В мире, где человечество на грани уничтожения из-за гигантских существ, известных как Титаны, 
    выжившие живут за стенами, защищающими их от этих чудовищ. История следует за Эреном Йегером, 
    который, свидетелем разрушения своего города и гибели матери, клянется уничтожить всех Титанов.
    
    Через пять лет Эрен, его приемная сестра Микаса и их друг Армин вступают в Разведкорпус, 
    элитное подразделение, сражающееся с Титанами за стенами. Они сталкиваются с ужасающей реальностью 
    борьбы за выживание и открывают шокирующие тайны о мире и самих Титанах.
  `,
  image: '/images/anime/attack-on-titan.jpg',
  backgroundImage: '/images/anime/attack-on-titan-bg.jpg',
  rating: 8.9,
  episodes: 75,
  status: 'Завершено',
  genres: ['Экшн', 'Драма', 'Фэнтези', 'Триллер'],
  studios: ['Wit Studio', 'MAPPA'],
  year: 2013,
  season: 'Весна',
  duration: '24 мин',
  score: 9.0,
  popularity: 95,
  isFavorite: false,
  aired: {
    from: '2013-04-07',
    to: '2013-09-29',
    string: '7 Апр 2013 - 29 Сен 2013'
  },
  broadcast: {
    day: 'Суббота',
    time: '05:15',
    timezone: 'JST'
  },
  duration: '24 мин',
  rating: 'R - 17+ (насилие, кровавое изображение)'
};

const mockRelatedAnime = [
  {
    id: 2,
    title: 'Ванпанчмен',
    image: '/images/anime/one-punch-man.jpg',
    year: 2015,
    episodes: 24,
    rating: 8.7
  },
  {
    id: 3,
    title: 'Твое имя',
    image: '/images/anime/your-name.jpg',
    year: 2016,
    episodes: 1,
    rating: 8.4
  },
  {
    id: 4,
    title: 'Магический индекс',
    image: '/images/anime/a-certain-magical-index.jpg',
    year: 2008,
    episodes: 24,
    rating: 7.9
  },
  {
    id: 5,
    title: 'Наруто',
    image: '/images/anime/naruto.jpg',
    year: 2002,
    episodes: 220,
    rating: 8.2
  }
];

const AnimeDetailPage = ({ id: propId }) => {
  const { theme } = useTheme();
  const { fontSize } = useFontSize();
  const { isMobile, isTablet } = useBreakpoint();
  const { optimizeForMobile } = useMobilePerformance();
  
  const { id } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get anime ID from props or URL params
  const animeId = propId || id;
  
  // Simulate API call with mock data
  const fetchAnime = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be an API call
      setAnime(mockAnimeData);
      
    } catch (err) {
      setError('Не удалось загрузить информацию об аниме. Пожалуйста, попробуйте еще раз.');
      console.error('Error fetching anime:', err);
    } finally {
      setLoading(false);
    }
  }, [animeId]);
  
  // Initial load
  useEffect(() => {
    fetchAnime();
  }, [fetchAnime]);
  
  // Handle favorite toggle
  const handleToggleFavorite = () => {
    if (anime) {
      setAnime(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
    }
  };
  
  // Handle back to catalog
  const handleBackToCatalog = () => {
    navigate('/catalog');
  };
  
  // Handle related anime click
  const handleRelatedAnimeClick = (relatedId) => {
    navigate(`/anime/${relatedId}`);
  };
  
  if (loading) {
    return (
      <AnimeDetailContainer theme={theme}>
        <LoadingState>
          <Skeleton variant="rectangular" height={400} style={{ marginBottom: spacing.xxl }} />
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: spacing.xxl }}>
            <AnimePosterSkeleton />
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
              <Skeleton variant="text" height={48} width="80%" />
              <Skeleton variant="text" height={24} width="60%" />
              <Skeleton variant="text" height={24} width="40%" />
              <Skeleton variant="text" height={200} />
            </div>
          </div>
        </LoadingState>
      </AnimeDetailContainer>
    );
  }
  
  if (error) {
    return (
      <AnimeDetailContainer theme={theme}>
        <ErrorState>
          <h2 style={{ fontSize: fontSize * 2, marginBottom: spacing.lg }}>Ошибка загрузки</h2>
          <p style={{ fontSize: fontSize * 1.1, marginBottom: spacing.lg }}>{error}</p>
          <Button onClick={fetchAnime}>Попробовать снова</Button>
        </ErrorState>
      </AnimeDetailContainer>
    );
  }
  
  if (!anime) {
    return (
      <AnimeDetailContainer theme={theme}>
        <ErrorState>
          <h2 style={{ fontSize: fontSize * 2, marginBottom: spacing.lg }}>Аниме не найдено</h2>
          <Button onClick={handleBackToCatalog}>Вернуться в каталог</Button>
        </ErrorState>
      </AnimeDetailContainer>
    );
  }
  
  return (
    <AnimeDetailContainer theme={theme}>
      <AnimeDetailHeader>
        <AnimeCover backgroundImage={anime.backgroundImage} />
        <AnimeCoverOverlay />
        <AnimeHeaderContent>
          <Breadcrumb
            items={[
              { label: 'Главная', href: '/' },
              { label: 'Каталог', href: '/catalog' },
              { label: anime.title }
            ]}
            fontSize={fontSize}
          />
          <AnimeTitle fontSize={fontSize}>{anime.title}</AnimeTitle>
          <AnimeSubtitles fontSize={fontSize}>
            <AnimeSubtitle>{anime.titleEn}</AnimeSubtitle>
            <AnimeSubtitle>{anime.titleJp}</AnimeSubtitle>
          </AnimeSubtitles>
          <AnimeMeta fontSize={fontSize}>
            <AnimeMetaItem>
              <span>📅</span>
              <span>{anime.aired.string}</span>
            </AnimeMetaItem>
            <AnimeMetaItem>
              <span>⏱️</span>
              <span>{anime.duration}</span>
            </AnimeMetaItem>
            <AnimeMetaItem>
              <span>📺</span>
              <span>{anime.broadcast.day} в {anime.broadcast.time}</span>
            </AnimeMetaItem>
            <AnimeMetaItem>
              <span>📊</span>
              <span>{anime.episodes} эпизодов</span>
            </AnimeMetaItem>
          </AnimeMeta>
          <AnimeRating>
            <Rating value={anime.score} readonly />
            <span style={{ fontSize: fontSize * 1.1, color: colors.textSecondary }}>
              {anime.score}/10
            </span>
          </AnimeRating>
        </AnimeHeaderContent>
      </AnimeDetailHeader>
      
      <AnimeDetailContent>
        <AnimeInfoGrid>
          <AnimePosterContainer>
            <AnimePoster 
              src={anime.image} 
              alt={`${anime.title} постер`}
              loading="lazy"
            />
          </AnimePosterContainer>
          
          <AnimeInfo>
            <TextContrastChecker
              textColor={theme === 'dark' ? colors.text : colors.text}
              backgroundColor={theme === 'dark' ? colors.background : colors.background}
            >
              <AnimeDescription>
                <p>{anime.description}</p>
              </AnimeDescription>
            </TextContrastChecker>
            
            <AnimeStats fontSize={fontSize}>
              <AnimeStat theme={theme}>
                <AnimeStatValue fontSize={fontSize}>{anime.rating}</AnimeStatValue>
                <AnimeStatLabel fontSize={fontSize}>Рейтинг</AnimeStatLabel>
              </AnimeStat>
              <AnimeStat theme={theme}>
                <AnimeStatValue fontSize={fontSize}>{anime.popularity}</AnimeStatValue>
                <AnimeStatLabel fontSize={fontSize}>Популярность</AnimeStatLabel>
              </AnimeStat>
              <AnimeStat theme={theme}>
                <AnimeStatValue fontSize={fontSize}>{anime.episodes}</AnimeStatValue>
                <AnimeStatLabel fontSize={fontSize}>Эпизоды</AnimeStatLabel>
              </AnimeStat>
              <AnimeStat theme={theme}>
                <AnimeStatValue fontSize={fontSize}>{anime.year}</AnimeStatValue>
                <AnimeStatLabel fontSize={fontSize}>Год</AnimeStatLabel>
              </AnimeStat>
            </AnimeStats>
            
            <AnimeActions>
              <Button
                variant={anime.isFavorite ? 'secondary' : 'primary'}
                onClick={handleToggleFavorite}
                icon={anime.isFavorite ? '❤️' : '🤍'}
              >
                {anime.isFavorite ? 'В избранном' : 'В избранное'}
              </Button>
              <Button variant="outline" icon="📺" onClick={handleBackToCatalog}>
                Смотреть
              </Button>
              <Button variant="outline" icon="📤">
                Поделиться
              </Button>
            </AnimeActions>
          </AnimeInfo>
        </AnimeInfoGrid>
        
        <AnimeDetails fontSize={fontSize}>
          <AnimeDetailSection theme={theme}>
            <AnimeDetailSectionTitle fontSize={fontSize}>Жанры</AnimeDetailSectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.sm }}>
              {anime.genres.map((genre, index) => (
                <Badge key={index} variant="outline">
                  {genre}
                </Badge>
              ))}
            </div>
          </AnimeDetailSection>
          
          <AnimeDetailSection theme={theme}>
            <AnimeDetailSectionTitle fontSize={fontSize}>Студии</AnimeDetailSectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.sm }}>
              {anime.studios.map((studio, index) => (
                <Badge key={index} variant="secondary">
                  {studio}
                </Badge>
              ))}
            </div>
          </AnimeDetailSection>
          
          <AnimeDetailSection theme={theme}>
            <AnimeDetailSectionTitle fontSize={fontSize}>Статус</AnimeDetailSectionTitle>
            <Tag variant={anime.status === 'Завершено' ? 'success' : 'warning'}>
              {anime.status}
            </Tag>
          </AnimeDetailSection>
          
          <AnimeDetailSection theme={theme}>
            <AnimeDetailSectionTitle fontSize={fontSize}>Возрастное ограничение</AnimeDetailSectionTitle>
            <div style={{ fontSize: fontSize * 1.1 }}>{anime.rating}</div>
          </AnimeDetailSection>
        </AnimeDetails>
        
        <RelatedAnime>
          <RelatedAnimeTitle fontSize={fontSize}>Похожее аниме</RelatedAnimeTitle>
          <RelatedAnimeGrid>
            {mockRelatedAnime.map((relatedAnime) => (
              <RelatedAnimeCard 
                key={relatedAnime.id} 
                onClick={() => handleRelatedAnimeClick(relatedAnime.id)}
                theme={theme}
              >
                <RelatedAnimePoster 
                  src={relatedAnime.image} 
                  alt={relatedAnime.title}
                  loading="lazy"
                />
                <RelatedAnimeInfo>
                  <RelatedAnimeTitleText fontSize={fontSize}>{relatedAnime.title}</RelatedAnimeTitleText>
                  <RelatedAnimeMeta fontSize={fontSize}>
                    {relatedAnime.year} • {relatedAnime.episodes} эп.
                  </RelatedAnimeMeta>
                  <RelatedAnimeMeta fontSize={fontSize}>
                    Рейтинг: {relatedAnime.rating}
                  </RelatedAnimeMeta>
                </RelatedAnimeInfo>
              </RelatedAnimeCard>
            ))}
          </RelatedAnimeGrid>
        </RelatedAnime>
      </AnimeDetailContent>
    </AnimeDetailContainer>
  );
};

AnimeDetailPage.propTypes = {
  id: PropTypes.string,
};

AnimeDetailPage.defaultProps = {
  id: undefined,
};

export default AnimeDetailPage;