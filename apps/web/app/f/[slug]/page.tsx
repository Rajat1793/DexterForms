"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Loader2, Star, ChevronLeft, ChevronRight, Check, AlertCircle } from "lucide-react";

// Theme styles map
const THEME_STYLES: Record<string, {
  bg: string; card: string; text: string; muted: string;
  accent: string; border: string; input: string; button: string; progress: string;
  fontFamily?: string;
}> = {
  minimal: {
    bg: "bg-white", card: "bg-gray-50 border-gray-200", text: "text-gray-900",
    muted: "text-gray-500", accent: "text-violet-600", border: "border-gray-200",
    input: "bg-white border-gray-200 focus:border-violet-500 focus:ring-violet-500/20",
    button: "bg-violet-600 hover:bg-violet-700 text-white",
    progress: "bg-violet-600",
  },
  dark: {
    bg: "bg-slate-900", card: "bg-slate-800 border-slate-700", text: "text-slate-100",
    muted: "text-slate-400", accent: "text-violet-400", border: "border-slate-700",
    input: "bg-slate-700 border-slate-600 text-slate-100 focus:border-violet-500 focus:ring-violet-500/20",
    button: "bg-violet-600 hover:bg-violet-500 text-white",
    progress: "bg-violet-500",
  },
  matrix: {
    bg: "bg-black", card: "bg-green-950 border-green-800", text: "text-green-400",
    muted: "text-green-600", accent: "text-green-300", border: "border-green-800",
    input: "bg-black border-green-700 text-green-300 focus:border-green-400 focus:ring-green-400/20",
    button: "bg-green-600 hover:bg-green-500 text-black font-bold",
    progress: "bg-green-500",
    fontFamily: "font-mono",
  },
  sakura: {
    bg: "bg-pink-50", card: "bg-white border-pink-200", text: "text-pink-900",
    muted: "text-pink-600", accent: "text-pink-700", border: "border-pink-200",
    input: "bg-white border-pink-200 text-pink-900 focus:border-pink-500 focus:ring-pink-500/20",
    button: "bg-pink-600 hover:bg-pink-700 text-white",
    progress: "bg-pink-500",
  },
  cyberpunk: {
    bg: "bg-indigo-950", card: "bg-slate-900 border-purple-700", text: "text-gray-100",
    muted: "text-purple-400", accent: "text-yellow-400", border: "border-purple-700",
    input: "bg-slate-800 border-purple-600 text-gray-100 focus:border-yellow-400 focus:ring-yellow-400/20",
    button: "bg-yellow-400 hover:bg-yellow-300 text-black font-bold",
    progress: "bg-yellow-400",
    fontFamily: "font-mono",
  },
  ocean: {
    bg: "bg-sky-50", card: "bg-white border-sky-200", text: "text-sky-900",
    muted: "text-sky-600", accent: "text-sky-700", border: "border-sky-200",
    input: "bg-white border-sky-200 text-sky-900 focus:border-sky-500 focus:ring-sky-500/20",
    button: "bg-sky-600 hover:bg-sky-700 text-white",
    progress: "bg-sky-500",
  },
  nebula: {
    bg: "bg-gray-950", card: "bg-purple-950 border-purple-900", text: "text-purple-100",
    muted: "text-purple-400", accent: "text-purple-300", border: "border-purple-900",
    input: "bg-gray-900 border-purple-800 text-purple-100 focus:border-purple-500 focus:ring-purple-500/20",
    button: "bg-purple-600 hover:bg-purple-500 text-white",
    progress: "bg-purple-500",
  },
  retro: {
    bg: "bg-amber-50", card: "bg-white border-amber-300", text: "text-amber-900",
    muted: "text-amber-700", accent: "text-orange-600", border: "border-amber-300",
    input: "bg-amber-50 border-amber-300 text-amber-900 focus:border-orange-500 focus:ring-orange-500/20",
    button: "bg-orange-500 hover:bg-orange-600 text-white",
    progress: "bg-orange-500",
    fontFamily: "font-mono",
  },
  dracula: {
    bg: "bg-gray-900", card: "bg-gray-800 border-gray-700", text: "text-gray-100",
    muted: "text-gray-400", accent: "text-purple-400", border: "border-gray-700",
    input: "bg-gray-700 border-gray-600 text-gray-100 focus:border-purple-500 focus:ring-purple-500/20",
    button: "bg-purple-600 hover:bg-purple-500 text-white",
    progress: "bg-purple-500",
  },
  naruto: {
    bg: "bg-orange-50", card: "bg-white border-orange-200", text: "text-orange-900",
    muted: "text-orange-600", accent: "text-orange-600", border: "border-orange-200",
    input: "bg-white border-orange-200 text-orange-900 focus:border-orange-500 focus:ring-orange-500/20",
    button: "bg-orange-500 hover:bg-orange-600 text-white",
    progress: "bg-orange-500",
  },
  midnight: {
    bg: "bg-gray-950", card: "bg-gray-900 border-gray-800", text: "text-amber-100",
    muted: "text-amber-400", accent: "text-yellow-400", border: "border-gray-800",
    input: "bg-gray-800 border-gray-700 text-amber-100 focus:border-yellow-400 focus:ring-yellow-400/20",
    button: "bg-yellow-500 hover:bg-yellow-400 text-black font-bold",
    progress: "bg-yellow-500",
  },
  startup: {
    bg: "bg-slate-50", card: "bg-white border-slate-200", text: "text-slate-900",
    muted: "text-slate-500", accent: "text-emerald-600", border: "border-slate-200",
    input: "bg-white border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-emerald-500/20",
    button: "bg-emerald-600 hover:bg-emerald-700 text-white",
    progress: "bg-emerald-500",
  },
  dexter: {
    bg: "bg-[#fffde7]", card: "bg-white", text: "text-[#1a1a1a]",
    muted: "text-[#555555]", accent: "text-[#cc0000]", border: "border-black",
    input: "bg-white border-[3px] border-black text-[#1a1a1a] focus:border-[#cc0000] focus:ring-[#cc0000]/20",
    button: "bg-[#cc0000] hover:bg-[#aa0000] text-white font-bangers tracking-wider",
    progress: "bg-[#cc0000]",
    fontFamily: "font-comic",
  },
};

