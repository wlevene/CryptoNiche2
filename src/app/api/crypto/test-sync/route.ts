import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

// Mock cryptocurrency base data (for cryptocurrencies table)
const mockCryptoData = [
  {
    id: 1,
    symbol: 'BTC',
    name: 'Bitcoin',
    slug: 'bitcoin',
    cmc_rank: 1,
    is_active: true,
    date_added: '2010-07-13T00:00:00.000Z',
  },
  {
    id: 1027,
    symbol: 'ETH',
    name: 'Ethereum',
    slug: 'ethereum',
    cmc_rank: 2,
    is_active: true,
    date_added: '2015-08-07T00:00:00.000Z',
  },
  {
    id: 825,
    symbol: 'USDT',
    name: 'Tether',
    slug: 'tether',
    cmc_rank: 3,
    is_active: true,
    date_added: '2015-02-25T00:00:00.000Z',
  },
  {
    id: 1839,
    symbol: 'BNB',
    name: 'BNB',
    slug: 'bnb',
    cmc_rank: 4,
    is_active: true,
    date_added: '2017-07-25T00:00:00.000Z',
  },
  {
    id: 5426,
    symbol: 'SOL',
    name: 'Solana',
    slug: 'solana',
    cmc_rank: 5,
    is_active: true,
    date_added: '2020-04-10T00:00:00.000Z',
  },
  {
    id: 2010,
    symbol: 'ADA',
    name: 'Cardano',
    slug: 'cardano',
    cmc_rank: 11,
    is_active: true,
    date_added: '2017-10-01T00:00:00.000Z',
  },
];

// Mock top cryptocurrencies data (for top_cryptocurrencies table)
const mockTopCryptoData = [
  {
    id: 1,
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 67841.23,
    market_cap: 1340000000000,
    volume_24h: 28500000000,
    percent_change_24h: 2.34,
    cmc_rank: 1,
    is_active: true,
  },
  {
    id: 1027,
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3456.78,
    market_cap: 415600000000,
    volume_24h: 15200000000,
    percent_change_24h: -1.23,
    cmc_rank: 2,
    is_active: true,
  },
  {
    id: 825,
    symbol: 'USDT',
    name: 'Tether',
    price: 1.00,
    market_cap: 95000000000,
    volume_24h: 45000000000,
    percent_change_24h: 0.01,
    cmc_rank: 3,
    is_active: true,
  },
  {
    id: 1839,
    symbol: 'BNB',
    name: 'BNB',
    price: 592.45,
    market_cap: 88700000000,
    volume_24h: 2100000000,
    percent_change_24h: 0.89,
    cmc_rank: 4,
    is_active: true,
  },
  {
    id: 5426,
    symbol: 'SOL',
    name: 'Solana',
    price: 178.92,
    market_cap: 82100000000,
    volume_24h: 3800000000,
    percent_change_24h: -1.23,
    cmc_rank: 5,
    is_active: true,
  },
  {
    id: 2010,
    symbol: 'ADA',
    name: 'Cardano',
    price: 0.625,
    market_cap: 22000000000,
    volume_24h: 820000000,
    percent_change_24h: 3.45,
    cmc_rank: 11,
    is_active: true,
  },
];

