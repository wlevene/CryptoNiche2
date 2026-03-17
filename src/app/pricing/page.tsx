"use client";

import { useState } from "react";
import { Check, Zap, Shield, TrendingUp, Star, ZapOff, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

interface Feature {
  text: string;
  included: boolean;
  icon?: LucideIcon;
}

// 定价套餐数据
const plans: Array<{
  name: string;
  description: string;
  price: { monthly: number; yearly: number };
  currency: string;
  trialDays: number;
  features: Feature[];
  cta: string;
  popular: boolean;
  color: string;
  savings?: string;
}> = [
  {
    name: "Free",
    description: "基础功能，适合新手体验",
    price: { monthly: 0, yearly: 0 },
    currency: "USD",
    trialDays: 0,
    features: [
      { text: "5 个价格提醒/月", included: true },
      { text: "最多 20 个收藏", included: true },
      { text: "基础市场数据", included: true },
      { text: "7 天历史数据", included: true },
      { text: "AI 买卖信号", included: false },
      { text: "潜力币推荐", included: false },
      { text: "投资组合跟踪", included: false },
      { text: "高级图表", included: false },
      { text: "API 访问", included: false },
      { text: "VIP 社群", included: false },
    ] as Feature[],
    cta: "免费开始",
    popular: false,
    color: "blue",
  },
  {
    name: "Pro",
    description: "专业投资者首选，AI 驱动的交易工具",
    price: { monthly: 39, yearly: 390 },
    currency: "USD",
    trialDays: 7,
    features: [
      { text: "无限价格提醒", included: true },
      { text: "无限收藏", included: true },
      { text: "AI 买卖信号", included: true, icon: Zap },
      { text: "潜力币推荐", included: true, icon: TrendingUp },
      { text: "投资组合跟踪", included: true },
      { text: "高级图表和技术指标", included: true },
      { text: "1 年历史数据", included: true },
      { text: "每月 10 条短信通知", included: true },
      { text: "API 访问", included: false },
      { text: "VIP 社群", included: false },
    ] as Feature[],
    cta: "开始 7 天免费试用",
    popular: true,
    color: "green",
    savings: "省 2 个月（年付）",
  },
  {
    name: "Elite",
    description: "顶级交易员工具，全方位优势",
    price: { monthly: 99, yearly: 990 },
    currency: "USD",
    trialDays: 7,
    features: [
      { text: "所有 Pro 功能", included: true },
      { text: "API 访问 (1000 次/分钟)", included: true, icon: Zap },
      { text: "VIP Telegram 社群", included: true, icon: Star },
      { text: "专属客服支持", included: true },
      { text: "新功能优先体验", included: true },
      { text: "无限历史数据", included: true },
      { text: "无限短信通知", included: true },
      { text: "白标解决方案", included: true },
      { text: "机构级分析工具", included: true },
      { text: "定制开发支持", included: true },
    ] as Feature[],
    cta: "开始 7 天免费试用",
    popular: false,
    color: "purple",
    savings: "省 2 个月（年付）",
  },
];

// 加密货币支付选项
const cryptoPayments = [
  { symbol: "USDT", name: "Tether", network: "ERC20/TRC20" },
  { symbol: "USDC", name: "USD Coin", network: "ERC20" },
  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum", network: "Ethereum" },
  { symbol: "SOL", name: "Solana", network: "Solana" },
  { symbol: "BNB", name: "Binance Coin", network: "BSC" },
];

export default function PricingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showCryptoModal, setShowCryptoModal] = useState(false);

  const handleSubscribe = (planName: string) => {
    if (!user && !loading) {
      // 未登录，跳转到登录页
      router.push(`/auth?redirect=/pricing?plan=${planName}`);
      return;
    }
    
    setSelectedPlan(planName);
    setShowCryptoModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Start free, upgrade when you're ready. All plans include a 7-day free trial.
          </p>

          {/* 账单周期切换 */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${billingCycle === "monthly" ? "font-semibold" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="relative w-14 h-7 bg-muted rounded-full transition-colors"
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-background rounded-full shadow transition-transform ${
                  billingCycle === "yearly" ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-sm ${billingCycle === "yearly" ? "font-semibold" : "text-muted-foreground"}`}>
              Yearly <span className="text-green-600 text-xs ml-1">Save 2 months</span>
            </span>
          </div>
        </div>

        {/* 定价卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular ? "border-green-500 shadow-lg scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-green-600 hover:bg-green-600">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 pb-4">
                {/* 价格 */}
                <div className="text-center mb-6">
                  {plan.price.monthly === 0 ? (
                    <div className="text-5xl font-bold mb-2">Free</div>
                  ) : (
                    <>
                      <div className="text-5xl font-bold mb-2">
                        ${billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {billingCycle === "monthly" ? "/month" : "/year"}
                      </div>
                      {billingCycle === "yearly" && plan.savings && (
                        <div className="text-xs text-green-600 mt-1">{plan.savings}</div>
                      )}
                    </>
                  )}

                  {plan.trialDays > 0 && (
                    <div className="text-xs text-muted-foreground mt-2">
                      {plan.trialDays}-day free trial
                    </div>
                  )}
                </div>

                {/* 功能列表 */}
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <ZapOff className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? "text-foreground" : "text-muted-foreground line-through"
                        }`}
                      >
                        {feature.text}
                      </span>
                      {feature.icon && (
                        <feature.icon className="h-4 w-4 text-green-600 ml-auto" />
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.name)}
                  disabled={plan.price.monthly === 0}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* 加密货币支付说明 */}
        <div className="max-w-4xl mx-auto mt-16 p-6 bg-muted rounded-lg">
          <h3 className="text-xl font-bold mb-4 text-center">💰 加密货币支付享 9 折优惠</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {cryptoPayments.map((crypto) => (
              <div key={crypto.symbol} className="text-center">
                <div className="font-semibold">{crypto.symbol}</div>
                <div className="text-xs text-muted-foreground">{crypto.name}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            使用加密货币支付可享受 9 折优惠，年付 + 加密货币支付=8 折！
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <FAQItem
              question="我可以随时取消订阅吗？"
              answer="是的，你可以随时取消订阅。取消后，你的订阅将在当前周期结束时失效，但不会收取额外费用。"
            />
            <FAQItem
              question="免费试用需要信用卡吗？"
              answer="不需要！我们提供 7 天免费试用，无需信用卡。试用结束后再决定是否付费。"
            />
            <FAQItem
              question="支持哪些加密货币支付？"
              answer="我们支持 USDT、USDC、BTC、ETH、SOL、BNB 等多种加密货币支付，使用加密货币支付还可享受 9 折优惠！"
            />
            <FAQItem
              question="如果我对服务不满意怎么办？"
              answer="我们提供 30 天无理由退款保证。如果你在前 30 天内不满意，可以随时申请全额退款。"
            />
            <FAQItem
              question="企业客户有优惠吗？"
              answer="是的，我们为企业客户提供定制方案和批量折扣。请联系 support@cryptoniche.com 获取企业报价。"
            />
          </div>
        </div>
      </div>

      {/* 加密货币支付 Modal */}
      {showCryptoModal && selectedPlan && (
        <CryptoPaymentModal
          planName={selectedPlan}
          billingCycle={billingCycle}
          onClose={() => setShowCryptoModal(false)}
        />
      )}
    </div>
  );
}

// FAQ 组件
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg">
      <button
        className="w-full px-6 py-4 text-left font-semibold flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        {question}
        <span className="text-2xl">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-muted-foreground">{answer}</div>
      )}
    </div>
  );
}

