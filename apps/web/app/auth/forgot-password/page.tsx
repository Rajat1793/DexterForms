"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Check your inbox!");
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="w-full max-w-md">
      <div className="cartoon-card bg-white p-8">
        <div className="bg-[#1565c0] -mx-8 -mt-8 mb-6 px-8 py-4" style={{ borderBottom: "3px solid #000" }}>
          <div className="font-bangers text-3xl text-white tracking-widest" style={{ WebkitTextStroke: "1px #000" }}>
            🔑 FORGOT PASSWORD?
          </div>
          <p className="text-white/80 text-sm font-bold mt-1">RESET YOUR LAB ACCESS CODES</p>
        </div>

        {submitted ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">📬</div>
            <h2 className="font-bangers text-2xl text-[#1565c0] tracking-widest mb-2">CHECK YOUR INBOX!</h2>
            <p className="text-sm text-[#555] font-bold mb-1">
              If that email exists in our system, we sent a reset link.
            </p>
            <p className="text-xs text-[#888] font-mono mb-6">The link expires in 1 hour.</p>
            <Link href="/auth/login"
              className="cartoon-btn bg-[#cc0000] text-white font-bangers text-xl px-6 py-2 tracking-wider inline-block">
              BACK TO LOGIN
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
            <p className="text-sm font-bold text-[#555]">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <div>
              <label className="block text-sm font-bold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888]" />
                <input
                  type="email"
                  {...register("email")}
                  className="w-full pl-9 pr-4 py-2.5 text-sm font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565c0]"
                  style={{ border: "3px solid #000", boxShadow: "3px 3px 0 #000" }}
                  placeholder="your@email.com"
                  autoFocus
                />
              </div>
              {errors.email && <p className="mt-1 text-xs font-bold text-[#cc0000]">⚠ {errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="cartoon-btn bg-[#1565c0] text-white font-bangers text-2xl px-6 py-3 tracking-wider w-full disabled:opacity-60"
            >
              {mutation.isPending ? (
                <><Loader2 className="h-5 w-5 animate-spin inline mr-2" />SENDING...</>
              ) : (
                "📧 SEND RESET LINK"
              )}
            </button>

            <p className="text-center text-sm font-bold text-[#555]">
              Remember your password?{" "}
              <Link href="/auth/login" className="text-[#cc0000] hover:text-[#aa0000] underline">
                Back to login →
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
