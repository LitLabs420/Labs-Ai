'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GradientButton, PremiumButton } from '@/components/ui/premium-button';
import { PremiumCard, CardLayout } from '@/components/ui/premium-card';
import { PremiumInput } from '@/components/ui/premium-input';
import { SparklesIcon, CheckIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { toast } from 'sonner';

const CONTENT_TYPES = [
  {
    id: 'caption',
    name: 'Instagram Caption',
    icon: '📸',
    description: 'Viral-worthy captions for Instagram posts',
    example: 'Your caption will appear here with hashtags...',
  },
  {
    id: 'script',
    name: 'Video Script',
    icon: '🎬',
    description: 'Engaging scripts for TikTok, YouTube Shorts',
    example: 'Hook, story, call-to-action...',
  },
  {
    id: 'dm',
    name: 'DM Outreach',
    icon: '💬',
    description: 'Personalized messages for client outreach',
    example: 'Hi [name], here\'s a personalized message...',
  },
  {
    id: 'email',
    name: 'Email Copy',
    icon: '📧',
    description: 'High-converting email sequences',
    example: 'Subject: [Eye-catching subject line]...',
  },
];

const TONES = [
  'Professional',
  'Casual',
  'Funny',
  'Inspirational',
  'Urgent',
  'Romantic',
  'Playful',
  'Educational',
];

export default function AIContentGenerator() {
  const [selectedType, setSelectedType] = useState('caption');
  const [selectedTone, setSelectedTone] = useState('Casual');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [showOutput, setShowOutput] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setGenerating(true);
    setShowOutput(false);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockContent = `✨ Generated ${selectedType} - ${selectedTone} Tone

"${prompt}"

🚀 Here's your ${selectedType}:

This is premium AI-generated content tailored specifically for your needs. The tone is ${selectedTone.toLowerCase()} and it's optimized for maximum engagement.

Add your personal touch and watch the magic happen! 🎉

#ContentCreation #AI #LitLabs`;

      setGeneratedContent(mockContent);
      setShowOutput(true);
      toast.success('Content generated successfully!');
    } catch (error) {
      toast.error('Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Copied to clipboard!');
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedType}-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 dark:from-neutral-950 to-neutral-100 dark:to-neutral-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent">
            AI Content Generator
          </h1>
        </div>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Create engaging content in seconds with AI-powered generation
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Input Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <PremiumCard variant="glass" className="sticky top-6">
            <h2 className="text-2xl font-bold mb-6">Create Content</h2>

            {/* Content Type Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3 text-neutral-700 dark:text-neutral-300">
                Content Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CONTENT_TYPES.map((type) => (
                  <motion.button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-lg font-semibold transition-all ${
                      selectedType === type.id
                        ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-lg'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <span className="text-xl mr-1">{type.icon}</span>
                    <span className="text-xs">{type.name.split(' ')[0]}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Tone Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3 text-neutral-700 dark:text-neutral-300">
                Tone
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((tone) => (
                  <motion.button
                    key={tone}
                    onClick={() => setSelectedTone(tone)}
                    whileHover={{ scale: 1.02 }}
                    className={`p-2 rounded text-sm font-medium transition-all ${
                      selectedTone === tone
                        ? 'bg-primary-500 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {tone}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">
                Your Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to create. Be specific for better results..."
                className="w-full h-32 p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                {prompt.length}/500 characters
              </p>
            </div>

            {/* Generate Button */}
            <GradientButton
              gradient="aurora"
              fullWidth
              onClick={handleGenerate}
              disabled={!prompt.trim() || generating}
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5" />
                  Generate Content
                </span>
              )}
            </GradientButton>
          </PremiumCard>
        </motion.div>

        {/* Output & Features */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Generated Content Output */}
          {showOutput && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="order-first"
            >
              <PremiumCard variant="gradient">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold mb-2">✨ Generated Content</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    {CONTENT_TYPES.find((t) => t.id === selectedType)?.name}
                  </p>
                </div>

                <div className="bg-white dark:bg-neutral-900/50 rounded-lg p-4 mb-4 border border-neutral-200 dark:border-neutral-800">
                  <p className="whitespace-pre-wrap text-neutral-900 dark:text-neutral-100 text-sm">
                    {generatedContent}
                  </p>
                </div>

                <div className="flex gap-2">
                  <PremiumButton variant="primary" onClick={handleCopy} fullWidth>
                    Copy
                  </PremiumButton>
                  <PremiumButton variant="outline" onClick={handleDownload} fullWidth>
                    Download
                  </PremiumButton>
                </div>
              </PremiumCard>
            </motion.div>
          )}

          {/* Features Grid */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-neutral-900 dark:text-white">
              Why Choose LitLabs?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  icon: '⚡',
                  title: 'Lightning Fast',
                  description: 'Get content in seconds, not hours',
                },
                {
                  icon: '🎯',
                  title: 'Targeted Content',
                  description: 'Customized for your specific niche',
                },
                {
                  icon: '📈',
                  title: 'Engagement Optimized',
                  description: 'Built for maximum reach and conversion',
                },
                {
                  icon: '🔄',
                  title: 'Unlimited Variations',
                  description: 'Generate as many variations as you want',
                },
              ].map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                >
                  <PremiumCard variant="hover-lift" className="h-full">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{feature.icon}</div>
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </PremiumCard>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Usage Tips */}
          <PremiumCard variant="neon">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-xl">💡</span>
              Pro Tips
            </h3>
            <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                <span>Be specific in your prompts for better results</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                <span>Mention your target audience in the prompt</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                <span>Include relevant keywords for better SEO</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                <span>Save your best results to create templates</span>
              </li>
            </ul>
          </PremiumCard>
        </motion.div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-16 max-w-4xl mx-auto"
      >
        <div className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-200/30 dark:border-primary-800/30 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-2 text-neutral-900 dark:text-white">
            Ready to Scale Your Content?
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Unlock unlimited generations with a premium plan
          </p>
          <div className="flex justify-center gap-4">
            <GradientButton gradient="brand" size="lg">
              Upgrade Now
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </GradientButton>
            <PremiumButton variant="outline" size="lg">
              View Plans
            </PremiumButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
