/**
 * 货币数据服务
 * 封装所有与货币相关的 API 调用
 */

import apiClient from '@/lib/api-client';
import type {
  CurrencyListReq,
  CurrencyListReply,
  CurrencyDetailReq,
  CurrencyDetailReply,
  PriceHistoryReq,
  PriceHistoryReply,
  SearchCurrencyReq,
  SearchCurrencyReply,
  MarketOverviewReq,
  MarketOverviewReply,
} from '@/lib/types/api-v1';

/**
 * 货币服务类
 */
export class CurrencyService {
  /**
   * 获取货币列表
   */
  async getCurrencyList(params?: CurrencyListReq): Promise<CurrencyListReply> {
    return apiClient.get<CurrencyListReply>('/api/v1/currency/list', params);
  }

  /**
   * 获取货币详情
   */
  async getCurrencyDetail(
    cmcId: number,
    params?: Partial<CurrencyDetailReq>
  ): Promise<CurrencyDetailReply> {
    return apiClient.get<CurrencyDetailReply>(
      `/api/v1/currency/detail/${cmcId}`,
      params
    );
  }

  /**
   * 获取价格历史
   */
  async getPriceHistory(
    cmcId: number,
    params?: Partial<PriceHistoryReq>
  ): Promise<PriceHistoryReply> {
    return apiClient.get<PriceHistoryReply>(
      `/api/v1/currency/price-history/${cmcId}`,
      params
    );
  }

  /**
   * 搜索货币
   */
  async searchCurrency(params: SearchCurrencyReq): Promise<SearchCurrencyReply> {
    return apiClient.get<SearchCurrencyReply>('/api/v1/currency/search', params);
  }

  /**
   * 获取市场概览
   */
  async getMarketOverview(params?: MarketOverviewReq): Promise<MarketOverviewReply> {
    return apiClient.get<MarketOverviewReply>('/api/v1/currency/market-overview', params);
  }
}

// 导出单例
export const currencyService = new CurrencyService();

// 默认导出
export default currencyService;
