import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { animeService } from '../services/animeService';
import anilibriaService from '../services/anilibriaService';
import jikanService from '../services/jikanService'; // Добавляем импорт
import { anilibriaV2Service } from '../services/anilibriaV2Service';
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

const fallbackAnime = [
  {
    _id: 'mock1',
    title: { ru: 'Девочки-бабочки', en: 'Butterfly Girls' },
    description: 'История о девочках, которые превращаются в бабочек и сражаются со злом.',
    poster: 'https://www.anilibria.tv/storage/releases/posters/9919/medium.jpg',
    year: 2025,
    status: 'В работе',
    genres: ['Магия', 'Школа', 'Драма'],
    episodes: 24,
    rating: 8.1,
  },
  {
    _id: 'mock2',
    title: { ru: 'Труська, Чулко и пресвятой Подвяз 2', en: 'New Panty & Stocking with Garterbelt' },
    description: 'Продолжение приключений двух падших ангелов в Датэн-сити.',
    poster: 'https://www.anilibria.tv/storage/releases/posters/9988/medium.jpg',
    year: 2025,
    status: 'В работе',
    genres: ['Комедия', 'Пародия', 'Фэнтези', 'Экшен'],
    episodes: 13,
    rating: 7.9,
  }
];

const CatalogPage = ({ filter }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // Для отслеживания загрузки следующей страницы
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    genre: [],
    year: '',
    status: '',
    rating: '',
    sortBy: 'rating',
    sortOrder: 'desc',
  });
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1); // Текущая страница
  const [hasMore, setHasMore] = useState(true); // Есть ли еще страницы для загрузки

  // Инициализация фильтров из URL при монтировании компонента
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    
    // Инициализация фильтров из URL
    const urlFilters = {
      genre: searchParams.get('genre') ? searchParams.get('genre').split(',') : [],
      year: searchParams.get('year') || '',
      status: searchParams.get('status') || '',
      rating: searchParams.get('rating') || '',
      sortBy: searchParams.get('sortBy') || 'rating',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };
    
    setSearchQuery(query);
    setCurrentPage(page);
    setFilters(urlFilters);
  }, [location.search]);

  // Сброс к первой странице при изменении фильтров или поиска
  useEffect(() => {
    setCurrentPage(1);
    setAnimeList([]);
    setHasMore(true);
    updateUrl(1, searchQuery, filters);
    loadAnime(1);
    // eslint-disable-next-line
  }, [filter, filters, searchQuery]);

  const loadAnime = async (page = currentPage) => {
    try {
      // Если это не первая страница, устанавливаем loadingMore в true
      if (page > 1) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      let list = [];
      let count = 0;
      const perPage = 100; // Максимальное количество элементов на странице

      // Пробуем загрузить из локальной базы
      try {
        const response = await animeService.getAnimeList({
          ...filters,
          search: searchQuery,
          limit: perPage,
          page: page,
        });
        list = (response?.data?.anime) || [];
        count = response?.data?.pagination?.totalItems || 0;
      } catch (e) {
        console.warn('Local DB error:', e);
      }

      // Если локальная база пуста - пробуем AniLibria
      if (!list.length) {
        try {
          // Используем anilibriaV2Service для работы с AniLiberty API
          const anilibriaResult = await anilibriaV2Service.searchAnime(searchQuery, {
            ...filters,
            perPage: perPage,
            page: page,
          });
          
          if (Array.isArray(anilibriaResult)) {
            list = anilibriaResult.map(title =>
              anilibriaV2Service.convertAnimeToFormat(title)
            );
            // Для AniLiberty API мы не получаем общее количество, поэтому будем проверять по количеству полученных элементов
            count = list.length;
          }
        } catch (e) {
          console.warn('AniLiberty error:', e);
        }
      }

      // Если и AniLiberty не сработала - берем данные из Jikan
      if (!list.length) {
        try {
          // Jikan API не поддерживает пагинацию в текущей реализации, поэтому загружаем только для первой страницы
          if (page === 1) {
            const jikanResult = await jikanService.getPopularAnime(perPage);
            if (jikanResult.success) {
              list = jikanResult.data;
              count = list.length;
            }
          }
        } catch (e) {
          console.warn('Jikan error:', e);
        }
      }

      // В крайнем случае используем fallback только для первой страницы
      if (!list.length && page === 1) {
        list = fallbackAnime;
        count = fallbackAnime.length;
      }

      // Если это первая страница, заменяем список, иначе добавляем к существующему
      if (page === 1) {
        setAnimeList(list);
      } else {
        setAnimeList(prevList => [...prevList, ...list]);
      }
      
      setTotalCount(count);
      setError(null);
      
      // Проверяем, есть ли еще страницы для загрузки
      if (list.length < perPage) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      
      // Обновляем текущую страницу
      if (page > 1) {
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Catalog error:', err);
      // Устанавливаем fallback только для первой страницы
      if (currentPage === 1) {
        setAnimeList(fallbackAnime);
        setTotalCount(fallbackAnime.length);
      }
    } finally {
      if (page > 1) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Функция для обновления URL при изменении параметров
  const updateUrl = (page, query, filterValues) => {
    const searchParams = new URLSearchParams();
    
    // Добавляем параметры поиска
    if (query) {
      searchParams.set('search', query);
    }
    
    // Добавляем параметры пагинации
    if (page > 1) {
      searchParams.set('page', page.toString());
    }
    
    // Добавляем параметры фильтров
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
    
    // Сохраняем параметр voice если он есть
    const currentParams = new URLSearchParams(location.search);
    if (currentParams.get('voice')) {
      searchParams.set('voice', currentParams.get('voice'));
    }
    
    const newUrl = `${location.pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    navigate(newUrl, { replace: true });
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!filter) {
      try {
        setLoading(true);
        setError(null);
        const response = await animeService.searchAnime(query, {
          ...filters,
          search: query,
          limit: 50,
        });
        let list = (response && response.data) ? response.data : [];
        let count = response?.total || (response && response.data ? response.data.length : 0);

        // Если поиск по локальной базе ничего не дал — ищем в AniLibria
        if (!list || list.length === 0) {
          try {
            const anilibriaResult = await anilibriaService.searchWithFallback(query, { limit: 50 });
            if (anilibriaResult?.success && anilibriaResult.data) {
              list = Array.isArray(anilibriaResult.data)
                ? anilibriaResult.data.map(title => anilibriaService.formatAnimeData(title))
                : [];
              count = list.length;
            }
          } catch (e) {
            // fallback не удался
          }
        }

        // Если всё равно пусто — показываем fallback-аниме
        if (!list || list.length === 0) {
          list = fallbackAnime;
          count = fallbackAnime.length;
          setError(null);
        }

        setAnimeList(list);
        setTotalCount(count);
        updateUrl(1, query, filters); // Обновляем URL при поиске
      } catch (err) {
        setAnimeList(fallbackAnime);
        setTotalCount(fallbackAnime.length);
        setError(null);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    updateUrl(1, searchQuery, newFilters); // Обновляем URL при изменении фильтров
  };

  const getPageTitle = () => {
    switch (filter) {
    case 'popular':
      return 'Популярные аниме';
    case 'latest':
      return 'Новые аниме';
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
    default:
      return 'Найдите аниме по своему вкусу';
    }
  };

  if (error) {
    return (
      <CatalogContainer>
        <Container>
          <ErrorMessage>{error}</ErrorMessage>
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
            <AdvancedFilterPanel filters={filters} onFilterChange={handleFilterChange} resultCount={totalCount} />
          </FiltersSection>
        )}

        <ResultsHeader>
          <ResultsCount>
            {loading ? 'Загрузка...' : `Найдено: ${totalCount} аниме`}
          </ResultsCount>
        </ResultsHeader>

        {loading ? (
          <LoadingContainer>
            <LoadingSpinner size="48px" />
          </LoadingContainer>
        ) : animeList.length > 0 ? (
          <Grid minWidth="250px" gap="20px">
            {animeList.map((anime) => (
              <AnimeCard key={anime._id} anime={anime} />
            ))}
          </Grid>
        ) : (
          <EmptyState>
            <h3>Ничего не найдено</h3>
            <p>Попробуйте изменить параметры поиска или фильтры</p>
          </EmptyState>
        )}
        
        {!loading && hasMore && animeList.length > 0 && (
          <LoadMoreButton onClick={() => loadAnime(currentPage + 1)} disabled={loadingMore}>
            {loadingMore ? 'Загрузка...' : 'Загрузить еще'}
          </LoadMoreButton>
        )}
      </Container>
    </CatalogContainer>
  );
};

export default CatalogPage;
