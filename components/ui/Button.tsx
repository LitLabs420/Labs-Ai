'use client';

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const sizeClasses = {
  xs: 'px-3 py-1.5 text-xs rounded-sm',
  sm: 'px-4 py-2 text-sm rounded-base',
  md: 'px-6 py-2.5 text-base rounded-md',
  lg: 'px-8 py-3 text-lg rounded-lg',
  xl: 'px-10 py-4 text-xl rounded-lg',
};

/**
 * Premium Button Component
 * Supports multiple variants and sizes with premium styling
 * Integrates with theme system for automatic color application
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const { currentTheme } = useTheme();

  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-base font-accent';

  const variantClasses = {
    primary: 'bg-primary text-background hover:bg-primary-light hover:shadow-lg active:scale-95 disabled:opacity-50',
    secondary:
      'bg-surface border border-primary text-primary hover:bg-primary hover:text-background hover:shadow-lg active:scale-95',
    outline:
      'border-2 border-primary text-primary hover:bg-primary hover:text-background active:scale-95',
    ghost:
      'text-primary hover:bg-primary hover:text-background active:scale-95 hover:shadow-md',
    danger:
      'bg-error text-white hover:bg-red-600 hover:shadow-lg active:scale-95 disabled:opacity-50',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const finalClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${widthClass}
    ${disabled ? 'cursor-not-allowed opacity-50' : ''}
    ${className}
  `;

  return (
    <button
      className={finalClasses.trim()}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
