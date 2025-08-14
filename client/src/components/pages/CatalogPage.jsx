import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useTheme } from '../common/ThemeProvider';
import { useFontSize } from '../common/FontSizeController';
import { useBreakpoint } from '../common/Responsive';
import { useMobilePerformance } from '../common/MobilePerformance';
import AnimeCard from '../common/AnimeCard';
import AnimeFilter from '../common/AnimeFilter';
import ScrollPagination from '../common/ScrollPagination';
import Skeleton from '../common/Skeleton';
import TextContrastChecker from '../common/TextContrastChecker';
import { colors, spacing, breakpoints } from '../../styles/designTokens';

const CatalogPageContainer = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme === 'dark' ? colors.background : colors.background};
  color: ${props => props.theme === 'dark' ? colors.text : colors.text};
`;

const CatalogHeader = styled.header`
  padding: ${spacing.lg} 0;
  text-align: center;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? colors.border : colors.border};
  margin-bottom: ${spacing.xl};
`;

const CatalogTitle = styled.h1`
  font-size: ${props => props.fontSize * 2.5}px;
  font-weight: bold;
  margin-bottom: ${spacing.md};
  color: ${props => props.theme === 'dark' ? colors.text : colors.text};
`;

const CatalogSubtitle = styled.p`
  font-size: ${props => props.fontSize * 1.1}px;
  color: ${props => props.theme === 'dark' ? colors.textSecondary : colors.textSecondary};
  max-width: 800px;
  margin: 0 auto ${spacing.lg};
`;

const CatalogContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 ${spacing.md};
  
  @media (max-width: ${breakpoints.tablet}) {
    padding: 0 ${spacing.sm};
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    padding: 0 ${spacing.xs};
  }
`;

const FilterSection = styled.section`
  margin-bottom: ${spacing.xl};
  background-color: ${props => props.theme === 'dark' ? colors.surface : colors.background};
  padding: ${spacing.lg};
  border-radius: ${spacing.md};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ResultsSection = styled.section`
  margin-bottom: ${spacing.xl};
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.lg};
  flex-wrap: wrap;
  gap: ${spacing.sm};
`;

const ResultsCount = styled.div`
  font-size: ${props => props.fontSize * 1.1}px;
  color: ${props => props.theme === 'dark' ? colors.textSecondary : colors.textSecondary};
`;

const SortControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const SortSelect = styled.select`
  padding: ${spacing.sm} ${spacing.md};
  border: 1px solid ${props => props.theme === 'dark' ? colors.border : colors.border};
  border-radius: ${spacing.sm};
  background-color: ${props => props.theme === 'dark' ? colors.background : colors.background};
  color: ${props => props.theme === 'dark' ? colors.text : colors.text};
  font-size: ${props => props.fontSize}px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const AnimeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${spacing.lg};
  
  @media (max-width: ${breakpoints.tablet}) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: ${spacing.md};
  }
  
  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: ${spacing.sm};
  }
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: ${spacing.xl} auto;
  padding: ${spacing.md} ${spacing.lg};
  background-color: ${colors.primary};
  color: white;
  border: none;
  border-radius: ${spacing.sm};
  font-size: ${props => props.fontSize}px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${colors.primaryHover};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background-color: ${colors.disabled};
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${spacing.xxl} ${spacing.lg};
  color: ${props => props.theme === 'dark' ? colors.textSecondary : colors.textSecondary};
`;

const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${spacing.lg};
  opacity: 0.5;
`;

const EmptyStateTitle = styled.h2`
  font-size: ${props => props.fontSize * 1.8}px;
  margin-bottom: ${spacing.md};
  color: ${props => props.theme === 'dark' ? colors.text : colors.text};
`;

const EmptyStateMessage = styled.p`
  font-size: ${props => props.fontSize * 1.1}px;
  max-width: 600px;
  margin: 0 auto ${spacing.lg};
  line-height: 1.6;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: ${spacing.xxl} ${spacing.lg};
  color: ${colors.error};
`;

const ErrorStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${spacing.lg};
`;

const ErrorStateTitle = styled.h2`
  font-size: ${props => props.fontSize * 1.8}px;
  margin-bottom: ${spacing.md};
`;

const ErrorStateMessage = styled.p`
  font-size: ${props => props.fontSize * 1.1}px;
  max-width: 600px;
  margin: 0 auto ${spacing.lg};
  line-height: 1.6;
`;

const RetryButton = styled.button`
  margin-top: ${spacing.lg};
  padding: ${spacing.sm} ${spacing.md};
  background-color: ${colors.primary};
  color: white;
  border: none;
  border-radius: ${spacing.sm};
  font-size: ${props => props.fontSize}px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${colors.primaryHover};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

// Mock data - replace with actual API calls
const mockAnimeData = [
  {
    id: 1,
    title: 'Атака Титанов',
    titleEn: 'Attack on Titan',
    titleJp: '進撃の巨人',
    description: 'В мире, где человечество на грани уничтожения из-за гигантских существ...',
    image: '/images/anime/attack-on-titan.jpg',
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
  },
  {
    id: 2,
    title: 'Ванпанчмен',
    titleEn: 'One-Punch Man',
    titleJp: 'ワンパンマン',
    description: 'История о Сайтаме, который может побеждить любого противника одним ударом...',
    image: '/images/anime/one-punch-man.jpg',
    rating: 8.7,
    episodes: 24,
    status: 'Завершено',
    genres: ['Экшн', 'Комедия', 'Супергероика', 'Сэйнэн'],
    studios: ['Madhouse', 'J.C.Staff'],
    year: 2015,
    season: 'Осень',
    duration: '24 мин',
    score: 8.7,
    popularity: 92,
    isFavorite: true,
  },
  {
    id: 3,
    title: 'Твое имя',
    titleEn: 'Your Name',
    titleJp: '君の名は。',
    description: 'История о двух подростках, которые обмениваются телами...',
    image: '/images/anime/your-name.jpg',
    rating: 8.4,
    episodes: 1,
    status: 'Фильм',
    genres: ['Романтика', 'Драма', 'Фэнтези', 'Супернатуральное'],
    studios: ['CoMix Wave Films'],
    year: 2016,
    season: 'Лето',
    duration: '106 мин',
    score: 8.4,
    popularity: 88,
    isFavorite: false,
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
    status: 'Завершено',
    genres: ['Экшн', 'Сэйнэн', 'Супернатуральное', 'Научная фантастика'],
    studios: ['J.C.Staff'],
    year: 2008,
    season: 'Зима',
    duration: '24 мин',
    score: 7.9,
    popularity: 85,
    isFavorite: false,
  },
  {
    id: 5,
    title: 'Наруто',
    titleEn: 'Naruto',
    titleJp: 'NARUTO－ナルト－',
    description: 'История о мальчике-сироте, который мечтает стать Хокаге...',
    image: '/images/anime/naruto.jpg',
    rating: 8.2,
    episodes: 220,
    status: 'Завершено',
    genres: ['Сэйнэн', 'Экшн', 'Приключения', 'Меха'],
    studios: ['Pierrot'],
    year: 2002,
    season: 'Осень',
    duration: '24 мин',
    score: 8.2,
    popularity: 90,
    isFavorite: true,
  },
  {
    id: 6,
    title: 'Токийский гуль',
    titleEn: 'Tokyo Ghoul',
    titleJp: '東京喰種トーキョーグール',
    description: 'Канeki Кен превращается в гуля после операции по пересадке органов...',
    image: '/images/anime/tokyo-ghoul.jpg',
    rating: 8.0,
    episodes: 24,
    status: 'Завершено',
    genres: ['Экшн', 'Драма', 'Ужасы', 'Триллер'],
    studios: ['Pierrot'],
    year: 2014,
    season: 'Лето',
    duration: '24 мин',
    score: 8.0,
    popularity: 87,
    isFavorite: false,
  },
];

