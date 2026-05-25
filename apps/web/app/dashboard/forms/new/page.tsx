"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const TEMPLATES = [
  { title: "Contact Form", description: "Basic contact form with name, email and message", emoji: "📬" },
  { title: "Customer Feedback", description: "Collect product ratings and feedback", emoji: "⭐" },
  { title: "Job Application", description: "Screen candidates with key questions", emoji: "💼" },
  { title: "Event Registration", description: "Collect attendee information", emoji: "🎪" },
  { title: "Survey", description: "General purpose survey form", emoji: "📊" },
  { title: "Bug Report", description: "Let users report issues easily", emoji: "🐛" },
];
const TEMPLATE_COLORS = ["bg-[#cc0000]","bg-[#1565c0]","bg-[#00a86b]","bg-[#ff8c00]","bg-[#7b1fa2]","bg-[#ff69b4]"];

export default function NewFormPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({ resolver: zodResolver(schema) });

  const createMutation = trpc.forms.create.useMutation({
    onSuccess: (form) => { toast.success("Experiment initialized!"); router.push(`/dashboard/forms/${form.id}`); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/dashboard" className="inline-flex items-center gap-2 font-bold text-[#cc0000] hover:text-[#aa0000] mb-6 uppercase text-sm tracking-wide">
        <ArrowLeft className="h-4 w-4" /> BACK TO LAB
      </Link>

      <div className="mb-8">
        <div className="burst-badge text-[#1a1a1a] px-3 py-0.5 text-sm mb-3 inline-block">⚗️ EXPERIMENT INITIALIZATION</div>
        <h1 className="font-bangers text-stroke-black text-[#1a1a1a] tracking-wide" style={{ fontSize:"clamp(2rem,5vw,3.5rem)" }}>CREATE NEW FORM</h1>
        <p className="font-bold text-[#555] text-sm mt-1">START FROM SCRATCH OR PICK A TEMPLATE BELOW</p>
      </div>

      {/* Start from scratch */}
      <div className="cartoon-card bg-white mb-8 overflow-hidden">
        <div className="bg-[#cc0000] px-6 py-3" style={{ borderBottom:"3px solid #000" }}>
          <span className="font-bangers text-2xl text-white tracking-widest">🏗️ START FROM SCRATCH</span>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">Form Title *</label>
              <input type="text" {...register("title")}
                className="w-full px-4 py-2.5 text-sm font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
                style={{ border:"3px solid #000", boxShadow:"3px 3px 0 #000" }}
                placeholder="My Awesome Experiment" autoFocus />
              {errors.title && <p className="mt-1 text-xs font-bold text-[#cc0000]">⚠ {errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1a1a1a] mb-1.5 uppercase tracking-wide">Description (optional)</label>
              <textarea {...register("description")}
                className="w-full px-4 py-2.5 text-sm font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000] resize-none"
                style={{ border:"3px solid #000", boxShadow:"3px 3px 0 #000" }}
                rows={2} placeholder="What is this experiment about?" />
            </div>
            <button type="submit" disabled={createMutation.isPending}
              className="cartoon-btn bg-[#cc0000] text-white font-bangers text-xl px-6 py-3 tracking-wider disabled:opacity-60">
              {createMutation.isPending ? <><Loader2 className="h-5 w-5 animate-spin inline mr-2" />CREATING...</> : "🚀 CREATE FORM!"}
            </button>
          </form>
        </div>
      </div>

      {/* Templates */}
      <div>
        <h2 className="font-bangers text-2xl text-[#1a1a1a] tracking-wide mb-4">📋 OR PICK A TEMPLATE:</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TEMPLATES.map((tpl, i) => (
            <button key={tpl.title}
              onClick={() => { setValue("title", tpl.title); setValue("description", tpl.description); }}
              className="cartoon-card bg-white p-4 text-left hover:-translate-y-0.5 transition-transform overflow-hidden"
              style={{ display:"block" }}>
              <div className={`h-1.5 -mx-4 -mt-4 mb-3 ${TEMPLATE_COLORS[i % TEMPLATE_COLORS.length]}`} />
              <div className="flex items-start gap-3">
                <span className="text-2xl">{tpl.emoji}</span>
                <div>
                  <h3 className="font-bangers text-base text-[#1a1a1a] tracking-wide">{tpl.title}</h3>
                  <p className="text-xs text-[#555] mt-0.5">{tpl.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
