/**
 * 数据转换工具
 * 将原始JSON数据转换为数据库格式
 */

import type { CryptoCurrency, CryptoPrice } from '@/lib/types/crypto';
import { NumberFormatter, StringFormatter, DateFormatter } from '@/lib/utils/formatters';

interface RawJsonCrypto {
  id: number;
  symbol: string;
  name: string;
  slug: string;
  cmcRank: number;
  marketPairCount: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply?: number;
  ath: number;
  atl: number;
  dateAdded: string;
  isActive: number;
  lastUpdated: string;
  quotes?: Array<{
    name: string;
    price: number;
    volume24h: number;
    marketCap: number;
    percentChange1h: number;
    percentChange24h: number;
    percentChange7d: number;
    percentChange30d: number;
    percentChange60d: number;
    percentChange90d: number;
    marketCapDominance: number;
  }>;
  high24h?: number;
  low24h?: number;
}

export class DataTransformer {
  /**
   * 转换基础加密货币数据
   */
  static transformCryptoData(crypto: RawJsonCrypto): Omit<CryptoCurrency, 'updated_at'> {
    const usdQuote = DataTransformer.findUsdQuote(crypto.quotes);
    
    return {
      id: crypto.id,
      symbol: StringFormatter.safeString(crypto.symbol, 'UNK'),
      name: StringFormatter.safeString(crypto.name, 'Unknown'),
      slug: StringFormatter.safeString(crypto.slug),
      rank: NumberFormatter.safeInteger(crypto.cmcRank, 999),
      price: NumberFormatter.safeNumber(usdQuote?.price || 0),
      market_cap: NumberFormatter.safeInteger(usdQuote?.marketCap || 0),
      volume_24h: NumberFormatter.safeInteger(usdQuote?.volume24h || 0),
      change_24h: NumberFormatter.safeNumber(usdQuote?.percentChange24h || 0),
      cmc_rank: NumberFormatter.safeInteger(crypto.cmcRank, 999),
      num_market_pairs: NumberFormatter.safeInteger(crypto.marketPairCount, 0),
      circulating_supply: NumberFormatter.safeInteger(crypto.circulatingSupply, 0),
      total_supply: NumberFormatter.safeInteger(crypto.totalSupply, 0),
      max_supply: crypto.maxSupply ? NumberFormatter.safeInteger(crypto.maxSupply) : null,
      ath: NumberFormatter.safeNumber(crypto.ath, 0),
      atl: NumberFormatter.safeNumber(crypto.atl, 0),
      date_added: DateFormatter.isValidDate(crypto.dateAdded) 
        ? crypto.dateAdded 
        : '2010-01-01T00:00:00.000Z',
      is_active: crypto.isActive === 1,
    };
  }

  /**
   * 转换价格数据
   */
  static transformPriceData(
    cryptoId: number,
    crypto: RawJsonCrypto,
    usdQuote: NonNullable<ReturnType<typeof DataTransformer.findUsdQuote>>
  ): Omit<CryptoPrice, 'id'> {
    return {
      crypto_id: cryptoId,
      price_usd: NumberFormatter.safeNumber(usdQuote.price, 0),
      price_btc: NumberFormatter.safeNumber(usdQuote.price / 67000, 0), // 估算BTC价格
      price_eth: NumberFormatter.safeNumber(usdQuote.price / 3400, 0),  // 估算ETH价格
      volume_24h: NumberFormatter.safeNumber(usdQuote.volume24h, 0),
      volume_7d: NumberFormatter.safeNumber(usdQuote.volume24h * 7, 0),
      volume_30d: NumberFormatter.safeNumber(usdQuote.volume24h * 30, 0),
      market_cap: NumberFormatter.safeNumber(usdQuote.marketCap, 0),
      percent_change_1h: NumberFormatter.safeNumber(usdQuote.percentChange1h, 0),
      percent_change_24h: NumberFormatter.safeNumber(usdQuote.percentChange24h, 0),
      percent_change_7d: NumberFormatter.safeNumber(usdQuote.percentChange7d, 0),
      percent_change_30d: NumberFormatter.safeNumber(usdQuote.percentChange30d, 0),
      percent_change_60d: NumberFormatter.safeNumber(usdQuote.percentChange60d, 0),
      percent_change_90d: NumberFormatter.safeNumber(usdQuote.percentChange90d, 0),
      percent_change_1y: 0, // JSON中没有这个数据
      dominance: NumberFormatter.safeNumber(usdQuote.marketCapDominance, 0),
      turnover: 0, // 需要计算
      high_24h: NumberFormatter.safeNumber(crypto.high24h || usdQuote.price, 0),
      low_24h: NumberFormatter.safeNumber(crypto.low24h || usdQuote.price, 0),
      ytd_price_change_percentage: 0, // JSON中没有这个数据
      timestamp: DateFormatter.isValidDate(crypto.lastUpdated) 
        ? crypto.lastUpdated 
        : DateFormatter.formatISODate(),
    };
  }

  /**
   * 查找USD价格数据
   */
  static findUsdQuote(quotes?: RawJsonCrypto['quotes']) {
    if (!quotes || !Array.isArray(quotes) || quotes.length === 0) {
      return null;
    }

    // 优先查找USD报价
    const usdQuote = quotes.find(quote => quote.name === 'USD');
    if (usdQuote) {
      return usdQuote;
    }

    // 如果没有USD报价，使用第一个可用的报价
    return quotes.length > 0 ? quotes[0] : null;
  }

  /**
   * 批量转换JSON数据
   */
  static transformBatchData(rawData: Record<string, RawJsonCrypto>): {
    cryptoData: Omit<CryptoCurrency, 'updated_at'>[];
    priceData: Omit<CryptoPrice, 'id'>[];
  } {
    const cryptoData: Omit<CryptoCurrency, 'updated_at'>[] = [];
    const priceData: Omit<CryptoPrice, 'id'>[] = [];

    for (const [key, crypto] of Object.entries(rawData)) {
      if (!crypto || typeof crypto !== 'object') continue;

      try {
        // 转换基础加密货币数据
        const transformedCrypto = DataTransformer.transformCryptoData(crypto);
        cryptoData.push(transformedCrypto);

        // 转换价格数据
        const usdQuote = DataTransformer.findUsdQuote(crypto.quotes);
        if (usdQuote) {
          const transformedPrice = DataTransformer.transformPriceData(crypto.id, crypto, usdQuote);
          priceData.push(transformedPrice);
        }
      } catch (error) {
        console.warn(`Failed to transform crypto data for ${crypto.symbol}:`, error);
      }
    }

    return { cryptoData, priceData };
  }
}