// 加密货币支付 Modal 组件
function CryptoPaymentModal({
  planName,
  billingCycle,
  onClose,
}: {
  planName: string;
  billingCycle: "monthly" | "yearly";
  onClose: () => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "crypto">("stripe");
  const [selectedCrypto, setSelectedCrypto] = useState("USDT");

  const plans: Record<string, { monthly: number; yearly: number }> = {
    Pro: { monthly: 39, yearly: 390 },
    Elite: { monthly: 99, yearly: 990 },
  };

  const basePrice = billingCycle === "monthly" ? plans[planName].monthly : plans[planName].yearly;
  const cryptoPrice = basePrice * 0.9; // 9 折

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>选择支付方式</CardTitle>
          <CardDescription>
            {planName} {billingCycle === "monthly" ? "月度" : "年度"}计划
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 支付方式选择 */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={paymentMethod === "stripe" ? "default" : "outline"}
              onClick={() => setPaymentMethod("stripe")}
              className="w-full"
            >
              💳 信用卡 (Stripe)
            </Button>
            <Button
              variant={paymentMethod === "crypto" ? "default" : "outline"}
              onClick={() => setPaymentMethod("crypto")}
              className="w-full"
            >
              🪙 加密货币
            </Button>
          </div>

          {/* 价格显示 */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span>原价</span>
              <span className="font-semibold">${basePrice}</span>
            </div>
            {paymentMethod === "crypto" && (
              <div className="flex justify-between items-center mb-2 text-green-600">
                <span>加密货币折扣 (10%)</span>
                <span>-${(basePrice * 0.1).toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2 flex justify-between items-center">
              <span className="font-bold">总计</span>
              <span className="font-bold text-xl">
                ${paymentMethod === "crypto" ? cryptoPrice.toFixed(2) : basePrice}
              </span>
            </div>
          </div>

          {/* 加密货币选择 */}
          {paymentMethod === "crypto" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">选择加密货币</label>
              <select
                value={selectedCrypto}
                onChange={(e) => setSelectedCrypto(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="USDT">USDT (Tether)</option>
                <option value="USDC">USDC (USD Coin)</option>
                <option value="BTC">BTC (Bitcoin)</option>
                <option value="ETH">ETH (Ethereum)</option>
                <option value="SOL">SOL (Solana)</option>
                <option value="BNB">BNB (Binance Coin)</option>
              </select>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Button className="flex-1">继续支付</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
