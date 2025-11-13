'use client';

/**
 * API 演示页面
 * 展示如何使用新的 API 架构
 */

import { useEffect, useState } from 'react';
import { currencyService } from '@/lib/services/currency-service';
import { alertServiceV2 } from '@/lib/services/alert-service-v2';
import { useAuth } from '@/hooks/use-auth';
import { ApiClientError } from '@/lib/api-client';
import type { CurrencyDetail, Alert } from '@/lib/types/api-v1';

export default function ApiDemoPage() {
  const { user, loading: authLoading, signIn, signOut, isAuthenticated } = useAuth();

  // 货币列表状态
  const [currencies, setCurrencies] = useState<CurrencyDetail[]>([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(false);
  const [currenciesError, setError] = useState<string | null>(null);

  // 搜索状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // 告警状态
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);

  // 市场概览状态
  const [marketOverview, setMarketOverview] = useState<any>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // 加载货币列表
  const loadCurrencies = async () => {
    try {
      setCurrenciesLoading(true);
      setError(null);

      const data = await currencyService.getCurrencyList({
        page: 1,
        page_size: 10,
        sort_by: 'rank',
        sort_order: 'asc',
      });

      setCurrencies(data.items);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setError(error.message);
      } else {
        setError('加载失败');
      }
    } finally {
      setCurrenciesLoading(false);
    }
  };

  // 搜索货币
  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;

    try {
      setSearchLoading(true);
      const data = await currencyService.searchCurrency({
        keyword: searchKeyword,
        limit: 5,
      });
      setSearchResults(data.items);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // 加载告警
  const loadAlerts = async () => {
    if (!isAuthenticated) return;

    try {
      setAlertsLoading(true);
      const data = await alertServiceV2.getAlerts();
      setAlerts(data.items);
    } catch (error) {
      console.error('加载告警失败:', error);
    } finally {
      setAlertsLoading(false);
    }
  };

  // 加载市场概览
  const loadMarketOverview = async () => {
    try {
      setOverviewLoading(true);
      const data = await currencyService.getMarketOverview();
      setMarketOverview(data);
    } catch (error) {
      console.error('加载市场概览失败:', error);
    } finally {
      setOverviewLoading(false);
    }
  };

  // 模拟登录
  const handleLogin = async () => {
    await signIn('demo@example.com', 'password');
  };

  // 初始化
  useEffect(() => {
    loadCurrencies();
    loadMarketOverview();
  }, []);

  // 用户登录后加载告警
  useEffect(() => {
    if (isAuthenticated) {
      loadAlerts();
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🚀 API 架构演示
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            展示新的 API 架构和服务层的使用方法
          </p>
        </div>

        {/* 认证状态 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            1. 认证系统
          </h2>

          {authLoading ? (
            <p className="text-gray-600">加载中...</p>
          ) : isAuthenticated ? (
            <div>
              <p className="text-green-600 mb-2">✅ 已登录</p>
              <p className="text-gray-600 mb-4">用户: {user?.email}</p>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                登出
              </button>
            </div>
          ) : (
            <div>
              <p className="text-yellow-600 mb-2">⚠️ 未登录（使用 Mock 认证）</p>
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                模拟登录
              </button>
            </div>
          )}
        </div>

        {/* 市场概览 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            2. 市场概览
          </h2>

          {overviewLoading ? (
            <p className="text-gray-600">加载中...</p>
          ) : marketOverview ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">总市值</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${marketOverview.total_market_cap?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">24h 交易量</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${marketOverview.total_24h_volume?.toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">暂无数据（需要后端 API 支持）</p>
          )}

          <button
            onClick={loadMarketOverview}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            刷新
          </button>
        </div>

        {/* 货币列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            3. 货币列表 (前 10)
          </h2>

          {currenciesLoading ? (
            <p className="text-gray-600">加载中...</p>
          ) : currenciesError ? (
            <div>
              <p className="text-red-600 mb-2">❌ {currenciesError}</p>
              <p className="text-sm text-gray-600 mb-4">
                提示: 请确保后端 API 已启动并配置正确
              </p>
              <button
                onClick={loadCurrencies}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                重试
              </button>
            </div>
          ) : currencies.length > 0 ? (
            <div className="space-y-2">
              {currencies.map((item, index) => (
                <div
                  key={item.currency.id || index}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {item.currency.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.currency.symbol} • Rank #{item.currency.cmc_rank}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      ${item.price?.price?.toFixed(2) || 'N/A'}
                    </p>
                    <p
                      className={
                        (item.price?.percent_change_24h || 0) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {item.price?.percent_change_24h?.toFixed(2) || '0'}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">暂无数据（需要后端 API 支持）</p>
          )}
        </div>

        {/* 搜索功能 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            4. 搜索货币
          </h2>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="输入货币名称或符号，如 bitcoin"
              className="flex-1 px-4 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <button
              onClick={handleSearch}
              disabled={searchLoading}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {searchLoading ? '搜索中...' : '搜索'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((item, index) => (
                <div
                  key={item.id || index}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <p className="font-bold text-gray-900 dark:text-white">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.symbol}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 告警列表 */}
        {isAuthenticated && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              5. 用户告警（需要认证）
            </h2>

            {alertsLoading ? (
              <p className="text-gray-600">加载中...</p>
            ) : alerts.length > 0 ? (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded"
                  >
                    <p className="font-bold text-gray-900 dark:text-white">
                      告警 #{alert.crypto_id}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      类型: {alert.alert_type} • 阈值: {alert.threshold_percentage}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      状态: {alert.is_active ? '启用' : '禁用'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">暂无告警（需要后端 API 支持）</p>
            )}

            <button
              onClick={loadAlerts}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              刷新
            </button>
          </div>
        )}

        {/* 代码示例 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            6. 代码示例
          </h2>

          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-x-auto">
            <pre className="text-sm text-gray-800 dark:text-gray-200">
              <code>{`// 导入服务
import { currencyService } from '@/lib/services/currency-service';
import { useAuth } from '@/hooks/use-auth';

// 获取货币列表
const data = await currencyService.getCurrencyList({
  page: 1,
  page_size: 10,
});

// 使用认证
const { user, isAuthenticated, signIn } = useAuth();
await signIn('email@example.com', 'password');

// 获取告警
const alerts = await alertServiceV2.getAlerts();`}</code>
            </pre>
          </div>

          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            💡 更多示例请查看: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">docs/QUICK_START.md</code>
          </p>
        </div>

        {/* 底部提示 */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">
            📌 重要提示
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>• 请确保配置了 <code>NEXT_PUBLIC_API_BASE_URL</code> 环境变量</li>
            <li>• 当前认证使用 Mock 数据，实际使用需要实现真实接口</li>
            <li>• 如果看到错误，说明后端 API 还未启动或未正确配置</li>
            <li>• 查看浏览器控制台可以看到详细的 API 调用信息</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
