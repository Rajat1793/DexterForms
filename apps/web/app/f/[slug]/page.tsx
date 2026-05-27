"use client";

import { use, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Loader2, Star, Check, AlertCircle, Lock } from "lucide-react";
import { MascotStickers, RandomMascot } from "~/components/ui/mascot-stickers";

type FormField = {
  id: string; type: string; label: string; placeholder: string | null;
  description: string | null; required: boolean | null; order: number;
  page: number | null;
  options: unknown; settings: unknown; validations: unknown; conditionalLogic: unknown;
};

type ConditionalRule = { fieldId: string; operator: string; value: string };
type ConditionalLogic = { showIf: ConditionalRule[] };

function evaluateConditions(field: FormField, answers: Record<string, string>): boolean {
  const logic = field.conditionalLogic as ConditionalLogic | null | undefined;
  if (!logic?.showIf?.length) return true;
  return logic.showIf.every((rule) => {
    const answer = answers[rule.fieldId] ?? "";
    switch (rule.operator) {
      case "eq": return answer === rule.value;
      case "neq": return answer !== rule.value;
      case "contains": return answer.toLowerCase().includes(rule.value.toLowerCase());
      case "is_empty": return !answer || answer === "[]" || answer === "false";
      case "is_not_empty": return !!answer && answer !== "[]" && answer !== "false";
      default: return true;
    }
  });
}

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
      return <input type={field.type === "url" ? "url" : "text"}
        value={value} onChange={(e) => onChange(e.target.value)}
        className={baseClass} style={inputStyle} placeholder={field.placeholder ?? ""} />;

    case "phone":
      return (
        <div>
          <input
            type="tel"
            value={value}
            onChange={(e) => {
              // Only allow digits, spaces, +, -, (, )
              const cleaned = e.target.value.replace(/[^\d\s+\-()]/g, "");
              onChange(cleaned);
            }}
            maxLength={15}
            className={baseClass} style={inputStyle}
            placeholder={field.placeholder ?? "10-digit number"}
          />
          <p className="text-xs text-[#888] mt-1 font-mono">Digits only · 10 digits required</p>
        </div>
      );

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
  const [currentPage, setCurrentPage] = useState(1);
  const [passwordUnlocked, setPasswordUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { data: form, isLoading, error } = trpc.public.getFormBySlug.useQuery({ slug });

  const verifyPasswordMutation = trpc.public.verifyFormPassword.useMutation({
    onSuccess: (data) => {
      if (data.valid) {
        setPasswordUnlocked(true);
        setPasswordError("");
      } else {
        setPasswordError("Incorrect password. Please try again.");
      }
    },
    onError: (e) => setPasswordError(e.message),
  });

  const submitMutation = trpc.public.submitResponse.useMutation({
    onSuccess: () => {
      // Prevent duplicate submissions for this anonymous user
      if (form?.id) localStorage.setItem(`submitted_form_${form.id}`, "1");
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

  const validate = (fieldsToCheck: typeof visibleFields = visibleFields) => {
    const newErrors: Record<string, string> = {};
    for (const field of fieldsToCheck) {
      const val = answers[field.id];

      if (field.required) {
        if (!val || val.trim() === "" || val === "[]" || val === "false") {
          newErrors[field.id] = "This field is required ⚠";
          continue;
        }
      }

      if (!val || val.trim() === "") continue;

      if (field.type === "email") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          newErrors[field.id] = "Please enter a valid email address";
        }
      }

      if (field.type === "phone") {
        const digits = val.replace(/\D/g, "");
        if (digits.length !== 10) {
          newErrors[field.id] = "Phone number must be exactly 10 digits";
        }
      }

      if (field.type === "url") {
        try {
          new URL(val.startsWith("http") ? val : `https://${val}`);
        } catch {
          newErrors[field.id] = "Please enter a valid URL";
        }
      }

      if (field.type === "number") {
        if (isNaN(Number(val))) {
          newErrors[field.id] = "Please enter a valid number";
        }
      }

      // Enforce field-level validations from the schema (minLength, maxLength, min, max, pattern)
      const v = field.validations as Record<string, unknown> | null;
      if (v) {
        if (field.type === "number" && !isNaN(Number(val))) {
          if (v.min !== undefined && Number(val) < Number(v.min))
            newErrors[field.id] = `Minimum value is ${v.min}`;
          if (v.max !== undefined && Number(val) > Number(v.max))
            newErrors[field.id] = `Maximum value is ${v.max}`;
        } else if (field.type !== "number") {
          if (v.minLength !== undefined && val.length < Number(v.minLength))
            newErrors[field.id] = `Minimum ${v.minLength} characters required`;
          if (v.maxLength !== undefined && val.length > Number(v.maxLength))
            newErrors[field.id] = `Maximum ${v.maxLength} characters allowed`;
        }
        if (v.pattern && typeof v.pattern === "string") {
          try {
            if (!new RegExp(v.pattern).test(val))
              newErrors[field.id] = (v.patternMessage as string) ?? "Invalid format";
          } catch { /* ignore bad regex */ }
        }
      }
    }
    return newErrors;
  };

  const handleNextPage = () => {
    const validationErrors = validate(visibleFields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors before continuing");
      return;
    }
    setErrors({});
    setCurrentPage((p) => p + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    // Prevent duplicate submissions from the same anonymous browser session
    if (form?.id && localStorage.getItem(`submitted_form_${form.id}`)) {
      toast.error("You have already submitted this form.");
      return;
    }
    const validationErrors = validate(allVisibleFields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors before submitting");
      return;
    }
    const completionTime = Math.round((Date.now() - startTimeRef.current) / 1000);

    // Auto-populate respondent info from submitted field values
    const emailField = form?.fields.find((f) => f.type === "email");
    const nameField = form?.fields.find(
      (f) => f.type === "short_text" && /name/i.test(f.label)
    );

    submitMutation.mutate({
      formId: form!.id,
      answers: Object.entries(answers)
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([fieldId, value]) => ({ fieldId, value })),
      completionTime,
      respondentEmail: emailField ? answers[emailField.id] : undefined,
      respondentName: nameField ? answers[nameField.id] : undefined,
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
  const isMultiPage = !!(form as any).isMultiPage && ((form as any).totalPages ?? 1) > 1;
  const totalPages = isMultiPage ? ((form as any).totalPages ?? 1) : 1;
  const isLastPage = currentPage >= totalPages;

  // All fields passing conditional logic
  const allVisibleFields = fields.filter((f) => evaluateConditions(f, answers));
  // On multi-page forms, only show current page's fields; all on single-page
  const visibleFields = isMultiPage
    ? allVisibleFields.filter((f) => (f.page ?? 1) === currentPage)
    : allVisibleFields;

  // Progress is based on all visible fields across all pages
  const totalFields = allVisibleFields.length;
  const answeredFields = allVisibleFields.filter((f) => {
    const v = answers[f.id];
    return v && v !== "[]" && v !== "false";
  }).length;
  const progressPercent = totalFields > 0 ? Math.round((answeredFields / totalFields) * 100) : 0;

  return (
    <div className="relative min-h-screen bg-polka-yellow py-10 px-4 overflow-x-hidden">
      <MascotStickers count={3} />
      <div className="checker-strip fixed top-0 left-0 right-0 z-10" />

      {/* Password Gate */}
      {form.requiresPassword && !passwordUnlocked && (
        <div className="fixed inset-0 bg-polka-yellow flex items-center justify-center z-50 px-4">
          <div className="checker-strip fixed top-0 left-0 right-0 z-10" />
          <div className="cartoon-card bg-white p-8 max-w-sm w-full text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="font-bangers text-2xl text-[#1a1a1a] tracking-wide mb-2">PASSWORD REQUIRED!</h2>
            <p className="text-[#555] text-sm font-bold mb-6">This form is password protected. Enter the password to access it.</p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(""); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && passwordInput)
                  verifyPasswordMutation.mutate({ slug, password: passwordInput });
              }}
              className="w-full px-4 py-3 text-sm font-bold text-[#1a1a1a] bg-white focus:outline-none mb-3"
              style={{ border: "3px solid #000", boxShadow: "2px 2px 0 #000" }}
              placeholder="Enter password..."
              autoFocus
            />
            {passwordError && (
              <p className="text-xs text-[#cc0000] font-bold mb-3">⚠️ {passwordError}</p>
            )}
            <button
              onClick={() => verifyPasswordMutation.mutate({ slug, password: passwordInput })}
              disabled={!passwordInput || verifyPasswordMutation.isPending}
              className="cartoon-btn w-full font-bangers text-xl tracking-wider py-3 text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: accentColor }}
            >
              {verifyPasswordMutation.isPending ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> CHECKING...</>
              ) : (
                <><Lock className="h-5 w-5" /> UNLOCK!</>
              )}
            </button>
          </div>
          <div className="checker-strip fixed bottom-0 left-0 right-0 z-10" />
        </div>
      )}

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
              <RandomMascot width={100} height={100} className="drop-shadow-lg" />
            </div>
          </div>
          {/* Progress bar */}
          {form.showProgressBar && totalFields > 0 && (
            <div className="px-8 py-4" style={{ borderBottom: "2px solid #eee" }}>
              <div className="flex justify-between text-xs font-bold text-[#888] mb-2">
                <span>
                  {isMultiPage ? `Page ${currentPage} of ${totalPages}` : `${answeredFields} of ${totalFields} answered`}
                </span>
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
          {visibleFields.map((field, idx) => (
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

        {/* Navigation / Submit */}
        {visibleFields.length > 0 && (
          <div className="mt-6 flex gap-3">
            {isMultiPage && currentPage > 1 && (
              <button
                onClick={() => { setCurrentPage((p) => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="cartoon-btn flex-1 font-bangers text-xl tracking-wider py-4 bg-white text-[#1a1a1a] border-[3px] border-[#000]"
              >
                ← BACK
              </button>
            )}
            {isMultiPage && !isLastPage ? (
              <button
                onClick={handleNextPage}
                className="cartoon-btn flex-1 font-bangers text-xl tracking-wider py-4 text-white"
                style={{ background: accentColor }}
              >
                NEXT PAGE →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={submitMutation.isPending}
                className="cartoon-btn flex-1 font-bangers text-2xl tracking-wider py-4 flex items-center justify-center gap-2 text-white disabled:opacity-60"
                style={{ background: accentColor }}>
                {submitMutation.isPending ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> SUBMITTING...</>
                ) : "🚀 SUBMIT RESPONSE!"}
              </button>
            )}
          </div>
        )}

        {visibleFields.length === 0 && (
          <div className="cartoon-card bg-white p-12 text-center">
            <p className="font-bold text-[#888] text-sm">This form has no fields yet.</p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs font-bold text-[#888] mt-8">
          Powered by{" "}
          <a href="/" className="text-[#cc0000] hover:underline font-black">🍵 DexterForms</a>
        </p>
      </div>

      <div className="checker-strip fixed bottom-0 left-0 right-0 z-10" />
    </div>
  );
}
