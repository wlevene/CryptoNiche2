# 认证状态优化 - 解决重复 API 调用问题

## 问题描述

在优化前，应用中存在一个严重的性能问题：`/auth/me` 接口被调用了非常多次。

### 原因分析

1. **多个组件使用 useAuth Hook**
   - 发现有 9+ 个组件导入并使用 `useAuth()` hook
   - 每个组件都会创建独立的认证状态实例

2. **独立的状态实例**
   ```typescript
   // 旧的 hooks/use-auth.ts
   export function useAuth() {
     const [user, setUser] = useState<User | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       loadUserInfo(); // 每个组件挂载时都会调用
     }, []);
   }
   ```

3. **重复的 API 调用**
   - 每个使用 `useAuth()` 的组件都会在挂载时独立调用 `loadUserInfo()`
   - `loadUserInfo()` 内部调用 `authService.getMe()` 获取用户信息
   - 结果：同一页面可能触发 5-10 次 `/auth/me` API 调用

### 受影响的组件

```
components/crypto/quick-actions.tsx
components/auth/auth-modal.tsx
components/auth/user-menu.tsx
components/layout/navbar.tsx
components/profile/user-settings.tsx
components/market/favorite-button.tsx
src/app/profile/page.tsx
src/app/api-demo/page.tsx (使用了 2 次)
```

## 解决方案

使用 React Context API 创建全局的 AuthProvider，统一管理认证状态。

### 1. 创建 AuthProvider

**文件**: `lib/providers/auth-provider.tsx`

```typescript
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // loadUserInfo 只在 Provider 初始化时调用一次
  const loadUserInfo = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      apiClient.setToken(token);
      const userInfo = await authService.getMe(); // 只调用一次
      setUser(userInfo);
      localStorage.setItem('auth_user', JSON.stringify(userInfo));
    } catch (error) {
      console.error('Failed to load user info:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      apiClient.setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserInfo(); // 整个应用只调用一次

    // 监听 storage 和 401 事件
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        loadUserInfo();
      }
    };

    const handleUnauthorized = () => {
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

  // ... 其他认证方法

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### 2. 在应用根部注入 Provider

**文件**: `src/app/layout.tsx`

```typescript
import { AuthProvider } from "@/lib/providers/auth-provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>  {/* 全局认证状态 */}
              <AppInitializerProvider>
                {/* 应用内容 */}
              </AppInitializerProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 3. 更新旧的 useAuth Hook

**文件**: `hooks/use-auth.ts`

为了向后兼容，将旧的 hook 文件改为重新导出新的实现：

```typescript
/**
 * @deprecated 此文件已废弃，请使用 @/lib/providers/auth-provider 中的 useAuth
 * 为了向后兼容，这里重新导出新的实现
 */

export { useAuth } from "@/lib/providers/auth-provider";
export type { User } from "@/lib/types/api-v1";
```

## 优化效果

### 优化前
```
页面加载时的 API 调用：
/auth/me - 调用 1 (navbar)
/auth/me - 调用 2 (user-menu)
/auth/me - 调用 3 (quick-actions)
/auth/me - 调用 4 (favorite-button)
/auth/me - 调用 5 (profile page)
... 可能更多
总计：5-10+ 次调用
```

### 优化后
```
页面加载时的 API 调用：
/auth/me - 调用 1 (AuthProvider 初始化)
总计：1 次调用
```

**性能提升**：减少了 80-90% 的认证 API 调用

## 技术要点

### 1. Context API 的优势
- **单一实例**：整个应用共享同一个认证状态
- **统一管理**：所有认证逻辑集中在 Provider 中
- **性能优化**：避免重复的 API 调用
- **状态同步**：所有组件自动获取最新的认证状态

### 2. 向后兼容
- 保留了旧的 `hooks/use-auth.ts` 文件路径
- 所有现有组件的 import 语句无需修改
- 通过重新导出实现无缝迁移

### 3. 事件监听
- **storage 事件**：跨标签页同步认证状态
- **auth:unauthorized 事件**：处理 401 错误时的全局状态更新

### 4. 错误处理
- Token 过期时自动清理本地存储
- 401 错误时触发全局登出
- 跨标签页同步登出状态

## 最佳实践

1. **全局状态使用 Context**
   - 用户认证状态应该是全局共享的
   - 避免在多个组件中独立维护相同的状态

2. **API 调用去重**
   - 在 Provider 层面统一调用 API
   - 子组件只消费状态，不发起重复请求

3. **事件驱动更新**
   - 使用自定义事件处理跨组件通信
   - 监听存储变化实现跨标签页同步

4. **渐进式迁移**
   - 保持向后兼容，避免大规模重构
   - 通过重新导出实现平滑过渡

## 总结

通过引入 AuthProvider，我们成功解决了 `/auth/me` 接口被重复调用的问题。这个优化不仅提升了应用性能，还改善了代码架构，使认证逻辑更加清晰和易于维护。

**关键改进**：
- ✅ 减少 80-90% 的认证 API 调用
- ✅ 统一管理全局认证状态
- ✅ 保持向后兼容
- ✅ 改善代码架构
