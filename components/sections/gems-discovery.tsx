"use client";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Lock, Gem, TrendingUp, BarChart3, Database, MessageSquare } from "lucide-react";

// 模拟潜力币数据
const mockGems = [
  { rank: 1, symbol: "XYZ", name: "Example Coin", score: 92, current: "$0.15", target: "$0.45", upside: "3x", marketCap: "$15M", volume24h: "$2.3M" },
  { rank: 2, symbol: "ABC", name: "Another Coin", score: 88, current: "$1.20", target: "$3.50", upside: "2.9x", marketCap: "$45M", volume24h: "$8.1M" },
  { rank: 3, symbol: "DEF", name: "DeFi Token", score: 85, current: "$0.08", target: "$0.20", upside: "2.5x", marketCap: "$8M", volume24h: "$1.2M" },
  { rank: 4, symbol: "GHI", name: "Gaming Token", score: 82, current: "$2.50", target: "$5.00", upside: "2x", marketCap: "$120M", volume24h: "$15.6M" },
  { rank: 5, symbol: "JKL", name: "Layer2 Coin", score: 80, current: "$0.35", target: "$0.60", upside: "1.7x", marketCap: "$35M", volume24h: "$4.8M" },
];

export function GemsDiscovery() {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 80) return "text-blue-500";
    if (score >= 70) return "text-yellow-500";
    return "text-orange-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-500/10";
    if (score >= 80) return "bg-blue-500/10";
    if (score >= 70) return "bg-yellow-500/10";
    return "bg-orange-500/10";
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <Container>
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-600 mb-4">
              <Gem className="h-4 w-4" />
              <span>AI-Powered Discovery</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              💎 Discover the Next 10x Gems Before Everyone Else
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our AI scans 10,000+ cryptocurrencies daily to find hidden opportunities 
              with massive potential. Get detailed analysis and buy recommendations.
            </p>
          </div>

          {/* 评分维度 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center p-6 rounded-xl bg-background border">
              <BarChart3 className="h-8 w-8 mx-auto mb-3 text-blue-500" />
              <p className="text-sm font-semibold mb-1">Technical</p>
              <p className="text-2xl font-bold">30%</p>
              <p className="text-xs text-muted-foreground">Price patterns, volume, indicators</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-background border">
              <Database className="h-8 w-8 mx-auto mb-3 text-green-500" />
              <p className="text-sm font-semibold mb-1">Fundamental</p>
              <p className="text-2xl font-bold">25%</p>
              <p className="text-xs text-muted-foreground">Market cap, tokenomics, team</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-background border">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-purple-500" />
              <p className="text-sm font-semibold mb-1">On-chain</p>
              <p className="text-2xl font-bold">20%</p>
              <p className="text-xs text-muted-foreground">Active addresses, whale activity</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-background border">
              <MessageSquare className="h-8 w-8 mx-auto mb-3 text-orange-500" />
              <p className="text-sm font-semibold mb-1">Sentiment</p>
              <p className="text-2xl font-bold">25%</p>
              <p className="text-xs text-muted-foreground">Social media, news, trends</p>
            </div>
          </div>

          {/* 潜力币表格 */}
          <div className="rounded-2xl border-2 border-border bg-background shadow-xl overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">🔥 Today's Top 5 Potential Gems</h3>
                <p className="text-sm opacity-90">Updated 10 minutes ago</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Coin</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Score</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Current</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Target</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Upside</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockGems.map((gem) => (
                    <tr key={gem.symbol} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {gem.rank <= 3 ? (
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm">
                              #{gem.rank}
                            </span>
                          ) : (
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-sm">
                              #{gem.rank}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold">{gem.symbol}</p>
                          <p className="text-sm text-muted-foreground">{gem.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getScoreBg(gem.score)} ${getScoreColor(gem.score)}`}>
                          {gem.score}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold">{gem.current}</p>
                        <p className="text-xs text-muted-foreground">MC: {gem.marketCap}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-muted-foreground">🔒</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-bold text-green-600">🔒</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 付费墙覆盖层 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                <div className="text-center p-8 rounded-2xl bg-background/95 backdrop-blur-md border-2 border-purple-500 shadow-2xl max-w-lg mx-4">
                  <Lock className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                  <h4 className="text-2xl font-bold mb-2">Unlock Full Analysis</h4>
                  <p className="text-muted-foreground mb-2">
                    Get complete gem recommendations with:
                  </p>
                  <ul className="text-left text-sm space-y-2 mb-6 mx-auto max-w-md">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Exact target prices and upside potential
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Detailed analysis and buy recommendations
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Real-time alerts for new opportunities
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Portfolio tracking and performance metrics
                    </li>
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500">
                      Start 7-Day Free Trial
                    </Button>
                    <Button variant="outline" className="flex-1">
                      View Pricing
                    </Button>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    No credit card required · Full Pro access for 7 days
                  </p>
                </div>
              </div>
              
              {/* 模糊背景 */}
              <div className="blur-sm select-none py-12" />
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-4">
              Ready to find the next 10x crypto before it pumps?
            </p>
            <Button size="lg" className="bg-gradient-to-r from-purple-500 to-blue-500 text-lg px-8">
              Start Discovering Gems →
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
