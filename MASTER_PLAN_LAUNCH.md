# 🚀 LITLABS MASTER PLAN - Market Ready

**Status**: December 3, 2025  
**Current Version**: Web App (Next.js 15.1.3) + Android App (Flutter)  
**Goal**: Launch to Google Play Store with Free + Subscription model

---

## ✅ WHAT'S WORKING NOW

### Web App (litlabs-web.vercel.app)
- ✅ Google AI (Gemini 1.5 Pro) integrated - generating content, DM replies, money plays
- ✅ Premium arcade-style UI with gradient effects
- ✅ Firebase Auth + Firestore for user data
- ✅ Stripe subscriptions configured ($49 Pro, $99 Enterprise)
- ✅ Dashboard with XP system, daily challenges
- ✅ Profile page for business info
- ✅ Responsive design (mobile ready)
- ✅ Vercel Analytics + Speed Insights
- ✅ PWA icons (can be installed as app)

### Backend/Infrastructure
- ✅ Next.js 15 (React 19) SSR + API routes
- ✅ Firestore for user data persistence
- ✅ Stripe webhooks for payment events
- ✅ Rate limiting on AI endpoints
- ✅ Sentry error tracking
- ✅ Environment variables secure in .env.local

---

## 🔧 CURRENT ISSUES TO FIX

### Critical (Must Fix Before Launch)
1. ⚠️ **Gemini Model Deprecated** - Using `gemini-pro` (404 error), need `gemini-1.5-pro` ✅ FIXED
2. ⚠️ **Next.js Outdated** - 15.1.3 → Update to 15.2.x
3. ⚠️ **158 Tools Warning** - VSCode MCP servers overloaded (128 limit)
4. ⚠️ **Android App** - Flutter module has compile errors, needs cleanup

### Non-Critical (Polish)
5. 📊 No usage tracking in profile (AI generations used this month)
6. 📱 No image generation (DALL-E/Midjourney)
7. 🎨 No template library (pre-made post templates)
8. 📧 No email sequences feature

---

## 🎯 LAUNCH PLAN - 4 PHASES

### **PHASE 1: Fix & Stabilize** (1-2 days)
**Goal**: Get everything working perfectly

- [ ] Update Next.js to 15.2.x latest
- [ ] Fix 158 tools warning (disable unused MCP servers)
- [ ] Add AI usage tracking to Firestore
- [ ] Add usage stats to /dashboard/profile
- [ ] Test all AI tools end-to-end
- [ ] Deploy web app to Vercel
- [ ] Test Stripe subscriptions (test checkout)

### **PHASE 2: Free Tier Limits** (1 day)
**Goal**: Define what free users get vs paid

#### Free Tier
- 5 AI generations per day (Content Generator)
- 3 DM replies per day
- 1 Money Play per week
- Basic templates only
- Ads/watermark on generated content

#### Pro Tier ($49/month)
- Unlimited AI generations
- Unlimited DM replies
- Daily money plays
- All templates unlocked
- No ads/watermarks
- Priority support

#### Enterprise Tier ($99/month)
- Everything in Pro
- Custom templates
- White-label branding
- API access
- Dedicated account manager

**Implementation**:
- Add `aiGenerationsToday`, `dmRepliesToday`, `lastResetDate` to Firestore user doc
- Check limits in API routes before generating
- Show upgrade prompt when limit hit
- Reset counters daily at midnight

### **PHASE 3: Android App** (2-3 days)
**Goal**: Polish Flutter app and prepare for Play Store

#### Android App Structure
```
android-app/
├── app/                    # Native Android wrapper
└── flutter_module/         # Flutter UI (webview hybrid)
```

