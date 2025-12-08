import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helper';
import { createStripePaymentLink, validatePaymentLinkData } from '@/lib/payment-links';
import { getFirestore, collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const createPaymentLinkSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(['product', 'subscription', 'donation']),
  amount: z.number().positive(),
  currency: z.string().default('usd'),
  productName: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  billingInterval: z.enum(['month', 'year']).optional(),
  customDomain: z.string().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getFirestore();
    const q = query(
      collection(db, 'users', user.uid, 'paymentLinks'),
      where('active', '==', true)
    );

    const snapshot = await getDocs(q);
    const links = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    return NextResponse.json({ links });
  } catch (error) {
    console.error('Error fetching payment links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment links' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createPaymentLinkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const validation = validatePaymentLinkData(parsed.data);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    // Create payment link in Stripe
    const paymentLink = await createStripePaymentLink(user.uid, parsed.data);

    // Save to Firestore
    const db = getFirestore();
    const linkRef = doc(
      collection(db, 'users', user.uid, 'paymentLinks'),
      paymentLink.id
    );

    await setDoc(linkRef, {
      ...paymentLink,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(paymentLink, { status: 201 });
  } catch (error) {
    console.error('Error creating payment link:', error);
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    );
  }
}
