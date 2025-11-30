# 🔧 Litree Web - Troubleshooting Guide

## Common Issues & Solutions

### Build & Deployment Issues

#### ❌ "Error: Cannot find module 'firebase'"
**Cause:** Dependencies not installed
**Fix:**
```bash
npm install
npm install firebase stripe @stripe/react-stripe-js
npm run build
```

#### ❌ "Module not found: Can't resolve '@/lib/firebase'"
**Cause:** TypeScript path alias not recognized
**Fix:**
- Check `tsconfig.json` has `"@/*": ["./*"]` in paths
- Restart dev server: `npm run dev`

#### ❌ "Build fails: Expected ','" (TypeScript error)
**Cause:** Syntax error in .tsx or .ts file
**Fix:**
```bash
npm run build 2>&1 | grep error
# Fix the reported line, then:
npm run build
```

#### ❌ "Port 3000 already in use"
**Cause:** Another process using port 3000
**Fix (Windows PowerShell):**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
npm run dev
```

#### ❌ "Vercel deployment fails with 'Build failed'"
**Cause:** Environment variables missing or build error
**Fix:**
1. Check Vercel dashboard → Settings → Environment Variables
   - Should have all 12 variables
   - Verify no typos
2. Check deployment logs for exact error
3. Run `npm run build` locally to reproduce error
4. Push fix to GitHub and redeploy

---

### Authentication Issues

#### ❌ "Firebase error: Invalid API Key"
**Cause:** Wrong credentials in `.env.local`
**Fix:**
1. Go to Firebase Console → Settings → Project Settings
2. Copy exact values:
   - `NEXT_PUBLIC_FIREBASE_API_KEY` (labeled "Web API Key")
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` (looks like `project.firebaseapp.com`)
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (your project ID)
3. Paste into `.env.local`
4. Restart dev server: `npm run dev`

#### ❌ "Sign up fails silently"
**Cause:** Email/password weak or Firebase Email Auth disabled
**Fix:**
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Email/Password"
3. Test with:
   - Email: `test@example.com`
   - Password: `Test123!` (min 6 chars)

#### ❌ "Login works but Dashboard shows 'Loading...'"
**Cause:** Firestore rules blocking reads or user document missing
**Fix:**
1. In Firebase Console → Firestore → Rules, replace with:
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
2. Click "Publish"
3. Refresh dashboard page

#### ❌ "Cannot read property 'uid' of null" in console
**Cause:** Firebase not initialized or user not authenticated
**Fix:**
- Check `lib/firebase.ts` exports `auth` and `db`
- Check `.env.local` has all 6 Firebase variables
- Check user actually logged in (not redirected to auth page)

---

### Payment Issues

#### ❌ "Stripe error: Cannot find price ID"
**Cause:** NEXT_PUBLIC_STRIPE_*_PRICE_ID not set or wrong
**Fix:**
1. Go to Stripe Dashboard → Products
2. For each product (Basic, Pro, Deluxe), click it
3. Click the price (e.g., "$49/month")
4. Copy the "Price ID" (looks like `price_1ABC123...`)
5. Set in `.env.local`:
   ```
   NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_xxx
   NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_yyy
   NEXT_PUBLIC_STRIPE_DELUXE_PRICE_ID=price_zzz
   ```
6. Restart dev server

#### ❌ "Stripe checkout redirects to empty page"
**Cause:** Missing redirect URL configuration
**Fix:**
- Check `NEXT_PUBLIC_APP_URL` is set in `.env.local`
- Local: `http://localhost:3000`
- Production: `https://yourdomain.com`
- Stripe knows where to redirect after payment

#### ❌ "Test payment succeeds locally but not in production"
**Cause:** Using test API keys in production
**Fix:**
1. If going live, get LIVE keys from Stripe (not test keys)
2. Live keys start with `pk_live_` and `sk_live_`
3. Set `STRIPE_SECRET_KEY` in Vercel environment variables
4. Redeploy: `vercel --prod`

#### ❌ "Payment succeeds in Stripe but webhook not received"
**Cause:** Webhook endpoint not configured or secret wrong
**Fix:**
1. Go to Stripe Dashboard → Webhooks
2. Add new endpoint:
   - Endpoint URL: `https://yourdomain.com/api/stripe-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
   - Copy "Signing Secret" (starts with `whsec_`)
3. Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_xxx`
4. Redeploy to Vercel
5. Test payment again

#### ❌ "Webhook receives event but Firestore not updated"
**Cause:** Firestore integration not implemented yet
**Fix:**
- This is expected! Look at `app/api/stripe-webhook/route.ts`
- Lines ~50-80 have TODO comments
- Phase 2 will implement Firestore user tier updates
- For now, just verify webhook receives events (check Vercel logs)

