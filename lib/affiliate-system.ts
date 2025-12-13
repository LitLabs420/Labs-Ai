/**
 * 🎯 Affiliate & Referral System
 * Commission tracking, payouts, and affiliate analytics
 */

import { db as clientDb } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  increment,
  Timestamp,
} from 'firebase/firestore';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
});

export interface AffiliateProfile {
  userId: string;
  referralCode: string;
  referralLink: string;
  commissionRate: number; // 0.20 = 20%
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalEarnings: number;
  totalReferrals: number;
  activeReferrals: number;
  payoutMethod: 'stripe' | 'paypal' | 'bank_transfer' | 'store_credit';
  payoutDetails: {
    stripeConnectId?: string;
    paypalEmail?: string;
    bankAccount?: {
      routingNumber: string;
      accountNumber: string;
      accountHolderName: string;
    };
  };
  nextPayoutDate?: Date;
  monthlyEarnings: number;
  createdAt: Date;
  isActive: boolean;
  website?: string;
  bio?: string;
}

export interface Referral {
  id: string;
  affiliateUserId: string;
  referredUserId: string;
  referralCode: string;
  status: 'pending' | 'qualified' | 'completed' | 'expired';
  referredTier: string;
  commission: number;
  subscriptionValue: number;
  referredAt: Date | Timestamp;
  qualifiedAt?: Date | Timestamp; // First payment received
  paidAt?: Date | Timestamp;
  expiresAt: Date | Timestamp;
  stripeSubscriptionId?: string;
  isPayoutProcessed: boolean;
}

export function normalizeTimestamp(value?: Date | Timestamp): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  return value;
}

export interface AffiliateStats {
  totalReferrals: number;
  activeReferrals: number;
  totalCommissions: number;
  monthlyCommissions: number;
  conversionRate: number;
  averageCommissionValue: number;
  topReferringSources: string[];
}

/**
 * Commission tiers based on performance
 */
export const COMMISSION_TIERS = {
  bronze: { minReferrals: 0, rate: 0.15 }, // 15%
  silver: { minReferrals: 5, rate: 0.20 }, // 20%
  gold: { minReferrals: 25, rate: 0.25 }, // 25%
  platinum: { minReferrals: 100, rate: 0.30 }, // 30%
};

/**
 * Generate referral code
 */
function generateReferralCode(userId: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const userHash = userId.substring(0, 4).toUpperCase();
  return `${userHash}${timestamp}`;
}

/**
 * Create affiliate profile
 */
