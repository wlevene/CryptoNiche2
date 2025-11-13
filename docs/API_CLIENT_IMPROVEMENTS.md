# API 客户端改进 - 自动认证和权限管理

> **实施日期**: 2025-11-13
> **状态**: ✅ 已完成

---

## 🎯 问题描述

### 原始问题

用户报告在访问需要认证的接口时遇到 401 错误：

```
http://localhost:3000/api/v1/currency/alerts
Request Method: GET
Status Code: 401 Unauthorized
```

### 根本原因

1. **JWT Token 未自动添加** - 某些 API 调用没有在请求头中包含 Authorization token
2. **缺少统一的错误处理** - 401 错误没有被统一处理
3. **用户体验差** - 401 错误时没有自动清理状态和重定向

---

## ✅ 解决方案

### 核心改进

#### 1. **自动 JWT Token 管理**

API 客户端现在会自动：
- 从 localStorage 读取 `auth_token`
- 在每个请求中自动添加 `Authorization: Bearer <token>` header
- 登录/注册成功后自动保存 token

#### 2. **401 错误自动处理**

当遇到 401 Unauthorized 错误时，系统会自动：
1. 清除本地存储的认证信息 (`auth_token`, `auth_user`)
2. 清除 API 客户端的 token
3. 触发 `auth:unauthorized` 事件通知应用
4. 自动重定向到首页
5. 更新 React 状态，触发 UI 重新渲染

#### 3. **统一的认证状态管理**

- `useAuth` hook 监听 401 事件，自动清除用户状态
- 跨标签页状态同步（storage 事件）
- 认证状态变化自动更新 UI

---

## 🔧 技术实现

### 1. API 客户端 (`lib/api-client.ts`)

#### 自动添加 Token

```typescript
/**
 * 构建请求头
 */
private buildHeaders(customHeaders?: Record<string, string>): HeadersInit {
  const headers: Record<string, string> = { ...this.headers };

  // 自动添加认证 Token
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
```

#### 401 错误自动处理

```typescript
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

    // ... 其他错误处理
  }

  // ... 正常响应处理
}

/**
 * 处理 401 未认证错误
 * 清除本地存储并重定向到首页
 */
private handle401Error() {
  if (typeof window !== 'undefined') {
    console.warn('401 Unauthorized: Clearing auth data and redirecting to home');

    // 1. 清除认证信息
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.token = null;

    // 2. 触发自定义事件，通知应用程序用户已登出
    const event = new CustomEvent('auth:unauthorized');
    window.dispatchEvent(event);

    // 3. 重定向到首页
    setTimeout(() => {
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }, 100);
  }
}
```

### 2. 认证 Hook (`hooks/use-auth.ts`)

#### 监听 401 事件

```typescript
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
```

#### Token 自动保存

```typescript
/**
 * 登录（邮箱密码）
 */
const signIn = async (email: string, password: string) => {
  try {
    const data: LoginReq = { email, password };
    const response = await authService.login(data);

    // 1. 保存 Token 到 localStorage
    localStorage.setItem('auth_token', response.token);

    // 2. 设置到 API 客户端
    apiClient.setToken(response.token);

    // 3. 加载用户信息
    await loadUserInfo();

    return { user, error: null };
  } catch (error: any) {
    console.error('Sign in failed:', error);
    return { user: null, error: error.message || '登录失败' };
  }
};
```

---

## 📊 数据流程图

### 成功的认证流程

```
用户登录
  ↓
AuthService.login()
  ↓
保存 token 到 localStorage
  ↓
apiClient.setToken(token)
  ↓
loadUserInfo() - 获取用户详细信息
  ↓
setUser(userInfo) - 更新 React 状态
  ↓
UI 自动更新（显示用户信息、Profile 菜单等）
```

### 自动 Token 添加流程

```
发起 API 请求
  ↓
apiClient.buildHeaders()
  ↓
getToken() - 从 localStorage 读取
  ↓
添加 Authorization: Bearer <token>
  ↓
发送请求到后端
```

### 401 错误处理流程

