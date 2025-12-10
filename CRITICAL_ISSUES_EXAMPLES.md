# 🔴 Critical Code Issues - Visual Examples

This document shows **before/after** examples of the most critical code quality issues found in the LitLabs AI codebase.

---

## Issue 1: Missing Rate Limiting (CRITICAL)

### ❌ Current Code - `/app/api/ai/generate/route.ts`

```typescript
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, topic } = body;

    // Process expensive AI operation immediately
    const result = await generateCompleteContentKit(topic, platform);
    
    return NextResponse.json({ success: true, content: result });
  } catch (error) {
    // ...
  }
}
```

**Problems:**
- ⚠️ No rate limiting - can be abused with unlimited requests
- ⚠️ Token not verified - only format checked
- ⚠️ Expensive operation runs before validation
- ⚠️ No usage tracking or tier checks

---

### ✅ Fixed Code - Secure Pattern

```typescript
import { requireAuth } from "@/lib/auth-middleware";
import { rateLimit } from "@/lib/rate-limiter";
import { Guardian } from "@/lib/guardian-bot";
import { canUseFeature, incrementUsage } from "@/lib/usage-tracker";

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 🛡️ STEP 1: RATE LIMIT FIRST (before any processing)
  const rateLimitCheck = rateLimit(request, 20, 60);
  if (rateLimitCheck) return rateLimitCheck;

  try {
    // 🛡️ STEP 2: VERIFY AUTHENTICATION
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    // 🛡️ STEP 3: VALIDATE INPUT
    const body = await request.json();
    const { type, topic } = body;
    
    if (!type || !topic) {
      return errorResponse(400, "Bad Request", "Missing required fields");
    }

    // 🛡️ STEP 4: CHECK TIER PERMISSIONS
    if (!hasFeature(auth.tier, 'ai-generation')) {
      return errorResponse(403, "Forbidden", "Upgrade required");
    }

    // 🛡️ STEP 5: CHECK USAGE QUOTA
    const usage = await checkUsage(auth.userId, 'ai_generations');
    if (!canUseFeature(auth.tier, 'ai_generations', usage)) {
      return errorResponse(429, "Rate Limited", "Monthly quota exceeded");
    }

    // 🛡️ STEP 6: GUARDIAN BOT SECURITY CHECK
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const guardian = Guardian.getInstance();
    const securityCheck = await guardian.analyzeUserBehavior(
      auth.userId, 
      'ai_generation', 
      { ip, topic, type }
    );
    
    if (!securityCheck.allowed) {
      return errorResponse(403, "Forbidden", "Unable to process request");
    }

    // ✅ NOW SAFE TO PROCESS
    const result = await generateCompleteContentKit(topic, platform);
    
    // 🛡️ STEP 7: INCREMENT USAGE AFTER SUCCESS
    await incrementUsage(auth.userId, 'ai_generations');

    return NextResponse.json({ success: true, content: result });
    
  } catch (error: unknown) {
    captureError("AI generation error", { error });
    return errorResponse(500, "Internal Server Error");
  }
}
```

**Impact:** Prevents abuse, enforces quotas, tracks usage, blocks suspicious activity

---

## Issue 2: Authentication Not Implemented (CRITICAL)

### ❌ Current Code - `/lib/auth-middleware.ts`

```typescript
export async function extractAuth(request: NextRequest): Promise<AuthContext | null> {
  try {
    // Check Bearer token
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      // const token = authHeader.slice(7);
      // TODO: Verify token with Firebase or your auth provider
      // const user = await verifyToken(token);
      // return { userId: user.uid, email: user.email, isAuthenticated: true };
    }

    // TODO: Verify API key
    // TODO: Verify session cookie

    return null;
  } catch (error) {
    return null;
  }
}
```

**Problems:**
- 🔴 All authentication fails silently
- 🔴 TODOs in production code
- 🔴 No actual token verification
- 🔴 Security bypass possible

---

### ✅ Fixed Code - Real Firebase Auth

