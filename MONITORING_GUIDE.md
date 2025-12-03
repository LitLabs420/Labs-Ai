# 🔧 Monitoring & Observability Guide

## Overview
LitLabs OS includes comprehensive monitoring, error tracking, and uptime capabilities.

---

## 🚨 Error Tracking (Sentry)

### Setup
1. Sign up at [sentry.io](https://sentry.io)
2. Create a new Node.js project
3. Copy your DSN
4. Add to Vercel environment variables:
   ```
   SENTRY_DSN=https://your-key@sentry.io/your-project-id
   ```

### What Gets Tracked
- ✅ Server-side exceptions in API routes
- ✅ Client-side JavaScript errors
- ✅ Unhandled promise rejections
- ✅ Performance metrics (traces)

### Usage in Code
```typescript
import { captureError, captureMessage } from '@/lib/sentry';

try {
  // Your code
} catch (error) {
  captureError(error, { userId: user.uid, action: 'checkout' });
  throw error;
}

// Or log info/warnings
captureMessage('User upgraded to Pro', 'info');
```

---

## 📊 System Monitoring

### Built-in Endpoints

#### Health Check
```bash
GET /api/health
```
Returns: `{ status: 'ok', time: '2025-12-03T...' }`

**Use for**: Simple uptime pings

#### Uptime Monitor
```bash
GET /api/monitoring/uptime
```
Returns:
```json
{
  "timestamp": "2025-12-03T...",
  "status": "operational",
  "responseTime": 45,
  "services": {
    "database": "operational",
    "api": "operational"
  }
}
```

**Use for**: Detailed health with response times

#### System Metrics
```bash
GET /api/monitoring/metrics
```
Returns:
```json
{
  "users": {
    "total": 150,
    "dailyActive": 42,
    "byTier": { "free": 100, "pro": 40, "deluxe": 10 }
  },
  "revenue": {
    "weekly": 4950,
    "monthlyProjected": 21214
  },
  "activity": {
    "last24h": 1250
  }
}
```

**Use for**: Business metrics and dashboards

---

## 📱 Status Page

### Public Status Page
Visit: `/status`

Features:
- Real-time service status
- Response time monitoring
- Auto-refreshes every 30 seconds
- Mobile responsive

### Embed Status Badge
```html
<iframe src="https://yourdomain.com/status" width="300" height="100"></iframe>
```

---

## 🔔 External Monitoring Setup

### Uptime Robot (Free)
1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add new monitor:
   - Type: HTTP(s)
   - URL: `https://yourdomain.com/api/health`
   - Interval: 5 minutes
3. Add alert contacts (email, Slack, Discord)

### Pingdom
1. Create account at [pingdom.com](https://pingdom.com)
2. Add uptime check:
   - URL: `https://yourdomain.com/api/monitoring/uptime`
   - Check interval: 1 minute
   - Response validation: JSON `"status": "operational"`

### Better Uptime
1. Sign up at [betteruptime.com](https://betteruptime.com)
2. Create HTTP monitor
3. URL: `https://yourdomain.com/api/health`
4. Expected status: 200
5. Configure incident notifications

---

## 📈 Vercel Analytics

### Built-in (Already Enabled)
- Page views
- Unique visitors
- Web Vitals (LCP, FID, CLS)
- Real-time data

View in: Vercel Dashboard → Analytics

### Speed Insights (Already Enabled)
- Core Web Vitals tracking
- Performance scoring
- Real user monitoring

---

## 🔍 Monitoring Dashboard

### Internal Dashboard
Visit: `/dashboard/monitoring`

Shows:
- System status
- Total users
- Daily active users
- Revenue metrics (weekly, MRR)
- User tier distribution
- 24h activity events

**Admin only** - requires authentication

---

## 🚀 Performance Monitoring

### Response Times
Tracked automatically by `/api/monitoring/uptime`

### Database Queries
Firebase console automatically tracks:
- Read/write operations
- Query performance
- Connection health

### API Latency
Check Vercel logs:
```bash
vercel logs --follow
```

---

## 🛠️ Debugging Production Issues

### Check Sentry
1. Go to Sentry dashboard
2. View recent errors
3. See stack traces + context
4. Filter by user, URL, or error type

### Check Vercel Logs
```bash
# Real-time logs
vercel logs --follow

# Last 100 lines
vercel logs --limit 100

# Filter by route
vercel logs | grep "/api/checkout"
```

### Check Firebase Console
1. Go to Firebase console
2. Firestore → Usage tab
3. Authentication → Users
4. Storage → Files

### Check Stripe Dashboard
1. Payments → View all payments
2. Webhooks → See delivery attempts
3. Logs → Filter by endpoint

---

## 📊 Key Metrics to Monitor

### Daily
- [ ] Uptime percentage (target: >99.5%)
- [ ] Error rate (target: <0.1%)
- [ ] Response time (target: <200ms)
- [ ] New signups
- [ ] Daily active users

### Weekly
- [ ] MRR growth
- [ ] Churn rate
- [ ] Conversion rate (free → paid)
- [ ] Customer support tickets
- [ ] Failed payment rate

### Monthly
- [ ] Total revenue
- [ ] Customer lifetime value (LTV)
- [ ] Customer acquisition cost (CAC)
- [ ] Net Promoter Score (NPS)

---

## 🚨 Alert Configuration

### Critical Alerts (Immediate)
- Site down (>5 min)
- Database connection lost
- Payment processing failure
- Error rate spike (>1%)

### Warning Alerts (Within 1 hour)
- Response time >500ms
- Failed webhook deliveries
- High memory usage
- Unusual traffic spike

### Info Alerts (Daily digest)
- New user signups
- Revenue milestones
- Feature usage stats

---

## 🔐 Security Monitoring

### Automated via GUARDIAN Bot
- Suspicious login attempts
- Failed payment patterns
- Unusual API usage
- Multiple failed auth attempts

Check: `/dashboard/security`

---

## 📝 Maintenance Windows

When performing updates:

1. Post notice on status page
2. Schedule during low-traffic hours (2-4 AM)
3. Monitor error rates after deploy
4. Keep rollback plan ready
5. Test critical paths (auth, payment, AI)

---

## 🆘 Incident Response

### Step 1: Detect
- Alert received (email/Slack/SMS)
- User reports issue
- Monitoring dashboard shows problem

### Step 2: Assess
- Check `/status` page
- Review recent deploys
- Check Sentry for new errors
- Check Vercel logs

### Step 3: Respond
- If critical: rollback deploy immediately
- If degraded: apply hotfix
- Update status page with details

### Step 4: Communicate
- Post incident update on status page
- Email affected users if needed
- Share ETA for resolution

### Step 5: Resolve
- Deploy fix
- Verify metrics return to normal
- Mark incident as resolved

### Step 6: Post-Mortem
- Document what happened
- Identify root cause
- Create tasks to prevent recurrence

---

## 🎯 Monitoring Checklist

### Setup (One-time)
- [x] Sentry DSN configured
- [ ] Uptime Robot monitor added
- [ ] Vercel Analytics enabled
- [ ] Stripe webhook monitoring
- [ ] Slack alerts configured

### Daily Checks
- [ ] Check `/status` page
- [ ] Review Sentry errors
- [ ] Check MRR dashboard
- [ ] Verify webhook deliveries

### Weekly Reviews
- [ ] Review uptime report
- [ ] Analyze error trends
- [ ] Check performance metrics
- [ ] Review user feedback

---

## 📞 Support

- Sentry: [docs.sentry.io](https://docs.sentry.io)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Firebase: [firebase.google.com/docs](https://firebase.google.com/docs)

---

**Your monitoring stack is production-ready!** 🚀
