'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/DashboardLayout';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { trackEvent } from '@/lib/analytics';
import { useRouter } from 'next/navigation';
import { FunArcadeBanner } from '@/components/dashboard/FunArcadeBanner';
import { XPCard } from '@/components/dashboard/XPCard';
import { DailyChallengeCard } from '@/components/dashboard/DailyChallengeCard';

const MoneyTodayCard = dynamic(() => import('@/components/dashboard/MoneyTodayCard').then(mod => ({ default: mod.MoneyTodayCard })), { ssr: false });
const ChatBotOnboarding = dynamic(() => import('@/components/dashboard/ChatBot').then(mod => ({ default: mod.ChatBotOnboarding })), { ssr: false });

type Stats = {
  postsThisMonth: number;
  totalClients: number;
  revenue: number;
  tier: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [stats, setStats] = useState<Stats>({
    postsThisMonth: 0,
    totalClients: 0,
    revenue: 0,
    tier: 'free',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      router.push('/auth');
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth');
        return;
      }

      setDisplayName(user.displayName || user.email?.split('@')[0] || 'Creator');
      trackEvent('dashboard_view', { uid: user.uid });

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as Partial<Stats>;
        setStats({
          postsThisMonth: data.postsThisMonth || 0,
          totalClients: data.totalClients || 0,
          revenue: data.revenue || 0,
          tier: data.tier || 'free',
        });
      }
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  if (loading) return null;

  return (
    <DashboardLayout>
      <div className='space-y-8'>
        {/* ARCADE BANNER */}
        <FunArcadeBanner />

        {/* XP + CHALLENGE SECTION */}
        <div className='grid md:grid-cols-3 gap-4'>
          <XPCard level={4} xp={72} streakDays={5} />
          <div className='md:col-span-2'>
            <DailyChallengeCard />
          </div>
        </div>

        {/* HERO SECTION */}
        <div className='relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-sky-500/20 p-12 shadow-2xl'>
          <div className='absolute -top-32 -right-32 h-80 w-80 bg-pink-500/30 rounded-full blur-3xl opacity-50' />
          <div className='relative z-10'>
            <p className='text-sm text-white/70 mb-2'>Welcome back,</p>
            <h1 className='text-4xl font-black text-white mb-4'>Time to Make Moves 🚀</h1>
            <p className='text-lg text-white/80 max-w-2xl'>
              Your AI is ready to work. Generate content, reply to DMs, and grow your business—all in one place.
            </p>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6 hover:border-pink-500/50 transition'>
            <div className='relative z-10'>
              <p className='text-white/60 text-sm mb-2'>Posts This Month</p>
              <p className='text-4xl font-black text-pink-400'>{stats.postsThisMonth}</p>
              <p className='text-xs text-white/50 mt-2'>Keep it up!</p>
            </div>
          </div>

          <div className='group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6 hover:border-emerald-500/50 transition'>
            <div className='relative z-10'>
              <p className='text-white/60 text-sm mb-2'>Active Clients</p>
              <p className='text-4xl font-black text-emerald-400'>{stats.totalClients}</p>
              <p className='text-xs text-white/50 mt-2'>Growing</p>
            </div>
          </div>

          <div className='group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6 hover:border-sky-500/50 transition'>
            <div className='relative z-10'>
              <p className='text-white/60 text-sm mb-2'>Revenue</p>
              <p className='text-4xl font-black text-sky-400'>\</p>
              <p className='text-xs text-white/50 mt-2'>This month</p>
            </div>
          </div>

          <div className='group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6 hover:border-purple-500/50 transition'>
            <div className='relative z-10'>
              <p className='text-white/60 text-sm mb-2'>Your Plan</p>
              <p className='text-2xl font-black text-purple-400 uppercase'>{stats.tier}</p>
              <p className='text-xs text-white/50 mt-2'>{stats.tier === 'free' ? 'Upgrade?' : 'Premium!'}</p>
            </div>
          </div>
        </div>

        {/* FEATURE CARDS */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='group relative rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden hover:border-pink-500/50 transition p-8'>
            <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-xl mb-4'>✨</div>
            <h3 className='text-xl font-bold text-white mb-2'>Daily Post Generator</h3>
            <p className='text-white/70 mb-6'>AI creates engaging posts in 30 seconds</p>
            <button className='px-4 py-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-sm font-semibold transition'>Try Now →</button>
          </div>

          <div className='group relative rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden hover:border-sky-500/50 transition p-8'>
            <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-xl mb-4'>💬</div>
            <h3 className='text-xl font-bold text-white mb-2'>Smart DM Replies</h3>
            <p className='text-white/70 mb-6'>Professional responses instantly</p>
            <button className='px-4 py-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-sm font-semibold transition'>Try Now →</button>
          </div>

          <div className='group relative rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden hover:border-red-500/50 transition p-8'>
            <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xl mb-4'>🛡️</div>
            <h3 className='text-xl font-bold text-white mb-2'>Fraud Detection</h3>
            <p className='text-white/70 mb-6'>AI flags suspicious messages</p>
            <button className='px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm font-semibold transition'>Try Now →</button>
          </div>

          <div className='group relative rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden hover:border-emerald-500/50 transition p-8'>
            <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xl mb-4'>📈</div>
            <h3 className='text-xl font-bold text-white mb-2'>Real-Time Analytics</h3>
            <p className='text-white/70 mb-6'>Track everything in real-time</p>
            <button className='px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-semibold transition'>View Stats →</button>
          </div>
        </div>

        {/* MONEY TODAY + CHATBOT SECTION */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div>
            <h2 className='text-2xl font-bold text-white mb-4'>🚀 GODMODE Features</h2>
            <MoneyTodayCard />
          </div>
          <div>
            <h2 className='text-2xl font-bold text-white mb-4'>🤖 Get Onboarded</h2>
            <ChatBotOnboarding />
          </div>
        </div>

        {/* CTA SECTION */}
        {stats.tier === 'free' && (
          <div className='relative rounded-2xl border border-white/10 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-sky-500/10 p-8 text-center'>
            <div className='relative z-10'>
              <h2 className='text-3xl font-bold text-white mb-4'>Ready to Unlock More?</h2>
              <p className='text-white/70 mb-6 max-w-2xl mx-auto'>Upgrade to Pro for unlimited posts, advanced analytics, and priority support.</p>
              <button className='px-8 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-pink-500/30 transition'>Upgrade Now</button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
