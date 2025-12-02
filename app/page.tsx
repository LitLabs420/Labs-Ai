import React from "react";
import Link from "next/link";

export default function Home() {
  // Force cache bust: new design deployed
  const timestamp = new Date().getTime();
  
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12 space-y-16">
        {/* Top nav */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-slate-800 flex items-center justify-center text-xs font-bold tracking-tight">
              LL
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">LitLabs AI</p>
              <p className="text-xs text-slate-400">
                Turn hustle into automatic income.
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <a href="#home" className="hover:text-white">
              Home
            </a>
            <a href="#pricing" className="hover:text-white">
              Pricing
            </a>
            <a href="#how-it-works" className="hover:text-white">
              How it works
            </a>
          </nav>

          <Link href="/dashboard" className="rounded-full border border-slate-700 px-4 py-1.5 text-xs font-medium hover:bg-slate-800">
            Dashboard Login
          </Link>
        </header>

        {/* Hero + chatbot */}
        <section
          id="home"
          className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-center"
        >
          {/* Left side text */}
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
              💸 LitLabs OS · Money-making AI for service businesses
            </span>

            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
              Your <span className="text-emerald-400">24/7 money bot</span> that
              books clients, answers DMs & chases payments while you live life.
            </h1>

            <p className="max-w-xl text-sm md:text-base text-slate-300">
              LitLabs AI plugs into your website and funnels, responds to every
              lead, pushes people to book, and keeps an eye out for fraud and
              weird logins — without you touching a thing.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard" className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400">
                Get started free
              </Link>
              <button className="rounded-xl border border-slate-700 px-5 py-2 text-sm text-slate-100 hover:bg-slate-900">
                Watch 2-min demo
              </button>
            </div>

            <ul className="grid gap-3 text-xs text-slate-300 md:grid-cols-2">
              <li>✅ Auto-DMs, follow ups & promos</li>
              <li>✅ Stripe + Firebase ready backend</li>
              <li>✅ Fraud & login activity dashboard</li>
              <li>✅ Templates for barbers, lash techs, nail techs & more</li>
            </ul>
          </div>

          {/* Right side fake chat window */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl shadow-emerald-500/15">
            <p className="mb-2 text-xs font-medium text-slate-400">
              Live LitLabs AI preview
            </p>

            <div className="h-[340px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70">
              <div className="flex h-full flex-col">
                {/* Chat header */}
                <div className="border-b border-slate-800 px-4 py-3 text-xs text-slate-400 flex items-center justify-between">
                  <span>Chat with your money bot</span>
                  <span className="text-[10px] text-emerald-300">
                    ● Online
                  </span>
                </div>

                {/* Chat body */}
                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-xs">
                  <div className="max-w-[80%] rounded-2xl bg-slate-800 px-3 py-2">
                    <p className="text-[11px] text-slate-200">
                      Yo, I&apos;m LitLabs OS. Tell me what you do and I&apos;ll
                      build a game plan that actually makes you money.
                    </p>
                  </div>

                  <div className="ml-auto max-w-[80%] rounded-2xl bg-emerald-500 px-3 py-2">
                    <p className="text-[11px] text-slate-950">
                      I do hair & lashes. I want more high-ticket clients, not
                      cheap walk-ins.
                    </p>
                  </div>

                  <div className="max-w-[80%] rounded-2xl bg-slate-800 px-3 py-2">
                    <p className="text-[11px] text-slate-200">
                      Bet. I&apos;ll write your posts, your DMs, and promos,
                      then track who&apos;s ready to book this week.
                    </p>
                  </div>

                  <div className="max-w-[80%] rounded-2xl bg-slate-800 px-3 py-2">
                    <p className="text-[11px] text-slate-200">
                      I&apos;ll also watch logins, invoices & weird payments so
                      you stay protected while the bag stacks.
                    </p>
                  </div>
                </div>

                {/* Chat input */}
                <div className="border-t border-slate-800 px-3 py-2">
                  <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-2">
                    <input
                      className="h-8 flex-1 bg-transparent text-[11px] text-slate-100 outline-none placeholder:text-slate-500"
                      placeholder="Type what you want LitLabs to build or fix..."
                    />
                    <button className="rounded-lg bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-slate-950">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-500">
              This is just the preview. In your real dashboard, you control the
              brain, flows, security rules and money.
            </p>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Pricing</h2>
          <p className="text-sm text-slate-300">
            Start free while you wire everything up. Only upgrade when LitLabs
            actually makes you money.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Starter */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-300">Starter</p>
              <p className="text-2xl font-semibold">$0</p>
              <p className="text-xs text-slate-400">
                Build the bot, test flows, no pressure.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>• 1 chatbot brain</li>
                <li>• Up to 100 chats / month</li>
                <li>• Basic email support</li>
              </ul>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border border-emerald-500 bg-slate-900/80 p-4 space-y-3 shadow-lg shadow-emerald-500/30">
              <p className="text-xs font-semibold text-emerald-300">Pro</p>
              <p className="text-2xl font-semibold">$49 / month</p>
              <p className="text-xs text-slate-200">
                For serious hustlers who want LitLabs handling clients daily.
              </p>
              <ul className="space-y-2 text-xs text-slate-200">
                <li>• 3 chatbot brains (site, IG, SMS)</li>
                <li>• Up to 3k chats / month</li>
                <li>• Stripe/Firebase integration guides</li>
                <li>• Priority support</li>
              </ul>
            </div>

            {/* God Mode */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-300">God Mode</p>
              <p className="text-2xl font-semibold">Let&apos;s talk</p>
              <p className="text-xs text-slate-400">
                Custom flows, deeper security, bigger volume. Built around your
                world.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>• Unlimited bots & channels</li>
                <li>• Custom fraud rules & dashboards</li>
                <li>• White-label options</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <div className="grid gap-4 md:grid-cols-3 text-xs text-slate-300">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <p className="text-sm font-semibold">1. Connect</p>
              <p>
                Answer a few questions about your business, services, prices and
                schedule. LitLabs builds your base brain automatically.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <p className="text-sm font-semibold">2. Deploy</p>
              <p>
                Drop a simple script on your site, socials or funnels. Your bot
                starts answering people in your voice, 24/7.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <p className="text-sm font-semibold">3. Optimize</p>
              <p>
                Use the dashboard to see convos, bookings, payments and fraud
                alerts. Tweak the brain, not the code.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800 pt-6 text-xs text-slate-500">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              © {new Date().getFullYear()} LitLabs. All rights reserved.
            </span>
            <div className="flex gap-4">
              <a href="#pricing" className="hover:text-slate-300">
                Pricing
              </a>
              <a href="#home" className="hover:text-slate-300">
                Back to top
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
