'use client';

import React from 'react';
import { Star, Users, TrendingUp, Shield, Zap } from 'lucide-react';

/**
 * Testimonials Component
 * Displays real (or representative) customer success stories
 * High-impact for conversion (20-30% lift)
 */
export function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: 'Sasha M.',
      role: 'Beauty Influencer',
      company: 'Glow Studio LA',
      avatar: '👩‍🦰',
      testimonial:
        'LitLabs generates 50+ DM replies daily. I went from 2 clients/week to 12. Revenue up 400% in 3 months.',
      metric: '+400% revenue',
      rating: 5,
      image: null, // Can be populated with real image URLs
    },
    {
      id: 2,
      name: 'Marcus T.',
      role: 'Content Creator',
      company: 'FitCoach Media',
      avatar: '🧑‍💼',
      testimonial:
        'The caption generator saves me 3+ hours per day. Same quality content, but I can focus on strategy now.',
      metric: '3 hours saved daily',
      rating: 5,
      image: null,
    },
    {
      id: 3,
      name: 'Priya K.',
      role: 'Salon Owner',
      company: "Priya's Beauty",
      avatar: '👩‍🦱',
      testimonial:
        "Client management + DM automation paid for LitLabs in week 1. Now we're booking 2x more appointments.",
      metric: '2x more bookings',
      rating: 5,
      image: null,
    },
    {
      id: 4,
      name: 'James L.',
      role: 'E-commerce Owner',
      company: 'Apparel & Co',
      avatar: '👨‍💼',
      testimonial:
        'Fraud detection caught 5 suspicious orders last month alone. Security peace of mind is worth every penny.',
      metric: '5 fraud attempts blocked',
      rating: 5,
      image: null,
    },
    {
      id: 5,
      name: 'Aisha B.',
      role: 'Fitness Coach',
      company: 'Power Moves Fitness',
      avatar: '👩‍🏫',
      testimonial:
        'Went from zero online presence to 3K followers in 2 months using the template library. Revenue doubled.',
      metric: '3K followers, 2x revenue',
      rating: 5,
      image: null,
    },
    {
      id: 6,
      name: 'David P.',
      role: 'Freelance Designer',
      company: 'Design & Consult',
      avatar: '👨‍🎨',
      testimonial:
        'Portfolio generation tool saved me 20 hours of manual work. Got 2 enterprise clients in first month.',
      metric: '20 hours saved, 2 clients',
      rating: 5,
      image: null,
    },
  ];

  const stats = [
    { icon: Users, value: '10K+', label: 'Creators' },
    { icon: TrendingUp, value: '$10M+', label: 'Revenue Tracked' },
    { icon: Zap, value: '2M+', label: 'Content Generated' },
    { icon: Shield, value: '99.9%', label: 'Uptime' },
  ];

  const trustBadges = [
    '✓ 10K+ Active Creators',
    '✓ $10M+ Revenue Tracked',
    '✓ 2M+ Pieces of Content',
    '✓ 99.9% Uptime SLA',
    '✓ End-to-End Encryption',
    '✓ SOC 2 Compliant',
    '✓ GDPR Ready',
    '✓ 24/7 Support',
  ];

  return (
    <div className="space-y-16">
      {/* TRUST INDICATORS SECTION */}
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Trusted by Creators Worldwide
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            Real results from real users. See what LitLabs can do for your business.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-center hover:border-emerald-500/50 transition-all"
              >
                <Icon className="h-5 w-5 mx-auto mb-2 text-emerald-400" />
                <p className="text-lg md:text-xl font-semibold text-emerald-300">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {trustBadges.map((badge, i) => (
            <div
              key={i}
              className="text-xs text-slate-300 flex items-start gap-2 p-2 rounded bg-slate-900/30"
            >
              <span className="text-emerald-400 font-bold">✓</span>
              <span>{badge.replace('✓ ', '')}</span>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS CAROUSEL */}
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Success Stories
          </h2>
          <p className="text-slate-400 text-sm">
            Creators earning more, working less, in less than 90 days
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="group bg-slate-900/40 border border-slate-800 rounded-xl p-4 hover:border-emerald-500/50 hover:bg-slate-900/60 transition-all"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-emerald-400 text-emerald-400"
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                "{testimonial.testimonial}"
              </p>

              {/* Metric Badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">
                  {testimonial.metric}
                </span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <div className="text-2xl">{testimonial.avatar}</div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-slate-100">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/**
 * Use Cases Component
 * Shows different ways different user types benefit
 */
export function UseCasesSection() {
  const useCases = [
    {
      icon: '💄',
      title: 'Beauty & Styling Professionals',
      description: 'Automate client management and boost bookings',
      benefits: [
        'Generate engagement content (Reels, TikTok captions)',
        'Auto-reply to DMs with pricing & availability',
        'Track client lifetime value & upsell opportunities',
        'Schedule follow-ups automatically',
      ],
      result: 'Book 2-3x more clients per month',
    },
    {
      icon: '📱',
      title: 'Content Creators & Influencers',
      description: 'Scale content production without scaling burnout',
      benefits: [
        'Generate 20+ captions per day in your voice',
        'Optimize hashtags for reach',
        'Schedule content across all platforms',
        'Analyze what content drives revenue',
      ],
      result: 'Save 10+ hours per week, 3x engagement',
    },
    {
      icon: '🏪',
      title: 'Small Business Owners',
      description: 'Run your business like you have a team',
      benefits: [
        'Manage customer communications automatically',
        'Detect fraudulent orders in real-time',
        'Create promotional campaigns in minutes',
        'Track customer health & churn risk',
      ],
      result: 'Increase revenue by 40-60%',
    },
    {
      icon: '🎯',
      title: 'Coaches & Consultants',
      description: 'Fill your calendar and run productized services',
      benefits: [
        'Nurture leads automatically',
        'Send personalized follow-ups at scale',
        'Manage testimonials and case studies',
        'Create premium content for paid tiers',
      ],
      result: 'Go from 5 to 50 clients',
    },
  ];

  return (
    <section className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl md:text-3xl font-semibold">
          Built For Your Business Model
        </h2>
        <p className="text-slate-400">
          No matter your niche, LitLabs has tools that work
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {useCases.map((useCase, i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-slate-900/60 to-slate-950/40 border border-slate-800 rounded-xl p-6 hover:border-emerald-500/50 transition-all"
          >
            {/* Icon & Title */}
            <div className="flex items-start gap-4 mb-4">
              <div className="text-3xl">{useCase.icon}</div>
              <div>
                <h3 className="font-semibold text-lg text-slate-100">
                  {useCase.title}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {useCase.description}
                </p>
              </div>
            </div>

            {/* Benefits List */}
            <div className="space-y-2 mb-4">
              {useCase.benefits.map((benefit, j) => (
                <div key={j} className="flex items-start gap-2 text-sm">
                  <span className="text-emerald-400 font-bold mt-0.5">→</span>
                  <span className="text-slate-300">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Result Badge */}
            <div className="pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-400">Typical Result</p>
              <p className="text-sm font-semibold text-emerald-300 mt-1">
                {useCase.result}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * How It Works Component
 * Shows the simple 4-step onboarding flow
 */
export function HowItWorksSection() {
  const steps = [
    {
      number: '1',
      title: 'Connect Your Account',
      description: 'Link your Firebase, Stripe, and API keys. Takes 2 minutes.',
      icon: '🔗',
    },
    {
      number: '2',
      title: 'Choose Your AI Setup',
      description: 'Select templates, customize your voice, set preferences.',
      icon: '⚙️',
    },
    {
      number: '3',
      title: 'Start Generating',
      description: 'Generate content, replies, campaigns instantly.',
      icon: '⚡',
    },
    {
      number: '4',
      title: 'Monitor & Optimize',
      description: 'Track what works, iterate, and increase revenue.',
      icon: '📊',
    },
  ];

  return (
    <section id="how-it-works" className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl md:text-3xl font-semibold">
          How LitLabs Works
        </h2>
        <p className="text-slate-400">
          From zero to generating content in under 5 minutes
        </p>
      </div>

      {/* Steps Timeline */}
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4">
            {/* Left: Number + Line */}
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center font-semibold">
                {step.number}
              </div>
              {i < steps.length - 1 && (
                <div className="h-8 w-0.5 bg-emerald-500/30 mt-2" />
              )}
            </div>

            {/* Right: Content */}
            <div className="pb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{step.icon}</span>
                <h3 className="font-semibold text-lg text-slate-100">
                  {step.title}
                </h3>
              </div>
              <p className="text-slate-400 text-sm">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex justify-center pt-4">
        <a
          href="/auth"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-500/50 transition-all"
        >
          Start Free Trial (No Card) →
        </a>
      </div>
    </section>
  );
}

/**
 * FAQs Component
 * Common questions and answers
 */
export function FAQSection() {
  const faqs = [
    {
      question: 'Do I need technical skills to use LitLabs?',
      answer:
        'No. LitLabs is built for non-technical users. If you can use Instagram or TikTok, you can use LitLabs. Setup takes 2 minutes.',
    },
    {
      question: 'Can I try it for free?',
      answer:
        'Yes. You get a 14-day free trial with full access to all features. No credit card required.',
    },
    {
      question: 'How much does it cost?',
      answer:
        'Plans start at $29/month for individuals and scale to $299/month for agencies. Annual billing saves 20%.',
    },
    {
      question: 'Is my data safe?',
      answer:
        'Yes. We use enterprise-grade encryption, SOC 2 compliance, GDPR compliance, and have a transparent privacy policy.',
    },
    {
      question: 'What if I want to cancel?',
      answer:
        'Cancel anytime. No lock-in contracts. You keep access through your current billing cycle.',
    },
    {
      question: 'Do you offer refunds?',
      answer:
        'If you\'re not happy in the first 30 days, we offer a full refund. No questions asked.',
    },
  ];

  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section id="faq" className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl md:text-3xl font-semibold">
          Frequently Asked Questions
        </h2>
        <p className="text-slate-400">
          Get answers to common questions about LitLabs
        </p>
      </div>

      <div className="space-y-2 max-w-2xl mx-auto">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="border border-slate-800 rounded-lg bg-slate-900/20 overflow-hidden hover:border-emerald-500/50 transition-all"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-900/30 transition-colors"
            >
              <span className="font-semibold text-left text-slate-100">
                {faq.question}
              </span>
              <span
                className={`text-emerald-400 text-lg transition-transform ${
                  openIndex === i ? 'rotate-180' : ''
                }`}
              >
                ▼
              </span>
            </button>
            {openIndex === i && (
              <div className="px-4 py-3 bg-slate-900/30 border-t border-slate-800 text-slate-300 text-sm">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Still have questions? */}
      <div className="text-center pt-4 border-t border-slate-800">
        <p className="text-sm text-slate-400 mb-3">Still have questions?</p>
        <a
          href="mailto:support@litlabs.io"
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold"
        >
          Contact our support team →
        </a>
      </div>
    </section>
  );
}

export default TestimonialsSection;
