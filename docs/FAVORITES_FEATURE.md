# 收藏功能实现文档

> **实现日期**: 2025-11-12
> **状态**: ✅ 完成

---

## 📋 功能概述

收藏功能允许用户将感兴趣的加密货币添加到收藏列表，方便快速访问和追踪。

### 核心特性

- ✅ 添加/取消收藏
- ✅ 查看收藏列表
- ✅ 收藏状态实时同步
- ✅ 乐观 UI 更新
- ✅ React Query 缓存管理
- ✅ 登录状态检查

---

## 🏗️ 架构设计

```
前端组件
  ↓
React Query Hooks (use-favorites-query.ts)
  ↓
服务层 (favorites-service.ts)
  ↓
API 客户端 (api-client.ts) + JWT Token
  ↓
后端 API (/core/favorite, /core/unfavorite, /core/favorites)
```

---

## 📁 文件结构

### 新增文件

```
lib/
├── services/
│   └── favorites-service.ts          # 收藏服务封装
├── hooks/
│   └── use-favorites-query.ts        # React Query Hooks

components/
├── market/
│   └── favorite-button.tsx           # 收藏按钮组件
└── profile/
    └── favorites-list.tsx            # 收藏列表组件
```

### 修改文件

```
src/app/profile/page.tsx              # 添加 Favorites 标签页
components/sections/market-overview.tsx  # 集成收藏按钮
```

---

## 🔌 后端 API 接口

**重要**: 收藏接口直接调用后端 API（不经过 Next.js API 路由）

**Base URL**: `NEXT_PUBLIC_API_BASE_URL` (默认: `http://localhost:7881`)

### 1. 添加收藏

```http
POST {BASE_URL}/core/favorite
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "cmc_id": 1
}
```

**响应**:
```json
{
  "success": true
}
```

### 2. 取消收藏

```http
POST {BASE_URL}/core/unfavorite
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "cmc_id": 1
}
```

**响应**:
```json
{
  "success": true
}
```

### 3. 获取收藏列表

```http
GET {BASE_URL}/core/favorites
Authorization: Bearer <JWT_TOKEN>
```

**响应**:
```json
{
  "items": [
    {
      "id": "...",
      "cmc_id": 1,
      "symbol": "BTC",
      "name": "Bitcoin",
      "slug": "bitcoin",
      "cmc_rank": 1,
      ...
    }
  ]
}
```

### 环境配置

确保 `.env.local` 中配置了正确的后端 API 地址：

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:7881
```

---

## 💻 组件使用示例

### 1. 收藏按钮 (FavoriteButton)

```tsx
import { FavoriteButton } from "@/components/market/favorite-button";

function CryptoCard({ currency }) {
  return (
    <div>
      <h3>{currency.name}</h3>
      <FavoriteButton
        cmcId={currency.cmc_id}
        isFavorite={currency.is_favorite}
        symbol={currency.symbol}
        variant="ghost"
        size="icon"
        showText={false}
      />
    </div>
  );
}
```

**Props**:
- `cmcId` (required): 货币的 CMC ID
- `isFavorite` (required): 初始收藏状态
- `symbol` (optional): 货币符号（用于提示消息）
- `variant`: 按钮样式变体
- `size`: 按钮尺寸
- `showText`: 是否显示文字
- `className`: 自定义样式类

### 2. 收藏列表 (FavoritesList)

```tsx
import { FavoritesList } from "@/components/profile/favorites-list";

function ProfilePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Favorites</CardTitle>
      </CardHeader>
      <CardContent>
        <FavoritesList />
      </CardContent>
    </Card>
  );
}
```

### 3. React Query Hooks

```tsx
import {
  useFavorites,
  useAddFavorite,
  useRemoveFavorite,
  useToggleFavorite,
} from "@/lib/hooks/use-favorites-query";

