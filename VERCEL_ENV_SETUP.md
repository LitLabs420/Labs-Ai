# 🚀 VERCEL ENVIRONMENT VARIABLES - SETUP (Copy-Paste)

**Complete this to launch on production. Takes 3 minutes.**

---

## Step 1: Go to Vercel Settings

```
https://vercel.com/dyingbreed243/litlabs-web/settings/environment-variables
```

---

## Step 2: Get Your API Keys

### Key #1 - Google Generative AI (Required)
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (looks like: `AIzaSyD...`)

### Key #2 - Stripe Webhook Secret (Required)
1. Visit: https://dashboard.stripe.com/webhooks
2. Find the endpoint for `https://litlabs-web.vercel.app/api/webhooks/stripe`
3. Click on it
4. Scroll down to "Signing secret"
5. Click "Reveal"
6. Copy the full secret (starts with `whsec_1_`)

### Key #3 - Resend Email (Optional but Recommended)
1. Visit: https://resend.com/api-keys
2. Click "Create API Key"
3. Name it "LitLabs Production"
4. Copy the key (starts with `re_`)

---

## Step 3: Add to Vercel (Copy-Paste)

### Add Variable #1
- **Name:** `GOOGLE_GENERATIVE_AI_API_KEY`
- **Value:** [Paste your Google key here]
- **Environments:** ✅ Production
- **Click:** Add

### Add Variable #2
- **Name:** `STRIPE_WEBHOOK_SECRET`
- **Value:** [Paste your Stripe secret here]
- **Environments:** ✅ Production
- **Click:** Add

### Add Variable #3 (Optional)
- **Name:** `RESEND_API_KEY`
- **Value:** [Paste your Resend key here]
- **Environments:** ✅ Production
- **Click:** Add

---

## Step 4: Deploy

After adding all variables:
1. Vercel auto-deploys (watch the "Deployments" tab)
2. Wait for green checkmark (~2-3 min)
3. Go to https://litlabs-web.vercel.app
4. Test it!

---

## Testing Checklist

After deploy completes:

```
✅ Sign up → Creates user in Firestore
✅ Go to /dashboard/ai → Page loads
✅ Click "Generate Content" → Gets AI response (requires Google key)
✅ Go to /dashboard/billing → Page loads
✅ Click "Upgrade Pro" → Stripe checkout loads
✅ Complete test payment → User tier updates (requires Stripe secret)
✅ Check email → Got welcome + payment email (requires Resend key)
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Cannot resolve @google/generative-ai" | Add GOOGLE_GENERATIVE_AI_API_KEY to Vercel + wait 2 min |
| Stripe checkout doesn't work | Check STRIPE_WEBHOOK_SECRET is set + rebuild |
| Emails not arriving | Check RESEND_API_KEY is set + check Resend dashboard |
| Vercel stuck on building | Check build logs at https://vercel.com/dyingbreed243/litlabs-web/deployments |

---

**Once all 3 keys are added and deployment shows green checkmark, you're 🟢 LIVE!**
