# GLAMFLOW AI - Copilot Instructions

## Project Overview
**GLAMFLOW AI** is a beauty business automation SaaS platform: AI content generation, chatbot management, payment processing, and business workflow automation for beauty professionals. Uses Firebase (Auth/Firestore/Functions) + Stripe + vanilla JavaScript. Deployment: Firebase Hosting.

**Architecture**: Static vanilla JS frontend (no build tools) + Firebase Cloud Functions backend (Node.js). No React/frameworks—pure DOM manipulation and ES6+.

---

## Critical Architecture Insights

### 1. Global Firebase Context Pattern
Firebase services are initialized in `firebase-config.js` and exposed globally:
```javascript
window.firebaseAuth = firebase.auth();
window.firebaseDb = firebase.firestore();
window.firebase = firebase;
```
**Access pattern**: Every page accesses `window.firebaseAuth` and `window.firebaseDb` directly. No module system—**all scripts must execute in order**.

### 2. Multi-Page + Frontend Routing
- **Static pages**: `index.html` (landing), `auth.html` (login/signup), `dashboard.html` (SPA hub)
- **Admin portals**: `godmode.html` (admin panel), `admin.html` (analytics)
- **Routes within `dashboard.html`**: Via JavaScript `navigateTo()` function switching DOM display states
- **Auth guards**: `dashboard.html` checks `onAuthStateChanged()` before rendering; redirects to `index.html` if logged out

### 3. User & Subscription Data Flow
**Firestore collection: `users`**
```javascript
{
  uid, email, displayName, photoURL, createdAt, tier: 'free'|'pro'|'enterprise',
  subscription: { plan, status, createdAt, endsAt },
  status: 'active'|'suspended', stripeCustomerId
}
```
Real-time listeners in `dashboard.js` update UI when subscription changes. Firestore rules restrict users to their own documents.

### 4. Cloud Functions as Payment Backbone
`functions/index.js` exports:
- **`handleStripeWebhook`**: Listens for `checkout.session.completed`, `invoice.payment_failed`, `customer.subscription.*` events
- **Action**: Updates Firestore user `subscription` field, sends confirmation emails, tracks transactions
- **Config**: Reads Stripe keys from environment (deployed via `firebase functions:config:set`)
- **Status**: Ready to deploy; placeholder keys in `stripe-config.js` need live keys before production

### 5. Admin Dashboard (Incomplete Feature)
`admin-google.html` / `admin-direct.html` render full SaaS admin panel **inline with styled divs** (no components). Switches tabs via `switchTab('users')|switchTab('billing')`, etc. Reads from Firestore in real-time. **Accessible only if `currentUser.email === ADMIN_EMAIL`** ('dyingbreed243@gmail.com').

---

## Startup Workflows

### **Deploying Changes**
```powershell
firebase deploy --only hosting --force
# Check deployment: firebase deploy --only hosting --force 2>&1 | Select-Object -Last 15
```
Static files deploy instantly. Cloud Functions deployment separate: `firebase deploy --only functions`.

### **Testing Authentication Locally**
1. Open DevTools → Application → Local Storage
2. Look for Firebase auth token keys (`firebase:...`)
3. Clear Local Storage to force logout
4. Check Firestore in Firebase Console for user document creation

### **Payment Flow Testing** (not yet live)
1. `stripe-config.js` contains test/live key placeholders
2. Clicking "Upgrade" on dashboard triggers `createCheckoutSession()` Cloud Function
3. Function returns Stripe session ID → redirects to Stripe checkout
4. On success, webhook fires → `handleStripeWebhook` → updates Firestore → sends email

---

## Core Developer Patterns

### Adding Features to Dashboard
**Pattern**: Create `loadXyzPage()` in `dashboard.js` inside the `navigateTo()` switch:
```javascript
case 'analytics':
    loadAnalyticsPage();
    break;

async function loadAnalyticsPage() {
    const contentDiv = document.querySelector('.content-pages');
    contentDiv.innerHTML = `
        <div class="page" id="analytics-page">
            <h2>Analytics</h2>
            <div class="stat-card">
                <p class="stat-label">Posts This Month</p>
                <p class="stat-value" id="posts-stat">0</p>
            </div>
        </div>
    `;
    // Fetch data from Firestore
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    document.getElementById('posts-stat').textContent = userDoc.data().postsCount || 0;
}
```

### Firestore Data Operations
- **Read once**: `db.collection('users').doc(uid).get()` → returns promise
- **Real-time**: `db.collection('users').where('tier', '==', 'pro').onSnapshot(snapshot => { ... })`
- **Update field**: `db.collection('users').doc(uid).update({ tier: 'pro' })` (partial)
- **Set new doc**: `db.collection('users').doc(uid).set({ ... })` (overwrites)

**Always wrap in try/catch** and call `showError(msg)` for UI feedback.

### UI State Management
- **Loading overlay**: Call `showLoading(true)` before async → `showLoading(false)` after
- **Active navigation**: Add `.active` class to sidebar items; remove from others
- **Error messages**: Call `showError('message')` — appears 5sec then disappears
- **Success toast**: Call `showSuccess('message')`

### Event Tracking (GA4)
```javascript
trackEvent('feature_name', { key: 'value', user_id: currentUser.uid });
// Fires: window.gtag('event', 'feature_name', { ... })
```
Use for: signup funnel, upgrade clicks, chatbot interactions, admin actions.

---

## Styling & Design System

**Color palette** (use consistently):
- Primary Blue: `#00d4ff` (accent, buttons)
- Pink/Hot: `#ff0080` (CTAs, premium tier)
- Orange: `#ff8c00` (secondary CTAs)
- Cyan: `#40e0d0` (tertiary accent)
- Dark bg: `#0a0a0a` (main), `#1a1a1a` (secondary)

**CSS location**: 
- Shared `styles.css`, `auth-styles.css`, `dashboard-styles.css` 
- Inline `<style>` in HTML files for one-off styles

**No CSS classes for state**—use `.active` for nav items. Most styling is inline due to no CSS preprocessor.

---

## Payment Integration Checklist

**Before going live**:
1. ✅ Get Stripe LIVE keys (pk_live_..., sk_live_...)
2. ✅ Set Firebase config: `firebase functions:config:set stripe.secret_key="..."`
3. ✅ Deploy Cloud Functions: `firebase deploy --only functions`
4. ✅ Create Stripe webhook → `handleStripeWebhook` endpoint
5. ✅ Test payment flow end-to-end
6. ✅ Verify Firestore transaction records
7. ✅ Confirm confirmation emails send

See `DEPLOYMENT_GUIDE.md` for full setup steps.

---

## Key File Reference

| File | Purpose |
|------|---------|
| `firebase-config.js` | Firebase init + global refs |
| `auth.js` | Auth UI logic (sign in/up/Google) |
| `dashboard.js` | Main app UI + page routing |
| `chatbot.js` | Embeddable chatbot widget |
| `functions/index.js` | Webhook handlers + email |
| `godmode.html` | Admin panel (incomplete) |
| `automation-bot.js` | Task automation engine |

---

## Known Gaps & TODOs

- ❌ Stripe Cloud Functions: Live deployment pending
- ❌ Admin panel (`godmode.html`): UI complete, features incomplete
- ❌ React Chatbot (`Chatbot.jsx`): Exists but unused; vanilla JS widget active
- ❌ Tests: None yet
- ❌ Local dev server: Use `firebase serve` (if needed)
- ✅ GA4 tracking: Implemented
- ✅ Firebase Auth: Working
- ✅ Chatbot widget: Deployed
