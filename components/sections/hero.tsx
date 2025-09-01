import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";

export function Hero() {
  return (
    <section className="py-20 lg:py-32">
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Intelligent
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Cryptocurrency{" "}
            </span>
            Analytics Platform
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            Real-time market data, intelligent analysis tools, and personalized investment recommendations. Let data drive your cryptocurrency investment decisions and seize every market opportunity.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mx-auto mt-20 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-8 text-center">
                <div className="mx-auto h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time Data</h3>
                <p className="text-muted-foreground">
                  Multi-source integration providing the most accurate real-time prices and market information
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-8 text-center">
                <div className="mx-auto h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Analysis</h3>
                <p className="text-muted-foreground">
                  AI-driven market analysis and predictions to help you make smarter investment decisions
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-8 text-center">
                <div className="mx-auto h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
                <p className="text-muted-foreground">
                  Enterprise-grade security protecting your data and investment privacy
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}