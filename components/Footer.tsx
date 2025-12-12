'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';

interface FooterSection {
  title: string;
  links: Array<{
    label: string;
    href: string;
  }>;
}

interface FooterProps {
  logo?: ReactNode;
  description?: string;
  sections?: FooterSection[];
  copyright?: string;
  social?: Array<{
    label: string;
    href: string;
    icon?: ReactNode;
  }>;
}

/**
 * Premium Footer Component
 * Multi-section footer with links, copyright, and social links
 */
export const Footer: React.FC<FooterProps> = ({
  logo,
  description,
  sections = [],
  copyright = `© ${new Date().getFullYear()} LitLabs. All rights reserved.`,
  social = [],
}) => {
  return (
    <footer className="w-full border-t border-border bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Section */}
          {(logo || description) && (
            <div className="md:col-span-3">
              {logo && <div className="mb-4">{logo}</div>}
              {description && (
                <p className="text-sm text-text-secondary">{description}</p>
              )}
            </div>
          )}

          {/* Link Sections */}
          {sections.map((section) => (
            <div key={section.title} className="md:col-span-2">
              <h3 className="text-sm font-semibold text-text mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-primary transition-colors duration-base"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social Links */}
          {social.length > 0 && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-text mb-4">
                Follow Us
              </h3>
              <div className="flex space-x-4">
                {social.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="text-text-secondary hover:text-primary transition-colors duration-base"
                  >
                    {item.icon || item.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-text-secondary">{copyright}</p>
          <div className="mt-4 sm:mt-0 flex space-x-6">
            <Link
              href="/privacy"
              className="text-sm text-text-secondary hover:text-primary transition-colors duration-base"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-text-secondary hover:text-primary transition-colors duration-base"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
