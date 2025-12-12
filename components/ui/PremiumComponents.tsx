'use client';

import React, { ReactNode, ForwardedRef } from 'react';

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, loading = false, className = '', children, ...props }: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
    const baseClasses =
      'inline-flex items-center justify-center font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
      primary:
        'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg hover:-translate-y-0.5',
      secondary: 'bg-surface border border-border text-text hover:bg-surface-alt hover:border-primary-500',
      outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950',
      ghost: 'text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950',
      danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg',
      success: 'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-base rounded-lg',
      lg: 'px-6 py-3 text-lg rounded-xl',
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <>
            <span className="inline-block animate-spin-slow mr-2">⌛</span>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

// Card Component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, hover = false, interactive = false, className = '', ...props }: CardProps, ref: ForwardedRef<HTMLDivElement>) => {
    const hoverClass = hover || interactive ? 'hover:border-primary-500 hover:shadow-lg' : '';
    const interactiveClass = interactive ? 'cursor-pointer active:scale-95' : '';

    return (
      <div
        ref={ref}
        className={`bg-surface border border-border rounded-lg transition-all duration-300 ${hoverClass} ${interactiveClass} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }: InputProps, ref: ForwardedRef<HTMLInputElement>) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text mb-2">
            {label}
            {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2 bg-surface border border-border rounded-lg text-text placeholder-text-tertiary transition-all duration-300 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${
            error ? 'border-red-500 focus:ring-red-500/20' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        {helperText && !error && <p className="text-text-tertiary text-sm mt-1">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// Badge Component
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  children?: ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'primary', size = 'sm', className = '', children, ...props }: BadgeProps, ref: ForwardedRef<HTMLSpanElement>) => {
    const variantClasses = {
      primary: 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300',
      secondary: 'bg-surface-alt text-text dark:bg-surface dark:text-text-secondary',
      success: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
      warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
      error: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
      info: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    };

    const sizeClasses = {
      sm: 'text-xs px-2 py-1 rounded',
      md: 'text-sm px-3 py-1.5 rounded-md',
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

// Progress Bar Component
interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, max = 100, variant = 'primary', showLabel = false, className = '', ...props }: ProgressProps, ref: ForwardedRef<HTMLDivElement>) => {
    const percentage = (value / max) * 100;

    const variantClasses = {
      primary: 'bg-primary-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
    };

    return (
      <div ref={ref} className={`w-full ${className}`} {...props}>
        <div className="w-full h-2 bg-surface-alt rounded-full overflow-hidden">
          <div
            className={`h-full ${variantClasses[variant]} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && <p className="text-sm text-text-tertiary mt-1">{percentage.toFixed(0)}%</p>}
      </div>
    );
  }
);
Progress.displayName = 'Progress';

// Skeleton Loader Component
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  height?: string | number;
  width?: string | number;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ count = 1, height = '20px', width = '100%', className = '' }: SkeletonProps, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <div ref={ref}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`animate-shimmer bg-gradient-to-r from-surface to-surface-alt rounded ${className}`}
            style={{
              height: typeof height === 'number' ? `${height}px` : height,
              width: typeof width === 'number' ? `${width}px` : width,
            }}
          />
        ))}
      </div>
    );
  }
);
Skeleton.displayName = 'Skeleton';

// Alert Component
interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children?: ReactNode;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'info', title, className = '', children, ...props }: AlertProps, ref: ForwardedRef<HTMLDivElement>) => {
    const variantClasses = {
      info: 'bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200',
      success:
        'bg-green-50 border border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200',
      warning:
        'bg-yellow-50 border border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200',
      error: 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200',
    };

    return (
      <div ref={ref} className={`rounded-lg p-4 ${variantClasses[variant]} ${className}`} {...props}>
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div className="text-sm">{children}</div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';

// Divider Component
export const Divider = React.forwardRef<HTMLHRElement, React.HTMLAttributes<HTMLHRElement>>(
  ({ className = '', ...props }: React.HTMLAttributes<HTMLHRElement>, ref: ForwardedRef<HTMLHRElement>) => (
    <hr ref={ref} className={`border-t border-border my-6 ${className}`} {...props} />
  )
);
Divider.displayName = 'Divider';

// Container Component
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, size = 'lg', className = '', ...props }: ContainerProps, ref: ForwardedRef<HTMLDivElement>) => {
    const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-2xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'w-full',
    };

    return (
      <div ref={ref} className={`mx-auto px-4 ${sizeClasses[size]} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);
Container.displayName = 'Container';

// Grid Component
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ children, cols = 1, gap = 'md', className = '', ...props }: GridProps, ref: ForwardedRef<HTMLDivElement>) => {
    const colClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    };

    const gapClasses = {
      xs: 'gap-2',
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-12',
    };

    return (
      <div ref={ref} className={`grid ${colClasses[cols]} ${gapClasses[gap]} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);
Grid.displayName = 'Grid';
