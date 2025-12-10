/**
 * Premium Dashboard Layout
 * Modern, polished dashboard design
 */

'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import clsx from 'clsx';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  className,
}: DashboardLayoutProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div
      className={clsx(
        'min-h-screen bg-gradient-to-br from-neutral-50 dark:from-neutral-950 to-neutral-100 dark:to-neutral-900 p-6',
        className
      )}
    >
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        {/* Header */}
        {title && (
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent">
              {title}
            </h1>
            {subtitle && (
              <p className="text-neutral-600 dark:text-neutral-400 mt-2 text-lg">{subtitle}</p>
            )}
          </motion.div>
        )}

        {/* Content Grid */}
        <motion.div variants={itemVariants} className="w-full">
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * Stat card for dashboard
 */
interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ label, value, change, icon, className }: StatCardProps) {
  return (
    <motion.div
      className={clsx(
        'p-6 rounded-xl border border-neutral-200 dark:border-neutral-800',
        'bg-white dark:bg-neutral-900/50 backdrop-blur',
        'hover:shadow-lg transition-all duration-300',
        className
      )}
      whileHover={{ y: -4 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        {icon && <div className="text-3xl opacity-30">{icon}</div>}
      </div>

      {change !== undefined && (
        <div
          className={clsx(
            'text-sm font-semibold mt-4',
            change > 0 ? 'text-green-500' : 'text-red-500'
          )}
        >
          {change > 0 ? '+' : ''}{change}% from last month
        </div>
      )}
    </motion.div>
  );
}

/**
 * Empty state component
 */
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-12 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {icon && <div className="text-6xl mb-4 opacity-50">{icon}</div>}
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      {description && (
        <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-sm">{description}</p>
      )}
      {action && <div>{action}</div>}
    </motion.div>
  );
}

/**
 * Loading skeleton
 */
export function SkeletonCard() {
  return (
    <div className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
      <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3 animate-pulse" />
      <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2 animate-pulse" />
      <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4 animate-pulse" />
    </div>
  );
}
