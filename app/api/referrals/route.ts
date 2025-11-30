import { NextRequest, NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const referralCode = searchParams.get('code');

    if (!referralCode) {
      return NextResponse.json(
        { error: 'Referral code required' },
        { status: 400 }
      );
    }

    const referralDoc = await getDoc(doc(db, 'referrals', referralCode));

    if (!referralDoc.exists()) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      );
    }

    const data = referralDoc.data();
    return NextResponse.json({
      referrerName: data.referrerName,
      referrerBusiness: data.referrerBusiness,
      tier: data.tier || 'free',
      bonus: data.bonus || 10,
    });
  } catch (error) {
    console.error('Referral lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup referral' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { uid, referrerUid } = await request.json();

    if (!uid || !referrerUid) {
      return NextResponse.json(
        { error: 'UID and referrer UID required' },
        { status: 400 }
      );
    }

    const referrerDoc = await getDoc(doc(db, 'users', referrerUid));

    if (!referrerDoc.exists()) {
      return NextResponse.json(
        { error: 'Referrer not found' },
        { status: 404 }
      );
    }

    const referrerData = referrerDoc.data();

    await updateDoc(doc(db, 'users', uid), {
      referredBy: referrerUid,
      referredAt: new Date(),
    });

    await updateDoc(doc(db, 'users', referrerUid), {
      referralCount: (referrerData.referralCount || 0) + 1,
      totalReferralBonus: (referrerData.totalReferralBonus || 0) + 10,
    });

    await setDoc(doc(collection(db, 'activity_log')), {
      type: 'signup',
      userName: `New user from ${referrerData.displayName}`,
      businessName: referrerData.businessName,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: 'Referral recorded',
      bonus: 10,
    });
  } catch (error) {
    console.error('Referral creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create referral' },
      { status: 500 }
    );
  }
}
