/**
 * 🎯 White-Label Configuration System
 * Custom branding, domain mapping, and feature control
 */

import { db as clientDb } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

export interface WhiteLabelConfig {
  userId: string;
  customDomain?: string;
  companyName: string;
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  headerText?: string;
  footerText?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
  supportEmail?: string;
  customCSS?: string;
  features: {
    customBranding: boolean;
    whiteLabel: boolean;
    clientPortal: boolean;
    teamCollaboration: boolean;
    advancedReporting: boolean;
    apiAccess: boolean;
    webhooks: boolean;
    customDomain: boolean;
    ssoIntegration: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientPortal {
  id: string;
  agencyUserId: string;
  clientUserId: string;
  customDomain?: string;
  accessLevel: 'view' | 'edit' | 'admin';
  features: string[];
  customBranding: {
    logo?: string;
    primaryColor?: string;
    companyName?: string;
  };
  isActive: boolean;
  createdAt: Date;
}

/**
 * Create white-label config
 */
export async function createWhiteLabelConfig(
  userId: string,
  config: Partial<WhiteLabelConfig>
): Promise<WhiteLabelConfig> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const whiteLabelConfig: WhiteLabelConfig = {
    userId,
    companyName: config.companyName || 'My Company',
    primaryColor: config.primaryColor || '#000000',
    secondaryColor: config.secondaryColor || '#FFFFFF',
    accentColor: config.accentColor || '#007BFF',
    fontFamily: config.fontFamily || 'Inter, sans-serif',
    features: {
      customBranding: true,
      whiteLabel: true,
      clientPortal: true,
      teamCollaboration: true,
      advancedReporting: true,
      apiAccess: true,
      webhooks: true,
      customDomain: true,
      ssoIntegration: false,
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...config,
  };

  const configRef = doc(clientDb, 'whiteLabelConfigs', userId);
  await setDoc(configRef, whiteLabelConfig);

  return whiteLabelConfig;
}

/**
 * Get white-label config
 */
export async function getWhiteLabelConfig(
  userId: string
): Promise<WhiteLabelConfig | null> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const configRef = doc(clientDb, 'whiteLabelConfigs', userId);
  const configDoc = await getDoc(configRef);

  if (!configDoc.exists()) return null;

  const data = configDoc.data();
  return {
    ...data as WhiteLabelConfig,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  };
}

/**
 * Update white-label config
 */
export async function updateWhiteLabelConfig(
  userId: string,
  updates: Partial<WhiteLabelConfig>
): Promise<WhiteLabelConfig> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const configRef = doc(clientDb, 'whiteLabelConfigs', userId);
  
  await updateDoc(configRef, {
    ...updates,
    updatedAt: new Date(),
  });

  const updated = await getWhiteLabelConfig(userId);
  if (!updated) throw new Error('Failed to update config');

  return updated;
}

/**
 * Get config by custom domain
 */
export async function getWhiteLabelConfigByDomain(
  customDomain: string
): Promise<WhiteLabelConfig | null> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const configsRef = collection(clientDb, 'whiteLabelConfigs');
  const q = query(configsRef, where('customDomain', '==', customDomain));

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const data = snapshot.docs[0].data();
  return {
    ...data as WhiteLabelConfig,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  };
}

/**
 * Create client portal
 */
export async function createClientPortal(
  agencyUserId: string,
  clientUserId: string,
  accessLevel: 'view' | 'edit' | 'admin' = 'view'
): Promise<ClientPortal> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const portal: ClientPortal = {
    id: `${Date.now()}`,
    agencyUserId,
    clientUserId,
    accessLevel,
    features: ['view_content', 'view_analytics', 'view_invoices'],
    customBranding: {},
    isActive: true,
    createdAt: new Date(),
  };

  const portalRef = doc(clientDb, 'clientPortals', portal.id);
  await setDoc(portalRef, portal);

  return portal;
}

/**
 * Get client portals for agency
 */
export async function getClientPortals(agencyUserId: string): Promise<ClientPortal[]> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const portalsRef = collection(clientDb, 'clientPortals');
  const q = query(portalsRef, where('agencyUserId', '==', agencyUserId));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data() as ClientPortal,
    createdAt: doc.data().createdAt?.toDate?.() || new Date(),
  }));
}

/**
 * Update client portal access
 */
export async function updateClientPortalAccess(
  portalId: string,
  accessLevel: 'view' | 'edit' | 'admin'
): Promise<void> {
  if (!clientDb) throw new Error('Firebase not initialized');

  const portalRef = doc(clientDb, 'clientPortals', portalId);
  await updateDoc(portalRef, { accessLevel });
}

/**
 * Generate white-label CSS
 */
export function generateWhiteLabelCSS(config: WhiteLabelConfig): string {
  return `
    :root {
      --primary-color: ${config.primaryColor};
      --secondary-color: ${config.secondaryColor};
      --accent-color: ${config.accentColor};
      --font-family: ${config.fontFamily};
    }

    body {
      font-family: var(--font-family);
      color: var(--primary-color);
    }

    button, .btn {
      background-color: var(--accent-color);
      color: var(--secondary-color);
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    button:hover, .btn:hover {
      opacity: 0.9;
    }

    a {
      color: var(--accent-color);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    .header {
      background-color: var(--primary-color);
      color: var(--secondary-color);
      padding: 1rem;
    }

    .logo {
      max-height: 60px;
      width: auto;
    }

    .card {
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1rem;
      background-color: var(--secondary-color);
    }

    ${config.customCSS || ''}
  `;
}

/**
 * Verify domain ownership
 */
export async function verifyDomainOwnership(
  userId: string,
  domain: string
): Promise<boolean> {
  // In production, this would check DNS TXT records
  // For now, return true and let the system handle it
  const txtRecord = `litlabs-verify-${userId}`;
  
  // TODO: Implement actual DNS verification
  console.log(`To verify domain ${domain}, add TXT record: ${txtRecord}`);
  
  return true;
}

/**
 * Get theme CSS for domain
 */
export async function getThemeCSSForDomain(domain: string): Promise<string> {
  const config = await getWhiteLabelConfigByDomain(domain);
  if (!config) return '';

  return generateWhiteLabelCSS(config);
}

export default {
  createWhiteLabelConfig,
  getWhiteLabelConfig,
  updateWhiteLabelConfig,
  getWhiteLabelConfigByDomain,
  createClientPortal,
  getClientPortals,
  updateClientPortalAccess,
  generateWhiteLabelCSS,
  verifyDomainOwnership,
  getThemeCSSForDomain,
};
