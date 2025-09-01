/**
 * 价格历史聚合测试 API 路由
 * 测试价格历史数据聚合功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { cryptoDataService } from '@/lib/crypto-data-service';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 开始测试价格历史聚合功能...');
    
    // 获取请求参数
    const body = await request.json().catch(() => ({}));
    const { action = 'aggregate', cleanup = false } = body;
    
    const supabase = createAdminClient();
    
    if (action === 'aggregate') {
      // 手动触发价格历史聚合
      console.log('📊 手动触发价格历史数据聚合...');
      await (cryptoDataService as any).aggregatePriceHistory();
      
      // 查询聚合结果
      const { data: historyData, error: historyError } = await supabase
        .from('price_history')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);
      
      if (historyError) {
        console.error('查询价格历史数据失败:', historyError);
        return NextResponse.json({
          success: false,
          error: '查询价格历史数据失败: ' + historyError.message
        }, { status: 500 });
      }
      
      // 统计不同间隔类型的数据量
      const { data: stats, error: statsError } = await supabase
        .from('price_history')
        .select('interval_type')
        .then(result => {
          if (result.error) return result;
          
          const counts = result.data?.reduce((acc: any, item: any) => {
            acc[item.interval_type] = (acc[item.interval_type] || 0) + 1;
            return acc;
          }, {}) || {};
          
          return { data: counts, error: null };
        });
      
      return NextResponse.json({
        success: true,
        message: '价格历史聚合测试完成',
        data: {
          latest_records: historyData || [],
          interval_stats: stats || {},
          total_records: historyData?.length || 0,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    if (action === 'status') {
      // 查询价格历史表状态
      const { data: historyCount, error: countError } = await supabase
        .from('price_history')
        .select('*', { count: 'exact', head: true });
      
      const { data: priceCount, error: priceError } = await supabase
        .from('crypto_prices')
        .select('*', { count: 'exact', head: true });
      
      const { data: intervalStats, error: intervalError } = await supabase
        .from('price_history')
        .select('interval_type')
        .then(result => {
          if (result.error) return result;
          
          const counts = result.data?.reduce((acc: any, item: any) => {
            acc[item.interval_type] = (acc[item.interval_type] || 0) + 1;
            return acc;
          }, {}) || {};
          
          return { data: counts, error: null };
        });
      
      return NextResponse.json({
        success: true,
        message: '价格历史表状态查询完成',
        data: {
          price_history_count: historyCount?.length || 0,
          crypto_prices_count: priceCount?.length || 0,
          interval_stats: intervalStats || {},
          errors: {
            count_error: countError?.message,
            price_error: priceError?.message,
            interval_error: intervalError?.message
          }
        }
      });
    }
    
    if (cleanup && action === 'cleanup') {
      // 清理测试数据
      console.log('🧹 清理过期的价格数据...');
      await cryptoDataService.cleanupOldPriceData(1); // 清理1天前的数据
      
      return NextResponse.json({
        success: true,
        message: '数据清理完成',
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({
      success: false,
      error: '无效的操作类型，支持: aggregate, status, cleanup'
    }, { status: 400 });
    
  } catch (error) {
    console.error('❌ 价格历史聚合测试失败:', error);
    return NextResponse.json({
      success: false,
      message: '价格历史聚合测试失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: '价格历史聚合测试接口',
    description: '测试价格历史数据聚合功能',
    usage: {
      method: 'POST',
      endpoint: '/api/crypto/test-price-history',
      actions: {
        aggregate: '手动触发价格历史聚合',
        status: '查询价格历史表状态',
        cleanup: '清理过期数据（需要设置cleanup=true）'
      },
      examples: {
        aggregate: '{ "action": "aggregate" }',
        status: '{ "action": "status" }',
        cleanup: '{ "action": "cleanup", "cleanup": true }'
      }
    }
  });
}