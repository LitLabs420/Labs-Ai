'use client';

import React, { HTMLAttributes, ReactNode } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses = {
  primary: 'bg-primary/10 text-primary border border-primary/20',
  secondary: 'bg-accent/10 text-accent border border-accent/20',
  success: 'bg-success/10 text-success border border-success/20',
  warning: 'bg-warning/10 text-warning border border-warning/20',
  error: 'bg-error/10 text-error border border-error/20',
  info: 'bg-info/10 text-info border border-info/20',
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs rounded-sm font-medium',
  md: 'px-3 py-1.5 text-sm rounded-base font-medium',
  lg: 'px-4 py-2 text-base rounded-md font-semibold',
};

/**
 * Premium Badge Component
 * Used to highlight small amounts of information
 */
export const Badge: React.FC<BadgeProps & { children: ReactNode }> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const finalClasses = `
    inline-flex items-center justify-center transition-colors duration-base
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `;

  return (
    <span className={finalClasses.trim()} {...props}>
      {children}
    </span>
  );
};

export default Badge;
