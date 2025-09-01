import { NextRequest, NextResponse } from 'next/server';
import { CryptocurrencyService } from '@/lib/crypto-db';
import { generateMockCryptoData } from '@/lib/mock-crypto-data';
import { CoinMarketCapAPI } from '@/lib/crypto-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { maxCount = 20 } = body;

    // Validate maxCount
    if (maxCount < 1 || maxCount > 100) {
      return NextResponse.json(
        { error: 'maxCount must be between 1 and 100 for test mode' },
        { status: 400 }
      );
    }

    console.log('Starting test cryptocurrency data sync with mock data...');

    const cryptoService = new CryptocurrencyService();
    
    // Generate mock cryptocurrency data
    const mockData = generateMockCryptoData(maxCount);
    console.log(`Generated ${mockData.length} mock cryptocurrencies`);

    // Transform to database format
    const dbData = mockData.map(crypto => 
      CoinMarketCapAPI.transformToDbFormat(crypto)
    );

    // Save to database
    const result = await cryptoService.upsertCryptocurrencies(dbData);
    
    console.log(`Successfully synced ${result.length} test cryptocurrencies to database`);

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${result.length} test cryptocurrencies`,
      count: result.length,
      testMode: true,
    });
  } catch (error) {
    console.error('Error in crypto sync test API:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to sync test cryptocurrency data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to sync test cryptocurrency data',
    example: {
      method: 'POST',
      body: { maxCount: 20 },
    },
    note: 'This endpoint uses mock data for testing purposes'
  });
}