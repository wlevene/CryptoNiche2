"use client";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Check, X, Star, Zap, Crown } from "lucide-react";

export function PricingTable() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Basic features to get started",
      icon: Star,
      color: "gray",
      features: [
        { text: "Real-time prices", included: true },
        { text: "Market overview", included: true },
        { text: "5 price alerts/month", included: true },
        { text: "20 favorites", included: true },
        { text: "7-day historical data", included: true },
        { text: "AI trading signals", included: false },
        { text: "Gem discovery", included: false },
        { text: "Portfolio tracker", included: false },
        { text: "Advanced charts", included: false },
      ],
      cta: "Sign Up Free",
      popular: false,
    },
    {
      name: "PRO",
      price: "$39",
      period: "/month",
      description: "Perfect for serious traders",
      icon: Zap,
      color: "orange",
      features: [
        { text: "Real-time prices", included: true },
        { text: "Market overview", included: true },
        { text: "Unlimited price alerts", included: true },
        { text: "Unlimited favorites", included: true },
        { text: "Full historical data", included: true },
        { text: "AI trading signals", included: true },
        { text: "Gem discovery", included: true },
        { text: "Portfolio tracker", included: true },
        { text: "Advanced charts", included: true },
      ],
      cta: "Start 7-Day Free Trial",
      popular: true,
    },
    {
      name: "Elite",
      price: "$99",
      period: "/month",
      description: "For professional traders",
      icon: Crown,
      color: "purple",
      features: [
        { text: "Everything in Pro", included: true },
        { text: "API access (1000 req/min)", included: true },
        { text: "VIP Telegram group", included: true },
        { text: "SMS alerts (unlimited)", included: true },
        { text: "Priority support", included: true },
        { text: "Early feature access", included: true },
        { text: "Custom integrations", included: true },
        { text: "White-label options", included: true },
        { text: "Dedicated account manager", included: true },
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <Container>
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              💰 Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your trading style. Start free, upgrade when you're ready.
            </p>
          </div>

          {/* 优惠提示 */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 text-white font-semibold shadow-lg">
              <Zap className="h-5 w-5" />
              <span>Limited Offer: First 1000 Pro users get 50% off!</span>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              const isPopular = plan.popular;
              const isOrange = plan.color === "orange";
              const isPurple = plan.color === "purple";

              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border-2 ${
                    isPopular
                      ? "border-orange-500 shadow-2xl scale-105"
                      : "border-border"
                  } bg-background p-8 transition-all hover:shadow-xl`}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                        ⭐ MOST POPULAR
                      </div>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
                      isPurple ? "bg-purple-500/10" : isOrange ? "bg-orange-500/10" : "bg-gray-500/10"
                    }`}>
                      <Icon className={`h-8 w-8 ${
                        isPurple ? "text-purple-500" : isOrange ? "text-orange-500" : "text-gray-500"
                      }`} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${
                          feature.included ? "text-foreground" : "text-muted-foreground line-through"
                        }`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full text-lg py-6 h-auto ${
                      isPopular
                        ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        : isPurple
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                        : ""
                    }`}
                    variant={isPopular || isPurple ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>

                  {/* Trust Badge */}
                  {isPopular && (
                    <p className="text-xs text-center text-muted-foreground mt-4">
                      ✓ No credit card required · 7-day free trial
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Money Back Guarantee */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 p-6 rounded-xl bg-background border">
              <div className="text-left">
                <p className="font-semibold">30-Day Money-Back Guarantee</p>
                <p className="text-sm text-muted-foreground">
                  Not satisfied? Get a full refund, no questions asked.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Link */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Have questions?{" "}
              <a href="#faq" className="text-orange-500 hover:underline font-medium">
                Check our FAQ →
              </a>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
