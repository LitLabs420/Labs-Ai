#!/usr/bin/env pwsh
# LitLabs AI - Complete Enhancement Implementation Starter
# This script creates the foundation for all enhancements

param(
    [ValidateSet('foundation', 'all', 'layouts', 'components', 'hooks', 'security')]
    [string]$Phase = 'foundation',
    [switch]$DryRun = $false
)

# Configuration
$projectRoot = Get-Location
$componentsDir = "$projectRoot/components"
$libDir = "$projectRoot/lib"
$hooksDir = "$projectRoot/lib/hooks"
$middlewareDir = "$projectRoot/lib/middleware"
$typesDir = "$projectRoot/types"

# Color output
$colors = @{
    Success = 'Green'
    Error   = 'Red'
    Info    = 'Cyan'
    Warning = 'Yellow'
}

function Write-Status {
    param([string]$Message, [string]$Status = 'Info')
    Write-Host "[$Status] $Message" -ForegroundColor $colors[$Status]
}

function Create-Directory {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        if ($DryRun) {
            Write-Status "Would create directory: $Path" 'Info'
        } else {
            New-Item -ItemType Directory -Path $Path -Force | Out-Null
            Write-Status "Created directory: $Path" 'Success'
        }
    }
}

function Create-File {
    param([string]$Path, [string]$Content)
    if (Test-Path $Path) {
        Write-Status "File already exists: $Path" 'Warning'
        return
    }
    
    if ($DryRun) {
        Write-Status "Would create file: $Path" 'Info'
    } else {
        $dir = Split-Path $Path
        Create-Directory $dir
        Set-Content -Path $Path -Value $Content -Force
        Write-Status "Created: $Path" 'Success'
    }
}

# ============================================================================
# PHASE 1: Foundation Setup
# ============================================================================

function Initialize-Foundation {
    Write-Host "`n========== PHASE 1: Foundation Setup ==========" -ForegroundColor Cyan
    
    # Create directory structure
    Create-Directory "$componentsDir/ui/layout"
    Create-Directory "$componentsDir/ui/forms"
    Create-Directory "$componentsDir/ui/data"
    Create-Directory "$componentsDir/ui/navigation"
    Create-Directory "$componentsDir/ui/modal"
    Create-Directory "$hooksDir"
    Create-Directory "$middlewareDir"
    
    Write-Status "Foundation directories created" 'Success'
}

# ============================================================================
# Layout Components
# ============================================================================

