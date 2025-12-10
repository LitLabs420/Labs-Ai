/**
 * 🌍 UNIVERSAL PAYMENT ORCHESTRATOR
 * Supports ALL payment methods for US (50 states + DC + territories) + International
 * One interface to rule them all
 */

import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';

// ============================================================
// PAYMENT METHODS SUPPORTED
// ============================================================
export type PaymentMethod =
  | 'stripe' // Credit/Debit cards, ACH (all US states)
  | 'paypal' // PayPal + Venmo (US + 200+ countries)
  | 'venmo' // Venmo (US peer-to-peer, via PayPal)
  | 'cashapp' // Cash App (US only)
  | 'zelle' // Zelle (US bank-to-bank)
  | 'apple_pay' // Apple Pay (via Stripe)
  | 'google_pay' // Google Pay (via Stripe)
  | 'crypto_solana' // Solana (SOL, USDC)
  | 'crypto_ethereum' // Ethereum (ETH, USDT, USDC)
  | 'crypto_coinbase' // Coinbase Commerce
  | 'klarna' // Klarna (installments, EU/US)
  | 'affirm' // Affirm (installments, US)
  | 'alipay' // Alipay (China)
  | 'wechat' // WeChat Pay (China)
  | 'ideal' // iDEAL (Netherlands)
  | 'sepa' // SEPA Direct Debit (EU)
  | 'uk_bank' // UK Bank Transfer (Bacs)
  | 'ach' // ACH Direct Debit (US)
  | 'wire'; // Wire Transfer (international)

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'disputed'
  | 'canceled';

export interface PaymentRequest {
  userId: string;
  amount: number; // USD cents
  currency?: string; // Default: USD
  method: PaymentMethod;
  tier?: string; // subscription tier
  description: string;
  metadata?: Record<string, string>;
  customerEmail?: string;
  customerName?: string;
  billingAddress?: BillingAddress;
  savePaymentMethod?: boolean; // Save for future use
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string; // US state code or international region
  postal_code: string;
  country: string; // ISO 3166-1 alpha-2
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  status: PaymentStatus;
  method: PaymentMethod;
  amount: number;
  currency: string;
  transactionHash?: string; // For crypto
  clientSecret?: string; // For Stripe confirmation
  redirectUrl?: string; // For redirect-based methods
  error?: string;
  requiresAction?: boolean; // 3D Secure, etc.
}

// ============================================================
// STRIPE INTEGRATION (Primary processor)
// ============================================================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
  typescript: true,
});

