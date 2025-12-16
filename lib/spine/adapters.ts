import { 
  UserProfile, 
  Widget, 
  Action, 
  VaultItem, 
  MediaItem, 
  WatchlistItem, 
  Achievement, 
  UserAchievement, 
  // Quest,  // Reserved for future quest features
  UserQuest, 
  Subscription, 
  SystemEvent, 
  Job 
} from '@/types/spine';

// Generic Repository Interface
export interface Repository<T> {
  get(id: string): Promise<T | null>;
  list(filters?: Record<string, any>): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// 1. HomeRepo (User & Identity)
export interface HomeRepo extends Repository<UserProfile> {
  getByEmail(email: string): Promise<UserProfile | null>;
  updateStats(userId: string, stats: Partial<UserProfile['stats']>): Promise<void>;
}

// 2. WidgetRepo (Widget Registry)
export interface WidgetRepo extends Repository<Widget> {
  getByUser(userId: string): Promise<Widget[]>;
  updateLayout(userId: string, layout: { id: string; x: number; y: number; w: number; h: number }[]): Promise<void>;
}

// 3. ActionRepo (Copilot / Action Registry)
export interface ActionRepo extends Repository<Action> {
  getEnabledByUser(userId: string): Promise<Action[]>;
  trigger(actionId: string, context: any): Promise<any>;
}

// 4. VaultRepo (File System)
export interface VaultRepo extends Repository<VaultItem> {
  getItemsInFolder(userId: string, folderId: string | null): Promise<VaultItem[]>;
  search(userId: string, query: string): Promise<VaultItem[]>;
  move(itemId: string, newParentId: string | null): Promise<void>;
  getStorageUrl(path: string): Promise<string>;
  createFolder(userId: string, name: string, parentId: string | null): Promise<VaultItem>;
  uploadFile(userId: string, file: File, parentId: string | null): Promise<VaultItem>;
  deleteItem(itemId: string): Promise<void>;
}

// 5. StreamingRepo (Media)
export interface StreamingRepo extends Repository<MediaItem> {
  getWatchlist(userId: string): Promise<WatchlistItem[]>;
  addToWatchlist(userId: string, mediaId: string): Promise<WatchlistItem>;
  updateProgress(userId: string, mediaId: string, progress: number, completed: boolean): Promise<void>;
  getTrending(): Promise<MediaItem[]>;
}

// 6. GamificationRepo
export interface GamificationRepo {
  getAchievements(): Promise<Achievement[]>;
  createAchievement(achievement: Omit<Achievement, 'id'>): Promise<Achievement>; // Added for seeding
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement>;
  
  getActiveQuests(userId: string): Promise<UserQuest[]>;
  updateQuestProgress(userQuestId: string, progress: number): Promise<UserQuest>;
  claimQuestReward(userQuestId: string): Promise<void>;
}

// 7. AccountsRepo (Entitlements)
export interface AccountsRepo extends Repository<Subscription> {
  getByUser(userId: string): Promise<Subscription | null>;
  checkEntitlement(userId: string, feature: string): Promise<boolean>;
}

// 8. EventBus (System Events & Jobs)
export interface EventBus {
  publish(event: Omit<SystemEvent, 'id' | 'timestamp'>): Promise<void>;
  subscribe(eventType: string, handler: (event: SystemEvent) => Promise<void>): void;
  
  queueJob(job: Omit<Job, 'id' | 'status' | 'attempts' | 'createdAt'>): Promise<Job>;
  processJobs(type: string, handler: (job: Job) => Promise<void>): void;
}

// The "Spine" - Main Entry Point
export interface Spine {
  home: HomeRepo;
  widgets: WidgetRepo;
  actions: ActionRepo;
  vault: VaultRepo;
  streaming: StreamingRepo;
  gamification: GamificationRepo;
  accounts: AccountsRepo;
  events: EventBus;
}
