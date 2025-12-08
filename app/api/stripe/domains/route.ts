import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helper';
import { createCustomDomain, validateDomainFormat, getDomainPricing } from '@/lib/stripe-domain';
import { db } from '@/lib/firebase-admin';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const domainSchema = z.object({
  domain: z.string().min(1).refine((d) => validateDomainFormat(d), {
    message: 'Invalid domain format',
  }),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = domainSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    const { domain } = validation.data;

    const customDomain = await createCustomDomain(domain, user.uid);

    const domainData = {
      domain: customDomain.domain,
      status: customDomain.status,
      stripeId: customDomain.id,
      createdAt: new Date(),
      certificateStatus: customDomain.certificateStatus,
    };

    await db
      .collection('users')
      .doc(user.uid)
      .collection('stripeDomains')
      .doc(customDomain.id)
      .set(domainData);

    return NextResponse.json({
      success: true,
      data: customDomain,
      pricing: getDomainPricing(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add domain';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const domainsSnapshot = await db
      .collection('users')
      .doc(user.uid)
      .collection('stripeDomains')
      .get();

    const domains = domainsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: domains,
      count: domains.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch domains';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
