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
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => { login(data.token, data.user); toast.success("Welcome to DexterForms! 🍵"); router.push("/dashboard"); },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="w-full max-w-md">
      <div className="cartoon-card bg-white p-8">
        {/* Header strip */}
        <div className="bg-[#1565c0] -mx-8 -mt-8 mb-6 px-8 py-4" style={{ borderBottom:"3px solid #000" }}>
          <div className="font-bangers text-3xl text-white tracking-widest" style={{ WebkitTextStroke:"1px #000" }}>
            🧪 JOIN THE LAB!
          </div>
          <p className="text-white/80 text-sm font-bold mt-1">NEW SCIENTIST REGISTRATION — FREE FOREVER</p>
        </div>

        <form onSubmit={handleSubmit((data) => registerMutation.mutate(data))} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">Your Name</label>
            <input type="text" {...register("fullName")}
              className="w-full px-4 py-2.5 text-sm font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565c0]"
              style={{ border:"3px solid #000", boxShadow:"3px 3px 0 #000" }}
              placeholder="Dexter McPherson" />
            {errors.fullName && <p className="mt-1 text-xs font-bold text-[#cc0000]">⚠ {errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">Email Address</label>
            <input type="email" {...register("email")}
              className="w-full px-4 py-2.5 text-sm font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565c0]"
              style={{ border:"3px solid #000", boxShadow:"3px 3px 0 #000" }}
              placeholder="scientist@lab.dev" />
            {errors.email && <p className="mt-1 text-xs font-bold text-[#cc0000]">⚠ {errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} {...register("password")}
                className="w-full px-4 py-2.5 pr-10 text-sm font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565c0]"
                style={{ border:"3px solid #000", boxShadow:"3px 3px 0 #000" }}
                placeholder="min 8 characters" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#1565c0]">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs font-bold text-[#cc0000]">⚠ {errors.password.message}</p>}
          </div>

          <button type="submit" disabled={registerMutation.isPending}
            className="cartoon-btn bg-[#1565c0] text-white font-bangers text-2xl px-6 py-3 tracking-wider w-full mt-2 disabled:opacity-60">
            {registerMutation.isPending ? <><Loader2 className="h-5 w-5 animate-spin inline mr-2" />CREATING...</> : "🚀 START EXPERIMENTING!"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-bold text-[#555]">
          Already a scientist?{" "}
          <Link href="/auth/login" className="text-[#cc0000] hover:text-[#1565c0] font-bold underline">
            Log in here →
          </Link>
        </p>
      </div>
    </div>
  );
}
