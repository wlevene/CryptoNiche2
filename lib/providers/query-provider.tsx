'use client';

/**
 * React Query Provider
 * 提供全局数据缓存和状态管理
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 默认配置
            staleTime: 1000 * 60 * 5, // 5 分钟后数据变旧
            gcTime: 1000 * 60 * 30, // 30 分钟后清理缓存
            retry: 1, // 失败后重试 1 次
            refetchOnWindowFocus: false, // 窗口聚焦时不自动刷新
          },
          mutations: {
            retry: 0, // 变更操作不重试
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
