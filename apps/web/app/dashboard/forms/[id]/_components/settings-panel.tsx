"use client";

import { Check, Calendar } from "lucide-react";
import { toast } from "sonner";
import { type FormShape, type UpdateFormData } from "../_types";

function toLocalDatetimeInput(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface SettingsPanelProps {
  form: FormShape;
  onUpdate: (data: UpdateFormData) => void;
  formPassword: string;
  setFormPassword: (v: string) => void;
  isPublished: boolean;
}

export function SettingsPanel({
  form,
  onUpdate,
  formPassword,
  setFormPassword,
  isPublished,
}: SettingsPanelProps) {
  return (
    <div className="p-4 space-y-5">
      {/* Title */}
      <div>
        <label className="block text-xs font-black text-[#888] uppercase tracking-widest mb-2">
          &gt; Form Title
        </label>
        <input
          type="text"
          defaultValue={form.title}
          onBlur={(e) => onUpdate({ title: e.target.value })}
          className="w-full px-3 py-2 text-xs font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
          style={{ border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-black text-[#888] uppercase tracking-widest mb-2">
          &gt; Description
        </label>
        <textarea
          defaultValue={form.description ?? ""}
          onBlur={(e) => onUpdate({ description: e.target.value })}
          className="w-full border border-[#ccc] bg-white px-3 py-2 text-xs text-[#1a1a1a] font-mono focus:border-[#cc0000] focus:outline-none resize-none"
          rows={3}
        />
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-xs font-black text-[#888] uppercase tracking-widest mb-2">
          &gt; Visibility
        </label>
        <select
          defaultValue={form.visibility}
          onChange={(e) =>
            onUpdate({ visibility: e.target.value as "public" | "unlisted" })
          }
          className="w-full px-3 py-2 text-xs font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
          style={{ border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}
        >
          <option value="public">Public (searchable)</option>
          <option value="unlisted">Unlisted (link only)</option>
        </select>
      </div>

      {/* Custom slug */}
      <div>
        <label className="block text-xs font-black text-[#888] uppercase tracking-widest mb-2">
          &gt; Custom Slug
        </label>
        <input
          type="text"
          defaultValue={form.slug ?? ""}
          onBlur={(e) => { if (e.target.value) onUpdate({ slug: e.target.value }); }}
          className="w-full px-3 py-2 text-xs font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
          style={{ border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}
          placeholder="my-custom-slug"
        />
        {form.slug && (
          <p className="text-xs text-[#888] mt-1 font-mono truncate">/f/{form.slug}</p>
        )}
      </div>

      {/* Success message */}
      <div>
        <label className="block text-xs font-black text-[#888] uppercase tracking-widest mb-2">
          &gt; Success Message
        </label>
        <textarea
          defaultValue={form.successMessage ?? "Thank you for your response!"}
          onBlur={(e) => onUpdate({ successMessage: e.target.value })}
          className="w-full border border-[#ccc] bg-white px-3 py-2 text-xs text-[#1a1a1a] font-mono focus:border-[#cc0000] focus:outline-none resize-none"
          rows={2}
        />
      </div>

      {/* Max responses */}
      <div>
        <label className="block text-xs font-black text-[#888] uppercase tracking-widest mb-2">
          &gt; Max Responses
        </label>
        <input
          type="number"
          defaultValue={form.maxResponses ?? ""}
          onBlur={(e) =>
            onUpdate({ maxResponses: e.target.value ? parseInt(e.target.value) : null })
          }
          className="w-full px-3 py-2 text-xs font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
          style={{ border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}
          placeholder="Unlimited"
          min={1}
        />
      </div>

      {/* Show progress bar */}
      <div className="flex items-center justify-between border border-[#ddd] px-3 py-2.5">
        <span className="text-xs text-[#555] font-mono uppercase tracking-wider">Show progress bar</span>
        <button
          onClick={() => onUpdate({ showProgressBar: !form.showProgressBar })}
          className={`relative h-5 w-9 transition-colors ${
            form.showProgressBar ? "bg-[#cc0000]" : "bg-[#fff0f0]"
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 bg-white shadow transition-transform ${
              form.showProgressBar ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* Email on new response */}
      <div className="flex items-center justify-between border border-[#ddd] px-3 py-2.5">
        <div>
          <span className="text-xs text-[#555] font-mono uppercase tracking-wider">
            Email on new response
          </span>
          <p className="text-xs text-[#888] font-mono mt-0.5">Get notified when someone submits</p>
        </div>
        <button
          onClick={() => onUpdate({ notifyOnResponse: !form.notifyOnResponse })}
          className={`relative h-5 w-9 transition-colors flex-shrink-0 ${
            form.notifyOnResponse ? "bg-[#00a86b]" : "bg-[#e0e0e0]"
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 bg-white shadow transition-transform ${
              form.notifyOnResponse ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* Password protection */}
      <div className="border border-[#ddd] p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-[#888] uppercase tracking-widest">
              &gt; Password Protection
            </span>
            <p className="text-xs text-[#888] font-mono mt-0.5">
              Require a password to fill this form
            </p>
          </div>
          <button
            onClick={() =>
              onUpdate({
                requiresPassword: !form.requiresPassword,
                ...(form.requiresPassword ? { password: "" } : {}),
              })
            }
            className={`relative h-5 w-9 transition-colors flex-shrink-0 ${
              form.requiresPassword ? "bg-[#1565c0]" : "bg-[#e0e0e0]"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 bg-white shadow transition-transform ${
                form.requiresPassword ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
        {form.requiresPassword && (
          <div>
            <label className="block text-xs font-black text-[#888] uppercase tracking-widest mb-1.5">
              &gt; Set Password
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#1565c0]"
                style={{ border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}
                placeholder="New password..."
              />
              <button
                onClick={() => {
                  if (!formPassword) return;
                  onUpdate({ requiresPassword: true, password: formPassword });
                  setFormPassword("");
                }}
                disabled={!formPassword}
                className="px-3 py-2 text-xs font-black text-white bg-[#1565c0] disabled:opacity-40 hover:bg-[#0d47a1] transition-colors"
                style={{ border: "2px solid #000" }}
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-[#888] font-mono mt-1.5">
              Password is hashed &amp; stored securely. Leave blank to keep current.
            </p>
          </div>
        )}
      </div>

      {/* Published link */}
      {isPublished && form.slug && (
        <div className="p-4" style={{ border: "2px solid #00a86b", background: "#e8f5e9" }}>
          <p className="text-xs font-bangers text-[#00a86b] mb-2 tracking-widest">● PUBLISHED!</p>
          <p className="text-xs text-[#555] font-bold break-all">
            {typeof window !== "undefined" ? window.location.origin : ""}/f/{form.slug}
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/f/${form.slug}`);
              toast.success("Link copied!");
            }}
            className="mt-2 text-xs text-[#00a86b] font-black hover:text-[#006b44] tracking-wider uppercase"
          >
            COPY LINK
          </button>
        </div>
      )}

      {/* Multi-page */}
      <div className="border border-[#ddd] p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-[#888] uppercase tracking-widest">
              &gt; Multi-Page Form
            </span>
            <p className="text-xs text-[#888] font-mono mt-0.5">
              Split questions across multiple pages
            </p>
          </div>
          <button
            onClick={() =>
              onUpdate({
                isMultiPage: !form.isMultiPage,
                totalPages: form.isMultiPage ? 1 : Math.max(2, form.totalPages ?? 2),
              })
            }
            className={`relative h-5 w-9 transition-colors flex-shrink-0 ${
              form.isMultiPage ? "bg-[#7b1fa2]" : "bg-[#e0e0e0]"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 bg-white shadow transition-transform ${
                form.isMultiPage ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
        {form.isMultiPage && (
          <div>
            <label className="block text-xs font-black text-[#888] uppercase tracking-widest mb-1.5">
              &gt; Number of Pages
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const cur = form.totalPages ?? 2;
                  if (cur > 2) onUpdate({ totalPages: cur - 1 });
                }}
                className="w-8 h-8 flex items-center justify-center text-sm font-black bg-white hover:bg-[#fffde7]"
                style={{ border: "2px solid #000" }}
                disabled={(form.totalPages ?? 2) <= 2}
              >
                −
              </button>
              <span className="text-sm font-black text-[#1a1a1a] w-8 text-center">
                {form.totalPages ?? 2}
              </span>
              <button
                onClick={() => {
                  const cur = form.totalPages ?? 2;
                  if (cur < 10) onUpdate({ totalPages: cur + 1 });
                }}
                className="w-8 h-8 flex items-center justify-center text-sm font-black bg-white hover:bg-[#fffde7]"
                style={{ border: "2px solid #000" }}
              >
                +
              </button>
              <span className="text-xs text-[#888] font-mono">pages</span>
            </div>
            <p className="text-xs text-[#888] font-mono mt-1.5">
              Assign fields to pages in the Field Editor.
            </p>
          </div>
        )}
      </div>

      {/* Scheduling */}
      <div className="border border-[#ddd] p-3 space-y-3">
        <p className="text-xs font-black text-[#888] uppercase tracking-widest">&gt; Schedule</p>
        <div>
          <label className="block text-xs font-bold text-[#555] uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Opens At
          </label>
          <input
            type="datetime-local"
            defaultValue={toLocalDatetimeInput(form.opensAt)}
            onBlur={(e) =>
              onUpdate({ opensAt: e.target.value ? new Date(e.target.value) : null })
            }
            className="w-full px-3 py-2 text-xs font-bold text-[#1a1a1a] bg-white focus:outline-none"
            style={{ border: "2px solid #000" }}
          />
          <p className="text-xs text-[#888] font-mono mt-1">
            Leave empty to open immediately when published
          </p>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#555] uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Closes At
          </label>
          <input
            type="datetime-local"
            defaultValue={toLocalDatetimeInput(form.expiresAt)}
            onBlur={(e) =>
              onUpdate({ expiresAt: e.target.value ? new Date(e.target.value) : null })
            }
            className="w-full px-3 py-2 text-xs font-bold text-[#1a1a1a] bg-white focus:outline-none"
            style={{ border: "2px solid #000" }}
          />
          <p className="text-xs text-[#888] font-mono mt-1">Leave empty to never auto-close</p>
        </div>
      </div>
    </div>
  );
}
