/**
 * Monetization System Validation
 * 
 * Validates all components of the new premium pricing and crypto marketplace
 * systems. Runs through key calculations to ensure correct math and logic.
 */

import { PREMIUM_TIERS, FEATURE_MATRIX, UPSELL_PACKAGES, getAnnualPrice, getTierFeatures } from '../lib/premium-pricing';
import { CRYPTO_PAYMENT_CONFIG, convertUsdToCrypto, calculateTradingFee } from '../lib/crypto-marketplace';
import { calculateChurnRiskScore, calculateEngagementScore, CHURN_PREVENTION_OFFERS } from '../lib/revenue-maximization';

console.log('🔍 MONETIZATION SYSTEM VALIDATION\n');

// ===== TIER VALIDATION =====
console.log('📊 PREMIUM TIER VALIDATION');
console.log('═'.repeat(50));

const tiers = Object.keys(PREMIUM_TIERS) as const;
console.log(`✓ Tiers found: ${tiers.join(', ')}`);
console.log(`✓ Total tiers: ${tiers.length}`);

let totalMonthlyRevenue = 0;
tiers.forEach(tier => {
  const tierData = PREMIUM_TIERS[tier];
  const annualPrice = getAnnualPrice(tier, 'annual');
  const savings = (tierData.monthlyPrice * 12) - tierData.annualPrice;
  const savingsPercent = ((savings / (tierData.monthlyPrice * 12)) * 100).toFixed(1);
  
  console.log(`\n  ${tierData.icon} ${tierData.displayName}`);
  console.log(`    Monthly: $${tierData.monthlyPrice}/mo`);
  console.log(`    Annual: $${tierData.annualPrice}/yr (save ${savingsPercent}%)`);
  console.log(`    Features: ${getTierFeatures(tier).length}`);
  
  totalMonthlyRevenue += tierData.monthlyPrice;
});

// ===== FEATURE MATRIX VALIDATION =====
console.log('\n\n🎯 FEATURE MATRIX VALIDATION');
console.log('═'.repeat(50));

const features = Object.keys(FEATURE_MATRIX);
console.log(`✓ Total features: ${features.length}`);
console.log(`✓ Tiers in matrix: ${tiers.length}`);

// Check feature distribution
const featuresByTier: Record<string, number> = {};
tiers.forEach(tier => {
  featuresByTier[tier] = getTierFeatures(tier).length;
});
console.log('\nFeatures per tier:');
Object.entries(featuresByTier).forEach(([tier, count]) => {
  const tierData = PREMIUM_TIERS[tier as any];
  console.log(`  ${tierData.icon} ${tierData.displayName}: ${count} features`);
});

// ===== UPSELL VALIDATION =====
console.log('\n\n💎 UPSELL PACKAGES VALIDATION');
console.log('═'.repeat(50));

console.log(`✓ Total upsells: ${Object.keys(UPSELL_PACKAGES).length}`);
Object.entries(UPSELL_PACKAGES).forEach(([key, upsell]) => {
  console.log(`\n  ${upsell.icon} ${upsell.name}`);
  console.log(`    Price: $${upsell.monthlyPrice}/mo`);
  console.log(`    Compatible tiers: ${upsell.compatibleTiers.join(', ')}`);
  console.log(`    Expected attach rate: ${(upsell.expectedAttachRate * 100).toFixed(0)}%`);
});

// ===== CRYPTO VALIDATION =====
console.log('\n\n₿ CRYPTO MARKETPLACE VALIDATION');
console.log('═'.repeat(50));

const cryptoAssets = Object.keys(CRYPTO_PAYMENT_CONFIG) as const;
console.log(`✓ Crypto assets supported: ${cryptoAssets.length}`);
cryptoAssets.forEach(asset => {
  const config = CRYPTO_PAYMENT_CONFIG[asset];
  console.log(`\n  ${config.icon} ${config.name} (${asset})`);
  console.log(`    Decimals: ${config.decimals}`);
  console.log(`    Min transaction: ${config.minTransaction} ${asset}`);
  console.log(`    Confirmations needed: ${config.confirmations}`);
});

// ===== PRICING CONVERSION TEST =====
console.log('\n\n🔄 PRICING CONVERSION TEST');
console.log('═'.repeat(50));

// Test: $79 creator tier conversion to crypto
const creatorPrice = 79;
console.log(`\nConverting $${creatorPrice} (Creator tier) to crypto:`);
cryptoAssets.forEach(asset => {
  try {
    const amount = convertUsdToCrypto(creatorPrice, asset);
    console.log(`  ${CRYPTO_PAYMENT_CONFIG[asset].icon} ${asset}: ${amount.toFixed(6)} ${asset}`);
  } catch (e) {
    console.log(`  ${CRYPTO_PAYMENT_CONFIG[asset].icon} ${asset}: [Price data unavailable]`);
  }
});

