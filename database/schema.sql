-- ============================================================
-- LITLABS OS — FULL DATABASE SCHEMA (PHASE 2)
-- Supabase PostgreSQL + pgvector for AI embeddings
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SECTION 1 — USER & ACCOUNT TABLES
-- ============================================================

-- Extend Supabase auth.users with profile data
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text,
  bio text,
  avatar_url text,
  theme_id uuid,
  premium_tier text DEFAULT 'free', -- free, starter, creator, pro, agency
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User preferences and settings
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ui_mode text DEFAULT 'standard', -- standard, advanced, creator, developer
  os_mode text DEFAULT 'dynamic', -- dynamic, adaptive, self-evolving
  language text DEFAULT 'en',
  notifications_enabled boolean DEFAULT true,
  auto_optimize boolean DEFAULT true,
  dark_mode boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- SECTION 2 — AI MEMORY & VECTOR STORE
-- ============================================================

-- Long-term AI memory with embeddings
CREATE TABLE IF NOT EXISTS ai_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  agent text NOT NULL, -- which bot/agent created this
  content text NOT NULL,
  embedding vector(1536), -- OpenAI embeddings
  importance int DEFAULT 1,
  memory_type text DEFAULT 'general', -- general, user_preference, context, fact
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_memory_user ON ai_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_agent ON ai_memory(agent);
CREATE INDEX IF NOT EXISTS idx_ai_memory_embedding ON ai_memory USING ivfflat (embedding vector_cosine_ops);

-- Short-term conversation memory (session state)
CREATE TABLE IF NOT EXISTS ai_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  agent text NOT NULL,
  conversation_history jsonb DEFAULT '[]'::jsonb,
  session_state jsonb DEFAULT '{}'::jsonb,
  context_embedding vector(1536),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_sessions_user ON ai_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_agent ON ai_sessions(agent);

-- ============================================================
-- SECTION 3 — BOT ENGINE TABLES
-- ============================================================

-- Bot definitions
CREATE TABLE IF NOT EXISTS bots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  personality text,
  engine text NOT NULL, -- openai, google, claude, hybrid
  avatar_url text,
  visibility text DEFAULT 'private', -- private, shared, public
  training_data_embedded boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bots_user ON bots(user_id);

