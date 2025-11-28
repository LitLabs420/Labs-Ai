# 🔥 FLIPFORGE™ – Complete System Architecture & API Reference

## 🏗️ SYSTEM ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLIPFORGE™ PLATFORM                          │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────┐
                    │   USERS BROWSER      │
                    │  (HTML5 Frontend)    │
                    │                      │
                    │ - Landing page       │
                    │ - Dashboard          │
                    │ - Creator storefront │
                    └──────────┬───────────┘
                              │
                    ┌─────────▼──────────┐
                    │  FIREBASE HOSTING  │
                    │  (Static Assets)   │
                    └──────────┬─────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
    ┌───────────▼──┐ ┌───────▼──────┐ ┌──▼──────────┐
    │ FIRESTORE    │ │ CLOUD        │ │ STRIPE      │
    │ DATABASE     │ │ FUNCTIONS    │ │ PAYMENTS    │
    │              │ │              │ │             │
    │ Collections: │ │ Functions:   │ │ - Checkout  │
    │ - users      │ │ - createStr- │ │ - Webhooks  │
    │ - funnels    │ │   ipeSession │ │ - Subscr.   │
    │ - products   │ │ - handleWbhk │ │ - Refunds   │
    │ - emails     │ │ - generateUI │ │             │
    │ - analytics  │ │ - sendEmail  │ │             │
    │              │ │ - sendDigest │ │             │
    └──────────────┘ └──────┬───────┘ └─────────────┘
                            │
                ┌───────────┴──────────┐
                │                      │
        ┌───────▼────────┐   ┌────────▼───────┐
        │ GOOGLE GEMINI  │   │ EMAIL SERVICE  │
        │ AI API         │   │ (Nodemailer)   │
        │                │   │                │
        │ - Content gen  │   │ - Welcome      │
        │ - Copy writing │   │ - Nurture      │
        │ - DM scripts   │   │ - Alerts       │
        │ - Headlines    │   │ - Digests      │
        └────────────────┘   └────────────────┘

                    ┌──────────────────────┐
                    │ GOOGLE ANALYTICS     │
                    │ (Tracking & Metrics) │
                    │                      │
                    │ - Funnel tracking    │
                    │ - User behavior      │
                    │ - Revenue analysis   │
                    └──────────────────────┘
```

---

## 🔌 API ENDPOINTS & CLOUD FUNCTIONS

### 1. AUTHENTICATION

**Google Sign-In** (Firebase Auth)
```
Method: POST
Endpoint: Firebase Auth (Client-side)
Trigger: User clicks "Sign in with Google"
Flow: 
  - Firebase returns auth token
  - Token stored in localStorage
  - Redirect to dashboard
  - onAuthStateChanged() listener verifies
Return: User object + session
```

**Email/Password** (Firebase Auth)
```
Method: POST
Endpoint: Firebase Auth (Client-side)
Trigger: User submits signup form
Return: Auth token + user UID
```

---

### 2. CHECKOUT & PAYMENT

**`createCheckoutSession`** (Cloud Function)
```javascript
// CALLABLE FUNCTION
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {

// INPUT:
{
  plan: "pro" | "godmode"
}

// PROCESS:
1. Verify user is authenticated
2. Get user info from Firestore
3. Create Stripe checkout session
4. Set success/cancel redirect URLs
5. Return Stripe session ID

// OUTPUT:
{
  sessionId: "cs_test_123456",
  checkoutUrl: "https://checkout.stripe.com/..."
}

// ERROR HANDLING:
- Unauthenticated → 401 Unauthenticated
- Invalid plan → 400 Bad Request
- Stripe error → 500 Internal
```

**Example Usage (Frontend)**:
```javascript
const functions = firebase.functions();
const createCheckoutSession = firebase.functions().httpsCallable('createCheckoutSession');

async function upgradeClick(plan) {
  const result = await createCheckoutSession({ plan });
  window.location.href = result.data.checkoutUrl;
}
```

---

### 3. WEBHOOK HANDLER

**`handleStripeWebhook`** (Cloud Function)
```javascript
exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {

// INPUT (Stripe sends via webhook):
{
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_test_123",
      client_reference_id: "user123",
      customer: "cus_stripe123",
      subscription: "sub_stripe123"
    }
  }
}