export async function createAffiliateProfile(
  userId: string,
  payoutMethod: AffiliateProfile['payoutMethod'],
  payoutDetails?: AffiliateProfile['payoutDetails']
): Promise<AffiliateProfile> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const referralCode = generateReferralCode(userId);
  const profile: AffiliateProfile = {
    userId,
    referralCode,
    referralLink: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${referralCode}`,
    commissionRate: COMMISSION_TIERS.bronze.rate,
    tier: 'bronze',
    totalEarnings: 0,
    totalReferrals: 0,
    activeReferrals: 0,
    payoutMethod,
    payoutDetails: payoutDetails || {},
    monthlyEarnings: 0,
    createdAt: new Date(),
    isActive: true,
  };

  const profileRef = doc(clientDb, 'affiliates', userId);
  await setDoc(profileRef, {
    ...profile,
    createdAt: Timestamp.fromDate(profile.createdAt),
  });

  // Store in user profile
  const userRef = doc(clientDb, 'users', userId);
  await updateDoc(userRef, {
    isAffiliate: true,
    affiliateCode: referralCode,
  });

  return profile;
}

/**
 * Get affiliate profile
 */
export async function getAffiliateProfile(
  userId: string
): Promise<AffiliateProfile | null> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const profileRef = doc(clientDb, 'affiliates', userId);
  const profileDoc = await getDoc(profileRef);

  if (!profileDoc.exists()) return null;

  const data = profileDoc.data();
  return {
    ...data as AffiliateProfile,
    createdAt: data.createdAt?.toDate() || new Date(),
    nextPayoutDate: data.nextPayoutDate?.toDate(),
  };
}

/**
 * Track referral
 */
export async function trackReferral(
  affiliateUserId: string,
  referredUserId: string,
  referralCode: string,
  tier: string
): Promise<Referral> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const affiliate = await getAffiliateProfile(affiliateUserId);
  if (!affiliate) throw new Error('Affiliate profile not found');

  const referral: Referral = {
    id: `${Date.now()}`,
    affiliateUserId,
    referredUserId,
    referralCode,
    status: 'pending',
    referredTier: tier,
    commission: 0,
    subscriptionValue: 0,
    referredAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    isPayoutProcessed: false,
  };

  const referralRef = doc(clientDb, 'referrals', referral.id);
  const safeReferredAt = normalizeTimestamp(referral.referredAt) || new Date();
  const safeExpiresAt = normalizeTimestamp(referral.expiresAt) || new Date();
  await setDoc(referralRef, {
    ...referral,
    referredAt: Timestamp.fromDate(safeReferredAt),
    expiresAt: Timestamp.fromDate(safeExpiresAt),
  });

  // Update affiliate stats
  const affiliateRef = doc(clientDb, 'affiliates', affiliateUserId);
  await updateDoc(affiliateRef, {
    totalReferrals: increment(1),
    activeReferrals: increment(1),
  });

  return referral;
}

/**
 * Process referral commission
 */
export async function processReferralCommission(
  referralId: string,
  subscriptionValue: number,
  stripeSubscriptionId: string
): Promise<Referral> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const referralRef = doc(clientDb, 'referrals', referralId);
  const referralDoc = await getDoc(referralRef);

  if (!referralDoc.exists()) throw new Error('Referral not found');

  const referral = referralDoc.data() as Referral;
  const affiliate = await getAffiliateProfile(referral.affiliateUserId);

  if (!affiliate) throw new Error('Affiliate profile not found');

  // Calculate commission
  const commission = subscriptionValue * affiliate.commissionRate;

  // Update referral
  const normalizedReferredAt = normalizeTimestamp(referral.referredAt) || new Date();
  const normalizedExpiresAt = normalizeTimestamp(referral.expiresAt) || new Date();

  await updateDoc(referralRef, {
    status: 'qualified',
    commission,
    subscriptionValue,
    stripeSubscriptionId,
    qualifiedAt: Timestamp.fromDate(new Date()),
    referredAt: Timestamp.fromDate(normalizedReferredAt),
    expiresAt: Timestamp.fromDate(normalizedExpiresAt),
  });

  // Update affiliate earnings
  const affiliateRef = doc(clientDb, 'affiliates', affiliate.userId);
  await updateDoc(affiliateRef, {
    totalEarnings: increment(commission),
    monthlyEarnings: increment(commission),
  });

  return {
    ...referral,
    status: 'qualified',
    commission,
    subscriptionValue,
    stripeSubscriptionId,
    qualifiedAt: new Date(),
    referredAt: normalizeTimestamp(referral.referredAt) || new Date(),
    expiresAt: normalizeTimestamp(referral.expiresAt) || new Date(),
  };
}

/**
 * Get affiliate referrals
 */
export async function getAffiliateReferrals(
  affiliateUserId: string,
  status?: string
): Promise<Referral[]> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const referralsRef = collection(clientDb, 'referrals');
  let q = query(referralsRef, where('affiliateUserId', '==', affiliateUserId));

  if (status) {
    q = query(q, where('status', '==', status));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data() as Referral;
    return {
      ...data,
      referredAt: normalizeTimestamp(data.referredAt) || new Date(),
      qualifiedAt: normalizeTimestamp(data.qualifiedAt),
      paidAt: normalizeTimestamp(data.paidAt),
      expiresAt: normalizeTimestamp(data.expiresAt) || new Date(),
    };
  });
}

/**
 * Get affiliate stats
 */
export async function getAffiliateStats(
  affiliateUserId: string
): Promise<AffiliateStats> {
  const referrals = await getAffiliateReferrals(affiliateUserId);
  
  const totalReferrals = referrals.length;
  const activeReferrals = referrals.filter(r => r.status === 'qualified').length;
  const totalCommissions = referrals.reduce((sum, r) => sum + r.commission, 0);

  // Monthly commissions (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const monthlyCommissions = referrals
    .filter((r) => {
      const qualifiedAt = normalizeTimestamp(r.qualifiedAt);
      return qualifiedAt ? qualifiedAt > thirtyDaysAgo : false;
    })
    .reduce((sum, r) => sum + r.commission, 0);

  const conversionRate = totalReferrals > 0 ? (activeReferrals / totalReferrals) * 100 : 0;
  const averageCommissionValue = activeReferrals > 0 ? totalCommissions / activeReferrals : 0;

  return {
    totalReferrals,
    activeReferrals,
    totalCommissions,
    monthlyCommissions,
    conversionRate,
    averageCommissionValue,
    topReferringSources: [], // Would be populated from analytics
  };
}

/**
 * Process affiliate payouts
 */
export async function processAffiliatePayouts(): Promise<{ successful: string[]; failed: string[] }> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const affiliatesRef = collection(clientDb, 'affiliates');
  const snapshot = await getDocs(affiliatesRef);

  const successful: string[] = [];
  const failed: string[] = [];

  for (const doc of snapshot.docs) {
    const affiliate = doc.data() as AffiliateProfile;

    if (affiliate.monthlyEarnings < 100) continue; // Minimum payout threshold

    try {
      if (affiliate.payoutMethod === 'stripe' && affiliate.payoutDetails.stripeConnectId) {
        // Create Stripe transfer
        await stripe.transfers.create({
          amount: Math.round(affiliate.monthlyEarnings * 100),
          currency: 'usd',
          destination: affiliate.payoutDetails.stripeConnectId,
          description: `Monthly affiliate earnings for ${affiliate.userId}`,
        });

        // Update payout status
        await updateDoc(doc.ref, {
          monthlyEarnings: 0,
          nextPayoutDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        });

        successful.push(affiliate.userId);
      }
    } catch (error) {
      console.error(`Failed to process payout for ${affiliate.userId}:`, error);
      failed.push(affiliate.userId);
    }
  }

  return { successful, failed };
}

/**
 * Update affiliate tier
 */
export async function updateAffiliateTier(userId: string): Promise<AffiliateProfile | null> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const affiliate = await getAffiliateProfile(userId);
  if (!affiliate) return null;

  let newTier: AffiliateProfile['tier'] = 'bronze';
  if (affiliate.totalReferrals >= COMMISSION_TIERS.platinum.minReferrals) {
    newTier = 'platinum';
  } else if (affiliate.totalReferrals >= COMMISSION_TIERS.gold.minReferrals) {
    newTier = 'gold';
  } else if (affiliate.totalReferrals >= COMMISSION_TIERS.silver.minReferrals) {
    newTier = 'silver';
  }

  const newRate = COMMISSION_TIERS[newTier].rate;

  if (newTier !== affiliate.tier) {
    const affiliateRef = doc(clientDb, 'affiliates', userId);
    await updateDoc(affiliateRef, {
      tier: newTier,
      commissionRate: newRate,
    });

    affiliate.tier = newTier;
    affiliate.commissionRate = newRate;
  }

  return affiliate;
}

export default {
  createAffiliateProfile,
  getAffiliateProfile,
  trackReferral,
  processReferralCommission,
  getAffiliateReferrals,
  getAffiliateStats,
  processAffiliatePayouts,
  updateAffiliateTier,
};
