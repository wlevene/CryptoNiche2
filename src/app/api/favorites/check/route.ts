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

    const { searchParams } = new URL(request.url);
    const cryptoIdsParam = searchParams.get('crypto_ids');

    if (!cryptoIdsParam) {
      return NextResponse.json(
        { success: false, error: 'crypto_ids parameter is required' },
        { status: 400 }
      );
    }

    // Parse crypto IDs
    const cryptoIds = cryptoIdsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    if (cryptoIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {},
        count: 0
      });
    }

    // Check which cryptos are favorited by user
    const { data, error } = await supabase
      .from('user_favorites')
      .select('crypto_id')
      .eq('user_id', user.id)
      .in('crypto_id', cryptoIds);

    if (error) {
      console.error('Error checking favorites:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to check favorites' },
        { status: 500 }
      );
    }

    // Convert to object for easy lookup
    const favoritesMap = data?.reduce((acc, item) => {
      acc[item.crypto_id] = true;
      return acc;
    }, {} as Record<number, boolean>) || {};

    return NextResponse.json({
      success: true,
      data: favoritesMap,
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Error in favorites check:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}