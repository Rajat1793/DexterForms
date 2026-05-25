"use client";

import { useState } from "react";
import Link from "next/link";
import { ConfirmModal } from "~/components/ui/confirm-modal";
import { trpc } from "~/trpc/client";
import { Plus, Search, MoreVertical, Eye, Copy, BarChart2, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const STATUS_BADGE: Record<string, string> = {
  published: "badge-published",
  draft: "badge-draft",
  closed: "badge-closed",
};
const CARD_COLORS = ["bg-[#cc0000]","bg-[#1565c0]","bg-[#00a86b]","bg-[#ff8c00]","bg-[#7b1fa2]","bg-[#ff69b4]"];

function timeAgo(date: Date | string) {
  const d = new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function FormsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { data: forms, isLoading, refetch } = trpc.forms.list.useQuery(undefined);

  const deleteMutation = trpc.forms.delete.useMutation({
    onSuccess: () => { toast.success("Form deleted"); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const duplicateMutation = trpc.forms.duplicate.useMutation({
    onSuccess: (form) => { toast.success("Form duplicated"); router.push(`/dashboard/forms/${form.id}`); },
    onError: (e) => toast.error(e.message),
  });

  const filtered = (forms ?? []).filter((f) => {
    const matchesSearch = f.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="burst-badge text-[#1a1a1a] px-3 py-0.5 text-sm mb-2 inline-block">🗂️ EXPERIMENT ARCHIVE</div>
          <h1 className="font-bangers text-stroke-black text-[#1a1a1a] tracking-wide" style={{ fontSize:"clamp(2rem,4vw,3rem)" }}>ALL FORMS</h1>
          <p className="font-bold text-[#555] text-sm mt-0.5">{forms?.length ?? 0} experiments on record</p>
        </div>
        <Link href="/dashboard/forms/new"
          className="cartoon-btn bg-[#cc0000] text-white font-bangers text-xl px-5 py-2.5 tracking-wider flex items-center gap-2">
          <Plus className="h-4 w-4" /> NEW FORM
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH EXPERIMENTS..."
            className="w-full pl-9 pr-4 py-2.5 text-sm font-bold text-[#1a1a1a] bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
            style={{ border:"3px solid #000", boxShadow:"3px 3px 0 #000" }} />
        </div>
        <div className="flex gap-2">
          {["all","published","draft","closed"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 py-2 font-bangers text-base uppercase tracking-wider transition-all"
              style={statusFilter === s
                ? { background:"#cc0000", color:"white", border:"3px solid #000", boxShadow:"3px 3px 0 #000" }
                : { background:"white", color:"#1a1a1a", border:"3px solid #000", boxShadow:"3px 3px 0 #000" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Form grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-[#f0f0f0] animate-pulse" style={{ border:"3px solid #000", boxShadow:"4px 4px 0 #000" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="cartoon-card bg-white p-12 text-center">
          <div className="text-6xl mb-4">🔬</div>
          <h3 className="font-bangers text-2xl text-[#1a1a1a] tracking-wide mb-2">
            {search ? "NO MATCHING EXPERIMENTS!" : "NO EXPERIMENTS YET!"}
          </h3>
          <p className="text-[#555] font-bold mb-6">
            {search ? "Try a different search term." : "Create your first form experiment!"}
          </p>
          {!search && (
            <Link href="/dashboard/forms/new" className="cartoon-btn bg-[#cc0000] text-white font-bangers text-xl px-6 py-3 tracking-wider inline-flex items-center gap-2">
              <Plus className="h-5 w-5" /> NEW EXPERIMENT
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((form, i) => (
            <div key={form.id} className="cartoon-card bg-white overflow-hidden group hover:-translate-y-0.5 transition-transform">
              <div className={`${CARD_COLORS[i % CARD_COLORS.length]} px-4 py-3`} style={{ borderBottom:"3px solid #000" }}>
                <h3 className="font-bangers text-lg text-white tracking-wide truncate">{form.title}</h3>
              </div>
              <div className="p-4">
                {form.description && <p className="text-xs text-[#555] mb-3 line-clamp-2">{form.description}</p>}
                <div className="flex items-center justify-between mb-4">
                  <span className={`${STATUS_BADGE[form.status] ?? "badge-draft"} text-xs px-2 py-0.5`}>{form.status}</span>
                  <span className="text-xs text-[#888] font-bold">{form.updatedAt ? timeAgo(form.updatedAt) : ""}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => router.push(`/dashboard/forms/${form.id}`)}
                    className="flex-1 cartoon-btn bg-[#1565c0] text-white font-bangers text-sm py-1.5 tracking-wider">
                    EDIT
                  </button>
                  {form.slug && (
                    <button onClick={() => window.open(`/f/${form.slug}`, "_blank")}
                      className="cartoon-btn bg-white text-[#1a1a1a] font-bangers text-sm py-1.5 px-3 tracking-wider">
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => router.push(`/dashboard/forms/${form.id}/analytics`)}
                    className="cartoon-btn bg-white text-[#1a1a1a] font-bangers text-sm py-1.5 px-3 tracking-wider">
                    <BarChart2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setPendingDeleteId(form.id)}
                    className="cartoon-btn bg-[#cc0000] text-white font-bangers text-sm py-1.5 px-3 tracking-wider">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!pendingDeleteId}
        message="This form and all its responses will be permanently deleted."
        onConfirm={() => { deleteMutation.mutate({ id: pendingDeleteId! }); setPendingDeleteId(null); }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
