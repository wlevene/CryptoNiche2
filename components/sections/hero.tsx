"use client";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Zap, Star, Lock } from "lucide-react";
import { useState, useEffect } from "react";

// 模拟 AI 信号数据
const mockSignals = [
  {
    symbol: "BTC",
    type: "Buy",
    signalType: "buy",
    currentPrice: "$52,000",
    targetPrice: "$65,000",
    upside: "+25%",
    confidence: 85,
    timeFrame: "7-14 days",
  },
  {
    symbol: "ETH",
    type: "Strong Buy",
    signalType: "strong_buy",
    currentPrice: "$3,000",
    targetPrice: "$4,500",
    upside: "+50%",
    confidence: 92,
    timeFrame: "14-30 days",
  },
  {
    symbol: "XYZ",
    type: "Strong Buy",
    signalType: "strong_buy",
    currentPrice: "$0.15",
    targetPrice: "$0.45",
    upside: "+200%",
    confidence: 88,
    timeFrame: "7-14 days",
    hot: true,
  },
];

// 模拟潜力币数据
const mockGems = [
  { rank: 1, symbol: "XYZ", score: 92, current: "$0.15", target: "$0.45", upside: "3x" },
  { rank: 2, symbol: "ABC", score: 88, current: "$1.20", target: "$3.50", upside: "2.9x" },
  { rank: 3, symbol: "DEF", score: 85, current: "$0.08", target: "$0.20", upside: "2.5x" },
  { rank: 4, symbol: "GHI", score: 82, current: "$2.50", target: "$5.00", upside: "2x" },
  { rank: 5, symbol: "JKL", score: 80, current: "$0.35", target: "$0.60", upside: "1.7x" },
];

export function Hero() {
  const [currentSignalIndex, setCurrentSignalIndex] = useState(0);

  // 自动轮播信号
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSignalIndex((prev) => (prev + 1) % mockSignals.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const getSignalColor = (type: string) => {
    switch (type) {
      case "strong_buy":
        return "text-green-500 bg-green-500/10";
      case "buy":
        return "text-green-600 bg-green-600/10";
      case "hold":
        return "text-yellow-500 bg-yellow-500/10";
      case "sell":
        return "text-orange-500 bg-orange-500/10";
      case "strong_sell":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-blue-500 bg-blue-500/10";
    }
  };

  const getSignalIcon = (type: string) => {
    switch (type) {
      case "strong_buy":
        return "🟩";
      case "buy":
        return "🟢";
      case "hold":
        return "🟡";
      case "sell":
        return "🟠";
      case "strong_sell":
        return "🔴";
      default:
        return "🔵";
    }
  };

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20">
      <Container>
        <div className="mx-auto max-w-6xl text-center">
          {/* 主标题 */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-600">
            <TrendingUp className="h-4 w-4" />
            <span>AI-Powered Trading Signals</span>
          </div>

          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Don't Miss the Next
            <span className="block bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 bg-clip-text text-transparent">
              10x Crypto
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            AI-powered trading signals that help you{" "}
            <span className="font-semibold text-foreground">buy early</span>,{" "}
            <span className="font-semibold text-foreground">sell smart</span>, and{" "}
            <span className="font-semibold text-foreground">never regret</span> "what if"
          </p>

          {/* CTA 按钮 */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-shadow">
              Start Your 7-Day Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground">
              No credit card required · 70%+ signal accuracy
            </p>
          </div>

          {/* 信任背书 */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span>70%+ Signal Accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 fill-blue-500 text-blue-500" />
              <span>Real-time Alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 fill-green-500 text-green-500" />
              <span>Cancel Anytime</span>
            </div>
          </div>

          {/* 成功案例 */}
          <p className="mt-8 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Last month our users caught:</span>{" "}
            <span className="text-green-600 font-semibold">SOL +145%</span> ·{" "}
            <span className="text-green-600 font-semibold">AVAX +89%</span> ·{" "}
            <span className="text-green-600 font-semibold">ARB +234%</span>
          </p>
        </div>

        {/* 动态 AI 信号展示 */}
        <div className="mx-auto mt-20 max-w-5xl">
          <h2 className="text-2xl font-bold mb-8 text-center">
            🔥 Today's Top AI Signals
          </h2>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {mockSignals.map((signal, index) => {
              const isActive = index === currentSignalIndex;
              return (
                <div
                  key={signal.symbol}
                  className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-500 ${
                    isActive
                      ? "border-orange-500 shadow-xl scale-105"
                      : "border-border opacity-60 scale-95"
                  }`}
                >
                  {signal.hot && (
                    <div className="absolute top-3 right-3 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white animate-pulse">
                      🔥 HOT
                    </div>
                  )}
                  
                  <div className={`p-6 ${getSignalColor(signal.signalType)}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getSignalIcon(signal.signalType)}</span>
                        <div>
                          <h3 className="text-2xl font-bold">{signal.symbol}</h3>
                          <p className="text-sm font-medium">{signal.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Confidence</p>
                        <p className="text-2xl font-bold">{signal.confidence}%</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Current:</span>
                        <span className="font-semibold">{signal.currentPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Target:</span>
                        <span className="font-semibold text-green-600">{signal.targetPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Upside:</span>
                        <span className="font-bold text-green-600">{signal.upside}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Time:</span>
                        <span className="font-medium">{signal.timeFrame}</span>
                      </div>
                    </div>

                    {/* 解锁按钮 */}
                    <div className="mt-6">
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500">
                        <Lock className="mr-2 h-4 w-4" />
                        Unlock Full Signal
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            📊 Signals updated every 5 minutes ·{" "}
            <span className="font-medium text-orange-600">
              Start free trial to view all signals
            </span>
          </p>
        </div>
      </Container>
    </section>
  );
}
