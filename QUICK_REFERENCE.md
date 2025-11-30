# ⚡ LITLABS QUICK REFERENCE GUIDE

## 🟢 LIVE SITE
```
https://litlabs-3sb9edb1i-larry-bols-projects.vercel.app
```
**Status:** OPERATIONAL ✅

---

## 🚀 COMMANDS

### Development
```powershell
npm run dev
# http://localhost:3000
```

### Production Build
```powershell
npm run build
# Output: .next/ directory ready for deployment
```

### Deploy to Vercel
```powershell
vercel --prod
# Automatic from git - or use command above
```

### Check Build Status
```powershell
npm run build 2>&1 | tail -20
# Shows: 13 routes, 0 errors ✅
```

---

## 🔐 LOGIN TEST ACCOUNTS

### Admin (Founder)
- Email: `dyingbreed243@gmail.com`
- Password: Use Firebase Auth reset
- Access: Admin panel at `/admin`

### Test User (Create Your Own)
- Go to `/dashboard` → "New here? Create an account"
- Sign up with any email
- Get access to: dashboard, billing, profile, history, onboarding

---

## 📂 KEY FILES

| File | Purpose |
|------|---------|
| `app/page.tsx` | Homepage (262 lines, public) |
| `app/admin/page.tsx` | Admin dashboard (founder-only) |
| `components/AuthGate.tsx` | Auth wrapper & login UI |
| `lib/firebase.ts` | Firebase client (lazy-loaded) |
| `lib/stripe.ts` | Stripe client (lazy-loaded) |
| `.env.local` | Secrets (NOT committed) |
| `vercel.json` | Deployment config |

---

## 🔑 ENVIRONMENT VARIABLES

All in `.env.local` (do NOT commit):

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_...

# Admin
NEXT_PUBLIC_ADMIN_EMAIL=dyingbreed243@gmail.com
```

To update on Vercel:
1. `vercel env pull` (to sync local)
2. Edit `.env.local`
3. `vercel env add KEY VALUE` (or Vercel dashboard)
4. Redeploy: `vercel --prod`

---

## 📍 ROUTES

### Public
- `GET /` — Homepage

### Protected (Login Required)
- `GET /dashboard` — User dashboard
- `GET /billing` — Subscriptions
- `GET /profile` — User profile
- `GET /history` — Content history
- `GET /onboarding` — Setup

### Private (Founder Only)
- `GET /admin` — Admin panel (silent redirect if not owner)

### API
- `POST /api/ai-chat` — AI chat
- `POST /api/create-checkout-session` — Stripe checkout
- `POST /api/stripe-webhook` — Payment webhooks
- `GET /api/referrals/[code]` — Referrals

---

## 💳 STRIPE TEST CARDS

Use these to test payments:

| Card | Expires | CVC |
|------|---------|-----|
| `4242 4242 4242 4242` | Any future date | Any 3 digits |
| `4000 0025 0000 3155` | Any future date | Any 3 digits |

Result: Payment succeeds → triggers webhook → updates Firestore

---

## 🔍 DEPLOYMENT CHECKLIST

Before major updates:

- [ ] Run `npm run build` locally (verify 0 errors)
- [ ] Test locally with `npm run dev`
- [ ] Commit changes: `git add . && git commit -m "..."`
- [ ] Deploy: `vercel --prod`
- [ ] Check Vercel dashboard for build status
- [ ] Visit live site and test key flows

---

## 🐛 TROUBLESHOOTING

### Build Fails
```powershell
npm install
npm run build
# Check for errors in output
```

### Build Succeeds but Site Won't Load
1. Check `.env.local` is in `litlabs-web/` directory
2. Verify Firebase credentials are correct
3. Check Vercel deployment logs: `vercel logs`

### Firebase Auth Not Working
1. Verify `NEXT_PUBLIC_FIREBASE_*` in `.env.local`
2. Check Firebase console for auth methods enabled
3. Verify domain is added to Firebase allowed list

### Stripe Payments Not Working
1. Verify `STRIPE_SECRET_KEY` is set
2. Check webhook is configured in Stripe dashboard
3. Verify `STRIPE_WEBHOOK_SECRET` matches

### Admin Page Not Showing
1. Must be logged in with admin email
2. Admin email: `dyingbreed243@gmail.com`
3. Non-owners see silent redirect to `/`

---

## 📊 MONITORING

### Vercel Dashboard
https://vercel.com/dashboard
- Build status
- Deployment history
- Function logs
- Performance metrics

### Firebase Console
https://console.firebase.google.com
- Authentication logs
- Firestore data
- Cloud Function logs
- Real-time database viewer

### Stripe Dashboard
https://dashboard.stripe.com
- Transactions
- Subscriptions
- Webhooks
- Test data

---

## 🆘 SUPPORT CONTACTS

- **Vercel:** https://vercel.com/help
- **Firebase:** https://firebase.google.com/docs
- **Stripe:** https://stripe.com/docs
- **Next.js:** https://nextjs.org/docs

---

## ✅ STATUS

```
Build: ✅ PASSING (0 errors, 13 routes)
Deployment: ✅ LIVE (Vercel)
Auth: ✅ WORKING (Firebase)
Payments: ✅ READY (Stripe test)
Admin: ✅ LOCKED (founder-only)
Security: ✅ SECURED (privacy architecture)
```

**Ready for Users** 🚀
