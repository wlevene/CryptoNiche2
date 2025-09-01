/**
 * 加密货币数据访问层
 */

import { createUniversalClient } from '@/lib/supabase-universal';
import type { CryptoCurrency, CryptoPrice, MarketData, PriceHistory } from '@/lib/types/crypto';
import { ErrorHandler, DatabaseError } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import { CONFIG } from '@/lib/config/constants';

export class CryptoRepository {
  private supabase = createUniversalClient();

  /**
   * 获取加密货币列表
   */
  async getCryptocurrencies(limit: number = CONFIG.DATABASE.QUERY_LIMIT.DEFAULT): Promise<CryptoCurrency[]> {
    return ErrorHandler.withErrorHandling('getCryptocurrencies', async () => {
      const { data, error } = await this.supabase
        .from('top_cryptocurrencies')
        .select(`
          id,
          symbol,
          name,
          price,
          market_cap,
          volume_24h,
          percent_change_24h as change_24h,
          cmc_rank,
          cmc_rank as rank,
          slug,
          market_pair_count as num_market_pairs,
          circulating_supply,
          total_supply,
          max_supply,
          ath,
          atl,
          date_added,
          is_active,
          updated_at
        `)
        .eq('is_active', true)
        .not('cmc_rank', 'is', null)
        .order('cmc_rank', { ascending: true })
        .limit(limit);

      if (error) {
        throw new DatabaseError(`Failed to fetch cryptocurrencies: ${error.message}`, {
          query: 'getCryptocurrencies',
          limit,
        });
      }

      logger.database('getCryptocurrencies', 'cryptocurrencies', data?.length);
      return data || [];
    });
  }

  /**
   * 根据ID获取单个加密货币
   */
  async getCryptocurrencyById(id: number): Promise<CryptoCurrency | null> {
    return ErrorHandler.withErrorHandling('getCryptocurrencyById', async () => {
      const { data, error } = await this.supabase
        .from('top_cryptocurrencies')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // 没找到记录
        }
        throw new DatabaseError(`Failed to fetch cryptocurrency: ${error.message}`, {
          query: 'getCryptocurrencyById',
          id,
        });
      }

      logger.database('getCryptocurrencyById', 'cryptocurrencies', 1);
      return data;
    });
  }

  /**
   * 搜索加密货币
   */
  async searchCryptocurrencies(query: string, limit: number = CONFIG.DATABASE.QUERY_LIMIT.SEARCH_RESULTS): Promise<CryptoCurrency[]> {
    return ErrorHandler.withErrorHandling('searchCryptocurrencies', async () => {
      const { data, error } = await this.supabase
        .from('top_cryptocurrencies')
        .select(`
          id,
          symbol,
          name,
          cmc_rank,
          price,
          percent_change_24h
        `)
        .or(`name.ilike.%${query}%,symbol.ilike.%${query}%`)
        .eq('is_active', true)
        .order('cmc_rank', { ascending: true })
        .limit(limit);

      if (error) {
        throw new DatabaseError(`Failed to search cryptocurrencies: ${error.message}`, {
          query: 'searchCryptocurrencies',
          searchQuery: query,
          limit,
        });
      }

      logger.database('searchCryptocurrencies', 'cryptocurrencies', data?.length);
      return data || [];
    });
  }


  /**
   * 获取最新市场数据
   */
  async getLatestMarketData(): Promise<MarketData | null> {
    return ErrorHandler.withErrorHandling('getLatestMarketData', async () => {
      const { data, error } = await this.supabase
        .from('market_data')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // 没找到记录
        }
        throw new DatabaseError(`Failed to fetch market data: ${error.message}`, {
          query: 'getLatestMarketData',
        });
      }

      logger.database('getLatestMarketData', 'market_data', 1);
      return data;
    });
  }


  /**
   * 获取价格历史数据
   */
  async getPriceHistory(cryptoId: number, days: number = 7): Promise<PriceHistory[]> {
    return ErrorHandler.withErrorHandling('getPriceHistory', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.supabase
        .from('price_history')
        .select('crypto_id, price, timestamp')
        .eq('crypto_id', cryptoId)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: true });

      if (error) {
        throw new DatabaseError(`Failed to fetch price history: ${error.message}`, {
          query: 'getPriceHistory',
          cryptoId,
          days,
        });
      }

      logger.database('getPriceHistory', 'price_history', data?.length);
      return data || [];
    });
  }

  /**
   * 获取数据库统计信息（只读访问）
   */
  async getDatabaseStats(): Promise<{
    totalCryptocurrencies: number;
    activeCryptocurrencies: number;
    latestUpdateTime: string | null;
  }> {
    return ErrorHandler.withErrorHandling('getDatabaseStats', async () => {
      // 使用只读客户端获取统计数据
      const [totalResult, activeResult, latestResult] = await Promise.all([
        this.supabase.from('cryptocurrencies').select('id', { count: 'exact', head: true }),
        supabase.from('cryptocurrencies').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('cryptocurrencies').select('updated_at').order('updated_at', { ascending: false }).limit(1).single()
      ]);

      return {
        totalCryptocurrencies: totalResult.count || 0,
        activeCryptocurrencies: activeResult.count || 0,
        latestUpdateTime: latestResult.data?.updated_at || null,
      };
    });
  }
}