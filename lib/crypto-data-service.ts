/**
 * 加密货币数据服务
 * 参考 crypto_crawler.py 的 get_all_cryptocurrencies 方法
 * 实现一次性获取所有数据并保存到 Supabase
 */

import { createAdminClient } from '@/lib/supabase-admin';
import type { Database } from '@/lib/supabase';
import type { MarketStats } from './types/crypto';

// 类型定义
type CryptocurrencyInsert = Database['public']['Tables']['cryptocurrencies']['Insert'];
type CryptoPriceInsert = Database['public']['Tables']['crypto_prices']['Insert'];
type MarketDataInsert = Database['public']['Tables']['market_data']['Insert'];

// CoinMarketCap API 响应接口
interface CMCQuote {
  name: string;
  price: number;
  volume24h: number;
  volume7d: number;
  volume30d: number;
  marketCap: number;
  percentChange1h: number;
  percentChange24h: number;
  percentChange7d: number;
  percentChange30d: number;
  percentChange60d: number;
  percentChange90d: number;
  dominance: number;
  turnover: number;
  ytdPriceChangePercentage: number;
  percentChange1y: number;
}

interface CMCCrypto {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmcRank: number;
  marketPairCount: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number | null;
  ath: number;
  atl: number;
  high24h: number;
  low24h: number;
  isActive: number;
  lastUpdated: string;
  dateAdded: string;
  quotes: CMCQuote[];
}

interface CMCResponse {
  data: {
    cryptoCurrencyList: CMCCrypto[];
    totalCount: number;
  };
  status: {
    timestamp: string;
    errorCode: number;
    errorMessage: string | null;
  };
}

