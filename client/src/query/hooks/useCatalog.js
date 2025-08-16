import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import api from '../../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

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
        const url = `catalog/${filter ? `${filter}` : ''}${queryString ? `?${queryString}` : ''}`;
        
        console.log('🔍 [useCatalog] Запрос:', {
          url,
          filter,
          search,
          page,
          filters: Object.keys(filters),
          queryString,
          fullUrl: `${API_BASE_URL}/api/${url}`
        });
        
        const response = await api.get(url);
        
        if (!response.ok) {
          console.error('❌ [useCatalog] HTTP ошибка:', response.status, response.statusText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ [useCatalog] Ответ:', {
          hasSuccess: !!data.success,
          hasDataList: !!data.data?.animeList,
          dataListLength: data.data?.animeList?.length || 0,
          dataStructure: {
            hasPagination: !!data.data?.pagination,
            hasTimestamp: !!data.data?.timestamp,
            hasSource: !!data.data?.source
          }
        });
        
        if (!data.success) {
          console.error('❌ [useCatalog] API ошибка:', data.error);
          throw new Error(data.error || 'Failed to load catalog data');
        }
        
        // Преобразуем данные в формат, совместимый с React Query
        const result = {
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
        
        console.log('📦 [useCatalog] Результат:', {
          dataLength: result.data.length,
          pagination: result.pagination,
          hasError: !!result.error,
          source: result.source
        });
        
        return result;
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
    // Graceful fallback при ошибках
    placeholderData: {
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
      error: null,
      timestamp: new Date().toISOString(),
      source: 'placeholder',
    },
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
        const url = `catalog/${filter ? `${filter}` : ''}${queryString ? `?${queryString}` : ''}`;
        
        console.log('🔍 [useInfiniteCatalog] Запрос:', {
          url,
          filter,
          search,
          pageParam,
          filters: Object.keys(filters),
          queryString,
          fullUrl: `${API_BASE_URL}/api/${url}`
        });
        
        const response = await api.get(url);
        
        if (!response.ok) {
          console.error('❌ [useInfiniteCatalog] HTTP ошибка:', response.status, response.statusText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ [useInfiniteCatalog] Ответ:', {
          hasSuccess: !!data.success,
          hasDataItems: !!data.data?.items,
          dataItemsLength: data.data?.items?.length || 0,
          dataStructure: {
            hasPage: !!data.data?.page,
            hasPages: !!data.data?.pages,
            hasTotal: !!data.data?.total,
            hasLimit: !!data.data?.limit,
            hasTimestamp: !!data.data?.timestamp,
            hasSource: !!data.data?.source
          }
        });
        
        if (!data.success) {
          console.error('❌ [useInfiniteCatalog] API ошибка:', data.error);
          throw new Error(data.error || 'Failed to load catalog data');
        }
        
        // Преобразуем данные в формат, совместимый с React Query
        const result = {
          data: data.data.items || [],
          pagination: {
            currentPage: data.data.page || data.data.currentPage || 1,
            totalPages: data.data.pages || 1,
            totalCount: data.data.total || 0,
            perPage: data.data.limit || filters.perPage || 20,
          },
          filter: data.data.filter,
          search: data.data.search,
          filters: data.data.filters,
          error: data.data.error,
          timestamp: data.data.timestamp,
          source: response.headers.get('X-Data-Source') || 'unknown',
        };
        
        console.log('📦 [useInfiniteCatalog] Результат:', {
          dataLength: result.data.length,
          pagination: result.pagination,
          hasError: !!result.error,
          source: result.source
        });
        
        return result;
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
    // Graceful fallback при ошибках
    placeholderData: {
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        perPage: filters.perPage || 20,
      },
      filter,
      search,
      filters,
      error: null,
      timestamp: new Date().toISOString(),
      source: 'placeholder',
    },
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
        const response = await api.get(`catalog/${filter}/seo`);
        
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
  return useQuery({
    queryKey: ['catalog', 'popular', page, limit],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString()
        });
        
        const url = `catalog/popular?${params}`;
        console.log('🔍 [usePopularAnime] Запрос:', url);
        console.log('🔍 [usePopularAnime] Полный URL:', `${API_BASE_URL}/api/${url}`);
        
        const response = await api.get(url);
        
        if (!response.ok) {
          console.error('❌ [usePopularAnime] HTTP ошибка:', response.status, response.statusText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ [usePopularAnime] Ответ:', {
          hasSuccess: !!data.success,
          hasDataList: !!data.data?.list,
          dataListLength: data.data?.list?.length || 0,
          dataStructure: {
            hasPagination: !!data.data?.pagination,
            hasTimestamp: !!data.data?.timestamp,
            hasSource: !!data.data?.source
          }
        });
        
        if (!data.success) {
          console.error('❌ [usePopularAnime] API ошибка:', data.error);
          throw new Error(data.error || 'Failed to load popular anime');
        }
        
        const result = {
          data: data.data.items || [],
          pagination: {
            currentPage: data.data.page || data.data.currentPage || 1,
            totalPages: data.data.pages || 1,
            totalCount: data.data.total || 0,
            perPage: data.data.limit || limit,
          },
          filter: 'popular',
          timestamp: data.data.timestamp,
          source: data.data.source,
        };
        
        console.log('📦 [usePopularAnime] Результат:', {
          dataLength: result.data.length,
          pagination: result.pagination
        });
        
        return result;
      } catch (error) {
        console.error('Popular anime query error:', error);
        
        return {
          data: [],
          pagination: {
            currentPage: page,
            totalPages: 1,
            totalCount: 0,
            perPage: limit,
          },
          filter: 'popular',
          error: error.message,
          timestamp: new Date().toISOString(),
          source: 'error',
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
    retry: (failureCount, error) => {
      if (error.name === 'TypeError' || error.message.includes('HTTP error')) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: true,
    ...options
  });
};

