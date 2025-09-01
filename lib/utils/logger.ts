/**
 * 统一日志系统
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  service?: string;
  operation?: string;
  userId?: string;
  cryptoId?: number;
  duration?: number | string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : undefined,
    };
    console.error(this.formatMessage('error', message, errorContext));
  }

  // 性能监控日志
  performance(operation: string, duration: number, context?: LogContext): void {
    this.info(`Performance: ${operation}`, {
      ...context,
      operation,
      duration: `${duration}ms`,
    });
  }

  // 数据库操作日志
  database(operation: string, table: string, count?: number, duration?: number): void {
    this.info(`Database: ${operation}`, {
      service: 'database',
      operation,
      table,
      count,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  // API请求日志
  api(method: string, url: string, status: number, duration?: number): void {
    const level = status >= 400 ? 'warn' : 'info';
    this[level](`API: ${method} ${url}`, {
      service: 'api',
      method,
      url,
      status,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  // 业务操作日志
  business(operation: string, context?: LogContext): void {
    this.info(`Business: ${operation}`, {
      service: 'business',
      operation,
      ...context,
    });
  }
}

export const logger = new Logger();