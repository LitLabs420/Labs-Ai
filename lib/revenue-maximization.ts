/**
 * Revenue Maximization Engine
 * 
 * Intelligent system to:
 * - Recommend optimal tier/upsells for each user
 * - Detect churn risk and trigger retention offers
 * - Implement dynamic pricing based on user behavior
 * - Create FOMO through limited-time offers
 * - Optimize checkout conversion with social proof
 */

import { 
  PREMIUM_TIERS, 
  // UPSELL_PACKAGES,  // Reserved for future upsell features
  // BUNDLE_DEALS,     // Reserved for future bundle features
  TierName 
} from './premium-pricing';

export interface UserMonetizationProfile {
  userId: string;
  currentTier: TierName;
  activeUpsells: string[];
  monthlySpend: number;
  yearlyProjectedRevenue: number;
  
  // Behavioral metrics
  engagementScore: number; // 0-100
  churnRiskScore: number; // 0-100 (higher = more risky)
  ltv: number; // Lifetime value estimate
  
  // Feature usage
  usageMetrics: {
    aiGenerationsUsed: number;
    aiGenerationsLimit: number;
    storageUsedGb: number;
    storageLimit: number;
    projectsCreated: number;
    projectsLimit: number;
    collaboratorsAdded: number;
    collaboratorsLimit: number;
  };
  
  // Purchase history
  purchaseHistory: {
    firstPurchaseDate?: Date;
    lastPurchaseDate?: Date;
    totalPurchases: number;
    totalSpent: number;
    averageOrderValue: number;
  };
  
  // Churn indicators
  churnIndicators: {
    lastActiveDate?: Date;
    daysInactive: number;
    failedPayments: number;
    supportTickets: number;
    negativeReviews: number;
    refundRequests: number;
  };
  
  // Recommendations
  recommendations: {
    recommendedTier?: TierName;
    recommendedUpsells: string[];
    bestTimeToOffer?: string;
    estimatedAcceptanceRate?: number;
  };
}

/**
 * CHURN PREVENTION STRATEGIES
 */
export const CHURN_PREVENTION_OFFERS = {
  slight_risk: {
    name: 'Welcome Back Offer',
    trigger: { daysInactive: 7, churnRiskScore: 30 },
    offer: { discountPercent: 10, validDays: 7 },
    message: 'We miss you! Here\'s 10% off to continue creating',
  },
  medium_risk: {
    name: 'Loyalty Bonus',
    trigger: { daysInactive: 14, churnRiskScore: 60 },
    offer: { discountPercent: 25, validDays: 3, includeUpsell: true },
    message: 'As a valued customer, enjoy 25% off your renewal',
  },
  high_risk: {
    name: 'Last Chance',
    trigger: { daysInactive: 21, churnRiskScore: 85 },
    offer: { discountPercent: 50, validDays: 2, includeFreeTrial: true },
    message: 'We\'re about to lose you. 50% off + extended trial?',
  },
  critical_risk: {
    name: 'VIP Retention',
    trigger: { daysInactive: 28, churnRiskScore: 95 },
    offer: { discountPercent: 60, validDays: 1, directPhoneCall: true, offerUpgrade: true },
    message: 'Let\'s schedule a call. Custom offer inside →',
  },
};

/**
 * UPGRADE INCENTIVE MATRIX
 * Maps current tier → recommended upgrade + incentive
 */
