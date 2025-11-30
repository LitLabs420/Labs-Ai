"use client";

import Image from "next/image";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";

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

function PricingCard({
  plan,
  price,
  features,
  highlight,
}: {
  plan: string;
  price: string;
  features: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-8 transition ${
        highlight
          ? "border-pink-500/50 bg-gradient-to-b from-pink-500/10 to-transparent shadow-lg shadow-pink-500/20"
          : "border-white/10 bg-white/5"
      }`}
    >
      {highlight && (
        <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-pink-400 bg-pink-500/10 border border-pink-500/30 mb-4">
          Most Popular
        </div>
      )}
      <h3 className="text-lg font-bold mb-2">{plan}</h3>
      <p className="text-xs text-white/60 mb-6">Per month, paid yearly</p>
      <p className="text-4xl font-black mb-8">
        {price}
        <span className="text-lg text-white/50">/mo</span>
      </p>
      <ul className="space-y-3 mb-8 text-xs text-white/80">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-pink-400 font-bold mt-0.5">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href="/dashboard"
        className={`w-full block text-center py-2.5 rounded-full font-semibold text-xs transition ${
          highlight
            ? "bg-pink-500 hover:bg-pink-400 text-white shadow-lg shadow-pink-500/40"
            : "border border-white/20 hover:border-pink-500/50 text-white/80 hover:text-white"
        }`}
      >
        Get Started
      </Link>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 space-y-24">
        {/* HERO */}
        <section className="grid gap-10 md:grid-cols-[1.2fr,1fr] items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-white/70 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live — LitLabs Business OS is online
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-4">
              Your AI business command center —
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-sky-400">
                built to make you money.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-white/70 max-w-xl mb-6">
              LitLabs automates your marketing, creates your daily content,
              replies to DMs, protects you from scammers, and gives you a
              real-time dashboard to run your whole business. No stress, no
              guessing — just execution.
            </p>

            <Link
              href="/dashboard"
              className="inline-block px-5 py-2.5 rounded-full bg-pink-500 text-xs sm:text-sm font-semibold shadow-lg shadow-pink-500/40 hover:bg-pink-400 transition"
            >
              Activate LitLabs
            </Link>

            <p className="text-[11px] text-white/40 mt-4">
              No contracts. Cancel anytime.
            </p>
          </div>

          <div className="relative h-[260px] sm:h-[320px] md:h-[360px]">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-500/30 via-fuchsia-500/10 to-sky-500/30 blur-3xl" />
            <div className="relative h-full w-full rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-950 to-black shadow-xl shadow-pink-500/20 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-70">
                <Image
                  src="/dashboard-preview.png"
                  alt="Dashboard"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="relative z-10 p-4 space-y-3 bg-gradient-to-t from-black/80 to-transparent w-full h-full flex flex-col justify-end">
                <p className="text-xs text-white/70 font-medium">Live snapshot</p>
                <div className="grid grid-cols-3 gap-2">
                  <StatCard label="Posts" value="14" />
                  <StatCard label="Scripts" value="9" />
                  <StatCard label="Promos" value="3" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold">
            Everything you need to run like a full team.
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <FeatureCard
              title="Daily Content Engine"
              body="Post idea, caption, hashtags, and story prompt in one click."
            />
            <FeatureCard
              title="DM Sales Machine"
              body="Write replies that actually close clients."
            />
            <FeatureCard
              title="Slow-Day Promo Generator"
              body="Generate profit-pulling promos for your services."
            />
            <FeatureCard
              title="Fraud & Scam Guard"
              body="Check sketchy DMs and get a safe reply."
            />
            <FeatureCard
              title="Brand Voice & Bios"
              body="Clean bios, consistent tone, professional themes."
            />
            <FeatureCard
              title="Real-Time Dashboard"
              body="Track posts, scripts, promos, and time saved."
            />
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold">
            Simple plans. Real leverage.
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <PricingCard
              plan="Basic"
              price="$49"
              features={[
                "Daily content engine",
                "DM reply scripts",
                "Promo generator",
                "Fraud checks",
              ]}
            />
            <PricingCard
              highlight
              plan="Pro"
              price="$99"
              features={[
                "Everything in Basic",
                "7-day content packs",
                "Brand voice training",
                "Client reactivation",
              ]}
            />
            <PricingCard
              plan="Deluxe"
              price="$149"
              features={[
                "Everything in Pro",
                "Holiday templates",
                "Growth coaching",
                "1-on-1 onboarding",
              ]}
            />
          </div>
        </section>

        {/* CTA */}
        <section className="border border-white/10 rounded-2xl bg-gradient-to-r from-pink-500/10 via-black to-sky-500/10 p-8 space-y-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">
            Ready to stop guessing and start stacking?
          </h2>
          <p className="text-sm text-white/75 max-w-xl mx-auto">
            One dashboard. One brain. One system that makes you money.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 rounded-full bg-pink-500 text-sm font-semibold shadow-lg shadow-pink-500/40 hover:bg-pink-400 transition"
          >
            Activate LitLabs Now →
          </Link>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-6 text-[11px] text-white/40">
        <div className="mx-auto max-w-6xl px-4 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px]">
            <Link href="/#features" className="hover:text-white/60 transition">
              Features
            </Link>
            <span>·</span>
            <Link href="/#pricing" className="hover:text-white/60 transition">
              Pricing
            </Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-white/60 transition">
              Privacy
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-white/60 transition">
              Terms
            </Link>
          </div>
          <p className="text-center">
            © {new Date().getFullYear()} LitLabs Business OS. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
