# LitLabs Complete Codebase Export for ChatGPT

## PROJECT STRUCTURE

```
litlabs-web/
├── app/
│   ├── page.tsx (Home page)
│   ├── layout.tsx (Root layout)
│   ├── globals.css (Global styles)
│   ├── auth/
│   │   └── page.tsx (Auth page - signup/login)
│   ├── dashboard/
│   │   ├── page.tsx (Dashboard home)
│   │   ├── ai/ (AI features)
│   │   ├── billing/ (Stripe billing)
│   │   ├── profile/ (User profile)
│   │   ├── settings/ (User settings)
│   │   └── ... (other pages)
│   ├── admin/
│   │   ├── users/ (User management)
│   │   ├── analytics/ (Analytics)
│   │   └── dashboard/ (Admin dashboard)
│   └── api/
│       ├── ai/
│       │   ├── generate-content (AI content generation)
│       │   ├── dm-reply (Smart DM replies)
│       │   └── money-play (Money play suggestions)
│       ├── checkout-session (Stripe checkout)
│       ├── webhooks/stripe (Stripe webhooks)
│       ├── email-sequences-enhanced (Email system)
│       └── ... (other API routes)
├── components/
│   ├── DashboardLayout.tsx (Dashboard layout wrapper)
│   ├── AuthGate.tsx (Auth protection)
│   ├── dashboard/
│   │   ├── MoneyTodayCard.tsx
│   │   ├── ChatBot.tsx
│   │   └── ... (other components)
│   └── ui/ (UI components)
├── lib/
│   ├── firebase.ts (Firebase config)
│   ├── stripe.ts (Stripe integration)
│   ├── analytics.ts (Google Analytics)
│   ├── email.ts (Resend email)
│   ├── ai.ts (Google Gemini AI)
│   ├── memory.ts (User memory system)
│   └── ... (other utilities)
├── context/
│   └── AuthContext.tsx (Auth context provider)
├── functions/ (Firebase Cloud Functions)
├── public/ (Static assets)
├── package.json (Dependencies)
├── tsconfig.json (TypeScript config)
├── next.config.ts (Next.js config)
└── .env.local (Environment variables)
```

---

## KEY FILES CONTENT

### 1. HOME PAGE (app/page.tsx)
**Purpose:** Marketing landing page with conversion optimization
**Features:**
- Hero section with urgency badge
- Social proof (2,847+ users, $89M+ revenue)
- Before/After comparison
- Feature showcase (6 main features)
- Testimonials from real users
- Pricing section (Free + Pro)
- FAQ section
- CTA buttons throughout

**Key Sections:**
- Sticky header with LitLabs logo and CTA
- Hero with "Stop Grinding, Start Scaling" headline
- 3-column social proof stats
- Before/After cards showing value
- 6 feature cards (AI Content Gen, Smart DM Replies, Money Plays, etc.)
- 3 testimonial cards with metrics
- Pricing: Free ($0 forever) vs Pro ($49/month with 14-day trial)
- FAQ with 5 common questions
- Final CTA section
- Footer

---

### 2. AUTH PAGE (app/auth/page.tsx)
**Purpose:** User signup and login
**Features:**
- Split layout: Info on left, form on right
- OAuth providers: Google, Apple, Microsoft, GitHub
- Email/Password authentication
- Mode toggle: Signup vs Login
- Loading states
- Error handling
- Social proof on mobile
- Links to terms and privacy policy

**OAuth Providers:**
```typescript
- GoogleAuthProvider
- OAuthProvider (Apple, Microsoft)
- GithubAuthProvider
```

---

### 3. DASHBOARD HOME (app/dashboard/page.tsx)
**Purpose:** Main dashboard after user logs in
**Features:**
- Welcome header with personalized greeting
- XP tracking and streak system
- Daily challenge card
- Quick stats: Posts this month, Active clients, Revenue, Current plan
- Feature cards: Daily Post Generator, Smart DM Replies, Fraud Detection, Analytics
- Money Today card (Godmode feature)
- Chatbot onboarding component
- Upgrade CTA for free tier users

**Stats Tracked:**
```typescript
type Stats = {
  postsThisMonth: number;
  totalClients: number;
  revenue: number;
  tier: string; // 'free' or 'pro'
};
```

---

### 4. AI FEATURES STRUCTURE
**AI Routes:**

#### A. POST CONTENT GENERATION (/api/ai/generate-content)
- Input: Business type, niche, tone
- Output: Instagram captions, TikTok scripts, Reels descriptions
- Uses: Google Gemini API
- Stores: Result in user memory for context

#### B. DM SMART REPLIES (/api/ai/dm-reply)
- Input: Incoming DM message
- Output: Professional AI-generated reply
- Uses: Google Gemini API with user context
- Features: Contextual replies, lead qualification, appointment booking

#### C. MONEY PLAYS (/api/ai/money-play)
- Input: User business info
- Output: Daily monetization suggestions
- Ideas: Flash sales, upsells, comeback offers
- Frequency: Daily suggestions

