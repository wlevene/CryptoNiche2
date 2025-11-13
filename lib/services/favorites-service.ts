/**
 * 收藏服务
 * 封装所有与收藏相关的 API 调用
 *
 * 注意：收藏接口直接调用后端 API（不经过 Next.js API 路由）
 * 路径：/core/favorite, /core/unfavorite, /core/favorites
 */

import { env } from '@/lib/config/env';
import type { Currency } from '@/lib/types/api-v1';

/**
 * 收藏请求
 */
export interface FavoriteReq {
  cmc_id: number;
}

/**
 * 收藏响应
 */
export interface FavoriteReply {
  success: boolean;
}

/**
 * 收藏列表响应
 */
export interface FavoriteListReply {
  items: Currency[];
}

/**
 * 收藏服务类
 *
 * 直接调用后端 API，需要 JWT Token
 */
export class FavoritesService {
  /**
   * 获取后端 API 基础 URL
   */
  private getBaseURL(): string {
    // 优先从环境变量读取
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7881';
    }
    return env.api.baseUrl;
  }

  /**
   * 获取 Token
   */
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  /**
   * 构建请求头
   */
  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * 通用请求方法
   */
  private async request<T>(
    path: string,
    method: string,
    body?: any
  ): Promise<T> {
    const baseURL = this.getBaseURL();
    const url = `${baseURL}${path}`;

    try {
      const response = await fetch(url, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP ${response.status} response:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // 后端返回格式: { code: 0, msg: "OK", data: {...} }
      // 检查是否有 data 字段
      if (result.data !== undefined) {
        return result.data;
      }

      // 如果没有 data 字段，直接返回结果（兼容其他格式）
      return result;
    } catch (error) {
      console.error(`API request failed: ${method} ${url}`, error);
      throw error;
    }
  }

  /**
   * 添加收藏
   */
  async addFavorite(cmcId: number): Promise<FavoriteReply> {
    return this.request<FavoriteReply>('/core/favorite', 'POST', {
      cmc_id: cmcId,
    });
  }

  /**
   * 取消收藏
   */
  async removeFavorite(cmcId: number): Promise<FavoriteReply> {
    return this.request<FavoriteReply>('/core/unfavorite', 'POST', {
      cmc_id: cmcId,
    });
  }

  /**
   * 获取收藏列表
   */
  async getFavorites(): Promise<FavoriteListReply> {
    return this.request<FavoriteListReply>('/core/favorites', 'GET');
  }

  /**
   * 切换收藏状态（添加或取消）
   */
  async toggleFavorite(cmcId: number, isFavorite: boolean): Promise<FavoriteReply> {
    if (isFavorite) {
      return this.removeFavorite(cmcId);
    } else {
      return this.addFavorite(cmcId);
    }
  }
}

// 导出单例
export const favoritesService = new FavoritesService();

// 默认导出
export default favoritesService;