-- Bot training data with embeddings
CREATE TABLE IF NOT EXISTS bot_training (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id uuid REFERENCES bots(id) ON DELETE CASCADE,
  content text NOT NULL,
  embedding vector(1536),
  content_type text, -- document, instruction, example
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bot_training_bot ON bot_training(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_training_embedding ON bot_training USING ivfflat (embedding vector_cosine_ops);

-- Active bot sessions
CREATE TABLE IF NOT EXISTS bot_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id uuid REFERENCES bots(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_data jsonb DEFAULT '{}'::jsonb,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bot_sessions_bot ON bot_sessions(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_sessions_user ON bot_sessions(user_id);

-- ============================================================
-- SECTION 4 — AUTOMATION ENGINE TABLES
-- ============================================================

-- Automation workflows
CREATE TABLE IF NOT EXISTS automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text DEFAULT 'active', -- active, paused, archived
  trigger_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automations_user ON automations(user_id);

-- Individual automation steps
CREATE TABLE IF NOT EXISTS automation_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id uuid REFERENCES automations(id) ON DELETE CASCADE,
  type text NOT NULL, -- trigger, action, condition, delay
  config jsonb NOT NULL,
  position int NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automation_steps_automation ON automation_steps(automation_id);

-- Automation execution history
CREATE TABLE IF NOT EXISTS automation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id uuid REFERENCES automations(id) ON DELETE CASCADE,
  status text, -- success, failed, pending
  logs text,
  duration_ms int,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automation_runs_automation ON automation_runs(automation_id);

-- ============================================================
-- SECTION 5 — WIDGET ENGINE TABLES
-- ============================================================

-- User widget layouts
CREATE TABLE IF NOT EXISTS user_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_type text NOT NULL,
  pos_x int DEFAULT 0,
  pos_y int DEFAULT 0,
  width int DEFAULT 4,
  height int DEFAULT 4,
  config jsonb DEFAULT '{}'::jsonb,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_widgets_user ON user_widgets(user_id);

-- ============================================================
-- SECTION 6 — THEME ENGINE TABLES
-- ============================================================

-- Theme definitions
CREATE TABLE IF NOT EXISTS themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  colors jsonb NOT NULL, -- {primary, secondary, accent, background}
  background_url text,
  animated boolean DEFAULT false,
  visibility text DEFAULT 'private', -- private, shared, public
  download_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_themes_user ON themes(user_id);
CREATE INDEX IF NOT EXISTS idx_themes_visibility ON themes(visibility);

-- ============================================================
-- SECTION 7 — MARKETPLACE ENGINE TABLES
-- ============================================================

-- Marketplace items (bots, themes, widgets, automations)
CREATE TABLE IF NOT EXISTS marketplace_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL, -- bot, theme, widget, automation, plugin
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric DEFAULT 0,
  preview_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  download_count int DEFAULT 0,
  rating numeric DEFAULT 5,
  reviews_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_items_type ON marketplace_items(type);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_owner ON marketplace_items(owner_id);

-- Marketplace purchases
CREATE TABLE IF NOT EXISTS marketplace_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES marketplace_items(id) ON DELETE CASCADE,
  buyer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  price numeric NOT NULL,
  status text DEFAULT 'completed', -- completed, pending, refunded
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_buyer ON marketplace_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_seller ON marketplace_purchases(seller_id);

-- Reviews and ratings
CREATE TABLE IF NOT EXISTS marketplace_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES marketplace_items(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rating int CHECK (rating >= 1 AND rating <= 5),
  comment text,
  helpful_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_item ON marketplace_reviews(item_id);

-- ============================================================
-- SECTION 8 — CRYPTO ENGINE TABLES
-- ============================================================

-- User wallets
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  blockchain text NOT NULL, -- solana, ethereum, polygon
  address text NOT NULL,
  balance numeric DEFAULT 0,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_blockchain ON wallets(blockchain);

-- Crypto transactions
CREATE TABLE IF NOT EXISTS crypto_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid REFERENCES wallets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  type text NOT NULL, -- deposit, withdraw, purchase, transfer
  tx_hash text UNIQUE,
  status text DEFAULT 'pending', -- pending, confirmed, failed
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crypto_transactions_user ON crypto_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_status ON crypto_transactions(status);

-- ============================================================
-- SECTION 9 — SOCIAL ENGINE TABLES
-- ============================================================

-- Posts/content
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  media_urls text[] DEFAULT '{}',
  likes_count int DEFAULT 0,
  comments_count int DEFAULT 0,
  shares_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  likes_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);

-- Direct messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- Likes/reactions
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);

-- ============================================================
-- SECTION 10 — MEDIA ENGINE TABLES
-- ============================================================

-- Media assets storage
CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL, -- video, audio, image, document
  url text NOT NULL,
  size_bytes bigint,
  duration_seconds int,
  metadata jsonb DEFAULT '{}'::jsonb,
  processing_status text DEFAULT 'completed', -- processing, completed, failed
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_user ON media_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_type ON media_assets(type);

-- ============================================================
-- SECTION 11 — CLOUD GAMING TABLES
-- ============================================================

-- Gaming sessions
CREATE TABLE IF NOT EXISTS gaming_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  game_name text NOT NULL,
  session_token text UNIQUE,
  status text DEFAULT 'active', -- active, paused, completed
  server_region text,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  play_duration_seconds int
);

CREATE INDEX IF NOT EXISTS idx_gaming_sessions_user ON gaming_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_gaming_sessions_status ON gaming_sessions(status);

-- ============================================================
-- SECTION 12 — SECURITY EVENT LOGGING
-- ============================================================

-- Security and audit events
CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL, -- login_fail, brute_force, bot_detected, injection, unauthorized_access
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  severity text DEFAULT 'low', -- low, medium, high, critical
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);

-- ============================================================
-- SECTION 13 — SYSTEM OPTIMIZATION ENGINE
-- ============================================================

-- Engine performance metrics
CREATE TABLE IF NOT EXISTS engine_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engine text NOT NULL, -- ai_memory, bot_engine, automation, widget, theme, marketplace, crypto, etc
  latency_ms int,
  load numeric,
  usage_count int,
  error_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_engine_metrics_engine ON engine_metrics(engine);
CREATE INDEX IF NOT EXISTS idx_engine_metrics_created ON engine_metrics(created_at DESC);

-- OS self-optimization decisions
CREATE TABLE IF NOT EXISTS optimization_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL, -- cache_warming, resource_allocation, bot_retraining, etc
  engine text,
  details jsonb NOT NULL,
  impact_score numeric,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_optimization_events_engine ON optimization_events(engine);
CREATE INDEX IF NOT EXISTS idx_optimization_events_created ON optimization_events(created_at DESC);

-- ============================================================
-- SECTION 14 — USAGE & QUOTA TRACKING
-- ============================================================

-- Track user API usage and quotas
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  feature text NOT NULL,
  usage_count int DEFAULT 1,
  quota_limit int,
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_feature ON usage_tracking(feature);

-- ============================================================
-- SECTION 15 — SUBSCRIPTION & BILLING
-- ============================================================

-- Subscription information
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL, -- free, starter, creator, pro, agency
  status text DEFAULT 'active', -- active, canceled, past_due
  billing_cycle_start timestamptz,
  billing_cycle_end timestamptz,
  stripe_subscription_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ============================================================
-- SECTION 16 — API & INTEGRATION KEYS
-- ============================================================

-- API keys for external integrations
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text UNIQUE NOT NULL,
  service text NOT NULL, -- openai, google, anthropic, replicate, stripe, etc
  is_active boolean DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);

