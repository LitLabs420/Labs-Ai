# 🚀 GLAMFLOW AI - Payment Processing Deployment Guide

## Phase 1: Local Development Setup

### 1.1 Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

### 1.2 Navigate to Functions Directory
```bash
cd c:\Users\dying\public\functions
npm install
```

### 1.3 Set Environment Variables
```bash
firebase functions:config:set stripe.secret_key="sk_live_YOUR_KEY"
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_SECRET"
firebase functions:config:set stripe.publishable_key="pk_live_YOUR_KEY"
firebase functions:config:set paypal.email="your-email@paypal.com"
firebase functions:config:set paypal.client_id="YOUR_CLIENT_ID"
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.pass="your-app-password"
```

### 1.4 Test Locally
```bash
firebase emulators:start --only functions
# Test endpoints at: http://localhost:5001/studio-4627045237-a2fe9/us-central1/
```

---

## Phase 2: Stripe Configuration

### 2.1 Get Stripe Live Keys
1. Go to: https://dashboard.stripe.com/apikeys
2. Copy **Secret Key** (sk_live_...)
3. Copy **Publishable Key** (pk_live_...)

### 2.2 Create Webhook Endpoint
1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://us-central1-studio-4627045237-a2fe9.cloudfunctions.net/handleStripeWebhook`
4. Events to send:
   - ✅ checkout.session.completed
   - ✅ invoice.payment_failed
   - ✅ customer.subscription.updated
   - ✅ customer.subscription.deleted
5. Copy **Signing secret** (whsec_...)

### 2.3 Update Price IDs (Already configured)
- Pro Plan: `price_1SYMhF440X4TKc4a2MfVCkFt` → $29/month
- Enterprise: `price_1SYMnG440X4TKc4aVC48Pls5` → $99/month

---

## Phase 3: PayPal Configuration

### 3.1 Get PayPal Credentials
1. Go to: https://developer.paypal.com/dashboard
2. Create/Select your app
3. Copy **Client ID** and **Client Secret**
4. Get your Business Email

### 3.2 Create PayPal Webhook
1. Go to Webhook Settings
2. Webhook URL: `https://us-central1-studio-4627045237-a2fe9.cloudfunctions.net/handlePayPalWebhook`
3. Events: PAYMENT.CAPTURE.COMPLETED
4. Copy **Webhook ID**

---

## Phase 4: Email Configuration

### 4.1 Gmail Setup
1. Enable 2FA on your Gmail account
2. Create an **App Password**: https://myaccount.google.com/apppasswords
3. Select: Mail + Windows Computer
4. Use the generated 16-character password

### 4.2 Alternative: SendGrid
1. Sign up: https://sendgrid.com
2. Create API Key
3. Use in functions with nodemailer or SendGrid SDK

---

## Phase 5: Deploy Cloud Functions

### 5.1 Deploy to Firebase
```bash
cd c:\Users\dying\public
firebase deploy --only functions
```

### 5.2 Verify Deployment
```bash
firebase functions:list
# You should see:
# ✓ handleStripeWebhook
# ✓ createCheckoutSession
# ✓ sendWelcomeEmail
# ✓ sendUpgradeReminders
```

---

## Phase 6: Test Payment Flow

### 6.1 Test Stripe Payment
1. Go to: https://studio-4627045237-a2fe9.web.app/dashboard.html
2. Admin logs in
3. Billing tab → Click "Upgrade to PRO"
4. Use Stripe test card: `4242 4242 4242 4242`
5. Check Firestore: User should be upgraded to 'pro'
6. Check email: Confirmation email should arrive

### 6.2 Test Failed Payment
1. Use test card: `4000 0000 0000 0002`
2. Verify payment fails in Stripe dashboard
3. Check Firestore: Transaction logged as failed
4. Check email: Dunning email sent

---

## Phase 7: Monitoring & Alerts

### 7.1 Set Up Firebase Alerts
```bash
firebase functions:log
```

### 7.2 Stripe Dashboard Monitoring
- Go to: https://dashboard.stripe.com/webhooks
- Check webhook logs for delivery success/failures
- Review failed payments: https://dashboard.stripe.com/payments?status=failed

### 7.3 Set Up Email Notifications (Optional)
```javascript
// In functions/index.js - Add admin alerts
async function alertAdmin(message) {
    await sendEmail('dyingbreed243@gmail.com', '🚨 GLAMFLOW Alert', message);
}

// Use in webhook handlers:
if (amount > 1000) {
    await alertAdmin(`Large payment: $${amount} from ${userEmail}`);
}
```

---

## Phase 8: Production Checklist

- [ ] All Stripe credentials set (not test keys)
- [ ] Webhook signing secret configured
- [ ] PayPal live credentials set
- [ ] Email service configured
- [ ] Cloud Functions deployed to Firebase
- [ ] Test payment flow completes
- [ ] Firestore records created for transactions
- [ ] Admin receives notifications
- [ ] Affiliate commission tracked
- [ ] User receives upgrade confirmation email
- [ ] Failed payment retry system working
- [ ] Monitoring/alerts configured
- [ ] Backup plan for payment failures documented

---

## Phase 9: Ongoing Maintenance

### Daily Checks
```bash
firebase functions:log --limit 50
# Look for errors in webhook processing
```

### Weekly Tasks
- Review transaction logs in Firestore
- Check failed payments and contact users
- Monitor Stripe dashboard for anomalies
- Test 1-2 payments manually

### Monthly Tasks
- Review MRR (Monthly Recurring Revenue)
- Reconcile Stripe balance with Firestore records
- Update pricing if needed
- Send business metrics to admin

---

## Common Issues & Fixes

### Issue: "Invalid Stripe Key"
**Fix**: Verify you're using **LIVE** keys (start with `pk_live_` or `sk_live_`), not test keys

### Issue: "Webhook failed - 401 Unauthorized"
**Fix**: Check webhook signing secret matches in Firebase config and Stripe dashboard

### Issue: "Email not sending"
**Fix**: Enable "Less secure apps" or use Gmail App Password instead of regular password

### Issue: "Cloud Function timeout"
**Fix**: Increase timeout in firebase.json:
```json
{
  "functions": {
    "timeoutSeconds": 60
  }
}
```

---

## Stripe Webhook Events Reference

| Event | Action |
|-------|--------|
| `checkout.session.completed` | User paid → Update subscription to 'pro'/'enterprise' |
| `invoice.payment_failed` | Payment failed → Send dunning email, log failed transaction |
| `customer.subscription.updated` | Plan changed → Update user plan in Firestore |
| `customer.subscription.deleted` | Subscription canceled → Downgrade to free, send goodbye email |

---

## Cost Estimates

- **Firebase Functions**: $0.40/million invocations (first 2M free)
- **Stripe**: 2.9% + $0.30 per transaction
- **SendGrid**: $20/month (10k emails) or free tier (100/day)
- **PayPal**: 2.9% + $0.30 per transaction

---

## Security Best Practices

✅ Never commit `.env` files - use Firebase config
✅ Webhook signing mandatory (verify sig header)
✅ Rate limit API endpoints
✅ Validate all user inputs
✅ Use HTTPS only (Firebase handles this)
✅ Store secrets in Firebase Secret Manager
✅ Enable audit logging for all payments
✅ Review Firestore security rules monthly

---

## Questions?

Contact: dyingbreed243@gmail.com or check Firebase documentation at https://firebase.google.com/docs
