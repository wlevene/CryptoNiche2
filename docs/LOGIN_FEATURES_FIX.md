# 登录后功能修复总结

> **修复日期**: 2025-11-12
> **状态**: ✅ 全部修复完成

---

## 🐛 遇到的问题

### 问题 1: Navbar 登录后菜单不显示
**症状**: 用户登录后，Profile 菜单项不显示

**原因**:
```typescript
// 第 44 行有语法错误
{ <Link href="/alerts">Alerts</Link> }
//^ 多余的 {
```

### 问题 2: AlertForm 报错 `cryptocurrencies.find is not a function`
**症状**:
```
TypeError: cryptocurrencies.find is not a function
```

**原因**:
1. API 返回的数据结构不匹配
2. `result.data` 是对象 `{ items: [], total: 0 }`，不是数组
3. `find()` 使用的字段错误（应该是 `currency.cmc_id` 而不是 `id`）

### 问题 3: Alert API 无限循环
**症状**: API 调用自己导致无限循环

**原因**:
```typescript
// /api/v1/currency/alerts/route.ts 中
export const POST = async () => {
  // 这里又调用了自己！
  await apiClient.post('/api/v1/currency/alerts', data);
};
```

---

## ✅ 所有修复方案

### 修复 1: Navbar 语法错误

**文件**: `components/layout/navbar.tsx`

**修改**:
```typescript
// ❌ 修改前（错误）
{ <Link href="/alerts">Alerts</Link> }
{user && <Link href="/profile">Profile</Link>}

// ✅ 修改后（正确）
{user && <Link href="/profile">Profile</Link>}
```

**说明**:
- 移除了多余的 `{` 和注释掉的 Alerts 链接
- 确保 Profile 链接在用户登录时显示

---

### 修复 2: AlertForm 数据结构

**文件**: `components/alerts/alert-form.tsx`

**修改 1 - 修复数据获取**:
```typescript
// ❌ 修改前
const result = await response.json();
if (result.success) {
  setCryptocurrencies(result.data); // 错误：result.data 是对象
}

// ✅ 修改后
const result = await response.json();
if (result.success && result.data) {
  const items = result.data.items || []; // 正确：获取 items 数组
  setCryptocurrencies(items);
}
```

**修改 2 - 修复 find() 查询**:
```typescript
// ❌ 修改前
const selectedCrypto = cryptocurrencies.find(
  c => c.id === parseInt(formData.crypto_id)
);

// ✅ 修改后
const selectedCrypto = cryptocurrencies.find(
  c => c.currency?.cmc_id === parseInt(formData.crypto_id)
);
```

**修改 3 - 修复 Select 选项渲染**:
```typescript
// ❌ 修改前
{cryptocurrencies.map((crypto) => (
  <SelectItem key={crypto.id} value={crypto.id.toString()}>
    <span>{crypto.symbol}</span>
    <span>{crypto.name}</span>
    {crypto.price && <span>${crypto.price}</span>}
  </SelectItem>
))}

// ✅ 修改后
{cryptocurrencies.map((item) => (
  <SelectItem
    key={item.currency.cmc_id}
    value={item.currency.cmc_id?.toString() || ''}
  >
    <span>{item.currency.symbol}</span>
    <span>{item.currency.name}</span>
    {item.price?.price && <span>${item.price.price}</span>}
  </SelectItem>
))}
```

**修改 4 - 修复 placeholder**:
```typescript
// ❌ 修改前
placeholder={selectedCrypto ? `e.g., ${selectedCrypto.price}` : "..."}

// ✅ 修改后
placeholder={selectedCrypto?.price?.price
  ? `e.g., ${selectedCrypto.price.price}`
  : "Enter target price"
}
```

**修改 5 - 添加 Authorization header**:
```typescript
// ✅ 新增
const token = typeof window !== 'undefined'
  ? localStorage.getItem('auth_token')
  : null;

const response = await fetch('/api/v1/currency/alerts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  },
  body: JSON.stringify(payload),
});
```

---

### 修复 3: Alert API 路由

**文件**: `src/app/api/v1/currency/alerts/route.ts`

**修改 GET 方法**:
```typescript
// ❌ 修改前（无限循环）
export const GET = async () => {
  const data = await apiClient.get('/api/v1/currency/alerts'); // 调用自己！
  return NextResponse.json({ data });
};

// ✅ 修改后（暂时返回空数据）
export const GET = createProtectedHandler(async (request, user) => {
  // 注意：后端 API 定义中没有对应的 GET 接口
  // 暂时返回空列表，等待后端实现
  const data: AlertListReply = {
    items: [],
    total: 0,
  };
  return NextResponse.json({ success: true, data });
});
```

