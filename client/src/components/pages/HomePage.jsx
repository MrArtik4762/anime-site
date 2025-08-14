import React, { useState, useEffect, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../common/ThemeProvider';
import { useFontSize } from '../common/FontSizeController';
import { useBreakpoint } from '../common/Responsive';
import { useMobilePerformance } from '../common/MobilePerformance';
import styled from 'styled-components';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Tag from '../common/Tag';
import Rating from '../common/Rating';
import Breadcrumb from '../common/Breadcrumb';
import Skeleton from '../common/Skeleton';
import Alert from '../common/Alert';
import AnimeCard from '../common/AnimeCard';
import LazyLoad from '../common/LazyLoad';
import TextContrastChecker from '../common/TextContrastChecker';
import { Card, CardHeader, CardTitle, CardBody } from '../common/Card';
import { colors, spacing, breakpoints } from '../../styles/designTokens';

// Стили для главной страницы с использованием дизайн-токенов
const HomePageContainer = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
`;

const HomePageHeader = styled.header`
  position: relative;
  height: 500px;
  overflow: hidden;
  margin-bottom: ${spacing.xxxl};
  
  @media (max-width: ${breakpoints.tablet}) {
    height: 400px;
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    height: 300px;
  }
`;

const HomePageHero = styled.div`
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

const HomePageHeroOverlay = styled.div`
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

const HomePageHeroContent = styled.div`
  position: relative;
  z-index: 1;
  padding: ${spacing.xxl};
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  
  @media (max-width: ${breakpoints.tablet}) {
    padding: ${spacing.lg};
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    padding: ${spacing.md};
  }
`;

const HomePageHeroTitle = styled.h1`
  font-size: ${props => props.fontSize * 3.5}px;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: ${spacing.md};
  line-height: 1.2;
  max-width: 800px;
  
  @media (max-width: ${breakpoints.tablet}) {
    font-size: ${props => props.fontSize * 2.8}px;
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    font-size: ${props => props.fontSize * 2.2}px;
  }
`;

const HomePageHeroSubtitle = styled.p`
  font-size: ${props => props.fontSize * 1.4}px;
  margin-bottom: ${spacing.xl};
  max-width: 600px;
  line-height: 1.6;
  
  @media (max-width: ${breakpoints.mobile}) {
    font-size: ${props => props.fontSize * 1.2}px;
    max-width: 100%;
  }
`;

const HomePageHeroActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  flex-wrap: wrap;
  
  @media (max-width: ${breakpoints.mobile}) {
    flex-direction: column;
    width: 100%;
  }
`;

const HomePageMain = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 ${spacing.md};
  
  @media (max-width: ${breakpoints.mobile}) {
    padding: 0 ${spacing.sm};
  }
`;

const HomePageSection = styled.section`
  margin-bottom: ${spacing.xxxl};
`;

const HomePageSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.xl};
  flex-wrap: wrap;
  gap: ${spacing.md};
`;

const HomePageSectionTitle = styled.h2`
  font-size: ${props => props.fontSize * 2.2}px;
  color: ${props => props.theme.colors.primary};
  
  @media (max-width: ${breakpoints.mobile}) {
    font-size: ${props => props.fontSize * 1.8}px;
  }
`;

const HomePageSectionActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  align-items: center;
`;

const HomePageSectionSubtitle = styled.p`
  font-size: ${props => props.fontSize * 1.1}px;
  color: ${props => props.theme.colors.text.tertiary};
  margin-bottom: ${spacing.lg};
  
  @media (max-width: ${breakpoints.mobile}) {
    font-size: ${props => props.fontSize}px;
  }
`;

const HomePageAnimeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${spacing.lg};
  
  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
`;

const HomePageLoading = styled.div`
  text-align: center;
  padding: ${spacing.xxxl};
`;

const HomePageError = styled.div`
  text-align: center;
  padding: ${spacing.xxxl};
  color: ${props => props.theme.colors.error};
`;

const HomePageEmpty = styled.div`
  text-align: center;
  padding: ${spacing.xxxl};
  color: ${props => props.theme.colors.text.tertiary};
`;

const HomePageEmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${spacing.lg};
  opacity: 0.5;
`;

const HomePageEmptyTitle = styled.h2`
  font-size: ${props => props.fontSize * 1.8}px;
  margin-bottom: ${spacing.md};
  color: ${props => props.theme.colors.text.primary};
`;

const HomePageEmptyMessage = styled.p`
  font-size: ${props => props.fontSize * 1.1}px;
  max-width: 600px;
  margin: 0 auto ${spacing.lg};
  line-height: 1.6;
`;

// Mock data - replace with actual API calls
const mockTrendingAnime = [
  {
    id: 1,
    title: 'Атака Титанов',
    titleEn: 'Attack on Titan',
    titleJp: '進撃の巨人',
    description: 'В мире, где человечество на грани уничтожения...',
    image: '/images/anime/attack-on-titan.jpg',
    rating: 8.9,
    episodes: 75,
    status: 'completed',
    genres: ['Экшн', 'Драма', 'Фэнтези'],
    studios: ['Wit Studio', 'MAPPA'],
    year: 2013,
    season: 'Весна',
    duration: '24 мин',
    score: 9.0,
    popularity: 95,
    isFavorite: false,
    trending: true,
  },
  {
    id: 2,
    title: 'Ванпанчмен',
    titleEn: 'One-Punch Man',
    titleJp: 'ワンパンマン',
    description: 'История о Сайтаме, который может побеждать...',
    image: '/images/anime/one-punch-man.jpg',
    rating: 8.7,
    episodes: 24,
    status: 'completed',
    genres: ['Экшн', 'Комедия', 'Супергероика'],
    studios: ['Madhouse', 'J.C.Staff'],
    year: 2015,
    season: 'Осень',
    duration: '24 мин',
    score: 8.7,
    popularity: 92,
    isFavorite: true,
    trending: true,
  },
  {
    id: 3,
    title: 'Твое имя',
    titleEn: 'Your Name',
    titleJp: '君の名は。',
    description: 'История о двух подростках, которые обмениваются...',
    image: '/images/anime/your-name.jpg',
    rating: 8.4,
    episodes: 1,
    status: 'completed',
    genres: ['Романтика', 'Драма', 'Фэнтези'],
    studios: ['CoMix Wave Films'],
    year: 2016,
    season: 'Лето',
    duration: '106 мин',
    score: 8.4,
    popularity: 88,
    isFavorite: false,
    trending: true,
  },
  {
    id: 4,
    title: 'Магический индекс',
    titleEn: 'A Certain Magical Index',
    titleJp: 'とある魔術の禁書目録',
    description: 'В мире, где существуют как магия, так и наука...',
    image: '/images/anime/a-certain-magical-index.jpg',
    rating: 7.9,
    episodes: 24,
    status: 'completed',
    genres: ['Экшн', 'Сэйнэн', 'Супернатуральное'],
    studios: ['J.C.Staff'],
    year: 2008,
    season: 'Зима',
    duration: '24 мин',
    score: 7.9,
    popularity: 85,
    isFavorite: false,
    trending: true,
  },
];

const mockPopularAnime = [
  {
    id: 5,
    title: 'Наруто',
    titleEn: 'Naruto',
    titleJp: 'NARUTO－ナルト－',
    description: 'История о мальчике-сироте, который мечтает...',
    image: '/images/anime/naruto.jpg',
    rating: 8.2,
    episodes: 220,
    status: 'completed',
    genres: ['Сэйнэн', 'Экшн', 'Приключения'],
    studios: ['Pierrot'],
    year: 2002,
    season: 'Осень',
    duration: '24 мин',
    score: 8.2,
    popularity: 90,
    isFavorite: true,
    popular: true,
  },
  {
    id: 6,
    title: 'Токийский гуль',
    titleEn: 'Tokyo Ghoul',
    titleJp: '東京喰種トーキョーグール',
    description: 'Канeki Кен превращается в гуля после операции...',
    image: '/images/anime/tokyo-ghoul.jpg',
    rating: 8.0,
    episodes: 24,
    status: 'completed',
    genres: ['Экшн', 'Драма', 'Ужасы'],
    studios: ['Pierrot'],
    year: 2014,
    season: 'Лето',
    duration: '24 мин',
    score: 8.0,
    popularity: 87,
    isFavorite: false,
    popular: true,
  },
  {
    id: 7,
    title: 'Магическая битва',
    titleEn: 'Jujutsu Kaisen',
    titleJp: '呪術廻戦',
    description: 'Юдзи Итадори поглощает Сукуну, самого сильного...',
    image: '/images/anime/jujutsu-kaisen.jpg',
    rating: 8.5,
    episodes: 24,
    status: 'completed',
    genres: ['Экшн', 'Супернатуральное', 'Школа'],
    studios: ['MAPPA'],
    year: 2020,
    season: 'Осень',
    duration: '24 мин',
    score: 8.5,
    popularity: 94,
    isFavorite: false,
    popular: true,
  },
  {
    id: 8,
    title: 'Человек-бензопила',
    titleEn: 'Chainsaw Man',
    titleJp: 'チェンソーマン',
    description: 'Дэнги превращается в Chainsaw Man, чтобы...',
    image: '/images/anime/chainsaw-man.jpg',
    rating: 8.3,
    episodes: 12,
    status: 'completed',
    genres: ['Экшн', 'Триллер', 'Супернатуральное'],
    studios: ['MAPPA'],
    year: 2022,
    season: 'Осень',
    duration: '24 мин',
    score: 8.3,
    popularity: 91,
    isFavorite: true,
    popular: true,
  },
];

const mockNewReleases = [
  {
    id: 9,
    title: 'Клинок, рассекающий демонов',
    titleEn: 'Demon Slayer',
    titleJp: '鬼滅の刃',
    description: 'Танджиро Камадо становится охотником на демонов...',
    image: '/images/anime/demon-slayer.jpg',
    rating: 8.6,
    episodes: 26,
    status: 'completed',
    genres: ['Экшн', 'Фэнтези', 'Исторический'],
    studios: ['Ufotable'],
    year: 2019,
    season: 'Апрель',
    duration: '24 мин',
    score: 8.6,
    popularity: 93,
    isFavorite: false,
    newRelease: true,
  },
  {
    id: 10,
    title: 'Моб Психо 100',
    titleEn: 'Mob Psycho 100',
    titleJp: 'モブサイコ100',
    description: 'Шигэо Кагеяма, известный как Моб, обладает...',
    image: '/images/anime/mob-psycho-100.jpg',
    rating: 8.4,
    episodes: 37,
    status: 'completed',
    genres: ['Экшн', 'Комедия', 'Супернатуральное'],
    studios: ['Bones', 'CloverWorks'],
    year: 2016,
    season: 'Лето',
    duration: '24 мин',
    score: 8.4,
    popularity: 86,
    isFavorite: true,
    newRelease: true,
  },
  {
    id: 11,
    title: 'Моя геройская академия',
    titleEn: 'My Hero Academia',
    titleJp: '僕のヒーローアカデミア',
    description: 'В мире, где большинство людей обладают сверхспособностями...',
    image: '/images/anime/my-hero-academia.jpg',
    rating: 8.1,
    episodes: 113,
    status: 'ongoing',
    genres: ['Экшн', 'Сэйнэн', 'Супергероика'],
    studios: ['Bones', 'CloverWorks'],
    year: 2016,
    season: 'Апрель',
    duration: '24 мин',
    score: 8.1,
    popularity: 89,
    isFavorite: false,
    newRelease: true,
  },
  {
    id: 12,
    title: 'Врата Штейна',
    titleEn: 'Steins;Gate',
    titleJp: 'シュタインズ・ゲート',
    description: 'Ринтаро Окабэ - безработный ученый, который...',
    image: '/images/anime/steins-gate.jpg',
    rating: 9.0,
    episodes: 24,
    status: 'completed',
    genres: ['Научная фантастика', 'Триллер', 'Драма'],
    studios: ['White Fox'],
    year: 2011,
    season: 'Апрель',
    duration: '24 мин',
    score: 9.0,
    popularity: 84,
    isFavorite: true,
    newRelease: true,
  },
];

const mockGenres = [
  { name: 'Экшн', count: 245 },
  { name: 'Романтика', count: 189 },
  { name: 'Комедия', count: 312 },
  { name: 'Драма', count: 167 },
  { name: 'Фэнтези', count: 278 },
  { name: 'Научная фантастика', count: 156 },
  { name: 'Сэйнэн', count: 234 },
  { name: 'Сёдзё', count: 198 },
  { name: 'Супернатуральное', count: 145 },
  { name: 'Ужасы', count: 87 },
  { name: 'Меха', count: 76 },
  { name: 'Спорт', count: 92 },
];

const HomePage = memo(({ featuredAnime }) => {
  const { theme } = useTheme();
  const { fontSize } = useFontSize();
  const { isMobile, isTablet } = useBreakpoint();
  const { optimizeForMobile } = useMobilePerformance();
  const navigate = useNavigate();
  
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [popularAnime, setPopularAnime] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Simulate API calls with mock data
  const fetchAnimeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, these would be API calls
      setTrendingAnime(mockTrendingAnime);
      setPopularAnime(mockPopularAnime);
      setNewReleases(mockNewReleases);
      
    } catch (err) {
      setError('Не удалось загрузить аниме. Пожалуйста, попробуйте еще раз.');
      console.error('Error fetching anime:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Initial load
  useEffect(() => {
    fetchAnimeData();
  }, [fetchAnimeData]);
  
  // Handle anime click
  const handleAnimeClick = (animeId) => {
    navigate(`/anime/${animeId}`);
  };
  
  // Handle favorite toggle
  const handleToggleFavorite = (animeId) => {
    setTrendingAnime(prevList =>
      prevList.map(anime =>
        anime.id === animeId
          ? { ...anime, isFavorite: !anime.isFavorite }
          : anime
      )
    );
    
    setPopularAnime(prevList =>
      prevList.map(anime =>
        anime.id === animeId
          ? { ...anime, isFavorite: !anime.isFavorite }
          : anime
      )
    );
    
    setNewReleases(prevList =>
      prevList.map(anime =>
        anime.id === animeId
          ? { ...anime, isFavorite: !anime.isFavorite }
          : anime
      )
    );
  };
  
  // Handle genre click
  const handleGenreClick = (genre) => {
    navigate(`/catalog?genres=${encodeURIComponent(genre)}`);
  };
  
  if (loading) {
    return (
      <HomePageContainer theme={theme}>
        <HomePageLoading>
          <Skeleton variant="rectangular" height={500} style={{ marginBottom: spacing.xxxl }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: spacing.lg }}>
            {[...Array(8)].map((_, index) => (
              <div key={`skeleton-${index}`}>
                <Skeleton variant="rectangular" height={400} />
                <Skeleton variant="text" height={24} style={{ marginTop: 8 }} />
                <Skeleton variant="text" height={16} width="60%" style={{ marginTop: 4 }} />
              </div>
            ))}
          </div>
        </HomePageLoading>
      </HomePageContainer>
    );
  }
  
  if (error) {
    return (
      <HomePageContainer theme={theme}>
        <HomePageError>
          <HomePageEmptyTitle fontSize={fontSize}>Ошибка загрузки</HomePageEmptyTitle>
          <HomePageEmptyMessage fontSize={fontSize}>{error}</HomePageEmptyMessage>
          <Button onClick={fetchAnimeData}>Попробовать снова</Button>
        </HomePageError>
      </HomePageContainer>
    );
  }
  
  return (
    <HomePageContainer theme={theme}>
      <HomePageHeader>
        <HomePageHero backgroundImage="/images/anime/hero-bg.jpg">
          <HomePageHeroOverlay />
          <HomePageHeroContent>
            <HomePageHeroTitle fontSize={fontSize}>
              Добро пожаловать в мир аниме
            </HomePageHeroTitle>
            <HomePageHeroSubtitle fontSize={fontSize}>
              Откройте для себя тысячи аниме-сериалов и фильмов от лучших студий мира. 
              Новые релизы, популярные хиты и эксклюзивное контент ждут вас.
            </HomePageHeroSubtitle>
            <HomePageHeroActions>
              <Button 
                variant="primary" 
                size="large" 
                icon="🔍"
                onClick={() => navigate('/catalog')}
              >
                Искать аниме
              </Button>
              <Button 
                variant="outline" 
                size="large" 
                icon="📋"
                onClick={() => navigate('/catalog')}
              >
                Смотреть каталог
              </Button>
            </HomePageHeroActions>
          </HomePageHeroContent>
        </HomePageHero>
      </HomePageHeader>
      
      <HomePageMain>
        {/* Тренды */}
        <HomePageSection>
          <HomePageSectionHeader>
            <div>
              <HomePageSectionTitle fontSize={fontSize}>🔥 Тренды</HomePageSectionTitle>
              <HomePageSectionSubtitle fontSize={fontSize}>
                Самые популярные аниме этого сезона
              </HomePageSectionSubtitle>
            </div>
            <HomePageSectionActions>
              <Button 
                variant="outline" 
                icon="→"
                onClick={() => navigate('/catalog?trending=true')}
              >
                Все тренды
              </Button>
            </HomePageSectionActions>
          </HomePageSectionHeader>
          
          <HomePageAnimeGrid>
            {trendingAnime.map((anime) => (
              <LazyLoad key={anime.id} once>
                <AnimeCard
                  anime={anime}
                  onToggleFavorite={handleToggleFavorite}
                  onAnimeClick={handleAnimeClick}
                  size={isMobile ? 'small' : isTablet ? 'medium' : 'large'}
                  showRating={true}
                  showStatus={true}
                  showEpisodeCount={true}
                />
              </LazyLoad>
            ))}
          </HomePageAnimeGrid>
        </HomePageSection>
        
        {/* Популярное */}
        <HomePageSection>
          <HomePageSectionHeader>
            <div>
              <HomePageSectionTitle fontSize={fontSize}>⭐ Популярное</HomePageSectionTitle>
              <HomePageSectionSubtitle fontSize={fontSize}>
                Любимые аниме миллионов зрителей
              </HomePageSectionSubtitle>
            </div>
            <HomePageSectionActions>
              <Button 
                variant="outline" 
                icon="→"
                onClick={() => navigate('/catalog?popular=true')}
              >
                Все популярное
              </Button>
            </HomePageSectionActions>
          </HomePageSectionHeader>
          
          <HomePageAnimeGrid>
            {popularAnime.map((anime) => (
              <LazyLoad key={anime.id} once>
                <AnimeCard
                  anime={anime}
                  onToggleFavorite={handleToggleFavorite}
                  onAnimeClick={handleAnimeClick}
                  size={isMobile ? 'small' : isTablet ? 'medium' : 'large'}
                  showRating={true}
                  showStatus={true}
                  showEpisodeCount={true}
                />
              </LazyLoad>
            ))}
          </HomePageAnimeGrid>
        </HomePageSection>
        
        {/* Новинки */}
        <HomePageSection>
          <HomePageSectionHeader>
            <div>
              <HomePageSectionTitle fontSize={fontSize}>✨ Новинки</HomePageSectionTitle>
              <HomePageSectionSubtitle fontSize={fontSize}>
                Свежие релизы и недавно вышедшие аниме
              </HomePageSectionSubtitle>
            </div>
            <HomePageSectionActions>
              <Button 
                variant="outline" 
                icon="→"
                onClick={() => navigate('/catalog?new=true')}
              >
                Все новинки
              </Button>
            </HomePageSectionActions>
          </HomePageSectionHeader>
          
          <HomePageAnimeGrid>
            {newReleases.map((anime) => (
              <LazyLoad key={anime.id} once>
                <AnimeCard
                  anime={anime}
                  onToggleFavorite={handleToggleFavorite}
                  onAnimeClick={handleAnimeClick}
                  size={isMobile ? 'small' : isTablet ? 'medium' : 'large'}
                  showRating={true}
                  showStatus={true}
                  showEpisodeCount={true}
                />
              </LazyLoad>
            ))}
          </HomePageAnimeGrid>
        </HomePageSection>
        
        {/* Жанры */}
        <HomePageSection>
          <HomePageSectionHeader>
            <div>
              <HomePageSectionTitle fontSize={fontSize}>🎭 Жанры</HomePageSectionTitle>
              <HomePageSectionSubtitle fontSize={fontSize}>
                Найдите аниме по вашему любимому жанру
              </HomePageSectionSubtitle>
            </div>
          </HomePageSectionHeader>
          
          <TextContrastChecker
            textColor={theme.colors.text}
            backgroundColor={theme.colors.background}
          >
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: spacing.sm,
              justifyContent: 'center'
            }}>
              {mockGenres.map((genre, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  onClick={() => handleGenreClick(genre.name)}
                  style={{ cursor: 'pointer' }}
                >
                  {genre.name} ({genre.count})
                </Badge>
              ))}
            </div>
          </TextContrastChecker>
        </HomePageSection>
      </HomePageMain>
    </HomePageContainer>
  );
});

HomePage.propTypes = {
  featuredAnime: PropTypes.object,
};

HomePage.defaultProps = {
  featuredAnime: null,
};

export default HomePage;