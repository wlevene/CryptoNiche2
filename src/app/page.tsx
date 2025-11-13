import { Hero } from "@/components/sections/hero";
import { Container } from "@/components/layout/container";
import { MarketOverview } from "@/components/sections/market-overview";
import { CurrencyList } from "@/components/market/currency-list";

export default function Home() {
  return (
    <>
      <Hero />
      <Container>
        <div className="space-y-8 py-8">
          {/* Market Overview Section */}
          <MarketOverview />

          {/* All Cryptocurrencies Section */}
          <CurrencyList />
        </div>
      </Container>
    </>
  );
}
