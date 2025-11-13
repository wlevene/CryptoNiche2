# 快速创建 Alert 功能 - 主页集成

## 功能概述

在主页的货币列表中添加了快速创建 Alert（价格提醒）的功能入口，用户可以直接在浏览货币时快速设置价格提醒，无需跳转到 Profile 页面。

## 功能位置

### 1. 主页货币列表（CurrencyList）
```
主页 → All Cryptocurrencies 部分 → 每行货币的 Actions 列
```

**显示位置**:
- 在表格的 Actions 列
- 收藏按钮（❤️）旁边
- Alert 按钮（🔔）

**操作流程**:
```
1. 用户浏览主页货币列表
   ↓
2. 看到感兴趣的货币（如 BTC）
   ↓
3. 点击该行的 Alert 按钮（🔔）
   ↓
4. 弹出 Alert 创建表单
   ↓
5. 表单已预填货币信息和当前价格
   ↓
6. 用户配置提醒条件
   ↓
7. 提交创建
   ↓
8. 自动关闭弹窗并显示成功提示
```

---

### 2. 市场概览（MarketOverview）
```
主页 → Market Overview 部分 → Top Gainers/Losers/Trending 卡片
```

**显示位置**:
- 在每个货币卡片的右上角
- 收藏按钮和涨跌图标之间
- Alert 按钮（🔔）

**使用场景**:
- 看到涨幅榜第一名，想设置提醒追踪
- 看到跌幅榜某币，想设置止损提醒
- 看到热门货币，想设置突破提醒

---

## 组件说明

### QuickAlertButton 组件

**文件**: `components/alerts/quick-alert-button.tsx`

#### Props 参数

```typescript
interface QuickAlertButtonProps {
  cmcId: number;              // 货币的 CMC ID（必填）
  symbol: string;             // 货币符号，如 "BTC"（必填）
  currentPrice?: number;      // 当前价格（可选，用于显示）
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";  // 按钮样式
  size?: "default" | "sm" | "lg" | "icon";  // 按钮大小
  className?: string;         // 自定义 CSS 类
}
```

#### 功能特性

**1. 权限检查**
```typescript
const { user } = useAuth();

if (!user) {
  toast.error("Please sign in to create alerts");
  return;
}
```
- 未登录用户点击时显示提示
- 要求先登录才能创建 Alert
- 避免无效操作

**2. 弹窗表单**
- 使用 Dialog 组件
- 响应式设计（最大宽度 2xl）
- 支持滚动（最大高度 80vh）
- 可通过 ESC 键或遮罩层关闭

**3. 智能预填**
```typescript
<DialogTitle>Create Price Alert for {symbol}</DialogTitle>
<DialogDescription>
  Set up a price alert to get notified when {symbol} reaches your target conditions.
  {currentPrice && (
    <span className="block mt-1 text-sm font-medium">
      Current price: ${currentPrice.toLocaleString()}
    </span>
  )}
</DialogDescription>
```
- 标题显示货币符号
- 描述中显示当前价格
- 提供上下文信息

**4. 事件处理**
```typescript
const handleClick = (e: React.MouseEvent) => {
  e.stopPropagation(); // 防止触发父元素的点击事件
  // ...
};
```
- 阻止事件冒泡
- 避免触发表格行的点击事件
- 保证按钮独立工作

**5. 成功回调**
```typescript
const handleSuccess = () => {
  setIsOpen(false);
  toast.success("Alert created successfully!");
};
```
- 创建成功后自动关闭弹窗
- 显示成功提示
- 清晰的用户反馈

---

## 用户体验流程

### 场景 1: 在货币列表中快速设置提醒

```
用户浏览主页
  ↓
滚动到 "All Cryptocurrencies" 部分
  ↓
看到 Bitcoin 当前价格 $45,000
  ↓
点击 BTC 行的 🔔 Alert 按钮
  ↓
弹出表单，标题显示 "Create Price Alert for BTC"
描述显示 "Current price: $45,000"
  ↓
选择：
  - Alert Type: Price Threshold
  - Threshold Price: $50,000
  - Direction: Increase only
  - Frequency: Immediate
  ↓
点击 "Create Alert"
  ↓
弹窗自动关闭
显示 "Alert created successfully!"
  ↓
继续浏览其他货币
```

