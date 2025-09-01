/**
 * 收藏功能服务
 */

import { createClient } from '@/lib/supabase-client';
import type { TopCrypto } from '@/lib/types/crypto';

export interface FavoriteItem {
  crypto_id: number;
  created_at: string;
  crypto: {
    id: number;
    symbol: string;
    name: string;
    slug: string;
    cmc_rank: number;
    is_active: boolean;
  };
  price_data: {
    id: number;
    symbol: string;
    name: string;
    price: number;
    market_cap: number;
    volume_24h: number;
    percent_change_24h: number;
    cmc_rank: number;
  } | null;
}

export class FavoritesService {
  private supabase = createClient();

  /**
   * 获取用户收藏列表
   */
  async getFavorites(): Promise<FavoriteItem[]> {
    try {
      const response = await fetch('/api/favorites', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch favorites');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  }

  /**
   * 添加到收藏
   */
  async addToFavorites(cryptoId: number): Promise<void> {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ crypto_id: cryptoId }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to add to favorites');
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  /**
   * 从收藏中移除
   */
  async removeFromFavorites(cryptoId: number): Promise<void> {
    try {
      const response = await fetch(`/api/favorites?crypto_id=${cryptoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  /**
   * 批量检查收藏状态
   */
  async checkFavoriteStatus(cryptoIds: number[]): Promise<Record<number, boolean>> {
    if (cryptoIds.length === 0) {
      return {};
    }

    try {
      const response = await fetch(`/api/favorites/check?crypto_ids=${cryptoIds.join(',')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!result.success) {
        // If user not authenticated, return empty object
        if (response.status === 401) {
          return {};
        }
        throw new Error(result.error || 'Failed to check favorite status');
      }

      return result.data || {};
    } catch (error) {
      console.error('Error checking favorite status:', error);
      // Return empty object on error to allow graceful degradation
      return {};
    }
  }

  /**
   * 转换收藏项目为TopCrypto格式
   */
  convertToTopCrypto(favorites: FavoriteItem[]): TopCrypto[] {
    return favorites
      .filter(fav => fav.price_data !== null)
      .map(fav => ({
        id: fav.crypto_id,
        symbol: fav.price_data!.symbol,
        name: fav.price_data!.name,
        price: fav.price_data!.price,
        change: fav.price_data!.percent_change_24h,
        volume: this.formatNumber(fav.price_data!.volume_24h || 0),
        marketCap: this.formatNumber(fav.price_data!.market_cap || 0),
        rank: fav.price_data!.cmc_rank,
      }));
  }

  /**
   * 格式化数字显示
   */
  private formatNumber(num: number): string {
    if (num >= 1e12) {
      return `${(num / 1e12).toFixed(2)}T`;
    } else if (num >= 1e9) {
      return `${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `${(num / 1e6).toFixed(2)}M`;
    } else {
      return num.toLocaleString();
    }
  }
}

// 导出单例实例
export const favoritesService = new FavoritesService();