/**
 * 定时任务配置文件
 * 所有定时任务的时间参数集中管理
 */

export const schedulerConfig = {
  /**
   * 数据同步配置
   */
  dataSync: {
    // 是否启用自动同步
    enabled: process.env.AUTO_SYNC_ENABLED === 'true' || process.env.AUTO_INIT_DATA === 'true',
    
    // 同步间隔（分钟）
    intervalMinutes: parseInt(process.env.SYNC_INTERVAL_MINUTES || '30'),
    
    // 每次同步的最大数量
    maxCount: parseInt(process.env.SYNC_MAX_COUNT || '100'),
    
    // 每批次大小
    batchSize: parseInt(process.env.SYNC_BATCH_SIZE || '100'),
    
    // 批次间隔（毫秒）
    batchDelayMs: parseInt(process.env.SYNC_BATCH_DELAY_MS || '1000'),
    
    // 初始同步延迟（毫秒）
    initialDelayMs: parseInt(process.env.SYNC_INITIAL_DELAY_MS || '2000'),
  },

  /**
   * 价格历史聚合配置
   */
  priceAggregation: {
    // 是否启用价格聚合
    enabled: process.env.PRICE_AGGREGATION_ENABLED !== 'false',
    
    // 聚合间隔（分钟）
    intervalMinutes: parseInt(process.env.AGGREGATION_INTERVAL_MINUTES || '60'),
    
    // 聚合时间窗口配置
    intervals: {
      '1h': { hours: 1, enabled: true },
      '1d': { hours: 24, enabled: true },
      '1w': { hours: 24 * 7, enabled: true },
      '1M': { hours: 24 * 30, enabled: true },
    },
  },

  /**
   * 价格监控配置
   */
  priceMonitor: {
    // 是否启用价格监控
    enabled: process.env.PRICE_MONITOR_ENABLED === 'true',
    
    // 监控检查间隔（分钟）
    intervalMinutes: parseInt(process.env.MONITOR_INTERVAL_MINUTES || '5'),
    
    // 单次检查的最大警报数
    maxAlertsPerCheck: parseInt(process.env.MONITOR_MAX_ALERTS || '100'),
    
    // 邮件发送间隔限制（分钟）- 防止频繁发送
    emailCooldownMinutes: parseInt(process.env.MONITOR_EMAIL_COOLDOWN || '30'),
  },

  /**
   * 数据清理配置
   */
  dataCleanup: {
    // 是否启用数据清理
    enabled: process.env.CLEANUP_ENABLED === 'true',
    
    // 清理间隔（小时）
    intervalHours: parseInt(process.env.CLEANUP_INTERVAL_HOURS || '24'),
    
    // 价格数据保留天数
    priceDataRetentionDays: parseInt(process.env.PRICE_RETENTION_DAYS || '7'),
    
    // 市场数据保留天数
    marketDataRetentionDays: parseInt(process.env.MARKET_RETENTION_DAYS || '30'),
    
    // 日志保留天数
    logRetentionDays: parseInt(process.env.LOG_RETENTION_DAYS || '14'),
  },

  /**
   * 市场数据更新配置
   */
  marketData: {
    // 是否启用市场数据更新
    enabled: process.env.MARKET_DATA_ENABLED !== 'false',
    
    // 更新间隔（分钟）
    intervalMinutes: parseInt(process.env.MARKET_UPDATE_INTERVAL || '10'),
    
    // 缓存有效期（分钟）
    cacheMinutes: parseInt(process.env.MARKET_CACHE_MINUTES || '5'),
  },

  /**
   * 重试配置
   */
  retry: {
    // 最大重试次数
    maxAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS || '3'),
    
    // 重试延迟（毫秒）
    delayMs: parseInt(process.env.RETRY_DELAY_MS || '5000'),
    
    // 重试延迟增长倍数
    backoffMultiplier: parseFloat(process.env.RETRY_BACKOFF_MULTIPLIER || '2'),
  },

  /**
   * 性能配置
   */
  performance: {
    // 是否使用 Worker Threads
    useWorkerThreads: process.env.USE_WORKER_THREADS === 'true',
    
    // Worker 线程数
    workerThreadCount: parseInt(process.env.WORKER_THREAD_COUNT || '2'),
    
    // 是否启用流式处理
    useStreaming: process.env.USE_STREAMING === 'true',
    
    // 内存限制（MB）
    memoryLimitMB: parseInt(process.env.MEMORY_LIMIT_MB || '512'),
  },

  /**
   * 开发环境配置
   */
  development: {
    // 是否启用详细日志
    verboseLogging: process.env.VERBOSE_LOGGING === 'true',
    
    // 是否启用测试数据
    useTestData: process.env.USE_TEST_DATA === 'true',
    
    // 测试数据数量
    testDataCount: parseInt(process.env.TEST_DATA_COUNT || '10'),
  },
};