---

### 5. STRIPE BILLING SYSTEM
**File:** lib/stripe.ts

**Features:**
```typescript
- Stripe production keys (LIVE)
- 3-tier pricing: Free ($0), Pro ($49/mo), Elite ($299/mo)
- 14-day free trial (no card required)
- Auto-downgrade on payment failure
- Transaction logging
- Webhook handling for:
  * charge.succeeded
  * charge.failed
  * customer.subscription.updated
  * customer.subscription.deleted
```

**Checkout Flow:**
1. User clicks "Upgrade to Pro"
2. Creates Stripe checkout session
3. Redirects to Stripe payment page
4. User completes payment
5. Webhook updates user tier in Firestore
6. User gets full access

**Test Card:** `4242 4242 4242 4242` (any future date)

---

### 6. FIREBASE CONFIGURATION
**File:** lib/firebase.ts

```typescript
firebaseConfig = {
  REDACTED_SECRET_Possible_password_env
  authDomain: "studio-4627045237-a2fe9.firebaseapp.com",
  projectId: "studio-4627045237-a2fe9",
  storageBucket: "studio-4627045237-a2fe9.firebasestorage.app",
  messagingSenderId: "612847421952",
  appId: "1:612847421952:web:d66d4ba0666e7f5116e6e5",
};
```

**Services Used:**
- Firebase Auth (Email, Google, Apple, Microsoft, GitHub)
- Firestore Database (Real-time data)
- Firebase Storage (File uploads)

---

### 7. FIRESTORE DATABASE SCHEMA

```typescript
// USERS Collection
users/{uid}
├── email: string
├── displayName: string
├── businessName: string
├── niche: string (e.g., "nail tech", "lash tech", "hair stylist")
├── city: string
├── tier: string ('free' | 'pro' | 'elite')
├── createdAt: timestamp
├── lastLogin: timestamp
├── stripeCustomerId: string
├── onboardingComplete: boolean
├── profilePicture: string (URL)

// SUBSCRIPTIONS Collection
subscriptions/{subscriptionId}
├── userId: string
├── stripeSubscriptionId: string
├── plan: string ('free' | 'pro' | 'elite')
├── status: string ('active' | 'past_due' | 'canceled')
├── currentPeriodStart: timestamp
├── currentPeriodEnd: timestamp
├── canceledAt: timestamp

// TRANSACTIONS Collection
transactions/{transactionId}
├── userId: string
├── stripeChargeId: string
├── amount: number
├── currency: string
├── status: string ('succeeded' | 'failed')
├── createdAt: timestamp
├── description: string

// REFERRALS Collection
referrals/{referralId}
├── referrerId: string
├── referredUserId: string
├── status: string ('pending' | 'completed')
├── commission: number
├── createdAt: timestamp

// ACTIVITY_LOG Collection
activity_log/{logId}
├── userId: string
├── action: string (e.g., 'ai_content_generated', 'dm_replied')
├── details: object
├── timestamp: timestamp

// USER_MEMORY Collection (For AI context)
userMemory/{userId}
├── businessInfo: object
├── contentHistory: array
├── conversationHistory: array
├── preferences: object
├── updatedAt: timestamp
```

---

### 8. EMAIL SYSTEM
**File:** lib/email.ts
**Service:** Resend.io

**Email Templates:**

1. **Welcome Email**
   - Subject: "Welcome to LitLabs - Your 14-Day Free Trial Starts Now"
   - Content: Onboarding info, feature overview, getting started link

2. **Upgrade Confirmation**
   - Subject: "Upgrade Confirmed - Welcome to LitLabs Pro!"
   - Content: Feature list, account management link

3. **Payment Failure**
   - Subject: "Payment Failed - Update Your Billing"
   - Content: Error reason, retry link

4. **Cancellation**
   - Subject: "We Hate to See You Go"
   - Content: Reason survey, return offer

---

### 9. GOOGLE GEMINI AI INTEGRATION
**File:** lib/ai.ts
**Service:** Google Generative AI (Gemini Pro)

**Functions:**

```typescript
// Generate content (captions, scripts, descriptions)
async function generateContent(prompt: string, context: object)

// Generate DM replies
async function generateDMReply(message: string, userContext: object)

// Generate money play suggestions
async function generateMoneyPlay(businessInfo: object)

// Chat interface
async function chat(messages: array, userContext: object)
```

**Context Include:**
- User's business niche
- Previous content style
- User preferences
- Memory of past conversations

---

### 10. ADMIN PANEL (app/admin/users/page.tsx)
**Purpose:** Manage users and subscriptions
**Features:**
- User listing with search
- Real-time Firestore sync
- Tier management: Free → Pro → Elite
- Ban/unban functionality
- User details modal
- Subscription status display
- Revenue tracking

**Access Control:**
```typescript
NEXT_PUBLIC_ADMIN_EMAIL = dyingbreed243@gmail.com
```

