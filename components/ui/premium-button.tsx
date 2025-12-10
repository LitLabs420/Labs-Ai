/**
 * Premium Button Component
 * Multiple styles, sizes, states
 */

'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import clsx from 'clsx';

interface PremiumButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function PremiumButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  className,
  type = 'button',
}: PremiumButtonProps) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-lg hover:shadow-xl hover:shadow-primary-500/50',
    secondary:
      'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500 shadow-lg hover:shadow-xl hover:shadow-secondary-500/50',
    outline:
      'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950 focus:ring-primary-500',
    ghost: 'text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-900/30 focus:ring-primary-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-lg hover:shadow-xl hover:shadow-red-500/50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-2',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-3',
    xl: 'px-8 py-4 text-xl gap-4',
  };

  const buttonClass = clsx(
    baseStyles,
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className
  );

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClass}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {loading ? (
        <motion.div
          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, easing: 'linear' }}
        />
      ) : icon ? (
        <>
          {icon}
          {children}
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}

/**
 * Premium button with gradient background
 */
export function GradientButton({
  children,
  onClick,
  gradient = 'brand',
  size = 'md',
  disabled = false,
  loading = false,
  className,
  type = 'button',
}: Omit<PremiumButtonProps, 'variant'> & { gradient?: 'brand' | 'aurora' | 'cyberpunk' }) {
  const gradients = {
    brand: 'from-primary-500 to-secondary-500',
    aurora: 'from-primary-500 via-accent-500 to-secondary-500',
    cyberpunk: 'from-primary-500 via-red-500 to-accent-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        `relative inline-flex items-center justify-center font-semibold rounded-lg text-white
         overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed
         shadow-lg hover:shadow-xl transition-all duration-200`,
        sizes[size],
        className
      )}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradients[gradient]}`} />

      {/* Hover shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity duration-300" />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {loading ? (
          <motion.div
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, easing: 'linear' }}
          />
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
}
