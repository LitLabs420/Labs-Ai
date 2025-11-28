# GLAMFLOW AI - Copilot Instructions

## Project Overview
GLAMFLOW AI is a beauty business automation SaaS platform offering AI-powered content generation and chatbot management for beauty professionals. The app uses Firebase (Auth + Firestore) for backend services and Stripe for payments. Deployment target is Firebase Hosting.

**Current Architecture**: Vanilla JavaScript frontend with Firebase SDK (v10.7.0) | No build process | Static file deployment

## Core Architecture Patterns

### 1. Firebase Integration Model
- **Auth**: Email/password + Google OAuth via `firebase.auth.GoogleAuthProvider()`
- **Data**: Firestore document structure for users and subscriptions
- **Config**: Injected via CDN, initialized in `firebase-config.js`, exposed on `window` object
- **Key Pattern**: Services accessed via `window.firebaseAuth` and `window.firebaseDb` from `auth.js` and `dashboard.js`

**User Profile Schema (Firestore)**:
```javascript
{
  uid, email, displayName, photoURL, createdAt,
  tier: 'free'|'pro'|'enterprise',
  subscription: { plan, status, createdAt, endsAt }
}
```

### 2. Page Architecture
The app uses **hash-based navigation** with inline content generation:
- `index.html` - Landing/login page with demo chatbot animation
- `auth.html` - Authentication page (Google + Email/Password)
- `dashboard.html` - Main application hub with sidebar navigation
- Each dashboard section (overview, billing, chatbot, settings) dynamically loaded via `navigateTo()` in `dashboard.js`

### 3. Chatbot Implementation
- **Vanilla JS Widget** (`chatbot.js`): Embeddable via script tag, no React dependency
- **Self-contained**: CSS + HTML bundled inline, auto-initializes on `DOMContentLoaded`
- **Architecture**: Simple keyword-matching bot responses; no LLM integration yet
- **Deployment**: Served from Firebase Hosting URL in embed code

**Embed Pattern**:
```html
<script src="https://studio-4627045237-a2fe9.web.app/chatbot.js"></script>
<div id="chatbot-root"></div>
```

### 4. Payment Integration (Incomplete)
- **Config**: `stripe-config.js` contains placeholder keys and price IDs
- **Expected Flow**: Cloud Functions (Netlify) handle checkout sessions and payment verification
- **Status**: Frontend ready but backend Cloud Functions not yet deployed
- **Key Functions**: `createCheckoutSession()`, `handlePaymentSuccess()`, `manageStripeSubscription()`

## Project-Specific Conventions

### Session & Auth State
- **Temporary Sessions**: `index.html` uses `sessionStorage` for demo purposes
- **Real Auth**: `auth.html` uses Firebase Authentication with Firestore persistence
- **Auth Guard**: `dashboard.html` redirects unauthenticated users to `auth.html` via `onAuthStateChanged()`

### Subscription Tiers
```
FREE:       10 posts/month, 100 messages, basic support
PRO:        $29/month, 500 posts/month, 10k messages, advanced analytics
ENTERPRISE: Custom pricing, unlimited everything, 24/7 support
```

### Event Tracking
- Uses Google Analytics 4 with `trackEvent()` function
- Key events: `google_signin_start`, `signup_start`, `onboarding_complete`, `google_signin_error`
- Tracked in `auth.js` for funnel analysis

### Styling Approach
- **Color Palette**: Gradients (blue `#00d4ff` + pink `#ff0080` + orange `#ff8c00` + cyan `#40e0d0`)
- **Dark theme**: Base color `#0a0a0a`, secondary `#1a1a1a`
- **Inline CSS**: Each `.html` file contains `<style>` tags; separate `.css` files for large shared styles
- **Animation**: Keyframes for floating icons, slide-up transitions, typing indicators

## Critical Developer Workflows

### Adding a New Dashboard Section
1. Add navigation item to sidebar in `dashboard.html`
2. Add case handler in `navigateTo()` function in `dashboard.js`
3. Create corresponding `loadXyzPage()` function that generates HTML and appends to `.content-pages` div
4. Use consistent stat card and form styling from existing sections

**Example**: To add "Analytics" page, create `loadAnalyticsPage()` similar to `loadChatbotPage()`.

### Testing Auth Changes
- Use browser DevTools → Application → Local Storage to inspect Firebase tokens
- Clear `sessionStorage` to force re-login in `index.html` test
- Check Firestore in Firebase Console to verify user profiles are created

### Modifying Chatbot Responses
- Edit `responses` object in `getBotResponse()` function in `chatbot.js`
- Add keywords to existing categories or create new response objects
- Test by opening chatbot widget (fixed bottom-right button) on any page with `<div id="chatbot-root"></div>`

### Stripe Integration (When Ready)
- Replace placeholder keys in `stripe-config.js` with actual Stripe keys from dashboard
- Deploy Cloud Functions to Netlify (currently stubbed as `/.netlify/functions/`)
- Verify payment flow: `handleUpgrade()` → Cloud Function → Stripe redirect → `handlePaymentSuccess()`

## Important Integration Points

### Firebase Project References
- Project ID: `studio-4627045237-a2fe9`
- Auth Domain: `studio-4627045237-a2fe9.firebaseapp.com`
- Storage Bucket: `studio-4627045237-a2fe9.appspot.com`
- Hosting URL: `https://studio-4627045237-a2fe9.web.app`

### Admin Access
- Easter egg: Type "Around360" on `index.html` login page, then enter `!!litree!!` as master key
- Grants access to `/godmode.html` (incomplete admin panel)

### External Dependencies
- **Firebase SDK v10.7.0** via CDN (no npm)
- **Stripe.js v3** loaded dynamically in dashboard
- **Chart.js** for analytics/dashboards
- **Google Analytics 4** for event tracking

## Common Patterns to Maintain

1. **Async User Operations**: Wrap in `try/catch`, use `showError()` for user feedback
2. **Form Submissions**: Prevent default, validate, show loading overlay via `showLoading(true/false)`
3. **Firestore Updates**: Always use `updateDoc()` for partial updates, `setDoc()` for full overwrites
4. **UI State**: Use `.active` class on nav items; toggle via `classList.add/remove()`
5. **Error Recovery**: Always clear loading state and re-enable form inputs after failures

## Known Gaps & Future Work
- Stripe Cloud Functions not deployed
- React Chatbot component (`Chatbot.jsx`) exists but not integrated
- Admin panel (`godmode.html`) incomplete
- No local development server setup (pure static files)
- No automated tests or CI/CD pipeline

## Contact & Maintenance
- Email contact: `laidbacknostress4life@gmail.com`
- Active development; maintenance banner in `index.html` indicates ongoing updates
