# 🚀 快速开始 - 新架构使用指南

## 📋 概述

本指南帮助你快速上手新的 API 架构。

---

## 🏗️ 架构速览

```
前端组件 → 服务层 → API 客户端 → Next.js API 路由 → 后端 API
```

---

## ⚡ 5 分钟快速开始

### 1. 配置环境变量

在项目根目录创建 `.env.local`:

```bash
# 后端 API 地址
NEXT_PUBLIC_API_BASE_URL=http://localhost:8888
```

### 2. 使用货币服务

```typescript
import { currencyService } from '@/lib/services/currency-service';

// 获取货币列表
const listData = await currencyService.getCurrencyList({
  page: 1,
  page_size: 50,
  sort_by: 'rank',
});

// 获取货币详情
const detail = await currencyService.getCurrencyDetail(1);

// 搜索货币
const searchResult = await currencyService.searchCurrency({
  keyword: 'bitcoin',
  limit: 10,
});

// 获取市场概览
const overview = await currencyService.getMarketOverview();
```

### 3. 使用认证

```typescript
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { user, loading, signIn, signOut, isAuthenticated } = useAuth();

  // 登录
  const handleLogin = async () => {
    const { user, error } = await signIn('email@example.com', 'password');
    if (error) {
      console.error('Login failed:', error);
    }
  };

  // 登出
  const handleLogout = async () => {
    await signOut();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user?.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### 4. 使用告警服务

```typescript
import { alertServiceV2 } from '@/lib/services/alert-service-v2';

// 获取告警列表
const { items: alerts } = await alertServiceV2.getAlerts();

// 创建告警
await alertServiceV2.createAlert({
  crypto_id: 1,
  alert_type: 'price_change',
  threshold_percentage: 5,
  direction: 'both',
  is_active: true,
});

// 获取通知
const { items: notifications } = await alertServiceV2.getNotifications({
  page: 1,
  page_size: 20,
});

// 标记已读
await alertServiceV2.markNotificationRead('notification-id');
```

---

## 🎨 React 组件示例

### 货币列表组件

```typescript
'use client';

import { useEffect, useState } from 'react';
import { currencyService } from '@/lib/services/currency-service';
import type { CurrencyDetail } from '@/lib/types/api-v1';

export function CurrencyList() {
  const [currencies, setCurrencies] = useState<CurrencyDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      const data = await currencyService.getCurrencyList({
        page: 1,
        page_size: 50,
      });
      setCurrencies(data.items);
    } catch (error) {
      console.error('Failed to load currencies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {currencies.map((item) => (
        <div key={item.currency.id}>
          <h3>{item.currency.name}</h3>
          <p>Price: ${item.price?.price}</p>
          <p>Change 24h: {item.price?.percent_change_24h}%</p>
        </div>
      ))}
    </div>
  );
}
```

### 告警管理组件

```typescript
'use client';

import { useEffect, useState } from 'react';
import { alertServiceV2 } from '@/lib/services/alert-service-v2';
import { useAuth } from '@/hooks/use-auth';
import type { Alert } from '@/lib/types/api-v1';

export function AlertManager() {
  const { isAuthenticated } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAlerts();
    }
  }, [isAuthenticated]);

  const loadAlerts = async () => {
    const { items } = await alertServiceV2.getAlerts();
    setAlerts(items);
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await alertServiceV2.toggleAlert(id, !isActive);
    await loadAlerts(); // 重新加载
  };

  if (!isAuthenticated) {
    return <div>Please sign in to manage alerts</div>;
  }

  return (
    <div>
      <h2>My Alerts</h2>
      {alerts.map((alert) => (
        <div key={alert.id}>
          <p>Crypto ID: {alert.crypto_id}</p>
          <p>Threshold: {alert.threshold_percentage}%</p>
          <button onClick={() => handleToggle(alert.id!, alert.is_active!)}>
            {alert.is_active ? 'Disable' : 'Enable'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🛠️ 直接使用 API 客户端

如果你需要调用自定义接口：

```typescript
import apiClient from '@/lib/api-client';

// GET 请求
const data = await apiClient.get('/api/v1/custom-endpoint', {
  param1: 'value1',
});

// POST 请求
const result = await apiClient.post('/api/v1/custom-endpoint', {
  field1: 'value1',
  field2: 'value2',
});

// 设置 Token（如果需要手动设置）
apiClient.setToken('your-jwt-token');
```

---

## 🔐 创建受保护的 API 路由

```typescript
// src/app/api/v1/your-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler } from '@/lib/auth/jwt-middleware';

export const GET = createProtectedHandler(async (request, user) => {
  // user 已经通过 JWT 认证
  return NextResponse.json({
    success: true,
    data: {
      message: `Hello, ${user.email}!`,
    },
  });
});
```

---

## 🎯 常用代码片段

### 1. 错误处理

```typescript
import { ApiClientError } from '@/lib/api-client';

try {
  const data = await currencyService.getCurrencyList();
} catch (error) {
  if (error instanceof ApiClientError) {
    if (error.isAuthError()) {
      // 跳转到登录页
      router.push('/login');
    } else if (error.isNetworkError()) {
      // 显示网络错误提示
      toast.error('Network error, please try again');
    } else {
      // 显示其他错误
      toast.error(error.message);
    }
  }
}
```

### 2. Loading 状态

```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await currencyService.getCurrencyList();
    // 处理数据
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
```

### 3. 分页加载

```typescript
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const data = await currencyService.getCurrencyList({
    page: page + 1,
    page_size: 20,
  });

  if (data.items.length === 0) {
    setHasMore(false);
  } else {
    setItems([...items, ...data.items]);
    setPage(page + 1);
  }
};
```

---

## 📱 完整页面示例

```typescript
'use client';

import { useEffect, useState } from 'react';
import { currencyService } from '@/lib/services/currency-service';
import { useAuth } from '@/hooks/use-auth';
import type { CurrencyDetail } from '@/lib/types/api-v1';
import { ApiClientError } from '@/lib/api-client';

export default function MarketsPage() {
  const { isAuthenticated } = useAuth();
  const [currencies, setCurrencies] = useState<CurrencyDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await currencyService.getCurrencyList({
        page,
        page_size: 50,
        sort_by: 'rank',
        sort_order: 'asc',
      });

      setCurrencies(data.items);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
        <button onClick={loadData} className="ml-2 underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Cryptocurrency Markets</h1>

      <div className="grid gap-4">
        {currencies.map((item) => (
          <div key={item.currency.id} className="border p-4 rounded">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold">{item.currency.name}</h3>
                <p className="text-sm text-gray-500">{item.currency.symbol}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">${item.price?.price?.toFixed(2)}</p>
                <p
                  className={
                    (item.price?.percent_change_24h || 0) >= 0
                      ? 'text-green-500'
                      : 'text-red-500'
                  }
                >
                  {item.price?.percent_change_24h?.toFixed(2)}%
                </p>
              </div>
            </div>
            {isAuthenticated && item.is_favorite && (
              <span className="text-yellow-500">⭐ Favorite</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

---

## 📚 更多资源

- [迁移指南](./MIGRATION_GUIDE.md) - 详细的迁移说明
- [迁移总结](./MIGRATION_SUMMARY.md) - 已完成的工作总结
- [API 类型定义](../lib/types/api-v1.ts) - 完整类型参考

---

**最后更新**: 2025-11-12
