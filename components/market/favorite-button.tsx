"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { favoritesService } from "@/lib/services/favorites-service";
import { toast } from "sonner";

interface FavoriteButtonProps {
  cryptoId: number;
  cryptoName: string;
  className?: string;
  showTooltip?: boolean;
}

export function FavoriteButton({ 
  cryptoId, 
  cryptoName, 
  className = "",
  showTooltip = true 
}: FavoriteButtonProps) {
  const { user, loading } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check favorite status when user is authenticated
  useEffect(() => {
    if (user && !loading) {
      checkFavoriteStatus();
    } else if (!user) {
      setIsFavorite(false);
    }
  }, [user, loading, cryptoId]);

  const checkFavoriteStatus = async () => {
    try {
      const statusMap = await favoritesService.checkFavoriteStatus([cryptoId]);
      setIsFavorite(statusMap[cryptoId] || false);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleFavoriteClick = async () => {
    if (!user) {
      toast.error("Please sign in to add favorites");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    
    try {
      if (isFavorite) {
        await favoritesService.removeFromFavorites(cryptoId);
        setIsFavorite(false);
        toast.success(`${cryptoName} removed from favorites`);
      } else {
        await favoritesService.addToFavorites(cryptoId);
        setIsFavorite(true);
        toast.success(`${cryptoName} added to favorites`);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      // Handle specific error cases
      if (errorMessage.includes('already in favorites')) {
        toast.info(`${cryptoName} is already in favorites`);
        setIsFavorite(true);
      } else if (errorMessage.includes('Authentication required')) {
        toast.error("Please sign in to manage favorites");
      } else {
        toast.error(`Failed to ${isFavorite ? 'remove' : 'add'} favorite`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        disabled
        className={`h-8 w-8 p-0 ${className}`}
      >
        <Heart className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleFavoriteClick}
      disabled={isLoading}
      className={`h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 ${className}`}
      title={showTooltip ? (isFavorite ? `Remove ${cryptoName} from favorites` : `Add ${cryptoName} to favorites`) : undefined}
    >
      <Heart 
        className={`h-4 w-4 transition-colors ${
          isFavorite 
            ? 'fill-red-500 text-red-500' 
            : 'text-gray-400 hover:text-red-500'
        } ${isLoading ? 'animate-pulse' : ''}`}
      />
    </Button>
  );
}