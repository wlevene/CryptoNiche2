"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, BarChart3, RefreshCw } from "lucide-react";
import { FavoriteButton } from "@/components/market/favorite-button";
import type { MarketOverviewReply, CurrencyDetail } from "@/lib/types/api-v1";

export function MarketOverview() {
  const [data, setData] = useState<MarketOverviewReply | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMarketOverview();
  }, []);

  const fetchMarketOverview = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/v1/currency/market-overview');
      const result = await response.json();

      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch market overview');
      }
    } catch (err) {
      console.error('Error fetching market overview:', err);
      setError('Failed to fetch market overview');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number | undefined) => {
    if (!value) return 'N/A';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const CryptoCard = ({ item, title }: { item: CurrencyDetail; title: string }) => {
    const change24h = item.price?.percent_change_24h || 0;
    const isPositive = change24h >= 0;

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{item.currency.symbol}</span>
              <span className="text-sm text-muted-foreground">{item.currency.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <FavoriteButton
                cmcId={item.currency.cmc_id || 0}
                isFavorite={item.is_favorite || false}
                symbol={item.currency.symbol}
                variant="ghost"
                size="icon"
              />
              {isPositive ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">
                {formatCurrency(item.price?.price)}
              </span>
              <Badge
                variant={isPositive ? "default" : "destructive"}
                className={isPositive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}
              >
                {formatPercentage(change24h)}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Market Cap: {formatCurrency(item.price?.market_cap)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchMarketOverview} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Market Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Market Cap</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.total_market_cap)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.total_24h_volume)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BTC Dominance</CardTitle>
            <Badge variant="outline">BTC</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.btc_dominance?.toFixed(2)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ETH Dominance</CardTitle>
            <Badge variant="outline">ETH</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.eth_dominance?.toFixed(2)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Gainers */}
      {data.top_gainers && data.top_gainers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top Gainers (24h)
            </CardTitle>
            <CardDescription>
              Cryptocurrencies with the highest price increase in the last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.top_gainers.slice(0, 6).map((item) => (
                <CryptoCard key={item.currency.cmc_id} item={item} title="Gainer" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Losers */}
      {data.top_losers && data.top_losers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Top Losers (24h)
            </CardTitle>
            <CardDescription>
              Cryptocurrencies with the highest price decrease in the last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.top_losers.slice(0, 6).map((item) => (
                <CryptoCard key={item.currency.cmc_id} item={item} title="Loser" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trending */}
      {data.trending && data.trending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Trending Cryptocurrencies
            </CardTitle>
            <CardDescription>
              Most popular cryptocurrencies by trading volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.trending.slice(0, 6).map((item) => (
                <CryptoCard key={item.currency.cmc_id} item={item} title="Trending" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
