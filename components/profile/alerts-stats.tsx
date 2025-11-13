"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";
import { alertServiceV2 } from "@/lib/services/alert-service-v2";

interface AlertsStatsData {
  totalAlerts: number;
  activeAlerts: number;
  inactiveAlerts: number;
  totalNotifications: number;
  recentNotifications: number;
  successfulAlerts: number;
}

export function AlertsStats() {
  const [stats, setStats] = useState<AlertsStatsData>({
    totalAlerts: 0,
    activeAlerts: 0,
    inactiveAlerts: 0,
    totalNotifications: 0,
    recentNotifications: 0,
    successfulAlerts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);

      // Fetch alerts and notifications using service
      const [alertsResult, notificationsResult] = await Promise.all([
        alertServiceV2.getAlerts(),
        alertServiceV2.getNotifications()
      ]);

      const alerts = alertsResult.items || [];
      const notifications = notificationsResult.items || [];

      const totalAlerts = alerts.length;
      const activeAlerts = alerts.filter((alert: any) => alert.is_active).length;
      const inactiveAlerts = totalAlerts - activeAlerts;

      const totalNotifications = notifications.length;
      const recentNotifications = notifications.filter((notification: any) => {
        const createdAt = new Date(notification.created_at);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return createdAt >= sevenDaysAgo;
      }).length;

      const successfulAlerts = notifications.filter((notification: any) =>
        notification.status === 'sent'
      ).length;

      setStats({
        totalAlerts,
        activeAlerts,
        inactiveAlerts,
        totalNotifications,
        recentNotifications,
        successfulAlerts,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              All-time created alerts
            </p>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Currently monitoring
            </p>
          </CardContent>
        </Card>

        {/* Total Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNotifications}</div>
            <p className="text-xs text-muted-foreground">
              Total alerts triggered
            </p>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.recentNotifications}</div>
            <p className="text-xs text-muted-foreground">
              Past 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Overview</CardTitle>
          <CardDescription>Your alert system performance summary</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Alert Success Rate</span>
            <Badge variant={stats.totalNotifications > 0 && (stats.successfulAlerts / stats.totalNotifications) > 0.9 ? "default" : "secondary"}>
              {stats.totalNotifications > 0 
                ? `${Math.round((stats.successfulAlerts / stats.totalNotifications) * 100)}%`
                : "N/A"
              }
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Active vs Inactive</span>
            <div className="flex gap-2">
              <Badge variant="default">{stats.activeAlerts} Active</Badge>
              <Badge variant="outline">{stats.inactiveAlerts} Inactive</Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Average Alerts per Crypto</span>
            <Badge variant="outline">
              {stats.totalAlerts > 0 ? Math.round(stats.totalAlerts / Math.max(1, stats.totalAlerts)) : 0}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}