"use client";

import { use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SuccessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const message = searchParams.get("msg") ?? "Thank you for your response!";

  return (
    <div className="min-h-screen bg-polka-yellow flex items-center justify-center px-4">
      {/* checker strip top */}
      <div className="checker-strip fixed top-0 left-0 right-0 z-10" />

      <div className="max-w-md w-full text-center my-16">
        <div className="cartoon-card bg-white overflow-hidden">
          {/* Red header strip */}
          <div className="bg-[#cc0000] px-8 py-6" style={{ borderBottom:"3px solid #000" }}>
            <div className="font-bangers text-[#ffd700] text-stroke-black tracking-widest leading-none"
              style={{ fontSize:"clamp(2rem,8vw,4rem)" }}>
              POW! 🎉
            </div>
          </div>

          <div className="p-8">
            {/* Big checkmark in yellow burst */}
            <div className="inline-flex h-24 w-24 items-center justify-center mb-4 text-5xl"
              style={{ background:"#ffd700", border:"4px solid #000", boxShadow:"4px 4px 0 #000", borderRadius:"50%" }}>
              ✅
            </div>

            <h1 className="font-bangers text-[#1a1a1a] tracking-widest mb-3 text-stroke-black"
              style={{ fontSize:"clamp(1.8rem,5vw,2.8rem)" }}>
              EXPERIMENT COMPLETE!
            </h1>

            <div className="burst-badge inline-block mb-4 text-[#1a1a1a] px-4 py-1 font-bangers text-lg tracking-wider">
              RESPONSE LOGGED!
            </div>

            <p className="text-[#555] font-bold text-sm leading-relaxed mb-8">{message}</p>

            <div className="space-y-3">
              <Link href={`/f/${slug}`}
                className="cartoon-btn bg-[#1565c0] text-white font-bangers text-xl px-6 py-3 tracking-wider w-full block">
                ↩ SUBMIT ANOTHER
              </Link>
              <Link href="/"
                className="cartoon-btn bg-[#cc0000] text-white font-bangers text-xl px-6 py-3 tracking-wider w-full block">
                🧪 BUILD YOUR OWN FORM
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 font-bangers text-[#cc0000] text-xl tracking-wider">
          POWERED BY DEXTER'S FORMS LAB
        </p>
      </div>

      {/* checker strip bottom */}
      <div className="checker-strip fixed bottom-0 left-0 right-0 z-10" />
    </div>
  );
}
