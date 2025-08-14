import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { episodeService } from '../../services/episodeService';

// Ключи для кеширования
export const episodeKeys = {
  all: ['episode'],
  detail: (id) => [...episodeKeys.all, 'detail', id],
  sources: (id) => [...episodeKeys.all, 'sources', id],
  progress: (id) => [...episodeKeys.all, 'progress', id],
};

// Хук для получения деталей эпизода
export const useEpisodeDetail = (id, options = {}) => {
  return useQuery({
    queryKey: episodeKeys.detail(id),
    queryFn: () => episodeService.getEpisodeById(id),
    enabled: !!id,
    ...options,
  });
};

// Хук для получения источников эпизода
export const useEpisodeSources = (id, options = {}) => {
  return useQuery({
    queryKey: episodeKeys.sources(id),
    queryFn: () => episodeService.getEpisodeSources(id),
    enabled: !!id,
    ...options,
  });
};

// Хук для получения прогресса просмотра эпизода
export const useEpisodeProgress = (id, options = {}) => {
  return useQuery({
    queryKey: episodeKeys.progress(id),
    queryFn: () => episodeService.getEpisodeProgress(id),
    enabled: !!id,
    ...options,
  });
};

// Мутация для обновления прогресса просмотра
export const useUpdateEpisodeProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (progressData) => episodeService.updateProgress(progressData),
    onSuccess: (data, variables) => {
      // Инвалидируем запросы прогресса для этого эпизода
      queryClient.invalidateQueries({ queryKey: episodeKeys.progress(variables.episodeId) });
      // Инвалидируем запросы истории пользователя
      queryClient.invalidateQueries({ queryKey: ['user', 'history'] });
    },
  });
};

// Мутация для отметки эпизода как просмотренного
export const useMarkAsWatched = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (episodeId) => episodeService.markAsWatched(episodeId),
    onSuccess: () => {
      // Инвалидируем запросы прогресса
      queryClient.invalidateQueries({ queryKey: episodeKeys.progress() });
      // Инвалидируем запросы истории пользователя
      queryClient.invalidateQueries({ queryKey: ['user', 'history'] });
    },
  });
};

// Мутация для отметки эпизода как непросмотренного
export const useMarkAsUnwatched = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (episodeId) => episodeService.markAsUnwatched(episodeId),
    onSuccess: () => {
      // Инвалидируем запросы прогресса
      queryClient.invalidateQueries({ queryKey: episodeKeys.progress() });
      // Инвалидируем запросы истории пользователя
      queryClient.invalidateQueries({ queryKey: ['user', 'history'] });
    },
  });
};

// Мутация для переключения статуса просмотра
export const useToggleWatched = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (episodeId) => episodeService.toggleWatched(episodeId),
    onSuccess: () => {
      // Инвалидируем запросы прогресса
      queryClient.invalidateQueries({ queryKey: episodeKeys.progress() });
      // Инвалидируем запросы истории пользователя
      queryClient.invalidateQueries({ queryKey: ['user', 'history'] });
    },
  });
};

// Хук для получения рекомендованных эпизодов
export const useRecommendedEpisodes = (animeId, options = {}) => {
  return useQuery({
    queryKey: ['episode', 'recommended', animeId],
    queryFn: () => episodeService.getRecommendedEpisodes(animeId),
    enabled: !!animeId,
    ...options,
  });
};

// Хук для получения следующих эпизодов
export const useNextEpisodes = (currentEpisodeId, options = {}) => {
  return useQuery({
    queryKey: ['episode', 'next', currentEpisodeId],
    queryFn: () => episodeService.getNextEpisodes(currentEpisodeId),
    enabled: !!currentEpisodeId,
    ...options,
  });
};

// Хук для получения предыдущих эпизодов
export const usePreviousEpisodes = (currentEpisodeId, options = {}) => {
  return useQuery({
    queryKey: ['episode', 'previous', currentEpisodeId],
    queryFn: () => episodeService.getPreviousEpisodes(currentEpisodeId),
    enabled: !!currentEpisodeId,
    ...options,
  });
};