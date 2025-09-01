/**
 * CoinMarketCap API client for cryptocurrency data fetching
 */

export interface CryptocurrencyData {
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
  quotes: QuoteData[];
}

export interface QuoteData {
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

export interface CoinMarketCapResponse {
  data: {
    cryptoCurrencyList: CryptocurrencyData[];
    totalCount: number;
  };
  status: {
    timestamp: string;
    errorCode: number;
    errorMessage: string | null;
  };
}

export class CoinMarketCapAPI {
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

  /**
   * Fetch cryptocurrency listings
   */
  async getCryptocurrencyListing(
    start: number = 1,
    limit: number = 100
  ): Promise<CoinMarketCapResponse | null> {
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
      aux: 'ath,atl,high24h,low24h,num_market_pairs,cmc_rank,date_added,max_supply,circulating_supply,total_supply,volume_7d,volume_30d'
    };

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CoinMarketCapResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching cryptocurrency data:', error);
      return null;
    }
  }

  /**
   * Fetch all cryptocurrencies in batches
   */
  async getAllCryptocurrencies(
    batchSize: number = 100,
    maxCount: number = 1000
  ): Promise<CryptocurrencyData[]> {
    const allCryptos: CryptocurrencyData[] = [];
    let processed = 0;

    for (let start = 1; processed < maxCount; start += batchSize) {
      console.log(`Fetching cryptocurrencies ${start} - ${start + batchSize - 1}`);
      
      const response = await this.getCryptocurrencyListing(start, batchSize);
      
      if (!response || !response.data.cryptoCurrencyList.length) {
        console.log('No more data available, stopping...');
        break;
      }

      allCryptos.push(...response.data.cryptoCurrencyList);
      processed = allCryptos.length;

      // Rate limiting
      if (processed < maxCount) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return allCryptos.slice(0, maxCount);
  }

  /**
   * Transform API data to database format
   */
  static transformToDbFormat(crypto: CryptocurrencyData) {
    const usdQuote = crypto.quotes?.find(q => q.name === 'USD');
    
    return {
      id: crypto.id,
      symbol: crypto.symbol,
      name: crypto.name,
      rank: crypto.cmcRank || 0,
      price: usdQuote?.price || 0,
      market_cap: usdQuote?.marketCap || null,
      volume_24h: usdQuote?.volume24h || null,
      change_24h: usdQuote?.percentChange24h || null,
      image_url: null, // Will be populated separately if needed
      updated_at: new Date().toISOString(),
    };
  }
}