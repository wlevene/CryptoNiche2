import { NextRequest, NextResponse } from 'next/server';
import { cryptoDataService } from '@/lib/crypto-data-service';

/**
 * 使用模拟数据测试保存到Supabase的功能
 * POST /api/crypto/test-mock-sync
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 开始测试模拟数据同步...');
    
    // 创建模拟的CMC数据
    const mockData: any[] = [
      {
        id: 1,
        name: 'Bitcoin',
        symbol: 'BTC',
        slug: 'bitcoin',
        cmcRank: 1,
        marketPairCount: 500,
        circulatingSupply: 19000000,
        totalSupply: 21000000,
        maxSupply: 21000000,
        ath: 69000,
        atl: 0.05,
        high24h: 45000,
        low24h: 43000,
        isActive: 1,
        lastUpdated: new Date().toISOString(),
        dateAdded: '2009-01-03T00:00:00Z',
        quotes: [{
          name: 'USD',
          price: 44000,
          volume24h: 25000000000,
          volume7d: 175000000000,
          volume30d: 750000000000,
          marketCap: 836000000000,
          percentChange1h: 0.5,
          percentChange24h: 2.3,
          percentChange7d: -1.2,
          percentChange30d: 5.8,
          percentChange60d: 12.4,
          percentChange90d: -8.7,
          dominance: 42.5,
          turnover: 0.03,
          ytdPriceChangePercentage: 15.6,
          percentChange1y: 125.4
        }]
      },
      {
        id: 1027,
        name: 'Ethereum',
        symbol: 'ETH',
        slug: 'ethereum',
        cmcRank: 2,
        marketPairCount: 300,
        circulatingSupply: 120000000,
        totalSupply: 120000000,
        maxSupply: null,
        ath: 4800,
        atl: 0.43,
        high24h: 2600,
        low24h: 2500,
        isActive: 1,
        lastUpdated: new Date().toISOString(),
        dateAdded: '2015-08-07T00:00:00Z',
        quotes: [{
          name: 'USD',
          price: 2550,
          volume24h: 15000000000,
          volume7d: 105000000000,
          volume30d: 450000000000,
          marketCap: 306000000000,
          percentChange1h: -0.2,
          percentChange24h: 1.8,
          percentChange7d: 3.5,
          percentChange30d: -2.1,
          percentChange60d: 8.9,
          percentChange90d: 15.2,
          dominance: 18.7,
          turnover: 0.05,
          ytdPriceChangePercentage: 45.3,
          percentChange1y: 89.6
        }]
      }
    ];

    // 为了兼容当前数据库结构，我们需要创建一个临时的转换函数
    const transformForCurrentDB = (crypto: any) => {
      const quote = crypto.quotes?.[0];
      return {
        id: crypto.id,
        symbol: crypto.symbol,
        name: crypto.name,
        rank: crypto.cmcRank || 1, // 为当前数据库的rank字段提供值
        price: quote?.price || 0,
        market_cap: quote?.marketCap ? Math.round(quote.marketCap) : null,
        volume_24h: quote?.volume24h ? Math.round(quote.volume24h) : null,
        change_24h: quote?.percentChange24h || null,
        image_url: null,
        updated_at: new Date().toISOString(),
        // 新字段
        slug: crypto.slug,
        cmc_rank: crypto.cmcRank || null,
        num_market_pairs: crypto.marketPairCount || null,
        circulating_supply: crypto.circulatingSupply || null,
        total_supply: crypto.totalSupply || null,
        max_supply: crypto.maxSupply,
        ath: crypto.ath || null,
        atl: crypto.atl || null,
        date_added: crypto.dateAdded ? new Date(crypto.dateAdded).toISOString() : null,
        is_active: crypto.isActive === 1,
      };
    };

    const mockCryptos = mockData.map(transformForCurrentDB);
    
    console.log(`准备保存 ${mockCryptos.length} 个模拟加密货币数据`);
    
    // 直接使用 Supabase 客户端保存数据（兼容当前数据库结构）
    const { createAdminClient } = await import('@/lib/supabase-admin');
    const supabase = createAdminClient();
    
    const startTime = Date.now();
    
    // 保存加密货币基础信息
    const { data: cryptoData, error: cryptoError } = await supabase
      .from('cryptocurrencies')
      .upsert(mockCryptos, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select();

    if (cryptoError) {
      console.error('保存加密货币数据失败:', cryptoError);
      return NextResponse.json({
        success: false,
        cryptoCount: 0,
        priceCount: 0,
        error: cryptoError.message
      });
    }

    // 创建价格数据
    const priceData = mockData.map(crypto => {
      const quote = crypto.quotes?.[0];
      return {
        crypto_id: crypto.id,
        price_usd: quote?.price || 0,
        volume_24h: quote?.volume24h || null,
        market_cap: quote?.marketCap || null,
        percent_change_1h: quote?.percentChange1h || null,
        percent_change_24h: quote?.percentChange24h || null,
        percent_change_7d: quote?.percentChange7d || null,
        percent_change_30d: quote?.percentChange30d || null,
        percent_change_60d: quote?.percentChange60d || null,
        percent_change_90d: quote?.percentChange90d || null,
        percent_change_1y: quote?.percentChange1y || null,
        dominance: quote?.dominance || null,
        turnover: quote?.turnover || null,
        high_24h: crypto.high24h || null,
        low_24h: crypto.low24h || null,
        ytd_price_change_percentage: quote?.ytdPriceChangePercentage || null,
        timestamp: new Date().toISOString()
      };
    });

    // 保存价格数据
    const { data: priceResult, error: priceError } = await supabase
      .from('crypto_prices')
      .insert(priceData)
      .select();

    if (priceError) {
      console.error('保存价格数据失败:', priceError);
      // 价格数据失败不影响整体结果
    }

    const result = {
      success: true,
      cryptoCount: cryptoData?.length || 0,
      priceCount: priceResult?.length || 0
    };
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('🧪 模拟数据测试完成:', result);
    
    return NextResponse.json({
      success: true,
      message: '模拟数据同步测试完成',
      result: {
        ...result,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      },
      mockData: {
        cryptoCount: mockCryptos.length,
        cryptos: mockCryptos.map(c => ({ id: c.id, name: c.name, symbol: c.symbol, rank: c.rank }))
      }
    });
    
  } catch (error) {
    console.error('❌ 模拟数据测试失败:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: '模拟数据同步测试失败',
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * 获取模拟测试状态信息
 * GET /api/crypto/test-mock-sync
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: '模拟数据同步测试API已就绪',
      description: '使用预定义的模拟数据测试保存到Supabase的功能',
      mockDataInfo: {
        cryptoCount: 3,
        cryptos: [
          { id: 1, name: 'Bitcoin', symbol: 'BTC', rank: 1 },
          { id: 1027, name: 'Ethereum', symbol: 'ETH', rank: 2 },
          { id: 825, name: 'Tether', symbol: 'USDT', rank: 3 }
        ]
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}