"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MarketStatsGrid } from "@/components/market/market-stats-grid";
import { CryptoList } from "@/components/market/crypto-list";
import { marketDataService } from "@/lib/market-data-service";
import { logger } from "@/lib/utils/logger";
import type { MarketStats, TopCrypto } from "@/lib/types/crypto";

export function MarketOverview() {
  const router = useRouter();
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [topCryptos, setTopCryptos] = useState<TopCrypto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        logger.info('Fetching market data for UI');
        
        // 并行获取市场统计和所有加密货币
        const [stats, cryptos] = await Promise.all([
          marketDataService.getMarketStats(),
          marketDataService.getTopCryptocurrencies(100) // 显示所有加密货币，最多100个
        ]);

        setMarketStats(stats);
        setTopCryptos(cryptos);
        
        logger.info('Market data fetched successfully', {
          statsCount: 1,
          cryptosCount: cryptos.length,
        });
      } catch (error) {
        logger.error('Failed to fetch market data for UI', error instanceof Error ? error : new Error(String(error)));
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  const handleCryptoClick = (crypto: TopCrypto) => {
    logger.info('Crypto clicked', { cryptoId: crypto.id, symbol: crypto.symbol });
    router.push(`/crypto/${crypto.id}`);
  };


  return (
    <section className="py-16">
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-4">Market Overview</h2>
        <p className="text-muted-foreground text-lg">
          Real-time cryptocurrency market data and trend analysis
        </p>
      </div>

      <MarketStatsGrid 
        marketStats={marketStats} 
        loading={loading} 
      />

      <CryptoList
        title="All Cryptocurrencies"
        description="Complete list of tracked cryptocurrencies with real-time prices"
        cryptos={topCryptos}
        loading={loading}
        onCryptoClick={handleCryptoClick}
        emptyMessage="No cryptocurrency data available. Try running data sync."
      />
    </section>
  );
}