```typescript
import { getAuth } from 'firebase-admin/auth';
import { db } from '@/lib/firebase-admin';

export async function extractAuth(request: NextRequest): Promise<AuthContext | null> {
  try {
    // 1. CHECK BEARER TOKEN (Firebase Auth)
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      
      try {
        // ✅ VERIFY TOKEN WITH FIREBASE
        const decodedToken = await getAuth().verifyIdToken(token);
        
        // ✅ GET USER TIER FROM FIRESTORE
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.data();
        
        return {
          userId: decodedToken.uid,
          email: decodedToken.email,
          tier: userData?.tier || 'free',
          isAuthenticated: true,
          isAdmin: userData?.isAdmin || false,
        };
      } catch (error) {
        captureError("Token verification failed", { error });
        return null;
      }
    }

    // 2. CHECK API KEY
    const apiKey = request.headers.get("x-api-key");
    if (apiKey) {
      const apiKeyDoc = await db.collection('api_keys')
        .where('key', '==', apiKey)
        .where('active', '==', true)
        .limit(1)
        .get();
        
      if (!apiKeyDoc.empty) {
        const keyData = apiKeyDoc.docs[0].data();
        return {
          userId: keyData.userId,
          tier: keyData.tier || 'free',
          isAuthenticated: true,
        };
      }
    }

    // 3. CHECK SESSION COOKIE
    const sessionCookie = request.cookies.get("session")?.value;
    if (sessionCookie) {
      try {
        const decodedCookie = await getAuth().verifySessionCookie(sessionCookie);
        const userDoc = await db.collection('users').doc(decodedCookie.uid).get();
        const userData = userDoc.data();
        
        return {
          userId: decodedCookie.uid,
          email: decodedCookie.email,
          tier: userData?.tier || 'free',
          isAuthenticated: true,
        };
      } catch (error) {
        return null;
      }
    }

    return null;
  } catch (error) {
    captureError("Auth extraction failed", { error });
    return null;
  }
}
```

**Impact:** Real authentication, prevents unauthorized access, enables tier-based features

---

## Issue 3: Payment Security (CRITICAL)

### ❌ Current Code - `/app/api/payments/crypto/route.ts`

```typescript
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, userId, tier, blockchain } = body;

    // Process payment immediately
    const result = await processPayment({
      amount,
      userId,
      tier,
      blockchain,
    }, walletAddress);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

**Problems:**
- 🔴 No rate limiting on payments
- 🔴 No Guardian Bot check
- 🔴 User can pay for other users (userId param)
- 🔴 No Sentry error logging
- 🔴 No suspicious activity detection

---

### ✅ Fixed Code - Secure Payment Processing

```typescript
import { Guardian } from "@/lib/guardian-bot";

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 🛡️ STEP 1: STRICT RATE LIMITING FOR PAYMENTS
  const rateLimitCheck = rateLimit(request, 5, 300); // Only 5 per 5 min
  if (rateLimitCheck) return rateLimitCheck;

  try {
    // 🛡️ STEP 2: VERIFY AUTHENTICATION
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    // 🛡️ STEP 3: VALIDATE INPUT
    const body = await request.json();
    const { amount, userId, tier, blockchain, walletAddress } = body;

    if (!amount || !tier || !blockchain) {
      return errorResponse(400, "Bad Request", "Missing required fields");
    }

    // 🛡️ STEP 4: VERIFY USER IS PAYING FOR THEMSELVES
    if (auth.userId !== userId) {
      captureError('Payment fraud attempt', { 
        attacker: auth.userId, 
        target: userId 
      });
      return errorResponse(403, "Forbidden", "Cannot pay for another user");
    }

    // 🛡️ STEP 5: GUARDIAN BOT CHECK (CRITICAL FOR PAYMENTS)
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const guardian = Guardian.getInstance();
    const securityCheck = await guardian.analyzeUserBehavior(
      auth.userId,
      'payment_processing',
      { 
        ip, 
        amount, 
        tier, 
        blockchain, 
        walletAddress,
        timestamp: Date.now()
      }
    );

    if (!securityCheck.allowed) {
      captureError('Suspicious payment blocked by Guardian', {
        userId: auth.userId,
        reason: securityCheck.reason,
        amount,
        tier
      });
      return errorResponse(403, "Forbidden", "Unable to process payment at this time");
    }

    // ✅ NOW SAFE TO PROCESS PAYMENT
    const result = await processPayment({
      amount,
      userId: auth.userId, // Use verified ID
      tier,
      blockchain,
      description: `Upgrade to ${tier} tier`,
    }, walletAddress);

    console.log(`💰 Payment processed: ${auth.userId} - ${amount} via ${blockchain}`);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Payment failed";
    captureError("Payment processing error", {
      error: message,
      path: "/api/payments/crypto",
    });
    return errorResponse(500, "Internal Server Error");
  }
}
```

**Impact:** Prevents fraud, rate limits abuse, detects suspicious patterns, logs all attempts

---

## Issue 4: Webhook Vulnerability (HIGH)

### ❌ Current Code - `/app/api/webhooks/stripe/route.ts`

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    // Verify signature (GOOD)
    let event: Stripe.Event;
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // Process event
    switch (event.type) {
      case 'payment_intent.succeeded':
        handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      // ... other cases
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

**Problems:**
- ⚠️ No idempotency - duplicate webhooks processed multiple times
- ⚠️ No rate limiting
- ⚠️ Error messages expose internal state
- ⚠️ No event tracking

---

### ✅ Fixed Code - Idempotent Webhook Processing

```typescript
// Track processed events
const processedEvents = new Map<string, boolean>();

async function checkIfProcessed(eventId: string): Promise<boolean> {
  if (processedEvents.has(eventId)) return true;
  
  const doc = await db.collection('webhook_events').doc(eventId).get();
  return doc.exists;
}

