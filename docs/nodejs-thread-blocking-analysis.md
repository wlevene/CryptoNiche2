# Node.js 线程阻塞问题分析

## 背景
Node.js 使用单线程事件循环模型，主线程负责处理所有的 JavaScript 代码执行。当执行 CPU 密集型任务时，会阻塞事件循环，导致：
- Web 服务器无法响应其他请求
- 页面加载缓慢或超时
- API 接口响应延迟
- 用户体验下降

## 项目中的阻塞任务清单

### 1. 数据爬取任务 (最严重)
**位置**: `/api/crypto/sync/route.ts`
- **问题**: 一次性爬取大量加密货币数据（最多 5000 条）
- **阻塞原因**: 
  - 多次 HTTP 请求串行执行
  - 大量数据的 JSON 解析
  - 批量数据库写入操作
- **影响**: 爬取期间整个应用无响应，可能持续数分钟

### 2. JSON 文件导入
**位置**: `/api/crypto/import-json/route.ts`
- **问题**: 读取和解析大型 JSON 文件（all_cryptocurrencies.json）
- **阻塞原因**:
  - 文件 I/O 操作
  - 大文件的 JSON.parse() 操作
  - 数据转换和验证
  - 批量数据库插入
- **影响**: 导入期间服务器无法处理其他请求

### 3. 价格监控服务
**位置**: `/api/crypto/monitor/route.ts`
- **问题**: 定时检查所有用户的价格警报
- **阻塞原因**:
  - 遍历所有活跃警报
  - 获取实时价格数据
  - 价格比较计算
  - 发送邮件通知
- **影响**: 监控执行期间响应变慢

### 4. 市场数据聚合
**位置**: `crypto-data-service.ts` - `aggregateMarketData()`
- **问题**: 计算市场统计数据
- **阻塞原因**:
  - 遍历所有加密货币数据
  - 复杂的统计计算
  - 排序和过滤操作
- **影响**: 主页加载时可能延迟

### 5. 价格历史数据生成
**位置**: `/api/crypto/[id]/price-history/route.ts`
- **问题**: 生成模拟的价格历史数据
- **阻塞原因**:
  - 循环生成大量数据点
  - 随机数计算
  - 数据格式化
- **影响**: 详情页图表加载缓慢

### 6. 测试数据生成
**位置**: 多个 test-* API 路由
- **问题**: 各种测试数据生成和同步
- **阻塞原因**: 大量模拟数据的生成和处理
- **影响**: 开发调试时影响性能

## 解决方案

### 短期方案（快速缓解）

1. **减少单次处理数据量**
   ```typescript
   // 分批处理数据
   const BATCH_SIZE = 100;
   for (let i = 0; i < total; i += BATCH_SIZE) {
     await processNextBatch(i, BATCH_SIZE);
     // 让出事件循环
     await new Promise(resolve => setImmediate(resolve));
   }
   ```

2. **添加缓存机制**
   - 对市场统计数据添加 Redis/内存缓存
   - 缓存价格历史数据
   - 缓存用户收藏列表

3. **使用流式处理**
   ```typescript
   // JSON 文件流式读取
   import { createReadStream } from 'fs';
   import { pipeline } from 'stream/promises';
   import { Transform } from 'stream';
   ```

### 中期方案（架构优化）

1. **使用 Worker Threads**
   ```typescript
   // worker.js
   const { parentPort } = require('worker_threads');
   
   parentPort.on('message', async (task) => {
     const result = await heavyComputation(task);
     parentPort.postMessage(result);
   });
   
   // main.js
   const { Worker } = require('worker_threads');
   const worker = new Worker('./worker.js');
   ```

2. **任务队列系统**
   - 使用 BullMQ 或 Bull
   - 将重任务放入队列异步处理
   ```typescript
   import { Queue } from 'bullmq';
   
   const syncQueue = new Queue('crypto-sync');
   await syncQueue.add('sync-data', { maxCount: 1000 });
   ```

3. **后台任务分离**
   - 创建独立的后台服务进程
   - 使用 PM2 cluster 模式
   - 或使用容器化部署分离服务

### 长期方案（彻底解决）

1. **微服务架构**
   - 数据爬取服务（Python/Go）
   - 数据处理服务（Node.js Worker）
   - Web API 服务（Node.js Main）
   - 定时任务服务（独立进程）

2. **使用更适合的技术栈**
   - 爬虫服务：Python (Scrapy) 或 Go
   - 数据处理：Python (Pandas) 或 Rust
   - 实时通信：WebSocket Server
   - 定时任务：Celery 或 Temporal

3. **数据库优化**
   - 使用数据库的聚合功能
   - 创建物化视图
   - 使用时序数据库存储价格历史

## 实施优先级

1. **高优先级**（立即实施）
   - 限制 `/api/crypto/sync` 单次同步数量
   - 添加市场数据缓存（5分钟有效期）
   - 将测试 API 限制在开发环境

2. **中优先级**（1-2周内）
   - 实现任务队列系统
   - 数据爬取改为后台任务
   - 使用 Worker Threads 处理 JSON 导入

3. **低优先级**（长期规划）
   - 微服务架构改造
   - 引入专业的时序数据库
   - 实现完整的缓存策略

## 监控指标

需要监控的关键指标：
- 事件循环延迟
- API 响应时间
- 内存使用情况
- CPU 使用率
- 数据库连接池状态

## 总结

当前最影响用户体验的是数据同步任务（`/api/crypto/sync`），建议：
1. 立即将单次同步量限制在 100 条以内
2. 实现增量更新而非全量同步
3. 尽快部署任务队列系统
4. 考虑将爬虫逻辑迁回 Python 服务