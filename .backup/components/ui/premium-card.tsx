/**
 * Premium Card Component
 * Multiple variants with animations
 */

'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import clsx from 'clsx';

interface PremiumCardProps {
  children: ReactNode;
  variant?: 'default' | 'glass' | 'gradient' | 'neon' | 'hover-lift';
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
}

export function PremiumCard({
  children,
  variant = 'default',
  hoverable = false,
  onClick,
  className,
}: PremiumCardProps) {
  const variants = {
    default: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-md',
    glass: 'bg-white/10 dark:bg-white/5 backdrop-blur-lg border border-white/20 dark:border-white/10 rounded-xl shadow-lg',
    gradient: 'bg-gradient-to-br from-primary-500/10 to-secondary-500/10 dark:from-primary-500/5 dark:to-secondary-500/5 border border-primary-200 dark:border-primary-900 rounded-xl shadow-md',
    neon: 'bg-neutral-950 border border-primary-500/50 rounded-xl shadow-lg shadow-primary-500/20',
    'hover-lift': 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-md transition-all duration-300',
  };

  const baseClass = clsx(
    'p-6 transition-all duration-300',
    variants[variant],
    hoverable && 'cursor-pointer',
    className
  );

  const cardContent = <div className={baseClass}>{children}</div>;

  if (hoverable || variant === 'hover-lift') {
    return (
      <motion.div
        onClick={onClick}
        className={baseClass}
        whileHover={{
          y: -4,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    );
  }

  return cardContent;
}

/**
 * Card with header, body, and footer
 */
interface CardLayoutProps {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  variant?: 'default' | 'glass' | 'gradient' | 'neon';
  hoverable?: boolean;
}

export function CardLayout({
  header,
  children,
  footer,
  variant = 'default',
  hoverable = false,
}: CardLayoutProps) {
  const variants = {
    default: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800',
    glass: 'bg-white/10 dark:bg-white/5 backdrop-blur-lg border border-white/20 dark:border-white/10',
    gradient: 'bg-gradient-to-br from-primary-500/10 to-secondary-500/10 dark:from-primary-500/5 dark:to-secondary-500/5 border border-primary-200 dark:border-primary-900',
    neon: 'bg-neutral-950 border border-primary-500/50 shadow-lg shadow-primary-500/20',
  };

  return (
    <motion.div
      className={clsx(
        'rounded-xl overflow-hidden',
        variants[variant],
        hoverable && 'cursor-pointer'
      )}
      whileHover={hoverable ? { y: -2 } : {}}
    >
      {header && (
        <div className="px-6 py-4 border-b border-current border-opacity-10">
          {header}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-current border-opacity-10 bg-black/5 dark:bg-white/5">
          {footer}
        </div>
      )}
    </motion.div>
  );
}

/**
 * Grid card for dashboard
 */
interface GridCardProps {
  icon?: ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { direction: 'up' | 'down'; value: number };
  onClick?: () => void;
}

export function GridCard({
  icon,
  title,
  value,
  subtitle,
  trend,
  onClick,
}: GridCardProps) {
  return (
    <motion.div
      onClick={onClick}
      className={clsx(
        'p-6 rounded-xl border border-neutral-200 dark:border-neutral-800',
        'bg-white dark:bg-neutral-900',
        'hover:shadow-lg transition-all duration-300',
        onClick && 'cursor-pointer'
      )}
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
          {subtitle && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{subtitle}</p>
          )}
        </div>

        {icon && <div className="text-4xl opacity-20">{icon}</div>}
      </div>

      {trend && (
        <div
          className={clsx(
            'text-sm font-semibold mt-4',
            trend.direction === 'up' ? 'text-green-500' : 'text-red-500'
          )}
        >
          {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
        </div>
      )}
    </motion.div>
  );
}