function Create-LayoutComponents {
    Write-Host "`n========== Creating Layout Components ==========" -ForegroundColor Cyan
    
    # Sidebar Component
    $sidebarComponent = @'
'use client';

import { ReactNode, useState } from 'react';
import { clsx } from 'clsx';

interface SidebarProps {
  children: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  width?: number;
  collapsible?: boolean;
  variant?: 'light' | 'dark';
}

export function Sidebar({
  children,
  isOpen = true,
  onOpenChange,
  width = 256,
  collapsible = true,
  variant = 'light',
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(!isOpen);

  const handleToggle = () => {
    setCollapsed(!collapsed);
    onOpenChange?.(!collapsed);
  };

  return (
    <div
      className={clsx(
        'transition-all duration-300 ease-in-out',
        variant === 'dark' ? 'bg-slate-900 text-white' : 'bg-white border-r border-slate-200',
        collapsed ? 'w-20' : `w-${width / 4}`
      )}
      style={{ width: collapsed ? 80 : width }}
    >
      {children}
    </div>
  );
}
'@
    Create-File "$componentsDir/ui/layout/Sidebar.tsx" $sidebarComponent
    
    # Container Component
    $containerComponent = @'
'use client';

import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface ContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const sizeMap = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

export function Container({ children, size = 'lg', className = '' }: ContainerProps) {
  return (
    <div className={clsx('mx-auto px-4 sm:px-6 lg:px-8', sizeMap[size], className)}>
      {children}
    </div>
  );
}
'@
    Create-File "$componentsDir/ui/layout/Container.tsx" $containerComponent
    
    # Grid Component
    $gridComponent = @'
'use client';

import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface GridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const colMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  12: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-12',
};

const gapMap = {
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

export function Grid({ children, cols = 3, gap = 'md', className = '' }: GridProps) {
  return (
    <div className={clsx('grid', colMap[cols], gapMap[gap], className)}>
      {children}
    </div>
  );
}
'@
    Create-File "$componentsDir/ui/layout/Grid.tsx" $gridComponent
    
    Write-Status "Layout components created" 'Success'
}

# ============================================================================
# Form Components
# ============================================================================

function Create-FormComponents {
    Write-Host "`n========== Creating Form Components ==========" -ForegroundColor Cyan
    
    # Enhanced Input Component
    $inputComponent = @'
'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const sizeMap = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-4 py-3 text-lg',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, size = 'md', fullWidth = true, className, ...props }, ref) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {label}
            {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={clsx(
              'border rounded-md transition-colors',
              sizeMap[size],
              error
                ? 'border-red-500 focus:border-red-600 focus:ring-red-500'
                : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              fullWidth ? 'w-full' : '',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        {hint && <p className="text-slate-500 text-sm mt-1">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
'@
    Create-File "$componentsDir/ui/forms/Input.tsx" $inputComponent
    
    # Select Component
    $selectComponent = @'
'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, size = 'md', fullWidth = true, className, ...props }, ref) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {label}
            {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={clsx(
            'border rounded-md transition-colors w-full px-4 py-2',
            error
              ? 'border-red-500 focus:border-red-600'
              : 'border-slate-300 focus:border-blue-500',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            className
          )}
          {...props}
        >
          <option value="">Select an option...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
'@
    Create-File "$componentsDir/ui/forms/Select.tsx" $selectComponent
    
    # Checkbox Component
    $checkboxComponent = @'
'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            className={clsx(
              'w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500',
              className
            )}
            {...props}
          />
          {label && <span className="text-sm text-slate-700">{label}</span>}
        </label>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
'@
    Create-File "$componentsDir/ui/forms/Checkbox.tsx" $checkboxComponent
    
    Write-Status "Form components created" 'Success'
}

# ============================================================================
# React Hooks
# ============================================================================

function Create-ReactHooks {
    Write-Host "`n========== Creating React Hooks ==========" -ForegroundColor Cyan
    
    # useAsync Hook
    $useAsyncHook = @'
import { useEffect, useState, useCallback } from 'react';

interface AsyncState<T> {
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: T;
  error?: Error;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
  });

  const execute = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const response = await asyncFunction();
      setState({ status: 'success', data: response });
      return response;
    } catch (error) {
      setState({ status: 'error', error: error as Error });
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return state;
}
'@
    Create-File "$hooksDir/useAsync.ts" $useAsyncHook
    
    # useLocalStorage Hook
    $useLocalStorageHook = @'
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') return initialValue;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      console.error('Error setting local storage');
    }
  };

  return [storedValue, setValue];
}
'@
    Create-File "$hooksDir/useLocalStorage.ts" $useLocalStorageHook
    
    # useWindowSize Hook
    $useWindowSizeHook = @'
import { useState, useEffect } from 'react';

interface WindowSize {
  width?: number;
  height?: number;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({});

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}
'@
    Create-File "$hooksDir/useWindowSize.ts" $useWindowSizeHook
    
    # useDebounce Hook
    $useDebounceHook = @'
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
'@
    Create-File "$hooksDir/useDebounce.ts" $useDebounceHook
    
    # Create hooks index
    $hooksIndex = @'
export { useAsync } from './useAsync';
export { useLocalStorage } from './useLocalStorage';
export { useWindowSize } from './useWindowSize';
export { useDebounce } from './useDebounce';
'@
    Create-File "$hooksDir/index.ts" $hooksIndex
    
    Write-Status "React hooks created" 'Success'
}

# ============================================================================
# Security Middleware
# ============================================================================

