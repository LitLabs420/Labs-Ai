/**
 * Explore Marketplace - Trending Items
 * GET /api/marketplace/explore
 */

import { NextRequest, NextResponse } from 'next/server';
import { marketplace } from '@/lib/marketplace';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const query = searchParams.get('q');

    let items;

    if (query) {
      // Search mode
      const type = searchParams.get('type') as any;
      const minPrice = searchParams.get('min_price');
      const maxPrice = searchParams.get('max_price');
      const tags = searchParams.get('tags')?.split(',');

      items = await marketplace.searchMarketplace(query, {
        type,
        minPrice: minPrice ? parseInt(minPrice) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
        tags,
      });
    } else {
      // Trending mode
      items = await marketplace.getTrendingItems(limit);
    }

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to get marketplace items';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
