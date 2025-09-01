"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2, Bell, TrendingUp } from "lucide-react";

interface Cryptocurrency {
  id: number;
  name: string;
  symbol: string;
  price: number;
}

interface AlertFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AlertForm({ onSuccess, onCancel }: AlertFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([]);
  const [formData, setFormData] = useState({
    crypto_id: '',
    alert_type: 'price_change' as 'price_change' | 'price_threshold',
    threshold_percentage: '',
    threshold_price: '',
    direction: 'both' as 'up' | 'down' | 'both',
    notification_frequency: 'immediate' as 'immediate' | 'hourly' | 'daily',
  });

  useEffect(() => {
    fetchCryptocurrencies();
  }, []);

  const fetchCryptocurrencies = async () => {
    try {
      const response = await fetch('/api/crypto/list?startRank=1&endRank=100');
      const result = await response.json();
      if (result.success) {
        setCryptocurrencies(result.data);
      }
    } catch (error) {
      console.error('Error fetching cryptocurrencies:', error);
      toast.error('Failed to load cryptocurrencies');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        crypto_id: parseInt(formData.crypto_id),
        alert_type: formData.alert_type,
        direction: formData.direction,
        notification_frequency: formData.notification_frequency,
        ...(formData.alert_type === 'price_change' 
          ? { threshold_percentage: parseFloat(formData.threshold_percentage) }
          : { threshold_price: parseFloat(formData.threshold_price) }
        )
      };

      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Price alert created successfully!');
        onSuccess?.();
        // Reset form
        setFormData({
          crypto_id: '',
          alert_type: 'price_change',
          threshold_percentage: '',
          threshold_price: '',
          direction: 'both',
          notification_frequency: 'immediate',
        });
      } else {
        toast.error(result.error || 'Failed to create alert');
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      toast.error('Failed to create alert');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCrypto = cryptocurrencies.find(c => c.id === parseInt(formData.crypto_id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Create Price Alert
        </CardTitle>
        <CardDescription>
          Get notified when cryptocurrency prices hit your target thresholds
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cryptocurrency Selection */}
          <div className="space-y-2">
            <Label htmlFor="crypto">Cryptocurrency</Label>
            <Select value={formData.crypto_id} onValueChange={(value) => setFormData({ ...formData, crypto_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a cryptocurrency" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-sm max-h-60 z-50">
                {cryptocurrencies.map((crypto) => (
                  <SelectItem 
                    key={crypto.id} 
                    value={crypto.id.toString()}
                    className="bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{crypto.symbol}</span>
                      <span className="text-muted-foreground">{crypto.name}</span>
                      {crypto.price && (
                        <span className="text-sm text-muted-foreground">
                          ${crypto.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Alert Type */}
          <div className="space-y-3">
            <Label>Alert Type</Label>
            <RadioGroup
              value={formData.alert_type}
              onValueChange={(value: 'price_change' | 'price_threshold') => 
                setFormData({ ...formData, alert_type: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="price_change" id="price_change" />
                <Label htmlFor="price_change">Price Change Percentage</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="price_threshold" id="price_threshold" />
                <Label htmlFor="price_threshold">Price Threshold</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Threshold Input */}
          {formData.alert_type === 'price_change' ? (
            <div className="space-y-2">
              <Label htmlFor="threshold_percentage">Change Percentage (%)</Label>
              <Input
                id="threshold_percentage"
                type="number"
                min="0.1"
                max="100"
                step="0.1"
                value={formData.threshold_percentage}
                onChange={(e) => setFormData({ ...formData, threshold_percentage: e.target.value })}
                placeholder="e.g., 5.0 for 5%"
                required
              />
              <p className="text-sm text-muted-foreground">
                Alert when price changes by this percentage
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="threshold_price">Price Threshold ($)</Label>
              <Input
                id="threshold_price"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.threshold_price}
                onChange={(e) => setFormData({ ...formData, threshold_price: e.target.value })}
                placeholder={selectedCrypto ? `e.g., ${selectedCrypto.price}` : "Enter target price"}
                required
              />
              <p className="text-sm text-muted-foreground">
                Alert when price crosses this threshold
              </p>
            </div>
          )}

          {/* Direction */}
          <div className="space-y-3">
            <Label>Direction</Label>
            <RadioGroup
              value={formData.direction}
              onValueChange={(value: 'up' | 'down' | 'both') => 
                setFormData({ ...formData, direction: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="up" id="up" />
                <Label htmlFor="up">Increase only ↗️</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="down" id="down" />
                <Label htmlFor="down">Decrease only ↘️</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both">Both directions ↕️</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notification Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Notification Frequency</Label>
            <Select 
              value={formData.notification_frequency} 
              onValueChange={(value: 'immediate' | 'hourly' | 'daily') => 
                setFormData({ ...formData, notification_frequency: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-sm z-50">
                <SelectItem 
                  value="immediate"
                  className="bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                >
                  Immediate
                </SelectItem>
                <SelectItem 
                  value="hourly"
                  className="bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                >
                  Every Hour
                </SelectItem>
                <SelectItem 
                  value="daily"
                  className="bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                >
                  Daily
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading || !formData.crypto_id} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Alert...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Create Alert
                </>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}