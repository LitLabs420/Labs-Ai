/**
 * Premium Pricing Strategy System
 * 
 * Psychology-optimized pricing tiers designed to maximize revenue while
 * delivering exceptional value perception. Uses anchoring, scarcity,
 * FOMO, and prestige-based pricing strategies.
 */

export type TierName = 'free' | 'starter' | 'creator' | 'pro' | 'elite' | 'agency' | 'enterprise' | 'god';
export type BillingCycle = 'monthly' | 'annual';

/**
 * PREMIUM TIER DEFINITIONS
 * - Prices optimized using value-based pricing psychology
 * - Annual discounts encourage commitment (save 25%)
 * - Prestige tiers (Elite, God) create aspirational value
 */
export const PREMIUM_TIERS: Record<TierName, {
  name: string;
  displayName: string;
  subtitle: string;
  monthlyPrice: number;
  annualPrice: number;
  stripePriceIdMonthly: string;
  stripePriceIdAnnual: string;
  color: string;
  icon: string;
  badge?: string;
  position: number;
  targets: string[];
}> = {
  free: {
    name: 'free',
    displayName: 'Starter',
    subtitle: 'Perfect for trying it out',
    monthlyPrice: 0,
    annualPrice: 0,
    stripePriceIdMonthly: '',
    stripePriceIdAnnual: '',
    color: 'slate',
    icon: '🚀',
    position: 0,
    targets: ['students', 'hobbyists', 'curious users'],
  },
  starter: {
    name: 'starter',
    displayName: 'Starter',
    subtitle: 'For freelancers getting started',
    monthlyPrice: 29,
    annualPrice: 261, // Save 25% = $2.17/mo savings
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY || '',
    stripePriceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_ANNUAL || '',
    color: 'blue',
    icon: '⭐',
    position: 1,
    targets: ['freelancers', 'creators', 'small teams'],
  },
  creator: {
    name: 'creator',
    displayName: 'Creator',
    subtitle: 'For professional content creators',
    monthlyPrice: 79,
    annualPrice: 711, // Save 25% = $6.58/mo savings
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_MONTHLY || '',
    stripePriceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_ANNUAL || '',
    color: 'purple',
    icon: '✨',
    badge: 'POPULAR',
    position: 2,
    targets: ['creators', 'agencies', 'influencers'],
  },
  pro: {
    name: 'pro',
    displayName: 'Pro',
    subtitle: 'For professional studios',
    monthlyPrice: 199,
    annualPrice: 1791, // Save 25% = $16.58/mo savings
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || '',
    stripePriceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL || '',
    color: 'pink',
    icon: '🔥',
    position: 3,
    targets: ['studios', 'agencies', 'brands'],
  },
  elite: {
    name: 'elite',
    displayName: 'Elite',
    subtitle: 'For scaling agencies & studios',
    monthlyPrice: 499,
    annualPrice: 4491, // Save 25% = $41.58/mo savings
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE_MONTHLY || '',
    stripePriceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE_ANNUAL || '',
    color: 'amber',
    icon: '👑',
    badge: 'LUXURY',
    position: 4,
    targets: ['scaling studios', 'brands', 'production companies'],
  },
  agency: {
    name: 'agency',
    displayName: 'Agency',
    subtitle: 'For white-label resellers',
    monthlyPrice: 1299,
    annualPrice: 11691, // Save 25% = $108.25/mo savings
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY_MONTHLY || '',
    stripePriceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY_ANNUAL || '',
    color: 'cyan',
    icon: '🏆',
    badge: 'ENTERPRISE',
    position: 5,
    targets: ['white-label agencies', 'resellers', 'large teams'],
  },
  enterprise: {
    name: 'enterprise',
    displayName: 'Enterprise',
    subtitle: 'For large organizations',
    monthlyPrice: 3999,
    annualPrice: 35991, // Save 25% = $333.25/mo savings
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_MONTHLY || '',
    stripePriceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE_ANNUAL || '',
    color: 'indigo',
    icon: '🚁',
    badge: 'ENTERPRISE',
    position: 6,
    targets: ['enterprises', 'corporations', 'institutions'],
  },
  god: {
    name: 'god',
    displayName: 'God Mode',
    subtitle: 'Unlimited everything + white-label',
    monthlyPrice: 9999,
    annualPrice: 89991, // Save 25% = $833.25/mo savings
    stripePriceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_GOD_MONTHLY || '',
    stripePriceIdAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_GOD_ANNUAL || '',
    color: 'violet',
    icon: '🌟',
    badge: 'ULTIMATE',
    position: 7,
    targets: ['ultimate power users', 'vip clients', 'strategic partners'],
  },
};

