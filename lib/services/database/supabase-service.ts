import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Client-side Supabase instance (with RLS)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Server-side Supabase instance (admin access)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ============================================
// USER PROFILE OPERATIONS
// ============================================

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

// ============================================
// BOT ENGINE OPERATIONS
// ============================================

export async function createBot(userId: string, botData: any) {
  const { data, error } = await supabase
    .from('bots')
    .insert([{ user_id: userId, ...botData }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserBots(userId: string) {
  const { data, error } = await supabase
    .from('bots')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPublicBots(limit = 20) {
  const { data, error } = await supabase
    .from('bots')
    .select('*')
    .eq('visibility', 'public')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function updateBot(botId: string, updates: any) {
  const { data, error } = await supabase
    .from('bots')
    .update({ ...updates, updated_at: new Date() })
    .eq('id', botId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBot(botId: string) {
  const { error } = await supabase
    .from('bots')
    .delete()
    .eq('id', botId);

  if (error) throw error;
}

export async function saveBotConversation(botId: string, userId: string, conversationData: any) {
  const { data, error } = await supabase
    .from('bot_conversations')
    .insert([{
      bot_id: botId,
      user_id: userId,
      conversation_data: conversationData,
      messages_count: conversationData.messages?.length || 0,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// AUTOMATION ENGINE OPERATIONS
// ============================================

export async function createAutomation(userId: string, automationData: any) {
  const { data, error } = await supabase
    .from('automations')
    .insert([{ user_id: userId, ...automationData }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserAutomations(userId: string) {
  const { data, error } = await supabase
    .from('automations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addAutomationStep(automationId: string, stepData: any) {
  const { data, error } = await supabase
    .from('automation_steps')
    .insert([{ automation_id: automationId, ...stepData }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAutomationSteps(automationId: string) {
  const { data, error } = await supabase
    .from('automation_steps')
    .select('*')
    .eq('automation_id', automationId)
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function logAutomationRun(automationId: string, runData: any) {
  const { data, error } = await supabase
    .from('automation_runs')
    .insert([{ automation_id: automationId, ...runData }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// AI CONTENT GENERATION OPERATIONS
// ============================================

export async function saveContentPrompt(userId: string, promptData: any) {
  const { data, error } = await supabase
    .from('content_prompts')
    .insert([{ user_id: userId, ...promptData }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserContentPrompts(userId: string) {
  const { data, error } = await supabase
    .from('content_prompts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function saveGeneratedContent(userId: string, contentData: any) {
  const { data, error } = await supabase
    .from('generated_content')
    .insert([{ user_id: userId, ...contentData }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserGeneratedContent(userId: string) {
  const { data, error } = await supabase
    .from('generated_content')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ============================================
// MARKETPLACE OPERATIONS
// ============================================

export async function createMarketplaceItem(creatorId: string, itemData: any) {
  const { data, error } = await supabase
    .from('marketplace_items')
    .insert([{ creator_id: creatorId, ...itemData }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMarketplaceItems(filters?: any) {
  let query = supabase
    .from('marketplace_items')
    .select('*')
    .eq('visibility', 'published');

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.type) {
    query = query.eq('item_type', filters.type);
  }

  const { data, error } = await query
    .order('total_purchases', { ascending: false })
    .limit(filters?.limit || 50);

  if (error) throw error;
  return data || [];
}

export async function getCreatorItems(creatorId: string) {
  const { data, error } = await supabase
    .from('marketplace_items')
    .select('*')
    .eq('creator_id', creatorId);

  if (error) throw error;
  return data || [];
}

export async function recordMarketplacePurchase(purchaseData: any) {
  const { data, error } = await supabase
    .from('marketplace_purchases')
    .insert([purchaseData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserPurchases(userId: string) {
  const { data, error } = await supabase
    .from('marketplace_purchases')
    .select('*')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ============================================
// PAYMENT OPERATIONS
// ============================================

export async function recordPayment(paymentData: any) {
  const { data, error } = await supabase
    .from('payment_history')
    .insert([paymentData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserPayments(userId: string) {
  const { data, error } = await supabase
    .from('payment_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateSubscription(subscriptionId: string, updates: any) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ ...updates, updated_at: new Date() })
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// USAGE TRACKING
// ============================================

export async function trackUsage(userId: string, feature: string, count = 1) {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: existing } = await supabase
    .from('usage_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('feature', feature)
    .eq('period', 'month')
    .single();

  if (existing) {
    const { error } = await supabase
      .from('usage_logs')
      .update({ usage_count: existing.usage_count + count })
      .eq('id', existing.id);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('usage_logs')
      .insert([{
        user_id: userId,
        feature,
        usage_count: count,
        period: 'month',
        reset_at: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      }]);

    if (error) throw error;
  }
}

export async function getUsage(userId: string, feature: string) {
  const { data, error } = await supabase
    .from('usage_logs')
    .select('usage_count')
    .eq('user_id', userId)
    .eq('feature', feature)
    .eq('period', 'month')
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data?.usage_count || 0;
}

// ============================================
// SECURITY LOGGING
// ============================================

export async function logSecurityEvent(userId: string | null, eventData: any) {
  const { error } = await supabaseAdmin
    .from('security_events')
    .insert([{ user_id: userId || null, ...eventData }]);

  if (error) console.error('Failed to log security event:', error);
}

// ============================================
// MEDIA OPERATIONS
// ============================================

export async function uploadMedia(userId: string, file: File) {
  const fileName = `${userId}/${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('media')
    .upload(fileName, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(fileName);

  // Record in database
  await supabase
    .from('media_assets')
    .insert([{
      user_id: userId,
      file_name: file.name,
      file_type: file.type,
      file_url: publicUrl,
      file_size: file.size,
      storage_path: fileName,
    }]);

  return { url: publicUrl, path: fileName };
}

export async function getUserMedia(userId: string) {
  const { data, error } = await supabase
    .from('media_assets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
