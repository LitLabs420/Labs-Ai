# 🎨 Premium Components Quick Reference

Copy-paste ready examples for every component.

---

## Button Components

### Primary Button
```tsx
import { PremiumButton } from '@/components/ui/premium-button';

<PremiumButton variant="primary" size="md">
  Submit
</PremiumButton>
```

### Secondary Button
```tsx
<PremiumButton variant="secondary" size="md">
  Cancel
</PremiumButton>
```

### Outline Button
```tsx
<PremiumButton variant="outline" size="md">
  Learn More
</PremiumButton>
```

### Ghost Button
```tsx
<PremiumButton variant="ghost" size="md">
  Skip
</PremiumButton>
```

### Danger Button
```tsx
<PremiumButton variant="danger" size="md">
  Delete
</PremiumButton>
```

### Loading Button
```tsx
<PremiumButton loading>
  Processing...
</PremiumButton>
```

### Disabled Button
```tsx
<PremiumButton disabled>
  Unavailable
</PremiumButton>
```

### Icon Button
```tsx
<PremiumButton 
  variant="ghost" 
  icon={<SearchIcon />}
  size="sm"
/>
```

### Full Width Button
```tsx
<PremiumButton fullWidth>
  Sign In
</PremiumButton>
```

### Gradient Buttons

**Aurora Gradient**
```tsx
import { GradientButton } from '@/components/ui/premium-button';

<GradientButton gradient="aurora">
  Aurora Magic
</GradientButton>
```

**Cyberpunk Gradient**
```tsx
<GradientButton gradient="cyberpunk">
  Cyberpunk Energy
</GradientButton>
```

**Sunset Gradient**
```tsx
<GradientButton gradient="sunset">
  Warm & Golden
</GradientButton>
```

---

## Card Components

### Default Card
```tsx
import { PremiumCard } from '@/components/ui/premium-card';

<PremiumCard variant="default">
  <h3>Card Title</h3>
  <p>Your content here</p>
</PremiumCard>
```

### Glass Card
```tsx
<PremiumCard variant="glass">
  <h3>Frosted Glass</h3>
  <p>Modern aesthetic</p>
</PremiumCard>
```

### Gradient Card
```tsx
<PremiumCard variant="gradient">
  <h3>Colorful Card</h3>
  <p>Eye-catching design</p>
</PremiumCard>
```

### Neon Card
```tsx
<PremiumCard variant="neon">
  <h3>Cyberpunk Style</h3>
  <p>Electric vibes</p>
</PremiumCard>
```

### Hover Lift Card
```tsx
<PremiumCard variant="hover-lift">
  <h3>Interactive</h3>
  <p>Lifts on hover</p>
</PremiumCard>
```

### Card with Header & Footer

```tsx
import { CardLayout } from '@/components/ui/premium-card';

<CardLayout
  variant="default"
  header={
    <div className="flex justify-between items-center">
      <h3>Title</h3>
      <button>×</button>
    </div>
  }
  footer={
    <div className="flex gap-2">
      <button className="px-4 py-2">Cancel</button>
      <button className="px-4 py-2 bg-primary-500 text-white rounded">
        Save
      </button>
    </div>
  }
>
  Main content goes here
</CardLayout>
```

### Grid Cards (Dashboard Stats)

```tsx
import { GridCard } from '@/components/ui/premium-card';

<GridCard
  title="Total Revenue"
  value="$12,345"
  trend={{ direction: 'up', value: 12 }}
  icon="💰"
/>

<GridCard
  title="User Count"
  value="2,341"
  trend={{ direction: 'up', value: 8 }}
  icon="👥"
/>

<GridCard
  title="Conversion"
  value="3.24%"
  trend={{ direction: 'down', value: -2 }}
  icon="🎯"
/>
```

### Empty State

```tsx
import { EmptyState } from '@/components/ui/premium-card';

<EmptyState
  title="No data yet"
  description="Create something amazing to get started"
/>
```

### Skeleton Loader

```tsx
import { SkeletonCard } from '@/components/ui/premium-card';

{loading ? <SkeletonCard /> : <PremiumCard>{content}</PremiumCard>}
```

---

## Input Components

### Basic Input
```tsx
import { PremiumInput } from '@/components/ui/premium-input';

<PremiumInput
  label="Email"
  placeholder="you@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### Input with Icon
```tsx
import { EnvelopeIcon } from '@heroicons/react/24/solid';

<PremiumInput
  label="Email"
  placeholder="you@example.com"
  icon={<EnvelopeIcon />}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### Input with Error
```tsx
<PremiumInput
  label="Password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  error={passwordError}
/>
```

### Disabled Input
```tsx
<PremiumInput
  label="API Key"
  disabled
  value="sk_test_..."
/>
```

### Different Types

```tsx
{/* Email */}
<PremiumInput type="email" placeholder="email@example.com" />

{/* Password */}
<PremiumInput type="password" placeholder="••••••" />

{/* Number */}
<PremiumInput type="number" placeholder="0" />

{/* URL */}
<PremiumInput type="url" placeholder="https://..." />

{/* Date */}
<PremiumInput type="date" />

{/* Textarea */}
<textarea className="w-full border border-neutral-300 dark:border-neutral-700 rounded-lg p-3">
  Long form content
</textarea>
```

---

## Layout Patterns

### Two Column Layout
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div>Left Column</div>
  <div>Right Column</div>
</div>
```

### Three Column Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
```

### Full Width with Sidebar
```tsx
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  <aside className="lg:col-span-1">Sidebar</aside>
  <main className="lg:col-span-3">Main Content</main>
</div>
```

### Centered Container
```tsx
<div className="max-w-6xl mx-auto px-4">
  Centered content
</div>
```

---

## Color Classes

