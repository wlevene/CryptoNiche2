-- =============================================
-- CryptoNiche 数据库 Schema
-- 基于 CoinMarketCap API 数据结构设计
-- 统一版本 - 包含所有必要的表和功能
-- =============================================

-- 删除现有表（如果存在）
DROP TABLE IF EXISTS public.alert_notifications CASCADE;
DROP TABLE IF EXISTS public.user_alerts CASCADE;
DROP TABLE IF EXISTS public.user_favorites CASCADE;
DROP TABLE IF EXISTS public.price_history CASCADE;
DROP TABLE IF EXISTS public.crypto_prices CASCADE;
DROP TABLE IF EXISTS public.market_data CASCADE;
DROP TABLE IF EXISTS public.cryptocurrencies CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- =============================================
-- 用户相关表
-- =============================================

-- 用户表（扩展 Supabase auth.users）
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 加密货币核心数据表
-- =============================================

-- 加密货币基础信息表
CREATE TABLE public.cryptocurrencies (
  id INTEGER PRIMARY KEY,                    -- CMC ID
  symbol TEXT NOT NULL,                      -- 符号 (BTC, ETH)
  name TEXT NOT NULL,                        -- 名称 (Bitcoin, Ethereum)
  slug TEXT,                                 -- URL slug (bitcoin, ethereum)
  cmc_rank INTEGER,                          -- CMC 排名
  market_pair_count INTEGER,                 -- 交易对数量
  circulating_supply DECIMAL(30, 8),        -- 流通供应量
  self_reported_circulating_supply DECIMAL(30, 8), -- 自报告流通供应量
  total_supply DECIMAL(30, 8),               -- 总供应量
  max_supply DECIMAL(30, 8),                 -- 最大供应量
  ath DECIMAL(20, 8),                        -- 历史最高价 (USD)
  atl DECIMAL(20, 8),                        -- 历史最低价 (USD)
  high_24h DECIMAL(20, 8),                   -- 24小时最高价
  low_24h DECIMAL(20, 8),                    -- 24小时最低价
  is_active BOOLEAN DEFAULT true,            -- 是否活跃
  is_audited BOOLEAN DEFAULT false,          -- 是否已审计
  date_added TIMESTAMP WITH TIME ZONE,       -- 添加日期
  last_updated TIMESTAMP WITH TIME ZONE,     -- 最后更新时间
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 加密货币实时价格数据表（支持多币种计价）
CREATE TABLE public.crypto_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  crypto_id INTEGER REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  quote_currency TEXT NOT NULL,              -- 计价货币 (USD, BTC, ETH)
  price DECIMAL(30, 8) NOT NULL,             -- 价格
  volume_24h DECIMAL(30, 8),                 -- 24小时交易量
  volume_7d DECIMAL(30, 8),                  -- 7天交易量
  volume_30d DECIMAL(30, 8),                 -- 30天交易量
  market_cap DECIMAL(30, 8),                 -- 市值
  self_reported_market_cap DECIMAL(30, 8),   -- 自报告市值
  fully_diluted_market_cap DECIMAL(30, 8),   -- 完全稀释市值
  market_cap_by_total_supply DECIMAL(30, 8), -- 按总供应量计算的市值
  percent_change_1h DECIMAL(10, 4),          -- 1小时价格变化百分比
  percent_change_24h DECIMAL(10, 4),         -- 24小时价格变化百分比
  percent_change_7d DECIMAL(10, 4),          -- 7天价格变化百分比
  percent_change_30d DECIMAL(10, 4),         -- 30天价格变化百分比
  percent_change_60d DECIMAL(10, 4),         -- 60天价格变化百分比
  percent_change_90d DECIMAL(10, 4),         -- 90天价格变化百分比
  percent_change_1y DECIMAL(10, 4),          -- 1年价格变化百分比
  ytd_price_change_percentage DECIMAL(10, 4), -- 年初至今价格变化百分比
  dominance DECIMAL(10, 4),                  -- 市场主导地位
  turnover DECIMAL(10, 8),                   -- 换手率
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(crypto_id, quote_currency, timestamp)
);

-- 价格历史数据表（用于图表展示）
CREATE TABLE public.price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  crypto_id INTEGER REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  price DECIMAL(20, 8) NOT NULL,             -- USD 价格
  volume DECIMAL(30, 8),                     -- 交易量
  market_cap DECIMAL(30, 8),                 -- 市值
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  interval_type TEXT DEFAULT '1h'            -- 时间间隔类型 (1h, 1d, 1w)
);

