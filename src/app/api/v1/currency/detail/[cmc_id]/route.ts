/**
 * GET /api/v1/currency/detail/:cmc_id
 * 获取单个货币详情（公开接口，可选认证）
 */

import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';
import { createOptionalAuthHandler } from '@/lib/auth/jwt-middleware';
import type {
  CurrencyDetailReq,
  CurrencyDetailReply,
} from '@/lib/types/api-v1';

export const GET = createOptionalAuthHandler(async (request, user) => {
  try {
    // 从 URL 中提取 cmc_id
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const cmc_id = pathParts[pathParts.length - 1];

    if (!cmc_id || isNaN(Number(cmc_id))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid cmc_id',
        },
        { status: 400 }
      );
    }

    const { searchParams } = url;

    // 解析请求参数
    const params: Partial<CurrencyDetailReq> = {
      quote_currency: searchParams.get('quote_currency') || 'USD',
    };

    // 调用后端接口
    const data = await apiClient.get<CurrencyDetailReply>(
      `/api/v1/currency/detail/${cmc_id}`,
      params
    );

    // 如果用户已登录，可以在这里查询并设置 is_favorite
    // TODO: 查询用户收藏状态并设置 is_favorite

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error fetching currency detail:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch currency detail',
        details: error.data || null,
      },
      { status: error.statusCode || 500 }
    );
  }
});
