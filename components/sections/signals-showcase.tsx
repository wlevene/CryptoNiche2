"use client";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Lock, TrendingUp, Activity, Users, Shield } from "lucide-react";

// 模拟 AI 信号数据
const mockSignals = [
  {
    symbol: "XYZ",
    name: "Example Coin",
    type: "STRONG BUY",
    signalType: "strong_buy",
    currentPrice: "$0.15",
    targetPrice: "$0.45",
    upside: "+200%",
    confidence: 92,
    timeFrame: "7-14 days",
    reasons: [
      "Volume surge 300%",
      "Whale accumulation detected",
      "Social sentiment +500%",
      "Breaking key resistance",
    ],
  },
  {
    symbol: "ABC",
    name: "Another Coin",
    type: "BUY",
    signalType: "buy",
    currentPrice: "$1.20",
    targetPrice: "$3.50",
    upside: "+192%",
    confidence: 85,
    timeFrame: "14-30 days",
    reasons: [
      "RSI oversold bounce",
      "Major partnership announcement",
      "Exchange listing rumors",
      "Developer activity +200%",
    ],
  },
  {
    symbol: "DEF",
    name: "DeFi Token",
    type: "BUY",
    signalType: "buy",
    currentPrice: "$0.08",
    targetPrice: "$0.20",
    upside: "+150%",
    confidence: 78,
    timeFrame: "7-14 days",
    reasons: [
      "TVL growth +450%",
      "Token burn mechanism",
      "Institutional interest",
      "Technical breakout pattern",
    ],
  },
];

export function SignalsShowcase() {
  const getSignalColor = (type: string) => {
    switch (type) {
      case "strong_buy":
        return "bg-green-500";
      case "buy":
        return "bg-green-600";
      case "hold":
        return "bg-yellow-500";
      case "sell":
        return "bg-orange-500";
      case "strong_sell":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <section className="py-20 bg-muted/30">
      <Container>
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              🎯 AI Trading Signals - Your 24/7 Trading Assistant
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our AI analyzes 1000+ cryptocurrencies using technical indicators, on-chain data, 
              social sentiment, and whale activity to give you clear buy/sell signals.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center p-6 rounded-xl bg-background border">
              <Activity className="h-8 w-8 mx-auto mb-3 text-blue-500" />
              <p className="text-3xl font-bold">70%+</p>
              <p className="text-sm text-muted-foreground">Signal Accuracy</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-background border">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-green-500" />
              <p className="text-3xl font-bold">156%</p>
              <p className="text-sm text-muted-foreground">Avg Gain (Last Month)</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-background border">
              <Users className="h-8 w-8 mx-auto mb-3 text-purple-500" />
              <p className="text-3xl font-bold">5,000+</p>
              <p className="text-sm text-muted-foreground">Active Traders</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-background border">
              <Shield className="h-8 w-8 mx-auto mb-3 text-orange-500" />
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-sm text-muted-foreground">Market Monitoring</p>
            </div>
          </div>

          {/* Signals Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Today's Top Signals</h3>
              <p className="text-sm text-muted-foreground">
                Updated 5 minutes ago
              </p>
            </div>

            {mockSignals.map((signal, index) => (
              <div
                key={signal.symbol}
                className="relative overflow-hidden rounded-2xl border-2 border-border bg-background shadow-lg"
              >
                {/* 信号类型标签 */}
                <div className={`${getSignalColor(signal.signalType)} text-white px-4 py-2`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold">{signal.symbol}</span>
                      <span className="text-sm opacity-90">{signal.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-lg">{signal.type}</span>
                      <span className="text-sm opacity-90">
                        Confidence: {signal.confidence}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* 信号详情 - 模糊处理 */}
                <div className="relative p-6">
                  <div className="blur-sm select-none space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Current Price</p>
                        <p className="text-xl font-bold">{signal.currentPrice}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Target Price</p>
                        <p className="text-xl font-bold text-green-600">{signal.targetPrice}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Upside</p>
                        <p className="text-xl font-bold text-green-600">{signal.upside}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Time Frame</p>
                        <p className="text-xl font-bold">{signal.timeFrame}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold mb-2">Why we're bullish:</p>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {signal.reasons.map((reason, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <span className="text-green-500">✅</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 付费墙覆盖层 */}
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                    <div className="text-center p-8 rounded-2xl bg-background/90 backdrop-blur-sm border-2 border-orange-500 shadow-2xl max-w-md">
                      <Lock className="h-12 w-12 mx-auto mb-4 text-orange-500" />
                      <h4 className="text-2xl font-bold mb-2">Pro Feature</h4>
                      <p className="text-muted-foreground mb-6">
                        Unlock full signal details, target prices, and AI analysis
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button className="flex-1 bg-gradient-to-r from-orange-500 to-red-500">
                          Start 7-Day Free Trial
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Learn More
                        </Button>
                      </div>
                      <p className="mt-4 text-xs text-muted-foreground">
                        No credit card required · Cancel anytime
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              Want to see all signals? Get unlimited access with Pro.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 text-lg px-8">
              Start Free Trial →
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
