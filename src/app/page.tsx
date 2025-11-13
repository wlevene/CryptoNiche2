import { Hero } from "@/components/sections/hero";
import { Container } from "@/components/layout/container";
import { MarketOverview } from "@/components/sections/market-overview";

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
