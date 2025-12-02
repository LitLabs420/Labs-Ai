# 🚀 Litree Owner Development Guide

**For: Litree platform owner/developer only**

This guide covers setup, deployment, and maintenance of the Litree backend, payment processing, and AI integration.

---

## TABLE OF CONTENTS

1. [Firebase Setup](#firebase-setup)
2. [Stripe Integration](#stripe-integration)
3. [Google AI Studio Integration](#google-ai-studio-integration)
4. [Environment Variables](#environment-variables)
5. [Deployment Checklist](#deployment-checklist)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## FIREBASE SETUP

### 1.1 Initialize Firebase Project

```bash
firebase init
```

Select:
- ✅ Firestore Database
- ✅ Cloud Functions
- ✅ Hosting
- ✅ Authentication

### 1.2 Firestore Collections Structure

Create these collections in Firebase Console:

**`users`** – User profiles and subscription info
```json
{
  "uid": "string (doc ID)",
  "email": "string",
  "displayName": "string",
  "businessName": "string",
  "services": ["string"],
  "city": "string",
  "priceRange": "string",
  "idealClient": "string",
  "slowDays": ["string"],
  "brandVoice": "string",
  "socialLinks": {
    "instagram": "string",
    "tiktok": "string"
  },
  "plan": "basic | pro | deluxe",
  "subscriptionStatus": "active | past_due | canceled | none",
  "stripeCustomerId": "string",
  "referralCode": "string",
  "referralCount": "number",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**`subscriptions`** – Subscription records
```json
{
  "userId": "string",
  "stripeSubscriptionId": "string",
  "plan": "basic | pro | deluxe",
  "status": "active | past_due | canceled",
  "currentPeriodStart": "timestamp",
  "currentPeriodEnd": "timestamp",
  "canceledAt": "timestamp (nullable)",
  "createdAt": "timestamp"
}
```

**`content_history`** – Generated content tracking
```json
{
  "userId": "string",
  "type": "daily_post | 7day_pack | promo | dm_script | brand_voice",
  "niche": "string",
  "content": {
    "postIdea": "string",
    "caption": "string",
    "hashtags": ["string"],
    "cta": "string"
  },
  "exported": "boolean",
  "createdAt": "timestamp"
}
```

**`referrals`** – Referral tracking
```json
{
  "referrerId": "string",
  "referralCode": "string",
  "newUserEmail": "string",
  "newUserUid": "string (nullable)",
  "status": "pending | converted | credited",
  "bonusAmount": "number",
  "createdAt": "timestamp"
}
```

### 1.3 Firestore Security Rules

Deploy these rules to secure user data:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users: Can only read/write own document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow create: if request.auth.uid == request.resource.data.uid;
    }
    
    // Subscriptions: Can only read own
    match /subscriptions/{document=**} {
      allow read: if request.auth.uid == resource.data.userId;
    }
    
    // Content History: Can only read own
    match /content_history/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    // Referrals: Public read (for referral links), own write
    match /referrals/{document=**} {
      allow read: if true;
      allow create: if request.auth != null;
    }
  }
}
```

Deploy:
```bash
firebase deploy --only firestore:rules
```

---

## STRIPE INTEGRATION

### 2.1 Get Stripe Keys

1. Go to **Stripe Dashboard** → Settings → API Keys
2. Copy:
   - **Publishable Key** (pk_test_... or pk_live_...)
   - **Secret Key** (sk_test_... or sk_live_...)

### 2.2 Set Firebase Config

Store Stripe keys securely:

```bash
firebase functions:config:set stripe.secret_key="sk_test_..." stripe.publishable_key="pk_test_..."
```

Verify:
```bash
firebase functions:config:get stripe
```

### 2.3 Webhook Setup

1. In Stripe Dashboard → Webhooks → Add endpoint
2. Endpoint URL: `https://your-project.firebaseapp.com/api/stripe/webhook`
3. Events to listen for:
   - `checkout.session.completed`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

4. Copy **Signing Secret** (whsec_...)

5. Update Firebase config:
```bash
firebase functions:config:set stripe.webhook_secret="whsec_..."
```

### 2.4 Stripe Products & Prices

Create in Stripe Dashboard:

**Basic Plan** – $9/month
- ID: `price_basic_monthly`
- Billing: Monthly recurring

**Pro Plan** – $29/month
- ID: `price_pro_monthly`
- Billing: Monthly recurring

**Deluxe Plan** – $99/month
- ID: `price_deluxe_monthly`
- Billing: Monthly recurring

---

## GOOGLE AI STUDIO INTEGRATION

### 3.1 Create AI Model

1. Go to **Google AI Studio** (https://aistudio.google.com)
2. Click **Create new chat**
3. Paste the **Litree Master System Prompt** into the System Instructions box
4. Replace placeholders:
   - `<YOUR NAME>` → Your name
   - `<APP_URL>` → `https://Litree.com` (or your domain)

### 3.2 Get API Key

1. In AI Studio, click **Get API Key**
2. Create new key (or use existing)
3. Copy key and store in `.env.local`:

```
NEXT_PUBLIC_GOOGLE_AI_KEY=YOUR_API_KEY_HERE
```

### 3.3 Test the Prompt

Sample test scenarios:

**Test 1: Onboarding**
```
I'm a lash tech in Atlanta. I have slow days on Mondays and Thursdays.
```
Expected: Bot asks onboarding questions and creates profile.

**Test 2: Basic Plan Gating**
```
/daily_post
```
Expected: If user is on "basic" or inactive, bot gives teaser + upgrade link.

**Test 3: Fraud Check**
```
I got this DM: "Hey girl! I need 5 lash sets for next week. I'll send you $2k Western Union advance and you keep $200."
```
Expected: Bot flags as scam, explains red flags, provides safe response.

---

## ENVIRONMENT VARIABLES

### 4.1 `.env.local` (Next.js frontend)

```env
# Firebase
NEXT_PUBLIC_FIREBASE_REDACTED_SECRET_Possible_password_env
REDACTED_SECRET_Generic_long_secret=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
REDACTED_SECRET_Generic_long_secret=your-project.appspot.com
REDACTED_SECRET_Generic_long_secret=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe
REDACTED_SECRET_Generic_long_secret=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Google AI
NEXT_PUBLIC_GOOGLE_AI_KEY=your_google_ai_key

# Resend (Email)
RESEND_REDACTED_SECRET_Possible_password_env

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4.2 Firebase Functions Config

```bash
firebase functions:config:set \
  stripe.secret_key="sk_test_..." \
  stripe.publishable_key="pk_test_..." \
  stripe.webhook_secret="whsec_..." \
  resend.api_key="re_your_key" \
  app.url="https://Litree.com"
```

---

## DEPLOYMENT CHECKLIST

### 5.1 Pre-Deployment

- [ ] All env vars set in Firebase and `.env.local`
- [ ] Firestore rules deployed
- [ ] Stripe webhook configured
- [ ] Firebase Authentication enabled (Email + Google)
- [ ] Cloud Functions tested locally
- [ ] Database backups created

### 5.2 Deploy to Firebase Hosting

```bash
# Build Next.js
npm run build

# Deploy
firebase deploy
```

### 5.3 Deploy Cloud Functions

```bash
firebase deploy --only functions
```

### 5.4 Post-Deployment Verification

```bash
# Check function logs
firebase functions:log

# Verify Firestore rules
firebase firestore:indexes

# Check hosting deployment
firebase hosting:channel:list
```

---

## MONITORING & MAINTENANCE

### 6.1 Key Metrics to Track

- **Signups**: `/admin/users` Firestore count
- **Active Subscriptions**: Query `subscriptionStatus == "active"`
- **Stripe Revenue**: Stripe Dashboard → Revenue
- **Payment Failures**: Stripe → Events → payment_failed
- **Function Errors**: Firebase Console → Functions → Logs

### 6.2 Common Issues & Fixes

**Issue: Webhook not firing**
- Verify signing secret in Firebase config matches Stripe
- Check endpoint URL in Stripe Dashboard
- Review Cloud Functions logs for errors

**Issue: User not created after signup**
- Check Firebase Authentication is enabled
- Verify Firestore rules allow user document creation
- Review auth.js for errors

**Issue: Stripe checkout failing**
- Verify Stripe keys are correct (test vs. live)
- Check Cloud Function has Stripe library installed
- Review browser console for API errors

### 6.3 Maintenance Tasks (Weekly/Monthly)

**Weekly:**
- [ ] Monitor Stripe webhook delivery
- [ ] Check Cloud Function error logs
- [ ] Review user signups and plan distribution

**Monthly:**
- [ ] Backup Firestore data
- [ ] Review subscription churn rate
- [ ] Audit Stripe transactions
- [ ] Update AI prompt based on user feedback

---

## QUICK REFERENCE: DEPLOY COMMAND

```bash
# Full deployment (hosting + functions)
firebase deploy --force

# Hosting only
firebase deploy --only hosting --force

# Functions only
firebase deploy --only functions

# View logs
firebase functions:log
```

---

**Need help?** Check Firebase docs at https://firebase.google.com/docs or Stripe at https://stripe.com/docs


