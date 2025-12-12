'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { themes } from '@/lib/design-system';

interface ThemeSwitcherProps {
  minimal?: boolean;
  showDescription?: boolean;
}

export function ThemeSwitcher({ minimal = false, showDescription = true }: ThemeSwitcherProps) {
  const { themeName, setTheme, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeList = Object.entries(themes).map(([key, theme]) => ({
    key,
    ...theme,
  }));

  if (minimal) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(isDark ? 'lightLuxury' : 'darkLuxury')}
          className="p-2 rounded-lg bg-[var(--color-surface-alt)] hover:bg-[var(--color-border)] transition-colors"
          title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[var(--color-surface-alt)] hover:bg-[var(--color-border)] transition-colors"
      >
        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
        <span className="font-medium">{themes[themeName as keyof typeof themes]?.name || 'Theme'}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="grid grid-cols-1 gap-2 p-4">
            {themeList.map((theme) => (
              <button
                key={theme.key}
                onClick={() => {
                  setTheme(theme.key);
                  setIsOpen(false);
                }}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left hover:scale-105 ${
                  themeName === theme.key
                    ? 'border-[var(--color-primary)] bg-[var(--color-surface-alt)]'
                    : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-[var(--color-text)]">{theme.name}</div>
                    {showDescription && (
                      <div className="text-xs text-[var(--color-text-tertiary)] mt-1">{theme.description}</div>
                    )}
                  </div>
                  <div
                    className="w-6 h-6 rounded-full flex-shrink-0 border-2 border-[var(--color-border)]"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                </div>

                {themeName === theme.key && (
                  <div className="mt-2 flex gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.success }} />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface-alt)]">
            <button className="text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors">
              → Customize Theme
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeSwitcher;
