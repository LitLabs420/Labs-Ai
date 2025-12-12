/**
 * Crypto Marketplace System
 * 
 * Complete Web3 payment and trading infrastructure:
 * - Crypto payment processing (BTC, ETH, USDC, SOL)
 * - P2P trading marketplace
 * - NFT integration
 * - Smart contract wrappers
 * - Wallet management
 */

import { Wallet } from 'ethers';

export type CryptoAsset = 'BTC' | 'ETH' | 'USDC' | 'SOL' | 'XRP' | 'DOGE' | 'MATIC';
export type ChainNetwork = 'ethereum' | 'solana' | 'polygon' | 'arbitrum' | 'base' | 'optimism';
export type MarketplaceItemType = 'template' | 'nft' | 'course' | 'ai_model' | 'data_pack';

/**
 * CRYPTO PAYMENT CONFIGURATION
 */
export const CRYPTO_PAYMENT_CONFIG = {
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: '₿',
    decimals: 8,
    networks: ['bitcoin'],
    minTransaction: 0.001,
    confirmations: 1,
    rpcUrl: process.env.BITCOIN_RPC_URL || '',
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: 'Ξ',
    decimals: 18,
    networks: ['ethereum'],
    minTransaction: 0.01,
    confirmations: 12,
    rpcUrl: process.env.ETHEREUM_RPC_URL || '',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    icon: '💵',
    decimals: 6,
    networks: ['ethereum', 'polygon', 'arbitrum', 'optimism'],
    minTransaction: 10,
    confirmations: 12,
    rpcUrl: process.env.ETHEREUM_RPC_URL || '',
    contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  },
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    icon: '◎',
    decimals: 9,
    networks: ['solana'],
    minTransaction: 0.1,
    confirmations: 32,
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  },
  XRP: {
    symbol: 'XRP',
    name: 'XRP Ledger',
    icon: '✕',
    decimals: 6,
    networks: ['xrpl'],
    minTransaction: 20,
    confirmations: 1,
    rpcUrl: process.env.XRPL_RPC_URL || 'https://xrpl.ws',
  },
  DOGE: {
    symbol: 'DOGE',
    name: 'Dogecoin',
    icon: '🐕',
    decimals: 8,
    networks: ['dogecoin'],
    minTransaction: 1,
    confirmations: 6,
    rpcUrl: process.env.DOGECOIN_RPC_URL || '',
  },
  MATIC: {
    symbol: 'MATIC',
    name: 'Polygon',
    icon: '🟣',
    decimals: 18,
    networks: ['polygon'],
    minTransaction: 1,
    confirmations: 128,
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
  },
};

/**
 * USD PRICING ANCHORS
 * Real-time conversions used for payment processing
 */
export interface CryptoPriceAnchor {
  asset: CryptoAsset;
  usdPrice: number;
  lastUpdated: Date;
  confidence: number; // 0-1, based on price feed reliability
}

export const PRICE_ANCHORS: Record<CryptoAsset, number> = {
  BTC: 45000,    // Updated hourly from API
  ETH: 2500,
  USDC: 1,
  SOL: 140,
  XRP: 2.5,
  DOGE: 0.30,
  MATIC: 0.65,
};

/**
 * CRYPTO PAYMENT METHOD
 * Record of crypto payment received
 */
export interface CryptoPayment {
  id: string;
  userId: string;
  orderId: string;
  asset: CryptoAsset;
  amount: number; // Amount received
  usdValue: number; // USD equivalent at time of payment
  toAddress: string; // Platform receiving wallet
  fromAddress: string; // User's wallet
  transactionHash: string;
  network: ChainNetwork;
  status: 'pending' | 'confirmed' | 'settled' | 'failed';
  confirmations: number;
  requiredConfirmations: number;
  createdAt: Date;
  confirmedAt?: Date;
  settledAt?: Date;
  failureReason?: string;
  metadata?: Record<string, any>;
}

/**
 * P2P TRADING ORDER
 * User-to-user trading on marketplace
 */
export interface TradeOrder {
  id: string;
  type: 'buy' | 'sell';
  seller: string;
  buyer?: string;
  offering: CryptoAsset;
  offeringAmount: number;
  requesting: CryptoAsset;
  requestingAmount: number;
  pricePerUnit: number;
  status: 'open' | 'matched' | 'pending_confirmation' | 'completed' | 'cancelled';
  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date;
  escrowAddress?: string; // Smart contract holding funds during trade
  reviews?: {
    from: string;
    rating: 1 | 2 | 3 | 4 | 5;
    comment: string;
  }[];
}