-- 整体市场数据表
CREATE TABLE public.market_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_market_cap DECIMAL(30, 8),           -- 总市值
  total_volume_24h DECIMAL(30, 8),           -- 24h总交易量
  btc_dominance DECIMAL(10, 4),              -- BTC市场占有率
  eth_dominance DECIMAL(10, 4),              -- ETH市场占有率
  active_cryptocurrencies INTEGER,           -- 活跃加密货币数量
  total_cryptocurrencies INTEGER,            -- 总加密货币数量
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 用户功能相关表
-- =============================================

-- 用户收藏表
CREATE TABLE public.user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  crypto_id INTEGER REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, crypto_id)
);

-- 用户报警设置表
CREATE TABLE public.user_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  crypto_id INTEGER REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_change', 'price_threshold')),
  threshold_percentage DECIMAL(10, 4),       -- 价格变化百分比阈值
  threshold_price DECIMAL(20, 8),            -- 价格阈值
  direction TEXT DEFAULT 'both' CHECK (direction IN ('up', 'down', 'both')),
  is_active BOOLEAN DEFAULT true,
  notification_frequency TEXT DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'hourly', 'daily')),
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 报警通知记录表
CREATE TABLE public.alert_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID REFERENCES public.user_alerts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  crypto_id INTEGER REFERENCES public.cryptocurrencies(id) ON DELETE CASCADE,
  trigger_price DECIMAL(20, 8) NOT NULL,
  previous_price DECIMAL(20, 8) NOT NULL,
  price_change_percentage DECIMAL(10, 4) NOT NULL,
  notification_type TEXT DEFAULT 'email' CHECK (notification_type IN ('email', 'push', 'sms')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 索引优化
-- =============================================

-- 加密货币表索引
CREATE INDEX idx_cryptocurrencies_rank ON public.cryptocurrencies(cmc_rank) WHERE cmc_rank IS NOT NULL;
CREATE INDEX idx_cryptocurrencies_symbol ON public.cryptocurrencies(symbol);
CREATE INDEX idx_cryptocurrencies_active ON public.cryptocurrencies(is_active);
CREATE INDEX idx_cryptocurrencies_updated ON public.cryptocurrencies(updated_at);

-- 价格数据表索引
CREATE INDEX idx_crypto_prices_crypto_id ON public.crypto_prices(crypto_id);
CREATE INDEX idx_crypto_prices_quote ON public.crypto_prices(quote_currency);
CREATE INDEX idx_crypto_prices_timestamp ON public.crypto_prices(timestamp DESC);
CREATE INDEX idx_crypto_prices_crypto_quote ON public.crypto_prices(crypto_id, quote_currency);

-- 价格历史表索引
CREATE INDEX idx_price_history_crypto_id ON public.price_history(crypto_id);
CREATE INDEX idx_price_history_timestamp ON public.price_history(timestamp DESC);
CREATE INDEX idx_price_history_crypto_time ON public.price_history(crypto_id, timestamp DESC);
CREATE INDEX idx_price_history_interval ON public.price_history(interval_type);

-- 市场数据表索引
CREATE INDEX idx_market_data_timestamp ON public.market_data(timestamp DESC);

-- 用户相关表索引
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_alerts_user_id ON public.user_alerts(user_id);
CREATE INDEX idx_user_alerts_crypto_id ON public.user_alerts(crypto_id);
CREATE INDEX idx_user_alerts_active ON public.user_alerts(is_active) WHERE is_active = true;
CREATE INDEX idx_alert_notifications_alert_id ON public.alert_notifications(alert_id);
CREATE INDEX idx_alert_notifications_status ON public.alert_notifications(status);

-- =============================================
-- 行级安全策略 (RLS)
-- =============================================

-- 启用 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_notifications ENABLE ROW LEVEL SECURITY;

-- 加密货币和价格数据表公开访问（不启用 RLS）
-- ALTER TABLE public.cryptocurrencies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.crypto_prices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS 策略
-- =============================================

-- 用户表策略
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 加密货币数据公开访问策略
CREATE POLICY "Everyone can view cryptocurrencies" ON public.cryptocurrencies
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Service role can manage cryptocurrencies" ON public.cryptocurrencies
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow crypto data sync" ON public.cryptocurrencies
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow crypto data update" ON public.cryptocurrencies
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- 价格数据公开访问策略
CREATE POLICY "Everyone can view crypto prices" ON public.crypto_prices
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Service role can manage crypto prices" ON public.crypto_prices
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow price data sync" ON public.crypto_prices
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow price data update" ON public.crypto_prices
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- 价格历史数据公开访问策略
CREATE POLICY "Everyone can view price history" ON public.price_history
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Service role can manage price history" ON public.price_history
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow price history sync" ON public.price_history
  FOR INSERT TO anon WITH CHECK (true);

-- 市场数据公开访问策略
CREATE POLICY "Everyone can view market data" ON public.market_data
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Service role can manage market data" ON public.market_data
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow market data sync" ON public.market_data
  FOR INSERT TO anon WITH CHECK (true);

-- 用户收藏策略
CREATE POLICY "Users can manage own favorites" ON public.user_favorites
  FOR ALL USING (auth.uid() = user_id);

-- 用户报警策略
CREATE POLICY "Users can manage own alerts" ON public.user_alerts
  FOR ALL USING (auth.uid() = user_id);

-- 报警通知策略
CREATE POLICY "Users can view own notifications" ON public.alert_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage notifications" ON public.alert_notifications
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================
-- 触发器和函数
-- =============================================

-- 自动创建用户档案函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 用户注册触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 更新 updated_at 字段函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 触发器
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_cryptocurrencies_updated_at
  BEFORE UPDATE ON public.cryptocurrencies
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_alerts_updated_at
  BEFORE UPDATE ON public.user_alerts
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =============================================
-- 数据清理函数（可选）
-- =============================================

-- 清理旧的价格历史数据（保留最近3个月）
CREATE OR REPLACE FUNCTION cleanup_old_price_history()
RETURNS void AS $$
BEGIN
  DELETE FROM public.price_history 
  WHERE timestamp < NOW() - INTERVAL '3 months';
END;
$$ LANGUAGE plpgsql;

-- 清理旧的报警通知记录（保留最近1个月）
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.alert_notifications 
  WHERE created_at < NOW() - INTERVAL '1 month'
  AND status = 'sent';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 有用的视图
-- =============================================

-- 最新价格视图
CREATE OR REPLACE VIEW latest_crypto_prices AS
SELECT DISTINCT ON (cp.crypto_id)
  cp.*,
  c.symbol,
  c.name,
  c.cmc_rank
FROM crypto_prices cp
JOIN cryptocurrencies c ON cp.crypto_id = c.id
WHERE c.is_active = true AND cp.quote_currency = 'USD'
ORDER BY cp.crypto_id, cp.timestamp DESC;

-- 热门加密货币视图
CREATE OR REPLACE VIEW top_cryptocurrencies AS
SELECT 
  c.*,
  cp.price,
  cp.market_cap,
  cp.volume_24h,
  cp.percent_change_24h,
  cp.timestamp as price_updated_at
FROM cryptocurrencies c
LEFT JOIN LATERAL (
  SELECT DISTINCT ON (crypto_id) *
  FROM crypto_prices 
  WHERE crypto_id = c.id AND quote_currency = 'USD'
  ORDER BY crypto_id, timestamp DESC
) cp ON true
WHERE c.is_active = true AND c.cmc_rank IS NOT NULL
ORDER BY c.cmc_rank ASC;

-- =============================================
-- 注释说明
-- =============================================

-- 表结构说明：
-- 1. cryptocurrencies: 存储加密货币基础信息，支持CMC API的所有字段
-- 2. crypto_prices: 存储实时价格数据，支持多币种计价（USD/BTC/ETH）
-- 3. price_history: 存储历史价格数据，用于图表展示
-- 4. market_data: 存储整体市场数据，如总市值、BTC占有率等
-- 5. user_alerts: 用户报警设置，支持价格阈值和变化百分比报警
-- 6. alert_notifications: 报警通知记录，追踪报警触发历史

-- 数据更新策略：
-- 1. 使用 UPSERT (INSERT ... ON CONFLICT) 避免重复数据
-- 2. 定时任务清理历史数据，保持数据库性能
-- 3. 索引优化查询性能，特别是时间序列查询

-- 安全策略：
-- 1. 加密货币和价格数据公开访问
-- 2. 用户相关数据通过RLS保护
-- 3. 服务角色拥有完全访问权限用于数据同步

-- 完成数据库初始化
SELECT 'CryptoNiche database schema created successfully!' as status;