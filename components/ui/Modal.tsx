'use client';

import React, { HTMLAttributes, ReactNode, useEffect } from 'react';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  closeButton?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

/**
 * Premium Modal Component
 * Full-screen overlay with centered modal dialog
 * Supports various sizes and styling options
 */
export const Modal: React.FC<ModalProps & { children: ReactNode }> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidth = 'md',
  closeButton = true,
  className = '',
  children,
  ...props
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-base"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className={`
          relative w-full bg-surface border border-border rounded-lg shadow-premium
          max-h-[90vh] overflow-y-auto animate-scale-in
          ${maxWidthClasses[maxWidth]}
          ${className}
        `}
        {...props}
      >
        {/* Header */}
        {(title || closeButton) && (
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              {title && (
                <h2 className="text-2xl font-serif font-bold text-text">{title}</h2>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
              )}
            </div>
            
            {closeButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-border transition-colors duration-base text-text-secondary hover:text-text"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