// PROCESSES EVENTS:
1. checkout.session.completed → Update user tier + send welcome email
2. customer.subscription.updated → Update subscription status
3. customer.subscription.deleted → Downgrade to free + send churn email
4. invoice.payment_failed → Send payment retry email

// OUTPUT:
{ received: true }

// ERROR CASES:
- Invalid signature → 400 Webhook Error
- Database error → 500 Internal
```

**Stripe Setup**:
```bash
# 1. Get webhook signing secret from Stripe Dashboard
# 2. Set in Firebase:
firebase functions:config:set stripe.webhook_secret="whsec_..."

# 3. Add webhook endpoint:
# URL: https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/handleStripeWebhook
# Events: checkout.session.completed
#         customer.subscription.updated
#         customer.subscription.deleted
#         invoice.payment_failed
```

---

### 4. EMAIL FUNCTIONS

**`sendWelcomeEmail`** (Internal Function)
```javascript
async function sendWelcomeEmail(email, name, plan) {

// TRIGGER: After successful Stripe checkout

// EMAIL TEMPLATE:
Subject: "🎉 Welcome to FLIPFORGE™ [PLAN] – Your Empire Starts Now!"
Body:
  - Welcome message personalized
  - 3 quick-start steps
  - Pro tips for fast cash
  - Dashboard login link

// METRICS TRACKED:
- Send time
- Open rate (via pixel)
- Click rate
- Conversion (if they complete task)

// Return: Email sent confirmation
}
```

**`sendDailyDigest`** (Scheduled Function)
```javascript
exports.sendDailyDigest = functions.pubsub
    .schedule('every day 18:00')
    .timeZone('America/Los_Angeles')
    .onRun(async (context) => {

// TRIGGER: Automatically every day at 6pm PT

// QUERY: All Pro/God Mode users
// GENERATE: Daily revenue report for each
// SEND: Personalized email

// EMAIL TEMPLATE:
Subject: "📊 Your Daily FLIPFORGE™ Update"
Body:
  - Revenue made today
  - Customers gained
  - Growth score
  - Next action recommended
  - Best performer highlight

// EXPECTED:
- 5000+ emails sent
- 40%+ open rate
- 12%+ click rate
})
```

**`sendUpgradeReminder`** (Triggered Function)
```javascript
exports.sendUpgradeReminder = functions.firestore
    .document('users/{userId}')
    .onCreate(async (snap, context) => {

// TRIGGER: When new user created
// DELAY: Wait 7 days
// CHECK: If still on free tier
// SEND: "Time to upgrade" email

// EMAIL TEMPLATE:
Subject: "🎁 Upgrade NOW: You're Close to Making Real Money"
Body:
  - "You've made it 7 days"
  - What free users are missing
  - What Pro users get
  - Limited offer: First month $9 (normally $29)
  - CTA: "Upgrade to Pro"

// EXPECTED:
- Sent to 1000+ users
- 10-15% open rate
- 3-5% conversion rate
})
```

---

### 5. AI CONTENT GENERATION

**`generateViralContent`** (Cloud Function)
```javascript
exports.generateViralContent = functions.https.onCall(async (data, context) => {

// INPUT:
{
  topic: "How to make passive income",
  platform: "twitter" | "linkedin" | "instagram",
  style: "educational" | "entertaining" | "motivational",
  quantity: 5
}

// PROCESS:
1. Authenticate user
2. Call Google Gemini API
3. Generate posts for platform
4. Format with hashtags
5. Return array of posts

// OUTPUT:
[
  {
    platform: "twitter",
    content: "🔥 If you're not [topic], you're leaving money on the table...",
    hashtags: ["#passive income", "#business"],
    characterCount: 245
  },
  ...
]

// RATE LIMITS:
- Free users: 5 posts/day
- Pro users: 50 posts/day
- God Mode: Unlimited

// ERROR CASES:
- Rate limit exceeded → 429
- API error → 500
})
```

**Gemini Prompts**:
```javascript
// TWITTER POSTS PROMPT:
`Generate 5 viral Twitter posts about: "${topic}"
Each post:
- Under 280 characters
- Include 1-2 emojis
- Hook in first 10 words
- Include CTA or question
Format as JSON array: [{ content: "...", hashtags: [] }]`

