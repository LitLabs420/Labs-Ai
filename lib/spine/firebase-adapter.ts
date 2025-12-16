import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp, 
  serverTimestamp,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { 
  Repository, 
  HomeRepo, 
  WidgetRepo, 
  ActionRepo, 
  VaultRepo, 
  StreamingRepo, 
  GamificationRepo, 
  AccountsRepo, 
  EventBus, 
  Spine 
} from './adapters';
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

// Helper to convert Firestore data to typed objects
const convertDate = (data: any): any => {
  if (!data) return data;
  const result = { ...data };
  for (const key in result) {
    if (result[key] instanceof Timestamp) {
      result[key] = result[key].toDate();
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = convertDate(result[key]);
    }
  }
  return result;
};

// Base Repository Implementation
class FirebaseRepository<T extends { id: string }> implements Repository<T> {
  constructor(protected collectionName: string) {}

  async get(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...convertDate(docSnap.data()) } as T;
    }
    return null;
  }

  async list(filters?: Record<string, any>): Promise<T[]> {
    let q = collection(db, this.collectionName) as any;
    
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        q = query(q, where(key, '==', value));
      }
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...convertDate(doc.data()) } as T));
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Fetch it back to get the resolved timestamps
    const newDoc = await getDoc(docRef);
    return { id: newDoc.id, ...convertDate(newDoc.data()) } as T;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    const updatedDoc = await getDoc(docRef);
    return { id: updatedDoc.id, ...convertDate(updatedDoc.data()) } as T;
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, this.collectionName, id));
  }
}

// 1. HomeRepo Implementation
class FirebaseHomeRepo extends FirebaseRepository<UserProfile> implements HomeRepo {
  constructor() {
    super('users');
  }

  // Override create to use setDoc with specific ID (uid) if provided, 
  // but the base create uses addDoc (auto-id). 
  // For users, we usually want to use the Auth UID.
  // So we'll add a specific method for creating/updating users by UID.
  async createProfile(_uid: string, _data: Omit<UserProfile, 'id' | 'uid'>): Promise<UserProfile> {
    // Implementation specific to user creation with setDoc would go here
    // For now, we'll assume the base create is used for other things
    // but actually UserProfile usually maps 1:1 with Auth UID.
    // Let's just implement getByEmail for now.
    return {} as any; // Placeholder, actual implementation depends on auth flow
  }

  async getByEmail(email: string): Promise<UserProfile | null> {
    const q = query(collection(db, this.collectionName), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...convertDate(doc.data()) } as any;
    }
    return null;
  }

  async updateStats(userId: string, stats: Partial<UserProfile['stats']>): Promise<void> {
    const docRef = doc(db, this.collectionName, userId);
    // We need to use dot notation for nested updates to avoid overwriting the whole map
    const updates: Record<string, any> = {};
    for (const [key, value] of Object.entries(stats)) {
      updates[`stats.${key}`] = value;
    }
    await updateDoc(docRef, updates);
  }
}

// 2. WidgetRepo Implementation
class FirebaseWidgetRepo extends FirebaseRepository<Widget> implements WidgetRepo {
  constructor() {
    super('widgets');
  }

  async getByUser(userId: string): Promise<Widget[]> {
    return this.list({ userId });
  }

  async updateLayout(userId: string, layout: { id: string; x: number; y: number; w: number; h: number }[]): Promise<void> {
    const batch = writeBatch(db);
    
    for (const item of layout) {
      const docRef = doc(db, this.collectionName, item.id);
      batch.update(docRef, { 
        'layout.x': item.x, 
        'layout.y': item.y, 
        'layout.w': item.w, 
        'layout.h': item.h 
      });
    }
    
    await batch.commit();
  }
}

// 3. ActionRepo Implementation
class FirebaseActionRepo extends FirebaseRepository<Action> implements ActionRepo {
  constructor() {
    super('actions');
  }

  async getEnabledByUser(userId: string): Promise<Action[]> {
    const q = query(
      collection(db, this.collectionName), 
      where('userId', '==', userId),
      where('enabled', '==', true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...convertDate(doc.data()) } as Action));
  }

  async trigger(actionId: string, context: any): Promise<any> {
    // In a real implementation, this might call a Cloud Function or execute local logic
    console.log(`Triggering action ${actionId} with context`, context);
    return { success: true, timestamp: new Date() };
  }
}

