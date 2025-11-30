"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import DashboardLayout from "@/components/DashboardLayout";

interface UserProfile {
  displayName: string;
  email: string;
  tier: string;
  createdAt: string;
  totalRequests: number;
  requestsThisMonth: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfile({
            displayName: data.displayName || user.displayName || "User",
            email: user.email || "",
            tier: data.tier || "free",
            createdAt: data.createdAt?.toDate?.().toLocaleDateString() || "Unknown",
            totalRequests: data.totalRequests || 0,
            requestsThisMonth: data.requestsThisMonth || 0,
          });
          setDisplayName(data.displayName || user.displayName || "");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;

    setError("");
    setMessage("");

    try {
      // Update Firestore
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        displayName,
      });

      setMessage("✅ Profile updated successfully");
      setEditing(false);
      setProfile((prev) => (prev ? { ...prev, displayName } : null));

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      const error = err as Error;
      setError(`❌ Failed to update profile: ${error.message}`);
    }
  };

  const handleUpdatePassword = async () => {
    if (!auth.currentUser) return;

    setError("");
    setMessage("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await updatePassword(auth.currentUser, newPassword);
      setMessage("✅ Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      const error = err as Error;
      setError(`❌ Failed to update password: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">Loading profile...</div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-red-500">Failed to load profile</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        {message && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500 rounded-lg text-green-400">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Profile Information */}
        <div className="mb-8 p-6 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg border border-slate-600">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>

          {!editing ? (
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-sm">Name</p>
                <p className="text-white text-lg">{profile.displayName}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Email</p>
                <p className="text-white text-lg">{profile.email}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Current Plan</p>
                <p className="text-lg font-semibold">
                  <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    {profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Member Since</p>
                <p className="text-white">{profile.createdAt}</p>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm">Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full mt-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setDisplayName(profile.displayName);
                  }}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Usage Statistics */}
        <div className="mb-8 p-6 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg border border-slate-600">
          <h2 className="text-xl font-semibold mb-4">Usage Statistics</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <p className="text-slate-400 text-sm">Requests This Month</p>
              <p className="text-2xl font-bold text-cyan-400">
                {profile.requestsThisMonth}
              </p>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <p className="text-slate-400 text-sm">Total Requests</p>
              <p className="text-2xl font-bold text-purple-400">
                {profile.totalRequests}
              </p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="p-6 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg border border-slate-600">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>

          <div className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full mt-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full mt-2 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleUpdatePassword}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
