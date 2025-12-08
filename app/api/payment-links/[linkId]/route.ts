import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helper';
import { updateStripePaymentLink, deletePaymentLink, getPaymentLinkStats } from '@/lib/payment-links';
import { getFirestore, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getFirestore();
    const linkRef = doc(db, 'users', user.uid, 'paymentLinks', params.linkId);
    const linkDoc = await getDoc(linkRef);

    if (!linkDoc.exists()) {
      return NextResponse.json({ error: 'Payment link not found' }, { status: 404 });
    }

    const linkData = linkDoc.data();

    // Get stats if requested
    const stats = await getPaymentLinkStats(linkData.stripePaymentLinkId);

    return NextResponse.json({
      link: linkData,
      stats,
    });
  } catch (error) {
    console.error('Error fetching payment link:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment link' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const db = getFirestore();
    const linkRef = doc(db, 'users', user.uid, 'paymentLinks', params.linkId);
    const linkDoc = await getDoc(linkRef);

    if (!linkDoc.exists()) {
      return NextResponse.json({ error: 'Payment link not found' }, { status: 404 });
    }

    const linkData = linkDoc.data();

    // Update in Stripe if status changed
    if (body.active !== undefined && body.active !== linkData.active) {
      await updateStripePaymentLink(linkData.stripePaymentLinkId, body.active);
    }

    // Update in Firestore
    await updateDoc(linkRef, {
      ...body,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating payment link:', error);
    return NextResponse.json(
      { error: 'Failed to update payment link' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getFirestore();
    const linkRef = doc(db, 'users', user.uid, 'paymentLinks', params.linkId);
    const linkDoc = await getDoc(linkRef);

    if (!linkDoc.exists()) {
      return NextResponse.json({ error: 'Payment link not found' }, { status: 404 });
    }

    const linkData = linkDoc.data();

    // Deactivate in Stripe
    await deletePaymentLink(linkData.stripePaymentLinkId);

    // Delete from Firestore
    await deleteDoc(linkRef);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment link:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment link' },
      { status: 500 }
    );
  }
}
