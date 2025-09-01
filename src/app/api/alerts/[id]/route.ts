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

    const body = await request.json();
    const alertService = new AlertService();
    const resolvedParams = await params;
    
    const alert = await alertService.updateAlert(resolvedParams.id, body);

    return NextResponse.json({
      success: true,
      message: 'Alert updated successfully',
      data: alert,
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update alert',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const alertService = new AlertService();
    const resolvedParams = await params;
    await alertService.deleteAlert(resolvedParams.id);

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete alert',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}