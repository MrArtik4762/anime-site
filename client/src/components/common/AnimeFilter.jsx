import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from './ThemeProvider';
import Icon from './Icon';
import Button from './Button';
import Select from './Select';
import Input from './Input';
import Checkbox from './Checkbox';
import Badge from './Badge';
import Divider from './Divider';

// Компонент фильтра аниме
const AnimeFilter = ({ 
  onFilterChange,
  initialFilters = {},
  className = '',
  showAdvanced = false
}) => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(showAdvanced);
  const [filters, setFilters] = useState(initialFilters);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  
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
  
  // Обработка изменений фильтров
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  // Сброс всех фильтров
  const handleReset = () => {
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
  };
  
  // Переключение расширенных фильтров
  const toggleAdvanced = () => {
    setIsOpen(!isOpen);
  };
  
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
  const applyPreset = (presetValue) => {
    const newFilters = { ...filters, ...presetValue };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
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
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Основные фильтры */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Статус
          </label>
          <Select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full"
          >
            <option value="">Все статусы</option>
            <option value="ongoing">В эфире</option>
            <option value="completed">Завершено</option>
            <option value="upcoming">Скоро выйдет</option>
            <option value="hiatus">Перерыв</option>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Тип
          </label>
          <Select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full"
          >
            <option value="">Все типы</option>
            <option value="tv">ТВ-сериал</option>
            <option value="movie">Фильм</option>
            <option value="ova">OVA</option>
            <option value="ona">ONA</option>
            <option value="special">Спешл</option>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Рейтинг
          </label>
          <Select
            value={filters.rating || ''}
            onChange={(e) => handleFilterChange('rating', e.target.value)}
            className="w-full"
          >
            <option value="">Любой рейтинг</option>
            <option value="9">9+ Отлично</option>
            <option value="8">8+ Очень хорошо</option>
            <option value="7">7+ Хорошо</option>
            <option value="6">6+ Ниже среднего</option>
            <option value="5">5+ Средне</option>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Год выпуска
          </label>
          <Select
            value={filters.year || ''}
            onChange={(e) => handleFilterChange('year', e.target.value)}
            className="w-full"
          >
            <option value="">Все годы</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
            <option value="older">Раньше 2020</option>
          </Select>
        </div>
      </div>
      
      {/* Кнопка расширенных фильтров */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="small"
          onClick={toggleAdvanced}
          className="flex items-center gap-2"
        >
          <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} size={16} />
          Расширенные фильтры
        </Button>
        
        <div className="flex items-center gap-2">
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
          >
            Сбросить
          </Button>
        </div>
      </div>
      
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