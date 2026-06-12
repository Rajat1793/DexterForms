"use client";

import { GripVertical, Copy, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type Field, FIELD_TYPES } from "../_types";

interface SortableFieldProps {
  field: Field;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function SortableField({
  field,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: SortableFieldProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const fieldDef = FIELD_TYPES.find((f) => f.type === field.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`group flex items-start gap-3 border-[3px] p-4 cursor-pointer transition-all bg-white ${
        isSelected
          ? "border-[#cc0000] shadow-[3px_3px_0_#000]"
          : "border-[#000] shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000]"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 text-[#555] hover:text-[#1a1a1a] cursor-grab"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs">{fieldDef?.emoji}</span>
          <span className="text-xs font-bold text-[#1a1a1a] truncate">{field.label}</span>
          {field.required && <span className="text-[#cc0000] text-xs font-bold">*</span>}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="text-xs text-[#888] uppercase tracking-wider font-bold">{fieldDef?.label}</div>
          {field.page && field.page > 1 && (
            <span className="text-xs font-black text-white bg-[#7b1fa2] px-1.5 py-0.5 leading-none">
              P{field.page}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          className="text-[#888] hover:text-[#1565c0] transition-colors"
          title="Duplicate field"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-[#888] hover:text-[#cc0000] transition-colors"
          title="Delete field"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