**修改 POST 方法**:
```typescript
// ❌ 修改前（无限循环）
export const POST = async () => {
  await apiClient.post('/api/v1/currency/alerts', data); // 调用自己！
};

// ✅ 修改后（调用后端 API）
export const POST = createProtectedHandler(async (request, user) => {
  const body = await request.json();
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7881';
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  // 调用后端 API: POST /core/alert
  const response = await fetch(`${baseURL}/core/alert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json({ success: true, data });
});
```

---

## 📊 数据结构说明

### API 返回格式

**货币列表 API** (`/api/v1/currency/list`):
```typescript
{
  success: true,
  data: {
    items: [                    // ← CurrencyDetail[]
      {
        currency: {             // ← Currency 对象
          id: "...",
          cmc_id: 1,            // ← 重要！用这个作为 ID
          symbol: "BTC",
          name: "Bitcoin",
          ...
        },
        price: {                // ← Price 对象
          price: 50000,         // ← 重要！真实价格
          volume_24h: 1000000,
          ...
        },
        is_favorite: false
      }
    ],
    total: 100,
    page: 1,
    page_size: 50
  }
}
```

### 类型定义

```typescript
interface Cryptocurrency {
  currency: Currency;     // 货币基础信息
  price?: Price;         // 价格信息（可选）
  is_favorite?: boolean; // 是否收藏
}

interface Currency {
  id?: string;
  cmc_id?: number;      // CoinMarketCap ID（重要！）
  symbol?: string;      // BTC, ETH
  name?: string;        // Bitcoin, Ethereum
  ...
}

interface Price {
  price: number;        // 真实价格（重要！）
  volume_24h?: number;
  market_cap?: number;
  ...
}
```

---

## 📁 修改的文件清单

### 共修改 3 个文件

1. **`components/layout/navbar.tsx`**
   - 移除语法错误的 `{`
   - 移除注释掉的 Alerts 链接
   - 确保 Profile 链接在用户登录时显示

2. **`components/alerts/alert-form.tsx`**
   - 修复 API 数据获取逻辑
   - 修复 `find()` 查询字段
   - 修复 Select 选项渲染
   - 修复 placeholder 显示
   - 添加 Authorization header

3. **`src/app/api/v1/currency/alerts/route.ts`**
   - 修复 GET 方法（暂时返回空数据）
   - 修复 POST 方法（调用后端 API `/core/alert`）
   - 避免无限循环

---

## ⚠️ 重要注意事项

### 1. 后端 API 缺失

根据后端接口定义，没有以下接口：
- ❌ `GET /core/alerts` - 获取告警列表
- ❌ `PUT /core/alert/update` - 更新告警
- ❌ `POST /core/alert/delete` - 删除告警

**当前状态**:
- ✅ `POST /core/alert` - 创建告警（已实现）
- ⏳ `GET /api/v1/currency/alerts` - 前端路由暂时返回空数据

**建议**: 等待后端实现 Alert 查询/更新/删除接口

### 2. Authorization Header

所有需要认证的 API 都需要添加 Authorization header：
```typescript
const token = localStorage.getItem('auth_token');
headers: {
  'Authorization': `Bearer ${token}`
}
```

### 3. 数据结构变化

从 Supabase 迁移后，数据结构有变化：
- **旧**: `crypto.id`, `crypto.symbol`, `crypto.price`
- **新**: `item.currency.cmc_id`, `item.currency.symbol`, `item.price.price`

---

## ✅ 测试清单

### 环境检查
- [ ] 后端服务运行在 `http://localhost:7881`
- [ ] 前端服务运行在 `http://localhost:3000`
- [ ] `.env.local` 配置正确

### 功能测试

#### 1. Navbar 显示
- [ ] 未登录：显示 Home, Sign In, Sign Up
- [ ] 已登录：显示 Home, Profile, User Menu

#### 2. Alert 创建
- [ ] 打开 Profile → Alerts
- [ ] 点击 "New Alert"
- [ ] 选择货币（下拉框正常显示）
- [ ] 填写表单并提交
- [ ] 成功显示提示

#### 3. 控制台检查
- [ ] 无 JavaScript 错误
- [ ] API 请求成功
- [ ] 无无限循环请求

---

## 🚀 后续工作

### 待后端实现的接口

1. **获取告警列表**
   ```
   GET /core/alerts
   Response: { items: Alert[], total: number }
   ```

2. **更新告警**
   ```
   POST /core/alert/update
   Body: { id, alert_type, threshold_*, direction, is_active, notification_frequency }
   ```

3. **删除告警**
   ```
   POST /core/alert/delete
   Body: { id }
   ```

4. **切换告警状态**
   ```
   可以通过更新接口实现，或单独创建：
   POST /core/alert/toggle
   Body: { id, is_active }
   ```

### 前端优化建议

1. **使用 React Query** - 替换手动 fetch
2. **统一错误处理** - 创建错误处理 hook
3. **加载状态优化** - 骨架屏
4. **表单验证增强** - 更详细的验证规则

---

## 📚 相关文档

- [收藏功能文档](./FAVORITES_FEATURE.md)
- [收藏功能修复](./FAVORITES_FIX_SUMMARY.md)
- [最终修复总结](./FINAL_FIX_SUMMARY.md)
- [API 接口文档](./API_MIGRATION_README.md)

---

**维护者**: Development Team
**最后更新**: 2025-11-12
**版本**: v2.1.0
**状态**: ✅ 基础功能修复完成，等待后端 API 实现
