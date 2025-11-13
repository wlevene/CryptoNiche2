# CryptoNiche 2.0 代码库深入分析报告

## 执行摘要

CryptoNiche 2.0 是一个现代化的加密货币智能分析平台，采用 **Next.js 15 + Supabase + TypeScript** 架构构建。该项目是一个全栈应用，集成了实时市场数据、智能分析和个性化用户功能。

### 核心统计信息
- **项目大小**: 123 个 TypeScript/TSX 文件
- **框架**: Next.js 15.4.6 (App Router)
- **后端数据库**: Supabase (PostgreSQL)
- **状态管理**: Zustand + React Hooks + React Query
- **UI框架**: Tailwind CSS + shadcn/ui + Radix UI
- **认证**: Supabase Auth (JWT-based)

---

## 1. 项目整体架构

### 1.1 前端架构

```
┌─────────────────────────────────────────────────┐
│          React Client (Next.js 15)              │
│                                                 │
├─────────────────────────────────────────────────┤
│  Pages (App Router)                             │
│  ├── / (Home)                                   │
│  ├── /markets (Cryptocurrency Listing)          │
│  ├── /crypto/[id] (Detail Page)                 │
│  ├── /alerts (Price Alerts)                     │
│  ├── /profile (User Profile)                    │
│  ├── /admin (Admin Panel)                       │
│  └── /debug (Debugging Page)                    │
├─────────────────────────────────────────────────┤
│  Client-Side Services                           │
│  ├── useAuth Hook                               │
│  ├── FavoritesService (API-based)               │
│  ├── AlertService (API-based)                   │
│  └── CryptoRepository (Database)                │
├─────────────────────────────────────────────────┤
│  UI Components                                  │
│  ├── /components/ui (Base Components)           │
│  ├── /components/layout (Layout)                │
│  ├── /components/sections (Page Sections)       │
│  ├── /components/market (Market Components)     │
│  ├── /components/crypto (Crypto Details)        │
│  └── /components/profile (Profile Features)     │
├─────────────────────────────────────────────────┤
│  Providers & Context                            │
│  ├── ThemeProvider                              │
│  ├── ToastProvider                              │
│  └── AppInitializerProvider                     │
└─────────────────────────────────────────────────┘
```

### 1.2 后端架构

```
┌─────────────────────────────────────────────────┐
│        Next.js API Routes (Node.js)             │
│                                                 │
├─────────────────────────────────────────────────┤
│  Public API Endpoints                           │
│  ├── /api/crypto/list (获取加密货币列表)        │
│  ├── /api/crypto/[id] (获取单个加密货币)        │
│  ├── /api/crypto/[id]/price-history             │
│  └── /api/crypto/stats (市场统计)               │
├─────────────────────────────────────────────────┤
│  User-Authenticated Endpoints                   │
│  ├── /api/favorites (GET/POST/DELETE)           │
│  ├── /api/favorites/check                       │
│  ├── /api/alerts (GET/POST)                     │
│  ├── /api/alerts/[id]/toggle                    │
│  └── /api/alerts/[id]/route                     │
├─────────────────────────────────────────────────┤
│  Admin/Sync Endpoints (Test)                    │
│  ├── /api/crypto/sync                           │
│  ├── /api/crypto/sync-test                      │
│  ├── /api/crypto/test-mock-sync                 │
│  └── /api/initialize                            │
├─────────────────────────────────────────────────┤
│  External API Integration                       │
│  ├── CoinMarketCap API (数据源)                 │
│  ├── CoinGecko API (可选备份)                    │
│  └── Resend (邮件服务)                          │
├─────────────────────────────────────────────────┤
│  Core Services                                  │
│  ├── CryptocurrencyService                      │
│  ├── AlertService                               │
│  ├── FavoritesService                           │
│  ├── PriceMonitor                               │
│  ├── EmailService                               │
│  └── CryptoRepository                           │
└─────────────────────────────────────────────────┘
```

### 1.3 数据库架构

Supabase (PostgreSQL) 数据层:

