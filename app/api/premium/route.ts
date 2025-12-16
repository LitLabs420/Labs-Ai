import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  return NextResponse.json({ message: 'Premium API' });
}

export async function POST(_request: NextRequest) {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
