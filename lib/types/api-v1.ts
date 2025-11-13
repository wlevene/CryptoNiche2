/**
 * API v1 类型定义
 * 基于后端接口定义生成
 */

// ============================================
// 认证相关类型
// ============================================

/**
 * 用户信息
 */
export interface User {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

/**
 * 用户注册请求
 */
export interface UserRegisterReq {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

/**
 * 用户注册响应
 */
export interface UserRegisterReply {
  token: string;
}

/**
 * 登录请求
 */
export interface LoginReq {
  email: string;
  password: string;
}

/**
 * 登录响应
 */
export interface LoginReply {
  token: string;
  email: string;
}

/**
 * 短信验证码请求
 */
export interface GetLoginSmsCodeReq {
  phone: string;
}

/**
 * 短信登录请求
 */
export interface LoginWithSmsReq {
  phone: string;
  code: string;
  invite_code?: string;
}

/**
 * 短信登录响应
 */
export interface LoginWithSmsReply {
  token: string;
  phone: string;
}

/**
 * 登出请求
 */
export interface LogoutReq {}

/**
 * 登出响应
 */
export interface LogoutReply {}

/**
 * 重置密码请求
 */
export interface ResetPasswordReq {
  email: string;
  password: string;
  code: string;
}

/**
 * 重置密码响应
 */
export interface ResetPasswordReply {
  result: boolean;
}

/**
 * 修改密码请求
 */
export interface ChangePasswordReq {
  old_password: string;
  new_password: string;
}

/**
 * 修改密码响应
 */
export interface ChangePasswordReply {
  message: string;
  result: boolean;
}

/**
 * Google 认证请求
 */
export interface AuthGoogleReq {
  token: string;
}

/**
 * 用户仪表板请求
 */
export interface UserDashboardReq {}

/**
 * 用户仪表板响应
 */
export interface UserDashboardReply {
  report: string;
  announcement: string;
  current_badge: string;
}

// ============================================
// 基础数据类型
// ============================================

/**
 * 货币基础信息
 */
export interface Currency {
  id?: string;
  cmc_id?: number;
  symbol?: string;
  name?: string;
  slug?: string;
  cmc_rank?: number;
  market_pair_count?: number;
  circulating_supply?: number;
  self_reported_circulating_supply?: number;
  total_supply?: number;
  max_supply?: number;
  ath?: number;
  atl?: number;
  high_24h?: number;
  low_24h?: number;
  is_active?: boolean;
  is_audited?: boolean;
  date_added?: string;
}

/**
 * 价格信息（带完整市场数据）
 */
export interface Price {
  id?: string;
  crypto_id: number;
  quote_currency: string;
  price: number;
  volume_24h?: number;
  volume_7d?: number;
  volume_30d?: number;
  market_cap?: number;
  percent_change_1h?: number;
  percent_change_24h?: number;
  percent_change_7d?: number;
  percent_change_30d?: number;
  timestamp?: string;
}

/**
 * 货币详情（包含价格）
 */
export interface CurrencyDetail {
  currency: Currency;
  price?: Price;
  is_favorite?: boolean;
}

/**
 * 价格历史数据点
 */
export interface PriceHistoryPoint {
  timestamp: string;
  price: number;
  volume?: number;
  market_cap?: number;
}

/**
 * 提醒规则
 */
export interface Alert {
  id?: string;
  user_id?: string;
  crypto_id?: number;
  alert_type?: string; // 'price_change' | 'price_threshold'
  threshold_percentage?: number;
  threshold_price?: number;
  direction?: string; // 'up' | 'down' | 'both'
  is_active?: boolean;
  notification_frequency?: string; // 'immediate' | 'hourly' | 'daily'
  last_triggered_at?: string;
}

/**
 * 通知消息
 */
export interface Notification {
  id?: string;
  alert_id: string;
  user_id: string;
  crypto_id: number;
  crypto_name?: string;
  crypto_symbol?: string;
  trigger_price: number;
  previous_price: number;
  price_change_percentage: number;
  notification_type: string; // 'email' | 'push' | 'sms'
  status: string; // 'pending' | 'sent' | 'failed'
  created_at?: string;
  sent_at?: string;
}

// ============================================
// 请求/响应类型定义
// ============================================

/**
 * 获取货币列表请求
 */
export interface CurrencyListReq {
  page?: number; // default=1
  page_size?: number; // default=50
  sort_by?: string; // rank, price, volume, market_cap, change_24h (default=rank)
  sort_order?: string; // asc, desc (default=asc)
  quote_currency?: string; // USD, BTC, ETH (default=USD)
}

/**
 * 获取货币列表响应
 */
export interface CurrencyListReply {
  items: CurrencyDetail[];
  total: number;
  page: number;
  page_size: number;
}

/**
 * 获取单个货币详情请求
 */
export interface CurrencyDetailReq {
  cmc_id: number;
  quote_currency?: string; // default=USD
}

/**
 * 获取单个货币详情响应
 */
export interface CurrencyDetailReply {
  currency: Currency;
  price?: Price;
  is_favorite?: boolean;
}

/**
 * 获取价格历史请求
 */
export interface PriceHistoryReq {
  cmc_id: number;
  interval?: string; // 1h, 1d, 1w, 1M (default=1h)
  start_time?: string; // RFC3339 格式
  end_time?: string; // RFC3339 格式
  limit?: number; // default=100
}

/**
 * 获取价格历史响应
 */
export interface PriceHistoryReply {
  crypto_id: number;
  interval: string;
  data: PriceHistoryPoint[];
}

/**
 * 搜索货币请求
 */
export interface SearchCurrencyReq {
  keyword: string; // 名称或符号
  limit?: number; // default=10
}

/**
 * 搜索货币响应
 */
export interface SearchCurrencyReply {
  items: Currency[];
}

/**
 * 获取提醒列表请求
 */
export interface AlertListReq {
  crypto_id?: number; // 可选，筛选特定货币
  is_active?: boolean; // 可选，筛选是否启用
}

/**
 * 获取提醒列表响应
 */
export interface AlertListReply {
  items: Alert[];
  total: number;
}

/**
 * 获取通知列表请求
 */
export interface NotificationListReq {
  status?: string; // pending, sent, failed
  page?: number; // default=1
  page_size?: number; // default=20
}

/**
 * 获取通知列表响应
 */
export interface NotificationListReply {
  items: Notification[];
  total: number;
  unread_count?: number;
}

/**
 * 标记通知已读请求
 */
export interface MarkNotificationReadReq {
  id?: string; // 不传则标记全部为已读
}

/**
 * 标记通知已读响应
 */
export interface MarkNotificationReadReply {
  success: boolean;
}

/**
 * 获取市场概览（首页数据）请求
 */
export interface MarketOverviewReq {
  quote_currency?: string; // default=USD
}

/**
 * 获取市场概览响应
 */
export interface MarketOverviewReply {
  total_market_cap: number;
  total_24h_volume: number;
  btc_dominance?: number;
  eth_dominance?: number;
  top_gainers?: CurrencyDetail[]; // 涨幅榜
  top_losers?: CurrencyDetail[]; // 跌幅榜
  trending?: CurrencyDetail[]; // 热门
}

// ============================================
// 通用响应类型
// ============================================

/**
 * API 标准响应格式
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * API 错误响应
 */
export interface ApiError {
  success: false;
  error: string;
  message?: string;
  code?: string;
  details?: any;
}
