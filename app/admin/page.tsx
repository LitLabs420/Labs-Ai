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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-slate-300">
            Founder-only view. Manage users and platform settings here.
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
                  {user.businessName || "(no business)"}
                </p>
                <div className="grid grid-cols-2 gap-2 text-slate-400 text-xs">
                  <div>Name: {user.name || "-"}</div>
                  <div>Services: {user.services || "-"}</div>
                  <div>Email: {user.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          — LitLabs Business OS™
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
