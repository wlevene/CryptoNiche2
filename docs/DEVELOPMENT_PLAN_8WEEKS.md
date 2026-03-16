# CryptoNiche 付费功能开发计划

> **目标**: 实现 Pro/Elite 付费功能，6 个月内达成 $50,000/月收入  
> **开发周期**: 8 周（Phase 3A）  
> **负责人**: 开发团队  
> **版本**: v1.0  
> **制定时间**: 2026-03-16

---

## 一、现状分析

### 1.1 现有代码库概览

**前端 (CryptoNiche2)**:
- 技术栈：Next.js 15 + React 19 + TypeScript + Tailwind CSS
- 文件数：79 个 TS/TSX 文件
- 核心目录：
  - `src/app/` - 页面和 API 路由
  - `components/` - UI 组件
  - `lib/` - 工具库、服务、类型定义、Hooks

**后端 (CryptoNiche-server)**:
- 技术栈：Go + go-zero + goctl
- 核心目录：
  - `internal/logic/` - 业务逻辑
  - `internal/dao/` - 数据访问层
  - `internal/types/` - 类型定义
  - `internal/handler/` - HTTP 处理

### 1.2 现有功能清单

| 功能 | 状态 | 文件位置 |
|------|------|---------|
| 用户认证 | ✅ 完成 | `lib/auth/`, `internal/logic/auth/` |
| 货币列表 | ✅ 完成 | `lib/services/currency-service.ts`, `internal/logic/currency/` |
| 货币详情 | ✅ 完成 | 同上 |
| 市场概览 | ✅ 完成 | 同上 |
| 价格提醒 | ✅ 完成 | `lib/services/alert-service-v2.ts`, `internal/logic/currency/` |
| 收藏功能 | ✅ 完成 | `lib/services/favorites-service.ts` |
| 搜索功能 | ✅ 完成 | `internal/logic/currency/search_currency_logic.go` |
| 价格历史 | ✅ 完成 | `internal/logic/currency/price_history_logic.go` |

### 1.3 缺失功能清单（需要开发）

| 功能 | 优先级 | 预估工时 |
|------|--------|---------|
| **订阅管理系统** | P0 | 5 天 |
| **支付系统集成** | P0 | 4 天 |
| **AI 买卖信号** | P0 | 10 天 |
| **潜力币发现** | P0 | 7 天 |
| **投资组合跟踪** | P1 | 7 天 |
| **高级图表** | P1 | 8 天 |
| **历史数据与回测** | P1 | 5 天 |
| **用户等级/权限系统** | P0 | 4 天 |
| **通知系统增强** | P1 | 3 天 |
| **API 访问控制** | P2 | 3 天 |

---

## 二、数据库设计

### 2.1 新增数据表

#### 表 1: subscriptions（订阅表）

```sql
CREATE TABLE subscriptions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    plan_type ENUM('free', 'pro', 'elite') NOT NULL DEFAULT 'free',
    status ENUM('active', 'cancelled', 'expired', 'trial') NOT NULL DEFAULT 'free',
    stripe_subscription_id VARCHAR(255),
    crypto_payment_id VARCHAR(255),
    trial_start_at DATETIME,
    trial_end_at DATETIME,
    current_period_start DATETIME,
    current_period_end DATETIME,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancelled_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_plan_type (plan_type),
    INDEX idx_period_end (current_period_end)
);
```

#### 表 2: subscription_payments（支付记录表）

```sql
CREATE TABLE subscription_payments (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    subscription_id VARCHAR(36) NOT NULL,
    payment_type ENUM('stripe', 'crypto') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    crypto_currency VARCHAR(20),
    crypto_amount DECIMAL(18, 8),
    stripe_payment_intent_id VARCHAR(255),
    crypto_transaction_hash VARCHAR(255),
    status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL,
    payment_date DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_subscription_id (subscription_id),
    INDEX idx_status (status),
    INDEX idx_payment_date (payment_date)
);
```

#### 表 3: ai_signals（AI 信号表）

```sql
CREATE TABLE ai_signals (
    id VARCHAR(36) PRIMARY KEY,
    crypto_id INT NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    signal_type ENUM('strong_buy', 'buy', 'hold', 'sell', 'strong_sell') NOT NULL,
    confidence DECIMAL(5, 2) NOT NULL,
    current_price DECIMAL(18, 8) NOT NULL,
    target_price DECIMAL(18, 8),
    stop_loss_price DECIMAL(18, 8),
    time_frame VARCHAR(20) DEFAULT '7d',
    technical_score DECIMAL(5, 2),
    onchain_score DECIMAL(5, 2),
    sentiment_score DECIMAL(5, 2),
    fundamentals_score DECIMAL(5, 2),
    reasoning TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    triggered_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_crypto_id (crypto_id),
    INDEX idx_symbol (symbol),
    INDEX idx_signal_type (signal_type),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
);
```

#### 表 4: coin_recommendations（潜力币推荐表）

