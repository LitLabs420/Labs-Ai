# Stripe Webhook Integration - Complete Reference

## Overview
Your LitLabs AI application now has full Stripe webhook support configured. This document explains what's been set up and how to use it.

## What's Been Created

### 1. **Webhook Handler** (`/app/api/webhooks/stripe/route.ts`)
- **Location**: `app/api/webhooks/stripe/route.ts`
- **Purpose**: Receives and processes Stripe webhook events
- **Signature verification**: Validates that events come from Stripe (not forged)
- **Event types handled**:
  - `payment_intent.succeeded` - Payment completed
  - `payment_intent.payment_failed` - Payment failed
  - `charge.refunded` - Refund processed
  - `customer.subscription.created` - New subscription
  - `customer.subscription.updated` - Subscription modified
  - `customer.subscription.deleted` - Subscription cancelled
  - `invoice.payment_succeeded` - Invoice paid
  - `invoice.payment_failed` - Invoice payment failed

### 2. **Setup Guides**
- `STRIPE_WEBHOOK_SETUP.md` - Detailed configuration guide
- `STRIPE_QUICK_START.md` - Quick 5-minute setup

### 3. **Environment Configuration** (`.env.local`)
Updated with Stripe-specific environment variables with helpful comments.

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                   Stripe System                         │
│                                                         │
│  User makes payment → Stripe processes → Event occurs  │
└──────────────────────────┬──────────────────────────────┘
                           │
                           │ Sends HTTP POST
                           ▼
        ┌──────────────────────────────────┐
        │ Your Webhook Endpoint            │
        │ /api/webhooks/stripe             │
        │                                  │
        │ 1. Verify signature ✓            │
        │ 2. Parse event type              │
        │ 3. Handle event                  │
        │ 4. Update Firestore (optional)   │
        │ 5. Return 200 OK                 │
        └──────────────────────────────────┘
                           │
                           ▼
           ┌──────────────────────────┐
           │ Firestore (optional)     │
           │                          │
           │ - Payments               │
           │ - Subscriptions          │
           │ - Invoices               │
           │ - Refunds                │
           └──────────────────────────┘
```

## Environment Variables Required

### Stripe Configuration
```dotenv
# Your Stripe publishable key (safe to be public, starts with pk_test_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY

# Your Stripe secret key (NEVER public, starts with sk_test_)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY

# Webhook signing secret (starts with whsec_)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

### Firebase Configuration (for database)
```dotenv
# Server-side Firebase credentials for webhook handler
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=your_private_key_here
```

## Getting Your Keys

### Test Keys (Development)
1. Go to https://dashboard.stripe.com
2. Ensure **Test mode** is ON (toggle in top-right)
3. Navigate to **Developers** → **API Keys**
4. Copy:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### Webhook Secret (Development with Stripe CLI)
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
Copy the `whsec_test_*` secret it displays.

### Production Keys
1. Turn off **Test mode** in Stripe Dashboard
2. Get `pk_live_*` and `sk_live_*` keys
3. Set up webhook endpoint in Stripe Dashboard:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Copy the `whsec_*` secret

## Testing Locally

### Setup
```bash
# 1. Install Stripe CLI from https://stripe.com/docs/stripe-cli

# 2. Login
stripe login

# 3. Start listening (run in separate terminal)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 4. In your .env.local, use the whsec_ secret provided above
```

