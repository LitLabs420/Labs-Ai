'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export default function DesignShowcase() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-slate-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="space-y-16">
          {/* Header */}
          <div className="space-y-4 text-center">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Premium Design System
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              LitLabs AI Premium Component Library - Production-ready React components with Tailwind CSS
            </p>
          </div>

          {/* Alerts Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400">Info Messages</h2>
            <Card className="p-4 border-l-4 border-blue-400 bg-blue-500/10">
              <h3 className="font-semibold text-blue-300">Information</h3>
              <p className="text-sm text-slate-300">This is an informational message with helpful context</p>
            </Card>
            <Card className="p-4 border-l-4 border-green-400 bg-green-500/10">
              <h3 className="font-semibold text-green-300">Success</h3>
              <p className="text-sm text-slate-300">Operation completed successfully with the new design system</p>
            </Card>
            <Card className="p-4 border-l-4 border-yellow-400 bg-yellow-500/10">
              <h3 className="font-semibold text-yellow-300">Warning</h3>
              <p className="text-sm text-slate-300">Please review your settings before proceeding</p>
            </Card>
            <Card className="p-4 border-l-4 border-red-400 bg-red-500/10">
              <h3 className="font-semibold text-red-300">Error</h3>
              <p className="text-sm text-slate-300">An error occurred while processing your request</p>
            </Card>
          </div>

          <hr className="border-slate-700" />

          {/* Buttons */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400">Buttons</h2>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700">Primary</Button>
              <Button className="bg-purple-600 hover:bg-purple-700">Secondary</Button>
              <Button className="border border-slate-500 bg-transparent hover:bg-slate-800">Outline</Button>
              <Button className="bg-gray-700 hover:bg-gray-800">Ghost</Button>
              <Button className="bg-green-600 hover:bg-green-700">Success</Button>
              <Button className="bg-red-600 hover:bg-red-700">Danger</Button>
            </div>
          </div>

          <hr className="border-slate-700" />

          {/* Input Fields */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400">Inputs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="hello@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                helperText="Minimum 8 characters"
              />
            </div>
          </div>

          <hr className="border-slate-700" />

          {/* Badges */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400">Badges</h2>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge className="bg-green-600">Success</Badge>
              <Badge className="bg-yellow-600">Warning</Badge>
              <Badge className="bg-red-600">Error</Badge>
              <Badge className="bg-blue-600">Info</Badge>
              <Badge className="bg-cyan-600">Cyan</Badge>
            </div>
          </div>

          <hr className="border-slate-700" />

          {/* Cards Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400">Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">Premium Features</h3>
                  <p className="text-sm text-slate-400">
                    Access advanced AI content generation and client management tools
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
                    Learn More
                  </Button>
                </div>
              </Card>
              <Card className="p-6">
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">24/7 Support</h3>
                  <p className="text-sm text-slate-400">
                    Get instant help from our expert support team anytime
                  </p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-4">
                    Contact Us
                  </Button>
                </div>
              </Card>
              <Card className="p-6">
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">Global Scale</h3>
                  <p className="text-sm text-slate-400">
                    Deploy to 150+ countries with industry-leading uptime
                  </p>
                  <Button className="w-full border border-slate-500 bg-transparent hover:bg-slate-800 mt-4">
                    View Stats
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          <hr className="border-slate-700" />

          {/* Grid Layout */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400">Responsive Grid</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <Card key={num} className="aspect-square flex items-center justify-center p-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-cyan-400">{num}</p>
                    <p className="text-sm text-slate-400">Item</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>
              LitLabs Premium Design System - Production-ready components for your next project
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

