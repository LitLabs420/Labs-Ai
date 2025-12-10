# 🚀 LitReeLab Studio - Quick Reference

## ⚡ Quick Commands

```powershell
# Start development
npm run dev
# Then open: http://localhost:3000

# Build for production
npm run build
npm start

# Check code quality
npm run lint
npm run typecheck

# Fix linting issues
npm run lint-fix
```

## 📋 Your Environment

- **App Name**: LitReeLab Studio
- **Workspace**: litreelabstudio
- **Development URL**: http://localhost:3000
- **Status**: ✅ Ready to use

## 🔑 Environment Variables You Need to Fill

In `.env.local`, replace these with your actual keys:

```dotenv
# Firebase (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY_HERE
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID_HERE
FIREBASE_PRIVATE_KEY=your_private_key_here

# Stripe (Required for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Google AI (Optional)
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_google_ai_key

# OpenAI (Optional)
OPENAI_API_KEY=your_openai_api_key_here

# Microsoft 365 (Optional)
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
MICROSOFT_TENANT_ID=your_tenant_id
```

## 🔗 Get Your API Keys

| Service | Link | Needed |
|---------|------|--------|
| Firebase | https://console.firebase.google.com/ | ✅ Required |
| Stripe | https://dashboard.stripe.com/apikeys | ✅ Required |
| Google AI | https://makersuite.google.com/app/apikey | ❌ Optional |
| OpenAI | https://platform.openai.com/api-keys | ❌ Optional |
| Azure / Microsoft | https://portal.azure.com/ | ❌ Optional |

## 📱 Deployment (No Custom Domain Needed)

### Option 1: Vercel (Easiest)
```powershell
npm install -g vercel
vercel
# Auto-generates: https://litreelabstudio.vercel.app
```

### Option 2: Docker
```powershell
docker build -t litreelabstudio .
docker run -p 3000:3000 --env-file .env.local litreelabstudio
```

### Option 3: VPS
See `LITREELABSTUDIO_SETUP_GUIDE.md` for full instructions

## ✅ What's Been Done

- ✅ Renamed from `labs-ai-studio` to `litreelabstudio`
- ✅ Removed all glamour references (none found)
- ✅ Configured localhost development
- ✅ All 731 dependencies installed
- ✅ 0 security vulnerabilities
- ✅ Production build verified
- ✅ Full setup guide created

## 🎯 Your Next Steps

1. **Fill in `.env.local`** with your API keys
2. **Run**: `npm run dev`
3. **Visit**: http://localhost:3000
4. **Test** the application
5. **Deploy** to Vercel or your preferred hosting

## 📚 Full Documentation

See: `LITREELABSTUDIO_SETUP_GUIDE.md` for:
- Detailed Firebase setup
- Stripe webhook testing
- Vercel deployment
- Docker containerization
- VPS self-hosting
- Troubleshooting

## 🆘 Common Issues

**Port 3000 in use?**
```powershell
npm run dev -- -p 3001
```

**Firebase not connecting?**
- Check `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is correct
- Verify API key in Firebase Console

**Stripe webhooks failing?**
- Install Stripe CLI
- Run: `stripe listen --forward-to http://localhost:3000/api/webhooks/stripe`

## 📞 Support

- GitHub: https://github.com/LitLabs420/Labs-Ai
- Firebase: https://firebase.google.com/support
- Stripe: https://support.stripe.com
- Next.js: https://nextjs.org/docs

---

**Status**: ✅ Ready to Code
**Last Updated**: December 10, 2025
