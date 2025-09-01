"use client";

import { useState, useEffect } from "react";
import { Heart, TrendingUp, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { favoritesService, type FavoriteItem } from "@/lib/services/favorites-service";
import { CryptoList } from "./crypto-list";
import type { TopCrypto } from "@/lib/types/crypto";
import { Button } from "@/components/ui/button";

interface FavoritesListProps {
  onCryptoClick?: (crypto: TopCrypto) => void;
}

export function FavoritesList({ onCryptoClick }: FavoritesListProps) {
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<TopCrypto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !authLoading) {
      loadFavorites();
    } else if (!user && !authLoading) {
      setFavorites([]);
      setError(null);
    }
  }, [user, authLoading]);

  const loadFavorites = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const favoriteItems = await favoritesService.getFavorites();
      const cryptoList = favoritesService.convertToTopCrypto(favoriteItems);
      setFavorites(cryptoList);
    } catch (err) {
      console.error('Error loading favorites:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load favorites';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadFavorites();
  };

  // Don't render if user is not authenticated
  if (!user && !authLoading) {
    return null;
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <section className="mb-16">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-red-500" />
            <h2 className="text-3xl font-bold">My Favorites</h2>
          </div>
          <p className="text-muted-foreground text-lg">
            Loading your favorite cryptocurrencies...
          </p>
        </div>
        
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-20 bg-gray-200 rounded-lg"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-16">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            <h2 className="text-3xl font-bold">My Favorites</h2>
          </div>
          {favorites.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          )}
        </div>
        <p className="text-muted-foreground text-lg">
          Your personally curated cryptocurrency watchlist
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Error loading favorites</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}

      {loading && favorites.length === 0 && (
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-20 bg-gray-200 rounded-lg"></div>
        </div>
      )}

      {!loading && favorites.length === 0 && !error && (
        <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">
            No favorites yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Click the heart icon on any cryptocurrency to add it to your favorites
          </p>
          <div className="text-sm text-muted-foreground">
            Start building your personalized watchlist today!
          </div>
        </div>
      )}

      {favorites.length > 0 && (
        <CryptoList
          title=""
          description=""
          cryptos={favorites}
          loading={loading}
          onCryptoClick={onCryptoClick}
          emptyMessage="No favorite cryptocurrencies found"
          showTitle={false}
        />
      )}
    </section>
  );
}