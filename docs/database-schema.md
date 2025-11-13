# CryptoNiche 数据库架构文档

> **重要更新**: 项目已从 Supabase 迁移到自定义后端 API 架构
>
> 最后更新: 2025-11-12

---

## 目录

- [概述](#概述)
- [架构变更说明](#架构变更说明)
- [认证系统](#认证系统)
- [API 接口定义](#api-接口定义)
- [数据流程](#数据流程)
- [前端状态管理](#前端状态管理)
- [缓存策略](#缓存策略)
- [安全考虑](#安全考虑)
- [环境配置](#环境配置)
- [迁移历史](#迁移历史)

---

## 概述

CryptoNiche 2.0 项目已完成从 Supabase 到自定义后端 API 的架构迁移。新架构采用 JWT 认证、统一 API 客户端、React Query 数据缓存等现代化技术栈。

**核心设计原则：**
- JWT Token 认证替代 OAuth
- RESTful API 设计
- 统一错误处理
- React Query 数据缓存
- 完整的 TypeScript 类型安全

---

## 架构变更说明

### 迁移前（Supabase）

```
前端 → Supabase Client → Supabase Database
         ↓
    Supabase Auth (OAuth)
         ↓
    Row Level Security (RLS)
```

### 迁移后（自定义后端）

```
前端 → API Client → 后端 API Server → 数据库
         ↓              ↓
    JWT Token    业务逻辑层
         ↓              ↓
  localStorage    权限控制
```

**主要变更**:
1. ✅ 认证：Supabase Auth → JWT Token
2. ✅ 数据访问：Supabase Client → HTTP API
3. ✅ 用户信息：`user_metadata` → `first_name/last_name`
4. ✅ 状态管理：本地状态 + React Query
5. ✅ 跨标签页同步：localStorage events

---

## 认证系统

### JWT Token 认证

项目使用 JWT (JSON Web Token) 进行用户认证：

**Token 管理**:
- **存储位置**: localStorage (`auth_token`)
- **传递方式**: HTTP Header `Authorization: Bearer <token>`
- **验证方式**: 后端 API 验证
- **过期处理**: 前端自动检测并清理

**用户信息结构**:

```typescript
interface User {
  id?: string;
  first_name?: string;      // 名字
  last_name?: string;       // 姓氏
  email?: string;          // 邮箱
  phone?: string;          // 电话
  avatar?: string;         // 头像 URL
  created_at?: string;     // 创建时间
  updated_at?: string;     // 更新时间
}
```

**认证流程**:

```typescript
// 注册
const { user, error } = await signUp({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  password: 'SecurePassword123',
});

// 登录
const { user, error } = await signIn(
  'john@example.com',
  'SecurePassword123'
);

// 登出
await signOut();
```

### useAuth Hook

全局认证状态管理:

```typescript
const {
  user,              // 当前用户信息
  loading,           // 加载状态
  signIn,            // 登录方法
  signUp,            // 注册方法
  signInWithSms,     // 短信登录
  signInWithGoogle,  // Google 登录
  signOut,           // 登出方法
  refreshUser,       // 刷新用户信息
  isAuthenticated,   // 是否已认证
} = useAuth();
```

**功能特性**:
- ✅ 自动加载用户信息（从 `/auth/me`）
- ✅ 跨标签页同步（通过 localStorage events）
- ✅ Token 过期自动清理
- ✅ 页面刷新状态保持
- ✅ 网络错误处理

---

## API 接口定义

### 认证接口

| 端点 | 方法 | 说明 | 请求体 | 响应 |
|------|------|------|--------|------|
| `/auth/register` | POST | 用户注册 | `UserRegisterReq` | `{ token }` |
| `/auth/login` | POST | 用户登录 | `LoginReq` | `{ token, email }` |
| `/auth/logout` | POST | 用户登出 | `{}` | `{}` |
| `/auth/me` | GET | 获取当前用户信息 | - | `User` |
| `/auth/mev2` | GET | 获取用户信息 V2 | - | `User` |
| `/auth/update-user` | POST | 更新用户信息 | `Partial<User>` | `User` |
| `/auth/changepassword` | POST | 修改密码 | `ChangePasswordReq` | `{ result, message }` |
| `/auth/resetpassword` | POST | 重置密码 | `ResetPasswordReq` | `{ result }` |
| `/auth/sms/code` | POST | 获取短信验证码 | `{ phone }` | `boolean` |
| `/auth/login/sms` | POST | 短信验证码登录 | `LoginWithSmsReq` | `{ token, phone }` |
| `/auth/google` | POST | Google OAuth 登录 | `{ token }` | `{ token, email }` |
| `/auth/dashboard` | GET | 获取用户仪表板 | - | `UserDashboardReply` |

### 货币数据接口

| 端点 | 方法 | 说明 | 参数 |
|------|------|------|------|
| `/api/v1/currency/list` | GET | 获取货币列表 | `CurrencyListReq` |
| `/api/v1/currency/detail` | GET | 获取货币详情 | `CurrencyDetailReq` |
| `/api/v1/currency/search` | GET | 搜索货币 | `SearchCurrencyReq` |
| `/api/v1/currency/price-history` | GET | 获取价格历史 | `PriceHistoryReq` |
| `/api/v1/currency/market-overview` | GET | 获取市场概览 | `MarketOverviewReq` |

### 收藏接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/currency/favorites` | GET | 获取收藏列表 |
| `/api/v1/currency/favorites/add` | POST | 添加收藏 |
| `/api/v1/currency/favorites/remove` | DELETE | 取消收藏 |

### 提醒接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/alerts` | GET | 获取提醒列表 |
| `/api/v1/alerts` | POST | 创建提醒 |
| `/api/v1/alerts/:id` | PUT | 更新提醒 |
| `/api/v1/alerts/:id` | DELETE | 删除提醒 |
| `/api/v1/alerts/:id/toggle` | POST | 启用/禁用提醒 |
| `/api/v1/notifications` | GET | 获取通知列表 |
| `/api/v1/notifications/:id/read` | POST | 标记通知已读 |

---

## 数据流程

### 注册流程

```
用户填写表单 (first_name, last_name, email, password)
  ↓
POST /auth/register
  ↓
后端返回 { token }
  ↓
前端保存 token 到 localStorage
  ↓
设置 token 到 API Client
  ↓
GET /auth/me 获取完整用户信息
  ↓
更新全局状态 (user)
  ↓
页面跳转到首页
```

### 登录流程

```
用户输入邮箱密码
  ↓
POST /auth/login { email, password }
  ↓
后端返回 { token, email }
  ↓
前端保存 token 到 localStorage
  ↓
设置 token 到 API Client
  ↓
GET /auth/me 获取完整用户信息
  ↓
更新全局状态
  ↓
页面跳转到首页
```

### 自动认证流程（页面刷新）

```
页面加载
  ↓
useAuth Hook 初始化
  ↓
从 localStorage 读取 token
  ↓
如果 token 存在:
  ├─ 设置到 API 客户端
  ├─ GET /auth/me
  ├─ 更新用户状态
  └─ setLoading(false)
  ↓
如果 token 无效或过期:
  ├─ 清理 localStorage
  ├─ 清理 API 客户端 token
  ├─ 设置 user = null
  └─ setLoading(false)
```

### 跨标签页同步流程

```
标签页 A: 用户登录
  ↓
localStorage.setItem('auth_token', token)
  ↓
触发 'storage' 事件
  ↓
标签页 B: 监听到 storage 事件
  ↓
标签页 B: 重新加载用户信息
  ↓
标签页 B: 更新状态为已登录
```

---

## 前端状态管理

### API 客户端

统一的 API 客户端 (`lib/api-client.ts`)：

```typescript
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  // 设置 Token
  setToken(token: string | null) {
    this.token = token;
  }

  // HTTP 方法
  async get<T>(url: string, params?: any): Promise<T>
  async post<T>(url: string, data?: any): Promise<T>
  async put<T>(url: string, data?: any): Promise<T>
  async delete<T>(url: string): Promise<T>
}
```

**特性**:
- ✅ 自动添加 Authorization Header
- ✅ 统一错误处理
- ✅ 请求/响应拦截器
- ✅ 超时控制
- ✅ TypeScript 类型安全

### React Query 集成

使用 TanStack Query 进行数据缓存：

```typescript
// 货币列表缓存 2 分钟
const { data, isLoading } = useCurrencyList({
  page: 1,
  page_size: 50
});

// 货币详情缓存 5 分钟
const { data } = useCurrencyDetail(cmcId);

// 提醒列表缓存 1 分钟
const { data } = useAlertList();
```

**缓存策略**:
- `staleTime`: 数据被认为是新鲜的时间
- `cacheTime`: 数据在内存中保留的时间
- 自动后台重新验证
- 窗口焦点时自动刷新
- 乐观更新支持

---

## 缓存策略

### 数据缓存时间

| 数据类型 | 缓存时间 | 说明 |
|---------|---------|------|
| 市场概览 | 2分钟 | 快速变化的市场数据 |
| 货币列表 | 2分钟 | 价格实时更新 |
| 货币详情 | 5分钟 | 详细信息变化较慢 |
| 价格历史 | 5分钟 | 历史数据稳定 |
| 用户提醒 | 1分钟 | 用户可能频繁修改 |
| 用户收藏 | 1分钟 | 用户可能频繁操作 |

### 缓存失效策略

```typescript
// 手动刷新
queryClient.invalidateQueries(['currency', 'list']);

// 乐观更新
queryClient.setQueryData(['alert', id], newData);

// 后台重新验证
refetch();
```

---

## 安全考虑

### Token 安全

**当前实现**:
- ✅ Token 存储在 localStorage
- ⚠️ 易受 XSS 攻击
- 💡 生产环境建议使用 httpOnly Cookie

**防护措施**:
1. 严格的 Content Security Policy (CSP)
2. 防止 XSS 注入（React 自动转义）
3. Token 设置合理的过期时间
4. HTTPS 传输

### HTTPS

**要求**:
- ⚠️ 生产环境必须使用 HTTPS
- ⚠️ 确保 Token 不通过 HTTP 传输
- ⚠️ 启用 HSTS (HTTP Strict Transport Security)

### Token 过期处理

**策略**:
- ✅ 后端设置合理的过期时间
- ✅ 前端自动检测并清理过期 Token
- 💡 建议实现 Token 刷新机制
- 💡 建议实现 Refresh Token

---

## 环境配置

### 必需的环境变量

```bash
# .env.local

# 后端 API 地址（必填）
NEXT_PUBLIC_API_BASE_URL=http://localhost:8888
```

### 可选的环境变量

```bash
# Sentry (错误跟踪)
NEXT_PUBLIC_SENTRY_DSN=

# Google Analytics
NEXT_PUBLIC_GA_TRACKING_ID=

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

### 环境检查

项目包含自动环境检查脚本：

```bash
# 检查环境配置
npm run check-env

# 开发模式（自动检查）
npm run dev
```

---

## 迁移历史

### 从 Supabase 迁移

**迁移日期**: 2025-11-12

**主要变更**:

| 项目 | 迁移前 (Supabase) | 迁移后 (自定义后端) |
|------|------------------|-------------------|
| 认证方式 | Supabase Auth (OAuth) | JWT Token |
| 用户信息 | `user_metadata.name` | `first_name + last_name` |
| 数据访问 | Supabase Client | HTTP API Client |
| 状态管理 | 本地 State | useAuth + React Query |
| 数据库 | Supabase PostgreSQL | 后端 API 抽象 |

**已更新的组件**:
- ✅ `components/auth/auth-modal.tsx` - 认证弹窗
- ✅ `components/auth/user-menu.tsx` - 用户菜单
- ✅ `components/profile/user-settings.tsx` - 用户设置
- ✅ `hooks/use-auth.ts` - 认证 Hook
- ✅ `lib/api-client.ts` - API 客户端（新建）
- ✅ `lib/services/auth-service.ts` - 认证服务（新建）
- ✅ `lib/types/api-v1.ts` - API 类型定义（新建）

**新增文件**:
- `lib/api-client.ts` - 统一 API 客户端
- `lib/services/auth-service.ts` - 认证服务封装
- `lib/services/currency-service.ts` - 货币数据服务
- `lib/services/alert-service-v2.ts` - 提醒服务
- `lib/types/api-v1.ts` - 完整的 API 类型定义
- `lib/hooks/use-currency-query.ts` - 货币数据 Query Hooks
- `lib/hooks/use-alert-query.ts` - 提醒 Query Hooks
- `scripts/check-env.js` - 环境检查脚本

**相关文档**:
- [认证实现文档](./AUTH_IMPLEMENTATION.md)
- [迁移指南](./MIGRATION_GUIDE.md)
- [API 文档](./API_MIGRATION_README.md)
- [快速开始](./QUICK_START.md)

---

## 数据库设计（后端）

后端数据库设计基于原 Supabase 架构，但移除了 RLS 策略，改用应用层权限控制。

**核心表**:
1. `users` - 用户表
2. `cryptocurrencies` - 加密货币基础信息
3. `crypto_prices` - 实时价格数据
4. `price_history` - 价格历史数据
5. `user_favorites` - 用户收藏
6. `user_alerts` - 用户提醒
7. `alert_notifications` - 提醒通知记录
8. `market_data` - 市场概览数据

**详细设计请参考后端文档**

---

## 性能优化

### 前端优化

1. **React Query 缓存** - 减少重复请求
2. **懒加载** - 组件按需加载
3. **虚拟滚动** - 大列表优化
4. **图片优化** - Next.js Image 组件
5. **代码分割** - 动态 import

### 网络优化

1. **请求合并** - 批量请求
2. **请求去重** - React Query 自动处理
3. **预加载** - 预先获取可能需要的数据
4. **CDN** - 静态资源 CDN 加速

### 后端优化（建议）

1. **数据库索引** - 优化查询性能
2. **缓存层** - Redis 缓存热点数据
3. **API 限流** - 防止滥用
4. **负载均衡** - 分散请求压力

---

## 监控和日志

### 错误跟踪

使用 Sentry 进行错误监控：

```typescript
// 自动捕获错误
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 性能监控

```typescript
// React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

---

## 总结

CryptoNiche 2.0 现在使用完全自定义的后端 API 架构：

- ✅ JWT 认证系统
- ✅ 统一的 API 客户端
- ✅ React Query 数据缓存
- ✅ 类型安全的 TypeScript 接口
- ✅ 跨标签页状态同步
- ✅ 完整的错误处理
- ✅ 环境配置检查
- ✅ 性能优化
- ✅ 安全防护

**项目状态**: ✅ 生产就绪

---

## 相关文件

### 核心文件
- `lib/api-client.ts` - API 客户端
- `lib/types/api-v1.ts` - 类型定义
- `hooks/use-auth.ts` - 认证 Hook
- `lib/services/auth-service.ts` - 认证服务

### 组件文件
- `components/auth/auth-modal.tsx` - 认证弹窗
- `components/auth/user-menu.tsx` - 用户菜单
- `components/profile/user-settings.tsx` - 用户设置

### 文档文件
- `docs/AUTH_IMPLEMENTATION.md` - 认证实现详解
- `docs/MIGRATION_GUIDE.md` - 迁移指南
- `docs/API_MIGRATION_README.md` - API 文档
- `docs/QUICK_START.md` - 快速开始

---

**版本**: v2.0.0
**最后更新**: 2025-11-12
**状态**: ✅ 已完成迁移，生产就绪
