"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import SiteHeader from "../components/SiteHeader";
import { LiveActivityFeed } from "@/components/LiveActivityFeed";
import { trackEvent } from "@/lib/analytics";

const PricingSection = dynamic(() => import("@/components/PricingSection").then(mod => ({ default: mod.PricingSection })), { ssr: false });

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 p-3">
      <p className="text-[10px] text-white/50 mb-1">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 hover:border-pink-500/50 transition">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-white/70 text-xs leading-relaxed">{body}</p>
    </div>
  );
}

export default function HomePage() {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const launchDate = new Date("2025-12-15T00:00:00Z").getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      setTimeLeft(Math.max(0, launchDate - now));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  const handleSignup = () => {
    trackEvent("landing_signup_click", { source: "hero_cta" });
  };
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-20">
        <div className="absolute -top-40 -left-40 h-80 w-80 bg-pink-600/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 bg-cyan-600/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-1/3 h-96 w-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-12 space-y-32 relative z-10">
        {/* HERO */}
        <section className="grid gap-12 md:grid-cols-[1.2fr,1fr] items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur px-4 py-2 text-[11px] text-white/70 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              🚀 LitLabs OS is Live — 2k+ Users
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight">
                Your AI command center
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400">
                  built to make you money.
                </span>
              </h1>

              <p className="text-lg text-white/70 max-w-2xl leading-relaxed">
                Automate your marketing, create daily content, reply to DMs like a human, detect fraud, and run everything from one dashboard. Stop guessing. Start executing.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/dashboard"
                onClick={handleSignup}
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-lg shadow-2xl shadow-pink-500/40 hover:shadow-pink-500/60 transition active:scale-95"
              >
                🚀 Activate LitLabs
                <span className="text-pink-200">→</span>
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-white/30 hover:border-white/60 bg-white/5 hover:bg-white/10 text-white font-bold text-lg transition"
              >
                View Plans
              </a>
            </div>

            <p className="text-xs text-white/40 pt-2">
              ✨ No contracts. No setup fees. Cancel anytime.
            </p>
          </div>

          {/* Hero Image */}
          <div className="relative h-[300px] md:h-[450px] group">
            <div className="absolute -inset-4 bg-gradient-to-br from-pink-600 via-purple-600 to-cyan-600 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition duration-300" />
            <div className="relative h-full w-full rounded-3xl border-2 border-white/20 bg-gradient-to-b from-slate-950 to-black shadow-2xl shadow-pink-500/30 overflow-hidden flex items-center justify-center">
              {/* Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-cyan-500/20 opacity-50" />
              <div className="relative z-10 text-center space-y-4 px-6">
                <div className="text-6xl font-black">✨</div>
                <p className="text-white/60 text-sm font-medium">Dashboard Preview</p>
                <div className="grid grid-cols-3 gap-2 pt-4">
                  <div className="px-3 py-2 rounded-lg bg-pink-500/20 border border-pink-500/40 text-xs font-bold">Posts</div>
                  <div className="px-3 py-2 rounded-lg bg-purple-500/20 border border-purple-500/40 text-xs font-bold">Scripts</div>
                  <div className="px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-xs font-bold">Promos</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LIVE ACTIVITY - Social Proof */}
        <section className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-600/50 to-cyan-600/50 rounded-2xl blur-2xl opacity-30"></div>
          <div className="relative bg-gradient-to-b from-slate-950/80 to-black/80 backdrop-blur rounded-2xl border border-white/20 p-10 text-center space-y-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-xs font-bold text-red-200">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                LIVE ACTIVITY
              </div>
              <h2 className="text-3xl sm:text-4xl font-black">Beauty Pros Signing Up</h2>
              <p className="text-white/60">Join the automation revolution</p>
            </div>
            <LiveActivityFeed />
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black">
              ⭐ Loved by beauty professionals
            </h2>
            <p className="text-white/60 text-lg">See what our users are saying</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Sarah M.",
                role: "Lash Tech in Miami",
                emoji: "💅",
                quote:
                  "LitLabs saved me 5+ hours weekly. I went from manual DMs to AI handling everything automatically!",
                stat: "3x more bookings",
                highlight: true,
              },
              {
                name: "Jessica L.",
                role: "Nail Artist in LA",
                emoji: "✨",
                quote:
                  "Not tech-savvy, but LitLabs was SO easy. My content posts automatically now!",
                stat: "+$2k/month revenue",
              },
              {
                name: "Maria P.",
                role: "Hair Stylist in NYC",
                emoji: "👑",
                quote:
                  "The fraud detection caught a scam before it hurt me. Worth it just for that!",
                stat: "98% lead quality",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-8 transition transform hover:scale-105 ${
                  testimonial.highlight
                    ? "border-pink-500/50 bg-gradient-to-b from-pink-500/20 to-black shadow-lg shadow-pink-500/20"
                    : "border-white/20 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <p className="text-4xl">{testimonial.emoji}</p>
                  <div>
                    <p className="font-bold text-lg">{testimonial.name}</p>
                    <p className="text-xs text-white/60">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-base text-white/90 mb-6 italic leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <p className="text-pink-400 text-sm font-black">
                  ✨ {testimonial.stat}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black">
              🔥 Everything you need to dominate
            </h2>
            <p className="text-white/60 text-lg">6 core superpowers in one OS</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { emoji: "📱", title: "Daily Content Engine", desc: "Post ideas, captions, hashtags in 1 click" },
              { emoji: "💬", title: "DM Sales Machine", desc: "Write replies that actually close deals" },
              { emoji: "🎯", title: "Promo Generator", desc: "Profit-pulling promos for slow days" },
              { emoji: "🛡️", title: "Fraud Guard", desc: "Detect scams & get safe replies" },
              { emoji: "🎨", title: "Brand Voice", desc: "Consistent tone, professional themes" },
              { emoji: "📊", title: "Live Dashboard", desc: "Track everything in real-time" },
            ].map((feature, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 hover:border-pink-500/50 p-8 transition group"
              >
                <p className="text-4xl mb-4 group-hover:scale-110 transition">{feature.emoji}</p>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-white/70 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <PricingSection />

        {/* CTA */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/30 via-purple-600/20 to-cyan-600/30 rounded-3xl blur-3xl" />
          <div className="relative border-2 border-white/20 rounded-3xl bg-gradient-to-b from-slate-950/90 to-black/90 backdrop-blur p-12 sm:p-16 space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-black">
                Ready to stop guessing and start stacking?
              </h2>
              <p className="text-lg text-white/75 max-w-3xl mx-auto">
                One dashboard. One brain. One system that makes you money while you sleep.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/dashboard"
                onClick={handleSignup}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-lg shadow-2xl shadow-pink-500/40 transition active:scale-95"
              >
                🎉 Start Free Trial
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/30 hover:border-white/60 text-white font-bold text-lg transition"
              >
                View pricing
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 py-12 text-white/40 mt-32">
        <div className="mx-auto max-w-6xl px-4 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-white/10">
            <div>
              <p className="font-bold text-white mb-4">Product</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/#features" className="hover:text-white transition">Features</Link></li>
                <li><Link href="/#pricing" className="hover:text-white transition">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-white mb-4">Company</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-white transition">About</Link></li>
                <li><Link href="/" className="hover:text-white transition">Blog</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-white mb-4">Legal</p>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-white mb-4">Connect</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center py-4 border-t border-white/10">
            <p className="text-sm">
              © {new Date().getFullYear()} LitLabs Business OS. Built with 💗 for beauty professionals.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
