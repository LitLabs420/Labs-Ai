/**
 * Premium Theme Provider
 * Supports dark/light mode with persistence
 * Global color system
 */

'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

export function PremiumThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="litlabs-theme">
      {children}
    </ThemeProvider>
  );
}