```
┌──────────────────────────────────────┐
│    Authentication Layer              │
│  (Supabase Auth / auth.users)        │
└──────────────────────────────────────┘
              ↓
┌──────────────────────────────────────┐
│  Core Data Tables                    │
│  ├── users                           │
│  ├── cryptocurrencies                │
│  ├── crypto_prices                   │
│  ├── price_history                   │
│  └── market_data                     │
├──────────────────────────────────────┤
│  User Feature Tables                 │
│  ├── user_favorites                  │
│  ├── user_alerts                     │
│  └── alert_notifications             │
├──────────────────────────────────────┤
│  Database Views                      │
│  ├── latest_crypto_prices            │
│  └── top_cryptocurrencies            │
├──────────────────────────────────────┤
│  Security: RLS Policies              │
│  ├── Row Level Security              │
│  ├── Service Role Access             │
│  └── Public Read Access              │
└──────────────────────────────────────┘
```

---

## 2. Supabase 集成详解

### 2.1 Supabase 使用位置一览表

| 模块 | 文件位置 | 用途 | 认证方式 |
|------|--------|------|--------|
| **Client** | `/lib/supabase.ts` | 类型定义和客户端导出 | - |
| **Browser** | `/lib/supabase-browser.ts` | 浏览器端客户端 | 匿名密钥 |
| **Server** | `/lib/supabase-server.ts` | 服务器端客户端 | 匿名密钥 + Cookie |
| **Admin** | `/lib/supabase-admin.ts` | 管理员操作 | 服务角色密钥 |
| **Universal** | `/lib/supabase-universal.ts` | 通用客户端 | 浏览器客户端 |

### 2.2 Supabase 使用的具体文件清单

#### 认证相关 (5个文件)
1. `/lib/supabase-browser.ts` - 浏览器认证客户端
2. `/lib/supabase-server.ts` - 服务器认证客户端  
3. `/lib/supabase-admin.ts` - 管理员认证客户端
4. `/hooks/use-auth.ts` - React Hook 认证管理
5. `/src/app/auth/callback/route.ts` - OAuth 回调处理

#### 数据访问层 (6个文件)
1. `/lib/crypto-db.ts` - 加密货币数据库操作
2. `/lib/services/database/crypto-repository.ts` - 数据访问对象
3. `/lib/services/database/crypto-admin-repository.ts` - 管理员数据操作
4. `/lib/services/favorites-service.ts` - 收藏功能服务
5. `/lib/alert-service.ts` - 告警服务
6. `/lib/supabase-universal.ts` - 通用数据库客户端

#### API 路由 (8个文件)
1. `/src/app/api/crypto/list/route.ts` - 加密货币列表
2. `/src/app/api/crypto/[id]/route.ts` - 单个加密货币详情
3. `/src/app/api/favorites/route.ts` - 收藏管理 (GET/POST/DELETE)
4. `/src/app/api/favorites/check/route.ts` - 检查收藏状态
5. `/src/app/api/alerts/route.ts` - 告警列表和创建
6. `/src/app/api/alerts/[id]/route.ts` - 告警更新和删除
7. `/src/app/api/alerts/[id]/toggle/route.ts` - 切换告警状态
8. `/src/app/api/alerts/notifications/route.ts` - 通知历史

#### 组件层 (3个文件)
1. `/components/profile/user-settings.tsx` - 用户设置
2. `/components/profile/user-alerts-list.tsx` - 告警列表显示
3. `/components/auth/auth-modal.tsx` - 认证模态框

#### 初始化和配置 (3个文件)
1. `/lib/app-initializer.ts` - 应用初始化逻辑
2. `/lib/config/env.ts` - 环境变量配置
3. `/src/app/api/initialize/route.ts` - 初始化 API 端点

### 2.3 Supabase 客户端初始化流程

```typescript
// 多层级客户端初始化架构

1. supabase.ts (类型定义)
   ├─ Database 类型导出
   └─ 基础客户端创建

2. supabase-browser.ts (浏览器)
   ├─ 单例模式缓存
   ├─ 错误处理
   └─ 环境变量校验

3. supabase-server.ts (服务器)
   ├─ Cookie 处理
   ├─ 请求上下文感知
   └─ 构建时虚拟客户端支持

4. supabase-admin.ts (管理员)
   ├─ 服务角色密钥
   ├─ 高权限操作
   └─ 数据同步专用

5. supabase-universal.ts (通用)
   ├─ 自动选择适当客户端
   ├─ 回退机制
   └─ 两端兼容
```

### 2.4 Supabase RLS (行级安全) 配置

#### 公开表 (无 RLS 限制)
- `cryptocurrencies` - 所有用户可读
- `crypto_prices` - 所有用户可读
- `price_history` - 所有用户可读
- `market_data` - 所有用户可读

