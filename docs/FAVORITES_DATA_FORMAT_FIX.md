# 收藏列表数据格式修复

> **修复日期**: 2025-11-13
> **状态**: ✅ 已修复

---

## 🐛 问题描述

### 症状

用户报告收藏列表无法显示，但后端 API 返回了数据：

**后端 API**: `http://localhost:7881/core/favorites`
**返回数据**:
```json
{
  "code": 0,
  "msg": "OK",
  "data": {
    "items": [
      {
        "id": "691434f1fee65862d01552f9",
        "cmc_id": 37263,
        "symbol": "CC",
        "name": "Canton",
        "slug": "canton-network",
        "cmc_rank": 29,
        ...
      },
      {
        "id": "691434f1fee65862d01553e5",
        "cmc_id": 22691,
        "symbol": "STRK",
        "name": "Starknet",
        ...
      }
    ]
  }
}
```

**前端显示**: "No favorites yet" （空状态）

### 根本原因

**后端返回的数据格式** 与 **前端期望的格式** 不匹配：

**后端实际格式**:
```typescript
{
  code: 0,
  msg: "OK",
  data: {
    items: Currency[]
  }
}
```

**前端期望格式**:
```typescript
{
  items: Currency[]
}
```

`favorites-service.ts` 的 `request()` 方法直接返回了整个响应对象，没有提取 `data` 字段。

---

## ✅ 解决方案

### 修改文件

**文件**: `lib/services/favorites-service.ts`

### 修改内容

在 `request()` 方法中添加数据提取逻辑：

```typescript
// ❌ 修改前
const data = await response.json();
return data;

// ✅ 修改后
const result = await response.json();

// 后端返回格式: { code: 0, msg: "OK", data: {...} }
// 检查是否有 data 字段
if (result.data !== undefined) {
  return result.data;
}

// 如果没有 data 字段，直接返回结果（兼容其他格式）
return result;
```

### 完整的修改代码

```typescript
/**
 * 通用请求方法
 */
private async request<T>(
  path: string,
  method: string,
  body?: any
): Promise<T> {
  const baseURL = this.getBaseURL();
  const url = `${baseURL}${path}`;

  try {
    const response = await fetch(url, {
      method,
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP ${response.status} response:`, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    // 后端返回格式: { code: 0, msg: "OK", data: {...} }
    // 检查是否有 data 字段
    if (result.data !== undefined) {
      return result.data;  // ✅ 提取 data 字段
    }

    // 如果没有 data 字段，直接返回结果（兼容其他格式）
    return result;
  } catch (error) {
    console.error(`API request failed: ${method} ${url}`, error);
    throw error;
  }
}
```

---

## 🔍 数据流分析

### 修复前的数据流

```
后端 API
  ↓ 返回
{
  code: 0,
  msg: "OK",
  data: {
    items: [...]
  }
}
  ↓ favorites-service.ts
直接返回整个对象
  ↓ use-favorites-query.ts
data = {
  code: 0,
  msg: "OK",
  data: { items: [...] }
}
  ↓ favorites-list.tsx
检查 data.items
  ❌ data.items = undefined  // 因为 data 是整个响应对象
  ↓
显示 "No favorites yet"
```

### 修复后的数据流

```
后端 API
  ↓ 返回
{
  code: 0,
  msg: "OK",
  data: {
    items: [...]
  }
}
  ↓ favorites-service.ts
提取 result.data
  ↓ 返回
{
  items: [...]
}
  ↓ use-favorites-query.ts
data = {
  items: [...]
}
  ↓ favorites-list.tsx
检查 data.items
  ✅ data.items = [...]  // 正确！
  ↓
显示收藏列表
```

---

## 🎯 设计考虑

### 为什么使用条件提取？

```typescript
if (result.data !== undefined) {
  return result.data;
}
return result;
```

**原因**:
1. **兼容性** - 不同的后端接口可能使用不同的响应格式
2. **灵活性** - 如果某个接口直接返回数据（没有 wrapper），也能正常工作
3. **向后兼容** - 不会破坏现有的其他 API 调用

### API 响应格式标准化

**理想情况**: 所有后端 API 应该使用统一的响应格式

**选项 1**: Go-Zero 标准格式（当前后端使用）
```json
{
  "code": 0,
  "msg": "OK",
  "data": { ... }
}
```

**选项 2**: 简化格式（前端期望）
```json
{
  "success": true,
  "data": { ... }
}
```

**当前解决方案**: 在服务层自动适配两种格式

---

## 📊 影响范围

### 修复影响的功能

1. ✅ **收藏列表显示** (`/profile` → Favorites 标签页)
   - 现在能正确显示后端返回的收藏列表

2. ✅ **添加收藏** (首页 ❤️ 按钮)
   - 添加收藏后，Profile 页面能正确刷新显示

3. ✅ **取消收藏** (收藏列表中的 ❤️ 按钮)
   - 取消收藏后，列表正确更新

### 不受影响的功能

其他使用 `favorites-service.ts` 的功能都会自动修复，因为修改在底层 `request()` 方法中。

---

## 🧪 测试验证

### 测试场景 1: 查看收藏列表

**步骤**:
1. 登录账号
2. 访问 Profile → Favorites 标签页
3. 观察是否显示收藏列表

**预期结果**:
```
✅ 如果有收藏:
   - 显示收藏的加密货币卡片
   - 每个卡片显示: symbol, name, rank, supply, 24h high/low

✅ 如果没有收藏:
   - 显示 "No favorites yet" 空状态
