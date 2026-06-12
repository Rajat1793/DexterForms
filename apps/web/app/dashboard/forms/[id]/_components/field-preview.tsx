"use client";

import { ChevronDown } from "lucide-react";
import { type Field } from "../_types";

export function FieldPreview({ field }: { field: Field }) {
  const options = (field.options as Array<{ value: string; label: string }>) ?? [];
  const maxRating = (field.settings as { maxRating?: number } | null)?.maxRating ?? 5;

  switch (field.type) {
    case "long_text":
      return (
        <div className="w-full h-16 border border-[#ccc] bg-white px-3 py-2 text-xs text-[#888] font-mono">
          {field.placeholder ?? "Your answer..."}
        </div>
      );

    case "single_select":
    case "multi_select":
      return (
        <div className="space-y-1.5">
          {(options.length > 0
            ? options
            : [{ value: "opt1", label: "Option 1" }, { value: "opt2", label: "Option 2" }]
          ).map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <div
                className={`h-3.5 w-3.5 border border-[#bbb] ${
                  field.type === "multi_select" ? "" : "rounded-full"
                }`}
              />
              <span className="text-xs text-[#888] font-mono">{opt.label}</span>
            </div>
          ))}
        </div>
      );

    case "dropdown":
      return (
        <div className="w-full h-8 border border-[#ccc] bg-white px-3 flex items-center justify-between text-xs text-[#888] font-mono">
          <span>{field.placeholder ?? "Select..."}</span>
          <ChevronDown className="h-3 w-3" />
        </div>
      );

    case "checkbox":
      return (
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-3.5 border border-[#bbb]" />
          <span className="text-xs text-[#888] font-mono">{field.placeholder ?? field.label}</span>
        </div>
      );

    case "rating":
      return (
        <div className="flex gap-1">
          {Array.from({ length: maxRating }).map((_, i) => (
            <div
              key={i}
              className={`h-6 w-6 flex items-center justify-center text-sm ${
                i < 3 ? "text-yellow-500" : "text-[#ddd]"
              }`}
            >
              ★
            </div>
          ))}
        </div>
      );

    case "date":
      return (
        <div className="w-full h-8 px-3 flex items-center text-xs text-[#888] bg-white border-2 border-[#000] font-mono">
          mm/dd/yyyy
        </div>
      );

    default:
      return (
        <div className="w-full h-8 px-3 flex items-center text-xs text-[#888] bg-white border-2 border-[#000] font-mono">
          {field.placeholder ?? "Your answer"}
        </div>
      );
  }
}
