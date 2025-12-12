# 🚀 Deployment & Configuration Guide

## Quick Start (5 Steps to Live)

### Step 1: Setup Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products**
3. Create 6 products (Free, Starter, Creator, Pro, Agency, Education)

**Monthly Pricing:**

- Free: $0/month
- Starter: $19/month
- Creator: $49/month
- Pro: $99/month
- Agency: $299/month
- Education: $0/month

1. For each product, create monthly price
2. Copy price IDs (price_*) into `.env.local`

### Step 2: Update Environment Variables

Create `.env.local` and add:

```bash
# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Stripe Price IDs (from Step 1)
STRIPE_PRICE_FREE=price_xxx_free
STRIPE_PRICE_STARTER=price_xxx_starter
STRIPE_PRICE_CREATOR=price_xxx_creator
STRIPE_PRICE_PRO=price_xxx_pro
STRIPE_PRICE_AGENCY=price_xxx_agency
STRIPE_PRICE_EDUCATION=price_xxx_education

# Google AI
GOOGLE_GENERATIVE_AI_API_KEY=YOUR_GOOGLE_API_KEY

# OpenAI (optional)
OPENAI_API_KEY=sk-YOUR_OPENAI_KEY

# Firebase
FIREBASE_PROJECT_ID=your-project
FIREBASE_ADMIN_PRIVATE_KEY=YOUR_PRIVATE_KEY
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-admin@your-project.iam.gserviceaccount.com

# Security
INTERNAL_WEBHOOK_SECRET=generate-random-secret-key
JWT_SECRET=generate-random-jwt-secret

# App URLs
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### Step 3: Setup Stripe Webhooks

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-domain.com/api/stripe-webhook`
4. Events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### Step 4: Build & Test Locally

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your keys

# Build project
npm run build

# Run locally
npm run dev

# Test endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/monetization/dashboard -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Step 5: Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "Add monetization system"
git push origin main

# Deploy to Vercel
# Option 1: via Vercel Dashboard
# - Connect GitHub repo
# - Set environment variables
# - Deploy

# Option 2: via CLI
npm i -g vercel
vercel
# Follow prompts, set environment variables

# Verify deployment
curl https://your-domain.com/api/health
```

---

## Configuration Files

### Key Endpoints to Test

#### 1. Health Check

```bash
GET /api/health
# Should return all services: firebase ✓, googleAI ✓, stripe ✓, etc.
```

#### 2. Create Team

```bash
POST /api/teams/members/add
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "email": "teammate@example.com",
  "role": "member"
}
```

#### 3. Affiliate Registration

```bash
POST /api/affiliates/register
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "payoutMethod": "stripe",
  "stripeConnectId": "acct_xxxxx"
}
```

#### 4. Get Monetization Dashboard

```bash
GET /api/monetization/dashboard
Authorization: Bearer {JWT_TOKEN}
```

#### 5. Submit Task

```bash
POST /api/tasks/submit
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "taskType": "ai_generation",
  "payload": {
    "prompt": "Write a caption about coffee",
    "contentType": "social_media"
  }
}
```

---

## NATS Setup (Optional but Recommended)

### Deploy NATS Server

#### Option 1: Docker

```bash
docker run -p 4222:4222 -p 8222:8222 nats:latest -js
```

#### Option 2: Cloud (NATS Cloud)

1. Go to [NATS Cloud](https://www.nats.io/nats-cloud/)
2. Create account
3. Get connection string
4. Set `NATS_URL` in `.env.local`

#### Option 3: Self-hosted

```bash
# Download and run NATS
wget https://github.com/nats-io/nats-server/releases/download/v2.10.0/nats-server-v2.10.0-linux-amd64.zip
unzip nats-server-v2.10.0-linux-amd64.zip
./nats-server -js
```

**Test NATS Connection:**

```typescript
import { initializeNATSConsumer } from '@/lib/nats-consumer';

// In your server initialization
await initializeNATSConsumer();
console.log('NATS consumer ready');
```

---

## Advanced Configuration

### 1. Email Service (Resend)

```bash
# Get API key from https://resend.com
RESEND_API_KEY=re_xxxxx
```

### 2. Sentry Error Tracking

```bash
# Get from https://sentry.io
SENTRY_DSN=https://key@sentry.io/projectid
SENTRY_ENVIRONMENT=production
```

### 3. Custom Domain for White-Label

1. Update DNS records (CNAME)
2. Create white-label config via API
3. Verify domain ownership

### 4. Stripe Connect for Affiliates

1. Create Stripe Connect account
2. Get `STRIPE_CONNECT_CLIENT_ID`
3. Setup affiliate onboarding flow

### 5. Google Cloud Console

1. Create Google Cloud project
2. Enable Generative AI API
3. Create API key
4. Set quota limits

---

## Monitoring & Logging

### 1. Health Checks

Setup endpoint monitoring:

```bash
# Vercel Cron (optional)
# runs every hour
GET /api/health
```

### 2. Stripe Webhook Logs

Monitor in Stripe Dashboard:

- Developers > Webhooks > Endpoint Details
- View logs and retry failed webhooks

### 3. Firebase Logs

```bash
# View Firestore operations
firebase emulators:start --import=./backup

