/**
 * 加密货币数据同步 API 路由
 * 基于 main.py 的逻辑实现，使用新的数据服务
 */

import { NextRequest, NextResponse } from 'next/server';
import { cryptoDataService } from '@/lib/crypto-data-service';

export async function POST(request: NextRequest) {
  try {
    // 开发环境下跳过认证，生产环境需要API密钥
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!isDevelopment) {
      const authHeader = request.headers.get('authorization');
      const expectedToken = process.env.MONITOR_API_TOKEN;
      
      if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
        return NextResponse.json({ error: '未授权访问' }, { status: 401 });
      }
    }

    // 获取请求参数
    const body = await request.json().catch(() => ({}));
    const { maxCount = 1000, force = false } = body;

    // 验证参数
    if (maxCount < 1 || maxCount > 5000) {
      return NextResponse.json(
        { error: 'maxCount must be between 1 and 5000' },
        { status: 400 }
      );
    }

    console.log(`开始手动数据同步，最大数量: ${maxCount}`);
    
    // 执行数据同步
    const result = await cryptoDataService.getAllCryptocurrenciesAndSave(100, maxCount);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '数据同步成功',
        data: {
          cryptoCount: result.cryptoCount,
          priceCount: result.priceCount,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || '数据同步失败'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('数据同步API错误:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '内部服务器错误'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // 简化GET响应，只提供使用说明
    const marketStats = null;
    const latestPrices = null;

    return NextResponse.json({
      success: true,
      message: 'Use POST method to sync cryptocurrency data',
      example: {
        method: 'POST',
        body: { maxCount: 1000 },
      },
      data: {
        marketStats,
        latestPrices: [],
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('获取同步状态失败:', error);
    return NextResponse.json({
      success: false,
      message: 'Use POST method to sync cryptocurrency data',
      error: error instanceof Error ? error.message : '获取数据失败'
    }, { status: 500 });
  }
}