import React, { useState, useEffect, useMemo } from 'react';
import { styled } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../styles/GlobalStyles';

const FilterContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  width: 100%;
`;

const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const FilterTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterIcon = styled.span`
  font-size: 1.2rem;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.surfaceSecondary};
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const FilterContent = styled(motion.div)`
  @media (max-width: 768px) {
    overflow: hidden;
  }
`;

const QuickFiltersSection = styled.div`
  margin-bottom: 24px;
`;

const QuickFiltersTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 12px 0;
`;

const QuickFiltersGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const QuickFilterTag = styled.button`
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.surfaceSecondary};
  color: ${props => props.active ? 'white' : props.theme.colors.text};
  border: 1px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primaryDark : props.theme.colors.border};
  }
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterLabelIcon = styled.span`
  font-size: 1rem;
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  option {
    background: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text};
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 120px;
  overflow-y: auto;
  padding: 2px;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.surfaceSecondary};
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.primary};
    border-radius: 2px;
  }
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${props => props.checked ? props.theme.colors.primary : props.theme.colors.surfaceSecondary};
  color: ${props => props.checked ? 'white' : props.theme.colors.text};
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  
  &:hover {
    background: ${props => props.checked ? props.theme.colors.primaryDark : props.theme.colors.border};
    transform: translateY(-1px);
  }
  
  input {
    display: none;
  }
`;

const RangeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RangeInput = styled.input`
  flex: 1;
  padding: 8px 10px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
  text-align: center;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const RangeSeparator = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-weight: 500;
`;

const FilterActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
    
    .actions-left, .actions-right {
      display: flex;
      width: 100%;
      gap: 8px;
      
      button {
        flex: 1;
      }
    }
  }
`;

const ActiveFiltersCount = styled.div`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SavedFiltersDropdown = styled.select`
  padding: 6px 10px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: 0.8rem;
`;

// Данные для фильтров из AniLiberty API
const ANIME_GENRES = [
  'Боевики', 'Приключения', 'Комедия', 'Драма', 'Фэнтези', 'Ужасы', 'Магия', 'Меха',
  'Музыка', 'Мистика', 'Психология', 'Романтика', 'Фантастика', 'Сёдзё', 'Сёнен',
  'Спорт', 'Сверхъестественное', 'Триллер', 'Школа', 'Повседневность', 'Исэкай',
  'Пародия', 'Исторический', 'Военные', 'Самураи', 'Вампиры', 'Игры', 'Демоны',
  'Экшен', 'Детективы', 'Сэйнэн', 'Дзёсэй'
];

const ANIME_TYPES = [
  { value: 'tv', label: '📺 ТВ-сериал', icon: '📺' },
  { value: 'movie', label: '🎬 Фильм', icon: '🎬' },
  { value: 'ova', label: '💿 OVA', icon: '💿' },
  { value: 'ona', label: '🌐 ONA', icon: '🌐' },
  { value: 'special', label: '⭐ Спецвыпуск', icon: '⭐' },
  { value: 'music', label: '🎵 Музыкальное видео', icon: '🎵' }
];

const ANIME_STATUSES = [
  { value: 'ongoing', label: '🔄 Онгоинг', icon: '🔄' },
  { value: 'completed', label: '✅ Завершён', icon: '✅' },
  { value: 'upcoming', label: '🔜 Анонс', icon: '🔜' },
  { value: 'paused', label: '⏸️ Приостановлен', icon: '⏸️' }
];

const SORT_OPTIONS = [
  { value: 'rating-desc', label: '⭐ По рейтингу ↓', icon: '⭐' },
  { value: 'rating-asc', label: '⭐ По рейтингу ↑', icon: '⭐' },
  { value: 'year-desc', label: '📅 По году ↓', icon: '📅' },
  { value: 'year-asc', label: '📅 По году ↑', icon: '📅' },
  { value: 'popularity-desc', label: '🔥 По популярности ↓', icon: '🔥' },
  { value: 'popularity-asc', label: '🔥 По популярности ↑', icon: '🔥' },
  { value: 'date-desc', label: '🆕 По дате добавления ↓', icon: '🆕' },
  { value: 'date-asc', label: '🆕 По дате добавления ↑', icon: '🆕' },
  { value: 'episodes-desc', label: '📺 По серіям ↓', icon: '📺' },
  { value: 'episodes-asc', label: '📺 По серіям ↑', icon: '📺' },
  { value: 'title-asc', label: '🔤 По названию ↑', icon: '🔤' },
  { value: 'title-desc', label: '🔤 По названию ↓', icon: '🔤' }
];

