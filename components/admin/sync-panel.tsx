"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, RefreshCw, Database } from "lucide-react";

export function SyncPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [maxCount, setMaxCount] = useState(100);
  const [syncResult, setSyncResult] = useState<any>(null);

  const handleSync = async () => {
    setIsLoading(true);
    setSyncResult(null);

    try {
      const response = await fetch('/api/crypto/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maxCount }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Successfully synced ${result.count} cryptocurrencies`);
        setSyncResult(result);
      } else {
        toast.error(result.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Cryptocurrency Data Sync
        </CardTitle>
        <CardDescription>
          Sync cryptocurrency data from CoinMarketCap to your database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="maxCount">Maximum cryptocurrencies to sync</Label>
          <Input
            id="maxCount"
            type="number"
            min="1"
            max="5000"
            value={maxCount}
            onChange={(e) => setMaxCount(parseInt(e.target.value) || 100)}
            placeholder="Enter number (1-5000)"
          />
          <p className="text-sm text-muted-foreground">
            Recommended: 100-1000 for initial sync
          </p>
        </div>

        <Button 
          onClick={handleSync} 
          disabled={isLoading || maxCount < 1 || maxCount > 5000}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Start Sync
            </>
          )}
        </Button>

        {syncResult && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-green-800 dark:text-green-200">
              Sync Completed Successfully
            </h4>
            <p className="text-sm text-green-600 dark:text-green-300">
              {syncResult.message}
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• This will fetch the latest cryptocurrency data from CoinMarketCap</p>
          <p>• Existing data will be updated with new information</p>
          <p>• The process may take several minutes for large datasets</p>
          <p>• Rate limiting is applied to respect API limits</p>
        </div>
      </CardContent>
    </Card>
  );
}