/**
 * FEATURE MATRIX
 * Maps 40+ features across 8 tiers with strategic scarcity
 */
export const FEATURE_MATRIX: Record<string, Record<TierName, boolean | number | string>> = {
  // AI Features
  'ai.generations.monthly': {
    free: 5,
    starter: 100,
    creator: 1000,
    pro: 5000,
    elite: 20000,
    agency: 100000,
    enterprise: 500000,
    god: 999999,
  },
  'ai.generations.daily': {
    free: 2,
    starter: 20,
    creator: 100,
    pro: 500,
    elite: 2000,
    agency: 10000,
    enterprise: 50000,
    god: 999999,
  },
  'ai.models.advanced': {
    free: false,
    starter: false,
    creator: true,
    pro: true,
    elite: true,
    agency: true,
    enterprise: true,
    god: true,
  },
  'ai.models.custom': {
    free: false,
    starter: false,
    creator: false,
    pro: true,
    elite: true,
    agency: true,
    enterprise: true,
    god: true,
  },
  'ai.voice.synthesis': {
    free: false,
    starter: true,
    creator: true,
    pro: true,
    elite: true,
    agency: true,
    enterprise: true,
    god: true,
  },
  'ai.video.generation': {
    free: false,
    starter: false,
    creator: true,
    pro: true,
    elite: true,
    agency: true,
    enterprise: true,
    god: true,
  },

  // Content Features
  'content.projects': {
    free: 3,
    starter: 20,
    creator: 100,
    pro: 500,
    elite: 5000,
    agency: 50000,
    enterprise: 500000,
    god: 999999,
  },
  'content.collaborators': {
    free: 0,
    starter: 2,
    creator: 10,
    pro: 50,
    elite: 500,
    agency: 5000,
    enterprise: 50000,
    god: 999999,
  },
  'content.storage.gb': {
    free: 2,
    starter: 50,
    creator: 500,
    pro: 5000,
    elite: 50000,
    agency: 500000,
    enterprise: 5000000,
    god: 999999,
  },
  'content.templates': {
    free: 10,
    starter: 100,
    creator: 500,
    pro: 2000,
    elite: 10000,
    agency: 50000,
    enterprise: 500000,
    god: 999999,
  },

  // Publishing Features
  'publish.channels': {
    free: 1,
    starter: 3,
    creator: 10,
    pro: 50,
    elite: 500,
    agency: 5000,
    enterprise: 50000,
    god: 999999,
  },
  'publish.scheduling': {
    free: false,
    starter: true,
    creator: true,
    pro: true,
    elite: true,
    agency: true,
    enterprise: true,
    god: true,
  },
  'publish.bulk.monthly': {
    free: 0,
    starter: 50,
    creator: 500,
    pro: 5000,
    elite: 50000,
    agency: 500000,
    enterprise: 5000000,
    god: 999999,
  },

  // Analytics Features
  'analytics.basic': {
    free: true,
    starter: true,
    creator: true,
    pro: true,
    elite: true,
    agency: true,
    enterprise: true,
    god: true,
  },
  'analytics.advanced': {
    free: false,
    starter: false,
    creator: true,
    pro: true,
    elite: true,
    agency: true,
    enterprise: true,
    god: true,
  },
  'analytics.custom.dashboards': {
    free: 0,
    starter: 2,
    creator: 10,
    pro: 100,
    elite: 1000,
    agency: 10000,
    enterprise: 100000,
    god: 999999,
  },
  'analytics.reports.custom': {
    free: false,
    starter: false,
    creator: true,
    pro: true,
    elite: true,
    agency: true,
    enterprise: true,
    god: true,
  },

  // Monetization Features
  'monetization.stripe': {
    free: false,
    starter: true,
    creator: true,
    pro: true,
    elite: true,
    agency: true,
    enterprise: true,
    god: true,
  },
  'monetization.paypal': {
    free: false,
    starter: true,
    creator: true,
    pro: true,
    elite: true,
    agency: true,
    enterprise: true,
    god: true,
  },
  'monetization.crypto': {
    free: false,
    starter: false,
    creator: true,
    pro: true,
    elite: true,
    agency: true,
    enterprise: true,
    god: true,
  },
  'monetization.tiered.pricing': {
    free: false,
    starter: false,
    creator: true,
    pro: true,
    elite: true,
    agency: true,
    enterprise: true,
    god: true,
  },

  // Marketplace Features
  'marketplace.sell': {
    free: false,
    starter: false,
    creator: true,
    pro: true,
    elite: true,
    agency: true,
    enterprise: true,
    god: true,
  },
  'marketplace.listings': {
    free: 0,
    starter: 0,
    creator: 50,
    pro: 500,
    elite: 5000,
    agency: 50000,
    enterprise: 500000,
    god: 999999,
  },
  'marketplace.commission.percent': {
    free: 0,
    starter: 0,
    creator: 30,
    pro: 25,
    elite: 20,
    agency: 15,
    enterprise: 10,
    god: 0,
  },

  // Team & Collaboration
  'team.members': {
    free: 1,
    starter: 3,
    creator: 10,
    pro: 50,
    elite: 500,
    agency: 5000,
    enterprise: 50000,
    god: 999999,
  },
  'team.roles.custom': {
    free: false,
    starter: false,
    creator: true,
    pro: true,
    elite: true,
    agency: true,
    enterprise: true,
    god: true,
  },
  'team.permissions.granular': {
    free: false,
    starter: false,
    creator: false,
    pro: true,
    elite: true,
    agency: true,
    enterprise: true,
    god: true,
  },

  // API & Integration
  'api.access': {
    free: false,
    starter: false,
    creator: true,
    pro: true,
    elite: true,
    agency: true,
    enterprise: true,
    god: true,
  },
  'api.rate.limit': {
    free: 0,
    starter: 0,
    creator: 1000,
    pro: 10000,
    elite: 100000,
    agency: 1000000,
    enterprise: 10000000,
    god: 999999,
  },
  'api.webhooks': {
    free: false,
    starter: false,
    creator: true,
    pro: true,
    elite: true,
    agency: true,
    enterprise: true,
    god: true,
  },
  'api.custom.integrations': {
    free: false,
    starter: false,
    creator: false,
    pro: 3,
    elite: 20,
    agency: 200,
    enterprise: 2000,
    god: 999999,
  },

  // Support Features
  'support.email': {
    free: true,
    starter: true,
    creator: true,
    pro: true,
    elite: true,
    agency: true,
    enterprise: true,
    god: true,
  },
  'support.priority': {
    free: false,
    starter: false,
    creator: false,
    pro: true,
    elite: true,
    agency: true,
    enterprise: true,
    god: true,
  },
  'support.dedicated.manager': {
    free: false,
    starter: false,
    creator: false,
    pro: false,
    elite: true,
    agency: true,
    enterprise: true,
    god: true,
  },
  'support.phone': {
    free: false,
    starter: false,
    creator: false,
    pro: false,
    elite: false,
    agency: true,
    enterprise: true,
    god: true,
  },

  // White-Label & Branding
  'whitelabel.enabled': {
    free: false,
    starter: false,
    creator: false,
    pro: false,
    elite: false,
    agency: true,
    enterprise: true,
    god: true,
  },
  'whitelabel.custom.domain': {
    free: false,
    starter: false,
    creator: false,
    pro: false,
    elite: false,
    agency: true,
    enterprise: true,
    god: true,
  },
  'whitelabel.custom.branding': {
    free: false,
    starter: false,
    creator: false,
    pro: false,
    elite: false,
    agency: true,
    enterprise: true,
    god: true,
  },
  'whitelabel.reseller.terms': {
    free: false,
    starter: false,
    creator: false,
    pro: false,
    elite: false,
    agency: true,
    enterprise: true,
    god: true,
  },
};