```sql
CREATE TABLE coin_recommendations (
    id VARCHAR(36) PRIMARY KEY,
    crypto_id INT NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    recommendation_score DECIMAL(5, 2) NOT NULL,
    current_price DECIMAL(18, 8) NOT NULL,
    target_price DECIMAL(18, 8),
    potential_upside DECIMAL(10, 2),
    time_window VARCHAR(20),
    confidence_level DECIMAL(5, 2),
    technical_factors TEXT,
    fundamental_factors TEXT,
    onchain_factors TEXT,
    sentiment_factors TEXT,
    risk_factors TEXT,
    category ENUM('defi', 'layer1', 'layer2', 'meme', 'gaming', 'ai', 'other'),
    market_cap_tier ENUM('large', 'mid', 'small', 'micro'),
    is_active BOOLEAN DEFAULT TRUE,
    published_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_crypto_id (crypto_id),
    INDEX idx_score (recommendation_score),
    INDEX idx_category (category),
    INDEX idx_published_date (published_date),
    INDEX idx_is_active (is_active)
);
```

#### 表 5: user_portfolios（用户投资组合表）

```sql
CREATE TABLE user_portfolios (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    crypto_id INT NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    amount DECIMAL(18, 8) NOT NULL,
    average_buy_price DECIMAL(18, 8),
    current_price DECIMAL(18, 8),
    total_value_usd DECIMAL(18, 2),
    unrealized_pnl DECIMAL(18, 2),
    unrealized_pnl_percent DECIMAL(10, 2),
    exchange VARCHAR(50),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_crypto_id (crypto_id),
    UNIQUE KEY uniq_user_crypto (user_id, crypto_id, exchange)
);
```

#### 表 6: portfolio_transactions（投资组合交易记录表）

```sql
CREATE TABLE portfolio_transactions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    portfolio_id VARCHAR(36) NOT NULL,
    crypto_id INT NOT NULL,
    transaction_type ENUM('buy', 'sell', 'transfer_in', 'transfer_out') NOT NULL,
    amount DECIMAL(18, 8) NOT NULL,
    price_per_unit DECIMAL(18, 8) NOT NULL,
    total_value_usd DECIMAL(18, 2) NOT NULL,
    fee DECIMAL(18, 8),
    exchange VARCHAR(50),
    transaction_hash VARCHAR(255),
    notes TEXT,
    transaction_date DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_portfolio_id (portfolio_id),
    INDEX idx_transaction_date (transaction_date)
);
```

#### 表 7: user_subscription_features（用户功能使用限额表）

```sql
CREATE TABLE user_subscription_features (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    plan_type ENUM('free', 'pro', 'elite') NOT NULL DEFAULT 'free',
    price_alerts_used INT DEFAULT 0,
    price_alerts_limit INT DEFAULT 5,
    favorites_used INT DEFAULT 0,
    favorites_limit INT DEFAULT 20,
    ai_signals_access BOOLEAN DEFAULT FALSE,
    recommendations_access BOOLEAN DEFAULT FALSE,
    portfolio_access BOOLEAN DEFAULT FALSE,
    advanced_charts_access BOOLEAN DEFAULT FALSE,
    api_access BOOLEAN DEFAULT FALSE,
    vip_group_access BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_plan_type (plan_type)
);
```

### 2.2 数据库迁移脚本

创建文件：`/root/.openclaw/workspace/CryptoNiche-server/sql/migration_subscription.sql`

---

## 三、后端开发任务

### 3.1 第一优先级（Week 1-2）

#### 任务 1: 订阅管理系统

**文件清单**:
```
internal/logic/subscription/
├── create_subscription_logic.go      # 创建订阅
├── cancel_subscription_logic.go      # 取消订阅
├── get_subscription_logic.go         # 获取订阅状态
├── update_subscription_logic.go      # 更新订阅
├── check_subscription_logic.go       # 检查订阅权限
└── subscription_list_logic.go        # 订阅列表（管理员）

internal/handler/subscription/
├── create_subscription_handler.go
├── cancel_subscription_handler.go
├── get_subscription_handler.go
├── update_subscription_handler.go
└── check_subscription_handler.go

internal/dao/subscription/
├── subscription.go
├── subscription_dao.go
└── subscription_dao_test.go
```

**API 端点**:
```go
// API 定义 (api/subscription.api)
type CreateSubscriptionReq {
    UserID       string `json:"user_id"`
    PlanType     string `json:"plan_type"`  // free, pro, elite
    PaymentType  string `json:"payment_type"`  // stripe, crypto
    TrialDays    int    `json:"trial_days,optional"`
}

type CreateSubscriptionReply {
    SubscriptionID string `json:"subscription_id"`
    ClientSecret   string `json:"client_secret"`  // Stripe
    PaymentAddress string `json:"payment_address"`  // Crypto
    TrialEndAt     string `json:"trial_end_at"`
}

type GetSubscriptionReply {
    UserID           string `json:"user_id"`
    PlanType         string `json:"plan_type"`
    Status           string `json:"status"`
    CurrentPeriodStart string `json:"current_period_start"`
    CurrentPeriodEnd   string `json:"current_period_end"`
    TrialEndAt       string `json:"trial_end_at,optional"`
    Features         SubscriptionFeatures `json:"features"`
}

type SubscriptionFeatures {
    PriceAlertsLimit    int  `json:"price_alerts_limit"`
    FavoritesLimit      int  `json:"favorites_limit"`
    AISignalsAccess     bool `json:"ai_signals_access"`
    RecommendationsAccess bool `json:"recommendations_access"`
    PortfolioAccess     bool `json:"portfolio_access"`
    AdvancedChartsAccess bool `json:"advanced_charts_access"`
    APIAccess           bool `json:"api_access"`
    VIPGroupAccess      bool `json:"vip_group_access"`
}
```

