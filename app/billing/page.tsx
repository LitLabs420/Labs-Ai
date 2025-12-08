// app/billing/page.tsx
"use client";

import { AuthGate } from "@/components/AuthGate";
import DashboardLayout from "@/components/DashboardLayout";
import { DomainManagement } from "@/components/billing/DomainManagement";
import { useState } from "react";

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<"plans" | "domains" | "methods">(
    "plans"
  );

  return (
    <main>
      <AuthGate>
        <DashboardLayout>
          <div className="space-y-6 max-w-6xl">
            <div>
              <h1 className="text-3xl font-bold mb-2">Billing & Payments</h1>
              <p className="text-slate-300">
                Manage your subscription, custom domains, and payment methods.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-700">
              <button
                onClick={() => setActiveTab("plans")}
                className={`pb-4 px-4 font-semibold transition border-b-2 ${
                  activeTab === "plans"
                    ? "border-cyan-500 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                Subscription Plans
              </button>
              <button
                onClick={() => setActiveTab("domains")}
                className={`pb-4 px-4 font-semibold transition border-b-2 ${
                  activeTab === "domains"
                    ? "border-cyan-500 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                Custom Domains
              </button>
              <button
                onClick={() => setActiveTab("methods")}
                className={`pb-4 px-4 font-semibold transition border-b-2 ${
                  activeTab === "methods"
                    ? "border-cyan-500 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                Payment Methods
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "plans" && (
                <button
                  onClick={async () => {
                    const res = await fetch("/api/create-checkout-session", {
                      method: "POST",
                      body: JSON.stringify({
                        priceIdEnv: "NEXT_PUBLIC_STRIPE_PRICE_FREE",
                      }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-cyan-500 transition text-left font-semibold"
                >
                  🎁 Free Plan → Start
                </button>

                <button
                  onClick={async () => {
                    const res = await fetch("/api/create-checkout-session", {
                      method: "POST",
                      body: JSON.stringify({
                        priceIdEnv: "NEXT_PUBLIC_STRIPE_PRICE_FREEMIUM",
                      }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-orange-500 transition text-left font-semibold"
                >
                  ⭐ Freemium Plan ($19/mo) → Upgrade
                </button>

                <button
                  onClick={async () => {
                    const res = await fetch("/api/create-checkout-session", {
                      method: "POST",
                      body: JSON.stringify({
                        priceIdEnv: "NEXT_PUBLIC_STRIPE_PRICE_STARTER",
                      }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-blue-500 transition text-left font-semibold"
                >
                  🚀 Starter Plan ($49/mo) → Upgrade
                </button>

                <button
                  onClick={async () => {
                    const res = await fetch("/api/create-checkout-session", {
                      method: "POST",
                      body: JSON.stringify({
                        priceIdEnv: "NEXT_PUBLIC_STRIPE_PRICE_PRO",
                      }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-pink-500/20 border border-pink-500/50 hover:border-pink-500 transition text-left font-semibold text-pink-300"
                >
                  ⚡ Pro Plan ($99/mo) → Upgrade
                </button>

                <button
                  onClick={async () => {
                    const res = await fetch("/api/create-checkout-session", {
                      method: "POST",
                      body: JSON.stringify({
                        priceIdEnv: "NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE",
                      }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-purple-500/20 border border-purple-500/50 hover:border-purple-500 transition text-left font-semibold text-purple-300"
                >
                  👑 Deluxe Plan ($199/mo) → Upgrade
                </button>
              </div>
            )}

            {activeTab === "domains" && <DomainManagement />}

            {activeTab === "methods" && (
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Payment Methods</h2>
                <p className="text-slate-400">
                  Manage your payment methods and billing information.
                </p>
              </div>
            )}

            <p className="text-xs text-slate-500">
              — Powered by LitLabs Business OS™ 🔥
            </p>
          </div>
        </DashboardLayout>
      </AuthGate>
    </main>
  );
}
