"use client";

import { Container } from "@/components/layout/container";
import { Star, TrendingUp, Users, Shield, Award } from "lucide-react";

const testimonials = [
  {
    name: "Mike T.",
    avatar: "👨‍💼",
    rating: 5,
    text: "I caught $PEPE at $0.0001 and sold at $0.0004 thanks to CryptoNiche's signal. 4x in 2 weeks!",
    profit: "+400%",
    verified: true,
  },
  {
    name: "Sarah L.",
    avatar: "👩‍💻",
    rating: 5,
    text: "The AI signals helped me avoid the LUNA crash. Sold 3 days before it went to zero.",
    profit: "Saved $50K",
    verified: true,
  },
  {
    name: "Alex K.",
    avatar: "🧑‍🎤",
    rating: 5,
    text: "Been using CryptoNiche for 6 months. My portfolio is up 156% while the market was flat.",
    profit: "+156%",
    verified: true,
  },
];

const stats = [
  { icon: TrendingUp, value: "70%+", label: "Signal Accuracy", color: "text-green-500" },
  { icon: Award, value: "156%", label: "Avg Gain (Last Month)", color: "text-blue-500" },
  { icon: Users, value: "5,000+", label: "Active Traders", color: "text-purple-500" },
  { icon: Shield, value: "$2.4M", label: "User Profits", color: "text-orange-500" },
];

export function SuccessStories() {
  return (
    <section className="py-20 bg-muted/30">
      <Container>
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              🏆 Real Results from Real Users
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our community members are achieving.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center p-6 rounded-xl bg-background border shadow-sm">
                  <Icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-2xl border bg-background p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  ))}
                  {testimonial.verified && (
                    <span className="ml-2 text-xs text-green-500 font-medium flex items-center gap-1">
                      ✓ Verified
                    </span>
                  )}
                </div>

                {/* Quote */}
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Profit Badge */}
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-sm font-bold">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {testimonial.profit}
                  </span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{testimonial.avatar}</span>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">CryptoNiche Pro Member</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Trusted by traders from companies like
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              <div className="text-2xl font-bold text-muted-foreground">Binance</div>
              <div className="text-2xl font-bold text-muted-foreground">Coinbase</div>
              <div className="text-2xl font-bold text-muted-foreground">Kraken</div>
              <div className="text-2xl font-bold text-muted-foreground">FTX</div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
