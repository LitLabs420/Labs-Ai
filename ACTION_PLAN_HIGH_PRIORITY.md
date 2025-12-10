# Action Plan - High Priority Code Quality Fixes

**Target Completion:** 2-3 days  
**Status:** 🔴 Required before production deployment

## Overview

This document outlines the specific changes needed to bring API routes into compliance with LitLabs AI security standards. All changes are **critical** for production readiness.

---

## Task 1: Implement Authentication in `auth-middleware.ts`

**File:** `/lib/auth-middleware.ts`  
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 4-6 hours

### Current State
- TODOs for token verification (line 25)
- TODOs for API key verification (line 34)
- TODOs for session cookie verification (line 42)

### Required Changes

Replace TODOs with actual Firebase authentication:

```typescript
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { db } from '@/lib/firebase-admin';

export async function extractAuth(request: NextRequest): Promise<AuthContext | null> {
  try {
    // 1. Check Bearer token (Firebase Auth)
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      try {
        const decodedToken = await getAuth().verifyIdToken(token);
        
        // Get user tier from Firestore
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

    // 2. Check API key (from api_keys collection)
    const apiKey = request.headers.get("x-api-key");
    if (apiKey) {
      const apiKeyDoc = await db.collection('api_keys')
        .where('key', '==', apiKey)
        .where('active', '==', true)
        .limit(1)
        .get();
        
      if (!apiKeyDoc.empty) {
        const keyData = apiKeyDoc.docs[0].data();
        const userDoc = await db.collection('users').doc(keyData.userId).get();
        const userData = userDoc.data();
        
        return {
          userId: keyData.userId,
          tier: userData?.tier || 'free',
          isAuthenticated: true,
        };
      }
    }

    // 3. Check session cookie (Next.js session)
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
          isAdmin: userData?.isAdmin || false,
        };
      } catch (error) {
        captureError("Session verification failed", { error });
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

### Testing Checklist
- [ ] Test with valid Firebase token
- [ ] Test with expired token (should reject)
- [ ] Test with invalid token (should reject)
- [ ] Test with valid API key
- [ ] Test with invalid API key (should reject)
- [ ] Test with session cookie
- [ ] Test with no auth (should return null)

---

## Task 2: Secure `/app/api/ai/generate/route.ts`

**File:** `/app/api/ai/generate/route.ts`  
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 3-4 hours

### Current Issues
- ❌ No rate limiting
- ❌ Token not verified (only format checked)
- ❌ No tier verification
- ❌ No usage tracking
- ❌ No Guardian Bot check

### Required Implementation

**Step 1:** Import required modules (add to top of file)
```typescript
import { requireAuth } from "@/lib/auth-middleware";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limiter";
import { errorResponse, successResponse } from "@/lib/api-utils";
import { hasFeature, canUseFeature } from "@/lib/tier-system";
import { Guardian } from "@/lib/guardian-bot";
import { checkUsage, incrementUsage } from "@/lib/usage-tracker";
```

**Step 2:** Replace POST handler (lines 19-88)
```typescript
export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. RATE LIMIT FIRST
  const rateLimitCheck = rateLimit(request, 20, 60);
  if (rateLimitCheck) return rateLimitCheck;

  try {
    // 2. AUTHENTICATION
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    // 3. INPUT VALIDATION
    const body = await request.json();
    const { type, topic, platform = "tiktok", duration = "60s" } = body;

    if (!type || !topic) {
      return errorResponse(400, "Bad Request", "Missing required fields: type, topic");
    }

    if (!["caption", "script", "image", "voice", "video", "full"].includes(type)) {
      return errorResponse(400, "Bad Request", "Invalid type");
    }

    // 4. TIER VERIFICATION
    if (!hasFeature(auth.tier || 'free', 'ai-generation')) {
      return errorResponse(403, "Forbidden", "AI generation not available in your tier");
    }

    // 5. USAGE CHECK
    const usage = await checkUsage(auth.userId, 'ai_generations');
    if (!canUseFeature(auth.tier || 'free', 'ai_generations', usage)) {
      return errorResponse(429, "Rate Limited", "Monthly AI generation quota exceeded");
    }

    // 6. GUARDIAN BOT CHECK
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const guardian = Guardian.getInstance();
    const securityCheck = await guardian.analyzeUserBehavior(
      auth.userId, 
      'ai_generation', 
      { ip, topic, type }
    );
    
    if (!securityCheck.allowed) {
      captureError('Suspicious AI generation attempt', { 
        userId: auth.userId, 
        reason: securityCheck.reason 
      });
      return errorResponse(403, "Forbidden", "Unable to process request");
    }

    console.log(`🤖 Generating ${type} for user ${auth.userId}: ${topic}`);

    // 7. EXECUTE GENERATION
    let result;
    switch (type) {
      case "full":
        result = await generateCompleteContentKit(topic, platform as "tiktok" | "instagram" | "youtube");
        break;
      case "video":
        result = await generateVideoPackage(topic, duration as "30s" | "60s" | "120s");
        break;
      default:
        return errorResponse(400, "Bad Request", `Generation for type '${type}' not yet implemented`);
    }

    // 8. INCREMENT USAGE
    await incrementUsage(auth.userId, 'ai_generations');

    // 9. RETURN SUCCESS
    const headers = getRateLimitHeaders(request, 20);
    return NextResponse.json({
      success: true,
      type,
      topic,
      platform,
      generatedAt: new Date().toISOString(),
      content: result,
    }, { headers });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Generation failed";
    captureError("AI generation error", { error: message });
    return errorResponse(500, "Internal Server Error", "Failed to generate content");
  }
}
```

**Step 3:** Update PUT handler (batch generation) - similar pattern

**Step 4:** Update PATCH handler (optimize) - similar pattern

### Testing Checklist
- [ ] Rate limit enforced (test 21 requests in 60 seconds)
- [ ] Authentication required (test without token)
- [ ] Free tier blocked (test with free tier user)
- [ ] Usage quota enforced (test at quota limit)
- [ ] Guardian Bot blocks suspicious patterns
- [ ] Successful generation increments usage
- [ ] Rate limit headers returned

---

## Task 3: Secure `/app/api/payments/crypto/route.ts`

**File:** `/app/api/payments/crypto/route.ts`  
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 2-3 hours

### Current Issues
- ❌ No rate limiting
- ❌ Token not verified
- ❌ No Guardian Bot check for payments
- ❌ Missing Sentry integration

### Required Changes

**Replace POST handler (lines 12-68):**
```typescript
export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. RATE LIMIT FIRST (stricter for payments)
  const rateLimitCheck = rateLimit(request, 5, 300); // 5 requests per 5 minutes
  if (rateLimitCheck) return rateLimitCheck;

  try {
    // 2. AUTHENTICATION
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    // 3. INPUT VALIDATION
    const body = await request.json();
    const { amount, userId, tier, blockchain, description, walletAddress } = body;

    if (!amount || !userId || !tier || !blockchain) {
      return errorResponse(400, "Bad Request", "Missing required fields");
    }

    if (!["solana", "ethereum", "stripe"].includes(blockchain)) {
      return errorResponse(400, "Bad Request", "Invalid blockchain");
    }

    // Verify user is paying for themselves
    if (auth.userId !== userId) {
      return errorResponse(403, "Forbidden", "Cannot process payment for another user");
    }

    // 4. GUARDIAN BOT CHECK (CRITICAL for payments)
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const guardian = Guardian.getInstance();
    const securityCheck = await guardian.analyzeUserBehavior(
      auth.userId,
      'payment_processing',
      { ip, amount, tier, blockchain, walletAddress }
    );

    if (!securityCheck.allowed) {
      captureError('Suspicious payment attempt blocked', {
        userId: auth.userId,
        amount,
        tier,
        reason: securityCheck.reason
      });
      return errorResponse(403, "Forbidden", "Unable to process payment at this time");
    }

    // 5. PROCESS PAYMENT
    const result = await processPayment(
      {
        amount,
        userId: auth.userId,
        tier,
        blockchain,
        description: description || `Upgrade to ${tier} tier`,
      },
      walletAddress
    );

    // 6. LOG SUCCESS
    console.log(`💰 Payment processed for user ${auth.userId}: ${amount} via ${blockchain}`);

    const headers = getRateLimitHeaders(request, 5);
    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
      headers
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Payment processing failed";
    captureError("Crypto payment error", {
      error: message,
      path: "/api/payments/crypto",
    });
    return errorResponse(500, "Internal Server Error", "Failed to process payment");
  }
}
```

### Testing Checklist
- [ ] Rate limit enforced (stricter for payments)
- [ ] Authentication required
- [ ] Users can't pay for others
- [ ] Guardian Bot blocks suspicious payments
- [ ] Valid payments process successfully
- [ ] Errors logged to Sentry

---

## Task 4: Add Idempotency to Stripe Webhook

**File:** `/app/api/webhooks/stripe/route.ts`  
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 2 hours

### Current Issues
- ❌ No idempotency handling (duplicate webhooks)
- ❌ No rate limiting
- ⚠️ Error messages expose state

### Required Changes

**Step 1:** Add idempotency functions (add before POST handler)
```typescript
// Idempotency tracking (use Firestore or Redis in production)
const processedEvents = new Map<string, boolean>();

