'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  themes,
  Theme,
  colorPalettes,
  getThemeCSSVariables,
} from '@/lib/design-system';

interface ThemeContextType {
  currentTheme: Theme;
  themeName: string;
  setTheme: (themeName: string) => void;
  customColors?: Partial<typeof colorPalettes.custom>;
  setCustomColors: (colors: Partial<typeof colorPalettes.custom>) => void;
  isDark: boolean;
  resetToDefault: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_THEME = 'darkLuxury';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<string>(DEFAULT_THEME);
  const [customColors, setCustomColors] = useState<Partial<typeof colorPalettes.custom>>();
  const [mounted, setMounted] = useState(false);

  const currentTheme =
    themeName === 'custom' && customColors
      ? {
          ...themes.custom,
          colors: { ...themes.custom.colors, ...customColors },
        }
      : themes[themeName as keyof typeof themes] || themes[DEFAULT_THEME];

  const isDark = currentTheme.isDark;

  useEffect(() => {
    setMounted(true);

    const savedTheme = localStorage.getItem('litlabs-theme');
    const savedCustomColors = localStorage.getItem('litlabs-custom-colors');

    if (savedTheme && themes[savedTheme as keyof typeof themes]) {
      setThemeName(savedTheme);
    }

    if (savedCustomColors) {
      try {
        setCustomColors(JSON.parse(savedCustomColors));
      } catch (e) {
        console.error('Failed to parse custom colors:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem('litlabs-theme', themeName);

    if (customColors) {
      localStorage.setItem('litlabs-custom-colors', JSON.stringify(customColors));
    }
  }, [themeName, customColors, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const cssVariables = getThemeCSSVariables(currentTheme.colors);

    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [currentTheme, isDark, mounted]);

  const handleSetTheme = (newThemeName: string) => {
    if (themes[newThemeName as keyof typeof themes]) {
      setThemeName(newThemeName);
    }
  };

  const handleSetCustomColors = (colors: Partial<typeof colorPalettes.custom>) => {
    setCustomColors(colors);
    setThemeName('custom');
  };

  const handleResetToDefault = () => {
    setThemeName(DEFAULT_THEME);
    setCustomColors(undefined);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeName,
        setTheme: handleSetTheme,
        customColors,
        setCustomColors: handleSetCustomColors,
        isDark,
        resetToDefault: handleResetToDefault,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
