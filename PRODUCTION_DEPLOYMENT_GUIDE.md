# 🚀 Production Deployment Guide - Labs-Ai-Studio

## ✅ Pre-Deployment Checklist

### 1. Build Verification
- [x] Production build completes successfully (`npm run build`)
- [x] All TypeScript types valid
- [x] No Firebase client SDK in server routes
- [x] All API routes use Admin SDK
- [x] Rate limiting configured
- [x] Webhook signature verification enabled

### 2. Security Hardening
- [x] Firebase Admin SDK lazy initialization
- [x] Zod validation on all API inputs
- [x] Stripe webhook signature verification
- [x] Admin verification route protected
- [x] Guardian AI security bot active
- [x] Server-side auth with Firebase Admin

### 3. Environment Variables Required

#### Firebase Client (Public)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

#### Firebase Admin (Server-only - CRITICAL)
```bash
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY  # Must escape \n as \\n in JSON or use multiline
```

**How to get Admin credentials:**
1. Go to Firebase Console → Project Settings
2. Service Accounts tab
3. Click "Generate new private key"
4. Extract `project_id`, `client_email`, `private_key` from JSON

#### Stripe (Required for payments)
```bash
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Create Stripe products & prices:**
- Starter: $29/mo
- Creator: $79/mo
- Pro: $149/mo
- Agency: $299/mo
- Education: $49/mo

#### AI Services
```bash
GOOGLE_GENERATIVE_AI_API_KEY
OPENAI_API_KEY
```

#### Admin Access
```bash
NEXT_PUBLIC_ADMIN_UID  # Your Firebase user UID
NEXT_PUBLIC_ADMIN_EMAIL
```

#### Optional Services
```bash
RESEND_API_KEY  # Email service
NEXT_PUBLIC_RECAPTCHA_SITE_KEY  # Bot protection
```

---

## 🎯 Deployment Steps

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login**
```bash
vercel login
```

3. **Deploy**
```bash
vercel --prod
```

4. **Set Environment Variables**
```bash
# In Vercel Dashboard → Settings → Environment Variables
# Add all variables from .env.production.template
# Ensure FIREBASE_PRIVATE_KEY is properly escaped
```

5. **Configure Stripe Webhooks**
```
Webhook URL: https://yourdomain.com/api/webhooks/stripe
Events: checkout.session.completed, customer.subscription.updated, invoice.payment_failed
```

### Option 2: Docker

1. **Build Image**
```bash
docker build -t labs-ai-studio .
```

2. **Run Container**
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_FIREBASE_API_KEY=xxx \
  -e FIREBASE_PROJECT_ID=xxx \
  -e FIREBASE_CLIENT_EMAIL=xxx \
  -e FIREBASE_PRIVATE_KEY="$(cat private-key.txt)" \
  labs-ai-studio
```

### Option 3: Self-Hosted

1. **Build for production**
```bash
npm run build
```

2. **Start server**
```bash
npm start
```

3. **Use PM2 for process management**
```bash
npm i -g pm2
pm2 start npm --name "labs-ai" -- start
pm2 save
pm2 startup
```

---

## 🔍 Post-Deployment Verification

### 1. Health Checks
```bash
# Home page
curl https://yourdomain.com/

# API health
curl https://yourdomain.com/api/verify-admin
```

### 2. Test Core Features
- [ ] User signup/login
- [ ] AI content generation
- [ ] Stripe checkout
- [ ] Webhook processing
- [ ] Admin dashboard access
- [ ] Template marketplace
- [ ] Analytics tracking

### 3. Monitor Logs
```bash
# Vercel
vercel logs

# PM2
pm2 logs labs-ai

# Docker
docker logs <container_id>
```

### 4. Security Scan
- [ ] SSL certificate valid
- [ ] HTTPS enforced
- [ ] CSP headers configured
- [ ] CORS properly restricted
- [ ] Rate limiting active
- [ ] Webhook signatures verified

