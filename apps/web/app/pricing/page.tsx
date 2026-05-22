import Link from "next/link";
import { CheckCircle, X } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pricing" };

const PLANS = [
  {
    name: "FREE",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started and personal projects.",
    borderClass: "border-lime-900/30",
    buttonClass: "border border-lime-900/40 bg-transparent text-blue-300 hover:bg-lime-900/20 font-mono tracking-widest",
    buttonText: "GET STARTED FREE",
    href: "/auth/register",
    popular: false,
    tag: "TIER-01",
    tagColor: "text-blue-400 border-blue-900/40",
    features: [
      { text: "3 active forms", included: true },
      { text: "100 responses/month", included: true },
      { text: "All field types", included: true },
      { text: "6 themes", included: true },
      { text: "Public & unlisted links", included: true },
      { text: "Basic analytics", included: true },
      { text: "CSV export", included: false },
      { text: "Custom domain", included: false },
      { text: "Email notifications", included: false },
      { text: "API access", included: false },
    ],
  },
  {
    name: "PRO",
    price: "$12",
    period: "per month",
    description: "For creators and teams who need more power.",
    borderClass: "border-lime-500",
    buttonClass: "bg-lime-600 text-white hover:bg-lime-700 font-mono tracking-widest font-black",
    buttonText: "START FREE TRIAL",
    href: "/auth/register",
    popular: true,
    tag: "TIER-02",
    tagColor: "text-lime-400 border-lime-700/40",
    features: [
      { text: "Unlimited active forms", included: true },
      { text: "10,000 responses/month", included: true },
      { text: "All field types", included: true },
      { text: "All 12 themes", included: true },
      { text: "Public & unlisted links", included: true },
      { text: "Advanced analytics", included: true },
      { text: "CSV export", included: true },
      { text: "Custom domain", included: false },
      { text: "Email notifications", included: true },
      { text: "Full API access", included: true },
    ],
  },
  {
    name: "ENTERPRISE",
    price: "$49",
    period: "per month",
    description: "For large teams with advanced needs.",
    borderClass: "border-lime-900/30",
    buttonClass: "border border-lime-900/40 bg-transparent text-blue-300 hover:bg-lime-900/20 font-mono tracking-widest",
    buttonText: "CONTACT SALES",
    href: "mailto:hello@chaiforms.dev",
    popular: false,
    tag: "TIER-03",
    tagColor: "text-green-400 border-green-900/40",
    features: [
      { text: "Unlimited active forms", included: true },
      { text: "Unlimited responses", included: true },
      { text: "All field types", included: true },
      { text: "All 12 themes + custom", included: true },
      { text: "Public & unlisted links", included: true },
      { text: "Advanced analytics + charts", included: true },
      { text: "CSV export", included: true },
      { text: "Custom domain", included: true },
      { text: "Email notifications", included: true },
      { text: "Full API access + webhooks", included: true },
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] font-mono" style={{
      backgroundImage: "linear-gradient(rgba(101,163,13,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(101,163,13,0.03) 1px, transparent 1px)",
      backgroundSize: "40px 40px"
    }}>
      {/* Nav */}
      <nav className="border-b border-lime-900/20 bg-[#080d14] px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-mono font-bold">
            <span className="h-8 w-8 border border-lime-600 flex items-center justify-center text-lime-500 font-black text-sm">D</span>
            <span className="text-white tracking-widest text-sm">CHAIFORMS</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-xs font-black text-blue-300 hover:text-white tracking-widest uppercase transition-colors">SIGN IN</Link>
            <Link href="/auth/register" className="border border-lime-600 bg-lime-600 px-4 py-2 text-xs font-black text-white hover:bg-lime-700 tracking-widest uppercase transition-colors">GET STARTED</Link>
          </div>
        </div>
      </nav>

      <div className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block text-xs text-lime-400 font-mono mb-4 border border-lime-900/40 px-3 py-1 bg-lime-900/10 tracking-widest">
              ● PRICING MATRIX — LABORATORY EDITION
            </div>
            <h1 className="text-5xl font-black text-white mb-4 tracking-wider uppercase">SELECT YOUR TIER</h1>
            <p className="text-lg text-blue-300 max-w-2xl mx-auto font-mono">
              START FREE. UPGRADE WHEN YOU NEED MORE.<br />NO HIDDEN FEES. NO SURPRISES.
            </p>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`border ${plan.borderClass} bg-[#0f1520] p-8 relative ${plan.popular ? "shadow-lg shadow-lime-900/20" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 border border-lime-600 bg-lime-600 px-4 py-1.5 text-xs font-black text-white tracking-widest">
                    ⚡ RECOMMENDED
                  </div>
                )}
                <div className="mb-6">
                  <div className={`inline-block text-xs font-black border px-2 py-0.5 mb-3 tracking-widest ${plan.tagColor}`}>{plan.tag}</div>
                  <h3 className="text-lg font-black text-white mb-1 tracking-widest uppercase">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-blue-400/50 text-xs font-mono">/{plan.period}</span>
                  </div>
                  <p className="text-blue-400 text-xs mt-2 font-mono">{plan.description}</p>
                </div>

                <Link
                  href={plan.href}
                  className={`block w-full py-3 text-center text-xs transition-all mb-8 uppercase ${plan.buttonClass}`}
                >
                  {plan.buttonText}
                </Link>

                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature.text} className="flex items-center gap-3">
                      {feature.included ? (
                        <CheckCircle className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-lime-400/60 flex-shrink-0" />
                      )}
                      <span className={`text-xs font-mono ${feature.included ? "text-blue-200" : "text-blue-400/70"}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-24 max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-black text-blue-400 border border-blue-900/40 px-3 py-1 tracking-widest">// FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <div className="space-y-0">
              {[
                { q: "IS THERE A FREE PLAN?", a: "Yes! ChaiForms is free to start with 3 active forms and 100 responses per month. No credit card required." },
                { q: "CAN I UPGRADE OR DOWNGRADE ANYTIME?", a: "Absolutely. You can change your plan at any time. Upgrades are prorated, downgrades take effect at the next billing cycle." },
                { q: "DO RESPONDENTS NEED AN ACCOUNT?", a: "No! Respondents can submit forms without creating an account. Only form creators need to register." },
                { q: "IS THERE AN API?", a: "Yes! ChaiForms has a full REST API (via tRPC-to-OpenAPI) with Scalar documentation. Available on Pro and Enterprise plans." },
              ].map((item) => (
                <div key={item.q} className="border-b border-lime-900/20 py-6">
                  <h3 className="font-black text-white mb-2 tracking-wider text-sm">{item.q}</h3>
                  <p className="text-blue-400 text-xs font-mono leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
