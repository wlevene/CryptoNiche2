# Alert（价格提醒）功能产品逻辑

## 一、功能概述

Alert 是一个加密货币价格监控和通知系统，允许用户设置价格提醒条件，当市场价格满足用户设定的条件时，系统自动触发通知提醒用户。

### 核心价值
- **被动监控**: 用户无需时刻盯盘，系统自动监控价格变化
- **及时通知**: 价格达到目标时立即通知用户
- **灵活配置**: 支持多种提醒类型和条件
- **历史追踪**: 记录所有触发的通知历史

---

## 二、用户角色与权限

### 1. 未登录用户
- **无法使用** Alert 功能
- 需要先登录才能创建和管理 Alert

### 2. 已登录用户
- **可以创建** 多个 Alert
- **可以管理** 自己的 Alert（查看、编辑、删除、开关）
- **可以查看** 自己的通知历史
- **可以查看** Alert 统计数据

---

## 三、功能模块

### 模块 1: Alert 创建（AlertForm 组件）

#### 访问路径
```
Profile 页面 → Alerts 标签 → "New Alert" 按钮 → 弹窗表单
```

#### 创建流程

```
1. 用户点击 "New Alert" 按钮
   ↓
2. 打开创建 Alert 弹窗（Dialog）
   ↓
3. 用户填写 Alert 配置表单
   ↓
4. 用户提交表单
   ↓
5. 前端验证表单数据
   ↓
6. 调用后端 API: POST /core/alert
   ↓
7. 后端创建 Alert 记录
   ↓
8. 返回成功/失败结果
   ↓
9. 显示提示消息
   ↓
10. 刷新 Alert 列表
    ↓
11. 关闭弹窗
```

#### 表单配置项

##### 1. Cryptocurrency（加密货币选择）
**说明**: 选择要监控的加密货币

**输入方式**:
- 下拉选择框（Select）
- 显示前 100 个货币
- 每项显示：符号 + 名称 + 当前价格

**数据来源**:
- API: `GET /api/v1/currency/list?page=1&page_size=100`

**显示格式**:
```
BTC Bitcoin $45,000.50
ETH Ethereum $2,800.30
```

**必填**: ✅ 是

**验证规则**:
- 必须选择一个货币
- crypto_id 不能为空

---

##### 2. Alert Type（提醒类型）
**说明**: 选择价格提醒的触发方式

**输入方式**:
- 单选框（Radio Group）
- 2 个选项

**选项 A: Price Change Percentage（价格变化百分比）**
- **值**: `price_change`
- **说明**: 当价格相对于创建时的价格变化达到指定百分比时触发
- **适用场景**: 监控短期波动，例如"比特币涨了5%就提醒我"
- **配套输入**: threshold_percentage（百分比值）

**选项 B: Price Threshold（目标价格）**
- **值**: `price_threshold`
- **说明**: 当价格突破指定的绝对价格阈值时触发
- **适用场景**: 监控目标价位，例如"比特币达到 $50,000 就提醒我"
- **配套输入**: threshold_price（价格值）

**默认值**: `price_change`

**必填**: ✅ 是

---

##### 3. Threshold Input（阈值输入）

根据 Alert Type 的选择，显示不同的输入框：

**情况 A: 选择了 Price Change Percentage**

**字段名**: threshold_percentage

**输入方式**: 数字输入框

**输入要求**:
- 类型: 数字
- 最小值: 0.1
- 最大值: 100
- 步进: 0.1
- 单位: %

**示例**:
- 输入 5.0 表示价格变化 5%
- 输入 10.0 表示价格变化 10%

**说明文案**: "Alert when price changes by this percentage"

**占位符**: "e.g., 5.0 for 5%"

**必填**: ✅ 是

---

**情况 B: 选择了 Price Threshold**

**字段名**: threshold_price

**输入方式**: 数字输入框

**输入要求**:
- 类型: 数字
- 最小值: 0.01
- 步进: 0.01
- 单位: USD

**智能占位符**:
- 如果已选择货币，显示当前价格
- 例如："e.g., $45,000.50"
- 未选择货币时显示："Enter target price"

**说明文案**: "Alert when price crosses this threshold"

**必填**: ✅ 是

---

##### 4. Direction（方向）
**说明**: 指定触发条件的价格变化方向

