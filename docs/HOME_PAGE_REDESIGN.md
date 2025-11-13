# 主页重新设计 - 添加全部货币列表

## 设计目标

重新设计主页，添加完整的加密货币列表展示，让用户可以：
1. 浏览所有可用的加密货币
2. 搜索特定的货币
3. 查看实时价格和涨跌幅
4. 快速添加到收藏夹
5. 分页浏览大量数据

## 页面结构

### 更新后的主页布局

```
┌────────────────────────────────────────┐
│           Hero Section                  │
│   (标题、描述、CTA)                     │
└────────────────────────────────────────┘
│
├─ Market Overview (市场概览)
│  ├─ 市场统计卡片
│  │  ├─ Total Market Cap (总市值)
│  │  ├─ 24h Volume (24小时交易量)
│  │  ├─ BTC Dominance (比特币市场占有率)
│  │  └─ ETH Dominance (以太坊市场占有率)
│  │
│  ├─ Top Gainers (涨幅榜)
│  │  └─ 前 6 名涨幅最大的货币
│  │
│  ├─ Top Losers (跌幅榜)
│  │  └─ 前 6 名跌幅最大的货币
│  │
│  └─ Trending (热门货币)
│     └─ 前 6 名交易量最大的货币
│
└─ All Cryptocurrencies (全部货币列表) ← 新增
   ├─ 搜索栏 + 刷新按钮
   ├─ 货币表格
   │  ├─ 排名
   │  ├─ 名称/符号
   │  ├─ 当前价格
   │  ├─ 24小时涨跌幅
   │  ├─ 7天涨跌幅
   │  ├─ 市值
   │  ├─ 24小时交易量
   │  └─ 收藏按钮
   │
   └─ 分页控件
      ├─ 显示范围提示
      └─ 上一页/下一页/页码按钮
```

## 新增组件

### CurrencyList 组件

**文件**: `components/market/currency-list.tsx`

#### 功能特性

1. **数据获取**
   - 调用 `/api/v1/currency/list` 接口
   - 支持分页（默认每页 20 条）
   - 支持关键词搜索

2. **搜索功能**
   - 实时搜索输入框
   - 按名称或符号搜索
   - 搜索时自动重置到第一页

3. **表格展示**
   ```typescript
   表头:
   - # (排名)
   - Name (名称/符号)
   - Price (当前价格)
   - 24h % (24小时涨跌幅)
   - 7d % (7天涨跌幅)
   - Market Cap (市值)
   - Volume (24h) (24小时交易量)
   - Actions (操作 - 收藏按钮)
   ```

4. **数据格式化**
   - 价格格式化：
     - 小于 $1: 显示 6 位小数
     - 大于 $1: 显示 2 位小数
   - 大数字缩写：
     - Trillion (T): 万亿
     - Billion (B): 十亿
     - Million (M): 百万
   - 百分比：显示正负号和 2 位小数

5. **视觉反馈**
   - 涨跌用颜色区分（绿色/红色）
   - 趋势图标（上升/下降箭头）
   - 悬停行高亮
   - 加载状态指示器

6. **分页功能**
   - 显示当前页数据范围
   - 上一页/下一页按钮
   - 页码快速跳转
   - 智能页码显示（最多显示 5 个页码）

#### API 调用

```typescript
GET /api/v1/currency/list?page=1&page_size=20&keyword=bitcoin

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "currency": {
          "cmc_id": 1,
          "name": "Bitcoin",
          "symbol": "BTC"
        },
        "price": {
          "price": 45000.50,
          "percent_change_24h": 2.5,
          "percent_change_7d": 5.2,
          "market_cap": 880000000000,
          "volume_24h": 25000000000
        },
        "is_favorite": false
      }
    ],
    "total": 500,
    "page": 1,
    "page_size": 20
  }
}
```

#### 组件状态管理

```typescript
const [data, setData] = useState<CurrencyListResponse | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [searchQuery, setSearchQuery] = useState("");
const [currentPage, setCurrentPage] = useState(1);
```

## 用户交互流程

### 1. 浏览货币列表
```
用户访问主页
  → 自动加载第一页数据（20条）
  → 显示货币表格
  → 用户可以滚动查看
```