**工时**: 3 天

---

#### 任务 2: 支付系统集成

**2.1 Stripe 集成**

**文件清单**:
```
internal/svc/stripe_client.go          # Stripe 客户端封装
internal/logic/payment/
├── create_stripe_payment_logic.go     # 创建 Stripe 支付
├── handle_stripe_webhook_logic.go     # 处理 Stripe 回调
└── verify_payment_logic.go            # 验证支付状态
```

**配置项** (etc/subscription-api.yaml):
```yaml
Stripe:
  SecretKey: "${STRIPE_SECRET_KEY}"
  PublishableKey: "${STRIPE_PUBLISHABLE_KEY}"
  WebhookSecret: "${STRIPE_WEBHOOK_SECRET}"
  Plans:
    Pro:
      MonthlyPriceID: "price_xxx"
      YearlyPriceID: "price_yyy"
    Elite:
      MonthlyPriceID: "price_aaa"
      YearlyPriceID: "price_bbb"
```

**工时**: 2 天

---

**2.2 加密货币支付集成**

**文件清单**:
```
internal/svc/
├── coinbase_commerce_client.go        # Coinbase Commerce 客户端
└── nowpayments_client.go              # NOWPayments 客户端（备用）

internal/logic/payment/
├── create_crypto_payment_logic.go     # 创建加密货币支付
├── verify_crypto_payment_logic.go     # 验证加密货币支付
└── handle_crypto_webhook_logic.go     # 处理加密货币回调
```

**配置项**:
```yaml
CryptoPayment:
  CoinbaseCommerce:
    APIKey: "${COINBASE_COMMERCE_API_KEY}"
    WebhookSecret: "${COINBASE_WEBHOOK_SECRET}"
  NOWPayments:
    APIKey: "${NOWPAYMENTS_API_KEY}"
    WebhookSecret: "${NOWPAYMENTS_WEBHOOK_SECRET}"
  SupportedCoins:
    - USDT
    - USDC
    - BTC
    - ETH
    - SOL
    - BNB
```

**工时**: 2 天

---

#### 任务 3: 用户权限系统

**文件清单**:
```
internal/logic/subscription/
├── check_feature_access_logic.go      # 检查功能访问权限
├── increment_usage_logic.go           # 增加使用计数
└── reset_usage_logic.go               # 重置使用计数

internal/middleware/subscription.go     # 订阅中间件
```

**中间件实现**:
```go
// SubscriptionMiddleware 检查用户订阅状态
func SubscriptionMiddleware(requiredPlan string) func(next http.HandlerFunc) http.HandlerFunc {
    return func(next http.HandlerFunc) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
            // 获取用户 ID
            userID := util.GetUidFromCtx(r.Context())
            
            // 检查订阅状态
            svcCtx := svc.NewServiceContext()
            logic := subscription.NewCheckSubscriptionLogic(r.Context(), svcCtx)
            subscription, err := logic.GetSubscription(userID)
            
            if err != nil || !hasAccess(subscription, requiredPlan) {
                // 返回权限不足错误
                httpx.ErrorCtx(r.Context(), w, errors.New("subscription required"))
                return
            }
            
            next(w, r)
        }
    }
}
```

**工时**: 2 天

---

### 3.2 第二优先级（Week 3-4）

#### 任务 4: AI 买卖信号系统

**4.1 信号生成引擎**

**文件清单**:
```
internal/service/ai/
├── signal_engine.go                   # 信号引擎主逻辑
├── technical_analysis.go              # 技术分析
├── onchain_analysis.go                # 链上分析
├── sentiment_analysis.go              # 情绪分析
├── fundamentals_analysis.go           # 基本面分析
└── signal_scorer.go                   # 信号评分

internal/logic/signal/
├── generate_signals_logic.go          # 生成信号
├── get_signal_logic.go                # 获取单个信号
├── list_signals_logic.go              # 获取信号列表
└── signal_history_logic.go            # 信号历史
```

**信号生成逻辑**:
```go
type SignalEngine struct {
    technicalAnalyzer  *TechnicalAnalyzer
    onchainAnalyzer    *OnchainAnalyzer
    sentimentAnalyzer  *SentimentAnalyzer
    fundamentalsAnalyzer *FundamentalsAnalyzer
}

func (e *SignalEngine) GenerateSignal(cryptoID int64) (*Signal, error) {
    // 1. 技术分析 (权重 30%)
    techScore := e.technicalAnalyzer.Analyze(cryptoID)
    
    // 2. 链上分析 (权重 25%)
    onchainScore := e.onchainAnalyzer.Analyze(cryptoID)
    
    // 3. 情绪分析 (权重 20%)
    sentimentScore := e.sentimentAnalyzer.Analyze(cryptoID)
    
    // 4. 基本面分析 (权重 25%)
    fundamentalsScore := e.fundamentalsAnalyzer.Analyze(cryptoID)
    
    // 计算综合评分
    totalScore := techScore*0.30 + onchainScore*0.25 + sentimentScore*0.20 + fundamentalsScore*0.25
    
    // 生成信号
    signal := &Signal{
        CryptoID: cryptoID,
        SignalType: determineSignalType(totalScore),
        Confidence: calculateConfidence(totalScore),
        TargetPrice: calculateTargetPrice(cryptoID, totalScore),
        StopLossPrice: calculateStopLoss(cryptoID, totalScore),
        Reasoning: generateReasoning(techScore, onchainScore, sentimentScore, fundamentalsScore),
    }
    
    return signal, nil
}
```