**输入方式**:
- 单选框（Radio Group）
- 3 个选项

**选项 A: Increase only ↗️**
- **值**: `up`
- **说明**: 只在价格上涨时触发
- **适用场景**:
  - Price Change: 涨幅达到 X% 时提醒
  - Price Threshold: 价格突破 $X 向上时提醒

**选项 B: Decrease only ↘️**
- **值**: `down`
- **说明**: 只在价格下跌时触发
- **适用场景**:
  - Price Change: 跌幅达到 X% 时提醒
  - Price Threshold: 价格跌破 $X 向下时提醒

**选项 C: Both directions ↕️**
- **值**: `both`
- **说明**: 价格上涨或下跌都触发
- **适用场景**:
  - Price Change: 价格变化（无论涨跌）达到 X% 时提醒
  - Price Threshold: 价格突破 $X（无论向上还是向下）时提醒

**默认值**: `both`

**必填**: ✅ 是

---

##### 5. Notification Frequency（通知频率）
**说明**: 控制触发后的通知频率，避免频繁打扰

**输入方式**:
- 下拉选择框（Select）
- 3 个选项

**选项 A: Immediate（立即）**
- **值**: `immediate`
- **说明**: 每次条件满足时立即发送通知
- **适用场景**: 重要价格监控，需要实时响应
- **风险**: 价格频繁波动时可能收到大量通知

**选项 B: Every Hour（每小时）**
- **值**: `hourly`
- **说明**: 条件满足后，每小时最多发送一次通知
- **适用场景**: 中等关注度的监控
- **节流机制**: 1小时内只发送第一次触发的通知

**选项 C: Daily（每天）**
- **值**: `daily`
- **说明**: 条件满足后，每天最多发送一次通知
- **适用场景**: 长期趋势监控
- **节流机制**: 24小时内只发送第一次触发的通知

**默认值**: `immediate`

**必填**: ✅ 是

---

#### API 请求格式

```typescript
POST http://localhost:7881/core/alert

Headers:
  Authorization: Bearer {JWT_TOKEN}
  Content-Type: application/json

Body:
{
  "crypto_id": 1,                          // 货币 ID
  "alert_type": "price_change",            // 或 "price_threshold"
  "threshold_percentage": 5.0,             // 当 alert_type = price_change
  // 或
  "threshold_price": 50000.00,             // 当 alert_type = price_threshold
  "direction": "both",                     // 或 "up" / "down"
  "notification_frequency": "immediate"    // 或 "hourly" / "daily"
}
```

#### API 响应格式

**成功响应**:
```json
{
  "code": 0,
  "msg": "OK",
  "data": {
    "id": "alert_123456",
    "user_id": "user_789",
    "crypto_id": 1,
    "alert_type": "price_change",
    "threshold_percentage": 5.0,
    "direction": "both",
    "is_active": true,
    "notification_frequency": "immediate",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**失败响应**:
```json
{
  "code": 1001,
  "msg": "Invalid crypto_id",
  "data": null
}
```

#### 用户体验

**加载状态**:
- 提交时按钮显示加载动画
- 按钮文案变为 "Creating Alert..."
- 按钮禁用，防止重复提交

**成功反馈**:
- 显示成功提示: "Price alert created successfully!"
- 自动关闭弹窗
- 刷新 Alert 列表
- 表单重置为初始状态

**失败反馈**:
- 显示错误提示: 后端返回的错误消息
- 弹窗保持打开
- 表单数据保留
- 用户可以修改后重试

---

### 模块 2: Alert 列表（AlertList 组件）

#### 访问路径
```
Profile 页面 → Alerts 标签 → Alert 列表
```

#### 列表内容

每个 Alert 卡片显示以下信息：

##### 头部信息
```
[图标] BTC (Bitcoin)            [Immediate] [Active]
```

**图标说明**:
- 📈 蓝色图标: Price Change 类型
- 🎯 紫色图标: Price Threshold 类型

**标签说明**:
- 频率标签: Immediate / Hourly / Daily
- 状态标签: Active（绿色） / Inactive（灰色）

##### 触发条件
```
Alert when price changes by 5.0% ↕️
或
Alert when price crosses $50,000.00 ↗️
```

##### 当前价格
```
Current price: $45,230.50 +2.35%
```
- 显示实时价格
- 显示 24h 涨跌幅（绿色/红色）

##### 时间信息
```
Created: Jan 15, 2024, 10:30 AM
Last triggered: Jan 16, 2024, 3:45 PM
```

##### 操作按钮

**开关按钮（Switch）**:
- 用途: 快速启用/禁用 Alert
- 状态: On / Off
- 交互: 点击切换状态
- API: `POST /core/alert/update`

**删除按钮**:
- 用途: 永久删除 Alert
- 确认: 弹出确认对话框
- 交互: 点击后确认删除
- API: `POST /core/alert/delete`

#### 空状态

当用户没有任何 Alert 时：
```
[铃铛关闭图标]
No alerts configured

