import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { AlertService } from '@/lib/alert-service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { is_active } = await request.json();

    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'is_active must be a boolean' },
        { status: 400 }
      );
    }

    const alertService = new AlertService();
    const resolvedParams = await params;
    const alert = await alertService.toggleAlert(resolvedParams.id, is_active);

    return NextResponse.json({
      success: true,
      message: `Alert ${is_active ? 'activated' : 'deactivated'} successfully`,
      data: alert,
    });
  } catch (error) {
    console.error('Error toggling alert:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to toggle alert',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}