/**
 * JWT 认证中间件
 * 用于验证用户身份
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * JWT Payload 接口
 */
export interface JwtPayload {
  user_id: string;
  email?: string;
  exp?: number;
  iat?: number;
}

/**
 * 认证用户信息
 */
export interface AuthUser {
  id: string;
  email?: string;
  [key: string]: any;
}

/**
 * 从请求中提取 JWT Token
 */
export function extractToken(request: NextRequest): string | null {
  // 1. 从 Authorization header 提取
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 2. 从 Cookie 提取
  const cookieToken = request.cookies.get('auth_token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

/**
 * 验证 JWT Token (简化版本)
 * 注意：这是一个简化的实现，生产环境应该使用 jsonwebtoken 库
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    // 解析 JWT (格式: header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // 解码 payload
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8')
    );

    // 检查过期时间
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload as JwtPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * JWT 认证中间件
 * 用于保护需要认证的 API 路由
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
): Promise<NextResponse> {
  // 提取 Token
  const token = extractToken(request);

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication required',
        message: 'No authentication token provided',
      },
      { status: 401 }
    );
  }

  // 验证 Token
  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid token',
        message: 'Authentication token is invalid or expired',
      },
      { status: 401 }
    );
  }

  // 构造用户对象
  const user: AuthUser = {
    id: payload.user_id,
    email: payload.email,
  };

  // 调用处理器
  return handler(request, user);
}

/**
 * 可选的认证中间件
 * 如果有 Token 则验证，没有则继续（不强制要求认证）
 */
export async function withOptionalAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: AuthUser | null) => Promise<NextResponse>
): Promise<NextResponse> {
  // 提取 Token
  const token = extractToken(request);

  if (!token) {
    // 没有 Token，以匿名用户继续
    return handler(request, null);
  }

  // 验证 Token
  const payload = verifyToken(token);

  if (!payload) {
    // Token 无效，以匿名用户继续
    return handler(request, null);
  }

  // 构造用户对象
  const user: AuthUser = {
    id: payload.user_id,
    email: payload.email,
  };

  return handler(request, user);
}

/**
 * 创建受保护的 API 处理器
 * 使用示例：
 *
 * export const GET = createProtectedHandler(async (request, user) => {
 *   // user 已经验证过了
 *   return NextResponse.json({ user });
 * });
 */
export function createProtectedHandler(
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    return withAuth(request, handler);
  };
}

/**
 * 创建可选认证的 API 处理器
 */
export function createOptionalAuthHandler(
  handler: (request: NextRequest, user: AuthUser | null) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    return withOptionalAuth(request, handler);
  };
}

/**
 * 检查用户是否为管理员
 * (需要在 JWT payload 中包含 role 字段)
 */
export function isAdmin(user: AuthUser): boolean {
  return user.role === 'admin' || user.is_admin === true;
}
