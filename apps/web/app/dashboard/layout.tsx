"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "~/providers/auth";
import { LayoutDashboard, FileText, LogOut, Plus, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

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

  return (
    <div className="min-h-screen bg-[#fffde7] flex">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white flex flex-col z-40"
        style={{ borderRight:"4px solid #000", boxShadow:"4px 0 0 #000" }}>

        {/* Logo */}
        <div className="px-5 py-4" style={{ borderBottom:"3px solid #000" }}>
          <Link href="/" className="block">
            <Image src="/dexterlogo.png" alt="ChaiForms" height={36} width={140} className="object-contain" />
          </Link>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#00a86b] animate-pulse" style={{ border:"1px solid #000" }} />
            <span className="text-xs font-bold text-[#00a86b] tracking-wider uppercase">LAB ONLINE</span>
          </div>
        </div>

        {/* New form CTA */}
        <div className="px-4 pt-4 pb-2">
          <Link href="/dashboard/forms/new"
            className="cartoon-btn bg-[#cc0000] text-white font-bangers text-xl px-4 py-2.5 tracking-wider flex items-center justify-center gap-2 w-full">
            <Plus className="h-5 w-5" />
            NEW FORM!
          </Link>
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

        {/* Mascot */}
        <div className="px-4 pb-2 flex justify-center opacity-70">
          <Image src="/dexter1.png" alt="Dexter" width={100} height={100} className="object-contain" />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 flex-1 min-h-screen">
        <div className="checker-strip" />
        {children}
      </main>
    </div>
  );
}
