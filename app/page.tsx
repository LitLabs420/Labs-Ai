import React from "react";

// Force the app router to render this page server-side on every request
// This bypasses Vercel edge HTML caching so we can validate the live change immediately
export const dynamic = "force-dynamic";

// Visible build timestamp to verify live deploy / CDN cache
const BUILD_TS = new Date().toISOString();

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10 space-y-16">
        {/* NAVBAR */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-slate-900 border border-emerald-500/50 flex items-center justify-center text-xs font-bold tracking-tight">
              LL
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">
                LitLabs OS
              </p>
              <p className="text-xs text-slate-400">
                Money-making AI for beauty + service bosses.
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs text-slate-300">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#pricing" className="hover:text-white">
              Pricing
            </a>
            <a href="#how-it-works" className="hover:text-white">
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:inline-flex flex-col text-right text-[11px]">
              <span className="text-slate-400">Build</span>
              <span className="text-slate-300 font-mono">{BUILD_TS}</span>
            </div>
            <button className="hidden md:inline-flex rounded-full border border-slate-700 px-4 py-1.5 text-[11px] hover:bg-slate-900">
              Login
            </button>
            <button className="rounded-full bg-emerald-500 px-4 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-emerald-400">
              Open Dashboard
            </button>
          </div>
        </header>

        {/* HERO + CHAT PREVIEW */}
        <section className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center">
          {/* LEFT SIDE: COPY */}
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
              🔥 LitLabs OS is live – stop guessing, start stacking.
            </span>

            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
              Your AI{" "}
              <span className="text-emerald-400">command center</span> that
              books clients, replies to DMs & catches fraud while you live life.
            </h1>

            <p className="max-w-xl text-sm md:text-base text-slate-300">
              LitLabs OS builds daily content, writes DMs that actually close,
              generates promos for slow days, and watches logins + payments from
              one clean dashboard. No tech brain, no problem.
            </p>

            <div className="flex flex-wrap gap-3">
              <button className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400">
                Activate LitLabs →
              </button>
              <button className="rounded-xl border border-slate-700 px-5 py-2 text-sm text-slate-100 hover:bg-slate-900">
                Watch 2-min demo
              </button>
            </div>

            <ul className="grid gap-2 text-xs text-slate-300 md:grid-cols-2">
              <li>✅ Daily content engine for IG/TikTok</li>
              <li>✅ DM sales flows that sound human</li>
              <li>✅ Promo generator for slow days</li>
              <li>✅ Fraud guard + login watch</li>
            </ul>
          </div>

          {/* RIGHT SIDE: FAKE CHAT / DASHBOARD */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl shadow-emerald-500/20">
            <p className="mb-2 text-xs font-medium text-slate-400">
              Live LitLabs OS preview
            </p>

            <div className="h-[320px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80">
              <div className="flex h-full flex-col">
                {/* header */}
                <div className="border-b border-slate-800 px-4 py-3 text-xs text-slate-300 flex items-center justify-between">
                  <span>Beauty Boss Control Panel</span>
                  <span className="text-[10px] text-emerald-300">
                    ● AI Online
                  </span>
                </div>

                {/* body */}
                <div className="flex-1 grid grid-cols-[1.4fr_1fr]">
                  {/* chat */}
                  <div className="border-r border-slate-800 px-3 py-3 space-y-2 text-[11px] overflow-y-auto">
                    <div className="text-[10px] text-slate-400 mb-1">
                      Chat feed
                    </div>

                    <div className="max-w-[90%] rounded-2xl bg-slate-800 px-3 py-2">
                      <p className="text-slate-200">
                        Yo, I&apos;m LitLabs. Tell me what you do and I&apos;ll
                        build a money plan around it.
                      </p>
                    </div>

                    <div className="ml-auto max-w-[90%] rounded-2xl bg-emerald-500 px-3 py-2">
                      <p className="text-slate-950">
                        I&apos;m a lash tech. I want more high-ticket clients,
                        not cheap walk-ins.
                      </p>
                    </div>

                    <div className="max-w-[90%] rounded-2xl bg-slate-800 px-3 py-2">
                      <p className="text-slate-200">
                        Bet. I&apos;ll write your posts, promos, and DMs, then
                        push your best leads to book this week.
                      </p>
                    </div>

                    <div className="max-w-[90%] rounded-2xl bg-slate-800 px-3 py-2">
                      <p className="text-slate-200">
                        I&apos;ll also flag weird logins + payments so you
                        don&apos;t get played.
                      </p>
                    </div>
                  </div>

                  {/* stats */}
                  <div className="px-3 py-3 space-y-3 border-l border-slate-900/80 bg-slate-950">
                    <div className="text-[10px] text-slate-400">
                      Today&apos;s Numbers
                    </div>
                    <div className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-2">
                      <p className="text-[10px] text-slate-400">Leads</p>
                      <p className="text-lg font-semibold">23</p>
                      <p className="text-[10px] text-emerald-300">
                        +9 vs yesterday
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-2">
                      <p className="text-[10px] text-slate-400">Bookings</p>
                      <p className="text-lg font-semibold">11</p>
                      <p className="text-[10px] text-emerald-300">
                        48% conversion
                      </p>
                    </div>
                    <div className="rounded-xl bg-red-950/50 border border-red-500/40 px-3 py-2">
                      <p className="text-[10px] text-red-300">Security</p>
                      <p className="text-xs text-red-100">
                        1 login from new device · 0 failed payments · 0 blocked
                        cards
                      </p>
                    </div>
                  </div>
                </div>

                {/* input */}
                <div className="border-t border-slate-800 px-3 py-2">
                  <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-2">
                    <input
                      className="h-8 flex-1 bg-transparent text-[11px] text-slate-100 outline-none placeholder:text-slate-500"
                      placeholder="Type what you want LitLabs to build or fix today..."
                    />
                    <button className="rounded-lg bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-slate-950">
                      Make me money
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-500">
              In the real app, this connects to your leads, bookings, and fraud
              logs inside your private dashboard.
            </p>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Everything you need to dominate.
          </h2>
          <p className="text-sm text-slate-300">
            6 core superpowers so you don&apos;t need 10 different apps.
          </p>

          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <FeatureCard
              title="Daily Content Engine"
              body="Generate scroll-stopping posts, captions, and hashtags in 1 click so you stay visible without burning out."
            />
            <FeatureCard
              title="DM Sales Machine"
              body="Turn &quot;Hey, how much?&quot; messages into booked appointments with ready-made sales scripts."
            />
            <FeatureCard
              title="Promo Generator"
              body="Create limited-time offers for slow days: bring-a-friend deals, flash sales, bundles and more."
            />
            <FeatureCard
              title="Fraud Guard"
              body="Watch logins, invoices, and payments. Get safe replies to scammers before they touch your money."
            />
            <FeatureCard
              title="Brand Voice"
              body="Train LitLabs to sound like you: tone, phrases, slang, and boundaries you won&apos;t cross."
            />
            <FeatureCard
              title="Live Dashboard"
              body="See leads, bookings, revenue and alerts from one screen instead of chasing screenshots and DMs."
            />
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Simple plans. Real leverage.
          </h2>
          <p className="text-sm text-slate-300">
            Start when you&apos;re ready. Upgrade only when LitLabs is
            obviously paying for itself.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <PricingCard
              label="Starter"
              price="$49/mo"
              highlight={false}
              items={[
                "Daily content engine",
                "DM reply scripts",
                "Promo generator",
                "Basic fraud checks",
                "Email support",
              ]}
            />
            <PricingCard
              label="⚡ Pro"
              price="$99/mo"
              highlight={true}
              items={[
                "Everything in Starter",
                "7-day content packs",
                "Brand voice training",
                "Client reactivation flows",
                "Priority support",
              ]}
            />
            <PricingCard
              label="Deluxe"
              price="$199/mo"
              highlight={false}
              items={[
                "Everything in Pro",
                "Holiday + launch templates",
                "Growth coaching sessions",
                "1-on-1 onboarding",
                "24/7 VIP support",
              ]}
            />
          </div>

          <p className="text-xs text-slate-400">
            ✨ All plans include a 14-day free trial. No contracts. Cancel
            anytime.
          </p>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            How LitLabs OS fits into your life.
          </h2>

          <div className="grid gap-4 md:grid-cols-3 text-xs text-slate-300">
            <StepCard
              step="1"
              title="Tell us about your world"
              body="Your niche, services, prices, city, and dream clients. LitLabs builds your base brain + playbooks from that."
            />
            <StepCard
              step="2"
              title="Connect your channels"
              body="Hook up your site, IG, or DMs. Drop 1 script and the bot starts handling leads in your tone."
            />
            <StepCard
              step="3"
              title="Watch the dashboard"
              body="See leads, bookings, and alerts in one place. Tweak prompts and offers without touching code."
            />
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-800 pt-6 text-xs text-slate-500 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} LitLabs Business OS.</span>
            <div className="flex gap-4">
              <a href="#features" className="hover:text-slate-300">
                Features
              </a>
              <a href="#pricing" className="hover:text-slate-300">
                Pricing
              </a>
              <a href="#how-it-works" className="hover:text-slate-300">
                How it works
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

type FeatureProps = {
  title: string;
  body: string;
};

function FeatureCard({ title, body }: FeatureProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-slate-300">{body}</p>
    </div>
  );
}

type PricingProps = {
  label: string;
  price: string;
  items: string[];
  highlight?: boolean;
};

function PricingCard({ label, price, items, highlight }: PricingProps) {
  return (
    <div
      className={`rounded-2xl p-4 space-y-3 ${
        highlight
          ? "border border-emerald-500 bg-slate-900/80 shadow-lg shadow-emerald-500/30"
          : "border border-slate-800 bg-slate-900/60"
      }`}
    >
      <p
        className={`text-xs font-semibold ${
          highlight ? "text-emerald-300" : "text-slate-300"
        }`}
      >
        {label}
      </p>
      <p className="text-2xl font-semibold">{price}</p>
      <ul className="space-y-2 text-xs text-slate-300">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

type StepProps = {
  step: string;
  title: string;
  body: string;
};

function StepCard({ step, title, body }: StepProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
      <p className="text-[10px] text-slate-400 mb-1">Step {step}</p>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-slate-300">{body}</p>
    </div>
  );
}
