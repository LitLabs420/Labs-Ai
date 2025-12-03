# 🔐 Environment Variables Setup Guide

## Quick Start

1. **Copy the template:**
   ```powershell
   Copy-Item .env.example .env.local
   ```

2. **Fill in your values** in `.env.local` (see sections below)

3. **Never commit** `.env.local` - it's automatically ignored by git

---

## 📝 Required Variables (Core Functionality)

### Firebase Client Configuration
**Where to get:** [Firebase Console](https://console.firebase.google.com) → Project Settings → General → Your apps → Web app

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123
```

### Admin Credentials
**Where to get:** 
- UID: Firebase Console → Authentication → Users → Click your user → Copy UID
- Email: Your actual admin email

```env
NEXT_PUBLIC_ADMIN_UID=abc123def456...
NEXT_PUBLIC_ADMIN_EMAIL=your-email@example.com
```

### Stripe Payment Processing
**Where to get:**
- Secret Key: [Stripe Dashboard](https://dashboard.stripe.com/apikeys) → API keys → Secret key
- Price IDs: Stripe Dashboard → Products → Click product → Copy Price ID
- Webhook Secret: Stripe Dashboard → Webhooks → Add endpoint → Copy signing secret

```env
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_PRICE_GROWTH=price_1abc...
STRIPE_PRICE_GODMODE=price_1def...
STRIPE_WEBHOOK_SECRET=whsec_1...
```

**⚠️ Webhook Setup:**
1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. URL: `https://YOUR-DOMAIN.vercel.app/api/stripe-webhook`
4. Events to send: Select `checkout.session.completed` and `customer.subscription.updated`
5. Copy the webhook signing secret

### AI Services
**Where to get:**
- OpenAI: [OpenAI Platform](https://platform.openai.com/api-keys) → Create new secret key
- Google AI: [Google AI Studio](https://makersuite.google.com/app/apikey) → Create API key

```env
OPENAI_API_KEY=sk-proj-...
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...
```

---

## 🎯 Optional Variables (Enhanced Features)

### Email Service (Resend)
**Purpose:** Transactional emails (welcome, receipts, password resets)
**Where to get:** [Resend](https://resend.com/api-keys) → Create API key

```env
RESEND_API_KEY=re_...
```

### ReCAPTCHA (Spam Protection)
**Purpose:** Protect demo form from bots
**Where to get:** [reCAPTCHA Admin](https://www.google.com/recaptcha/admin) → Create site

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lf...
```

### App URL (Production)
**Purpose:** Stripe redirects and absolute URLs
**Local development:** `http://localhost:3000`
**Production:** Your actual domain

```env
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

---

## 🚀 Deployment to Vercel

### Option 1: Vercel CLI (Recommended)
```powershell
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Add environment variables from .env.local
vercel env pull
```

### Option 2: Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → Settings → Environment Variables
3. Add each variable:
   - **Key:** Variable name (e.g., `STRIPE_SECRET_KEY`)
   - **Value:** Variable value (paste from your `.env.local`)
   - **Environments:** Select Production, Preview, and Development as needed
4. Redeploy your project

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep `.env.local` on your local machine only
- Use test/sandbox keys for development
- Rotate production keys every 90 days
- Use different keys for production vs development
- Store backup keys in a secure password manager

### ❌ DON'T:
- Never commit `.env.local` to git (it's in `.gitignore`)
- Never share API keys in Slack, email, or screenshots
- Never use production keys in development
- Never hardcode secrets in source code
- Never store keys in plain text files in cloud storage

---

## 🧪 Testing Your Configuration

After setting up `.env.local`:

```powershell
# Start dev server
npm run dev

# Open browser
Start-Process http://localhost:3000
```

### Test Checklist:
- [ ] Homepage loads (no console errors about Firebase)
- [ ] Can sign up with email/password
- [ ] Can login after signup
- [ ] Dashboard loads after login
- [ ] AI generation buttons work (requires OpenAI/Google AI keys)
- [ ] Billing page loads (requires Stripe keys)
- [ ] Can click "Upgrade" and see Stripe checkout

---

## 🐛 Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
**Fix:** Check `NEXT_PUBLIC_FIREBASE_API_KEY` is correct in `.env.local`

### "Stripe error: No such price"
**Fix:** Verify `STRIPE_PRICE_GROWTH` and `STRIPE_PRICE_GODMODE` match your Stripe Dashboard product price IDs

### "AI generation not working"
**Fix:** 
1. Check browser console for errors
2. Verify `GOOGLE_GENERATIVE_AI_API_KEY` or `OPENAI_API_KEY` is set
3. Ensure API key has quota remaining

### "Environment variable not found"
**Fix:**
1. Restart dev server: `Ctrl+C`, then `npm run dev`
2. Ensure variable starts with `NEXT_PUBLIC_` if used in client-side code
3. Check for typos in variable name

---

## 📚 Additional Resources

- [Next.js Environment Variables Docs](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)
- [Firebase Web Setup Guide](https://firebase.google.com/docs/web/setup)
- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)

---

**Need help?** Check the main README.md or TROUBLESHOOTING.md
