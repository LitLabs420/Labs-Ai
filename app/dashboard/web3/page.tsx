'use client';

import { Wallet } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function Web3Page() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="border-b border-cyan-500/20 bg-black/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
              <Wallet size={32} />
              Web3 Universe
            </h1>
            <p className="text-gray-400 mt-2">Coming soon: Web3 wallet integration and portfolio management</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-black/50 border border-cyan-500/20 rounded-lg p-8 text-center">
            <p className="text-xl text-gray-300">This feature is under development</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