function MyComponent() {
  // 获取收藏列表
  const { data, isLoading } = useFavorites();

  // 添加收藏
  const addFavorite = useAddFavorite();
  const handleAdd = () => {
    addFavorite.mutate(1); // CMC ID
  };

  // 取消收藏
  const removeFavorite = useRemoveFavorite();
  const handleRemove = () => {
    removeFavorite.mutate(1);
  };

  // 切换收藏状态
  const toggleFavorite = useToggleFavorite();
  const handleToggle = () => {
    toggleFavorite.mutate({ cmcId: 1, isFavorite: true });
  };
}
```

---

## 🎨 UI/UX 特性

### 收藏按钮

- **空心爱心**: 未收藏状态
- **实心红色爱心**: 已收藏状态
- **Hover 效果**: 红色高亮
- **动画过渡**: 平滑的填充动画
- **禁用状态**: 加载中显示禁用
- **事件阻止**: 防止冒泡到父元素

### 收藏列表

- **空状态**: 显示友好的空状态提示
- **加载状态**: 骨架屏占位
- **错误状态**: 显示错误信息
- **卡片布局**: 美观的卡片式展示
- **响应式**: 自适应不同屏幕尺寸

---

## 🔄 数据流程

### 添加收藏流程

```
用户点击收藏按钮
  ↓
检查登录状态
  ↓
乐观更新 UI（立即变为红色）
  ↓
调用 toggleFavorite.mutate()
  ↓
发送 POST /core/favorite
  ↓
成功: 显示成功提示 + 刷新缓存
  ↓
失败: 回滚 UI + 显示错误提示
```

### 缓存刷新策略

收藏操作成功后，自动刷新以下缓存：
- ✅ 收藏列表 (`favoritesKeys.lists()`)
- ✅ 货币列表 (`currencyKeys.lists()`)
- ✅ 货币详情 (`currencyKeys.details()`)

这确保了所有页面的收藏状态保持同步。

---

## 🔐 认证要求

所有收藏相关的 API 都需要 JWT Token 认证：

```typescript
// API 客户端自动添加 Authorization Header
Authorization: Bearer <token>
```

**未登录处理**:
- 点击收藏按钮时检查 `isAuthenticated`
- 如果未登录，显示提示 "Please sign in to add favorites"
- 不会发送 API 请求

---

## 📊 React Query 配置

### 缓存时间

```typescript
// 收藏列表缓存 1 分钟
staleTime: 1000 * 60 * 1
```

### 自动刷新

收藏操作成功后，通过 `queryClient.invalidateQueries()` 自动刷新相关缓存。

---

## 🎯 集成位置

### 当前集成

1. ✅ **Profile 页面** - Favorites 标签页
2. ✅ **Market Overview** - 涨幅榜/跌幅榜卡片

### 可以集成的位置

3. ⏳ **货币列表页面** - 每个货币项
4. ⏳ **货币详情页面** - 详情页头部
5. ⏳ **搜索结果页面** - 搜索结果项

---

## 🚀 扩展建议

### 1. 收藏分组

允许用户创建多个收藏列表（如：长期持有、观察名单、高风险等）

### 2. 收藏排序

支持按价格、涨跌幅、添加时间等排序

### 3. 收藏导出

支持导出收藏列表为 CSV/JSON

### 4. 收藏提醒

为收藏的货币快速创建价格提醒

### 5. 收藏分享

生成分享链接，分享收藏列表给其他人

---

## 🐛 已知问题

### 1. Currency 类型不包含 price

当前 `FavoritesList` 组件中，从 `/core/favorites` 返回的 `Currency` 类型不包含价格信息。

**解决方案**:
- 需要后端在收藏列表接口中关联价格数据
- 或者前端额外调用价格接口

### 2. 实时价格更新

收藏列表中的价格数据是静态的，不会自动更新。

**解决方案**:
- 使用 `refetchInterval` 定期刷新
- 或者集成 WebSocket 实时价格推送

---

## 📝 测试清单

### 功能测试

- [x] 未登录时点击收藏按钮显示提示
- [x] 添加收藏成功显示提示
- [x] 取消收藏成功显示提示
- [x] 收藏状态在多个页面同步
- [x] 收藏列表正确显示
- [x] 空状态正确显示
- [x] 加载状态正确显示
- [x] 错误状态正确显示

### UI 测试

- [x] 收藏按钮动画流畅
- [x] 响应式布局正常
- [x] 深色模式适配
- [x] 禁用状态样式正确

### 性能测试

- [x] React Query 缓存生效
- [x] 乐观更新流畅
- [x] 不重复请求

---

## 📚 相关文档

- [API 接口文档](./API_MIGRATION_README.md)
- [数据库架构](./database-schema.md)
- [认证实现](./AUTH_IMPLEMENTATION.md)
- [迁移指南](./MIGRATION_GUIDE.md)

---

**维护者**: Development Team
**最后更新**: 2025-11-12
**版本**: v1.0.0
**状态**: ✅ 已完成实现