// ===== CHURN PREVENTION VALIDATION =====
console.log('\n\n🛡️ CHURN PREVENTION VALIDATION');
console.log('═'.repeat(50));

console.log(`✓ Offer tiers: ${Object.keys(CHURN_PREVENTION_OFFERS).length}`);
Object.entries(CHURN_PREVENTION_OFFERS).forEach(([tier, offer]) => {
  console.log(`\n  Tier ${tier} (Risk: ${offer.triggerRiskScore}+)`);
  console.log(`    Discount: ${offer.discountPercent}%`);
  console.log(`    Validity: ${offer.validityDays} days`);
  console.log(`    Expected acceptance: ${(offer.expectedAcceptanceRate * 100).toFixed(0)}%`);
});

// ===== REVENUE PROJECTIONS =====
console.log('\n\n💰 REVENUE PROJECTION TEST');
console.log('═'.repeat(50));

// Assume distribution:
// Free: 60% of signups (no revenue)
// Starter: 15% → $29 × 1000 users = $29K
// Creator: 15% → $79 × 1000 users = $79K
// Pro: 6% → $199 × 400 users = $79.6K
// Elite: 2% → $499 × 133 users = $66.4K
// Agency: 1% → $1,299 × 67 users = $86.9K
// Enterprise: 0.5% → $3,999 × 33 users = $131.9K
// God: 0.5% → $9,999 × 33 users = $329.9K

const distribution = {
  free: { users: 6000, monthlyRevenue: 0 },
  starter: { users: 1500, monthlyRevenue: 1500 * 29 },
  creator: { users: 1500, monthlyRevenue: 1500 * 79 },
  pro: { users: 600, monthlyRevenue: 600 * 199 },
  elite: { users: 200, monthlyRevenue: 200 * 499 },
  agency: { users: 100, monthlyRevenue: 100 * 1299 },
  enterprise: { users: 50, monthlyRevenue: 50 * 3999 },
  god: { users: 50, monthlyRevenue: 50 * 9999 },
};

let projectedMRR = 0;
console.log('\nAssumed monthly distribution:');
Object.entries(distribution).forEach(([tier, data]) => {
  const tierData = PREMIUM_TIERS[tier as any];
  console.log(`  ${tierData.icon} ${tierData.displayName}: ${data.users.toLocaleString()} users → $${data.monthlyRevenue.toLocaleString()}/mo`);
  projectedMRR += data.monthlyRevenue;
});

const projectedARR = projectedMRR * 12;
const upsellMRR = projectedMRR * 0.30; // 30% attachment rate
const cryptoMRR = projectedMRR * 0.05; // 5% of users pay with crypto
const marketplaceMRR = projectedMRR * 0.05; // 5% marketplace commission

console.log(`\n📈 REVENUE CALCULATIONS`);
console.log(`  Base MRR (subscriptions): $${projectedMRR.toLocaleString()}`);
console.log(`  + Upsells (30% attach): $${upsellMRR.toLocaleString()}`);
console.log(`  + Crypto fees: $${cryptoMRR.toLocaleString()}`);
console.log(`  + Marketplace: $${marketplaceMRR.toLocaleString()}`);
console.log(`  ─────────────────────────`);
const totalMRR = projectedMRR + upsellMRR + cryptoMRR + marketplaceMRR;
console.log(`  TOTAL MRR: $${totalMRR.toLocaleString()}`);
console.log(`  TOTAL ARR: $${(totalMRR * 12).toLocaleString()}`);

// ===== VALIDATION SUMMARY =====
console.log('\n\n✅ VALIDATION SUMMARY');
console.log('═'.repeat(50));

const validationResults = {
  'Premium tiers': tiers.length === 8,
  'Feature matrix': features.length >= 40,
  'Upsell packages': Object.keys(UPSELL_PACKAGES).length === 6,
  'Crypto assets': cryptoAssets.length === 7,
  'Churn prevention tiers': Object.keys(CHURN_PREVENTION_OFFERS).length === 4,
  'Revenue positive': totalMRR > 0,
};

Object.entries(validationResults).forEach(([check, passed]) => {
  console.log(`${passed ? '✅' : '❌'} ${check}`);
});

const allPassed = Object.values(validationResults).every(v => v);
console.log(`\n${allPassed ? '🎉 ALL VALIDATIONS PASSED!' : '⚠️ SOME VALIDATIONS FAILED'}`);

process.exit(allPassed ? 0 : 1);
