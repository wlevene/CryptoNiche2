"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface PriceHistoryPoint {
  crypto_id: number;
  price: number;
  timestamp: string;
}

interface PriceChartProps {
  cryptoId: number;
  cryptoName: string;
}

export function PriceChart({ cryptoId, cryptoName }: PriceChartProps) {
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(7);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPriceHistory();
  }, [cryptoId, selectedPeriod]);

  const fetchPriceHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/crypto/${cryptoId}/price-history?days=${selectedPeriod}&interval=1h`
      );
      const result = await response.json();

      if (result.success) {
        setPriceHistory(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch price history');
      }
    } catch (error) {
      console.error('Error fetching price history:', error);
      setError('Failed to load price history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  const calculateStats = () => {
    if (priceHistory.length < 2) return null;

    const prices = priceHistory.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const priceChange = lastPrice - firstPrice;
    const priceChangePercent = (priceChange / firstPrice) * 100;

    return {
      minPrice,
      maxPrice,
      firstPrice,
      lastPrice,
      priceChange,
      priceChangePercent,
    };
  };

  const stats = calculateStats();
  const periods = [
    { days: 1, label: '24H' },
    { days: 7, label: '7D' },
    { days: 30, label: '30D' },
    { days: 90, label: '90D' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Price Chart
            </CardTitle>
            <CardDescription>
              {cryptoName} price history over the last {selectedPeriod} days
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPriceHistory}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Period:</span>
          <div className="flex gap-2">
            {periods.map((period) => (
              <Button
                key={period.days}
                variant={selectedPeriod === period.days ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period.days)}
                disabled={isLoading}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Period Low</p>
              <p className="font-semibold text-red-600">{formatPrice(stats.minPrice)}</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Period High</p>
              <p className="font-semibold text-green-600">{formatPrice(stats.maxPrice)}</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Price Change</p>
              <p className={`font-semibold ${stats.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.priceChange >= 0 ? '+' : ''}{formatPrice(Math.abs(stats.priceChange))}
              </p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">% Change</p>
              <p className={`font-semibold ${stats.priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.priceChangePercent >= 0 ? '+' : ''}{stats.priceChangePercent.toFixed(2)}%
              </p>
            </div>
          </div>
        )}

        {/* Chart Area */}
        <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/50">
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading chart data...
            </div>
          ) : error ? (
            <div className="text-center text-muted-foreground">
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPriceHistory}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          ) : priceHistory.length === 0 ? (
            <div className="text-center text-muted-foreground">
              <p>No price data available for this period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={priceHistory.map(point => ({
                  time: new Date(point.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: selectedPeriod === 1 ? '2-digit' : undefined,
                  }),
                  price: point.price,
                  rawTime: point.timestamp
                }))}
                margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff6b00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                <XAxis 
                  dataKey="time" 
                  stroke="#888"
                  fontSize={12}
                  tickMargin={5}
                />
                <YAxis 
                  stroke="#888"
                  fontSize={12}
                  tickFormatter={(value) => {
                    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
                    if (value >= 1) return `$${value.toFixed(2)}`;
                    return `$${value.toFixed(6)}`;
                  }}
                  domain={['dataMin * 0.99', 'dataMax * 1.01']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value: number) => [formatPrice(value), 'Price']}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      const rawTime = payload[0].payload.rawTime;
                      return new Date(rawTime).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    }
                    return label;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#ff6b00"
                  strokeWidth={2}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Data Summary */}
        {priceHistory.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Data points: {priceHistory.length} | 
            Last updated: {new Date(priceHistory[priceHistory.length - 1]?.timestamp).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}