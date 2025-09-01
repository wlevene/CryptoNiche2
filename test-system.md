# 🧪 CryptoNiche 系统测试指南

基于旧版本 main.py 逻辑重新设计后的系统测试步骤

## ✅ 测试步骤

### 1. **数据库表结构测试**

#### a) 执行 SQL 迁移
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目 → **SQL Editor**
3. 复制并执行 `supabase-migration.sql`
4. 确认所有表创建成功：
   - `cryptocurrencies` (更新后)
   - `crypto_prices` (新表)
   - `price_history` (新表) 
   - `market_data` (新表)

#### b) 验证视图和索引
```sql
-- 检查视图
SELECT * FROM latest_crypto_prices LIMIT 5;
SELECT * FROM top_cryptocurrencies LIMIT 5;

-- 检查索引
SELECT indexname FROM pg_indexes WHERE tablename IN ('crypto_prices', 'price_history');
```

---

### 2. **数据同步服务测试**

#### a) 手动触发数据同步
```bash
curl -X POST http://localhost:3002/api/crypto/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer crypto-niche-monitor-secret-2024" \
  -d '{"maxCount": 100}'
```

**预期响应:**
```json
{
  "success": true,
  "message": "数据同步成功",
  "data": {
    "cryptoCount": 100,
    "priceCount": 100,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### b) 检查同步状态
```bash
curl -X GET http://localhost:3002/api/crypto/sync
```

#### c) 验证数据库中的数据
在 Supabase SQL Editor 中执行：
```sql
-- 检查基础数据
SELECT COUNT(*) FROM cryptocurrencies;
SELECT COUNT(*) FROM crypto_prices;
SELECT COUNT(*) FROM market_data;

-- 查看前10个加密货币
SELECT * FROM latest_crypto_prices LIMIT 10;

-- 检查市场数据
SELECT * FROM market_data ORDER BY timestamp DESC LIMIT 5;
```

---

### 3. **前端界面测试**

#### a) 打开应用
访问: http://localhost:3002

#### b) 检查市场概览数据
- ✅ **Total Market Cap** 显示真实数据
- ✅ **24h Volume** 显示真实数据  
- ✅ **BTC Dominance** 显示真实百分比
- ✅ **Active Coins** 显示真实数量

#### c) 检查热门加密货币列表
- ✅ 显示前4名加密货币
- ✅ 显示真实价格、变化、交易量
- ✅ 如果没有数据显示提示信息

---

### 4. **价格监控系统测试**

#### a) 启动价格监控
```bash
curl -X POST http://localhost:3002/api/crypto/monitor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer crypto-niche-monitor-secret-2024" \
  -d '{"action": "start"}'
```

#### b) 检查监控状态
```bash
curl -X POST http://localhost:3002/api/crypto/monitor \
  -H "Content-Type: application/json" \
  -d '{"action": "status"}'
```

#### c) 测试预警系统
```bash
curl -X POST http://localhost:3002/api/crypto/monitor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer crypto-niche-monitor-secret-2024" \
  -d '{"action": "test"}'
```

---

### 5. **端到端测试流程**

#### Step 1: 清空并同步数据
1. 在 Supabase 中清空旧数据（可选）
2. 执行数据同步 API
3. 验证数据成功导入

#### Step 2: 验证前端显示
1. 刷新页面确保显示新数据
2. 检查所有组件正常工作
3. 确认加载状态和错误处理

#### Step 3: 测试用户预警
1. 注册/登录用户账户
2. 创建价格预警
3. 启动监控服务
4. 验证预警触发逻辑

---

## 🚨 常见问题排查

### 1. **数据同步失败**
- 检查 Supabase 连接
- 确认 API 权限配置
- 查看服务器日志错误

### 2. **前端显示空数据**
- 确认数据库中有数据
- 检查 Supabase 客户端配置
- 验证视图权限设置

### 3. **价格监控不工作**
- 检查预警表中是否有活跃预警
- 确认价格数据更新
- 查看监控服务日志

---

## 🎯 性能基准

### 预期性能指标：
- **数据同步**: 100个币种 < 30秒
- **页面加载**: 市场数据 < 2秒
- **数据库查询**: 热门币种 < 500ms
- **预警检查**: 每30秒一次，< 5秒完成

---

## 📋 测试检查清单

- [ ] 数据库表结构创建成功
- [ ] 数据同步 API 正常工作
- [ ] 前端显示真实数据
- [ ] 价格监控服务启动
- [ ] 预警系统响应正常
- [ ] 错误处理机制工作
- [ ] 性能符合预期

完成所有测试后，系统应该可以：
1. ✅ 自动同步加密货币数据
2. ✅ 实时显示市场信息
3. ✅ 监控价格变化
4. ✅ 触发用户预警
5. ✅ 处理各种异常情况