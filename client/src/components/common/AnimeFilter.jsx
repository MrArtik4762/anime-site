import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from './ThemeProvider';
import Icon from './Icon';
import Button from './Button';
import Select from './Select';
import Input from './Input';
import Checkbox from './Checkbox';
import Badge from './Badge';
import Divider from './Divider';

// Компонент фильтра аниме с полной адаптивностью
const AnimeFilter = ({
  onFilterChange,
  initialFilters = {},
  className = '',
  showAdvanced = false,
  responsive = true,
  mobileLayout = 'drawer',
  maxVisibleFilters = 3,
  enableSaveFilters = false,
  savedFilters = []
}) => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(showAdvanced);
  const [filters, setFilters] = useState(initialFilters);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [visibleFilterCount, setVisibleFilterCount] = useState(maxVisibleFilters);
  
  // Проверка, есть ли активные фильтры
  useEffect(() => {
    const active = Object.values(filters).some(value => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== '' && value !== null && value !== undefined;
    });
    setHasActiveFilters(active);
  }, [filters]);
  
  // Оптимизация с помощью useCallback
  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);
  
  // Сброс всех фильтров
  const handleReset = useCallback(() => {
    const resetFilters = {
      search: '',
      status: '',
      type: '',
      rating: '',
      year: '',
      season: '',
      genres: [],
      studios: [],
      voices: [],
      sort: 'popular'
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  }, [onFilterChange]);
  
  // Переключение расширенных фильтров
  const toggleAdvanced = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);
  
  // Переключение мобильного меню
  const toggleMobileDrawer = useCallback(() => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  }, [mobileDrawerOpen]);
  
  // Показать больше фильтров
  const showMoreFilters = useCallback(() => {
    setVisibleFilterCount(prev => prev + maxVisibleFilters);
  }, [maxVisibleFilters]);
  
  // Показать меньше фильтров
  const showLessFilters = useCallback(() => {
    setVisibleFilterCount(maxVisibleFilters);
  }, [maxVisibleFilters]);
  
  // Предустановленные фильтры
  const presetFilters = [
    { label: 'В эфире', value: { status: 'ongoing' } },
    { label: 'Завершено', value: { status: 'completed' } },
    { label: 'Скоро выйдет', value: { status: 'upcoming' } },
    { label: 'Высокий рейтинг', value: { rating: 8 } },
    { label: 'Новинки 2024', value: { year: 2024 } },
    { label: 'Сёнэн', value: { genres: ['сёнэн'] } },
  ];
  
  // Применение предустановленного фильтра
  const applyPreset = useCallback((presetValue) => {
    const newFilters = { ...filters, ...presetValue };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);
  
  // Сохранение текущих фильтров
  const saveCurrentFilters = useCallback(() => {
    const filterName = prompt('Введите название для набора фильтров:');
    if (filterName) {
      const newSavedFilters = [...savedFilters, { name: filterName, filters }];
      // В реальном приложении здесь был бы вызов API или сохранение в localStorage
      console.log('Сохраненные фильтры:', newSavedFilters);
    }
  }, [savedFilters, filters]);
  
  // Применение сохраненных фильтров
  const applySavedFilters = useCallback((savedFilter) => {
    setFilters(savedFilter.filters);
    onFilterChange(savedFilter.filters);
  }, [onFilterChange]);
  
  // Удаление сохраненных фильтров
  const removeSavedFilters = useCallback((index) => {
    const newSavedFilters = savedFilters.filter((_, i) => i !== index);
    // В реальном приложении здесь был бы вызов API или сохранение в localStorage
    console.log('Удаленные фильтры:', newSavedFilters);
  }, [savedFilters]);
  
  // Рендеринг основных фильтров с адаптивностью
  const renderMainFilters = useMemo(() => {
    const mainFilters = [
      {
        key: 'status',
        label: 'Статус',
        options: [
          { value: '', label: 'Все статусы' },
          { value: 'ongoing', label: 'В эфире' },
          { value: 'completed', label: 'Завершено' },
          { value: 'upcoming', label: 'Скоро выйдет' },
          { value: 'hiatus', label: 'Перерыв' }
        ]
      },
      {
        key: 'type',
        label: 'Тип',
        options: [
          { value: '', label: 'Все типы' },
          { value: 'tv', label: 'ТВ-сериал' },
          { value: 'movie', label: 'Фильм' },
          { value: 'ova', label: 'OVA' },
          { value: 'ona', label: 'ONA' },
          { value: 'special', label: 'Спешл' }
        ]
      },
      {
        key: 'rating',
        label: 'Рейтинг',
        options: [
          { value: '', label: 'Любой рейтинг' },
          { value: '9', label: '9+ Отлично' },
          { value: '8', label: '8+ Очень хорошо' },
          { value: '7', label: '7+ Хорошо' },
          { value: '6', label: '6+ Ниже среднего' },
          { value: '5', label: '5+ Средне' }
        ]
      },
      {
        key: 'year',
        label: 'Год выпуска',
        options: [
          { value: '', label: 'Все годы' },
          { value: '2024', label: '2024' },
          { value: '2023', label: '2023' },
          { value: '2022', label: '2022' },
          { value: '2021', label: '2021' },
          { value: '2020', label: '2020' },
          { value: 'older', label: 'Раньше 2020' }
        ]
      }
    ];

    // Ограничиваем количество видимых фильтров на мобильных устройствах
    const filtersToShow = responsive
      ? mainFilters.slice(0, visibleFilterCount)
      : mainFilters;

    return (
      <div className={`grid gap-4 mb-6 ${
        responsive
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      }`}>
        {filtersToShow.map((filter) => (
          <div key={filter.key}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {filter.label}
            </label>
            <Select
              value={filters[filter.key] || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="w-full"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        ))}
        
        {/* Кнопка показать больше/меньше для мобильных устройств */}
        {responsive && visibleFilterCount < mainFilters.length && (
          <div className="flex justify-center items-center sm:col-span-2 lg:col-span-4">
            <Button
              variant="ghost"
              size="small"
              onClick={showMoreFilters}
              className="text-xs"
            >
              Показать ещё фильтры
            </Button>
          </div>
        )}
        
        {responsive && visibleFilterCount > maxVisibleFilters && (
          <div className="flex justify-center items-center sm:col-span-2 lg:col-span-4">
            <Button
              variant="ghost"
              size="small"
              onClick={showLessFilters}
              className="text-xs"
            >
              Скрыть фильтры
            </Button>
          </div>
        )}
      </div>
    );
  }, [filters, handleFilterChange, responsive, visibleFilterCount, maxVisibleFilters, showMoreFilters, showLessFilters]);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 ${className}`}>
      {/* Мобильная кнопка открытия фильтров */}
      {responsive && mobileLayout === 'drawer' && (
        <div className="sm:hidden mb-4">
          <Button
            variant="outline"
            size="medium"
            onClick={toggleMobileDrawer}
            className="w-full flex items-center justify-center gap-2"
          >
            <Icon name="filter" size={20} />
            Фильтры
            {hasActiveFilters && (
              <Badge variant="secondary" size="small">
                {Object.values(filters).filter(value => {
                  if (Array.isArray(value)) return value.length > 0;
                  return value !== '' && value !== null && value !== undefined;
                }).length}
              </Badge>
            )}
          </Button>
        </div>
      )}
      
      {/* Поиск */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="search" size={20} color={colors.text.tertiary} />
          </div>
          <Input
            type="text"
            placeholder="Поиск по названию..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
            responsive={responsive}
          />
        </div>
      </div>
      
      {/* Предустановленные фильтры */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Быстрые фильтры</h3>
        <div className="flex flex-wrap gap-2">
          {presetFilters.map((filter, index) => (
            <Button
              key={index}
              variant="outline"
              size="small"
              onClick={() => applyPreset(filter.value)}
              className="text-xs"
              responsive={responsive}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Основные фильтры */}
      {renderMainFilters}
      
      {/* Кнопка расширенных фильтров */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <Button
          variant="outline"
          size="small"
          onClick={toggleAdvanced}
          className="flex items-center gap-2"
          responsive={responsive}
        >
          <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} size={16} />
          Расширенные фильтры
        </Button>
        
        <div className="flex flex-wrap items-center gap-2">
          {hasActiveFilters && (
            <Badge variant="secondary" size="small">
              {Object.values(filters).filter(value => {
                if (Array.isArray(value)) return value.length > 0;
                return value !== '' && value !== null && value !== undefined;
              }).length} активных
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="small"
            onClick={handleReset}
            disabled={!hasActiveFilters}
            responsive={responsive}
          >
            Сбросить
          </Button>
          
          {enableSaveFilters && (
            <Button
              variant="ghost"
              size="small"
              onClick={saveCurrentFilters}
              responsive={responsive}
            >
              <Icon name="bookmark" size={16} />
              Сохранить
            </Button>
          )}
        </div>
      </div>
      
      {/* Сохраненные фильтры */}
      {enableSaveFilters && savedFilters.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Сохраненные фильтры
          </h3>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map((savedFilter, index) => (
              <div key={index} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-md p-1">
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => applySavedFilters(savedFilter)}
                  className="text-xs"
                >
                  {savedFilter.name}
                </Button>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => removeSavedFilters(index)}
                  className="text-xs p-1 h-auto"
                >
                  <Icon name="x" size={14} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Расширенные фильтры */}
      {isOpen && (
        <>
          <Divider className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Жанры */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Жанры
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'сёнэн', 'сёдзё', 'сэйнэн', 'кодомо', 
                  'боевик', 'приключения', 'комедия', 'фэнтези',
                  'махо-сёдзё', 'драма', 'эччи', 'хентай',
                  'исторический', 'детектив', 'хоррор', 'меха',
                  'музыка', 'мистика', 'романтика', 'научная фантастика',
                  'спорт', 'трагедия', 'триллер', 'вампиры'
                ].map((genre) => (
                  <label key={genre} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.genres?.includes(genre) || false}
                      onChange={(e) => {
                        const currentGenres = filters.genres || [];
                        if (e.target.checked) {
                          handleFilterChange('genres', [...currentGenres, genre]);
                        } else {
                          handleFilterChange('genres', currentGenres.filter(g => g !== genre));
                        }
                      }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {genre}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Студии */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Студии
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Toei Animation', 'Madhouse', 'Studio Pierrot', 'J.C.Staff',
                  'Kyoto Animation', 'Bones', 'Ufotable', 'Wit Studio',
                  'MAPPA', 'Shaft', 'P.A. Works', 'Silver Link',
                  'TMS Entertainment', 'Sunrise', 'Ghibli', 'Trigger'
                ].map((studio) => (
                  <label key={studio} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.studios?.includes(studio) || false}
                      onChange={(e) => {
                        const currentStudios = filters.studios || [];
                        if (e.target.checked) {
                          handleFilterChange('studios', [...currentStudios, studio]);
                        } else {
                          handleFilterChange('studios', currentStudios.filter(s => s !== studio));
                        }
                      }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {studio}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Сезоны */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Сезон выхода
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'зима', 'весна', 'лето', 'осень'
                ].map((season) => (
                  <label key={season} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.season?.includes(season) || false}
                      onChange={(e) => {
                        const currentSeasons = filters.season || [];
                        if (e.target.checked) {
                          handleFilterChange('season', [...currentSeasons, season]);
                        } else {
                          handleFilterChange('season', currentSeasons.filter(s => s !== season));
                        }
                      }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {season}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Длина эпизодов */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Длина эпизода
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Короткие (< 5 мин)', value: 'short' },
                  { label: 'Стандартные (12-24 мин)', value: 'standard' },
                  { label: 'Длинные (25-40 мин)', value: 'long' },
                  { label: 'Фильмы (> 40 мин)', value: 'movie' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.duration === option.value}
                      onChange={(e) => {
                        handleFilterChange('duration', e.target.checked ? option.value : null);
                      }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          {/* Сортировка */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Сортировка
            </label>
            <Select
              value={filters.sort || 'popular'}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-full md:w-auto"
            >
              <option value="popular">По популярности</option>
              <option value="rating">По рейтингу</option>
              <option value="newest">По новизне</option>
              <option value="oldest">По старости</option>
              <option value="name">По названию</option>
              <option value="episodes">По количеству эпизодов</option>
            </Select>
          </div>
        </>
      )}
    </div>
  );
};

AnimeFilter.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  initialFilters: PropTypes.object,
  className: PropTypes.string,
  showAdvanced: PropTypes.bool,
  responsive: PropTypes.bool,
  mobileLayout: PropTypes.oneOf(['drawer', 'inline']),
  maxVisibleFilters: PropTypes.number,
  enableSaveFilters: PropTypes.bool,
  savedFilters: PropTypes.array,
};

AnimeFilter.defaultProps = {
  initialFilters: {},
  className: '',
  showAdvanced: false,
  responsive: true,
  mobileLayout: 'drawer',
  maxVisibleFilters: 3,
  enableSaveFilters: false,
  savedFilters: [],
};

// Компонент результатов фильтрации
const FilterResults = ({ 
  totalResults, 
  activeFilters, 
  onClearFilters,
  className = ''
}) => {
  const { colors } = useTheme();
  
  // Подсчет активных фильтров
  const activeCount = Object.values(activeFilters).filter(value => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== '' && value !== null && value !== undefined;
  }).length;
  
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Найдено аниме: {totalResults}
        </h2>
        
        {activeCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Активные фильтры: {activeCount}
            </span>
            <Button
              variant="ghost"
              size="small"
              onClick={onClearFilters}
              className="text-xs"
            >
              Очистить
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Сортировка:
        </span>
        <Select
          value="popular"
          onChange={() => {}}
          className="w-32"
        >
          <option value="popular">По популярности</option>
          <option value="rating">По рейтингу</option>
          <option value="newest">По новизне</option>
        </Select>
      </div>
    </div>
  );
};

FilterResults.propTypes = {
  totalResults: PropTypes.number.isRequired,
  activeFilters: PropTypes.object.isRequired,
  onClearFilters: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default AnimeFilter;
export { FilterResults };