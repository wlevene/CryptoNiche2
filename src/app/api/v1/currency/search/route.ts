/**
 * GET /api/v1/currency/search
 * 搜索货币（公开接口）
 */

import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';
import type {
  SearchCurrencyReq,
  SearchCurrencyReply,
} from '@/lib/types/api-v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const keyword = searchParams.get('keyword');
    if (!keyword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Keyword is required',
        },
        { status: 400 }
      );
    }

    const params: SearchCurrencyReq = {
      keyword,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
    };

    const data = await apiClient.get<SearchCurrencyReply>(
      '/api/v1/currency/search',
      params
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error searching currencies:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to search currencies',
        details: error.data || null,
      },
      { status: error.statusCode || 500 }
    );
  }
}
