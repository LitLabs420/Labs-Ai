/**commit
 * Supabase Client Configuration
 * Clean, type-safe Supabase setup
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Server-side client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client-side client (for use in components)
export function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

// Service role client (for admin operations)
export function getServiceRoleClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Type definitions for database tables
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  tier: 'free' | 'starter' | 'creator' | 'pro';
  stripe_customer_id: string | null;
  preferred_ai: 'openai' | 'claude' | 'gemini';
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  content_type: 'caption' | 'script' | 'email' | 'post' | 'blog' | 'ad' | 'custom';
  prompt: string;
  generated_content: string;
  ai_provider: 'openai' | 'claude' | 'gemini';
  model: string;
  tokens_used: number | null;
  is_favorite: boolean;
  tags: string[];
  created_at: string;
}

export interface Template {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  content_type: 'caption' | 'script' | 'email' | 'post' | 'blog' | 'ad' | 'custom';
  prompt_template: string;
  example_output: string | null;
  is_favorite: boolean;
  use_count: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: 'free' | 'starter' | 'creator' | 'pro';
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsageTracking {
  id: string;
  user_id: string;
  month: string; // DATE format
  generation_count: number;
  tokens_used: number;
  created_at: string;
  updated_at: string;
}

export default supabase;
