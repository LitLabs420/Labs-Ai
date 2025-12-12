/**
 * 🎯 Advanced Subscription Management System
 * Team management, usage tracking, feature control, and analytics
 */

import { db as clientDb } from './firebase';
import { getAdminDb } from './firebase-admin';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';

export interface SubscriptionTier {
  id: 'free' | 'starter' | 'creator' | 'pro' | 'agency' | 'enterprise' | 'education';
  name: string;
  description: string;
  price: number;
  priceYearly?: number;
  interval: 'month' | 'year';
  users: number; // Max users on team
  storage: number; // GB
  features: string[];
  limits: {
    aiGenerations: number; // -1 = unlimited
    dmReplies: number;
    moneyPlays: number;
    imageGenerations: number;
    videoGenerations: number;
    automations: number;
    emailSequences: number;
    reportGenerations: number;
  };
  addons?: {
    id: string;
    name: string;
    price: number;
    description: string;
  }[];
}

export interface UserSubscription {
  userId: string;
  tier: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: Date;
  startedAt: Date;
  canceledAt?: Date;
  addons: string[]; // Addon IDs
  teamMembers?: number;
  storageUsed: number;
  nextBillingDate: Date;
  autoRenew: boolean;
}

export interface TeamMember {
  id: string;
  email: string;
  name?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  lastActive?: Date;
  isActive: boolean;
}

/**
 * Tier definitions
 */
export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Get started for free',
    price: 0,
    interval: 'month',
    users: 1,
    storage: 1,
    features: [
      'AI content generation',
      'Basic DM replies',
      'Community support',
      'Limited templates',
    ],
    limits: {
      aiGenerations: 5,
      dmReplies: 3,
      moneyPlays: 1,
      imageGenerations: 2,
      videoGenerations: 0,
      automations: 0,
      emailSequences: 0,
      reportGenerations: 1,
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for solopreneurs',
    price: 19,
    priceYearly: 190,
    interval: 'month',
    users: 1,
    storage: 10,
    features: [
      'Everything in Free',
      'Advanced AI generation',
      'Playbook builder',
      'Priority support',
      'Custom branding',
    ],
    limits: {
      aiGenerations: 50,
      dmReplies: 20,
      moneyPlays: 5,
      imageGenerations: 10,
      videoGenerations: 2,
      automations: 2,
      emailSequences: 5,
      reportGenerations: 5,
    },
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    description: 'For growing creators',
    price: 49,
    priceYearly: 490,
    interval: 'month',
    users: 3,
    storage: 50,
    features: [
      'Everything in Starter',
      'Team collaboration (up to 3)',
      'Advanced automations',
      'API access',
      'Custom integrations',
      'Priority support',
    ],
    limits: {
      aiGenerations: 500,
      dmReplies: 100,
      moneyPlays: -1,
      imageGenerations: 50,
      videoGenerations: 10,
      automations: 10,
      emailSequences: 20,
      reportGenerations: 20,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For professionals',
    price: 99,
    priceYearly: 990,
    interval: 'month',
    users: 10,
    storage: 200,
    features: [
      'Everything in Creator',
      'Team collaboration (up to 10)',
      'White-label options',
      'Advanced analytics',
      'Webhook support',
      '24/7 priority support',
    ],
    limits: {
      aiGenerations: -1,
      dmReplies: -1,
      moneyPlays: -1,
      imageGenerations: -1,
      videoGenerations: -1,
      automations: -1,
      emailSequences: -1,
      reportGenerations: -1,
    },
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    description: 'For agencies and enterprises',
    price: 299,
    priceYearly: 2990,
    interval: 'month',
    users: 50,
    storage: 1000,
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Full white-label',
      'Client management portal',
      'Advanced reporting',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    limits: {
      aiGenerations: -1,
      dmReplies: -1,
      moneyPlays: -1,
      imageGenerations: -1,
      videoGenerations: -1,
      automations: -1,
      emailSequences: -1,
      reportGenerations: -1,
    },
  },
  education: {
    id: 'education',
    name: 'Education',
    description: 'Free for educators and students',
    price: 0,
    interval: 'month',
    users: 100,
    storage: 500,
    features: [
      'Everything in Pro',
      'Unlimited students',
      'Classroom management',
      'Educational resources',
      'Grant eligibility',
    ],
    limits: {
      aiGenerations: -1,
      dmReplies: -1,
      moneyPlays: -1,
      imageGenerations: 500, // Per month
      videoGenerations: -1,
      automations: -1,
      emailSequences: -1,
      reportGenerations: -1,
    },
  },
};

/**
 * Get user's subscription
 */
