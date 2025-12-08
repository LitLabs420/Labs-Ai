import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-helper';
import { bankAccountSchema, validateBankAccountData } from '@/lib/bank-accounts';
import { getFirestore, collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getFirestore();
    const q = query(
      collection(db, 'users', user.uid, 'bankAccounts'),
      where('deleted', '!=', true)
    );

    const snapshot = await getDocs(q);
    const accounts = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    }));

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bank accounts' },
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
    const parsed = bankAccountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid bank account data', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const validation = validateBankAccountData(parsed.data, parsed.data.country);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    // Save to Firestore
    const db = getFirestore();
    const accountId = `bank_${Date.now()}`;
    const accountRef = doc(collection(db, 'users', user.uid, 'bankAccounts'), accountId);

    const accountData = {
      ...parsed.data,
      id: accountId,
      userId: user.uid,
      verified: false,
      verificationMethod: 'micro_deposits' as const,
      verificationStatus: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      deleted: false,
    };

    await setDoc(accountRef, accountData);

    return NextResponse.json(accountData, { status: 201 });
  } catch (error) {
    console.error('Error creating bank account:', error);
    return NextResponse.json(
      { error: 'Failed to create bank account' },
      { status: 500 }
    );
  }
}
