/**
 * List Item for Sale in Marketplace
 * POST /api/marketplace/list
 */

import { NextRequest, NextResponse } from 'next/server';
import { marketplace } from '@/lib/marketplace';
import { extractAuth } from '@/lib/auth-middleware';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ListItemSchema = z.object({
  type: z.enum([
    'ai_template',
    'image',
    'video',
    'audio',
    'bot',
    'service',
    'preset',
    'bundle',
    'subscription',
  ]),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  price: z.number().min(0), // cents
  pricing_model: z.enum(['one_time', 'subscription', 'pay_what_you_want', 'free', 'rental', 'commission']),
  min_price: z.number().optional(),
  commission_rate: z.number().min(0).max(1).optional(),
  preview_url: z.string().url().optional(),
  file_url: z.string().url().optional(),
  demo_url: z.string().url().optional(),
  tags: z.array(z.string()).max(10),
  category: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await extractAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = ListItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Create marketplace listing
    const item = await marketplace.createListing({
      creator_id: auth.userId,
      type: data.type,
      title: data.title,
      description: data.description,
      price: data.price,
      pricing_model: data.pricing_model,
      min_price: data.min_price,
      commission_rate: data.commission_rate,
      preview_url: data.preview_url,
      file_url: data.file_url,
      demo_url: data.demo_url,
      tags: data.tags,
      category: data.category,
      downloads: 0,
      revenue: 0,
      rating: 0,
      reviews_count: 0,
      is_featured: false,
    });

    return NextResponse.json({
      success: true,
      item,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to list item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
