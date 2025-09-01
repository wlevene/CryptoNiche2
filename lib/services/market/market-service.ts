/**
 * 市场数据业务逻辑服务
 */

import { CryptoRepository } from '../database/crypto-repository';
import type { MarketStats, TopCrypto, PriceHistory } from '@/lib/types/crypto';
import { ErrorHandler, ValidationError } from '@/lib/utils/error-handler';
import { NumberFormatter, ValidationHelper } from '@/lib/utils/formatters';
import { logger } from '@/lib/utils/logger';
import { CONFIG } from '@/lib/config/constants';

export class MarketService {
  private cryptoRepository: CryptoRepository;

  constructor() {
    this.cryptoRepository = new CryptoRepository();
  }

  /**
   * 获取市场统计数据
   */
  async getMarketStats(): Promise<MarketStats> {
    return ErrorHandler.withErrorHandling('getMarketStats', async () => {
      const marketData = await this.cryptoRepository.getLatestMarketData();
      
      if (!marketData) {
        logger.info('No market data found, returning default stats');
        return this.getDefaultMarketStats();
      }

      return {
        totalMarketCap: marketData.total_market_cap || 0,
        total24hVolume: marketData.total_volume_24h || 0,
        btcDominance: marketData.btc_dominance || 0,
        activeCryptocurrencies: marketData.active_cryptocurrencies || 0,
      };
    });
  }

  /**
   * 获取热门加密货币列表
   */
  async getTopCryptocurrencies(limit: number = CONFIG.DATABASE.QUERY_LIMIT.DEFAULT): Promise<TopCrypto[]> {
    return ErrorHandler.withErrorHandling('getTopCryptocurrencies', async () => {
      // 验证限制参数
      if (limit <= 0 || limit > CONFIG.DATABASE.QUERY_LIMIT.MAX_CRYPTOCURRENCIES) {
        throw new ValidationError('Invalid limit parameter', { limit });
      }

      const cryptocurrencies = await this.cryptoRepository.getCryptocurrencies(limit);
      
      if (!cryptocurrencies || cryptocurrencies.length === 0) {
        logger.info('No cryptocurrencies found, returning default data');
        return this.getDefaultTopCryptos();
      }

      return cryptocurrencies.map(crypto => ({
        id: crypto.id,
        symbol: crypto.symbol || 'UNK',
        name: crypto.name || 'Unknown',
        price: NumberFormatter.safeNumber(crypto.price),
        change: NumberFormatter.safeNumber(crypto.percent_change_24h || crypto.change_24h),
        volume: NumberFormatter.formatLargeNumber(crypto.volume_24h || 0),
        marketCap: NumberFormatter.formatLargeNumber(crypto.market_cap || 0),
        rank: crypto.cmc_rank || 999,
      }));
    });
  }

  /**
   * 搜索加密货币
   */
  async searchCryptocurrencies(query: string, limit?: number): Promise<TopCrypto[]> {
    return ErrorHandler.withErrorHandling('searchCryptocurrencies', async () => {
      if (!query || query.trim().length < 1) {
        throw new ValidationError('Search query is required');
      }

      const searchLimit = limit || CONFIG.DATABASE.QUERY_LIMIT.SEARCH_RESULTS;
      const results = await this.cryptoRepository.searchCryptocurrencies(
        query.trim(),
        searchLimit
      );

      return results.map(crypto => ({
        id: crypto.id,
        symbol: crypto.symbol || 'UNK',
        name: crypto.name || 'Unknown',
        price: NumberFormatter.safeNumber(crypto.price),
        change: NumberFormatter.safeNumber(crypto.percent_change_24h || crypto.change_24h),
        volume: 'N/A', // 搜索结果不包含交易量数据
        marketCap: 'N/A', // 搜索结果不包含市值数据
        rank: crypto.cmc_rank || 999,
      }));
    });
  }

  /**
   * 获取价格历史数据
   */
  async getPriceHistory(cryptoId: number, days: number = 7): Promise<PriceHistory[]> {
    return ErrorHandler.withErrorHandling('getPriceHistory', async () => {
      if (!ValidationHelper.isValidCryptoId(cryptoId)) {
        throw new ValidationError('Invalid crypto ID', { cryptoId });
      }

      if (days <= 0 || days > 365) {
        throw new ValidationError('Days must be between 1 and 365', { days });
      }

      return await this.cryptoRepository.getPriceHistory(cryptoId, days);
    });
  }

  /**
   * 获取单个加密货币详细信息
   */
  async getCryptocurrencyDetails(id: number): Promise<TopCrypto | null> {
    return ErrorHandler.withErrorHandling('getCryptocurrencyDetails', async () => {
      if (!ValidationHelper.isValidCryptoId(id)) {
        throw new ValidationError('Invalid crypto ID', { id });
      }

      const crypto = await this.cryptoRepository.getCryptocurrencyById(id);
      
      if (!crypto) {
        return null;
      }

      return {
        id: crypto.id,
        symbol: crypto.symbol || 'UNK',
        name: crypto.name || 'Unknown',
        price: NumberFormatter.safeNumber(crypto.price),
        change: NumberFormatter.safeNumber(crypto.percent_change_24h || crypto.change_24h),
        volume: NumberFormatter.formatLargeNumber(crypto.volume_24h || 0),
        marketCap: NumberFormatter.formatLargeNumber(crypto.market_cap || 0),
        rank: crypto.cmc_rank || 999,
      };
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
    return ErrorHandler.withErrorHandling('getDatabaseStats', async () => {
      const stats = await this.cryptoRepository.getDatabaseStats();
      
      return {
        ...stats,
        isHealthy: stats.activeCryptocurrencies > 0,
      };
    });
  }

  /**
   * 默认市场统计数据
   */
  private getDefaultMarketStats(): MarketStats {
    return {
      totalMarketCap: 2450000000000, // $2.45T
      total24hVolume: 89200000000,   // $89.2B
      btcDominance: 54.7,
      activeCryptocurrencies: 12847,
    };
  }

  /**
   * 默认热门加密货币数据
   */
  private getDefaultTopCryptos(): TopCrypto[] {
    return [
      {
        id: 1,
        symbol: "BTC",
        name: "Bitcoin",
        price: 67841.23,
        change: 2.34,
        volume: "28.5B",
        marketCap: "1.34T",
        rank: 1,
      },
      {
        id: 1027,
        symbol: "ETH",
        name: "Ethereum",
        price: 3456.78,
        change: -1.23,
        volume: "15.2B",
        marketCap: "415.6B",
        rank: 2,
      },
      {
        id: 825,
        symbol: "USDT",
        name: "Tether",
        price: 1.00,
        change: 0.01,
        volume: "45.0B",
        marketCap: "95.0B",
        rank: 3,
      },
      {
        id: 1839,
        symbol: "BNB",
        name: "BNB",
        price: 592.45,
        change: 0.89,
        volume: "2.1B",
        marketCap: "88.7B",
        rank: 4,
      },
    ];
  }
}