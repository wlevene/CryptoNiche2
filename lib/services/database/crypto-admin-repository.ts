/**
 * 加密货币管理员数据访问层
 * 仅用于服务端操作，使用管理员权限
 */

import { createAdminClient } from '@/lib/supabase-admin';
import type { CryptoCurrency, CryptoPrice, MarketData } from '@/lib/types/crypto';
import { ErrorHandler, DatabaseError } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';
import { CONFIG } from '@/lib/config/constants';

export class CryptoAdminRepository {
  private adminSupabase: ReturnType<typeof createAdminClient> | null = null;

  private getAdminSupabase() {
    if (!this.adminSupabase) {
      this.adminSupabase = createAdminClient();
    }
    return this.adminSupabase;
  }

  /**
   * 批量插入或更新加密货币数据
   */
  async upsertCryptocurrencies(cryptocurrencies: Omit<CryptoCurrency, 'updated_at'>[]): Promise<number> {
    return ErrorHandler.withErrorHandling('upsertCryptocurrencies', async () => {
      let totalInserted = 0;
      const batchSize = CONFIG.DATABASE.BATCH_SIZE;

      for (let i = 0; i < cryptocurrencies.length; i += batchSize) {
        const batch = cryptocurrencies.slice(i, i + batchSize);
        
        const { data, error } = await this.getAdminSupabase()
          .from('cryptocurrencies')
          .upsert(batch.map(crypto => ({
            ...crypto,
            updated_at: new Date().toISOString(),
          })), { 
            onConflict: 'id',
            ignoreDuplicates: false 
          });

        if (error) {
          throw new DatabaseError(`Failed to upsert cryptocurrencies batch: ${error.message}`, {
            query: 'upsertCryptocurrencies',
            batchIndex: Math.floor(i / batchSize),
            batchSize: batch.length,
          });
        }

        totalInserted += batch.length;
        logger.database('upsertCryptocurrencies', 'cryptocurrencies', batch.length);
      }

      return totalInserted;
    });
  }

  /**
   * 插入市场数据
   */
  async insertMarketData(marketData: Omit<MarketData, 'id' | 'timestamp'>): Promise<void> {
    return ErrorHandler.withErrorHandling('insertMarketData', async () => {
      const { error } = await this.getAdminSupabase()
        .from('market_data')
        .insert({
          ...marketData,
          timestamp: new Date().toISOString(),
        });

      if (error) {
        throw new DatabaseError(`Failed to insert market data: ${error.message}`, {
          query: 'insertMarketData',
        });
      }

      logger.database('insertMarketData', 'market_data', 1);
    });
  }

  /**
   * 批量插入价格数据
   */
  async insertPriceData(priceData: Omit<CryptoPrice, 'id'>[]): Promise<number> {
    return ErrorHandler.withErrorHandling('insertPriceData', async () => {
      let totalInserted = 0;
      const batchSize = CONFIG.DATABASE.BATCH_SIZE;

      for (let i = 0; i < priceData.length; i += batchSize) {
        const batch = priceData.slice(i, i + batchSize);
        
        const { error } = await this.getAdminSupabase()
          .from('crypto_prices')
          .insert(batch);

        if (error) {
          logger.warn(`Failed to insert price data batch: ${error.message}`, {
            query: 'insertPriceData',
            batchIndex: Math.floor(i / batchSize),
            batchSize: batch.length,
          });
          continue; // 继续处理下一批，而不是抛出错误
        }

        totalInserted += batch.length;
        logger.database('insertPriceData', 'crypto_prices', batch.length);
      }

      return totalInserted;
    });
  }

  /**
   * 获取数据库统计信息（管理员视图）
   */
  async getDatabaseStats(): Promise<{
    totalCryptocurrencies: number;
    activeCryptocurrencies: number;
    latestUpdateTime: string | null;
  }> {
    return ErrorHandler.withErrorHandling('getDatabaseStats', async () => {
      // 获取总数和活跃数
      const [totalResult, activeResult, latestResult] = await Promise.all([
        this.getAdminSupabase().from('cryptocurrencies').select('id', { count: 'exact', head: true }),
        this.getAdminSupabase().from('cryptocurrencies').select('id', { count: 'exact', head: true }).eq('is_active', true),
        this.getAdminSupabase().from('cryptocurrencies').select('updated_at').order('updated_at', { ascending: false }).limit(1).single()
      ]);

      if (totalResult.error) {
        throw new DatabaseError(`Failed to get total count: ${totalResult.error.message}`);
      }
      if (activeResult.error) {
        throw new DatabaseError(`Failed to get active count: ${activeResult.error.message}`);
      }

      return {
        totalCryptocurrencies: totalResult.count || 0,
        activeCryptocurrencies: activeResult.count || 0,
        latestUpdateTime: latestResult.data?.updated_at || null,
      };
    });
  }
}