/**
 * MARKETPLACE LISTING (Crypto Trading)
 */
export interface CryptoMarketplaceListing {
  id: string;
  seller: string;
  itemType: MarketplaceItemType;
  itemId: string; // Template ID, NFT ID, etc.
  title: string;
  description: string;
  price: {
    asset: CryptoAsset;
    amount: number;
  };
  acceptedPayments: CryptoAsset[];
  images: string[];
  category: string;
  rating: number;
  reviews: {
    reviewer: string;
    rating: 1 | 2 | 3 | 4 | 5;
    comment: string;
    createdAt: Date;
  }[];
  sales: number;
  views: number;
  status: 'active' | 'paused' | 'sold';
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date; // Auto-delist if not renewed
  tags: string[];
  featured: boolean; // Premium listing position
  royaltyPercent?: number; // For digital goods/NFTs
}

/**
 * NFT INTEGRATION
 */
export interface NFTListingConfig {
  contractAddress: string;
  tokenId: string;
  chain: ChainNetwork;
  priceInCrypto: {
    asset: CryptoAsset;
    amount: number;
  };
  royaltyBeneficiary: string;
  royaltyPercent: number;
  attributes: Record<string, string | number>;
  openSeaCollectionSlug?: string;
}

/**
 * USER CRYPTO WALLET
 * Stores user's crypto wallet addresses for receiving payments
 */
export interface UserCryptoWallet {
  userId: string;
  wallets: {
    [key in CryptoAsset]?: {
      address: string;
      network: ChainNetwork;
      publicKey?: string;
      isActive: boolean;
      createdAt: Date;
      totalReceived: number;
      totalSent: number;
      balance: number; // Cached balance
      lastBalanceUpdate: Date;
    };
  };
  preferredPaymentAsset: CryptoAsset;
  autoConvertTo?: CryptoAsset; // Auto-convert received crypto to preferred
  withdrawalAddress?: string; // Where to send withdrawn crypto
}

/**
 * CRYPTO TRANSACTION RECORD
 */
export interface CryptoTransaction {
  id: string;
  userId: string;
  type: 'payment' | 'payout' | 'trade' | 'deposit' | 'withdrawal';
  asset: CryptoAsset;
  amount: number;
  usdValue: number;
  fromAddress: string;
  toAddress: string;
  transactionHash: string;
  network: ChainNetwork;
  status: 'pending' | 'confirmed' | 'failed';
  fee: number;
  feeAsset: CryptoAsset;
  createdAt: Date;
  confirmedAt?: Date;
  relatedOrderId?: string; // Links to trade order or payment
}

/**
 * ESCROW SERVICE
 * Secure P2P transactions using smart contracts
 */
export interface EscrowTransaction {
  id: string;
  escrowAddress: string;
  seller: string;
  buyer: string;
  asset: CryptoAsset;
  amount: number;
  holdUntil: Date;
  status: 'created' | 'funded' | 'released' | 'returned' | 'disputed';
  dispute?: {
    raisedBy: string;
    reason: string;
    evidence: string[];
    resolution?: string;
    resolvedAt?: Date;
  };
  releaseSignatures: string[];
  returnSignatures: string[];
  createdAt: Date;
}

/**
 * CRYPTO PRICING STRATEGIES
 */
export const TIER_CRYPTO_PRICING: Record<string, Record<CryptoAsset, number>> = {
  starter: {
    BTC: 0.0005,
    ETH: 0.02,
    USDC: 29,
    SOL: 0.2,
    XRP: 12,
    DOGE: 100,
    MATIC: 45,
  },
  creator: {
    BTC: 0.0013,
    ETH: 0.05,
    USDC: 79,
    SOL: 0.55,
    XRP: 32,
    DOGE: 260,
    MATIC: 120,
  },
  pro: {
    BTC: 0.0032,
    ETH: 0.13,
    USDC: 199,
    SOL: 1.4,
    XRP: 80,
    DOGE: 660,
    MATIC: 300,
  },
  elite: {
    BTC: 0.008,
    ETH: 0.32,
    USDC: 499,
    SOL: 3.5,
    XRP: 200,
    DOGE: 1660,
    MATIC: 750,
  },
  agency: {
    BTC: 0.021,
    ETH: 0.83,
    USDC: 1299,
    SOL: 9.2,
    XRP: 520,
    DOGE: 4330,
    MATIC: 1950,
  },
  enterprise: {
    BTC: 0.063,
    ETH: 2.5,
    USDC: 3999,
    SOL: 28,
    XRP: 1600,
    DOGE: 13330,
    MATIC: 6000,
  },
};