#### 受保护表 (启用 RLS)
- `users` - 只能查看/编辑自己的记录
- `user_favorites` - 只能管理自己的收藏
- `user_alerts` - 只能管理自己的告警
- `alert_notifications` - 只能查看自己的通知

---

## 3. 数据模型和表结构

### 3.1 核心表结构

#### 表1: `users` (用户表)
```sql
id (UUID) - Supabase auth.users 外键
email (TEXT) - 邮箱
name (TEXT) - 用户名
preferences (JSONB) - 用户偏好设置
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### 表2: `cryptocurrencies` (加密货币基础信息)
```sql
id (INTEGER PRIMARY KEY) - CoinMarketCap ID
symbol (TEXT) - 货币符号 (BTC, ETH)
name (TEXT) - 全名 (Bitcoin, Ethereum)
slug (TEXT) - URL slug
cmc_rank (INTEGER) - CMC 排名
market_pair_count (INTEGER) - 交易对数量
circulating_supply (DECIMAL) - 流通量
total_supply (DECIMAL) - 总供应量
max_supply (DECIMAL) - 最大供应量
ath (DECIMAL) - 历史最高价
atl (DECIMAL) - 历史最低价
high_24h (DECIMAL) - 24h 最高
low_24h (DECIMAL) - 24h 最低
is_active (BOOLEAN)
is_audited (BOOLEAN)
date_added (TIMESTAMP)
last_updated (TIMESTAMP)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### 表3: `crypto_prices` (实时价格数据)
```sql
id (UUID PRIMARY KEY)
crypto_id (INTEGER) - 外键 → cryptocurrencies.id
quote_currency (TEXT) - 计价货币 (USD, BTC, ETH)
price (DECIMAL) - 价格
volume_24h (DECIMAL) - 24h 交易量
volume_7d (DECIMAL) - 7d 交易量
volume_30d (DECIMAL) - 30d 交易量
market_cap (DECIMAL) - 市值
percent_change_1h (DECIMAL) - 1h 变化百分比
percent_change_24h (DECIMAL) - 24h 变化百分比
percent_change_7d (DECIMAL) - 7d 变化百分比
percent_change_30d (DECIMAL) - 30d 变化百分比
dominance (DECIMAL) - 市场主导地位
turnover (DECIMAL) - 换手率
timestamp (TIMESTAMP)
UNIQUE(crypto_id, quote_currency, timestamp)
```

#### 表4: `price_history` (价格历史数据)
```sql
id (UUID PRIMARY KEY)
crypto_id (INTEGER) - 外键
price (DECIMAL) - USD 价格
volume (DECIMAL)
market_cap (DECIMAL)
timestamp (TIMESTAMP)
interval_type (TEXT) - '1h', '1d', '1w'
```

#### 表5: `market_data` (整体市场数据)
```sql
id (UUID PRIMARY KEY)
total_market_cap (DECIMAL)
total_volume_24h (DECIMAL)
btc_dominance (DECIMAL)
eth_dominance (DECIMAL)
active_cryptocurrencies (INTEGER)
total_cryptocurrencies (INTEGER)
timestamp (TIMESTAMP)
```

#### 表6: `user_favorites` (用户收藏)
```sql
id (UUID PRIMARY KEY)
user_id (UUID) - 外键 → users.id
crypto_id (INTEGER) - 外键 → cryptocurrencies.id
created_at (TIMESTAMP)
UNIQUE(user_id, crypto_id)
```

#### 表7: `user_alerts` (用户告警设置)
```sql
id (UUID PRIMARY KEY)
user_id (UUID) - 外键 → users.id
crypto_id (INTEGER) - 外键 → cryptocurrencies.id
alert_type (TEXT) - 'price_change' | 'price_threshold'
threshold_percentage (DECIMAL) - 变化百分比阈值
threshold_price (DECIMAL) - 固定价格阈值
direction (TEXT) - 'up' | 'down' | 'both'
is_active (BOOLEAN)
notification_frequency (TEXT) - 'immediate' | 'hourly' | 'daily'
last_triggered_at (TIMESTAMP)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### 表8: `alert_notifications` (告警通知记录)
```sql
id (UUID PRIMARY KEY)
alert_id (UUID) - 外键 → user_alerts.id
user_id (UUID) - 外键 → users.id
crypto_id (INTEGER) - 外键 → cryptocurrencies.id
trigger_price (DECIMAL)
previous_price (DECIMAL)
price_change_percentage (DECIMAL)
notification_type (TEXT) - 'email' | 'push' | 'sms'
status (TEXT) - 'pending' | 'sent' | 'failed'
sent_at (TIMESTAMP)
error_message (TEXT)
created_at (TIMESTAMP)
```

### 3.2 数据库视图

#### 视图1: `latest_crypto_prices` (最新价格)
```sql
SELECT DISTINCT ON (cp.crypto_id)
  cp.*,
  c.symbol,
  c.name,
  c.cmc_rank
