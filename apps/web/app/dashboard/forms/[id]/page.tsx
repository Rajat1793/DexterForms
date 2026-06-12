"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { Plus, X, Loader2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { ConfirmModal } from "~/components/ui/confirm-modal";
import { MascotStickers } from "~/components/ui/mascot-stickers";

import { type Field, type UpdateFormData, FIELD_TYPES } from "./_types";
import { FormTopBar } from "./_components/form-topbar";
import { SortableField } from "./_components/sortable-field";
import { FieldEditor } from "./_components/field-editor";
import { FieldPreview } from "./_components/field-preview";
import { SettingsPanel } from "./_components/settings-panel";
import { ThemePanel } from "./_components/theme-panel";

export default function FormBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: formId } = use(params);
  const utils = trpc.useUtils();

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"fields" | "settings" | "theme">("fields");
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [showFieldPicker, setShowFieldPicker] = useState(false);
  const [pendingDeleteFieldId, setPendingDeleteFieldId] = useState<string | null>(null);
  const [formPassword, setFormPassword] = useState("");

  // ─── Queries ──────────────────────────────────────────────────────────────
  const { data: form, isLoading: formLoading } = trpc.forms.getById.useQuery({ id: formId });
  const { data: fields = [], isLoading: fieldsLoading } = trpc.fields.getByForm.useQuery({
    formId,
  });

  // ─── Optimistic field patches for instant live preview ────────────────────
  // Keyed by field id → partial overrides applied while editing.
  // Cleared per-field whenever the server data refetches (confirming the save).
  const [optimisticFields, setOptimisticFields] = useState<Map<string, Partial<Field>>>(
    new Map()
  );
  const prevFieldsRef = useRef(fields);
  useEffect(() => {
    // When server data changes, clear optimistic patches for fields whose
    // server value has caught up (i.e. was updated).
    const prev = prevFieldsRef.current;
    if (prev !== fields) {
      setOptimisticFields((m) => {
        if (m.size === 0) return m;
        const next = new Map(m);
        for (const f of fields as Field[]) {
          next.delete(f.id);
        }
        return next;
      });
      prevFieldsRef.current = fields;
    }
  }, [fields]);

  /** Merge server fields with any pending optimistic patches for the preview. */
  const displayFields = (fields as Field[]).map((f) => {
    const patch = optimisticFields.get(f.id);
    return patch ? { ...f, ...patch } : f;
  });

  const selectedField = displayFields.find((f) => f.id === selectedFieldId);

  // ─── Mutations ────────────────────────────────────────────────────────────
  const publishMutation = trpc.forms.publish.useMutation({
    onSuccess: () => {
      toast.success("Form published! 🎉");
      utils.forms.getById.invalidate({ id: formId });
    },
    onError: (e) => toast.error(e.message),
  });

  const unpublishMutation = trpc.forms.unpublish.useMutation({
    onSuccess: () => {
      toast.success("Form unpublished");
      utils.forms.getById.invalidate({ id: formId });
    },
    onError: (e) => toast.error(e.message),
  });

  const updateFormMutation = trpc.forms.update.useMutation({
    onSuccess: () => {
      toast.success("Saved");
      utils.forms.getById.invalidate({ id: formId });
    },
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
    onSuccess: () => utils.fields.getByForm.invalidate({ formId }),
    onError: (e) => toast.error(e.message),
  });

  const deleteFieldMutation = trpc.fields.delete.useMutation({
    onSuccess: () => {
      utils.fields.getByForm.invalidate({ formId });
      setSelectedFieldId(null);
      toast.success("Field removed");
    },
  });

  const reorderMutation = trpc.fields.reorder.useMutation();

  // ─── Curried update helper (avoids repeating { id: formId, ...data }) ─────
  const updateForm = (data: UpdateFormData) =>
    updateFormMutation.mutate({ id: formId, ...data } as any);

  // ─── DnD ──────────────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const list = fields as Field[];
    const reordered = arrayMove(
      list,
      list.findIndex((f) => f.id === active.id),
      list.findIndex((f) => f.id === over.id)
    );
    reorderMutation.mutate({ formId, orderedIds: reordered.map((f) => f.id) });
    utils.fields.getByForm.invalidate({ formId });
  };

  // ─── Field handlers ───────────────────────────────────────────────────────
  const handleAddField = (type: string) => {
    addFieldMutation.mutate({
      formId,
      type: type as any,
      label: `Question ${fields.length + 1}`,
      required: false,
      order: fields.length,
    });
  };

  const handleUpdateField = (fieldId: string, data: Partial<Field>) => {
    updateFieldMutation.mutate({ formId, fieldId, ...data } as any);
  };

  const handlePreviewField = (fieldId: string, data: Partial<Field>) => {
    setOptimisticFields((m) => new Map(m).set(fieldId, { ...(m.get(fieldId) ?? {}), ...data }));
  };

  const handleDuplicateField = (field: Field) => {
    addFieldMutation.mutate({
      formId,
      type: field.type as any,
      label: `${field.label} (copy)`,
      placeholder: field.placeholder ?? undefined,
      description: field.description ?? undefined,
      required: field.required ?? false,
      order: fields.length,
      page: field.page ?? 1,
      options: field.options ?? undefined,
      settings: field.settings ?? undefined,
    });
  };

  // ─── Loading / error states ───────────────────────────────────────────────
  if (formLoading || fieldsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fffde7]">
        <div className="text-center font-mono">
          <Loader2 className="h-8 w-8 animate-spin text-[#cc0000] mx-auto mb-3" />
          <div className="text-xs text-[#999] tracking-widest animate-pulse">
            LOADING EXPERIMENT...
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-8 font-mono bg-[#fffde7] min-h-screen">
        <p className="text-[#cc0000] text-xs tracking-wider">⚠ EXPERIMENT NOT FOUND</p>
        <Link href="/dashboard" className="text-[#555] hover:text-[#cc0000] text-xs tracking-wider">
          ← BACK TO LAB
        </Link>
      </div>
    );
  }

  const isPublished = form.status === "published";

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-polka-yellow overflow-hidden">

      <FormTopBar
        form={form as any}
        formId={formId}
        onFormUpdate={updateForm}
        isPublished={isPublished}
        onPublish={() => publishMutation.mutate({ id: formId })}
        onUnpublish={() => unpublishMutation.mutate({ id: formId })}
        publishPending={publishMutation.isPending}
        unpublishPending={unpublishMutation.isPending}
      />

      {/* Three-column builder area */}
      <div className="flex flex-1 overflow-hidden overflow-x-auto">

        {/* ── Left panel ── */}
        <div
          className="w-72 md:w-80 flex-shrink-0 flex flex-col overflow-hidden"
          style={{ borderRight: "3px solid #000", background: "#fff9f9" }}
        >
          {/* Tab switcher */}
          <div className="flex" style={{ borderBottom: "3px solid #000" }}>
            {(["fields", "settings", "theme"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest transition-colors ${
                  activeTab === tab
                    ? "border-b-[3px] border-[#cc0000] text-[#cc0000] bg-[#fff9c4]"
                    : "text-[#555] hover:text-[#1a1a1a] hover:bg-[#fffde7]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Fields tab */}
            {activeTab === "fields" && (
              <div className="p-4 space-y-3">
                <button
                  onClick={() => setShowFieldPicker(!showFieldPicker)}
                  className="flex items-center justify-center gap-2 w-full border border-dashed border-[#bbb] py-3 text-xs font-black text-[#cc0000] hover:border-[#cc0000] hover:bg-[#fffde7] tracking-widest uppercase transition-all"
                >
                  <Plus className="h-4 w-4" />
                  ADD FIELD
                </button>

                {showFieldPicker && (
                  <div className="border border-[#bbb] bg-white overflow-hidden">
                    <div className="p-2 border-b border-[#ddd]">
                      <p className="text-xs font-black text-[#555] px-2 tracking-widest uppercase">
                        SELECT FIELD TYPE
                      </p>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-2">
                      {FIELD_TYPES.map((ft) => (
                        <button
                          key={ft.type}
                          onClick={() => handleAddField(ft.type)}
                          disabled={addFieldMutation.isPending}
                          className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-[#fff9c4] transition-colors"
                        >
                          <span className="text-sm">{ft.emoji}</span>
                          <div>
                            <div className="text-xs font-black text-[#1a1a1a] tracking-wide">
                              {ft.label}
                            </div>
                            <div className="text-xs text-[#888] font-mono">{ft.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={displayFields.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {displayFields.map((field) => (
                        <SortableField
                          key={field.id}
                          field={field}
                          isSelected={selectedFieldId === field.id}
                          onSelect={() => setSelectedFieldId(field.id)}
                          onDelete={() => setPendingDeleteFieldId(field.id)}
                          onDuplicate={() => handleDuplicateField(field)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {fields.length === 0 && !showFieldPicker && (
                  <div className="text-center py-8">
                    <p className="text-xs text-[#555] font-mono tracking-wider">NO FIELDS YET</p>
                    <p className="text-xs text-[#888] mt-1 font-mono">
                      CLICK "ADD FIELD" TO START
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Settings tab */}
            {activeTab === "settings" && (
              <SettingsPanel
                form={form as any}
                onUpdate={updateForm}
                formPassword={formPassword}
                setFormPassword={setFormPassword}
                isPublished={isPublished}
              />
            )}

            {/* Theme tab */}
            {activeTab === "theme" && (
              <ThemePanel currentThemeId={form.themeId} onUpdate={updateForm} />
            )}
          </div>
        </div>

        {/* ── Center: live preview ── */}
        <div className="relative flex-1 bg-polka-yellow overflow-y-auto">
          <MascotStickers count={2} />
          <div className="max-w-2xl mx-auto p-8 font-mono">
            <div className="border border-[#ccc] bg-white overflow-hidden">
              <div className="bg-[#cc0000] border-b border-[#aa0000] p-6">
                <div className="text-xs text-[#ffd700] tracking-widest mb-1 uppercase font-bold">
                  // FORM PREVIEW
                </div>
                <h2 className="text-lg font-black text-white tracking-wider uppercase">
                  {form.title}
                </h2>
                {form.description && (
                  <p className="text-[#555] text-xs mt-1 font-mono">{form.description}</p>
                )}
              </div>
              <div className="p-6 space-y-5">
                {displayFields.map((field) => (
                  <div
                    key={field.id}
                    onClick={() => setSelectedFieldId(field.id)}
                    className={`cursor-pointer border p-4 transition-all ${
                      selectedFieldId === field.id
                        ? "border-[#cc0000] bg-[#fff9c4]"
                        : "border-[#ddd] hover:border-[#ccc]"
                    }`}
                  >
                    <label className="block text-xs font-black text-[#1a1a1a] mb-2 uppercase tracking-wider">
                      {field.label}
                      {field.required && <span className="text-[#cc0000] ml-1">*</span>}
                    </label>
                    {field.description && (
                      <p className="text-xs text-[#555] mb-2 font-mono">{field.description}</p>
                    )}
                    <FieldPreview field={field} />
                  </div>
                ))}

                {displayFields.length === 0 && (
                  <div className="py-16 text-center">
                    <p className="text-xs text-[#555] font-mono tracking-wider">
                      ADD FIELDS FROM THE LEFT PANEL
                    </p>
                  </div>
                )}

                {displayFields.length > 0 && (
                  <button className="w-full border border-[#cc0000] bg-[#cc0000] py-3 text-xs font-black text-white hover:bg-[#aa0000] tracking-widest uppercase">
                    SUBMIT RESPONSE
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right panel: field editor ── */}
        {selectedField && (
          <div
            className="w-72 overflow-y-auto bg-white"
            style={{ borderLeft: "3px solid #000" }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between bg-[#1565c0]"
              style={{ borderBottom: "3px solid #000" }}
            >
              <h3 className="text-sm font-bangers text-white tracking-widest uppercase">
                EDIT FIELD
              </h3>
              <button
                onClick={() => setSelectedFieldId(null)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <FieldEditor
                field={selectedField}
                allFields={displayFields}
                totalPages={form.totalPages ?? 1}
                onUpdate={(data) => handleUpdateField(selectedField.id, data)}
                onPreview={(data) => handlePreviewField(selectedField.id, data)}
              />
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!pendingDeleteFieldId}
        title="REMOVE FIELD?"
        message="This field and any collected data for it will be permanently removed."
        confirmLabel="REMOVE!"
        onConfirm={() => {
          deleteFieldMutation.mutate({ formId, fieldId: pendingDeleteFieldId! });
          setPendingDeleteFieldId(null);
        }}
        onCancel={() => setPendingDeleteFieldId(null)}
      />
    </div>
  );
}

