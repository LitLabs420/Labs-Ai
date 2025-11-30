"use client";

import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-2xl">🔥</span>
            <span>LitLabs</span>
          </Link>
          <nav className="flex gap-6 text-sm text-gray-400">
            <a href="/#playbooks" className="hover:text-white transition">Features</a>
            <a href="/#learn" className="hover:text-white transition">Arcade</a>
            <Link href="/dashboard" className="text-[#3ef1c2] hover:brightness-110 transition font-semibold">
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-20 pt-10 space-y-16 text-white">
      {/* HERO SECTION */}
      <section className="grid lg:grid-cols-2 gap-10 items-center">
        {/* LEFT: TEXT */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fuchsia-400 to-teal-300" />
            <span>LitLabs OS is live — built for beauty pros, barbers & creators</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Your AI command center built to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9b5cff] via-[#ff4fa3] to-[#3ef1c2]">
              make you money.
            </span>
          </h1>

          <p className="text-gray-300 text-sm md:text-base max-w-lg">
            Automate your marketing, create daily content, reply to DMs like a human,
            run money plays and see your next 30–90 days laid out like a game plan.
            Stop guessing. Start executing with LitLabs OS.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold bg-gradient-to-r from-[#9b5cff] via-[#ff4fa3] to-[#3ef1c2] text-black hover:brightness-110 transition">
              Activate LitLabs →
            </Link>
            <button className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold border border-white/15 bg-white/5 text-gray-100 hover:bg-white/10 transition">
              View plans
            </button>
          </div>

          <p className="text-xs text-gray-400">
            ✨ No contracts. No setup fees. Cancel anytime.
          </p>

          {/* MINI "PEOPLE LIKE YOU" STRIP */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex -space-x-2">
              <div className="relative h-8 w-8 rounded-full overflow-hidden border border-white/20">
                <Image
                  src="/litlabs/hero-beauty-grid.png"
                  alt="Beauty pros using LitLabs"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-8 w-8 rounded-full overflow-hidden border border-white/20">
                <Image
                  src="/litlabs/hero-mobile.png"
                  alt="LitLabs OS on mobile"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-300">
              Lash techs, barbers, nail techs & creators already running AI plays with LitLabs.
            </p>
          </div>
        </div>

        {/* RIGHT: VIDEO + STATS */}
        <div className="relative">
          <div className="absolute -top-16 -left-10 h-40 w-40 bg-[#9b5cff]/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -right-10 h-40 w-40 bg-[#3ef1c2]/40 rounded-full blur-3xl" />

          <div className="relative z-10 rounded-2xl border border-white/10 bg-white/5/5 backdrop-blur-xl p-4 md:p-5">
            <div className="grid grid-cols-5 gap-4 items-stretch">
              {/* MAIN VIDEO */}
              <div className="col-span-3">
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-black/70">
                  <video
                    className="h-full w-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="/litlabs/hero-dashboard.png"
                  >
                    <source src="/litlabs/hero-loop.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* STAT CARDS */}
              <div className="col-span-2 flex flex-col gap-3 text-xs">
                <div>
                  <p className="text-gray-400 mb-1">This week's revenue</p>
                  <p className="text-xl font-bold">$4,320</p>
                  <p className="text-[11px] text-[#3ef1c2] mt-1">
                    +27% vs last week
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">DMs handled</p>
                  <p className="text-lg font-semibold text-white">83</p>
                  <p className="text-[11px] text-[#ff4fa3] mt-1">
                    21 turned into bookings
                  </p>
                </div>
                <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-white/10">
                  <Image
                    src="/litlabs/hero-beauty-grid.png"
                    alt="Beauty pros powered by LitLabs"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center px-2 text-[11px] text-gray-200 text-center">
                    "LitLabs runs the plays. I just show up and work."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLAYBOOK LIBRARY SECTION */}
      <section id="playbooks" className="grid lg:grid-cols-[1.2fr,1fr] gap-8 items-center">
        <div className="space-y-3">
          <p className="text-xs text-[#3ef1c2]">
            Playbook Library · Pre-built money moves
          </p>
          <h2 className="text-xl font-semibold">
            Pre-made money plays for barbers, lash techs, nail techs & more.
          </h2>
          <p className="text-xs text-gray-300 max-w-md">
            Don't start from zero. Grab a playbook like "Fill this weekend" or
            "Comeback clients", copy the scripts, and run the move today.
          </p>
          <ul className="text-[11px] text-gray-300 space-y-1 list-disc list-inside">
            <li>Fill slow days with flash promos.</li>
            <li>Win back old clients with comeback DMs.</li>
            <li>Launch new services without looking desperate.</li>
          </ul>
          <p className="text-[11px] text-gray-400 max-w-md">
            Every play comes with steps, captions, DM scripts & story scripts you can
            paste straight into your socials.
          </p>
        </div>
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10">
          <Image
            src="/litlabs/playbooks-grid.png"
            alt="LitLabs playbook library"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* FUN / ARCADE + LEARN */}
      <section id="learn" className="grid lg:grid-cols-[1.2fr,1fr] gap-8 items-center">
        <div className="space-y-3">
          <p className="text-xs text-[#3ef1c2]">
            LitLabs Arcade · Make business feel like a game
          </p>
          <h2 className="text-xl font-semibold">
            XP, streaks & daily money challenges built into your dashboard.
          </h2>
          <p className="text-xs text-gray-300 max-w-md">
            LitLabs OS turns your business into a game you can win. Earn XP for
            running content, DM and promo plays. Keep streaks alive with daily
            challenges. Hit "Make me money today" when you're stuck.
          </p>
          <ul className="text-[11px] text-gray-300 space-y-1 list-disc list-inside">
            <li>Daily challenge card keeps you moving.</li>
            <li>XP & streaks for posting, DMs and promos.</li>
            <li>Godmode unlocks 30–90 day Future Builder maps.</li>
          </ul>
          <Link
            href="/dashboard"
            className="mt-2 inline-flex items-center gap-2 text-[11px] text-[#3ef1c2] hover:text-[#ff4fa3]"
          >
            Open dashboard and see the arcade →
          </Link>
        </div>
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10">
          <Image
            src="/litlabs/fun-arcade.png"
            alt="LitLabs arcade view"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* PRICING CTA BOTTOM */}
      <section className="space-y-4 text-center">
        <h2 className="text-2xl font-semibold">
          Simple plans. Real leverage.
        </h2>
        <p className="text-xs text-gray-300 max-w-md mx-auto">
          Start free, then unlock Godmode when you're ready for 30–90 day planning,
          deeper money plays and extra content & DM variations.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold bg-gradient-to-r from-[#9b5cff] via-[#ff4fa3] to-[#3ef1c2] text-black hover:brightness-110 transition">
            Start free trial
          </Link>
          <button
            className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold border border-white/15 bg-white/5 text-gray-100 hover:bg-white/10 transition"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/pricing";
              }
            }}
          >
            View full pricing
          </button>
        </div>
        <p className="text-[11px] text-gray-400">
          ✨ 14-day free trial on all plans. No card required.
        </p>
      </section>
    </main>
    </>
  );
}