# Enable detailed logging
NEXT_DEBUG=* npm run dev
```

### 4. Error Tracking

In Sentry:

- Issues > Errors
- Performance > Transactions
- Release health

---

## Security Checklist

- [ ] All environment variables set
- [ ] Stripe webhook secret configured
- [ ] JWT secret generated (32+ chars)
- [ ] Internal webhook secret generated
- [ ] Firebase security rules deployed
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] HTTPS enforced
- [ ] API keys rotated
- [ ] Sensitive logs masked

---

## Troubleshooting

### Stripe Checkout Fails

1. Check price IDs match `.env.local`
2. Verify API keys are active
3. Check webhook endpoint configured
4. Look at Stripe Dashboard > Events

### Affiliate Payouts Don't Work

1. Verify Stripe Connect account
2. Check payout method configured
3. Ensure minimum threshold ($100) met
4. Check bank account verified in Stripe

### Team Members Can't Access

1. Verify subscription tier allows team
2. Check member role permissions
3. Verify email invitation sent
4. Check Firestore rules allow access

### NATS Consumer Not Processing

1. Verify NATS server running
2. Check connection string in `.env.local`
3. Look at NATS logs
4. Verify JetStream enabled

### Analytics Not Recording

1. Verify `trackUserInsights` called
2. Check Firestore collection exists
3. Verify user has analytics permission
4. Check date format (YYYY-MM-DD)

---

## Performance Tuning

### 1. Database Indexes

Firestore automatically creates indexes for:

- `users` collection
- `affiliates` collection
- `referrals` collection

Add custom indexes if needed:

```firestore
collection: users
  index: tier, createdAt DESC
  
collection: referrals
  index: affiliateUserId, status, createdAt DESC
```

### 2. Caching

Implement Redis caching:

```typescript
// Cache subscription data for 1 hour
const cachedSub = await redis.get(`sub:${userId}`);
if (!cachedSub) {
  const sub = await getUserSubscription(userId);
  await redis.set(`sub:${userId}`, JSON.stringify(sub), 'EX', 3600);
}
```

### 3. CDN Configuration

Configure Vercel Edge Caching:

```javascript
// next.config.ts
const headers = async () => [
  {
    source: '/api/monetization/:path*',
    headers: [
      { key: 'Cache-Control', value: 'max-age=300' }
    ]
  }
];
```

---

## Scaling Considerations

### 1. Database Growth

- Implement data archiving after 1 year
- Use Firestore partitioning for large collections
- Monitor database size

### 2. API Traffic

- Enable API key rate limiting
- Use Vercel Functions for horizontal scaling
- Setup load balancing

### 3. Task Processing

- Scale NATS consumers horizontally
- Implement job queues for heavy tasks
- Use background processing

### 4. Analytics Storage

- Archive old analytics data
- Use BigQuery for historical analysis
- Implement data cleanup policies

---

## Maintenance Schedule

### Daily
- Monitor error rates in Sentry
- Check Stripe webhook logs
- Verify health checks passing

### Weekly
- Review analytics dashboard
- Check affiliate payments
- Update security patches

### Monthly
- Analyze user cohorts
- Review API performance
- Cleanup old data
- Update documentation

### Quarterly
- Security audit
- Capacity planning
- Cost optimization
- Feature review

---

## Helpful Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [NATS Documentation](https://docs.nats.io)
- [Vercel Documentation](https://vercel.com/docs)
- [Google AI Documentation](https://ai.google.dev)
- [OpenAI Documentation](https://platform.openai.com/docs)

---

## Support Contacts

- **Stripe Support:** [https://support.stripe.com](https://support.stripe.com)
- **Firebase Support:** [https://firebase.google.com/support](https://firebase.google.com/support)
- **NATS Community:** [https://nats.io/community](https://nats.io/community)
- **GitHub Issues:** Create issue in LitLabs repository

---

**Last Updated:** January 2024
**Status:** ✅ Ready for Deployment
