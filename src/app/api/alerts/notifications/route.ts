import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { AlertService } from '@/lib/alert-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const alertService = new AlertService();
    const notifications = await alertService.getUserNotifications(user.id, limit);

    return NextResponse.json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}