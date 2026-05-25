"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ConfirmModal } from "~/components/ui/confirm-modal";
import { trpc } from "~/trpc/client";
import { ArrowLeft, Download, Trash2, Eye, Mail, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

export default function ResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: formId } = use(params);
  const utils = trpc.useUtils();

  const [page, setPage] = useState(0);
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const limit = 20;

  const { data: form } = trpc.forms.getById.useQuery({ id: formId });
  const { data, isLoading } = trpc.responses.getByForm.useQuery({ formId, limit, offset: page * limit });
  const { data: selectedData } = trpc.responses.getWithAnswers.useQuery(
    { formId, responseId: selectedResponse! },
    { enabled: !!selectedResponse }
  );
  const { data: allData } = trpc.responses.getAllWithAnswers.useQuery({ formId });

  const deleteMutation = trpc.responses.delete.useMutation({
    onSuccess: () => {
      toast.success("Response deleted");
      utils.responses.getByForm.invalidate({ formId });
      utils.forms.getById.invalidate({ id: formId });
      setSelectedResponse(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const exportCSV = () => {
    if (!allData || allData.length === 0) {
      toast.error("No responses to export");
      return;
    }
    const headers = ["Respondent", "Email", "Submitted At", "Completion Time (s)"];
    const fieldLabels = new Set<string>();
    allData.forEach((r: any) => {
      r.answers?.forEach((a: any) => { if (a.fieldLabel) fieldLabels.add(a.fieldLabel); });
    });
    fieldLabels.forEach((l) => headers.push(l));
    const rows = allData.map((r: any) => {
      const row: string[] = [
        r.respondentName ?? "-", r.respondentEmail ?? "-",
        r.createdAt ? format(new Date(r.createdAt), "yyyy-MM-dd HH:mm") : "-",
        r.completionTime?.toString() ?? "-",
      ];
      fieldLabels.forEach((label) => {
        const answer = r.answers?.find((a: any) => a.fieldLabel === label);
        row.push(answer?.value ?? "");
      });
      return row;
    });
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form?.title ?? "responses"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded!");
  };

  const responses = data?.responses ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="flex h-screen bg-[#fffde7]">
      {/* List */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ borderRight:"3px solid #000" }}>
        <div className="px-6 py-4 bg-white" style={{ borderBottom:"4px solid #000" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/dashboard/forms/${formId}`} className="text-[#cc0000] hover:text-[#aa0000] transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="font-bangers text-xl text-[#1a1a1a] tracking-widest uppercase">{form?.title ?? "Responses"}</h1>
                <p className="text-xs text-[#555] font-mono">{total} total entries</p>
              </div>
            </div>
            <button
              onClick={exportCSV}
              className="cartoon-btn bg-[#1565c0] text-white font-bangers text-base px-4 py-2 tracking-wider flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              EXPORT CSV
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-[#555] text-xs font-mono tracking-wider">LOADING RESPONSE DATA...</div>
          ) : responses.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-4xl mb-4">📭</div>
              <h3 className="font-black text-[#1a1a1a] mb-2 tracking-wider text-sm">NO RESPONSES YET</h3>
              <p className="text-[#555] text-xs font-mono tracking-wide">RESPONSES WILL APPEAR HERE ONCE DATA COLLECTION BEGINS</p>
              {form?.status === "draft" && (
                <Link
                  href={`/dashboard/forms/${formId}`}
                  className="inline-flex items-center gap-2 mt-4 border border-[#cc0000] bg-[#cc0000] px-4 py-2 text-xs font-black text-[#1a1a1a] hover:bg-[#aa0000] tracking-widest uppercase"
                >
                  PUBLISH FORM
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-red-900/10">
              {responses.map((r: any, idx: number) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedResponse(r.id)}
                  className={`flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-[#fffde7] transition-colors ${
                    selectedResponse === r.id ? "bg-[#fff9c4] border-l-[3px] border-[#cc0000]" : ""
                  }`}
                >
                  <div className="h-9 w-9 border border-[#ccc] bg-[#fff9c4] flex items-center justify-center text-[#cc0000] text-xs font-black flex-shrink-0 font-mono">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-[#1a1a1a] truncate tracking-wide">
                      {r.respondentName ?? r.respondentEmail ?? `RESPONSE #${idx + 1}`}
                    </p>
                    {r.respondentEmail && (
                      <p className="text-xs text-[#555] truncate font-mono">{r.respondentEmail}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[#555] font-mono">
                      {r.createdAt ? formatDistanceToNow(new Date(r.createdAt), { addSuffix: true }) : ""}
                    </p>
                    {r.completionTime && (
                      <p className="text-xs text-[#888] flex items-center gap-1 justify-end font-mono">
                        <Clock className="h-3 w-3" /> {r.completionTime}s
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-center gap-4 p-4 border-t border-[#ddd]">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="text-xs text-[#555] hover:text-[#cc0000] disabled:opacity-30 font-mono tracking-wider"
              >
                ← PREV
              </button>
              <span className="text-xs text-[#888] font-mono">
                PAGE {page + 1} / {Math.ceil(total / limit)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * limit >= total}
                className="text-xs text-[#555] hover:text-[#cc0000] disabled:opacity-30 font-mono tracking-wider"
              >
                NEXT →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div className="w-96 overflow-y-auto bg-white">
        {selectedResponse && selectedData ? (
          <div>
            <div className="px-6 py-4 flex items-center justify-between bg-[#1565c0]" style={{ borderBottom:"3px solid #000" }}>
              <h2 className="font-bangers text-xl text-white tracking-widest uppercase">📋 RESPONSE</h2>
              <button onClick={() => setPendingDeleteId(selectedResponse)}
                className="text-white/70 hover:text-white transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6">
              {/* Meta */}
              <div className="space-y-3 mb-6 pb-6 border-b border-[#ddd]">
                {(selectedData as any).respondentName && (
                  <div className="flex items-center gap-2 text-xs">
                    <Eye className="h-3.5 w-3.5 text-[#555]" />
                    <span className="text-[#1a1a1a] font-mono">{(selectedData as any).respondentName}</span>
                  </div>
                )}
                {(selectedData as any).respondentEmail && (
                  <div className="flex items-center gap-2 text-xs">
                    <Mail className="h-3.5 w-3.5 text-[#555]" />
                    <span className="text-[#1a1a1a] font-mono">{(selectedData as any).respondentEmail}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-[#555]">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-mono">
                    {(selectedData as any).createdAt
                      ? format(new Date((selectedData as any).createdAt), "MMM d, yyyy 'at' h:mm a")
                      : ""}
                  </span>
                </div>
              </div>

              {/* Answers */}
              <div className="space-y-5">
                {((selectedData as any).answers ?? []).map((answer: any, idx: number) => (
                  <div key={answer.id}>
                    <p className="text-xs font-black text-[#555] mb-1 font-mono uppercase tracking-widest">
                      [{String(idx + 1).padStart(2, "0")}] {answer.fieldLabel}
                    </p>
                    <p className="text-xs text-[#1a1a1a] border border-[#ddd] bg-[#f9f9f9] px-3 py-2 font-mono">
                      {answer.value ?? <span className="text-[#888] italic">NO ANSWER</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Eye className="h-8 w-8 mx-auto mb-2 text-[#ddd]" />
              <p className="text-xs text-[#555] font-mono tracking-wider">SELECT A RESPONSE TO VIEW DATA</p>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!pendingDeleteId}
        title="DELETE RESPONSE?"
        message="This response and all its answers will be permanently deleted."
        confirmLabel="DELETE!"
        onConfirm={() => { deleteMutation.mutate({ formId, responseId: pendingDeleteId! }); setPendingDeleteId(null); setSelectedResponse(null); }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
