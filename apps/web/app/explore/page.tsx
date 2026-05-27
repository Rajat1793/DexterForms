"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "~/providers/auth";
import { trpc } from "~/trpc/client";
import { Search, Loader2, Globe, ArrowLeft } from "lucide-react";

const THEME_HEADER_COLORS: Record<string, string> = {
  dexter: "#cc0000", minimal: "#7c3aed", dark: "#1e1b4b", matrix: "#166534",
  sakura: "#be185d", cyberpunk: "#3730a3", ocean: "#0369a1", nebula: "#581c87",
  retro: "#c2410c", dracula: "#4c1d95", naruto: "#c2410c", midnight: "#1c1917",
  startup: "#065f46",
};

function timeAgo(date: Date | string | null) {
  if (!date) return "";
  const d = new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

export default function ExplorePage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [querySearch, setQuerySearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: forms, isLoading, isFetching } = trpc.public.listPublicForms.useQuery(
    { search: querySearch || undefined },
    { staleTime: 30_000 }
  );

  const handleSearchChange = (v: string) => {
    setSearch(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuerySearch(v), 400);
  };

  return (
    <div className="min-h-screen bg-[#fffde7]">
      <div className="checker-strip" />

      {/* Nav */}
      <nav className="bg-white sticky top-0 z-50" style={{ borderBottom: "4px solid #000", boxShadow: "0 4px 0 #000" }}>
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-3">
          <Link href="/">
            <Image src="/dexterlogo.png" alt="DexterForms" height={40} width={160} style={{ height: "auto" }} className="object-contain" priority />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/explore" className="font-bold text-[#cc0000] uppercase text-sm tracking-wide border-b-2 border-[#cc0000]">Explore</Link>
            <Link href="/pricing" className="font-bold text-[#1a1a1a] hover:text-[#cc0000] uppercase text-sm tracking-wide">Pricing</Link>
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

      {/* Hero header */}
      <div className="bg-[#1565c0] px-6 py-14" style={{ borderBottom: "4px solid #000" }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="burst-badge text-[#1a1a1a] px-4 py-1 text-base mb-4 inline-block">🔬 PUBLIC LAB SPECIMENS</div>
          <h1
            className="font-bangers text-stroke-black text-white tracking-wide"
            style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)" }}
          >
            EXPLORE FORMS
          </h1>
          <p className="text-white/80 font-bold text-base mt-2 mb-8">
            Browse public forms created by the DexterForms community
          </p>
          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#888]" />
            {isFetching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888] animate-spin" />
            )}
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="SEARCH FORMS..."
              className="w-full pl-12 pr-12 py-3.5 font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd700]"
              style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000" }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="cartoon-card bg-white p-10 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-[#cc0000] mx-auto mb-3" />
              <p className="font-bangers text-xl text-[#1a1a1a] tracking-widest">SCANNING DATABASE...</p>
            </div>
          </div>
        ) : !forms?.length ? (
          <div className="cartoon-card bg-white p-16 text-center max-w-md mx-auto mt-8">
            <div className="text-6xl mb-4">{querySearch ? "🔭" : "🧪"}</div>
            <h3 className="font-bangers text-2xl text-[#1a1a1a] tracking-wide mb-2">
              {querySearch ? "NO FORMS FOUND!" : "NO PUBLIC FORMS YET!"}
            </h3>
            <p className="text-[#555] font-bold text-sm mb-6">
              {querySearch
                ? "Try a different search term."
                : "Create and publish your first public form!"}
            </p>
            <Link
              href="/auth/register"
              className="cartoon-btn bg-[#cc0000] text-white font-bangers text-xl px-6 py-2.5 tracking-wider inline-block"
            >
              CREATE A FORM!
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs font-bold text-[#888] uppercase tracking-widest mb-5">
              {forms.length} public form{forms.length !== 1 ? "s" : ""} found
              {querySearch && ` for "${querySearch}"`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {forms.map((form) => {
                const color = THEME_HEADER_COLORS[form.themeId ?? "dexter"] ?? "#cc0000";
                return (
                  <Link
                    key={form.id}
                    href={`/f/${form.slug}`}
                    className="cartoon-card bg-white block overflow-hidden group hover:-translate-y-0.5 transition-transform"
                  >
                    {/* Theme color strip */}
                    <div className="h-2" style={{ background: color }} />
                    <div className="p-4">
                      <div className="flex items-start gap-2 mb-2">
                        <h3 className="flex-1 font-bangers text-base text-[#1a1a1a] tracking-wide leading-snug line-clamp-2">
                          {form.title}
                        </h3>
                        <Globe className="h-3.5 w-3.5 text-[#bbb] flex-shrink-0 mt-1" />
                      </div>
                      {form.description && (
                        <p className="text-xs text-[#555] font-bold line-clamp-2 leading-relaxed mb-3">
                          {form.description}
                        </p>
                      )}
                      <div
                        className="flex items-center justify-between pt-3"
                        style={{ borderTop: "2px solid #f0f0f0" }}
                      >
                        <span className="text-xs font-bold text-[#aaa]">
                          {(form.responseCount ?? 0).toLocaleString()} response{form.responseCount !== 1 ? "s" : ""}
                        </span>
                        <span
                          className="text-xs font-bangers tracking-wider group-hover:underline"
                          style={{ color }}
                        >
                          FILL NOW →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </main>

      <div className="checker-strip mt-12" />
      <footer className="bg-white py-6 px-6 text-center" style={{ borderTop: "4px solid #000" }}>
        <p className="text-sm font-bold text-[#555]">
          <Link href="/" className="text-[#cc0000] hover:underline font-black">🍵 DexterForms</Link>
          {" — "}The form lab for genius scientists
        </p>
      </footer>
    </div>
  );
}
