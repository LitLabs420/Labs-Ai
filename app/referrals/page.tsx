'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ReferralsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ uid: string } | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [stats, setStats] = useState({
    referralCount: 0,
    totalBonus: 0,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        router.push('/auth');
        return;
      }

      setUser(authUser);

      const code = Buffer.from(`${authUser.uid}:referral`).toString('base64').slice(0, 12);
      setReferralCode(code);
      setReferralLink(`${window.location.origin}/signup?ref=${code}`);

      const userDoc = await getDoc(doc(db, 'users', authUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setStats({
          referralCount: data.referralCount || 0,
          totalBonus: data.totalReferralBonus || 0,
        });
      }
    });

    return () => unsubscribe();
  }, [router]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied!');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          🚀 Invite Friends &amp; Earn
        </h1>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/30 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Your Referral Link</h2>
          <div className="bg-slate-900/50 border border-purple-500/20 rounded-lg p-4 mb-4">
            <p className="text-slate-300 text-sm mb-2">Share this link:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                placeholder="Referral link"
                aria-label="Referral link"
                className="flex-1 bg-slate-800 border border-purple-500/30 rounded px-3 py-2 text-white text-sm font-mono"
              />
              <button
                onClick={copyToClipboard}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-4 py-2 rounded font-semibold transition-all"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4">
            <p className="text-slate-300 text-sm mb-2">Unique Code:</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono">{referralCode}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-pink-500/30 rounded-lg p-6">
            <p className="text-slate-400 text-sm mb-2">Referrals</p>
            <p className="text-3xl font-bold text-pink-400">{stats.referralCount}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-emerald-500/30 rounded-lg p-6">
            <p className="text-slate-400 text-sm mb-2">Bonus Credits</p>
            <p className="text-3xl font-bold text-emerald-400">${stats.totalBonus}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/30 rounded-2xl p-8">
          <h3 className="text-lg font-bold text-white mb-4">💡 How It Works</h3>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">1.</span>
              <span>Share your unique referral link with beauty professionals</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">2.</span>
              <span>They sign up using your link</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">3.</span>
              <span>You earn $10 credit for each signup</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400 font-bold">4.</span>
              <span>Use credits for premium features or cash out</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

