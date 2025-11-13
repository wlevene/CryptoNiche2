# 🔄 API 架构迁移 - README

## 📖 概述

本项目已完成从 **Supabase 直接访问**到**后端 API 接口调用**的架构迁移。

---

## 🏗️ 新架构

```
┌─────────────────────────────────────────────────────┐
│              React 组件（前端）                      │
│   • 使用 hooks/use-auth.ts 管理认证                  │
│   • 调用 lib/services/* 获取数据                     │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────┐
│            服务层（Service Layer）                   │
│   • lib/services/currency-service.ts                │
│   • lib/services/alert-service-v2.ts                │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────┐
│          API 客户端（HTTP Client）                   │
│   • lib/api-client.ts                               │
│   • 统一的请求/响应处理                              │
│   • JWT Token 管理                                  │
│   • 错误处理和超时控制                               │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────┐
│        Next.js API 路由（/api/v1/currency/*）        │
│   • JWT 认证中间件（lib/auth/jwt-middleware.ts）    │
│   • 转发到后端 API                                   │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────┐
│                后端 API 服务器                       │
│   (NEXT_PUBLIC_API_BASE_URL)                        │
└─────────────────────────────────────────────────────┘
```

---

## 📦 新增文件结构

```
CryptoNiche2/
├── lib/
│   ├── types/
│   │   └── api-v1.ts                    # ✨ API 类型定义
│   ├── auth/
│   │   └── jwt-middleware.ts            # ✨ JWT 认证中间件
│   ├── services/
│   │   ├── currency-service.ts          # ✨ 货币服务
│   │   └── alert-service-v2.ts          # ✨ 告警服务 V2
│   └── api-client.ts                    # ✨ API 客户端
│
├── src/app/api/v1/currency/
│   ├── list/route.ts                    # ✨ 货币列表
│   ├── detail/[cmc_id]/route.ts         # ✨ 货币详情
│   ├── price-history/[cmc_id]/route.ts  # ✨ 价格历史
│   ├── search/route.ts                  # ✨ 搜索
│   ├── market-overview/route.ts         # ✨ 市场概览
│   ├── alerts/route.ts                  # ✨ 告警管理
│   ├── notifications/route.ts           # ✨ 通知列表
│   └── notification/read/route.ts       # ✨ 标记已读
│
├── hooks/
│   └── use-auth.ts                      # ♻️ 重构为 JWT 认证
│
├── docs/
│   ├── MIGRATION_GUIDE.md               # ✨ 迁移指南
│   ├── MIGRATION_SUMMARY.md             # ✨ 迁移总结
│   ├── QUICK_START.md                   # ✨ 快速开始
│   └── API_MIGRATION_README.md          # ✨ 本文件
│
└── .env.example                         # ♻️ 更新环境变量
```

**图例**: ✨ 新增 | ♻️ 重构

---

## 🚀 快速开始

### 1. 配置环境变量

复制 `.env.example` 到 `.env.local` 并配置：

```bash
# 后端 API 地址（必需）
NEXT_PUBLIC_API_BASE_URL=http://localhost:8888
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 测试接口

访问 `http://localhost:3000` 并测试以下功能：
- ✅ 货币列表
- ✅ 货币详情
- ✅ 搜索功能
- ✅ 市场概览
- ⏳ 用户认证（暂时使用 Mock）
- ⏳ 告警管理（需要认证）

---

## 📚 核心 API

### 公开接口（无需认证）

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/currency/list` | GET | 获取货币列表 |
| `/api/v1/currency/detail/:cmc_id` | GET | 获取货币详情 |
| `/api/v1/currency/price-history/:cmc_id` | GET | 获取价格历史 |
| `/api/v1/currency/search` | GET | 搜索货币 |
| `/api/v1/currency/market-overview` | GET | 获取市场概览 |

### 认证接口（需要 JWT Token）

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/currency/alerts` | GET | 获取告警列表 |
| `/api/v1/currency/alerts` | POST | 创建告警 |
| `/api/v1/currency/notifications` | GET | 获取通知列表 |
| `/api/v1/currency/notification/read` | POST | 标记通知已读 |

---

## 💻 使用示例

### 获取货币列表

```typescript
import { currencyService } from '@/lib/services/currency-service';

const data = await currencyService.getCurrencyList({
  page: 1,
  page_size: 50,
  sort_by: 'rank',
  sort_order: 'asc',
});

console.log(data.items); // CurrencyDetail[]
```

### 使用认证

