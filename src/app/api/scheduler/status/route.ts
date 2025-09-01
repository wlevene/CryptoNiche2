/**
 * 定时任务状态查询 API
 * 返回所有定时任务的配置和状态
 */

import { NextResponse } from 'next/server';
import { getSchedulerStatus } from '@/lib/config/scheduler.config';
import { appInitializer } from '@/lib/app-initializer';

export async function GET() {
  try {
    // 获取定时任务状态
    const schedulerStatus = getSchedulerStatus();
    
    // 获取应用初始化状态
    const initStatus = appInitializer.getStatus();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      initialization: {
        isInitialized: initStatus.isInitialized,
        isInitializing: initStatus.isInitializing,
      },
      schedulers: schedulerStatus,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        autoInitData: process.env.AUTO_INIT_DATA,
        autoSyncEnabled: process.env.AUTO_SYNC_ENABLED,
      },
      message: initStatus.isInitialized ? 
        '所有定时任务正在运行' : 
        '定时任务未初始化，请检查配置'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取状态失败'
    }, { status: 500 });
  }
}