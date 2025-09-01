"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, RefreshCw, TestTube } from "lucide-react";

export function TestSyncPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [maxCount, setMaxCount] = useState(20);
  const [syncResult, setSyncResult] = useState<any>(null);

  const handleTestSync = async () => {
    setIsLoading(true);
    setSyncResult(null);

    try {
      const response = await fetch('/api/crypto/sync-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maxCount }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Successfully synced ${result.count} test cryptocurrencies`);
        setSyncResult(result);
      } else {
        toast.error(result.error || 'Test sync failed');
      }
    } catch (error) {
      console.error('Test sync error:', error);
      toast.error('Failed to sync test data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Test Data Sync
        </CardTitle>
        <CardDescription>
          Test the sync functionality with mock cryptocurrency data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="maxCount">Number of test cryptocurrencies</Label>
          <Input
            id="maxCount"
            type="number"
            min="1"
            max="100"
            value={maxCount}
            onChange={(e) => setMaxCount(parseInt(e.target.value) || 20)}
            placeholder="Enter number (1-100)"
          />
          <p className="text-sm text-muted-foreground">
            This will create mock data for testing
          </p>
        </div>

        <Button 
          onClick={handleTestSync} 
          disabled={isLoading || maxCount < 1 || maxCount > 100}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing Test Data...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Start Test Sync
            </>
          )}
        </Button>

        {syncResult && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">
              Test Sync Completed Successfully
            </h4>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              {syncResult.message}
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
              Mode: Test (using mock data)
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• This uses generated mock data for Bitcoin, Ethereum, and other popular cryptocurrencies</p>
          <p>• Safe to test database operations without API rate limits</p>
          <p>• Data will be stored in your Supabase database</p>
        </div>
      </CardContent>
    </Card>
  );
}