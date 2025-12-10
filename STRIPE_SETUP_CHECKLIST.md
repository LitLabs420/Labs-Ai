# ✅ Stripe Webhook Setup Checklist

## Pre-Setup
- [ ] Have Stripe account (sign up at https://stripe.com if needed)
- [ ] Have access to Stripe Dashboard
- [ ] Development server ready to run

## Step 1: Get API Keys (5 minutes)
- [ ] Go to https://dashboard.stripe.com
- [ ] Click **Developers** in top menu
- [ ] Click **API Keys** in left sidebar
- [ ] Copy **Publishable key** (starts with `pk_test_`)
- [ ] Copy **Secret key** (starts with `sk_test_`)

## Step 2: Configure Environment (2 minutes)
- [ ] Open `.env.local` in your project
- [ ] Find the Stripe section
- [ ] Paste your **Publishable key** into `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Paste your **Secret key** into `STRIPE_SECRET_KEY`
- [ ] Leave `STRIPE_WEBHOOK_SECRET` for now (will get it in next step)

Example:
```dotenv
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

## Step 3: Install Stripe CLI (5 minutes)

### On Windows
```powershell
# Option 1: Using Scoop
scoop install stripe

# Option 2: Using Chocolatey
choco install stripe-cli

# Option 3: Download directly
# Go to https://github.com/stripe/stripe-cli/releases
```

### On macOS
```bash
brew install stripe/stripe-cli/stripe
```

### On Linux
```bash
curl https://files.stripe.com/stripe-cli/install.sh -o install.sh && sudo bash install.sh
```

- [ ] Verify installation: `stripe --version`

## Step 4: Login to Stripe
- [ ] Open your terminal/PowerShell
- [ ] Run: `stripe login`
- [ ] Follow the browser prompt to authorize
- [ ] Your device will be added to your Stripe account

## Step 5: Start Webhook Listener (1 minute)

### On Windows
```powershell
.\stripe-webhook-test.ps1
```

### On macOS/Linux
```bash
bash stripe-webhook-test.sh
```

Or manually:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

- [ ] You should see: `Ready! Your webhook signing secret is: whsec_test_...`
- [ ] **IMPORTANT**: Copy this secret!

## Step 6: Update Webhook Secret
- [ ] Copy the `whsec_test_...` secret from previous step
- [ ] Add it to `.env.local`:
  ```dotenv
  STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_SECRET_HERE
  ```

## Step 7: Start Your App
In a new terminal window:
- [ ] Run: `npm run dev`
- [ ] Wait for "ready - started server on..."

## Step 8: Test a Webhook Event

In a third terminal window:
```bash
stripe trigger payment_intent.succeeded
```

### Expected Results:
- [ ] In your app's terminal: `Processing webhook event: payment_intent.succeeded`
- [ ] In Stripe CLI terminal: Confirmation message
- [ ] Go to Stripe Dashboard → Developers → Webhooks → Events
- [ ] You should see your event with ✓ (checkmark)

## Step 9: Test More Events

Try these commands one at a time:
```bash
# Test payment failure
stripe trigger payment_intent.payment_failed

# Test refund
stripe trigger charge.refunded

# Test subscription creation
stripe trigger customer.subscription.created

# Test subscription update
stripe trigger customer.subscription.updated

# Test subscription cancellation
stripe trigger customer.subscription.deleted

# Test invoice paid
stripe trigger invoice.payment_succeeded

# Test invoice payment failed
stripe trigger invoice.payment_failed
```

- [ ] Each event should appear in your app's console
- [ ] Each event should show ✓ in Stripe Dashboard

## Step 10: Verify Firestore (Optional)

If Firebase is configured:
- [ ] Go to Firebase Console
- [ ] Open your Firestore database
- [ ] Check these collections for new records:
  - [ ] `payments` - from payment_intent.succeeded
  - [ ] `subscriptions` - from subscription events
  - [ ] `invoices` - from invoice events
  - [ ] `refunds` - from charge.refunded

## Before Production (Later)

When you're ready to deploy:
- [ ] Get live API keys (`pk_live_*` and `sk_live_*`)
- [ ] Deploy your application
- [ ] Set webhook endpoint in Stripe Dashboard:
  - Go to Developers → Webhooks → Add endpoint
  - URL: `https://yourdomain.com/api/webhooks/stripe`
  - Copy the webhook secret
- [ ] Update production environment variables
- [ ] Test with real payment

## Troubleshooting

### "Stripe CLI not found"
```bash
# Verify installation
stripe --version

# If not installed, use scoop/brew/choco (see Step 3)
```

### "Webhook secret not configured"
- [ ] Verify `STRIPE_WEBHOOK_SECRET` is in `.env.local`
- [ ] Restart your dev server (`npm run dev`)
- [ ] Make sure you copied the full secret

### "Invalid signature"
- [ ] Check webhook secret matches Stripe CLI output
- [ ] Make sure you're using the `whsec_test_*` secret
- [ ] Restart dev server

### "No events appearing"
- [ ] Make sure `stripe listen` is still running in first terminal
- [ ] Check URL is correct: `localhost:3000/api/webhooks/stripe`
- [ ] Verify dev server is running (`npm run dev`)

### "Events appear but don't save to Firestore"
- [ ] Firebase might not be configured
- [ ] Check Firebase credentials in `.env.local`
- [ ] This is optional - webhooks work fine without it

## You're Done! 🎉

Your Stripe webhook setup is complete and tested. You're ready to:
- ✅ Receive payment events
- ✅ Track subscriptions
- ✅ Process refunds
- ✅ Handle invoice payments

**Next**: Deploy to production when ready!

## Quick Reference

| File | Purpose |
|------|---------|
| `/app/api/webhooks/stripe/route.ts` | Webhook handler |
| `.env.local` | Configuration |
| `STRIPE_WEBHOOK_SETUP_COMPLETE.md` | Setup overview |
| `STRIPE_QUICK_START.md` | 5-minute guide |
| `STRIPE_WEBHOOK_SETUP.md` | Detailed guide |
| `STRIPE_WEBHOOK_REFERENCE.md` | Technical reference |
| `stripe-webhook-test.ps1` | Windows testing script |
| `stripe-webhook-test.sh` | macOS/Linux testing script |

## Support

- **Stuck?** Read `STRIPE_WEBHOOK_SETUP.md`
- **Need details?** Check `STRIPE_WEBHOOK_REFERENCE.md`
- **Want to hurry?** See `STRIPE_QUICK_START.md`
- **Need help?** Contact Stripe: https://support.stripe.com
