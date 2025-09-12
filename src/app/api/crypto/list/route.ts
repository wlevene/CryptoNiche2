import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startRank = parseInt(searchParams.get('startRank') || '1');
    const endRank = parseInt(searchParams.get('endRank') || '100');
    const search = searchParams.get('search');

    const supabase = await createClient();

    let query = supabase
      .from('top_cryptocurrencies')
      .select(`
        id,
        symbol,
        name,
        price,
        market_cap,
        volume_24h,
        percent_change_24h,
        cmc_rank
      `)
      .eq('is_active', true)
      .not('cmc_rank', 'is', null)
      .order('cmc_rank', { ascending: true });

    if (search) {
      // Search by name or symbol
      query = query
        .or(`name.ilike.%${search}%,symbol.ilike.%${search}%`)
        .limit(50);
    } else {
      // Get by rank range - 修复：使用正确的 rank 范围过滤
      query = query
        .gte('cmc_rank', startRank)
        .lte('cmc_rank', endRank);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching cryptocurrencies:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch cryptocurrencies',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}