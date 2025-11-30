# 📋 LitLabs Web - Production Launch Checklist

## Pre-Launch (This Week)

### Credentials Setup ✅
- [ ] Firebase project created at console.firebase.google.com
- [ ] Firebase Email/Password auth enabled
- [ ] Firestore Database created (test mode OK initially)
- [ ] All 6 Firebase credentials copied to `.env.local`
- [ ] Stripe account created at dashboard.stripe.com
- [ ] 3 products created (Basic $49, Pro $99, Deluxe $149)
- [ ] All 4 Stripe credentials copied to `.env.local`
- [ ] Google AI API key generated at aistudio.google.com
- [ ] Google AI credentials copied to `.env.local`
- [ ] `.env.local` file complete with all 12 variables

### Local Testing ✅
- [ ] Run `npm run dev` successfully
- [ ] Homepage loads at http://localhost:3000
- [ ] "Get Started" button navigates to signup
- [ ] Create test account (email: test@example.com)
- [ ] Login works with same credentials
- [ ] Dashboard page loads after login
- [ ] Click "Daily Post" button → AI response appears
- [ ] Try other AI buttons → all generate content
- [ ] "Upgrade" button opens Stripe checkout
- [ ] Test payment with card: 4242 4242 4242 4242
- [ ] Payment succeeds → redirects to success page
- [ ] No console errors in DevTools

### Code Quality ✅
- [ ] Run `npm run build` → no errors
- [ ] Run `npm run lint` → no critical issues
- [ ] TypeScript: 0 errors
- [ ] All routes compile (8 routes expected)
- [ ] All components render without warnings

### Git Setup ✅
- [ ] Repository initialized with `git init`
- [ ] All 30 files committed: `git commit -m "Initial commit"`
- [ ] GitHub repo created at github.com/YOUR_USERNAME/litlabs-web
- [ ] Local repo connected: `git remote add origin https://github.com/...`
- [ ] Code pushed to main branch: `git push -u origin main`

### Environment Configuration ✅
- [ ] `.env.local` exists in project root (NOT committed)
- [ ] All 12 environment variables set
- [ ] Values verified (not placeholder text)
- [ ] `NEXT_PUBLIC_*` variables start with `NEXT_PUBLIC_`
- [ ] Secret keys (STRIPE_SECRET_KEY, GOOGLE_AI_STUDIO_API_KEY) do NOT start with `NEXT_PUBLIC_`

---

## Launch Week (Week 1)

### Deployment Setup ✅
- [ ] Vercel account created at vercel.com
- [ ] GitHub connected to Vercel
- [ ] Project imported from GitHub
- [ ] All 12 environment variables added to Vercel dashboard
- [ ] Production deployment triggered
- [ ] Deployment successful (no build errors)
- [ ] App loads at https://litlabs-web.vercel.app (or custom domain)

