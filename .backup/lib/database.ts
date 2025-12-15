/**
 * LitLabs OS Database Client
 * Type-safe Supabase client for all schema tables
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  theme_id: string | null;
  premium_tier: 'free' | 'starter' | 'creator' | 'pro' | 'agency';
  created_at: string;
  updated_at: string;
}

export interface AIMemory {
  id: string;
  user_id: string;
  agent: string;
  content: string;
  embedding: number[];
  importance: number;
  memory_type: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Bot {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  personality: string | null;
  engine: 'openai' | 'google' | 'claude' | 'hybrid';
  avatar_url: string | null;
  visibility: 'private' | 'shared' | 'public';
  training_data_embedded: boolean;
  created_at: string;
  updated_at: string;
}

export interface Automation {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: 'active' | 'paused' | 'archived';
  trigger_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserWidget {
  id: string;
  user_id: string;
  widget_type: string;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
  config: Record<string, any>;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Theme {
  id: string;
  user_id: string;
  name: string;
  colors: Record<string, string>;
  background_url: string | null;
  animated: boolean;
  visibility: 'private' | 'shared' | 'public';
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceItem {
  id: string;
  type: 'bot' | 'theme' | 'widget' | 'automation' | 'plugin';
  owner_id: string;
  name: string;
  description: string;
  price: number;
  preview_url: string | null;
  metadata: Record<string, any>;
  download_count: number;
  rating: number;
  reviews_count: number;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  blockchain: 'solana' | 'ethereum' | 'polygon';
  address: string;
  balance: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface MediaAsset {
  id: string;
  user_id: string;
  type: 'video' | 'audio' | 'image' | 'document';
  url: string;
  size_bytes: number | null;
  duration_seconds: number | null;
  metadata: Record<string, any>;
  processing_status: 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: 'free' | 'starter' | 'creator' | 'pro' | 'agency';
  status: 'active' | 'canceled' | 'past_due';
  billing_cycle_start: string;
  billing_cycle_end: string;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// DATABASE CLIENT FUNCTIONS
// ============================================================

/**
 * Get user profile
 */
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as Profile;
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

/**
 * Get user's AI memory with semantic search
 */
export async function searchAIMemory(
  userId: string,
  embedding: number[],
  limit: number = 10,
  threshold: number = 0.7
) {
  const { data, error } = await supabase
    .rpc('match_memory', {
      user_id: userId,
      query_embedding: embedding,
      match_count: limit,
      similarity_threshold: threshold,
    });

  if (error) throw error;
  return data;
}

/**
 * Save AI memory
 */
export async function saveAIMemory(
  userId: string,
  content: string,
  embedding: number[],
  agent: string,
  memory_type: string = 'general'
) {
  const { data, error } = await supabase
    .from('ai_memory')
    .insert({
      user_id: userId,
      content,
      embedding,
      agent,
      memory_type,
    })
    .select()
    .single();

  if (error) throw error;
  return data as AIMemory;
}

/**
 * Get user's bots
 */
export async function getUserBots(userId: string) {
  const { data, error } = await supabase
    .from('bots')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data as Bot[];
}

/**
 * Create a new bot
 */
export async function createBot(userId: string, bot: Omit<Bot, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('bots')
    .insert({ ...bot, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data as Bot;
}

/**
 * Get user's automations
 */
export async function getUserAutomations(userId: string) {
  const { data, error } = await supabase
    .from('automations')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data as Automation[];
}

/**
 * Create automation
 */
export async function createAutomation(
  userId: string,
  automation: Omit<Automation, 'id' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase
    .from('automations')
    .insert({ ...automation, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data as Automation;
}

/**
 * Get marketplace items
 */
export async function searchMarketplace(
  type?: string,
  limit: number = 20,
  offset: number = 0
) {
  let query = supabase.from('marketplace_items').select('*');

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query.range(offset, offset + limit - 1);

  if (error) throw error;
  return data as MarketplaceItem[];
}

/**
 * Purchase marketplace item
 */
export async function purchaseMarketplaceItem(
  itemId: string,
  buyerId: string
) {
  // Get item first to get owner and price
  const { data: item } = await supabase
    .from('marketplace_items')
    .select('owner_id, price')
    .eq('id', itemId)
    .single();

  if (!item) throw new Error('Item not found');

  // Record purchase
  const { data, error } = await supabase
    .from('marketplace_purchases')
    .insert({
      item_id: itemId,
      buyer_id: buyerId,
      seller_id: item.owner_id,
      price: item.price,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get user's wallets
 */
export async function getUserWallets(userId: string) {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data as Wallet[];
}

/**
 * Create wallet
 */
export async function createWallet(
  userId: string,
  blockchain: 'solana' | 'ethereum' | 'polygon',
  address: string
) {
  const { data, error } = await supabase
    .from('wallets')
    .insert({ user_id: userId, blockchain, address })
    .select()
    .single();

  if (error) throw error;
  return data as Wallet;
}

/**
 * Get user's posts
 */
export async function getUserPosts(userId: string, limit: number = 20) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Post[];
}

/**
 * Create post
 */
export async function createPost(userId: string, content: string, media_urls?: string[]) {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      content,
      media_urls: media_urls || [],
    })
    .select()
    .single();

  if (error) throw error;
  return data as Post;
}

/**
 * Get messages between users
 */
export async function getMessages(userId: string, otherUserId: string, limit: number = 50) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Message[];
}

/**
 * Send message
 */
export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

/**
 * Get user's subscription
 */
export async function getSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  return data as Subscription;
}

/**
 * Update subscription tier
 */
export async function updateSubscriptionTier(
  userId: string,
  newTier: 'free' | 'starter' | 'creator' | 'pro' | 'agency'
) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ tier: newTier, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Subscription;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as Profile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Profile>
) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

/**
 * Track usage for a user
 */
export async function trackUsage(
  userId: string,
  operation: string,
  metadata: Record<string, any> = {}
) {
  const { error } = await supabase
    .from('usage_logs')
    .insert({
      user_id: userId,
      operation,
      metadata,
      timestamp: new Date().toISOString(),
    });

  if (error) throw error;
}

/**
 * Get usage count for operation within time period
 */
export async function getUsageCount(
  userId: string,
  operation: string,
  hours: number = 24
): Promise<number> {
  const timeLimit = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: _data, error, count } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('operation', operation)
    .gte('timestamp', timeLimit);

  if (error) throw error;
  return count || 0;
}

