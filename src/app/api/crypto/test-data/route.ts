import { NextResponse } from 'next/server';
import { generateMockCryptoData } from '@/lib/mock-crypto-data';

export async function GET() {
  try {
    const mockData = generateMockCryptoData(20);
    
    // 模拟数据同步成功的响应
    return NextResponse.json({
      success: true,
      message: `Successfully generated ${mockData.length} test cryptocurrencies`,
      count: mockData.length,
      testMode: true,
      preview: mockData.slice(0, 3).map(crypto => ({
        name: crypto.name,
        symbol: crypto.symbol,
        price: crypto.quotes?.find(q => q.name === 'USD')?.price || 0,
        market_cap: crypto.quotes?.find(q => q.name === 'USD')?.marketCap || 0,
        rank: crypto.cmcRank || 999
      })),
      note: "This is test data. To store in database, please configure Supabase RLS policies."
    });
  } catch (error) {
    console.error('Error generating test data:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate test data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}