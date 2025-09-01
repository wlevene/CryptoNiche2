# 定时任务配置指南

## 概述

所有定时任务参数已经配置化，可以通过环境变量灵活调整，无需修改代码。

## 配置文件位置

- **配置定义**: `/lib/config/scheduler.config.ts`
- **环境变量**: `.env.local`
- **应用初始化**: `/lib/app-initializer.ts`

## 主要配置项

### 1. 数据同步配置

```env
AUTO_SYNC_ENABLED=true              # 启用自动数据同步
SYNC_INTERVAL_MINUTES=30            # 同步间隔（分钟）
SYNC_MAX_COUNT=100                  # 每次同步的最大数量
SYNC_BATCH_SIZE=100                 # 每批次大小
SYNC_BATCH_DELAY_MS=1000           # 批次间隔（毫秒）
SYNC_INITIAL_DELAY_MS=2000          # 初始同步延迟（毫秒）
```

**建议设置**：
- 开发环境：`SYNC_INTERVAL_MINUTES=60`，`SYNC_MAX_COUNT=50`
- 生产环境：`SYNC_INTERVAL_MINUTES=30`，`SYNC_MAX_COUNT=100`

### 2. 价格历史聚合配置

```env
PRICE_AGGREGATION_ENABLED=true      # 启用价格历史聚合
AGGREGATION_INTERVAL_MINUTES=60     # 聚合间隔（分钟）
```

**建议设置**：
- 默认60分钟聚合一次即可

### 3. 价格监控配置

```env
PRICE_MONITOR_ENABLED=false         # 启用价格监控
MONITOR_INTERVAL_MINUTES=5          # 监控检查间隔（分钟）
MONITOR_MAX_ALERTS=100              # 单次检查的最大警报数
MONITOR_EMAIL_COOLDOWN=30           # 邮件发送冷却时间（分钟）
```

**注意**：需要先配置邮件服务（RESEND_API_KEY）

### 4. 数据清理配置

```env
CLEANUP_ENABLED=false                # 启用自动数据清理
CLEANUP_INTERVAL_HOURS=24           # 清理间隔（小时）
PRICE_RETENTION_DAYS=7              # 价格数据保留天数
MARKET_RETENTION_DAYS=30            # 市场数据保留天数
LOG_RETENTION_DAYS=14               # 日志保留天数
```

**建议**：生产环境启用，避免数据库过大

### 5. 市场数据更新配置

```env
MARKET_DATA_ENABLED=true            # 启用市场数据更新
MARKET_UPDATE_INTERVAL=10           # 更新间隔（分钟）
MARKET_CACHE_MINUTES=5              # 缓存有效期（分钟）
```

### 6. 性能优化配置

```env
USE_WORKER_THREADS=false            # 使用 Worker Threads
WORKER_THREAD_COUNT=2               # Worker 线程数
USE_STREAMING=false                 # 使用流式处理
MEMORY_LIMIT_MB=512                 # 内存限制（MB）
```

## 快速配置示例

### 开发环境（轻量配置）

```env
# 开发环境 - 减少资源占用
AUTO_SYNC_ENABLED=true
SYNC_INTERVAL_MINUTES=60            # 1小时同步一次
SYNC_MAX_COUNT=50                   # 只同步50条
PRICE_AGGREGATION_ENABLED=false     # 关闭聚合
PRICE_MONITOR_ENABLED=false         # 关闭监控
CLEANUP_ENABLED=false               # 关闭清理
```

### 测试环境（中等配置）

```env
# 测试环境 - 平衡性能和功能
AUTO_SYNC_ENABLED=true
SYNC_INTERVAL_MINUTES=30            # 30分钟同步一次
SYNC_MAX_COUNT=100                  # 同步100条
PRICE_AGGREGATION_ENABLED=true      
AGGREGATION_INTERVAL_MINUTES=120    # 2小时聚合一次
PRICE_MONITOR_ENABLED=false
CLEANUP_ENABLED=false
```

### 生产环境（完整配置）

```env
# 生产环境 - 完整功能
AUTO_SYNC_ENABLED=true
SYNC_INTERVAL_MINUTES=15            # 15分钟同步一次
SYNC_MAX_COUNT=200                  # 同步200条
PRICE_AGGREGATION_ENABLED=true
AGGREGATION_INTERVAL_MINUTES=60     # 1小时聚合一次
PRICE_MONITOR_ENABLED=true          # 启用监控
MONITOR_INTERVAL_MINUTES=5          # 5分钟检查一次
CLEANUP_ENABLED=true                # 启用清理
CLEANUP_INTERVAL_HOURS=24           # 每天清理一次
PRICE_RETENTION_DAYS=7              # 保留7天价格数据
```

## 查看定时任务状态

访问 API 端点查看当前配置和状态：

```bash
GET /api/scheduler/status
```

返回示例：

```json
{
  "success": true,
  "timestamp": "2024-01-27T10:30:00Z",
  "initialization": {
    "isInitialized": true,
    "isInitializing": false
  },
  "schedulers": {
    "dataSync": {
      "enabled": true,
      "interval": "30 分钟",
      "nextRun": "2024-01-27T11:00:00Z"
    },
    "priceAggregation": {
      "enabled": true,
      "interval": "60 分钟",
      "nextRun": "2024-01-27T11:30:00Z"
    },
    "priceMonitor": {
      "enabled": false,
      "interval": "5 分钟"
    },
    "dataCleanup": {
      "enabled": false,
      "interval": "24 小时",
      "retention": "7 天"
    },
    "marketData": {
      "enabled": true,
      "interval": "10 分钟",
      "cache": "5 分钟"
    }
  }
}
```

## 动态调整配置

### 方法1：修改环境变量并重启

```bash
# 修改 .env.local
SYNC_INTERVAL_MINUTES=10

# 重启服务
npm run dev
# 或
pm2 restart crypto-niche
```

### 方法2：使用管理API（需要实现）

```bash
# 动态更新配置
POST /api/admin/scheduler/update
{
  "dataSync": {
    "intervalMinutes": 10
  }
}
```

## 监控建议

1. **日志监控**
   - 查看控制台输出，确认定时任务启动
   - 检查同步成功/失败日志

2. **性能监控**
   - 监控内存使用
   - 监控CPU使用率
   - 监控API响应时间

3. **数据监控**
   - 检查数据更新时间
   - 验证数据完整性
   - 监控数据库大小

## 常见问题

### Q: 定时任务没有启动？
A: 检查 `AUTO_SYNC_ENABLED=true` 是否设置

### Q: 同步太慢？
A: 减少 `SYNC_INTERVAL_MINUTES` 或增加 `SYNC_MAX_COUNT`

### Q: 服务器负载太高？
A: 增加 `SYNC_INTERVAL_MINUTES` 或减少 `SYNC_MAX_COUNT`

### Q: 数据库增长太快？
A: 启用 `CLEANUP_ENABLED=true` 并调整保留天数

## 最佳实践

1. **渐进式调整**：先从保守配置开始，逐步优化
2. **监控优先**：调整后观察24小时，确保稳定
3. **分离环境**：开发、测试、生产使用不同配置
4. **定期检查**：每周查看一次定时任务状态
5. **备份配置**：保存稳定运行的配置作为备份