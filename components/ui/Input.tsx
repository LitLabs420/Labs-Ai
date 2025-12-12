'use client';

import React, { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm rounded-base',
  md: 'px-4 py-2.5 text-base rounded-md',
  lg: 'px-5 py-3 text-lg rounded-lg',
};

/**
 * Premium Input Component
 * Form input with optional label, error message, hint, and icon support
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  icon,
  iconPosition = 'left',
  size = 'md',
  className = '',
  id,
  ...props
}) => {
  const wrapperClass = 'w-full';
  
  const inputBaseClass =
    'w-full bg-surface border border-border text-text placeholder-text-tertiary transition-all duration-base';

  const inputStateClass = error
    ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
    : 'focus:border-primary focus:ring-2 focus:ring-primary/20';

  const inputFinalClass = `
    ${inputBaseClass}
    ${sizeClasses[size]}
    ${inputStateClass}
    ${icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : ''}
    ${className}
  `;

  const inputId = id || `input-${Math.random()}`;

  return (
    <div className={wrapperClass}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={inputId}
          className={inputFinalClass.trim()}
          {...props}
        />
        
        {icon && (
          <span
            className={`absolute top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none ${
              iconPosition === 'left' ? 'left-3' : 'right-3'
            }`}
          >
            {icon}
          </span>
        )}
      </div>

      {hint && !error && (
        <p className="mt-1 text-xs text-text-tertiary">{hint}</p>
      )}

      {error && (
        <p className="mt-1 text-xs text-error font-medium">{error}</p>
      )}
    </div>
  );
};

export default Input;
