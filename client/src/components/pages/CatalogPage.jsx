import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useTheme } from '../common/ThemeProvider';
import { useFontSize } from '../common/FontSizeController';
import { useBreakpoint } from '../common/Responsive';
import { useMobilePerformance } from '../common/MobilePerformance';
import { useInfiniteAnimeList } from '../../query/hooks/useAnime';
import { useQueryClient } from '@tanstack/react-query';
import AnimeCard from '../common/AnimeCard';
import AnimeFilter from '../common/AnimeFilter';
import ScrollPagination from '../common/ScrollPagination';
import Skeleton from '../common/Skeleton';
import TextContrastChecker from '../common/TextContrastChecker';
import { Alert } from '../common/Alert';
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

const ErrorBanner = styled(Alert)`
  margin-bottom: ${spacing.xl};
`;

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
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Подготовка параметров для API вызова
  const apiFilters = {
    ...filters,
    search: searchQuery,
    sort,
    order: sort === 'title' ? 'asc' : 'desc'
  };
  
  // Используем useInfiniteAnimeList для получения данных с бесконечной прокруткой
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status
  } = useInfiniteAnimeList(apiFilters, {
    staleTime: 60 * 1000, // 60 секунд
    cacheTime: 5 * 60 * 1000, // 5 минут
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });
  
  // Объединяем все страницы в один массив
  const animeList = data?.pages?.flat() || [];
  
  // Общее количество аниме
  const totalItems = data?.pages[0]?.pagination?.totalItems || 0;
  
  // Обработчик изменения фильтров
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Сбрасываем пагинацию при изменении фильтров
    queryClient.removeQueries({ queryKey: ['anime', 'list', { ...newFilters, sort, search: searchQuery }] });
  };
  
  // Обработчик поиска
  const handleSearch = (query) => {
    setSearchQuery(query);
    // Сбрасываем пагинацию при изменении поиска
    queryClient.removeQueries({ queryKey: ['anime', 'list', { ...filters, sort, search: query }] });
  };
  
  // Обработчик изменения сортировки
  const handleSortChange = (newSort) => {
    setSort(newSort);
    // Сбрасываем пагинацию при изменении сортировки
    queryClient.removeQueries({ queryKey: ['anime', 'list', { ...filters, sort: newSort, search: searchQuery }] });
  };
  
  // Обработчик переключения избранного
  const handleToggleFavorite = (animeId) => {
    // В реальном приложении здесь будет вызов API для обновления избранного
    console.log('Toggle favorite for anime:', animeId);
  };
  
  // Загрузить больше
  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };
  
  // Оптимизация для мобильных устройств
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
              Найдено: {totalItems} аниме
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
          
          {/* Обработка ошибок с использованием Alert компонента */}
          {error && (
            <ErrorBanner 
              variant="error" 
              title="Ошибка загрузки"
              description="Не удалось загрузить аниме. Пожалуйста, попробуйте еще раз."
              actions={
                <button 
                  onClick={() => queryClient.resetQueries({ queryKey: ['anime', 'list', apiFilters] })}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Попробовать снова
                </button>
              }
            />
          )}
          
          {status === 'loading' && !animeList.length ? (
            <EmptyState>
              <EmptyStateIcon>⏳</EmptyStateIcon>
              <EmptyStateTitle fontSize={fontSize}>Загрузка...</EmptyStateTitle>
              <EmptyStateMessage fontSize={fontSize}>
                Пожалуйста, подождите, пока мы загружаем аниме для вас
              </EmptyStateMessage>
            </EmptyState>
          ) : status === 'success' && animeList.length === 0 ? (
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
                
                {/* Skeleton loaders для загрузки дополнительных страниц */}
                {isFetchingNextPage && (
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
              
              {/* Кнопка загрузки больше для мобильных устройств */}
              {showPagination && hasNextPage && (
                <LoadMoreButton
                  onClick={loadMore}
                  disabled={isFetchingNextPage}
                  fontSize={fontSize}
                >
                  {isFetchingNextPage ? 'Загрузка...' : 'Загрузить еще'}
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