# 🔐 LitLabs Subscription & Plan Gating Logic

**Implementation guide for enforcing plan-based access in your Next.js app**

---

## TABLE OF CONTENTS

1. [Plan Structure](#plan-structure)
2. [Subscription Status Flow](#subscription-status-flow)
3. [Implementation in Next.js](#implementation-in-nextjs)
4. [Firestore Rules](#firestore-rules)
5. [Frontend Gating Logic](#frontend-gating-logic)
6. [Testing Plan Gating](#testing-plan-gating)

---

## PLAN STRUCTURE

### Three Tier Plans

```javascript
const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    features: {
      dailyPost: true,
      dailyPostLimit: 1, // 1 post per day
      dmReply: true,
      fraudCheck: true,
      promoEngine: true, // basic promo only
      contentWeek: false,
      brandStrategy: false,
      advancedAnalytics: false,
    },
    stripe: null,
  },
  BASIC: {
    id: 'basic',
    name: 'Basic',
    price: 9,
    billingPeriod: 'month',
    features: {
      dailyPost: true,
      dailyPostLimit: 3, // 3 posts per day
      dmReply: true,
      fraudCheck: true,
      promoEngine: true,
      storyPack: true,
      contentWeek: false,
      brandStrategy: false,
      advancedAnalytics: false,
    },
    stripe: 'price_basic_monthly',
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    billingPeriod: 'month',
    features: {
      dailyPost: true,
      dailyPostLimit: -1, // unlimited
      dmReply: true,
      fraudCheck: true,
      promoEngine: true,
      storyPack: true,
      contentWeek: true,
      brandStrategy: true,
      salesScripts: true,
      clientReactivation: true,
      advancedAnalytics: true,
    },
    stripe: 'price_pro_monthly',
  },
  DELUXE: {
    id: 'deluxe',
    name: 'Deluxe',
    price: 99,
    billingPeriod: 'month',
    features: {
      dailyPost: true,
      dailyPostLimit: -1, // unlimited
      dmReply: true,
      fraudCheck: true,
      promoEngine: true,
      storyPack: true,
      contentWeek: true,
      brandStrategy: true,
      salesScripts: true,
      clientReactivation: true,
      holidayCampaigns: true,
      weeklyAudits: true,
      broadcastMessages: true,
      advancedAnalytics: true,
      prioritySupport: true,
    },
    stripe: 'price_deluxe_monthly',
  },
};
```

---

## SUBSCRIPTION STATUS FLOW

```
User Signs Up
    ↓
status: "free" (trial starts)
    ↓
[User upgrades OR trial expires]
    ↓
┌─→ Creates Stripe Subscription
│   ↓
│   status: "pending" → "active"
│
└─→ Trial expires without upgrade
    ↓
    status: "expired"
    ↓
    (Can still use free features, but no access to paid tiers)
```

### Subscription Status Values

```javascript
const SUBSCRIPTION_STATUS = {
  NONE: 'none',           // No subscription
  ACTIVE: 'active',       // Actively paying
  PAST_DUE: 'past_due',   // Payment failed, trying again
  CANCELED: 'canceled',   // User canceled
  TRIAL: 'trial',         // In free trial period
  EXPIRED: 'expired',     // Trial expired, no subscription
};
```

---

## IMPLEMENTATION IN NEXT.JS

### Step 1: Create User Context with Plan Data

**File: `lib/UserContext.tsx`**

```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PLANS } from '@/config/plans';

interface User {
  uid: string;
  email: string;
  displayName: string;
  plan: 'free' | 'basic' | 'pro' | 'deluxe';
  subscriptionStatus: 'none' | 'active' | 'past_due' | 'canceled' | 'trial' | 'expired';
  subscriptionEnd?: Date;
}

const UserContext = createContext<{ user: User | null; isLoading: boolean }>({
  user: null,
  isLoading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        // Real-time listener for Firestore user doc
        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser({
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: docSnap.data().displayName || '',
              plan: docSnap.data().plan || 'free',
              subscriptionStatus: docSnap.data().subscriptionStatus || 'none',
              subscriptionEnd: docSnap.data().subscriptionEnd?.toDate(),
            });
          }
          setIsLoading(false);
        });

        return () => unsubscribeDoc();
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return <UserContext.Provider value={{ user, isLoading }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
```

### Step 2: Create Feature Gating Hook

**File: `hooks/useFeatureAccess.ts`**

```typescript
import { useUser } from '@/lib/UserContext';
import { PLANS } from '@/config/plans';

export function useFeatureAccess(feature: string) {
  const { user } = useUser();

  if (!user) {
    return { hasAccess: false, plan: null, reason: 'Not logged in' };
  }

  const currentPlan = PLANS[user.plan.toUpperCase()];

  if (!currentPlan) {
    return { hasAccess: false, plan: null, reason: 'Unknown plan' };
  }

  // Check if user's subscription is active
  if (
    user.plan !== 'free' &&
    user.subscriptionStatus !== 'active' &&
    user.subscriptionStatus !== 'trial'
  ) {
    return {
      hasAccess: false,
      plan: user.plan,
      reason: `Subscription is ${user.subscriptionStatus}. Please renew.`,
    };
  }

  // Check if feature is in plan
  const hasFeature = currentPlan.features[feature as keyof typeof currentPlan.features];

  return {
    hasAccess: !!hasFeature,
    plan: user.plan,
    reason: !hasFeature ? `Feature not available on ${user.plan} plan` : null,
  };
}

export function useUpgradePrompt(feature: string) {
  const { user } = useUser();

  if (!user || user.plan === 'deluxe') {
    return null;
  }

  return {
    currentPlan: user.plan,
    message: `Upgrade to access ${feature}`,
    upgradeLink: '/pricing',
  };
}
```

### Step 3: Gate Features in Components

**Example: Daily Post Component**

```typescript
'use client';

import { useFeatureAccess, useUpgradePrompt } from '@/hooks/useFeatureAccess';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function DailyPostGenerator() {
  const { hasAccess, reason } = useFeatureAccess('dailyPost');
  const upgradePrompt = useUpgradePrompt('Daily Posts');

  if (!hasAccess) {
    return (
      <div className="p-6 bg-gray-100 rounded-lg text-center">
        <p className="text-gray-600 mb-4">{reason}</p>
        {upgradePrompt && (
          <Link href={upgradePrompt.upgradeLink}>
            <Button className="bg-blue-500 text-white">Upgrade to {upgradePrompt.currentPlan === 'free' ? 'Basic' : 'Pro'}</Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Your actual daily post generator component */}
    </div>
  );
}
```

---

## FIRESTORE RULES

**Deploy to Firebase Console:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection: Only user can read/write own doc
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow create: if request.auth.uid == request.resource.data.uid;
    }

    // Subscriptions: Only user can read own
    match /subscriptions/{subscriptionId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow write: if false; // Only backend can write
    }

    // Content history: User can read/write own
    match /content_history/{contentId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }

    // Pricing public: Anyone can read
    match /pricing/{document=**} {
      allow read: if true;
    }
  }
}
```

---

## FRONTEND GATING LOGIC

### Approach 1: Component-Level Gating (Recommended)

```typescript
// Gate a feature at component level
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

function ContentWeekGenerator() {
  const { hasAccess, reason } = useFeatureAccess('contentWeek');

  if (!hasAccess) {
    return (
      <div className="upgrade-prompt">
        <h3>Unlock 7-Day Content Packs</h3>
        <p>{reason}</p>
        <PricingLink plan="pro" />
      </div>
    );
  }

  return <YourFeatureComponent />;
}
```

### Approach 2: Route-Level Gating (For Premium Pages)

**File: `middleware.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';

const PREMIUM_ROUTES = ['/dashboard/pro', '/dashboard/analytics'];
const PROTECTED_ROUTES = ['/dashboard'];

export async function middleware(req: NextRequest) {
  const session = await auth.currentUser;

  // Redirect to login if no session
  if (!session && PROTECTED_ROUTES.some((route) => req.nextUrl.pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Check for premium route
  if (PREMIUM_ROUTES.some((route) => req.nextUrl.pathname.startsWith(route))) {
    // You would check Firestore here for user's plan
    // For now, this is a placeholder
    const userPlan = 'pro'; // Get from Firestore

    if (userPlan !== 'pro' && userPlan !== 'deluxe') {
      return NextResponse.redirect(new URL('/pricing', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

---

## TESTING PLAN GATING

### Test Scenario 1: Free User Accessing Pro Feature

```typescript
// Simulate user data
const freeUser = {
  uid: 'user123',
  plan: 'free',
  subscriptionStatus: 'none',
};

// Attempt to access contentWeek (Pro feature)
const access = useFeatureAccess('contentWeek');
// Result: { hasAccess: false, reason: 'Feature not available on free plan' }
```

### Test Scenario 2: Pro User with Expired Subscription

```typescript
const expiredProUser = {
  uid: 'user456',
  plan: 'pro',
  subscriptionStatus: 'past_due',
};

const access = useFeatureAccess('contentWeek');
// Result: { hasAccess: false, reason: 'Subscription is past_due. Please renew.' }
```

### Test Scenario 3: Active Pro User

```typescript
const activeProUser = {
  uid: 'user789',
  plan: 'pro',
  subscriptionStatus: 'active',
};

const access = useFeatureAccess('contentWeek');
// Result: { hasAccess: true, plan: 'pro', reason: null }
```

---

## UPGRADING USERS

### Triggering Upgrade Flow

```typescript
function UpgradeButton({ targetPlan = 'pro' }) {
  const handleUpgrade = async () => {
    // Call backend to create Stripe session
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId: `price_${targetPlan}_monthly` }),
    });

    const { sessionId } = await response.json();

    // Redirect to Stripe Checkout
    window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
  };

  return <Button onClick={handleUpgrade}>Upgrade to {targetPlan}</Button>;
}
```

### Backend Webhook (Firebase Function)

```typescript
// functions/handleStripeWebhook.ts
export const handleStripeWebhook = onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const event = stripe.webhooks.constructEvent(
    req.rawBody,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const priceId = session.line_items[0].price_id;

    // Determine plan from priceId
    let plan = 'free';
    if (priceId.includes('basic')) plan = 'basic';
    if (priceId.includes('pro')) plan = 'pro';
    if (priceId.includes('deluxe')) plan = 'deluxe';

    // Update Firestore
    await admin.firestore().collection('users').doc(userId).update({
      plan,
      subscriptionStatus: 'active',
      stripeCustomerId: session.customer,
    });
  }

  res.json({ received: true });
});
```

---

**— Powered by LitLabs AI 🔥**