**Tasks**:
- [ ] Fix Flutter module compile errors
- [ ] Load web app in WebView (https://litlabs-web.vercel.app)
- [ ] Add splash screen with LitLabs branding
- [ ] Add bottom navigation (Home, AI Tools, Profile, Billing)
- [ ] Test deep linking (open specific pages from notifications)
- [ ] Add push notifications via Firebase Cloud Messaging
- [ ] Handle in-app subscriptions via Google Play Billing API
- [ ] Build signed APK/AAB for Play Store

#### Play Store Listing
- **App Name**: LitLabs OS - AI for Beauty Pros
- **Category**: Business
- **Description**: "AI-powered content generator for beauty professionals. Create Instagram captions, TikTok scripts, DM replies, and money-making offers in seconds. Built for hair stylists, lash techs, nail artists, and aestheticians."
- **Screenshots**: 5-8 screenshots of main features
- **Feature Graphic**: 1024x500 banner
- **Privacy Policy**: Host at litlabs-web.vercel.app/privacy-policy ✅ (already exists)
- **Terms of Service**: Host at litlabs-web.vercel.app/terms-of-service ✅ (already exists)

### **PHASE 4: Marketing & Launch** (1 week)
**Goal**: Get first 100 users

- [ ] Create landing page with demo video
- [ ] Post on Reddit (r/beautybusiness, r/smallbusiness)
- [ ] TikTok videos showing AI features
- [ ] Instagram Reels targeting beauty pros
- [ ] Facebook Groups for beauty pros
- [ ] Beauty influencer partnerships
- [ ] Free trial (7 days Pro access for new signups)

---

## 📱 ANDROID APP SETUP

### Current State
- Gradle setup exists
- Flutter module created but has errors
- WebView wrapper approach (hybrid app)

### What Needs to Happen

#### 1. Fix Flutter Module
```bash
cd android-app/flutter_module
flutter pub get
flutter build aar
```

#### 2. Configure WebView
**Option A: Simple WebView** (Recommended for MVP)
- Load https://litlabs-web.vercel.app in WebView
- Handle JavaScript bridge for native features
- Faster to market, easier to update

**Option B: Full Flutter Rewrite**
- Rebuild entire UI in Flutter
- More work but better performance
- Offline support

**Decision**: Use Option A (WebView) to launch fast

#### 3. Add Features
- [ ] Splash screen (2 seconds, LitLabs logo)
- [ ] Bottom nav bar (Home, AI Tools, Profile, Settings)
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Biometric login (fingerprint/face)
- [ ] Share button (share generated content to Instagram/TikTok)
- [ ] Offline mode (cache last 10 generated posts)

#### 4. Monetization
**Google Play Billing Integration**:
```kotlin
// In-app subscription product IDs
pro_monthly = "litlabs_pro_monthly" ($49.99)
enterprise_monthly = "litlabs_enterprise_monthly" ($99.99)
```

Sync with Stripe via webhook when user subscribes on Android

#### 5. Build & Submit
```bash
# Generate signed bundle
flutter build appbundle --release

# Upload to Play Console
# https://play.google.com/console
```

**Timeline**: 1-2 weeks for Google Play review

---

## 🔥 PRIORITY FIXES RIGHT NOW

### 1. Fix Gemini Model Name
✅ DONE - Changed `gemini-pro` to `gemini-1.5-pro` in:
- lib/ai.ts
- app/api/test-ai/route.ts
- app/api/ai/test-simple/route.ts

### 2. Update Next.js
```bash
npm install next@latest eslint-config-next@latest --legacy-peer-deps
```

### 3. Add Usage Tracking
Create new Firestore collection:
```typescript
users/{uid}/usage/{date} {
  aiGenerations: number
  dmReplies: number
  moneyPlays: number
  date: timestamp
}
```

Enforce limits in API routes:
```typescript
// app/api/ai/generate-content/route.ts
const usage = await getUsage(uid, today);
if (userTier === 'free' && usage.aiGenerations >= 5) {
  return NextResponse.json({ 
    error: 'Daily limit reached', 
    upgrade: true 
  }, { status: 429 });
}
```

### 4. Enhance Profile Dashboard
Add to /dashboard/profile:
- Total AI generations (all-time)
- This month's usage
- Subscription status
- Next billing date
- Quick links to upgrade

---

## 💰 REVENUE PROJECTIONS

### Target Users
- **Hair Stylists**: 1.2M in US
- **Nail Techs**: 500K in US
- **Lash Techs**: 200K in US
- **Total Market**: 2M+ potential users

### Conservative Estimates
- **100 users** × $49/mo = **$4,900/mo** ($58K/year)
- **500 users** × $49/mo = **$24,500/mo** ($294K/year)
- **1,000 users** × $49/mo = **$49,000/mo** ($588K/year)

With 10% converting to Enterprise ($99):
- **1,000 users** = 900 Pro + 100 Enterprise
- Revenue: (900 × $49) + (100 × $99) = **$54,000/mo** ($648K/year)

### Operating Costs
- Vercel Pro: $20/mo
- Firebase Blaze: ~$50/mo (1K users)
- Google AI API: ~$100/mo (30K generations)
- Stripe fees: 2.9% + 30¢ per transaction
- **Total**: ~$200/mo for first 1K users

**Net Profit at 1K users**: $53,800/mo 💰

---

## 🎨 FUTURE FEATURES (Post-Launch)

### V2 Features
- [ ] Image generation (DALL-E/Midjourney)
- [ ] Video script generator (TikTok/Reels)
- [ ] Email sequences (automated welcome series)
- [ ] Calendar integration (auto-post scheduling)
- [ ] Analytics dashboard (post performance tracking)
- [ ] Competitor analysis (scrape competitor posts)
- [ ] Client database (CRM for beauty pros)

### V3 Features
- [ ] Desktop app (Electron wrapper)
- [ ] iOS app (Swift + WebView)
- [ ] Chrome extension (generate on any site)
- [ ] Zapier integration
- [ ] WhatsApp bot
- [ ] Multi-user teams (salon owners + staff)

---

## 📋 IMMEDIATE ACTION ITEMS (TODAY)

1. ✅ Fix Gemini model name (DONE)
2. ⏳ Update Next.js to latest
3. ⏳ Add usage tracking to Firestore schema
4. ⏳ Update profile page with usage stats
5. ⏳ Test AI generation end-to-end
6. ⏳ Fix Android Flutter module errors
7. ⏳ Create Play Store listing draft

---

## 🚨 KNOWN BUGS

1. **AI generation fails** - gemini-pro deprecated ✅ FIXED
2. **Server crashes on API call** - suspected rate limiter or imports issue
3. **DashboardLayout syntax error** - false positive, needs cache clear
4. **158 tools warning** - VSCode MCP overload

---

## 🎉 SUCCESS METRICS

### Week 1
- [ ] 10 signups
- [ ] 5 paid subscriptions
- [ ] $245 MRR

### Month 1
- [ ] 100 signups
- [ ] 30 paid subscriptions
- [ ] $1,470 MRR

### Month 3
- [ ] 500 signups
- [ ] 150 paid subscriptions
- [ ] $7,350 MRR

### Month 6
- [ ] 2,000 signups
- [ ] 600 paid subscriptions
- [ ] $29,400 MRR

---

**Next Steps**: See your personal dashboard at http://localhost:3000/dashboard/profile
