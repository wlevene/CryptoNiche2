import { NextRequest, NextResponse } from 'next/server';
import { CryptoRepository } from '@/lib/services/database/crypto-repository';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cryptoId = parseInt(params.id);
    
    if (isNaN(cryptoId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid cryptocurrency ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const interval = searchParams.get('interval') || '1h';

    // Validate days parameter (1-365)
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { success: false, error: 'Days parameter must be between 1 and 365' },
        { status: 400 }
      );
    }

    const cryptoRepository = new CryptoRepository();
    
    // For now, use the existing getPriceHistory method
    // In the future, you could enhance this to support different intervals
    const priceHistory = await cryptoRepository.getPriceHistory(cryptoId, days);

    return NextResponse.json({
      success: true,
      data: priceHistory,
      meta: {
        cryptoId,
        days,
        interval,
        count: priceHistory.length,
      },
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch price history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}