```
API 返回 401
  ↓
apiClient.handleResponse() 检测到 401
  ↓
apiClient.handle401Error()
  ↓
┌─────────────────────────────────────┐
│ 1. 清除 localStorage                │
│    - auth_token                      │
│    - auth_user                       │
│                                      │
│ 2. 清除 apiClient.token             │
│                                      │
│ 3. 触发 'auth:unauthorized' 事件    │
│                                      │
│ 4. 重定向到首页 (/)                  │
└─────────────────────────────────────┘
  ↓
useAuth 监听到事件
  ↓
setUser(null) - 清除 React 状态
  ↓
UI 自动更新（显示登录按钮、隐藏 Profile 菜单等）
```

---

## 🚀 使用示例

### 基本用法 - 不需要手动添加 Token

**之前（手动添加 token）**：
```typescript
// ❌ 需要手动添加 token
const token = localStorage.getItem('auth_token');
const response = await fetch('/api/v1/currency/alerts', {
  headers: {
    'Authorization': `Bearer ${token}`, // 手动添加
  },
});
```

**现在（自动添加 token）**：
```typescript
// ✅ 自动添加 token，无需手动处理
const alerts = await apiClient.get('/api/v1/currency/alerts');
// Token 会自动从 localStorage 读取并添加到 Authorization header
```

### 使用 React Query

```typescript
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => apiClient.get('/api/v1/currency/alerts'),
    // ✅ Token 自动添加
    // ✅ 401 错误自动处理
  });
}
```

### 使用 Service Layer

```typescript
// lib/services/alert-service.ts
export class AlertService {
  async getAlerts(): Promise<Alert[]> {
    // ✅ Token 自动添加
    return apiClient.get('/api/v1/currency/alerts');
  }

  async createAlert(data: CreateAlertReq): Promise<Alert> {
    // ✅ Token 自动添加
    return apiClient.post('/api/v1/currency/alerts', data);
  }
}
```

---

## ✨ 优势和特性

### 1. **开发者体验改进**

- ✅ 无需在每个 API 调用中手动添加 Authorization header
- ✅ 统一的错误处理，减少重复代码
- ✅ 自动重定向，无需手动处理 401 错误

### 2. **用户体验改进**

- ✅ Token 过期或无效时自动登出
- ✅ 自动重定向到首页，避免用户停留在需要认证的页面
- ✅ 跨标签页状态同步
- ✅ 清晰的错误提示

### 3. **安全性提升**

- ✅ Token 统一管理，减少泄露风险
- ✅ 401 错误立即清除本地认证数据
- ✅ 自动处理 token 失效情况

### 4. **代码可维护性**

- ✅ 集中的认证逻辑
- ✅ 解耦的错误处理
- ✅ 清晰的数据流

---

## 📋 测试场景

### 场景 1: 正常登录

```
1. 用户输入邮箱密码
2. 点击登录
3. ✅ Token 保存到 localStorage
4. ✅ API 客户端设置 token
5. ✅ 用户信息加载成功
6. ✅ UI 显示用户登录状态
```

### 场景 2: 访问需要认证的接口

```
1. 用户已登录
2. 访问 Profile 页面
3. 组件调用 useFavorites() hook
4. ✅ API 请求自动包含 Authorization header
5. ✅ 成功返回收藏列表
```

### 场景 3: Token 过期

```
1. 用户已登录但 token 过期
2. 访问需要认证的接口
3. 后端返回 401
4. ✅ apiClient 检测到 401
5. ✅ 自动清除 localStorage
6. ✅ 触发 auth:unauthorized 事件
7. ✅ useAuth hook 清除用户状态
8. ✅ 自动重定向到首页
9. ✅ UI 显示未登录状态
```

### 场景 4: 手动登出

```
1. 用户点击登出按钮
2. ✅ 调用后端登出接口
3. ✅ 清除 localStorage
4. ✅ 清除 apiClient token
5. ✅ 清除 useAuth 用户状态
6. ✅ UI 更新显示未登录状态
```

### 场景 5: 跨标签页同步

