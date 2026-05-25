"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "~/trpc/client";
import { useAuth } from "~/providers/auth";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => { login(data.token, data.user); toast.success("Welcome back! 🍵"); router.push("/dashboard"); },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="w-full max-w-md">
      <div className="cartoon-card bg-white p-8">
        {/* Header strip */}
        <div className="bg-[#cc0000] -mx-8 -mt-8 mb-6 px-8 py-4" style={{ borderBottom:"3px solid #000" }}>
          <div className="font-bangers text-3xl text-white tracking-widest" style={{ WebkitTextStroke:"1px #000" }}>
            🔐 ENTER THE LAB!
          </div>
          <p className="text-white/80 text-sm font-bold mt-1">ACCESS TERMINAL — CREDENTIALS REQUIRED</p>
        </div>

        {/* Demo creds */}
        <div className="mb-6 p-4 bg-[#fff9c4]" style={{ border:"2px solid #000", boxShadow:"3px 3px 0 #000", transform:"rotate(-0.5deg)" }}>
          <p className="font-bangers text-sm text-[#cc0000] tracking-wider mb-1">🔑 DEMO ACCESS CODES</p>
          <p className="text-xs font-bold text-[#1a1a1a]">EMAIL: <span className="font-mono text-[#1565c0]">demo@dexterforms.dev</span></p>
          <p className="text-xs font-bold text-[#1a1a1a]">PASS: <span className="font-mono text-[#cc0000]">Demo@123456</span></p>
        </div>

        <form onSubmit={handleSubmit((data) => loginMutation.mutate(data))} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">Email Address</label>
            <input type="email" {...register("email")}
              className="w-full px-4 py-2.5 text-sm font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
              style={{ border:"3px solid #000", boxShadow:"3px 3px 0 #000" }}
              placeholder="operator@lab.dev" />
            {errors.email && <p className="mt-1 text-xs font-bold text-[#cc0000]">⚠ {errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} {...register("password")}
                className="w-full px-4 py-2.5 pr-10 text-sm font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
                style={{ border:"3px solid #000", boxShadow:"3px 3px 0 #000" }}
                placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#cc0000]">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs font-bold text-[#cc0000]">⚠ {errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loginMutation.isPending}
            className="cartoon-btn bg-[#cc0000] text-white font-bangers text-2xl px-6 py-3 tracking-wider w-full mt-2 disabled:opacity-60">
            {loginMutation.isPending ? <><Loader2 className="h-5 w-5 animate-spin inline mr-2" />LOADING...</> : "🚪 ACCESS LAB!"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs font-bold text-[#888]">
          <Link href="/auth/forgot-password" className="text-[#1565c0] hover:text-[#cc0000] underline">
            Forgot password?
          </Link>
        </p>

        <p className="mt-4 text-center text-sm font-bold text-[#555]">
          New scientist?{" "}
          <Link href="/auth/register" className="text-[#1565c0] hover:text-[#cc0000] font-bold underline">
            Register here →
          </Link>
        </p>
      </div>
    </div>
  );
}
