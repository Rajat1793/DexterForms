"use client";

import { use, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Loader2, Star, Check, AlertCircle } from "lucide-react";

const MASCOT_IMAGES = [
  "/dexter1.png", "/dexter2.png", "/dee-dee.jpg", "/dexter-flask.jpg",
  "/dexter-pose.png", "/dexter-deedee.png", "/dexter-face.jpeg", "/dexter-lab.jpeg",
];

type FormField = {
  id: string; type: string; label: string; placeholder: string | null;
  description: string | null; required: boolean | null; order: number;
  options: unknown; settings: unknown; validations: unknown; conditionalLogic: unknown;
};

function getTheme(themeId: string | null) {
  const ACCENT_COLORS: Record<string, string> = {
    dexter: "#cc0000", minimal: "#7c3aed", dark: "#7c3aed", matrix: "#22c55e",
    sakura: "#db2777", cyberpunk: "#facc15", ocean: "#0284c7", nebula: "#9333ea",
    retro: "#f97316", dracula: "#9333ea", naruto: "#f97316", midnight: "#eab308",
    startup: "#059669",
  };
  return ACCENT_COLORS[themeId ?? "dexter"] ?? "#cc0000";
}

function FieldInput({
  field, value, onChange, accentColor, error,
}: {
  field: FormField; value: string; onChange: (v: string) => void; accentColor: string; error?: string;
}) {
  const options = (field.options as Array<{ value: string; label: string }>) ?? [];
  const maxRating = (field.settings as any)?.maxRating ?? 5;

  const inputStyle = {
    border: `3px solid ${error ? "#cc0000" : "#000"}`,
    boxShadow: "2px 2px 0 #000",
    outline: "none",
  };

  const baseClass = "w-full px-4 py-3 text-sm font-bold text-[#1a1a1a] bg-white focus:outline-none transition-all";

  switch (field.type) {
    case "short_text":
    case "url":
    case "phone":
      return <input type={field.type === "url" ? "url" : field.type === "phone" ? "tel" : "text"}
        value={value} onChange={(e) => onChange(e.target.value)}
        className={baseClass} style={inputStyle} placeholder={field.placeholder ?? ""} />;

    case "email":
      return <input type="email" value={value} onChange={(e) => onChange(e.target.value)}
        className={baseClass} style={inputStyle} placeholder={field.placeholder ?? "your@email.com"} />;

    case "number":
      return <input type="number" value={value} onChange={(e) => onChange(e.target.value)}
        className={baseClass} style={inputStyle} placeholder={field.placeholder ?? "0"} />;

    case "long_text":
      return <textarea value={value} onChange={(e) => onChange(e.target.value)}
        className={`${baseClass} resize-none`} style={inputStyle} rows={4}
        placeholder={field.placeholder ?? ""} />;

    case "date":
      return <input type="date" value={value} onChange={(e) => onChange(e.target.value)}
        className={baseClass} style={inputStyle} />;

    case "checkbox":
      return (
        <button onClick={() => onChange(value === "true" ? "false" : "true")}
          className="flex items-center gap-3 w-full p-4 text-left bg-white transition-all"
          style={{ border: `3px solid ${value === "true" ? accentColor : "#000"}`, boxShadow: "2px 2px 0 #000",
            background: value === "true" ? `${accentColor}15` : "white" }}>
          <div className="h-5 w-5 flex-shrink-0 flex items-center justify-center transition-all"
            style={{ border: `3px solid ${value === "true" ? accentColor : "#000"}`,
              background: value === "true" ? accentColor : "white" }}>
            {value === "true" && <Check className="h-3 w-3 text-white" />}
          </div>
          <span className="text-sm font-bold text-[#1a1a1a]">{field.placeholder ?? field.label}</span>
        </button>
      );

    case "single_select":
      return (
        <div className="space-y-2">
          {options.map((opt) => {
            const selected = value && JSON.parse(value || "[]").includes(opt.value);
            return (
              <button key={opt.value} onClick={() => onChange(JSON.stringify([opt.value]))}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-bold text-[#1a1a1a] bg-white transition-all"
                style={{ border: `3px solid ${selected ? accentColor : "#000"}`,
                  boxShadow: "2px 2px 0 #000",
                  background: selected ? `${accentColor}15` : "white" }}>
                <div className="h-4 w-4 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ border: `3px solid ${selected ? accentColor : "#aaa"}` }}>
                  {selected && <div className="h-2 w-2 rounded-full" style={{ background: accentColor }} />}
                </div>
                {opt.label}
              </button>
            );
          })}
        </div>
      );

    case "multi_select":
      return (
        <div className="space-y-2">
          {options.map((opt) => {
            const selected: string[] = (() => { try { return JSON.parse(value || "[]"); } catch { return []; } })();
            const isSelected = selected.includes(opt.value);
            return (
              <button key={opt.value}
                onClick={() => {
                  const next = isSelected ? selected.filter((v) => v !== opt.value) : [...selected, opt.value];
                  onChange(JSON.stringify(next));
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-bold text-[#1a1a1a] transition-all"
                style={{ border: `3px solid ${isSelected ? accentColor : "#000"}`,
                  boxShadow: "2px 2px 0 #000",
                  background: isSelected ? `${accentColor}15` : "white" }}>
                <div className="h-4 w-4 flex-shrink-0 flex items-center justify-center transition-all"
                  style={{ border: `3px solid ${isSelected ? accentColor : "#aaa"}`,
                    background: isSelected ? accentColor : "white" }}>
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
        <select value={value} onChange={(e) => onChange(JSON.stringify([e.target.value]))}
          className={baseClass} style={inputStyle}>
          <option value="">{field.placeholder ?? "Select an option..."}</option>
          {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      );

    case "rating":
      const ratingVal = parseInt(value) || 0;
      return (
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: maxRating }).map((_, i) => (
            <button key={i} onClick={() => onChange(String(i + 1))}
              className="transition-transform hover:scale-110 active:scale-95">
              <Star className={`h-8 w-8 transition-colors ${i < ratingVal ? "fill-yellow-400 text-yellow-400" : "text-[#ccc]"}`} />
            </button>
          ))}
        </div>
      );

    default:
      return <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        className={baseClass} style={inputStyle} placeholder={field.placeholder ?? ""} />;
  }
}

function getThemeId(themeId: string | null) {
  return themeId ?? "dexter";
}

const THEME_HEADER_COLORS: Record<string, string> = {
  dexter: "#cc0000", minimal: "#7c3aed", dark: "#1e1b4b", matrix: "#166534",
  sakura: "#be185d", cyberpunk: "#3730a3", ocean: "#0369a1", nebula: "#581c87",
  retro: "#c2410c", dracula: "#4c1d95", naruto: "#c2410c", midnight: "#1c1917",
  startup: "#065f46",
};

export default function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const startTimeRef = useRef(Date.now());
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mascot] = useState<string>(() => MASCOT_IMAGES[Math.floor(Math.random() * MASCOT_IMAGES.length)]!);

  const { data: form, isLoading, error } = trpc.public.getFormBySlug.useQuery({ slug });

  const submitMutation = trpc.public.submitResponse.useMutation({
    onSuccess: () => {
      if (form?.redirectUrl) {
        window.location.href = form.redirectUrl;
      } else {
        router.push(`/f/${slug}/success?msg=${encodeURIComponent(form?.successMessage ?? "Thank you for your response!")}`);
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const accentColor = getTheme(form?.themeId ?? null);
  const headerColor = THEME_HEADER_COLORS[getThemeId(form?.themeId ?? null)] ?? "#cc0000";

  const validate = () => {
    const newErrors: Record<string, string> = {};
    for (const field of form?.fields ?? []) {
      if (field.required) {
        const val = answers[field.id];
        if (!val || val.trim() === "" || val === "[]" || val === "false") {
          newErrors[field.id] = "This field is required ⚠";
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
      <div className="min-h-screen flex items-center justify-center bg-polka-yellow">
        <div className="cartoon-card bg-white p-10 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#cc0000] mx-auto mb-3" />
          <p className="font-bangers text-xl text-[#1a1a1a] tracking-wider">LOADING EXPERIMENT...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-polka-yellow">
        <div className="cartoon-card bg-white p-10 text-center max-w-sm">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="font-bangers text-2xl text-[#1a1a1a] tracking-wide mb-2">FORM NOT FOUND!</h2>
          <p className="text-[#555] text-sm font-bold">
            {error?.message ?? "This form doesn't exist or has been removed."}
          </p>
        </div>
      </div>
    );
  }

  const fields = form.fields ?? [];
  const totalFields = fields.length;
  const answeredFields = Object.keys(answers).filter((k) => answers[k] && answers[k] !== "[]" && answers[k] !== "false").length;
  const progressPercent = totalFields > 0 ? Math.round((answeredFields / totalFields) * 100) : 0;

  return (
    <div className="min-h-screen bg-polka-yellow py-10 px-4">
      <div className="checker-strip fixed top-0 left-0 right-0 z-10" />

      <div className="max-w-2xl mx-auto pt-6 pb-16">
        {/* Form header card */}
        <div className="cartoon-card bg-white mb-6 overflow-hidden">
          <div className="relative px-8 py-6" style={{ background: headerColor, borderBottom: "3px solid #000" }}>
            <div className="pr-28">
              <h1 className="font-bangers text-white tracking-widest leading-tight"
                style={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)" }}>
                {form.title}
              </h1>
              {form.description && (
                <p className="text-white/80 text-sm font-bold mt-2 leading-relaxed">{form.description}</p>
              )}
            </div>
            <div className="absolute -bottom-2 right-4 pointer-events-none">
              <Image src={mascot} alt="" width={100} height={100} className="object-contain drop-shadow-lg" />
            </div>
          </div>
          {/* Progress bar */}
          {form.showProgressBar && totalFields > 0 && (
            <div className="px-8 py-4" style={{ borderBottom: "2px solid #eee" }}>
              <div className="flex justify-between text-xs font-bold text-[#888] mb-2">
                <span>{answeredFields} of {totalFields} answered</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-3 bg-[#eee]" style={{ border: "2px solid #000" }}>
                <div className="h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%`, background: accentColor }} />
              </div>
            </div>
          )}
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {fields.map((field, idx) => (
            <div key={field.id} className="cartoon-card bg-white overflow-hidden">
              <div className="h-1" style={{ background: accentColor }} />
              <div className="p-6">
                <label className="block text-sm font-black text-[#1a1a1a] mb-1 uppercase tracking-wide">
                  <span className="text-[#aaa] mr-2 font-bangers text-base">{String(idx + 1).padStart(2, "0")}.</span>
                  {field.label}
                  {field.required && <span className="ml-1" style={{ color: accentColor }}>*</span>}
                </label>
                {field.description && (
                  <p className="text-xs text-[#888] font-bold mb-3 leading-relaxed">{field.description}</p>
                )}
                <FieldInput
                  field={field}
                  value={answers[field.id] ?? ""}
                  onChange={(v) => {
                    setAnswers((prev) => ({ ...prev, [field.id]: v }));
                    if (errors[field.id]) setErrors((prev) => { const n = { ...prev }; delete n[field.id]; return n; });
                  }}
                  accentColor={accentColor}
                  error={errors[field.id]}
                />
                {errors[field.id] && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <AlertCircle className="h-3.5 w-3.5 text-[#cc0000]" />
                    <p className="text-xs font-bold text-[#cc0000]">{errors[field.id]}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        {fields.length > 0 && (
          <div className="mt-6">
            <button onClick={handleSubmit} disabled={submitMutation.isPending}
              className="cartoon-btn w-full font-bangers text-2xl tracking-wider py-4 flex items-center justify-center gap-2 text-white disabled:opacity-60"
              style={{ background: accentColor }}>
              {submitMutation.isPending ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> SUBMITTING...</>
              ) : "🚀 SUBMIT RESPONSE!"}
            </button>
          </div>
        )}

        {fields.length === 0 && (
          <div className="cartoon-card bg-white p-12 text-center">
            <p className="font-bold text-[#888] text-sm">This form has no fields yet.</p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs font-bold text-[#888] mt-8">
          Powered by{" "}
          <a href="/" className="text-[#cc0000] hover:underline font-black">🍵 ChaiForms</a>
        </p>
      </div>

      <div className="checker-strip fixed bottom-0 left-0 right-0 z-10" />
    </div>
  );
}
