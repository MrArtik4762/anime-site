import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { animeService } from '../../services/animeService';
import anilibriaV2Service from '../../services/anilibriaV2Service';
import anilibriaService from '../../services/anilibriaService';
import jikanService from '../../services/jikanService';

// Ключи для кеширования
export const animeKeys = {
  all: ['anime'],
  lists: () => [...animeKeys.all, 'list'],
  list: (filters) => [...animeKeys.lists(), filters],
  detail: (id) => [...animeKeys.all, 'detail', id],
  episodes: (id) => [...animeKeys.all, 'episodes', id],
  search: (query) => [...animeKeys.all, 'search', query],
};

// Хук для получения списка аниме
export const useAnimeList = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: animeKeys.list(filters),
    queryFn: () => animeService.getAnimeList(filters),
    ...options,
  });
};

// Хук для получения аниме с бесконечной прокруткой
export const useInfiniteAnimeList = (filters = {}, options = {}) => {
  return useInfiniteQuery({
    queryKey: animeKeys.list(filters),
    queryFn: ({ pageParam = 1 }) => 
      animeService.getAnimeList({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      const totalPages = lastPage?.data?.pagination?.totalPages || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    ...options,
  });
};

// Хук для поиска аниме
export const useSearchAnime = (query, filters = {}, options = {}) => {
  return useQuery({
    queryKey: animeKeys.search({ query, ...filters }),
    queryFn: () => anilibriaV2Service.searchAnime(query, filters),
    enabled: !!query,
    ...options,
  });
};

// Хук для получения деталей аниме
export const useAnimeDetail = (id, options = {}) => {
  return useQuery({
    queryKey: animeKeys.detail(id),
    queryFn: () => anilibriaV2Service.getAnimeById(id),
    enabled: !!id,
    ...options,
  });
};

// Хук для получения эпизодов аниме
export const useAnimeEpisodes = (id, options = {}) => {
  return useQuery({
    queryKey: animeKeys.episodes(id),
    queryFn: () => anilibriaV2Service.getAnimeEpisodes(id),
    enabled: !!id,
    ...options,
  });
};

// Хук для получения популярных аниме
export const usePopularAnime = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: animeKeys.lists({ ...filters, popular: true }),
    queryFn: () => anilibriaV2Service.getPopularAnime(filters),
    ...options,
  });
};

// Хук для получения новых эпизодов
export const useNewEpisodes = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: animeKeys.lists({ ...filters, newEpisodes: true }),
    queryFn: () => anilibriaV2Service.getNewEpisodes(filters),
    ...options,
  });
};

// Мутация для добавления аниме в избранное
export const useAddToFavorites = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (animeId) => animeService.addToFavorites(animeId),
    onSuccess: () => {
      // Инвалидируем запросы списка аниме для обновления UI
      queryClient.invalidateQueries({ queryKey: animeKeys.lists() });
    },
  });
};

// Мутация для удаления из избранного
export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (animeId) => animeService.removeFromFavorites(animeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: animeKeys.lists() });
    },
  });
};

// Мутация для добавления в список просмотра
export const useAddToWatchlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (animeId) => animeService.addToWatchlist(animeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: animeKeys.lists() });
    },
  });
};

// Мутация для удаления из списка просмотра
export const useRemoveFromWatchlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (animeId) => animeService.removeFromWatchlist(animeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: animeKeys.lists() });
    },
  });
};

// Хук для получения рекомендаций
export const useRecommendations = (options = {}) => {
  return useQuery({
    queryKey: animeKeys.lists({ recommendations: true }),
    queryFn: () => animeService.getRecommendations(),
    ...options,
  });
};