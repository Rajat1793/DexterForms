"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "~/providers/auth";
import { ArrowRight, Beaker, FlaskConical, Microscope, Atom, Zap, BarChart2, Globe, Shield, FileText, ChevronRight } from "lucide-react";

const LAB_EXPERIMENTS = [
  {
    id: "EXP-001",
    icon: FileText,
    title: "Field Type Synthesizer",
    desc: "12+ field compounds: text, email, number, rating, select, checkbox, date, URL, phone. Each precisely engineered.",
    status: "STABLE",
    color: "text-blue-400",
    glow: "shadow-blue-500/20",
    border: "border-blue-500/40",
  },
  {
    id: "EXP-002",
    icon: Zap,
    title: "Instant Response Reactor",
    desc: "Responses captured in real-time. No login required for subjects. Unlimited throughput confirmed.",
    status: "ACTIVE",
    color: "text-green-400",
    glow: "shadow-green-500/20",
    border: "border-green-500/40",
  },
  {
    id: "EXP-003",
    icon: BarChart2,
    title: "Analytics Oscilloscope",
    desc: "Field-level distributions, daily trends, answer rates. Live charts update as data arrives.",
    status: "RUNNING",
    color: "text-yellow-400",
    glow: "shadow-yellow-500/20",
    border: "border-yellow-500/40",
  },
  {
    id: "EXP-004",
    icon: Globe,
    title: "Public Distribution Array",
    desc: "Share via public link or unlisted URL. Works without authentication. Zero friction for respondents.",
    status: "ONLINE",
    color: "text-cyan-400",
    glow: "shadow-cyan-500/20",
    border: "border-cyan-500/40",
  },
  {
    id: "EXP-005",
    icon: Shield,
    title: "Anti-Spam Forcefield",
    desc: "Rate limiting, max response caps, form expiry, and IP filtering. Only clean data enters the database.",
    status: "ARMED",
    color: "text-lime-400",
    glow: "shadow-lime-500/20",
    border: "border-lime-500/40",
  },
  {
    id: "EXP-006",
    icon: Atom,
    title: "tRPC Molecular API",
    desc: "100% type-safe API powered by tRPC + Zod. Full OpenAPI docs at /docs. Build anything on top.",
    status: "NOMINAL",
    color: "text-purple-400",
    glow: "shadow-purple-500/20",
    border: "border-purple-500/40",
  },
];



const DEMO_SPECIMENS = [
  {
    slug: "stranger-things-fan-survey",
    code: "SPEC-α",
    title: "Stranger Things Fan Survey",
    desc: "6-field behavioral study on Hawkins, Indiana inhabitants and their monster preferences.",
    fields: 6,
    responses: 5,
    badge: "DEXTER THEME",
    badgeColor: "bg-blue-600",
  },
  {
    slug: "anime-character-survey",
    code: "SPEC-β",
    title: "Anime Character Alignment",
    desc: "8-field personality analysis to determine your anime character archetype. Team Naruto or Sasuke?",
    fields: 8,
    responses: 6,
    badge: "SAKURA THEME",
    badgeColor: "bg-pink-600",
  },
  {
    slug: "startup-pitch-validator",
    code: "SPEC-γ",
    title: "Startup Pitch Validator",
    desc: "10-field evaluation matrix for startup idea viability scoring. Is your idea over 9000?",
    fields: 10,
    responses: 7,
    badge: "CYBERPUNK THEME",
    badgeColor: "bg-purple-600",
  },
];

