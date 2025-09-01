/**
 * 加密货币列表项组件
 */

import { TrendingUp, TrendingDown, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { TopCrypto } from "@/lib/types/crypto";
import { FavoriteButton } from "./favorite-button";

interface CryptoListItemProps {
  crypto: TopCrypto;
  onClick?: (crypto: TopCrypto) => void;
}

export function CryptoListItem({ crypto, onClick }: CryptoListItemProps) {
  const router = useRouter();

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/crypto/${crypto.id}`);
  };

  const formatPrice = (price: number): string => {
    if (price >= 1) {
      return price.toLocaleString();
    }
    if (price >= 0.01) {
      return price.toFixed(4);
    }
    return price.toFixed(6);
  };

  return (
    <div
      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
          {crypto.symbol[0]}
        </div>
        <div>
          <div className="font-semibold">{crypto.name}</div>
          <div className="text-sm text-muted-foreground">
            {crypto.symbol}
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="font-semibold">
          ${formatPrice(crypto.price)}
        </div>
        <div
          className={`text-sm flex items-center ${
            crypto.change >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {crypto.change >= 0 ? (
            <TrendingUp className="w-3 h-3 mr-1" />
          ) : (
            <TrendingDown className="w-3 h-3 mr-1" />
          )}
          {Math.abs(crypto.change).toFixed(2)}%
        </div>
      </div>

      <div className="text-right text-sm text-muted-foreground">
        <div>Volume: {crypto.volume}</div>
        <div>Market Cap: {crypto.marketCap}</div>
      </div>

      <div className="flex items-center gap-2 ml-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleViewDetails}
          className="flex items-center gap-1 cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          Details
        </Button>
        <FavoriteButton 
          cryptoId={crypto.id} 
          cryptoName={crypto.name}
        />
      </div>
    </div>
  );
}