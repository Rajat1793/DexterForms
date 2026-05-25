"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "~/providers/auth";
import { FileText, Zap, BarChart2, Globe, Shield, Atom } from "lucide-react";

const PANEL_COLORS = [
  "bg-[#cc0000]", "bg-[#1565c0]", "bg-[#ffd700]",
  "bg-[#00a86b]", "bg-[#ff69b4]", "bg-[#7b1fa2]",
];

const LAB_EXPERIMENTS = [
  { id: "EXP-001", icon: FileText, title: "12+ Field Types",
    desc: "Short text, long text, email, number, rating, select, checkbox, date, dropdown, URL, phone. All the good stuff!", status: "STABLE" },
  { id: "EXP-002", icon: Zap, title: "Real-Time Responses",
    desc: "Responses captured instantly! No login required for respondents. Unlimited throughput. BOOM!", status: "ACTIVE" },
  { id: "EXP-003", icon: BarChart2, title: "Analytics Graphs",
    desc: "Field-level charts, daily trends, answer rates. Live data updates as experiments run!", status: "RUNNING" },
  { id: "EXP-004", icon: Globe, title: "Public & Unlisted",
    desc: "Share publicly or via secret link. Zero friction. Works without any authentication!", status: "ONLINE" },
  { id: "EXP-005", icon: Shield, title: "Anti-Spam Shield",
    desc: "Rate limiting, response caps, form expiry. Only clean data in the lab database. POW!", status: "ARMED" },
  { id: "EXP-006", icon: Atom, title: "Type-Safe API",
    desc: "100% type-safe with tRPC + Zod. Full OpenAPI docs at /docs. Build on top of it!", status: "NOMINAL" },
];

const DEMO_SPECIMENS = [
  { slug: "stranger-things-fan-survey", title: "Stranger Things Fan Survey",
    desc: "6-field study on Hawkins residents and their Upside Down preferences.",
    fields: 6, responses: 5, emoji: "👾", color: "bg-[#cc0000]" },
  { slug: "anime-character-survey", title: "Anime Character Alignment",
    desc: "8-field personality test: are you Team Naruto or Team Sasuke?",
    fields: 8, responses: 6, emoji: "⚡", color: "bg-[#1565c0]" },
  { slug: "startup-pitch-validator", title: "Startup Pitch Validator",
    desc: "10-field startup idea viability scorer. Is your idea over 9000?",
    fields: 10, responses: 7, emoji: "🚀", color: "bg-[#00a86b]" },
];

