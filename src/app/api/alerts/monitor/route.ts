import { NextRequest, NextResponse } from 'next/server';
import { PriceMonitor } from '@/lib/price-monitor';

export async function POST(request: NextRequest) {
  try {
    // 验证请求来源（简单的API密钥验证）
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.MONITOR_API_TOKEN || 'monitor-secret-token';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const priceMonitor = new PriceMonitor();
    
    // 监控价格变化
    await priceMonitor.monitorPriceChanges();
    
    // 处理待发送通知
    await priceMonitor.processPendingNotifications();

    return NextResponse.json({
      success: true,
      message: 'Price monitoring completed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in price monitoring API:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Price monitoring failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Price monitoring endpoint',
    usage: 'POST with Bearer token to trigger monitoring',
    status: 'ready',
  });
}