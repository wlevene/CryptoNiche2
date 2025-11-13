/**
 * GET /api/v1/currency/list
 * 获取货币列表（公开接口，无需认证）
 */

import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';
import { createOptionalAuthHandler } from '@/lib/auth/jwt-middleware';
import type {
  CurrencyListReq,
  CurrencyListReply,
} from '@/lib/types/api-v1';

export const GET = createOptionalAuthHandler(async (request, user) => {
  try {
    const { searchParams } = new URL(request.url);

    // 解析请求参数
    const params: CurrencyListReq = {
      page: parseInt(searchParams.get('page') || '1'),
      page_size: parseInt(searchParams.get('page_size') || '50'),
      sort_by: searchParams.get('sort_by') || 'rank',
      sort_order: searchParams.get('sort_order') || 'asc',
      quote_currency: searchParams.get('quote_currency') || 'USD',
    };

    // 调用后端接口
    const data = await apiClient.get<CurrencyListReply>(
      '/api/v1/currency/list',
      params
    );

    // 如果用户已登录，可以在这里添加 is_favorite 标记
    // TODO: 根据用户收藏状态标记 is_favorite

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error fetching currency list:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch currency list',
        details: error.data || null,
      },
      { status: error.statusCode || 500 }
    );
  }
});
