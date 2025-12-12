'use client';

import React, { HTMLAttributes, ReactNode } from 'react';
// import { useTheme } from '@/context/ThemeContext';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'bordered' | 'flat' | 'glass';
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
  interactive?: boolean;
}

const paddingClasses = {
  xs: 'p-3',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
};

/**
 * Premium Card Component
 * Base component for content containers with multiple visual styles
 * Supports elevated, bordered, flat, and glass-morphism variants
 */
export const Card: React.FC<CardProps & { children: ReactNode }> = ({
  variant = 'elevated',
  padding = 'md',
  hoverable = false,
  interactive = false,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'rounded-lg transition-all duration-base';

  const variantClasses = {
    elevated:
      'bg-surface shadow-lg border border-border hover:shadow-premium hover:border-primary',
    bordered: 'bg-surface border-2 border-border hover:border-primary',
    flat: 'bg-surface border-0',
    glass:
      'bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20',
  };

  const hoverClasses = hoverable ? 'hover:shadow-premium hover:-translate-y-1' : '';
  const interactiveClasses = interactive ? 'cursor-pointer active:scale-98' : '';

  const finalClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${hoverClasses}
    ${interactiveClasses}
    ${className}
  `;

  return (
    <div className={finalClasses.trim()} {...props}>
      {children}
    </div>
  );
};

export default Card;
