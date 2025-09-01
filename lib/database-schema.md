# 重新设计的数据库表结构

## 核心表结构

### 1. cryptocurrencies (加密货币基础信息)
```sql
CREATE TABLE cryptocurrencies (
  id BIGINT PRIMARY KEY,                    -- CoinMarketCap ID
  symbol TEXT NOT NULL,                     -- 符号 (BTC, ETH)
  name TEXT NOT NULL,                       -- 名称 (Bitcoin, Ethereum)
  slug TEXT,                                -- URL slug
  cmc_rank INTEGER,                         -- CMC排名
  num_market_pairs INTEGER,                 -- 市场交易对数量
  circulating_supply DECIMAL,               -- 流通供应量
  total_supply DECIMAL,                     -- 总供应量
  max_supply DECIMAL,                       -- 最大供应量
  ath DECIMAL,                              -- 历史最高价
  atl DECIMAL,                              -- 历史最低价
  date_added TIMESTAMPTZ,                   -- 添加日期
  is_active BOOLEAN DEFAULT true,           -- 是否活跃
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. crypto_prices (实时价格数据)
```sql
CREATE TABLE crypto_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crypto_id BIGINT REFERENCES cryptocurrencies(id),
  price_usd DECIMAL NOT NULL,               -- USD价格
  price_btc DECIMAL,                        -- BTC价格
  price_eth DECIMAL,                        -- ETH价格
  volume_24h DECIMAL,                       -- 24h交易量
  volume_7d DECIMAL,                        -- 7d交易量
  volume_30d DECIMAL,                       -- 30d交易量
  market_cap DECIMAL,                       -- 市值
  percent_change_1h DECIMAL,                -- 1h变化
  percent_change_24h DECIMAL,               -- 24h变化
  percent_change_7d DECIMAL,                -- 7d变化
  percent_change_30d DECIMAL,               -- 30d变化
  percent_change_60d DECIMAL,               -- 60d变化
  percent_change_90d DECIMAL,               -- 90d变化
  percent_change_1y DECIMAL,                -- 1y变化
  dominance DECIMAL,                        -- 市场占有率
  turnover DECIMAL,                         -- 换手率
  high_24h DECIMAL,                         -- 24h最高价
  low_24h DECIMAL,                          -- 24h最低价
  ytd_price_change_percentage DECIMAL,      -- 年初至今变化
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(crypto_id, timestamp)
);
```

### 3. price_history (价格历史数据 - 压缩存储)
```sql
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crypto_id BIGINT REFERENCES cryptocurrencies(id),
  price DECIMAL NOT NULL,
  volume DECIMAL,
  market_cap DECIMAL,
  timestamp TIMESTAMPTZ NOT NULL,
  interval_type TEXT DEFAULT 'realtime',    -- realtime, 1m, 5m, 1h, 1d
  
  INDEX idx_crypto_timestamp (crypto_id, timestamp),
  INDEX idx_interval_type (interval_type)
);
```

### 4. market_data (整体市场数据)
```sql
CREATE TABLE market_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_market_cap DECIMAL,                -- 总市值
  total_volume_24h DECIMAL,                 -- 24h总交易量
  btc_dominance DECIMAL,                    -- BTC市场占有率
  eth_dominance DECIMAL,                    -- ETH市场占有率
  active_cryptocurrencies INTEGER,          -- 活跃加密货币数量
  total_cryptocurrencies INTEGER,           -- 总加密货币数量
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. price_alerts (价格预警)
```sql
CREATE TABLE price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  crypto_id BIGINT REFERENCES cryptocurrencies(id),
  alert_type TEXT NOT NULL,                 -- price_threshold, percentage_change
  condition TEXT NOT NULL,                  -- above, below, change_up, change_down
  threshold_value DECIMAL NOT NULL,         -- 阈值
  current_price DECIMAL,                    -- 设置时的价格
  is_active BOOLEAN DEFAULT true,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. alert_logs (预警日志)
```sql
CREATE TABLE alert_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES price_alerts(id),
  crypto_id BIGINT REFERENCES cryptocurrencies(id),
  trigger_price DECIMAL NOT NULL,
  previous_price DECIMAL NOT NULL,
  price_change DECIMAL NOT NULL,
  notification_type TEXT,                   -- email, push, sms
  status TEXT DEFAULT 'pending',            -- pending, sent, failed
  error_message TEXT,
  triggered_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 索引优化

```sql
-- 价格查询优化
CREATE INDEX idx_crypto_prices_crypto_timestamp ON crypto_prices(crypto_id, timestamp DESC);
CREATE INDEX idx_crypto_prices_rank_timestamp ON crypto_prices(crypto_id, timestamp) WHERE crypto_id IN (SELECT id FROM cryptocurrencies WHERE cmc_rank <= 100);

-- 历史数据查询优化
CREATE INDEX idx_price_history_crypto_time ON price_history(crypto_id, timestamp DESC);
CREATE INDEX idx_price_history_interval ON price_history(interval_type, timestamp DESC);

-- 预警查询优化
CREATE INDEX idx_price_alerts_active ON price_alerts(is_active, crypto_id) WHERE is_active = true;
CREATE INDEX idx_alert_logs_status ON alert_logs(status, triggered_at) WHERE status = 'pending';
```