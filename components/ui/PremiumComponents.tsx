'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Button Component
 * Multiple variants and sizes for flexible button usage
 */
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  fullWidth?: boolean;
}

const buttonVariants = cva(
  'inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-cyan-500 text-white hover:bg-cyan-600 hover:shadow-lg hover:-translate-y-0.5 active:scale-95',
        secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 hover:shadow-md active:scale-95',
        outline: 'border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 active:scale-95',
        ghost: 'text-cyan-600 hover:bg-cyan-50 active:scale-95',
        danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg active:scale-95',
        success: 'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg active:scale-95',
      },
      size: {
        sm: 'px-3 py-1 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, className = '', loading, fullWidth, children, ...props }, ref) => {
    const baseClasses = buttonVariants({ variant, size });
    return (
      <button
        ref={ref}
        className={`${baseClasses} ${fullWidth ? 'w-full' : ''} ${className}`}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? <span className="animate-spin mr-2">⟳</span> : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

/**
 * Card Component
 * Container for grouping related content
 */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hover, interactive, ...props }, ref) => {
    const hoverClass = hover ? 'hover:shadow-md hover:border-cyan-300 dark:hover:border-cyan-700' : '';
    const interactiveClass = interactive
      ? 'cursor-pointer hover:scale-105 hover:shadow-lg transition-transform duration-300'
      : '';

    return (
      <div
        ref={ref}
        className={`bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 transition-all duration-300 ${hoverClass} ${interactiveClass} ${className}`}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

/**
 * Input Component
 * Form input with optional label and error display
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const errorClass = error ? 'border-red-500 focus:ring-red-500' : '';

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>
        )}
        <input
          ref={ref}
          className={`px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 ${errorClass} ${className}`}
          {...props}
        />
        {error && <span className="text-sm text-red-500">{error}</span>}
        {helperText && !error && <span className="text-sm text-neutral-500">{helperText}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

/**
 * Badge Component
 * Small label for categorization or status
 */
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'cyan';
  size?: 'sm' | 'md';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', className = '', ...props }, ref) => {
    const variants: Record<string, string> = {
      default: 'bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200',
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    };

    const sizes: Record<string, string> = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
    };

    return (
      <span
        ref={ref}
        className={`inline-block rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

/**
 * Progress Component
 * Visual progress indicator
 */
interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, max = 100, variant = 'primary', showLabel, className = '', ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const variantColors: Record<string, string> = {
      primary: 'bg-cyan-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
    };

    return (
      <div ref={ref} className={`w-full ${className}`} {...props}>
        <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${variantColors[variant]} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">{Math.round(percentage)}%</p>}
      </div>
    );
  }
);
Progress.displayName = 'Progress';

/**
 * Skeleton Component
 * Placeholder for loading states with shimmer animation
 */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  height?: string;
  width?: string;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ count = 1, height = '20px', width = '100%', className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"
            style={{ height, width, marginBottom: i < count - 1 ? '8px' : '0' }}
          />
        ))}
      </div>
    );
  }
);
Skeleton.displayName = 'Skeleton';

/**
 * Alert Component
 * Message container for notifications
 */
interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'info', title, className = '', children, ...props }, ref) => {
    const variants: Record<string, { bg: string; border: string; text: string; icon: string }> = {
      info: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-800 dark:text-blue-200',
        icon: 'ℹ️',
      },
      success: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-800 dark:text-green-200',
        icon: '✓',
      },
      warning: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        text: 'text-yellow-800 dark:text-yellow-200',
        icon: '⚠',
      },
      error: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-800 dark:text-red-200',
        icon: '✕',
      },
    };

    const style = variants[variant];

    return (
      <div
        ref={ref}
        className={`${style.bg} border ${style.border} ${style.text} rounded-lg p-4 ${className}`}
        {...props}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">{style.icon}</span>
          <div>
            {title && <p className="font-medium">{title}</p>}
            <p className={title ? 'text-sm mt-1' : ''}>{children}</p>
          </div>
        </div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';

/**
 * Divider Component
 * Visual separator
 */
interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'horizontal' | 'vertical';
}

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ variant = 'horizontal', className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-neutral-200 dark:bg-neutral-700 ${
          variant === 'horizontal' ? 'h-px w-full' : 'w-px h-full'
        } ${className}`}
        {...props}
      />
    );
  }
);
Divider.displayName = 'Divider';

/**
 * Container Component
 * Responsive wrapper with max-width constraints
 */
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = 'lg', className = '', ...props }, ref) => {
    const sizes: Record<string, string> = {
      sm: 'max-w-md',
      md: 'max-w-2xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'max-w-full',
    };

    return (
      <div ref={ref} className={`mx-auto px-4 ${sizes[size]} ${className}`} {...props} />
    );
  }
);
Container.displayName = 'Container';

/**
 * Grid Component
 * Responsive grid layout
 */
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: number;
  gap?: 'sm' | 'md' | 'lg';
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ cols = 3, gap = 'md', className = '', ...props }, ref) => {
    const gaps: Record<string, string> = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    };

    return (
      <div
        ref={ref}
        className={`grid ${gaps[gap]} ${className}`}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        {...props}
      />
    );
  }
);
Grid.displayName = 'Grid';