// Mock price history data (for crypto_prices table)
const mockPriceData = [
  {
    crypto_id: 1,
    price_usd: 67841.23,
    price_btc: 1,
    price_eth: 19.63,
    volume_24h: 28500000000,
    volume_7d: 199500000000,
    volume_30d: 855000000000,
    market_cap: 1340000000000,
    percent_change_1h: 0.23,
    percent_change_24h: 2.34,
    percent_change_7d: 5.67,
    percent_change_30d: 12.34,
    percent_change_60d: 25.67,
    percent_change_90d: 45.23,
    percent_change_1y: 156.78,
    dominance: 54.7,
    turnover: 0.021,
    high_24h: 68234.56,
    low_24h: 66543.21,
    ytd_price_change_percentage: 89.34,
    timestamp: new Date().toISOString(),
  },
  {
    crypto_id: 1027,
    price_usd: 3456.78,
    price_btc: 0.0509,
    price_eth: 1,
    volume_24h: 15200000000,
    volume_7d: 106400000000,
    volume_30d: 456000000000,
    market_cap: 415600000000,
    percent_change_1h: -0.15,
    percent_change_24h: -1.23,
    percent_change_7d: 3.45,
    percent_change_30d: 8.67,
    percent_change_60d: 15.23,
    percent_change_90d: 28.90,
    percent_change_1y: 67.89,
    dominance: 17.8,
    turnover: 0.037,
    high_24h: 3512.34,
    low_24h: 3398.67,
    ytd_price_change_percentage: 45.67,
    timestamp: new Date().toISOString(),
  },
  {
    crypto_id: 825,
    price_usd: 1.00,
    price_btc: 0.0000147,
    price_eth: 0.000289,
    volume_24h: 45000000000,
    volume_7d: 315000000000,
    volume_30d: 1350000000000,
    market_cap: 95000000000,
    percent_change_1h: 0.00,
    percent_change_24h: 0.01,
    percent_change_7d: -0.02,
    percent_change_30d: 0.15,
    percent_change_60d: 0.25,
    percent_change_90d: 0.12,
    percent_change_1y: 0.05,
    dominance: 3.9,
    turnover: 0.47,
    high_24h: 1.001,
    low_24h: 0.999,
    ytd_price_change_percentage: 0.1,
    timestamp: new Date().toISOString(),
  },
  {
    crypto_id: 1839,
    price_usd: 592.45,
    price_btc: 0.00873,
    price_eth: 0.171,
    volume_24h: 2100000000,
    volume_7d: 14700000000,
    volume_30d: 63000000000,
    market_cap: 88700000000,
    percent_change_1h: 0.12,
    percent_change_24h: 0.89,
    percent_change_7d: 2.15,
    percent_change_30d: 4.67,
    percent_change_60d: 8.23,
    percent_change_90d: 12.45,
    percent_change_1y: 89.34,
    dominance: 3.6,
    turnover: 0.024,
    high_24h: 598.12,
    low_24h: 585.67,
    ytd_price_change_percentage: 67.8,
    timestamp: new Date().toISOString(),
  },
  {
    crypto_id: 5426,
    price_usd: 178.92,
    price_btc: 0.00264,
    price_eth: 0.0518,
    volume_24h: 3800000000,
    volume_7d: 26600000000,
    volume_30d: 114000000000,
    market_cap: 82100000000,
    percent_change_1h: -0.34,
    percent_change_24h: -1.23,
    percent_change_7d: -5.67,
    percent_change_30d: 15.89,
    percent_change_60d: 45.67,
    percent_change_90d: 89.23,
    percent_change_1y: 234.56,
    dominance: 3.4,
    turnover: 0.046,
    high_24h: 182.34,
    low_24h: 175.89,
    ytd_price_change_percentage: 156.78,
    timestamp: new Date().toISOString(),
  },
  {
    crypto_id: 2010,
    price_usd: 0.625,
    price_btc: 0.0000092,
    price_eth: 0.000181,
    volume_24h: 820000000,
    volume_7d: 5740000000,
    volume_30d: 24600000000,
    market_cap: 22000000000,
    percent_change_1h: 0.56,
    percent_change_24h: 3.45,
    percent_change_7d: -2.34,
    percent_change_30d: -12.45,
    percent_change_60d: -23.67,
    percent_change_90d: 34.56,
    percent_change_1y: -45.67,
    dominance: 1.4,
    turnover: 0.034,
    high_24h: 0.6398,
    low_24h: 0.6156,
    ytd_price_change_percentage: -28.9,
    timestamp: new Date().toISOString(),
  }
];

const mockMarketData = {
  total_market_cap: 2450000000000,
  total_volume_24h: 89200000000,
  btc_dominance: 54.7,
  eth_dominance: 17.8,
  active_cryptocurrencies: 12847,
  total_cryptocurrencies: 15000,
  timestamp: new Date().toISOString(),
};

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    console.log('开始测试数据同步...');

    // 1. 插入基础加密货币数据
    const { data: cryptoResult, error: cryptoError } = await supabase
      .from('cryptocurrencies')
      .upsert(mockCryptoData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select();

    if (cryptoError) {
      console.error('Crypto insert error:', cryptoError);
      throw new Error(`插入加密货币数据失败: ${cryptoError.message}`);
    }

    console.log(`成功插入 ${cryptoResult?.length || 0} 个加密货币`);

    // 2. 插入价格数据 (skip top_cryptocurrencies as it's a view)
    const { data: priceResult, error: priceError } = await supabase
      .from('crypto_prices')
      .insert(mockPriceData)
      .select();

    if (priceError) {
      console.error('Price insert error:', priceError);
      // 价格数据插入失败不是关键错误，继续执行
      console.log(`警告：价格数据插入失败: ${priceError.message}`);
    } else {
      console.log(`成功插入 ${priceResult?.length || 0} 条价格数据`);
    }

    // 3. 插入市场数据
    const { data: marketResult, error: marketError } = await supabase
      .from('crypto_market_data')
      .upsert([mockMarketData], { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select();

    if (marketError) {
      console.log(`警告：市场数据插入失败: ${marketError.message}`);
    } else {
      console.log(`成功插入市场数据`);
    }

    return NextResponse.json({
      success: true,
      message: '测试数据同步成功',
      result: {
        cryptocurrencies: cryptoResult?.length || 0,
        prices: priceResult?.length || 0,
        marketData: marketResult?.length || 0,
      }
    });

  } catch (error: any) {
    console.error('测试数据同步失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '未知错误',
        details: error 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: '使用 POST 方法来同步测试数据',
    endpoint: '/api/crypto/test-sync',
    method: 'POST'
  });
}