```

### 测试场景 2: 添加收藏

**步骤**:
1. 访问首页
2. 点击任意加密货币的 ❤️ 按钮
3. 访问 Profile → Favorites 标签页

**预期结果**:
```
✅ 首页:
   - ❤️ 按钮变为实心红色
   - 显示成功提示

✅ Favorites 标签页:
   - 新添加的加密货币出现在列表中
```

### 测试场景 3: 取消收藏

**步骤**:
1. 在 Favorites 列表中
2. 点击某个收藏项的 ❤️ 按钮
3. 观察列表变化

**预期结果**:
```
✅ Favorites 列表:
   - 该项从列表中消失
   - 如果列表变空，显示 "No favorites yet"
```

---

## 🔧 调试技巧

### 查看原始 API 响应

在 Console 中执行：
```javascript
fetch('http://localhost:7881/core/favorites', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
})
.then(res => res.json())
.then(data => console.log('Raw API response:', data));
```

### 查看处理后的数据

在 `favorites-service.ts` 的 `request()` 方法中添加日志：
```typescript
const result = await response.json();
console.log('Raw result:', result);

if (result.data !== undefined) {
  console.log('Extracted data:', result.data);
  return result.data;
}
```

### 验证 React Query 缓存

在 Console 中执行：
```javascript
// 获取 React Query 的 devtools
import { useQueryClient } from '@tanstack/react-query';

// 在组件中
const queryClient = useQueryClient();
console.log('Cached favorites:', queryClient.getQueryData(['favorites', 'list']));
```

---

## 🎨 UI 显示效果

### 有收藏时

```
┌────────────────────────────────────────────┐
│ Your Favorite Cryptocurrencies             │
│ Track your favorite cryptocurrencies...    │
├────────────────────────────────────────────┤
│                                            │
│  ┌────────────────────────────────────┐   │
│  │ CC - Canton                   #29   │   │
│  │                                     │   │
│  │ Market Pairs: 44                    │   │
│  │ Circulating: 35.0B                  │   │
│  │ Max Supply: N/A                     │   │
│  │                                     │   │
│  │ ↗️ 24h High: $0.133                │   │
│  │ ↘️ 24h Low: $0.097                 │   │
│  │                                [❤️]  │   │
│  └────────────────────────────────────┘   │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │ STRK - Starknet               #88   │   │
│  │                                     │   │
│  │ Market Pairs: 283                   │   │
│  │ Circulating: 4.6B                   │   │
│  │ Max Supply: 10.0B                   │   │
│  │                                     │   │
│  │ ↗️ 24h High: $3.66                 │   │
│  │ ↘️ 24h Low: $0.05                  │   │
│  │                                [❤️]  │   │
│  └────────────────────────────────────┘   │
│                                            │
└────────────────────────────────────────────┘
```

### 无收藏时

```
┌────────────────────────────────────────────┐
│ Your Favorite Cryptocurrencies             │
│ Track your favorite cryptocurrencies...    │
├────────────────────────────────────────────┤
│                                            │
│                    ❤️                       │
│                                            │
│           No favorites yet                 │
│                                            │
│   Start adding cryptocurrencies to your    │
│   favorites to track them easily           │
│                                            │
└────────────────────────────────────────────┘
```

---

## 📝 相关代码

### 类型定义

**文件**: `lib/services/favorites-service.ts`
```typescript
/**
 * 收藏列表响应
 */
export interface FavoriteListReply {
  items: Currency[];
}
```

### Service 调用

**文件**: `lib/hooks/use-favorites-query.ts`
```typescript
export function useFavorites() {
  return useQuery({
    queryKey: favoritesKeys.lists(),
    queryFn: () => favoritesService.getFavorites(),
    // 返回: { items: Currency[] }
    staleTime: 1000 * 60 * 1,
  });
}
```

### 组件使用

**文件**: `components/profile/favorites-list.tsx`
```typescript
export function FavoritesList() {
  const { data, isLoading, error } = useFavorites();

  // data = { items: Currency[] }
  if (!data || !data.items || data.items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {data.items.map((currency) => (
        <CurrencyCard key={currency.id} currency={currency} />
      ))}
    </div>
  );
}
```

---

## ⚠️ 注意事项

### 后端 API 格式标准化建议

为了避免类似问题，建议后端统一 API 响应格式：

**推荐格式**:
```typescript
// 成功响应
{
  code: 0,
  msg: "OK",
  data: T  // 实际数据
}

// 错误响应
{
  code: 1001,
  msg: "Error message",
  data: null
}
```

### 前端适配层

当前的修复在 `favorites-service.ts` 中：
- ✅ 自动提取 `data` 字段
- ✅ 兼容多种响应格式
- ✅ 不影响其他 API 调用

如果需要统一处理所有 API 响应，可以在 `api-client.ts` 中添加类似的逻辑。

---

## ✅ 验证清单

- [x] 修改 `favorites-service.ts` 的 `request()` 方法
- [x] 添加 `data` 字段提取逻辑
- [x] 保持向后兼容性
- [x] Next.js 编译成功
- [x] 无 TypeScript 错误
- [x] 收藏列表正确显示
- [x] 添加/删除收藏功能正常

---

## 📚 相关文档

- [Favorites 功能文档](./FAVORITES_FEATURE.md)
- [API 客户端改进](./API_CLIENT_IMPROVEMENTS.md)
- [数据类型定义](./API_TYPES.md)

---

**维护者**: Development Team
**最后更新**: 2025-11-13
**版本**: v2.2.1
**状态**: ✅ 已修复并测试通过
