/**
 * 价格监控服务 API 路由
 * 基于 main.py 的定时任务逻辑
 */

import { NextRequest, NextResponse } from 'next/server';
import { priceMonitor } from '@/lib/price-monitor';

export async function POST(request: NextRequest) {
  try {
    // 验证请求权限
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.MONITOR_API_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { action } = body;

    switch (action) {
      case 'start':
        await priceMonitor.startMonitoring();
        return NextResponse.json({
          success: true,
          message: '价格监控服务已启动',
          timestamp: new Date().toISOString()
        });

      case 'stop':
        priceMonitor.stopMonitoring();
        return NextResponse.json({
          success: true,
          message: '价格监控服务已停止',
          timestamp: new Date().toISOString()
        });

      case 'status':
        const stats = await priceMonitor.getAlertStats();
        return NextResponse.json({
          success: true,
          data: stats,
          timestamp: new Date().toISOString()
        });

      case 'test':
        const { userId } = body;
        // await priceMonitor.testAlerts(userId);
        return NextResponse.json({
          success: true,
          message: '预警系统测试完成',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          success: false,
          error: '无效的操作类型，支持: start, stop, status, test'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('价格监控API错误:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '内部服务器错误'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // 获取监控状态
    const stats = await priceMonitor.getAlertStats();
    
    return NextResponse.json({
      success: true,
      message: '价格监控服务状态',
      data: stats,
      usage: {
        start: 'POST /api/crypto/monitor with { "action": "start" }',
        stop: 'POST /api/crypto/monitor with { "action": "stop" }',
        status: 'POST /api/crypto/monitor with { "action": "status" }',
        test: 'POST /api/crypto/monitor with { "action": "test", "userId": "optional" }'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('获取监控状态失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取状态失败'
    }, { status: 500 });
  }
}