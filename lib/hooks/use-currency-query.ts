/**
 * React Query Hooks for Currency Service
 * 为货币服务提供缓存和状态管理
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { currencyService } from '@/lib/services/currency-service';
import type {
  CurrencyListReq,
  CurrencyListReply,
  CurrencyDetailReply,
  PriceHistoryReply,
  SearchCurrencyReply,
  MarketOverviewReply,
} from '@/lib/types/api-v1';

// Query Keys
export const currencyKeys = {
  all: ['currency'] as const,
  lists: () => [...currencyKeys.all, 'list'] as const,
  list: (params: CurrencyListReq) => [...currencyKeys.lists(), params] as const,
  details: () => [...currencyKeys.all, 'detail'] as const,
  detail: (id: number) => [...currencyKeys.details(), id] as const,
  priceHistory: (id: number, interval: string) =>
    [...currencyKeys.all, 'price-history', id, interval] as const,
  search: (keyword: string) => [...currencyKeys.all, 'search', keyword] as const,
  marketOverview: () => [...currencyKeys.all, 'market-overview'] as const,
};

/**
 * 获取货币列表
 */
export function useCurrencyList(params: CurrencyListReq = {}) {
  return useQuery({
    queryKey: currencyKeys.list(params),
    queryFn: () => currencyService.getCurrencyList(params),
    staleTime: 1000 * 60 * 2, // 2 分钟
  });
}

/**
 * 获取货币详情
 */
export function useCurrencyDetail(cmcId: number, quoteCurrency = 'USD') {
  return useQuery({
    queryKey: currencyKeys.detail(cmcId),
    queryFn: () => currencyService.getCurrencyDetail(cmcId, { quote_currency: quoteCurrency }),
    enabled: !!cmcId,
    staleTime: 1000 * 60 * 1, // 1 分钟
  });
}

/**
 * 获取价格历史
 */
export function usePriceHistory(cmcId: number, interval = '1h', limit = 100) {
  return useQuery({
    queryKey: currencyKeys.priceHistory(cmcId, interval),
    queryFn: () => currencyService.getPriceHistory(cmcId, { interval, limit }),
    enabled: !!cmcId,
    staleTime: 1000 * 60 * 5, // 5 分钟
  });
}

/**
 * 搜索货币
 */
export function useSearchCurrency(keyword: string, limit = 10) {
  return useQuery({
    queryKey: currencyKeys.search(keyword),
    queryFn: () => currencyService.searchCurrency({ keyword, limit }),
    enabled: keyword.length > 0,
    staleTime: 1000 * 60 * 10, // 10 分钟
  });
}

/**
 * 获取市场概览
 */
export function useMarketOverview(quoteCurrency = 'USD') {
  return useQuery({
    queryKey: currencyKeys.marketOverview(),
    queryFn: () => currencyService.getMarketOverview({ quote_currency: quoteCurrency }),
    staleTime: 1000 * 60 * 2, // 2 分钟
    refetchInterval: 1000 * 60 * 2, // 每 2 分钟自动刷新
  });
}
