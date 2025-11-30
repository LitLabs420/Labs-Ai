# 🔥 Litree Web Setup Guide

## Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
cd Litree-web
npm install
```

### Step 2: Configure Environment Variables

Edit `.env.local` with your API keys from:
- **Firebase Console** - Project settings
- **Stripe Dashboard** - API keys & products
- **Google AI Studio** - API keys

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_xxx_basic
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_xxx_pro
NEXT_PUBLIC_STRIPE_DELUXE_PRICE_ID=price_xxx_deluxe

# Google AI
GOOGLE_AI_STUDIO_API_KEY=your_api_key
Litree_MASTER_SYSTEM_PROMPT=You are Litree...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Run Development Server
```bash
npm run dev
```

Open http://localhost:3000

---

## 🔑 Getting Your API Keys

### Firebase
1. Go to https://console.firebase.google.com
2. Create new project or select existing
3. Project Settings (gear icon) → General → Copy config values
4. Enable Authentication → Email/Password
5. Create Firestore Database

### Stripe
1. Go to https://dashboard.stripe.com
2. Get API keys from Settings → API Keys
3. Create 3 products with prices:
   - Basic: $49/month
   - Pro: $99/month
   - Deluxe: $149/month
4. Copy Price IDs to `.env.local`
5. Create Webhook:
   - Settings → Webhooks → Add endpoint
   - URL: `https://yourdomain.com/api/stripe-webhook`
   - Events: checkout.session.completed, customer.subscription.*

### Google AI Studio
1. Go to https://aistudio.google.com
2. Create API key (left sidebar)
3. Create a new model or use Gemini 1.5 Pro
4. Write system prompt for beauty professionals
5. Copy API key and prompt to `.env.local`

---

## 🧪 Test Payment Flow

1. Click "Get Started" or select a plan
2. Use test card: **4242 4242 4242 4242**
3. Any future date (e.g., 12/34)
4. Any 3-digit CVC (e.g., 123)
5. Should complete checkout and redirect to dashboard

---

## 📁 What Each File Does

| File | Purpose |
|------|---------|
| `app/page.tsx` | Landing page with hero & pricing |
| `app/dashboard/page.tsx` | Protected dashboard for logged-in users |
| `app/api/ai-chat/route.ts` | Calls Google AI to generate content |
| `app/api/create-checkout-session/route.ts` | Creates Stripe checkout session |
| `app/api/stripe-webhook/route.ts` | Receives Stripe payment events |
| `components/AuthGate.tsx` | Login/signup form & auth state |
| `components/DashboardShell.tsx` | Dashboard UI with AI command buttons |
| `components/PricingTable.tsx` | Pricing cards & checkout buttons |
| `lib/firebase.ts` | Firebase initialization |
| `lib/stripe.ts` | Stripe client initialization |

---

## 🚀 Deploy to Production

### Option 1: Vercel (Recommended)
```bash
npm run build
vercel --prod
```

Then add environment variables in Vercel dashboard.

### Option 2: Docker
```bash
docker build -t Litree-web .
docker run -p 3000:3000 Litree-web
```

### Update Stripe Webhook URL
After deployment, go to Stripe Dashboard and update webhook endpoint URL to your production domain.

---

## ✅ Next Steps After Setup

1. **Test Everything Locally**
   - Sign up with test account
   - Try payment flow with test card
   - Click AI buttons and verify responses

2. **Connect Firestore**
   - Update webhook handler to save user tier
   - Add email notifications

3. **Monitor Production**
   - Set up error tracking (Sentry)
   - Monitor costs (Firebase, Stripe, Google AI)
   - Check webhook logs regularly

4. **Customize**
   - Update system prompt based on feedback
   - Add more AI commands
   - Customize UI/branding

---

## 🐛 Troubleshooting

**"Cannot find module firebase"**
→ Run `npm install firebase`

**"Stripe checkout not loading"**
→ Check price IDs in `.env.local` match Stripe dashboard

**"Google AI not responding"**
→ Verify API key is valid in Google AI Studio console

**"Firebase auth not working"**
→ Check Email/Password is enabled in Firebase Console

---

**You're all set! 🎉 Start building!**

