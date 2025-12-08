import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helper';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { accountId: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getFirestore();
    const accountRef = doc(db, 'users', user.uid, 'bankAccounts', params.accountId);
    const accountDoc = await getDoc(accountRef);

    if (!accountDoc.exists()) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 });
    }

    return NextResponse.json({
      account: {
        ...accountDoc.data(),
        id: accountDoc.id,
        createdAt: accountDoc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: accountDoc.data().updatedAt?.toDate?.() || new Date(),
      },
    });
  } catch (error) {
    console.error('Error fetching bank account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bank account' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { accountId: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const db = getFirestore();
    const accountRef = doc(db, 'users', user.uid, 'bankAccounts', params.accountId);

    const accountDoc = await getDoc(accountRef);
    if (!accountDoc.exists()) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 });
    }

    await updateDoc(accountRef, {
      ...body,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating bank account:', error);
    return NextResponse.json(
      { error: 'Failed to update bank account' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { accountId: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getFirestore();
    const accountRef = doc(db, 'users', user.uid, 'bankAccounts', params.accountId);

    const accountDoc = await getDoc(accountRef);
    if (!accountDoc.exists()) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 });
    }

    // Soft delete (mark as deleted)
    await updateDoc(accountRef, {
      deleted: true,
      deletedAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bank account:', error);
    return NextResponse.json(
      { error: 'Failed to delete bank account' },
      { status: 500 }
    );
  }
}
