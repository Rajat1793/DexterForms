"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "~/components/ui/confirm-modal";
import { NewFormButton } from "~/components/ui/new-form-button";
import { trpc } from "~/trpc/client";
import { useAuth } from "~/providers/auth";
import { FileText, Users, Globe, Copy, Trash2, MoreHorizontal, ExternalLink } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const STATUS_BADGE: Record<string, string> = {
  draft: "badge-draft",
  published: "badge-published",
  closed: "badge-closed",
};
const CARD_COLORS = ["bg-[#cc0000]","bg-[#1565c0]","bg-[#00a86b]","bg-[#ff8c00]","bg-[#7b1fa2]","bg-[#ff69b4]"];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: stats } = trpc.forms.stats.useQuery();
  const { data: forms, isLoading } = trpc.forms.list.useQuery();

  const deleteMutation = trpc.forms.delete.useMutation({
    onSuccess: () => { toast.success("Form deleted"); utils.forms.list.invalidate(); utils.forms.stats.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const duplicateMutation = trpc.forms.duplicate.useMutation({
    onSuccess: () => { toast.success("Form duplicated!"); utils.forms.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const copyLink = (slug: string | null) => {
    if (!slug) return toast.error("Form has no public link yet");
    navigator.clipboard.writeText(`${window.location.origin}/f/${slug}`);
    toast.success("Link copied!");
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="burst-badge text-[#1a1a1a] px-3 py-0.5 text-sm mb-2 inline-block">🧪 LABORATORY CONTROL PANEL</div>
          <h1 className="font-bangers text-stroke-black text-[#cc0000] tracking-wide" style={{ fontSize:"clamp(2rem,5vw,3.5rem)" }}>
            WELCOME, {user?.fullName.split(" ")[0]?.toUpperCase()}!
          </h1>
          <p className="font-bold text-[#555] text-sm mt-1">MANAGE EXPERIMENTS & TRACK DATA COLLECTION</p>
        </div>
        <NewFormButton
          label="NEW EXPERIMENT"
          className="cartoon-btn bg-[#cc0000] text-white font-bangers text-xl px-5 py-2.5 tracking-wider flex items-center gap-2"
        />
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {[
          { label:"TOTAL FORMS",  value:stats?.totalForms ?? 0,      icon:FileText, color:"bg-[#cc0000]" },
          { label:"PUBLISHED",    value:stats?.publishedForms ?? 0,  icon:Globe,    color:"bg-[#1565c0]" },
          { label:"RESPONSES",    value:stats?.totalResponses ?? 0,  icon:Users,    color:"bg-[#00a86b]" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="cartoon-card bg-white overflow-hidden">
              <div className={`${stat.color} px-5 py-3 flex items-center gap-3`} style={{ borderBottom:"3px solid #000" }}>
                <Icon className="h-6 w-6 text-white" />
                <span className="font-bold text-white text-sm tracking-widest uppercase">{stat.label}</span>
              </div>
              <div className="px-5 py-4">
                <div className="font-bangers text-stroke-black text-[#1a1a1a]" style={{ fontSize:"clamp(2.5rem,5vw,4rem)" }}>
                  {stat.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FORMS LIST */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bangers text-2xl text-[#1a1a1a] tracking-wide">// YOUR EXPERIMENTS</h2>
          <Link href="/dashboard/forms" className="font-bangers text-sm text-[#cc0000] tracking-wider hover:underline">VIEW ALL →</Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-44 bg-[#f0f0f0] animate-pulse" style={{ border:"3px solid #000", boxShadow:"4px 4px 0 #000" }} />
            ))}
          </div>
        ) : !forms || forms.length === 0 ? (
          <div className="cartoon-card bg-white p-12 text-center">
            <div className="text-6xl mb-4">🔬</div>
            <h3 className="font-bangers text-2xl text-[#1a1a1a] tracking-wide mb-2">NO EXPERIMENTS YET!</h3>
            <p className="text-[#555] font-bold mb-6">Your laboratory is empty. Time to create your first experiment!</p>
            <Link href="/dashboard/forms/new" className="cartoon-btn bg-[#cc0000] text-white font-bangers text-xl px-6 py-3 tracking-wider inline-flex items-center gap-2">
              CREATE FIRST FORM
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(forms ?? []).slice(0, 6).map((form, i) => (
              <div key={form.id} className="cartoon-card bg-white overflow-hidden cursor-pointer group hover:-translate-y-0.5 transition-transform"
                onClick={() => router.push(`/dashboard/forms/${form.id}`)}>
                <div className={`${CARD_COLORS[i % CARD_COLORS.length]} px-4 py-3 flex items-center justify-between`}
                  style={{ borderBottom:"3px solid #000" }}>
                  <span className="font-bangers text-white text-base tracking-wide truncate">{form.title}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-white/80 hover:text-white p-1" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="cartoon-card bg-white w-44">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/forms/${form.id}`); }} className="font-bold cursor-pointer">
                        <FileText className="h-4 w-4 mr-2" /> Edit Form
                      </DropdownMenuItem>
                      {form.slug && (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`/f/${form.slug}`, "_blank"); }} className="font-bold cursor-pointer">
                          <ExternalLink className="h-4 w-4 mr-2" /> View Live
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); copyLink(form.slug ?? null); }} className="font-bold cursor-pointer">
                        <Copy className="h-4 w-4 mr-2" /> Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); duplicateMutation.mutate({ id: form.id }); }} className="font-bold cursor-pointer">
                        <Copy className="h-4 w-4 mr-2" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setPendingDeleteId(form.id); }} className="font-bold text-[#cc0000] cursor-pointer">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="p-4">
                  {form.description && <p className="text-xs text-[#555] mb-3 line-clamp-2">{form.description}</p>}
                  <div className="flex items-center justify-between">
                    <span className={`${STATUS_BADGE[form.status] ?? "badge-draft"} text-xs px-2 py-0.5`}>{form.status}</span>
                    <span className="text-xs text-[#888] font-bold">
                      {form.updatedAt ? formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true }) : ""}
                    </span>
                  </div>
                </div>
              </div>
            ))}          </div>
        )}
      </div>

      <ConfirmModal
        open={!!pendingDeleteId}
        message="This form and all its responses will be permanently deleted."
        onConfirm={() => { deleteMutation.mutate({ id: pendingDeleteId! }); setPendingDeleteId(null); }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
