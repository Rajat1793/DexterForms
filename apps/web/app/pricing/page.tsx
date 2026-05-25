"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle, X, BadgeCheck, Loader2 } from "lucide-react";
import { useAuth } from "~/providers/auth";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";

const PLANS = [
  {
    name: "FREE", price: "$0", period: "forever", rotate: "-1deg",
    description: "Perfect for getting started and personal projects.",
    color: "bg-[#1565c0]", textColor: "text-[#1565c0]",
    buttonClass: "cartoon-btn bg-[#1565c0] text-white font-bangers text-xl px-6 py-3 tracking-wider w-full",
    buttonText: "GET STARTED FREE", href: "/auth/register", popular: false,
    tag: "TIER-01", tagColor: "bg-[#e3f2fd] text-[#1565c0]",
    features: [
      { text: "3 active forms", ok: true },
      { text: "100 responses/month", ok: true },
      { text: "All field types", ok: true },
      { text: "1 theme (Dexter)", ok: true },
      { text: "Public & unlisted links", ok: true },
      { text: "Basic analytics", ok: true },
      { text: "CSV export", ok: false },
      { text: "Email notifications", ok: false },
      { text: "API access", ok: false },
    ],
  },
  {
    name: "PRO", price: "$12", period: "per month", rotate: "0.5deg",
    description: "For creators and teams who need more power.",
    color: "bg-[#cc0000]", textColor: "text-[#cc0000]",
    buttonClass: "cartoon-btn bg-[#cc0000] text-white font-bangers text-xl px-6 py-3 tracking-wider w-full",
    buttonText: "START FREE TRIAL", href: "/auth/register", popular: true,
    tag: "RECOMMENDED ⚡", tagColor: "bg-[#fff0f0] text-[#cc0000]",
    features: [
      { text: "Unlimited active forms", ok: true },
      { text: "10,000 responses/month", ok: true },
      { text: "All field types", ok: true },
      { text: "Dexter theme", ok: true },
      { text: "Public & unlisted links", ok: true },
      { text: "Advanced analytics", ok: true },
      { text: "CSV export", ok: true },
      { text: "Email notifications", ok: true },
      { text: "Full API access", ok: true },
    ],
  },
  {
    name: "ENTERPRISE", price: "$49", period: "per month", rotate: "1deg",
    description: "For large teams with advanced needs.",
    color: "bg-[#00a86b]", textColor: "text-[#00a86b]",
    buttonClass: "cartoon-btn bg-[#00a86b] text-white font-bangers text-xl px-6 py-3 tracking-wider w-full",
    buttonText: "CONTACT SALES", href: "mailto:hello@chaiforms.dev", popular: false,
    tag: "TIER-03", tagColor: "bg-[#e8f5e9] text-[#00a86b]",
    features: [
      { text: "Unlimited everything", ok: true },
      { text: "Unlimited responses", ok: true },
      { text: "All field types", ok: true },
      { text: "Custom themes", ok: true },
      { text: "Public & unlisted links", ok: true },
      { text: "Advanced analytics + charts", ok: true },
      { text: "CSV export", ok: true },
      { text: "Custom domain", ok: true },
      { text: "Email notifications + webhooks", ok: true },
    ],
  },
];