Create your first price alert to get notified
about important price movements

[Create Alert 按钮]
```

#### 加载状态

显示骨架屏加载动画

---

### 模块 3: 通知历史（NotificationHistory 组件）

#### 访问路径
```
Profile 页面 → Notifications 标签 → 通知历史列表
```

#### 列表内容

每个通知卡片显示：

##### 头部
```
[✓] BTC Alert Triggered ↗️        [Sent]
    Bitcoin                        Jan 16, 2024, 3:45 PM
```

**状态图标**:
- ✓ 绿色: Sent（已发送）
- ✗ 红色: Failed（失败）
- ⏰ 橙色: Pending（待发送）

##### 详细信息（4列网格）
```
Trigger Price:      $50,123.45
Previous Price:     $48,900.00
Change:            +2.50%
Alert Type:        Price Change
```

##### 发送状态

**已发送**:
```
✓ Delivered at Jan 16, 2024, 3:46 PM
```

**失败**:
```
✗ Failed: Email delivery error
```

#### 功能特性

**刷新按钮**:
- 手动刷新通知列表
- 获取最新通知状态

**加载更多**:
- 默认显示 20 条
- 点击 "Load More" 加载更多
- 每次加载 20 条

**空状态**:
```
[铃铛图标]
No Notifications Yet

When your price alerts trigger, you'll see
the notification history here
```

---

### 模块 4: Alert 统计（AlertsStats 组件）

#### 访问路径
```
Profile 页面 → Overview 标签 → Alert 统计卡片
```

#### 统计卡片（4个）

**1. Total Alerts（总提醒数）**
```
[🔔]  Total Alerts
      12
      All-time created alerts
```

**2. Active Alerts（活跃提醒）**
```
[✓]   Active Alerts
      8
      Currently monitoring
```
- 绿色强调
- 显示正在监控的 Alert 数量

**3. Notifications（通知总数）**
```
[📈]  Notifications
      45
      Total alerts triggered
```

**4. Recent Activity（近期活动）**
```
[⚠️]  Recent Activity
      12
      Past 7 days
```
- 橙色强调
- 显示最近 7 天触发的通知数

#### 快速概览卡片

```
Quick Overview

Alert Success Rate:     [98%]
Active vs Inactive:     [8 Active] [4 Inactive]
Average Alerts per Crypto: 2
```

---

## 四、业务逻辑

### 1. Alert 触发逻辑

#### Price Change 类型

**基准价格**: Alert 创建时的货币价格

**触发条件**:
```
当前价格与基准价格的变化百分比 >= threshold_percentage
```

**计算公式**:
```
price_change_percentage = ((current_price - base_price) / base_price) * 100
```

**方向判断**:
- `up`: 只在 price_change_percentage > 0 且 >= threshold 时触发
- `down`: 只在 price_change_percentage < 0 且 |price_change_percentage| >= threshold 时触发
- `both`: price_change_percentage 的绝对值 >= threshold 时触发

**示例**:
```
创建时价格: $100
阈值: 5%
方向: both

触发场景：
- 价格涨到 $105 或以上 → 触发（+5%）
- 价格跌到 $95 或以下 → 触发（-5%）
- 价格在 $95-$105 之间 → 不触发
```

---

#### Price Threshold 类型

**阈值**: 用户设定的目标价格

**触发条件**:
```
当前价格突破阈值价格
```

**方向判断**:
- `up`: 当前价格 >= threshold_price 且上一次价格 < threshold_price（向上突破）
- `down`: 当前价格 <= threshold_price 且上一次价格 > threshold_price（向下突破）
- `both`: 价格跨越 threshold_price（任意方向）

**示例**:
```
阈值价格: $50,000
方向: up

