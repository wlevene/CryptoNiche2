import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's favorite cryptocurrencies with crypto details
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        crypto_id,
        created_at,
        cryptocurrencies:crypto_id (
          id,
          symbol,
          name,
          slug,
          cmc_rank,
          is_active
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch favorites' },
        { status: 500 }
      );
    }

    // Get latest prices for favorite cryptos
    const cryptoIds = data?.map(fav => fav.crypto_id) || [];
    
    if (cryptoIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0
      });
    }

    const { data: pricesData, error: pricesError } = await supabase
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
      .in('id', cryptoIds)
      .eq('is_active', true)
      .order('cmc_rank', { ascending: true });

    if (pricesError) {
      console.error('Error fetching prices:', pricesError);
    }

    // Combine favorites with price data
    const favoritesWithPrices = data?.map(fav => {
      const priceData = pricesData?.find(p => p.id === fav.crypto_id);
      // Merge crypto info with price data
      const mergedData = priceData ? {
        ...fav.cryptocurrencies,
        ...priceData
      } : fav.cryptocurrencies;
      
      return {
        crypto_id: fav.crypto_id,
        created_at: fav.created_at,
        top_cryptocurrencies: mergedData
      };
    }) || [];

    return NextResponse.json({
      success: true,
      data: favoritesWithPrices,
      count: favoritesWithPrices.length
    });

  } catch (error) {
    console.error('Error in favorites GET:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { crypto_id } = body;

    if (!crypto_id || typeof crypto_id !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Valid crypto_id is required' },
        { status: 400 }
      );
    }

    // Ensure user exists in users table (create if not exists)
    const { error: userUpsertError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email || '',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (userUpsertError) {
      console.error('Error upserting user:', userUpsertError);
      return NextResponse.json(
        { success: false, error: 'Failed to ensure user exists' },
        { status: 500 }
      );
    }

    // Check if cryptocurrency exists
    const { data: cryptoExists, error: cryptoError } = await supabase
      .from('cryptocurrencies')
      .select('id')
      .eq('id', crypto_id)
      .eq('is_active', true)
      .single();

    if (cryptoError || !cryptoExists) {
      return NextResponse.json(
        { success: false, error: 'Cryptocurrency not found' },
        { status: 404 }
      );
    }

    // Add to favorites (ignore if already exists due to unique constraint)
    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: user.id,
        crypto_id: crypto_id
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({
          success: false,
          error: 'Cryptocurrency is already in favorites'
        }, { status: 409 });
      }
      
      console.error('Error adding favorite:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to add favorite' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Cryptocurrency added to favorites'
    });

  } catch (error) {
    console.error('Error in favorites POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const crypto_id = parseInt(searchParams.get('crypto_id') || '');

    if (!crypto_id) {
      return NextResponse.json(
        { success: false, error: 'crypto_id parameter is required' },
        { status: 400 }
      );
    }

    // Remove from favorites
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('crypto_id', crypto_id);

    if (error) {
      console.error('Error removing favorite:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to remove favorite' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cryptocurrency removed from favorites'
    });

  } catch (error) {
    console.error('Error in favorites DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}