# Quick Start: Stripe Webhooks

## 🚀 Get Started in 5 Minutes

### Step 1: Update Your Environment Variables

Edit your `.env.local` with **actual** Stripe keys:

```dotenv
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

> Get these from: https://dashboard.stripe.com/apikeys

### Step 2: Install & Run Stripe CLI (for local testing)

```bash
# Install Stripe CLI from https://stripe.com/docs/stripe-cli

# Login to your Stripe account
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Copy and save the webhook secret** it displays!

### Step 3: Restart Your Dev Server

```bash
npm run dev
```

### Step 4: Test a Webhook Event

In a new terminal:

```bash
# Trigger a test payment_intent.succeeded event
stripe trigger payment_intent.succeeded
```

Check your console for: `Processing webhook event: payment_intent.succeeded` ✓

## 📋 Test Events

```bash
# Payment succeeded
stripe trigger payment_intent.succeeded

# Payment failed
stripe trigger payment_intent.payment_failed

# Refund
stripe trigger charge.refunded

# Subscription created
stripe trigger customer.subscription.created

# Subscription updated
stripe trigger customer.subscription.updated

# Subscription canceled
stripe trigger customer.subscription.deleted

# Invoice paid
stripe trigger invoice.payment_succeeded

# Invoice payment failed
stripe trigger invoice.payment_failed
```

## ✅ Verify It's Working

1. **Check your terminal** for webhook processing logs
2. **Check Firestore** (if configured) for new records in:
   - `payments` collection
   - `subscriptions` collection
   - `invoices` collection

3. **Check Stripe Dashboard**:
   - Go to Developers → Webhooks
   - Click your endpoint
   - Scroll down to see event logs with ✓ (success) or ✗ (failed)

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Webhook secret not configured" | Add `STRIPE_WEBHOOK_SECRET` to `.env.local` and restart |
| "Invalid signature" | Verify the webhook secret matches Stripe |
| No events appearing | Make sure `stripe listen` is running in another terminal |
| Firebase errors | Ensure Firebase is configured in `.env.local` |

## 📚 Files Created

- `/app/api/webhooks/stripe/route.ts` - Webhook handler
- `STRIPE_WEBHOOK_SETUP.md` - Full configuration guide
- `STRIPE_QUICK_START.md` - This file

## 🔗 Next Steps

1. ✅ Test webhooks with Stripe CLI
2. ✅ Deploy to production
3. ✅ Set up production webhook endpoint in Stripe Dashboard
4. ✅ Switch to live keys (`pk_live_*` and `sk_live_*`)

## 📖 Learn More

- [Stripe Webhooks Docs](https://stripe.com/docs/webhooks)
- [Stripe CLI Guide](https://stripe.com/docs/stripe-cli)
- [Testing Guide](https://stripe.com/docs/testing)
