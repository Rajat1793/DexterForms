"use client";

import { useEffect } from "react";
import { Trash2, X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmModal({
  open,
  title = "ARE YOU SURE?",
  message,
  confirmLabel = "DELETE!",
  onConfirm,
  onCancel,
  danger = true,
}: ConfirmModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        className="bg-white w-full max-w-sm"
        style={{ border: "4px solid #000", boxShadow: "6px 6px 0 #000" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{
            background: danger ? "#cc0000" : "#1565c0",
            borderBottom: "3px solid #000",
          }}
        >
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-white" />
            <span className="font-bangers text-xl text-white tracking-widest">{title}</span>
          </div>
          <button onClick={onCancel} className="text-white/80 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="font-bold text-[#1a1a1a] text-sm leading-relaxed">{message}</p>
          <p className="text-xs text-[#888] font-bold mt-1">This action cannot be undone.</p>
        </div>

        {/* Actions */}
        <div
          className="flex items-center gap-3 px-6 py-4"
          style={{ borderTop: "2px solid #eee" }}
        >
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 font-bangers text-lg tracking-wider text-[#1a1a1a] bg-white transition-all hover:-translate-y-0.5"
            style={{ border: "3px solid #000", boxShadow: "3px 3px 0 #000" }}
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 font-bangers text-lg tracking-wider text-white transition-all hover:-translate-y-0.5 active:translate-y-0"
            style={{
              background: danger ? "#cc0000" : "#1565c0",
              border: "3px solid #000",
              boxShadow: "3px 3px 0 #000",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