/**
 * Хук для загрузки новых аниме
 */
export const useNewAnime = (page = 1, limit = 20, options = {}) => {
  return useQuery({
    queryKey: ['catalog', 'new', page, limit],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString()
        });
        
        const url = `catalog/new?${params}`;
        console.log('🔍 [useNewAnime] Запрос:', url);
        console.log('🔍 [useNewAnime] Полный URL:', `${API_BASE_URL}/api/${url}`);
        
        const response = await api.get(url);
        
        if (!response.ok) {
          console.error('❌ [useNewAnime] HTTP ошибка:', response.status, response.statusText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ [useNewAnime] Ответ:', {
          hasSuccess: !!data.success,
          hasDataList: !!data.data?.list,
          dataListLength: data.data?.list?.length || 0,
          dataStructure: {
            hasPagination: !!data.data?.pagination,
            hasTimestamp: !!data.data?.timestamp,
            hasSource: !!data.data?.source
          }
        });
        
        if (!data.success) {
          console.error('❌ [useNewAnime] API ошибка:', data.error);
          throw new Error(data.error || 'Failed to load new anime');
        }
        
        const result = {
          data: data.data.items || [],
          pagination: {
            currentPage: data.data.page || page,
            totalPages: data.data.pages || 1,
            totalCount: data.data.total || 0,
            perPage: data.data.limit || limit,
          },
          filter: 'new',
          timestamp: data.data.timestamp,
          source: data.data.source,
        };
        
        console.log('📦 [useNewAnime] Результат:', {
          dataLength: result.data.length,
          pagination: result.pagination
        });
        
        return result;
      } catch (error) {
        console.error('New anime query error:', error);
        
        return {
          data: [],
          pagination: {
            currentPage: page,
            totalPages: 1,
            totalCount: 0,
            perPage: limit,
          },
          filter: 'new',
          error: error.message,
          timestamp: new Date().toISOString(),
          source: 'error',
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
    retry: (failureCount, error) => {
      if (error.name === 'TypeError' || error.message.includes('HTTP error')) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: true,
    ...options
  });
};

/**
 * Хук для загрузки новых эпизодов
 */
export const useNewEpisodes = (page = 1, limit = 20, options = {}) => {
  return useQuery({
    queryKey: ['catalog', 'new-episodes', page, limit],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString()
        });
        
        const url = `catalog/new-episodes?${params}`;
        console.log('🔍 [useNewEpisodes] Запрос:', url);
        console.log('🔍 [useNewEpisodes] Полный URL:', `${API_BASE_URL}/api/${url}`);
        
        const response = await api.get(url);
        
        if (!response.ok) {
          console.error('❌ [useNewEpisodes] HTTP ошибка:', response.status, response.statusText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ [useNewEpisodes] Ответ:', {
          hasSuccess: !!data.success,
          hasDataItems: !!data.data?.items,
          dataItemsLength: data.data?.items?.length || 0,
          dataStructure: {
            hasPage: !!data.data?.page,
            hasPages: !!data.data?.pages,
            hasTotal: !!data.data?.total,
            hasLimit: !!data.data?.limit,
            hasTimestamp: !!data.data?.timestamp,
            hasSource: !!data.data?.source
          }
        });
        
        if (!data.success) {
          console.error('❌ [useNewEpisodes] API ошибка:', data.error);
          throw new Error(data.error || 'Failed to load new episodes');
        }
        
        const result = {
          data: data.data.items || [],
          pagination: {
            currentPage: data.data.page || page,
            totalPages: data.data.pages || 1,
            totalCount: data.data.total || 0,
            perPage: data.data.limit || limit,
          },
          filter: 'new-episodes',
          timestamp: data.data.timestamp,
          source: data.data.source,
        };
        
        console.log('📦 [useNewEpisodes] Результат:', {
          dataLength: result.data.length,
          pagination: result.pagination
        });
        
        return result;
      } catch (error) {
        console.error('New episodes query error:', error);
        
        return {
          data: [],
          pagination: {
            currentPage: page,
            totalPages: 1,
            totalCount: 0,
            perPage: limit,
          },
          filter: 'new-episodes',
          error: error.message,
          timestamp: new Date().toISOString(),
          source: 'error',
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
    retry: (failureCount, error) => {
      if (error.name === 'TypeError' || error.message.includes('HTTP error')) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: true,
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