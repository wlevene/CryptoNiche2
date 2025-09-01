import type { CryptocurrencyData } from './crypto-api';

export const generateMockCryptoData = (count: number = 10): CryptocurrencyData[] => {
  const cryptos = [
    { id: 1, name: 'Bitcoin', symbol: 'BTC', price: 45000, marketCap: 850000000000, rank: 1 },
    { id: 1027, name: 'Ethereum', symbol: 'ETH', price: 2800, marketCap: 340000000000, rank: 2 },
    { id: 825, name: 'Tether', symbol: 'USDT', price: 1.0, marketCap: 95000000000, rank: 3 },
    { id: 1839, name: 'BNB', symbol: 'BNB', price: 320, marketCap: 50000000000, rank: 4 },
    { id: 52, name: 'XRP', symbol: 'XRP', price: 0.65, marketCap: 35000000000, rank: 5 },
    { id: 5426, name: 'Solana', symbol: 'SOL', price: 85, marketCap: 30000000000, rank: 6 },
    { id: 3408, name: 'USDC', symbol: 'USDC', price: 1.0, marketCap: 28000000000, rank: 7 },
    { id: 74, name: 'Dogecoin', symbol: 'DOGE', price: 0.12, marketCap: 17000000000, rank: 8 },
    { id: 6636, name: 'TON', symbol: 'TON', price: 5.2, marketCap: 13000000000, rank: 9 },
    { id: 2010, name: 'Cardano', symbol: 'ADA', price: 0.48, marketCap: 16000000000, rank: 10 },
    { id: 5805, name: 'AVAX', symbol: 'AVAX', price: 32, marketCap: 12000000000, rank: 11 },
    { id: 4943, name: 'Dai', symbol: 'DAI', price: 1.0, marketCap: 5000000000, rank: 12 },
    { id: 1958, name: 'TRON', symbol: 'TRX', price: 0.16, marketCap: 14000000000, rank: 13 },
    { id: 7083, name: 'Wrapped Bitcoin', symbol: 'WBTC', price: 44980, marketCap: 7000000000, rank: 14 },
    { id: 328, name: 'Monero', symbol: 'XMR', price: 165, marketCap: 3000000000, rank: 15 },
    { id: 512, name: 'Stellar', symbol: 'XLM', price: 0.25, marketCap: 7000000000, rank: 16 },
    { id: 5994, name: 'Shiba Inu', symbol: 'SHIB', price: 0.000025, marketCap: 14000000000, rank: 17 },
    { id: 11419, name: 'Hedera', symbol: 'HBAR', price: 0.12, marketCap: 4000000000, rank: 18 },
    { id: 1765, name: 'EOS', symbol: 'EOS', price: 0.95, marketCap: 1000000000, rank: 19 },
    { id: 3717, name: 'Bitcoin Cash', symbol: 'BCH', price: 420, marketCap: 8000000000, rank: 20 }
  ];

  // Generate additional mock data if count > 20
  const result = [...cryptos];
  
  if (count > 20) {
    for (let i = 21; i <= count; i++) {
      result.push({
        id: 10000 + i,
        name: `CryptoCoin ${i}`,
        symbol: `CC${i}`,
        price: Math.random() * 1000,
        marketCap: Math.random() * 1000000000,
        rank: i
      });
    }
  }

  return result.slice(0, count).map(crypto => ({
    id: crypto.id,
    name: crypto.name,
    symbol: crypto.symbol,
    slug: crypto.name.toLowerCase().replace(/\s+/g, '-'),
    cmc_rank: crypto.rank,
    num_market_pairs: Math.floor(Math.random() * 500) + 10,
    circulating_supply: crypto.marketCap / crypto.price,
    total_supply: crypto.marketCap / crypto.price * 1.2,
    max_supply: crypto.marketCap / crypto.price * 1.5,
    infinite_supply: false,
    last_updated: new Date().toISOString(),
    date_added: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['cryptocurrency'],
    platform: null,
    self_reported_circulating_supply: null,
    self_reported_market_cap: null,
    quote: {
      USD: {
        price: crypto.price,
        volume_24h: crypto.marketCap * (Math.random() * 0.1 + 0.01),
        volume_change_24h: (Math.random() - 0.5) * 50,
        percent_change_1h: (Math.random() - 0.5) * 5,
        percent_change_24h: (Math.random() - 0.5) * 20,
        percent_change_7d: (Math.random() - 0.5) * 30,
        percent_change_30d: (Math.random() - 0.5) * 50,
        percent_change_60d: (Math.random() - 0.5) * 70,
        percent_change_90d: (Math.random() - 0.5) * 100,
        market_cap: crypto.marketCap,
        market_cap_dominance: crypto.marketCap / 2000000000000 * 100,
        fully_diluted_market_cap: crypto.marketCap * 1.3,
        last_updated: new Date().toISOString()
      }
    }
  }));
};