// EMAIL SUBJECT LINES PROMPT:
`Generate 5 high-converting email subject lines for: "${product}"
Target audience: ${audience}
Style: ${style}
Each should:
- Trigger curiosity or urgency
- Include power words
- Max 50 characters
Return as JSON: [{ subject: "...", openRate: 0.XX }]`

// DM SCRIPTS PROMPT:
`Generate 10 personalized DM scripts to sell: "${product}"
Price: $${price}
Target: ${audience}
Each script:
- Feels personal, not salesy
- Includes social proof
- Has clear call-to-action
- Under 100 words
Format as JSON: [{ script: "...", expectedCloseRate: 0.XX }]`
```

---

### 6. ANALYTICS & REPORTING

**`trackEvent`** (Client-side)
```javascript
// USAGE:
trackEvent('funnel_created', {
  funnelName: 'Social Mastery',
  price: 97,
  userId: currentUser.uid
});

trackEvent('email_sent', {
  emailType: 'welcome',
  recipientCount: 250,
  platform: 'gmail'
});

trackEvent('customer_acquired', {
  customerId: 'cus_123',
  revenue: 2900,
  acquisitionChannel: 'organic'
});

// AUTOMATICALLY TRACKS:
- Event name
- User ID
- Timestamp
- Platform/device
- Referral source

// SENDS TO: Google Analytics 4 + Firebase Analytics
// USED FOR: Funnel analysis, ROI calculation, user behavior
```

---

### 7. ADMIN FUNCTIONS (Placeholder)

**`generateMoneyMap`** (Cloud Function - to build)
```javascript
// FUTURE IMPLEMENTATION
exports.generateMoneyMap = functions.https.onCall(async (data, context) => {
  const { skills, incomeGoal, hasAudience } = data;
  
  // Use Gemini to generate personalized Money Map
  // Return 3 income paths with revenue projections
  // Store in Firestore
})
```

**`optimizeFunnel`** (Cloud Function - to build)
```javascript
// FUTURE IMPLEMENTATION
exports.optimizeFunnel = functions.https.onCall(async (data, context) => {
  // Analyze funnel performance
  // Run A/B tests
  // Make recommendations
  // Auto-optimize copy/design
})
```

---

## 📡 REAL-TIME DATABASE UPDATES (Firestore Listeners)

### Dashboard Auto-Updates

```javascript
// LISTEN TO USER REVENUE (Real-time):
db.collection('users').doc(currentUser.uid).onSnapshot(doc => {
  const userData = doc.data();
  document.querySelector('.revenue-display').textContent = 
    '$' + userData.totalRevenue;
  
  // Update other stats
  updateDashboard(userData);
});

// LISTEN TO TRANSACTIONS (Real-time):
db.collection('transactions')
  .where('userId', '==', currentUser.uid)
  .orderBy('createdAt', 'desc')
  .onSnapshot(snapshot => {
    const transactions = snapshot.docs.map(doc => doc.data());
    renderTransactionHistory(transactions);
  });

// LISTEN TO FUNNELS (Real-time):
db.collection('funnels')
  .where('userId', '==', currentUser.uid)
  .onSnapshot(snapshot => {
    const funnels = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    renderFunnelList(funnels);
  });
```

---

## 🔐 SECURITY & RATE LIMITING

### Firebase Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - private per user
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow create: if request.auth.uid != null;
    }
    
    // Funnels - users control their own
    match /funnels/{funnelId} {
      allow read: if request.auth.uid == resource.data.userId 
                     || resource.data.isPublished;
      allow write, delete: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
    
    // Products in storefront - public read
    match /products/{productId} {
      allow read: if true;
      allow write, delete: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId 
                      && request.resource.data.isPublished;
    }
    
    // Transactions - user can only read own
    match /transactions/{transactionId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow write: if false; // Cloud Functions only
    }
  }
}
```

### Rate Limiting (Cloud Functions)

```javascript
// EXAMPLE: Limit content generation to prevent abuse
const rateLimit = {};

exports.generateViralContent = functions.https.onCall(async (data, context) => {
  const userId = context.auth.uid;
  const now = Date.now();
  
  // Check rate limit
  if (rateLimit[userId]) {
    const timeSinceLastCall = now - rateLimit[userId];
    if (timeSinceLastCall < 1000) { // 1 second minimum
      throw new functions.https.HttpsError(
        'resource-exhausted', 
        'Too many requests. Please wait.'
      );
    }
  }
  
  rateLimit[userId] = now;
  
  // ... execute function
});
```

