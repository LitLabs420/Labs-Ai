'use client';

import React, { ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface HeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  actions?: ReactNode;
  background?: 'gradient' | 'solid' | 'glass';
  imagePosition?: 'left' | 'right' | 'center';
}

/**
 * Premium Hero Section Component
 * Eye-catching hero section for landing pages and key sections
 */
export const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  description,
  image,
  actions,
  background: _background = 'gradient', // Reserved for future background customization
  imagePosition = 'right',
}) => {
  const { currentTheme } = useTheme();

  const isImageOnRight = imagePosition === 'right';
  const isImageCenter = imagePosition === 'center';

  return (
    <section className={`relative overflow-hidden py-12 md:py-20 lg:py-28`}>
      {/* Background Effects */}
      <div
        className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          backgroundColor: currentTheme.colors.primary,
        }}
      />
      <div
        className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{
          backgroundColor: currentTheme.colors.accent,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`
            grid grid-cols-1 ${!isImageCenter ? 'md:grid-cols-2' : ''} gap-8 lg:gap-12 items-center
          `}
        >
          {/* Content */}
          <div
            className={`
              order-1
              ${isImageOnRight && image ? 'md:order-1' : ''}
              ${isImageOnRight && !image ? 'md:col-span-2' : ''}
            `}
          >
            {subtitle && (
              <div className="inline-block mb-4">
                <span
                  className="inline-block px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${currentTheme.colors.primary}15`,
                    color: currentTheme.colors.primary,
                  }}
                >
                  {subtitle}
                </span>
              </div>
            )}

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-text mb-6 leading-tight">
              {title}
            </h1>

            {description && (
              <p className="text-lg md:text-xl text-text-secondary mb-8 leading-relaxed max-w-xl">
                {description}
              </p>
            )}

            {actions && (
              <div className="flex flex-col sm:flex-row gap-4">
                {actions}
              </div>
            )}
          </div>

          {/* Image */}
          {image && !isImageCenter && (
            <div
              className={`
                order-2 relative
                ${isImageOnRight ? 'md:order-2' : 'md:order-1'}
              `}
            >
              <div className="relative z-10">
                <img
                  src={image}
                  alt="Hero visual"
                  className="w-full h-auto rounded-lg shadow-premium object-cover"
                />
              </div>
              {/* Image Border Glow */}
              <div
                className="absolute inset-0 rounded-lg blur-xl -z-10"
                style={{
                  background: `linear-gradient(135deg, ${currentTheme.colors.primary}40, ${currentTheme.colors.accent}40)`,
                }}
              />
            </div>
          )}
        </div>

        {/* Center Image (optional) */}
        {image && isImageCenter && (
          <div className="mt-12 relative">
            <div className="relative z-10">
              <img
                src={image}
                alt="Hero visual"
                className="w-full h-auto rounded-lg shadow-premium object-cover max-h-96"
              />
            </div>
            <div
              className="absolute inset-0 rounded-lg blur-xl -z-10"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.colors.primary}40, ${currentTheme.colors.accent}40)`,
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
