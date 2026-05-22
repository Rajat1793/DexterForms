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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      login(data.token, data.user);
      toast.success("Welcome back! 🍵");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-none border border-lime-900/40 bg-[#0f1520] p-8 shadow-2xl shadow-lime-900/10">
        <div className="mb-2 text-center">
          <div className="inline-block text-xs text-green-400 font-mono mb-4 border border-green-700/40 px-3 py-1 bg-green-900/10">
            ● SYSTEM ONLINE — AUTHENTICATION REQUIRED
          </div>
          <h1 className="text-2xl font-black text-white font-mono tracking-wider uppercase">Access Terminal</h1>
          <p className="mt-2 text-xs text-blue-400/70 font-mono">ENTER LABORATORY CREDENTIALS TO PROCEED</p>
        </div>

        {/* Demo credentials */}
        <div className="mb-6 mt-5 rounded-none border border-green-700/40 bg-green-900/10 p-4">
          <p className="text-xs font-black text-green-400 font-mono mb-2 uppercase tracking-wider">// DEMO ACCESS CODES</p>
          <p className="text-xs text-green-300/80 font-mono">
            EMAIL: <span className="text-green-400">demo@chaiforms.dev</span>
          </p>
          <p className="text-xs text-green-300/80 font-mono">
            PASS: <span className="text-green-400">Demo@123456</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-blue-400/80 font-mono mb-1.5 uppercase tracking-widest">
              &gt; Email Address
            </label>
            <input
              type="email"
              {...register("email")}
              className="w-full rounded-none border border-lime-900/40 bg-[#080d14] px-4 py-2.5 text-sm text-blue-100 font-mono focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500/30 placeholder:text-blue-600"
              placeholder="operator@lab.dev"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-lime-400 font-mono">⚠ {errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-black text-blue-400/80 font-mono mb-1.5 uppercase tracking-widest">
              &gt; Access Code
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="w-full rounded-none border border-lime-900/40 bg-[#080d14] px-4 py-2.5 pr-10 text-sm text-blue-100 font-mono focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500/30 placeholder:text-blue-600"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-lime-400"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-lime-400 font-mono">⚠ {errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-none bg-lime-600 py-3 text-sm font-black text-white font-mono tracking-widest uppercase hover:bg-lime-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {loginMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {loginMutation.isPending ? "AUTHENTICATING..." : "ENTER LABORATORY"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-blue-400 font-mono">
          NO ACCOUNT?{" "}
          <Link href="/auth/register" className="font-black text-lime-400 hover:text-lime-300 tracking-wider">
            REGISTER AS NEW SUBJECT
          </Link>
        </p>
      </div>
    </div>
  );
}