function Create-SecurityMiddleware {
    Write-Host "`n========== Creating Security Middleware ==========" -ForegroundColor Cyan
    
    # Auth Middleware
    $authMiddleware = @'
import { NextRequest, NextResponse } from 'next/server';

export function authMiddleware(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}
'@
    Create-File "$middlewareDir/auth.ts" $authMiddleware
    
    # Rate Limit Middleware
    $rateLimitMiddleware = @'
import { NextRequest, NextResponse } from 'next/server';

const ipRequests = new Map<string, { count: number; resetTime: number }>();

export function rateLimitMiddleware(
  request: NextRequest,
  limit = 100,
  window = 60000
) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();

  const record = ipRequests.get(ip);

  if (!record || now > record.resetTime) {
    ipRequests.set(ip, { count: 1, resetTime: now + window });
    return NextResponse.next();
  }

  if (record.count > limit) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  record.count++;
  return NextResponse.next();
}
'@
    Create-File "$middlewareDir/rateLimit.ts" $rateLimitMiddleware
    
    Write-Status "Security middleware created" 'Success'
}

# ============================================================================
# Type Definitions
# ============================================================================

function Create-TypeDefinitions {
    Write-Host "`n========== Creating Type Definitions ==========" -ForegroundColor Cyan
    
    # Component Props Types
    $componentTypes = @'
export interface BaseProps {
  className?: string;
  style?: React.CSSProperties;
}

export interface SizeVariant {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface ColorVariant {
  color?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
}

export interface LoadingState {
  loading?: boolean;
  error?: string | null;
}

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';
'@
    Create-File "$typesDir/components.ts" $componentTypes
    
    Write-Status "Type definitions created" 'Success'
}

# ============================================================================
# Index Files
# ============================================================================

function Create-IndexFiles {
    Write-Host "`n========== Creating Index Files ==========" -ForegroundColor Cyan
    
    # UI Components Index
    $uiIndex = @'
// Layout Components
export { Sidebar } from './layout/Sidebar';
export { Container } from './layout/Container';
export { Grid } from './layout/Grid';

// Form Components
export { Input } from './forms/Input';
export { Select } from './forms/Select';
export { Checkbox } from './forms/Checkbox';

// Existing Components
export { Button } from './Button';
export { Card } from './Card';
export { Modal } from './Modal';
export { Badge } from './Badge';
'@
    Create-File "$componentsDir/ui/index.ts" $uiIndex
    
    Write-Status "Index files created" 'Success'
}

# ============================================================================
# Main Execution
# ============================================================================

function Main {
    Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║     LitLabs AI - Enhancement Implementation Starter     ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
    
    if ($DryRun) {
        Write-Status "Running in DRY-RUN mode (no files created)" 'Warning'
    }
    
    Write-Status "Starting Phase: $Phase" 'Info'
    
    Initialize-Foundation
    
    switch ($Phase) {
        'foundation' {
            Create-LayoutComponents
            Create-FormComponents
            Create-ReactHooks
            Create-SecurityMiddleware
            Create-TypeDefinitions
            Create-IndexFiles
        }
        'all' {
            Create-LayoutComponents
            Create-FormComponents
            Create-ReactHooks
            Create-SecurityMiddleware
            Create-TypeDefinitions
            Create-IndexFiles
        }
        'layouts' { Create-LayoutComponents }
        'components' { Create-FormComponents }
        'hooks' { Create-ReactHooks }
        'security' { Create-SecurityMiddleware }
    }
    
    Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║               Setup Complete! 🎉                        ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
    
    Write-Host "`nNext Steps:`n" -ForegroundColor Cyan
    Write-Host "1. Run: npm run lint:fix" -ForegroundColor White
    Write-Host "2. Run: npm run build" -ForegroundColor White
    Write-Host "3. Import components: import { Container, Grid } from '@/components/ui'" -ForegroundColor White
    Write-Host "4. Review PROJECT_ENHANCEMENT_AUDIT.md for complete roadmap`n" -ForegroundColor White
}

# Execute
Main

