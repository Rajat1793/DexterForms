"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "~/providers/auth";
import {
  LayoutDashboard,
  FileText,
  LogOut,
  Plus,
  Settings,
  User,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0e1a]">
        <div className="text-center font-mono">
          <div className="h-12 w-12 border-2 border-lime-600 flex items-center justify-center text-lime-500 font-black text-xl mx-auto mb-4">D</div>
          <div className="text-blue-400 text-xs tracking-widest animate-pulse">LOADING LAB...</div>
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
    <div className="min-h-screen bg-[#0a0e1a] font-mono">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#080d14] border-r border-lime-900/20 flex flex-col z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-lime-900/20">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Image src="/dexterlogo.png" alt="Dexter's Forms" height={32} width={120} className="object-contain" />
          </Link>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400/70 tracking-widest">LAB ONLINE</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-xs font-black tracking-widest uppercase transition-colors ${
                  isActive
                    ? "bg-lime-900/20 text-lime-400 border-l-2 border-lime-500"
                    : "text-blue-300 hover:bg-lime-900/10 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Create new form button */}
        <div className="px-4 pb-4">
          <Link
            href="/dashboard/forms/new"
            className="flex items-center justify-center gap-2 w-full rounded-none border border-lime-600 bg-lime-600/10 py-2.5 text-xs font-black text-lime-400 hover:bg-lime-600 hover:text-white tracking-widest uppercase transition-all"
          >
            <Plus className="h-4 w-4" />
            NEW FORM
          </Link>
        </div>

        {/* User */}
        <div className="border-t border-lime-900/20 px-4 py-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-lime-900/10 transition-colors">
                <div className="h-8 w-8 rounded-none border border-lime-700 bg-lime-900/20 flex items-center justify-center text-lime-400 font-black text-xs flex-shrink-0">
                  {user.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-black text-white truncate text-xs tracking-wide">{user.fullName}</p>
                  <p className="text-blue-400 truncate text-xs font-mono">{user.email}</p>
                </div>
                <ChevronDown className="h-3 w-3 text-blue-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#0f1520] border-lime-900/40 rounded-none">
              <DropdownMenuSeparator className="bg-lime-900/20" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-lime-400 cursor-pointer font-mono text-xs tracking-wider hover:bg-lime-900/20 focus:bg-lime-900/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                SIGN OUT
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
