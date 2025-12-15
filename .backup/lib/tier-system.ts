// Subscription tier feature limits and pricing

type TierConfig = {
  name: string;
  price: string | number;
  monthly_price: number;
  description: string;
  contact_sales: boolean;
  features: string[];
  limits: {
    ai_generations: number;
    bots: number;
    automations: number;
    api_calls: number;
    storage_gb: number;
    team_members: number;
    marketplace_purchases: number;
  };
  stripe_price_id: string | null | undefined;
  solana_price?: number;
  ethereum_price?: number;
  key: string;
};

export const TIER_CONFIG: Record<string, TierConfig> = {
  free: {
    name: 'Free',
    price: 0,
    monthly_price: 0,
    description: 'Perfect for getting started',
    contact_sales: false,
    features: [
      '10 AI generations/month',
      'Basic bot templates',
      '1 automation',
      'Community access',
      'Email support',
    ],
    limits: {
      ai_generations: 10,
      bots: 3,
      automations: 1,
      api_calls: 100,
      storage_gb: 1,
      team_members: 1,
      marketplace_purchases: 0,
    },
    stripe_price_id: process.env.STRIPE_PRICE_FREE,
    solana_price: 0,
    ethereum_price: 0,
    key: 'free',
  },

  starter: {
    name: 'Starter',
    price: '$9',
    monthly_price: 9,
    description: 'For growing creators',
    contact_sales: false,
    features: [
      '100 AI generations/month',
      'All bot templates',
      '5 automations',
      'Custom bot training',
      'Marketplace access',
      'Basic analytics',
      'Priority support',
    ],
    limits: {
      ai_generations: 100,
      bots: 10,
      automations: 5,
      api_calls: 1000,
      storage_gb: 10,
      team_members: 2,
      marketplace_purchases: 5,
    },
    stripe_price_id: process.env.STRIPE_PRICE_STARTER,
    solana_price: 0.5,
    ethereum_price: 0.003,
    key: 'starter',
  },

  creator: {
    name: 'Creator',
    price: '$29',
    monthly_price: 29,
    description: 'For professional creators',
    contact_sales: false,
    features: [
      '500 AI generations/month',
      'Advanced AI customization',
      '20 automations',
      'Team collaboration (3)',
      'Marketplace seller access',
      'Advanced analytics',
      'API access (read-only)',
      'Custom integrations',
      'Phone support',
    ],
    limits: {
      ai_generations: 500,
      bots: 25,
      automations: 20,
      api_calls: 5000,
      storage_gb: 50,
      team_members: 3,
      marketplace_purchases: 25,
    },
    stripe_price_id: process.env.STRIPE_PRICE_CREATOR,
    solana_price: 1.5,
    ethereum_price: 0.01,
    key: 'creator',
  },

  pro: {
    name: 'Pro',
    price: '$79',
    monthly_price: 79,
    description: 'For agencies and businesses',
    contact_sales: false,
    features: [
      '2000 AI generations/month',
      'Custom AI models',
      'Unlimited automations',
      'Team collaboration (5)',
      'Marketplace seller with revenue share',
      'Advanced analytics & reporting',
      'Full API access',
      'Webhook integrations',
      'Priority API rate limits',
      'Dedicated account manager',
    ],
    limits: {
      ai_generations: 2000,
      bots: 100,
      automations: 100,
      api_calls: 50000,
      storage_gb: 250,
      team_members: 5,
      marketplace_purchases: 100,
    },
    stripe_price_id: process.env.STRIPE_PRICE_PRO,
    solana_price: 4,
    ethereum_price: 0.025,
    key: 'pro',
  },

  agency: {
    name: 'Agency',
    price: '$199',
    monthly_price: 199,
    description: 'For large teams and agencies',
    contact_sales: false,
    features: [
      '5000 AI generations/month',
      'White-label platform',
      'Unlimited everything',
      'Team collaboration (unlimited)',
      'Custom marketplace',
      'Enterprise analytics',
      'Priority infrastructure',
      'Custom SLA',
      'On-call support',
    ],
    limits: {
      ai_generations: 5000,
      bots: 500,
      automations: 500,
      api_calls: 200000,
      storage_gb: 1000,
      team_members: 999,
      marketplace_purchases: 999,
    },
    stripe_price_id: process.env.STRIPE_PRICE_AGENCY,
    solana_price: 10,
    ethereum_price: 0.06,
    key: 'agency',
  },

  enterprise: {
    name: 'Enterprise',
    price: 'Custom',
    monthly_price: 999,
    description: 'Custom enterprise solution',
    contact_sales: true,
    features: [
      'Unlimited everything',
      'Dedicated infrastructure',
      'Custom AI model training',
      'White-label with custom domain',
      'Advanced security & compliance',
      '24/7 phone & email support',
      'Custom integration',
      'SLA guarantee',
    ],
    limits: {
      ai_generations: 999999,
      bots: 9999,
      automations: 9999,
      api_calls: 9999999,
      storage_gb: 10000,
      team_members: 9999,
      marketplace_purchases: 9999,
    },
    stripe_price_id: null,
    solana_price: 50,
    ethereum_price: 0.3,
    key: 'enterprise',
  },
};

