"use client";

import { useState, useEffect } from "react";
import { Plus, X, Layers } from "lucide-react";
import {
  type Field,
  type ConditionalRule,
  type ConditionalLogic,
  CONDITION_OPERATORS,
} from "../_types";

interface FieldEditorProps {
  field: Field;
  allFields: Field[];
  totalPages: number;
  /** Called on blur — persists to the API */
  onUpdate: (data: Partial<Field>) => void;
  /** Called on every keystroke — updates the live preview instantly, no API call */
  onPreview: (data: Partial<Field>) => void;
}

export function FieldEditor({ field, allFields, totalPages, onUpdate, onPreview }: FieldEditorProps) {
  const hasOptions = ["single_select", "multi_select", "dropdown"].includes(field.type);
  const options = (field.options as Array<{ value: string; label: string }>) ?? [];
  const logic: ConditionalLogic =
    (field.conditionalLogic as ConditionalLogic | null) ?? { showIf: [] };
  const otherFields = allFields.filter((f) => f.id !== field.id);

  // ─── Local state — saves only on blur, not on every keystroke ─────────────
  const [localLabel, setLocalLabel] = useState(field.label);
  const [localPlaceholder, setLocalPlaceholder] = useState(field.placeholder ?? "");
  const [localDescription, setLocalDescription] = useState(field.description ?? "");
  const [localOptionLabels, setLocalOptionLabels] = useState<string[]>(
    options.map((o) => o.label)
  );
  const [localRuleValues, setLocalRuleValues] = useState<string[]>(
    logic.showIf.map((r) => r.value)
  );

  // Sync when a different field is selected
  useEffect(() => {
    setLocalLabel(field.label);
    setLocalPlaceholder(field.placeholder ?? "");
    setLocalDescription(field.description ?? "");
  }, [field.id]);

  useEffect(() => {
    setLocalOptionLabels(options.map((o) => o.label));
  }, [field.id, options.length]);

  useEffect(() => {
    setLocalRuleValues(logic.showIf.map((r) => r.value));
  }, [field.id, logic.showIf.length]);

  // ─── Conditional logic helpers ────────────────────────────────────────────
  const addRule = () => {
    if (!otherFields.length) return;
    const newRule: ConditionalRule = { fieldId: otherFields[0]!.id, operator: "eq", value: "" };
    onUpdate({ conditionalLogic: { showIf: [...logic.showIf, newRule] } });
  };

  const updateRule = (idx: number, changes: Partial<ConditionalRule>) => {
    const updated = logic.showIf.map((r, i) => (i === idx ? { ...r, ...changes } : r));
    onUpdate({ conditionalLogic: { showIf: updated } });
  };

  const removeRule = (idx: number) =>
    onUpdate({ conditionalLogic: { showIf: logic.showIf.filter((_, i) => i !== idx) } });

  // ─── Options helpers ──────────────────────────────────────────────────────
  const addOption = () => {
    const n = options.length + 1;
    onUpdate({ options: [...options, { value: `option_${n}`, label: `Option ${n}` }] });
  };

  const commitOptionLabel = (idx: number, label: string) => {
    const updated = [...options];
    updated[idx] = { value: label.toLowerCase().replace(/\s+/g, "_"), label };
    onUpdate({ options: updated });
  };

  const removeOption = (idx: number) =>
    onUpdate({ options: options.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-5">
      {/* Label */}
      <div>
        <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-2">
          Label
        </label>
        <input
          type="text"
          value={localLabel}
          onChange={(e) => { setLocalLabel(e.target.value); onPreview({ label: e.target.value }); }}
          onBlur={() => {
            const trimmed = localLabel.trim();
            if (!trimmed) { setLocalLabel(field.label); onPreview({ label: field.label }); return; }
            if (trimmed !== field.label) onUpdate({ label: trimmed });
          }}
          className="w-full px-3 py-2 text-xs font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
          style={{ border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}
          placeholder="Field label"
        />
      </div>

      {/* Placeholder */}
      <div>
        <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-2">
          Placeholder
        </label>
        <input
          type="text"
          value={localPlaceholder}
          onChange={(e) => { setLocalPlaceholder(e.target.value); onPreview({ placeholder: e.target.value }); }}
          onBlur={() => {
            if (localPlaceholder !== (field.placeholder ?? ""))
              onUpdate({ placeholder: localPlaceholder });
          }}
          className="w-full px-3 py-2 text-xs font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
          style={{ border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}
          placeholder="Placeholder text"
        />
      </div>

      {/* Help Text */}
      <div>
        <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-2">
          Help Text
        </label>
        <textarea
          value={localDescription}
          onChange={(e) => { setLocalDescription(e.target.value); onPreview({ description: e.target.value }); }}
          onBlur={() => {
            if (localDescription !== (field.description ?? ""))
              onUpdate({ description: localDescription });
          }}
          className="w-full px-3 py-2 text-xs font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000] resize-none"
          style={{ border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}
          rows={2}
          placeholder="Help text for this field"
        />
      </div>

      {/* Required toggle */}
      <div className="flex items-center justify-between border border-[#ddd] px-3 py-2.5">
        <span className="text-xs font-black text-[#555] uppercase tracking-wider">Required</span>
        <button
          onClick={() => { onUpdate({ required: !field.required }); onPreview({ required: !field.required }); }}
          className={`relative h-5 w-9 transition-colors ${
            field.required ? "bg-[#cc0000]" : "bg-[#fff0f0]"
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 bg-white shadow transition-transform ${
              field.required ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* Page selector (multi-page only) */}
      {totalPages > 1 && (
        <div>
          <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-2">
            <Layers className="inline h-3.5 w-3.5 mr-1" />Page
          </label>
          <select
            value={field.page ?? 1}
            onChange={(e) => onUpdate({ page: parseInt(e.target.value) })}
            className="w-full px-3 py-2 text-xs font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#7b1fa2]"
            style={{ border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <option key={p} value={p}>
                Page {p}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Options (select / dropdown types) */}
      {hasOptions && (
        <div>
          <label className="block text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-2">
            Options
          </label>
          <div className="space-y-2">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={localOptionLabels[idx] ?? opt.label}
                  onChange={(e) => {
                    const updated = [...localOptionLabels];
                    updated[idx] = e.target.value;
                    setLocalOptionLabels(updated);
                    const updatedOptions = options.map((o, i) =>
                      i === idx ? { value: e.target.value.toLowerCase().replace(/\s+/g, "_"), label: e.target.value } : o
                    );
                    onPreview({ options: updatedOptions });
                  }}
                  onBlur={() => {
                    const newLabel = (localOptionLabels[idx] ?? opt.label).trim();
                    if (!newLabel) {
                      const reverted = [...localOptionLabels];
                      reverted[idx] = opt.label;
                      setLocalOptionLabels(reverted);
                      return;
                    }
                    if (newLabel !== opt.label) commitOptionLabel(idx, newLabel);
                  }}
                  className="flex-1 px-3 py-1.5 text-xs font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
                  style={{ border: "2px solid #000" }}
                />
                <button onClick={() => removeOption(idx)} className="text-[#555] hover:text-[#cc0000]">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addOption}
              className="flex items-center gap-1.5 text-xs text-[#cc0000] font-black tracking-wider uppercase hover:text-[#aa0000]"
            >
              <Plus className="h-3.5 w-3.5" />
              ADD OPTION
            </button>
          </div>
        </div>
      )}

      {/* Rating: max stars */}
      {field.type === "rating" && (
        <div>
          <label className="block text-xs font-black text-[#888] uppercase tracking-widest mb-2">
            &gt; Max Stars
          </label>
          <select
            value={(field.settings as { maxRating?: number } | null)?.maxRating ?? 5}
            onChange={(e) => { const v = { maxRating: parseInt(e.target.value) }; onUpdate({ settings: v }); onPreview({ settings: v }); }}
            className="w-full px-3 py-2 text-xs font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
            style={{ border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}
          >
            {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>
                {n} stars
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Conditional logic */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-black text-[#1a1a1a] uppercase tracking-wide">
            Conditional Logic
          </label>
          {otherFields.length > 0 && (
            <button
              onClick={addRule}
              className="flex items-center gap-1 text-xs text-[#cc0000] font-black hover:text-[#aa0000] tracking-wider uppercase"
            >
              <Plus className="h-3 w-3" />
              ADD
            </button>
          )}
        </div>

        {otherFields.length === 0 ? (
          <p className="text-xs text-[#888] font-mono">Add more fields to enable conditional logic.</p>
        ) : logic.showIf.length === 0 ? (
          <p className="text-xs text-[#888] font-mono">
            Always visible. Click ADD to add a show condition.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-[#555] font-mono">Show if ALL match:</p>
            {logic.showIf.map((rule, idx) => {
              const needsValue = !["is_empty", "is_not_empty"].includes(rule.operator);
              return (
                <div key={idx} className="border border-[#ddd] p-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#555] uppercase tracking-wider">
                      Rule {idx + 1}
                    </span>
                    <button onClick={() => removeRule(idx)} className="text-[#888] hover:text-[#cc0000]">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <select
                    value={rule.fieldId}
                    onChange={(e) => updateRule(idx, { fieldId: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs font-bold text-[#1a1a1a] bg-white focus:outline-none"
                    style={{ border: "2px solid #000" }}
                  >
                    {otherFields.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={rule.operator}
                    onChange={(e) => updateRule(idx, { operator: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs font-bold text-[#1a1a1a] bg-white focus:outline-none"
                    style={{ border: "2px solid #000" }}
                  >
                    {CONDITION_OPERATORS.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                  {needsValue && (
                    <input
                      type="text"
                      value={localRuleValues[idx] ?? rule.value}
                      onChange={(e) => {
                        const updated = [...localRuleValues];
                        updated[idx] = e.target.value;
                        setLocalRuleValues(updated);
                      }}
                      onBlur={() => {
                        const newVal = localRuleValues[idx] ?? rule.value;
                        if (newVal !== rule.value) updateRule(idx, { value: newVal });
                      }}
                      className="w-full px-2 py-1.5 text-xs font-bold text-[#1a1a1a] bg-white focus:outline-none"
                      style={{ border: "2px solid #000" }}
                      placeholder="Value to compare"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
