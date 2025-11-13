"use client";

/**
 * 认证状态 Hook
 * 使用真实的后端 API 进行认证
 */

import { useEffect, useState, useCallback } from "react";
import apiClient from "@/lib/api-client";
import { authService } from "@/lib/services/auth-service";
import type {
  User,
  UserRegisterReq,
  LoginReq,
  LoginWithSmsReq,
} from "@/lib/types/api-v1";

/**
 * 认证状态 Hook
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 从 Token 解析用户信息
   */
  const parseUserFromToken = useCallback((token: string): Partial<User> | null => {
    try {
      // 解析 JWT Token（格式: header.payload.signature）
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf-8')
      );

      return {
        id: payload.user_id || payload.id || payload.sub,
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        phone: payload.phone,
      };
    } catch (error) {
      console.error('Failed to parse token:', error);
      return null;
    }
  }, []);

  /**
   * 加载用户信息
   */
  const loadUserInfo = useCallback(async () => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // 设置 Token
      apiClient.setToken(token);

      // 从后端获取完整的用户信息
      const userInfo = await authService.getMe();
      setUser(userInfo);

      // 更新 localStorage
      localStorage.setItem('auth_user', JSON.stringify(userInfo));
    } catch (error) {
      console.error('Failed to load user info:', error);

      // Token 可能过期或无效，清理本地存储
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      apiClient.setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 初始化认证状态
   */
  useEffect(() => {
    loadUserInfo();

    // 监听 storage 事件（跨标签页同步）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        loadUserInfo();
      }
    };

    // 监听 401 未认证事件（由 apiClient 触发）
    const handleUnauthorized = () => {
      console.log('Received auth:unauthorized event, clearing user state');
      setUser(null);
      setLoading(false);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [loadUserInfo]);

  /**
   * 注册
   */
  const signUp = async (data: UserRegisterReq) => {
    try {
      const response = await authService.register(data);

      // 保存 Token
      localStorage.setItem('auth_token', response.token);
      apiClient.setToken(response.token);

      // 加载用户信息
      await loadUserInfo();

      return { user, error: null };
    } catch (error: any) {
      console.error('Sign up failed:', error);
      return { user: null, error: error.message || '注册失败' };
    }
  };

  /**
   * 登录（邮箱密码）
   */
  const signIn = async (email: string, password: string) => {
    try {
      const data: LoginReq = { email, password };
      const response = await authService.login(data);

      // 保存 Token
      localStorage.setItem('auth_token', response.token);
      apiClient.setToken(response.token);

      // 加载用户信息
      await loadUserInfo();

      return { user, error: null };
    } catch (error: any) {
      console.error('Sign in failed:', error);
      return { user: null, error: error.message || '登录失败' };
    }
  };

  /**
   * 短信登录
   */
  const signInWithSms = async (data: LoginWithSmsReq) => {
    try {
      const response = await authService.loginWithSms(data);

      // 保存 Token
      localStorage.setItem('auth_token', response.token);
      apiClient.setToken(response.token);

      // 加载用户信息
      await loadUserInfo();

      return { user, error: null };
    } catch (error: any) {
      console.error('SMS sign in failed:', error);
      return { user: null, error: error.message || '短信登录失败' };
    }
  };

  /**
   * Google 登录
   */
  const signInWithGoogle = async (token: string) => {
    try {
      const response = await authService.authGoogle({ token });

      // 保存 Token
      localStorage.setItem('auth_token', response.token);
      apiClient.setToken(response.token);

      // 加载用户信息
      await loadUserInfo();

      return { user, error: null };
    } catch (error: any) {
      console.error('Google sign in failed:', error);
      return { user: null, error: error.message || 'Google 登录失败' };
    }
  };

  /**
   * 登出
   */
  const signOut = async () => {
    try {
      // 调用后端登出接口
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // 清除本地存储
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      apiClient.setToken(null);
      setUser(null);
    }
  };

  /**
   * 刷新用户信息
   */
  const refreshUser = async () => {
    await loadUserInfo();
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithSms,
    signInWithGoogle,
    signOut,
    refreshUser,
    isAuthenticated: !!user,
  };
}

// 导出类型
export type { User };
