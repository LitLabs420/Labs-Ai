/**
 * 🎨 CREATOR MARKETPLACE - TRILLION WAYS TO GET PAID
 * Users sell AI content, templates, bots, services
 * Multiple revenue streams for maximum earnings
 */

import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';

// ============================================================
// MARKETPLACE ITEM TYPES
// ============================================================

export type MarketplaceItemType =
  | 'ai_template' // Prompts and templates
  | 'image' // AI-generated images
  | 'video' // AI-generated videos
  | 'audio' // Music, voice, sound effects
  | 'bot' // Custom AI bots
  | 'service' // Consulting, custom work
  | 'preset' // Style presets
  | 'bundle' // Multi-item packages
  | 'subscription'; // Recurring access

export type PricingModel =
  | 'one_time' // Single purchase
  | 'subscription' // Monthly/yearly
  | 'pay_what_you_want' // PWYW (min price)
  | 'free' // Free with optional tip
  | 'rental' // Time-limited access
  | 'commission'; // Revenue share

export interface MarketplaceItem {
  id: string;
  creator_id: string;
  type: MarketplaceItemType;
  title: string;
  description: string;
  price: number; // In cents
  pricing_model: PricingModel;
  min_price?: number; // For PWYW
  commission_rate?: number; // For commission-based
  preview_url?: string; // Image/video preview
  file_url?: string; // Download after purchase
  demo_url?: string; // Try before buy
  tags: string[];
  category: string;
  downloads: number;
  revenue: number; // Total earned
  rating: number;
  reviews_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  buyer_id: string;
  seller_id: string;
  item_id: string;
  amount_paid: number;
  seller_earnings: number; // After platform commission
  platform_commission: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'refunded';
  created_at: string;
}

// ============================================================
// REVENUE STREAMS (TRILLION WAYS TO EARN)
// ============================================================

export interface RevenueStream {
  type: 'sale' | 'tip' | 'subscription' | 'commission' | 'referral' | 'ads' | 'premium';
  amount: number;
  source: string;
  timestamp: string;
}

export class MarketplaceEngine {
  private platformCommission = 0.15; // 15% platform fee