async function markAsProcessed(eventId: string): Promise<void> {
  processedEvents.set(eventId, true);
  await db.collection('webhook_events').doc(eventId).set({
    processedAt: new Date().toISOString(),
    type: 'stripe_webhook'
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 🛡️ RATE LIMIT WEBHOOKS
  const rateLimitCheck = rateLimit(request, 100, 60);
  if (rateLimitCheck) return rateLimitCheck;

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    // Verify signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: unknown) {
      captureError('Webhook signature failed', { error });
      return NextResponse.json({ received: false }, { status: 400 });
    }

    // 🛡️ CHECK IDEMPOTENCY
    const eventId = event.id;
    const alreadyProcessed = await checkIfProcessed(eventId);
    
    if (alreadyProcessed) {
      console.log(`ℹ️ Event ${eventId} already processed`);
      return NextResponse.json({ 
        received: true, 
        status: 'already_processed' 
      });
    }

    // Process event
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event.data.object);
          break;
        // ... other cases
      }

      // 🛡️ MARK AS PROCESSED
      await markAsProcessed(eventId);
      
      return NextResponse.json({ received: true });
      
    } catch (processingError: unknown) {
      captureError('Webhook processing error', {
        eventId,
        eventType: event.type,
        error: processingError
      });
      
      // ✅ STILL RETURN 200 TO PREVENT RETRIES
      return NextResponse.json({ 
        received: true, 
        status: 'error_logged' 
      });
    }

  } catch (error: unknown) {
    captureError('Webhook error', { error });
    // ✅ ALWAYS RETURN 200 TO STRIPE
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
```

**Impact:** Prevents duplicate processing, tracks all events, better error handling

---

## Issue 5: Error Handling in Components (MEDIUM)

### ❌ Current Code - `/app/dashboard/ai-generator/page.tsx`

```typescript
const handleGenerate = async () => {
  setGenerating(true);
  
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const mockContent = `✨ Generated ${selectedType}...`;
    setGeneratedContent(mockContent);
    toast.success('Content generated!');
    
  } catch {
    toast.error('Failed to generate content');
  } finally {
    setGenerating(false);
  }
};
```

**Problems:**
- ⚠️ Mock implementation in production code
- ⚠️ Empty catch loses error information
- ⚠️ No error logging
- ⚠️ No specific error messages

---

### ✅ Fixed Code - Real API Integration with Proper Error Handling

```typescript
import { captureError } from '@/lib/sentry';

const handleGenerate = async () => {
  if (!prompt.trim()) {
    toast.error('Please enter a prompt');
    return;
  }

  setGenerating(true);
  setError("");
  
  try {
    // ✅ REAL API CALL
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`, // From auth context
      },
      body: JSON.stringify({
        type: selectedType,
        topic: prompt,
        platform: 'tiktok',
      }),
    });

    // ✅ CHECK RESPONSE STATUS
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Generation failed');
    }

    const data = await response.json();
    
    // ✅ VALIDATE RESPONSE DATA
    if (!data.content) {
      throw new Error('Invalid response from server');
    }

    setGeneratedContent(data.content);
    setShowOutput(true);
    toast.success('Content generated successfully!');
    
  } catch (error: unknown) {
    // ✅ PROPER ERROR HANDLING
    const message = error instanceof Error 
      ? error.message 
      : 'Failed to generate content';
    
    setError(message);
    toast.error(message);
    
    // ✅ LOG TO SENTRY
    captureError('AI generation failed in component', {
      error,
      selectedType,
      promptLength: prompt.length,
      selectedTone,
    });
    
  } finally {
    setGenerating(false);
  }
};
```

**Impact:** Real functionality, better error messages, tracked errors, better UX

---

## Summary: Impact of Fixes

| Issue | Current Risk | After Fix |
|-------|--------------|-----------|
| **Rate Limiting** | 🔴 Can be abused unlimited | ✅ Protected 20 req/min |
| **Authentication** | 🔴 All requests pass | ✅ Token verified |
| **Payment Security** | 🔴 Fraud possible | ✅ Guardian Bot blocks |
| **Webhook Idempotency** | 🟡 Duplicate processing | ✅ Once only |
| **Error Handling** | 🟡 Silent failures | ✅ Logged & tracked |

---

## Next Steps

1. **Review these examples** with your team
2. **Follow the patterns** in [Action Plan](./ACTION_PLAN_HIGH_PRIORITY.md)
3. **Use the checklist** before committing: [CODE_QUALITY_CHECKLIST.md](./CODE_QUALITY_CHECKLIST.md)
4. **Test thoroughly** after each fix
5. **Schedule security review** when complete

---

**Remember:** These fixes are **critical for production**. Each example shows the exact pattern to follow. Copy, adapt, and apply! 🚀
