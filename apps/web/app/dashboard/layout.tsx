"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "~/providers/auth";
import { LayoutDashboard, FileText, LogOut, ChevronDown, Menu, X } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { RandomMascot } from "~/components/ui/mascot-stickers";
import { NewFormButton } from "~/components/ui/new-form-button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close drawer on route change (mobile navigation)
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/auth/login");
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-polka-yellow">
        <div className="cartoon-card bg-white p-10 text-center">
          <div className="font-bangers text-4xl text-[#cc0000] tracking-widest mb-2 animate-pulse" style={{ WebkitTextStroke:"2px #000" }}>
            🧪 LOADING LAB...
          </div>
          <p className="font-bold text-[#555] text-sm">Warming up the experiments...</p>
        </div>
      </div>
    );
  }
  if (!user) return null;

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    router.push("/");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/forms", label: "My Forms", icon: FileText, exact: false },
  ];

  const SidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom:"3px solid #000" }}>
        <Link href="/" className="block">
          <Image src="/dexterlogo.png" alt="DexterForms" height={36} width={140} className="object-contain" style={{ height: "auto" }} />
        </Link>
        {/* Close button — mobile only */}
        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-[#555] hover:text-[#cc0000]">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* New form CTA */}
      <div className="px-4 pt-4 pb-2">
        <NewFormButton />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 font-bold text-sm uppercase tracking-wide transition-all"
              style={isActive
                ? { background:"#fff9c4", borderLeft:"4px solid #cc0000", color:"#cc0000", border:"2px solid #000", boxShadow:"2px 2px 0 #000" }
                : { color:"#1a1a1a", border:"2px solid transparent" }}>
              <Icon className={`h-4 w-4 ${isActive ? "text-[#cc0000]" : "text-[#555]"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User area */}
      <div className="px-3 py-4" style={{ borderTop:"3px solid #000" }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[#fffde7] transition-colors font-bold text-sm text-left"
              style={{ border:"2px solid #000", boxShadow:"2px 2px 0 #000" }}>
              <div className="h-8 w-8 bg-[#cc0000] flex items-center justify-center font-bangers text-white text-lg"
                style={{ border:"2px solid #000" }}>
                {user.fullName[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#1a1a1a] truncate">{user.fullName}</p>
                <p className="text-xs text-[#888] truncate">{user.email}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-[#555]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 cartoon-card bg-white">
            <DropdownMenuItem disabled className="text-xs text-[#888] font-bold">{user.email}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}
              className="flex items-center gap-2 text-[#cc0000] font-bold cursor-pointer">
              <LogOut className="h-4 w-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mascot — desktop only */}
      <div className="hidden md:flex px-4 pb-2 justify-center opacity-70">
        <RandomMascot width={110} height={110} />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#fffde7] flex">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR — drawer on mobile, fixed on desktop */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white flex flex-col z-40 transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        style={{ borderRight:"4px solid #000", boxShadow:"4px 0 0 #000" }}
      >
        {SidebarContent}
      </aside>

      {/* MAIN CONTENT */}
      <main className="md:ml-64 flex-1 min-h-screen w-full min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden bg-white px-4 py-3 flex items-center gap-3 sticky top-0 z-20"
          style={{ borderBottom:"3px solid #000", boxShadow:"0 3px 0 #000" }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#cc0000] hover:text-[#aa0000] transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/">
            <Image src="/dexterlogo.png" alt="DexterForms" height={28} width={110} className="object-contain" style={{ height:"auto" }} />
          </Link>
        </div>

        <div className="checker-strip hidden md:block" />
        {children}
      </main>
    </div>
  );
}
