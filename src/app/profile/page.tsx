"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAlertsList } from "@/components/profile/user-alerts-list";
import { NotificationHistory } from "@/components/profile/notification-history";
import { AlertsStats } from "@/components/profile/alerts-stats";
import { UserSettings } from "@/components/profile/user-settings";
import { FavoritesList } from "@/components/profile/favorites-list";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { User, Bell, Heart, Settings, BarChart3, History } from "lucide-react";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Please Sign In</h3>
              <p className="text-muted-foreground mb-4">
                You need to be signed in to access your profile and manage your alerts.
              </p>
              <Button>Sign In</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* User Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Center</h1>
          <p className="text-muted-foreground">
            Manage your alerts, view notifications, and customize your preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-medium">{user.user_metadata?.name || user.email}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            My Alerts
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Favorites
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AlertsStats />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Active Alerts</CardTitle>
              <CardDescription>
                Manage your cryptocurrency price alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserAlertsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Cryptocurrencies</CardTitle>
              <CardDescription>
                Your watchlist of favorite cryptocurrencies for quick access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FavoritesList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>
                View your alert notification history and delivery status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationHistory />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <UserSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}