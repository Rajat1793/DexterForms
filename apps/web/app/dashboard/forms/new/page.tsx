"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewFormPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const createMutation = trpc.forms.create.useMutation({
    onSuccess: (form) => {
      toast.success("Experiment initialized!");
      router.push(`/dashboard/forms/${form.id}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const TEMPLATES = [
    { title: "Contact Form", description: "Basic contact form with name, email and message", code: "CTF-001" },
    { title: "Customer Feedback", description: "Collect product ratings and feedback", code: "CFB-002" },
    { title: "Job Application", description: "Screen candidates with key questions", code: "JOB-003" },
    { title: "Event Registration", description: "Collect attendee information", code: "EVT-004" },
    { title: "Survey", description: "General purpose survey form", code: "SRV-005" },
    { title: "Bug Report", description: "Let users report issues easily", code: "BUG-006" },
  ];

  return (
    <div className="p-8 max-w-3xl font-mono">
      <Link href="/dashboard" className="flex items-center gap-2 text-xs text-blue-400 hover:text-lime-400 mb-6 tracking-wider uppercase transition-colors">
        <ArrowLeft className="h-4 w-4" />
        BACK TO LAB
      </Link>

      <div className="mb-8">
        <div className="text-xs text-blue-400/80 tracking-widest mb-1 uppercase">// EXPERIMENT INITIALIZATION</div>
        <h1 className="text-2xl font-black text-white tracking-wider uppercase">CREATE NEW FORM</h1>
        <p className="text-blue-400 mt-1 text-xs tracking-wide">START FROM SCRATCH OR SELECT A PROTOCOL TEMPLATE</p>
      </div>

      {/* Start from scratch */}
      <div className="border border-lime-900/30 bg-[#0f1520] p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-black text-lime-400 border border-lime-900/40 px-2 py-0.5 tracking-widest">PROTOCOL-ALPHA</span>
          <h2 className="font-black text-white tracking-wider text-sm uppercase">START FROM SCRATCH</h2>
        </div>
        <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-blue-400/70 font-mono mb-1.5 uppercase tracking-widest">&gt; Experiment Title *</label>
            <input
              type="text"
              {...register("title")}
              className="w-full rounded-none border border-lime-900/30 bg-[#080d14] px-4 py-2.5 text-sm text-blue-100 font-mono focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500/20 placeholder:text-blue-600"
              autoFocus
            />
            {errors.title && <p className="mt-1 text-xs text-lime-400 font-mono">⚠ {errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-black text-blue-400/70 font-mono mb-1.5 uppercase tracking-widest">&gt; Description (optional)</label>
            <textarea
              {...register("description")}
              className="w-full rounded-none border border-lime-900/30 bg-[#080d14] px-4 py-2.5 text-sm text-blue-100 font-mono focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500/20 resize-none placeholder:text-blue-600"
              rows={2}
              placeholder="What is this experiment about?"
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 border border-lime-600 bg-lime-600 px-6 py-2.5 text-xs font-black text-white hover:bg-lime-700 disabled:opacity-50 tracking-widest uppercase transition-colors"
          >
            {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <FileText className="h-4 w-4" />
            {createMutation.isPending ? "INITIALIZING..." : "CREATE FORM"}
          </button>
        </form>
      </div>

      {/* Templates */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-black text-blue-400 border border-blue-900/40 px-2 py-0.5 tracking-widest">PROTOCOL-BETA</span>
          <h2 className="font-black text-white tracking-wider text-sm uppercase">SELECT A TEMPLATE</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.title}
              onClick={() => createMutation.mutate({ title: t.title, description: t.description })}
              className="border border-lime-900/20 bg-[#0f1520] p-4 text-left hover:border-lime-500/40 hover:bg-lime-900/5 transition-all group"
            >
              <div className="text-xs text-blue-400/80 font-mono mb-2 tracking-widest">{t.code}</div>
              <div className="font-black text-sm text-white tracking-wide group-hover:text-lime-400 transition-colors">{t.title}</div>
              <div className="text-xs text-blue-400 mt-1 font-mono">{t.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