export async function getUserSubscription(
  userId: string
): Promise<UserSubscription | null> {
  try {
    if (!clientDb) throw new Error('Firebase not initialized');

    const userRef = doc(clientDb, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) return null;

    const data = userDoc.data();
    return {
      userId,
      tier: data.tier || 'free',
      stripeCustomerId: data.stripeCustomerId || '',
      stripeSubscriptionId: data.subscription?.id,
      status: data.subscription?.status || 'canceled',
      currentPeriodStart: data.subscription?.currentPeriodStart?.toDate() || new Date(),
      currentPeriodEnd: data.subscription?.currentPeriodEnd?.toDate() || new Date(),
      cancelAtPeriodEnd: data.subscription?.cancelAtPeriodEnd || false,
      trialEndsAt: data.subscription?.trialEndsAt?.toDate(),
      startedAt: data.createdAt?.toDate() || new Date(),
      canceledAt: data.subscription?.canceledAt?.toDate(),
      addons: data.addons || [],
      teamMembers: data.teamMembers || 1,
      storageUsed: data.storageUsed || 0,
      nextBillingDate: data.subscription?.currentPeriodEnd?.toDate() || new Date(),
      autoRenew: !data.subscription?.cancelAtPeriodEnd,
    };
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
}

/**
 * Get subscription tier details
 */
export function getTierDetails(
  tierId: string
): SubscriptionTier {
  return SUBSCRIPTION_TIERS[tierId] || SUBSCRIPTION_TIERS.free;
}

/**
 * Check feature access
 */
export async function hasFeatureAccess(
  userId: string,
  feature: string
): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) return false;

  const tier = getTierDetails(subscription.tier);
  return tier.features.includes(feature);
}

/**
 * Check usage limits
 */
export async function checkUsageLimit(
  userId: string,
  featureType: keyof SubscriptionTier['limits']
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    return { allowed: false, remaining: 0, limit: 0 };
  }

  const tier = getTierDetails(subscription.tier);
  const limit = tier.limits[featureType];

  // Unlimited (-1)
  if (limit === -1) {
    return { allowed: true, remaining: 999999, limit: -1 };
  }

  // Get today's usage
  if (!clientDb) throw new Error('Firebase not initialized');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usageRef = collection(clientDb, 'usage');
  const q = query(
    usageRef,
    where('userId', '==', userId),
    where('date', '==', today.toISOString().split('T')[0])
  );

  const snapshot = await getDocs(q);
  const usage = snapshot.docs[0]?.data();
  const used = usage?.[featureType] || 0;

  const remaining = Math.max(0, limit - used);
  return {
    allowed: remaining > 0,
    remaining,
    limit,
  };
}

/**
 * Create team member
 */
export async function addTeamMember(
  ownerUserId: string,
  email: string,
  role: 'admin' | 'member' | 'viewer' = 'member'
): Promise<TeamMember> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const teamRef = collection(clientDb, 'teams');
  const membersRef = collection(clientDb, 'users', ownerUserId, 'teamMembers');

  const member: TeamMember = {
    id: `${Date.now()}`,
    email,
    role,
    joinedAt: new Date(),
    isActive: true,
  };

  await setDoc(doc(membersRef, member.id), {
    ...member,
    joinedAt: Timestamp.fromDate(member.joinedAt),
  });

  return member;
}

/**
 * Get team members
 */
export async function getTeamMembers(userId: string): Promise<TeamMember[]> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const membersRef = collection(clientDb, 'users', userId, 'teamMembers');
  const snapshot = await getDocs(membersRef);

  return snapshot.docs.map(doc => ({
    ...doc.data() as TeamMember,
    joinedAt: doc.data().joinedAt?.toDate() || new Date(),
    lastActive: doc.data().lastActive?.toDate(),
  }));
}

/**
 * Remove team member
 */
export async function removeTeamMember(
  userId: string,
  memberId: string
): Promise<void> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const memberRef = doc(clientDb, 'users', userId, 'teamMembers', memberId);
  await updateDoc(memberRef, {
    isActive: false,
  });
}

/**
 * Update team member role
 */
export async function updateTeamMemberRole(
  userId: string,
  memberId: string,
  role: 'admin' | 'member' | 'viewer'
): Promise<void> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const memberRef = doc(clientDb, 'users', userId, 'teamMembers', memberId);
  await updateDoc(memberRef, { role });
}

export default {
  SUBSCRIPTION_TIERS,
  getUserSubscription,
  getTierDetails,
  hasFeatureAccess,
  checkUsageLimit,
  addTeamMember,
  getTeamMembers,
  removeTeamMember,
  updateTeamMemberRole,
};