FROM crypto_prices cp
JOIN cryptocurrencies c ON cp.crypto_id = c.id
WHERE c.is_active = true AND cp.quote_currency = 'USD'
ORDER BY cp.crypto_id, cp.timestamp DESC
```

#### 视图2: `top_cryptocurrencies` (热门加密货币)
```sql
SELECT 
  c.*,
  cp.price,
  cp.market_cap,
  cp.volume_24h,
  cp.percent_change_24h,
  cp.timestamp as price_updated_at
FROM cryptocurrencies c
LEFT JOIN LATERAL (最新价格) cp ON true
WHERE c.is_active = true AND c.cmc_rank IS NOT NULL
ORDER BY c.cmc_rank ASC
```

### 3.3 数据库索引

| 表 | 索引名 | 列 | 用途 |
|----|--------|------|------|
| cryptocurrencies | idx_cryptocurrencies_rank | cmc_rank | 排名查询 |
| cryptocurrencies | idx_cryptocurrencies_symbol | symbol | 符号搜索 |
| cryptocurrencies | idx_cryptocurrencies_active | is_active | 活跃状态过滤 |
| crypto_prices | idx_crypto_prices_crypto_id | crypto_id | 外键查询 |
| crypto_prices | idx_crypto_prices_timestamp | timestamp DESC | 时间序列 |
| price_history | idx_price_history_crypto_id | crypto_id | 历史数据查询 |
| price_history | idx_price_history_timestamp | timestamp DESC | 时间范围查询 |
| user_favorites | idx_user_favorites_user_id | user_id | 用户收藏查询 |
| user_alerts | idx_user_alerts_user_id | user_id | 用户告警查询 |
| user_alerts | idx_user_alerts_active | is_active | 活跃告警过滤 |
| alert_notifications | idx_alert_notifications_status | status | 通知状态过滤 |

---

## 4. 认证系统

### 4.1 认证流程

```
┌─────────────────┐
│  用户登录/注册  │
│   (前端表单)    │
└────────┬────────┘
         │
         ↓