### Trigger Events
```bash
# In another terminal, trigger test events:
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger charge.refunded
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

### Verify
- Check your dev server console for: `Processing webhook event: ...`
- Check Stripe Dashboard → Developers → Webhooks → Events
- All events should show ✓ (successful delivery)

## Event Processing

### What Happens When an Event Arrives

1. **Signature Verification**
   - Webhook signature is validated using your webhook secret
   - Prevents processing forged events
   - Returns 400 if signature invalid

2. **Event Parsing**
   - Event type is identified
   - Event data is extracted

3. **Event Handling**
   - Different logic for each event type
   - Examples:
     - `payment_intent.succeeded`: Log successful payment
     - `customer.subscription.created`: Save subscription to Firestore
     - `charge.refunded`: Log refund in database

4. **Database Update (Optional)**
   - If Firebase is configured, event data is stored
   - Collections: payments, subscriptions, invoices, refunds
   - Useful for audit trails and user history

5. **Response**
   - Always returns `{ received: true }` with 200 status
   - Tells Stripe webhook was processed successfully

## Firestore Collections

If Firebase is configured, webhooks create/update:

### `payments` Collection
```json
{
  "userId": "user-id",
  "stripePaymentIntentId": "pi_...",
  "amount": 9999,
  "currency": "usd",
  "status": "succeeded",
  "timestamp": "2024-12-09T10:30:00Z"
}
```

### `subscriptions` Collection
```json
{
  "stripeSubscriptionId": "sub_...",
  "userId": "user-id",
  "stripeCustomerId": "cus_...",
  "status": "active",
  "currentPeriodStart": "2024-12-09T00:00:00Z",
  "currentPeriodEnd": "2025-01-09T00:00:00Z"
}
```

### `invoices` Collection
```json
{
  "stripeInvoiceId": "in_...",
  "stripeCustomerId": "cus_...",
  "amount": 9999,
  "currency": "usd",
  "status": "paid",
  "paidAt": "2024-12-09T10:30:00Z"
}
```

### `refunds` Collection
```json
{
  "stripeChargeId": "ch_...",
  "stripeRefundId": "re_...",
  "amount": 5000,
  "currency": "usd",
  "timestamp": "2024-12-09T10:30:00Z"
}
```

## Security Checklist

✅ **Implemented**
- [x] Signature verification (prevents forged webhooks)
- [x] Proper HTTP status codes
- [x] Error handling and logging
- [x] TypeScript for type safety

✅ **Best Practices to Follow**
- [x] Never expose webhook secret in frontend
- [x] Keep STRIPE_SECRET_KEY in .env.local only
- [x] Use test keys for development, live keys for production
- [x] Verify webhook logs in Stripe Dashboard regularly

## Common Issues & Solutions

### "Webhook secret not configured"
**Cause**: `STRIPE_WEBHOOK_SECRET` missing from `.env.local`
**Fix**: Add the secret and restart your dev server

### "Invalid signature"
**Cause**: Webhook secret doesn't match Stripe's records
**Fix**: Verify you're using the correct secret from Stripe Dashboard or Stripe CLI

### "Cannot find module 'stripe'"
**Cause**: Stripe package not installed
**Fix**: Run `npm install stripe`

### Webhook not triggering
**Cause**: 
- Your server isn't running
- Firewall blocks Stripe webhooks
- Wrong endpoint URL
**Fix**: 
- Restart `npm run dev`
- Check firewall settings
- Verify URL in Stripe Dashboard

### Firebase initialization errors
**Cause**: Firebase credentials missing or invalid
**Fix**: Ensure Firebase env variables are set correctly in `.env.local`

## Production Deployment

### Before Going Live

1. **Switch to Live Keys**
   - Get `pk_live_*` and `sk_live_*` from Stripe Dashboard
   - Update environment variables in production

2. **Set Webhook Endpoint**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select all events or specific ones
   - Copy signing secret

3. **Update Environment**
   - Add webhook secret to production environment
   - Deploy your application

4. **Verify**
   - Make a test payment in your production app
   - Check webhook logs in Stripe Dashboard
   - Verify events appear with ✓ status

### Monitoring Production

- Check webhook delivery logs daily: https://dashboard.stripe.com/webhooks
- Set up error alerts for webhook failures
- Monitor application logs for webhook processing errors
- Keep webhook handler updated with new event types as needed

## API Reference

### Webhook Endpoint
- **URL**: `/api/webhooks/stripe` (POST)
- **Authentication**: Signature verification (not API key)
- **Request headers**: `stripe-signature` (contains signature)
- **Request body**: Raw JSON string
- **Response**: `{ received: true }` (200 OK)

### Environment Variables
| Variable | Required | Example |
|----------|----------|---------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | `pk_test_ABC123...` |
| `STRIPE_SECRET_KEY` | Yes | `sk_test_XYZ789...` |
| `STRIPE_WEBHOOK_SECRET` | Yes | `whsec_test_ABC123...` |
| `FIREBASE_PROJECT_ID` | No | `my-firebase-project` |
| `FIREBASE_CLIENT_EMAIL` | No | `firebase-adminsdk@...` |
| `FIREBASE_PRIVATE_KEY` | No | `-----BEGIN PRIVATE KEY-----...` |

## Resources

- **Stripe Webhooks**: https://stripe.com/docs/webhooks
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
- **Testing Guide**: https://stripe.com/docs/testing
- **API Reference**: https://stripe.com/docs/api
- **Webhook Events**: https://stripe.com/docs/api/events/types

## Support

For help:
1. Check webhook logs: Stripe Dashboard → Developers → Webhooks
2. Review application server logs
3. Verify all env variables are set
4. Check Stripe status page: https://status.stripe.com
5. Contact Stripe support: https://support.stripe.com

---

**Last Updated**: December 9, 2024
**Status**: ✅ Ready for Testing
