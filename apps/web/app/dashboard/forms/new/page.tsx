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

type FieldDef = {
  type: "short_text" | "long_text" | "email" | "number" | "single_select" | "multi_select"
    | "checkbox" | "rating" | "date" | "dropdown" | "phone" | "url";
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  settings?: Record<string, unknown>;
};

const TEMPLATE_FIELDS: Record<string, FieldDef[]> = {
  "Contact Form": [
    { type: "short_text", label: "Full Name", placeholder: "Your full name", required: true },
    { type: "email",      label: "Email Address", placeholder: "you@example.com", required: true },
    { type: "phone",      label: "Phone Number", placeholder: "+1 (555) 000-0000" },
    { type: "short_text", label: "Subject", placeholder: "What is this about?", required: true },
    { type: "long_text",  label: "Message", placeholder: "Tell us how we can help...", required: true },
  ],
  "Customer Feedback": [
    { type: "short_text",    label: "Product / Service Name", placeholder: "e.g. DexterForms Pro", required: true },
    { type: "rating",        label: "Overall Experience", required: true, settings: { maxRating: 5 } },
    { type: "long_text",     label: "What did you like most?", placeholder: "Share the highlights..." },
    { type: "long_text",     label: "What could be improved?", placeholder: "We appreciate honest feedback!" },
    { type: "single_select", label: "Would you recommend us?", required: true,
      options: [{ value: "yes", label: "Yes, absolutely!" }, { value: "maybe", label: "Maybe" }, { value: "no", label: "Not right now" }] },
  ],
  "Job Application": [
    { type: "short_text", label: "Full Name", placeholder: "Your full name", required: true },
    { type: "email",      label: "Email Address", placeholder: "you@example.com", required: true },
    { type: "phone",      label: "Phone Number", placeholder: "+1 (555) 000-0000", required: true },
    { type: "short_text", label: "Position Applied For", placeholder: "e.g. Software Engineer", required: true },
    { type: "number",     label: "Years of Experience", placeholder: "e.g. 3" },
    { type: "single_select", label: "Availability", options: [
      { value: "immediate", label: "Immediately" },
      { value: "2weeks",    label: "2 Weeks Notice" },
      { value: "1month",    label: "1 Month Notice" },
    ]},
    { type: "long_text",  label: "Tell us about yourself", placeholder: "Brief introduction and relevant experience...", required: true },
    { type: "url",        label: "LinkedIn / Portfolio URL", placeholder: "https://linkedin.com/in/..." },
  ],
  "Event Registration": [
    { type: "short_text",    label: "Full Name", placeholder: "Your full name", required: true },
    { type: "email",         label: "Email Address", placeholder: "you@example.com", required: true },
    { type: "phone",         label: "Phone Number", placeholder: "+1 (555) 000-0000" },
    { type: "number",        label: "Number of Attendees", placeholder: "1", required: true },
    { type: "single_select", label: "Dietary Requirements", options: [
      { value: "none",        label: "None" },
      { value: "vegetarian",  label: "Vegetarian" },
      { value: "vegan",       label: "Vegan" },
      { value: "gluten_free", label: "Gluten-Free" },
    ]},
    { type: "long_text", label: "Special Requirements or Questions", placeholder: "Anything we should know?" },
  ],
  "Survey": [
    { type: "short_text",    label: "Name", placeholder: "Optional" },
    { type: "email",         label: "Email Address", placeholder: "you@example.com" },
    { type: "single_select", label: "How did you hear about us?", required: true, options: [
      { value: "social",  label: "Social Media" },
      { value: "friend",  label: "Friend or Colleague" },
      { value: "google",  label: "Google Search" },
      { value: "other",   label: "Other" },
    ]},
    { type: "rating",     label: "How satisfied are you overall?", required: true, settings: { maxRating: 5 } },
    { type: "multi_select", label: "Which features do you use most?", options: [
      { value: "forms",     label: "Form Builder" },
      { value: "analytics", label: "Analytics" },
      { value: "export",    label: "CSV Export" },
      { value: "themes",    label: "Themes" },
    ]},
    { type: "long_text", label: "Any additional comments?", placeholder: "We read every response!" },
  ],
  "Bug Report": [
    { type: "short_text",    label: "Your Name", placeholder: "Optional" },
    { type: "email",         label: "Email Address", placeholder: "we'll follow up here", required: true },
    { type: "short_text",    label: "Bug Title", placeholder: "Short description of the issue", required: true },
    { type: "single_select", label: "Severity", required: true, options: [
      { value: "low",      label: "Low — minor inconvenience" },
      { value: "medium",   label: "Medium — affects workflow" },
      { value: "high",     label: "High — blocks key feature" },
      { value: "critical", label: "Critical — data loss / crash" },
    ]},
    { type: "long_text", label: "Steps to Reproduce", placeholder: "1. Go to...\n2. Click...\n3. See error...", required: true },
    { type: "long_text", label: "Expected Behavior", placeholder: "What should have happened?" },
    { type: "long_text", label: "Actual Behavior",   placeholder: "What actually happened?" },
  ],
};