-- ============================================================
-- SECTION 17 — NOTIFICATIONS
-- ============================================================

-- User notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text,
  type text, -- info, success, warning, error
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE gaming_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES - USERS CAN ONLY ACCESS THEIR OWN DATA
-- ============================================================

-- Profiles: Users can view public profiles, edit their own
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- User Settings: Users can only access their own
CREATE POLICY "Users can access own settings" ON user_settings
  FOR ALL USING (auth.uid() = id);

-- AI Memory: Users can only access their own memory
CREATE POLICY "Users can access own AI memory" ON ai_memory
  FOR ALL USING (auth.uid() = user_id);

-- AI Sessions: Users can only access their own sessions
CREATE POLICY "Users can access own AI sessions" ON ai_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Bots: Users can access their own bots + public bots
CREATE POLICY "Users can access own bots" ON bots
  FOR SELECT USING (auth.uid() = user_id OR visibility = 'public');

CREATE POLICY "Users can manage own bots" ON bots
  FOR ALL USING (auth.uid() = user_id);

-- Automations: Users can only access their own
CREATE POLICY "Users can access own automations" ON automations
  FOR ALL USING (auth.uid() = user_id);

-- Wallets: Users can only access their own
CREATE POLICY "Users can access own wallets" ON wallets
  FOR ALL USING (auth.uid() = user_id);

-- Messages: Users can only access messages they're involved in
CREATE POLICY "Users can access own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Posts: Users can view all posts, edit their own
CREATE POLICY "Users can view all posts" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Users can edit own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- SCHEMA COMPLETE
-- ============================================================

-- Summary of schema:
-- 17+ tables covering all engines, bots, automations, widgets, themes, marketplace, crypto, social, media, gaming, security, optimization
-- pgvector embeddings for AI memory and semantic search
-- Row-level security for multi-tenant safety
-- Comprehensive indexing for performance
-- Full audit trail with timestamps

COMMIT;
