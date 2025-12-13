export type UserRole = 'user' | 'admin' | 'moderator';
export type UserTier = 'free' | 'starter' | 'creator' | 'pro' | 'agency';

// 1. User & Identity
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  tier: UserTier;
  createdAt: Date;
  lastLogin: Date;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    [key: string]: any;
  };
  stats: {
    xp: number;
    level: number;
    streak: number;
    coins: number;
  };
}

// 2. Widget Registry (The "Apps" on the OS)
export interface Widget {
  id: string;
  type: 'weather' | 'calendar' | 'tasks' | 'news' | 'ai-chat' | 'analytics' | 'custom';
  title: string;
  config: Record<string, any>;
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  userId: string;
  isVisible: boolean;
}

// 3. Copilot / Action Registry
export interface Action {
  id: string;
  type: 'system' | 'user_defined' | 'plugin';
  trigger: string; // e.g., "on_email_received"
  handler: string; // Function name or script reference
  config: Record<string, any>;
  enabled: boolean;
  userId: string;
}

// 4. Vault (File System)
export interface VaultItem {
  id: string;
  userId: string;
  parentId: string | null; // null for root
  type: 'folder' | 'file';
  name: string;
  mimeType?: string; // for files
  size?: number; // in bytes
  url?: string; // for files (Storage URL)
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  path: string[]; // Array of parent IDs for easier querying
}

// 5. Streaming (Media)
export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  type: 'video' | 'audio' | 'playlist';
  url: string;
  thumbnailUrl?: string;
  duration?: number; // in seconds
  provider: 'youtube' | 'vimeo' | 'internal' | 'other';
  externalId?: string;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  mediaId: string;
  progress: number; // in seconds
  completed: boolean;
  lastWatched: Date;
  addedAt: Date;
}

// 6. Gamification
export interface Achievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  xpReward: number;
  icon: string;
  criteria: Record<string, any>;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  progress: number; // 0-100
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'milestone';
  xpReward: number;
  coinReward: number;
  expiresAt?: Date;
  requirements: Record<string, any>;
}

export interface UserQuest {
  id: string;
  userId: string;
  questId: string;
  status: 'active' | 'completed' | 'failed';
  progress: number;
  startedAt: Date;
  completedAt?: Date;
}

// 7. Accounts & Entitlements
export interface Subscription {
  id: string;
  userId: string;
  tier: UserTier;
  status: 'active' | 'canceled' | 'past_due';
  provider: 'stripe' | 'manual';
  providerSubscriptionId?: string;
  currentPeriodEnd: Date;
  features: string[]; // List of enabled feature flags
}

// 8. Event Bus
export interface SystemEvent {
  id: string;
  type: string; // e.g., "user.signup", "payment.succeeded"
  payload: Record<string, any>;
  source: string;
  timestamp: Date;
  userId?: string;
}

export interface Job {
  id: string;
  type: string;
  payload: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'normal' | 'high';
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  scheduledFor?: Date;
  processedAt?: Date;
  error?: string;
}
