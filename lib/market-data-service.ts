/**
 * 市场数据服务 - 重构后的统一接口
 * 提供所有市场数据相关的业务逻辑
 */

import { MarketService } from './services/market/market-service';
import type { MarketStats, TopCrypto, PriceHistory } from './types/crypto';
import { ErrorHandler } from './utils/error-handler';
import { logger } from './utils/logger';

export class MarketDataService {
  private marketService: MarketService;

  constructor() {
    this.marketService = new MarketService();
  }

  /**
   * 获取市场统计数据
   */
  async getMarketStats(): Promise<MarketStats> {
    return ErrorHandler.withErrorHandling('MarketDataService.getMarketStats', async () => {
      return await this.marketService.getMarketStats();
    });
  }

  /**
   * 获取热门加密货币列表
   */
  async getTopCryptocurrencies(limit: number = 10): Promise<TopCrypto[]> {
    return ErrorHandler.withErrorHandling('MarketDataService.getTopCryptocurrencies', async () => {
      return await this.marketService.getTopCryptocurrencies(limit);
    });
  }

  /**
   * 获取价格历史数据
   */
  async getPriceHistory(cryptoId: number, days: number = 7): Promise<PriceHistory[]> {
    return ErrorHandler.withErrorHandling('MarketDataService.getPriceHistory', async () => {
      return await this.marketService.getPriceHistory(cryptoId, days);
    });
  }

  /**
   * 搜索加密货币
   */
  async searchCryptocurrencies(query: string, limit?: number): Promise<TopCrypto[]> {
    return ErrorHandler.withErrorHandling('MarketDataService.searchCryptocurrencies', async () => {
      return await this.marketService.searchCryptocurrencies(query, limit);
    });
  }

  /**
   * 获取单个加密货币详细信息
   */
  async getCryptocurrencyDetails(id: number): Promise<TopCrypto | null> {
    return ErrorHandler.withErrorHandling('MarketDataService.getCryptocurrencyDetails', async () => {
      return await this.marketService.getCryptocurrencyDetails(id);
    });
  }


  /**
   * 获取数据库统计信息
   */
  async getDatabaseStats(): Promise<{
    totalCryptocurrencies: number;
    activeCryptocurrencies: number;
    latestUpdateTime: string | null;
    isHealthy: boolean;
  }> {
    return ErrorHandler.withErrorHandling('MarketDataService.getDatabaseStats', async () => {
      return await this.marketService.getDatabaseStats();
    });
  }

}

// 导出单例实例
export const marketDataService = new MarketDataService();