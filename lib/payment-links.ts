import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export interface PaymentLink {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: 'product' | 'subscription' | 'donation';
  amount: number;
  currency: string;
  stripePaymentLinkId: string;
  url: string;
  customDomain?: string;
  productId?: string;
  priceId?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  conversionCount: number;
}

// Create a payment link in Stripe
export async function createStripePaymentLink(
  userId: string,
  data: {
    title: string;
    description?: string;
    type: 'product' | 'subscription' | 'donation';
    amount: number;
    currency?: string;
    productName?: string;
    quantity?: number;
    successUrl?: string;
    cancelUrl?: string;
    customDomain?: string;
    billingInterval?: 'month' | 'year';
  }
): Promise<PaymentLink> {
  try {
    const currency = data.currency || 'usd';

    // Create price for the product
    let priceId: string;

    if (data.type === 'product') {
      // One-time purchase
      const product = await stripe.products.create({
        name: data.productName || data.title,
        metadata: {
          userId,
          linkType: data.type,
        },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: data.amount,
        currency,
        metadata: { userId },
      });

      priceId = price.id;
    } else if (data.type === 'subscription') {
      // Recurring subscription
      const product = await stripe.products.create({
        name: data.productName || data.title,
        metadata: {
          userId,
          linkType: data.type,
        },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: data.amount,
        currency,
        recurring: {
          interval: data.billingInterval || 'month',
          interval_count: 1,
        },
        metadata: { userId },
      });

      priceId = price.id;
    } else {
      // Donation - variable amount
      const product = await stripe.products.create({
        name: data.productName || data.title,
        type: 'service',
        metadata: {
          userId,
          linkType: data.type,
        },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: data.amount,
        currency,
        metadata: { userId },
      });

      priceId = price.id;
    }

    // Create the payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: priceId,
          quantity: data.quantity || 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: data.successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/success`,
        },
      },
      metadata: {
        userId,
        linkType: data.type,
        customTitle: data.title,
      },
    });

    // Build the payment URL with custom domain if provided
    let paymentUrl = paymentLink.url;
    if (data.customDomain) {
      paymentUrl = paymentLink.url.replace(
        'https://buy.stripe.com',
        `https://${data.customDomain}`
      );
    }

    const link: PaymentLink = {
      id: `link_${Date.now()}`,
      userId,
      title: data.title,
      description: data.description,
      type: data.type,
      amount: data.amount,
      currency,
      stripePaymentLinkId: paymentLink.id,
      url: paymentUrl,
      customDomain: data.customDomain,
      priceId,
      successUrl: data.successUrl,
      cancelUrl: data.cancelUrl,
      metadata: {
        stripeProductName: data.productName || data.title,
      },
      active: paymentLink.active,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
      conversionCount: 0,
    };

    return link;
  } catch (error) {
    console.error('Error creating payment link:', error);
    throw new Error(`Failed to create payment link: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get payment link details from Stripe
export async function getStripePaymentLink(
  paymentLinkId: string
): Promise<Stripe.PaymentLink | null> {
  try {
    return await stripe.paymentLinks.retrieve(paymentLinkId);
  } catch (error) {
    console.error('Error retrieving payment link:', error);
    return null;
  }
}

// Update payment link status
export async function updateStripePaymentLink(
  paymentLinkId: string,
  active: boolean
): Promise<Stripe.PaymentLink | null> {
  try {
    return await stripe.paymentLinks.update(paymentLinkId, { active });
  } catch (error) {
    console.error('Error updating payment link:', error);
    return null;
  }
}

// List all payment links for a user from Firestore
export async function getUserPaymentLinks(userId: string): Promise<PaymentLink[]> {
  try {
    const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
    const db = getFirestore();

    const q = query(
      collection(db, 'users', userId, 'paymentLinks'),
      where('active', '==', true)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data() as PaymentLink);
  } catch (error) {
    console.error('Error fetching payment links:', error);
    throw error;
  }
}

// Delete payment link
export async function deletePaymentLink(
  paymentLinkId: string
): Promise<boolean> {
  try {
    await stripe.paymentLinks.update(paymentLinkId, { active: false });
    return true;
  } catch (error) {
    console.error('Error deleting payment link:', error);
    return false;
  }
}

// Get payment link statistics
export async function getPaymentLinkStats(
  paymentLinkId: string
): Promise<{
  views: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
} | null> {
  try {
    const link = await getStripePaymentLink(paymentLinkId);
    if (!link) return null;

    // Get session data from Stripe
    const sessions = await stripe.checkout.sessions.list({
      payment_link: paymentLinkId,
      limit: 100,
    });

    const completedSessions = sessions.data.filter((s) => s.payment_status === 'paid');
    const totalRevenue = completedSessions.reduce((sum, s) => sum + (s.amount_total || 0), 0);

    return {
      views: link.url ? 1 : 0,
      conversions: completedSessions.length,
      revenue: totalRevenue / 100,
      conversionRate:
        sessions.data.length > 0
          ? (completedSessions.length / sessions.data.length) * 100
          : 0,
    };
  } catch (error) {
    console.error('Error getting payment link stats:', error);
    return null;
  }
}

// Validate payment link data
export function validatePaymentLinkData(data: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (data.title && data.title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }

  if (!data.type || !['product', 'subscription', 'donation'].includes(data.type)) {
    errors.push('Invalid payment link type');
  }

  if (typeof data.amount !== 'number' || data.amount < 0) {
    errors.push('Amount must be a positive number');
  }

  if (data.amount < 0.5) {
    errors.push('Minimum amount is $0.50');
  }

  if (data.amount > 999999.99) {
    errors.push('Maximum amount is $999,999.99');
  }

  if (data.currency && !/^[a-z]{3}$/.test(data.currency)) {
    errors.push('Invalid currency code');
  }

  if (
    data.type === 'subscription' &&
    (!data.billingInterval || !['month', 'year'].includes(data.billingInterval))
  ) {
    errors.push('Billing interval is required for subscriptions');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Format payment link for display
export function formatPaymentLink(link: PaymentLink): {
  title: string;
  amount: string;
  type: string;
  url: string;
  shortUrl: string;
} {
  const typeLabels = {
    product: 'One-Time Purchase',
    subscription: 'Recurring Subscription',
    donation: 'Donation',
  };

  const shortUrl = link.url.substring(0, 50) + (link.url.length > 50 ? '...' : '');

  return {
    title: link.title,
    amount: `${link.currency.toUpperCase()} ${(link.amount / 100).toFixed(2)}`,
    type: typeLabels[link.type],
    url: link.url,
    shortUrl,
  };
}

// Generate share-friendly payment link URL
export function generateShareURL(link: PaymentLink, format: 'direct' | 'qr' = 'direct'): string {
  if (format === 'qr') {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link.url)}`;
  }
  return link.url;
}