export default function LandingPage() {
  const { user } = useAuth();

  type DecorImg = { src: string; top: number; side: "left" | "right"; offset: number; rotate: number; size: number };
  const [decorImgs, setDecorImgs] = useState<DecorImg[] | null>(null);

  useEffect(() => {
    const srcs = ["/dexter1.png", "/dexter2.png", "/dexter3.png", "/dexter4.png"];
    const shuffled = [...srcs].sort(() => Math.random() - 0.5);
    const rnd = (min: number, max: number) => min + Math.random() * (max - min);
    setDecorImgs([
      { src: shuffled[0], top: rnd(6, 16),  side: "right", offset: rnd(0, 3),  rotate: rnd(-8,  12),  size: rnd(260, 340) },
      { src: shuffled[1], top: rnd(30, 42), side: "left",  offset: rnd(0, 2),  rotate: rnd(-15, 10),  size: rnd(220, 290) },
      { src: shuffled[2], top: rnd(54, 65), side: "right", offset: rnd(1, 4),  rotate: rnd(-6,  14),  size: rnd(240, 310) },
      { src: shuffled[3], top: rnd(75, 86), side: "left",  offset: rnd(0, 3),  rotate: rnd(-12, 8),   size: rnd(230, 300) },
    ]);
  }, []);

  return (
    <div
      className="relative min-h-screen bg-[#0a0e1a] text-white font-mono"
      style={{
        backgroundImage: `
          linear-gradient(rgba(101,163,13,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(101,163,13,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    >
      {/* ── FLOATING DEXTER IMAGES ── */}
      {decorImgs?.map((img, i) => (
        <div
          key={i}
          className="pointer-events-none select-none absolute z-0"
          style={{
            top: `${img.top}%`,
            [img.side]: `${img.offset}%`,
            transform: `rotate(${img.rotate}deg)`,
            opacity: 0.65,
          }}
        >
          <Image
            src={img.src}
            alt=""
            width={Math.round(img.size)}
            height={Math.round(img.size)}
            className="object-contain drop-shadow-2xl"
          />
        </div>
      ))}
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-lime-900/40 bg-[#0a0e1a]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/">
            <Image src="/dexterlogo.png" alt="Dexter's Forms" height={38} width={150} className="object-contain" priority />
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs text-slate-400">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="http://localhost:8000/docs" target="_blank" className="hover:text-white transition-colors">API Docs</Link>

          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard" className="rounded border border-lime-600 bg-lime-600/10 px-4 py-2 text-xs font-bold text-lime-400 hover:bg-lime-600/20 transition-all">
                ENTER LAB →
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="text-xs text-slate-400 hover:text-white transition-colors">Login</Link>
                <Link href="/auth/register" className="rounded border border-lime-600 bg-lime-600 px-4 py-2 text-xs font-bold text-white hover:bg-lime-700 transition-all">
                  START EXPERIMENT
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-6 py-24 text-center">
        {/* Background glow orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-1/3 h-80 w-80 rounded-full bg-lime-600/8 blur-3xl" />
          <div className="absolute right-1/4 top-1/2 h-64 w-64 rounded-full bg-blue-600/8 blur-3xl" />
          <div className="absolute left-1/2 top-1/4 h-48 w-48 rounded-full bg-green-600/6 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl">
          {/* Lab badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-lime-700/50 bg-lime-900/20 px-4 py-1.5 text-xs text-lime-400">
            CLASSIFIED — DEXTER'S FORMS LABORATORY
          </div>

          <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight md:text-7xl">
            <span className="text-white">WHAT ARE YOU DOING</span>
            <br />
            <span className="text-lime-500">IN MY LABORATORY</span>
            <span className="text-white">?!</span>
          </h1>

          <p className="mx-auto mb-4 max-w-2xl text-base text-slate-400 leading-relaxed">
            A <span className="text-white font-bold">type-safe form builder</span> engineered in the deepest lab.
            Build experiments — collect responses — analyse data. All without leaving the compound.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              href={user ? "/dashboard" : "/auth/register"}
              className="group flex items-center gap-2 rounded-lg border-2 border-lime-600 bg-lime-600 px-8 py-4 text-sm font-black text-white hover:bg-lime-700 hover:border-lime-700 transition-all"
            >
              🧪 BEGIN EXPERIMENT
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/f/stranger-things-fan-survey"
              className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/50 px-8 py-4 text-sm font-bold text-slate-300 hover:text-white hover:border-slate-500 transition-all"
            >
              🔭 VIEW DEMO FORM
            </Link>
          </div>
        </div>
      </section>



      {/* ── EXPERIMENT LOG ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="mb-3 text-xs uppercase tracking-widest text-lime-500">EXPERIMENT LOG</div>
            <h2 className="text-3xl font-black text-white md:text-4xl">
              LABORATORY <span className="text-lime-500">CAPABILITIES</span>
            </h2>
            <p className="mt-3 text-sm text-slate-500">Each module precision-engineered to specification. All systems nominal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {LAB_EXPERIMENTS.map((exp) => {
              const Icon = exp.icon;
              return (
                <div
                  key={exp.id}
                  className={`rounded-xl border ${exp.border} bg-[#0f1320] p-6 hover:shadow-lg ${exp.glow} transition-all group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`h-10 w-10 rounded-lg border ${exp.border} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${exp.color}`} />
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${exp.border} ${exp.color}`}>
                      {exp.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-600 mb-1 uppercase tracking-widest">{exp.id}</div>
                  <h3 className={`font-bold text-sm mb-2 ${exp.color} group-hover:text-white transition-colors`}>{exp.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{exp.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SPECIMEN COLLECTION (Demo Forms) ── */}
      <section className="border-t border-lime-900/30 bg-[#080b14] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="mb-3 text-xs uppercase tracking-widest text-lime-500">SPECIMEN COLLECTION</div>
            <h2 className="text-3xl font-black text-white md:text-4xl">
              LIVE <span className="text-lime-500">EXPERIMENTS</span>
            </h2>
            <p className="mt-3 text-sm text-slate-500">Real forms running in production. Click to interact with the specimens.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DEMO_SPECIMENS.map((s) => (
              <a
                key={s.slug}
                href={`/f/${s.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl border border-slate-700/40 bg-[#0f1320] p-6 hover:border-lime-600/50 hover:shadow-lg hover:shadow-lime-900/20 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.code}</span>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded text-white ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                </div>
                <h3 className="font-bold text-white text-sm mb-2 group-hover:text-lime-400 transition-colors leading-snug">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">{s.desc}</p>
                <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                  <div className="flex gap-3 text-[10px] text-slate-500">
                    <span>{s.fields} fields</span>
                    <span>·</span>
                    <span>{s.responses} responses</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-lime-500 transition-colors" />
                </div>
              </a>
            ))}
          </div>

          {/* Dee Dee alert */}
          <div className="mt-10 rounded-xl border border-yellow-700/40 bg-yellow-900/10 p-5 text-center">
            <div className="text-yellow-400 text-sm font-bold mb-1">
              🎀 DEE DEE ALERT: "Ooooooh, what does THIS button do?!"
            </div>
            <div className="text-yellow-600 text-xs">
              Don't let Dee Dee near your forms. Our rate limiter handles up to 300 requests/15min per IP.
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <div className="mb-3 text-xs uppercase tracking-widest text-lime-500">LABORATORY PROCEDURE</div>
            <h2 className="text-3xl font-black text-white md:text-4xl">
              THE <span className="text-lime-500">PROTOCOL</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "INITIALISE", desc: "Register your lab credentials. Create a new form experiment. Add your field compounds." },
              { step: "02", title: "DEPLOY", desc: "Publish your experiment. Share the link. No login required for test subjects (respondents)." },
              { step: "03", title: "ANALYSE", desc: "View response analytics in the dashboard. Export CSV. Observe field-level distributions." },
            ].map((p) => (
              <div key={p.step} className="relative rounded-xl border border-slate-700/40 bg-[#0f1320] p-6">
                <div className="absolute -top-3 left-6 rounded border border-lime-700/60 bg-[#0a0e1a] px-2 py-0.5 text-[10px] font-black text-lime-500 uppercase">
                  STEP {p.step}
                </div>
                <h3 className="font-black text-lime-400 text-sm mb-2 mt-4 tracking-wide">{p.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-lime-900/30 bg-lime-950/15 px-6 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 text-4xl">🔴</div>
          <h2 className="mb-4 text-3xl font-black text-white md:text-5xl">
            INITIATE <span className="text-lime-500">SEQUENCE</span>
          </h2>
          <p className="mb-3 text-sm text-slate-400">
            The lab is ready. All systems are go. Your first experiment is free.
          </p>
          <div className="mb-8 font-bold text-lime-400 text-xs tracking-widest animate-pulse">
            ⚠ WARNING: HIGHLY ADDICTIVE — DEE DEE NOT INCLUDED
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={user ? "/dashboard" : "/auth/register"}
              className="group flex items-center gap-2 rounded-lg border-2 border-lime-600 bg-lime-600 px-10 py-4 text-sm font-black text-white hover:bg-lime-700 transition-all"
            >
              🧪 ENTER THE LABORATORY
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/login"
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-4"
            >
              Already have credentials? Log in
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-lime-900/30 bg-[#080b14] px-6 py-10">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <Image src="/dexterlogo.png" alt="Dexter's Forms" height={32} width={120} className="object-contain opacity-70" />
          </div>

          <div className="flex items-center gap-6 text-[11px] text-slate-500">
            <Link href="/pricing" className="hover:text-slate-300 transition-colors">Pricing</Link>
            <Link href="http://localhost:8000/docs" target="_blank" className="hover:text-slate-300 transition-colors">API Docs</Link>
            <Link href="/auth/login" className="hover:text-slate-300 transition-colors">Login</Link>
            <Link href="/auth/register" className="hover:text-slate-300 transition-colors">Register</Link>
          </div>

          <div className="text-[10px] text-slate-700 text-center">
            <div>Built with 🧪 tRPC · Drizzle · Next.js · Zod</div>
            <div className="mt-0.5">"OMELETTE DU FROMAGE" — Dexter, Season 1 Ep. 17</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