**技术分析实现**:
```go
type TechnicalAnalyzer struct {
    // RSI, MACD, 布林带等指标
}

func (a *TechnicalAnalyzer) Analyze(cryptoID int64) float64 {
    // 获取价格数据
    prices := a.getPriceHistory(cryptoID, 90)
    
    // 计算 RSI
    rsi := a.calculateRSI(prices, 14)
    rsiScore := a.scoreRSI(rsi)
    
    // 计算 MACD
    macd := a.calculateMACD(prices)
    macdScore := a.scoreMACD(macd)
    
    // 计算布林带
    bollinger := a.calculateBollingerBands(prices)
    bollingerScore := a.scoreBollinger(bollinger)
    
    // 综合评分
    return (rsiScore + macdScore + bollingerScore) / 3
}
```

**工时**: 6 天

---

**4.2 信号 API**

**API 端点**:
```go
// api/signal.api
type GetAISignalReq struct {
    CmcID int64 `path:"cmc_id"`
}

type GetAISignalReply {
    SignalID      string  `json:"signal_id"`
    Symbol        string  `json:"symbol"`
    SignalType    string  `json:"signal_type"`  // strong_buy, buy, hold, sell, strong_sell
    Confidence    float64 `json:"confidence"`
    CurrentPrice  float64 `json:"current_price"`
    TargetPrice   float64 `json:"target_price"`
    StopLossPrice float64 `json:"stop_loss_price"`
    TimeFrame     string  `json:"time_frame"`
    Reasoning     string  `json:"reasoning"`
    UpdatedAt     string  `json:"updated_at"`
}

type ListSignalsReq struct {
    SignalType string `form:"signal_type,optional"`
    MinConfidence float64 `form:"min_confidence,optional"`
    Page       int    `form:"page,optional,default=1"`
    PageSize   int    `form:"page_size,optional,default=20"`
}

type ListSignalsReply {
    Items    []AISignal `json:"items"`
    Total    int64      `json:"total"`
    Page     int        `json:"page"`
    PageSize int        `json:"page_size"`
}
```

**工时**: 2 天

---

#### 任务 5: 潜力币发现系统

**文件清单**:
```
internal/service/recommendation/
├── recommendation_engine.go             # 推荐引擎
├── scanner.go                          # 全市场扫描
└── ranker.go                           # 排序算法

internal/logic/recommendation/
├── generate_recommendations_logic.go   # 生成推荐
├── get_recommendations_logic.go        # 获取推荐列表
├── get_recommendation_detail_logic.go  # 获取推荐详情
└── track_performance_logic.go          # 跟踪表现
```

**推荐引擎**:
```go
type RecommendationEngine struct {
    scanner  *MarketScanner
    ranker   *Ranker
}

func (e *RecommendationEngine) GenerateDailyRecommendations() ([]Recommendation, error) {
    // 1. 扫描全市场
    coins := e.scanner.ScanAllCoins()
    
    // 2. 筛选候选
    candidates := e.filterCandidates(coins)
    
    // 3. 评分排序
    scored := e.ranker.ScoreAndRank(candidates)
    
    // 4. 选择 Top 5
    top5 := scored[:5]
    
    // 5. 生成推荐详情
    recommendations := e.generateDetails(top5)
    
    return recommendations, nil
}
```

**评分维度**:
```go
type ScoringCriteria struct {
    TechnicalWeight    float64 // 30%
    FundamentalWeight  float64 // 25%
    OnchainWeight      float64 // 20%
    SentimentWeight    float64 // 15%
    MomentumWeight     float64 // 10%
}

func (r *Ranker) Score(coin Coin) float64 {
    score := 0.0
    
    // 技术面 (30%)
    score += r.scoreTechnical(coin) * 0.30
    
    // 基本面 (25%)
    score += r.scoreFundamental(coin) * 0.25
    
    // 链上数据 (20%)
    score += r.scoreOnchain(coin) * 0.20
    
    // 情绪面 (15%)
    score += r.scoreSentiment(coin) * 0.15
    
    // 动量 (10%)
    score += r.scoreMomentum(coin) * 0.10
    
    return score
}
```

**工时**: 5 天

---

### 3.3 第三优先级（Week 5-6）

#### 任务 6: 投资组合跟踪

**文件清单**:
```
internal/logic/portfolio/
├── create_portfolio_logic.go           # 创建持仓
├── update_portfolio_logic.go           # 更新持仓
├── delete_portfolio_logic.go           # 删除持仓
├── list_portfolio_logic.go             # 获取持仓列表
├── add_transaction_logic.go            # 添加交易记录
├── get_performance_logic.go            # 获取收益表现
└── get_allocation_logic.go             # 获取持仓分布
```

