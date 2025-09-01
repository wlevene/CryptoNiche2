/**
 * 加密货币列表组件
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CryptoListItem } from "./crypto-list-item";
import type { TopCrypto } from "@/lib/types/crypto";

interface CryptoListProps {
  title: string;
  description: string;
  cryptos: TopCrypto[];
  loading?: boolean;
  onCryptoClick?: (crypto: TopCrypto) => void;
  emptyMessage?: string;
  showTitle?: boolean;
}

export function CryptoList({
  title,
  description,
  cryptos,
  loading = false,
  onCryptoClick,
  emptyMessage = "No cryptocurrency data available.",
  showTitle = true
}: CryptoListProps) {
  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">
              Loading market data...
            </div>
          ) : cryptos.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {emptyMessage}
            </div>
          ) : (
            cryptos.map((crypto) => (
              <CryptoListItem
                key={`${crypto.id}-${crypto.symbol}`}
                crypto={crypto}
                onClick={onCryptoClick}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}