function getTheme(themeId: string | null) {
  return THEME_STYLES[themeId ?? "minimal"] ?? THEME_STYLES["minimal"]!;
}

type FormField = {
  id: string;
  type: string;
  label: string;
  placeholder: string | null;
  description: string | null;
  required: boolean | null;
  order: number;
  options: unknown;
  settings: unknown;
  validations: unknown;
  conditionalLogic: unknown;
};

function FieldInput({
  field,
  value,
  onChange,
  theme,
  error,
}: {
  field: FormField;
  value: string;
  onChange: (v: string) => void;
  theme: (typeof THEME_STYLES)[string];
  error?: string;
}) {
  const options = (field.options as Array<{ value: string; label: string }>) ?? [];
  const maxRating = (field.settings as any)?.maxRating ?? 5;
  const inputClass = `w-full rounded-xl border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 ${theme.input} ${error ? "border-lime-400" : ""}`;

  switch (field.type) {
    case "short_text":
    case "url":
    case "phone":
      return <input type={field.type === "url" ? "url" : field.type === "phone" ? "tel" : "text"} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} placeholder={field.placeholder ?? ""} />;

    case "email":
      return <input type="email" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} placeholder={field.placeholder ?? "your@email.com"} />;

    case "number":
      return <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} placeholder={field.placeholder ?? "0"} />;

    case "long_text":
      return <textarea value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass} resize-none`} rows={4} placeholder={field.placeholder ?? ""} />;

    case "date":
      return <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />;

    case "checkbox":
      return (
        <button
          onClick={() => onChange(value === "true" ? "false" : "true")}
          className={`flex items-center gap-3 rounded-xl border p-4 w-full text-left transition-all ${value === "true" ? `border-current bg-current/10 ${theme.accent}` : `${theme.border} hover:${theme.border}`}`}
        >
          <div className={`h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${value === "true" ? "bg-current border-current" : `${theme.border}`}`}>
            {value === "true" && <Check className="h-3 w-3 text-white" />}
          </div>
          <span className={`text-sm ${theme.text}`}>{field.placeholder ?? field.label}</span>
        </button>
      );

    case "single_select":
      return (
        <div className="space-y-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange(JSON.stringify([opt.value]))}
              className={`flex items-center gap-3 w-full rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                value && JSON.parse(value || "[]").includes(opt.value)
                  ? `border-current bg-current/10 ${theme.accent}`
                  : `${theme.border} hover:${theme.border}/80 ${theme.text}`
              }`}
            >
              <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                value && JSON.parse(value || "[]").includes(opt.value) ? "border-current" : "border-gray-400"
              }`}>
                {value && JSON.parse(value || "[]").includes(opt.value) && (
                  <div className="h-2 w-2 rounded-full bg-current" />
                )}
              </div>
              {opt.label}
            </button>
          ))}
        </div>
      );

    case "multi_select":
      return (
        <div className="space-y-2">
          {options.map((opt) => {
            const selected: string[] = (() => { try { return JSON.parse(value || "[]"); } catch { return []; } })();
            const isSelected = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => {
                  const newSelected = isSelected
                    ? selected.filter((v) => v !== opt.value)
                    : [...selected, opt.value];
                  onChange(JSON.stringify(newSelected));
                }}
                className={`flex items-center gap-3 w-full rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                  isSelected ? `border-current bg-current/10 ${theme.accent}` : `${theme.border} ${theme.text}`
                }`}
              >
                <div className={`h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "border-current bg-current" : "border-gray-400"}`}>
                  {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                </div>
                {opt.label}
              </button>
            );
          })}
        </div>
      );

    case "dropdown":
      return (
        <select
          value={value}
          onChange={(e) => onChange(JSON.stringify([e.target.value]))}
          className={inputClass}
        >
          <option value="">{field.placeholder ?? "Select an option..."}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );

    case "rating":
      const ratingVal = parseInt(value) || 0;
      return (
        <div className="flex gap-2">
          {Array.from({ length: maxRating }).map((_, i) => (
            <button
              key={i}
              onClick={() => onChange(String(i + 1))}
              className="text-2xl transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${i < ratingVal ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
              />
            </button>
          ))}
        </div>
      );

    default:
      return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} placeholder={field.placeholder ?? ""} />;
  }
}

