/**
 * 🎯 Advanced Analytics & Insights Engine
 * User analytics, content performance, revenue tracking, cohort analysis
 */

import { db as clientDb } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  increment,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';

export interface UserInsights {
  userId: string;
  date: string;
  generationsCount: number;
  dmRepliesCount: number;
  moneyPlaysCount: number;
  imageGenerationsCount: number;
  videoGenerationsCount: number;
  totalTokensUsed: number;
  apiCallsCount: number;
  averageResponseTime: number; // ms
  errorRate: number; // percentage
}

export interface ContentPerformance {
  contentId: string;
  userId: string;
  contentType: string;
  title: string;
  views: number;
  shares: number;
  saves: number;
  engagement: number; // percentage
  sentiment: 'positive' | 'neutral' | 'negative';
  createdAt: Date;
  updatedAt: Date;
}

export interface RevenueMetrics {
  month: string;
  userId: string;
  totalRevenue: number;
  subscriptionRevenue: number;
  affiliateRevenue: number;
  addonRevenue: number;
  transactionCount: number;
  mrr: number; // Monthly recurring revenue
  churnRate: number; // percentage
}

/**
 * Track user insights
 */
export async function trackUserInsights(
  userId: string,
  metrics: Partial<UserInsights>
): Promise<void> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const today = new Date().toISOString().split('T')[0];
  const insightsRef = doc(clientDb, 'userInsights', `${userId}_${today}`);

  const batch = writeBatch(clientDb);
  batch.set(insightsRef, {
    userId,
    date: today,
    generationsCount: metrics.generationsCount || 0,
    dmRepliesCount: metrics.dmRepliesCount || 0,
    moneyPlaysCount: metrics.moneyPlaysCount || 0,
    imageGenerationsCount: metrics.imageGenerationsCount || 0,
    videoGenerationsCount: metrics.videoGenerationsCount || 0,
    totalTokensUsed: metrics.totalTokensUsed || 0,
    apiCallsCount: metrics.apiCallsCount || 0,
    averageResponseTime: metrics.averageResponseTime || 0,
    errorRate: metrics.errorRate || 0,
  });

  await batch.commit();
}

/**
 * Get user insights for date range
 */
export async function getUserInsightsRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<UserInsights[]> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const insightsRef = collection(clientDb, 'userInsights');
  const q = query(insightsRef, where('userId', '==', userId));

  const snapshot = await getDocs(q);
  const results: UserInsights[] = [];

  snapshot.docs.forEach(doc => {
    const data = doc.data() as UserInsights;
    const docDate = new Date(data.date);

    if (docDate >= startDate && docDate <= endDate) {
      results.push(data);
    }
  });

  return results.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Track content performance
 */
export async function trackContentPerformance(
  contentId: string,
  userId: string,
  metrics: Partial<ContentPerformance>
): Promise<ContentPerformance> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const performanceRef = doc(clientDb, 'contentPerformance', contentId);
  const contentPerformance: ContentPerformance = {
    contentId,
    userId,
    contentType: metrics.contentType || 'unknown',
    title: metrics.title || 'Untitled',
    views: metrics.views || 0,
    shares: metrics.shares || 0,
    saves: metrics.saves || 0,
    engagement: metrics.engagement || 0,
    sentiment: metrics.sentiment || 'neutral',
    createdAt: metrics.createdAt || new Date(),
    updatedAt: new Date(),
  };

  const batch = writeBatch(clientDb);
  batch.set(performanceRef, contentPerformance);
  await batch.commit();

  return contentPerformance;
}

/**
 * Get top performing content
 */
export async function getTopPerformingContent(
  userId: string,
  metric: 'views' | 'shares' | 'engagement' = 'views',
  limit = 10
): Promise<ContentPerformance[]> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const performanceRef = collection(clientDb, 'contentPerformance');
  const q = query(performanceRef, where('userId', '==', userId));

  const snapshot = await getDocs(q);
  const content = snapshot.docs
    .map(doc => doc.data() as ContentPerformance)
    .sort((a, b) => {
      const aValue = a[metric] as number;
      const bValue = b[metric] as number;
      return bValue - aValue;
    })
    .slice(0, limit);

  return content;
}

/**
 * Track revenue metrics
 */
export async function trackRevenueMetrics(
  userId: string,
  month: string,
  data: Partial<RevenueMetrics>
): Promise<RevenueMetrics> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const revenueRef = doc(clientDb, 'revenueMetrics', `${userId}_${month}`);
  const metrics: RevenueMetrics = {
    month,
    userId,
    totalRevenue: data.totalRevenue || 0,
    subscriptionRevenue: data.subscriptionRevenue || 0,
    affiliateRevenue: data.affiliateRevenue || 0,
    addonRevenue: data.addonRevenue || 0,
    transactionCount: data.transactionCount || 0,
    mrr: data.mrr || 0,
    churnRate: data.churnRate || 0,
  };

  const batch = writeBatch(clientDb);
  batch.set(revenueRef, metrics);
  await batch.commit();

  return metrics;
}

