"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useToggleFavorite } from "@/lib/hooks/use-favorites-query";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  cmcId: number;
  isFavorite: boolean;
  symbol?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
  className?: string;
}

export function FavoriteButton({
  cmcId,
  isFavorite: initialIsFavorite,
  symbol,
  variant = "ghost",
  size = "icon",
  showText = false,
  className,
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const toggleFavorite = useToggleFavorite();

  const handleToggle = async (e: React.MouseEvent) => {
    // 防止事件冒泡（如果按钮在卡片内）
    e.stopPropagation();
    e.preventDefault();

    // 检查是否登录
    if (!isAuthenticated) {
      toast.error("Please sign in to add favorites");
      return;
    }

    // 乐观更新 UI
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);

    try {
      await toggleFavorite.mutateAsync({
        cmcId,
        isFavorite,
      });

      // 显示成功提示
      if (newFavoriteState) {
        toast.success(symbol ? `Added ${symbol} to favorites` : "Added to favorites");
      } else {
        toast.success(symbol ? `Removed ${symbol} from favorites` : "Removed from favorites");
      }
    } catch (error) {
      // 如果失败，回滚 UI 状态
      setIsFavorite(isFavorite);
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={toggleFavorite.isPending}
      className={cn(
        "transition-all duration-200",
        isFavorite && "text-red-500 hover:text-red-600",
        className
      )}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-all duration-200",
          isFavorite && "fill-current",
          showText && "mr-2"
        )}
      />
      {showText && (
        <span className="text-sm">
          {isFavorite ? "Favorited" : "Add to Favorites"}
        </span>
      )}
    </Button>
  );
}