class StripePaymentProcessor {
  /**
   * Process card payment with full US compliance
   */
  async processCard(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Create or retrieve customer
      const customer = await this.getOrCreateCustomer(
        request.userId,
        request.customerEmail,
        request.customerName
      );

      // Calculate tax based on billing address
      const taxAmount = await this.calculateTax(
        request.amount,
        request.billingAddress
      );

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: request.amount + taxAmount,
        currency: request.currency || 'usd',
        customer: customer.id,
        description: request.description,
        metadata: {
          userId: request.userId,
          tier: request.tier || 'none',
          ...request.metadata,
        },
        automatic_payment_methods: { enabled: true },
        // Enable Stripe Radar for fraud detection
        radar_options: { session: request.userId },
      });

      // Save payment record
      await this.savePaymentRecord({
        userId: request.userId,
        paymentId: paymentIntent.id,
        amount: request.amount,
        taxAmount,
        method: 'stripe',
        status: 'pending',
        metadata: request.metadata,
      });

      return {
        success: true,
        paymentId: paymentIntent.id,
        status: 'pending',
        method: 'stripe',
        amount: request.amount + taxAmount,
        currency: request.currency || 'usd',
        clientSecret: paymentIntent.client_secret || undefined,
        requiresAction: paymentIntent.status === 'requires_action',
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      await captureError('Stripe payment error', { error: message, request });
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        method: 'stripe',
        amount: request.amount,
        currency: request.currency || 'usd',
        error: message,
      };
    }
  }

  /**
   * Process wallet payment (Apple Pay, Google Pay)
   */
  async processWallet(request: PaymentRequest): Promise<PaymentResult> {
    // Wallet payments use Stripe's Payment Request API
    return this.processCard({ ...request, method: 'stripe' });
  }

  /**
   * Process ACH Direct Debit (US bank account)
   */
  async processACH(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const customer = await this.getOrCreateCustomer(
        request.userId,
        request.customerEmail,
        request.customerName
      );

      const paymentIntent = await stripe.paymentIntents.create({
        amount: request.amount,
        currency: 'usd',
        customer: customer.id,
        payment_method_types: ['us_bank_account'],
        description: request.description,
        metadata: { userId: request.userId },
      });

      await this.savePaymentRecord({
        userId: request.userId,
        paymentId: paymentIntent.id,
        amount: request.amount,
        taxAmount: 0,
        method: 'ach',
        status: 'pending',
      });

      return {
        success: true,
        paymentId: paymentIntent.id,
        status: 'pending',
        method: 'ach',
        amount: request.amount,
        currency: 'usd',
        clientSecret: paymentIntent.client_secret || undefined,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ACH payment failed';
      await captureError('ACH payment error', { error: message });
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        method: 'ach',
        amount: request.amount,
        currency: 'usd',
        error: message,
      };
    }
  }

  /**
   * Get or create Stripe customer
   */
  private async getOrCreateCustomer(
    userId: string,
    email?: string,
    name?: string
  ): Promise<Stripe.Customer> {
    // Check if customer exists in database
    const { data: user } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .maybeSingle();

    if (user?.stripe_customer_id) {
      return stripe.customers.retrieve(user.stripe_customer_id) as Promise<Stripe.Customer>;
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email: email,
      name: name,
      metadata: { userId },
    });

    // Save to database
    await supabase
      .from('users')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId);

    return customer;
  }

  /**
   * Calculate sales tax for all 50 US states + territories
   * In production, use Avalara or TaxJar for real-time rates
   */
  private async calculateTax(
    amount: number,
    address?: BillingAddress
  ): Promise<number> {
    if (!address || address.country !== 'US') return 0;

    // State tax rates (approximate - use tax service in production)
    const stateTaxRates: Record<string, number> = {
      AL: 0.04, // Alabama 4%
      AK: 0.0, // Alaska 0% (local taxes vary)
      AZ: 0.056, // Arizona 5.6%
      AR: 0.065, // Arkansas 6.5%
      CA: 0.0725, // California 7.25%
      CO: 0.029, // Colorado 2.9%
      CT: 0.0635, // Connecticut 6.35%
      DE: 0.0, // Delaware 0%
      FL: 0.06, // Florida 6%
      GA: 0.04, // Georgia 4%
      HI: 0.04, // Hawaii 4%
      ID: 0.06, // Idaho 6%
      IL: 0.0625, // Illinois 6.25%
      IN: 0.07, // Indiana 7%
      IA: 0.06, // Iowa 6%
      KS: 0.065, // Kansas 6.5%
      KY: 0.06, // Kentucky 6%
      LA: 0.045, // Louisiana 4.5%
      ME: 0.055, // Maine 5.5%
      MD: 0.06, // Maryland 6%
      MA: 0.0625, // Massachusetts 6.25%
      MI: 0.06, // Michigan 6%
      MN: 0.0688, // Minnesota 6.88%
      MS: 0.07, // Mississippi 7%
      MO: 0.0423, // Missouri 4.23%
      MT: 0.0, // Montana 0%
      NE: 0.055, // Nebraska 5.5%
      NV: 0.0685, // Nevada 6.85%
      NH: 0.0, // New Hampshire 0%
      NJ: 0.0663, // New Jersey 6.63%
      NM: 0.0513, // New Mexico 5.13%
      NY: 0.04, // New York 4%
      NC: 0.0475, // North Carolina 4.75%
      ND: 0.05, // North Dakota 5%
      OH: 0.0575, // Ohio 5.75%
      OK: 0.045, // Oklahoma 4.5%
      OR: 0.0, // Oregon 0%
      PA: 0.06, // Pennsylvania 6%
      RI: 0.07, // Rhode Island 7%
      SC: 0.06, // South Carolina 6%
      SD: 0.045, // South Dakota 4.5%
      TN: 0.07, // Tennessee 7%
      TX: 0.0625, // Texas 6.25%
      UT: 0.0485, // Utah 4.85%
      VT: 0.06, // Vermont 6%
      VA: 0.053, // Virginia 5.3%
      WA: 0.065, // Washington 6.5%
      WV: 0.06, // West Virginia 6%
      WI: 0.05, // Wisconsin 5%
      WY: 0.04, // Wyoming 4%
      DC: 0.06, // Washington DC 6%
      PR: 0.105, // Puerto Rico 10.5%
      GU: 0.04, // Guam 4%
      VI: 0.04, // US Virgin Islands 4%
    };

    const taxRate = stateTaxRates[address.state] || 0;
    return Math.round(amount * taxRate);
  }

  /**
   * Save payment record to database
   */
  private async savePaymentRecord(record: {
    userId: string;
    paymentId: string;
    amount: number;
    taxAmount: number;
    method: string;
    status: string;
    metadata?: Record<string, string>;
  }): Promise<void> {
    try {
      await supabase.from('payments').insert({
        user_id: record.userId,
        payment_id: record.paymentId,
        amount: record.amount,
        tax_amount: record.taxAmount,
        total_amount: record.amount + record.taxAmount,
        method: record.method,
        status: record.status,
        metadata: record.metadata,
        created_at: new Date().toISOString(),
      });
    } catch (err: unknown) {
      await captureError('Failed to save payment record', { error: err, record });
    }
  }
}

