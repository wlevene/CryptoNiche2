import { NextRequest, NextResponse } from 'next/server';
import { cryptoDataService } from '@/lib/crypto-data-service';

/**
 * 测试单次获取并写入Supabase数据的功能
 * POST /api/crypto/test-single-sync
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 开始测试单次数据同步...');
    
    // 获取请求参数
    const body = await request.json().catch(() => ({}));
    const { batchSize = 100, maxCount = 200 } = body; // 测试时只获取200个币种
    
    console.log(`测试参数: batchSize=${batchSize}, maxCount=${maxCount}`);
    
    // 执行单次数据获取和保存
    const startTime = Date.now();
    const result = await cryptoDataService.getAllCryptocurrenciesAndSave(batchSize, maxCount);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('🧪 测试完成:', result);
    
    return NextResponse.json({
      success: true,
      message: '单次数据同步测试完成',
      result: {
        ...result,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      },
      testParams: {
        batchSize,
        maxCount
      }
    });
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: '单次数据同步测试失败',
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * 获取测试状态信息
 * GET /api/crypto/test-single-sync
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: '单次数据同步测试API已就绪',
      usage: {
        method: 'POST',
        description: '测试单次获取并写入Supabase数据的功能',
        parameters: {
          batchSize: '每批次获取的数量，默认100',
          maxCount: '最大获取数量，默认200（测试用）'
        },
        example: {
          batchSize: 100,
          maxCount: 200
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}