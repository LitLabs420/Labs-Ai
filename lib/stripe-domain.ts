import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export interface StripeCustomDomain {
  id: string;
  domain: string;
  status: 'verified' | 'pending' | 'unverified' | 'failed';
  createdAt: Date;
  expiresAt?: Date;
  certificateStatus?: 'pending' | 'active' | 'failed';
  dnsRecords?: {
    type: 'CNAME' | 'TXT';
    name: string;
    value: string;
  }[];
}

/**
 * Create a custom domain for Stripe payment pages
 */
export async function createCustomDomain(
  domainName: string,
  userId: string
): Promise<StripeCustomDomain> {
  try {
    // Create domain in Stripe
    const domain = await stripe.customDomains.create({
      domain_name: domainName,
    });

    return {
      id: domain.id,
      domain: domain.domain_name,
      status: domain.status as 'verified' | 'pending' | 'unverified' | 'failed',
      createdAt: new Date(),
      certificateStatus: domain.tls_version ? 'active' : 'pending',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create custom domain';
    throw new Error(message);
  }
}

export async function listCustomDomains(): Promise<StripeCustomDomain[]> {
  try {
    const domains = await stripe.customDomains.list();

    return domains.data.map((domain: any) => ({
      id: domain.id,
      domain: domain.domain_name,
      status: domain.status,
      createdAt: new Date(domain.created * 1000),
      certificateStatus: domain.tls_version ? 'active' : 'pending',
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list custom domains';
    throw new Error(message);
  }
}

/**
 * Get a specific custom domain
 */
export async function getCustomDomain(domainId: string): Promise<StripeCustomDomain> {
  try {
    const domain = await stripe.customDomains.retrieve(domainId);

    return {
      id: domain.id,
      domain: domain.domain_name,
      status: domain.status as 'verified' | 'pending' | 'unverified' | 'failed',
      createdAt: new Date(domain.created * 1000),
      certificateStatus: domain.tls_version ? 'active' : 'pending',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get custom domain';
    throw new Error(message);
  }
}

/**
 * Delete a custom domain
 */
export async function deleteCustomDomain(domainId: string): Promise<void> {
  try {
    await stripe.customDomains.del(domainId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete custom domain';
    throw new Error(message);
  }
}

/**
 * Get DNS records needed for domain verification
 */
export function getDNSRecords(domain: string): any[] {
  // DNS records would come from Stripe's verification process
  return [
    {
      type: 'CNAME',
      name: domain,
      value: `cname.stripe.com`,
      ttl: 3600,
    },
    {
      type: 'TXT',
      name: `_acme-challenge.${domain}`,
      value: 'stripe-verification-token',
      ttl: 3600,
    },
  ];
}

/**
 * Get domain endpoints
 */
export function getDomainEndpoints(domain: string) {
  return {
    checkout: `https://${domain}/c/...`,
    paymentLinks: `https://${domain}/b/...`,
    customerPortal: `https://${domain}/p/...`,
    invoices: `https://${domain}/invoices/...`,
    quotes: `https://${domain}/quotes/...`,
  };
}

/**
 * Validate domain format
 */
export function validateDomainFormat(domain: string): boolean {
  // Basic domain validation
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
  return domainRegex.test(domain);
}

/**
 * Get domain pricing
 */
export function getDomainPricing() {
  return {
    monthlyPrice: 1000, // $10.00 USD in cents
    currency: 'usd',
    billingCycle: 'monthly',
    description: 'Custom domain for Stripe payment pages, customer portal, and payment links',
  };
}