/**
 * UPSELL PACKAGES
 * Strategic add-ons to maximize revenue per user
 */
export const UPSELL_PACKAGES = [
  {
    id: 'ai_boost',
    name: 'AI Boost Pack',
    description: '+500 AI generations/month',
    monthlyPrice: 49,
    icon: '🚀',
    compatibleTiers: ['free', 'starter', 'creator', 'pro'],
  },
  {
    id: 'team_expansion',
    name: 'Team Expansion',
    description: '+10 team members',
    monthlyPrice: 99,
    icon: '👥',
    compatibleTiers: ['creator', 'pro', 'elite'],
  },
  {
    id: 'storage_max',
    name: 'Storage Max',
    description: '+5TB storage',
    monthlyPrice: 79,
    icon: '💾',
    compatibleTiers: ['free', 'starter', 'creator'],
  },
  {
    id: 'crypto_premium',
    name: 'Crypto Premium',
    description: 'Unlimited crypto transactions',
    monthlyPrice: 199,
    icon: '₿',
    compatibleTiers: ['creator', 'pro', 'elite', 'agency'],
  },
  {
    id: 'marketplace_pro',
    name: 'Marketplace Pro',
    description: 'Reduced commission (15%), featured listings',
    monthlyPrice: 149,
    icon: '🏪',
    compatibleTiers: ['creator', 'pro', 'elite'],
  },
  {
    id: 'api_unlimited',
    name: 'API Unlimited',
    description: 'Unlimited API calls',
    monthlyPrice: 299,
    icon: '🔌',
    compatibleTiers: ['pro', 'elite', 'agency'],
  },
];

