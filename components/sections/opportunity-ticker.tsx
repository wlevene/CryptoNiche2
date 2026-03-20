"use client";

import { useState, useEffect } from "react";
import { TrendingUp, AlertCircle } from "lucide-react";

// 模拟实时机会数据
const mockOpportunities = [
  { id: 1, type: "signal", text: "$PEPE just triggered Strong Buy signal (+34% in 2h)", urgent: true },
  { id: 2, type: "breakout", text: "$BTC breaking resistance at $52,000", urgent: false },
  { id: 3, type: "accumulation", text: "$ETH accumulation detected - Whale activity +156%", urgent: false },
  { id: 4, type: "signal", text: "$SOL Buy signal triggered - Target $120 (+18%)", urgent: true },
  { id: 5, type: "volume", text: "$XYZ volume surge 300% in last hour", urgent: false },
  { id: 6, type: "sentiment", text: "$ARB social sentiment +500% - Trending #1", urgent: false },
];

export function OpportunityTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockOpportunities.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const currentOpportunity = mockOpportunities[currentIndex];

  return (
    <div className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 text-white py-3 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            {currentOpportunity.urgent ? (
              <AlertCircle className="h-5 w-5 animate-pulse" />
            ) : (
              <TrendingUp className="h-5 w-5" />
            )}
            <span className="font-bold text-sm uppercase tracking-wider">
              {currentOpportunity.urgent ? "🔴 LIVE" : "🟢 Opportunity"}
            </span>
          </div>
          
          <div className="flex-1 max-w-4xl overflow-hidden">
            <p className="text-center font-medium text-sm sm:text-base truncate animate-fade-in">
              {currentOpportunity.text}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs opacity-80">
            <span>Updated 2 min ago</span>
          </div>
        </div>
      </div>

      {/* 动画样式 */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