export const UPGRADE_INCENTIVES: Record<TierName, {
  recommendedUpgrade: TierName;
  incentive: {
    discountPercent: number;
    bonusCredits?: number;
    extendedTrial?: number;
    freeAddOns?: string[];
  };
  savingsPerMonth: number;
  newCapabilities: string[];
}> = {
  free: {
    recommendedUpgrade: 'starter',
    incentive: {
      discountPercent: 25,
      bonusCredits: 500,
      extendedTrial: 14,
    },
    savingsPerMonth: 29,
    newCapabilities: [
      '100 AI generations/month',
      'Multi-channel publishing',
      'Email support',
      'Custom templates',
    ],
  },
  starter: {
    recommendedUpgrade: 'creator',
    incentive: {
      discountPercent: 20,
      bonusCredits: 1000,
      freeAddOns: ['ai_boost'],
    },
    savingsPerMonth: 50,
    newCapabilities: [
      '1000 AI generations/month',
      'Video generation',
      'Advanced analytics',
      'Team collaboration',
    ],
  },
  creator: {
    recommendedUpgrade: 'pro',
    incentive: {
      discountPercent: 15,
      bonusCredits: 2000,
      freeAddOns: ['api_unlimited'],
    },
    savingsPerMonth: 120,
    newCapabilities: [
      'Unlimited AI generations',
      'Priority support',
      'White-label options',
      'Custom integrations',
    ],
  },
  pro: {
    recommendedUpgrade: 'elite',
    incentive: {
      discountPercent: 10,
      bonusCredits: 5000,
    },
    savingsPerMonth: 300,
    newCapabilities: [
      'Dedicated account manager',
      'Custom contracts',
      'Advanced security',
      'SLA support',
    ],
  },
  elite: {
    recommendedUpgrade: 'agency',
    incentive: {
      discountPercent: 8,
      bonusCredits: 10000,
    },
    savingsPerMonth: 800,
    newCapabilities: [
      'Reseller program',
      'Custom pricing',
      'Co-marketing opportunities',
      'Revenue sharing',
    ],
  },
  agency: {
    recommendedUpgrade: 'enterprise',
    incentive: {
      discountPercent: 5,
      bonusCredits: 25000,
    },
    savingsPerMonth: 2700,
    newCapabilities: [
      'Dedicated infrastructure',
      'Custom features',
      'On-premises option',
      'Premium SLA',
    ],
  },
  enterprise: {
    recommendedUpgrade: 'god',
    incentive: {
      discountPercent: 3,
      bonusCredits: 50000,
    },
    savingsPerMonth: 6000,
    newCapabilities: [
      'Unlimited everything',
      'White-label platform',
      'API unlimited',
      'Strategic partnership',
    ],
  },
  god: {
    recommendedUpgrade: 'god',
    incentive: { discountPercent: 0 },
    savingsPerMonth: 0,
    newCapabilities: ['Custom features as requested'],
  },
};

/**
 * USAGE-BASED UPSELL TRIGGERS
 * Automatically recommend upsells based on user behavior
 */
export interface UpsellTrigger {
  id: string;
  name: string;
  condition: (profile: UserMonetizationProfile) => boolean;
  recommendedUpsells: string[];
  urgencyLevel: 'low' | 'medium' | 'high';
  message: string;
}

export const USAGE_BASED_UPSELL_TRIGGERS: UpsellTrigger[] = [
  {
    id: 'near_ai_limit',
    name: 'Approaching AI Generation Limit',
    condition: (profile) => profile.usageMetrics.aiGenerationsUsed / profile.usageMetrics.aiGenerationsLimit > 0.85,
    recommendedUpsells: ['ai_boost'],
    urgencyLevel: 'high',
    message: 'You\'ve used 85% of your AI generations. Add 500 more with AI Boost?',
  },
  {
    id: 'near_storage_limit',
    name: 'Storage Running Low',
    condition: (profile) => profile.usageMetrics.storageUsedGb / profile.usageMetrics.storageLimit > 0.8,
    recommendedUpsells: ['storage_max'],
    urgencyLevel: 'high',
    message: 'Storage at 80%. Get +5TB with Storage Max.',
  },
  {
    id: 'collaborating',
    name: 'Adding Team Members',
    condition: (profile) => profile.usageMetrics.collaboratorsAdded > 0 && profile.usageMetrics.collaboratorsAdded > profile.usageMetrics.collaboratorsLimit * 0.7,
    recommendedUpsells: ['team_expansion'],
    urgencyLevel: 'medium',
    message: 'Your team is growing! Expand with Team Expansion pack.',
  },
  {
    id: 'heavy_trading',
    name: 'Active Crypto Trader',
    condition: (profile) => profile.monthlySpend > 100,
    recommendedUpsells: ['crypto_premium'],
    urgencyLevel: 'medium',
    message: 'Trading often? Save on fees with Crypto Premium.',
  },
  {
    id: 'selling_marketplace',
    name: 'Marketplace Seller',
    condition: (profile) => profile.monthlySpend > 50 && profile.currentTier !== 'free',
    recommendedUpsells: ['marketplace_pro'],
    urgencyLevel: 'medium',
    message: 'Maximize your marketplace earnings. Reduce commission to 15% with Marketplace Pro.',
  },
  {
    id: 'api_user',
    name: 'API Integration',
    condition: (profile) => profile.currentTier in ['pro', 'elite', 'agency'],
    recommendedUpsells: ['api_unlimited'],
    urgencyLevel: 'low',
    message: 'API power user? Remove rate limits with API Unlimited.',
  },
];

