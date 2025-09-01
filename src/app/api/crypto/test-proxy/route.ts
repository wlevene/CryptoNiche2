import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 检查代理配置...');
    console.log('环境变量:');
    console.log('- https_proxy:', process.env.https_proxy);
    console.log('- http_proxy:', process.env.http_proxy);
    console.log('- HTTPS_PROXY:', process.env.HTTPS_PROXY);
    console.log('- HTTP_PROXY:', process.env.HTTP_PROXY);
    
    // 测试简单的HTTP请求
    const testUrl = 'https://httpbin.org/ip';
    console.log('🌐 测试请求到:', testUrl);
    
    try {
      const { HttpsProxyAgent } = await import('https-proxy-agent');
      const proxyUrl = process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.HTTP_PROXY;
      
      const fetchOptions: RequestInit = {
        method: 'GET',
        headers: {
          'User-Agent': 'CryptoNiche-Test/1.0'
        }
      };
      
      if (proxyUrl) {
        console.log('🔗 使用代理:', proxyUrl);
        (fetchOptions as any).agent = new HttpsProxyAgent(proxyUrl);
      } else {
        console.log('⚠️ 未检测到代理配置');
      }
      
      const response = await fetch(testUrl, fetchOptions);
      const data = await response.json();
      
      console.log('✅ 请求成功:', data);
      
      return NextResponse.json({
        success: true,
        message: '代理测试成功',
        data: {
          proxy_url: proxyUrl || 'none',
          response_data: data,
          env_vars: {
            https_proxy: process.env.https_proxy,
            http_proxy: process.env.http_proxy,
            HTTPS_PROXY: process.env.HTTPS_PROXY,
            HTTP_PROXY: process.env.HTTP_PROXY
          }
        }
      });
    } catch (error) {
      console.error('❌ 代理测试失败:', error);
      return NextResponse.json({
        success: false,
        message: '代理测试失败',
        error: error instanceof Error ? error.message : '未知错误',
        env_vars: {
          https_proxy: process.env.https_proxy,
          http_proxy: process.env.http_proxy,
          HTTPS_PROXY: process.env.HTTPS_PROXY,
          HTTP_PROXY: process.env.HTTP_PROXY
        }
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