export class CryptoDataService {
  private baseURL = 'https://api.coinmarketcap.com/data-api/v3';
  private headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en,zh-CN;q=0.9,zh;q=0.8',
    'cache-control': 'no-cache',
    'origin': 'https://coinmarketcap.com',
    'platform': 'web',
    'referer': 'https://coinmarketcap.com/',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
  };

  private supabase = createAdminClient();
  private syncInterval: NodeJS.Timeout | null = null;
  private aggregationInterval: NodeJS.Timeout | null = null;

  /**
   * 获取加密货币列表 (参考 crypto_crawler.py:get_cryptocurrency_listing)
   */
  private async getCryptocurrencyListing(start: number = 1, limit: number = 100): Promise<CMCResponse | null> {
    const url = new URL(`${this.baseURL}/cryptocurrency/listing`);
    
    const params = {
      start: start.toString(),
      limit: limit.toString(),
      sortBy: 'rank',
      sortType: 'desc',
      convert: 'USD,BTC,ETH',
      cryptoType: 'all',
      tagType: 'all',
      audited: 'false',
      aux: 'ath,atl,high24h,low24h,num_market_pairs,cmc_rank,date_added,max_supply,circulating_supply,total_supply,volume_7d,volume_30d,self_reported_circulating_supply,self_reported_market_cap'
    };

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      // 增加超时时间和重试机制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
      
      // 配置代理设置
      const fetchOptions: RequestInit = {
        method: 'GET',
        headers: this.headers,
        signal: controller.signal,
      };

      // 如果在Node.js环境中且设置了代理，使用代理
        if (typeof window === 'undefined') {
          const { HttpsProxyAgent } = await import('https-proxy-agent');
          const proxyUrl = process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.HTTP_PROXY;
          if (proxyUrl) {
            console.log('🌐 使用代理:', proxyUrl);
            // 使用dispatcher而不是agent
            const { setGlobalDispatcher, ProxyAgent } = await import('undici');
            const dispatcher = new ProxyAgent(proxyUrl);
            setGlobalDispatcher(dispatcher);
          }
        }
      
      const response = await fetch(url.toString(), fetchOptions);
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CMCResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching cryptocurrency data:', error);
      return null;
    }
  }

  /**
   * 获取所有加密货币并保存到数据库 (参考 crypto_crawler.py:get_all_cryptocurrencies)
   */
  async getAllCryptocurrenciesAndSave(batchSize: number = 100, maxCount: number = 1000): Promise<{
    success: boolean;
    cryptoCount: number;
    priceCount: number;
    error?: string;
  }> {
    console.log('开始获取所有加密货币数据...');
    
    try {
      const allData: { [key: number]: CMCCrypto } = {};
      
      for (let start = 1; start <= maxCount; start += batchSize) {
        console.log(`获取加密货币数据: ${start} - ${start + batchSize - 1}`);
        
        const response = await this.getCryptocurrencyListing(start, batchSize);
        
        if (!response || !response.data || !response.data.cryptoCurrencyList) {
          console.log('没有更多数据，停止获取');
          break;
        }
        
        const cryptoList = response.data.cryptoCurrencyList;
        if (!cryptoList.length) {
          console.log('没有更多数据，停止获取');
          break;
        }
        
        // 合并数据 (参考Python代码逻辑)
        for (const crypto of cryptoList) {
          if (crypto.id) {
            allData[crypto.id] = crypto;
          }
        }
        
        // 避免请求过快
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const allCryptos = Object.values(allData);
      console.log(`从API获取 ${allCryptos.length} 个加密货币数据`);
      
      if (allCryptos.length === 0) {
        throw new Error('未能从API获取加密货币数据');
      }
      
      // 保存所有数据到Supabase
      const result = await this.saveAllDataToSupabase(allCryptos);
      
      return result;
    } catch (error) {
      console.error('获取加密货币数据失败:', error);
      return {
        success: false,
        cryptoCount: 0,
        priceCount: 0,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 保存所有数据到Supabase
   */
  private async saveAllDataToSupabase(cryptocurrencies: CMCCrypto[]): Promise<{
    success: boolean;
    cryptoCount: number;
    priceCount: number;
    error?: string;
  }> {
    try {
      // 1. 转换并保存基础信息
      const cryptoData = cryptocurrencies.map(crypto => this.transformCryptoData(crypto));
      const cryptoResult = await this.upsertCryptocurrencies(cryptoData);
      
      // 2. 转换并保存价格数据
      const priceData = cryptocurrencies
        .map(crypto => this.transformPriceData(crypto))
        .flat()
        .filter(Boolean) as CryptoPriceInsert[];
      
      const priceResult = await this.insertPriceData(priceData);

      // 3. 计算并保存市场数据
      await this.calculateAndSaveMarketData(cryptocurrencies);

      console.log(`数据保存完成: ${cryptoResult.length} 个币种, ${priceResult.length} 条价格数据`);
      
      return {
        success: true,
        cryptoCount: cryptoResult.length,
        priceCount: priceResult.length,
      };
    } catch (error) {
      console.error('数据保存失败:', error);
      return {
        success: false,
        cryptoCount: 0,
        priceCount: 0,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 数据转换：CMC API → 数据库格式
   * 适配新的数据库schema，防止数值溢出
   */
  private transformCryptoData(crypto: CMCCrypto): CryptocurrencyInsert {
    // DECIMAL(30,8) 最大值约为 10^22，为安全起见使用 10^21 作为上限
    const MAX_SUPPLY_VALUE = 1e21;
    const MAX_PRICE_VALUE = 1e14; // 价格字段使用较小的上限
    
    return {
      id: crypto.id,
      symbol: crypto.symbol,
      name: crypto.name,
      slug: crypto.slug,
      cmc_rank: crypto.cmcRank || null,
      market_pair_count: crypto.marketPairCount || null,
      circulating_supply: this.limitDecimal(crypto.circulatingSupply, MAX_SUPPLY_VALUE),
      self_reported_circulating_supply: null,
      total_supply: this.limitDecimal(crypto.totalSupply, MAX_SUPPLY_VALUE),
      max_supply: this.limitDecimal(crypto.maxSupply, MAX_SUPPLY_VALUE),
      ath: this.limitDecimal(crypto.ath, MAX_PRICE_VALUE),
      atl: this.limitDecimal(crypto.atl, MAX_PRICE_VALUE),
      high_24h: this.limitDecimal(crypto.high24h, MAX_PRICE_VALUE),
      low_24h: this.limitDecimal(crypto.low24h, MAX_PRICE_VALUE),
      is_active: crypto.isActive === 1,
      is_audited: false,
      date_added: crypto.dateAdded ? new Date(crypto.dateAdded).toISOString() : null,
      last_updated: crypto.lastUpdated ? new Date(crypto.lastUpdated).toISOString() : null,
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * 限制数值范围，防止数据库字段溢出
   */
  private limitDecimal(value: number | null | undefined, maxValue: number): number | null {
    if (value === null || value === undefined || isNaN(value)) {
      return null;
    }
    
    // 限制在合理范围内
    if (value > maxValue) {
      return maxValue;
    }
    if (value < -maxValue) {
      return -maxValue;
    }
    
    return value;
  }

  /**
   * 数据转换：CMC API → 价格数据格式
   */
  private transformPriceData(crypto: CMCCrypto): CryptoPriceInsert[] {
    const priceData: CryptoPriceInsert[] = [];
    
    // 定义各字段的最大值限制
    const MAX_PRICE_VALUE = 1e14;        // 价格字段 DECIMAL(30,8)
    const MAX_VOLUME_VALUE = 1e21;       // 交易量字段 DECIMAL(30,8) 
    const MAX_MARKET_CAP_VALUE = 1e21;   // 市值字段 DECIMAL(30,8)
    const MAX_PERCENTAGE_VALUE = 999999; // 百分比字段 DECIMAL(10,4)
    const MAX_TURNOVER_VALUE = 99999999; // 换手率字段 DECIMAL(10,8)
    
    if (crypto.quotes && crypto.quotes.length > 0) {
      crypto.quotes.forEach(quote => {
        priceData.push({
          crypto_id: crypto.id,
          quote_currency: quote.name || 'USD',
          price: this.limitDecimal(quote.price, MAX_PRICE_VALUE) || 0,
          volume_24h: this.limitDecimal(quote.volume24h, MAX_VOLUME_VALUE),
          volume_7d: this.limitDecimal(quote.volume7d, MAX_VOLUME_VALUE),
          volume_30d: this.limitDecimal(quote.volume30d, MAX_VOLUME_VALUE),
          market_cap: this.limitDecimal(quote.marketCap, MAX_MARKET_CAP_VALUE),
          self_reported_market_cap: null,
          fully_diluted_market_cap: null,
          market_cap_by_total_supply: null,
          percent_change_1h: this.limitDecimal(quote.percentChange1h, MAX_PERCENTAGE_VALUE),
          percent_change_24h: this.limitDecimal(quote.percentChange24h, MAX_PERCENTAGE_VALUE),
          percent_change_7d: this.limitDecimal(quote.percentChange7d, MAX_PERCENTAGE_VALUE),
          percent_change_30d: this.limitDecimal(quote.percentChange30d, MAX_PERCENTAGE_VALUE),
          percent_change_60d: this.limitDecimal(quote.percentChange60d, MAX_PERCENTAGE_VALUE),
          percent_change_90d: this.limitDecimal(quote.percentChange90d, MAX_PERCENTAGE_VALUE),
          percent_change_1y: this.limitDecimal(quote.percentChange1y, MAX_PERCENTAGE_VALUE),
          ytd_price_change_percentage: this.limitDecimal(quote.ytdPriceChangePercentage, MAX_PERCENTAGE_VALUE),
          dominance: this.limitDecimal(quote.dominance, MAX_PERCENTAGE_VALUE),
          turnover: this.limitDecimal(quote.turnover, MAX_TURNOVER_VALUE),
          timestamp: new Date().toISOString(),
        });
      });
    }
    
    return priceData;
  }

  /**
   * 批量保存加密货币基础信息
   */
  async upsertCryptocurrencies(cryptocurrencies: CryptocurrencyInsert[]) {
    const { data, error } = await this.supabase
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
   * 批量保存价格数据
   */
  async insertPriceData(priceData: CryptoPriceInsert[]) {
    const { data, error } = await this.supabase
      .from('crypto_prices')
      .insert(priceData)
      .select();

    if (error) {
      console.error('Error inserting price data:', error);
      throw error;
    }

    return data;
  }

  /**
   * 启动自动数据同步 (每10分钟执行一次)
   */
  startAutoSync(intervalMinutes: number = 10, maxCount: number = 1000) {
    console.log(`启动自动数据同步，间隔: ${intervalMinutes} 分钟`);
    
    // 立即执行一次
    this.getAllCryptocurrenciesAndSave(100, maxCount);
    
    // 设置定时任务
    this.syncInterval = setInterval(async () => {
      const currentTime = new Date().toISOString();
      console.log(`[${currentTime}] 执行自动数据同步...`);
      
      try {
        const result = await this.getAllCryptocurrenciesAndSave(100, maxCount);
        if (result.success) {
          console.log(`[${currentTime}] 自动数据同步完成: ${result.cryptoCount} 个币种, ${result.priceCount} 条价格数据`);
        } else {
          console.error(`[${currentTime}] 自动数据同步失败: ${result.error}`);
        }
      } catch (error) {
        console.error(`[${currentTime}] 自动数据同步异常:`, error);
      }
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * 停止自动数据同步
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('🛑 自动同步已停止');
    }
    if (this.aggregationInterval) {
      clearInterval(this.aggregationInterval);
      this.aggregationInterval = null;
      console.log('🛑 价格历史聚合已停止');
    }
  }

  /**
   * 计算并保存市场整体数据
   */
  private async calculateAndSaveMarketData(cryptocurrencies: CMCCrypto[]) {
    const usdData = cryptocurrencies
      .map(crypto => crypto.quotes?.find(q => q.name === 'USD'))
      .filter(Boolean);

    if (usdData.length === 0) return;

    const totalMarketCap = usdData.reduce((sum, quote) => sum + (quote!.marketCap || 0), 0);
    const totalVolume24h = usdData.reduce((sum, quote) => sum + (quote!.volume24h || 0), 0);
    
    // 假设第一个是 BTC
    const btcMarketCap = usdData[0]?.marketCap || 0;
    const btcDominance = totalMarketCap > 0 ? (btcMarketCap / totalMarketCap) * 100 : 0;

    // 假设第二个是 ETH
    const ethMarketCap = usdData[1]?.marketCap || 0;
    const ethDominance = totalMarketCap > 0 ? (ethMarketCap / totalMarketCap) * 100 : 0;

    const marketData: MarketDataInsert = {
      total_market_cap: totalMarketCap,
      total_volume_24h: totalVolume24h,
      btc_dominance: btcDominance,
      eth_dominance: ethDominance,
      active_cryptocurrencies: usdData.length,
      total_cryptocurrencies: cryptocurrencies.length,
      timestamp: new Date().toISOString(),
    };

    const { error } = await this.supabase
      .from('market_data')
      .insert(marketData);

    if (error) {
      console.error('Error saving market data:', error);
    }
  }

  /**
   * 启动价格历史数据聚合
   * @param intervalMinutes 聚合间隔（分钟）
   */
  startPriceHistoryAggregation(intervalMinutes: number = 60) {
    if (this.aggregationInterval) {
      console.log('⚠️ 价格历史聚合已在运行中');
      return;
    }

    console.log(`🚀 启动价格历史数据聚合，间隔: ${intervalMinutes} 分钟`);
    
    // 立即执行一次聚合
    this.aggregatePriceHistory();
    
    // 设置定时聚合
    this.aggregationInterval = setInterval(() => {
      this.aggregatePriceHistory();
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * 聚合价格历史数据
   * 将 crypto_prices 表中的数据按时间间隔聚合到 price_history 表
   */
  private async aggregatePriceHistory() {
    try {
      console.log('📊 开始聚合价格历史数据...');
      
      // 获取所有活跃的加密货币
      const { data: cryptos, error: cryptoError } = await this.supabase
        .from('cryptocurrencies')
        .select('id')
        .eq('is_active', true);

      if (cryptoError) {
        console.error('获取加密货币列表失败:', cryptoError);
        return;
      }

      if (!cryptos || cryptos.length === 0) {
        console.log('没有找到活跃的加密货币');
        return;
      }

      // 聚合不同时间间隔的数据
      await Promise.all([
        this.aggregateByInterval('1h', 1),
        this.aggregateByInterval('1d', 24),
        this.aggregateByInterval('1w', 24 * 7),
        this.aggregateByInterval('1M', 24 * 30)
      ]);

      console.log('✅ 价格历史数据聚合完成');
    } catch (error) {
      console.error('❌ 价格历史数据聚合失败:', error);
    }
  }

  /**
   * 按指定时间间隔聚合数据
   * @param intervalType 间隔类型 (1h, 1d, 1w, 1M)
   * @param hours 小时数
   */
  private async aggregateByInterval(intervalType: string, hours: number) {
    try {
      // 计算聚合时间范围
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);
      
      // 检查是否已经存在该时间段的聚合数据
      const { data: existingData } = await this.supabase
        .from('price_history')
        .select('crypto_id')
        .eq('interval_type', intervalType)
        .gte('timestamp', startTime.toISOString())
        .lt('timestamp', endTime.toISOString())
        .limit(1);

      if (existingData && existingData.length > 0) {
        console.log(`⏭️ ${intervalType} 间隔的数据已存在，跳过聚合`);
        return;
      }

      // 聚合 crypto_prices 数据
      const { data: priceData, error } = await this.supabase
        .from('crypto_prices')
        .select(`
          crypto_id,
          price,
          volume_24h,
          market_cap,
          timestamp
        `)
        .eq('quote_currency', 'USD')
        .gte('timestamp', startTime.toISOString())
        .lt('timestamp', endTime.toISOString())
        .order('timestamp', { ascending: true });

      if (error) {
        console.error(`聚合 ${intervalType} 数据时出错:`, error);
        return;
      }

      if (!priceData || priceData.length === 0) {
        console.log(`没有找到 ${intervalType} 时间段的价格数据`);
        return;
      }

      // 按 crypto_id 分组并计算聚合值
      const aggregatedData = this.calculateAggregatedValues(priceData, intervalType, endTime);
      
      if (aggregatedData.length > 0) {
        // 批量插入聚合数据
        const { error: insertError } = await this.supabase
          .from('price_history')
          .insert(aggregatedData);

        if (insertError) {
          console.error(`插入 ${intervalType} 聚合数据失败:`, insertError);
        } else {
          console.log(`✅ 成功聚合 ${intervalType} 数据，共 ${aggregatedData.length} 条记录`);
        }
      }
    } catch (error) {
      console.error(`聚合 ${intervalType} 数据时发生异常:`, error);
    }
  }

  /**
   * 计算聚合值
   * @param priceData 原始价格数据
   * @param intervalType 间隔类型
   * @param timestamp 聚合时间戳
   */
  private calculateAggregatedValues(priceData: any[], intervalType: string, timestamp: Date) {
    const groupedData = new Map<number, any[]>();
    
    // 按 crypto_id 分组
    priceData.forEach(item => {
      const cryptoId = item.crypto_id;
      if (!groupedData.has(cryptoId)) {
        groupedData.set(cryptoId, []);
      }
      groupedData.get(cryptoId)!.push(item);
    });

    const aggregatedData: any[] = [];
    
    // 为每个加密货币计算聚合值
    groupedData.forEach((items, cryptoId) => {
      if (items.length === 0) return;
      
      // 计算平均价格
      const avgPrice = items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0) / items.length;
      
      // 计算总交易量（取最新值或平均值）
      const volumes = items.filter(item => item.volume_24h).map(item => parseFloat(item.volume_24h));
      const avgVolume = volumes.length > 0 ? volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length : null;
      
      // 计算市值（取最新值）
      const latestItem = items[items.length - 1];
      const marketCap = latestItem.market_cap ? parseFloat(latestItem.market_cap) : null;
      
      aggregatedData.push({
        crypto_id: cryptoId,
        price: this.limitDecimal(avgPrice, 99999999999.99999999),
        volume: avgVolume ? this.limitDecimal(avgVolume, 99999999999999999999999.99999999) : null,
        market_cap: marketCap ? this.limitDecimal(marketCap, 99999999999999999999999.99999999) : null,
        timestamp: timestamp.toISOString(),
        interval_type: intervalType
      });
    });
    
    return aggregatedData;
  }

  /**
   * 清理过期的实时价格数据
   * @param daysToKeep 保留天数
   */
  async cleanupOldPriceData(daysToKeep: number = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const { error } = await this.supabase
        .from('crypto_prices')
        .delete()
        .lt('timestamp', cutoffDate.toISOString());
      
      if (error) {
        console.error('清理过期价格数据失败:', error);
      } else {
        console.log(`✅ 成功清理 ${daysToKeep} 天前的价格数据`);
      }
    } catch (error) {
      console.error('清理过期数据时发生异常:', error);
    }
  }

  /**
   * 获取市场统计数据
   */
  async getMarketStats(): Promise<MarketStats> {
    try {
      // 获取最新的市场数据
      const { data: marketData, error: marketError } = await this.supabase
        .from('market_data')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (marketError || !marketData) {
        // 如果没有市场数据，尝试从加密货币表计算
        const { data: cryptos, error: cryptoError } = await this.supabase
          .from('cryptocurrencies')
          .select('id')
          .eq('is_active', true);

        if (cryptoError) {
          throw new Error(`获取加密货币数据失败: ${cryptoError.message}`);
        }

        return {
          totalMarketCap: 0,
          total24hVolume: 0,
          btcDominance: 0,
          activeCryptocurrencies: cryptos?.length || 0
        };
      }

      return {
        totalMarketCap: marketData.total_market_cap || 0,
        total24hVolume: marketData.total_volume_24h || 0,
        btcDominance: marketData.btc_dominance || 0,
        activeCryptocurrencies: marketData.active_cryptocurrencies || 0
      };
    } catch (error) {
      console.error('获取市场统计数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取最新价格数据
   */
  async getLatestPrices(limit: number = 10) {
    try {
      const { data, error } = await this.supabase
        .from('crypto_prices')
        .select(`
          *,
          cryptocurrencies!inner(*)
        `)
        .eq('quote_currency', 'USD')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`获取最新价格失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('获取最新价格数据失败:', error);
      throw error;
    }
  }

  /**
   * 同步加密货币数据 (兼容性方法)
   */
  async syncCryptocurrencyData(maxCount: number = 1000) {
    return await this.getAllCryptocurrenciesAndSave(100, maxCount);
  }

}

// 导出单例实例（不自动启动，由 app-initializer 统一管理）
export const cryptoDataService = new CryptoDataService();

// 注意：数据同步服务的启动由 app-initializer.ts 统一管理
// 避免重复启动，确保服务的统一初始化和管理