"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, TrendingUp, TrendingDown } from "lucide-react";
import { useFavorites } from "@/lib/hooks/use-favorites-query";
import { FavoriteButton } from "@/components/market/favorite-button";
import { Skeleton } from "@/components/ui/loading";

export function FavoritesList() {
  const { data, isLoading, error } = useFavorites();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-red-600">Failed to load favorites</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.items || data.items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground">
              Start adding cryptocurrencies to your favorites to track them easily
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {data.items.map((currency) => (
        <Card key={currency.cmc_id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{currency.symbol}</span>
                    <span className="text-muted-foreground">{currency.name}</span>
                  </div>
                  {currency.cmc_rank && (
                    <Badge variant="secondary">#{currency.cmc_rank}</Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {/* Price - 需要从 price 字段获取，但目前 Currency 类型不包含 price */}
                  {/* 这里暂时显示其他信息 */}

                  {currency.market_pair_count !== undefined && (
                    <div>
                      <p className="text-xs text-muted-foreground">Market Pairs</p>
                      <p className="text-sm font-medium">{currency.market_pair_count}</p>
                    </div>
                  )}

                  {currency.circulating_supply !== undefined && (
                    <div>
                      <p className="text-xs text-muted-foreground">Circulating Supply</p>
                      <p className="text-sm font-medium">
                        {new Intl.NumberFormat('en-US', {
                          notation: 'compact',
                          maximumFractionDigits: 2
                        }).format(currency.circulating_supply)}
                      </p>
                    </div>
                  )}

                  {currency.max_supply !== undefined && currency.max_supply > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Max Supply</p>
                      <p className="text-sm font-medium">
                        {new Intl.NumberFormat('en-US', {
                          notation: 'compact',
                          maximumFractionDigits: 2
                        }).format(currency.max_supply)}
                      </p>
                    </div>
                  )}
                </div>

                {/* 24h 高低点 */}
                {(currency.high_24h !== undefined || currency.low_24h !== undefined) && (
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    {currency.high_24h !== undefined && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-muted-foreground">24h High:</span>
                        <span className="font-medium">${currency.high_24h.toLocaleString()}</span>
                      </div>
                    )}
                    {currency.low_24h !== undefined && (
                      <div className="flex items-center gap-1">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-muted-foreground">24h Low:</span>
                        <span className="font-medium">${currency.low_24h.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 收藏按钮 */}
              <div className="ml-4">
                <FavoriteButton
                  cmcId={currency.cmc_id || 0}
                  isFavorite={true}
                  symbol={currency.symbol}
                  size="default"
                  showText={false}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