---

## 🛠️ Troubleshooting

### Firebase Admin "No Firebase App" Error
**Cause:** Missing or invalid Admin SDK credentials

**Fix:**
```bash
# Verify env vars are set
echo $FIREBASE_PROJECT_ID
echo $FIREBASE_CLIENT_EMAIL
echo $FIREBASE_PRIVATE_KEY | head -c 50

# Ensure private key has proper line breaks
# In .env: FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYour\\nKey\\n-----END PRIVATE KEY-----\\n"
```

### Stripe Webhook Signature Verification Failed
**Cause:** Wrong webhook secret or signature

**Fix:**
1. Get webhook secret from Stripe Dashboard
2. Update `STRIPE_WEBHOOK_SECRET` env var
3. Ensure raw body is passed to `stripe.webhooks.constructEvent()`

### Build Fails with Type Errors
**Cause:** TypeScript strict mode issues

**Fix:**
```bash
# Clean build cache
rm -rf .next node_modules/.cache

# Reinstall dependencies
npm ci

# Rebuild
npm run build
```

### Rate Limiting Not Working
**Cause:** In-memory store doesn't persist across serverless functions

**Solution:** Use Redis for production
```bash
# Add Redis URL to env
REDIS_URL=redis://your-redis-host:6379

# Update lib/rateLimiter.runtime.js to use Redis
```

---

## 📊 Monitoring Setup

### Error Tracking (Sentry)
```bash
npm install @sentry/nextjs

# Add to next.config.ts
import { withSentryConfig } from '@sentry/nextjs';

# Set SENTRY_DSN env var
```

### Analytics (Vercel Analytics)
Already integrated via `@vercel/analytics`

### Performance (Vercel Speed Insights)
Already integrated via `@vercel/speed-insights`

### Uptime Monitoring
- Use UptimeRobot or Pingdom
- Monitor: `/`, `/api/verify-admin`
- Alert on 5xx errors or downtime

---

## 🔐 Security Best Practices

1. **Never commit `.env.local`** to git
2. **Rotate API keys quarterly**
3. **Use least-privilege IAM roles**
4. **Enable Firebase App Check** in production
5. **Set up WAF rules** (Cloudflare/Vercel)
6. **Implement CSP headers** via next.config.ts
7. **Enable DNSSEC** on your domain
8. **Use Dependabot** for security updates

---

## 📈 Scaling Considerations

### Performance Optimization
- Enable Vercel Edge Functions for auth endpoints
- Use Redis for rate limiting and session storage
- Implement CDN caching for static assets
- Lazy load large components
- Optimize images with next/image

### Database
- Add Firestore indexes for common queries
- Implement pagination for large collections
- Use Firestore bundles for initial data
- Consider read replicas for analytics

### Cost Management
- Monitor Vercel function execution time
- Set up billing alerts in Firebase/Stripe
- Implement aggressive caching
- Use Vercel Edge Config for feature flags

---

## ✅ Launch Checklist

- [ ] All env vars configured in production
- [ ] Firebase Admin credentials valid
- [ ] Stripe products and webhooks set up
- [ ] DNS records pointing to deployment
- [ ] SSL certificate active
- [ ] Admin account created and tested
- [ ] Payment flow tested end-to-end
- [ ] AI features generating content
- [ ] Email notifications working
- [ ] Monitoring and alerts configured
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Team trained on admin tools

---

## 🆘 Support

**Issues?** Check these files:
- `TROUBLESHOOTING.md` - Common issues
- `SECURITY_AUDIT_RESULTS.md` - Security status
- `LAUNCH_READY_CHECKLIST.md` - Pre-launch items

**Need help?**
- Firebase: https://firebase.google.com/support
- Stripe: https://support.stripe.com
- Vercel: https://vercel.com/support

---

**Last Updated:** December 3, 2025  
**Build Status:** ✅ Production Ready  
**Version:** 1.0.0
