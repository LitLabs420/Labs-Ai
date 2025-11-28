# 🔧 COMPLETE STRIPE SETUP GUIDE

## ⚡ FASTEST PATH TO LIVE PAYMENTS

---

## PHASE 1: Test Keys Setup (5 minutes - DO THIS NOW)

### Step 1a: Get TEST Keys (for testing only)
```
Go to: https://dashboard.stripe.com/account/apikeys
```

**Copy these TEST keys:**
- Publishable (test): `pk_test_...`
- Secret (test): `sk_test_...`

### Step 1b: Set Firebase Config with TEST Keys
```powershell
cd 'C:\Users\dying\public'

firebase functions:config:set `
  stripe.secret_key="sk_test_51SYJoR3GB9IAma1QpReN5N3dcif52iRRmLMLWVyW7RmI7nJyWjZwZaSdN3hJZmmezEpv1lumZroUm319itZKwHdw00FTM06UOt" `
  stripe.publishable_key="pk_test_51SYJoR3GB9IAma1QpReN5N3dcif52iRRmLMLWVyW7RmI7nJyWjZwZaSdN3hJZmmezEpv1lumZroUm319itZKwHdw00FTM06UOt" `
  stripe.webhook_secret="whsec_test_123456789"

firebase deploy --only functions
```

### Step 1c: Test Payment
1. Go to: https://studio-4627045237-a2fe9.web.app
2. Sign up / Log in
3. Click "Upgrade to Pro"
4. Use test card: **4242 4242 4242 4242**
5. Expiry: **12/34**
6. CVC: **123**
7. Check Stripe dashboard for transaction ✅

---

## PHASE 2: Webhook Setup (5 minutes)

### Step 2a: Create Webhook Endpoint

Go to: https://dashboard.stripe.com/webhooks

1. Click **"Add endpoint"**
2. Enter endpoint URL:
   ```
   https://us-central1-studio-4627045237-a2fe9.cloudfunctions.net/handleStripeWebhook
   ```
3. Select events to listen for:
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
4. Click **"Add endpoint"**
5. Copy **Signing Secret** (whsec_...)

### Step 2b: Update Firebase Config with Webhook Secret
```powershell
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_SIGNING_SECRET_HERE"

firebase deploy --only functions
```

---

## PHASE 3: Bank Account Setup (10 minutes)

### Step 3a: Add Bank Account

Go to: https://dashboard.stripe.com/settings/payouts

1. Click **"Add bank account"**
2. Enter your routing number
3. Enter your account number
4. Confirm account holder name
5. Click **"Save"**

### Step 3b: Verify with Deposits

Stripe will send 2 small deposits ($0.32 and $0.45 usually):
1. Wait 1-2 business days
2. Check your bank account
3. Go back to Stripe
4. Enter the 2 deposit amounts to verify
5. Account now linked ✅

---

## PHASE 4: Switch to LIVE Keys (2 minutes)

### Step 4a: Get LIVE Keys

Go to: https://dashboard.stripe.com/account/apikeys

**Toggle "Live mode" ON** (top left)

Copy your LIVE keys:
- Publishable (live): `pk_live_...`
- Secret (live): `sk_live_...`

### Step 4b: Update Firebase Config with LIVE Keys
```powershell
firebase functions:config:set `
  stripe.secret_key="sk_live_YOUR_LIVE_SECRET_KEY" `
  stripe.publishable_key="pk_live_YOUR_LIVE_PUBLISHABLE_KEY" `
  stripe.webhook_secret="whsec_YOUR_LIVE_WEBHOOK_SECRET"

firebase deploy --only functions
```

### Step 4c: Deploy & Go Live
```powershell
firebase deploy --only hosting --force
```

---

## VERIFICATION CHECKLIST

After each phase, verify:

### After Test Keys:
- [ ] Firebase config shows keys: `firebase functions:config:get`
- [ ] Test payment processes in Stripe dashboard
- [ ] Firestore has transaction record
- [ ] No errors in Firebase logs: `firebase functions:log`

### After Webhook:
- [ ] Webhook endpoint shows "Enabled" in Stripe
- [ ] Test webhook fires when you process payment
- [ ] Firebase logs show webhook received