**API 端点**:
```go
// api/portfolio.api
type CreatePortfolioReq struct {
    CryptoID      int64   `json:"crypto_id"`
    Symbol        string  `json:"symbol"`
    Amount        float64 `json:"amount"`
    AverageBuyPrice float64 `json:"average_buy_price"`
    Exchange      string  `json:"exchange,optional"`
}

type GetPortfolioPerformanceReply struct {
    TotalValue      float64 `json:"total_value"`
    TotalCost       float64 `json:"total_cost"`
    TotalPnL        float64 `json:"total_pnl"`
    TotalPnLPercent float64 `json:"total_pnl_percent"`
    BestPerformer   Holding `json:"best_performer"`
    WorstPerformer  Holding `json:"worst_performer"`
    DailyPnL        float64 `json:"daily_pnl"`
    WeeklyPnL       float64 `json:"weekly_pnl"`
    MonthlyPnL      float64 `json:"monthly_pnl"`
}
```

**工时**: 5 天

---

#### 任务 7: 通知系统增强

**文件清单**:
```
internal/service/notification/
├── notification_service.go             # 通知服务
├── email_sender.go                     # 邮件发送
├── telegram_sender.go                  # Telegram Bot 发送
├── sms_sender.go                       # 短信发送
└── push_sender.go                      # 推送通知
```

**通知类型**:
- 价格提醒触发
- AI 信号变化
- 订阅到期提醒
- 投资组合重大变化

**工时**: 3 天

---

### 3.4 第四优先级（Week 7-8）

#### 任务 8: 高级图表

**方案**: 集成 TradingView Lightweight Charts 或 Recharts 增强版

**前端组件**:
```
components/charting/
├── advanced-price-chart.tsx            # 高级价格图表
├── technical-indicators.tsx            # 技术指标
├── drawing-tools.tsx                   # 画线工具
└── pattern-recognition.tsx             # 形态识别
```

**工时**: 6 天

---

#### 任务 9: 历史数据与回测

**文件清单**:
```
internal/logic/backtest/
├── run_backtest_logic.go               # 运行回测
├── get_backtest_results_logic.go       # 获取回测结果
└── save_strategy_logic.go              # 保存策略
```

**工时**: 4 天

---

#### 任务 10: API 访问控制

**文件清单**:
```
internal/middleware/api_rate_limit.go   # API 限流
internal/logic/api/
├── generate_api_key_logic.go           # 生成 API Key
├── revoke_api_key_logic.go             # 撤销 API Key
└── get_usage_stats_logic.go            # 获取使用统计
```

**工时**: 3 天

---

## 四、前端开发任务

### 4.1 第一优先级（Week 1-2）

#### 任务 1: 订阅页面

**文件清单**:
```
src/app/
├── pricing/
│   └── page.tsx                        # 定价页面
├── subscription/
│   ├── page.tsx                        # 订阅管理页面
│   └── success/
│       └── page.tsx                    # 订阅成功页面
└── api/
    └── v1/
        └── subscription/
            └── route.ts                # 订阅 API 代理
```

**定价页面设计**:
```tsx
// src/app/pricing/page.tsx
export default function PricingPage() {
  return (
    <div>
      <h1>Choose Your Plan</h1>
      
      {/* Free Plan */}
      <PricingCard
        name="Free"
        price="$0"
        features={[
          "5 price alerts/month",
          "20 favorites",
          "Basic market data",
          "7-day history"
        ]}
        cta="Get Started"
      />
      
      {/* Pro Plan */}
      <PricingCard
        name="Pro"
        price="$39"
        period="/month"
        features={[
          "Unlimited price alerts",
          "Unlimited favorites",
          "AI trading signals",
          "Coin recommendations",
          "Portfolio tracking",
          "Advanced charts",
          "1-year history"
        ]}
        cta="Start 7-Day Free Trial"
        popular
      />
      
      {/* Elite Plan */}
      <PricingCard
        name="Elite"
        price="$99"
        period="/month"
        features={[
          "All Pro features",
          "API access",
          "VIP Telegram group",
          "Priority support",
          "Early feature access",
          "Unlimited history"
        ]}
        cta="Start 7-Day Free Trial"
      />
    </div>
  );
}
```

**工时**: 3 天

---

#### 任务 2: 支付集成

**文件清单**:
```
src/app/
├── checkout/
│   └── page.tsx                        # 结账页面
└── api/
    └── v1/
        └── payment/
            ├── stripe/route.ts         # Stripe 支付
            └── crypto/route.ts         # 加密货币支付

components/payment/
├── stripe-checkout.tsx                 # Stripe 结账组件
├── crypto-checkout.tsx                 # 加密货币结账组件
└── payment-method-selector.tsx         # 支付方式选择
```

**Stripe 集成**:
```tsx
// components/payment/stripe-checkout.tsx
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function StripeCheckout({ priceId, onSuccess }) {
  const handleCheckout = async () => {
    const stripe = await stripePromise;
    
    // 创建 Checkout Session
    const response = await fetch('/api/v1/payment/stripe', {
      method: 'POST',
      body: JSON.stringify({ price_id: priceId }),
    });
    
    const session = await response.json();
    
    // 重定向到 Stripe
    await stripe.redirectToCheckout({ sessionId: session.id });
  };
  
  return <Button onClick={handleCheckout}>Subscribe with Stripe</Button>;
}
```

