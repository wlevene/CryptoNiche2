import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import type { Database } from '@/lib/supabase';
import { CoinMarketCapAPI, CryptocurrencyData } from './crypto-api';

type CryptocurrencyRow = Database['public']['Tables']['cryptocurrencies']['Row'];
type CryptocurrencyInsert = Database['public']['Tables']['cryptocurrencies']['Insert'];

export class CryptocurrencyService {
  private async getSupabase() {
    return await createClient();
  }

  private getAdminSupabase() {
    return createAdminClient();
  }

  /**
   * Batch upsert cryptocurrencies to database
   */
  async upsertCryptocurrencies(cryptocurrencies: CryptocurrencyInsert[]) {
    const supabase = this.getAdminSupabase();
    const { data, error } = await supabase
      .from('cryptocurrencies')
      .upsert(cryptocurrencies, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('Error upserting cryptocurrencies:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get all cryptocurrencies from database
   */
  async getAllCryptocurrencies(): Promise<CryptocurrencyRow[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('cryptocurrencies')
      .select('*')
      .order('rank', { ascending: true });

    if (error) {
      console.error('Error fetching cryptocurrencies:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get cryptocurrencies by rank range
   */
  async getCryptocurrenciesByRank(startRank: number, endRank: number): Promise<CryptocurrencyRow[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('cryptocurrencies')
      .select('*')
      .gte('rank', startRank)
      .lte('rank', endRank)
      .order('rank', { ascending: true });

    if (error) {
      console.error('Error fetching cryptocurrencies by rank:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Search cryptocurrencies by name or symbol
   */
  async searchCryptocurrencies(query: string): Promise<CryptocurrencyRow[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('cryptocurrencies')
      .select('*')
      .or(`name.ilike.%${query}%,symbol.ilike.%${query}%`)
      .order('rank', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error searching cryptocurrencies:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get cryptocurrency by ID
   */
  async getCryptocurrencyById(id: number): Promise<CryptocurrencyRow | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('cryptocurrencies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      console.error('Error fetching cryptocurrency by ID:', error);
      throw error;
    }

    return data;
  }

  /**
   * Save price history
   */
  async savePriceHistory(cryptoId: number, price: number, volume?: number, marketCap?: number) {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('price_history')
      .insert({
        crypto_id: cryptoId,
        price,
        volume: volume || null,
        market_cap: marketCap || null,
        timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving price history:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get price history for a cryptocurrency
   */
  async getPriceHistory(
    cryptoId: number, 
    days: number = 30
  ) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('crypto_id', cryptoId)
      .gte('timestamp', sinceDate.toISOString())
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching price history:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Full data sync - fetch from API and save to database
   */
  async syncCryptocurrencyData(maxCount: number = 1000) {
    console.log('Starting cryptocurrency data sync...');
    
    const api = new CoinMarketCapAPI();
    
    try {
      // Fetch data from CoinMarketCap
      const cryptocurrencies = await api.getAllCryptocurrencies(100, maxCount);
      
      if (cryptocurrencies.length === 0) {
        throw new Error('No cryptocurrency data fetched from API');
      }

      console.log(`Fetched ${cryptocurrencies.length} cryptocurrencies from API`);

      // Transform to database format
      const dbData = cryptocurrencies.map(crypto => 
        CoinMarketCapAPI.transformToDbFormat(crypto)
      );

      // Save to database
      const result = await this.upsertCryptocurrencies(dbData);
      
      console.log(`Successfully synced ${result.length} cryptocurrencies to database`);
      
      return {
        success: true,
        count: result.length,
        data: result
      };
    } catch (error) {
      console.error('Error syncing cryptocurrency data:', error);
      throw error;
    }
  }

  /**
   * Get market statistics
   */
  async getMarketStats() {
    // Get total market cap and other stats
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('cryptocurrencies')
      .select(`
        id,
        market_cap,
        volume_24h,
        change_24h,
        price,
        rank
      `)
      .not('market_cap', 'is', null)
      .order('rank', { ascending: true });

    if (error) {
      console.error('Error fetching market stats:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return {
        totalMarketCap: 0,
        total24hVolume: 0,
        activeCryptocurrencies: 0,
        btcDominance: 0
      };
    }

    const totalMarketCap = data.reduce((sum, crypto) => sum + (crypto.market_cap || 0), 0);
    const total24hVolume = data.reduce((sum, crypto) => sum + (crypto.volume_24h || 0), 0);
    const btcMarketCap = data.find(crypto => crypto.rank === 1)?.market_cap || 0;
    const btcDominance = totalMarketCap > 0 ? (btcMarketCap / totalMarketCap) * 100 : 0;

    return {
      totalMarketCap,
      total24hVolume,
      activeCryptocurrencies: data.length,
      btcDominance
    };
  }
}