#### ❌ "Can't test payments locally (need public HTTPS)"
**Cause:** Stripe webhooks need public HTTPS URL, but localhost is local
**Fix:**
```bash
# Option A: Use ngrok to expose local server
npm install -g ngrok
npm run dev  # Terminal 1
ngrok http 3000  # Terminal 2, copy https://abc123.ngrok.io

# Then in Stripe Webhooks:
# URL: https://abc123.ngrok.io/api/stripe-webhook

# Option B: Deploy to Vercel for testing
vercel --prod
# Use Vercel URL in Stripe webhooks
```

---

### AI Generation Issues

#### ❌ "Google AI error: 403 Forbidden"
**Cause:** API key invalid or lacks permissions
**Fix:**
1. Go to https://aistudio.google.com
2. Left sidebar: "Get API Key"
3. Click "Create new secret key"
4. Copy full key: `AIza...` (starts with `AIza`)
5. Set `GOOGLE_AI_STUDIO_API_KEY=AIza...` in `.env.local`
6. Restart dev server

#### ❌ "AI button clicked but no response appears"
**Cause:** API call failing silently
**Fix:**
1. Open DevTools → Console
2. Look for red error messages
3. Check Network tab → `/api/ai-chat`
4. Click response → look for error message
5. If 500 error: check `.env.local` has GOOGLE_AI_STUDIO_API_KEY
6. If quota exceeded: wait 1 minute (free tier: 60 req/min)

#### ❌ "Google AI API error: 'model not found'"
**Cause:** API endpoint wrong or model name wrong
**Fix:**
- Check `app/api/ai-chat/route.ts` line ~45
- Should be: `gemini-1.5-pro` (not `gemini-pro` or other variants)
- If different model, update line 45 and redeploy

#### ❌ "Content generation takes >30 seconds"
**Cause:** Google AI API slow or network latency
**Fix:**
- Normal: 5-15 seconds for response
- If >30s: might be cold start on Vercel
- Try again: usually faster on second request
- Check Google Cloud Console for API quota/rate limits

---

### Frontend/UI Issues

#### ❌ "Dashboard button clicks don't do anything"
**Cause:** Component not rendering or event handler missing
**Fix:**
1. Open DevTools → Console
2. Any red errors? Fix them first
3. Check `components/DashboardShell.tsx` — buttons have onClick handlers
4. If still broken, check Network tab for API errors
5. Restart dev server: `npm run dev`

#### ❌ "Styling looks broken (colors wrong, layout messy)"
**Cause:** Tailwind CSS not compiled or cache issue
**Fix:**
```bash
npm run build
npm run dev
# If still broken:
rm -r .next
npm run dev
```

#### ❌ "Mobile version looks broken"
**Cause:** Tailwind responsive classes not applied
**Fix:**
- Check `app/layout.tsx` and `components/DashboardShell.tsx`
- All components use `md:` and `sm:` breakpoints
- In browser: Open DevTools → Device Toolbar → Toggle to mobile
- If broken: might be caching issue
  ```bash
  rm -r .next
  npm run build
  ```

#### ❌ "Signup form submit button disabled"
**Cause:** Form validation failing or missing email
**Fix:**
1. Check email field is filled
2. Check password is 6+ characters
3. Check network connection working
4. Try test email: `test@example.com` password: `Test123!`
5. Check console for error messages

---

### Firestore & Database Issues

#### ❌ "Error: No default Firestore instance"
**Cause:** Firebase not initialized or env vars wrong
**Fix:**
1. Check `lib/firebase.ts` creates firestore instance
2. Check `.env.local` has all 6 Firebase variables
3. Restart dev server
4. Check Firebase Console → Project Settings → credentials match

#### ❌ "Firestore document not saving"
**Cause:** Security rules blocking write or code not implemented yet
**Fix:**
- Phase 1 (current): Stripe webhook receives events but doesn't save to Firestore yet
- Phase 2: Will implement `db.collection('users').doc(uid).update({...})`
- Check `app/api/stripe-webhook/route.ts` line 60+ for TODO

#### ❌ "Cannot read user data in dashboard"
**Cause:** Firestore not set up or rules blocking reads
**Fix:**
1. Go to Firebase Console → Firestore → Rules
2. Ensure rules allow authenticated users to read/write their own documents:
   ```
   match /users/{uid} {
     allow read, write: if request.auth.uid == uid;
   }
   ```
3. Test document exists: Firebase Console → Firestore → Collections → users → View documents

