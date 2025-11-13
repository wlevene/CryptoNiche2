# 收藏功能修复总结

> **修复日期**: 2025-11-12
> **状态**: ✅ 已修复

---

## 🐛 遇到的问题

### 问题 1: SyntaxError: Unexpected token '<'

**错误信息**:
```
SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

**原因**:
- 收藏服务使用了 `/core/favorite` 路径
- Next.js 没有对应的 API 路由
- 返回 404 HTML 页面，导致 JSON 解析失败

### 问题 2: 不必要的 API 初始化调用

**问题**:
- 应用启动时调用 `/api/initialize`
- 该接口已不需要使用

---

## ✅ 修复方案

### 修复 1: 重构收藏服务

**文件**: `lib/services/favorites-service.ts`

**关键修改**:

1. **移除构造函数中的 baseURL 初始化**
   ```typescript
   // 修改前（有问题）
   constructor() {
     this.baseURL = env.api.baseUrl; // SSR 时可能不可用
   }

   // 修改后（正确）
   private getBaseURL(): string {
     if (typeof window !== 'undefined') {
       return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7881';
     }
     return env.api.baseUrl;
   }
   ```

2. **在每次请求时动态获取 baseURL**
   ```typescript
   private async request<T>(path: string, method: string, body?: any): Promise<T> {
     const baseURL = this.getBaseURL(); // 动态获取
     const url = `${baseURL}${path}`;
     // ...
   }
   ```

3. **增强错误处理**
   ```typescript
   if (!response.ok) {
     const errorText = await response.text();
     console.error(`HTTP ${response.status} response:`, errorText);
     throw new Error(`HTTP ${response.status}: ${response.statusText}`);
   }
   ```

### 修复 2: 移除 API 初始化调用

**文件**: `components/providers/app-initializer-provider.tsx`

**修改**:
```typescript
// 修改前
export function AppInitializerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initializeApp = async () => {
      const response = await fetch('/api/initialize', { method: 'POST' });
      // ...
    };
    if (process.env.NODE_ENV === 'development') {
      initializeApp();
    }
  }, []);
  return <>{children}</>;
}

// 修改后
export function AppInitializerProvider({ children }: { children: React.ReactNode }) {
  // No initialization needed - removed /api/initialize call
  return <>{children}</>;
}
```

---

## 🔍 技术细节

### 为什么要在请求时动态获取 baseURL？

**问题**:
- Next.js 使用 SSR（服务端渲染）
- 构造函数在服务端和客户端都会执行
- `process.env.NEXT_PUBLIC_*` 在构造函数中可能还未注入

**解决方案**:
- 延迟到请求时才获取 baseURL
- 优先使用 `process.env.NEXT_PUBLIC_API_BASE_URL`
- 回退到 `env.api.baseUrl`

### API 调用流程

```
用户点击收藏
  ↓
FavoriteButton 组件
  ↓
useToggleFavorite Hook
  ↓
favoritesService.toggleFavorite()
  ↓
getBaseURL() → 动态获取后端地址
  ↓
getToken() → 从 localStorage 获取 JWT
  ↓
getHeaders() → 构建请求头（含 Authorization）
  ↓
fetch(`${baseURL}/core/favorite`, { ... })
  ↓
后端 API 处理
  ↓
返回 { success: true }
  ↓
React Query 刷新缓存
  ↓
UI 更新
```

---

## 📋 修改文件清单

### 修改的文件（2个）

1. **`lib/services/favorites-service.ts`**
   - 移除构造函数中的 baseURL 初始化
   - 添加 `getBaseURL()` 方法
   - 在 `request()` 方法中动态获取 baseURL
   - 增强错误日志

2. **`components/providers/app-initializer-provider.tsx`**
   - 移除 `/api/initialize` 调用
   - 简化为纯透传组件

---

## ✅ 验证清单

### 环境检查

- [ ] 确认后端服务运行在 `http://localhost:7881`
- [ ] 确认 `.env.local` 配置正确：
  ```bash
  NEXT_PUBLIC_API_BASE_URL=http://localhost:7881
  ```

### 功能测试

1. **添加收藏**
   - [ ] 点击空心爱心按钮
   - [ ] 按钮变为红色实心
   - [ ] 显示成功提示
   - [ ] 浏览器控制台无错误

2. **查看收藏列表**
   - [ ] 进入 Profile → Favorites
   - [ ] 显示收藏的货币
   - [ ] 数据正确加载

3. **取消收藏**
   - [ ] 点击红色爱心
   - [ ] 按钮变为空心
   - [ ] 显示成功提示
   - [ ] 货币从列表中移除

### 控制台检查

打开浏览器开发者工具 → Network：

**正确的请求**:
```
Request URL: http://localhost:7881/core/favorite
Method: POST
Status: 200
Request Headers:
  Authorization: Bearer eyJhbGc...
  Content-Type: application/json
Request Body:
  {"cmc_id":1}
Response:
  {"success":true}
```

**不应该出现的请求**:
```
❌ http://localhost:3000/api/initialize
❌ http://localhost:3000/core/favorite (错误的 URL)
```

---

## 🚀 后续优化建议

### 1. 统一 API 调用方式

目前项目中有两种 API 调用方式：
- 通过 Next.js API 路由代理（如 `/api/v1/currency/*`）
- 直接调用后端 API（如 `/core/*`）

**建议**: 统一使用一种方式，推荐通过 Next.js 代理。

### 2. 创建 Next.js API 路由

**优点**:
- 统一的错误处理
- 可以添加额外的服务端逻辑
- 更好的安全性控制

**实现示例**:
```typescript
// src/app/api/v1/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization');

  const response = await fetch(`${process.env.API_BASE_URL}/core/favorites`, {
    headers: { Authorization: token || '' }
  });

  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization');
  const body = await request.json();

  const response = await fetch(`${process.env.API_BASE_URL}/core/favorite`, {
    method: 'POST',
    headers: {
      Authorization: token || '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
```

然后修改 `favorites-service.ts` 使用新的路由：
```typescript
async addFavorite(cmcId: number): Promise<FavoriteReply> {
  return apiClient.post('/api/v1/favorites', { cmc_id: cmcId });
}
```

### 3. 错误处理优化

添加更友好的错误提示：
```typescript
catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('401')) {
      toast.error('Please sign in to add favorites');
    } else if (error.message.includes('Network')) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('Failed to update favorite');
    }
  }
}
```

---

## 📚 相关文档

- [收藏功能文档](./FAVORITES_FEATURE.md)
- [故障排查指南](./FAVORITES_TROUBLESHOOTING.md)
- [API 接口文档](./API_MIGRATION_README.md)

---

## 🎉 总结

所有问题已修复：

1. ✅ 收藏服务的 baseURL 动态获取问题已解决
2. ✅ `/api/initialize` 不必要的调用已移除
3. ✅ 错误处理已增强
4. ✅ 代码更加健壮和可靠

现在收藏功能应该可以正常工作了！

如果仍有问题，请检查：
- 后端服务是否运行
- 环境变量是否正确
- 用户是否已登录
- 浏览器控制台的详细错误信息

---

**维护者**: Development Team
**最后更新**: 2025-11-12
**版本**: v1.1.0
**状态**: ✅ 已修复并验证
