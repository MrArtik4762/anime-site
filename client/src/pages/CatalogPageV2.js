import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { animeService } from '../services/animeService';
import anilibriaService from '../services/anilibriaService';
import jikanService from '../services/jikanService';
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
  display: flex;
  align-items: center;
  gap: 12px;
  
  .icon {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.1rem;
  margin-bottom: 32px;
`;

const SearchSection = styled.div`
  margin-bottom: 24px;
`;

const FiltersSection = styled.div`
  margin-bottom: 40px;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ResultsInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const ResultsCount = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  
  .icon {
    color: ${props => props.theme.colors.primary};
  }
`;

const FilterSummary = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterTag = styled.div`
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  
  .remove {
    cursor: pointer;
    opacity: 0.7;
    
    &:hover {
      opacity: 1;
    }
  }
`;

const ViewControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ViewToggle = styled.div`
  display: flex;
  background: ${props => props.theme.colors.surfaceSecondary};
  border-radius: 8px;
  overflow: hidden;
`;

const ViewButton = styled.button`
  background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.text};
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primaryDark : props.theme.colors.border};
  }
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Select = styled.select`
  padding: 6px 10px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
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
  border-radius: 12px;
  background: ${props => props.theme.colors.error}10;
  border: 1px solid ${props => props.theme.colors.error}30;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${props => props.theme.colors.textSecondary};
  
  .icon {
    font-size: 4rem;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  h3 {
    margin-bottom: 8px;
    color: ${props => props.theme.colors.text};
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
  },
  {
    _id: 'mock3',
    title: { ru: 'Магическая Битва', en: 'Jujutsu Kaisen' },
    description: 'Студент сталкивается с миром проклятий и магии.',
    poster: 'https://www.anilibria.tv/storage/releases/posters/9001/medium.jpg',
    year: 2024,
    status: 'Завершён',
    genres: ['Боевики', 'Сверхъестественное', 'Школа'],
    episodes: 24,
    rating: 9.2,
  },
  {
    _id: 'mock4',
    title: { ru: 'Атака Титанов', en: 'Attack on Titan' },
    description: 'Человечество борется за выживание против гигантских титанов.',
    poster: 'https://www.anilibria.tv/storage/releases/posters/8500/medium.jpg',
    year: 2023,
    status: 'Завершён',
    genres: ['Боевики', 'Драма', 'Фэнтези'],
    episodes: 75,
    rating: 9.5,
  }
];

const CatalogPageV2 = ({ filter }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState('grid');
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('limit')) || 24);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState({
    genre: searchParams.get('genres')?.split(',') || [],
    type: searchParams.get('type') || '',
    year: searchParams.get('year') || '',
    yearFrom: searchParams.get('yearFrom') || '',
    yearTo: searchParams.get('yearTo') || '',
    status: searchParams.get('status') || '',
    rating: searchParams.get('rating') || '',
    ratingFrom: searchParams.get('ratingFrom') || '',
    ratingTo: searchParams.get('ratingTo') || '',
    episodes: searchParams.get('episodes') || '',
    episodesFrom: searchParams.get('episodesFrom') || '',
    episodesTo: searchParams.get('episodesTo') || '',
    sortBy: searchParams.get('sortBy') || 'rating',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  });

  // Обновление URL при изменении параметров
  const updateURL = useCallback((params) => {
    const newSearchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== '' && value !== null && value !== undefined) {
        if (Array.isArray(value) && value.length > 0) {
          newSearchParams.set(key, value.join(','));
        } else if (!Array.isArray(value)) {
          newSearchParams.set(key, value.toString());
        }
      }
    });
    
    setSearchParams(newSearchParams, { replace: true });
  }, [setSearchParams]);

  // Загрузка аниме
  const loadAnime = useCallback(async (forceReset = false) => {
    if (forceReset) {
      setCurrentPage(1);
    }
    
    try {
      setLoading(true);
      setError(null);
      let list = [];
      let count = 0;
      let pages = 1;

      const searchParams = {
        ...filters,
        search: searchQuery,
        limit: itemsPerPage,
        page: forceReset ? 1 : currentPage,
      };

      // Обновляем URL
      updateURL({
        q: searchQuery,
        ...filters,
        limit: itemsPerPage,
        page: forceReset ? 1 : currentPage,
      });

      // Пробуем загрузить из AniLiberty V2
      if (searchQuery || Object.values(filters).some(v => v && v.length > 0)) {
        try {
          if (searchQuery) {
            list = await anilibriaV2Service.searchAnime(searchQuery, searchParams);
          } else {
            list = await anilibriaV2Service.getPopularAnime(searchParams);
          }
          
          // Конвертируем данные в единый формат
          list = list.map(item => anilibriaV2Service.convertAnimeToFormat(item));
          count = list.length;
          pages = Math.ceil(count / itemsPerPage);
        } catch (e) {
          console.warn('AniLiberty V2 error:', e);
        }
      }

      // Fallback к локальной базе
      if (!list.length) {
        try {
          const response = await animeService.getAnimeList(searchParams);
          list = (response?.data?.anime) || [];
          count = response?.data?.pagination?.totalItems || 0;
          pages = response?.data?.pagination?.totalPages || 1;
        } catch (e) {
          console.warn('Local DB error:', e);
        }
      }

      // Fallback к старому AniLibria
      if (!list.length) {
        try {
          const anilibriaResult = await anilibriaService.getPopular(itemsPerPage);
          if (anilibriaResult?.success && anilibriaResult.data?.data) {
            list = anilibriaResult.data.data.map(title => 
              anilibriaService.formatAnimeData(title)
            );
            count = list.length;
            pages = 1;
          }
        } catch (e) {
          console.warn('AniLibria error:', e);
        }
      }

      // Fallback к Jikan
      if (!list.length) {
        try {
          const jikanResult = await jikanService.getPopularAnime(itemsPerPage);
          if (jikanResult.success) {
            list = jikanResult.data;
            count = list.length;
            pages = 1;
          }
        } catch (e) {
          console.warn('Jikan error:', e);
        }
      }

      // В крайнем случае используем fallback
      if (!list.length) {
        list = fallbackAnime;
        count = fallbackAnime.length;
        pages = 1;
      }

      setAnimeList(list);
      setTotalCount(count);
      setTotalPages(pages);
      setError(null);
    } catch (err) {
      console.error('Catalog error:', err);
      setAnimeList(fallbackAnime);
      setTotalCount(fallbackAnime.length);
      setTotalPages(1);
      setError('Ошибка загрузки данных. Показаны примеры аниме.');
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, itemsPerPage, currentPage, updateURL]);

  // Загрузка при изменении фильтров
  useEffect(() => {
    loadAnime();
  }, [filter]); // Только при изменении filter prop

  // Обработчики
  const handleSearch = (query) => {
    setSearchQuery(query);
    loadAnime(true);
  };

  const handleSuggestionClick = (suggestion) => {
    const title = suggestion.name?.main || suggestion.title;
    setSearchQuery(title);
    loadAnime(true);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    loadAnime(true);
  };

  const handleRemoveFilter = (filterType, value) => {
    const newFilters = { ...filters };
    
    if (Array.isArray(newFilters[filterType])) {
      newFilters[filterType] = newFilters[filterType].filter(v => v !== value);
    } else {
      newFilters[filterType] = '';
    }
    
    setFilters(newFilters);
    loadAnime(true);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    loadAnime(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    loadAnime(true);
  };

  // Мемоизированные вычисления
  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== '' && value !== undefined && value !== null;
    }).length + (searchQuery ? 1 : 0);
  }, [filters, searchQuery]);

  // Простые функции вместо useCallback для избежания ошибок
  const getFilterLabel = (key) => {
    const labels = {
      genre: '🎭',
      type: '🎬',
      status: '📊',
      year: '📅',
      yearFrom: '📅 от',
      yearTo: '📅 до',
      ratingFrom: '⭐ от',
      ratingTo: '⭐ до',
      episodesFrom: '📺 от',
      episodesTo: '📺 до',
      sortBy: '🔄',
    };
    return labels[key] || key;
  };

  const getFilterValueLabel = (key, value) => {
    return value;
  };

  const activeFilterTags = [];
  
  if (searchQuery) {
    activeFilterTags.push({ type: 'search', label: `🔍 "${searchQuery}"`, value: searchQuery });
  }
  
  Object.entries(filters).forEach(([key, value]) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return;
    
    if (Array.isArray(value)) {
      value.forEach(v => {
        activeFilterTags.push({ type: key, label: `${getFilterLabel(key)} ${v}`, value: v });
      });
    } else {
      activeFilterTags.push({ type: key, label: `${getFilterLabel(key)} ${getFilterValueLabel(key, value)}`, value });
    }
  });

  const getPageTitle = () => {
    switch (filter) {
    case 'popular':
      return '🔥 Популярные аниме';
    case 'latest':
      return '🆕 Новые аниме';
    default:
      return '📚 Каталог аниме';
    }
  };

  const getPageSubtitle = () => {
    switch (filter) {
    case 'popular':
      return 'Самые популярные и высокорейтинговые аниме';
    case 'latest':
      return 'Последние добавленные аниме';
    default:
      return 'Найдите аниме по своему вкусу с продвинутыми фильтрами';
    }
  };

  if (error && animeList.length === 0) {
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
          <Title>
            <span className="icon">{filter === 'popular' ? '🔥' : filter === 'latest' ? '🆕' : '📚'}</span>
            {getPageTitle()}
          </Title>
          <Subtitle>{getPageSubtitle()}</Subtitle>
          
          {!filter && (
            <SearchSection>
              <AdvancedSearchBar 
                onSearch={handleSearch} 
                onSuggestionClick={handleSuggestionClick}
                placeholder="Поиск по названию, жанру, году или студии..."
              />
            </SearchSection>
          )}
        </Header>

        {!filter && (
          <FiltersSection>
            <AdvancedFilterPanel 
              filters={filters} 
              onFilterChange={handleFilterChange} 
              resultCount={totalCount}
            />
          </FiltersSection>
        )}

        <ResultsHeader>
          <ResultsInfo>
            <ResultsCount>
              <span className="icon">🎯</span>
              {loading ? 'Загрузка...' : `Найдено: ${totalCount.toLocaleString()} аниме`}
            </ResultsCount>
            
            {activeFilterTags.length > 0 && (
              <FilterSummary>
                {activeFilterTags.slice(0, 3).map((tag, index) => (
                  <FilterTag key={`${tag.type}-${tag.value}-${index}`}>
                    {tag.label}
                    <span 
                      className="remove"
                      onClick={() => {
                        if (tag.type === 'search') {
                          handleSearch('');
                        } else {
                          handleRemoveFilter(tag.type, tag.value);
                        }
                      }}
                    >
                      ✕
                    </span>
                  </FilterTag>
                ))}
                {activeFilterTags.length > 3 && (
                  <FilterTag>+{activeFilterTags.length - 3} еще</FilterTag>
                )}
              </FilterSummary>
            )}
          </ResultsInfo>
          
          <ViewControls>
            <ViewToggle>
              <ViewButton active={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
                🔲 Сетка
              </ViewButton>
              <ViewButton active={viewMode === 'list'} onClick={() => setViewMode('list')}>
                📋 Список
              </ViewButton>
            </ViewToggle>
            
            <PaginationControls>
              <Select 
                value={itemsPerPage} 
                onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value={96}>96</option>
              </Select>
            </PaginationControls>
          </ViewControls>
        </ResultsHeader>

        {loading ? (
          <LoadingContainer>
            <LoadingSpinner size="48px" />
          </LoadingContainer>
        ) : animeList.length > 0 ? (
          <Grid>
            {animeList.map((anime) => (
              <AnimeCard key={anime._id || anime.id} anime={anime} />
            ))}
          </Grid>
        ) : (
          <EmptyState>
            <div className="icon">😔</div>
            <h3>Ничего не найдено</h3>
            <p>Попробуйте изменить параметры поиска или фильтры</p>
          </EmptyState>
        )}
      </Container>
    </CatalogContainer>
  );
};

export default CatalogPageV2;