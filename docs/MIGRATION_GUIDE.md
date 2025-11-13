# 🔄 迁移指南：从 Supabase 到后端 API

## 📋 概述

本次迁移将应用从**直接访问 Supabase**改为**通过后端 API 接口调用**的架构。

### 核心变化

| 之前 | 之后 |
|------|------|
| 前端直接查询 Supabase | 前端调用 Next.js API 路由 |
| Supabase Auth (OAuth) | JWT 认证 |
| 独立的收藏表 | `is_favorite` 字段标记 |
| Supabase Realtime | 需自行实现（WebSocket） |

---

## 🏗️ 新架构

```
┌─────────────────────────────────────────────┐
│         React 组件 (前端)                   │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│      新服务层 (lib/services/)               │
│  • CurrencyService                          │
│  • AlertServiceV2                           │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│      API 客户端 (lib/api-client.ts)         │
│  • 统一的 HTTP 请求封装                     │
│  • JWT Token 管理                           │
│  • 错误处理                                 │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│    Next.js API 路由 (/api/v1/currency/)     │
│  • JWT 认证中间件                           │
│  • 转发到后端 API                           │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│         后端 API 服务器                      │
│  (NEXT_PUBLIC_API_BASE_URL)                 │
└─────────────────────────────────────────────┘
```

---

## 📦 新增文件

### 1. 类型定义
- `lib/types/api-v1.ts` - 所有 API 接口的类型定义

### 2. API 客户端
- `lib/api-client.ts` - 统一的 HTTP 客户端

### 3. 认证系统
- `lib/auth/jwt-middleware.ts` - JWT 认证中间件
- `hooks/use-auth.ts` - 重写为 JWT 认证

### 4. 新服务层
- `lib/services/currency-service.ts` - 货币数据服务
- `lib/services/alert-service-v2.ts` - 告警服务 V2

### 5. API 路由（全新）
- `src/app/api/v1/currency/list/route.ts`
- `src/app/api/v1/currency/detail/[cmc_id]/route.ts`
- `src/app/api/v1/currency/price-history/[cmc_id]/route.ts`
- `src/app/api/v1/currency/search/route.ts`
- `src/app/api/v1/currency/market-overview/route.ts`
- `src/app/api/v1/currency/alerts/route.ts`
- `src/app/api/v1/currency/notifications/route.ts`
- `src/app/api/v1/currency/notification/read/route.ts`

---

## 🔑 环境变量

### 新增环境变量

```bash
# 后端 API 地址
NEXT_PUBLIC_API_BASE_URL=http://localhost:8888

# 如果后端有认证需求
# API_SECRET_KEY=your_secret_key
```

### 移除的环境变量

```bash
# ❌ 以下变量不再需要
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 📝 代码迁移示例

### 1. 获取货币列表

#### 之前（Supabase）
```typescript
import { createClient } from '@/lib/supabase-server';

const supabase = await createClient();
const { data } = await supabase
  .from('top_cryptocurrencies')
  .select('*')
  .order('cmc_rank', { ascending: true });
```

#### 之后（API 调用）
```typescript
import { currencyService } from '@/lib/services/currency-service';

const data = await currencyService.getCurrencyList({
  page: 1,
  page_size: 50,
  sort_by: 'rank',
  sort_order: 'asc',
});
```

### 2. 认证状态

#### 之前（Supabase Auth）
```typescript
import { useAuth } from '@/hooks/use-auth';
import { User } from '@supabase/supabase-js';

const { user, loading, signOut } = useAuth();
```

#### 之后（JWT 认证）
```typescript
import { useAuth, User } from '@/hooks/use-auth';

const { user, loading, signIn, signUp, signOut, isAuthenticated } = useAuth();

// 登录
await signIn('email@example.com', 'password');

// 注册
await signUp('email@example.com', 'password', 'Name');
```

### 3. 获取用户告警

#### 之前（Supabase）
```typescript
import { alertService } from '@/lib/alert-service';

const alerts = await alertService.getAlertsByUserId(userId);
```

#### 之后（API 调用）
```typescript
import { alertServiceV2 } from '@/lib/services/alert-service-v2';

