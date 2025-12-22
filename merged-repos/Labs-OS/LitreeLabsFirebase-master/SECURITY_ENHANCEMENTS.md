# Stripe Webhook Security Enhancements

This document outlines security best practices for the Stripe webhook handler in production. Most are already implemented; optional enhancements are noted below.

## ✅ Implemented Security Measures

### 1. Webhook Signature Verification (REQUIRED)
**Status:** ✅ Implemented in `app/api/webhooks/stripe/route.ts`

```typescript
const event = stripe.webhooks.constructEvent(
  body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

- Validates the `stripe-signature` header using your webhook secret
- Prevents unauthorized or replayed events
- Fails safely if signature is invalid

### 2. Internal Webhook Secret (REQUIRED)
**Status:** ✅ Configured in `.env.local`

Used to protect internal endpoints from unauthorized calls:

```typescript
const webhookSecret = request.headers.get('x-internal-webhook-secret');
if (!expectedSecret || !webhookSecret || 
    !crypto.timingSafeEqual(Buffer.from(webhookSecret), Buffer.from(expectedSecret))) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

Apply to sensitive endpoints like `/api/subscription-update`.

### 3. No Secrets in Logs
**Status:** ✅ Implemented via `lib/serverLogger`

```typescript
import { info, warn, error } from '@/lib/serverLogger';

info(`✅ Stripe: ${email} subscribed to ${tier}`);
// Email is safe; avoid logging raw event or signature
```

**Rule:** Never log `stripe-signature`, `raw body`, or customer payment methods.

### 4. Rate Limiting (OPTIONAL but Recommended)
**Status:** Not enforced on webhook; can be added

Add per-IP rate limiting for webhook endpoint to prevent abuse:

```typescript
// Install: npm install rate-limiter-flexible
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 100,           // 100 requests
  duration: 60,          // per 60 seconds
});

export async function POST(request: NextRequest) {
  const ip = request.ip || 'unknown';
  try {
    await rateLimiter.consume(ip);
  } catch {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  // ... continue with webhook processing
}
```

### 5. IP Allowlisting for Stripe Webhooks (OPTIONAL but Recommended for Production)
**Status:** Not enforced; can be added for production

Verify webhook source IP is from Stripe's known ranges:

```typescript
// Stripe's known webhook IPs (from their docs)
const STRIPE_WEBHOOK_IPS = [
  '52.89.213.63',
  '52.89.214.238',
  '52.200.149.26',
  '52.211.126.134',
  '52.213.47.204',
  '35.182.6.230',
  '35.184.236.113',
  '52.199.191.226',
  '54.248.220.155',
  '35.241.18.214',
  '34.65.245.25',
];

export async function POST(request: NextRequest) {
  const ip = request.ip || 'unknown';
  if (!STRIPE_WEBHOOK_IPS.includes(ip)) {
    error(`Webhook from untrusted IP: ${ip}`);
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  // ... continue
}
```

⚠️ **Note:** Update IP list periodically from [Stripe IP Range Documentation](https://stripe.com/docs/webhooks).

### 6. Timeout & Error Handling
**Status:** ✅ Implemented

```typescript
export const maxDuration = 60; // Handle long-running operations

try {
  // webhook processing
} catch (err) {
  error(`Webhook processing failed: ${err.message}`);
  return NextResponse.json({ received: true }, { status: 200 });
}
```

- Always return `200 OK` to Stripe even if processing fails (prevents retries for processed events)
- Log errors for debugging but don't expose to user

## 🔧 Optional Production Enhancements

### Add HMAC Request Signing for Internal Calls
When your webhook calls internal endpoints (e.g., `/api/subscription-update`), sign requests:

```typescript
// In webhook handler
const signature = crypto
  .createHmac('sha256', process.env.INTERNAL_WEBHOOK_SECRET!)
  .update(JSON.stringify(payload))
  .digest('hex');

const response = await fetch(`${baseUrl}/api/subscription-update`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-internal-webhook-secret': process.env.INTERNAL_WEBHOOK_SECRET!,
    'x-request-signature': signature,
  },
  body: JSON.stringify(payload),
});

// In `/api/subscription-update`
const signature = request.headers.get('x-request-signature');
const body = await request.text();
const expectedSig = crypto
  .createHmac('sha256', process.env.INTERNAL_WEBHOOK_SECRET!)
  .update(body)
  .digest('hex');

if (!crypto.timingSafeEqual(Buffer.from(signature!), Buffer.from(expectedSig))) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Dead Letter Queue for Failed Processing
Store failed webhook events for later retry:

```typescript
if (processingFailed) {
  await db.collection('webhook_dlq').add({
    event: event.id,
    type: event.type,
    data: event.data,
    error: errorMessage,
    retries: 0,
    createdAt: new Date(),
  });
}
```

### Webhook Event Deduplication
Prevent double-processing of duplicate events (e.g., Stripe retries):

```typescript
const eventId = event.id;
const processed = await db
  .collection('processed_webhook_events')
  .doc(eventId)
  .get();

if (processed.exists) {
  info(`Event ${eventId} already processed`);
  return NextResponse.json({ received: true }, { status: 200 });
}

// ... process event

await db.collection('processed_webhook_events').doc(eventId).set({
  processedAt: new Date(),
});
```

### Monitoring & Alerting
Set up alerts for webhook failures:

```typescript
if (processingFailed) {
  await fetch('https://your-monitoring.com/alert', {
    method: 'POST',
    body: JSON.stringify({
      level: 'error',
      message: `Stripe webhook failed: ${event.type}`,
      eventId: event.id,
      error: errorMessage,
    }),
  });
}
```

## Testing Security

### Test Invalid Signature
```powershell
# This should fail (403)
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "stripe-signature: invalid_signature" \
  -d '{"type":"charge.succeeded"}'
```

### Test with Stripe CLI Test Secret
```powershell
# Stripe CLI automatically uses the correct secret
stripe trigger checkout.session.completed
```

### Test Rate Limiting
```powershell
# Rapid requests (if rate limiting enabled)
for ($i=1; $i -le 150; $i++) {
  stripe trigger charge.succeeded
}
# Expect 429 after quota exceeded
```

## Checklist for Production

- [ ] Use `whsec_live_...` webhook secret (not test)
- [ ] Enable rate limiting (100 req/min)
- [ ] Enable IP allowlisting (optional but recommended)
- [ ] Set up monitoring/alerting for webhook failures
- [ ] Implement dead letter queue for failed events
- [ ] Add deduplication logic for retry handling
- [ ] Review logs weekly for suspicious activity
- [ ] Rotate `INTERNAL_WEBHOOK_SECRET` quarterly
- [ ] Monitor Stripe webhook delivery status in dashboard

## References

- **Stripe Webhook Security:** https://stripe.com/docs/webhooks/best-practices
- **Stripe IP Ranges:** https://stripe.com/docs/webhooks
- **HMAC Signing:** https://stripe.com/docs/stripe-cli/verify-signatures

---

**Last Updated:** December 11, 2025  
**Maintainer:** Labs AI Studio Team
