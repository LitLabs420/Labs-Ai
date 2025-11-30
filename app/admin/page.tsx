"use client";

import AuthGate from "@/components/AuthGate";
import DashboardLayout from "@/components/DashboardLayout";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function AdminInner() {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState<
    Array<{ id: string; [key: string]: string }>
  >([]);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsub = auth.onAuthStateChanged(async (user) => {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

      // If not logged in or not the admin → silently redirect to home
      if (!user || !adminEmail || user.email !== adminEmail) {
        router.replace("/");
        setAllowed(false);
        setLoading(false);
        return;
      }

      // You are the owner → load data
      setAllowed(true);
      try {
        if (db) {
          const snap = await getDocs(collection(db, "users"));
          const items: Array<{ id: string; [key: string]: string }> = [];
          snap.forEach((docSnap) =>
            items.push({
              id: docSnap.id,
              ...(docSnap.data() as Record<string, string>),
            })
          );
          setUsersList(items);
        }
      } catch (error) {
        console.error("Error loading users:", error);
      }
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
            Founder-only dashboard. Full platform oversight and user management.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-950/40 to-slate-950/40 border border-purple-700/50 rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wide text-purple-400 mb-2">
              📊 Total Users
            </p>
            <p className="text-3xl font-black text-purple-200">
              {usersList.length}
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-950/40 to-slate-950/40 border border-emerald-700/50 rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wide text-emerald-400 mb-2">
              ✅ Active Tier
            </p>
            <p className="text-xl font-semibold text-emerald-200">
              {usersList.filter((u) => u.tier === "pro" || u.tier === "enterprise").length} Pro+
            </p>
          </div>

          <div className="bg-gradient-to-br from-sky-950/40 to-slate-950/40 border border-sky-700/50 rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wide text-sky-400 mb-2">
              🏢 Onboarded
            </p>
            <p className="text-xl font-semibold text-sky-200">
              {usersList.filter((u) => u.businessName).length} businesses
            </p>
          </div>
        </div>

        {/* Users Directory */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-3xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">User Directory</h2>
            <p className="text-sm text-slate-400">
              All registered LitLabs users. Click to view profile data.
            </p>
          </div>

          {usersList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">No users yet. First signup coming soon...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usersList.map((user) => (
                <div
                  key={user.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] transition"
                >
                  {/* Business Name */}
                  <p className="font-bold text-white text-lg mb-3 truncate">
                    {user.businessName || "📦 No Business"}
                  </p>

                  {/* Grid Info */}
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Name:</span>
                      <span className="font-semibold">{user.name || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Location:</span>
                      <span className="font-semibold">{user.city || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Services:</span>
                      <span className="font-semibold text-right">
                        {user.services ? user.services.substring(0, 20) + "..." : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tier:</span>
                      <span
                        className={`font-bold ${
                          user.tier === "enterprise"
                            ? "text-purple-400"
                            : user.tier === "pro"
                              ? "text-pink-400"
                              : "text-slate-400"
                        }`}
                      >
                        {user.tier || "free"}
                      </span>
                    </div>
                  </div>

                  {/* Email (copy-friendly) */}
                  <div className="mt-4 pt-3 border-t border-slate-700">
                    <p className="text-[10px] text-slate-500 mb-1">UID / Email:</p>
                    <p className="text-[11px] font-mono text-slate-300 break-all">
                      {user.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-purple-950/30 via-slate-900/30 to-slate-950/30 border border-purple-700/30 rounded-3xl p-8">
          <h3 className="text-lg font-bold text-purple-300 mb-4">⚡ Quick Info</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>✓ All user data syncs in real-time from Firestore</li>
            <li>✓ Use this view to monitor platform health and user signups</li>
            <li>✓ Profile data auto-saves when users edit their profiles</li>
            <li>✓ Only visible to: {process.env.NEXT_PUBLIC_ADMIN_EMAIL}</li>
          </ul>
        </div>

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
