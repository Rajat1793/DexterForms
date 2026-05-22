"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Settings,
  Eye,
  Globe,
  Lock,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  BarChart2,
  Users,
  Loader2,
  Check,
  X,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const FIELD_TYPES = [
  { type: "short_text", label: "Short Text", emoji: "📝", description: "Single line text" },
  { type: "long_text", label: "Long Text", emoji: "📄", description: "Multi-line text area" },
  { type: "email", label: "Email", emoji: "📧", description: "Email address" },
  { type: "number", label: "Number", emoji: "🔢", description: "Numeric input" },
  { type: "single_select", label: "Single Select", emoji: "🔘", description: "Pick one option" },
  { type: "multi_select", label: "Multi Select", emoji: "☑️", description: "Pick multiple options" },
  { type: "checkbox", label: "Checkbox", emoji: "✅", description: "Boolean yes/no" },
  { type: "rating", label: "Rating", emoji: "⭐", description: "Star rating 1-5" },
  { type: "date", label: "Date", emoji: "📅", description: "Date picker" },
  { type: "dropdown", label: "Dropdown", emoji: "📋", description: "Select from dropdown" },
  { type: "phone", label: "Phone", emoji: "📞", description: "Phone number" },
  { type: "url", label: "URL", emoji: "🔗", description: "Website link" },
];

const THEMES = [
  { id: "minimal", name: "Minimal", emoji: "✨" },
  { id: "dark", name: "Dark", emoji: "🌙" },
  { id: "matrix", name: "Matrix", emoji: "🟩" },
  { id: "sakura", name: "Sakura", emoji: "🌸" },
  { id: "cyberpunk", name: "Cyberpunk", emoji: "⚡" },
  { id: "ocean", name: "Ocean", emoji: "🌊" },
  { id: "nebula", name: "Nebula", emoji: "🔮" },
  { id: "retro", name: "Retro", emoji: "👾" },
  { id: "dracula", name: "Dracula", emoji: "🧛" },
  { id: "naruto", name: "Naruto", emoji: "🍃" },
  { id: "midnight", name: "Midnight", emoji: "🌙" },
  { id: "startup", name: "Startup", emoji: "🚀" },
];

type Field = {
  id: string;
  formId: string;
  type: string;
  label: string;
  placeholder: string | null;
  description: string | null;
  required: boolean | null;
  order: number;
  page: number | null;
  validations: unknown;
  options: unknown;
  settings: unknown;
  conditionalLogic: unknown;
  createdAt: Date | null;
  updatedAt: Date | null;
};

