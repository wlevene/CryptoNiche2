"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Bell, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

interface NotificationItem {
  id: string;
  created_at: string;
  trigger_price: number;
  previous_price: number;
  price_change_percentage: number;
  status: 'pending' | 'sent' | 'failed';
  sent_at: string | null;
  error_message: string | null;
  cryptocurrencies?: {
    id: number;
    name: string;
    symbol: string;
  };
  user_alerts?: {
    id: string;
    alert_type: 'price_change' | 'price_threshold';
    threshold_percentage: number | null;
    threshold_price: number | null;
    direction: 'up' | 'down' | 'both';
  };
}

export function NotificationHistory() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    fetchNotifications();
  }, [limit]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/alerts/notifications?limit=${limit}`);
      const result = await response.json();

      if (result.success) {
        setNotifications(result.data || []);
      } else {
        toast.error('Failed to load notification history');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notification history');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
                <div className="h-6 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Notifications Yet</h3>
        <p className="text-muted-foreground">
          When your price alerts trigger, you'll see the notification history here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing {notifications.length} notifications
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchNotifications}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(notification.status)}
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      {notification.cryptocurrencies?.symbol} Alert Triggered
                      {getPriceChangeIcon(notification.price_change_percentage)}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {notification.cryptocurrencies?.name}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(notification.status)}
                  <span className="text-sm text-muted-foreground">
                    {formatDate(notification.created_at)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Trigger Price:</span>
                  <p className="font-semibold">{formatPrice(notification.trigger_price)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Previous Price:</span>
                  <p className="font-semibold">{formatPrice(notification.previous_price)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Change:</span>
                  <p className={`font-semibold ${
                    notification.price_change_percentage >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {notification.price_change_percentage >= 0 ? '+' : ''}
                    {notification.price_change_percentage.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Alert Type:</span>
                  <p className="font-semibold capitalize">
                    {notification.user_alerts?.alert_type?.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {notification.status === 'sent' && notification.sent_at && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-green-600">
                    ✓ Delivered at {formatDate(notification.sent_at)}
                  </p>
                </div>
              )}

              {notification.status === 'failed' && notification.error_message && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-red-600">
                    ✗ Failed: {notification.error_message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {notifications.length >= limit && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={() => setLimit(limit + 20)}
            disabled={isLoading}
          >
            Load More Notifications
          </Button>
        </div>
      )}
    </div>
  );
}