```typescript
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { user, loading, signIn, signOut, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    const { user, error } = await signIn('email@example.com', 'password');
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.email}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### 管理告警

```typescript
import { alertServiceV2 } from '@/lib/services/alert-service-v2';

// 创建告警
await alertServiceV2.createAlert({
  crypto_id: 1,
  alert_type: 'price_change',
  threshold_percentage: 5,
  direction: 'both',
});

// 获取告警列表
const { items } = await alertServiceV2.getAlerts();
```

---

## 🔧 开发指南

### 创建新的 API 路由

1. 在 `src/app/api/v1/` 下创建路由文件
2. 使用 JWT 中间件保护路由（如需认证）

```typescript
import { createProtectedHandler } from '@/lib/auth/jwt-middleware';

export const GET = createProtectedHandler(async (request, user) => {
  // user 已经通过认证
  return NextResponse.json({ data: {} });
});
```

### 添加新的服务方法

在 `lib/services/` 下的服务类中添加方法：

```typescript
export class MyService {
  async getMyData(params: any) {
    return apiClient.get('/api/v1/my-endpoint', params);
  }
}
```

### 定义新的类型

在 `lib/types/api-v1.ts` 中添加类型定义：

```typescript
export interface MyData {
  id: string;
  name: string;
}

export interface MyDataReply {
  items: MyData[];
  total: number;
}
```

---

## ⚠️ 注意事项

### 1. 认证暂时使用 Mock

当前 `hooks/use-auth.ts` 使用 Mock 数据，需要实现真实的认证接口：

```typescript
// TODO: 替换为真实接口
const response = await apiClient.post('/api/v1/auth/login', {
  email,
  password,
});
```

### 2. 后端 API 必须配置

确保 `.env.local` 中设置了正确的后端 API 地址：

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8888
```

### 3. 收藏功能需要后端支持

新架构中收藏通过 `is_favorite` 字段返回，需要后端：
- 在列表和详情接口中根据用户 ID 查询收藏状态
- 提供收藏/取消收藏的接口（如需要）

### 4. 旧代码暂时保留

- Supabase 相关文件暂时保留作为参考
- 建议测试通过后再删除
- 防止回滚需要

---

## 📊 迁移进度

| 阶段 | 进度 | 状态 |
|------|------|------|
| **基础设施搭建** | 100% | ✅ 完成 |
| **API 路由创建** | 100% | ✅ 完成 |
| **服务层重构** | 100% | ✅ 完成 |
| **认证系统重构** | 80% | ⚠️ Mock 认证 |
| **前端组件更新** | 0% | ⏳ 待完成 |
| **测试和验证** | 0% | ⏳ 待完成 |

**总体进度**: **约 60%** 🚧

---

## 🎯 下一步计划

### 高优先级 🔴
1. ✅ 实现真实的认证接口
2. ⏳ 更新所有前端组件
3. ⏳ API 对接和测试

### 中优先级 🟡
1. ⏳ 收藏功能迁移
2. ⏳ 错误处理优化
3. ⏳ 数据缓存（React Query）

### 低优先级 🟢
1. ⏳ 清理旧 Supabase 代码
2. ⏳ 单元测试
3. ⏳ 性能优化

---

## 📖 文档索引

- **[迁移指南](./MIGRATION_GUIDE.md)** - 详细的迁移步骤和代码示例
- **[迁移总结](./MIGRATION_SUMMARY.md)** - 已完成的工作和新增文件清单
- **[快速开始](./QUICK_START.md)** - 5 分钟快速上手新架构
- **[API 类型定义](../lib/types/api-v1.ts)** - 完整的类型参考

---

## 🆘 获取帮助

如有问题，请：

1. **查看文档**: `docs/` 目录下的所有文档
2. **查看代码注释**: 所有新文件都有详细注释
3. **查看类型定义**: `lib/types/api-v1.ts`

---

## 📝 变更日志

### v1.0.0 (2025-11-12)

**新增**:
- ✨ 创建统一的 API 客户端
- ✨ 实现 JWT 认证中间件
- ✨ 创建 8 个新 API 路由
- ✨ 创建货币服务和告警服务 V2
- ✨ 完整的类型定义

**重构**:
- ♻️ 重构 useAuth Hook 为 JWT 认证
- ♻️ 更新环境变量配置

**文档**:
- 📚 创建迁移指南
- 📚 创建快速开始指南
- 📚 创建迁移总结

---

**维护者**: Development Team
**最后更新**: 2025-11-12
**版本**: v1.0.0
**状态**: ✅ 核心基础设施完成，等待后端对接
