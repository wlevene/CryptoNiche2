import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cryptoId = parseInt(id);
    
    if (isNaN(cryptoId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid cryptocurrency ID' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // First, let's check if the cryptocurrency exists
    const { data: cryptoData, error: cryptoError } = await supabase
      .from('cryptocurrencies')
      .select('*')
      .eq('id', cryptoId)
      .eq('is_active', true)
      .single();
      
    if (cryptoError || !cryptoData) {
      console.error('Crypto not found in cryptocurrencies table:', cryptoId, cryptoError);
      return NextResponse.json(
        { success: false, error: 'Cryptocurrency not found' },
        { status: 404 }
      );
    }
    
    // Then get the latest price data
    const { data: priceData, error: priceError } = await supabase
      .from('crypto_prices')
      .select('*')
      .eq('crypto_id', cryptoId)
      .eq('quote_currency', 'USD')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
      
    // Combine the data
    const data = {
      ...cryptoData,
      price: priceData?.price || 0,
      market_cap: priceData?.market_cap || 0,
      volume_24h: priceData?.volume_24h || 0,
      percent_change_24h: priceData?.percent_change_24h || 0,
      percent_change_7d: priceData?.percent_change_7d || 0,
      percent_change_30d: priceData?.percent_change_30d || 0
    };
    
    if (!data) {
      console.error('No data returned for crypto ID:', cryptoId);
      return NextResponse.json(
        { success: false, error: 'Cryptocurrency not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error('Error fetching cryptocurrency details:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch cryptocurrency details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}