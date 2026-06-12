"use client";

import { Check } from "lucide-react";
import { THEMES, type UpdateFormData } from "../_types";

interface ThemePanelProps {
  currentThemeId: string | null;
  onUpdate: (data: UpdateFormData) => void;
}

export function ThemePanel({ currentThemeId, onUpdate }: ThemePanelProps) {
  return (
    <div className="p-4">
      <p className="text-xs font-black text-[#555] uppercase tracking-widest mb-3">
        &gt; CHOOSE THEME
      </p>
      <div className="space-y-1.5">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onUpdate({ themeId: theme.id })}
            className={`flex items-center gap-2.5 w-full px-3 py-2 text-left transition-all ${
              currentThemeId === theme.id
                ? "bg-[#fff9c4] border-[#cc0000]"
                : "hover:bg-[#fffde7] border-transparent"
            }`}
            style={{
              border: `2px solid ${currentThemeId === theme.id ? "#cc0000" : "#ddd"}`,
            }}
          >
            <div
              className="h-5 w-5 flex-shrink-0"
              style={{ background: theme.color, border: "2px solid #000" }}
            />
            <span className="text-sm">{theme.emoji}</span>
            <span className="flex-1 text-xs font-black text-[#1a1a1a] tracking-wide">
              {theme.name}
            </span>
            {currentThemeId === theme.id && (
              <Check className="h-3.5 w-3.5 text-[#cc0000] flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
