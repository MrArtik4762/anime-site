import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

// Ключи для кеширования
export const catalogKeys = {
  all: ['catalog'],
  lists: () => [...catalogKeys.all, 'list'],
  list: (filters) => [...catalogKeys.lists(), filters],
  detail: (id) => [...catalogKeys.all, 'detail', id],
  episodes: (id) => [...catalogKeys.all, 'episodes', id],
  search: (query) => [...catalogKeys.all, 'search', query],
  seo: (filter) => [...catalogKeys.all, 'seo', filter],
};

/**
 * Хук для загрузки данных каталога с сервера
 * Поддерживает SSR через предварительную загрузку данных
 */
export const useCatalog = ({ filter, search, page = 1, filters = {} } = {}) => {
  return useQuery({
    queryKey: catalogKeys.list({ filter, search, page, filters }),
    queryFn: async () => {
      try {
        // Формируем параметры запроса
        const params = new URLSearchParams();
        
        if (filter) params.append('filter', filter);
        if (search) params.append('search', search);
        if (page > 1) params.append('page', page.toString());
        
        // Добавляем фильтры
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else {
              params.append(key, value.toString());
            }
          }
        });
        
        const queryString = params.toString();
        const url = `/api/catalog/${filter ? `${filter}` : ''}${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to load catalog data');
        }
        
        // Преобразуем данные в формат, совместимый с React Query
        return {
          data: data.data.animeList,
          pagination: {
            currentPage: data.data.currentPage,
            totalPages: Math.ceil(data.data.totalCount / (filters.perPage || 20)),
            totalCount: data.data.totalCount,
            perPage: filters.perPage || 20,
          },
          filter: data.data.filter,
          search: data.data.search,
          filters: data.data.filters,
          error: data.data.error,
          timestamp: data.data.timestamp,
          source: response.headers.get('X-Data-Source') || 'unknown',
        };
      } catch (error) {
        console.error('Catalog query error:', error);
        
        // Возвращаем ошибку, чтобы компонент мог отреагировать
        return {
          data: [],
          pagination: {
            currentPage: page,
            totalPages: 1,
            totalCount: 0,
            perPage: filters.perPage || 20,
          },
          filter,
          search,
          filters,
          error: error.message,
          timestamp: new Date().toISOString(),
          source: 'error',
        };
      }
    },
    // Опции для кэширования и повторных попыток
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
    retry: (failureCount, error) => {
      // Не повторять запросы при ошибках сети или сервера
      if (error.name === 'TypeError' || error.message.includes('HTTP error')) {
        return false;
      }
      return failureCount < 3;
    },
    // Опции для SSR
    enabled: true, // Всегда активен
  });
};

/**
 * Хук для загрузки данных каталога с бесконечной прокруткой
 */
export const useInfiniteCatalog = ({ filter, search, filters = {} } = {}) => {
  return useInfiniteQuery({
    queryKey: catalogKeys.list({ filter, search, filters }),
    queryFn: async ({ pageParam = 1 }) => {
      try {
        // Формируем параметры запроса
        const params = new URLSearchParams();
        
        if (filter) params.append('filter', filter);
        if (search) params.append('search', search);
        if (pageParam > 1) params.append('page', pageParam.toString());
        
        // Добавляем фильтры
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else {
              params.append(key, value.toString());
            }
          }
        });
        
        const queryString = params.toString();
        const url = `/api/catalog/${filter ? `${filter}` : ''}${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to load catalog data');
        }
        
        // Преобразуем данные в формат, совместимый с React Query
        return {
          data: data.data.animeList,
          pagination: {
            currentPage: data.data.currentPage,
            totalPages: Math.ceil(data.data.totalCount / (filters.perPage || 20)),
            totalCount: data.data.totalCount,
            perPage: filters.perPage || 20,
          },
          filter: data.data.filter,
          search: data.data.search,
          filters: data.data.filters,
          error: data.data.error,
          timestamp: data.data.timestamp,
          source: response.headers.get('X-Data-Source') || 'unknown',
        };
      } catch (error) {
        console.error('Catalog infinite query error:', error);
        
        // Возвращаем ошибку, чтобы компонент мог отреагировать
        return {
          data: [],
          pagination: {
            currentPage: pageParam,
            totalPages: 1,
            totalCount: 0,
            perPage: filters.perPage || 20,
          },
          filter,
          search,
          filters,
          error: error.message,
          timestamp: new Date().toISOString(),
          source: 'error',
        };
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      const totalPages = lastPage?.pagination?.totalPages || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    // Опции для кэширования и повторных попыток
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
    retry: (failureCount, error) => {
      // Не повторять запросы при ошибках сети или сервера
      if (error.name === 'TypeError' || error.message.includes('HTTP error')) {
        return false;
      }
      return failureCount < 3;
    },
    // Опции для SSR
    enabled: true, // Всегда активен
  });
};

/**
 * Хук для загрузки SEO-данных страницы каталога
 */
export const useCatalogSeo = (filter) => {
  return useQuery({
    queryKey: catalogKeys.seo(filter),
    queryFn: async () => {
      try {
        const response = await fetch(`/api/catalog/${filter}/seo`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to load SEO data');
        }
        
        return data.data;
      } catch (error) {
        console.error('Catalog SEO query error:', error);
        return null;
      }
    },
    staleTime: 60 * 60 * 1000, // 1 час
    gcTime: 2 * 60 * 60 * 1000, // 2 часа
    enabled: !!filter,
  });
};

/**
 * Хук для загрузки популярных аниме
 */
export const usePopularAnime = (page = 1, limit = 20, options = {}) => {
  return useCatalog({
    filter: 'popular',
    page,
    filters: { perPage: limit },
    ...options
  });
};

/**
 * Хук для загрузки новых аниме
 */
export const useNewAnime = (page = 1, limit = 20, options = {}) => {
  return useCatalog({
    filter: 'latest',
    page,
    filters: { perPage: limit },
    ...options
  });
};

/**
 * Хук для загрузки новых эпизодов
 */
export const useNewEpisodes = (page = 1, limit = 20, options = {}) => {
  return useCatalog({
    filter: 'new-episodes',
    page,
    filters: { perPage: limit },
    ...options
  });
};

/**
 * Хук для поиска аниме
 */
export const useSearchAnime = (query, page = 1, filters = {}, limit = 20, options = {}) => {
  return useCatalog({
    filter: 'search',
    search: query,
    page,
    filters: { ...filters, perPage: limit },
    ...options
  });
};