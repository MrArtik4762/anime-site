import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useInfiniteCatalog, useSearchAnime } from '../query/hooks/useCatalog';
import { Container, Grid, LoadingSpinner } from '../styles/GlobalStyles';
import AnimeCard from '../components/anime/AnimeCard';
import AdvancedSearchBar from '../components/common/AdvancedSearchBar';
import AdvancedFilterPanel from '../components/common/AdvancedFilterPanel';

const CatalogContainer = styled.div`
  min-height: 100vh;
  padding: 80px 0 40px;
  background: ${props => props.theme.colors.background};
`;

const Header = styled.div`
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 16px;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.1rem;
  margin-bottom: 32px;
`;

const FiltersSection = styled.div`
  margin-bottom: 40px;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ResultsCount = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.error};
  padding: 40px;
  font-size: 1.1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${props => props.theme.colors.textSecondary};
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: 20px auto;
  padding: 12px 24px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CatalogPage = ({ filter }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Состояния для управления фильтрами и поиском
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    genre: [],
    year: '',
    status: '',
    rating: '',
    sortBy: 'rating',
    sortOrder: 'desc',
  });
  
  // Получаем параметры из URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('search') || '';
    
    const urlFilters = {
      genre: searchParams.get('genre') ? searchParams.get('genre').split(',') : [],
      year: searchParams.get('year') || '',
      status: searchParams.get('status') || '',
      rating: searchParams.get('rating') || '',
      sortBy: searchParams.get('sortBy') || 'rating',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };
    
    setSearchQuery(query);
    setFilters(urlFilters);
  }, [location.search]);
  
  // Определяем, какой хук использовать в зависимости от наличия поискового запроса
  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchError,
  } = useSearchAnime(searchQuery, 1, filters);
  
  const {
    data: catalogData,
    isLoading: catalogLoading,
    error: catalogError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCatalog({
    filter,
    search: searchQuery || undefined,
    filters
  });
  
  // Используем данные поиска, если есть запрос, иначе данные каталога
  const data = searchQuery ? searchData : catalogData;
  const isLoadingData = searchQuery ? searchLoading : catalogLoading;
  const errorData = searchQuery ? searchError : catalogError;
  
  // Функция для загрузки следующей страницы
  const loadMore = async () => {
    if (hasNextPage && !isFetchingNextPage) {
      try {
        await fetchNextPage();
      } catch (error) {
        console.error('Error loading more:', error);
      }
    }
  };

  // Функция для обновления URL при изменении параметров
  const updateUrl = (page, query, filterValues) => {
    const searchParams = new URLSearchParams();
    
    if (query) {
      searchParams.set('search', query);
    }
    
    if (page > 1) {
      searchParams.set('page', page.toString());
    }
    
    if (filterValues.genre && filterValues.genre.length > 0) {
      searchParams.set('genre', filterValues.genre.join(','));
    }
    if (filterValues.year) {
      searchParams.set('year', filterValues.year);
    }
    if (filterValues.status) {
      searchParams.set('status', filterValues.status);
    }
    if (filterValues.rating) {
      searchParams.set('rating', filterValues.rating);
    }
    if (filterValues.sortBy && filterValues.sortBy !== 'rating') {
      searchParams.set('sortBy', filterValues.sortBy);
    }
    if (filterValues.sortOrder && filterValues.sortOrder !== 'desc') {
      searchParams.set('sortOrder', filterValues.sortOrder);
    }
    
    const newUrl = `${location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    navigate(newUrl, { replace: true });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    updateUrl(1, query, filters);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    updateUrl(1, searchQuery, newFilters);
  };

  const getPageTitle = () => {
    switch (filter) {
      case 'popular':
        return 'Популярные аниме';
      case 'latest':
        return 'Новые аниме';
      case 'new-episodes':
        return 'Новые эпизоды';
      default:
        return 'Каталог аниме';
    }
  };

  const getPageSubtitle = () => {
    switch (filter) {
      case 'popular':
        return 'Самые популярные и высокорейтинговые аниме';
      case 'latest':
        return 'Последние добавленные аниме';
      case 'new-episodes':
        return 'Самые свежие эпизоды аниме';
      default:
        return 'Найдите аниме по своему вкусу';
    }
  };

  // Если ошибка при загрузке данных
  if (errorData) {
    return (
      <CatalogContainer>
        <Container>
          <ErrorMessage>Ошибка при загрузке данных: {errorData.message}</ErrorMessage>
        </Container>
      </CatalogContainer>
    );
  }

  return (
    <CatalogContainer>
      <Container>
        <Header>
          <Title>{getPageTitle()}</Title>
          <Subtitle>{getPageSubtitle()}</Subtitle>
          {!filter && <AdvancedSearchBar onSearch={handleSearch} />}
        </Header>

        {!filter && (
          <FiltersSection>
            <AdvancedFilterPanel 
              filters={filters} 
              onFilterChange={handleFilterChange} 
              resultCount={data?.pagination?.totalCount || 0}
            />
          </FiltersSection>
        )}

        <ResultsHeader>
          <ResultsCount>
            {isLoadingData ? 'Загрузка...' : `Найдено: ${data?.pagination?.totalCount || 0} аниме`}
          </ResultsCount>
        </ResultsHeader>

        {isLoadingData ? (
          <LoadingContainer>
            <LoadingSpinner size="48px" />
          </LoadingContainer>
        ) : data?.data && data.data.length > 0 ? (
          <Grid minWidth="250px" gap="20px">
            {data.data.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </Grid>
        ) : (
          <EmptyState>
            <h3>Ничего не найдено</h3>
            <p>Попробуйте изменить параметры поиска или фильтры</p>
          </EmptyState>
        )}
        
        {!isLoadingData && hasNextPage && data?.data && data.data.length > 0 && (
          <LoadMoreButton onClick={loadMore} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Загрузка...' : 'Загрузить еще'}
          </LoadMoreButton>
        )}
      </Container>
    </CatalogContainer>
  );
};

export default CatalogPage;