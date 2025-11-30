"use client";

import Link from "next/link";

export default function HighConversionHome() {
  return (
    <>
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black">⚡</span>
            <span className="font-black text-xl bg-gradient-to-r from-[#ff006e] via-[#8338ec] to-[#3a86ff] bg-clip-text text-transparent">LitLabs</span>
          </div>
          <Link href="/dashboard" className="px-6 py-2 rounded-full bg-gradient-to-r from-[#ff006e] to-[#8338ec] text-white font-bold text-sm hover:brightness-120 transition shadow-lg shadow-[#ff006e]/30">
            Try Free Now →
          </Link>
        </div>
      </header>

      <main className="text-white">
        {/* HERO - PROBLEM/SOLUTION FOCUSED */}
        <section className="relative overflow-hidden pt-20 pb-32">
          <div className="absolute inset-0 bg-gradient-to-b from-[#ff006e]/10 to-transparent -z-0" />
          <div className="max-w-4xl mx-auto px-4 relative z-10 text-center space-y-12">
            
            {/* URGENCY BADGE */}
            <div className="inline-block">
              <div className="px-4 py-2 rounded-full border border-[#ff006e]/50 bg-[#ff006e]/10 text-sm font-bold text-[#ff006e]">
                ⏰ Limited Time: 14 Days Free (Normally $49/month)
              </div>
            </div>

            {/* HEADLINE - PAIN POINT + SOLUTION */}
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight">
                Stop Grinding<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff006e] via-[#8338ec] to-[#3a86ff]">
                  Start Scaling
                </span>
              </h1>
              
              <p className="text-xl text-gray-200 leading-relaxed max-w-2xl mx-auto">
                Your AI marketing team works 24/7. Creates content. Replies to DMs. Books clients. While you sleep.
              </p>
            </div>

            {/* SOCIAL PROOF - CREDIBILITY */}
            <div className="grid sm:grid-cols-3 gap-6 py-8 border-y border-white/10">
              <div>
                <p className="text-3xl font-black text-[#ff006e]">2,847+</p>
                <p className="text-sm text-gray-400">Beauty pros using LitLabs</p>
              </div>
              <div>
                <p className="text-3xl font-black text-[#8338ec]">$89M+</p>
                <p className="text-sm text-gray-400">Revenue booked this year</p>
              </div>
              <div>
                <p className="text-3xl font-black text-[#3a86ff]">4.9 ⭐</p>
                <p className="text-sm text-gray-400">Rated by real users</p>
              </div>
            </div>

            {/* PRIMARY CTA - BIG & URGENT */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link 
                href="/dashboard"
                className="px-8 py-5 rounded-lg bg-gradient-to-r from-[#ff006e] via-[#8338ec] to-[#3a86ff] text-white font-black text-lg hover:brightness-120 transition shadow-2xl shadow-[#ff006e]/40 transform hover:scale-105"
              >
                Get 14 Days Free →
              </Link>
              <button className="px-8 py-5 rounded-lg border-2 border-white/30 text-white font-bold text-lg hover:border-[#3a86ff] hover:bg-[#3a86ff]/10 transition">
                See How It Works
              </button>
            </div>

            {/* RISK REVERSAL - REMOVE BARRIERS */}
            <div className="text-center space-y-2 pt-4">
              <p className="text-gray-300 font-semibold">✓ No credit card required</p>
              <p className="text-gray-400 text-sm">✓ Cancel anytime · ✓ Full access to all features · ✓ Join 2,847+ pros</p>
            </div>
          </div>
        </section>

        {/* REAL RESULTS - BEFORE/AFTER */}
        <section className="py-24 bg-white/5 border-t border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-black text-center mb-16">
              What Happens When You Stop<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff006e] via-[#8338ec] to-[#3a86ff]">Doing It All Yourself</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-12">
              {/* BEFORE */}
              <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8">
                <p className="text-sm font-bold text-red-400 mb-4">❌ WITHOUT LITLABS</p>
                <ul className="space-y-3 text-gray-300">
                  <li>• Spend 3+ hours daily on content + DMs</li>
                  <li>• Miss DMs while working with clients</li>
                  <li>• Sales slip through cracks (no follow-up)</li>
                  <li>• Inconsistent posting = algorithm kills reach</li>
                  <li>• Burned out by 3pm</li>
                  <li>• Manual booking confirmations (chaos)</li>
                  <li>• Can't think straight enough to sell</li>
                  <li>• Revenue plateaus</li>
                </ul>
              </div>

              {/* AFTER */}
              <div className="rounded-2xl border border-[#3ef1c2]/50 bg-[#3ef1c2]/10 p-8">
                <p className="text-sm font-bold text-[#3ef1c2] mb-4">✅ WITH LITLABS</p>
                <ul className="space-y-3 text-gray-200">
                  <li>• AI creates all your content (you approve 1x/week)</li>
                  <li>• Automated DM replies (handles FAQs instantly)</li>
                  <li>• Never miss a lead (follow-ups automated)</li>
                  <li>• Consistent posting = algorithm loves you</li>
                  <li>• Energy left to actually enjoy your business</li>
                  <li>• Bookings confirmed automatically</li>
                  <li>• You can focus on client delivery = better reviews</li>
                  <li>• Revenue grows 3-10x in 90 days</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* WHAT YOU GET - SPECIFIC FEATURES */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-black text-center mb-16">
              Everything Included (Even on Free Plan)
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: "🤖",
                  title: "AI Content Gen",
                  desc: "Instagram captions, TikToks, Reels scripts, DM openers. In your voice. Ready to post."
                },
                {
                  icon: "💬",
                  title: "Smart DM Replies",
                  desc: "AI answers questions, qualifies leads, books appointments. Replies like you would, 24/7."
                },
                {
                  icon: "💰",
                  title: "Money Plays",
                  desc: "Daily AI suggestions: flash sales, upsells, comeback offers. Proven to work."
                },
                {
                  icon: "📊",
                  title: "Live Dashboard",
                  desc: "Real-time view of DMs handled, clients booked, revenue earned. All in one place."
                },
                {
                  icon: "📚",
                  title: "Playbook Library",
                  desc: "Pre-built strategies tested on 2,800+ businesses. Copy-paste winner moves."
                },
                {
                  icon: "🎮",
                  title: "Gamification",
                  desc: "Earn XP, keep streaks alive, hit daily challenges. Stay motivated = more wins."
                },
              ].map((item, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 p-6 transition">
                  <p className="text-4xl mb-3">{item.icon}</p>
                  <h3 className="font-black text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REAL TESTIMONIALS - RESULTS FOCUSED */}
        <section className="py-24 bg-white/5 border-y border-white/10">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-black text-center mb-16">
              See Real Results from Real Beauty Pros
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote: "I went from 2 bookings/week to 7. The AI content gets INSANE engagement. I'm not exaggerating—this changed my entire business.",
                  name: "Jessica L.",
                  role: "Nail Tech (LA)",
                  metric: "250% growth in 60 days",
                  avatar: "💅"
                },
                {
                  quote: "Saved me 20+ hours a week. My DMs used to stress me out. Now the AI handles everything and I just show up for clients.",
                  name: "Sarah M.",
                  role: "Lash Tech (Miami)",
                  metric: "20 hours/week saved",
                  avatar: "✨"
                },
                {
                  quote: "The daily money plays have generated an extra $8K/month. I literally just copy-paste the AI suggestions. Results speak.",
                  name: "Maria P.",
                  role: "Hair Stylist (NYC)",
                  metric: "$8K extra/month",
                  avatar: "👑"
                },
              ].map((testi, i) => (
                <div key={i} className="rounded-2xl border border-[#ff006e]/30 bg-gradient-to-br from-white/8 to-transparent p-8">
                  <div className="flex items-start justify-between mb-4">
                    <p className="text-4xl">{testi.avatar}</p>
                    <span className="px-3 py-1 rounded-full bg-[#ff006e]/20 text-xs font-bold text-[#ff006e]">{testi.metric}</span>
                  </div>
                  <p className="text-gray-200 italic leading-relaxed mb-6">"{testi.quote}"</p>
                  <div>
                    <p className="font-black">{testi.name}</p>
                    <p className="text-sm text-gray-400">{testi.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING - SIMPLE & CLEAR */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-black text-center mb-4">
              Pick Your Plan
            </h2>
            <p className="text-center text-gray-300 mb-16">
              No contracts. Cancel anytime. Full features on free trial.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* STARTER */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                <h3 className="text-2xl font-black mb-2">Starter</h3>
                <div className="mb-6">
                  <span className="text-5xl font-black">$0</span>
                  <span className="text-gray-400 ml-3">Forever</span>
                </div>
                <ul className="space-y-3 mb-8 text-gray-300 text-sm">
                  <li>✓ AI content generation</li>
                  <li>✓ Basic DM replies</li>
                  <li>✓ 1 playbook</li>
                  <li>✓ Dashboard access</li>
                  <li>✓ Community</li>
                </ul>
                <button className="w-full py-3 rounded-lg border-2 border-white/20 text-white font-bold hover:bg-white/10 transition">
                  Start Free
                </button>
              </div>

              {/* PRO - HIGHLIGHTED */}
              <div className="rounded-2xl border-2 border-[#ff006e] bg-gradient-to-br from-[#ff006e]/20 to-[#8338ec]/10 p-8 ring-2 ring-[#ff006e]/30">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black">Godmode Pro</h3>
                  <span className="px-3 py-1 rounded-full bg-[#ff006e] text-black text-xs font-black">BEST VALUE</span>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-black">$49</span>
                  <span className="text-gray-300 ml-3">/month</span>
                </div>
                <ul className="space-y-3 mb-8 text-gray-200 text-sm">
                  <li>✓ Everything in Starter</li>
                  <li>✓ Unlimited playbooks</li>
                  <li>✓ Advanced money plays</li>
                  <li>✓ 30-day Future Builder</li>
                  <li>✓ Priority support</li>
                  <li>✓ <span className="font-bold">First 14 days FREE</span></li>
                </ul>
                <Link href="/dashboard" className="w-full py-3 rounded-lg bg-gradient-to-r from-[#ff006e] to-[#8338ec] text-white font-black hover:brightness-110 transition block text-center">
                  Get 14 Days Free →
                </Link>
                <p className="text-xs text-center text-gray-400 mt-3">Then $49/mo. Cancel anytime.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ - OBJECTION HANDLING */}
        <section className="py-24 bg-white/5 border-t border-white/10">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-4xl font-black text-center mb-16">Common Questions</h2>

            <div className="space-y-6">
              {[
                {
                  q: "Is this really AI or just templates?",
                  a: "Real AI. Every caption is unique, generated fresh based on your business, industry, and voice. Not templates. Not recycled content."
                },
                {
                  q: "Will my followers know it's AI-generated?",
                  a: "Nope. AI is good enough now that it sounds natural. Your followers will think you've hired a copywriter. That's the point."
                },
                {
                  q: "What if I don't like the suggestions?",
                  a: "You review everything before it posts. Edit, regenerate, or skip. You're always in control. AI is your assistant, not your boss."
                },
                {
                  q: "How does the free trial work?",
                  a: "Full access to all features for 14 days. No credit card required. If you don't want to keep it, just cancel. No catch."
                },
                {
                  q: "Can I try just the free plan?",
                  a: "Yes. Free plan works forever. But the Pro plan features (Godmode) is where the real scaling happens. Most start free, upgrade after 2-3 weeks."
                },
              ].map((item, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h3 className="font-black mb-3 text-lg">{item.q}</h3>
                  <p className="text-gray-300">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA - URGENCY + SCARCITY */}
        <section className="py-24">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="space-y-8">
              <div>
                <p className="text-sm font-bold text-[#ff006e] mb-2">LIMITED TIME OFFER</p>
                <h2 className="text-5xl font-black leading-tight mb-4">
                  14 Days Free. Full Features. No Limits.
                </h2>
                <p className="text-lg text-gray-300">
                  2,847 beauty pros are already using LitLabs to work less and earn more. This offer closes soon.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Link 
                  href="/dashboard"
                  className="px-10 py-6 rounded-lg bg-gradient-to-r from-[#ff006e] via-[#8338ec] to-[#3a86ff] text-white font-black text-lg hover:brightness-120 transition shadow-2xl shadow-[#ff006e]/40 transform hover:scale-105"
                >
                  Start Your Free Trial Now →
                </Link>
              </div>

              <p className="text-sm text-gray-400">
                ✓ No credit card · ✓ Cancel anytime · ✓ Full access to all features
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 py-12 text-center text-gray-400 text-sm">
          <p>© 2025 LitLabs. Made for beauty pros by people who get it.</p>
          <p className="mt-2">Questions? <span className="text-[#ff006e] cursor-pointer hover:text-[#ff006e]/80">Contact support</span></p>
        </footer>
      </main>
    </>
  );
}
