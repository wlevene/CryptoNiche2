"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash2, Bell, BellOff, TrendingUp, Target } from "lucide-react";

interface UserAlert {
  id: string;
  crypto_id: number;
  alert_type: 'price_change' | 'price_threshold';
  threshold_percentage: number | null;
  threshold_price: number | null;
  direction: 'up' | 'down' | 'both';
  is_active: boolean;
  notification_frequency: 'immediate' | 'hourly' | 'daily';
  last_triggered_at: string | null;
  created_at: string;
  top_cryptocurrencies?: {
    id: number;
    name: string;
    symbol: string;
    price: number;
    percent_change_24h: number;
  };
}

interface AlertListProps {
  onRefresh?: () => void;
}

export function AlertList({ onRefresh }: AlertListProps) {
  const [alerts, setAlerts] = useState<UserAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts');
      const result = await response.json();
      if (result.success) {
        setAlerts(result.data);
      } else {
        toast.error('Failed to load alerts');
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/toggle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: isActive }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`Alert ${isActive ? 'activated' : 'deactivated'}`);
        fetchAlerts();
        onRefresh?.();
      } else {
        toast.error(result.error || 'Failed to update alert');
      }
    } catch (error) {
      console.error('Error toggling alert:', error);
      toast.error('Failed to update alert');
    }
  };

  const deleteAlert = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) {
      return;
    }

    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Alert deleted successfully');
        fetchAlerts();
        onRefresh?.();
      } else {
        toast.error(result.error || 'Failed to delete alert');
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast.error('Failed to delete alert');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'both': return '↕️';
      default: return '↕️';
    }
  };

  const getFrequencyBadge = (frequency: string) => {
    switch (frequency) {
      case 'immediate': return <Badge variant="default">Immediate</Badge>;
      case 'hourly': return <Badge variant="secondary">Hourly</Badge>;
      case 'daily': return <Badge variant="outline">Daily</Badge>;
      default: return <Badge variant="outline">{frequency}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No alerts configured</h3>
            <p className="text-muted-foreground">
              Create your first price alert to get notified about important price movements
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Card key={alert.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {alert.alert_type === 'price_change' ? (
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Target className="h-4 w-4 text-purple-500" />
                    )}
                    <span className="font-semibold">
                      {alert.top_cryptocurrencies?.symbol} ({alert.top_cryptocurrencies?.name})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getFrequencyBadge(alert.notification_frequency)}
                    {alert.is_active ? (
                      <Badge variant="default" className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground mb-3">
                  {alert.alert_type === 'price_change' ? (
                    <span>
                      Alert when price changes by <strong>{alert.threshold_percentage}%</strong> {getDirectionIcon(alert.direction)}
                    </span>
                  ) : (
                    <span>
                      Alert when price crosses <strong>{formatPrice(alert.threshold_price || 0)}</strong> {getDirectionIcon(alert.direction)}
                    </span>
                  )}
                </div>

                {alert.top_cryptocurrencies?.price && (
                  <div className="text-sm text-muted-foreground mb-2">
                    Current price: <strong>{formatPrice(alert.top_cryptocurrencies.price)}</strong>
                    {alert.top_cryptocurrencies.percent_change_24h && (
                      <span className={`ml-2 ${alert.top_cryptocurrencies.percent_change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {alert.top_cryptocurrencies.percent_change_24h >= 0 ? '+' : ''}{alert.top_cryptocurrencies.percent_change_24h.toFixed(2)}%
                      </span>
                    )}
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Created: {formatDate(alert.created_at)}
                  {alert.last_triggered_at && (
                    <span className="ml-4">
                      Last triggered: {formatDate(alert.last_triggered_at)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={alert.is_active}
                    onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {alert.is_active ? 'On' : 'Off'}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteAlert(alert.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}