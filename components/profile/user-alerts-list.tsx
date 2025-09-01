"use client";

import { useState, useEffect } from "react";
import { AlertList } from "@/components/alerts/alert-list";
import { AlertForm } from "@/components/alerts/alert-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function UserAlertsList() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAlertCreated = () => {
    setIsCreateDialogOpen(false);
    setRefreshKey(prev => prev + 1); // Trigger refresh of AlertList
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Your Price Alerts</h3>
          <p className="text-sm text-muted-foreground">
            Manage and monitor your cryptocurrency price alerts
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Price Alert</DialogTitle>
              <DialogDescription>
                Set up a new cryptocurrency price alert to get notified when your target conditions are met.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <AlertForm 
                onSuccess={handleAlertCreated}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts List */}
      <div key={refreshKey}>
        <AlertList onRefresh={handleRefresh} />
      </div>
    </div>
  );
}