### Primary Colors
```tsx
className="bg-primary-500"  // Button
className="text-primary-600"  // Text
className="border-primary-200"  // Border
className="from-primary-500 to-primary-600"  // Gradient
```

### Secondary Colors
```tsx
className="bg-secondary-500"
className="text-secondary-600"
className="border-secondary-200"
```

### Accent Colors
```tsx
className="bg-accent-500"
className="text-accent-600"
```

### Success
```tsx
className="bg-success-500"
className="text-success-600"
```

### Warning
```tsx
className="bg-warning-500"
className="text-warning-600"
```

### Error
```tsx
className="bg-error-500"
className="text-error-600"
```

### Neutral
```tsx
className="bg-neutral-900 dark:bg-neutral-900"
className="text-neutral-600 dark:text-neutral-400"
className="border-neutral-200 dark:border-neutral-800"
```

---

## Text Styles

### Headings
```tsx
<h1 className="text-5xl font-bold">H1 - Main Title</h1>
<h2 className="text-4xl font-bold">H2 - Section Title</h2>
<h3 className="text-3xl font-bold">H3 - Subsection</h3>
<h4 className="text-2xl font-bold">H4 - Small Title</h4>
<h5 className="text-xl font-semibold">H5</h5>
<h6 className="text-lg font-semibold">H6</h6>
```

### Body Text
```tsx
<p className="text-base text-neutral-700 dark:text-neutral-300">
  Regular paragraph text
</p>
```

### Small Text
```tsx
<p className="text-sm text-neutral-600 dark:text-neutral-400">
  Small supporting text
</p>
```

### Gradient Text
```tsx
<h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
  Gradient Title
</h1>
```

---

## Effects & Shadows

### Standard Shadow
```tsx
className="shadow-lg"  // Large shadow
className="shadow-md"  // Medium shadow
className="shadow-sm"  // Small shadow
```

### Glow Effect
```tsx
className="shadow-[0_0_20px_rgba(85,102,255,0.4)]"
```

### Neon Glow
```tsx
className="border border-primary-500/50 shadow-[0_0_10px_rgba(85,102,255,0.8)]"
```

### Ring Effect
```tsx
className="ring-2 ring-primary-500/20"
```

---

## Animations

### Fade
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Fades in
</motion.div>
```

### Slide Up
```tsx
<motion.div
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
>
  Slides up
</motion.div>
```

### Scale
```tsx
<motion.div
  initial={{ scale: 0.9 }}
  animate={{ scale: 1 }}
  whileHover={{ scale: 1.05 }}
>
  Scales on hover
</motion.div>
```

### Button Interaction
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Interactive
</motion.button>
```

---

## Form Patterns

### Login Form
```tsx
<div className="max-w-md mx-auto">
  <h1 className="text-3xl font-bold mb-6">Sign In</h1>
  <div className="space-y-4">
    <PremiumInput
      label="Email"
      type="email"
      placeholder="you@example.com"
    />
    <PremiumInput
      label="Password"
      type="password"
      placeholder="••••••"
    />
    <GradientButton fullWidth>
      Sign In
    </GradientButton>
  </div>
</div>
```

### Registration Form
```tsx
<div className="max-w-md mx-auto">
  <h1 className="text-3xl font-bold mb-6">Create Account</h1>
  <div className="space-y-4">
    <PremiumInput label="Name" placeholder="Your name" />
    <PremiumInput label="Email" type="email" />
    <PremiumInput label="Password" type="password" />
    <PremiumInput label="Confirm Password" type="password" />
    <GradientButton fullWidth>
      Create Account
    </GradientButton>
  </div>
</div>
```

### Contact Form
```tsx
<PremiumCard variant="glass" className="max-w-2xl mx-auto">
  <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
  <div className="space-y-4">
    <PremiumInput label="Name" />
    <PremiumInput label="Email" type="email" />
    <textarea className="w-full border border-neutral-300 dark:border-neutral-700 rounded-lg p-3 h-32">
      Your message
    </textarea>
    <PremiumButton fullWidth>
      Send Message
    </PremiumButton>
  </div>
</PremiumCard>
```

---

## Toast Notifications

```tsx
import { toast } from 'sonner';

// Success
toast.success('Saved successfully!');

// Error
toast.error('Something went wrong');

// Loading
toast.loading('Processing...');

// Info
toast.info('New update available');

// Custom
toast.custom((t) => (
  <div>Custom notification</div>
));
```

---

## Dark Mode Example

```tsx
<div className="bg-white dark:bg-neutral-900 text-black dark:text-white p-6 rounded-lg">
  Works in both light and dark modes!
</div>
```

---

## Common Component Combinations

### Stat Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <GridCard title="Revenue" value="$12K" icon="💰" />
  <GridCard title="Users" value="2.3K" icon="👥" />
  <GridCard title="Growth" value="24%" icon="📈" />
  <GridCard title="Conversion" value="3.2%" icon="🎯" />
</div>
```

### Hero Section
```tsx
<div className="min-h-screen bg-gradient-to-br from-primary-500/10 to-secondary-500/10 flex items-center justify-center">
  <div className="text-center">
    <h1 className="text-6xl font-bold mb-4">
      Welcome to LitLabs
    </h1>
    <p className="text-xl text-neutral-600 mb-8">
      Create amazing content effortlessly
    </p>
    <GradientButton size="lg">
      Get Started
    </GradientButton>
  </div>
</div>
```

### Feature Cards
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {['Feature 1', 'Feature 2', 'Feature 3'].map((feature) => (
    <PremiumCard key={feature} variant="hover-lift">
      <h3 className="text-xl font-bold mb-2">{feature}</h3>
      <p>Description of {feature}</p>
    </PremiumCard>
  ))}
</div>
```

---

**Save this file and refer back when building components!** 🎨
