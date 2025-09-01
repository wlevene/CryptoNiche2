import { Hero } from "@/components/sections/hero";
import { MarketOverview } from "@/components/sections/market-overview";
import { Container } from "@/components/layout/container";

export default function Home() {
  return (
    <>
      <Hero />
      <Container>
        <MarketOverview />
      </Container>
    </>
  );
}
