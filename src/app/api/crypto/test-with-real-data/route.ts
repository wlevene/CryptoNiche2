import { NextRequest, NextResponse } from 'next/server';
import { CryptoDataService } from '@/lib/crypto-data-service';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 开始测试真实数据获取和入库功能...');
    
    const cryptoService = new CryptoDataService();
    
    // 获取前100个加密货币的数据
    console.log('📡 正在从CoinMarketCap API获取数据...');
    const result = await cryptoService.getAllCryptocurrenciesAndSave(100, 100);
    
    if (result.success) {
      console.log('✅ 数据获取和入库成功!');
      return NextResponse.json({
        success: true,
        message: '数据获取和入库成功',
        data: {
          cryptocurrencies_saved: result.cryptoCount,
          prices_saved: result.priceCount,
          total_processed: result.cryptoCount
        }
      });
    } else {
      console.error('❌ 数据获取或入库失败:', result.error);
      return NextResponse.json({
        success: false,
        message: '数据获取或入库失败',
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ API调用异常:', error);
    return NextResponse.json({
      success: false,
      message: 'API调用异常',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}