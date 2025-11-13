/**
 * GET /api/v1/currency/market-overview
 * 获取市场概览（公开接口）
 */

import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';
import type {
  MarketOverviewReq,
  MarketOverviewReply,
} from '@/lib/types/api-v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: MarketOverviewReq = {
      quote_currency: searchParams.get('quote_currency') || 'USD',
    };

    const data = await apiClient.get<MarketOverviewReply>(
      '/api/v1/currency/market-overview',
      params
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error fetching market overview:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch market overview',
        details: error.data || null,
      },
      { status: error.statusCode || 500 }
    );
  }
}