### After Bank Account:
- [ ] Bank account shows in Stripe as verified
- [ ] Can see payout schedule
- [ ] Status shows "Active"

### After LIVE Keys:
- [ ] Real payments process successfully
- [ ] Transactions appear in Stripe dashboard
- [ ] Firestore records real transactions
- [ ] Money deposits to bank (2-3 days)

---

## 💰 REVENUE TRACKING

Add this to your dashboard to see real-time revenue:

```html
<div style="background: linear-gradient(135deg, #ff0080, #ff8c00); padding: 2rem; border-radius: 12px; margin: 1rem 0; color: white;">
    <h3>💰 Monthly Revenue</h3>
    <div style="font-size: 2.5rem; font-weight: bold;" id="monthly-revenue">$0.00</div>
    <p style="margin-top: 1rem; opacity: 0.8;">Last updated: <span id="revenue-updated">now</span></p>
</div>

<script>
async function updateRevenue() {
    if (!window.firebaseDb || !currentUser) return;
    
    try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const snapshot = await window.firebaseDb
            .collection('transactions')
            .where('userId', '==', currentUser.uid)
            .where('status', '==', 'completed')
            .where('timestamp', '>=', monthStart)
            .get();
        
        let total = 0;
        snapshot.forEach(doc => {
            total += (doc.data().amount || 0);
        });
        
        document.getElementById('monthly-revenue').textContent = '$' + total.toFixed(2);
        document.getElementById('revenue-updated').textContent = new Date().toLocaleTimeString();
    } catch (error) {
        console.error('Error updating revenue:', error);
    }
}

// Update every 30 seconds
setInterval(updateRevenue, 30000);
updateRevenue(); // Initial load
</script>
```

---

## 🚨 TROUBLESHOOTING

### "Invalid API Key" Error
**Fix:**
```powershell
firebase functions:config:get
# Should show your keys

firebase deploy --only functions
```

### "Webhook signature verification failed"
**Fix:**
- Verify webhook secret matches Stripe dashboard
- Re-create webhook if needed
- Check Firebase logs: `firebase functions:log`

### "Payment doesn't appear in Stripe"
**Fix:**
- Check stripe-config.js has correct endpoint
- Verify test card used (4242 4242 4242 4242)
- Check browser console for errors (F12)
- Check Firebase logs

### "No transactions in Firestore"
**Fix:**
- Verify webhook is configured
- Check webhook status in Stripe (should show "Enabled")
- Manually trigger a test payment

### "Money not in bank after 3 days"
**Fix:**
- Check payout status: https://dashboard.stripe.com/settings/payouts
- Verify bank account verification complete
- Check if minimum payout threshold set too high
- Contact Stripe support

---

## 📊 EXPECTED TIMELINE

| When | Action | Status |
|------|--------|--------|
| **Now** | Set test keys + test payment | ⏳ Do this |
| **5 min** | Configure webhook | ⏳ Then this |
| **15 min** | Link bank account | ⏳ Then this |
| **2 days** | Bank verifies account | ⏳ Wait |
| **Next day** | Switch to LIVE keys | ⏳ Then this |
| **1 min** | Deploy live | ⏳ Then this |
| **3-5 days** | First real payment in bank | 💰 Money! |

---

## 🎯 SUCCESS METRICS

✅ **Phase 1 Success:** Test payment shows in Stripe dashboard
✅ **Phase 2 Success:** Webhook endpoint enabled in Stripe
✅ **Phase 3 Success:** Bank account verified in Stripe
✅ **Phase 4 Success:** Real payments processing + money in bank

---

## 🔗 CRITICAL LINKS

- **Stripe API Keys:** https://dashboard.stripe.com/account/apikeys
- **Stripe Webhooks:** https://dashboard.stripe.com/webhooks
- **Stripe Payouts:** https://dashboard.stripe.com/settings/payouts
- **Firebase Console:** https://console.firebase.google.com
- **Your Site:** https://studio-4627045237-a2fe9.web.app

---

**Follow this in order. You'll have money in your bank within a week.**
