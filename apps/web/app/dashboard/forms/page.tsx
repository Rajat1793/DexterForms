"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Plus, Search, MoreVertical, Eye, Copy, BarChart2, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const STATUS_COLORS: Record<string, string> = {
  published: "bg-green-900/20 text-green-400 border border-green-700/30",
  draft: "bg-yellow-900/20 text-yellow-400 border border-yellow-700/30",
  closed: "bg-lime-900/20 text-lime-400 border border-lime-700/30",
};

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
    <div className="p-8 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs text-blue-400/80 tracking-widest mb-1 uppercase">// EXPERIMENT ARCHIVE</div>
          <h1 className="text-2xl font-black text-white tracking-wider uppercase">ALL FORMS</h1>
          <p className="text-blue-400 text-xs mt-0.5 font-mono">{forms?.length ?? 0} experiments on record</p>
        </div>
        <Link
          href="/dashboard/forms/new"
          className="flex items-center gap-2 rounded-none border border-lime-600 bg-lime-600 px-4 py-2.5 text-xs font-black text-white hover:bg-lime-700 tracking-widest uppercase transition-colors"
        >
          <Plus className="h-4 w-4" />
          NEW FORM
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH EXPERIMENTS..."
            className="w-full rounded-none border border-lime-900/30 bg-[#080d14] py-2.5 pl-9 pr-4 text-xs text-blue-100 font-mono focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500/20 placeholder:text-blue-600 tracking-wider"
          />
        </div>
        <div className="flex gap-2">
          {["all", "published", "draft", "closed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
                statusFilter === s
                  ? "bg-lime-600 text-white border border-lime-600"
                  : "border border-lime-900/30 text-blue-300 hover:bg-lime-900/10 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Form list */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-lime-900/10 border border-lime-900/20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-lime-900/30 p-20 text-center">
          <FileText className="h-10 w-10 text-lime-900/40 mb-3" />
          <h3 className="font-black text-white mb-1 tracking-wider">
            {search ? "NO EXPERIMENTS MATCH" : "NO EXPERIMENTS YET"}
          </h3>
          <p className="text-blue-400 text-xs mb-5 font-mono">
            {search ? "TRY A DIFFERENT SEARCH TERM OR FILTER" : "INITIALIZE YOUR FIRST EXPERIMENT TO BEGIN"}
          </p>
          {!search && (
            <Link
              href="/dashboard/forms/new"
              className="flex items-center gap-2 border border-lime-600 bg-lime-600 px-4 py-2.5 text-xs font-black text-white hover:bg-lime-700 tracking-widest uppercase"
            >
              <Plus className="h-4 w-4" />
              CREATE FORM
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((form) => (
            <div
              key={form.id}
              className="group relative border border-lime-900/20 bg-[#0f1520] p-5 hover:border-lime-500/40 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-0.5 text-xs font-black uppercase tracking-wider ${STATUS_COLORS[form.status] ?? STATUS_COLORS["draft"]}`}>
                  {form.status}
                </span>
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === form.id ? null : form.id); }}
                    className="p-1.5 text-blue-400 hover:bg-lime-900/20 hover:text-blue-200 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {openMenu === form.id && (
                    <div className="absolute right-0 top-8 z-10 w-48 border border-lime-900/40 bg-[#080d14] shadow-lg shadow-lime-900/10 py-1">
                      {form.status === "published" && (
                        <button
                          onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/f/${form.slug}`); toast.success("Link copied!"); setOpenMenu(null); }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-blue-300 hover:bg-lime-900/20 font-mono tracking-wider"
                        >
                          <Copy className="h-3.5 w-3.5" /> COPY LINK
                        </button>
                      )}
                      {form.status === "published" && (
                        <a
                          href={`/f/${form.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-blue-300 hover:bg-lime-900/20 font-mono tracking-wider"
                          onClick={() => setOpenMenu(null)}
                        >
                          <Eye className="h-3.5 w-3.5" /> VIEW LIVE
                        </a>
                      )}
                      <button
                        onClick={() => { duplicateMutation.mutate({ id: form.id }); setOpenMenu(null); }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-blue-300 hover:bg-lime-900/20 font-mono tracking-wider"
                      >
                        <Copy className="h-3.5 w-3.5" /> DUPLICATE
                      </button>
                      <Link
                        href={`/dashboard/forms/${form.id}/analytics`}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-blue-300 hover:bg-lime-900/20 font-mono tracking-wider"
                        onClick={() => setOpenMenu(null)}
                      >
                        <BarChart2 className="h-3.5 w-3.5" /> ANALYTICS
                      </Link>
                      <div className="border-t border-lime-900/20 my-1" />
                      <button
                        onClick={() => {
                          if (confirm("Delete this form permanently?")) {
                            deleteMutation.mutate({ id: form.id });
                          }
                          setOpenMenu(null);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-lime-400 hover:bg-lime-900/20 font-mono tracking-wider"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> DELETE
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <Link href={`/dashboard/forms/${form.id}`} className="block">
                <h3 className="font-black text-white text-sm leading-snug mb-1 line-clamp-2 tracking-wide">
                  {form.title}
                </h3>
                <div className="flex items-center gap-3 mt-3 text-xs text-blue-400 font-mono">
                  <span>{(form as any).responseCount ?? 0} responses</span>
                  <span>·</span>
                  <span>{timeAgo((form as any).createdAt)}</span>
                </div>
              </Link>

              {/* Bottom action bar */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-lime-900/20">
                <Link
                  href={`/dashboard/forms/${form.id}`}
                  className="flex-1 text-center text-xs font-black text-blue-300 hover:text-lime-400 py-1 tracking-widest uppercase transition-colors"
                >
                  EDIT
                </Link>
                <Link
                  href={`/dashboard/forms/${form.id}/analytics`}
                  className="flex-1 text-center text-xs font-black text-blue-300 hover:text-blue-100 py-1 tracking-widest uppercase transition-colors"
                >
                  STATS
                </Link>
                {form.status === "published" && form.slug && (
                  <a
                    href={`/f/${form.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center text-xs font-black text-blue-300 hover:text-green-400 py-1 tracking-widest uppercase transition-colors"
                  >
                    LIVE
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
