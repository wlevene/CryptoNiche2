import { NextResponse } from 'next/server';
import { marketDataService } from '@/lib/market-data-service';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    console.log('Testing data fetching...');
    
    // Test 1: Direct Supabase query
    const supabase = await createClient();
    const { data: directData, error: directError } = await supabase
      .from('top_cryptocurrencies')
      .select('id, symbol, name, price')
      .limit(5);
      
    console.log('Direct Supabase query:', { directData, directError });
    
    // Test 2: Through service
    const marketStats = await marketDataService.getMarketStats();
    const topCryptos = await marketDataService.getTopCryptocurrencies(5);
    
    console.log('Service results:', { marketStats, topCryptosCount: topCryptos.length });
    
    return NextResponse.json({
      success: true,
      directQuery: {
        data: directData,
        error: directError
      },
      serviceQuery: {
        marketStats,
        topCryptos
      }
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}