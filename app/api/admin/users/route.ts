import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

type UserRecord = {
  uid: string;
  email?: string;
  businessName?: string;
  name?: string;
  tier?: string;
  status?: string;
  [key: string]: string | undefined;
};

// GET - List all users
export async function GET() {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const users: UserRecord[] = [];

    usersSnap.forEach((docSnap) => {
      users.push({
        uid: docSnap.id,
        ...(docSnap.data() as Omit<UserRecord, 'uid'>),
      });
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST - Update user (ban, tier, etc)
export async function POST(req: NextRequest) {
  try {
    const { uid, action, tier, reason } = await req.json();

    if (!uid || !action) {
      return NextResponse.json(
        { error: "Missing uid or action" },
        { status: 400 }
      );
    }

    const userRef = doc(db, "users", uid);

    if (action === "ban") {
      await updateDoc(userRef, {
        status: "suspended",
        bannedReason: reason || "Admin action",
        bannedAt: new Date().toISOString(),
      });
      return NextResponse.json(
        { message: "User banned successfully" },
        { status: 200 }
      );
    }

    if (action === "unban") {
      await updateDoc(userRef, {
        status: "active",
        bannedReason: null,
        bannedAt: null,
      });
      return NextResponse.json(
        { message: "User unbanned successfully" },
        { status: 200 }
      );
    }

    if (action === "setTier") {
      if (!tier || !["free", "pro", "enterprise"].includes(tier)) {
        return NextResponse.json(
          { error: "Invalid tier" },
          { status: 400 }
        );
      }
      await updateDoc(userRef, {
        tier,
        tierUpdatedAt: new Date().toISOString(),
      });
      return NextResponse.json(
        { message: `Tier set to ${tier}` },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
