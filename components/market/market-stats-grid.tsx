/**
 * 市场统计网格组件
 */

import { DollarSign, Activity, TrendingUp } from "lucide-react";
import { MarketStatsCard } from "./market-stats-card";
import { NumberFormatter } from "@/lib/utils/formatters";
import type { MarketStats } from "@/lib/types/crypto";

interface MarketStatsGridProps {
  marketStats: MarketStats | null;
  loading?: boolean;
}

export function MarketStatsGrid({ marketStats, loading = false }: MarketStatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <MarketStatsCard
        title="Total Market Cap"
        value={loading ? '...' : NumberFormatter.formatCurrency(marketStats?.totalMarketCap || 0)}
        change="24h change: +2.1%"
        changeType="positive"
        icon={DollarSign}
        loading={loading}
      />

      <MarketStatsCard
        title="24h Volume"
        value={loading ? '...' : NumberFormatter.formatCurrency(marketStats?.total24hVolume || 0)}
        change="vs yesterday: -5.2%"
        changeType="negative"
        icon={Activity}
        loading={loading}
      />

      <MarketStatsCard
        title="BTC Dominance"
        value={loading ? '...' : `${marketStats?.btcDominance.toFixed(1) || 0}%`}
        change="change: +0.3%"
        changeType="positive"
        icon={TrendingUp}
        loading={loading}
      />

      <MarketStatsCard
        title="Active Coins"
        value={loading ? '...' : marketStats?.activeCryptocurrencies.toLocaleString() || '0'}
        change="new: +23"
        changeType="positive"
        icon={Activity}
        loading={loading}
      />
    </div>
  );
}