function SortableField({
  field,
  isSelected,
  onSelect,
  onDelete,
}: {
  field: Field;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
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
      className={`group flex items-start gap-3 border p-4 cursor-pointer transition-all font-mono ${
        isSelected
          ? "border-lime-500 bg-lime-900/10"
          : "border-lime-900/20 bg-[#0f1520] hover:border-lime-900/40"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 text-blue-400 hover:text-blue-200 cursor-grab"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs">{fieldDef?.emoji}</span>
          <span className="text-xs font-black text-white truncate tracking-wide">{field.label}</span>
          {field.required && (
            <span className="text-lime-400 text-xs">*</span>
          )}
        </div>
        <div className="text-xs text-blue-400/80 mt-0.5 font-mono uppercase tracking-wider">{fieldDef?.label}</div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 text-blue-400 hover:text-lime-400 transition-all"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function FieldEditor({
  field,
  onUpdate,
}: {
  field: Field;
  onUpdate: (data: Partial<Field>) => void;
}) {
  const hasOptions = ["single_select", "multi_select", "dropdown"].includes(field.type);
  const options = (field.options as Array<{ value: string; label: string }>) ?? [];

  const addOption = () => {
    const newOption = { value: `option_${options.length + 1}`, label: `Option ${options.length + 1}` };
    onUpdate({ options: [...options, newOption] });
  };

  const updateOption = (idx: number, label: string) => {
    const updated = [...options];
    updated[idx] = { value: label.toLowerCase().replace(/\s+/g, "_"), label };
    onUpdate({ options: updated });
  };

  const removeOption = (idx: number) => {
    onUpdate({ options: options.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-5 font-mono">
      <div>
        <label className="block text-xs font-black text-blue-400/80 uppercase tracking-widest mb-2">&gt; Label</label>
        <input
          type="text"
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="w-full border border-lime-900/30 bg-[#0a0d14] px-3 py-2 text-xs text-blue-100 font-mono focus:border-lime-500 focus:outline-none"
          placeholder="Field label"
        />
      </div>

      <div>
        <label className="block text-xs font-black text-blue-400/80 uppercase tracking-widest mb-2">&gt; Placeholder</label>
        <input
          type="text"
          value={field.placeholder ?? ""}
          onChange={(e) => onUpdate({ placeholder: e.target.value })}
          className="w-full border border-lime-900/30 bg-[#0a0d14] px-3 py-2 text-xs text-blue-100 font-mono focus:border-lime-500 focus:outline-none"
          placeholder="Placeholder text"
        />
      </div>

      <div>
        <label className="block text-xs font-black text-blue-400/80 uppercase tracking-widest mb-2">&gt; Description</label>
        <textarea
          value={field.description ?? ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="w-full border border-lime-900/30 bg-[#0a0d14] px-3 py-2 text-xs text-blue-100 font-mono focus:border-lime-500 focus:outline-none resize-none"
          rows={2}
          placeholder="Help text for this field"
        />
      </div>

      <div className="flex items-center justify-between border border-lime-900/20 px-3 py-2.5">
        <span className="text-xs font-black text-blue-300 uppercase tracking-wider">Required</span>
        <button
          onClick={() => onUpdate({ required: !field.required })}
          className={`relative h-5 w-9 transition-colors ${field.required ? "bg-lime-600" : "bg-lime-900/20"}`}
        >
          <span className={`absolute top-0.5 h-4 w-4 bg-white shadow transition-transform ${field.required ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
      </div>

      {hasOptions && (
        <div>
          <label className="block text-xs font-black text-blue-400/80 uppercase tracking-widest mb-2">&gt; Options</label>
          <div className="space-y-2">
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  className="flex-1 border border-lime-900/30 bg-[#0a0d14] px-3 py-1.5 text-xs text-blue-100 font-mono focus:border-lime-500 focus:outline-none"
                />
                <button onClick={() => removeOption(idx)} className="text-blue-400 hover:text-lime-400">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addOption}
              className="flex items-center gap-1.5 text-xs text-lime-400 hover:text-lime-300 font-black tracking-wider uppercase"
            >
              <Plus className="h-3.5 w-3.5" />
              ADD OPTION
            </button>
          </div>
        </div>
      )}

      {field.type === "rating" && (
        <div>
          <label className="block text-xs font-black text-blue-400/80 uppercase tracking-widest mb-2">&gt; Max Stars</label>
          <select
            value={(field.settings as any)?.maxRating ?? 5}
            onChange={(e) => onUpdate({ settings: { maxRating: parseInt(e.target.value) } })}
            className="w-full border border-lime-900/30 bg-[#0a0d14] px-3 py-2 text-xs text-blue-100 font-mono focus:border-lime-500 focus:outline-none"
          >
            {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>{n} stars</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default function FormBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: formId } = use(params);
  const router = useRouter();
  const utils = trpc.useUtils();

  const [activeTab, setActiveTab] = useState<"fields" | "settings" | "theme">("fields");
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [showFieldPicker, setShowFieldPicker] = useState(false);

  const { data: form, isLoading: formLoading } = trpc.forms.getById.useQuery({ id: formId });
  const { data: fields = [], isLoading: fieldsLoading } = trpc.fields.getByForm.useQuery({ formId });

  const [localFields, setLocalFields] = useState<Field[]>([]);

  // Sync local fields when remote loads
  useState(() => {
    if (fields.length > 0) setLocalFields(fields as Field[]);
  });

  const selectedField = localFields.find((f) => f.id === selectedFieldId) ??
    (fields as Field[]).find((f) => f.id === selectedFieldId);

  const publishMutation = trpc.forms.publish.useMutation({
    onSuccess: () => { toast.success("Form published! 🎉"); utils.forms.getById.invalidate({ id: formId }); },
    onError: (e) => toast.error(e.message),
  });

  const unpublishMutation = trpc.forms.unpublish.useMutation({
    onSuccess: () => { toast.success("Form unpublished"); utils.forms.getById.invalidate({ id: formId }); },
    onError: (e) => toast.error(e.message),
  });

  const updateFormMutation = trpc.forms.update.useMutation({
    onSuccess: () => { toast.success("Saved"); utils.forms.getById.invalidate({ id: formId }); },
    onError: (e) => toast.error(e.message),
  });

  const addFieldMutation = trpc.fields.add.useMutation({
    onSuccess: (field) => {
      utils.fields.getByForm.invalidate({ formId });
      setSelectedFieldId(field.id);
      setShowFieldPicker(false);
      toast.success("Field added");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateFieldMutation = trpc.fields.update.useMutation({
    onSuccess: () => { utils.fields.getByForm.invalidate({ formId }); },
  });

  const deleteFieldMutation = trpc.fields.delete.useMutation({
    onSuccess: () => {
      utils.fields.getByForm.invalidate({ formId });
      setSelectedFieldId(null);
      toast.success("Field removed");
    },
  });

  const reorderMutation = trpc.fields.reorder.useMutation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const currentFields = (fields as Field[]);
    const oldIdx = currentFields.findIndex((f) => f.id === active.id);
    const newIdx = currentFields.findIndex((f) => f.id === over.id);
    const reordered = arrayMove(currentFields, oldIdx, newIdx);

    reorderMutation.mutate({
      formId,
      orderedIds: reordered.map((f) => f.id),
    });
    utils.fields.getByForm.invalidate({ formId });
  };

  const handleAddField = (type: string) => {
    const count = (fields as Field[]).length;
    addFieldMutation.mutate({
      formId,
      type: type as any,
      label: `Question ${count + 1}`,
      required: false,
      order: count,
    });
  };

  const handleUpdateField = (fieldId: string, data: Partial<Field>) => {
    updateFieldMutation.mutate({ formId, fieldId, ...data } as any);
  };

  if (formLoading || fieldsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0e1a]">
        <div className="text-center font-mono">
          <Loader2 className="h-8 w-8 animate-spin text-lime-500 mx-auto mb-3" />
          <div className="text-xs text-blue-400/50 tracking-widest animate-pulse">LOADING EXPERIMENT...</div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-8 font-mono bg-[#0a0e1a] min-h-screen">
        <p className="text-lime-400 text-xs tracking-wider">⚠ EXPERIMENT NOT FOUND</p>
        <Link href="/dashboard" className="text-blue-400 hover:text-lime-400 text-xs tracking-wider">← BACK TO LAB</Link>
      </div>
    );
  }

  const isPublished = form.status === "published";

  return (
    <div className="h-screen flex flex-col bg-[#0a0e1a]">
      {/* Top bar */}
      <div className="border-b border-lime-900/20 bg-[#080d14] px-6 py-3 flex items-center gap-4 flex-shrink-0 font-mono">
        <Link href="/dashboard" className="text-blue-400 hover:text-lime-400 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateFormMutation.mutate({ id: formId, title: e.target.value })}
            className="text-sm font-black text-white bg-transparent border-none outline-none w-full tracking-wider uppercase placeholder:text-blue-600"
          />
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/forms/${formId}/responses`}
            className="flex items-center gap-1.5 border border-lime-900/30 px-3 py-1.5 text-xs text-blue-300 hover:bg-lime-900/10 hover:text-white tracking-wider uppercase transition-colors"
          >
            <Users className="h-4 w-4" />
            {form.responseCount ?? 0} RESPONSES
          </Link>

          <Link
            href={`/dashboard/forms/${formId}/analytics`}
            className="flex items-center gap-1.5 border border-lime-900/30 px-3 py-1.5 text-xs text-blue-300 hover:bg-lime-900/10 hover:text-white tracking-wider uppercase transition-colors"
          >
            <BarChart2 className="h-4 w-4" />
            ANALYTICS
          </Link>

          {isPublished && form.slug && (
            <a
              href={`/f/${form.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 border border-green-700/40 bg-green-900/10 px-3 py-1.5 text-xs text-green-400 hover:bg-green-900/20 tracking-wider uppercase transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              VIEW LIVE
            </a>
          )}

          {isPublished ? (
            <button
              onClick={() => unpublishMutation.mutate({ id: formId })}
              disabled={unpublishMutation.isPending}
              className="border border-lime-900/30 px-4 py-1.5 text-xs font-black text-blue-300 hover:bg-lime-900/10 tracking-widest uppercase transition-colors"
            >
              UNPUBLISH
            </button>
          ) : (
            <button
              onClick={() => publishMutation.mutate({ id: formId })}
              disabled={publishMutation.isPending}
              className="flex items-center gap-2 border border-lime-600 bg-lime-600 px-4 py-1.5 text-xs font-black text-white hover:bg-lime-700 tracking-widest uppercase transition-colors"
            >
              {publishMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              PUBLISH
            </button>
          )}
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: field list */}
        <div className="w-80 border-r border-lime-900/20 bg-[#080d14] flex flex-col overflow-hidden font-mono">
          {/* Tabs */}
          <div className="flex border-b border-lime-900/20">
            {(["fields", "settings", "theme"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-lime-500 text-lime-400 bg-lime-900/10"
                    : "text-blue-300 hover:text-white hover:bg-lime-900/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === "fields" && (
              <div className="p-4 space-y-3">
                {/* Add field button */}
                <button
                  onClick={() => setShowFieldPicker(!showFieldPicker)}
                  className="flex items-center justify-center gap-2 w-full border border-dashed border-lime-900/40 py-3 text-xs font-black text-lime-400 hover:border-lime-500 hover:bg-lime-900/10 tracking-widest uppercase transition-all"
                >
                  <Plus className="h-4 w-4" />
                  ADD FIELD
                </button>

                {/* Field type picker */}
                {showFieldPicker && (
                  <div className="border border-lime-900/40 bg-[#0a0d14] overflow-hidden">
                    <div className="p-2 border-b border-lime-900/20">
                      <p className="text-xs font-black text-blue-400 px-2 tracking-widest uppercase">SELECT FIELD TYPE</p>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-2">
                      {FIELD_TYPES.map((ft) => (
                        <button
                          key={ft.type}
                          onClick={() => handleAddField(ft.type)}
                          disabled={addFieldMutation.isPending}
                          className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-lime-900/20 transition-colors"
                        >
                          <span className="text-sm">{ft.emoji}</span>
                          <div>
                            <div className="text-xs font-black text-white tracking-wide">{ft.label}</div>
                            <div className="text-xs text-blue-400/80 font-mono">{ft.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fields list */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={(fields as Field[]).map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {(fields as Field[]).map((field) => (
                        <SortableField
                          key={field.id}
                          field={field}
                          isSelected={selectedFieldId === field.id}
                          onSelect={() => setSelectedFieldId(field.id)}
                          onDelete={() => {
                            if (confirm("Remove this field?")) {
                              deleteFieldMutation.mutate({ formId, fieldId: field.id });
                            }
                          }}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {(fields as Field[]).length === 0 && !showFieldPicker && (
                  <div className="text-center py-8">
                    <p className="text-xs text-blue-400 font-mono tracking-wider">NO FIELDS YET</p>
                    <p className="text-xs text-blue-400/70 mt-1 font-mono">CLICK "ADD FIELD" TO START</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="p-4 space-y-5">
                <div>
                  <label className="block text-xs font-black text-blue-400/80 uppercase tracking-widest mb-2">&gt; Form Title</label>
                  <input
                    type="text"
                    defaultValue={form.title}
                    onBlur={(e) => updateFormMutation.mutate({ id: formId, title: e.target.value })}
                    className="w-full border border-lime-900/30 bg-[#0a0d14] px-3 py-2 text-xs text-blue-100 font-mono focus:border-lime-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-blue-400/80 uppercase tracking-widest mb-2">&gt; Description</label>
                  <textarea
                    defaultValue={form.description ?? ""}
                    onBlur={(e) => updateFormMutation.mutate({ id: formId, description: e.target.value })}
                    className="w-full border border-lime-900/30 bg-[#0a0d14] px-3 py-2 text-xs text-blue-100 font-mono focus:border-lime-500 focus:outline-none resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-blue-400/80 uppercase tracking-widest mb-2">&gt; Visibility</label>
                  <select
                    defaultValue={form.visibility}
                    onChange={(e) => updateFormMutation.mutate({ id: formId, visibility: e.target.value as "public" | "unlisted" })}
                    className="w-full border border-lime-900/30 bg-[#0a0d14] px-3 py-2 text-xs text-blue-100 font-mono focus:border-lime-500 focus:outline-none"
                  >
                    <option value="public">Public (searchable)</option>
                    <option value="unlisted">Unlisted (link only)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-blue-400/80 uppercase tracking-widest mb-2">&gt; Custom Slug</label>
                  <input
                    type="text"
                    defaultValue={form.slug ?? ""}
                    onBlur={(e) => {
                      if (e.target.value) updateFormMutation.mutate({ id: formId, slug: e.target.value });
                    }}
                    className="w-full border border-lime-900/30 bg-[#0a0d14] px-3 py-2 text-xs text-blue-100 font-mono focus:border-lime-500 focus:outline-none"
                    placeholder="my-custom-slug"
                  />
                  {form.slug && (
                    <p className="text-xs text-blue-400/70 mt-1 font-mono truncate">
                      /f/{form.slug}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-black text-blue-400/80 uppercase tracking-widest mb-2">&gt; Success Message</label>
                  <textarea
                    defaultValue={form.successMessage ?? "Thank you for your response!"}
                    onBlur={(e) => updateFormMutation.mutate({ id: formId, successMessage: e.target.value })}
                    className="w-full border border-lime-900/30 bg-[#0a0d14] px-3 py-2 text-xs text-blue-100 font-mono focus:border-lime-500 focus:outline-none resize-none"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-blue-400/80 uppercase tracking-widest mb-2">&gt; Max Responses</label>
                  <input
                    type="number"
                    defaultValue={form.maxResponses ?? ""}
                    onBlur={(e) => updateFormMutation.mutate({ id: formId, maxResponses: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full border border-lime-900/30 bg-[#0a0d14] px-3 py-2 text-xs text-blue-100 font-mono focus:border-lime-500 focus:outline-none"
                    placeholder="Unlimited"
                    min={1}
                  />
                </div>
                <div className="flex items-center justify-between border border-lime-900/20 px-3 py-2.5">
                  <span className="text-xs text-blue-300 font-mono uppercase tracking-wider">Show progress bar</span>
                  <button
                    onClick={() => updateFormMutation.mutate({ id: formId, showProgressBar: !form.showProgressBar })}
                    className={`relative h-5 w-9 transition-colors ${form.showProgressBar ? "bg-lime-600" : "bg-lime-900/20"}`}
                  >
                    <span className={`absolute top-0.5 h-4 w-4 bg-white shadow transition-transform ${form.showProgressBar ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </div>
                {isPublished && form.slug && (
                  <div className="border border-green-700/40 bg-green-900/10 p-4">
                    <p className="text-xs font-black text-green-400 mb-2 tracking-widest">● PUBLISHED</p>
                    <p className="text-xs text-green-300/60 font-mono break-all">
                      {typeof window !== "undefined" ? window.location.origin : ""}/f/{form.slug}
                    </p>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/f/${form.slug}`;
                        navigator.clipboard.writeText(url);
                        toast.success("Link copied!");
                      }}
                      className="mt-2 text-xs text-green-400 font-black hover:text-green-300 tracking-wider uppercase"
                    >
                      COPY LINK
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "theme" && (
              <div className="p-4">
                <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3">&gt; CHOOSE THEME</p>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => updateFormMutation.mutate({ id: formId, themeId: theme.id })}
                      className={`flex items-center gap-2 border p-3 text-left transition-all ${
                        form.themeId === theme.id
                          ? "border-lime-500 bg-lime-900/20"
                          : "border-lime-900/20 hover:border-lime-900/40 hover:bg-lime-900/10"
                      }`}
                    >
                      <span className="text-sm">{theme.emoji}</span>
                      <div>
                        <div className="text-xs font-black text-white tracking-wide">{theme.name}</div>
                      </div>
                      {form.themeId === theme.id && (
                        <Check className="h-3 w-3 text-lime-400 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: form preview */}
        <div className="flex-1 bg-[#0a0e1a] overflow-y-auto">
          <div className="max-w-2xl mx-auto p-8 font-mono">
            <div className="border border-lime-900/30 bg-[#0f1520] overflow-hidden">
              <div className="bg-gradient-to-r from-lime-900 to-lime-800 border-b border-lime-700/40 p-6">
                <div className="text-xs text-lime-300/80 tracking-widest mb-1 uppercase">// EXPERIMENT PREVIEW</div>
                <h2 className="text-lg font-black text-white tracking-wider uppercase">{form.title}</h2>
                {form.description && (
                    <p className="text-lime-200/80 text-xs mt-1 font-mono">{form.description}</p>
                )}
              </div>
              <div className="p-6 space-y-5">
                {(fields as Field[]).map((field) => (
                  <div
                    key={field.id}
                    onClick={() => setSelectedFieldId(field.id)}
                    className={`cursor-pointer border p-4 transition-all ${
                      selectedFieldId === field.id
                        ? "border-lime-500 bg-lime-900/10"
                        : "border-lime-900/20 hover:border-lime-900/30"
                    }`}
                  >
                    <label className="block text-xs font-black text-blue-200 mb-2 uppercase tracking-wider">
                      {field.label}
                      {field.required && <span className="text-lime-400 ml-1">*</span>}
                    </label>
                    {field.description && (
                      <p className="text-xs text-blue-400 mb-2 font-mono">{field.description}</p>
                    )}
                    <FieldPreview field={field} />
                  </div>
                ))}

                {(fields as Field[]).length === 0 && (
                  <div className="py-16 text-center">
                    <p className="text-xs text-blue-400 font-mono tracking-wider">ADD FIELDS FROM THE LEFT PANEL</p>
                  </div>
                )}

                {(fields as Field[]).length > 0 && (
                  <button className="w-full border border-lime-600 bg-lime-600 py-3 text-xs font-black text-white hover:bg-lime-700 tracking-widest uppercase">
                    SUBMIT RESPONSE
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right panel: field editor */}
        {selectedField && (
          <div className="w-72 border-l border-lime-900/20 bg-[#080d14] overflow-y-auto font-mono">
            <div className="px-4 py-3 border-b border-lime-900/20 flex items-center justify-between">
              <h3 className="text-xs font-black text-white tracking-widest uppercase">EDIT FIELD</h3>
              <button
                onClick={() => setSelectedFieldId(null)}
                className="text-blue-400 hover:text-lime-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <FieldEditor
                field={selectedField}
                onUpdate={(data) => handleUpdateField(selectedField.id, data)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldPreview({ field }: { field: Field }) {
  const options = (field.options as Array<{ value: string; label: string }>) ?? [];
  const maxRating = (field.settings as any)?.maxRating ?? 5;

  switch (field.type) {
    case "long_text":
      return <div className="w-full h-16 border border-lime-900/30 bg-[#080d14] px-3 py-2 text-xs text-blue-500 font-mono">{field.placeholder ?? "Your answer..."}</div>;
    case "single_select":
    case "multi_select":
      return (
        <div className="space-y-1.5">
          {(options.length > 0 ? options : [{ value: "opt1", label: "Option 1" }, { value: "opt2", label: "Option 2" }]).map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <div className={`h-3.5 w-3.5 border border-lime-900/40 ${field.type === "multi_select" ? "" : "rounded-full"}`} />
              <span className="text-xs text-blue-400/80 font-mono">{opt.label}</span>
            </div>
          ))}
        </div>
      );
    case "dropdown":
      return (
        <div className="w-full h-8 border border-lime-900/30 bg-[#080d14] px-3 flex items-center justify-between text-xs text-blue-500 font-mono">
          <span>{field.placeholder ?? "Select..."}</span>
          <ChevronDown className="h-3 w-3" />
        </div>
      );
    case "checkbox":
      return (
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-3.5 border border-lime-900/40" />
          <span className="text-xs text-blue-400/80 font-mono">{field.placeholder ?? field.label}</span>
        </div>
      );
    case "rating":
      return (
        <div className="flex gap-1">
          {Array.from({ length: maxRating }).map((_, i) => (
            <div key={i} className={`h-6 w-6 flex items-center justify-center text-sm ${i < 3 ? "text-yellow-500" : "text-lime-900/30"}`}>★</div>
          ))}
        </div>
      );
    case "date":
      return <div className="w-full h-8 border border-lime-900/30 bg-[#080d14] px-3 flex items-center text-xs text-blue-500 font-mono">mm/dd/yyyy</div>;
    default:
      return <div className="w-full h-8 border border-lime-900/30 bg-[#080d14] px-3 flex items-center text-xs text-blue-500 font-mono">{field.placeholder ?? "Your answer"}</div>;
  }
}
