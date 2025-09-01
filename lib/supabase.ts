import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          preferences: Record<string, unknown> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          preferences?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          preferences?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
      }
      cryptocurrencies: {
        Row: {
          id: number
          symbol: string
          name: string
          slug: string | null
          cmc_rank: number | null
          market_pair_count: number | null
          circulating_supply: number | null
          self_reported_circulating_supply: number | null
          total_supply: number | null
          max_supply: number | null
          ath: number | null
          atl: number | null
          high_24h: number | null
          low_24h: number | null
          is_active: boolean
          is_audited: boolean
          date_added: string | null
          last_updated: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: number
          symbol: string
          name: string
          slug?: string | null
          cmc_rank?: number | null
          market_pair_count?: number | null
          circulating_supply?: number | null
          self_reported_circulating_supply?: number | null
          total_supply?: number | null
          max_supply?: number | null
          ath?: number | null
          atl?: number | null
          high_24h?: number | null
          low_24h?: number | null
          is_active?: boolean
          is_audited?: boolean
          date_added?: string | null
          last_updated?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          symbol?: string
          name?: string
          slug?: string | null
          cmc_rank?: number | null
          market_pair_count?: number | null
          circulating_supply?: number | null
          self_reported_circulating_supply?: number | null
          total_supply?: number | null
          max_supply?: number | null
          ath?: number | null
          atl?: number | null
          high_24h?: number | null
          low_24h?: number | null
          is_active?: boolean
          is_audited?: boolean
          date_added?: string | null
          last_updated?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      crypto_prices: {
        Row: {
          id: string
          crypto_id: number
          quote_currency: string
          price: number
          volume_24h: number | null
          volume_7d: number | null
          volume_30d: number | null
          market_cap: number | null
          self_reported_market_cap: number | null
          fully_diluted_market_cap: number | null
          market_cap_by_total_supply: number | null
          percent_change_1h: number | null
          percent_change_24h: number | null
          percent_change_7d: number | null
          percent_change_30d: number | null
          percent_change_60d: number | null
          percent_change_90d: number | null
          percent_change_1y: number | null
          ytd_price_change_percentage: number | null
          dominance: number | null
          turnover: number | null
          timestamp: string
        }
        Insert: {
          id?: string
          crypto_id: number
          quote_currency: string
          price: number
          volume_24h?: number | null
          volume_7d?: number | null
          volume_30d?: number | null
          market_cap?: number | null
          self_reported_market_cap?: number | null
          fully_diluted_market_cap?: number | null
          market_cap_by_total_supply?: number | null
          percent_change_1h?: number | null
          percent_change_24h?: number | null
          percent_change_7d?: number | null
          percent_change_30d?: number | null
          percent_change_60d?: number | null
          percent_change_90d?: number | null
          percent_change_1y?: number | null
          ytd_price_change_percentage?: number | null
          dominance?: number | null
          turnover?: number | null
          timestamp?: string
        }
        Update: {
          id?: string
          crypto_id?: number
          quote_currency?: string
          price?: number
          volume_24h?: number | null
          volume_7d?: number | null
          volume_30d?: number | null
          market_cap?: number | null
          self_reported_market_cap?: number | null
          fully_diluted_market_cap?: number | null
          market_cap_by_total_supply?: number | null
          percent_change_1h?: number | null
          percent_change_24h?: number | null
          percent_change_7d?: number | null
          percent_change_30d?: number | null
          percent_change_60d?: number | null
          percent_change_90d?: number | null
          percent_change_1y?: number | null
          ytd_price_change_percentage?: number | null
          dominance?: number | null
          turnover?: number | null
          timestamp?: string
        }
      }
      price_history: {
        Row: {
          id: string
          crypto_id: number
          price: number
          volume: number | null
          market_cap: number | null
          timestamp: string
          interval_type: string
        }
        Insert: {
          id?: string
          crypto_id: number
          price: number
          volume?: number | null
          market_cap?: number | null
          timestamp: string
          interval_type?: string
        }
        Update: {
          id?: string
          crypto_id?: number
          price?: number
          volume?: number | null
          market_cap?: number | null
          timestamp?: string
          interval_type?: string
        }
      }
      market_data: {
        Row: {
          id: string
          total_market_cap: number | null
          total_volume_24h: number | null
          btc_dominance: number | null
          eth_dominance: number | null
          active_cryptocurrencies: number | null
          total_cryptocurrencies: number | null
          timestamp: string
        }
        Insert: {
          id?: string
          total_market_cap?: number | null
          total_volume_24h?: number | null
          btc_dominance?: number | null
          eth_dominance?: number | null
          active_cryptocurrencies?: number | null
          total_cryptocurrencies?: number | null
          timestamp?: string
        }
        Update: {
          id?: string
          total_market_cap?: number | null
          total_volume_24h?: number | null
          btc_dominance?: number | null
          eth_dominance?: number | null
          active_cryptocurrencies?: number | null
          total_cryptocurrencies?: number | null
          timestamp?: string
        }
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string
          crypto_id: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          crypto_id: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          crypto_id?: number
          created_at?: string
        }
      }
      user_alerts: {
        Row: {
          id: string
          user_id: string
          crypto_id: number
          alert_type: 'price_change' | 'price_threshold'
          threshold_percentage: number | null
          threshold_price: number | null
          direction: 'up' | 'down' | 'both'
          is_active: boolean
          notification_frequency: 'immediate' | 'hourly' | 'daily'
          last_triggered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          crypto_id: number
          alert_type: 'price_change' | 'price_threshold'
          threshold_percentage?: number | null
          threshold_price?: number | null
          direction?: 'up' | 'down' | 'both'
          is_active?: boolean
          notification_frequency?: 'immediate' | 'hourly' | 'daily'
          last_triggered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          crypto_id?: number
          alert_type?: 'price_change' | 'price_threshold'
          threshold_percentage?: number | null
          threshold_price?: number | null
          direction?: 'up' | 'down' | 'both'
          is_active?: boolean
          notification_frequency?: 'immediate' | 'hourly' | 'daily'
          last_triggered_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      alert_notifications: {
        Row: {
          id: string
          alert_id: string
          user_id: string
          crypto_id: number
          trigger_price: number
          previous_price: number
          price_change_percentage: number
          notification_type: 'email' | 'push' | 'sms'
          status: 'pending' | 'sent' | 'failed'
          sent_at: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          alert_id: string
          user_id: string
          crypto_id: number
          trigger_price: number
          previous_price: number
          price_change_percentage: number
          notification_type?: 'email' | 'push' | 'sms'
          status?: 'pending' | 'sent' | 'failed'
          sent_at?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          alert_id?: string
          user_id?: string
          crypto_id?: number
          trigger_price?: number
          previous_price?: number
          price_change_percentage?: number
          notification_type?: 'email' | 'push' | 'sms'
          status?: 'pending' | 'sent' | 'failed'
          sent_at?: string | null
          error_message?: string | null
          created_at?: string
        }
      }
    }
  }
}