**加密货币支付集成**:
```tsx
// components/payment/crypto-checkout.tsx
export function CryptoCheckout({ amount, currency, onSuccess }) {
  const [paymentData, setPaymentData] = useState(null);
  
  useEffect(() => {
    // 创建加密货币支付订单
    fetch('/api/v1/payment/crypto', {
      method: 'POST',
      body: JSON.stringify({ amount, currency }),
    })
      .then(res => res.json())
      .then(data => setPaymentData(data));
  }, []);
  
  return (
    <div>
      <p>Send {paymentData?.crypto_amount} {paymentData?.crypto_currency}</p>
      <p>to: {paymentData?.payment_address}</p>
      <QRCode value={paymentData?.payment_address} />
    </div>
  );
}
```

**工时**: 3 天

---

#### 任务 3: 权限管理 Hooks

**文件清单**:
```
lib/hooks/
├── use-subscription.ts                 # 订阅状态 Hook
├── use-feature-access.ts               # 功能访问 Hook
└── use-usage-limit.ts                  # 使用限额 Hook
```

**实现**:
```tsx
// lib/hooks/use-subscription.ts
export function useSubscription() {
  const { data: subscription, isLoading } = useSWR('/api/v1/subscription', fetcher);
  
  return {
    subscription,
    isLoading,
    isPro: subscription?.plan_type === 'pro',
    isElite: subscription?.plan_type === 'elite',
    isFree: subscription?.plan_type === 'free',
    isActive: subscription?.status === 'active',
    isInTrial: subscription?.status === 'trial',
  };
}

// lib/hooks/use-feature-access.ts
export function useFeatureAccess(feature: string) {
  const { subscription } = useSubscription();
  
  const hasAccess = useMemo(() => {
    if (!subscription) return false;
    
    switch (feature) {
      case 'ai_signals':
        return subscription.features.ai_signals_access;
      case 'recommendations':
        return subscription.features.recommendations_access;
      case 'portfolio':
        return subscription.features.portfolio_access;
      case 'advanced_charts':
        return subscription.features.advanced_charts_access;
      case 'api':
        return subscription.features.api_access;
      default:
        return true;
    }
  }, [subscription, feature]);
  
  return hasAccess;
}
```

**工时**: 2 天

---

### 4.2 第二优先级（Week 3-4）

#### 任务 4: AI 信号展示组件

**文件清单**:
```
components/signals/
├── signal-card.tsx                     # 信号卡片
├── signal-list.tsx                     # 信号列表
├── signal-detail.tsx                   # 信号详情
├── signal-filter.tsx                   # 信号筛选
└── signal-accuracy.tsx                 # 信号准确率统计

src/app/
└── signals/
    ├── page.tsx                        # 信号页面
    └── [symbol]/
        └── page.tsx                    # 单个信号详情
```

**信号卡片组件**:
```tsx
// components/signals/signal-card.tsx
interface SignalCardProps {
  symbol: string;
  signalType: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: number;
  currentPrice: number;
  targetPrice: number;
  stopLossPrice: number;
  updatedAt: string;
}

export function SignalCard({ signal }: SignalCardProps) {
  const signalColors = {
    strong_buy: 'text-green-600 bg-green-100',
    buy: 'text-green-500 bg-green-50',
    hold: 'text-yellow-600 bg-yellow-100',
    sell: 'text-red-500 bg-red-50',
    strong_sell: 'text-red-600 bg-red-100',
  };
  
  return (
    <Card>
      <CardContent>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">{signal.symbol}</h3>
            <Badge className={signalColors[signal.signalType]}>
              {signal.signalType.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Confidence</p>
            <p className="text-2xl font-bold">{signal.confidence}%</p>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Current Price</p>
            <p className="font-semibold">${signal.currentPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Target</p>
            <p className="font-semibold text-green-600">${signal.targetPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Stop Loss</p>
            <p className="font-semibold text-red-600">${signal.stopLossPrice.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**工时**: 4 天

---

#### 任务 5: 潜力币推荐组件

**文件清单**:
```
components/recommendations/
├── recommendation-card.tsx             # 推荐卡片
├── recommendation-list.tsx             # 推荐列表
├── recommendation-detail.tsx           # 推荐详情
└── score-breakdown.tsx                 # 评分分解

src/app/
└── recommendations/
    ├── page.tsx                        # 推荐页面
    └── [symbol]/
        └── page.tsx                    # 单个推荐详情
