"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Settings, Bell, User, Shield, LogOut } from "lucide-react";

interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  defaultNotificationFrequency: 'immediate' | 'hourly' | 'daily';
  timezone: string;
  currency: string;
  theme: 'light' | 'dark' | 'system';
}

export function UserSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    pushNotifications: true,
    defaultNotificationFrequency: 'immediate',
    timezone: 'UTC',
    currency: 'USD',
    theme: 'system'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      setIsLoading(true);
      // For now, we'll use localStorage to store preferences
      // In a real app, this would come from the user's profile in the database
      const stored = localStorage.getItem('userPreferences');
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserPreferences = async () => {
    try {
      setIsSaving(true);
      // For now, save to localStorage
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSignOut = async () => {
    try {
      const { createClient } = await import('@/lib/supabase-client');
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Your account details and basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                type="text"
                value={user?.user_metadata?.name || ''}
                placeholder="Enter your name"
              />
            </div>
          </div>
          <Button variant="outline" disabled>
            Update Profile
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Configure how and when you receive alert notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive alert notifications via email
              </p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => 
                handlePreferenceChange('emailNotifications', checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive browser push notifications
              </p>
            </div>
            <Switch
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) => 
                handlePreferenceChange('pushNotifications', checked)
              }
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Default Alert Frequency</Label>
            <Select
              value={preferences.defaultNotificationFrequency}
              onValueChange={(value: 'immediate' | 'hourly' | 'daily') => 
                handlePreferenceChange('defaultNotificationFrequency', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="hourly">Every Hour</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Display Settings
          </CardTitle>
          <CardDescription>
            Customize your viewing experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={preferences.currency}
                onValueChange={(value) => handlePreferenceChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="BTC">BTC (₿)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={preferences.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => 
                  handlePreferenceChange('theme', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Password</Label>
              <p className="text-sm text-muted-foreground">
                Last changed: Never
              </p>
            </div>
            <Button variant="outline" disabled>
              Change Password
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline" disabled>
              Setup 2FA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button
          onClick={saveUserPreferences}
          disabled={isSaving}
          className="min-w-[120px]"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>

        <Button
          variant="destructive"
          onClick={handleSignOut}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}