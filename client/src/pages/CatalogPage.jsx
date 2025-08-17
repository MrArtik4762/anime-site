import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { fetchCatalog } from '../services/animeApi';
import AnimeCard from '../components/AnimeCard';
import { Loading } from '../components/common/Loading';
import { Alert } from '../components/common/Alert';
import { AppErrorBoundary } from '../components/common/AppErrorBoundary';
import logger from '../services/logger';

export default function CatalogPage() {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    genre: '',
    status: '',
    type: '',
    year: '',
    rating_min: '',
    rating_max: '',
    sort_by: 'popularity',
    sort_order: 'desc'
  });

  // Функция для загрузки каталога
  const loadCatalog = useCallback(async (page = 1, query = '', filterValues = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: 20,
        search: query,
        ...filterValues
      };
      
      const response = await fetchCatalog(params);
      
      if (response.success) {
        setAnimeList(response.data || []);
        setTotalPages(response.total_pages || 1);
        setCurrentPage(response.current_page || 1);
      } else {
        setError(response.message || 'Не удалось загрузить каталог');
      }
    } catch (err) {
      console.error('Ошибка загрузки каталога:', err);
      setError('Произошла ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка начальных данных
  useEffect(() => {
    loadCatalog(1, searchQuery, filters);
  }, []);

  // Обработка поиска
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCatalog(1, searchQuery, filters);
  };

  // Обработка изменения страницы
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      loadCatalog(page, searchQuery, filters);
    }
  };

  // Обработка изменения фильтров
  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    loadCatalog(1, searchQuery, newFilters);
  };

  return (
    <AppErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Каталог аниме</h1>
      
      {/* Поиск */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Поиск аниме..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Найти
          </button>
        </div>
        
        {/* Фильтры */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={filters.genre}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все жанры</option>
            <option value="action">Экшен</option>
            <option value="adventure">Приключения</option>
            <option value="comedy">Комедия</option>
            <option value="drama">Драма</option>
            <option value="fantasy">Фэнтези</option>
            <option value="romance">Романтика</option>
            <option value="sci-fi">Фантастика</option>
            <option value="thriller">Триллер</option>
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все статусы</option>
            <option value="ongoing">В эфире</option>
            <option value="completed">Завершено</option>
            <option value="upcoming">Скоро</option>
          </select>
          
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все типы</option>
            <option value="tv">TV</option>
            <option value="movie">Фильм</option>
            <option value="ova">OVA</option>
            <option value="ona">ONA</option>
          </select>
          
          <select
            value={filters.sort_by}
            onChange={(e) => handleFilterChange('sort_by', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="popularity">Популярность</option>
            <option value="rating">Рейтинг</option>
            <option value="year">Год</option>
            <option value="title">Название</option>
          </select>
        </div>
      </form>
      
      {/* Ошибки */}
      {error && <Alert type="error" message={error} className="mb-6" />}
      
      {/* Список аниме */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loading size="large" />
        </div>
      ) : (
        <>
          {animeList.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">Аниме не найдено</h3>
              <p className="text-gray-600">Попробуйте изменить параметры поиска или фильтры</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
                {animeList.map((anime) => (
                  <AnimeCard key={anime.id} item={anime} />
                ))}
              </div>
              
              {/* Пагинация */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    ←
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
    </AppErrorBoundary>
  );
}