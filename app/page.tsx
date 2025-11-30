"use client";

import PricingTable from "@/components/PricingTable";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="space-y-20">
      {/* Hero Section - Premium */}
      <section className="relative py-20 overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600/5 via-transparent to-purple-600/5 pointer-events-none" />
        
        <div className="relative space-y-8">
          {/* Top badge */}
          <div className="flex justify-center">
            <span className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-500/40 text-pink-300 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
              ⚡ AI-Powered Growth Platform
            </span>
          </div>

          {/* Main headline */}
          <div className="space-y-6 text-center max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-black leading-tight">
              Stop Guessing.{" "}
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Start Growing.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
              LitLabs AI generates daily posts, DM scripts, promos, and client-booking strategies—so you can focus on what you do best.
            </p>

            {/* Subheading with social proof */}
            <p className="text-sm text-gray-400">
              ⭐ Trusted by 100+ beauty & wellness professionals
            </p>
          </div>

          {/* CTA Buttons - Premium styling */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="group px-8 py-4 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg hover:shadow-2xl hover:shadow-pink-500/50 transition transform hover:scale-105"
            >
              🚀 Start Free Trial
              <span className="inline-block ml-2 group-hover:translate-x-1 transition">→</span>
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("pricing")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-8 py-4 rounded-lg border-2 border-gray-600 hover:border-pink-500 text-white font-bold text-lg hover:bg-pink-500/10 transition"
            >
              View Pricing
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span> No credit card required
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span> 14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Cancel anytime
            </div>
          </div>
        </div>
      </section>


      {/* Features Section - Premium Grid */}
      <section className="space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-5xl md:text-5xl font-bold">
            Everything You Need{" "}
            <span className="text-gray-500">to Book More Clients</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Get AI-powered content, proven sales scripts, and growth strategies—all in one place.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: "📱",
              title: "Daily Content Engine",
              desc: "Fresh post ideas with captions, hashtags & CTAs. Never run out of content ideas again.",
              color: "from-pink-500/20 to-pink-600/10",
            },
            {
              icon: "💬",
              title: "DM Sales Scripts",
              desc: "Ready-to-use messages that convert leads into bookings. Close more deals faster.",
              color: "from-purple-500/20 to-purple-600/10",
            },
            {
              icon: "⚡",
              title: "Slow-Day Promos",
              desc: "Fill gaps with limited-time offers that create urgency and drive immediate bookings.",
              color: "from-pink-500/20 to-purple-600/10",
            },
            {
              icon: "🛡️",
              title: "Fraud Detection",
              desc: "Spot fake leads instantly. Don't waste time on prospects who won't book.",
              color: "from-cyan-500/20 to-blue-600/10",
            },
            {
              icon: "🎨",
              title: "Brand Voice Builder",
              desc: "Consistent tone, style, and messaging across all platforms. Build brand authority.",
              color: "from-orange-500/20 to-red-600/10",
            },
            {
              icon: "📊",
              title: "Growth Roadmaps",
              desc: "Strategic plans to scale followers, bookings, and revenue each month.",
              color: "from-green-500/20 to-emerald-600/10",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${feature.color} border border-gray-800 rounded-xl p-6 hover:border-pink-500/50 transition hover:-translate-y-1`}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-800 rounded-2xl p-12 text-center space-y-6">
        <h3 className="text-2xl font-bold">Loved by Beauty Professionals</h3>
        <div className="flex flex-wrap justify-center gap-8 text-gray-400">
          <div>
            <div className="text-3xl font-bold text-pink-400">100+</div>
            <div className="text-sm">Active Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-pink-400">10,000+</div>
            <div className="text-sm">Posts Generated</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-pink-400">$2M+</div>
            <div className="text-sm">Bookings Generated</div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingTable />

      {/* Final CTA - High Conversion */}
      <section className="relative rounded-2xl overflow-hidden">
        {/* Premium background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-purple-600 to-pink-700 opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-purple-600/20 opacity-50" />
        
        <div className="relative border border-pink-500/30 rounded-2xl backdrop-blur-sm p-12 md:p-16 text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Stop{" "}
            <span className="text-pink-400">Stressing</span>
            {" "}About Content?
          </h2>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Join beauty professionals who are booking more clients, saving hours every week, and growing their income with LitLabs AI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="group px-10 py-4 rounded-lg bg-white text-pink-600 font-bold text-lg hover:shadow-2xl hover:shadow-white/20 transition transform hover:scale-105"
            >
              🔥 Start Your Free Trial
              <span className="inline-block ml-2 group-hover:translate-x-1 transition">→</span>
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-10 py-4 rounded-lg border-2 border-white text-white font-bold text-lg hover:bg-white/10 transition"
            >
              View All Features
            </button>
          </div>

          <p className="text-sm text-gray-300 pt-4">
            ✓ 14-day free trial • ✓ No credit card • ✓ Cancel anytime
          </p>
        </div>
      </section>
    </main>
  );
}