**优势**:
- ✅ 不需要离开主页
- ✅ 不需要跳转到 Profile
- ✅ 不需要重新选择货币
- ✅ 价格信息一目了然
- ✅ 操作流程简短高效

---

### 场景 2: 在市场概览中追踪涨幅榜

```
用户查看 Top Gainers
  ↓
看到某币 24h 涨幅 +15%
  ↓
点击该卡片上的 🔔 Alert 按钮
  ↓
弹出表单，已预填货币信息
  ↓
配置：
  - Alert Type: Price Change
  - Threshold: 5%
  - Direction: Down (设置回调提醒)
  - Frequency: Immediate
  ↓
创建成功
  ↓
继续查看其他热门货币
```

**优势**:
- ✅ 快速响应市场热点
- ✅ 及时设置追踪
- ✅ 把握投资机会

---

## 视觉设计

### 按钮样式

**货币列表中**:
```tsx
<QuickAlertButton
  variant="ghost"      // 透明背景，hover 时显示
  size="sm"           // 小尺寸，节省空间
/>
```

**市场概览中**:
```tsx
<QuickAlertButton
  variant="ghost"     // 透明背景
  size="icon"        // 图标尺寸，更紧凑
/>
```

### 布局位置

**货币列表表格**:
```
┌─────┬──────────┬────────┬───────┬───────┬────────┬────────┬──────────┐
│  #  │   Name   │ Price  │ 24h % │  7d % │ Mkt Cap│ Volume │ Actions  │
├─────┼──────────┼────────┼───────┼───────┼────────┼────────┼──────────┤
│  1  │ BTC      │$45,000 │ +2.5% │ +5.2% │ $880B  │ $25B   │ ❤️ 🔔   │
│  2  │ ETH      │$2,800  │ +1.8% │ +3.1% │ $320B  │ $15B   │ ❤️ 🔔   │
└─────┴──────────┴────────┴───────┴───────┴────────┴────────┴──────────┘
```

**市场概览卡片**:
```
┌─────────────────────────────────────┐
│ BTC  Bitcoin              ❤️ 🔔 ↗️ │
│                                     │
│ $45,000.50          [+2.50%]       │
│ Market Cap: $880B                   │
└─────────────────────────────────────┘
```

---

## 技术实现

### 1. 组件集成

#### CurrencyList 组件更新

**导入 QuickAlertButton**:
```typescript
import { QuickAlertButton } from "@/components/alerts/quick-alert-button";
```

**表头更新**:
```tsx
<th className="px-4 py-3 text-center text-sm font-medium" colSpan={2}>
  Actions
</th>
```

**表格行更新**:
```tsx
<td className="px-4 py-3 text-center">
  <div className="flex items-center justify-center gap-1">
    <FavoriteButton {...props} />
    <QuickAlertButton
      cmcId={item.currency.cmc_id || 0}
      symbol={item.currency.symbol}
      currentPrice={item.price?.price}
      variant="ghost"
      size="sm"
    />
  </div>
</td>
```

---

#### MarketOverview 组件更新

**导入 QuickAlertButton**:
```typescript
import { QuickAlertButton } from "@/components/alerts/quick-alert-button";
```

**卡片头部更新**:
```tsx
<div className="flex items-center gap-1">
  <FavoriteButton {...props} />
  <QuickAlertButton
    cmcId={item.currency.cmc_id || 0}
    symbol={item.currency.symbol}
    currentPrice={item.price?.price}
    variant="ghost"
    size="icon"
  />
  {/* 涨跌图标 */}
</div>
```

---

### 2. 状态管理

