"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertForm } from "@/components/alerts/alert-form";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Bell, MoreHorizontal, Share, ExternalLink } from "lucide-react";

interface CryptoData {
  id: number;
  symbol: string;
  name: string;
  price: number;
  slug: string;
}

interface QuickActionsProps {
  crypto: CryptoData;
}

export function QuickActions({ crypto }: QuickActionsProps) {
  const { user } = useAuth();
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);

  const handleCreateAlert = () => {
    if (!user) {
      toast.error("Please sign in to create price alerts");
      return;
    }
    setIsAlertDialogOpen(true);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/crypto/${crypto.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${crypto.name} (${crypto.symbol}) - CryptoNiche`,
          text: `Check out ${crypto.name} price and market data`,
          url: url,
        });
      } catch (error) {
        // User cancelled or share failed
        handleCopyLink(url);
      }
    } else {
      handleCopyLink(url);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied to clipboard");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  const handleViewOnCoinMarketCap = () => {
    // Open CoinMarketCap page in new tab
    const cmcUrl = `https://coinmarketcap.com/currencies/${crypto.slug || crypto.name.toLowerCase().replace(/\s+/g, '-')}/`;
    window.open(cmcUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center gap-2">
      {/* Create Alert Button */}
      <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={handleCreateAlert} className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Create Alert
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Price Alert for {crypto.name}</DialogTitle>
            <DialogDescription>
              Set up a price alert to get notified when {crypto.symbol} reaches your target price or change percentage.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <AlertForm 
              onSuccess={() => {
                setIsAlertDialogOpen(false);
                toast.success(`Price alert created for ${crypto.symbol}`);
              }}
              onCancel={() => setIsAlertDialogOpen(false)}
              // Pre-select this cryptocurrency if the AlertForm supports it
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* More Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleShare}>
            <Share className="mr-2 h-4 w-4" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewOnCoinMarketCap}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View on CoinMarketCap
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}