---

## 📊 ERROR HANDLING & LOGGING

### Standard Error Responses

```javascript
// 400 - Bad Request
{
  code: 'invalid-argument',
  message: 'Missing required field: plan'
}

// 401 - Unauthenticated
{
  code: 'unauthenticated',
  message: 'User not authenticated. Please login.'
}

// 403 - Permission Denied
{
  code: 'permission-denied',
  message: 'You do not have permission to access this resource.'
}

// 429 - Too Many Requests
{
  code: 'resource-exhausted',
  message: 'Rate limit exceeded. Try again in 60 seconds.'
}

// 500 - Internal Server Error
{
  code: 'internal',
  message: 'An unexpected error occurred. Please try again.'
}
```

### Logging (Firebase Functions)

```javascript
// Log info
console.log('User signup:', userId, userEmail);

// Log errors
console.error('Payment failed:', error.message);

// Log metrics
console.info('Daily digest sent to', emailCount, 'users');

// View logs:
firebase functions:log
firebase functions:log --lines 50
firebase functions:log --follow
```

---

## 🧪 TESTING CHECKLIST

**Authentication**:
- [ ] Google Sign-In works
- [ ] Email/password signup works
- [ ] Login redirects to dashboard
- [ ] Logout clears session
- [ ] Protected routes redirect to login

**Payment Flow**:
- [ ] Upgrade button opens Stripe checkout
- [ ] Stripe checkout session created
- [ ] Payment processes successfully
- [ ] Webhook updates Firestore
- [ ] User tier updated to "pro"
- [ ] Welcome email sent

**Email Automation**:
- [ ] Welcome email received within 5 min
- [ ] Email contains correct personalization
- [ ] Unsubscribe link works
- [ ] Daily digest sends at correct time
- [ ] Upgrade reminder sends Day 7

**Data Integrity**:
- [ ] User data only visible to that user
- [ ] Transactions tracked correctly
- [ ] Revenue calculations accurate
- [ ] No data leakage between users

**Performance**:
- [ ] Dashboard loads in <2 seconds
- [ ] Funnel builder responds in <1 second
- [ ] Email sends in <10 seconds
- [ ] Analytics updates in real-time

---

## 🚀 DEPLOYMENT COMMANDS

```bash
# Deploy hosting only (quick)
firebase deploy --only hosting --force

# Deploy functions only (for backend changes)
firebase deploy --only functions

# Deploy everything
firebase deploy

# Deploy specific function
firebase deploy --only functions:createCheckoutSession

# View live functions
firebase functions:list

# View recent logs
firebase functions:log --lines 100

# Test locally before deploying
firebase emulators:start
```

---

## 📞 SUPPORT DEBUGGING

**Issue**: User gets "network error" on dashboard
```
Solution:
1. Check browser DevTools → Console for errors
2. Verify Firebase auth token: localStorage
3. Check Firestore permissions
4. Clear cache: Ctrl+Shift+Delete
5. Test in incognito mode
6. Check Firebase status: firebase.google.com/support
```

**Issue**: Stripe webhook not triggering
```
Solution:
1. Check webhook signing secret matches
2. Verify endpoint URL is correct
3. Check Stripe dashboard → Webhooks → Recent Deliveries
4. Look for webhook errors in Stripe logs
5. Test webhook: curl -X POST https://your-endpoint
```

**Issue**: Emails not sending
```
Solution:
1. Verify Gmail app password is correct
2. Check Firebase functions:config
3. Verify email address is correct
4. Check spam folder
5. Look at Firebase Functions logs
```

---

## 📈 MONITORING & METRICS

**Key Metrics to Track**:
```javascript
// Daily active users
db.collection('analytics').where('date', '==', today).get()

// Signup rate
(newUsers / totalVisitors) * 100

// Conversion rate (free → paid)
(paidCustomers / totalSignups) * 100

// Average revenue per user
totalRevenue / totalUsers

// Customer churn rate
cancelledUsers / (previousMonthUsers)

// Email metrics
openRate / clickRate / conversionRate
```

---

**You're now fully equipped to scale FLIPFORGE™ to $25K+/month. 🔥**

*Build. Scale. Profit. On Autopilot.*
