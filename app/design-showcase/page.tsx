'use client';

import React from 'react';
import {
  Button,
  Card,
  Input,
  Badge,
  Progress,
  Skeleton,
  Alert,
  Divider,
  Container,
  Grid,
} from '@/components/ui/PremiumComponents';

export default function DesignShowcase() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-slate-100 py-12">
      <Container size="lg">
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

          {/* Alerts */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400">Alerts</h2>
            <Alert severity="info" title="Information">
              This is an informational alert with helpful context
            </Alert>
            <Alert severity="success" title="Success">
              Operation completed successfully with the new design system
            </Alert>
            <Alert severity="warning" title="Warning">
              Please review your settings before proceeding
            </Alert>
            <Alert severity="error" title="Error">
              An error occurred while processing your request
            </Alert>
          </div>

          <Divider />

          {/* Buttons */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400">Buttons</h2>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="sm">Small Primary</Button>
              <Button variant="primary" size="md">Medium Primary</Button>
              <Button variant="primary" size="lg">Large Primary</Button>
              <Button variant="secondary" size="md">Secondary</Button>
              <Button variant="outline" size="md">Outline</Button>
              <Button variant="ghost" size="md">Ghost</Button>
              <Button variant="success" size="md">Success</Button>
              <Button variant="danger" size="md">Danger</Button>
              <Button variant="primary" size="md" loading>Loading...</Button>
            </div>
          </div>

          <Divider />

          {/* Input Fields */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400">Inputs</h2>
            <Grid cols={{ md: 2 }} gap="md">
              <Input
                label="Email Address"
                placeholder="hello@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                helperText="We'll never share your email"
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                helperText="Minimum 8 characters"
              />
              <Input
                label="Error State"
                placeholder="This has an error"
                error="This field is required"
              />
              <Input
                label="Disabled"
                placeholder="Disabled input"
                disabled
              />
            </Grid>
          </div>

          <Divider />

          {/* Badges */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400">Badges</h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" size="sm">Default</Badge>
              <Badge variant="default">Default</Badge>
              <Badge variant="success" size="sm">Success</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="cyan">Cyan</Badge>
            </div>
          </div>

          <Divider />

          {/* Progress */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400">Progress</h2>
            <Grid cols={{ md: 2 }} gap="lg">
              <Progress percentage={25} variant="primary" label="Loading..." />
              <Progress percentage={50} variant="success" label="Uploading" />
              <Progress percentage={75} variant="warning" label="Processing" />
              <Progress percentage={100} variant="error" label="Complete" />
            </Grid>
          </div>

          <Divider />

          {/* Cards */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400">Cards</h2>
            <Grid cols={{ md: 2, lg: 3 }} gap="lg">
              <Card>
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">Premium Features</h3>
                  <p className="text-sm text-slate-400">
                    Access advanced AI content generation and client management tools
                  </p>
                  <Button variant="primary" size="sm" fullWidth>
                    Learn More
                  </Button>
                </div>
              </Card>
              <Card>
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">24/7 Support</h3>
                  <p className="text-sm text-slate-400">
                    Get instant help from our expert support team anytime
                  </p>
                  <Button variant="secondary" size="sm" fullWidth>
                    Contact Us
                  </Button>
                </div>
              </Card>
              <Card>
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">Global Scale</h3>
                  <p className="text-sm text-slate-400">
                    Deploy to 150+ countries with industry-leading uptime
                  </p>
                  <Button variant="outline" size="sm" fullWidth>
                    View Stats
                  </Button>
                </div>
              </Card>
            </Grid>
          </div>

          <Divider />

          {/* Skeleton Loader */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400">Skeleton Loaders</h2>
            <Grid cols={{ md: 3 }} gap="lg">
              <Card>
                <Skeleton height="h-6" className="mb-3" />
                <Skeleton count={3} />
              </Card>
              <Card>
                <Skeleton height="h-6" className="mb-3" />
                <Skeleton count={3} />
              </Card>
              <Card>
                <Skeleton height="h-6" className="mb-3" />
                <Skeleton count={3} />
              </Card>
            </Grid>
          </div>

          <Divider />

          {/* Grid Layout */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400">Responsive Grids</h2>
            <Grid cols={{ sm: 1, md: 2, lg: 4 }} gap="md">
              {[1, 2, 3, 4].map((num) => (
                <Card key={num} className="aspect-square flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-cyan-400">{num}</p>
                    <p className="text-sm text-slate-400">Grid Item</p>
                  </div>
                </Card>
              ))}
            </Grid>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>
              LitLabs Premium Design System - Crafted with ❤️ for creators and beauty professionals
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}
