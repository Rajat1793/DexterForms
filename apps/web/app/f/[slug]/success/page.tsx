"use client";

import { use } from "react";
import Link from "next/link";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function SuccessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const message = searchParams.get("msg") ?? "Thank you for your response!";

  return (
    <div className="min-h-screen bg-[#0a0e1a] font-mono flex items-center justify-center px-4" style={{
      backgroundImage: "linear-gradient(rgba(101,163,13,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(101,163,13,0.03) 1px, transparent 1px)",
      backgroundSize: "40px 40px"
    }}>
      <div className="max-w-md w-full text-center">
        <div className="border border-green-700/40 bg-[#0f1520] p-10">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center border border-green-700/40 bg-green-900/20">
            <CheckCircle className="h-12 w-12 text-green-400" />
          </div>

          <div className="text-xs text-green-400 font-mono mb-3 border border-green-700/30 inline-block px-3 py-1 tracking-widest">
            ● DATA RECEIVED — STATUS: SUCCESS
          </div>

          <h1 className="text-2xl font-black text-white mb-3 tracking-wider uppercase">RESPONSE LOGGED!</h1>
          <p className="text-blue-300 text-sm leading-relaxed mb-8 font-mono">{message}</p>

          <div className="space-y-3">
            <Link
              href={`/f/${slug}`}
              className="flex items-center justify-center gap-2 w-full border border-lime-900/40 py-3 text-xs font-black text-blue-300 hover:bg-lime-900/20 hover:text-white tracking-widest uppercase transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              SUBMIT ANOTHER RESPONSE
            </Link>
            <Link
              href="/"
              className="block w-full border border-lime-600 bg-lime-600 py-3 text-xs font-black text-white hover:bg-lime-700 tracking-widest uppercase transition-colors"
            >
              BUILD YOUR OWN FORM — CHAIFORMS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
