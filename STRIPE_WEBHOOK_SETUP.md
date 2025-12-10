# Stripe Webhook Configuration Guide

## Overview
This guide walks you through setting up Stripe webhooks for your LitLabs AI application. Webhooks allow Stripe to notify your server of important payment events (charges, subscriptions, refunds, etc.).

## Prerequisites
- Stripe account (go to https://stripe.com if you don't have one)
- Your application running locally or deployed
- Access to Stripe Dashboard

## Step 1: Get Your Stripe API Keys

1. Go to **Stripe Dashboard**: https://dashboard.stripe.com
2. Login to your account
3. Navigate to **Developers** → **API Keys**
4. You'll see two keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

### For Local Development (Testing)
- Use `pk_test_*` and `sk_test_*` keys (these are safe for testing)
- These keys only work in test mode

### For Production
- Use `pk_live_*` and `sk_live_*` keys
- Only use these when your app is live and secure

## Step 2: Configure Environment Variables

Your `.env.local` should have:

```dotenv
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

> ⚠️ **Important**: The `STRIPE_SECRET_KEY` should ONLY be in `.env.local` (not committed to git). The `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is safe to be public.

## Step 3: Set Up Webhook Endpoint

### Local Development (Using Stripe CLI)

If testing locally, use **Stripe CLI** to forward webhook events:

```bash
# 1. Install Stripe CLI from https://stripe.com/docs/stripe-cli

# 2. Login to your Stripe account
stripe login

# 3. Forward events to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will output your webhook signing secret:
```
> Ready! Your webhook signing secret is: whsec_test_1234567890...
```

Copy this secret to your `.env.local`:
```dotenv
STRIPE_WEBHOOK_SECRET=whsec_test_1234567890...
```

### Production Deployment

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL:
   ```
   https://yourdomain.com/api/webhooks/stripe
   ```
4. Select events to listen for (recommended: all `payment_intent.*` and `charge.*` events)
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to your `.env` variables

## Step 4: Webhook Events to Handle

Common events your app should handle:

| Event | Purpose |
|-------|---------|
| `payment_intent.succeeded` | Payment completed successfully |
| `payment_intent.payment_failed` | Payment failed |
| `charge.refunded` | Refund processed |
| `customer.subscription.created` | New subscription created |
| `customer.subscription.updated` | Subscription updated |
| `customer.subscription.deleted` | Subscription cancelled |
| `invoice.payment_succeeded` | Invoice paid |
| `invoice.payment_failed` | Invoice payment failed |

## Step 5: Testing Webhooks Locally

With Stripe CLI running, you can trigger test events:

```bash
# Test payment succeeded
stripe trigger payment_intent.succeeded

# Test charge refunded
stripe trigger charge.refunded

# Test subscription created
stripe trigger customer.subscription.created

# See all available events
stripe trigger --help
```

Your `/api/webhooks/stripe` endpoint should receive and process these events.

## Step 6: Verify Your Setup

### Check Webhook Logs

1. Go to **Developers** → **Webhooks**
2. Click your endpoint
3. Scroll to **Events** section
4. You should see recent webhook deliveries with ✓ checkmarks (successful)

### Common Issues

**Error: "Webhook secret not configured"**
- Ensure `STRIPE_WEBHOOK_SECRET` is set in `.env.local`
- Restart your dev server after changing env variables

**Error: "Invalid signature"**
- Your `STRIPE_WEBHOOK_SECRET` doesn't match Stripe's records
- Get the correct secret from Stripe Dashboard

**Error: "Webhook endpoint not responding"**
- Your application isn't running
- Check firewall/network connectivity
- Make sure the endpoint URL is correct

## Integration Checklist

- [ ] Created Stripe account and activated
- [ ] Retrieved publishable and secret keys
- [ ] Added keys to `.env.local`
- [ ] Set up webhook endpoint URL in Stripe Dashboard
- [ ] Got webhook signing secret
- [ ] Added webhook signing secret to `.env.local`
- [ ] Restarted development server (`npm run dev`)
- [ ] Tested webhook with Stripe CLI or Dashboard
- [ ] Verified webhook logs show successful deliveries
- [ ] Implemented webhook handler at `/api/webhooks/stripe`

## Webhook Handler Implementation

Your webhook handler should:

1. **Verify signature** - Ensure the request is from Stripe
2. **Log the event** - Store event data for debugging
3. **Process event** - Handle different event types
4. **Update database** - Update user subscription status, etc.
5. **Return 200 OK** - Acknowledge receipt to Stripe

Example events your app should handle:
- User upgrades plan → Update `users.subscription` in Firestore
- User cancels subscription → Update `users.subscription` to 'free'
- Payment fails → Notify user, mark payment as pending retry

## Security Best Practices

✅ **DO:**
- Verify webhook signatures before processing
- Use HTTPS in production
- Keep webhook secret secure (never expose in frontend code)
- Log all webhook events for auditing
- Idempotent operations (handle duplicate events safely)

❌ **DON'T:**
- Trust webhook data without verifying signature
- Expose webhook secret in frontend code
- Use test keys in production
- Skip error handling in webhook processor

## Troubleshooting

### Webhook not triggering
- Check endpoint URL in Stripe Dashboard
- Ensure your server is running and accessible
- Verify firewall rules allow Stripe IP addresses

### Events not processing correctly
- Check webhook logs in Stripe Dashboard
- Verify webhook signing secret matches
- Check application server logs for errors

### Test mode vs Live mode
- Use `pk_test_*` and `sk_test_*` for testing
- Switch to `pk_live_*` and `sk_live_*` for production
- Webhook secrets are different for test and live modes

## Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Guide](https://stripe.com/docs/stripe-cli)
- [Testing Stripe Payments](https://stripe.com/docs/testing)
- [Stripe API Reference](https://stripe.com/docs/api)

## Support

For issues:
1. Check Stripe Dashboard → Developers → Webhooks → Event logs
2. Review application server logs
3. Verify `.env.local` has all required variables
4. Contact Stripe Support: https://support.stripe.com
