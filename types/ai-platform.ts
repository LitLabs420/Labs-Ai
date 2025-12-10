/**
 * Comprehensive TypeScript types for LitLabs AI Platform
 * Exports all types from ai-pipeline, crypto-payments, and analytics modules
 */

// ============================================================
// AI PIPELINE TYPES
// ============================================================

export interface ContentGenerationRequest {
  type: "caption" | "script" | "image" | "voice" | "video" | "full";
  topic: string;
  platform?: string;
  style?: string;
  tone?: string;
}

export interface GeneratedContent {
  caption?: string;
  script?: string;
  images?: string[];
  voiceUrl?: string;
  videoUrl?: string;
  quality?: number;
}

export interface ContentOptimizationResult {
  optimized: string;
  improvements: string[];
  score: number;
}

export interface ProductMarketingContent {
  images: string[];
  captions: string[];
  videoScript: string;
  quality: number;
}

export interface VideoPackage {
  script: string;
  voiceOver: string;
  images: string[];
  quality: number;
}

// ============================================================
// CRYPTO PAYMENT TYPES
// ============================================================

export interface SolanaPaymentRequest {
  amount: number;
  walletAddress: string;
  userId: string;
  description: string;
  tier?: string;
}

export interface EthereumPaymentRequest {
  amount: number;
  walletAddress: string;
  userId: string;
  description: string;
  tier?: string;
}

export interface PaymentRequest {
  amount: number;
  userId: string;
  tier: string;
  blockchain: "solana" | "ethereum" | "stripe";
  description: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  redirectUrl?: string;
  transactionId?: string;
}

export interface CryptoPaymentRecord {
  id: string;
  userId: string;
  blockchain: "solana" | "ethereum" | "stripe";
  transactionHash: string;
  amountUsd: number;
  tier: string;
  status: "pending" | "confirmed" | "failed";
  confirmedAt?: Date;
  createdAt: Date;
}

export interface SubscriptionTier {
  name: string;
  priceUsd?: number;
  priceSol?: number;
  priceEth?: number;
  credits?: number;
  features: string[];
  monthlyRequests: number | string;
}

// ============================================================
// ANALYTICS TYPES
// ============================================================

export interface AnalyticsEvent {
  eventName: string;
  userId: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
  context?: {
    ip?: string;
    userAgent?: string;
    [key: string]: unknown;
  };
}

export interface BatchAnalyticsEvent extends AnalyticsEvent {
  eventId?: string;
  tracked?: boolean;
}

export interface AnalyticsTrackingResponse {
  success: boolean;
  message: string;
  eventId?: string;
  count?: number;
}

export interface UserAnalytics {
  userId: string;
  date: Date;
  postsCreated: number;
  postsPublished: number;
  engagementRate?: number;
  followersGained: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  revenueGenerated: number;
}

export interface ContentAnalytics {
  contentId: string;
  type: "caption" | "script" | "image" | "video" | "dm";
  platform: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  qualityScore: number;
}

// ============================================================
// UNIFIED API RESPONSE TYPES
// ============================================================

export interface APIResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================
// USER & SUBSCRIPTION TYPES
// ============================================================

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  avatar?: string;
  tier: "free" | "starter" | "creator" | "pro" | "agency" | "education";
  createdAt: Date;
  updatedAt: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: "light" | "dark" | "auto";
  notifications?: boolean;
  emailUpdates?: boolean;
  twoFactorEnabled?: boolean;
  publicProfile?: boolean;
}

export interface Subscription {
  uid: string;
  tier: string;
  status: "active" | "canceled" | "past_due" | "inactive";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}

// ============================================================
// USAGE & QUOTA TYPES
// ============================================================

export interface UsageMetrics {
  userId: string;
  period: Date;
  aiGenerations: number;
  aiGenerationsLimit: number;
  imageGenerations: number;
  imageGenerationsLimit: number;
  videoGenerations: number;
  videoGenerationsLimit: number;
  dmReplies: number;
  dmRepliesLimit: number;
  apiCalls: number;
  apiCallsLimit: number;
  storageUsedMb: number;
  storageMaxMb: number;
}

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: Date;
  retryAfter?: number;
}

// ============================================================
// MARKETPLACE TYPES
// ============================================================

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  type: "template" | "course" | "service" | "tool" | "content";
  category: string;
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  imageUrl?: string;
  views: number;
  purchases: number;
  rating: number;
  reviews: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserReview {
  id: string;
  userId: string;
  itemId: string;
  rating: number;
  comment?: string;
  verified: boolean;
  helpful: number;
  createdAt: Date;
}

// ============================================================
// EXPORT ALL TYPES
// ============================================================

export type {
  ClaudeGenerationOptions,
  VoiceOptions,
} from "@/lib/claude";
export type {
  ReplicateGenerationOptions,
  ReplicateImageOutput,
} from "@/lib/replicate";

export default {
  // Type exports are re-exported at module level
};
