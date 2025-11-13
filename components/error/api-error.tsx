/**
 * API 错误展示组件
 * 用于统一展示 API 调用错误
 */

import { ApiClientError } from '@/lib/api-client';

interface ApiErrorProps {
  error: Error | ApiClientError | string;
  onRetry?: () => void;
  className?: string;
}

export function ApiError({ error, onRetry, className = '' }: ApiErrorProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const isApiError = error instanceof ApiClientError;

  const getErrorType = () => {
    if (!isApiError) return 'error';

    const apiError = error as ApiClientError;
    if (apiError.isAuthError()) return 'auth';
    if (apiError.isNetworkError()) return 'network';
    if (apiError.isTimeoutError()) return 'timeout';
    return 'error';
  };

  const getErrorIcon = () => {
    const type = getErrorType();

    switch (type) {
      case 'auth':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        );
      case 'network':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        );
      case 'timeout':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
    }
  };

  const getErrorTitle = () => {
    const type = getErrorType();

    switch (type) {
      case 'auth':
        return '认证失败';
      case 'network':
        return '网络错误';
      case 'timeout':
        return '请求超时';
      default:
        return '加载失败';
    }
  };

  const getErrorSuggestion = () => {
    const type = getErrorType();

    switch (type) {
      case 'auth':
        return '请重新登录';
      case 'network':
        return '请检查网络连接';
      case 'timeout':
        return '请求时间过长，请稍后重试';
      default:
        return '请稍后重试';
    }
  };

  return (
    <div className={`bg-red-50 dark:bg-red-900/20 rounded-lg p-6 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 text-red-600 dark:text-red-400">
          {getErrorIcon()}
        </div>

        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
            {getErrorTitle()}
          </h3>

          <div className="mt-2 text-sm text-red-700 dark:text-red-400">
            <p>{errorMessage}</p>
          </div>

          <div className="mt-2 text-xs text-red-600 dark:text-red-500">
            {getErrorSuggestion()}
          </div>

          {isApiError && (error as ApiClientError).statusCode && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-500">
              错误代码: {(error as ApiClientError).statusCode}
            </div>
          )}

          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <svg
                  className="mr-2 -ml-0.5 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                重试
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
