"use client";

import AuthGate from "@/components/AuthGate";
import DashboardLayout from "@/components/DashboardLayout";
import AdminUserManager from "@/components/AdminUserManager";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function AdminInner() {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsub = auth.onAuthStateChanged((user) => {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

      // If not logged in or not the admin → silently redirect to home
      if (!user || !adminEmail || user.email !== adminEmail) {
        router.replace("/");
        setAllowed(false);
        setLoading(false);
        return;
      }

      // You are the owner → show admin panel
      setAllowed(true);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  if (loading) return <p className="text-slate-300">Loading...</p>;
  if (!allowed) return null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">👑</span>
            <h1 className="text-4xl font-black">God Mode</h1>
          </div>
          <p className="text-slate-400">
            Founder-only dashboard. Full user management, bans, tier control, and platform oversight.
          </p>
        </div>

        {/* User Manager Component */}
        <AdminUserManager />

        <p className="text-xs text-slate-500">
          — LitLabs Business OS™ God Mode 👑
        </p>
      </div>
    </DashboardLayout>
  );
}

export default function AdminPage() {
  return (
    <main>
      <AuthGate>
        <AdminInner />
      </AuthGate>
    </main>
  );
}
