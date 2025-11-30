import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function trackEvent(
  eventName: string,
  data: Record<string, any> = {}
) {
  try {
    // GA4 tracking if gtag is available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    }

    // Also log to Firestore for founder analytics
    await addDoc(collection(db, 'analytics_events'), {
      eventName,
      ...data,
      timestamp: Date.now(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

export const EVENTS = {
  SIGNUP_START: 'signup_start',
  SIGNUP_COMPLETE: 'signup_complete',
  LOGIN: 'login',
  UPGRADE_CLICKED: 'upgrade_clicked',
  UPGRADE_COMPLETE: 'upgrade_complete',
  REFERRAL_SHARED: 'referral_shared',
  ADMIN_ACTION: 'admin_action',
  FEATURE_USED: 'feature_used',
} as const;
