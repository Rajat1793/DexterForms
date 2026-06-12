"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Users,
  BarChart2,
  ExternalLink,
  QrCode,
  Code2,
  Copy,
  Loader2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { type FormShape, type UpdateFormData } from "../_types";

interface FormTopBarProps {
  form: FormShape;
  formId: string;
  onFormUpdate: (data: UpdateFormData) => void;
  isPublished: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
  publishPending: boolean;
  unpublishPending: boolean;
}

export function FormTopBar({
  form,
  formId,
  onFormUpdate,
  isPublished,
  onPublish,
  onUnpublish,
  publishPending,
  unpublishPending,
}: FormTopBarProps) {
  const [localTitle, setLocalTitle] = useState(form.title);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep title in sync when the form data refreshes (e.g. after invalidation)
  useEffect(() => {
    setLocalTitle(form.title);
  }, [form.id]);

  return (
    <div
      className="bg-white px-3 md:px-6 py-3 flex items-center gap-2 md:gap-4 flex-shrink-0"
      style={{ borderBottom: "4px solid #000", boxShadow: "0 4px 0 #000" }}
    >
      <Link
        href="/dashboard"
        className="text-[#cc0000] hover:text-[#aa0000] transition-colors flex-shrink-0"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      {/* Debounced title input */}
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={localTitle}
          onChange={(e) => {
            const v = e.target.value;
            setLocalTitle(v);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
              if (v.trim()) onFormUpdate({ title: v.trim() });
            }, 600);
          }}
          className="text-base font-bangers text-[#1a1a1a] bg-transparent border-none outline-none w-full tracking-wider uppercase placeholder:text-[#888]"
        />
      </div>

      <div className="flex items-center gap-1.5 md:gap-3">
        {/* Responses */}
        <Link
          href={`/dashboard/forms/${formId}/responses`}
          className="hidden sm:flex items-center gap-1.5 font-bold text-xs text-[#555] hover:text-[#cc0000] px-2 md:px-3 py-1.5 bg-white transition-colors"
          style={{ border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}
        >
          <Users className="h-4 w-4" />
          <span className="hidden md:inline">{form.responseCount ?? 0} RESPONSES</span>
          <span className="md:hidden">{form.responseCount ?? 0}</span>
        </Link>

        {/* Analytics */}
        <Link
          href={`/dashboard/forms/${formId}/analytics`}
          className="hidden sm:flex items-center gap-1.5 font-bold text-xs text-[#555] hover:text-[#cc0000] px-2 md:px-3 py-1.5 bg-white transition-colors"
          style={{ border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}
        >
          <BarChart2 className="h-4 w-4" />
          <span className="hidden md:inline">ANALYTICS</span>
        </Link>

        {/* View live */}
        {isPublished && form.slug && (
          <a
            href={`/f/${form.slug}`}
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 font-bold text-xs text-[#00a86b] hover:text-[#006b44] px-2 md:px-3 py-1.5 transition-colors"
            style={{ border: "2px solid #000", boxShadow: "2px 2px 0 #000", background: "#e8f5e9" }}
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden md:inline">VIEW LIVE</span>
          </a>
        )}

        {/* QR code */}
        {isPublished && form.slug && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="hidden sm:flex items-center gap-1.5 font-bold text-xs text-[#555] hover:text-[#1565c0] px-2 md:px-3 py-1.5 bg-white transition-colors"
                style={{ border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}
                title="Share QR code"
              >
                <QrCode className="h-4 w-4" />
                <span className="hidden md:inline">QR</span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-64 p-4"
              style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000" }}
            >
              <p className="font-bangers text-sm text-[#cc0000] tracking-widest mb-3 text-center">
                📱 SCAN TO FILL FORM
              </p>
              <div className="flex justify-center mb-3">
                <QRCodeSVG
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/f/${form.slug}`}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#1a1a1a"
                  level="M"
                />
              </div>
              <p className="text-xs font-mono text-[#555] text-center break-all">/f/{form.slug}</p>
            </PopoverContent>
          </Popover>
        )}

        {/* Embed */}
        {isPublished && form.slug && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="hidden sm:flex items-center gap-1.5 font-bold text-xs text-[#555] hover:text-[#7b1fa2] px-2 md:px-3 py-1.5 bg-white transition-colors"
                style={{ border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}
                title="Embed form"
              >
                <Code2 className="h-4 w-4" />
                <span className="hidden md:inline">EMBED</span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 p-4"
              style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000" }}
            >
              <p className="font-bangers text-sm text-[#7b1fa2] tracking-widest mb-3">
                &lt;/&gt; EMBED THIS FORM
              </p>
              <p className="text-xs text-[#555] font-mono mb-2">Copy this snippet into your HTML:</p>
              <div className="relative bg-[#1a1a1a] rounded p-3 mb-3">
                <pre className="text-xs text-[#aaffaa] font-mono whitespace-pre-wrap break-all leading-relaxed">
                  {`<iframe\n  src="${
                    typeof window !== "undefined"
                      ? window.location.origin
                      : "https://dexterforms-web.onrender.com"
                  }/f/${form.slug}"\n  width="100%"\n  height="600"\n  frameborder="0"\n  style="border:none"\n></iframe>`}
                </pre>
              </div>
              <button
                onClick={() => {
                  const code = `<iframe\n  src="${window.location.origin}/f/${form.slug}"\n  width="100%"\n  height="600"\n  frameborder="0"\n  style="border:none"\n></iframe>`;
                  navigator.clipboard.writeText(code);
                  toast.success("Embed code copied!");
                }}
                className="w-full py-2 text-xs font-black text-white bg-[#7b1fa2] hover:bg-[#6a1b9a] tracking-wider uppercase flex items-center justify-center gap-2"
                style={{ border: "2px solid #000" }}
              >
                <Copy className="h-3.5 w-3.5" /> COPY EMBED CODE
              </button>
            </PopoverContent>
          </Popover>
        )}

        {/* Publish / Unpublish */}
        {isPublished ? (
          <button
            onClick={onUnpublish}
            disabled={unpublishPending}
            className="cartoon-btn bg-white text-[#1a1a1a] font-bangers text-sm md:text-base px-3 md:px-4 py-1.5 tracking-wider"
          >
            UNPUBLISH
          </button>
        ) : (
          <button
            onClick={onPublish}
            disabled={publishPending}
            className="cartoon-btn bg-[#cc0000] text-white font-bangers text-sm md:text-base px-3 md:px-4 py-1.5 tracking-wider flex items-center gap-2"
          >
            {publishPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            PUBLISH!
          </button>
        )}
      </div>
    </div>
  );
}
