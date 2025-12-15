'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { GradientButton, PremiumButton } from '@/components/ui/premium-button';
import { PremiumCard } from '@/components/ui/premium-card';
import { TIER_CONFIG } from '@/lib/tier-system';
import { toast } from 'sonner';

const PAYMENT_METHODS = ['stripe', 'solana', 'ethereum'] as const;

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'solana' | 'ethereum'>('stripe');

  const tiers = [
    TIER_CONFIG.free,
    TIER_CONFIG.starter,
    TIER_CONFIG.creator,
    TIER_CONFIG.pro,
    TIER_CONFIG.agency,
    TIER_CONFIG.enterprise,
  ];

  const handleSelectPlan = (tierKey: string) => {
    if (tierKey === 'free') {
      toast.success('Free tier is active on your account');
      return;
    }

    if (tierKey === 'enterprise') {
      toast('Redirecting to sales contact form...');
      // Open contact sales modal
      return;
    }

    // Proceed to checkout
    toast.success(`Proceeding to ${tierKey} checkout...`);
    // Redirect to checkout
  };

  const yearlyDiscount = 0.2; // 20% discount for yearly

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 dark:from-neutral-950 to-neutral-100 dark:to-neutral-900 py-16 px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 max-w-3xl mx-auto"
      >
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-neutral-600 dark:text-neutral-400">
          Choose the perfect plan for your content creation journey
        </p>
      </motion.div>

      {/* Billing & Payment Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row justify-center gap-8 mb-12 max-w-2xl mx-auto"
      >
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4">
          <span className="text-neutral-700 dark:text-neutral-300 font-medium">Monthly</span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
            className="relative inline-flex h-8 w-14 items-center rounded-full bg-neutral-300 dark:bg-neutral-700 transition-colors"
            title="Toggle between monthly and yearly billing"
            aria-label="Toggle between monthly and yearly billing"
          >
            <motion.div
              layout
              className={`${
                billingPeriod === 'yearly'
                  ? 'translate-x-7 bg-gradient-to-r from-primary-500 to-secondary-500'
                  : 'translate-x-1 bg-white dark:bg-neutral-600'
              } h-6 w-6 rounded-full shadow-lg transition-all`}
            />
          </button>
          <span className="text-neutral-700 dark:text-neutral-300 font-medium">Yearly</span>
          {billingPeriod === 'yearly' && (
            <span className="ml-2 px-3 py-1 bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300 rounded-full text-sm font-semibold">
              Save 20%
            </span>
          )}
        </div>

        {/* Payment Method Selector */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-700 dark:text-neutral-300 font-medium">Pay with:</span>
          <div className="flex gap-2">
            {PAYMENT_METHODS.map((method) => (
              <motion.button
                key={method}
                onClick={() => setPaymentMethod(method)}
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  paymentMethod === method
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                }`}
              >
                {method === 'stripe' && '💳'}
                {method === 'solana' && '◎'}
                {method === 'ethereum' && 'Ξ'}
                <span className="ml-1 hidden sm:inline capitalize">{method}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Pricing Cards Grid */}
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {tiers.map((tier, idx) => {
            const isPopular = tier.key === 'pro';

            return (
              <motion.div
                key={tier.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                {/* Popular Badge */}
                {isPopular && (
                  <motion.div
                    initial={{ rotate: -5 }}
                    animate={{ rotate: 0 }}
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                  >
                    <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                      ⭐ Most Popular
                    </div>
                  </motion.div>
                )}

                <PremiumCard
                  variant={isPopular ? 'gradient' : 'glass'}
                  className={`h-full flex flex-col ${isPopular ? 'ring-2 ring-primary-500' : ''}`}
                >
                  {/* Tier Name */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2 text-neutral-900 dark:text-white">
                      {tier.name}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {tier.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    {tier.contact_sales ? (
                      <div className="text-xl font-bold text-neutral-900 dark:text-white">
                        Custom Pricing
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-neutral-900 dark:text-white">
                            {paymentMethod === 'stripe' && tier.price}
                            {paymentMethod === 'solana' && tier.solana_price && `${tier.solana_price} SOL`}
                            {paymentMethod === 'ethereum' && tier.ethereum_price && `${tier.ethereum_price} ETH`}
                          </span>
                          {paymentMethod === 'stripe' && (
                            <span className="text-neutral-600 dark:text-neutral-400">
                              {billingPeriod === 'yearly' ? '/year' : '/month'}
                            </span>
                          )}
                        </div>
                        {billingPeriod === 'yearly' && paymentMethod === 'stripe' && tier.monthly_price > 0 && (
                          <p className="text-sm text-success-600 dark:text-success-400 mt-2">
                            Save ${(tier.monthly_price * 12 * yearlyDiscount).toFixed(0)}/year
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="mb-8 flex-grow">
                    <div className="space-y-3">
                      {tier.features.map((feature, featureIdx) => (
                        <motion.div
                          key={featureIdx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + featureIdx * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <CheckIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            {feature}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isPopular ? (
                      <GradientButton
                        gradient="aurora"
                        fullWidth
                        onClick={() => handleSelectPlan(tier.key)}
                      >
                        Get Started
                        <ArrowRightIcon className="w-5 h-5 ml-2" />
                      </GradientButton>
                    ) : (
                      <PremiumButton
                        variant={tier.key === 'free' ? 'ghost' : 'primary'}
                        fullWidth
                        onClick={() => handleSelectPlan(tier.key)}
                      >
                        {tier.key === 'free' ? 'Your Plan' : 'Upgrade'}
                      </PremiumButton>
                    )}
                  </motion.div>
                </PremiumCard>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-neutral-900 dark:text-white">
            Detailed Feature Comparison
          </h2>

          <div className="overflow-x-auto">
            <PremiumCard variant="default" className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-white">
                      Feature
                    </th>
                    {tiers.map((tier) => (
                      <th
                        key={tier.key}
                        className="text-center py-3 px-4 font-semibold text-neutral-900 dark:text-white"
                      >
                        {tier.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">
                      AI Generations
                    </td>
                    {tiers.map((tier) => (
                      <td
                        key={`${tier.key}-ai`}
                        className="text-center py-3 px-4 text-neutral-900 dark:text-white font-semibold"
                      >
                        {tier.limits.ai_generations === 999999
                          ? '∞'
                          : tier.limits.ai_generations}
                        /month
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">Bots</td>
                    {tiers.map((tier) => (
                      <td
                        key={`${tier.key}-bots`}
                        className="text-center py-3 px-4 text-neutral-900 dark:text-white font-semibold"
                      >
                        {tier.limits.bots === 9999 ? '∞' : tier.limits.bots}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">
                      Automations
                    </td>
                    {tiers.map((tier) => (
                      <td
                        key={`${tier.key}-automations`}
                        className="text-center py-3 px-4 text-neutral-900 dark:text-white font-semibold"
                      >
                        {tier.limits.automations === 9999
                          ? '∞'
                          : tier.limits.automations}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">
                      Team Members
                    </td>
                    {tiers.map((tier) => (
                      <td
                        key={`${tier.key}-team`}
                        className="text-center py-3 px-4 text-neutral-900 dark:text-white font-semibold"
                      >
                        {tier.limits.team_members === 9999
                          ? '∞'
                          : tier.limits.team_members}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">
                      Storage
                    </td>
                    {tiers.map((tier) => (
                      <td
                        key={`${tier.key}-storage`}
                        className="text-center py-3 px-4 text-neutral-900 dark:text-white font-semibold"
                      >
                        {tier.limits.storage_gb === 10000
                          ? '∞'
                          : `${tier.limits.storage_gb}GB`}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">
                      Marketplace Seller
                    </td>
                    {tiers.map((tier) => (
                      <td
                        key={`${tier.key}-marketplace`}
                        className="text-center py-3 px-4"
                      >
                        {tier.key === 'creator' ||
                        tier.key === 'pro' ||
                        tier.key === 'agency' ||
                        tier.key === 'enterprise' ? (
                          <CheckIcon className="w-5 h-5 text-success-500 mx-auto" />
                        ) : (
                          <span className="text-neutral-400">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </PremiumCard>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold mb-8 text-neutral-900 dark:text-white">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                question: 'Can I change my plan anytime?',
                answer:
                  'Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.',
              },
              {
                question: 'Do you offer refunds?',
                answer:
                  'We offer a 30-day money-back guarantee for all plans. No questions asked.',
              },
              {
                question: 'What payment methods do you accept?',
                answer:
                  'We accept Stripe (credit/debit cards), Solana, and Ethereum for maximum flexibility.',
              },
              {
                question: 'Is there a contract?',
                answer:
                  'No contracts! Monthly and yearly plans are flexible and can be canceled anytime.',
              },
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.05 }}
                className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg"
              >
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">
                  {faq.question}
                </h4>
                <p className="text-neutral-600 dark:text-neutral-400">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-200/30 dark:border-primary-800/30 rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4 text-neutral-900 dark:text-white">
              Ready to Get Started?
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-xl mx-auto">
              Choose a plan above and start creating amazing content with LitLabs today
            </p>
            <GradientButton gradient="brand" size="lg">
              View Plans
            </GradientButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
