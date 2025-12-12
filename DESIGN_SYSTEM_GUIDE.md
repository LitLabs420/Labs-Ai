# Premium Design System Documentation

## Overview

The LitLabs AI Premium Design System is a comprehensive, theme-aware component library built on Next.js, React, and Tailwind CSS. It provides a elegant, luxury-focused aesthetic with full support for multiple customizable theme packs.

## Architecture

### Core Components

#### 1. **Design System Foundation** (`lib/design-system.ts`)
Central repository for all design tokens:
- **6 Complete Theme Palettes**: Dark Luxury, Light Luxury, Modern Tech, Creative, Minimalist, Custom
- **Typography System**: 4 font families (Lora serif, Inter sans, Space Grotesk accent, Fira Code mono)
- **Spacing Scale**: 16 levels (0-96px in 4px increments)
- **Shadow System**: 11 levels plus premium variants
- **Border Radius**: 11 levels from minimal to full circle
- **Animation System**: Duration presets, easing functions, transition presets
- **Component Sizes**: Standardized sizing for buttons, inputs, cards
- **Breakpoints**: 6 responsive breakpoints (xs-2xl)

#### 2. **Theme Context** (`context/ThemeContext.tsx`)
Global state management for themes:
- **Theme Switching**: Change themes in real-time
- **localStorage Persistence**: Theme choice survives page refresh
- **CSS Variable Injection**: Automatic DOM color application
- **Custom Color Overrides**: Users can customize specific colors
- **Dark Mode Support**: Automatic dark class management
- **useTheme() Hook**: Easy theme consumption in components

#### 3. **Theme Switcher** (`components/ThemeSwitcher.tsx`)
UI component for theme selection:
- **Minimal Mode**: Icon-only quick toggle
- **Full Mode**: Dropdown with all themes and previews
- **Visual Previews**: Shows primary, accent, success colors
- **Real-time Switching**: Immediate visual feedback

### Theme Palettes