// 4. VaultRepo Implementation
class FirebaseVaultRepo extends FirebaseRepository<VaultItem> implements VaultRepo {
  constructor() {
    super('vault');
  }

  async getItemsInFolder(userId: string, folderId: string | null): Promise<VaultItem[]> {
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId),
      where('parentId', '==', folderId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...convertDate(doc.data()) } as VaultItem));
  }

  async search(userId: string, searchQuery: string): Promise<VaultItem[]> {
    // Firestore doesn't support full-text search natively.
    // This is a naive implementation that only checks exact matches or startsWith if we structured it that way.
    // For a real app, we'd use Algolia or similar.
    // Here we'll just fetch all user items and filter in memory (NOT SCALABLE but works for MVP)
    const allItems = await this.list({ userId });
    return allItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  async move(itemId: string, newParentId: string | null): Promise<void> {
    await this.update(itemId, { parentId: newParentId });
  }

  async getStorageUrl(path: string): Promise<string> {
    // This would interact with Firebase Storage
    if (!storage) throw new Error("Storage not initialized");
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  }

  async createFolder(userId: string, name: string, parentId: string | null): Promise<VaultItem> {
    return this.create({
      userId,
      parentId,
      type: 'folder',
      name,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      path: [] // TODO: Calculate path from parent
    });
  }

  async uploadFile(userId: string, file: File, parentId: string | null): Promise<VaultItem> {
    if (!storage) throw new Error("Storage not initialized");
    
    // 1. Upload to Storage
    const storagePath = `vault/${userId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    // 2. Create Firestore Record
    return this.create({
      userId,
      parentId,
      type: 'file',
      name: file.name,
      mimeType: file.type,
      size: file.size,
      url,
      metadata: { storagePath },
      createdAt: new Date(),
      updatedAt: new Date(),
      path: [] // TODO: Calculate path
    });
  }

  async deleteItem(itemId: string): Promise<void> {
    const item = await this.get(itemId);
    if (!item) return;

    if (item.type === 'file' && item.metadata?.storagePath) {
      if (!storage) throw new Error("Storage not initialized");
      const storageRef = ref(storage, item.metadata.storagePath);
      try {
        await deleteObject(storageRef);
      } catch (e) {
        console.warn("Failed to delete file from storage", e);
      }
    }

    // If folder, we should recursively delete children, but for MVP we'll just delete the folder doc
    // and leave orphans (or block deletion if not empty). 
    // Let's just delete the doc for now.
    await this.delete(itemId);
  }
}

// 5. StreamingRepo Implementation
class FirebaseStreamingRepo extends FirebaseRepository<MediaItem> implements StreamingRepo {
  constructor() {
    super('media');
  }

  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    const q = query(collection(db, 'watchlist'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...convertDate(doc.data()) } as WatchlistItem));
  }

  async addToWatchlist(userId: string, mediaId: string): Promise<WatchlistItem> {
    const docRef = await addDoc(collection(db, 'watchlist'), {
      userId,
      mediaId,
      progress: 0,
      completed: false,
      lastWatched: serverTimestamp(),
      addedAt: serverTimestamp()
    });
    const newDoc = await getDoc(docRef);
    return { id: newDoc.id, ...convertDate(newDoc.data()) } as WatchlistItem;
  }

  async updateProgress(userId: string, mediaId: string, progress: number, completed: boolean): Promise<void> {
    const q = query(
      collection(db, 'watchlist'), 
      where('userId', '==', userId),
      where('mediaId', '==', mediaId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        progress,
        completed,
        lastWatched: serverTimestamp()
      });
    }
  }

  async getTrending(): Promise<MediaItem[]> {
    const q = query(collection(db, this.collectionName), orderBy('views', 'desc'), limit(10));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...convertDate(doc.data()) } as MediaItem));
  }
}

// 6. GamificationRepo Implementation
class FirebaseGamificationRepo implements GamificationRepo {
  async getAchievements(): Promise<Achievement[]> {
    const querySnapshot = await getDocs(collection(db, 'achievements'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...convertDate(doc.data()) } as Achievement));
  }

  async createAchievement(achievement: Omit<Achievement, 'id'>): Promise<Achievement> {
    const docRef = await addDoc(collection(db, 'achievements'), {
      ...achievement,
      createdAt: serverTimestamp()
    });
    const newDoc = await getDoc(docRef);
    return { id: newDoc.id, ...convertDate(newDoc.data()) } as Achievement;
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const q = query(collection(db, 'user_achievements'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...convertDate(doc.data()) } as UserAchievement));
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    const docRef = await addDoc(collection(db, 'user_achievements'), {
      userId,
      achievementId,
      unlockedAt: serverTimestamp(),
      progress: 100
    });
    const newDoc = await getDoc(docRef);
    return { id: newDoc.id, ...convertDate(newDoc.data()) } as UserAchievement;
  }

  async getActiveQuests(userId: string): Promise<UserQuest[]> {
    const q = query(
      collection(db, 'user_quests'), 
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...convertDate(doc.data()) } as UserQuest));
  }

  async updateQuestProgress(userQuestId: string, progress: number): Promise<UserQuest> {
    const docRef = doc(db, 'user_quests', userQuestId);
    await updateDoc(docRef, {
      progress,
      updatedAt: serverTimestamp()
    });
    const updatedDoc = await getDoc(docRef);
    return { id: updatedDoc.id, ...convertDate(updatedDoc.data()) } as UserQuest;
  }

  async claimQuestReward(userQuestId: string): Promise<void> {
    const docRef = doc(db, 'user_quests', userQuestId);
    await updateDoc(docRef, {
      status: 'completed',
      completedAt: serverTimestamp()
    });
    // Logic to add coins/xp would typically be in a Cloud Function triggered by this update
  }
}

// 7. AccountsRepo Implementation
class FirebaseAccountsRepo extends FirebaseRepository<Subscription> implements AccountsRepo {
  constructor() {
    super('subscriptions');
  }

  async getByUser(userId: string): Promise<Subscription | null> {
    const q = query(collection(db, this.collectionName), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...convertDate(querySnapshot.docs[0].data()) } as Subscription;
    }
    return null;
  }

  async checkEntitlement(userId: string, feature: string): Promise<boolean> {
    const sub = await this.getByUser(userId);
    if (!sub || sub.status !== 'active') return false;
    return sub.features.includes(feature);
  }
}

// 8. EventBus Implementation
class FirebaseEventBus implements EventBus {
  async publish(event: Omit<SystemEvent, 'id' | 'timestamp'>): Promise<void> {
    await addDoc(collection(db, 'events'), {
      ...event,
      timestamp: serverTimestamp()
    });
  }

  subscribe(eventType: string, handler: (event: SystemEvent) => Promise<void>): void {
    // Client-side subscription using onSnapshot
    const q = query(
      collection(db, 'events'), 
      where('type', '==', eventType),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    
    onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const event = { id: change.doc.id, ...convertDate(change.doc.data()) } as SystemEvent;
          // Avoid processing old events on initial load if needed, 
          // but for now we just pass it through
          await handler(event);
        }
      });
    });
  }

  async queueJob(job: Omit<Job, 'id' | 'status' | 'attempts' | 'createdAt'>): Promise<Job> {
    const docRef = await addDoc(collection(db, 'jobs'), {
      ...job,
      status: 'pending',
      attempts: 0,
      createdAt: serverTimestamp()
    });
    const newDoc = await getDoc(docRef);
    return { id: newDoc.id, ...convertDate(newDoc.data()) } as Job;
  }

  processJobs(_type: string, _handler: (job: Job) => Promise<void>): void {
    // This is typically a server-side operation. 
    // On client, we might poll or use snapshot, but usually clients don't process jobs.
    console.warn('Job processing should ideally happen on the server.');
  }
}

// Export the initialized Spine
export const spine: Spine = {
  home: new FirebaseHomeRepo(),
  widgets: new FirebaseWidgetRepo(),
  actions: new FirebaseActionRepo(),
  vault: new FirebaseVaultRepo(),
  streaming: new FirebaseStreamingRepo(),
  gamification: new FirebaseGamificationRepo(),
  accounts: new FirebaseAccountsRepo(),
  events: new FirebaseEventBus()
};