const CatalogPage = ({ 
  initialFilters = {}, 
  initialSort = 'popularity',
  pageSize = 20,
  showFilters = true,
  showSorting = true,
  showPagination = true,
  id
}) => {
  const { theme } = useTheme();
  const { fontSize } = useFontSize();
  const { isMobile, isTablet } = useBreakpoint();
  const { optimizeForMobile } = useMobilePerformance();
  
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Simulate API call with mock data
  const fetchAnime = useCallback(async (pageNum, currentFilters, currentSort) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter and sort mock data
      let filteredData = [...mockAnimeData];
      
      // Apply search filter
      if (searchQuery) {
        filteredData = filteredData.filter(anime => 
          anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          anime.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          anime.titleJp.toLowerCase().includes(searchQuery.toLowerCase()) ||
          anime.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Apply other filters
      if (currentFilters.genres && currentFilters.genres.length > 0) {
        filteredData = filteredData.filter(anime =>
          anime.genres.some(genre => currentFilters.genres.includes(genre))
        );
      }
      
      if (currentFilters.status && currentFilters.status.length > 0) {
        filteredData = filteredData.filter(anime =>
          currentFilters.status.includes(anime.status)
        );
      }
      
      if (currentFilters.year) {
        filteredData = filteredData.filter(anime =>
          anime.year === currentFilters.year
        );
      }
      
      if (currentFilters.season) {
        filteredData = filteredData.filter(anime =>
          anime.season === currentFilters.season
        );
      }
      
      // Sort data
      filteredData.sort((a, b) => {
        switch (currentSort) {
          case 'rating':
            return b.rating - a.rating;
          case 'popularity':
            return b.popularity - a.popularity;
          case 'year':
            return b.year - a.year;
          case 'score':
            return b.score - a.score;
          case 'episodes':
            return b.episodes - a.episodes;
          case 'title':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
      
      // Simulate pagination
      const startIndex = (pageNum - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      setAnimeList(prev => pageNum === 1 ? paginatedData : [...prev, ...paginatedData]);
      setHasMore(endIndex < filteredData.length);
      setPage(pageNum);
      
    } catch (err) {
      setError('Не удалось загрузить аниме. Пожалуйста, попробуйте еще раз.');
      console.error('Error fetching anime:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, pageSize]);
  
  // Initial load
  useEffect(() => {
    fetchAnime(1, filters, sort);
  }, [filters, sort, fetchAnime]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    setAnimeList([]);
    fetchAnime(1, newFilters, sort);
  };
  
  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
    setAnimeList([]);
    fetchAnime(1, filters, sort, query);
  };
  
  // Handle sort change
  const handleSortChange = (newSort) => {
    setSort(newSort);
    setPage(1);
    setAnimeList([]);
    fetchAnime(1, filters, newSort);
  };
  
  // Load more
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchAnime(page + 1, filters, sort);
    }
  };
  
  // Handle favorite toggle
  const handleToggleFavorite = (animeId) => {
    setAnimeList(prevList =>
      prevList.map(anime =>
        anime.id === animeId
          ? { ...anime, isFavorite: !anime.isFavorite }
          : anime
      )
    );
  };
  
  // Optimize for mobile
  const optimizedGrid = optimizeForMobile
    ? { gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }
    : {};
  
  return (
    <CatalogPageContainer theme={theme} id={id}>
      <CatalogHeader>
        <TextContrastChecker
          textColor={theme === 'dark' ? colors.text : colors.text}
          backgroundColor={theme === 'dark' ? colors.background : colors.background}
        >
          <CatalogTitle fontSize={fontSize}>Каталог аниме</CatalogTitle>
          <CatalogSubtitle fontSize={fontSize}>
            Откройте для себя тысячи аниме-сериалов и фильмов от лучших студий мира
          </CatalogSubtitle>
        </TextContrastChecker>
      </CatalogHeader>
      
      <CatalogContent>
        {showFilters && (
          <FilterSection theme={theme}>
            <AnimeFilter
              filters={filters}
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              searchQuery={searchQuery}
            />
          </FilterSection>
        )}
        
        <ResultsSection>
          <ResultsHeader>
            <ResultsCount fontSize={fontSize}>
              Найдено: {animeList.length} аниме
            </ResultsCount>
            
            {showSorting && (
              <SortControls>
                <span>Сортировка:</span>
                <SortSelect
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  fontSize={fontSize}
                  theme={theme}
                >
                  <option value="popularity">По популярности</option>
                  <option value="rating">По рейтингу</option>
                  <option value="score">По оценке</option>
                  <option value="year">По году</option>
                  <option value="episodes">По эпизодам</option>
                  <option value="title">По названию</option>
                </SortSelect>
              </SortControls>
            )}
          </ResultsHeader>
          
          {error ? (
            <ErrorState>
              <ErrorStateIcon>⚠️</ErrorStateIcon>
              <ErrorStateTitle fontSize={fontSize}>Ошибка загрузки</ErrorStateTitle>
              <ErrorStateMessage fontSize={fontSize}>{error}</ErrorStateMessage>
              <RetryButton
                onClick={() => fetchAnime(1, filters, sort)}
                fontSize={fontSize}
              >
                Попробовать снова
              </RetryButton>
            </ErrorState>
          ) : animeList.length === 0 && !loading ? (
            <EmptyState>
              <EmptyStateIcon>🔍</EmptyStateIcon>
              <EmptyStateTitle fontSize={fontSize}>Ничего не найдено</EmptyStateTitle>
              <EmptyStateMessage fontSize={fontSize}>
                Попробуйте изменить параметры поиска или фильтры
              </EmptyStateMessage>
            </EmptyState>
          ) : (
            <>
              <AnimeGrid style={optimizedGrid}>
                {animeList.map((anime) => (
                  <AnimeCard
                    key={anime.id}
                    anime={anime}
                    onToggleFavorite={handleToggleFavorite}
                    size={isMobile ? 'small' : isTablet ? 'medium' : 'large'}
                  />
                ))}
                
                {loading && (
                  <>
                    {[...Array(pageSize)].map((_, index) => (
                      <div key={`skeleton-${index}`}>
                        <Skeleton variant="rectangular" height={isMobile ? 200 : 300} />
                        <Skeleton variant="text" height={20} style={{ marginTop: 8 }} />
                        <Skeleton variant="text" height={16} width="60%" style={{ marginTop: 4 }} />
                      </div>
                    ))}
                  </>
                )}
              </AnimeGrid>
              
              {showPagination && hasMore && (
                <LoadMoreButton
                  onClick={loadMore}
                  disabled={loading}
                  fontSize={fontSize}
                >
                  {loading ? 'Загрузка...' : 'Загрузить еще'}
                </LoadMoreButton>
              )}
            </>
          )}
        </ResultsSection>
      </CatalogContent>
    </CatalogPageContainer>
  );
};

CatalogPage.propTypes = {
  initialFilters: PropTypes.object,
  initialSort: PropTypes.oneOf(['popularity', 'rating', 'score', 'year', 'episodes', 'title']),
  pageSize: PropTypes.number,
  showFilters: PropTypes.bool,
  showSorting: PropTypes.bool,
  showPagination: PropTypes.bool,
  id: PropTypes.string,
};

CatalogPage.defaultProps = {
  initialFilters: {},
  initialSort: 'popularity',
  pageSize: 20,
  showFilters: true,
  showSorting: true,
  showPagination: true,
  id: undefined,
};

export default CatalogPage;