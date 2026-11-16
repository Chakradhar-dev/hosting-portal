"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Server,
  Layers,
  Globe,
  Receipt,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Package,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login");
        } else if (data.user.role !== "ADMIN") {
          router.push("/dashboard");
        } else {
          setCurrentUser(data.user);
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/servers", label: "WHM Servers", icon: Server },
    { href: "/admin/packages", label: "Hosting Packages", icon: Package },
    { href: "/admin/services", label: "cPanel Accounts", icon: Globe },
    { href: "/admin/invoices", label: "Invoices & Revenue", icon: Receipt },
    { href: "/admin/tickets", label: "Support Desk", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-base block leading-tight">Admin Console</span>
              <span className="text-[10px] text-indigo-400 font-mono">WHM Automation</span>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Switch to Client Portal */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 transition"
          >
            <span>Client View</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur px-8 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Admin</span>
            <span>/</span>
            <span className="text-white capitalize font-medium">
              {pathname.replace("/admin", "").replace("/", "") || "Overview"}
            </span>
          </div>

          {currentUser && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400">Logged in as</span>
              <span className="text-white font-semibold">{currentUser.name}</span>
            </div>
          )}
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