/**
 * SOCIAL PROOF & PSYCHOLOGICAL TRIGGERS
 */
export const SOCIAL_PROOF_MESSAGES = {
  tierPopularity: {
    creator: '2,847 creators chose this tier this month ⭐',
    pro: '1,203 professionals upgrading monthly ⭐',
    elite: '89 elite users managing teams 👑',
  },
  limitedTime: [
    'Only 3 spots left in this cohort',
    'Early bird pricing ends in 2 days',
    'Your personal discount expires soon',
    'This offer is exclusive to your segment',
  ],
  scarcity: [
    'Only 15 new Elite spots available this quarter',
    'Agency tier has limited integrations available',
    'Early adopter discount: limited to 100 users',
  ],
  urgency: [
    'Your tier limit resets tomorrow',
    'Price increase scheduled for next month',
    'Your team is waiting for this feature',
  ],
};

/**
 * Calculate churn risk score for user
 */
export function calculateChurnRiskScore(profile: Partial<UserMonetizationProfile>): number {
  let score = 0;

  // Days inactive (max 40 points)
  if (profile.churnIndicators?.daysInactive) {
    const daysInactive = Math.min(profile.churnIndicators.daysInactive, 30);
    score += (daysInactive / 30) * 40;
  }

  // Failed payments (max 20 points)
  if (profile.churnIndicators?.failedPayments) {
    score += Math.min(profile.churnIndicators.failedPayments * 10, 20);
  }

  // Refund requests (max 15 points)
  if (profile.churnIndicators?.refundRequests) {
    score += Math.min(profile.churnIndicators.refundRequests * 7.5, 15);
  }

  // Support tickets (max 10 points)
  if (profile.churnIndicators?.supportTickets) {
    score += Math.min(profile.churnIndicators.supportTickets * 2, 10);
  }

  // Negative reviews (max 15 points)
  if (profile.churnIndicators?.negativeReviews) {
    score += Math.min(profile.churnIndicators.negativeReviews * 7.5, 15);
  }

  return Math.min(Math.round(score), 100);
}

/**
 * Calculate engagement score
 */
export function calculateEngagementScore(profile: Partial<UserMonetizationProfile>): number {
  let score = 0;

  // Usage intensity (max 50 points)
  if (profile.usageMetrics) {
    const aiUsage = (profile.usageMetrics.aiGenerationsUsed / profile.usageMetrics.aiGenerationsLimit) * 0.3;
    const storageUsage = (profile.usageMetrics.storageUsedGb / profile.usageMetrics.storageLimit) * 0.3;
    const projectsUsage = (profile.usageMetrics.projectsCreated / profile.usageMetrics.projectsLimit) * 0.4;
    score += (aiUsage + storageUsage + projectsUsage) * 50;
  }

  // Purchase history (max 30 points)
  if (profile.purchaseHistory?.totalPurchases) {
    score += Math.min(profile.purchaseHistory.totalPurchases * 5, 30);
  }

  // Account age & activity (max 20 points)
  if (profile.churnIndicators?.daysInactive !== undefined) {
    const activePercent = Math.max(0, (30 - profile.churnIndicators.daysInactive) / 30);
    score += activePercent * 20;
  }

  return Math.min(Math.round(score), 100);
}