/**
 * Get revenue metrics for date range
 */
export async function getRevenueMetricsRange(
  userId: string,
  startMonth: string,
  endMonth: string
): Promise<RevenueMetrics[]> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const revenueRef = collection(clientDb, 'revenueMetrics');
  const q = query(revenueRef, where('userId', '==', userId));

  const snapshot = await getDocs(q);
  const results = snapshot.docs
    .map(doc => doc.data() as RevenueMetrics)
    .filter(r => r.month >= startMonth && r.month <= endMonth)
    .sort((a, b) => a.month.localeCompare(b.month));

  return results;
}

/**
 * Get user cohort analysis
 */
export async function getUserCohortAnalysis(
  joinDateStart: Date,
  joinDateEnd: Date
): Promise<{
  cohortSize: number;
  activeUsers: number;
  retentionRate: number;
  avgRevenuePerUser: number;
  avgLTVEstimate: number;
}> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const usersRef = collection(clientDb, 'users');
  const q = query(
    usersRef,
    where('createdAt', '>=', Timestamp.fromDate(joinDateStart)),
    where('createdAt', '<=', Timestamp.fromDate(joinDateEnd))
  );

  const snapshot = await getDocs(q);
  const cohortSize = snapshot.size;

  // Calculate retention (users active in last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const activeUsers = snapshot.docs.filter(doc => {
    const lastActive = doc.data().lastActivity?.toDate?.() || doc.data().createdAt?.toDate?.();
    return lastActive > thirtyDaysAgo;
  }).length;

  const retentionRate = cohortSize > 0 ? (activeUsers / cohortSize) * 100 : 0;

  // Calculate average revenue
  let totalRevenue = 0;
  let totalMRR = 0;

  for (const userDoc of snapshot.docs) {
    const userId = userDoc.id;
    const revenueRef = collection(clientDb, 'revenueMetrics');
    const revenueQ = query(revenueRef, where('userId', '==', userId));
    const revenueSnapshot = await getDocs(revenueQ);

    revenueSnapshot.docs.forEach(doc => {
      const data = doc.data() as RevenueMetrics;
      totalRevenue += data.totalRevenue || 0;
      totalMRR += data.mrr || 0;
    });
  }

  const avgRevenuePerUser = cohortSize > 0 ? totalRevenue / cohortSize : 0;
  const avgMRRPerUser = cohortSize > 0 ? totalMRR / cohortSize : 0;
  // LTV estimate: 12 months * MRR / churn rate (simplified)
  const avgLTVEstimate = avgMRRPerUser > 0 ? (avgMRRPerUser * 12) / Math.max(0.01, 0.05) : 0;

  return {
    cohortSize,
    activeUsers,
    retentionRate,
    avgRevenuePerUser,
    avgLTVEstimate,
  };
}

/**
 * Generate comprehensive analytics report
 */
export async function generateComprehensiveReport(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  period: string;
  totalGenerations: number;
  totalInteractions: number;
  topContent: ContentPerformance[];
  totalRevenue: number;
  averageEngagement: number;
  insights: string[];
}> {
  const insights = await getUserInsightsRange(userId, startDate, endDate);
  const topContent = await getTopPerformingContent(userId, 'engagement', 5);

  const totalGenerations = insights.reduce((sum, i) => sum + i.generationsCount, 0);
  const totalInteractions =
    insights.reduce((sum, i) => sum + (i.dmRepliesCount + i.moneyPlaysCount), 0) +
    totalGenerations;

  const startMonth = startDate.toISOString().slice(0, 7);
  const endMonth = endDate.toISOString().slice(0, 7);
  const revenueData = await getRevenueMetricsRange(userId, startMonth, endMonth);
  const totalRevenue = revenueData.reduce((sum, r) => sum + r.totalRevenue, 0);

  const avgEngagement =
    topContent.length > 0
      ? topContent.reduce((sum, c) => sum + c.engagement, 0) / topContent.length
      : 0;

  // Generate insights
  const generatedInsights: string[] = [];
  if (totalGenerations > 1000) {
    generatedInsights.push('⚡ You\'re a power user! 1000+ generations this period.');
  }
  if (avgEngagement > 60) {
    generatedInsights.push('🔥 Excellent engagement! Your content is resonating with audiences.');
  }
  if (totalRevenue > 1000) {
    generatedInsights.push('💰 Strong revenue growth this period.');
  }

  return {
    period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    totalGenerations,
    totalInteractions,
    topContent,
    totalRevenue,
    averageEngagement: Math.round(avgEngagement),
    insights: generatedInsights,
  };
}

export default {
  trackUserInsights,
  getUserInsightsRange,
  trackContentPerformance,
  getTopPerformingContent,
  trackRevenueMetrics,
  getRevenueMetricsRange,
  getUserCohortAnalysis,
  generateComprehensiveReport,
};
