import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';

// Ключи для кеширования
export const userKeys = {
  all: ['user'],
  profile: () => [...userKeys.all, 'profile'],
  watchlist: () => [...userKeys.all, 'watchlist'],
  favorites: () => [...userKeys.all, 'favorites'],
  history: () => [...userKeys.all, 'history'],
  settings: () => [...userKeys.all, 'settings'],
};

// Хук для получения профиля пользователя
export const useUserProfile = (options = {}) => {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => userService.getProfile(),
    ...options,
  });
};

// Хук для получения списка просмотра
export const useWatchlist = (options = {}) => {
  return useQuery({
    queryKey: userKeys.watchlist(),
    queryFn: () => userService.getWatchlist(),
    ...options,
  });
};

// Хук для получения избранного
export const useFavorites = (options = {}) => {
  return useQuery({
    queryKey: userKeys.favorites(),
    queryFn: () => userService.getFavorites(),
    ...options,
  });
};

// Хук для получения истории просмотра
export const useWatchHistory = (options = {}) => {
  return useQuery({
    queryKey: userKeys.history(),
    queryFn: () => userService.getWatchHistory(),
    ...options,
  });
};

// Мутация для входа
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (data) => {
      // Сохраняем токен
      localStorage.setItem('token', data.data.tokens.accessToken);
      // Обновляем профиль пользователя
      queryClient.setQueryData(userKeys.profile(), data.data.user);
    },
  });
};

// Мутация для регистрации
export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData) => authService.register(userData),
    onSuccess: (data) => {
      // Сохраняем токен
      localStorage.setItem('token', data.data.tokens.accessToken);
      // Обновляем профиль пользователя
      queryClient.setQueryData(userKeys.profile(), data.data.user);
    },
  });
};

// Мутация для выхода
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Очищаем токен
      localStorage.removeItem('token');
      // Инвалидируем все запросы пользователя
      queryClient.removeQueries({ queryKey: userKeys.all });
    },
  });
};

// Мутация для обновления профиля
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData) => userService.updateProfile(userData),
    onSuccess: (data) => {
      // Обновляем профиль пользователя
      queryClient.setQueryData(userKeys.profile(), data.data);
    },
  });
};

// Мутация для обновления настроек
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings) => userService.updateSettings(settings),
    onSuccess: (data) => {
      // Обновляем настройки пользователя
      queryClient.setQueryData(userKeys.settings(), data.data);
    },
  });
};

// Мутация для добавления в список просмотра
export const useAddToWatchlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (animeId) => userService.addToWatchlist(animeId),
    onSuccess: () => {
      // Инвалидируем запросы списка просмотра
      queryClient.invalidateQueries({ queryKey: userKeys.watchlist() });
    },
  });
};

// Мутация для удаления из списка просмотра
export const useRemoveFromWatchlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (animeId) => userService.removeFromWatchlist(animeId),
    onSuccess: () => {
      // Инвалидируем запросы списка просмотра
      queryClient.invalidateQueries({ queryKey: userKeys.watchlist() });
    },
  });
};

// Мутация для добавления в избранное
export const useAddToFavorites = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (animeId) => userService.addToFavorites(animeId),
    onSuccess: () => {
      // Инвалидируем запросы избранного
      queryClient.invalidateQueries({ queryKey: userKeys.favorites() });
    },
  });
};

// Мутация для удаления из избранного
export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (animeId) => userService.removeFromFavorites(animeId),
    onSuccess: () => {
      // Инвалидируем запросы избранного
      queryClient.invalidateQueries({ queryKey: userKeys.favorites() });
    },
  });
};

// Мутация для обновления прогресса просмотра
export const useUpdateProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (progressData) => userService.updateProgress(progressData),
    onSuccess: () => {
      // Инвалидируем запросы истории
      queryClient.invalidateQueries({ queryKey: userKeys.history() });
    },
  });
};