---

### Deployment & Production Issues

#### ❌ "Production: 'Cannot GET /dashboard'"
**Cause:** Route doesn't exist or auth gate broken
**Fix:**
1. Check `app/dashboard/page.tsx` exists
2. Check `npm run build` passes locally
3. Check logs: Vercel Dashboard → Deployments → View Logs
4. Redeploy: `git push origin main` (auto-deploys if GitHub connected)

#### ❌ "Production: Payment button redirects to 404"
**Cause:** API route not deployed or env vars missing in production
**Fix:**
1. Check Vercel environment variables:
   - Dashboard → Settings → Environment Variables
   - Must have: STRIPE_SECRET_KEY, all 3 NEXT_PUBLIC_STRIPE_*_PRICE_ID
2. Check `app/api/create-checkout-session/route.ts` deployed:
   - Vercel Dashboard → Functions → View function should show route
3. Redeploy: `vercel --prod`

#### ❌ "503 Service Unavailable on production"
**Cause:** Vercel serverless function timeout or too many requests
**Fix:**
1. Check Vercel Dashboard → Function Performance
2. Are there timeouts? If yes: optimize code (API calls too slow)
3. Check Stripe/Firebase/Google AI status pages for outages
4. Restart functions: Vercel Dashboard → Redeploy

#### ❌ "Vercel build succeeds but app is blank/white screen"
**Cause:** Runtime error or missing dependencies
**Fix:**
1. Check browser console for errors: DevTools → Console
2. Check Vercel Function Logs: Dashboard → Functions → Logs
3. Most likely: missing env var in Vercel environment
4. Add missing var and redeploy

---

### Git & Version Control Issues

#### ❌ "git push rejected: 'would overwrite working tree'"
**Cause:** Remote changes differ from local
**Fix:**
```bash
git fetch origin
git merge origin/main
git push origin main
```

#### ❌ ".env.local keeps getting committed (showing in git)"
**Cause:** `.gitignore` not working
**Fix:**
```bash
# Remove from git history
git rm --cached .env.local
git commit -m "Remove .env.local from git"

# Ensure .gitignore has:
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "Ignore .env.local"
git push origin main
```

#### ❌ "Can't remember which commit broke things"
**Cause:** Too many commits, need to find which one
**Fix:**
```bash
git log --oneline  # See all commits
git revert <commit-hash>  # Revert specific commit
git push origin main
```

---

## 🚨 Emergency Recovery

### If Production is Down

**Step 1 (60 seconds):** Check status pages
```
- Vercel: vercel.com/status
- Firebase: firebase.google.com/support/troubleshooting
- Stripe: stripe.status.io
- Google AI: google.com/support
```

**Step 2 (2 minutes):** Check logs
```
- Vercel: Deployments → View Logs
- Firebase: Firestore/Auth → Logs
- Stripe: Dashboard → Events/Logs
```

**Step 3 (5 minutes):** Rollback last deployment
```powershell
vercel rollback
# Prompts to select previous deployment
# Automatically redeploys previous version
```

**Step 4 (15 minutes):** Contact support
- Vercel: vercel.com/support
- Firebase: firebase.google.com/support
- Stripe: support.stripe.com

---

## Debug Commands

```bash
# Check build locally
npm run build

# Check for TypeScript errors
npm run lint

# View full error with stack trace
npm run build 2>&1 | head -50

# View environment variables (DON'T SHARE OUTPUT!)
cat .env.local | grep -v STRIPE_SECRET

# Check running processes on port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# View git history
git log --oneline

# Check uncommitted changes
git status

# See what changed in last commit
git show --stat
```

---

## Performance Monitoring

### Check Response Times
```bash
# Test homepage
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com

# Test API endpoint
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com/api/ai-chat
```

### Monitor in Production
- **Vercel:** Dashboard → Analytics
- **Firebase:** Console → Performance
- **Stripe:** Dashboard → Metrics

---

## Final Troubleshooting Checklist

If nothing else works:

```bash
✅ npm run build locally (passes with 0 errors?)
✅ .env.local has all 12 variables (no placeholders?)
✅ All values correct (copy-pasted from respective dashboards?)
✅ Restart dev server: npm run dev
✅ Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
✅ Check DevTools Console for errors (not just warnings)
✅ Check DevTools Network tab for 404/500 errors
✅ Restart entire machine (nuclear option, but works!)
```

**Still broken? Ask in Discord or open GitHub issue with error message + `.env.local` (REDACT SECRET KEYS).**

---

**Last Updated:** 2024-12-19
**Version:** 1.0
**Status:** Production Ready

Good luck! 🚀

