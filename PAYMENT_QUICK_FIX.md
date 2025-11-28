# ⚡ GLAMFLOW AI - URGENT PAYMENT FIX CHECKLIST

**DO THIS RIGHT NOW TO START MAKING MONEY**

---

## 🔥 CRITICAL - Must Do Today

### ✅ Step 1: Get Live Stripe Keys (5 minutes)
```
1. Go to https://dashboard.stripe.com/account/apikeys
2. Make sure "Live mode" is toggled ON (top left)
3. Copy Publishable Key (starts with pk_live_)
4. Copy Secret Key (starts with sk_live_)  ⚠️ KEEP PRIVATE
5. Copy Webhook Signing Secret: https://dashboard.stripe.com/webhooks
   Look for endpoint created before, copy the signing secret (whsec_...)
```

### ✅ Step 2: Update Firebase (5 minutes)
```bash
# In your terminal:
firebase functions:config:set \
  stripe.secret_key="sk_live_YOUR_KEY_HERE" \
  stripe.publishable_key="pk_live_YOUR_KEY_HERE" \
  stripe.webhook_secret="whsec_YOUR_KEY_HERE"

# Verify:
firebase functions:config:get

# Deploy:
firebase deploy --only functions
```

### ✅ Step 3: Link Your Bank Account (10 minutes)
```
1. Go to https://dashboard.stripe.com/settings/payouts
2. Click "Add bank account"
3. Enter routing number and account number
4. Stripe sends 2 small deposits to verify
5. Check your bank (1-2 days)
6. Enter verification amounts into Stripe
7. Done! Money now goes to your account
```

### ✅ Step 4: Update Your Site Code (2 minutes)
```javascript
// Replace OLD stripe-config.js with NEW file:
stripe-config-corrected.js

// Or manually update the endpoint from:
fetch('/.netlify/functions/create-checkout-session', ...)

// To:
fetch(`https://us-central1-studio-4627045237-a2fe9.cloudfunctions.net/createCheckoutSession`, ...)
```

### ✅ Step 5: Test It Works
```
1. Go to https://studio-4627045237-a2fe9.web.app
2. Sign up for free account
3. Try to upgrade to Pro ($29/month)
4. Use test card: 4242 4242 4242 4242
5. Should redirect to Stripe checkout
6. Check Stripe dashboard - should show transaction
```

### ✅ Step 6: Deploy Live (1 minute)
```bash
firebase deploy --only hosting --force
```

---

## 💰 Verify Money is Coming

### Check #1: Stripe Dashboard
- Go to https://dashboard.stripe.com/payments
- Look for successful charges
- Should see $29 charge for test payment

### Check #2: Firestore
- Firebase Console → Firestore
- Look at `transactions` collection
- Should see entry with status: "completed"

### Check #3: Your Bank Account
- Money appears in 2-3 business days
- Go to: https://dashboard.stripe.com/settings/payouts
- See when next payout scheduled

---

## ⚠️ Common Issues & Fixes

### "Checkout button does nothing"
- [ ] Replace stripe-config.js with stripe-config-corrected.js
- [ ] Restart browser (clear cache: Ctrl+Shift+Delete)
- [ ] Check DevTools Console for errors (F12)

### "Stripe error: Invalid API Key"
- [ ] Make sure you're using LIVE keys (pk_live_, sk_live_)
- [ ] Make sure key is in Firebase config: `firebase functions:config:get`
- [ ] Redeploy functions: `firebase deploy --only functions`

### "Test payment doesn't show in Stripe"
- [ ] Webhook endpoint missing - add it in Stripe Developers section
- [ ] Cloud Function not deployed - run: `firebase deploy --only functions`
- [ ] Check Firebase logs: `firebase functions:log`

### "No bank deposit after 3 days"
- [ ] Check payout status: https://dashboard.stripe.com/settings/payouts
- [ ] Verify bank account was confirmed (2-deposit verification)
- [ ] Check if minimum payout amount set too high
- [ ] Contact Stripe support

---

## 📊 Revenue Dashboard (Add to dashboard.html)

```html
<div style="background: linear-gradient(135deg, #ff0080, #ff8c00); padding: 2rem; border-radius: 12px; margin: 1rem 0;">
    <h3 style="color: white;">💰 Monthly Revenue</h3>
    <div style="font-size: 2.5rem; color: white; font-weight: bold;" id="revenue">Loading...</div>
</div>

<script>
// Show real-time revenue
db.collection('transactions')
  .where('status', '==', 'completed')
  .onSnapshot(snapshot => {
    let total = 0;
    snapshot.forEach(doc => total += doc.data().amount);
    document.getElementById('revenue').textContent = '$' + total.toFixed(2);
  });
</script>
```

---

## 🎯 Success Criteria

✅ **Success = Money in Bank Account**

You'll know it worked when:
- [ ] Test payment shows in Stripe dashboard
- [ ] Transaction appears in Firestore
- [ ] Email received about payment
- [ ] Bank account receives deposit (2-3 days)
- [ ] Revenue shows on dashboard

---

## 📞 Quick Links

- **Stripe API Keys:** https://dashboard.stripe.com/account/apikeys
- **Stripe Webhooks:** https://dashboard.stripe.com/webhooks
- **Stripe Payouts:** https://dashboard.stripe.com/settings/payouts
- **Firebase Console:** https://console.firebase.google.com
- **Stripe Support:** https://support.stripe.com

---

## 🚀 Timeline

| When | What |
|------|------|
| **TODAY** | Complete 6 steps above |
| **Tomorrow** | Test with test card |
| **Day 3-4** | Test with real payment (optional) |
| **Day 5-7** | Money in bank account |
| **Week 2** | Launch marketing / ads |

---

**That's it! Follow these steps and money will hit your account within a week.**

**Questions?** Check PAYMENT_SETUP_FIX.md for detailed version.
