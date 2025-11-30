# 🔥 LitLabs Web - Deployment & Launch Checklist

## Pre-Launch (Before Vercel)

### ✅ Local Testing Complete
- [ ] `npm run dev` starts without errors
- [ ] Homepage loads at `http://localhost:3000`
- [ ] Can sign up with email/password
- [ ] Dashboard page protected (redirects if not logged in)
- [ ] AI commands generate responses
- [ ] Can see all 3 pricing tiers
- [ ] Mobile responsiveness checked

### ✅ Environment Variables
- [ ] `.env.local` created with all 12 variables
- [ ] Firebase credentials verified
- [ ] Stripe test keys configured
- [ ] Google AI API key working
- [ ] No secrets in GitHub (`.gitignore` configured)

### ✅ Build Verification
```bash
npm run build
# Should complete with: ✓ Generating static pages
```
- [ ] Build succeeds with 0 errors
- [ ] All routes compile correctly
- [ ] TypeScript checks pass
- [ ] Assets optimized

---

## Deployment to Vercel

### Step 1: Prepare GitHub
```bash
cd litlabs-web
git init
git add .
git commit -m "Initial LitLabs Web commit"
git remote add origin https://github.com/your-username/litlabs-web.git
git push -u origin main
```

- [ ] Repository created on GitHub
- [ ] Code pushed to main branch
- [ ] `.gitignore` excludes node_modules & .env.local

### Step 2: Deploy to Vercel

**Option A: Via GitHub**
1. Go to https://vercel.com
2. Click "New Project"
3. Connect your GitHub repo
4. Select `litlabs-web` folder
5. Click "Deploy"

**Option B: Via CLI**
```bash
npm install -g vercel
vercel --prod
```

- [ ] Vercel account created
- [ ] Repository connected
- [ ] Project deployed successfully

### Step 3: Add Environment Variables to Vercel

1. Go to Project Settings → Environment Variables
2. Add all 12 variables from `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
NEXT_PUBLIC_STRIPE_DELUXE_PRICE_ID
GOOGLE_AI_STUDIO_API_KEY
LITLABS_MASTER_SYSTEM_PROMPT
NEXT_PUBLIC_APP_URL (set to your Vercel domain)
```

3. Redeploy after adding variables:
   ```bash
   vercel --prod
   ```

- [ ] All 12 variables added to Vercel
- [ ] `NEXT_PUBLIC_APP_URL` updated to your domain
- [ ] Redeployment triggered

---

## Post-Deployment: Connect Stripe Webhook

### Update Stripe Webhook Endpoint

1. Go to https://dashboard.stripe.com/webhooks
2. Find your existing webhook or create new
3. Update endpoint URL to:
   ```
   https://your-domain-on-vercel.vercel.app/api/stripe-webhook
   ```
4. Make sure webhook secret is in Vercel env vars
5. Test webhook delivery

- [ ] Stripe webhook URL updated
- [ ] Webhook secret in Vercel
- [ ] Test event delivered successfully

---

## Live Testing

### Test on Production Domain

1. Go to `https://your-domain.vercel.app`
2. Test signup with real email
3. Test checkout with Stripe test card (4242 4242 4242 4242)
4. Check logs for errors

- [ ] Homepage loads correctly
- [ ] Can sign up
- [ ] Can navigate to dashboard
- [ ] AI responses work
- [ ] Payment checkout completes

### Verify in Stripe Dashboard

- [ ] Payment appears in Transactions
- [ ] Webhook delivered successfully
- [ ] No errors in Event Logs

### Check Firebase Console

- [ ] New user created in Authentication
- [ ] Can see user session activity

### Monitor Google AI Usage

- [ ] API calls tracked
- [ ] Response times acceptable
- [ ] No rate limiting issues

---

## Custom Domain (Optional)

1. Go to Vercel Project Settings → Domains
2. Add your custom domain (e.g., `litlabs.io`)
3. Update DNS records per Vercel instructions
4. Wait for SSL certificate (~2-3 minutes)

- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Domain points to Vercel
- [ ] HTTPS working

---

## Security Verification

- [ ] No secrets in public files
- [ ] Environment variables properly hidden
- [ ] Stripe webhook signature verified
- [ ] Firebase security rules configured
- [ ] CORS headers appropriate
- [ ] Password requirements enforced

---

## Monitoring Setup

### Errors & Performance

1. **Vercel Analytics**
   - Monitor Core Web Vitals
   - Check page load times
   - View error logs

2. **Firebase Console**
   - Monitor Authentication usage
   - Track Firestore reads/writes
   - Check error messages

3. **Stripe Dashboard**
   - Track payment success rate
   - Monitor webhook delivery
   - Watch API error rates

- [ ] Vercel Analytics enabled
- [ ] Firebase metrics monitored
- [ ] Stripe logs reviewed

---

## Ongoing Maintenance

### Weekly Checks
- [ ] No errors in logs
- [ ] Payments processing normally
- [ ] AI responses generating correctly
- [ ] Load times acceptable

### Monthly Tasks
- [ ] Review costs (Firebase, Stripe, Google AI, Vercel)
- [ ] Update system prompt if needed
- [ ] Check for dependency updates
- [ ] Review user feedback

### Quarterly
- [ ] Analyze usage metrics
- [ ] Plan feature improvements
- [ ] Update security measures
- [ ] Optimize performance

---

## Troubleshooting Common Issues

### "Environment variables not loading"
→ Make sure you added them to Vercel AND redeployed

### "Stripe checkout not working"
→ Check that `NEXT_PUBLIC_STRIPE_*_PRICE_ID` are set in Vercel
→ Verify price IDs match Stripe dashboard

### "Google AI not responding"
→ Check `GOOGLE_AI_STUDIO_API_KEY` is valid
→ Verify API quota in Google AI Studio console

### "Webhook not delivering"
→ Check webhook URL in Stripe matches your domain
→ Verify `STRIPE_WEBHOOK_SECRET` in Vercel
→ Check logs for signature verification errors

---

## 🎉 You're Live!

Once you see ✅ on all items above, LitLabs Web is officially launched.

**Share your link:**
```
https://your-domain.vercel.app
```

---

## 🚀 Post-Launch

Now that you're live:

1. **Start getting customers**
   - Share link on social media
   - Add to marketing materials
   - Tell your network

2. **Monitor metrics**
   - Track signups daily
   - Watch payment completion rate
   - Note which tier is most popular

3. **Gather feedback**
   - Ask early customers what they want
   - Note feature requests
   - Improve system prompt based on results

4. **Plan next features**
   - Save user preferences to Firestore
   - Add content library
   - Create admin dashboard
   - Build email notifications

---

## 📞 Support

- Vercel: https://vercel.com/support
- Stripe: https://support.stripe.com
- Firebase: https://firebase.google.com/support
- Next.js: https://github.com/vercel/next.js/discussions

---

**Deployment Date**: ________________  
**Live Domain**: ________________  
**Launch Status**: 🚀 LIVE

---

*Congratulations! You've deployed a production-grade SaaS app. 🎉*