export default function PricingPage() {
  const { user, updateUser } = useAuth();
  const currentPlan = user?.plan ?? null;

  const updatePlanMutation = trpc.auth.updatePlan.useMutation({
    onSuccess: (data) => {
      updateUser({ plan: data.plan });
      toast.success(`Plan updated to ${data.plan}! 🧪`);
    },
    onError: (err) => toast.error(err.message),
  });

  function handlePlanClick(planName: string) {
    if (!user) return;
    if (planName === currentPlan) return;
    if (planName === "ENTERPRISE") {
      window.location.href = "mailto:hello@chaiforms.dev";
      return;
    }
    updatePlanMutation.mutate({ plan: planName as "FREE" | "PRO" | "ENTERPRISE" });
  }

  return (
    <div className="min-h-screen bg-[#fffde7]">
      <div className="checker-strip" />

      {/* NAV */}
      <nav className="bg-white sticky top-0 z-50" style={{ borderBottom:"4px solid #000", boxShadow:"0 4px 0 #000" }}>
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-3">
          <Link href="/">
            <Image src="/dexterlogo.png" alt="ChaiForms" height={40} width={160} style={{ height:"auto" }} className="object-contain" priority />
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm font-bold text-[#555] hidden md:inline">
                  Hi, {user.fullName.split(" ")[0]}! 👋
                </span>
                <Link href="/dashboard" className="cartoon-btn bg-[#cc0000] text-white font-bangers text-xl px-5 py-2 tracking-wider">
                  ENTER LAB →
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="font-bold text-[#1a1a1a] hover:text-[#cc0000] uppercase text-sm tracking-wide">Sign In</Link>
                <Link href="/auth/register" className="cartoon-btn bg-[#cc0000] text-white font-bangers text-xl px-5 py-2 tracking-wider">GET STARTED</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <div className="bg-polka-yellow py-16 px-6 text-center" style={{ borderBottom:"4px solid #000" }}>
        <div className="burst-badge text-[#1a1a1a] px-4 py-1 text-base mb-4 inline-block">💰 PRICING MATRIX — LAB EDITION</div>
        <h1 className="font-bangers text-stroke-black-lg text-[#1565c0] tracking-wide" style={{ fontSize:"clamp(3rem,10vw,7rem)" }}>
          PICK YOUR PLAN!
        </h1>
        <p className="font-bold text-[#1a1a1a] mt-2 text-lg max-w-xl mx-auto">
          Start free. Upgrade when you need more.<br />No hidden fees. No surprises. No Dee Dee.
        </p>
      </div>

      <div className="checker-strip" />

      {/* PLANS */}
      <div className="bg-white py-20 px-6" style={{ borderBottom:"4px solid #000" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {PLANS.map((plan) => {
            const isCurrent = plan.name === currentPlan;
            const isPending = updatePlanMutation.isPending && updatePlanMutation.variables?.plan === plan.name;
            const buttonLabel = isCurrent
              ? "✓ CURRENT PLAN"
              : isPending
              ? "UPDATING..."
              : plan.buttonText;
            const buttonClass = isCurrent
              ? `cartoon-btn bg-[#00a86b] text-white font-bangers text-xl px-6 py-3 tracking-wider w-full opacity-90 cursor-default`
              : plan.buttonClass;

            return (
            <div key={plan.name} className={`cartoon-card bg-white relative ${isCurrent ? "ring-4 ring-[#00a86b]" : ""}`}
              style={{ transform:`rotate(${plan.rotate})`, boxShadow: isCurrent ? "6px 6px 0 #00a86b" : undefined }}>
              {isCurrent && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap"
                  style={{ background:"#00a86b", border:"3px solid #000", boxShadow:"3px 3px 0 #000",
                    padding:"4px 14px", fontFamily:"var(--font-bangers)", letterSpacing:"0.08em",
                    color:"#fff", fontSize:"14px", transform:"rotate(-2deg) translateX(-50%)" }}>
                  <BadgeCheck className="inline h-4 w-4 mr-1 mb-0.5" />YOUR CURRENT PLAN
                </div>
              )}
              {!isCurrent && plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 burst-badge text-[#cc0000] px-4 py-1 text-sm whitespace-nowrap" style={{ transform:"rotate(-2deg) translateX(-50%)" }}>
                  ⚡ MOST POPULAR!
                </div>
              )}

              {/* Color header strip */}
              <div className={`${plan.color} px-6 py-4`} style={{ borderBottom:"3px solid #000" }}>
                <span className={`inline-block ${plan.tagColor} font-bangers text-sm px-2 py-0.5 mb-2 tracking-wider`}
                  style={{ border:"2px solid #000", boxShadow:"2px 2px 0 #000" }}>
                  {plan.tag}
                </span>
                <h3 className="font-bangers text-3xl text-white tracking-widest">{plan.name}</h3>
              </div>

              <div className="p-6">
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`font-bangers text-5xl ${plan.textColor}`}>{plan.price}</span>
                  <span className="text-[#888] text-sm font-bold">/{plan.period}</span>
                </div>
                <p className="text-sm text-[#555] mb-6">{plan.description}</p>

                {user ? (
                  <button
                    onClick={() => handlePlanClick(plan.name)}
                    disabled={isCurrent || updatePlanMutation.isPending}
                    className={buttonClass}
                  >
                    {isPending ? <Loader2 className="inline h-4 w-4 animate-spin mr-1" /> : null}
                    {buttonLabel}
                  </button>
                ) : (
                  <Link href={plan.name === "ENTERPRISE" ? "mailto:hello@chaiforms.dev" : plan.href} className={plan.buttonClass}>
                    {plan.buttonText}
                  </Link>
                )}

                <div className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <div key={f.text} className="flex items-center gap-2.5">
                      {f.ok
                        ? <CheckCircle className="h-4 w-4 text-[#00a86b] shrink-0" />
                        : <X className="h-4 w-4 text-[#ccc] shrink-0" />}
                      <span className={`text-sm font-bold ${f.ok ? "text-[#1a1a1a]" : "text-[#bbb]"}`}>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* FAQ strip */}
      <div className="bg-[#1565c0] py-12 px-6 text-center" style={{ borderBottom:"4px solid #000" }}>
        <h2 className="font-bangers text-4xl text-white tracking-wide mb-4" style={{ WebkitTextStroke:"2px #000" }}>
          ALL PLANS INCLUDE:
        </h2>
        <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
          {["tRPC Type-Safe API", "Zod Validation", "Drizzle ORM", "Rate Limiting", "Scalar API Docs", "CSV Export", "Public Form Links", "Response Analytics"].map((item) => (
            <span key={item} className="bg-white font-bangers text-[#1565c0] text-base px-3 py-1 tracking-wider"
              style={{ border:"2px solid #000", boxShadow:"2px 2px 0 #000" }}>
              ✓ {item}
            </span>
          ))}
        </div>
      </div>

      <div className="checker-strip" />

      {/* Footer */}
      <footer className="bg-[#1a1a1a] py-6 px-6 text-center">
        <p className="text-[#888] text-xs">
          <Link href="/" className="hover:text-white transition-colors">← Back to Lab</Link>
          <span className="mx-3">·</span>
          Questions? hello@chaiforms.dev
        </p>
      </footer>
    </div>
  );
}
