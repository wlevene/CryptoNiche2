import { NextResponse } from 'next/server';
import { CryptocurrencyService } from '@/lib/crypto-db';

export async function GET() {
  try {
    const cryptoService = new CryptocurrencyService();
    const stats = await cryptoService.getMarketStats();

    // Format numbers for display
    const formatNumber = (num: number) => {
      if (num >= 1e12) {
        return `${(num / 1e12).toFixed(2)}T`;
      } else if (num >= 1e9) {
        return `${(num / 1e9).toFixed(2)}B`;
      } else if (num >= 1e6) {
        return `${(num / 1e6).toFixed(2)}M`;
      } else {
        return num.toLocaleString();
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        totalMarketCap: {
          value: stats.totalMarketCap,
          formatted: `$${formatNumber(stats.totalMarketCap)}`,
        },
        total24hVolume: {
          value: stats.total24hVolume,
          formatted: `$${formatNumber(stats.total24hVolume)}`,
        },
        activeCryptocurrencies: stats.activeCryptocurrencies,
        btcDominance: {
          value: stats.btcDominance,
          formatted: `${stats.btcDominance.toFixed(1)}%`,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching market stats:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch market statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}