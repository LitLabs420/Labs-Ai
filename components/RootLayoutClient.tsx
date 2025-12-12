'use client';

import React, { ReactNode } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';

interface RootLayoutClientProps {
  children: ReactNode;
}

/**
 * Root Layout Client Wrapper
 * Wraps the entire application with the ThemeProvider to enable theming
 * Must be used in a 'use client' component since ThemeProvider uses React Context
 */
export function RootLayoutClient({ children }: RootLayoutClientProps) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}

export default RootLayoutClient;
