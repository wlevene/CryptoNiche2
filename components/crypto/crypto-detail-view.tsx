"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Globe, Users, Coins } from "lucide-react";
import Link from "next/link";
import { FavoriteButton } from "@/components/market/favorite-button";
import { PriceChart } from "@/components/crypto/price-chart";
import { MarketStats } from "@/components/crypto/market-stats";
import { QuickActions } from "@/components/crypto/quick-actions";

interface CryptoData {
  id: number;
  symbol: string;
  name: string;
  slug: string;
  price: number;
  market_cap: number;
  volume_24h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  percent_change_30d: number;
  cmc_rank: number;
  market_pair_count: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  atl: number;
  date_added: string;
  updated_at: string;
}

interface CryptoDetailViewProps {
  cryptoId: number;
}

export function CryptoDetailView({ cryptoId }: CryptoDetailViewProps) {
  const [crypto, setCrypto] = useState<CryptoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCryptoDetails();
  }, [cryptoId]);

  const fetchCryptoDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/crypto/${cryptoId}`);
      const result = await response.json();

      if (result.success) {
        setCrypto(result.data);
      } else {
        setError(result.error || 'Failed to fetch cryptocurrency details');
      }
    } catch (error) {
      console.error('Error fetching crypto details:', error);
      setError('Failed to load cryptocurrency details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    if (num >= 1e12) {
      return `${(num / 1e12).toFixed(2)}T`;
    } else if (num >= 1e9) {
      return `${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `${(num / 1e6).toFixed(2)}M`;
    } else if (num >= 1e3) {
      return `${(num / 1e3).toFixed(2)}K`;
    }
    return num.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded w-32"></div>
          </div>
          
          {/* Main content */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !crypto) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">
              {error || 'Cryptocurrency not found'}
            </h2>
            <p className="text-muted-foreground mb-4">
              Unable to load the requested cryptocurrency details.
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {crypto.name}
              <span className="text-muted-foreground">({crypto.symbol})</span>
            </h1>
            <Badge variant="outline">#{crypto.cmc_rank}</Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <FavoriteButton
            cryptoId={crypto.id}
            cryptoName={crypto.name}
          />
          <QuickActions crypto={crypto} />
        </div>
      </div>

      {/* Price Section */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-2xl font-bold">{formatPrice(crypto.price)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">24h Change</p>
              <div className={`flex items-center gap-2 font-semibold ${getChangeColor(crypto.percent_change_24h)}`}>
                {getChangeIcon(crypto.percent_change_24h)}
                <span>
                  {crypto.percent_change_24h >= 0 ? '+' : ''}
                  {crypto.percent_change_24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">7d Change</p>
              <div className={`flex items-center gap-2 font-semibold ${getChangeColor(crypto.percent_change_7d)}`}>
                {getChangeIcon(crypto.percent_change_7d)}
                <span>
                  {crypto.percent_change_7d >= 0 ? '+' : ''}
                  {crypto.percent_change_7d.toFixed(2)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">30d Change</p>
              <div className={`flex items-center gap-2 font-semibold ${getChangeColor(crypto.percent_change_30d)}`}>
                {getChangeIcon(crypto.percent_change_30d)}
                <span>
                  {crypto.percent_change_30d >= 0 ? '+' : ''}
                  {crypto.percent_change_30d.toFixed(2)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Charts and Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="chart" className="w-full">
            <TabsList>
              <TabsTrigger value="chart">Price Chart</TabsTrigger>
              <TabsTrigger value="analysis">Market Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chart" className="space-y-4">
              <PriceChart cryptoId={crypto.id} cryptoName={crypto.name} />
            </TabsContent>
            
            <TabsContent value="analysis" className="space-y-4">
              <MarketStats crypto={crypto} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Market Data */}
        <div className="space-y-6">
          {/* Market Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Market Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Market Cap</span>
                  <span className="font-semibold">${formatNumber(crypto.market_cap)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h Volume</span>
                  <span className="font-semibold">${formatNumber(crypto.volume_24h)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Market Pairs</span>
                  <span className="font-semibold">{crypto.market_pair_count}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supply Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Supply Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Circulating Supply</span>
                  <span className="font-semibold">{formatNumber(crypto.circulating_supply)}</span>
                </div>
                {crypto.total_supply > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Supply</span>
                    <span className="font-semibold">{formatNumber(crypto.total_supply)}</span>
                  </div>
                )}
                {crypto.max_supply > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Supply</span>
                    <span className="font-semibold">{formatNumber(crypto.max_supply)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Price Extremes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Price Extremes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">All-Time High</span>
                  <span className="font-semibold text-green-600">{formatPrice(crypto.ath)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">All-Time Low</span>
                  <span className="font-semibold text-red-600">{formatPrice(crypto.atl)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Added Date</span>
                  <span className="font-semibold">{formatDate(crypto.date_added)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-semibold">{formatDate(crypto.updated_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}