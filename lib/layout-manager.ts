// Layout Manager - Handles custom dashboard layouts
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

export type WidgetType = 
  | 'quick-stats'
  | 'money-today'
  | 'daily-challenge'
  | 'xp-card'
  | 'recent-posts'
  | 'playbooks'
  | 'marketplace'
  | 'analytics'
  | 'clients'
  | 'revenue-chart'
  | 'azure-resources'
  | 'xbox-gaming'
  | 'archive'
  | 'notifications'
  | 'custom-widget';

export interface Widget {
  id: string;
  type: WidgetType;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config?: Record<string, unknown>;
  enabled: boolean;
  order: number;
}

export interface DashboardLayout {
  id: string;
  userId: string;
  name: string;
  widgets: Widget[];
  isDefault: boolean;
  gridSize: {
    columns: number;
    rowHeight: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = 'dashboard_layouts';

/**
 * Get user's default layout
 */
export async function getDefaultLayout(userId: string): Promise<DashboardLayout | null> {
  if (!db) return null;
  
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('isDefault', '==', true)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    } as DashboardLayout;
  } catch (error) {
    console.error('Error fetching default layout:', error);
    return null;
  }
}

/**
 * Get all layouts for user
 */
export async function getUserLayouts(userId: string): Promise<DashboardLayout[]> {
  if (!db) return [];
  
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as DashboardLayout[];
  } catch (error) {
    console.error('Error fetching user layouts:', error);
    return [];
  }
}

/**
 * Save or update layout
 */
export async function saveLayout(layout: Omit<DashboardLayout, 'createdAt' | 'updatedAt'>): Promise<string> {
  if (!db) throw new Error('Database not initialized');
  
  try {
    const layoutData = {
      ...layout,
      updatedAt: new Date(),
      createdAt: layout.id ? undefined : new Date(),
    };
    
    if (layout.id) {
      await updateDoc(doc(db, COLLECTION_NAME, layout.id), layoutData);
      return layout.id;
    } else {
      const docRef = await setDoc(doc(db, COLLECTION_NAME, `${layout.userId}_${Date.now()}`), layoutData);
      return `${layout.userId}_${Date.now()}`;
    }
  } catch (error) {
    console.error('Error saving layout:', error);
    throw error;
  }
}

/**
 * Delete layout
 */
export async function deleteLayout(layoutId: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, layoutId));
  } catch (error) {
    console.error('Error deleting layout:', error);
    throw error;
  }
}

/**
 * Set layout as default
 */
export async function setDefaultLayout(userId: string, layoutId: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  try {
    // Unset previous default
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('isDefault', '==', true)
    );
    const snapshot = await getDocs(q);
    
    for (const doc of snapshot.docs) {
      await updateDoc(doc.ref, { isDefault: false });
    }
    
    // Set new default
    await updateDoc(doc(db, COLLECTION_NAME, layoutId), { isDefault: true });
  } catch (error) {
    console.error('Error setting default layout:', error);
    throw error;
  }
}

/**
 * Create default layout template
 */
export function createDefaultLayout(userId: string): DashboardLayout {
  const defaultWidgets: Widget[] = [
    {
      id: 'quick-stats',
      type: 'quick-stats',
      position: { x: 0, y: 0, width: 4, height: 2 },
      enabled: true,
      order: 0,
    },
    {
      id: 'money-today',
      type: 'money-today',
      position: { x: 4, y: 0, width: 4, height: 2 },
      enabled: true,
      order: 1,
    },
    {
      id: 'daily-challenge',
      type: 'daily-challenge',
      position: { x: 8, y: 0, width: 4, height: 2 },
      enabled: true,
      order: 2,
    },
    {
      id: 'xp-card',
      type: 'xp-card',
      position: { x: 0, y: 2, width: 4, height: 2 },
      enabled: true,
      order: 3,
    },
    {
      id: 'recent-posts',
      type: 'recent-posts',
      position: { x: 4, y: 2, width: 8, height: 3 },
      enabled: true,
      order: 4,
    },
    {
      id: 'analytics',
      type: 'analytics',
      position: { x: 0, y: 4, width: 6, height: 3 },
      enabled: true,
      order: 5,
    },
    {
      id: 'revenue-chart',
      type: 'revenue-chart',
      position: { x: 6, y: 4, width: 6, height: 3 },
      enabled: true,
      order: 6,
    },
  ];

  return {
    id: `${userId}_default`,
    userId,
    name: 'Default Layout',
    widgets: defaultWidgets,
    isDefault: true,
    gridSize: {
      columns: 12,
      rowHeight: 100,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Update widget position
 */
export async function updateWidgetPosition(
  layoutId: string,
  widgetId: string,
  position: Widget['position']
): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  try {
    const layoutRef = doc(db, COLLECTION_NAME, layoutId);
    const layoutDoc = await getDoc(layoutRef);
    
    if (!layoutDoc.exists()) {
      throw new Error('Layout not found');
    }
    
    const layout = layoutDoc.data() as DashboardLayout;
    const widgets = layout.widgets.map(w =>
      w.id === widgetId ? { ...w, position } : w
    );
    
    await updateDoc(layoutRef, { widgets, updatedAt: new Date() });
  } catch (error) {
    console.error('Error updating widget position:', error);
    throw error;
  }
}

/**
 * Toggle widget visibility
 */
export async function toggleWidget(
  layoutId: string,
  widgetId: string,
  enabled: boolean
): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  
  try {
    const layoutRef = doc(db, COLLECTION_NAME, layoutId);
    const layoutDoc = await getDoc(layoutRef);
    
    if (!layoutDoc.exists()) {
      throw new Error('Layout not found');
    }
    
    const layout = layoutDoc.data() as DashboardLayout;
    const widgets = layout.widgets.map(w =>
      w.id === widgetId ? { ...w, enabled } : w
    );
    
    await updateDoc(layoutRef, { widgets, updatedAt: new Date() });
  } catch (error) {
    console.error('Error toggling widget:', error);
    throw error;
  }
}