const { items: alerts } = await alertServiceV2.getAlerts({
  is_active: true,
});
```

---

## 🚨 重要变更

### 1. 认证方式改变

- **之前**: Supabase Auth 自动管理会话
- **之后**: 使用 localStorage 存储 JWT Token 和用户信息
- **注意**: 需要手动调用 `signIn()` / `signUp()` / `signOut()`

### 2. 收藏功能

- **之前**: 独立的 `user_favorites` 表
- **之后**: 在货币列表和详情中返回 `is_favorite` 字段
- **注意**: 收藏功能现在由后端接口处理

### 3. 实时更新

- **之前**: Supabase Realtime 自动推送
- **之后**: 需要轮询或使用 WebSocket
- **注意**: 暂未实现实时功能

---

## 🔧 API 客户端使用

### 基本用法

```typescript
import apiClient from '@/lib/api-client';

// GET 请求
const data = await apiClient.get('/api/v1/currency/list', {
  page: 1,
  page_size: 50,
});

// POST 请求
const result = await apiClient.post('/api/v1/currency/alerts', {
  crypto_id: 1,
  alert_type: 'price_change',
  threshold_percentage: 5,
});

// PUT 请求
await apiClient.put('/api/v1/currency/alerts/123', {
  is_active: false,
});

// DELETE 请求
await apiClient.delete('/api/v1/currency/alerts/123');
```

### 错误处理

```typescript
import { ApiClientError } from '@/lib/api-client';

try {
  const data = await apiClient.get('/api/v1/currency/list');
} catch (error) {
  if (error instanceof ApiClientError) {
    // 认证错误
    if (error.isAuthError()) {
      console.log('Please sign in');
    }

    // 网络错误
    if (error.isNetworkError()) {
      console.log('Network error');
    }

    // 超时错误
    if (error.isTimeoutError()) {
      console.log('Request timeout');
    }

    console.error('API Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Details:', error.data);
  }
}
```

---

## ✅ 测试清单

### 基础功能
- [ ] 获取货币列表
- [ ] 获取货币详情
- [ ] 搜索货币
- [ ] 获取价格历史
- [ ] 获取市场概览

### 认证功能
- [ ] 用户登录
- [ ] 用户注册
- [ ] 用户登出
- [ ] Token 刷新
- [ ] 跨标签页同步

### 告警功能
- [ ] 获取告警列表
- [ ] 创建告警
- [ ] 更新告警
- [ ] 删除告警
- [ ] 切换告警状态
- [ ] 获取通知列表
- [ ] 标记通知已读

---

## 🎯 后续步骤

### 高优先级
1. **实现真实的认证接口** - 目前使用 Mock 数据
2. **测试所有 API 端点** - 确保与后端接口对接正确
3. **添加 loading 状态** - 优化用户体验
4. **添加错误提示** - 用户友好的错误信息

### 中优先级
1. **添加数据缓存** - 使用 React Query
2. **实现 Token 刷新** - 自动刷新过期的 Token
3. **添加请求重试** - 网络不稳定时自动重试
4. **实现实时更新** - WebSocket 或轮询

### 低优先级
1. **添加单元测试**
2. **添加 API 文档**
3. **性能优化**
4. **监控和日志**

---

## 📞 常见问题

### Q: 后端 API 地址是什么？
A: 在 `.env.local` 中设置 `NEXT_PUBLIC_API_BASE_URL`

### Q: 如何处理认证错误？
A: API 客户端会自动返回 401 状态码，前端应跳转到登录页

### Q: 收藏功能如何使用？
A: 后端接口会在列表和详情中返回 `is_favorite` 字段

### Q: 是否需要删除 Supabase 相关代码？
A: 暂时保留作为参考，测试通过后再删除

---

## 📚 相关文档

- [API 类型定义](../lib/types/api-v1.ts)
- [API 客户端](../lib/api-client.ts)
- [JWT 中间件](../lib/auth/jwt-middleware.ts)
- [货币服务](../lib/services/currency-service.ts)
- [告警服务](../lib/services/alert-service-v2.ts)

---

**最后更新**: 2025-11-12