```typescript
const [isOpen, setIsOpen] = useState(false);  // 控制弹窗显示

// 打开弹窗
const handleClick = () => setIsOpen(true);

// 关闭弹窗
const handleCancel = () => setIsOpen(false);
const handleSuccess = () => setIsOpen(false);
```

---

### 3. 表单复用

QuickAlertButton 直接复用了 AlertForm 组件：
```tsx
<AlertForm
  onSuccess={handleSuccess}
  onCancel={handleCancel}
/>
```

**优势**:
- ✅ 代码复用，减少重复
- ✅ 逻辑一致，减少 bug
- ✅ 维护简单，改一处生效

---

## 与原有功能的关系

### Profile 页面的 Alert 管理

**功能定位**:
- Profile 页面: **管理和查看** Alert
  - 查看所有 Alert 列表
  - 编辑 Alert 配置
  - 删除 Alert
  - 开关 Alert
  - 查看通知历史
  - 查看统计数据

- 主页快速创建: **快速创建** Alert
  - 浏览时即时创建
  - 无需跳转页面
  - 操作快速便捷

**协同工作**:
```
主页快速创建 Alert
  ↓
Alert 保存到数据库
  ↓
Profile 页面可以看到和管理
  ↓
用户可以在 Profile 编辑或删除
```

---

## 用户引导

### 未登录用户

**场景**: 未登录用户点击 Alert 按钮

**提示**: "Please sign in to create alerts"

**引导**:
- 显示 Toast 提示
- 引导用户登录
- 登录后可以正常使用

---

### 首次使用

**可以添加引导提示**（待实现）:
```
💡 提示：点击 🔔 按钮可以快速设置价格提醒
```

---

## 性能优化

### 1. 按需加载
- Dialog 组件按需渲染
- 未打开时不加载表单内容

### 2. 事件优化
- `e.stopPropagation()` 阻止冒泡
- 避免触发父元素事件

### 3. 状态局部化
- 每个按钮独立管理弹窗状态
- 互不干扰

---

## 修改的文件

### 新建文件
1. `components/alerts/quick-alert-button.tsx` - 快速 Alert 按钮组件

### 修改文件
1. `components/market/currency-list.tsx`
   - 导入 QuickAlertButton
   - 更新表头（Actions 列）
   - 添加 Alert 按钮到每行

2. `components/sections/market-overview.tsx`
   - 导入 QuickAlertButton
   - 在货币卡片中添加 Alert 按钮

---

## 使用示例

### 在其他列表中集成

如果未来有其他货币列表需要添加快速 Alert 功能：

```tsx
import { QuickAlertButton } from "@/components/alerts/quick-alert-button";

function MyCurrencyList() {
  return (
    <div>
      {currencies.map(currency => (
        <div key={currency.id}>
          <span>{currency.name}</span>
          <QuickAlertButton
            cmcId={currency.cmc_id}
            symbol={currency.symbol}
            currentPrice={currency.price}
            variant="ghost"
            size="sm"
          />
        </div>
      ))}
    </div>
  );
}
```

---

## 未来改进

### 1. 智能推荐
- 根据当前价格推荐合理的阈值
- 基于历史波动推荐合适的百分比

### 2. 快捷操作
- 右键菜单快速创建
- 键盘快捷键（如 Ctrl+A）

### 3. 批量创建
- 选择多个货币批量创建
- 使用相同的提醒条件

### 4. 模板功能
- 保存常用的 Alert 配置
- 一键应用到不同货币

---

## 总结

通过在主页添加快速创建 Alert 的功能入口，用户可以：

1. ✅ **即时响应**: 看到感兴趣的价格立即设置提醒
2. ✅ **流程简化**: 无需跳转页面，在当前位置完成操作
3. ✅ **信息完整**: 货币和价格信息自动预填，减少输入
4. ✅ **操作便捷**: 与收藏功能并列，位置显眼易找
5. ✅ **体验一致**: 复用相同的表单组件，保持一致性

这个功能让 Alert 创建从"深埋在 Profile 页面的功能"变成"触手可及的快捷操作"，大大提升了用户体验和功能的可用性。
