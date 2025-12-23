# Stripe Webhook Setup & Testing Guide

## Quick Start (5 minutes)

Your project has two automation scripts to set up Stripe webhooks with minimal effort.

### 1. Verify Environment & CLI

Run this first to confirm your environment is ready:

```powershell
cd "d:\Labs OS\LitreeLabsFirebase-master"
powershell -ExecutionPolicy Bypass -File .\verify-setup.ps1
```

**Expected output:**
- ✅ STRIPE_SECRET_KEY
- ✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- ✅ STRIPE_WEBHOOK_SECRET
- ✅ INTERNAL_WEBHOOK_SECRET
- ✅ Stripe CLI installed (Version 1.33.0+)

### 2. Start Dev Server & Stripe Listener

**Terminal 1: Start Next.js dev server**
```powershell
cd "d:\Labs OS\LitreeLabsFirebase-master"
npm run dev
```

**Terminal 2: Listen for Stripe webhooks**
```powershell
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

Output should show:
```
> Ready! Your webhook signing secret is: whsec_...
```

### 3. Test Webhooks

**Terminal 3: Trigger test events**
```powershell
# Payment flow
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed

# Subscription lifecycle
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted

# Check dashboard for confirmation
stripe events list
```

## Automated Setup (If Starting Fresh)

If you need to re-capture your webhook secret from scratch:

```powershell
powershell -ExecutionPolicy Bypass -File .\stripe-webhook-setup.ps1
```

This will:
1. Verify Stripe CLI is installed (install via Chocolatey if needed)
2. Prompt you to authenticate with Stripe (browser opens)
3. Start `stripe listen` and forward webhooks to your local endpoint
4. Capture the signing secret (whsec_...)
5. Automatically update `.env.local` with the secret

## Environment Variables

Required in `.env.local`:

| Variable | Source | Purpose |
|----------|--------|---------|
| `STRIPE_SECRET_KEY` | [Stripe Dashboard API Keys](https://dashboard.stripe.com/apikeys) | Server-side Stripe operations |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard API Keys | Client-side Stripe (checkout, etc.) |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard > Webhooks | Verify webhook signature |
| `INTERNAL_WEBHOOK_SECRET` | Generated locally | Protect internal webhook endpoints |

**Current Status:**
- ✅ STRIPE_SECRET_KEY: `sk_test_51SYJoR...` (configured)
- ✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: `pk_test_51SYJoR...` (configured)
- ✅ STRIPE_WEBHOOK_SECRET: `whsec_313214e24c9f...` (configured)
- ✅ INTERNAL_WEBHOOK_SECRET: `dev_internal_webhook_secret_...` (configured)

## Webhook Endpoint

Your webhook is listening at:
```
POST http://localhost:3000/api/webhooks/stripe
```

**Handler:** `app/api/webhooks/stripe/route.ts`

**Signature Verification:**
- The handler uses `stripe.webhooks.constructEvent()` to verify the `stripe-signature` header
- This prevents replay attacks and ensures the event comes from Stripe

## Event Handlers (Implemented)

| Event | Handler | Action |
|-------|---------|--------|
| `checkout.session.completed` | Update subscription + log transaction | User purchases/upgrades subscription |
| `customer.subscription.updated` | Sync subscription status | Plan change or renewal |
| `customer.subscription.deleted` | Mark as cancelled | User cancels subscription |
| `invoice.payment_succeeded` | Update balance | Payment processed |
| `invoice.payment_failed` | Mark past_due | Failed payment detected |

## Troubleshooting

### Issue: "Stripe CLI not authenticated"
**Solution:** Run `stripe login` in any terminal; browser will open for authentication.

### Issue: "Failed to forward webhook"
**Solution:** Ensure dev server is running on port 3000:
```powershell
npm run dev
```

### Issue: "Invalid signature" errors in logs
**Solution:** Check that STRIPE_WEBHOOK_SECRET in `.env.local` matches the one in Stripe Dashboard:
```powershell
stripe listen --print-secret
```

### Issue: Webhooks not appearing in logs
**Solution:** 
1. Check that `stripe listen` is running in another terminal
2. Confirm the forward URL matches your local endpoint:
   ```powershell
   stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
   ```

## Production Deployment

When deploying to production:

1. **Get live webhook secret:**
   - Go to [Stripe Dashboard Webhooks](https://dashboard.stripe.com/webhooks)
   - Create endpoint for your production domain
   - Copy the live webhook secret (starts with `whsec_live_`)

2. **Update environment variables:**
   - Set `STRIPE_SECRET_KEY=sk_live_...` (live secret key)
   - Set `STRIPE_WEBHOOK_SECRET=whsec_live_...` (live webhook secret)
   - Deploy via Vercel or your hosting platform

3. **Optional security enhancements:**
   - Add IP allowlisting for Stripe webhook source (see `SECURITY_ENHANCEMENTS.md`)
   - Enable rate limiting on webhook endpoint
   - Set up monitoring for webhook failures

## Files Reference

- **Setup Script:** `stripe-webhook-setup.ps1` – Automates Stripe CLI login and secret capture
- **Verification Script:** `verify-setup.ps1` – Checks env vars and CLI status
- **Webhook Handler:** `app/api/webhooks/stripe/route.ts` – Processes Stripe events
- **Config:** `.env.local` – Environment variables (local dev only)

## Testing Commands Cheat Sheet

```powershell
# Authenticate
stripe login

# Listen & forward
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe

# Trigger events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed

# View recent events
stripe events list

# Debug
stripe listen --print-secret          # Show current webhook secret
stripe logs tail                       # View live request/response logs
stripe logout                          # Disconnect from Stripe account
```

## Support & Docs

- **Stripe CLI Docs:** https://stripe.com/docs/stripe-cli
- **Webhooks Docs:** https://stripe.com/docs/webhooks
- **Test Cards:** https://stripe.com/docs/testing#cards

---

**Last Updated:** December 11, 2025  
**Status:** ✅ All webhooks tested and working
