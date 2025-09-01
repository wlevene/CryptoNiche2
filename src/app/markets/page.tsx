"use client";

import { Navbar } from "@/components/layout/navbar";
import { MarketOverview } from "@/components/sections/market-overview";
import { Container } from "@/components/layout/container";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Bell, Mail } from "lucide-react";
import { AuthModal } from "@/components/auth/auth-modal";
import { useState } from "react";

export default function MarketsPage() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Container>
          <div className="py-12">
            {/* Page Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Cryptocurrency Markets</h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Track real-time cryptocurrency prices and market data. 
                {!user && " Sign up to get price alerts and never miss important market movements."}
              </p>
            </div>

            {/* Alert Feature Introduction for Non-logged Users */}
            {!user && (
              <div className="bg-card border rounded-lg p-6 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full">
                    <Bell className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">🔔 智能价格告警</h3>
                    <p className="text-muted-foreground mb-4">
                      订阅您关注的加密货币价格变化告警，当价格波动超过设定阈值时，我们会第一时间通过邮件通知您，让您不错过任何投资机会。
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">价格变化百分比告警</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">固定价格阈值告警</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">即时邮件通知</span>
                      </div>
                    </div>
                    <Button onClick={() => setAuthModalOpen(true)} className="w-full sm:w-auto">
                      免费注册，开启价格告警
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Market Data */}
            <MarketOverview />

            {/* Call to Action for Logged Users */}
            {user && (
              <div className="mt-8 text-center">
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">管理您的价格告警</h3>
                  <p className="text-muted-foreground mb-4">
                    点击任何加密货币可以设置价格告警，或访问告警管理页面查看所有活跃告警。
                  </p>
                  <Button asChild>
                    <a href="/alerts">管理告警设置</a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Container>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Container>
          <div className="py-8">
            <div className="text-center text-muted-foreground">
              <p>&copy; 2024 CryptoNiche. All rights reserved.</p>
              <p className="text-sm mt-2">
                Real-time cryptocurrency market data and intelligent analysis platform
              </p>
            </div>
          </div>
        </Container>
      </footer>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
      />
    </div>
  );
}