async function checkIfProcessed(eventId: string): Promise<boolean> {
  // Check in-memory first
  if (processedEvents.has(eventId)) {
    return true;
  }
  
  // Check Firestore
  const doc = await db.collection('webhook_events').doc(eventId).get();
  return doc.exists;
}

async function markAsProcessed(eventId: string): Promise<void> {
  processedEvents.set(eventId, true);
  
  // Store in Firestore for persistence
  await db.collection('webhook_events').doc(eventId).set({
    processedAt: new Date().toISOString(),
    type: 'stripe_webhook'
  });
}
```

**Step 2:** Update POST handler (lines 14-91)
```typescript
export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. RATE LIMIT (webhooks should be from Stripe IPs only)
  const rateLimitCheck = rateLimit(request, 100, 60); // 100 req/min
  if (rateLimitCheck) return rateLimitCheck;

  try {
    // 2. VERIFY SIGNATURE
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    if (!webhookSecret) {
      captureError('Webhook secret not configured', {});
      return NextResponse.json({ received: true }, { status: 200 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      captureError('Webhook signature verification failed', { error: errorMessage });
      return NextResponse.json({ received: false }, { status: 400 });
    }

    // 3. IDEMPOTENCY CHECK
    const eventId = event.id;
    const alreadyProcessed = await checkIfProcessed(eventId);
    
    if (alreadyProcessed) {
      console.log(`ℹ️ Event ${eventId} already processed, skipping`);
      return NextResponse.json({ received: true, status: 'already_processed' });
    }

    console.log(`Processing webhook event: ${event.type}`);

    // 4. PROCESS EVENT
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        // ... other cases
      }

      // 5. MARK AS PROCESSED
      await markAsProcessed(eventId);
      
      return NextResponse.json({ received: true });
      
    } catch (processingError: unknown) {
      captureError('Webhook processing error', {
        eventId,
        eventType: event.type,
        error: processingError
      });
      
      // Still return 200 to prevent retries
      return NextResponse.json({ received: true, status: 'error_logged' });
    }

  } catch (error: unknown) {
    captureError('Webhook error', { error });
    // Always return 200 to prevent Stripe retries on our errors
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
```

### Testing Checklist
- [ ] Duplicate webhooks ignored
- [ ] Event IDs stored in Firestore
- [ ] Rate limiting works
- [ ] Errors don't expose internals
- [ ] Always returns 200 to Stripe

---

## Task 5: Create Usage Tracker Module

**File:** `/lib/usage-tracker.ts` (NEW FILE)  
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 2-3 hours

### Implementation

```typescript
import { db } from '@/lib/firebase-admin';
import { captureError } from '@/lib/sentry';

/**
 * Check current usage for a user feature
 */
export async function checkUsage(
  userId: string,
  feature: 'ai_generations' | 'bots' | 'automations' | 'api_calls' | 'marketplace_purchases'
): Promise<number> {
  try {
    const usageDoc = await db.collection('usage').doc(userId).get();
    
    if (!usageDoc.exists) {
      return 0;
    }

    const data = usageDoc.data();
    const currentMonth = new Date().toISOString().slice(0, 7); // "2025-12"
    
    return data?.[currentMonth]?.[feature] || 0;
  } catch (error) {
    captureError('Failed to check usage', { userId, feature, error });
    return 0;
  }
}

/**
 * Increment usage counter
 */
export async function incrementUsage(
  userId: string,
  feature: 'ai_generations' | 'bots' | 'automations' | 'api_calls' | 'marketplace_purchases',
  amount: number = 1
): Promise<void> {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const usageRef = db.collection('usage').doc(userId);
    
    const doc = await usageRef.get();
    
    if (!doc.exists) {
      await usageRef.set({
        [currentMonth]: {
          [feature]: amount
        },
        updatedAt: new Date().toISOString()
      });
    } else {
      const data = doc.data() || {};
      const monthData = data[currentMonth] || {};
      const currentCount = monthData[feature] || 0;
      
      await usageRef.update({
        [`${currentMonth}.${feature}`]: currentCount + amount,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    captureError('Failed to increment usage', { userId, feature, amount, error });
  }
}

/**
 * Reset monthly usage (call via cron job)
 */
export async function resetMonthlyUsage(): Promise<void> {
  // This would be called by a cron job at month start
  // For now, it's handled automatically by month-based keys
}

/**
 * Get full usage report for a user
 */
export async function getUsageReport(userId: string): Promise<Record<string, unknown>> {
  try {
    const usageDoc = await db.collection('usage').doc(userId).get();
    
    if (!usageDoc.exists) {
      return {};
    }

    return usageDoc.data() || {};
  } catch (error) {
    captureError('Failed to get usage report', { userId, error });
    return {};
  }
}
```

### Firestore Collection Structure
```
usage/{userId}
  2025-12:
    ai_generations: 45
    bots: 3
    automations: 12
    api_calls: 234
    marketplace_purchases: 2
  2025-11:
    ai_generations: 98
    ...
  updatedAt: "2025-12-10T10:00:00.000Z"
```

---

## Task 6: Guardian Bot Integration Points

**File:** Update existing routes  
**Priority:** 🔴 CRITICAL  
**Estimated Time:** 1-2 hours

### Guardian Bot Triggers

Add Guardian checks to:

1. **AI Generation** (`/app/api/ai/generate/route.ts`) ✅ Covered in Task 2
2. **Payments** (`/app/api/payments/crypto/route.ts`) ✅ Covered in Task 3
3. **Account Changes** (create if missing)
4. **Admin Operations** (create if missing)
5. **Bulk Operations** (create if missing)

### Guardian Bot Usage Pattern
```typescript
const guardian = Guardian.getInstance();
const securityCheck = await guardian.analyzeUserBehavior(
  userId,
  operation_type, // 'ai_generation', 'payment', 'account_change', etc.
  contextData // { ip, amount, target, etc. }
);

if (!securityCheck.allowed) {
  captureError('Suspicious activity detected', {
    userId,
    operation: operation_type,
    reason: securityCheck.reason,
    context: contextData
  });
  return errorResponse(403, 'Forbidden', 'Unable to process request');
}
```

---

## Testing Plan

### Unit Tests (If Framework Available)
- [ ] `auth-middleware.ts` - all auth methods
- [ ] `usage-tracker.ts` - increment, check, report
- [ ] API routes - all security layers

### Integration Tests
- [ ] Full API flow: rate limit → auth → tier → usage → execute
- [ ] Guardian Bot integration
- [ ] Usage tracking across requests
- [ ] Idempotency in webhooks

### Manual Testing
- [ ] Test with Postman/curl for all endpoints
- [ ] Test rate limiting (hit limits)
- [ ] Test with different tier users
- [ ] Test at usage quotas
- [ ] Test Guardian Bot triggers

---

## Deployment Checklist

Before deploying to production:

- [ ] All 6 tasks completed
- [ ] Environment variables configured
- [ ] Firebase Admin SDK initialized
- [ ] Firestore security rules updated
- [ ] API keys collection created
- [ ] Usage collection indexes created
- [ ] Webhook events collection created
- [ ] Guardian Bot trained/configured
- [ ] Sentry error tracking verified
- [ ] Rate limiting tested
- [ ] All tests passing

---

## Success Metrics

After implementation, verify:
- ✅ No unauthorized API access
- ✅ Rate limits enforced on all routes
- ✅ Usage tracking accurate
- ✅ Guardian Bot blocks suspicious activity
- ✅ Webhooks don't process duplicates
- ✅ Error rates decrease (better error handling)
- ✅ Security audit passes

---

**Total Estimated Time:** 16-21 hours (2-3 days)  
**Assignee:** Backend team  
**Review Required:** Security review before merge  
**Documentation:** Update API docs with new authentication requirements
