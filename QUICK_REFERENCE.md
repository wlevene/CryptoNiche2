# CryptoNiche 2.0 - 快速参考清单

## Supabase 核心文件 (必读)

### 客户端初始化 (4个文件)
- [ ] `/lib/supabase.ts` - 类型定义和基础导出
- [ ] `/lib/supabase-browser.ts` - 浏览器端客户端 (用于 useAuth)
- [ ] `/lib/supabase-server.ts` - 服务器端客户端 (用于 API 路由)
- [ ] `/lib/supabase-admin.ts` - 管理员客户端 (用于数据同步)

### 认证系统 (2个文件)
- [ ] `/hooks/use-auth.ts` - React Hook 获取当前用户
- [ ] `/src/app/auth/callback/route.ts` - OAuth 回调处理

### 数据访问 (4个文件)
- [ ] `/lib/crypto-db.ts` - 加密货币数据操作
- [ ] `/lib/alert-service.ts` - 告警管理服务
- [ ] `/lib/services/favorites-service.ts` - 收藏功能
- [ ] `/lib/services/database/crypto-repository.ts` - 数据访问对象

---

## 数据库架构

### 核心表 (5个)
```
users                - 用户信息 (UUID ID)
cryptocurrencies     - 加密货币基础信息 (INTEGER ID)
crypto_prices        - 实时价格数据
price_history        - 价格历史数据
market_data          - 整体市场数据
```

### 用户功能表 (3个)
```
user_favorites       - 收藏列表
user_alerts          - 价格告警设置
alert_notifications  - 告警通知记录
```

### 关键视图 (2个)
```
latest_crypto_prices - 每个加密货币的最新价格
top_cryptocurrencies - 排序的热门加密货币 (带最新价格)
```

---

## API 端点速查

### 公开 API (无需认证)
```bash
GET  /api/crypto/list?startRank=1&endRank=100      # 获取列表
GET  /api/crypto/[id]                               # 获取详情
GET  /api/crypto/[id]/price-history                 # 获取历史
GET  /api/crypto/stats                              # 获取统计
```

### 用户 API (需要 JWT)
```bash
GET  /api/favorites                                 # 获取收藏
POST /api/favorites {crypto_id}                     # 添加收藏
DEL  /api/favorites?crypto_id=1                     # 删除收藏
GET  /api/favorites/check?crypto_ids=1,2,3          # 检查状态

GET  /api/alerts                                    # 获取告警
POST /api/alerts {alert_config}                     # 创建告警
PUT  /api/alerts/[id] {updates}                     # 更新告警
DEL  /api/alerts/[id]                               # 删除告警
POST /api/alerts/[id]/toggle {is_active}            # 切换状态
```

---

## 关键代码片段

### 1. 获取当前用户
```typescript
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { user, loading, signOut } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;
  
  return <div>Hello, {user.email}</div>;
}
```

### 2. 获取加密货币列表
```typescript
async function getMarketData() {
  const response = await fetch('/api/crypto/list?startRank=1&endRank=100');
  const { data } = await response.json();
  return data; // CryptoCurrency[]
}
```

### 3. 管理收藏
```typescript
import { FavoritesService } from '@/lib/services/favorites-service';

const service = new FavoritesService();
await service.addToFavorites(1); // 添加到收藏
await service.removeFromFavorites(1); // 从收藏移除
const favorites = await service.getFavorites(); // 获取所有收藏
```

### 4. 创建价格告警
```typescript
const response = await fetch('/api/alerts', {
  method: 'POST',
  body: JSON.stringify({
    crypto_id: 1,
    alert_type: 'price_change', // 'price_change' | 'price_threshold'
    threshold_percentage: 5,      // 如果是 price_change
    direction: 'both',            // 'up' | 'down' | 'both'
    notification_frequency: 'immediate' // 'immediate' | 'hourly' | 'daily'
  })
});
```

### 5. 服务器端数据库操作
```typescript
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  // 检查认证
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  // 数据库查询
  const { data } = await supabase
    .from('user_favorites')
    .select('*')
    .eq('user_id', user.id);
    
  return Response.json({ data });
}
```

