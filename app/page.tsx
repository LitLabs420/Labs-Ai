"use client";

import PricingTable from "@/components/PricingTable";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="space-y-16">
      {/* Hero Section */}
      <section className="space-y-6 py-12">
        <div className="space-y-4">
          <div className="inline-block">
            <span className="bg-pink-500/10 border border-pink-500/30 text-pink-400 px-3 py-1 rounded-full text-xs font-semibold">
              ✨ Powered by AI
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            AI That Books Clients{" "}
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              For You.
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
            LitLabs AI creates your daily posts, captions, hashtags, DM scripts,
            promos and fraud-proof replies so you can focus on your craft. No
            more guessing what to post.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/50 transition"
          >
            🚀 Get Started Free
          </button>
          <button
            onClick={() =>
              document
                .getElementById("pricing")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-8 py-3 rounded-lg border border-gray-700 hover:border-gray-500 transition"
          >
            See Plans & Pricing
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">What You Get</h2>
          <p className="text-gray-400">
            Everything you need to grow your beauty business on autopilot
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "📱",
              title: "Daily Posts",
              desc: "Fresh content ideas with captions & hashtags every morning",
            },
            {
              icon: "💬",
              title: "DM Scripts",
              desc: "Proven booking messages that actually convert clients",
            },
            {
              icon: "🎯",
              title: "Flash Promos",
              desc: "Fill slow days with limited-time offers that drive urgency",
            },
            {
              icon: "🛡️",
              title: "Fraud Detection",
              desc: "Spot fake leads before you waste time chasing them",
            },
            {
              icon: "🎨",
              title: "Brand Guides",
              desc: "Consistent tone, colors, and messaging across all platforms",
            },
            {
              icon: "📊",
              title: "Growth Plans",
              desc: "Monthly strategies to grow followers and bookings",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-pink-500/50 transition"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <PricingTable />

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-pink-500/10 to-purple-600/10 border border-pink-500/20 rounded-lg p-12 text-center space-y-4">
        <h2 className="text-3xl font-bold">
          Ready to Stop Wasting Hours on Content?
        </h2>
        <p className="text-gray-300 max-w-xl mx-auto">
          Join beauty professionals using LitLabs AI to book more clients,
          faster.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/50 transition"
        >
          Start Your Free Trial →
        </button>
      </section>
    </main>
  );
}
