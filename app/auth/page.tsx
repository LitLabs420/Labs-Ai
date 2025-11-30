'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PremiumAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        
        // Log signup event
        fetch('/api/send-email-sequence?type=welcome', {
          method: 'POST',
          body: JSON.stringify({ email, displayName: businessName }),
        }).catch(console.error);
      }
      router.push('/dashboard');
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Google auth failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Video Background Alternative - Animated gradients */}
      <div className="fixed inset-0 -z-10">
        {/* Animated gradient orbs */}
        <div className="absolute -top-40 -left-40 h-96 w-96 bg-pink-600/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 bg-cyan-600/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 left-1/2 h-96 w-96 bg-purple-600/30 rounded-full blur-3xl" />
        
        {/* Mesh gradient effect */}
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgb(236, 72, 153)', stopOpacity: 0.1 }} />
                <stop offset="50%" style={{ stopColor: 'rgb(139, 92, 246)', stopOpacity: 0.05 }} />
                <stop offset="100%" style={{ stopColor: 'rgb(34, 211, 238)', stopOpacity: 0.1 }} />
              </linearGradient>
            </defs>
            <rect width="1200" height="800" fill="url(#grad1)" />
          </svg>
        </div>

        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.025] mix-blend-overlay" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="2" /%3E%3C/filter%3E%3Crect width="400" height="400" fill="%23fff" filter="url(%23noiseFilter)" /%3E%3C/svg%3E")',
          backgroundSize: '400px 400px'
        }} />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Header with premium branding */}
          <div className="text-center mb-12">
            <Link href="/" className="inline-flex items-center gap-3 mb-8 hover:opacity-80 transition">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 flex items-center justify-center text-lg font-black shadow-2xl shadow-pink-500/50 hover:shadow-pink-500/75 transition">
                LL
              </div>
              <div className="text-left">
                <p className="text-xl font-black text-white tracking-tight">LitLabs</p>
                <p className="text-xs text-white/50 tracking-widest">BUSINESS OS</p>
              </div>
            </Link>

            <h1 className="text-4xl font-black text-white mb-3">
              {mode === 'login' ? 'Welcome Back' : 'Join the Revolution'}
            </h1>
            <p className="text-white/70 text-sm">
              {mode === 'login'
                ? '🚀 Get back to dominating your market'
                : '✨ Start your AI-powered business today'}
            </p>
          </div>

          {/* Premium glassmorphic card */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition" />
            <div className="relative bg-slate-950/80 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
              {/* Decorative corner elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-500/20 to-transparent rounded-bl-2xl opacity-50" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-cyan-500/20 to-transparent rounded-tr-2xl opacity-50" />

              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="relative w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-white/30 hover:border-white/50 bg-white/10 hover:bg-white/20 text-white transition mb-6 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {loading ? 'Connecting...' : 'Continue with Google'}
              </button>

              {/* Premium Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-slate-950 text-white/60 text-xs font-medium">Or with email</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4 relative z-10">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm font-medium">
                    {error}
                  </div>
                )}

                {mode === 'signup' && (
                  <input
                    type="text"
                    placeholder="Business Name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 hover:border-white/40 focus:border-pink-500/80 text-white placeholder-white/50 focus:outline-none transition focus:bg-white/15 font-medium"
                  />
                )}

                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 hover:border-white/40 focus:border-pink-500/80 text-white placeholder-white/50 focus:outline-none transition focus:bg-white/15 font-medium"
                />

                <input
                  type="password"
                  placeholder="Password (8+ chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 hover:border-white/40 focus:border-pink-500/80 text-white placeholder-white/50 focus:outline-none transition focus:bg-white/15 font-medium"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-pink-500/40 hover:shadow-pink-500/60 transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transform"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⚙️</span> Processing...
                    </span>
                  ) : mode === 'login' ? (
                    '🚀 Sign In'
                  ) : (
                    '✨ Create Account'
                  )}
                </button>
              </form>

              {/* Toggle Mode */}
              <p className="text-center text-white/60 text-sm mt-6 relative z-10 font-medium">
                {mode === 'login' ? "New here? " : 'Already a member? '}
                <button
                  onClick={() => {
                    setMode(mode === 'login' ? 'signup' : 'login');
                    setError('');
                  }}
                  className="text-pink-400 hover:text-pink-300 font-bold transition"
                >
                  {mode === 'login' ? 'Create Account' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition">
              <p className="text-2xl font-black bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">2k+</p>
              <p className="text-xs text-white/60 mt-1">Active Pros</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition">
              <p className="text-2xl font-black bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">98%</p>
              <p className="text-xs text-white/60 mt-1">Love It</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition">
              <p className="text-2xl font-black bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">24/7</p>
              <p className="text-xs text-white/60 mt-1">AI Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
