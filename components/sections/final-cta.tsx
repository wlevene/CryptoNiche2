"use client";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How accurate are the AI signals?",
    answer: "Our AI signals have achieved 70%+ accuracy based on extensive backtesting and real-world performance over the past 6 months. However, past performance doesn't guarantee future results, and we always recommend doing your own research.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes! You can cancel your subscription at any time with no questions asked. If you cancel during your trial period, you won't be charged. If you cancel mid-cycle, you'll retain access until the end of your billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, Amex) via Stripe, as well as cryptocurrency payments (BTC, ETH, USDT) through Coinbase Commerce.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! We offer a 7-day free trial with full access to all Pro features. No credit card required to start. You can upgrade to paid subscription anytime during or after the trial.",
  },
  {
    question: "How often are signals updated?",
    answer: "Our AI monitors the market 24/7 and updates signals in real-time. On average, we generate 5-10 new signals per day across different cryptocurrencies. Pro members receive instant notifications.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with our service for any reason, contact our support team within 30 days of purchase for a full refund.",
  },
];

export function FinalCTA() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <Container>
        <div className="mx-auto max-w-4xl">
          {/* Final CTA */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              🚀 Ready to Never Miss the Next 10x Crypto?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join 5,000+ traders who are already using CryptoNiche to find opportunities 
              and make smarter trading decisions.
            </p>

            <div className="rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 p-1 shadow-2xl inline-block">
              <div className="bg-background rounded-2xl p-8 md:p-12">
                <h3 className="text-2xl font-bold mb-4">
                  Start Your 7-Day Free Trial Today
                </h3>
                <ul className="text-left space-y-3 mb-8 max-w-md mx-auto">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Full access to all Pro features</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>No credit card required</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Cancel anytime</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>70%+ signal accuracy</span>
                  </li>
                </ul>
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 text-lg px-8 py-6 h-auto w-full md:w-auto">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Limited offer: First 1000 users get 50% off Pro plan
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div id="faq" className="scroll-mt-20">
            <h3 className="text-3xl font-bold text-center mb-8">
              ❓ Frequently Asked Questions
            </h3>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-xl border bg-background overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-semibold text-lg">{faq.question}</span>
                    <span className={`text-2xl transition-transform ${
                      openIndex === index ? "rotate-45" : ""
                    }`}>
                      +
                    </span>
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-4 text-muted-foreground">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Link */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              Still have questions?{" "}
              <a href="mailto:support@cryptoniche.ai" className="text-orange-500 hover:underline font-medium">
                Contact our support team →
              </a>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