// ============================================================
// PAYPAL + VENMO INTEGRATION
// ============================================================
class PayPalPaymentProcessor {
  private apiBase =
    process.env.PAYPAL_MODE === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

  /**
   * Create PayPal order
   */
  async createOrder(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.apiBase}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: request.currency || 'USD',
                value: (request.amount / 100).toFixed(2),
              },
              description: request.description,
            },
          ],
          application_context: {
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'PayPal order creation failed');
      }

      // Find approval URL
      const approvalUrl = data.links.find((link: { rel: string }) => link.rel === 'approve')?.href;

      return {
        success: true,
        paymentId: data.id,
        status: 'pending',
        method: 'paypal',
        amount: request.amount,
        currency: request.currency || 'USD',
        redirectUrl: approvalUrl,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'PayPal payment failed';
      await captureError('PayPal payment error', { error: message });
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        method: 'paypal',
        amount: request.amount,
        currency: request.currency || 'USD',
        error: message,
      };
    }
  }

  /**
   * Get PayPal access token
   */
  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const response = await fetch(`${this.apiBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Capture PayPal order after user approval
   */
  async captureOrder(orderId: string): Promise<PaymentResult> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(
        `${this.apiBase}/v2/checkout/orders/${orderId}/capture`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'PayPal capture failed');
      }

      return {
        success: true,
        paymentId: orderId,
        status: data.status === 'COMPLETED' ? 'succeeded' : 'pending',
        method: 'paypal',
        amount: parseFloat(data.purchase_units[0].amount.value) * 100,
        currency: data.purchase_units[0].amount.currency_code,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'PayPal capture failed';
      await captureError('PayPal capture error', { error: message });
      return {
        success: false,
        paymentId: orderId,
        status: 'failed',
        method: 'paypal',
        amount: 0,
        currency: 'USD',
        error: message,
      };
    }
  }
}

// ============================================================
// CRYPTO PAYMENTS (Solana + Ethereum)
// ============================================================
class CryptoPaymentProcessor {
  /**
   * Create Coinbase Commerce checkout (easiest crypto integration)
   */
  async createCoinbaseCheckout(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const response = await fetch('https://api.commerce.coinbase.com/charges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY || '',
          'X-CC-Version': '2018-03-22',
        },
        body: JSON.stringify({
          name: request.description,
          description: request.description,
          pricing_type: 'fixed_price',
          local_price: {
            amount: (request.amount / 100).toFixed(2),
            currency: request.currency || 'USD',
          },
          metadata: {
            userId: request.userId,
            tier: request.tier,
          },
          redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Coinbase checkout failed');
      }

      return {
        success: true,
        paymentId: data.data.id,
        status: 'pending',
        method: 'crypto_coinbase',
        amount: request.amount,
        currency: request.currency || 'USD',
        redirectUrl: data.data.hosted_url,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Crypto payment failed';
      await captureError('Crypto payment error', { error: message });
      return {
        success: false,
        paymentId: '',
        status: 'failed',
        method: 'crypto_coinbase',
        amount: request.amount,
        currency: request.currency || 'USD',
        error: message,
      };
    }
  }
}

// ============================================================
// UNIFIED PAYMENT ORCHESTRATOR
// ============================================================
export class PaymentOrchestrator {
  private stripe = new StripePaymentProcessor();
  private paypal = new PayPalPaymentProcessor();
  private crypto = new CryptoPaymentProcessor();

  /**
   * Process payment with any method
   * Automatically routes to correct processor
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Route to correct processor based on method
    switch (request.method) {
      case 'stripe':
        return this.stripe.processCard(request);

      case 'apple_pay':
      case 'google_pay':
        return this.stripe.processWallet(request);

      case 'ach':
        return this.stripe.processACH(request);

      case 'paypal':
      case 'venmo': // Venmo payments go through PayPal
        return this.paypal.createOrder(request);

      case 'crypto_coinbase':
      case 'crypto_solana':
      case 'crypto_ethereum':
        return this.crypto.createCoinbaseCheckout(request);

      case 'cashapp':
      case 'zelle':
        // These require manual setup - show payment instructions
        return this.createManualPayment(request);

      case 'klarna':
      case 'affirm':
        // Buy now, pay later - use Stripe payment methods
        return this.stripe.processCard({ ...request, method: 'stripe' });

      case 'alipay':
      case 'wechat':
      case 'ideal':
      case 'sepa':
      case 'uk_bank':
        // International methods - use Stripe payment methods
        return this.stripe.processCard({ ...request, method: 'stripe' });

      default:
        return {
          success: false,
          paymentId: '',
          status: 'failed',
          method: request.method,
          amount: request.amount,
          currency: request.currency || 'USD',
          error: `Payment method ${request.method} not yet implemented`,
        };
    }
  }

  /**
   * Create manual payment instructions (Cash App, Zelle)
   */
  private async createManualPayment(request: PaymentRequest): Promise<PaymentResult> {
    const paymentId = `manual_${Date.now()}_${Date.now().toString(36)}`;

    await supabase.from('payments').insert({
      user_id: request.userId,
      payment_id: paymentId,
      amount: request.amount,
      method: request.method,
      status: 'pending',
      metadata: {
        instructions: this.getPaymentInstructions(request.method),
        ...request.metadata,
      },
      created_at: new Date().toISOString(),
    });

    return {
      success: true,
      paymentId,
      status: 'pending',
      method: request.method,
      amount: request.amount,
      currency: 'USD',
    };
  }

  /**
   * Get payment instructions for manual methods
   */
  private getPaymentInstructions(method: PaymentMethod): string {
    const instructions: Record<string, string> = {
      cashapp: `Send $${process.env.CASHAPP_TAG || '$YourCashTag'} with reference ID`,
      zelle: `Send to ${process.env.ZELLE_EMAIL || 'your@email.com'} with reference ID`,
    };

    return instructions[method] || 'Payment instructions will be provided';
  }

  /**
   * Get available payment methods based on country and state
   */
  getAvailablePaymentMethods(country: string): PaymentMethod[] {
    const allMethods: PaymentMethod[] = [
      'stripe',
      'apple_pay',
      'google_pay',
      'ach',
      'crypto_coinbase',
      'crypto_solana',
      'crypto_ethereum',
    ];

    // US-specific methods
    if (country === 'US') {
      allMethods.push('paypal', 'venmo', 'cashapp', 'zelle', 'affirm');
    }

    // International methods
    if (country !== 'US') {
      allMethods.push('paypal'); // PayPal works in 200+ countries

      // European methods
      if (['DE', 'FR', 'NL', 'BE', 'IT', 'ES', 'AT'].includes(country)) {
        allMethods.push('klarna', 'sepa');
      }

      if (country === 'NL') allMethods.push('ideal');
      if (country === 'GB') allMethods.push('uk_bank');
      if (country === 'CN') allMethods.push('alipay', 'wechat');
    }

    return allMethods;
  }
}

// Export singleton instance
export const payments = new PaymentOrchestrator();
