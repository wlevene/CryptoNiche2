"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertForm } from "@/components/alerts/alert-form";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface QuickAlertButtonProps {
  cmcId: number;
  symbol: string;
  currentPrice?: number;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

/**
 * 快速创建 Alert 按钮
 * 可以在货币列表中直接点击创建提醒
 */
export function QuickAlertButton({
  cmcId,
  symbol,
  currentPrice,
  variant = "ghost",
  size = "sm",
  className = "",
}: QuickAlertButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止触发父元素的点击事件

    if (!user) {
      toast.error("Please sign in to create alerts");
      return;
    }

    setIsOpen(true);
  };

  const handleSuccess = () => {
    setIsOpen(false);
    toast.success("Alert created successfully!");
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className={className}
        title={`Create alert for ${symbol}`}
      >
        <Bell className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Price Alert for {symbol}</DialogTitle>
            <DialogDescription>
              Set up a price alert to get notified when {symbol} reaches your target conditions.
              {currentPrice && (
                <span className="block mt-1 text-sm font-medium">
                  Current price: ${currentPrice.toLocaleString()}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <AlertForm
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              defaultCryptoId={cmcId}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
