"use client";

import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-2xl">
            <span className="text-3xl bg-gradient-to-r from-[#9b5cff] to-[#3ef1c2] bg-clip-text text-transparent">⚡</span>
            <span className="bg-gradient-to-r from-[#9b5cff] via-[#ff4fa3] to-[#3ef1c2] bg-clip-text text-transparent">LitLabs OS</span>
          </Link>
          <nav className="flex gap-8 text-sm text-gray-300">
            <a href="/#features" className="hover:text-white transition">Features</a>
            <a href="/#arcade" className="hover:text-white transition">Arcade</a>
            <a href="/#pricing" className="hover:text-white transition">Pricing</a>
            <Link href="/dashboard" className="px-4 py-2 rounded-full bg-gradient-to-r from-[#9b5cff] to-[#ff4fa3] text-black font-bold hover:brightness-110 transition">
              Log In
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-24 pt-16 space-y-24 text-white">
        {/* HERO SECTION - BOLD */}
        <section className="grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT: TEXT */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#9b5cff]/20 to-[#3ef1c2]/20 border border-[#9b5cff]/30">
              <span className="h-2 w-2 rounded-full bg-[#3ef1c2] animate-pulse" />
              <span className="text-sm font-semibold bg-gradient-to-r from-[#9b5cff] to-[#3ef1c2] bg-clip-text text-transparent">
                AI-Powered Business Automation
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black leading-tight">
              Your AI<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9b5cff] via-[#ff4fa3] to-[#3ef1c2]">
                Command Center
              </span>
              <br />
              Built to Make You Money
            </h1>

            <p className="text-lg text-gray-300 leading-relaxed max-w-lg">
              LitLabs OS runs your marketing playbook automatically. Generate content daily, reply to DMs like a human, book clients, and watch revenue grow—while you focus on delivering work.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/dashboard" className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#9b5cff] via-[#ff4fa3] to-[#3ef1c2] text-black font-bold text-lg hover:brightness-110 transition shadow-lg shadow-[#ff4fa3]/30">
                Start Free Trial →
              </Link>
              <button className="px-6 py-3 rounded-lg border-2 border-white/20 text-white font-bold hover:border-[#3ef1c2] hover:bg-[#3ef1c2]/5 transition">
                Watch Demo (30s)
              </button>
            </div>

            <p className="text-sm text-gray-400">
              ✨ No credit card. 14-day free trial. Cancel anytime.
            </p>

            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-8 border-t border-white/10">
              <div>
                <p className="text-3xl font-black text-[#ff4fa3]">2,400+</p>
                <p className="text-xs text-gray-400">Beauty pros using LitLabs</p>
              </div>
              <div>
                <p className="text-3xl font-black text-[#3ef1c2]">$47M+</p>
                <p className="text-xs text-gray-400">Booked through LitLabs</p>
              </div>
              <div>
                <p className="text-3xl font-black text-[#9b5cff]">4.9★</p>
                <p className="text-xs text-gray-400">Average rating</p>
              </div>
            </div>
          </div>

          {/* RIGHT: VISUAL */}
          <div className="relative">
            {/* Glow effects */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#9b5cff]/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#3ef1c2]/20 rounded-full blur-3xl" />

            {/* Card showcase */}
            <div className="relative z-10 space-y-4">
              {/* AI Response Card */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-6 shadow-2xl shadow-[#ff4fa3]/20">
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#9b5cff] to-[#3ef1c2] flex items-center justify-center flex-shrink-0 text-lg">
                    🤖
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-1">LitLabs AI</p>
                    <p className="text-white leading-relaxed">
                      "Hey Sarah! 👋 Just booked you for a lash appointment Thursday at 2pm. Client came from your DM follow-up."
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats showcase */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs text-gray-400">DMs This Week</p>
                  <p className="text-2xl font-black text-[#3ef1c2]">47</p>
                  <p className="text-xs text-green-400 mt-1">↑ 12 bookings</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs text-gray-400">Revenue Pending</p>
                  <p className="text-2xl font-black text-[#ff4fa3]">$3,200</p>
                  <p className="text-xs text-green-400 mt-1">This week</p>
                </div>
              </div>

              {/* XP/Arcade teaser */}
              <div className="rounded-xl border border-[#9b5cff]/30 bg-gradient-to-r from-[#9b5cff]/10 to-[#3ef1c2]/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Godmode Level</p>
                    <div className="flex gap-2">
                      <div className="text-xs font-bold text-white">5</div>
                      <div className="w-32 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="w-1/2 h-full bg-gradient-to-r from-[#9b5cff] to-[#ff4fa3]" />
                      </div>
                    </div>
                  </div>
                  <span className="text-2xl">🏅</span>
                </div>
              </div>
            </div>
          </div>
        </section>        {/* AI FEATURES - WHAT IT DOES */}
        <section id="features" className="space-y-8">
          <div className="space-y-3">
            <p className="text-sm font-bold text-[#3ef1c2]">POWERED BY AI</p>
            <h2 className="text-4xl font-black">
              Your AI does the heavy lifting
            </h2>
            <p className="text-gray-400 max-w-2xl">
              LitLabs runs on GPT-4. It learns your voice, your clients, your business. Then it automates the stuff that kills your day.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "📝",
                title: "Daily Content Generation",
                desc: "AI writes captions, creates story scripts, generates reel ideas—all in your voice. Just post.",
              },
              {
                icon: "💬",
                title: "DM Management",
                desc: "AI replies to clients like you would. Qualifies leads, books appointments, handles FAQs.",
              },
              {
                icon: "💰",
                title: "Money Plays",
                desc: "AI suggests promos for slow days, comeback offers, seasonal money moves. Copy & paste.",
              },
              {
                icon: "📊",
                title: "Revenue Tracking",
                desc: "Real-time dashboard shows DMs handled, bookings made, money pending. No spreadsheets.",
              },
              {
                icon: "🎯",
                title: "Playbook Library",
                desc: "Pre-built money moves for your industry. 'Fill weekends', 'Win back clients', 'Launch service'.",
              },
              {
                icon: "🎮",
                title: "Gamification",
                desc: "XP system keeps you motivated. Daily challenges turn your business into a game you're winning.",
              },
            ].map((feature, i) => (
              <div key={i} className="group rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 hover:border-[#3ef1c2]/50 hover:bg-white/10 transition">
                <p className="text-3xl mb-3 group-hover:scale-110 transition">{feature.icon}</p>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ARCADE - GAMIFICATION */}
        <section id="arcade" className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#9b5cff]/30 to-[#ff4fa3]/30 rounded-3xl blur-2xl" />
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur p-12 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#9b5cff]/20 rounded-full blur-3xl -z-0" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-bold text-[#3ef1c2]">GAMIFICATION ENGINE</p>
                  <h2 className="text-4xl font-black">
                    Make your business feel like a game you're winning
                  </h2>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Boring productivity tools = nobody uses them. LitLabs is built like an arcade. Earn XP for running content. Keep streaks alive. Hit daily challenges. Level up to Godmode.
                </p>
                <ul className="space-y-3">
                  {[
                    "Earn XP for content, DMs, promos—watch yourself level up",
                    "Daily challenges keep momentum going (even on slow days)",
                    "Streaks = accountability + adrenaline rush",
                    "Godmode unlocks 30–90 day Future Builder planning",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-[#3ef1c2] font-bold">✓</span>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative h-96">
                <div className="absolute inset-0 bg-gradient-to-br from-[#9b5cff]/10 to-[#3ef1c2]/10 rounded-2xl border border-[#9b5cff]/20 backdrop-blur p-6 space-y-6">
                  {/* XP Card Mock */}
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400">Your Level</p>
                    <div className="flex items-end gap-2">
                      <p className="text-5xl font-black bg-gradient-to-r from-[#9b5cff] to-[#ff4fa3] bg-clip-text text-transparent">7</p>
                      <p className="text-gray-400 mb-2">Godmode Operator</p>
                    </div>
                    <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                      <div className="w-3/4 h-full bg-gradient-to-r from-[#9b5cff] to-[#ff4fa3]" />
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="flex gap-4 p-3 rounded-lg bg-white/5 border border-[#ff4fa3]/20">
                    <span className="text-3xl">🔥</span>
                    <div>
                      <p className="text-sm font-bold">12 Day Streak</p>
                      <p className="text-xs text-gray-400">Keep it alive with today's challenge</p>
                    </div>
                  </div>

                  {/* Challenge */}
                  <div className="p-3 rounded-lg bg-gradient-to-r from-[#3ef1c2]/10 to-[#9b5cff]/10 border border-[#3ef1c2]/30">
                    <p className="text-xs text-[#3ef1c2] font-bold mb-1">TODAY'S CHALLENGE</p>
                    <p className="text-sm font-bold">Post 3 reels + DM 5 old clients</p>
                    <p className="text-xs text-gray-400 mt-1">+50 XP · 30 min</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="space-y-12">
          <div className="space-y-3 text-center">
            <p className="text-sm font-bold text-[#3ef1c2]">SIMPLE PRICING</p>
            <h2 className="text-4xl font-black">
              Pick your power level
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Start free. Scale when you're ready. No contracts, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter",
                price: "Free",
                period: "Forever",
                features: ["Daily content generation", "Basic DM replies", "1 playbook", "Community access"],
                cta: "Start Free",
                highlight: false,
              },
              {
                name: "Godmode",
                price: "$49",
                period: "/month",
                features: ["Everything in Starter", "Unlimited playbooks", "Advanced money plays", "30-day Future Builder", "Priority support"],
                cta: "Unlock Godmode",
                highlight: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "pricing",
                features: ["Everything in Godmode", "90-day Future Builder", "Team access", "API access", "Custom integrations"],
                cta: "Contact Sales",
                highlight: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-8 transition ${
                  plan.highlight
                    ? "border-[#ff4fa3] bg-gradient-to-br from-[#ff4fa3]/20 to-[#9b5cff]/10 ring-2 ring-[#ff4fa3]/50 scale-105"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                    <div>
                      <span className="text-4xl font-black">{plan.price}</span>
                      <span className="text-gray-400 ml-2">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex gap-2 text-sm text-gray-300">
                        <span className="text-[#3ef1c2] font-bold">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-3 rounded-lg font-bold transition ${
                      plan.highlight
                        ? "bg-gradient-to-r from-[#9b5cff] via-[#ff4fa3] to-[#3ef1c2] text-black hover:brightness-110"
                        : "border border-white/20 text-white hover:bg-white/10"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative text-center py-12">
          <div className="absolute inset-0 bg-gradient-to-r from-[#9b5cff]/20 to-[#ff4fa3]/20 rounded-3xl blur-2xl -z-0" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl font-black">
              Ready to run your business like a game?
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              14-day free trial. No credit card needed. Full access to Godmode features. See what 2,400+ beauty pros already know.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/dashboard"
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-[#9b5cff] via-[#ff4fa3] to-[#3ef1c2] text-black font-bold text-lg hover:brightness-110 transition shadow-lg shadow-[#ff4fa3]/30"
              >
                Start Your Free Trial
              </Link>
              <a
                href="#pricing"
                className="px-8 py-4 rounded-lg border-2 border-white/20 text-white font-bold hover:border-[#3ef1c2] hover:bg-[#3ef1c2]/5 transition"
              >
                View Pricing
              </a>
            </div>
          </div>
        </section>
    </main>
    </>
  );
}
