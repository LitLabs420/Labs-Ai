/**
 * Crypto Payment Handler
 * Supports Solana, Ethereum, and Coinbase Commerce
 * Works alongside Stripe for maximum flexibility
 */

import { PublicKey, Connection, clusterApiUrl, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ethers } from 'ethers';
import { supabase } from '@/lib/supabase';

// ============================================================
// SOLANA PAYMENTS (Cheapest, fastest)
// ============================================================

interface SolanaPaymentRequest {
  amount: number; // in USD
  walletAddress: string; // recipient
  userId: string;
  description: string;
  tier?: string;
}

interface SolanaPaymentResponse {
  signature: string;
  transactionUrl: string;
  confirmed: boolean;
}

export const SolanaPayments = {
  /**
   * Create Solana payment transaction
   * User pays from their wallet to your wallet
   */
  async createTransaction(
    request: SolanaPaymentRequest,
    userPublicKey: string
  ): Promise<Transaction> {
    const connection = new Connection(clusterApiUrl('mainnet-beta'));

    // Convert USD to SOL (using approximate rate - in production use price oracle)
    const solPrice = 250; // Update this with real price
    const solAmount = (request.amount / solPrice) * LAMPORTS_PER_SOL;

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(userPublicKey),
        toPubkey: new PublicKey(process.env.SOLANA_WALLET_ADDRESS || ''),
        lamports: solAmount,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(userPublicKey);

    return transaction;
  },

  /**
   * Verify Solana transaction on chain
   */
  async verifyTransaction(signature: string): Promise<boolean> {
    const connection = new Connection(clusterApiUrl('mainnet-beta'));
    const confirmation = await connection.getSignatureStatus(signature);
    return confirmation.value?.confirmationStatus === 'finalized';
  },

  /**
   * Save payment to database after verification
   */
  async recordPayment(
    userId: string,
    signature: string,
    amountUsd: number,
    tier: string
  ): Promise<void> {
    try {
      const { error } = await supabase.from('crypto_payments').insert({
        user_id: userId,
        blockchain: 'solana',
        transaction_hash: signature,
        amount_usd: amountUsd,
        tier: tier,
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Upgrade user subscription
      await supabase
        .from('subscriptions')
        .update({ tier: tier, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
    } catch (err: unknown) {
      console.error('Failed to record Solana payment:', err);
      throw err;
    }
  },
};

// ============================================================
// ETHEREUM PAYMENTS (More recognized)
// ============================================================

interface EthereumPaymentRequest {
  amount: number; // in USD
  walletAddress: string; // recipient
  userId: string;
  description: string;
  tier?: string;
}

export const EthereumPayments = {
  /**
   * Generate Ethereum payment request
   * Uses ethers.js to interact with wallet
   */
  async getPaymentDetails(request: EthereumPaymentRequest): Promise<{
    to: string;
    value: string; // in wei
    data?: string;
  }> {
    // Convert USD to ETH (use price oracle in production)
    const ethPrice = 3500; // Update with real price
    const ethAmount = request.amount / ethPrice;

    return {
      to: process.env.ETH_WALLET_ADDRESS || '',
      value: ethers.parseEther(ethAmount.toString()).toString(),
      data: `0x${Buffer.from(JSON.stringify({ userId: request.userId, tier: request.tier })).toString('hex')}`,
    };
  },

  /**
   * Verify Ethereum transaction on Etherscan/block explorer
   */
  async verifyTransaction(hash: string): Promise<boolean> {
    try {
      const provider = new ethers.JsonRpcProvider(
        `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`
      );
      const receipt = await provider.getTransactionReceipt(hash);
      return receipt?.status === 1; // 1 = success
    } catch (error: unknown) {
      console.error('Failed to verify Ethereum transaction:', error);
      return false;
    }
  },

  /**
   * Save payment to database after verification
   */
  async recordPayment(
    userId: string,
    hash: string,
    amountUsd: number,
    tier: string
  ): Promise<void> {
    try {
      const { error } = await supabase.from('crypto_payments').insert({
        user_id: userId,
        blockchain: 'ethereum',
        transaction_hash: hash,
        amount_usd: amountUsd,
        tier: tier,
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Upgrade user subscription
      await supabase
        .from('subscriptions')
        .update({ tier: tier, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
    } catch (err: unknown) {
      console.error('Failed to record Ethereum payment:', err);
      throw err;
    }
  },
};

// ============================================================
// PAYMENT ROUTING (Decide which blockchain)
// ============================================================

interface PaymentRequest {
  amount: number; // USD
  userId: string;
  tier: string;
  blockchain: 'solana' | 'ethereum' | 'stripe'; // User chooses
  description: string;
}

export async function processPayment(
  request: PaymentRequest,
  walletAddress?: string
): Promise<{
  success: boolean;
  message: string;
  redirectUrl?: string;
  transactionId?: string;
}> {
  try {
    switch (request.blockchain) {
      case 'solana':
        if (!walletAddress) {
          return { success: false, message: 'Solana wallet address required' };
        }

        const solTx = await SolanaPayments.createTransaction(
          {
            amount: request.amount,
            walletAddress,
            userId: request.userId,
            description: request.description,
            tier: request.tier,
          },
          walletAddress
        );

        return {
          success: true,
          message: 'Solana transaction ready - sign with wallet',
          transactionId: 'pending_solana_sign',
        };

      case 'ethereum':
        if (!walletAddress) {
          return { success: false, message: 'Ethereum wallet address required' };
        }

        const ethPayment = await EthereumPayments.getPaymentDetails({
          amount: request.amount,
          walletAddress,
          userId: request.userId,
          description: request.description,
          tier: request.tier,
        });

        return {
          success: true,
          message: 'Ethereum payment ready - confirm in wallet',
          transactionId: 'pending_eth_sign',
        };

      case 'stripe':
        // Fallback to existing Stripe handler
        return {
          success: true,
          message: 'Redirecting to Stripe...',
          redirectUrl: `/api/checkout?tier=${request.tier}&userId=${request.userId}`,
        };

      default:
        return { success: false, message: 'Unknown blockchain' };
    }
  } catch (error: unknown) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Payment failed',
    };
  }
}

// ============================================================
// PRICE ORACLE (Gets current prices)
// ============================================================

export const PriceOracle = {
  async getSolPrice(): Promise<number> {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      const data = await response.json();
      return data.solana.usd;
    } catch {
      return 250; // Fallback
    }
  },

  async getEthPrice(): Promise<number> {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await response.json();
      return data.ethereum.usd;
    } catch {
      return 3500; // Fallback
    }
  },

  async getAllPrices(): Promise<{ sol: number; eth: number }> {
    const [sol, eth] = await Promise.all([this.getSolPrice(), this.getEthPrice()]);
    return { sol, eth };
  },
};

// ============================================================
// SUBSCRIPTION PRICING TIERS
// ============================================================

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    credits: 10,
    features: ['AI content generation', 'Basic bot', '1 automation'],
    monthlyRequests: 100,
  },
  starter: {
    name: 'Starter',
    priceUsd: 9,
    priceSol: 0.036, // ~$9
    priceEth: 0.0026, // ~$9
    credits: 100,
    features: ['Unlimited AI generation', 'Bot builder', '10 automations', 'Basic analytics'],
    monthlyRequests: 1000,
  },
  creator: {
    name: 'Creator',
    priceUsd: 29,
    priceSol: 0.116, // ~$29
    priceEth: 0.0083, // ~$29
    credits: 500,
    features: ['Everything in Starter', 'Marketplace access', 'Advanced analytics', 'Team accounts (2)'],
    monthlyRequests: 5000,
  },
  pro: {
    name: 'Pro',
    priceUsd: 79,
    priceSol: 0.316, // ~$79
    priceEth: 0.0226, // ~$79
    credits: 2000,
    features: ['Everything in Creator', 'Priority support', 'Custom branding', 'Team accounts (5)', 'API access'],
    monthlyRequests: 20000,
  },
  agency: {
    name: 'Agency',
    priceUsd: 199,
    priceSol: 0.796, // ~$199
    priceEth: 0.0568, // ~$199
    credits: 5000,
    features: ['Everything in Pro', 'White-label', 'Unlimited team', 'Dedicated support', 'Advanced API'],
    monthlyRequests: 100000,
  },
  enterprise: {
    name: 'Enterprise',
    priceUsd: null, // Custom pricing
    features: ['Custom everything', 'Dedicated account manager', 'SLA', 'Custom integrations'],
    monthlyRequests: 'unlimited',
  },
};

// ============================================================
// DATABASE SCHEMA for crypto_payments table
// ============================================================

/*
CREATE TABLE crypto_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  blockchain TEXT NOT NULL, -- 'solana', 'ethereum', 'stripe'
  transaction_hash TEXT UNIQUE NOT NULL,
  amount_usd DECIMAL NOT NULL,
  amount_crypto DECIMAL,
  tier TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_crypto_payments_user_id ON crypto_payments(user_id);
CREATE INDEX idx_crypto_payments_blockchain ON crypto_payments(blockchain);
*/
