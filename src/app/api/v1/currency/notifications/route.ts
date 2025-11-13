/**
 * GET /api/v1/currency/notifications
 * 获取用户通知列表（需要认证）
 */

import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';
import { createProtectedHandler } from '@/lib/auth/jwt-middleware';
import type {
  NotificationListReq,
  NotificationListReply,
} from '@/lib/types/api-v1';

export const GET = createProtectedHandler(async (request, user) => {
  try {
    const { searchParams } = new URL(request.url);

    const params: NotificationListReq = {
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      page_size: searchParams.get('page_size') ? parseInt(searchParams.get('page_size')!) : 20,
    };

    const data = await apiClient.get<NotificationListReply>(
      '/api/v1/currency/notifications',
      params
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch notifications',
        details: error.data || null,
      },
      { status: error.statusCode || 500 }
    );
  }
});