触发场景：
- 价格从 $49,900 涨到 $50,100 → 触发（向上突破）
- 价格从 $50,100 跌到 $49,900 → 不触发（向下突破）
```

---

### 2. 通知频率控制

**Immediate（立即）**:
- 每次触发都发送通知
- 无节流限制
- 适合关键监控

**Hourly（每小时）**:
- 触发后发送第一次通知
- 1小时内不再发送
- 1小时后如果条件仍满足，再次发送

**Daily（每天）**:
- 触发后发送第一次通知
- 24小时内不再发送
- 24小时后如果条件仍满足，再次发送

**实现机制**:
- 记录 `last_triggered_at` 时间戳
- 检查当前时间与 `last_triggered_at` 的间隔
- 根据频率设置决定是否发送

---

### 3. Alert 生命周期

```
1. Created（已创建）
   - 用户提交表单
   - Alert 记录保存到数据库
   - 状态: is_active = true
   ↓
2. Active（监控中）
   - 后端定期检查价格
   - 判断是否满足触发条件
   - 记录基准价格
   ↓
3. Triggered（已触发）
   - 条件满足
   - 创建 Notification 记录
   - 更新 last_triggered_at
   - 发送通知（邮件/短信/站内信）
   ↓
4. Inactive（已停用）
   - 用户手动关闭（Switch Off）
   - 状态: is_active = false
   - 停止监控
   ↓
5. Deleted（已删除）
   - 用户删除 Alert
   - 记录从数据库删除
   - 历史通知保留
```

---

### 4. 数据模型

#### Alert 表
```typescript
{
  id: string;                           // 唯一标识
  user_id: string;                      // 用户 ID
  crypto_id: number;                    // 货币 ID
  alert_type: 'price_change' | 'price_threshold';
  threshold_percentage: number | null;  // 百分比阈值（price_change 时有值）
  threshold_price: number | null;       // 价格阈值（price_threshold 时有值）
  base_price: number;                   // 创建时的基准价格
  direction: 'up' | 'down' | 'both';    // 方向
  is_active: boolean;                   // 是否启用
  notification_frequency: 'immediate' | 'hourly' | 'daily';
  last_triggered_at: string | null;     // 最后触发时间
  created_at: string;                   // 创建时间
  updated_at: string;                   // 更新时间
}
```

#### Notification 表
```typescript
{
  id: string;                           // 唯一标识
  alert_id: string;                     // 关联的 Alert ID
  user_id: string;                      // 用户 ID
  crypto_id: number;                    // 货币 ID
  trigger_price: number;                // 触发时的价格
  previous_price: number;               // 之前的价格
  price_change_percentage: number;      // 价格变化百分比
  status: 'pending' | 'sent' | 'failed'; // 发送状态
  sent_at: string | null;               // 发送时间
  error_message: string | null;         // 错误信息（失败时）
  created_at: string;                   // 创建时间
}
```

---

## 五、用户场景示例

### 场景 1: 监控比特币短期波动

**用户目标**: 当比特币价格波动超过 5% 时立即得到通知

**配置**:
- Cryptocurrency: Bitcoin (BTC)
- Alert Type: Price Change Percentage
- Threshold: 5.0%
- Direction: Both directions
- Frequency: Immediate

**触发情况**:
```
创建时价格: $45,000
5%阈值范围: $42,750 - $47,250

场景 A: 价格涨到 $47,300
→ 触发 ✓ (涨幅 5.11%)
→ 立即发送通知

场景 B: 价格在 $46,000
→ 不触发 ✗ (涨幅 2.22%)

场景 C: 价格跌到 $42,500
→ 触发 ✓ (跌幅 5.56%)
→ 立即发送通知
```

---

### 场景 2: 等待以太坊达到目标价位

**用户目标**: 当以太坊价格突破 $3,000 时得到通知

**配置**:
- Cryptocurrency: Ethereum (ETH)
- Alert Type: Price Threshold
- Threshold Price: $3,000
- Direction: Increase only
- Frequency: Immediate

**触发情况**:
```
目标价格: $3,000

场景 A: 价格从 $2,950 涨到 $3,050
→ 触发 ✓ (向上突破 $3,000)
→ 立即发送通知

