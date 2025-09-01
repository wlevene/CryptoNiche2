"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, TrendingDown, Target, Zap } from "lucide-react";

interface CryptoData {
  id: number;
  symbol: string;
  name: string;
  price: number;
  market_cap: number;
  volume_24h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  percent_change_30d: number;
  cmc_rank: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  atl: number;
}

interface MarketStatsProps {
  crypto: CryptoData;
}

export function MarketStats({ crypto }: MarketStatsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    if (num >= 1e12) {
      return `${(num / 1e12).toFixed(2)}T`;
    } else if (num >= 1e9) {
      return `${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `${(num / 1e6).toFixed(2)}M`;
    } else if (num >= 1e3) {
      return `${(num / 1e3).toFixed(2)}K`;
    }
    return num.toLocaleString();
  };

  const calculateMarketDominance = () => {
    // Rough estimate - in a real app, you'd get the total market cap from an API
    const estimatedTotalMarketCap = 2.5e12; // $2.5T estimated
    return ((crypto.market_cap / estimatedTotalMarketCap) * 100).toFixed(3);
  };

  const calculateSupplyPercentage = () => {
    if (!crypto.max_supply || crypto.max_supply === 0) return null;
    return ((crypto.circulating_supply / crypto.max_supply) * 100).toFixed(1);
  };

  const calculateATHDistance = () => {
    return (((crypto.price - crypto.ath) / crypto.ath) * 100).toFixed(2);
  };

  const calculateATLDistance = () => {
    return (((crypto.price - crypto.atl) / crypto.atl) * 100).toFixed(2);
  };

  const getVolumeLiquidity = () => {
    const volumeToMarketCapRatio = (crypto.volume_24h / crypto.market_cap) * 100;
    if (volumeToMarketCapRatio > 10) return { level: 'High', color: 'text-green-600' };
    if (volumeToMarketCapRatio > 5) return { level: 'Medium', color: 'text-orange-600' };
    return { level: 'Low', color: 'text-red-600' };
  };

  const supplyPercentage = calculateSupplyPercentage();
  const athDistance = calculateATHDistance();
  const atlDistance = calculateATLDistance();
  const marketDominance = calculateMarketDominance();
  const volumeLiquidity = getVolumeLiquidity();

  return (
    <div className="space-y-6">
      {/* Market Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Market Performance
          </CardTitle>
          <CardDescription>
            Price performance across different time periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500" />
                <span className="font-medium">24 Hours</span>
              </div>
              <div className={`flex items-center gap-2 font-semibold ${
                crypto.percent_change_24h >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {crypto.percent_change_24h >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {crypto.percent_change_24h >= 0 ? '+' : ''}
                {crypto.percent_change_24h.toFixed(2)}%
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="font-medium">7 Days</span>
              </div>
              <div className={`flex items-center gap-2 font-semibold ${
                crypto.percent_change_7d >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {crypto.percent_change_7d >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {crypto.percent_change_7d >= 0 ? '+' : ''}
                {crypto.percent_change_7d.toFixed(2)}%
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                <span className="font-medium">30 Days</span>
              </div>
              <div className={`flex items-center gap-2 font-semibold ${
                crypto.percent_change_30d >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {crypto.percent_change_30d >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {crypto.percent_change_30d >= 0 ? '+' : ''}
                {crypto.percent_change_30d.toFixed(2)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Market Analysis</CardTitle>
          <CardDescription>
            Advanced market metrics and analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Market Dominance */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Market Dominance</span>
              <span className="text-sm font-semibold">{marketDominance}%</span>
            </div>
            <Progress value={parseFloat(marketDominance)} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Share of total cryptocurrency market capitalization
            </p>
          </div>

          {/* Supply Progress */}
          {supplyPercentage && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Supply Circulation</span>
                <span className="text-sm font-semibold">{supplyPercentage}%</span>
              </div>
              <Progress value={parseFloat(supplyPercentage)} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {formatNumber(crypto.circulating_supply)} of {formatNumber(crypto.max_supply)} max supply
              </p>
            </div>
          )}

          {/* Volume Analysis */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium">Liquidity Level</p>
              <p className="text-sm text-muted-foreground">
                Based on volume/market cap ratio
              </p>
            </div>
            <Badge className={volumeLiquidity.color} variant="outline">
              {volumeLiquidity.level}
            </Badge>
          </div>

          {/* Price Distance from Extremes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">From ATH</span>
                <span className={`text-sm font-semibold ${
                  parseFloat(athDistance) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {athDistance}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                ATH: {formatPrice(crypto.ath)}
              </p>
            </div>

            <div className="p-3 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">From ATL</span>
                <span className="text-sm font-semibold text-green-600">
                  +{atlDistance}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                ATL: {formatPrice(crypto.atl)}
              </p>
            </div>
          </div>

          {/* Market Cap vs Volume */}
          <div className="p-3 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Market Cap to Volume Ratio</span>
              <span className="font-semibold">
                {(crypto.market_cap / crypto.volume_24h).toFixed(2)}x
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Lower ratios typically indicate higher liquidity and trading activity
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}