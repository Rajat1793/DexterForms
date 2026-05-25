"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const schema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setDone(true);
      toast.success("Password reset! Please log in.");
      setTimeout(() => router.push("/auth/login"), 2000);
    },
    onError: (error) => toast.error(error.message),
  });

  if (!token) {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="font-bangers text-2xl text-[#cc0000] tracking-widest mb-2">INVALID LINK</h2>
        <p className="text-sm text-[#555] font-bold mb-6">This reset link is missing or invalid.</p>
        <Link href="/auth/forgot-password"
          className="cartoon-btn bg-[#cc0000] text-white font-bangers text-xl px-6 py-2 tracking-wider inline-block">
          REQUEST NEW LINK
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="font-bangers text-2xl text-[#00a86b] tracking-widest mb-2">PASSWORD RESET!</h2>
        <p className="text-sm text-[#555] font-bold">Redirecting you to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate({ token, newPassword: data.newPassword }))} className="space-y-5">
      <div>
        <label className="block text-sm font-bold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">New Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            {...register("newPassword")}
            className="w-full px-4 py-2.5 pr-10 text-sm font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
            style={{ border: "3px solid #000", boxShadow: "3px 3px 0 #000" }}
            placeholder="Min. 8 characters"
            autoFocus
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#cc0000]">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.newPassword && <p className="mt-1 text-xs font-bold text-[#cc0000]">⚠ {errors.newPassword.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-bold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">Confirm Password</label>
        <input
          type={showPassword ? "text" : "password"}
          {...register("confirmPassword")}
          className="w-full px-4 py-2.5 text-sm font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
          style={{ border: "3px solid #000", boxShadow: "3px 3px 0 #000" }}
          placeholder="Repeat new password"
        />
        {errors.confirmPassword && <p className="mt-1 text-xs font-bold text-[#cc0000]">⚠ {errors.confirmPassword.message}</p>}
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="cartoon-btn bg-[#cc0000] text-white font-bangers text-2xl px-6 py-3 tracking-wider w-full disabled:opacity-60"
      >
        {mutation.isPending ? (
          <><Loader2 className="h-5 w-5 animate-spin inline mr-2" />SAVING...</>
        ) : (
          "🔐 SET NEW PASSWORD"
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <div className="cartoon-card bg-white p-8">
        <div className="bg-[#cc0000] -mx-8 -mt-8 mb-6 px-8 py-4" style={{ borderBottom: "3px solid #000" }}>
          <div className="font-bangers text-3xl text-white tracking-widest" style={{ WebkitTextStroke: "1px #000" }}>
            🔑 SET NEW PASSWORD
          </div>
          <p className="text-white/80 text-sm font-bold mt-1">SECURE YOUR LAB ACCESS</p>
        </div>
        <Suspense fallback={<div className="text-center py-8 text-sm font-mono text-[#888]">LOADING...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