### Post-Deployment Testing ✅
- [ ] Homepage loads (https://yourdomain.com)
- [ ] Signup works with new email
- [ ] Login works with created account
- [ ] Dashboard accessible after login
- [ ] AI buttons generate content on production
- [ ] "Upgrade" redirects to Stripe checkout
- [ ] Test payment works on production
- [ ] Webhook receives payment event (check Stripe dashboard)
- [ ] No 404 or 500 errors in deployment

### Stripe Configuration ✅
- [ ] Stripe account switched to "Live" mode (if going public)
- [ ] Live API keys obtained (sk_live_...)
- [ ] Live Price IDs obtained from products
- [ ] Webhook endpoint configured in Stripe dashboard:
  - URL: `https://yourdomain.com/api/stripe-webhook`
  - Events selected: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
  - Webhook secret copied to `.env.local` (STRIPE_WEBHOOK_SECRET)
  - CRITICAL: After adding webhook, update Vercel env vars with new secret
- [ ] Webhook tested with real payment

### Firebase Production Setup ✅
- [ ] Firestore Security Rules updated (NOT in test mode):
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{uid} {
        allow read, write: if request.auth.uid == uid;
      }
    }
  }
  ```
- [ ] Firebase Authentication methods reviewed (email only for MVP)
- [ ] User data model defined (uid, email, tier, subscription)
- [ ] Backup enabled for Firestore

### Google AI API Setup ✅
- [ ] Google AI API key restricted to production domain
- [ ] System prompt customized for beauty industry
- [ ] API quotas checked (free tier: 60 requests/min)
- [ ] API monitoring enabled

### Monitoring & Alerts ✅
- [ ] Vercel deployment logs checked for errors
- [ ] Firebase console monitored for auth issues
- [ ] Stripe dashboard checked for failed transactions
- [ ] Google Cloud Console checked for API errors
- [ ] Email alerts configured for deployment failures
- [ ] Error tracking configured (Sentry, Datadog, etc.)

### Security ✅
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] CORS configured properly (only your domain)
- [ ] API keys NOT logged or exposed in client code
- [ ] Sensitive data NOT in git (`.env.local` in `.gitignore`)
- [ ] Stripe webhook signature verified in code
- [ ] Firebase auth tokens secure (httpOnly cookies OK for SSR)

### Documentation ✅
- [ ] README.md updated with live deployment URL
- [ ] SETUP.md instructions tested and accurate
- [ ] DEPLOYMENT.md covers Vercel setup
- [ ] QUICKSTART.md available for new developers
- [ ] Credentials stored in secure location (1Password, LastPass, etc.)
- [ ] API keys and secrets NOT shared in documentation

---

## Post-Launch (Week 2+)

### User Analytics ✅
- [ ] Google Analytics 4 integrated (optional)
- [ ] Track signup funnel
- [ ] Track pricing page views
- [ ] Track checkout clicks
- [ ] Track subscription completions
- [ ] Dashboard metrics visible

### User Data Persistence ✅
- [ ] Webhook handler updated to save user tier to Firestore
- [ ] Subscription status stored (active/canceled/failed)
- [ ] User profile page created
- [ ] AI responses saved to Firestore history
- [ ] Usage metrics tracked (requests/month)

### Email Notifications ✅
- [ ] SendGrid/Gmail integration (or Firebase Email Extension)
- [ ] Welcome email sent on signup
- [ ] Payment confirmation email sent
- [ ] Subscription renewal reminder emails
- [ ] Failed payment notifications

### Content Features ✅
- [ ] User history page shows past AI responses
- [ ] Save favorites functionality
- [ ] Content library / dashboard
- [ ] Export to PDF/CSV
- [ ] Share templates with team (future)

### Scaling Considerations ✅
- [ ] Firestore indexes optimized for queries
- [ ] API rate limiting configured
- [ ] Cache strategy planned (next/image, CDN)
- [ ] Database backups automated
- [ ] Load testing done (if expecting >1000 users)

### Growth & Marketing ✅
- [ ] Landing page optimized for conversions
- [ ] SEO metadata in place
- [ ] Social media sharing buttons
- [ ] Email capture form (newsletter)
- [ ] Affiliate/referral program roadmapped

---

## Continuous (Ongoing)

### Weekly Tasks ✅
- [ ] Check deployment logs for errors
- [ ] Review Stripe dashboard for failed payments
- [ ] Monitor Firebase for auth issues
- [ ] Check Google AI quota usage
- [ ] Review user feedback/support requests

### Monthly Tasks ✅
- [ ] Analyze user retention metrics
- [ ] Review MRR (Monthly Recurring Revenue)
- [ ] Check database size (Firestore pricing)
- [ ] Security audit (dependencies, API keys)
- [ ] Update dependencies (`npm update`)
- [ ] Backup user data

### Quarterly Tasks ✅
- [ ] Review pricing strategy (too high? too low?)
- [ ] Plan feature roadmap based on user feedback
- [ ] Infrastructure scaling assessment
- [ ] Cost optimization review
- [ ] Competitor analysis

### Annually ✅
- [ ] Security audit by third party
- [ ] Architecture review and optimization
- [ ] User survey / NPS score
- [ ] Renewal of SSL certificates (auto on Vercel)
- [ ] Compliance check (GDPR, CCPA, etc.)

---

## 🎯 Deployment Success Criteria

**All green = READY TO SHIP ✅**

```
✅ npm run build passes (0 errors)
✅ All 12 env vars configured
✅ Local testing passed (auth + AI + payments)
✅ Vercel deployment successful
✅ Production testing passed
✅ Stripe webhook working
✅ Firebase auth functional
✅ Google AI generating content
✅ Git repo up to date
✅ No console errors in production
✅ Monitoring & alerts configured
✅ Team trained on monitoring/escalation
```

**When all boxes are checked, your LitLabs Web app is PRODUCTION READY and can handle real customers.**

---

## 🚨 Emergency Contacts

**If something breaks in production:**

1. **Deployment Issue:**
   - Check Vercel dashboard → Deployments → View build logs
   - Rollback to last working deployment if needed
   - Command: `vercel rollback` in CLI

2. **Payment Issue:**
   - Check Stripe dashboard → Events → View error logs
   - Check webhook delivery status
   - Verify webhook secret in `.env.local` matches Stripe dashboard

3. **Firebase Issue:**
   - Check Firebase Console → Functions → Logs
   - Verify credentials in `.env.local`
   - Check Firestore Rules aren't blocking reads/writes

4. **Google AI Issue:**
   - Check API key valid at aistudio.google.com
   - Check quota not exceeded (60 req/min free tier)
   - Try test request in browser DevTools console

5. **Immediate Action:**
   - Check error logs across all three services
   - Post message to #incidents channel
   - If payment system down: disable "Upgrade" button until fixed
   - Notify affected users via email

---

**Last Updated:** $(date)
**Project Status:** READY FOR PRODUCTION
**Next Review:** Weekly on Mondays
