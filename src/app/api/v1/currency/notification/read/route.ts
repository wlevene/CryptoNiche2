/**
 * POST /api/v1/currency/notification/read
 * 标记通知为已读（需要认证）
 */

import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';
import { createProtectedHandler } from '@/lib/auth/jwt-middleware';
import type {
  MarkNotificationReadReq,
  MarkNotificationReadReply,
} from '@/lib/types/api-v1';

export const POST = createProtectedHandler(async (request, user) => {
  try {
    const body = await request.json();

    const data = await apiClient.post<MarkNotificationReadReply>(
      '/api/v1/currency/notification/read',
      body as MarkNotificationReadReq
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to mark notification as read',
        details: error.data || null,
      },
      { status: error.statusCode || 500 }
    );
  }
});
