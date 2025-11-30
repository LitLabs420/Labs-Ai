"use client";

import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/98 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-black bg-gradient-to-r from-[#ff006e] via-[#8338ec] to-[#3a86ff] bg-clip-text text-transparent">⚡</div>
            <span className="font-black text-2xl bg-gradient-to-r from-[#ff006e] via-[#8338ec] to-[#3a86ff] bg-clip-text text-transparent">LitLabs</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm text-gray-300">
            <a href="/#features" className="hover:text-white transition">Features</a>
            <a href="/#how" className="hover:text-white transition">How it works</a>
            <a href="/#pricing" className="hover:text-white transition">Pricing</a>
            <Link href="/dashboard" className="px-5 py-2 rounded-full bg-gradient-to-r from-[#ff006e] to-[#8338ec] text-white font-bold text-sm hover:brightness-110 transition">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-32 pt-20 space-y-32 text-white">
        {/* ===== HERO SECTION ===== */}
        <section className="relative overflow-hidden pt-12">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-gradient-to-r from-[#ff006e]/30 via-[#8338ec]/30 to-[#3a86ff]/30 rounded-full blur-3xl -z-0" />
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            {/* LEFT: TEXT */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#ff006e]/30 bg-[#ff006e]/5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff006e] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff006e]"></span>
                </span>
                <span className="text-xs font-bold text-[#ff006e]">AI That Actually Works</span>
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-6xl lg:text-7xl font-black leading-tight">
                  Your AI<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff006e] via-[#8338ec] to-[#3a86ff]">
                    Marketing Team
                  </span>
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                  LitLabs generates your content, replies to DMs, runs promotions, and books clients—all while you focus on what you do best. Your AI assistant that actually scales your business.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/dashboard" className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#ff006e] to-[#8338ec] text-white font-bold text-lg hover:brightness-110 transition shadow-2xl shadow-[#ff006e]/50">
                  Start Free (14 days)
                </Link>
                <button className="px-8 py-4 rounded-xl border-2 border-white/30 text-white font-bold text-lg hover:border-[#3a86ff] hover:bg-[#3a86ff]/5 transition">
                  Watch Demo
                </button>
              </div>

              {/* Trust elements */}
              <div className="flex items-center gap-8 pt-8 border-t border-white/10">
                <div>
                  <p className="text-3xl font-black text-[#ff006e]">2,847+</p>
                  <p className="text-xs text-gray-400">Users active today</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-[#8338ec]">$89M+</p>
                  <p className="text-xs text-gray-400">In revenue generated</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-[#3a86ff]">4.9★</p>
                  <p className="text-xs text-gray-400">On all platforms</p>
                </div>
              </div>
            </div>

            {/* RIGHT: VISUAL SHOWCASE */}
            <div className="relative">
              {/* Floating cards showcase */}
              <div className="space-y-6">
                {/* Main AI Chat Card */}
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl p-6 hover:border-[#ff006e]/50 transition transform hover:scale-105">
                  <div className="flex gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff006e] to-[#8338ec] flex items-center justify-center text-lg font-bold">🤖</div>
                    <div>
                      <p className="text-xs text-gray-400">AI Assistant</p>
                      <p className="text-sm font-bold">LitLabs AI</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">
                    "Hey! I just created 5 Instagram captions for you, replied to 8 DMs, and scheduled 3 posts. Here's your daily money move: Flash sale for existing clients."
                  </p>
                  <div className="flex gap-2 mt-4">
                    <span className="px-3 py-1 rounded-full bg-[#ff006e]/20 border border-[#ff006e]/30 text-xs text-[#ff006e] font-bold">Content ✓</span>
                    <span className="px-3 py-1 rounded-full bg-[#8338ec]/20 border border-[#8338ec]/30 text-xs text-[#8338ec] font-bold">DMs ✓</span>
                    <span className="px-3 py-1 rounded-full bg-[#3a86ff]/20 border border-[#3a86ff]/30 text-xs text-[#3a86ff] font-bold">Promo ✓</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                    <p className="text-2xl font-black text-[#ff006e]">47</p>
                    <p className="text-xs text-gray-400">DMs Today</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                    <p className="text-2xl font-black text-[#8338ec]">12</p>
                    <p className="text-xs text-gray-400">Bookings</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                    <p className="text-2xl font-black text-[#3a86ff]">$3.2K</p>
                    <p className="text-xs text-gray-400">Revenue</p>
                  </div>
                </div>

                {/* XP/Arcade teaser */}
                <div className="rounded-xl border border-[#ff006e]/30 bg-gradient-to-r from-[#ff006e]/10 to-[#8338ec]/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Godmode Level</p>
                      <p className="text-3xl font-black mt-1">8</p>
                    </div>
                    <span className="text-4xl">🏅</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-gradient-to-r from-[#ff006e] via-[#8338ec] to-[#3a86ff]" />
                  </div>
                  <p className="text-xs text-gray-300 mt-3">Keep your 7-day streak alive. Complete today's challenge for +100 XP.</p>
                </div>
              </div>
            </div>
          </div>
        </section>        {/* ===== FEATURES SECTION ===== */}
        <section id="features" className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black">
              Everything your<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff006e] via-[#8338ec] to-[#3a86ff]">
                business needs to scale
              </span>
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Stop doing everything yourself. LitLabs handles the repetitive stuff so you can focus on delivering amazing service.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                number: "01",
                icon: "✍️",
                title: "Content Generation",
                desc: "AI creates your captions, DM scripts, story ideas, and content calendar. In your voice. Ready to post.",
              },
              {
                number: "02",
                icon: "💬",
                title: "Smart DM Management",
                desc: "AI qualifies leads, answers questions, and books appointments. Replies like you would, handles FAQs automatically.",
              },
              {
                number: "03",
                icon: "💰",
                title: "Money Plays",
                desc: "Daily AI suggestions: flash sales, comeback offers, seasonal promos. Copy-paste scripts ready to send.",
              },
              {
                number: "04",
                icon: "📊",
                title: "Live Dashboard",
                desc: "Real-time tracking of DMs handled, clients booked, revenue pending. All in one place. No spreadsheets.",
              },
              {
                number: "05",
                icon: "📚",
                title: "Playbook Library",
                desc: "Pre-built money moves for your industry. Tested strategies. Fill weekends, win back clients, launch services.",
              },
              {
                number: "06",
                icon: "🎮",
                title: "Arcade Gamification",
                desc: "XP, streaks, daily challenges. Turn your business into a game you're winning. Stay motivated, hit targets.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl p-8 hover:border-[#ff006e]/50 hover:bg-white/10 transition transform hover:-translate-y-2"
              >
                <div className="flex items-start justify-between mb-4">
                  <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff006e] via-[#8338ec] to-[#3a86ff]">
                    {feature.number}
                  </p>
                  <p className="text-4xl group-hover:scale-125 transition">{feature.icon}</p>
                </div>
                <h3 className="text-xl font-black mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <section className="py-20 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black">Loved by Beauty Pros</h2>
            <p className="text-gray-300">See what real users are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "LitLabs saved me 20+ hours per week. My DMs used to be overwhelming. Now the AI handles everything—I just show up and work.",
                author: "Sarah M.",
                role: "Lash Tech, Miami",
                emoji: "💅",
              },
              {
                quote: "I went from 2 bookings/week to 7. The AI content gets way better engagement than my old posts. Game changer.",
                author: "Jessica L.",
                role: "Nail Artist, LA",
                emoji: "✨",
              },
              {
                quote: "The arcade features are addictive. I'm actually motivated to hit my daily challenges now. Revenue is up 40%.",
                author: "Maria P.",
                role: "Hair Stylist, NYC",
                emoji: "👑",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl p-8 hover:border-[#ff006e]/50 transition"
              >
                <p className="text-3xl mb-4">{testimonial.emoji}</p>
                <p className="text-lg text-white mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-black text-lg">{testimonial.author}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
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
