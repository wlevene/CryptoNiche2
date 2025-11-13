/**
 * 统一的 API 客户端
 * 处理所有后端接口调用
 */

import { ApiResponse, ApiError } from './types/api-v1';

// API 配置
const API_CONFIG = {
  // 从环境变量读取后端 API 地址
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7881',
  timeout: 30000, // 30 秒超时
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * API 客户端类
 */
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private headers: Record<string, string>;
  private token: string | null = null;

  constructor(config = API_CONFIG) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
    this.headers = { ...config.headers };
  }

  /**
   * 设置认证 Token
   */
  setToken(token: string | null) {
    this.token = token;
  }

  /**
   * 获取当前 Token
   */
  getToken(): string | null {
    // 优先使用实例 token
    if (this.token) return this.token;

    // 从 localStorage 读取 (浏览器端)
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }

    return null;
  }

  /**
   * 构建完整的 URL
   */
  private buildURL(path: string): string {
    // 移除开头的斜杠（如果有）
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.baseURL}/${cleanPath}`;
  }

  /**
   * 构建请求头
   */
  private buildHeaders(customHeaders?: Record<string, string>): HeadersInit {
    const headers: Record<string, string> = { ...this.headers };

    // 添加认证 Token
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // 合并自定义 headers
    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  /**
   * 处理响应
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // 检查 HTTP 状态码
    if (!response.ok) {
      // 处理 401 未认证错误
      if (response.status === 401) {
        this.handle401Error();
      }

      // 尝试解析错误信息
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      throw new ApiClientError(
        errorData.error || 'Request failed',
        response.status,
        errorData
      );
    }

    // 解析 JSON 响应
    const data: ApiResponse<T> = await response.json();

    // 检查业务逻辑是否成功
    if (data.success === false) {
      throw new ApiClientError(
        data.error || 'Request failed',
        response.status,
        data as ApiError
      );
    }

    // 返回数据部分
    return data.data as T;
  }

  /**
   * 处理 401 未认证错误
   * 清除本地存储并重定向到首页
   */
  private handle401Error() {
    if (typeof window !== 'undefined') {
      console.warn('401 Unauthorized: Clearing auth data and redirecting to home');

      // 清除认证信息
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      this.token = null;

      // 触发自定义事件，通知应用程序用户已登出
      const event = new CustomEvent('auth:unauthorized');
      window.dispatchEvent(event);

      // 重定向到首页
      // 使用 setTimeout 避免在请求处理中立即重定向
      setTimeout(() => {
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }, 100);
    }
  }

  /**
   * 通用请求方法
   */
  private async request<T>(
    method: string,
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = this.buildURL(path);
    const headers = this.buildHeaders(options.headers as Record<string, string>);

    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        method,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);

      // 处理超时
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiClientError('Request timeout', 408, {
          success: false,
          error: 'Request timeout',
        });
      }

      // 处理网络错误
      if (error instanceof TypeError) {
        throw new ApiClientError('Network error', 0, {
          success: false,
          error: 'Network error: ' + error.message,
        });
      }

      // 重新抛出其他错误
      throw error;
    }
  }

  /**
   * GET 请求
   */
  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    let url = path;

    // 添加查询参数
    if (params) {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    return this.request<T>('GET', url);
  }

  /**
   * POST 请求
   */
  async post<T>(path: string, data?: any): Promise<T> {
    return this.request<T>('POST', path, {
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT 请求
   */
  async put<T>(path: string, data?: any): Promise<T> {
    return this.request<T>('PUT', path, {
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE 请求
   */
  async delete<T>(path: string, params?: Record<string, any>): Promise<T> {
    let url = path;

    // 添加查询参数
    if (params) {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    return this.request<T>('DELETE', url);
  }

  /**
   * PATCH 请求
   */
  async patch<T>(path: string, data?: any): Promise<T> {
    return this.request<T>('PATCH', path, {
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

/**
 * API 客户端错误类
 */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public data: ApiError
  ) {
    super(message);
    this.name = 'ApiClientError';
  }

  /**
   * 是否为认证错误
   */
  isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }

  /**
   * 是否为网络错误
   */
  isNetworkError(): boolean {
    return this.statusCode === 0;
  }

  /**
   * 是否为超时错误
   */
  isTimeoutError(): boolean {
    return this.statusCode === 408;
  }
}

// 导出单例实例
export const apiClient = new ApiClient();

// 导出类型
export type { ApiClient };

// 默认导出
export default apiClient;