---

### 11. AUTHENTICATION CONTEXT (context/AuthContext.tsx)
**Purpose:** Global auth state management

**Provides:**
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  userTier: 'free' | 'pro' | 'elite';
  userProfile: UserProfile | null;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}
```

---

## ENVIRONMENT VARIABLES (.env.local)

```env
# Firebase
NEXT_PUBLIC_FIREBASE_REDACTED_SECRET_Possible_password_env
REDACTED_SECRET_Generic_long_secret=studio-4627045237-a2fe9.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-4627045237-a2fe9
REDACTED_SECRET_Generic_long_secret=studio-4627045237-a2fe9.firebasestorage.app
REDACTED_SECRET_Generic_long_secret=612847421952
NEXT_PUBLIC_FIREBASE_APP_ID=1:612847421952:web:d66d4ba0666e7f5116e6e5

# Stripe
STRIPE_SECRET_KEY=REDACTED_STRIPE_SECRET
STRIPE_PUBLIC_KEY=pk_live_51SZ8oA3GB9IAma1Q...
STRIPE_WEBHOOK_REDACTED_SECRET_Possible_password_env
REDACTED_SECRET_Generic_long_secret=pk_live_...

# Google AI
GOOGLE_GENERATIVE_AI_REDACTED_SECRET_Possible_password_env

# Email (Resend)
RESEND_REDACTED_SECRET_Possible_password_env

# Admin
NEXT_PUBLIC_ADMIN_EMAIL=dyingbreed243@gmail.com

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=studio-4627045237-a2fe9
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
```

---

## API ROUTES SUMMARY

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/ai/generate-content` | POST | Generate post content |
| `/api/ai/dm-reply` | POST | Generate DM reply |
| `/api/ai/money-play` | POST | Generate money play |
| `/api/checkout-session` | POST | Create Stripe checkout |
| `/api/webhooks/stripe` | POST | Stripe webhook handler |
| `/api/email-sequences-enhanced` | POST | Send email |
| `/api/admin/users` | GET | List all users |
| `/api/admin/users` | POST | Update user tier |
| `/api/activity` | GET | Get activity log |
| `/api/referrals/[code]` | GET | Process referral |

---

## PRICING STRUCTURE

| Feature | Free | Pro | Elite |
|---------|------|-----|-------|
| Price | $0 | $49/mo | $299/mo |
| Trial | 14 days | Included | Included |
| Posts/Month | 10 | Unlimited | Unlimited |
| DM Replies | 50 | Unlimited | Unlimited |
| Money Plays | Daily | Daily | Daily |
| Playbooks | 1 | Unlimited | Unlimited |
| Analytics | Basic | Advanced | Advanced + Priority |
| Support | Community | Email | Priority Email + Phone |

---

## DEPLOYMENT INFO

**Hosting:** Vercel (https://litlabs-web.vercel.app)
**Database:** Firebase Firestore
**Payment:** Stripe (Production)
**Email:** Resend.io
**AI:** Google Generative AI (Gemini)

**Build Status:** ✅ 0 errors
**Deploy:** Auto-deploy on git push (GitHub connected)

---

## USER FLOW

1. **Landing Page** → Visit https://litlabs-web.vercel.app
2. **Sign Up** → Click "Try Free Now" → Choose auth method
3. **Onboarding** → Complete profile (business name, niche, city)
4. **Dashboard** → See stats, XP, challenges
5. **Generate Content** → Go to `/dashboard/ai` → Create posts
6. **Get AI Replies** → Forward DMs to system → Get replies
7. **Upgrade** → Click "Upgrade" → Stripe checkout → Become Pro
8. **Use Pro Features** → Unlimited content, advanced playbooks
9. **Admin Access** → dyingbreed243@gmail.com can manage all users

---

## KEY STATS

- **Users:** 2,847+
- **Revenue Booked:** $89M+
- **Rating:** 4.9 ⭐
- **Active Merchants:** Beauty pros (nail techs, lash techs, hair stylists)
- **Average Revenue Growth:** 3-10x in 90 days
- **AI Features:** Content generation, DM replies, money plays

---

## WHAT'S CURRENTLY LIVE

✅ Frontend: Deployed on Vercel
✅ Auth: Firebase (Email + 5 OAuth)
✅ Database: Firestore with all collections
✅ Payments: Stripe production keys active
✅ AI: Google Gemini integrated (needs API key)
✅ Email: Resend integration (optional)
✅ Admin Panel: User management active
✅ Analytics: Real-time tracking
✅ Build: 0 errors, production-ready

---

## NEXT STEPS IF MODIFYING

1. Update `.env.local` if changing API keys
2. Commit changes: `git add . && git commit -m "message" && git push`
3. Vercel auto-deploys (2-3 min)
4. Test at https://litlabs-web.vercel.app

---

This is your complete codebase structure. Share this with ChatGPT for comprehensive analysis and modifications!
