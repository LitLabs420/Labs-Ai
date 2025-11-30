// app/admin/page.tsx
"use client";

import AuthGate from "@/components/AuthGate";
import DashboardLayout from "@/components/DashboardLayout";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

function AdminInner() {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState<
    Array<{ id: string; [key: string]: string }>
  >([]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      if (user && adminEmail && user.email === adminEmail) {
        setAllowed(true);
        // load users
        try {
          const snap = await getDocs(collection(db, "users"));
          const items: Array<{ id: string; [key: string]: string }> = [];
          snap.forEach((docSnap) =>
            items.push({
              id: docSnap.id,
              ...(docSnap.data() as Record<string, string>),
            })
          );
          setUsersList(items);
        } catch (error) {
          console.error("Error loading users:", error);
        }
      } else {
        setAllowed(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <p className="text-slate-300">Loading...</p>;

  if (!allowed)
    return (
      <DashboardLayout>
        <p className="text-red-400">❌ Access denied (admin only).</p>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-slate-300">
            Owner-only view. You can see all user profiles and manage the
            platform here.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-4">
            Total Users: <span className="font-bold text-pink-400">{usersList.length}</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {usersList.length === 0 && (
              <p className="text-slate-400">No users found yet.</p>
            )}
            {usersList.map((user) => (
              <div
                key={user.id}
                className="border border-slate-700 rounded-lg p-4 bg-slate-800/30 text-sm"
              >
                <p className="font-semibold text-slate-100 mb-2">
                  {user.businessName || "(no business)"}{" "}
                  <span className="text-xs text-slate-500">({user.id})</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-slate-400 text-xs">
                  <div>Name: {user.name || "-"}</div>
                  <div>Services: {user.services || "-"}</div>
                  <div>City: {user.city || "-"}</div>
                  <div>Price: {user.priceRange || "-"}</div>
                  <div>Ideal Client: {user.idealClient || "-"}</div>
                  <div>Slow Days: {user.slowDays || "-"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          — Powered by LitLabs Business OS™ 🔥
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
