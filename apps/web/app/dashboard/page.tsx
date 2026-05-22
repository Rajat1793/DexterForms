"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { useAuth } from "~/providers/auth";
import {
  Plus,
  FileText,
  Users,
  TrendingUp,
  BarChart2,
  ArrowRight,
  Clock,
  Globe,
  Lock,
  Copy,
  Trash2,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-yellow-900/20 text-yellow-400 border border-yellow-700/30",
  published: "bg-green-900/20 text-green-400 border border-green-700/30",
  closed: "bg-lime-900/20 text-lime-400 border border-lime-700/30",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: stats } = trpc.forms.stats.useQuery();
  const { data: forms, isLoading } = trpc.forms.list.useQuery();

  const deleteMutation = trpc.forms.delete.useMutation({
    onSuccess: () => {
      toast.success("Form deleted");
      utils.forms.list.invalidate();
      utils.forms.stats.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const duplicateMutation = trpc.forms.duplicate.useMutation({
    onSuccess: () => {
      toast.success("Form duplicated!");
      utils.forms.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const copyLink = (slug: string | null) => {
    if (!slug) return toast.error("Form has no public link yet");
    const url = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="p-8 font-mono">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="text-xs text-blue-400/80 tracking-widest mb-1 uppercase">// LABORATORY CONTROL PANEL</div>
          <h1 className="text-2xl font-black text-white tracking-wider uppercase">
            WELCOME, {user?.fullName.split(" ")[0].toUpperCase()}
          </h1>
          <p className="text-blue-300 mt-1 text-xs tracking-wide">
            MANAGE EXPERIMENTS &amp; TRACK DATA COLLECTION
          </p>
        </div>
        <Link
          href="/dashboard/forms/new"
          className="flex items-center gap-2 rounded-none border border-lime-600 bg-lime-600 px-5 py-2.5 text-xs font-black text-white hover:bg-lime-700 tracking-widest uppercase transition-colors"
        >
          <Plus className="h-4 w-4" />
          NEW EXPERIMENT
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          {
            label: "TOTAL FORMS",
            value: stats?.totalForms ?? 0,
            icon: FileText,
            color: "text-lime-400",
            bg: "bg-lime-900/20",
            border: "border-lime-900/30",
            tag: "EXP",
          },
          {
            label: "PUBLISHED",
            value: stats?.publishedForms ?? 0,
            icon: Globe,
            color: "text-green-400",
            bg: "bg-green-900/20",
            border: "border-green-900/30",
            tag: "LIVE",
          },
          {
            label: "RESPONSES",
            value: stats?.totalResponses ?? 0,
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-900/20",
            border: "border-blue-900/30",
            tag: "DATA",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`rounded-none border ${stat.border} bg-[#0f1520] p-6`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`h-10 w-10 ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span className={`text-xs font-black ${stat.color} tracking-widest border ${stat.border} px-2 py-0.5`}>{stat.tag}</span>
              </div>
              <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-blue-400 mt-1 tracking-widest">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Forms list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-white tracking-widest uppercase">// YOUR EXPERIMENTS</h2>
          <Link href="/dashboard/forms" className="text-xs text-lime-400 hover:text-lime-300 font-black tracking-wider uppercase">
            VIEW ALL →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-lime-900/20 bg-[#0f1520] p-6 animate-pulse">
                <div className="h-4 bg-lime-900/20 rounded w-3/4 mb-3" />
                <div className="h-3 bg-lime-900/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : forms?.length === 0 ? (
          <div className="border-2 border-dashed border-lime-900/30 p-16 text-center">
            <FileText className="h-12 w-12 text-lime-900/50 mx-auto mb-4" />
            <h3 className="font-black text-white mb-2 tracking-wider">NO EXPERIMENTS YET</h3>
            <p className="text-blue-400 text-xs mb-6 tracking-wide">INITIALIZE YOUR FIRST EXPERIMENT TO BEGIN DATA COLLECTION</p>
            <Link
              href="/dashboard/forms/new"
              className="inline-flex items-center gap-2 border border-lime-600 bg-lime-600 px-6 py-3 text-xs font-black text-white hover:bg-lime-700 tracking-widest uppercase"
            >
              <Plus className="h-4 w-4" />
              CREATE FORM
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms?.slice(0, 9).map((form) => (
              <div
                key={form.id}
                className="group border border-lime-900/20 bg-[#0f1520] p-6 hover:border-lime-500/40 transition-all cursor-pointer"
                onClick={() => router.push(`/dashboard/forms/${form.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-white truncate tracking-wide text-sm">{form.title}</h3>
                    {form.description && (
                      <p className="text-blue-400 text-xs mt-1 truncate font-mono">{form.description}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <button className="p-1 hover:bg-lime-900/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4 text-blue-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#0f1520] border-lime-900/40 rounded-none">
                      {form.status === "published" && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            copyLink(form.slug);
                          }}
                          className="text-blue-300 font-mono text-xs hover:bg-lime-900/20 focus:bg-lime-900/20"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy link
                        </DropdownMenuItem>
                      )}
                      {form.slug && form.status === "published" && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/f/${form.slug}`, "_blank");
                          }}
                          className="text-blue-300 font-mono text-xs hover:bg-lime-900/20 focus:bg-lime-900/20"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open form
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateMutation.mutate({ id: form.id });
                        }}
                        className="text-blue-300 font-mono text-xs hover:bg-lime-900/20 focus:bg-lime-900/20"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-lime-900/20" />
                      <DropdownMenuItem
                        className="text-lime-400 font-mono text-xs hover:bg-lime-900/20 focus:bg-lime-900/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete this form? This cannot be undone.")) {
                            deleteMutation.mutate({ id: form.id });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-2 py-0.5 text-xs font-black uppercase tracking-wider ${STATUS_COLORS[form.status] ?? STATUS_COLORS.draft}`}>
                    {form.status}
                  </span>
                  <span className="text-blue-400 text-xs font-mono">
                    {form.responseCount ?? 0} responses
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-blue-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {form.createdAt
                      ? formatDistanceToNow(new Date(form.createdAt), { addSuffix: true })
                      : "Recently"}
                  </span>
                  <span className="flex items-center gap-1 text-lime-400 opacity-0 group-hover:opacity-100 transition-opacity font-black tracking-wider">
                    EDIT <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
