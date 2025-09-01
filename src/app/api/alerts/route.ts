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

    const alertService = new AlertService();
    const alerts = await alertService.getUserAlerts(user.id);

    return NextResponse.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch alerts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const {
      crypto_id,
      alert_type,
      threshold_percentage,
      threshold_price,
      direction,
      notification_frequency
    } = body;

    // 验证必需字段
    if (!crypto_id || !alert_type) {
      return NextResponse.json(
        { error: 'Missing required fields: crypto_id, alert_type' },
        { status: 400 }
      );
    }

    // 验证告警类型特定字段
    if (alert_type === 'price_change' && !threshold_percentage) {
      return NextResponse.json(
        { error: 'threshold_percentage is required for price_change alerts' },
        { status: 400 }
      );
    }

    if (alert_type === 'price_threshold' && !threshold_price) {
      return NextResponse.json(
        { error: 'threshold_price is required for price_threshold alerts' },
        { status: 400 }
      );
    }

    const alertService = new AlertService();
    const alert = await alertService.createAlert({
      user_id: user.id,
      crypto_id,
      alert_type,
      threshold_percentage,
      threshold_price,
      direction: direction || 'both',
      notification_frequency: notification_frequency || 'immediate',
    });

    return NextResponse.json({
      success: true,
      message: 'Alert created successfully',
      data: alert,
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create alert',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}