/**
 * Premium Input Component
 * Beautiful text input with animations
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface PremiumInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function PremiumInput({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  icon,
  className,
}: PremiumInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400">
            {icon}
          </div>
        )}

        <motion.input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={clsx(
            'w-full px-4 py-3 rounded-lg',
            'bg-white dark:bg-neutral-900',
            'border-2 transition-all duration-200',
            error
              ? 'border-red-500 focus:ring-2 focus:ring-red-500/50'
              : focused
                ? 'border-primary-500 focus:ring-2 focus:ring-primary-500/50'
                : 'border-neutral-200 dark:border-neutral-800',
            icon && 'pl-10'
          )}
          animate={{
            boxShadow: focused
              ? '0 0 0 3px rgba(85, 102, 255, 0.1)'
              : '0 0 0 0px rgba(85, 102, 255, 0)',
          }}
        />
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 mt-2"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