/**
 * Create API key for user
 */
export async function createApiKey(userId: string, name: string) {
  const keyId = crypto.randomUUID();
  const key = `sk_${keyId}`;
  const keyHash = await hashApiKey(key);

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: userId,
      key_hash: keyHash,
      name,
      is_active: true,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    key, // Return unhashed key only once
  };
}

/**
 * Revoke API key
 */
export async function revokeApiKey(userId: string, keyId: string) {
  const { error } = await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', keyId)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Hash API key
 */
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get security events
 */
export async function getSecurityEvents(userId: string, limit: number = 20) {
  const { data, error } = await supabase
    .from('security_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  userId: string,
  type: string,
  metadata: Record<string, any>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
) {
  const { error } = await supabase.from('security_events').insert({
    user_id: userId,
    type,
    metadata,
    severity,
  });

  if (error) throw error;
}

// ============================================================
// SOCIAL & ADVANCED AI TYPES
// ============================================================

export interface SocialConnection {
  id: string;
  follower_id: string;
  following_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  message?: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  visibility: 'public' | 'friends' | 'private';
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface FacialRecord {
  id: string;
  user_id: string;
  face_id: string;
  image_url: string;
  analysis: Record<string, any>;
  confidence: number;
  created_at: string;
}

export interface ParentalControlRecord {
  id: string;
  parent_id: string;
  child_id: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ============================================================
// SOCIAL FUNCTIONS
// ============================================================

/**
 * Get user's social profile with connection counts
 */
export async function getUserSocialProfile(userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: followers, error: followersError } = await supabase
    .from('social_connections')
    .select('id', { count: 'exact', head: true })
    .eq('following_id', userId)
    .eq('status', 'accepted');

  const { data: following, error: followingError } = await supabase
    .from('social_connections')
    .select('id', { count: 'exact', head: true })
    .eq('follower_id', userId)
    .eq('status', 'accepted');

  if (followersError || followingError) throw followersError || followingError;

  return {
    ...profile,
    followerCount: followers?.length || 0,
    followingCount: following?.length || 0,
  };
}

/**
 * Create social connection
 */
export async function createConnection(
  followerId: string,
  followingId: string,
  message?: string
) {
  const { data, error } = await supabase
    .from('social_connections')
    .insert({
      follower_id: followerId,
      following_id: followingId,
      status: 'pending',
      message,
    })
    .select()
    .single();

  if (error) throw error;
  return data as SocialConnection;
}

/**
 * Accept connection request
 */
export async function acceptConnection(connectionId: string) {
  const { data, error } = await supabase
    .from('social_connections')
    .update({ status: 'accepted' })
    .eq('id', connectionId)
    .select()
    .single();

  if (error) throw error;
  return data as SocialConnection;
}
// ============================================================
// FACIAL RECOGNITION FUNCTIONS
// ============================================================

/**
 * Store facial record for user
 */
export async function storeFacialRecord(
  userId: string,
  faceId: string,
  imageUrl: string,
  analysis: Record<string, any>,
  confidence: number
) {
  const { data, error } = await supabase
    .from('facial_records')
    .insert({
      user_id: userId,
      face_id: faceId,
      image_url: imageUrl,
      analysis,
      confidence,
    })
    .select()
    .single();

  if (error) throw error;
  return data as FacialRecord;
}

/**
 * Get user's facial records
 */
export async function getUserFacialRecords(userId: string) {
  const { data, error } = await supabase
    .from('facial_records')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as FacialRecord[];
}

// ============================================================
// PARENTAL CONTROLS FUNCTIONS
// ============================================================

/**
 * Set parental controls for a child
 */
export async function setParentalControls(
  parentId: string,
  childId: string,
  settings: Record<string, any>
) {
  const { data, error } = await supabase
    .from('parental_controls')
    .upsert(
      {
        parent_id: parentId,
        child_id: childId,
        settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'parent_id,child_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data as ParentalControlRecord;
}

/**
 * Get parental controls for a child
 */
export async function getParentalControls(parentId: string, childId: string) {
  const { data, error } = await supabase
    .from('parental_controls')
    .select('*')
    .eq('parent_id', parentId)
    .eq('child_id', childId)
    .maybeSingle();

  if (error) throw error;
  return data as ParentalControlRecord | null;
}

export default supabase;
