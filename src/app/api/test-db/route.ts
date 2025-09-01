import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    console.log('测试数据库查询...');
    
    // 1. 检查 cryptocurrencies 表
    const { data: cryptoData, error: cryptoError } = await supabase
      .from('cryptocurrencies')
      .select('*')
      .limit(10);
    
    console.log('cryptocurrencies 表查询结果:', cryptoData?.length, cryptoError);
    
    // 2. 检查 crypto_prices 表
    const { data: priceData, error: priceError } = await supabase
      .from('crypto_prices')
      .select('*')
      .limit(10);
    
    console.log('crypto_prices 表查询结果:', priceData?.length, priceError);
    
    // 3. 检查 latest_crypto_prices 视图
    const { data: viewData, error: viewError } = await supabase
      .from('latest_crypto_prices')
      .select('*')
      .limit(10);
    
    console.log('latest_crypto_prices 视图查询结果:', viewData?.length, viewError);
    
    return NextResponse.json({
      success: true,
      data: {
        cryptocurrencies: {
          count: cryptoData?.length || 0,
          data: cryptoData,
          error: cryptoError?.message
        },
        crypto_prices: {
          count: priceData?.length || 0,
          data: priceData,
          error: priceError?.message
        },
        latest_crypto_prices_view: {
          count: viewData?.length || 0,
          data: viewData,
          error: viewError?.message
        }
      }
    });
    
  } catch (error) {
    console.error('数据库测试失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
}