export default function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const startTimeRef = useRef(Date.now());
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const { data: form, isLoading, error } = trpc.public.getFormBySlug.useQuery({ slug });

  const submitMutation = trpc.public.submitResponse.useMutation({
    onSuccess: () => {
      const completionTime = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (form?.redirectUrl) {
        window.location.href = form.redirectUrl;
      } else {
        router.push(`/f/${slug}/success?msg=${encodeURIComponent(form?.successMessage ?? "Thank you for your response!")}`);
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const theme = getTheme(form?.themeId ?? "minimal");

  const validate = () => {
    const newErrors: Record<string, string> = {};
    for (const field of form?.fields ?? []) {
      if (field.required) {
        const val = answers[field.id];
        if (!val || val.trim() === "" || val === "[]" || val === "false") {
          newErrors[field.id] = "This field is required";
        }
      }
      if (field.type === "email" && answers[field.id]) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers[field.id]!)) {
          newErrors[field.id] = "Please enter a valid email address";
        }
      }
    }
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors before submitting");
      return;
    }
    const completionTime = Math.round((Date.now() - startTimeRef.current) / 1000);
    submitMutation.mutate({
      formId: form!.id,
      answers: Object.entries(answers)
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([fieldId, value]) => ({ fieldId, value })),
      completionTime,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Form not found</h2>
          <p className="text-gray-500 text-sm">
            {error?.message ?? "This form doesn't exist or has been removed."}
          </p>
        </div>
      </div>
    );
  }

  const fields = form.fields ?? [];
  const totalFields = fields.length;
  const answeredFields = Object.keys(answers).filter((k) => answers[k] && answers[k] !== "[]").length;
  const progressPercent = totalFields > 0 ? Math.round((answeredFields / totalFields) * 100) : 0;

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.fontFamily ?? ""} py-12 px-4`}>
      <div className="max-w-2xl mx-auto">
        {/* Form header */}
        <div className={`rounded-2xl border ${theme.card} p-8 mb-6 shadow-lg`}>
          <h1 className={`text-2xl font-extrabold ${theme.text} mb-2`}>{form.title}</h1>
          {form.description && (
            <p className={`text-sm ${theme.muted} leading-relaxed`}>{form.description}</p>
          )}
          {/* Progress bar */}
          {form.showProgressBar && totalFields > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-xs mb-2">
                <span className={theme.muted}>{answeredFields} of {totalFields} answered</span>
                <span className={theme.muted}>{progressPercent}%</span>
              </div>
              <div className={`h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${theme.progress}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Fields */}
        <div className="space-y-5">
          {fields.map((field) => (
            <div key={field.id} className={`rounded-2xl border ${theme.card} p-6 shadow-sm`}>
              <label className={`block text-sm font-semibold ${theme.text} mb-1`}>
                {field.label}
                {field.required && <span className="text-lime-500 ml-1">*</span>}
              </label>
              {field.description && (
                <p className={`text-xs ${theme.muted} mb-3 leading-relaxed`}>{field.description}</p>
              )}
              <FieldInput
                field={field}
                value={answers[field.id] ?? ""}
                onChange={(v) => {
                  setAnswers((prev) => ({ ...prev, [field.id]: v }));
                  if (errors[field.id]) {
                    setErrors((prev) => { const n = { ...prev }; delete n[field.id]; return n; });
                  }
                }}
                theme={theme}
                error={errors[field.id]}
              />
              {errors[field.id] && (
                <div className="flex items-center gap-1.5 mt-2">
                  <AlertCircle className="h-3.5 w-3.5 text-lime-500" />
                  <p className="text-xs text-lime-500">{errors[field.id]}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit */}
        {fields.length > 0 && (
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className={`w-full rounded-xl py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${theme.button} disabled:opacity-50`}
            >
              {submitMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Response
            </button>
          </div>
        )}

        {fields.length === 0 && (
          <div className={`rounded-2xl border ${theme.card} p-12 text-center`}>
            <p className={`${theme.muted} text-sm`}>This form has no fields yet.</p>
          </div>
        )}

        {/* Footer branding */}
        <p className={`text-center text-xs ${theme.muted} mt-8`}>
          Powered by{" "}
          <a href="/" className={`${theme.accent} font-medium hover:underline`}>
            🍵 ChaiForms
          </a>
        </p>
      </div>
    </div>
  );
}
