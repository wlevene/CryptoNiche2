/**
 * 系统配置常量
 */

export const CONFIG = {
  // 数据库配置
  DATABASE: {
    BATCH_SIZE: 100,
    QUERY_LIMIT: {
      DEFAULT: 10,
      MAX_CRYPTOCURRENCIES: 1000,
      SEARCH_RESULTS: 20,
    },
    RETRY_ATTEMPTS: 3,
    TIMEOUT_MS: 30000,
  },

  // API配置
  API: {
    COINMARKETCAP: {
      BASE_URL: 'https://api.coinmarketcap.com/v1',
      TIMEOUT_MS: 10000,
      RATE_LIMIT: {
        REQUESTS_PER_MINUTE: 30,
        REQUESTS_PER_DAY: 10000,
      },
    },
  },

  // 缓存配置
  CACHE: {
    MARKET_DATA_TTL: 5 * 60 * 1000, // 5 minutes
    PRICE_DATA_TTL: 1 * 60 * 1000,  // 1 minute
    CRYPTO_LIST_TTL: 30 * 60 * 1000, // 30 minutes
  },

  // 监控配置
  MONITORING: {
    PRICE_UPDATE_INTERVAL: 60000, // 1 minute
    ALERT_CHECK_INTERVAL: 30000,  // 30 seconds
    HEALTH_CHECK_INTERVAL: 300000, // 5 minutes
  },

  // 格式化配置
  FORMATTING: {
    DECIMAL_PLACES: {
      PRICE: 6,
      PERCENTAGE: 2,
      VOLUME: 0,
    },
    LARGE_NUMBER_THRESHOLDS: {
      TRILLION: 1e12,
      BILLION: 1e9,
      MILLION: 1e6,
      THOUSAND: 1e3,
    },
  },

  // 邮件配置
  EMAIL: {
    ALERT_BATCH_SIZE: 10,
    SEND_RETRY_ATTEMPTS: 3,
    COOLDOWN_PERIOD: 15 * 60 * 1000, // 15 minutes
  },

  // 系统配置
  SYSTEM: {
    STARTUP_TIMEOUT: 60000, // 1 minute
    GRACEFUL_SHUTDOWN_TIMEOUT: 30000, // 30 seconds
  },
} as const;

export const ERROR_MESSAGES = {
  DATABASE: {
    CONNECTION_FAILED: '数据库连接失败',
    QUERY_FAILED: '数据库查询失败',
    INSERT_FAILED: '数据插入失败',
    UPDATE_FAILED: '数据更新失败',
    DELETE_FAILED: '数据删除失败',
  },
  API: {
    NETWORK_ERROR: '网络请求失败',
    TIMEOUT_ERROR: '请求超时',
    RATE_LIMIT_EXCEEDED: '请求频率超限',
    INVALID_RESPONSE: '无效的API响应',
  },
  VALIDATION: {
    INVALID_CRYPTO_ID: '无效的加密货币ID',
    INVALID_PRICE: '无效的价格数据',
    MISSING_REQUIRED_FIELDS: '缺少必填字段',
  },
  SYSTEM: {
    INITIALIZATION_FAILED: '系统初始化失败',
    SERVICE_UNAVAILABLE: '服务不可用',
    UNKNOWN_ERROR: '未知错误',
  },
} as const;

export const SUCCESS_MESSAGES = {
  DATABASE: {
    CONNECTED: '数据库连接成功',
    DATA_SYNCED: '数据同步成功',
    IMPORT_COMPLETED: '数据导入完成',
  },
  API: {
    REQUEST_SUCCESS: 'API请求成功',
    DATA_FETCHED: '数据获取成功',
  },
  SYSTEM: {
    INITIALIZED: '系统初始化完成',
    SERVICE_STARTED: '服务启动成功',
  },
} as const;