export default function LandingPage() {
  const { user } = useAuth();
  type DecorImg = { src: string; top: number; side: "left" | "right"; offset: number; rotate: number; size: number; tapeAngle: number; tapeWidth: number };
  const [decorImgs, setDecorImgs] = useState<DecorImg[] | null>(null);

  useEffect(() => {
    const rnd = (min: number, max: number) => min + Math.random() * (max - min);
    fetch("/api/mascots")
      .then(r => r.json())
      .then(({ images }: { images: string[] }) => {
        const shuffled = [...images].sort(() => Math.random() - 0.5);
        const pool = shuffled.slice(0, 10);
        const count = pool.length;
        if (count === 0) return;
        const topStep = 88 / count;
        setDecorImgs(
          Array.from({ length: count }, (_, i) => {
            return {
              src: pool[i]!,
              top: rnd(i * topStep + 2, i * topStep + topStep - 2),
              side: i % 2 === 0 ? "right" : "left",
              offset: rnd(0, 2),
              rotate: rnd(-12, 12),
              size: Math.round(rnd(130, 180)),
              tapeAngle: +rnd(-5, 5).toFixed(1),
              tapeWidth: Math.round(rnd(45, 68)),
            };
          })
        );
      });
  }, []);

  return (
    <div className="relative min-h-screen bg-[#fffde7] overflow-x-hidden">
      {/* FLOATING MASCOTS — sticker-taped to the page */}
      {decorImgs?.map((img, i) => (
        <div key={i} className="pointer-events-none select-none absolute z-20"
          style={{ top:`${img.top}%`, [img.side]:`${img.offset}%`, transform:`rotate(${img.rotate}deg)` }}>
          {/* Sticker card — static, no animation */}
          <div className="sticker-card">
            <Image src={img.src} alt="" width={Math.round(img.size)} height={Math.round(img.size)} style={{ height: "auto", display: "block" }} className="object-contain" />
          </div>
          {/* Tape strip anchored across the top, overlapping the sticker edge */}
          <div className="sticker-tape" style={{
            width: `${img.tapeWidth}%`,
            top: "-10px",
            left: "50%",
            transform: `translateX(-50%) rotate(${img.tapeAngle}deg)`,
          }} />
        </div>
      ))}

      <div className="checker-strip" />

      {/* NAV */}
      <nav className="bg-white sticky top-0 z-50" style={{ borderBottom:"4px solid #000", boxShadow:"0 4px 0 #000" }}>
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-3">
          <Link href="/"><Image src="/dexterlogo.png" alt="ChaiForms" height={40} width={160} style={{ height: "auto" }} className="object-contain" priority /></Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/pricing" className="font-bold text-[#1a1a1a] hover:text-[#cc0000] uppercase text-sm tracking-wide">Pricing</Link>
            <Link href="http://localhost:8000/docs" target="_blank" className="font-bold text-[#1a1a1a] hover:text-[#cc0000] uppercase text-sm tracking-wide">API Docs</Link>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard" className="cartoon-btn bg-[#cc0000] text-white font-bangers text-lg px-5 py-2 tracking-wider">ENTER LAB →</Link>
            ) : (
              <>
                <Link href="/auth/login" className="font-bold text-[#1a1a1a] hover:text-[#cc0000] uppercase text-sm tracking-wide">Login</Link>
                <Link href="/auth/register" className="cartoon-btn bg-[#cc0000] text-white font-bangers text-xl px-5 py-2 tracking-wider">START FREE!</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden py-20 px-6 bg-polka-yellow">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="burst-badge text-[#1a1a1a] px-4 py-1 text-base mb-6 inline-block">
            🧪 CLASSIFIED TOP SECRET EXPERIMENT!
          </div>
          <h1 className="font-bangers text-stroke-black-lg text-[#cc0000] tracking-wide leading-none mb-4"
            style={{ fontSize:"clamp(4rem,14vw,9rem)" }}>
            DEXTER&apos;S<br />FORMS LAB!
          </h1>
          <p className="text-xl font-bold text-[#1a1a1a] mb-8 max-w-2xl mx-auto leading-relaxed">
            Build epic forms. Collect data like a <em>genius scientist</em>.<br />
            <span className="text-[#cc0000]">No PhD required.</span> 🔬
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            <Link href={user ? "/dashboard" : "/auth/register"} className="cartoon-btn bg-[#cc0000] text-white font-bangers text-2xl px-8 py-3 tracking-wider">
              🧪 START EXPERIMENTING!
            </Link>
            <Link href="#demo" className="cartoon-btn bg-[#1565c0] text-white font-bangers text-2xl px-8 py-3 tracking-wider">
              🔭 VIEW DEMO FORMS
            </Link>
          </div>
        </div>
      </section>

      <div className="checker-strip" />

      {/* STATS BAR */}
      <div className="bg-[#1565c0] py-6 px-6" style={{ borderBottom:"4px solid #000" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
          {[{ num:"12+", label:"FIELD TYPES" },{ num:"100%", label:"FREE TO START" },{ num:"∞", label:"EXPERIMENTS" }].map((s) => (
            <div key={s.label}>
              <div className="font-bangers text-stroke-black text-[#ffd700] leading-none" style={{ fontSize:"clamp(2rem,7vw,4rem)" }}>{s.num}</div>
              <div className="text-white font-bold text-xs tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="bg-white py-20 px-6" style={{ borderBottom:"4px solid #000" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="burst-badge text-[#1a1a1a] px-4 py-1 text-base mb-4 inline-block" style={{ transform:"rotate(-1deg)" }}>💡 WHAT&apos;S IN THE LAB?</div>
            <h2 className="font-bangers text-stroke-black text-[#1a1a1a] tracking-wide" style={{ fontSize:"clamp(2.5rem,7vw,5rem)" }}>SUPER POWERS INCLUDED!</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LAB_EXPERIMENTS.map((exp, i) => {
              const Icon = exp.icon;
              return (
                <div key={exp.id} className="cartoon-card p-6 bg-white" style={{ transform:`rotate(${i%2===0?"-0.5":"0.5"}deg)` }}>
                  <div className={`h-2 -mx-6 -mt-6 mb-5 ${PANEL_COLORS[i]}`} />
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-xs text-[#888] tracking-widest">{exp.id}</span>
                    <span className="bg-[#ffd700] text-[#1a1a1a] font-bangers text-xs px-2 py-0.5 tracking-wider" style={{ border:"2px solid #000", boxShadow:"2px 2px 0 #000" }}>{exp.status}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-5 w-5 text-[#cc0000]" />
                    <h3 className="font-bangers text-xl text-[#1a1a1a] tracking-wide">{exp.title}</h3>
                  </div>
                  <p className="text-[#555] text-sm leading-relaxed">{exp.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DEMO FORMS */}
      <section id="demo" className="bg-polka-blue py-20 px-6" style={{ borderBottom:"4px solid #000" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="burst-badge text-[#1a1a1a] px-4 py-1 text-base mb-4 inline-block" style={{ transform:"rotate(1deg)" }}>🔭 LIVE SPECIMENS</div>
            <h2 className="font-bangers text-stroke-black text-[#1565c0] tracking-wide" style={{ fontSize:"clamp(2.5rem,7vw,5rem)" }}>TRY THESE EXPERIMENTS!</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEMO_SPECIMENS.map((s) => (
              <a key={s.slug} href={`/f/${s.slug}`} target="_blank" rel="noopener noreferrer" className="cartoon-card bg-white block group hover:-translate-y-1 transition-transform">
                <div className={`${s.color} p-4 flex items-center gap-3`} style={{ borderBottom:"3px solid #000" }}>
                  <span className="text-3xl">{s.emoji}</span>
                  <h3 className="font-bangers text-lg text-white tracking-wide leading-snug">{s.title}</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm text-[#555] leading-relaxed mb-4">{s.desc}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-xs font-bold text-[#888]">
                      <span>📝 {s.fields} fields</span>
                      <span>👥 {s.responses} responses</span>
                    </div>
                    <span className="font-bangers text-sm text-[#cc0000] tracking-wide group-hover:underline">TRY IT →</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
          <div className="mt-10 cartoon-card bg-[#fff9c4] p-5 text-center max-w-2xl mx-auto">
            <p className="font-bangers text-xl text-[#cc0000] tracking-wide">🎀 DEE DEE ALERT: &quot;Ooooooh, what does THIS button do?!&quot;</p>
            <p className="text-sm text-[#555] mt-1">Rate limiter: 30 submissions/hr per IP. Safe from the pink menace.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-20 px-6" style={{ borderBottom:"4px solid #000" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="burst-badge text-[#1a1a1a] px-4 py-1 text-base mb-4 inline-block" style={{ transform:"rotate(-1deg)" }}>📋 LABORATORY PROCEDURE</div>
            <h2 className="font-bangers text-stroke-black text-[#1a1a1a] tracking-wide" style={{ fontSize:"clamp(2.5rem,7vw,5rem)" }}>3 EASY STEPS!</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step:"1", emoji:"🏗️", title:"CREATE", color:"bg-[#cc0000]", desc:"Sign up free. Build a form with drag-and-drop. Add fields, set validations, pick a theme." },
              { step:"2", emoji:"🚀", title:"PUBLISH", color:"bg-[#1565c0]", desc:"Publish and share your form link. Public or unlisted. No login needed for respondents!" },
              { step:"3", emoji:"📊", title:"ANALYSE", color:"bg-[#00a86b]", desc:"View responses in real-time. Charts, trends, CSV export. All in your dashboard!" },
            ].map((step) => (
              <div key={step.step} className="cartoon-card bg-white overflow-hidden">
                <div className={`${step.color} px-5 py-3 flex items-center gap-3`} style={{ borderBottom:"3px solid #000" }}>
                  <span className="font-bangers text-4xl text-white text-stroke-black">{step.step}</span>
                  <span className="text-2xl">{step.emoji}</span>
                  <h3 className="font-bangers text-2xl text-white tracking-wide">{step.title}</h3>
                </div>
                <div className="p-5"><p className="text-sm text-[#555] leading-relaxed">{step.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#cc0000] py-20 px-6 text-center" style={{ borderBottom:"4px solid #000" }}>
        <div className="max-w-2xl mx-auto">
          <div className="font-bangers text-[#ffd700] tracking-widest text-base mb-4 animate-pulse" style={{ WebkitTextStroke:"1px #000" }}>
            ⚠ WARNING: HIGHLY ADDICTIVE — DEE DEE NOT INCLUDED
          </div>
          <h2 className="font-bangers text-white tracking-wide mb-6" style={{ fontSize:"clamp(2.5rem,8vw,5rem)", WebkitTextStroke:"3px #000" }}>
            READY, SCIENTIST?
          </h2>
          <p className="text-white font-bold mb-8 text-lg opacity-90">Your first experiment is free. No credit card. No excuses.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href={user ? "/dashboard" : "/auth/register"} className="cartoon-btn bg-[#ffd700] text-[#1a1a1a] font-bangers text-2xl px-8 py-3 tracking-wider">
              🧪 ENTER THE LAB!
            </Link>
            {!user && (
              <Link href="/auth/login" className="cartoon-btn bg-white text-[#cc0000] font-bangers text-2xl px-8 py-3 tracking-wider">
                ALREADY A SCIENTIST?
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1a1a1a] px-6 py-10">
        <div className="checker-strip -mt-10 mb-10" />
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <Image src="/dexterlogo.png" alt="ChaiForms" height={32} width={120} style={{ height: "auto" }} className="object-contain opacity-80" />
            <p className="text-[#888] text-xs mt-1">&quot;OMELETTE DU FROMAGE&quot; — Dexter, S1E17</p>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#888]">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="http://localhost:8000/docs" target="_blank" className="hover:text-white transition-colors">API Docs</Link>
            <Link href="/auth/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/auth/register" className="hover:text-white transition-colors">Register</Link>
          </div>
          <p className="text-[#555] text-xs">Built with tRPC · Drizzle · Next.js · Zod</p>
        </div>
      </footer>
    </div>
  );
}
