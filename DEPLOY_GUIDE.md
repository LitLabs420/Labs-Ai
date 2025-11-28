# 🚀 GLAMFLOW AI - Quick Deployment Guide

## Your System is LIVE ✅

**Project URL:** https://studio-4627045237-a2fe9.web.app
**GitHub Repo:** https://github.com/LiTree89/glamflow-ai
**Stripe Webhook:** Active & Processing

---

## 📦 Deploy Changes (2 commands)

### When you make changes locally:

```powershell
# 1. Commit to GitHub
git add .
git commit -m "Your change description"
git push

# 2. Deploy to Firebase
firebase deploy --only hosting,functions --force
```

That's it! Your changes are live.

---

## ✅ What's Already Done

- ✅ Firebase hosting configured
- ✅ Cloud Functions deployed (6 functions)
- ✅ Stripe webhook live
- ✅ Email automation ready
- ✅ GitHub synced
- ✅ CI/CD workflow ready

---

## 🔑 Key Commands

| Command | What it does |
|---------|------------|
| `firebase deploy` | Deploy everything |
| `firebase deploy --only hosting` | Deploy frontend only |
| `firebase deploy --only functions` | Deploy backend only |
| `firebase logs --only functions` | View Cloud Functions logs |
| `git push` | Sync to GitHub |

---

## 🛠️ Your Payment System

**Live Endpoints:**
- Webhook: `https://us-central1-studio-4627045237-a2fe9.cloudfunctions.net/handleStripeWebhook`
- Checkout: `createCheckoutSession` function
- Portal: `createPortalSession` function

**Email:** Confirmation emails send automatically on signup + payment

**Referrals:** 20% commission auto-credited to affiliates

---

## 📊 Monitor Your System

Check real-time data:
- **Firebase Console:** https://console.firebase.google.com/project/studio-4627045237-a2fe9
- **Stripe Dashboard:** https://dashboard.stripe.com
- **GitHub Actions:** https://github.com/LiTree89/glamflow-ai/actions
- **Cloud Logs:** `firebase logs --only functions`

---

## 🎯 You're Production Ready!

Make changes → Git push → Firebase deploy → Live

Repeat as needed. That's your entire workflow.

Questions? Check the Firebase/Stripe dashboards—they show everything.