export type TierName = keyof typeof TIER_CONFIG;

export function getTierConfig(tier: TierName) {
  return TIER_CONFIG[tier] || TIER_CONFIG.free;
}

export function getLimit(tier: TierName, feature: keyof typeof TIER_CONFIG['free']['limits']) {
  const tierConfig = getTierConfig(tier);
  return tierConfig.limits[feature] || 0;
}

export function canUseFeature(tier: TierName, feature: keyof typeof TIER_CONFIG['free']['limits'], currentUsage: number = 0): boolean {
  const limit = getLimit(tier, feature);
  return currentUsage < limit;
}

export function getRemainingQuota(tier: TierName, feature: keyof typeof TIER_CONFIG['free']['limits'], currentUsage: number = 0): number {
  const limit = getLimit(tier, feature);
  return Math.max(0, limit - currentUsage);
}

// Upgrade recommendations
export function getRecommendedUpgrade(tier: TierName): TierName | null {
  const upgradePath: Record<TierName, TierName | null> = {
    free: 'starter',
    starter: 'creator',
    creator: 'pro',
    pro: 'agency',
    agency: 'enterprise',
    enterprise: null,
  };

  return upgradePath[tier];
}

// Feature availability matrix
export const FEATURE_MATRIX = {
  'ai-generation': {
    free: false,
    starter: true,
    creator: true,
    pro: true,
    agency: true,
    enterprise: true,
  },
  'bot-builder': {
    free: false,
    starter: true,
    creator: true,
    pro: true,
    agency: true,
    enterprise: true,
  },
  'automations': {
    free: true,
    starter: true,
    creator: true,
    pro: true,
    agency: true,
    enterprise: true,
  },
  'marketplace-seller': {
    free: false,
    starter: false,
    creator: true,
    pro: true,
    agency: true,
    enterprise: true,
  },
  'team-collaboration': {
    free: false,
    starter: true,
    creator: true,
    pro: true,
    agency: true,
    enterprise: true,
  },
  'api-access': {
    free: false,
    starter: false,
    creator: true,
    pro: true,
    agency: true,
    enterprise: true,
  },
  'white-label': {
    free: false,
    starter: false,
    creator: false,
    pro: false,
    agency: true,
    enterprise: true,
  },
  'custom-ai': {
    free: false,
    starter: false,
    creator: true,
    pro: true,
    agency: true,
    enterprise: true,
  },
  'advanced-analytics': {
    free: false,
    starter: true,
    creator: true,
    pro: true,
    agency: true,
    enterprise: true,
  },
  'priority-support': {
    free: false,
    starter: true,
    creator: true,
    pro: true,
    agency: true,
    enterprise: true,
  },
};

export function hasFeature(tier: TierName, feature: keyof typeof FEATURE_MATRIX): boolean {
  const featureAccess = FEATURE_MATRIX[feature] as Record<TierName, boolean>;
  return featureAccess[tier] || false;
}

// Price calculation with crypto support
export function calculatePrice(tier: TierName, paymentMethod: 'stripe' | 'solana' | 'ethereum' = 'stripe'): string {
  const config = getTierConfig(tier);

  if (paymentMethod === 'stripe') {
    return String(config.price);
  }

  if (paymentMethod === 'solana' && config.solana_price) {
    return `${config.solana_price} SOL`;
  }

  if (paymentMethod === 'ethereum' && config.ethereum_price) {
    return `${config.ethereum_price} ETH`;
  }

  return String(config.price);
}

// Get all tiers sorted by price
export function getAllTiers(): Array<[TierName, typeof TIER_CONFIG[TierName]]> {
  return Object.entries(TIER_CONFIG) as Array<[TierName, typeof TIER_CONFIG[TierName]]>;
}

// Check if upgrade is needed
export function needsUpgrade(tier: TierName, feature: keyof typeof TIER_CONFIG['free']['limits'], currentUsage: number = 0): boolean {
  const limit = getLimit(tier, feature);
  return currentUsage >= limit;
}

// Get upgrade message
export function getUpgradeMessage(tier: TierName, feature: string): string {
  const nextTier = getRecommendedUpgrade(tier);
  if (!nextTier) {
    return `You've reached the limit for ${feature}. Contact support for Enterprise options.`;
  }

  const nextConfig = getTierConfig(nextTier);
  return `Upgrade to ${nextConfig.name} for more ${feature}`;
}
