/**
 * GET /api/v1/currency/price-history/:cmc_id
 * 获取价格历史（公开接口）
 */

import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';
import type {
  PriceHistoryReq,
  PriceHistoryReply,
} from '@/lib/types/api-v1';

export async function GET(request: NextRequest) {
  try {
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

    const params: Partial<PriceHistoryReq> = {
      interval: searchParams.get('interval') || '1h',
      start_time: searchParams.get('start_time') || undefined,
      end_time: searchParams.get('end_time') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
    };

    const data = await apiClient.get<PriceHistoryReply>(
      `/api/v1/currency/price-history/${cmc_id}`,
      params
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error fetching price history:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch price history',
        details: error.data || null,
      },
      { status: error.statusCode || 500 }
    );
  }
}
