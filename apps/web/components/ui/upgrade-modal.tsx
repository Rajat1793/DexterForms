"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "~/providers/auth";
import { trpc } from "~/trpc/client";
import { toast } from "sonner";
import { X, Zap, Building2, Loader2 } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const router = useRouter();
  const { updateUser } = useAuth();

  const updatePlanMutation = trpc.auth.updatePlan.useMutation({
    onSuccess: (data) => {
      updateUser({ plan: data.plan });
      toast.success(`Upgraded to ${data.plan}! 🧪 Let's create your form...`);
      onClose();
      router.push("/dashboard/forms/new");
    },
    onError: (err) => toast.error(err.message),
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative cartoon-card bg-white max-w-lg w-full overflow-hidden" style={{ zIndex: 1 }}>

        {/* Header */}
        <div className="bg-[#cc0000] px-6 py-4 flex items-center justify-between" style={{ borderBottom: "3px solid #000" }}>
          <div>
            <div className="font-bangers text-2xl text-white tracking-widest" style={{ WebkitTextStroke: "1px #000" }}>
              🧪 LAB AT CAPACITY!
            </div>
            <p className="text-white/80 text-xs font-bold mt-0.5">FREE plan allows 3 forms maximum</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-white/70 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="font-bold text-[#555] text-sm mb-5 text-center">
            You&apos;ve hit the FREE limit. Upgrade to unlock unlimited forms and experiments!
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* PRO */}
            <button
              onClick={() => updatePlanMutation.mutate({ plan: "PRO" })}
              disabled={updatePlanMutation.isPending}
              className="cartoon-card p-4 text-left hover:-translate-y-0.5 transition-transform disabled:opacity-60 cursor-pointer w-full">
              <div className="bg-[#cc0000] -mx-4 -mt-4 mb-3 px-4 py-2" style={{ borderBottom: "2px solid #000" }}>
                <Zap className="h-4 w-4 text-white mb-1" />
                <div className="font-bangers text-xl text-white tracking-widest">PRO</div>
              </div>
              <div className="font-bangers text-2xl text-[#cc0000]">
                $12<span className="text-sm font-bold text-[#888]">/mo</span>
              </div>
              <ul className="mt-2 space-y-1 text-xs font-bold text-[#555]">
                <li>✓ Unlimited forms</li>
                <li>✓ 10,000 responses/mo</li>
                <li>✓ CSV export</li>
              </ul>
              {updatePlanMutation.isPending && updatePlanMutation.variables?.plan === "PRO" && (
                <Loader2 className="h-4 w-4 animate-spin mt-2 text-[#cc0000]" />
              )}
            </button>

            {/* ENTERPRISE */}
            <button
              onClick={() => updatePlanMutation.mutate({ plan: "ENTERPRISE" })}
              disabled={updatePlanMutation.isPending}
              className="cartoon-card p-4 text-left hover:-translate-y-0.5 transition-transform disabled:opacity-60 cursor-pointer w-full">
              <div className="bg-[#00a86b] -mx-4 -mt-4 mb-3 px-4 py-2" style={{ borderBottom: "2px solid #000" }}>
                <Building2 className="h-4 w-4 text-white mb-1" />
                <div className="font-bangers text-xl text-white tracking-widest">ENTERPRISE</div>
              </div>
              <div className="font-bangers text-2xl text-[#00a86b]">
                $49<span className="text-sm font-bold text-[#888]">/mo</span>
              </div>
              <ul className="mt-2 space-y-1 text-xs font-bold text-[#555]">
                <li>✓ Unlimited everything</li>
                <li>✓ Custom themes</li>
                <li>✓ Webhooks + API</li>
              </ul>
              {updatePlanMutation.isPending && updatePlanMutation.variables?.plan === "ENTERPRISE" && (
                <Loader2 className="h-4 w-4 animate-spin mt-2 text-[#00a86b]" />
              )}
            </button>
          </div>

          <p className="text-center text-xs text-[#888] font-bold mt-4">
            <Link href="/pricing" className="text-[#cc0000] hover:underline" onClick={onClose}>
              View all plans →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