```
标签页 A                     标签页 B
  登录                         (自动监听到 storage 事件)
  ↓                            ↓
保存 token                     重新加载用户信息
  ↓                            ↓
UI 显示已登录                  UI 显示已登录

标签页 A                     标签页 B
  登出                         (自动监听到 storage 事件)
  ↓                            ↓
清除 token                     清除用户状态
  ↓                            ↓
UI 显示未登录                  UI 显示未登录
```

---

## 🔍 调试和日志

### Console 输出

成功认证时：
```
✅ Token saved to localStorage
✅ User info loaded: { id: '123', email: 'user@example.com', ... }
```

401 错误时：
```
⚠️  401 Unauthorized: Clearing auth data and redirecting to home
✅ Received auth:unauthorized event, clearing user state
```

API 请求时：
```
→ GET /api/v1/currency/alerts
  Headers: { Authorization: 'Bearer eyJhbGc...' }
← 200 OK
  Data: { items: [...], total: 10 }
```

---

## 📝 迁移指南

### 如果你有手动添加 token 的代码

**需要更新的代码模式**：

#### Pattern 1: 直接 fetch 调用

```typescript
// ❌ 修改前
const token = localStorage.getItem('auth_token');
const response = await fetch('/api/v1/currency/alerts', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

// ✅ 修改后
const alerts = await apiClient.get('/api/v1/currency/alerts');
```

#### Pattern 2: Service 中的 fetch

```typescript
// ❌ 修改前
class FavoritesService {
  async getFavorites() {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/core/favorites', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  }
}

// ✅ 修改后
class FavoritesService {
  async getFavorites() {
    return apiClient.get('/core/favorites');
  }
}
```

#### Pattern 3: 组件中的 fetch

```typescript
// ❌ 修改前
const fetchData = async () => {
  const token = localStorage.getItem('auth_token');
  const response = await fetch('/api/v1/currency/alerts', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  setData(data);
};

// ✅ 修改后
const fetchData = async () => {
  const data = await apiClient.get('/api/v1/currency/alerts');
  setData(data);
};
```

---

## ⚠️ 注意事项

### 1. LocalStorage 安全性

虽然我们使用 localStorage 存储 token，但这是前端应用的常见做法。为了安全：
- Token 应该有合理的过期时间
- 使用 HTTPS 防止中间人攻击
- 后端应该验证 token 的有效性

### 2. 重定向行为

- 401 错误时会自动重定向到首页
- 如果需要记住用户想访问的页面，可以在重定向前保存 `returnUrl`

### 3. 服务端渲染 (SSR)

- `apiClient.getToken()` 在服务端返回 `null`（因为无法访问 localStorage）
- 需要认证的 SSR 请求应该使用 Next.js API 路由作为代理

---

## 🔮 未来改进

### 可能的增强功能

1. **Token 刷新机制**
   - 在 token 即将过期时自动刷新
   - 使用 refresh token

2. **离线支持**
   - 缓存认证状态到 IndexedDB
   - 离线时显示友好提示

3. **更细粒度的权限控制**
   - 基于角色的权限验证
   - 路由级别的权限保护

4. **请求重试**
   - Token 刷新后自动重试失败的请求
   - 网络错误时的重试机制

---

## 📚 相关文档

- [API 客户端完整文档](./API_CLIENT_README.md)
- [认证流程文档](./AUTH_IMPLEMENTATION.md)
- [错误处理指南](./ERROR_HANDLING.md)

---

## ✅ 验证清单

- [x] API 客户端自动添加 Authorization header
- [x] 401 错误自动清除认证数据
- [x] 401 错误自动重定向到首页
- [x] useAuth hook 监听 401 事件
- [x] 登录成功后正确保存 token
- [x] 登出时正确清除所有认证数据
- [x] 跨标签页状态同步工作正常
- [x] Next.js 编译成功无错误
- [x] 文档完整且清晰

---

**维护者**: Development Team
**最后更新**: 2025-11-13
**版本**: v2.2.0
**状态**: ✅ 已完成并测试通过
