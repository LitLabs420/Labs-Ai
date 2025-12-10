import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not configured. Database operations will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Database schema for Stripe webhook handlers
 * 
 * Create these tables in Supabase SQL Editor:
 * 
 * CREATE TABLE payments (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   stripe_payment_id TEXT UNIQUE NOT NULL,
 *   user_id TEXT NOT NULL,
 *   amount INT NOT NULL,
 *   currency TEXT NOT NULL,
 *   status TEXT NOT NULL,
 *   metadata JSONB,
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   updated_at TIMESTAMP DEFAULT NOW()
 * );
 * 
 * CREATE TABLE subscriptions (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   stripe_subscription_id TEXT UNIQUE NOT NULL,
 *   user_id TEXT NOT NULL,
 *   stripe_customer_id TEXT NOT NULL,
 *   status TEXT NOT NULL,
 *   current_period_start BIGINT,
 *   current_period_end BIGINT,
 *   cancel_at_period_end BOOLEAN DEFAULT FALSE,
 *   metadata JSONB,
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   updated_at TIMESTAMP DEFAULT NOW()
 * );
 * 
 * CREATE TABLE invoices (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   stripe_invoice_id TEXT UNIQUE NOT NULL,
 *   subscription_id UUID REFERENCES subscriptions(id),
 *   user_id TEXT NOT NULL,
 *   amount INT NOT NULL,
 *   status TEXT NOT NULL,
 *   paid BOOLEAN DEFAULT FALSE,
 *   metadata JSONB,
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   updated_at TIMESTAMP DEFAULT NOW()
 * );
 * 
 * CREATE TABLE payment_failures (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   stripe_payment_id TEXT,
 *   user_id TEXT,
 *   error_message TEXT NOT NULL,
 *   error_code TEXT,
 *   metadata JSONB,
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 * 
 * CREATE TABLE refunds (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   stripe_refund_id TEXT UNIQUE NOT NULL,
 *   payment_id UUID REFERENCES payments(id),
 *   user_id TEXT NOT NULL,
 *   amount INT NOT NULL,
 *   reason TEXT,
 *   status TEXT NOT NULL,
 *   metadata JSONB,
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   updated_at TIMESTAMP DEFAULT NOW()
 * );
 */
