"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navLinks = [
  { href: "/dashboard", label: "Home" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/profile", label: "Profile" },
  { href: "/billing", label: "Billing" },
  { href: "/history", label: "History" },
];

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            LitLabs Business OS™
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-white text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <aside className="w-48 flex-shrink-0">
            <div className="sticky top-24 border border-slate-700 rounded-lg p-3 bg-slate-900/50">
              <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wide">
                Navigation
              </p>
              <nav className="space-y-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-3 py-2 rounded text-sm font-medium transition ${
                        isActive
                          ? "bg-pink-500 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                
                {/* Admin Link */}
                <Link
                  href="/admin"
                  className={`block mt-4 pt-2 px-3 py-2 rounded text-xs font-medium border transition ${
                    pathname === "/admin"
                      ? "border-pink-500 bg-pink-500/10 text-pink-300"
                      : "border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800"
                  }`}
                >
                  👑 Admin
                </Link>
              </nav>
            </div>
          </aside>

          {/* Page Content */}
          <section className="flex-1 min-w-0">
            {children}
          </section>
        </div>
      </main>
    </div>
  );
}
