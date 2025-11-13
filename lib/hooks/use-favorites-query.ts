/**
 * React Query Hooks for Favorites Service
 * 为收藏服务提供缓存和状态管理
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesService } from '@/lib/services/favorites-service';
import { currencyKeys } from './use-currency-query';

// Query Keys
export const favoritesKeys = {
  all: ['favorites'] as const,
  lists: () => [...favoritesKeys.all, 'list'] as const,
};

/**
 * 获取收藏列表
 */
export function useFavorites() {
  return useQuery({
    queryKey: favoritesKeys.lists(),
    queryFn: () => favoritesService.getFavorites(),
    staleTime: 1000 * 60 * 1, // 1 分钟
  });
}

/**
 * 添加收藏
 */
export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cmcId: number) => favoritesService.addFavorite(cmcId),
    onSuccess: () => {
      // 刷新收藏列表
      queryClient.invalidateQueries({ queryKey: favoritesKeys.lists() });
      // 刷新货币列表（更新 is_favorite 状态）
      queryClient.invalidateQueries({ queryKey: currencyKeys.lists() });
      // 刷新货币详情
      queryClient.invalidateQueries({ queryKey: currencyKeys.details() });
    },
  });
}

/**
 * 取消收藏
 */
export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cmcId: number) => favoritesService.removeFavorite(cmcId),
    onSuccess: () => {
      // 刷新收藏列表
      queryClient.invalidateQueries({ queryKey: favoritesKeys.lists() });
      // 刷新货币列表（更新 is_favorite 状态）
      queryClient.invalidateQueries({ queryKey: currencyKeys.lists() });
      // 刷新货币详情
      queryClient.invalidateQueries({ queryKey: currencyKeys.details() });
    },
  });
}

/**
 * 切换收藏状态
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cmcId, isFavorite }: { cmcId: number; isFavorite: boolean }) =>
      favoritesService.toggleFavorite(cmcId, isFavorite),
    onSuccess: () => {
      // 刷新收藏列表
      queryClient.invalidateQueries({ queryKey: favoritesKeys.lists() });
      // 刷新货币列表（更新 is_favorite 状态）
      queryClient.invalidateQueries({ queryKey: currencyKeys.lists() });
      // 刷新货币详情
      queryClient.invalidateQueries({ queryKey: currencyKeys.details() });
    },
  });
}
