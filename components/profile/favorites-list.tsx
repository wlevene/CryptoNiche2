"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Heart, TrendingUp, TrendingDown, Trash2, RefreshCw, ExternalLink } from "lucide-react";
import { FavoriteButton } from "@/components/market/favorite-button";

interface FavoriteCrypto {
  crypto_id: number;
  created_at: string;
  top_cryptocurrencies: {
    id: number;
    name: string;
    symbol: string;
    price: number;
    percent_change_24h: number;
    market_cap: number;
    cmc_rank: number;
  };
}

export function FavoritesList() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteCrypto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/favorites');
      const result = await response.json();

      if (result.success) {
        setFavorites(result.data || []);
      } else {
        toast.error('Failed to load favorites');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteRemoved = (cryptoId: number) => {
    setFavorites(prev => prev.filter(fav => fav.crypto_id !== cryptoId));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-6 bg-muted rounded w-1/4"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-8">
        <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Favorites Yet</h3>
        <p className="text-muted-foreground mb-4">
          Add cryptocurrencies to your favorites from the market overview to track them easily
        </p>
        <Button variant="outline" asChild>
          <a href="/">Browse Cryptocurrencies</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchFavorites}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Favorites Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {favorites.map((favorite) => {
          // Skip if data is missing
          if (!favorite.top_cryptocurrencies) {
            return null;
          }
          
          return (
            <Card key={favorite.crypto_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">
                        {favorite.top_cryptocurrencies.symbol || 'N/A'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        #{favorite.top_cryptocurrencies.cmc_rank || 'N/A'}
                      </Badge>
                  </div>
                </div>
                <FavoriteButton
                  cryptoId={favorite.crypto_id}
                  cryptoName={favorite.top_cryptocurrencies.name}
                  showTooltip={false}
                  onFavoriteChange={(isFavorite) => {
                    if (!isFavorite) {
                      handleFavoriteRemoved(favorite.crypto_id);
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <div>
                  <h4 className="font-semibold text-lg">
                    {favorite.top_cryptocurrencies.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Added on {formatDate(favorite.created_at)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Price</span>
                    <p className="font-semibold">
                      {formatPrice(favorite.top_cryptocurrencies.price)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">24h Change</span>
                    <div className="flex items-center gap-1">
                      {favorite.top_cryptocurrencies.percent_change_24h >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`font-semibold ${
                        favorite.top_cryptocurrencies.percent_change_24h >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {favorite.top_cryptocurrencies.percent_change_24h >= 0 ? '+' : ''}
                        {favorite.top_cryptocurrencies.percent_change_24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-muted-foreground">Market Cap</span>
                    <p className="font-semibold">
                      {formatMarketCap(favorite.top_cryptocurrencies.market_cap)}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/crypto/${favorite.crypto_id}`)}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Create Alert
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>
    </div>
  );
}