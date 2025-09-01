/**
 * 加密货币相关数据类型定义
 */

export interface CryptoCurrency {
  id: number;
  symbol: string;
  name: string;
  slug: string;
  rank: number;
  price: number;
  market_cap: number;
  volume_24h: number;
  change_24h: number;
  cmc_rank: number;
  num_market_pairs: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  ath: number;
  atl: number;
  date_added: string;
  is_active: boolean;
  image_url?: string;
  updated_at: string;
}

export interface CryptoPrice {
  id?: string;
  crypto_id: number;
  price_usd: number;
  price_btc: number;
  price_eth: number;
  volume_24h: number;
  volume_7d: number;
  volume_30d: number;
  market_cap: number;
  percent_change_1h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  percent_change_30d: number;
  percent_change_60d: number;
  percent_change_90d: number;
  percent_change_1y: number;
  dominance: number;
  turnover: number;
  high_24h: number;
  low_24h: number;
  ytd_price_change_percentage: number;
  timestamp: string;
}

export interface MarketData {
  id?: string;
  total_market_cap: number;
  total_volume_24h: number;
  btc_dominance: number;
  eth_dominance: number;
  active_cryptocurrencies: number;
  total_cryptocurrencies: number;
  timestamp: string;
}

export interface MarketStats {
  totalMarketCap: number;
  total24hVolume: number;
  btcDominance: number;
  activeCryptocurrencies: number;
}

export interface TopCrypto {
  id: number;
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: string;
  marketCap: string;
  rank: number;
}

export interface CryptoAlert {
  id?: string;
  user_id: string;
  crypto_id: number;
  alert_type: 'price_above' | 'price_below' | 'change_above' | 'change_below';
  target_value: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PriceHistory {
  crypto_id: number;
  price: number;
  timestamp: string;
}

export interface ImportProgress {
  totalProcessed: number;
  cryptoCount: number;
  priceCount: number;
  timestamp: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}