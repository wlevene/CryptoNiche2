/**
 * 系统状态监控 API
 * 显示应用初始化状态和各服务运行情况
 */

import { NextRequest, NextResponse } from 'next/server';
import { appInitializer } from '@/lib/app-initializer';
import { priceMonitor } from '@/lib/price-monitor';
import { cryptoDataService } from '@/lib/crypto-data-service';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'reinit') {
      // 手动重新初始化
      await appInitializer.reinitialize();
      return NextResponse.json({
        success: true,
        message: '重新初始化完成',
        timestamp: new Date().toISOString()
      });
    }

    // 获取系统状态
    const initStatus = appInitializer.getStatus();
    const alertStats = await priceMonitor.getAlertStats();
    
    // 获取数据库状态
    let dbStatus = {
      hasData: false,
      lastSync: null,
      cryptoCount: 0,
      error: null
    };

    try {
      const marketStats = await cryptoDataService.getMarketStats();
      const latestPrices = await cryptoDataService.getLatestPrices(1);
      
      dbStatus = {
        hasData: !!latestPrices && latestPrices.length > 0,
        lastSync: latestPrices?.[0]?.timestamp || null,
        cryptoCount: marketStats?.activeCryptocurrencies || 0,
        error: null
      };
    } catch (error: any) {
      dbStatus.error = error.message;
    }

    return NextResponse.json({
      success: true,
      status: {
        application: {
          isInitialized: initStatus.isInitialized,
          isInitializing: initStatus.isInitializing,
          uptime: process.uptime(),
        },
        database: dbStatus,
        monitoring: {
          isRunning: alertStats.isRunning,
          activeAlerts: alertStats.activeAlerts,
          todayTriggered: alertStats.todayTriggered,
        },
        services: {
          dataSync: 'scheduled', // 定时任务状态
          priceMonitor: alertStats.isRunning ? 'running' : 'standby',
        }
      },
      actions: {
        reinitialize: '/api/system/status?action=reinit',
        manualSync: '/api/crypto/sync',
        testSync: '/api/crypto/test-sync',
        startMonitoring: '/api/crypto/monitor'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('获取系统状态失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取状态失败'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action } = body;

    switch (action) {
      case 'reinitialize':
        await appInitializer.reinitialize();
        return NextResponse.json({
          success: true,
          message: '应用重新初始化完成'
        });

      case 'sync':
        const syncResult = await cryptoDataService.syncCryptocurrencyData(100);
        return NextResponse.json({
          success: syncResult.success,
          message: syncResult.success ? '数据同步完成' : '数据同步失败',
          data: syncResult
        });

      case 'test-sync':
        const response = await fetch('/api/crypto/test-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const result = await response.json();
        return NextResponse.json(result);

      default:
        return NextResponse.json({
          success: false,
          error: '无效的操作类型'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('系统操作失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '操作失败'
    }, { status: 500 });
  }
}