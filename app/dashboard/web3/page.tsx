'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, Send, ArrowUpRight, Eye, EyeOff, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface WalletAccount {
  address: string;
  network: 'ethereum' | 'polygon' | 'arbitrum';
  balance: number;
  nftCount: number;
}

export default function Web3Page() {
  const [hideBalance, setHideBalance] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'swap' | 'nfts'>('portfolio');
  const [isMounted, setIsMounted] = useState(false);

  // Mock data for accounts
  const accounts: WalletAccount[] = [
    { address: '0x1234...', network: 'ethereum', balance: 2.5, nftCount: 3 },
    { address: '0x5678...', network: 'polygon', balance: 150, nftCount: 1 },
  ];

  // Mock data for tokens
  const tokens = [
    { symbol: 'ETH', name: 'Ethereum', balance: 2.5, usdValue: 5250, change24h: 2.5 },
    { symbol: 'USDC', name: 'USD Coin', balance: 5000, usdValue: 5000, change24h: 0 },
    { symbol: 'ARB', name: 'Arbitrum', balance: 1000, usdValue: 2000, change24h: -1.2 },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalBalance = tokens.reduce((sum, token) => sum + token.usdValue, 0);
  const change24h = (
    tokens.reduce((sum, token) => sum + (token.usdValue * token.change24h) / 100, 0) / totalBalance
  ) * 100;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  if (!isMounted) return null;