/**
 * 获取 cron 表达式
 */
export function getCronExpression(intervalMinutes: number): string {
  if (intervalMinutes < 60) {
    return `*/${intervalMinutes} * * * *`; // 每 N 分钟
  } else if (intervalMinutes % (24 * 60) === 0) {
    const days = intervalMinutes / (24 * 60);
    return `0 0 */${days} * *`; // 每 N 天
  } else if (intervalMinutes % 60 === 0) {
    const hours = intervalMinutes / 60;
    return `0 */${hours} * * *`; // 每 N 小时
  } else {
    return `*/${intervalMinutes} * * * *`; // 默认每 N 分钟
  }
}

/**
 * 格式化间隔时间为人类可读格式
 */
export function formatInterval(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} 分钟`;
  } else if (minutes % (24 * 60) === 0) {
    const days = minutes / (24 * 60);
    return `${days} 天`;
  } else if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} 小时`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} 小时 ${mins} 分钟`;
  }
}

/**
 * 验证配置
 */
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 验证同步间隔
  if (schedulerConfig.dataSync.intervalMinutes < 1) {
    errors.push('数据同步间隔不能小于1分钟');
  }
  if (schedulerConfig.dataSync.maxCount > 5000) {
    errors.push('单次同步数量不能超过5000');
  }

  // 验证聚合间隔
  if (schedulerConfig.priceAggregation.intervalMinutes < 5) {
    errors.push('价格聚合间隔不能小于5分钟');
  }

  // 验证监控间隔
  if (schedulerConfig.priceMonitor.intervalMinutes < 1) {
    errors.push('价格监控间隔不能小于1分钟');
  }

  // 验证清理配置
  if (schedulerConfig.dataCleanup.priceDataRetentionDays < 1) {
    errors.push('价格数据至少保留1天');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 获取所有定时任务状态
 */
export function getSchedulerStatus() {
  return {
    dataSync: {
      enabled: schedulerConfig.dataSync.enabled,
      interval: formatInterval(schedulerConfig.dataSync.intervalMinutes),
      nextRun: calculateNextRun(schedulerConfig.dataSync.intervalMinutes),
    },
    priceAggregation: {
      enabled: schedulerConfig.priceAggregation.enabled,
      interval: formatInterval(schedulerConfig.priceAggregation.intervalMinutes),
      nextRun: calculateNextRun(schedulerConfig.priceAggregation.intervalMinutes),
    },
    priceMonitor: {
      enabled: schedulerConfig.priceMonitor.enabled,
      interval: formatInterval(schedulerConfig.priceMonitor.intervalMinutes),
      nextRun: calculateNextRun(schedulerConfig.priceMonitor.intervalMinutes),
    },
    dataCleanup: {
      enabled: schedulerConfig.dataCleanup.enabled,
      interval: formatInterval(schedulerConfig.dataCleanup.intervalHours * 60),
      retention: `${schedulerConfig.dataCleanup.priceDataRetentionDays} 天`,
    },
    marketData: {
      enabled: schedulerConfig.marketData.enabled,
      interval: formatInterval(schedulerConfig.marketData.intervalMinutes),
      cache: formatInterval(schedulerConfig.marketData.cacheMinutes),
    },
  };
}

/**
 * 计算下次运行时间
 */
function calculateNextRun(intervalMinutes: number): Date {
  const now = new Date();
  const nextRun = new Date(now.getTime() + intervalMinutes * 60 * 1000);
  return nextRun;
}

// 导出默认配置
export default schedulerConfig;