┌──────────────────────────┐
│  Supabase Auth Client    │
│  (supabase-browser.ts)   │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│  Supabase Auth Service   │
│  (JWT-based)             │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│  auth.users (Supabase)   │
│  + users (自定义表)      │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│  Auth 回调处理           │
│  /auth/callback          │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│  会话储存 (Cookie)       │
│  + useAuth Hook 状态更新 │
└──────────────────────────┘
```

### 4.2 认证实现细节

**关键文件**:
- `/hooks/use-auth.ts` - React Hook 获取认证状态
- `/lib/supabase-server.ts` - 服务器端认证
- `/src/app/auth/callback/route.ts` - OAuth 回调处理

**认证流程代码**:
```typescript
// useAuth Hook (浏览器端)
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => getSupabaseClient());

  useEffect(() => {
    // 1. 获取当前会话
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // 2. 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  return { user, loading, signOut };
}
```

### 4.3 受保护的 API 端点

所有受保护端点的认证检查:
```typescript
// 标准认证检查模式
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // 处理用户请求...
  } catch (error) {
    // 错误处理
  }
}
```

---

## 5. API 调用方式和位置

### 5.1 API 调用层级

```
┌─────────────────────────────────┐
│  React 组件层                   │
│  (页面组件和 UI 组件)           │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│  Service 层                     │
│  ├─ FavoritesService            │
│  ├─ AlertService                │
│  └─ CryptoRepository            │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│  HTTP 客户端                    │
│  (fetch API)                    │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│  Next.js API Routes             │
│  /api/* 端点                    │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│  Supabase 客户端                │
│  (Server-side)                  │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│  Supabase Backend               │
│  (PostgreSQL + Auth)            │
└─────────────────────────────────┘
```

### 5.2 API 端点详解

#### 公开 API (无需认证)
| 端点 | 方法 | 用途 | 返回数据 |
|------|------|------|--------|
| `/api/crypto/list` | GET | 获取加密货币列表 | CryptoCurrency[] |
| `/api/crypto/[id]` | GET | 获取单个加密货币详情 | CryptoCurrency |
| `/api/crypto/[id]/price-history` | GET | 获取价格历史 | PriceHistory[] |
| `/api/crypto/stats` | GET | 获取市场统计 | MarketStats |

#### 用户认证 API
| 端点 | 方法 | 用途 | 身份验证 |
|------|------|------|---------|
| `/api/favorites` | GET | 获取用户收藏 | JWT |
| `/api/favorites` | POST | 添加到收藏 | JWT |
| `/api/favorites` | DELETE | 从收藏移除 | JWT |
| `/api/favorites/check` | GET | 检查收藏状态 | JWT |
| `/api/alerts` | GET | 获取用户告警 | JWT |
| `/api/alerts` | POST | 创建告警 | JWT |
| `/api/alerts/[id]` | PUT/DELETE | 更新/删除告警 | JWT |
| `/api/alerts/[id]/toggle` | POST | 切换告警状态 | JWT |
| `/api/alerts/notifications` | GET | 获取通知历史 | JWT |

### 5.3 API 调用示例

#### 获取加密货币列表
```typescript
// 组件层
const fetchCryptos = async () => {
  const response = await fetch('/api/crypto/list?startRank=1&endRank=100');
  const data = await response.json();
  return data.data;
};

// API 层 (/api/crypto/list/route.ts)
const supabase = await createClient();
const { data } = await supabase
  .from('top_cryptocurrencies')
  .select('*')
  .order('cmc_rank', { ascending: true });
```

#### 管理用户收藏
```typescript
// 前端服务 (FavoritesService)
async addToFavorites(cryptoId: number) {
  const response = await fetch('/api/favorites', {
    method: 'POST',
    body: JSON.stringify({ crypto_id: cryptoId })
  });
  return response.json();
}

// API 层 (/api/favorites/route.ts)
const { error } = await supabase
  .from('user_favorites')
  .insert({
    user_id: user.id,
    crypto_id: crypto_id
  });
```

#### 创建价格告警
```typescript
// API 层 (/api/alerts/route.ts)
const alert = await alertService.createAlert({
  user_id: user.id,
  crypto_id: cryptoId,
  alert_type: 'price_change',
  threshold_percentage: 5,
  direction: 'both'
});

// AlertService
async createAlert(alert: UserAlertInsert) {
  const supabase = await this.getSupabase();
  const { data } = await supabase
    .from('user_alerts')
    .insert(alert)
    .select()
    .single();
  return data;
}
```

### 5.4 外部 API 集成

#### CoinMarketCap API
```typescript
// /lib/crypto-api.ts
class CoinMarketCapAPI {
  async getCryptocurrencyListing(
    start: number = 1,
    limit: number = 100
  ): Promise<CoinMarketCapResponse> {
    const url = new URL('https://api.coinmarketcap.com/data-api/v3/cryptocurrency/listing');
    url.searchParams.append('start', start.toString());
    url.searchParams.append('limit', limit.toString());
    // 数据转换和同步...
  }
}
```

---

## 6. 状态管理方案

### 6.1 状态管理架构

```
┌────────────────────────────────────────────────┐
│          全局状态管理架构                      │
├────────────────────────────────────────────────┤
│  1. 认证状态 (useAuth Hook)                   │
│     └─ user, loading, signOut                 │
│                                               │
│  2. 组件本地状态 (useState)                    │
│     └─ authModalOpen, selectedTab, etc        │
│                                               │
│  3. 服务状态 (Service 类)                      │
│     └─ FavoritesService, AlertService         │
│                                               │
│  4. 数据缓存 (React Query)                     │
│     └─ useQuery, useMutation                  │
│                                               │
│  5. 主题状态 (next-themes)                     │
│     └─ theme, setTheme                        │
└────────────────────────────────────────────────┘
```

### 6.2 状态管理细节

#### 认证状态 (useAuth Hook)
```typescript
// /hooks/use-auth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 自动订阅认证变化
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  return { user, loading, signOut };
}

// 使用示例
const { user, loading } = useAuth();
if (user) {
  // 渲染已认证内容
}
```

#### 组件本地状态
```typescript
// 典型组件状态管理
export default function MarketsPage() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('trending');
  const [favorites, setFavorites] = useState<Crypto[]>([]);

  // 状态流: 组件 → localStorage → Supabase
}
```

#### 服务类状态管理
```typescript
// /lib/services/favorites-service.ts
export class FavoritesService {
  async getFavorites(): Promise<FavoriteItem[]> {
    const response = await fetch('/api/favorites');
    return response.json();
  }

  async addToFavorites(cryptoId: number): Promise<void> {
    await fetch('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ crypto_id: cryptoId })
    });
  }
}
```

### 6.3 数据流向

```
用户交互
  │
  ├─→ useAuth() ──→ Supabase Auth ──→ JWT Token
  │                                    │
  ├─→ FavoritesService ──→ /api/favorites ──→ Supabase
  │                                              │
  ├─→ AlertService ──→ /api/alerts ──→ Supabase
  │                                       │
  └─→ CryptoRepository ──→ Supabase

数据加载顺序:
1. 初始化: useAuth() 检查用户
2. 获取数据: 调用 API/Service
3. 状态更新: setState() 触发重新渲染
4. 显示数据: 组件接收最新状态
5. 持久化: Supabase 存储数据
```

### 6.4 Zustand 使用情况

根据项目分析,项目中 **未显著使用 Zustand**。虽然 `package.json` 中列出了 `zustand@^5.0.7`，但在源代码中没有发现 Zustand store 的使用。

替代方案:
- **useAuth Hook** - 管理认证状态
- **useState** - 组件本地状态
- **Service 类** - 业务逻辑和数据管理
- **API 路由** - 服务器端状态管理

---

## 7. 数据流向图

### 7.1 用户功能数据流

```
┌──────────────────┐
│  用户收藏功能   │
└────────┬─────────┘
         │
         ├─→ 前端: /components/market/favorite-button.tsx
         │   └─→ FavoritesService.addToFavorites()
         │       └─→ fetch('/api/favorites', POST)
         │           └─→ API: /api/favorites/route.ts
         │               ├─→ supabase.auth.getUser() [认证]
         │               ├─→ supabase.from('user_favorites').insert()
         │               └─→ return { success, data }
         │                   └─→ 前端状态更新
         │
         ├─→ 数据库操作
         │   └─→ Supabase
         │       ├─→ INSERT user_favorites
         │       └─→ RLS 检查: users.auth.uid() = user_id
         │
         └─→ 查询收藏
             └─→ /components/profile/favorites-list.tsx
                 └─→ FavoritesService.getFavorites()
                     └─→ fetch('/api/favorites', GET)
                         └─→ API 返回带最新价格的收藏列表
```

### 7.2 告警系统数据流

```
┌──────────────────┐
│   价格告警功能  │
└────────┬─────────┘
         │
         ├─→ 创建告警
         │   └─→ /components/profile/alert-form.tsx
         │       └─→ fetch('/api/alerts', POST)
         │           └─→ AlertService.createAlert()
         │               └─→ supabase.from('user_alerts').insert()
         │
         ├─→ 监控价格变化
         │   └─→ /lib/price-monitor.ts
         │       └─→ 获取最新价格
         │           └─→ AlertService.checkPriceAlerts()
         │
         ├─→ 触发告警
         │   └─→ 创建通知记录
         │       └─→ supabase.from('alert_notifications').insert()
         │           └─→ 调用 EmailService 发送邮件
         │
         └─→ 用户管理
             └─→ /api/alerts/[id]/toggle
                 └─→ 启用/禁用告警
                     └─→ supabase.from('user_alerts').update()
```

### 7.3 加密货币数据流

```
┌──────────────────┐
│  加密货币数据源 │
└────────┬─────────┘
         │
         ├─→ 外部 API: CoinMarketCap
         │   └─→ /lib/crypto-api.ts
         │       └─→ getCryptocurrencyListing()
         │
         ├─→ 数据同步
         │   └─→ /src/app/api/crypto/sync/route.ts
         │       └─→ CryptocurrencyService.syncCryptocurrencyData()
         │           ├─→ 获取 API 数据
         │           ├─→ 数据转换
         │           └─→ supabase.from('cryptocurrencies').upsert()
         │
         ├─→ 价格历史记录
         │   └─→ /lib/crypto-db.ts
         │       └─→ savePriceHistory()
         │           └─→ supabase.from('price_history').insert()
         │
         └─→ 前端展示
             ├─→ /api/crypto/list
             │   └─→ supabase.from('top_cryptocurrencies').select()
             │
             └─→ /components/market/crypto-list.tsx
                 └─→ 显示列表和价格走势
```

---

## 8. 关键文件清单

### 8.1 核心架构文件 (15个)

| 文件 | 行数 | 用途 | 优先级 |
|------|------|------|--------|
| `/lib/supabase.ts` | 350+ | 数据库类型定义 | ★★★ |
| `/lib/supabase-browser.ts` | 32 | 浏览器客户端 | ★★★ |
| `/lib/supabase-server.ts` | 43 | 服务器客户端 | ★★★ |
| `/lib/supabase-admin.ts` | 32 | 管理员客户端 | ★★★ |
| `/lib/supabase-universal.ts` | 24 | 通用客户端 | ★★ |
| `/lib/crypto-db.ts` | 253 | 加密货币数据服务 | ★★★ |
| `/lib/alert-service.ts` | 323 | 告警管理服务 | ★★★ |
| `/lib/services/database/crypto-repository.ts` | 230 | 数据访问对象 | ★★★ |
| `/lib/services/favorites-service.ts` | 184 | 收藏功能服务 | ★★★ |
| `/lib/crypto-api.ts` | 150+ | CoinMarketCap API 集成 | ★★★ |
| `/lib/config/env.ts` | 55 | 环境配置 | ★★ |
| `/lib/config/constants.ts` | 113 | 系统常量 | ★★ |
| `/hooks/use-auth.ts` | 56 | 认证 Hook | ★★★ |
| `/supabase/schema.sql` | 400+ | 数据库 Schema | ★★★ |
| `/src/app/layout.tsx` | 69 | 根布局 | ★★ |

### 8.2 API 路由文件 (12个)

| 路由 | 文件 | 用途 |
|------|------|------|
| `/api/crypto/list` | `crypto/list/route.ts` | 获取加密货币列表 |
| `/api/crypto/[id]` | `crypto/[id]/route.ts` | 获取单个加密货币 |
| `/api/crypto/sync` | `crypto/sync/route.ts` | 数据同步 |
| `/api/favorites` | `favorites/route.ts` | 收藏管理 |
| `/api/favorites/check` | `favorites/check/route.ts` | 检查收藏状态 |
| `/api/alerts` | `alerts/route.ts` | 告警管理 |
| `/api/alerts/[id]` | `alerts/[id]/route.ts` | 告警详情 |
| `/api/alerts/[id]/toggle` | `alerts/[id]/toggle/route.ts` | 切换告警 |
| `/api/auth/callback` | `auth/callback/route.ts` | OAuth 回调 |
| `/api/initialize` | `initialize/route.ts` | 应用初始化 |
| `/api/test` | `test/route.ts` | 测试端点 |

### 8.3 UI 组件文件 (30+个)

**布局组件** (2个)
- `/components/layout/navbar.tsx` - 导航栏
- `/components/layout/container.tsx` - 容器

**UI 基础组件** (14个)
- `/components/ui/button.tsx`
- `/components/ui/card.tsx`
- `/components/ui/dialog.tsx`
- `/components/ui/input.tsx`
- `/components/ui/select.tsx`
- `/components/ui/switch.tsx`
- `/components/ui/tabs.tsx`
- 等...

**业务组件**
- `/components/market/crypto-list.tsx` - 列表
- `/components/crypto/price-chart.tsx` - 价格图表
- `/components/profile/user-alerts-list.tsx` - 告警列表
- `/components/auth/auth-modal.tsx` - 认证模态

---

## 9. 需要改动的模块清单

### 9.1 高优先级改动 (影响核心功能)

#### 1. Supabase 客户端统一
**当前问题**: 存在多个重复的 Supabase 客户端初始化文件
- supabase-browser.ts
- supabase-server.ts
- supabase-admin.ts
- supabase-universal.ts

**改动建议**:
- 统一为 3 个文件: browser, server, admin
- 移除 supabase-universal.ts (冗余)
- 更新所有导入路径

**影响文件**: 20+ 个导入该文件的模块

#### 2. 数据缓存策略
**当前状态**: 没有实现客户端数据缓存机制

**改动建议**:
- 集成 TanStack Query (React Query) - 已在 package.json 中
- 创建 `/lib/queries/` 目录用于查询定义
- 为所有 API 调用添加缓存策略

**影响文件**:
- 所有组件页面
- 所有 Service 类

#### 3. 错误处理标准化
**当前状态**: 错误处理逻辑分散

**改动建议**:
- 统一使用 `/lib/utils/error-handler.ts`
- 创建自定义错误类
- 实现全局错误边界

**影响文件**: 所有 API 路由和 Service 文件

### 9.2 中优先级改动 (改进体验)

#### 1. 状态管理升级
**建议**:
- 集成 Zustand 用于全局状态 (已安装但未使用)
- 创建 store: userStore, cryptoStore, alertStore
- 替换 Context API 使用

**文件变更**:
- 新增: `/lib/stores/`
- 修改: `/hooks/use-auth.ts` → 使用 Zustand

#### 2. API 层优化
**建议**:
- 创建统一的 API 客户端
- 实现请求/响应拦截器
- 添加自动重试机制

**新增文件**:
- `/lib/api-client.ts`
- `/lib/api-interceptors.ts`

#### 3. 类型安全加强
**建议**:
- 为所有 API 响应创建 TypeScript 类型
- 使用 Zod 进行运行时验证
- 导出 API Schema 类型

**新增文件**:
- `/lib/types/api.ts`
- `/lib/validators/`

### 9.3 低优先级改动 (优化和重构)

#### 1. 代码组织优化
- 将 Service 类分解为更小的模块
- 创建专用的 Hook 库
- 抽取共享的业务逻辑

#### 2. 性能优化
- 添加分页到加密货币列表
- 实现虚拟滚动
- 优化数据库查询

#### 3. 测试覆盖
- 为 Service 层添加单元测试
- 为 API 路由添加集成测试
- 建立 E2E 测试

---

## 10. 数据同步流程

### 10.1 初始化数据同步

```typescript
// /src/app/api/initialize/route.ts
POST /api/initialize
  │
  ├─→ 检查数据库是否已初始化
  │
  ├─→ 如果未初始化:
  │   ├─→ CryptocurrencyService.syncCryptocurrencyData()
  │   │   ├─→ CoinMarketCapAPI.getAllCryptocurrencies()
  │   │   └─→ supabase.from('cryptocurrencies').upsert()
  │   │
  │   ├─→ 同步市场数据
  │   │   └─→ supabase.from('market_data').insert()
  │   │
  │   └─→ 返回成功响应
  │
  └─→ 如果已初始化:
      └─→ 返回跳过消息
```

### 10.2 定期更新机制

**当前实现**:
- `/lib/price-monitor.ts` - 价格监控
- `/lib/app-initializer.ts` - 应用初始化
- 定期调用 `/api/crypto/sync` 更新数据

**改进机制**:
```
需要实现的:
1. 后台定时任务 (Cron)
2. 增量数据更新
3. 数据一致性检查
4. 失败重试机制
```

---

## 11. 安全性分析

### 11.1 认证安全

**实现情况**:
- 使用 Supabase Auth (JWT-based)
- 安全的服务器端会话管理 (Cookie)
- 环境变量中的敏感信息保护

**需要加强**:
- 添加 CSRF 保护
- 实现速率限制
- 添加审计日志

### 11.2 数据安全

**RLS (Row Level Security) 实现**:
- 用户表: 只能访问自己的数据
- 收藏和告警: 通过 user_id 限制
- 公开表: 所有用户可读

**需要加强**:
- 实现字段级加密
- 数据备份和恢复策略
- 合规性检查 (GDPR)

### 11.3 API 安全

**当前实现**:
- JWT 认证
- 环境变量加密密钥
- 请求验证

**需要加强**:
- 速率限制 (Rate Limiting)
- CORS 配置
- API 密钥轮换策略

---

## 12. 部署和配置

### 12.1 环境变量需求

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API Keys
COINMARKETCAP_API_KEY=your_api_key
COINGECKO_API_KEY=optional
OPENAI_API_KEY=optional
RESEND_API_KEY=your_resend_key

# 应用配置
NEXT_PUBLIC_APP_URL=https://crypto-niche2.vercel.app
NODE_ENV=production
```

### 12.2 Vercel 部署

1. 连接 GitHub 仓库
2. 配置环境变量
3. 自动部署触发
4. Edge Function (可选)

---

## 总结

### 关键成就
1. **完整的 Supabase 集成** - 认证、数据库、实时订阅
2. **现代前端架构** - Next.js 15 App Router + TypeScript
3. **用户功能完整** - 收藏、告警、通知系统
4. **安全认证** - JWT-based Supabase Auth

### 改进方向
1. **统一状态管理** - 充分利用 Zustand
2. **增强缓存策略** - React Query 集成
3. **完善错误处理** - 标准化错误流程
4. **提高类型安全** - Zod 运行时验证

### 维护建议
1. 定期更新依赖包
2. 监控 API 使用配额
3. 备份数据库
4. 监控性能指标
5. 定期安全审计
