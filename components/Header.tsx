'use client';

import React, { ReactNode, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';

interface HeaderProps {
  logo?: ReactNode;
  navigation?: Array<{
    label: string;
    href: string;
  }>;
  actions?: ReactNode;
  sticky?: boolean;
}

/**
 * Premium Header Component
 * Main navigation header with logo, nav links, and action area
 */
export const Header: React.FC<HeaderProps> = ({
  logo,
  navigation = [],
  actions,
  sticky = true,
}) => {
  const { currentTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={`
        w-full border-b border-border bg-surface/95 backdrop-blur-sm
        transition-all duration-base
        ${sticky ? 'sticky top-0 z-40' : ''}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          {logo && (
            <div className="flex-shrink-0">
              {logo}
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-md text-sm font-medium text-text-secondary hover:text-text hover:bg-border transition-all duration-base"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {actions}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-border transition-colors duration-base"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-text"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    mobileMenuOpen
                      ? 'M6 18L18 6M6 6l12 12'
                      : 'M4 6h16M4 12h16M4 18h16'
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 rounded-md text-sm font-medium text-text-secondary hover:text-text hover:bg-border transition-all duration-base"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