#### Dark Luxury
Premium dark theme with gold and rose accents.
- **Primary**: Gold (#c9a961)
- **Accent**: Rose (#ff6b9d)
- **Background**: Dark Navy (#0a0e27)
- **Use Case**: Premium, elegant, sophisticated

#### Light Luxury
Warm light theme with brown and rose tones.
- **Primary**: Brown (#92400e)
- **Accent**: Rose (#be185d)
- **Background**: Light Cream (#fafaf9)
- **Use Case**: Elegant, warm, approachable

#### Modern Tech
Contemporary theme with cyan and purple.
- **Primary**: Cyan (#06b6d4)
- **Accent**: Purple (#8b5cf6)
- **Background**: Dark Slate (#0f172a)
- **Use Case**: Tech-focused, modern, vibrant

#### Creative
Bold creative theme with hot pink and yellow.
- **Primary**: Hot Pink (#ff006e)
- **Accent**: Yellow (#ffbe0b)
- **Background**: Dark Purple (#0d0221)
- **Use Case**: Creative, artistic, energetic

#### Minimalist
Clean minimalist with black and gray.
- **Primary**: Black (#000000)
- **Accent**: Gray (#666666)
- **Background**: White (#ffffff)
- **Use Case**: Clean, simple, timeless

#### Custom
User-customizable theme (defaults to blue/purple).
- **Primary**: Blue (#3b82f6)
- **Accent**: Purple (#8b5cf6)
- **Background**: White (#ffffff)
- **Use Case**: User personalization

## Components

### UI Components (`components/ui/`)

#### Button
Premium button component with multiple variants and sizes.
```tsx
<Button
  variant="primary" // primary, secondary, outline, ghost, danger
  size="md" // xs, sm, md, lg, xl
  isLoading={false}
  icon={<SomeIcon />}
  iconPosition="left" // left, right
  fullWidth={false}
>
  Click Me
</Button>
```

#### Card
Versatile content container with multiple styles.
```tsx
<Card
  variant="elevated" // elevated, bordered, flat, glass
  padding="md" // xs, sm, md, lg, xl
  hoverable={true}
  interactive={false}
>
  Card content
</Card>
```

#### Input
Form input with integrated validation and icon support.
```tsx
<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  icon={<MailIcon />}
  size="md" // sm, md, lg
  error="Invalid email"
  hint="We'll never share your email"
/>
```

#### Badge
Highlight small amounts of information.
```tsx
<Badge
  variant="primary" // primary, secondary, success, warning, error, info
  size="md" // sm, md, lg
>
  New Feature
</Badge>
```

#### Modal
Full-screen overlay with centered dialog.
```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirm Action"
  subtitle="Are you sure?"
  maxWidth="md" // sm, md, lg, xl
  closeButton={true}
>
  Modal content
</Modal>
```

### Layout Components (`components/`)

#### Header
Main navigation header with sticky support.
```tsx
<Header
  logo={<Logo />}
  navigation={[
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
  ]}
  actions={<AuthButtons />}
  sticky={true}
/>
```

#### Footer
Multi-section footer with links and social media.
```tsx
<Footer
  logo={<Logo />}
  description="Build amazing content with LitLabs"
  sections={[
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
      ],
    },
  ]}
  social={[
    { label: 'Twitter', href: 'https://twitter.com', icon: <TwitterIcon /> },
  ]}
/>
```

#### Hero
Eye-catching hero section for landing pages.
```tsx
<Hero
  title="Welcome to LitLabs"
  subtitle="Premium Content Creation"
  description="Create amazing content with AI"
  image="/hero-image.jpg"
  imagePosition="right" // left, right, center
  background="gradient" // gradient, solid, glass
  actions={<Button>Get Started</Button>}
/>
```

#### ThemeCustomizationPanel
Allows users to view and customize themes.
```tsx
<ThemeCustomizationPanel />
```

## Usage

### Installation

All components are built into the design system. Simply import and use:

```tsx
import { Button, Card, Input } from '@/components/ui';
import { Header, Footer, Hero } from '@/components';
import { useTheme } from '@/context/ThemeContext';
```

### Theme Integration

Wrap your app in the `ThemeProvider` (already configured in `RootLayoutClient`):

```tsx
import { ThemeProvider } from '@/context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### Using Theme in Components

Access theme values in any component:

```tsx
'use client';

import { useTheme } from '@/context/ThemeContext';

export function MyComponent() {
  const { currentTheme, setTheme, isDark } = useTheme();

  return (
    <div
      style={{
        backgroundColor: currentTheme.colors.background,
        color: currentTheme.colors.text,
      }}
    >
      Current theme: {currentTheme.name}
    </div>
  );
}
```

### CSS Variables

All colors are available as CSS variables:

```css
.element {
  color: var(--color-text);
  background-color: var(--color-surface);
  border-color: var(--color-border);
}
```

Available variables:
- `--color-background`
- `--color-surface`
- `--color-border`
- `--color-text`
- `--color-text-secondary`
- `--color-text-tertiary`
- `--color-primary`, `--color-primary-light`, `--color-primary-dark`
- `--color-accent`, `--color-accent-light`, `--color-accent-dark`
- `--color-success`
- `--color-warning`
- `--color-error`
- `--color-info`

## Customization

### Creating a Custom Component

```tsx
'use client';

import { useTheme } from '@/context/ThemeContext';

export function CustomComponent() {
  const { currentTheme } = useTheme();

  return (
    <div
      style={{
        backgroundColor: currentTheme.colors.background,
        color: currentTheme.colors.text,
      }}
      className="p-6 rounded-lg border border-border shadow-lg"
    >
      Custom content that respects the current theme
    </div>
  );
}
```

### Switching Themes Programmatically

```tsx
'use client';

import { useTheme } from '@/context/ThemeContext';

export function ThemeSwitcher() {
  const { setTheme } = useTheme();

  return (
    <button onClick={() => setTheme('darkLuxury')}>
      Switch to Dark Luxury
    </button>
  );
}
```

## Best Practices

1. **Always use the design system tokens**: Don't hardcode colors, use CSS variables or theme values
2. **Use semantic color names**: Use `primary`, `accent`, `success` instead of hardcoded colors
3. **Respect spacing scale**: Use predefined spacing (0-24) instead of arbitrary padding/margin
4. **Keep components reusable**: Build components that work with all themes
5. **Test with all themes**: Ensure your components look good in all 6 themes
6. **Use the utility functions**: Leverage `getThemeCSSVariables()` and `blendColors()`

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Variables support required
- Dark mode via `prefers-color-scheme` media query

## Performance

- Lightweight: No large dependencies
- CSS Variables: Fast, hardware-accelerated color transitions
- localStorage: Instant theme loading without flash of wrong theme
- Lazy loading: Components code-split automatically

## Future Enhancements

- [ ] Theme export/import functionality
- [ ] Advanced color picker UI
- [ ] Preset color combinations
- [ ] Animation/transition customization
- [ ] Advanced typography customization
- [ ] Component variants editor
- [ ] Storybook documentation
- [ ] Unit tests for all components

## File Structure

```
├── lib/
│   └── design-system.ts          # Design tokens and themes
├── context/
│   └── ThemeContext.tsx          # Theme state management
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   └── Modal.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── ThemeSwitcher.tsx
│   ├── ThemeCustomizationPanel.tsx
│   ├── RootLayoutClient.tsx
│   └── index.ts
├── app/
│   ├── globals.premium.css       # Global styles and fonts
│   └── layout.tsx                # Wrapped with ThemeProvider
└── tailwind.config.premium.ts    # Tailwind configuration
```

## Support

For questions or issues with the design system, please refer to the main project documentation or create an issue in the repository.