场景 B: 价格从 $3,050 跌到 $2,950
→ 不触发 ✗ (方向设置为 up only)

场景 C: 价格一直在 $2,900
→ 不触发 ✗ (未达到阈值)
```

---

### 场景 3: 长期监控投资组合

**用户目标**: 每天查看投资的币种是否有大幅变动

**配置**:
- Cryptocurrency: Multiple (每个币种单独设置)
- Alert Type: Price Change Percentage
- Threshold: 10.0%
- Direction: Both directions
- Frequency: Daily

**触发情况**:
```
场景: BTC 连续 3 天大幅波动

Day 1, 9:00 AM: 价格涨 12%
→ 触发 ✓
→ 发送通知

Day 1, 3:00 PM: 价格继续涨到 15%
→ 不触发 ✗ (24小时内已通知)

Day 2, 10:00 AM: 价格仍保持 15% 涨幅
→ 触发 ✓ (距上次通知已超过 24 小时)
→ 发送通知
```

---

## 六、技术要点

### 1. 前端实现

**状态管理**:
- 使用 React useState 管理表单状态
- 使用 useEffect 加载初始数据

**表单验证**:
- 必填字段检查
- 数值范围验证
- 条件互斥逻辑（threshold_percentage vs threshold_price）

**实时更新**:
- Alert 创建/更新/删除后立即刷新列表
- 使用 refreshKey 触发重新渲染

---

### 2. API 通信

**认证**:
- 使用 `fetchWithAuth` 自动添加 JWT token
- 401 错误自动处理登出

**错误处理**:
- 网络错误捕获
- 后端错误消息显示
- 用户友好的错误提示

---

### 3. 用户体验优化

**即时反馈**:
- 加载状态指示
- 操作成功/失败提示
- 表单验证错误高亮

**数据展示**:
- 价格格式化（货币符号、千位分隔符、小数位）
- 时间格式化（本地化显示）
- 百分比格式化（正负号、颜色区分）

**交互优化**:
- 确认删除对话框
- Switch 开关即时响应
- 弹窗内容滚动

---

## 七、业务规则

### 限制规则

1. **Alert 数量限制**（待实现）
   - 普通用户: 最多 10 个活跃 Alert
   - VIP 用户: 最多 50 个活跃 Alert

2. **同币种限制**（待实现）
   - 同一货币最多 3 个 Alert

3. **频率限制**（待实现）
   - Immediate 频率: 每小时最多触发 10 次

---

### 数据保留策略

1. **Alert 记录**
   - 永久保留（除非用户删除）
   - Inactive Alert 保留配置

2. **Notification 记录**
   - 保留最近 30 天
   - 超过 30 天自动归档

---

## 八、未来优化方向

### 功能增强

1. **高级条件**
   - 复合条件（价格 AND 成交量）
   - 时间条件（仅在交易时段触发）
   - 连续条件（连续 N 次满足才触发）

2. **通知渠道**
   - 邮件通知 ✓（已实现）
   - 短信通知（待实现）
   - 微信/Telegram 通知（待实现）
   - 浏览器推送通知（待实现）

3. **智能提醒**
   - AI 推荐最佳阈值
   - 历史数据分析
   - 异常波动预警

4. **批量操作**
   - 批量创建 Alert
   - 批量启用/禁用
   - Alert 模板保存

---

## 九、总结

Alert 功能是一个完整的价格监控和通知系统，核心流程包括：

1. **创建阶段**: 用户配置监控条件（货币、类型、阈值、方向、频率）
2. **监控阶段**: 后端定期检查价格，判断是否满足触发条件
3. **通知阶段**: 条件满足时创建通知记录并发送通知
4. **管理阶段**: 用户可以查看、编辑、删除、开关 Alert
5. **历史阶段**: 用户可以查看所有触发的通知历史和统计数据

**设计亮点**:
- ✅ 灵活的配置选项（2种类型 × 3种方向 × 3种频率 = 18种组合）
- ✅ 清晰的用户界面（表单、列表、统计、历史）
- ✅ 完善的状态管理（Active/Inactive/Deleted）
- ✅ 智能的频率控制（防止通知轰炸）
- ✅ 详细的历史追踪（每次触发都有记录）