### 2. 搜索货币
```
用户在搜索框输入 "btc"
  → 自动重置到第1页
  → 调用 API: /api/v1/currency/list?page=1&keyword=btc
  → 显示匹配结果
  → 高亮显示搜索关键词（可选）
```

### 3. 分页浏览
```
用户点击 "Next" 或页码
  → currentPage 状态更新
  → 触发 useEffect 重新获取数据
  → 显示新页面数据
  → 滚动到表格顶部（可选）
```

### 4. 添加收藏
```
用户点击收藏按钮
  → FavoriteButton 组件处理
  → 调用收藏 API
  → 更新收藏状态
  → 显示成功提示
```

### 5. 刷新数据
```
用户点击刷新按钮
  → 保持当前页码和搜索条件
  → 重新调用 API
  → 更新数据
  → 显示加载状态
```

## 响应式设计

### 桌面视图 (≥1024px)
- 表格完整显示所有列
- 分页控件显示多个页码按钮
- 每行数据在一行内显示

### 平板视图 (768px - 1023px)
- 表格可能需要横向滚动
- 隐藏次要列（如 7天涨跌幅）
- 分页控件简化显示

### 移动视图 (<768px)
- 表格转换为卡片布局（待实现）
- 每个货币显示为独立卡片
- 分页控件只显示上一页/下一页

## 性能优化

1. **分页加载**
   - 每次只加载 20 条数据
   - 避免一次性加载所有数据

2. **搜索防抖**
   - 可以添加 debounce 优化搜索输入
   - 减少 API 调用频率

3. **缓存策略**
   - 可以考虑添加客户端缓存
   - 相同查询条件复用数据

4. **虚拟滚动**
   - 未来可以考虑虚拟滚动
   - 处理超大数据集

## 代码结构

```
components/market/currency-list.tsx
├─ CurrencyList (主组件)
│  ├─ State Management (状态管理)
│  ├─ Data Fetching (数据获取)
│  ├─ Search Bar (搜索栏)
│  ├─ Currency Table (货币表格)
│  │  ├─ Table Header (表头)
│  │  └─ Table Body (表体)
│  │     └─ Currency Row (货币行)
│  └─ Pagination Controls (分页控件)
│
├─ Helper Functions
│  ├─ formatCurrency (格式化价格)
│  ├─ formatLargeNumber (格式化大数字)
│  └─ formatPercentage (格式化百分比)
│
└─ Dependencies
   ├─ UI Components (Card, Button, Input, Badge)
   ├─ Icons (Lucide React)
   └─ FavoriteButton (收藏按钮组件)
```

## 更新的文件

1. **新建文件**:
   - `components/market/currency-list.tsx` - 货币列表组件

2. **修改文件**:
   - `src/app/page.tsx` - 添加 CurrencyList 组件

## 未来改进

1. **高级筛选**
   - 按市值范围筛选
   - 按价格范围筛选
   - 按涨跌幅筛选

2. **排序功能**
   - 点击表头排序
   - 多列排序支持

3. **收藏同步**
   - 收藏状态实时更新
   - 跨组件状态同步

4. **数据可视化**
   - 添加迷你图表
   - 显示价格趋势

5. **导出功能**
   - 导出为 CSV
   - 导出为 Excel

6. **对比功能**
   - 选择多个货币对比
   - 显示对比图表

## 测试建议

### 功能测试
- [ ] 首次加载显示正确数据
- [ ] 搜索功能工作正常
- [ ] 分页功能正常切换
- [ ] 收藏按钮可以正常工作
- [ ] 刷新按钮更新数据
- [ ] 错误状态正确显示

### 性能测试
- [ ] 大数据量下加载速度
- [ ] 搜索响应时间
- [ ] 分页切换流畅度
- [ ] 内存占用合理

### UI 测试
- [ ] 响应式布局正确
- [ ] 颜色对比度足够
- [ ] 交互反馈清晰
- [ ] 加载状态友好

## 总结

通过添加 CurrencyList 组件，主页现在提供了完整的加密货币浏览体验：

1. **市场概览**: 快速了解市场整体情况和热门货币
2. **完整列表**: 浏览和搜索所有可用货币
3. **数据详细**: 显示价格、涨跌幅、市值、交易量等关键指标
4. **交互友好**: 搜索、分页、收藏等功能一应俱全

这个设计平衡了信息密度和用户体验，既满足了专业用户对详细数据的需求，也保持了界面的简洁和易用性。