const QUICK_FILTERS = [
  { key: 'popular', label: '🔥 Популярные', filter: { sortBy: 'popularity', sortOrder: 'desc' } },
  { key: 'new', label: '🆕 Новинки', filter: { sortBy: 'date', sortOrder: 'desc' } },
  { key: 'top_rated', label: '⭐ Топ рейтинга', filter: { ratingFrom: '8.0', sortBy: 'rating', sortOrder: 'desc' } },
  { key: 'ongoing', label: '🔄 Онгоинги', filter: { status: 'ongoing' } },
  { key: 'completed', label: '✅ Завершённые', filter: { status: 'completed' } },
  { key: 'movies', label: '🎬 Фильмы', filter: { type: 'movie' } },
  { key: 'short', label: '⚡ Короткие', filter: { episodesTo: '12' } },
  { key: 'long', label: '📚 Длинные', filter: { episodesFrom: '25' } }
];

const AdvancedFilterPanel = ({ filters, onFilterChange, resultCount = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [savedFilters, setSavedFilters] = useState([]);
  const [localFilters, setLocalFilters] = useState({
    genre: [],
    type: '',
    year: '',
    yearFrom: '',
    yearTo: '',
    status: '',
    rating: '',
    ratingFrom: '',
    ratingTo: '',
    episodes: '',
    episodesFrom: '',
    episodesTo: '',
    sortBy: 'rating',
    sortOrder: 'desc',
    // Добавляем параметры языка по умолчанию
    language: 'ru',
    voice: 'ru',
    ...filters,
  });

  useEffect(() => {
    // Загружаем сохраненные фильтры из localStorage
    const saved = JSON.parse(localStorage.getItem('savedAnimeFilters') || '[]');
    setSavedFilters(saved);
  }, []);

  const activeFiltersCount = useMemo(() => {
    return Object.values(localFilters).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== '' && value !== undefined && value !== null;
    }).length;
  }, [localFilters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleGenreToggle = (genre) => {
    const currentGenres = localFilters.genre || [];
    const newGenres = currentGenres.includes(genre)
      ? currentGenres.filter(g => g !== genre)
      : [...currentGenres, genre];
    handleFilterChange('genre', newGenres);
  };

  const handleQuickFilter = (quickFilter) => {
    const newFilters = { ...localFilters, ...quickFilter.filter };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  const resetFilters = () => {
    const resetFilters = {
      genre: [],
      type: '',
      year: '',
      yearFrom: '',
      yearTo: '',
      status: '',
      rating: '',
      ratingFrom: '',
      ratingTo: '',
      episodes: '',
      episodesFrom: '',
      episodesTo: '',
      sortBy: 'rating',
      sortOrder: 'desc',
      // Явно сохраняем настройку языка на русский при сбросе
      language: 'ru',
      voice: 'ru'
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const saveCurrentFilters = () => {
    if (activeFiltersCount === 0) return;
    
    const filterName = prompt('Название для набора фильтров:');
    if (!filterName) return;

    const newSavedFilter = {
      id: Date.now(),
      name: filterName,
      filters: { ...localFilters },
      createdAt: new Date().toISOString()
    };

    const updated = [...savedFilters, newSavedFilter];
    setSavedFilters(updated);
    localStorage.setItem('savedAnimeFilters', JSON.stringify(updated));
  };

  const loadSavedFilters = (filterId) => {
    if (!filterId) return;
    
    const savedFilter = savedFilters.find(f => f.id === parseInt(filterId));
    if (savedFilter) {
      setLocalFilters(savedFilter.filters);
      onFilterChange(savedFilter.filters);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1960 + 1 }, (_, i) => currentYear - i);

  return (
    <FilterContainer>
      <FilterHeader>
        <FilterTitle>
          <FilterIcon>🎛️</FilterIcon>
          Продвинутые фильтры
          {activeFiltersCount > 0 && (
            <ActiveFiltersCount>
              <span>🎯</span>
              {activeFiltersCount}
            </ActiveFiltersCount>
          )}
        </FilterTitle>
        <ToggleButton onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Скрыть' : 'Показать'}
        </ToggleButton>
      </FilterHeader>

      <AnimatePresence>
        {isExpanded && (
          <FilterContent
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <QuickFiltersSection>
              <QuickFiltersTitle>⚡ Быстрые фильтры</QuickFiltersTitle>
              <QuickFiltersGrid>
                {QUICK_FILTERS.map((quickFilter) => (
                  <QuickFilterTag
                    key={quickFilter.key}
                    onClick={() => handleQuickFilter(quickFilter)}
                  >
                    {quickFilter.label}
                  </QuickFilterTag>
                ))}
              </QuickFiltersGrid>
            </QuickFiltersSection>

            <FilterGrid>
              <FilterGroup>
                <FilterLabel>
                  <FilterLabelIcon>📊</FilterLabelIcon>
                  Статус
                </FilterLabel>
                <Select
                  value={localFilters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">Все статусы</option>
                  {ANIME_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>
                  <FilterLabelIcon>🎬</FilterLabelIcon>
                  Тип
                </FilterLabel>
                <Select
                  value={localFilters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">Все типы</option>
                  {ANIME_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>
                  <FilterLabelIcon>📅</FilterLabelIcon>
                  Год
                </FilterLabel>
                <Select
                  value={localFilters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                >
                  <option value="">Любой год</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </Select>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>
                  <FilterLabelIcon>🔄</FilterLabelIcon>
                  Сортировка
                </FilterLabel>
                <Select
                  value={`${localFilters.sortBy}-${localFilters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleFilterChange('sortBy', sortBy);
                    handleFilterChange('sortOrder', sortOrder);
                  }}
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FilterGroup>
            </FilterGrid>

            <FilterGrid>
              <FilterGroup>
                <FilterLabel>
                  <FilterLabelIcon>⭐</FilterLabelIcon>
                  Рейтинг
                </FilterLabel>
                <RangeGroup>
                  <RangeInput
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="От"
                    value={localFilters.ratingFrom}
                    onChange={(e) => handleFilterChange('ratingFrom', e.target.value)}
                  />
                  <RangeSeparator>—</RangeSeparator>
                  <RangeInput
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="До"
                    value={localFilters.ratingTo}
                    onChange={(e) => handleFilterChange('ratingTo', e.target.value)}
                  />
                </RangeGroup>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>
                  <FilterLabelIcon>📺</FilterLabelIcon>
                  Количество эпизодов
                </FilterLabel>
                <RangeGroup>
                  <RangeInput
                    type="number"
                    min="1"
                    placeholder="От"
                    value={localFilters.episodesFrom}
                    onChange={(e) => handleFilterChange('episodesFrom', e.target.value)}
                  />
                  <RangeSeparator>—</RangeSeparator>
                  <RangeInput
                    type="number"
                    min="1"
                    placeholder="До"
                    value={localFilters.episodesTo}
                    onChange={(e) => handleFilterChange('episodesTo', e.target.value)}
                  />
                </RangeGroup>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>
                  <FilterLabelIcon>📅</FilterLabelIcon>
                  Диапазон лет
                </FilterLabel>
                <RangeGroup>
                  <RangeInput
                    type="number"
                    min="1960"
                    max={currentYear}
                    placeholder="От"
                    value={localFilters.yearFrom}
                    onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
                  />
                  <RangeSeparator>—</RangeSeparator>
                  <RangeInput
                    type="number"
                    min="1960"
                    max={currentYear}
                    placeholder="До"
                    value={localFilters.yearTo}
                    onChange={(e) => handleFilterChange('yearTo', e.target.value)}
                  />
                </RangeGroup>
              </FilterGroup>
            </FilterGrid>

            <FilterGroup>
              <FilterLabel>
                <FilterLabelIcon>🎭</FilterLabelIcon>
                Жанры ({localFilters.genre?.length || 0} выбрано)
              </FilterLabel>
              <CheckboxGroup>
                {ANIME_GENRES.map((genre) => (
                  <CheckboxItem
                    key={genre}
                    checked={localFilters.genre?.includes(genre)}
                  >
                    <input
                      type="checkbox"
                      checked={localFilters.genre?.includes(genre)}
                      onChange={() => handleGenreToggle(genre)}
                    />
                    {genre}
                  </CheckboxItem>
                ))}
              </CheckboxGroup>
            </FilterGroup>

            <FilterActions>
              <div className="actions-left">
                {savedFilters.length > 0 && (
                  <SavedFiltersDropdown
                    onChange={(e) => loadSavedFilters(e.target.value)}
                    value=""
                  >
                    <option value="">💾 Загрузить сохраненные</option>
                    {savedFilters.map(filter => (
                      <option key={filter.id} value={filter.id}>
                        {filter.name}
                      </option>
                    ))}
                  </SavedFiltersDropdown>
                )}
                {activeFiltersCount > 0 && (
                  <Button variant="outline" size="small" onClick={saveCurrentFilters}>
                    💾 Сохранить
                  </Button>
                )}
                <Button variant="outline" onClick={resetFilters}>
                  🔄 Сбросить
                </Button>
              </div>
              
              <div className="actions-right">
                <Button onClick={applyFilters}>
                  🔍 Применить ({resultCount})
                </Button>
              </div>
            </FilterActions>
          </FilterContent>
        )}
      </AnimatePresence>
    </FilterContainer>
  );
};

export default AdvancedFilterPanel;