```

**推荐卡片**:
```tsx
// components/recommendations/recommendation-card.tsx
export function RecommendationCard({ recommendation }) {
  return (
    <Card>
      <CardContent>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">{recommendation.symbol}</h3>
            <p className="text-sm text-muted-foreground">{recommendation.name}</p>
          </div>
          <Badge variant="default">
            Score: {recommendation.recommendation_score}/100
          </Badge>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between">
            <span>Current Price</span>
            <span>${recommendation.current_price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Target Price</span>
            <span className="text-green-600">${recommendation.target_price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Potential Upside</span>
            <span className="text-green-600">+{recommendation.potential_upside}%</span>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-xs text-muted-foreground">Time Window</p>
          <p className="font-semibold">{recommendation.time_window}</p>
        </div>
      </CardContent>
    </Card>
  );
}
```

**工时**: 3 天

---

### 4.3 第三优先级（Week 5-6）

#### 任务 6: 投资组合组件

**文件清单**:
```
components/portfolio/
├── portfolio-overview.tsx              # 投资组合概览
├── holding-card.tsx                    # 持仓卡片
├── holding-list.tsx                    # 持仓列表
├── add-holding-form.tsx                # 添加持仓表单
├── performance-chart.tsx               # 收益图表
└── allocation-chart.tsx                # 持仓分布图

src/app/
└── portfolio/
    ├── page.tsx                        # 投资组合页面
    └── performance/
        └── page.tsx                    # 收益表现页面
```

**工时**: 5 天

---

#### 任务 7: 付费墙组件

**文件清单**:
```
components/paywall/
├── soft-paywall.tsx                    # 软付费墙
├── feature-lock.tsx                    # 功能锁定提示
├── upgrade-prompt.tsx                  # 升级提示
└── trial-banner.tsx                    # 试用横幅
```

**软付费墙组件**:
```tsx
// components/paywall/soft-paywall.tsx
export function SoftPaywall({ feature, onUpgrade }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center py-8">
        <Lock className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold mb-2">{feature} is a Pro Feature</h3>
        <p className="text-muted-foreground text-center mb-6">
          Upgrade to Pro to access this feature and more.
        </p>
        <Button onClick={onUpgrade} size="lg">
          Start 7-Day Free Trial
        </Button>
      </CardContent>
    </Card>
  );
}
```

**工时**: 2 天

---

## 五、资源需求

### 5.1 人力资源

| 角色 | 人数 | 工时 | 职责 |
|------|------|------|------|
| **后端开发** | 1-2 人 | 8 周 | Go API 开发、数据库设计、支付集成 |
| **前端开发** | 1 人 | 6 周 | React 组件、页面、Hooks |
| **AI/算法** | 1 人 | 4 周 | 信号算法、推荐算法 |
| **UI/UX 设计** | 0.5 人 | 2 周 | 付费页面、组件设计 |
| **测试** | 0.5 人 | 3 周 | 功能测试、集成测试 |

**总计**: 4-5 人，8 周

### 5.2 第三方服务

| 服务 | 用途 | 成本 |
|------|------|------|
| **Stripe** | 信用卡支付 | 2.9% + $0.30/笔 |
| **Coinbase Commerce** | 加密货币支付 | 1%/笔 |
| **Telegram Bot API** | 通知推送 | 免费 |
| **SendGrid** | 邮件发送 | 免费 (100 封/天) |
| **Twilio** | 短信通知 | $0.0075/条 |

### 5.3 数据源

| 数据源 | 用途 | 成本 |
|--------|------|------|
| **CoinMarketCap API** | 基础价格数据 | 免费/$99+/月 |
| **CoinGecko API** | 备用价格数据 | 免费/$129+/月 |
| **链上数据 API** | 链上分析 | $200-500/月 |
| **社交媒体 API** | 情绪分析 | $100-300/月 |

---

## 六、时间计划

### 6.1 总体时间线

```
Week 1-2: 订阅管理 + 支付系统 + 权限系统
Week 3-4: AI 信号 + 潜力币推荐
Week 5-6: 投资组合 + 通知系统
Week 7-8: 高级图表 + 回测 + API 访问
```

### 6.2 详细里程碑

| 里程碑 | 日期 | 交付物 |
|--------|------|--------|
| **M1: 数据库设计完成** | Week 1 Day 2 | 迁移脚本、ER 图 |
| **M2: 订阅系统完成** | Week 2 Day 3 | 订阅 API、管理页面 |
| **M3: 支付集成完成** | Week 2 Day 5 | Stripe+ 加密货币支付 |
| **M4: AI 信号完成** | Week 4 Day 2 | 信号生成、展示页面 |
| **M5: 推荐系统完成** | Week 4 Day 5 | 推荐引擎、推荐页面 |
| **M6: 投资组合完成** | Week 6 Day 3 | 持仓管理、收益图表 |
| **M7: 全部功能完成** | Week 8 Day 3 | 所有功能开发完成 |
| **M8: 测试完成** | Week 8 Day 5 | 测试报告、Bug 修复 |
| **M9: 上线发布** | Week 9 Day 1 | 生产环境部署 |

### 6.3 每周详细计划

#### Week 1: 订阅系统基础

| Day | 任务 | 负责人 | 交付物 |
|-----|------|--------|--------|
| 1 | 数据库设计评审 | 后端 | ER 图、迁移脚本 |
| 2-3 | 订阅表 CRUD | 后端 | subscription DAO |
| 4-5 | 订阅 API 开发 | 后端 | 订阅相关 API |

#### Week 2: 支付集成

| Day | 任务 | 负责人 | 交付物 |
|-----|------|--------|--------|
| 1-2 | Stripe 集成 | 后端 | Stripe 支付 API |
| 3-4 | 加密货币支付集成 | 后端 | 加密货币支付 API |
| 5 | 定价页面 | 前端 | pricing page |

#### Week 3: AI 信号开发

| Day | 任务 | 负责人 | 交付物 |
|-----|------|--------|--------|
| 1-2 | 技术分析模块 | AI/后端 | technical_analysis.go |
| 3-4 | 信号生成引擎 | AI/后端 | signal_engine.go |
| 5 | 信号展示组件 | 前端 | signal-card.tsx |

#### Week 4: 推荐系统开发

| Day | 任务 | 负责人 | 交付物 |
|-----|------|--------|--------|
| 1-2 | 推荐引擎 | AI/后端 | recommendation_engine.go |
| 3-4 | 全市场扫描 | AI/后端 | scanner.go |
| 5 | 推荐展示组件 | 前端 | recommendation-card.tsx |

#### Week 5: 投资组合开发

| Day | 任务 | 负责人 | 交付物 |
|-----|------|--------|--------|
| 1-2 | 持仓管理 API | 后端 | portfolio logic |
| 3-4 | 收益计算 | 后端 | performance logic |
| 5 | 投资组合页面 | 前端 | portfolio page |

#### Week 6: 通知系统 + 付费墙

| Day | 任务 | 负责人 | 交付物 |
|-----|------|--------|--------|
| 1-2 | 通知服务 | 后端 | notification service |
| 3-4 | 付费墙组件 | 前端 | paywall components |
| 5 | 集成测试 | 测试 | 测试报告 |

#### Week 7: 高级功能

| Day | 任务 | 负责人 | 交付物 |
|-----|------|--------|--------|
| 1-3 | 高级图表 | 前端 | advanced charts |
| 4-5 | 回测功能 | 后端 | backtest logic |

#### Week 8: 测试与修复

| Day | 任务 | 负责人 | 交付物 |
|-----|------|--------|--------|
| 1-3 | 全面测试 | 测试 | Bug 列表 |
| 4-5 | Bug 修复 | 开发 | 修复版本 |

---

## 七、风险与应对

### 7.1 技术风险

| 风险 | 概率 | 影响 | 应对方案 |
|------|------|------|---------|
| AI 信号准确率低 | 高 | 高 | 人工审核 + 持续优化 + 明确免责声明 |
| 支付集成复杂 | 中 | 高 | 优先 Stripe，加密货币支付简化版先行 |
| 性能问题 | 中 | 中 | 数据库索引优化 + 缓存层 |
| 数据源 API 限制 | 中 | 中 | 多数据源备份 + 本地缓存 |

### 7.2 项目风险

| 风险 | 概率 | 影响 | 应对方案 |
|------|------|------|---------|
| 开发延期 | 高 | 高 | 敏捷开发 + 优先级管理 + 外包备选 |
| 人员不足 | 中 | 高 | 外包部分功能 + 调整优先级 |
| 需求变更 | 中 | 中 | 冻结核心需求 + 变更控制流程 |

### 7.3 商业风险

| 风险 | 概率 | 影响 | 应对方案 |
|------|------|------|---------|
| 付费转化率低 | 高 | 高 | A/B 测试 + 优化付费墙 + 调整定价 |
| 合规问题 | 中 | 高 | 明确免责声明 + 法律顾问咨询 |

---

## 八、质量保障

### 8.1 测试策略

| 测试类型 | 覆盖率目标 | 工具 |
|---------|-----------|------|
| 单元测试 | 80%+ | Go testing, Jest |
| 集成测试 | 关键路径 100% | Go testing, Playwright |
| E2E 测试 | 核心流程 100% | Playwright |
| 性能测试 | API <200ms | k6, wrk |

### 8.2 代码审查

- 所有 PR 需要至少 1 人审查
- 核心功能需要 2 人审查
- 使用 GitHub PR 流程

### 8.3 监控与告警

- Sentry 错误追踪
- Prometheus + Grafana 性能监控
- 自定义业务指标监控

---

## 九、上线检查清单

### 9.1 技术检查

- [ ] 所有功能测试通过
- [ ] 性能测试达标
- [ ] 安全审计完成
- [ ] 数据库备份配置
- [ ] 监控告警配置
- [ ] 错误追踪配置

### 9.2 业务检查

- [ ] 支付流程测试通过
- [ ] 订阅流程测试通过
- [ ] 邮件模板配置
- [ ] 客服培训完成
- [ ] 文档完善

### 9.3 法律检查

- [ ] 服务条款更新
- [ ] 隐私政策更新
- [ ] 免责声明添加
- [ ] 支付合规审查

---

## 十、总结

### 10.1 核心交付物

| 类别 | 数量 | 说明 |
|------|------|------|
| **后端 API** | 25+ | 订阅、支付、信号、推荐、投资组合 |
| **前端页面** | 10+ | 定价、结账、信号、推荐、投资组合 |
| **前端组件** | 30+ | 信号卡片、推荐卡片、付费墙等 |
| **数据库表** | 7 | 订阅、支付、信号、推荐、投资组合 |

### 10.2 成功指标

| 指标 | 目标值 |
|------|--------|
| 开发周期 | 8 周 |
| Bug 数（上线时） | <10 个严重 Bug |
| 测试覆盖率 | 80%+ |
| API 响应时间 | <200ms |

### 10.3 下一步

1. **立即启动**: Week 1 任务（数据库设计、订阅系统）
2. **资源到位**: 确认开发人员、第三方服务账号
3. **环境准备**: 开发、测试、生产环境配置

---

**文档结束**

*本计划基于现有代码库分析制定，实际执行中需根据进度和反馈灵活调整。核心原则：快速迭代、优先级驱动、质量第一。*