const TEMPLATES = [
  { title: "Contact Form",      description: "Basic contact form with name, email and message", emoji: "📬" },
  { title: "Customer Feedback", description: "Collect product ratings and feedback",            emoji: "⭐" },
  { title: "Job Application",   description: "Screen candidates with key questions",             emoji: "💼" },
  { title: "Event Registration",description: "Collect attendee information",                     emoji: "🎪" },
  { title: "Survey",            description: "General purpose survey form",                      emoji: "📊" },
  { title: "Bug Report",        description: "Let users report issues easily",                   emoji: "🐛" },
];
const TEMPLATE_COLORS = ["bg-[#cc0000]","bg-[#1565c0]","bg-[#00a86b]","bg-[#ff8c00]","bg-[#7b1fa2]","bg-[#ff69b4]"];

export default function NewFormPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const createMutation  = trpc.forms.create.useMutation();
  const addFieldMutation = trpc.fields.add.useMutation();

  const createFromScratch = async (data: FormData) => {
    const form = await createMutation.mutateAsync(data);
    toast.success("Experiment initialized!");
    router.push(`/dashboard/forms/${form.id}`);
  };

  const createFromTemplate = async (tpl: typeof TEMPLATES[number]) => {
    setIsCreating(true);
    try {
      const form = await createMutation.mutateAsync({ title: tpl.title, description: tpl.description });
      const fields = TEMPLATE_FIELDS[tpl.title] ?? [];
      for (let i = 0; i < fields.length; i++) {
        await addFieldMutation.mutateAsync({ formId: form.id, order: i, ...fields[i]! });
      }
      toast.success(`${tpl.emoji} Template loaded — ${fields.length} fields added!`);
      router.push(`/dashboard/forms/${form.id}`);
    } catch {
      toast.error("Failed to create template form");
      setIsCreating(false);
    }
  };

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
          <form onSubmit={handleSubmit(createFromScratch)} className="space-y-4">
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
            <button type="submit" disabled={createMutation.isPending || isCreating}
              className="cartoon-btn bg-[#cc0000] text-white font-bangers text-xl px-6 py-3 tracking-wider disabled:opacity-60">
              {createMutation.isPending ? <><Loader2 className="h-5 w-5 animate-spin inline mr-2" />CREATING...</> : "🚀 CREATE FORM!"}
            </button>
          </form>
        </div>
      </div>

      {/* Templates */}
      <div>
        <h2 className="font-bangers text-2xl text-[#1a1a1a] tracking-wide mb-1">📋 OR PICK A TEMPLATE:</h2>
        <p className="text-xs font-bold text-[#888] mb-4 uppercase tracking-wide">Instantly pre-populated with relevant fields</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TEMPLATES.map((tpl, i) => {
            const fieldCount = TEMPLATE_FIELDS[tpl.title]?.length ?? 0;
            return (
              <button key={tpl.title} disabled={isCreating}
                onClick={() => createFromTemplate(tpl)}
                className="cartoon-card bg-white p-4 text-left hover:-translate-y-0.5 transition-transform overflow-hidden disabled:opacity-50 disabled:cursor-wait"
                style={{ display:"block" }}>
                <div className={`h-1.5 -mx-4 -mt-4 mb-3 ${TEMPLATE_COLORS[i % TEMPLATE_COLORS.length]}`} />
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{isCreating ? "⏳" : tpl.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bangers text-base text-[#1a1a1a] tracking-wide">{tpl.title}</h3>
                    <p className="text-xs text-[#555] mt-0.5">{tpl.description}</p>
                    <p className="text-xs font-black text-[#888] mt-1.5">
                      {fieldCount} fields included →
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