---

## 常见任务

### 添加新的 API 端点
1. 创建文件: `/src/app/api/[feature]/route.ts`
2. 导入客户端: `import { createClient } from '@/lib/supabase-server'`
3. 检查认证: `const { data: { user } } = await supabase.auth.getUser()`
4. 执行查询并返回

### 添加新的用户功能
1. 在数据库创建新表 (如需)
2. 创建 Service 类 (在 `/lib/services/`)
3. 创建 API 路由
4. 创建 React 组件使用该服务

### 查询最新加密货币数据
```typescript
const { data } = await supabase
  .from('top_cryptocurrencies')
  .select('*')
  .order('cmc_rank', { ascending: true })
  .limit(100);
```

### 获取某个用户的收藏
```typescript
const { data } = await supabase
  .from('user_favorites')
  .select('*')
  .eq('user_id', userId);
```

---

## 环境变量设置

```bash
# 必需的
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 可选的
COINMARKETCAP_API_KEY=optional
COINGECKO_API_KEY=optional
OPENAI_API_KEY=optional
RESEND_API_KEY=optional
```

---

## 项目结构导航

```
/src
  /app
    /api          - Next.js API 路由
      /alerts     - 告警 API
      /crypto     - 加密货币 API
      /favorites  - 收藏 API
    /pages        - 页面 (Home, Markets, Profile, etc)
    /auth         - 认证相关

/components
  /ui             - 基础 UI 组件
  /layout         - 布局组件
  /market         - 市场相关组件
  /crypto         - 加密货币详情组件
  /profile        - 用户资料组件
  /auth           - 认证组件

/lib
  /supabase*.ts   - Supabase 客户端
  /services/      - 业务逻辑服务
  /config/        - 配置文件
  /utils/         - 工具函数
  /types/         - TypeScript 类型

/hooks
  /use-auth.ts    - 认证 Hook

/supabase
  /schema.sql     - 数据库结构
```

---

## 调试技巧

### 查看当前用户
```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

### 查看数据库查询
```typescript
const { data, error } = await supabase.from('table').select();
if (error) console.error('Database error:', error);
console.log('Query result:', data);
```

### 测试 API 端点
```bash
# 公开 API
curl http://localhost:3000/api/crypto/list

# 需要认证的 API (使用 JWT token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/favorites
```

---

## 常见错误排查

| 错误 | 原因 | 解决方案 |
|------|------|--------|
| 401 Unauthorized | 用户未认证 | 检查是否登录，验证 JWT token |
| 403 Forbidden | RLS 策略拒绝 | 检查 RLS 策略是否允许该操作 |
| 23505 Unique violation | 重复数据 | 检查唯一约束，避免重复插入 |
| PGRST116 No rows | 查询无结果 | 使用 `.single()` 时会出现，应该返回 null |

---

## 性能优化建议

1. **使用数据库视图** - `top_cryptocurrencies` 避免多次 JOIN
2. **添加分页** - 大列表使用分页而不是一次性加载
3. **缓存策略** - 使用 React Query 缓存 API 响应
4. **索引优化** - schema.sql 中已创建常用查询的索引
5. **条件查询** - 使用 `.eq()`, `.gt()` 等过滤不必要的数据

---

## 有用的 Supabase 链接

- 官方文档: https://supabase.com/docs
- JS 客户端: https://supabase.com/docs/reference/javascript
- 认证: https://supabase.com/docs/guides/auth
- RLS: https://supabase.com/docs/guides/auth/row-level-security
- 实时订阅: https://supabase.com/docs/guides/realtime

---

## 快速开发检查清单

- [ ] 检查环境变量是否设置
- [ ] 验证数据库连接正常
- [ ] 确认 RLS 策略正确
- [ ] 添加错误处理
- [ ] 测试认证流程
- [ ] 验证 API 端点
- [ ] 检查类型定义
- [ ] 添加加载状态
- [ ] 处理网络错误
- [ ] 测试边界情况