/**
 * Helper: Convert USD to crypto
 */
export function convertUsdToCrypto(
  usdAmount: number,
  asset: CryptoAsset,
  priceAnchor: number = PRICE_ANCHORS[asset]
): number {
  return usdAmount / priceAnchor;
}

/**
 * Helper: Convert crypto to USD
 */
export function convertCryptoToUsd(
  cryptoAmount: number,
  asset: CryptoAsset,
  priceAnchor: number = PRICE_ANCHORS[asset]
): number {
  return cryptoAmount * priceAnchor;
}

/**
 * Helper: Get minimum payment for tier/asset
 */
export function getMinimumCryptoPayment(
  tier: string,
  asset: CryptoAsset
): number | null {
  const tierPricing = TIER_CRYPTO_PRICING[tier];
  if (!tierPricing) return null;
  return tierPricing[asset];
}

/**
 * Helper: Get all crypto payment addresses for user
 */
export function getUserPaymentAddresses(wallet: UserCryptoWallet): Record<CryptoAsset, string> {
  const addresses: Record<string, string> = {};
  for (const [asset, info] of Object.entries(wallet.wallets)) {
    if (info?.isActive) {
      addresses[asset as CryptoAsset] = info.address;
    }
  }
  return addresses as Record<CryptoAsset, string>;
}

/**
 * Helper: Calculate trading fee
 */
export function calculateTradingFee(
  asset: CryptoAsset,
  amount: number,
  userTier: string = 'free'
): number {
  const baseFeePercent = {
    free: 0.05, // 5%
    starter: 0.03, // 3%
    creator: 0.02, // 2%
    pro: 0.015, // 1.5%
    elite: 0.01, // 1%
    agency: 0.005, // 0.5%
    enterprise: 0.003, // 0.3%
    god: 0, // Free
  };

  const feePercent = baseFeePercent[userTier as keyof typeof baseFeePercent] || 0.05;
  return amount * (feePercent / 100);
}

/**
 * Helper: Get marketplace commission
 */
export function getMarketplaceCommission(
  saleAmount: number,
  sellerTier: string
): { platform: number; seller: number } {
  const platformPercent = {
    free: 0.30, // 30% platform, 70% seller
    starter: 0.25, // 25% platform
    creator: 0.20, // 20% platform
    pro: 0.15,
    elite: 0.12,
    agency: 0.10,
    enterprise: 0.05,
    god: 0, // 0% platform, 100% seller
  };

  const platformPerc = platformPercent[sellerTier as keyof typeof platformPercent] || 0.30;
  const platformFee = saleAmount * platformPerc;
  const sellerRevenue = saleAmount - platformFee;

  return { platform: platformFee, seller: sellerRevenue };
}

/**
 * Helper: Validate wallet address format
 */
export function validateWalletAddress(address: string, asset: CryptoAsset): boolean {
  const patterns: Record<CryptoAsset, RegExp> = {
    BTC: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/, // Bech32, P2SH, P2PKH
    ETH: /^0x[a-fA-F0-9]{40}$/,
    USDC: /^0x[a-fA-F0-9]{40}$/, // ERC-20
    SOL: /^[1-9A-HJ-NP-Za-km-z]{43,44}$/, // Base58
    XRP: /^r[a-zA-Z0-9]{24,34}$/,
    DOGE: /^[13D][a-zA-km-zA-HJ-NP-Z0-9]{25,34}$/,
    MATIC: /^0x[a-fA-F0-9]{40}$/, // Same as ETH
  };

  const pattern = patterns[asset];
  return pattern ? pattern.test(address) : false;
}

/**
 * Helper: Estimate network fee
 */
export function estimateNetworkFee(
  asset: CryptoAsset,
  amount: number,
  priority: 'low' | 'normal' | 'high' = 'normal'
): number {
  const baseFees: Record<CryptoAsset, Record<string, number>> = {
    BTC: { low: 0.00001, normal: 0.00002, high: 0.0001 },
    ETH: { low: 0.001, normal: 0.003, high: 0.005 },
    USDC: { low: 0.001, normal: 0.003, high: 0.005 },
    SOL: { low: 0.00001, normal: 0.00002, high: 0.0001 },
    XRP: { low: 10, normal: 12, high: 20 },
    DOGE: { low: 0.01, normal: 0.1, high: 0.5 },
    MATIC: { low: 0.001, normal: 0.002, high: 0.005 },
  };

  return baseFees[asset]?.[priority] || 0;
}
