/**
 * 使用本地数据测试加密货币数据处理和写入功能
 * 参考 Python 代码保存的数据文件
 */

import { NextRequest, NextResponse } from 'next/server';
import { cryptoDataService } from '@/lib/crypto-data-service';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('开始使用本地数据测试数据处理功能...');
    
    // 使用模拟数据进行测试
    const mockData = {
      data: {
        cryptoCurrencyList: [
          {
            id: 1,
            name: "Bitcoin",
            symbol: "BTC",
            slug: "bitcoin",
            cmcRank: 1,
            marketPairCount: 12288,
            circulatingSupply: 19908762.0,
            totalSupply: 19908762.0,
            maxSupply: 21000000.0,
            ath: 124457.11687036631,
            atl: 0.04864654,
            high24h: 116095.26799603399,
            low24h: 112730.39868874536,
            isActive: 1,
            lastUpdated: "2025-08-20T01:09:00.000Z",
            dateAdded: "2010-07-13T00:00:00.000Z",
            quotes: [
              {
                name: "USD",
                price: 113456.78,
                volume24h: 36651234567.89,
                volume7d: 196582395914.21,
                volume30d: 970003340076.62,
                marketCap: 2258344076608.41,
                percentChange1h: 0.12,
                percentChange24h: 2.34,
                percentChange7d: -1.23,
                percentChange30d: 15.67,
                percentChange60d: 25.89,
                percentChange90d: 45.12,
                lastUpdated: "2025-08-20T01:09:00.000Z",
                dominance: 59.2283,
                turnover: 0.03230417,
                ytdPriceChangePercentage: 20.0487,
                percentChange1y: 86.96826196
              }
            ]
          }
        ]
      }
    };
    
    const cryptocurrencies = mockData.data.cryptoCurrencyList;
    console.log(`使用模拟数据测试 ${cryptocurrencies.length} 个加密货币数据`);
    
    // 直接调用数据转换和保存逻辑
    const transformedCryptos = cryptocurrencies.map(crypto => 
      (cryptoDataService as any).transformCryptoData(crypto)
    );
    const transformedPrices = cryptocurrencies.map(crypto => 
      (cryptoDataService as any).transformPriceData(crypto)
    ).filter(Boolean);
    
    console.log('转换后的加密货币数据:', transformedCryptos.length);
    console.log('转换后的价格数据:', transformedPrices.length);
    
    // 保存到数据库
    await cryptoDataService.upsertCryptocurrencies(transformedCryptos);
    await cryptoDataService.insertPriceData(transformedPrices);
    
    const result = {
      success: true,
      cryptoCount: transformedCryptos.length,
      priceCount: transformedPrices.length
    };
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '模拟数据测试成功',
        data: {
          cryptoCount: result.cryptoCount,
          priceCount: result.priceCount,
          timestamp: new Date().toISOString()
        }
      });
    }
    
  } catch (error) {
    console.error('本地数据测试失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '内部服务器错误'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: '使用 POST 方法测试本地数据处理功能',
    description: '此接口使用 Python 代码保存的本地数据来测试数据处理和写入逻辑',
    usage: {
      method: 'POST',
      endpoint: '/api/crypto/test-with-local-data'
    }
  });
}