/**
 * BUNDLE DEALS
 * Time-limited offers to drive conversion
 */
export const BUNDLE_DEALS = [
  {
    id: 'annual_savings_25',
    name: 'Annual Savings',
    description: 'Save 25% when you pay yearly',
    discount: 0.25,
    duration: 'annual',
    active: true,
    expiresAt: null, // Permanent
    applicableTiers: ['starter', 'creator', 'pro', 'elite', 'agency', 'enterprise'],
  },
  {
    id: 'early_adopter_30',
    name: 'Early Adopter',
    description: '30% off Pro/Elite for first 100 users',
    discount: 0.30,
    duration: 'monthly',
    active: true,
    expiresAt: new Date('2025-12-31'),
    applicableTiers: ['pro', 'elite'],
    maxUses: 100,
    usedCount: 0,
  },
  {
    id: 'team_combo_40',
    name: 'Team Combo',
    description: 'Creator + Team Expansion package - save 40%',
    discount: 0.40,
    duration: 'monthly',
    active: true,
    expiresAt: null,
    applicableTiers: ['creator'],
    bundleItems: ['ai_boost', 'team_expansion'],
  },
];

/**
 * Helper: Get annual price from monthly
 */
export function getAnnualPrice(monthlyPrice: number): number {
  return Math.round(monthlyPrice * 12 * 0.75); // 25% discount
}

/**
 * Helper: Check if tier has feature
 */
export function hasTierFeature(tier: TierName, featureKey: string): boolean | number | string {
  const feature = FEATURE_MATRIX[featureKey];
  if (!feature) return false;
  return feature[tier] ?? false;
}

/**
 * Helper: Get feature value for tier
 */
export function getTierFeatureValue<T extends boolean | number | string>(
  tier: TierName,
  featureKey: string,
  defaultValue: T
): T {
  const feature = FEATURE_MATRIX[featureKey];
  if (!feature) return defaultValue;
  const value = feature[tier];
  return value !== undefined ? (value as T) : defaultValue;
}

/**
 * Helper: Get all features available for tier
 */
export function getTierFeatures(tier: TierName): Record<string, boolean | number | string> {
  const features: Record<string, boolean | number | string> = {};
  for (const [key, tierValues] of Object.entries(FEATURE_MATRIX)) {
    features[key] = tierValues[tier] ?? false;
  }
  return features;
}

/**
 * Helper: Get upsells compatible with tier
 */
export function getCompatibleUpsells(tier: TierName) {
  return UPSELL_PACKAGES.filter(pkg => pkg.compatibleTiers.includes(tier));
}

/**
 * Helper: Calculate total monthly spend (tier + active upsells)
 */
export function calculateMonthlySpend(
  tier: TierName,
  activeUpsells: string[] = [],
  billingCycle: BillingCycle = 'monthly'
): number {
  const tierData = PREMIUM_TIERS[tier];
  const basePrice = billingCycle === 'monthly' ? tierData.monthlyPrice : tierData.annualPrice / 12;

  const upsellPrice = activeUpsells
    .map(upsellId => UPSELL_PACKAGES.find(u => u.id === upsellId)?.monthlyPrice || 0)
    .reduce((a, b) => a + b, 0);

  return basePrice + upsellPrice;
}

/**
 * Helper: Get upgrade recommendation (next tier up)
 */
export function getUpgradeRecommendation(currentTier: TierName): TierName | null {
  const tierOrder: TierName[] = ['free', 'starter', 'creator', 'pro', 'elite', 'agency', 'enterprise', 'god'];
  const currentIndex = tierOrder.indexOf(currentTier);
  return currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;
}

/**
 * Helper: Calculate savings with annual billing
 */
export function calculateAnnualSavings(monthlyPrice: number): number {
  const monthlyTotal = monthlyPrice * 12;
  const annualPrice = getAnnualPrice(monthlyPrice);
  return monthlyTotal - annualPrice;
}