/**
 * Calculate LTV (Lifetime Value) estimate
 */
export function calculateLTV(profile: Partial<UserMonetizationProfile>): number {
  const monthlySpend = profile.monthlySpend || 0;
  const retentionRate = Math.max(0.5, 1 - (profile.churnIndicators?.daysInactive || 0) / 120);
  const expectedMonths = Math.log(0.05) / Math.log(retentionRate); // Until 95% churn
  
  return monthlySpend * expectedMonths;
}

/**
 * Get personalized monetization recommendations
 */
export function getMonetizationRecommendations(
  profile: UserMonetizationProfile
): {
  tier?: TierName;
  upsells: string[];
  offer?: {
    type: string;
    discount: number;
    validDays: number;
  };
} {
  const recommendations: any = { upsells: [] };

  // Tier recommendation based on usage
  const usagePercentage = Math.max(
    profile.usageMetrics.aiGenerationsUsed / profile.usageMetrics.aiGenerationsLimit,
    profile.usageMetrics.storageUsedGb / profile.usageMetrics.storageLimit,
    profile.usageMetrics.projectsCreated / profile.usageMetrics.projectsLimit
  );

  if (usagePercentage > 0.8 && profile.currentTier !== 'god') {
    const nextTier = Object.values(UPGRADE_INCENTIVES)
      .find(tier => tier.recommendedUpgrade === profile.currentTier);
    if (nextTier) {
      recommendations.tier = nextTier.recommendedUpgrade;
    }
  }

  // Upsell recommendations from triggers
  for (const trigger of USAGE_BASED_UPSELL_TRIGGERS) {
    if (trigger.condition(profile)) {
      recommendations.upsells.push(...trigger.recommendedUpsells);
    }
  }

  // Churn retention offer
  const churnScore = profile.churnRiskScore;
  if (churnScore > 60) {
    if (churnScore < 70) {
      recommendations.offer = {
        type: 'loyalty_bonus',
        discount: 25,
        validDays: 7,
      };
    } else if (churnScore < 85) {
      recommendations.offer = {
        type: 'last_chance',
        discount: 50,
        validDays: 3,
      };
    } else {
      recommendations.offer = {
        type: 'vip_retention',
        discount: 60,
        validDays: 1,
      };
    }
  }

  return recommendations;
}

/**
 * Generate dynamic checkout copy with social proof
 */
export function generateCheckoutCopy(tier: TierName): {
  headline: string;
  subheading: string;
  ctaText: string;
  socialProof: string[];
} {
  const tierInfo = PREMIUM_TIERS[tier];
  const proof = SOCIAL_PROOF_MESSAGES.tierPopularity[tier as keyof typeof SOCIAL_PROOF_MESSAGES.tierPopularity];

  return {
    headline: `Join the ${tierInfo.displayName} tier`,
    subheading: tierInfo.subtitle,
    ctaText: `Get ${tierInfo.displayName} - $${tierInfo.monthlyPrice}/mo`,
    socialProof: [
      proof || 'Join thousands of creators',
      'No credit card required',
      'Cancel anytime',
      '24-hour money-back guarantee',
    ],
  };
}

/**
 * Calculate true annual value (with all discounts & offers)
 */
export function calculateAnnualValue(
  monthlyPrice: number,
  activeUpsells: number = 0,
  discountPercent: number = 0,
  includeAnnualDiscount: boolean = false
): number {
  const annualBase = monthlyPrice * 12;
  let total = annualBase;

  // Add upsells (assuming average upsell = $50/mo)
  total += activeUpsells * 50 * 12;

  // Apply discount
  if (discountPercent > 0) {
    total = total * (1 - discountPercent / 100);
  }

  // Apply annual discount (25% savings)
  if (includeAnnualDiscount) {
    total = total * 0.75;
  }

  return Math.round(total);
}