  /**
   * List item for sale
   */
  async createListing(item: Omit<MarketplaceItem, 'id' | 'created_at' | 'updated_at'>): Promise<MarketplaceItem> {
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .insert({
          ...item,
          downloads: 0,
          revenue: 0,
          rating: 0,
          reviews_count: 0,
          is_featured: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as MarketplaceItem;
    } catch (err: unknown) {
      await captureError('Failed to create marketplace listing', { error: err });
      throw err;
    }
  }

  /**
   * Process purchase with revenue split
   */
  async processPurchase(
    buyerId: string,
    itemId: string,
    amountPaid: number,
    paymentMethod: string
  ): Promise<Purchase> {
    try {
      // Get item details
      const { data: item } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (!item) throw new Error('Item not found');

      // Calculate earnings split
      const commission = Math.round(amountPaid * this.platformCommission);
      const sellerEarnings = amountPaid - commission;

      // Create purchase record
      const { data: purchase, error } = await supabase
        .from('marketplace_purchases')
        .insert({
          buyer_id: buyerId,
          seller_id: item.creator_id,
          item_id: itemId,
          amount_paid: amountPaid,
          seller_earnings: sellerEarnings,
          platform_commission: commission,
          payment_method: paymentMethod,
          status: 'completed',
        })
        .select()
        .single();

      if (error) throw error;

      // Update item stats
      await supabase
        .from('marketplace_items')
        .update({
          downloads: item.downloads + 1,
          revenue: item.revenue + sellerEarnings,
        })
        .eq('id', itemId);

      // Credit seller earnings
      await this.creditCreatorEarnings(item.creator_id, sellerEarnings, 'sale', itemId);

      return purchase as Purchase;
    } catch (err: unknown) {
      await captureError('Failed to process marketplace purchase', { error: err });
      throw err;
    }
  }

  /**
   * Send tip to creator
   */
  async sendTip(
    senderId: string,
    recipientId: string,
    amount: number,
    message?: string
  ): Promise<void> {
    try {
      const commission = Math.round(amount * 0.05); // 5% on tips
      const creatorAmount = amount - commission;

      await supabase.from('tips').insert({
        sender_id: senderId,
        recipient_id: recipientId,
        amount: amount,
        creator_amount: creatorAmount,
        platform_commission: commission,
        message: message,
      });

      await this.creditCreatorEarnings(recipientId, creatorAmount, 'tip', senderId);
    } catch (err: unknown) {
      await captureError('Failed to send tip', { error: err });
      throw err;
    }
  }

  /**
   * Process referral commission
   */
  async processReferral(
    referrerId: string,
    referredUserId: string,
    subscriptionAmount: number
  ): Promise<void> {
    try {
      const commission = Math.round(subscriptionAmount * 0.3); // 30% referral commission

      await supabase.from('referral_earnings').insert({
        referrer_id: referrerId,
        referred_user_id: referredUserId,
        commission: commission,
        subscription_amount: subscriptionAmount,
      });

      await this.creditCreatorEarnings(referrerId, commission, 'referral', referredUserId);
    } catch (err: unknown) {
      await captureError('Failed to process referral', { error: err });
      throw err;
    }
  }

  /**
   * Credit creator earnings to balance
   */
  private async creditCreatorEarnings(
    creatorId: string,
    amount: number,
    type: RevenueStream['type'],
    source: string
  ): Promise<void> {
    try {
      // Update creator balance
      const { data: creator } = await supabase
        .from('creator_earnings')
        .select('balance, total_earned')
        .eq('user_id', creatorId)
        .maybeSingle();

      const currentBalance = creator?.balance || 0;

      await supabase
        .from('creator_earnings')
        .upsert({
          user_id: creatorId,
          balance: currentBalance + amount,
          total_earned: (creator?.total_earned || 0) + amount,
          updated_at: new Date().toISOString(),
        });

      // Log transaction
      await supabase.from('earnings_transactions').insert({
        user_id: creatorId,
        type: type,
        amount: amount,
        source: source,
        balance_after: currentBalance + amount,
      });
    } catch (err: unknown) {
      await captureError('Failed to credit creator earnings', { error: err });
    }
  }

  /**
   * Get creator earnings breakdown
   */
  async getCreatorEarnings(creatorId: string): Promise<{
    balance: number;
    totalEarned: number;
    breakdown: Record<RevenueStream['type'], number>;
    recent: RevenueStream[];
  }> {
    try {
      const { data: earnings } = await supabase
        .from('creator_earnings')
        .select('*')
        .eq('user_id', creatorId)
        .maybeSingle();

      const { data: transactions } = await supabase
        .from('earnings_transactions')
        .select('*')
        .eq('user_id', creatorId)
        .order('created_at', { ascending: false })
        .limit(50);

      // Calculate breakdown
      const breakdown: Record<RevenueStream['type'], number> = {
        sale: 0,
        tip: 0,
        subscription: 0,
        commission: 0,
        referral: 0,
        ads: 0,
        premium: 0,
      };

      transactions?.forEach((t) => {
        if (breakdown[t.type as RevenueStream['type']] !== undefined) {
          breakdown[t.type as RevenueStream['type']] += t.amount;
        }
      });

      return {
        balance: earnings?.balance || 0,
        totalEarned: earnings?.total_earned || 0,
        breakdown,
        recent: transactions?.map((t) => ({
          type: t.type,
          amount: t.amount,
          source: t.source,
          timestamp: t.created_at,
        })) || [],
      };
    } catch (err: unknown) {
      await captureError('Failed to get creator earnings', { error: err });
      throw err;
    }
  }

  /**
   * Request payout to bank account
   */
  async requestPayout(
    creatorId: string,
    amount: number,
    method: 'bank' | 'paypal' | 'crypto'
  ): Promise<void> {
    try {
      const { data: earnings } = await supabase
        .from('creator_earnings')
        .select('balance')
        .eq('user_id', creatorId)
        .single();

      if (!earnings || earnings.balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Minimum payout $25
      if (amount < 2500) {
        throw new Error('Minimum payout is $25');
      }

      // Create payout request
      await supabase.from('payout_requests').insert({
        user_id: creatorId,
        amount: amount,
        method: method,
        status: 'pending',
      });

      // Deduct from balance
      await supabase
        .from('creator_earnings')
        .update({
          balance: earnings.balance - amount,
        })
        .eq('user_id', creatorId);
    } catch (err: unknown) {
      await captureError('Failed to request payout', { error: err });
      throw err;
    }
  }

  /**
   * Get trending items (explore page)
   */
  async getTrendingItems(limit: number = 20): Promise<MarketplaceItem[]> {
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*, creator:users(id, username, avatar_url)')
        .order('downloads', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as MarketplaceItem[];
    } catch (err: unknown) {
      await captureError('Failed to get trending items', { error: err });
      return [];
    }
  }

  /**
   * Search marketplace
   */
  async searchMarketplace(
    query: string,
    filters?: {
      type?: MarketplaceItemType;
      minPrice?: number;
      maxPrice?: number;
      tags?: string[];
    }
  ): Promise<MarketplaceItem[]> {
    try {
      let queryBuilder = supabase
        .from('marketplace_items')
        .select('*, creator:users(id, username, avatar_url)')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

      if (filters?.type) {
        queryBuilder = queryBuilder.eq('type', filters.type);
      }

      if (filters?.minPrice) {
        queryBuilder = queryBuilder.gte('price', filters.minPrice);
      }

      if (filters?.maxPrice) {
        queryBuilder = queryBuilder.lte('price', filters.maxPrice);
      }

      const { data, error } = await queryBuilder.order('rating', { ascending: false }).limit(50);

      if (error) throw error;
      return data as MarketplaceItem[];
    } catch (err: unknown) {
      await captureError('Failed to search marketplace', { error: err });
      return [];
    }
  }
}

export const marketplace = new MarketplaceEngine();
