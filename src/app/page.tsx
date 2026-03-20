import { Hero } from "@/components/sections/hero";
import { OpportunityTicker } from "@/components/sections/opportunity-ticker";
import { SignalsShowcase } from "@/components/sections/signals-showcase";
import { GemsDiscovery } from "@/components/sections/gems-discovery";
import { PricingTable } from "@/components/sections/pricing-table";
import { FinalCTA } from "@/components/sections/final-cta";
import { Container } from "@/components/layout/container";
import { MarketOverview } from "@/components/sections/market-overview";
import { CurrencyList } from "@/components/market/currency-list";

export default function Home() {
  return (
    <>
      {/* Hero Section - 核心价值展示 */}
      <Hero />
      
      {/* Live Opportunity Ticker - 实时机会滚动条 */}
      <OpportunityTicker />
      
      {/* Market Overview - 市场概览（保留原有功能） */}
      <Container>
        <div className="py-8">
          <MarketOverview />
        </div>
      </Container>
      
      {/* AI Signals Showcase - AI 信号展示（付费墙） */}
      <SignalsShowcase />
      
      {/* Gems Discovery - 潜力币发现（付费墙） */}
      <GemsDiscovery />
      
      {/* All Cryptocurrencies - 全部币种列表（保留原有功能） */}
      <Container>
        <div className="py-8">
          <CurrencyList />
        </div>
      </Container>
      
      {/* Pricing Plans - 付费方案 */}
      <PricingTable />
      
      {/* Final CTA + FAQ - 最后转化 + 常见问题 */}
      <FinalCTA />
    </>
  );
}
