"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const plans = [
  {
    name: "Basic",
    price: 49,
    priceIdEnv: "REDACTED_SECRET_Generic_long_secret",
    description: "Perfect to start",
    bullets: [
      "Daily posts & captions",
      "Hashtags pack",
      "DM booking scripts",
      "Slow-day promos",
      "Fraud detection",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: 99,
    priceIdEnv: "NEXT_PUBLIC_STRIPE_PRO_PRICE_ID",
    description: "Most popular",
    featured: true,
    bullets: [
      "Everything in Basic",
      "7-day content packs",
      "Custom tone & brand",
      "Monthly growth plan",
      "Client reactivation flows",
      "Priority support",
    ],
  },
  {
    name: "Deluxe",
    price: 149,
    priceIdEnv: "REDACTED_SECRET_Generic_long_secret",
    description: "For power users",
    bullets: [
      "Everything in Pro",
      "Holiday promo packs",
      "Daily schedule filler",
      "Weekly audit ideas",
      "Broadcast script packs",
      "1-on-1 onboarding",
    ],
  },
];

export default function PricingTable() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSelectPlan = async (plan: (typeof plans)[number]) => {
    setLoading(plan.name);
    setError("");

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceIdEnv: plan.priceIdEnv,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(null);
        return;
      }

      if (data.url) {
        router.push(data.url);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create checkout session";
      setError(errorMessage);
      setLoading(null);
    }
  };

  return (
    <section id="pricing" className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold">Simple, Transparent Pricing</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Cancel anytime. No contracts. All plans include unlimited access to
          your LitLabs AI.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-200 px-6 py-4 rounded max-w-2xl mx-auto">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-lg p-6 flex flex-col justify-between transition ${
              plan.featured
                ? "border-2 border-pink-500 bg-gray-900 scale-105"
                : "border border-gray-700 bg-gray-950"
            }`}
          >
            {plan.featured && (
              <div className="text-center mb-4">
                <span className="inline-block bg-pink-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div>
              <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-gray-400 ml-2">/month</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-sm">
                    <span className="text-pink-500 mt-1">✓</span>
                    <span className="text-gray-300">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan(plan)}
              disabled={loading === plan.name}
              className={`w-full px-4 py-3 rounded font-semibold text-sm transition ${
                plan.featured
                  ? "bg-pink-500 hover:bg-pink-600 text-white"
                  : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
              } ${loading === plan.name ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading === plan.name ? "Loading..." : `Start ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
