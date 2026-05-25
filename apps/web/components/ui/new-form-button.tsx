"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/providers/auth";
import { trpc } from "~/trpc/client";
import { Plus } from "lucide-react";
import { UpgradeModal } from "./upgrade-modal";

const FREE_FORM_LIMIT = 3;

interface NewFormButtonProps {
  label?: string;
  className?: string;
}

export function NewFormButton({ label = "NEW FORM!", className }: NewFormButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const { data: stats } = trpc.forms.stats.useQuery();

  function handleClick() {
    if (user?.plan === "FREE" && (stats?.totalForms ?? 0) >= FREE_FORM_LIMIT) {
      setShowUpgrade(true);
      return;
    }
    router.push("/dashboard/forms/new");
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={
          className ??
          "cartoon-btn bg-[#cc0000] text-white font-bangers text-xl px-4 py-2.5 tracking-wider flex items-center justify-center gap-2 w-full"
        }
      >
        <Plus className="h-5 w-5" />
        {label}
      </button>
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  );
}
