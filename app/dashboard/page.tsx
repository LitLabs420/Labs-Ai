"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import AuthGate from "../../components/AuthGate";
import { auth } from "../../lib/firebase";

type UserInfo = {
  displayName: string | null;
  email: string | null;
};

function DashboardInner() {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    displayName: null,
    email: null,
  });

  useEffect(() => {
    const u = auth?.currentUser;
    if (u) {
      setUserInfo({
        displayName: u.displayName,
        email: u.email,
      });
    }
  }, []);

  const firstName =
    userInfo.displayName?.split(" ")[0] ||
    (userInfo.email ? userInfo.email.split("@")[0] : "Creator");

  return (
    <DashboardLayout>
      {/* TOP ROW: GREETING + STATS */}
      <section className="grid gap-4 lg:grid-cols-[1.6fr,1fr] mb-6">
        {/* Greeting + quick summary */}
        <div className="rounded-3xl border border-white/15 bg-black/70 p-4 sm:p-5 backdrop-blur space-y-3">
          <p className="text-xs text-white/50">Welcome back</p>
          <h1 className="text-xl sm:text-2xl font-semibold">
            What&apos;s the play today, {firstName}?
          </h1>
          <p className="text-xs sm:text-sm text-white/70 max-w-xl">
            Hit a command below to generate content, promos, DM replies, or run a
            fraud check. This is your control room — you type the vibe, LitLabs
            does the typing.
          </p>

          {/* Quick command buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] mt-2">
            <QuickCommand
              label="/daily_post"
              description="Post + caption + hashtags"
            />
            <QuickCommand
              label="/promo"
              description="Offer for slow days"
            />
            <QuickCommand label="/dm_reply" description="Reply to 'how much?'" />
            <QuickCommand
              label="/fraud_check"
              description="Scan for scams"
            />
          </div>
        </div>

        {/* Stats snapshot (fake numbers for now) */}
        <div className="rounded-3xl border border-white/15 bg-black/70 p-4 backdrop-blur space-y-3 text-xs">
          <p className="text-[11px] text-white/55 font-semibold">
            This week overview
          </p>
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="Posts" value="32" sub="+8 vs last week" />
            <StatCard label="DM replies" value="19" sub="+5 vs last week" />
            <StatCard label="Promos" value="6" sub="3 slow days saved" />
          </div>
          <div className="mt-1 border-t border-white/10 pt-2 space-y-1">
            <p className="text-[11px] text-white/65">
              Most-used command: <span className="font-mono">/daily_post</span>
            </p>
            <p className="text-[11px] text-emerald-300">
              Looks like you&apos;re staying consistent — keep going.
            </p>
          </div>
        </div>
      </section>

      {/* MIDDLE ROW: AI CONSOLE + SIDEBAR CARDS */}
      <section className="grid gap-4 lg:grid-cols-[1.45fr,1.05fr] mb-6">
        {/* AI CONSOLE */}
        <div className="rounded-3xl border border-white/15 bg-black/80 p-4 sm:p-5 backdrop-blur space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-white/70">
              LitLabs AI Console
            </p>
            <p className="text-[10px] text-white/50">
              Tip: start your message with a command (e.g. /daily_post)
            </p>
          </div>

          {/* Input */}
          <div className="space-y-2 text-xs">
            <label className="block text-[11px] text-white/60">
              What do you want help with?
            </label>
            <textarea
              rows={3}
              className="w-full rounded-2xl border border-white/20 bg-black/70 px-3 py-2 text-xs focus:outline-none focus:border-pink-500/80 focus:ring-1 focus:ring-pink-500/60"
              placeholder="/daily_post nail tech in Detroit, Friday is slow, want a fun promo vibe"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <button className="px-3 py-1.5 rounded-full bg-pink-500 text-[11px] font-semibold shadow-[0_0_18px_rgba(236,72,153,0.6)] hover:bg-pink-400">
              ⚡ Generate
            </button>
            <button className="px-3 py-1.5 rounded-full border border-white/20 bg-white/5 text-white/80 hover:bg-white/10">
              Clear
            </button>
            <span className="text-white/45">
              (Wire this button to your AI endpoint later.)
            </span>
          </div>

          {/* Output area */}
          <div className="mt-3 rounded-2xl border border-white/15 bg-black/70 p-3 text-[11px] text-white/75 min-h-[120px]">
            <p className="text-white/50 mb-1">Last output</p>
            <p className="font-mono text-[10px] text-white/60 mb-2">
              /daily_post · lash tech · Detroit · Saturday night
            </p>
            <p>
              POST IDEA: &quot;New set, new story&quot; close up video of your
              best work this week.  
              CAPTION: &quot;Detroit hands stay busy. If you&apos;re reading
              this, your next set is overdue — DM me &apos;SET&apos; for this
              week&apos;s slots.&quot;  
              HASHTAGS: #detroitlashes #litlabs #bookedandbusy
            </p>
          </div>
        </div>

        {/* SIDE PANELS */}
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Command cheatsheet */}
          <div className="rounded-3xl border border-white/15 bg-black/80 p-4 backdrop-blur space-y-2">
            <p className="text-xs font-semibold text-white/75 mb-1">
              Command cheatsheet
            </p>
            <ul className="space-y-1 text-[11px] text-white/70">
              <li>
                <span className="font-mono bg-white/5 px-2 py-0.5 rounded">
                  /daily_post
                </span>{" "}
                – post idea, caption, hashtags, story prompt
              </li>
              <li>
                <span className="font-mono bg-white/5 px-2 py-0.5 rounded">
                  /promo
                </span>{" "}
                – promo & offer for slow days
              </li>
              <li>
                <span className="font-mono bg-white/5 px-2 py-0.5 rounded">
                  /dm_reply
                </span>{" "}
                – handle &quot;how much?&quot; and other questions
              </li>
              <li>
                <span className="font-mono bg-white/5 px-2 py-0.5 rounded">
                  /fraud_check
                </span>{" "}
                – check if a DM looks like a scam
              </li>
            </ul>
          </div>

          {/* Today focus */}
          <div className="rounded-3xl border border-pink-500/70 bg-pink-500/10 p-4 backdrop-blur space-y-2">
            <p className="text-xs font-semibold text-white/80 mb-1">
              Today&apos;s focus
            </p>
            <p className="text-[11px] text-white/80">
              • Run <span className="font-mono">/daily_post</span> for today.  
              • If your calendar is still light, run{" "}
              <span className="font-mono">/promo</span> next.  
              • Got any sketchy DMs? Hit{" "}
              <span className="font-mono">/fraud_check</span>.
            </p>
          </div>
        </div>
      </section>

      {/* BOTTOM ROW: TIMELINE + PLAYBOOK */}
      <section className="grid gap-4 lg:grid-cols-2">
        {/* Timeline */}
        <div className="rounded-3xl border border-white/15 bg-black/80 p-4 sm:p-5 backdrop-blur text-xs sm:text-sm">
          <p className="text-xs font-semibold text-white/75 mb-2">
            Today&apos;s timeline (example)
          </p>
          <div className="space-y-3">
            <TimelineItem
              time="9:15 AM"
              title="Generated daily post"
              detail="IG post + caption + hashtags created with /daily_post."
            />
            <TimelineItem
              time="11:02 AM"
              title="Replied to 2 DMs"
              detail="Used /dm_reply to answer price questions."
            />
            <TimelineItem
              time="2:40 PM"
              title="Slow-day promo"
              detail="Ran /promo and posted an evening-fill offer."
            />
            <TimelineItem
              time="4:05 PM"
              title="Fraud check"
              detail="Scanned a weird &quot;overpay&quot; offer with /fraud_check."
            />
          </div>
          <p className="mt-3 text-[11px] text-white/50">
            Later, you can wire this to real stats. For now, treat it as your
            playbook: content → DMs → promos → safety.
          </p>
        </div>

        {/* Playbook */}
        <div className="rounded-3xl border border-white/15 bg-black/80 p-4 sm:p-5 backdrop-blur text-xs sm:text-sm">
          <p className="text-xs font-semibold text-white/75 mb-2">
            Lite growth playbook
          </p>
          <ul className="space-y-2 text-[11px] text-white/75">
            <li>
              <span className="font-semibold">Daily:</span> Run{" "}
              <span className="font-mono">/daily_post</span> once, then copy /
              paste to your main platform (IG, TikTok, FB).
            </li>
            <li>
              <span className="font-semibold">Slow days:</span> Run{" "}
              <span className="font-mono">/promo</span> in the morning and post it
              before noon.
            </li>
            <li>
              <span className="font-semibold">New DMs:</span> Use{" "}
              <span className="font-mono">/dm_reply</span> for all "how much?"
              and booking questions.
            </li>
            <li>
              <span className="font-semibold">Sketchy messages:</span> Use{" "}
              <span className="font-mono">/fraud_check</span> before accepting
              any strange payments.
            </li>
            <li>
              <span className="font-semibold">Once a week:</span> Look at stats
              (Posts, DMs, Promos) and ask LitLabs: &quot;What should I do more
              of next week?&quot;
            </li>
          </ul>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <AuthGate>
      <DashboardInner />
    </AuthGate>
  );
}

/* Helper components */

function QuickCommand({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <button className="text-left rounded-2xl border border-white/20 bg-white/5 px-3 py-2 hover:border-pink-500/70 hover:bg-pink-500/10 transition">
      <p className="font-mono text-[11px] text-pink-300">{label}</p>
      <p className="text-[10px] text-white/70">{description}</p>
    </button>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-white/20 bg-black/70 px-3 py-2">
      <p className="text-[10px] text-white/55">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
      <p className="text-[10px] text-emerald-300 mt-0.5">{sub}</p>
    </div>
  );
}

function TimelineItem({
  time,
  title,
  detail,
}: {
  time: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="h-2 w-2 rounded-full bg-pink-500" />
        <div className="flex-1 w-px bg-white/20" />
      </div>
      <div>
        <p className="text-[11px] text-white/50">{time}</p>
        <p className="text-xs font-semibold text-white/85">{title}</p>
        <p className="text-[11px] text-white/70">{detail}</p>
      </div>
    </div>
  );
}
