/**
 * 统一错误处理工具
 */

import { logger } from './logger';
import { ERROR_MESSAGES } from '../config/constants';
import type { ApiResponse } from '../types/crypto';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    statusCode = 500,
    isOperational = true,
    context?: Record<string, any>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    // 确保错误名称正确
    this.name = this.constructor.name;
    
    // 捕获堆栈跟踪
    Error.captureStackTrace(this, this.constructor);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 500, true, { service: 'database', ...context });
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 400, true, { service: 'validation', ...context });
  }
}

export class ApiError extends AppError {
  constructor(message: string, statusCode: number, context?: Record<string, any>) {
    super(message, statusCode, true, { service: 'api', ...context });
  }
}

export class NetworkError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 502, true, { service: 'network', ...context });
  }
}

/**
 * 错误处理器类
 */
export class ErrorHandler {
  /**
   * 处理并记录错误
   */
  static handle(error: unknown, operation: string): AppError {
    if (error instanceof AppError) {
      logger.error(`${operation} failed`, error, error.context);
      return error;
    }

    if (error instanceof Error) {
      const appError = new AppError(
        error.message || ERROR_MESSAGES.SYSTEM.UNKNOWN_ERROR,
        500,
        true,
        { originalError: error.name, operation }
      );
      logger.error(`${operation} failed`, appError, appError.context);
      return appError;
    }

    const unknownError = new AppError(
      ERROR_MESSAGES.SYSTEM.UNKNOWN_ERROR,
      500,
      true,
      { originalError: String(error), operation }
    );
    logger.error(`${operation} failed`, unknownError, unknownError.context);
    return unknownError;
  }

  /**
   * 创建API响应格式的错误
   */
  static toApiResponse<T = any>(error: AppError): ApiResponse<T> {
    return {
      success: false,
      error: error.message,
      data: undefined,
    };
  }

  /**
   * 包装异步函数，自动处理错误
   */
  static async withErrorHandling<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    try {
      const startTime = Date.now();
      const result = await fn();
      const duration = Date.now() - startTime;
      
      logger.performance(operation, duration);
      return result;
    } catch (error) {
      throw ErrorHandler.handle(error, operation);
    }
  }

  /**
   * 重试机制
   */
  static async withRetry<T>(
    operation: string,
    fn: () => Promise<T>,
    maxRetries = 3,
    delayMs = 1000
  ): Promise<T> {
    let lastError: AppError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await ErrorHandler.withErrorHandling(
          `${operation} (attempt ${attempt}/${maxRetries})`,
          fn
        );
      } catch (error) {
        lastError = error instanceof AppError ? error : ErrorHandler.handle(error, operation);
        
        if (attempt === maxRetries) {
          throw lastError;
        }

        logger.warn(`${operation} attempt ${attempt} failed, retrying in ${delayMs}ms`, {
          attempt,
          maxRetries,
          error: lastError.message,
        });

        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    throw lastError!;
  }
}

/**
 * 装饰器：自动错误处理
 */
export function handleErrors(operation: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        throw ErrorHandler.handle(error, `${target.constructor.name}.${propertyKey}`);
      }
    };

    return descriptor;
  };
}