"use client";

/**
 * 认证状态 Provider
 * 统一管理用户认证状态，避免重复调用 /auth/me 接口
 */

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import apiClient from "@/lib/api-client";
import { authService } from "@/lib/services/auth-service";
import type {
  User,
  UserRegisterReq,
  LoginReq,
  LoginWithSmsReq,
} from "@/lib/types/api-v1";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signUp: (data: UserRegisterReq) => Promise<{ user: User | null; error: string | null }>;
  signInWithSms: (data: LoginWithSmsReq) => Promise<{ user: User | null; error: string | null }>;
  signInWithGoogle: (token: string) => Promise<{ user: User | null; error: string | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 加载用户信息（只在 Provider 初始化时调用一次）
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
   * 初始化认证状态（只执行一次）
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

  const value = {
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * 使用认证状态的 Hook
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 导出类型
export type { User };
