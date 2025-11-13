"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Coins
} from "lucide-react";
import { FavoriteButton } from "@/components/market/favorite-button";
import { QuickAlertButton } from "@/components/alerts/quick-alert-button";
import type { CurrencyDetail } from "@/lib/types/api-v1";

interface CurrencyListResponse {
  items: CurrencyDetail[];
  total: number;
  page: number;
  page_size: number;
}

export function CurrencyList() {
  const [data, setData] = useState<CurrencyListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetchCurrencies();
  }, [currentPage, searchQuery]);

  const fetchCurrencies = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      });

      if (searchQuery) {
        params.append('keyword', searchQuery);
      }

      const response = await fetch(`/api/v1/currency/list?${params}`);
      const result = await response.json();

      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch currencies');
      }
    } catch (err) {
      console.error('Error fetching currencies:', err);
      setError('Failed to fetch currencies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);
  };

  const formatLargeNumber = (value: number | undefined) => {
    if (!value) return 'N/A';
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    }
    return formatCurrency(value);
  };

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined || value === null) return 'N/A';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  if (isLoading && !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchCurrencies} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          All Cryptocurrencies
        </CardTitle>
        <CardDescription>
          Browse and track all available cryptocurrencies
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or symbol..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={fetchCurrencies} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Currency Table */}
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">#</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Price</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">24h %</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">7d %</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Market Cap</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Volume (24h)</th>
                  <th className="px-4 py-3 text-center text-sm font-medium" colSpan={2}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((item, index) => {
                  const change24h = item.price?.percent_change_24h || 0;
                  const change7d = item.price?.percent_change_7d || 0;
                  const isPositive24h = change24h >= 0;
                  const isPositive7d = change7d >= 0;
                  const rank = (currentPage - 1) * pageSize + index + 1;

                  return (
                    <tr key={item.currency.cmc_id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-muted-foreground">{rank}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-semibold">{item.currency.symbol}</div>
                            <div className="text-sm text-muted-foreground">{item.currency.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(item.price?.price)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isPositive24h ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          )}
                          <span className={isPositive24h ? "text-green-600" : "text-red-600"}>
                            {formatPercentage(change24h)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isPositive7d ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          )}
                          <span className={isPositive7d ? "text-green-600" : "text-red-600"}>
                            {formatPercentage(change7d)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {formatLargeNumber(item.price?.market_cap)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {formatLargeNumber(item.price?.volume_24h)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <FavoriteButton
                            cmcId={item.currency.cmc_id || 0}
                            isFavorite={item.is_favorite || false}
                            symbol={item.currency.symbol}
                            variant="ghost"
                            size="sm"
                          />
                          <QuickAlertButton
                            cmcId={item.currency.cmc_id || 0}
                            symbol={item.currency.symbol}
                            currentPrice={item.price?.price}
                            variant="ghost"
                            size="sm"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, data?.total || 0)} of {data?.total || 0} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={isLoading}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || isLoading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
