# 🔧 Missing Tools Setup - Quick Fix Guide

## Current Status

✅ **Working:**
- Dev server running on port 3000
- Firebase authentication configured
- Stripe payment system configured (test mode)
- Scroll progress bar
- Back-to-top button
- Analytics tracking (Vercel)

❌ **Not Working (Need API Keys):**
- AI content generation (Instagram captions, TikTok scripts)
- DM reply suggestions
- Money play generator

---

## 🚀 Fix AI Tools in 5 Minutes

### Step 1: Get Google AI API Key (FREE)

1. **Go to Google AI Studio:**
   ```
   https://makersuite.google.com/app/apikey
   ```

2. **Click "Get API Key"** (or "Create API Key")

3. **Select your Firebase project** (studio-4627045237-a2fe9) OR create new

4. **Copy the API key** (starts with `AIzaSy...`)

5. **Update .env.local:**
   ```powershell
   cd C:\Users\dying\public
   notepad .env.local
   ```

6. **Replace this line:**
   ```
   GOOGLE_GENERATIVE_AI_API_KEY=TEMP_GET_FROM_GOOGLE_AI_STUDIO
   ```
   
   **With:**
   ```
   GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...YOUR_ACTUAL_KEY
   ```

7. **Save and restart dev server:**
   ```powershell
   # Stop current server (if running in terminal)
   # Press Ctrl+C
   
   # Or stop background job
   Get-Job | Where-Object { $_.Name -eq "NextDevServer" } | Stop-Job
   Get-Job | Where-Object { $_.Name -eq "NextDevServer" } | Remove-Job
   
   # Restart
   npm run dev
   ```

### Step 2: Test AI Tools

1. **Open browser:**
   ```
   http://localhost:3000
   ```

2. **Sign up/Login** with your email

3. **Go to Dashboard → AI Tools**

4. **Try generating content:**
   - Pick "Instagram Caption"
   - Describe your post: "Promote holiday special for haircuts"
   - Click "Generate"
   - Should see AI-generated caption! ✨

---

## 🎯 Optional: OpenAI API Key

If you want to use GPT-4 instead of Gemini (costs money):

1. **Go to OpenAI:**
   ```
   https://platform.openai.com/api-keys
   ```

2. **Create account** (requires payment method after free trial)

3. **Create API key**

4. **Update .env.local:**
   ```
   OPENAI_API_KEY=sk-proj-...YOUR_KEY
   ```

**Note:** Current app uses Google Gemini, not OpenAI. OpenAI key is optional for future features.

---

## 🐛 Troubleshooting

### "AI generation failed"

**Check:**
1. API key is correct in `.env.local`
2. No quotes around the API key
3. Dev server restarted after changing `.env.local`
4. Check browser console (F12) for error details

### "Rate limit exceeded"

**Solution:**
- Google AI Studio has generous free tier (60 requests/minute)
- Wait 60 seconds and try again
- Or create new API key

### "Failed to fetch"

**Check:**
1. Dev server is running: `netstat -ano | Select-String ":3000"`
2. You're logged in (check Firebase Authentication)
3. Browser console for network errors

---

## 📊 What Each Tool Does

### 1. Content Generator
- **Instagram Captions:** Engaging captions with CTAs
- **TikTok Scripts:** 15-60 second video scripts
- **Email Campaigns:** Professional email copy
- **DM Openers:** Ice-breaker messages for cold outreach

### 2. DM Reply Assistant
- Paste customer DM
- AI suggests booking-focused reply
- Saves time on repetitive questions

### 3. Money Play Generator
- Analyzes your business metrics
- Suggests special offers/upsells
- Estimates revenue lift

---

## 🎉 After Setup Complete

You'll have access to:
- ✅ Unlimited AI content generation (free tier)
- ✅ 3 alternative versions per request
- ✅ Estimated engagement scores
- ✅ Hook suggestions for each piece

---

## 🔐 Security Note

- Never commit `.env.local` to git (already in `.gitignore`)
- API keys are server-side only (not exposed to browser)
- Rotate keys every 90 days for production

---

## 🆘 Need Help?

If you're stuck:
1. Check browser console (F12) for errors
2. Check terminal for server errors
3. Verify `.env.local` has no typos
4. Restart dev server

**Your specific setup:**
- Firebase Project: `studio-4627045237-a2fe9`
- Admin Email: `dyingbreed243@gmail.com`
- Stripe: Test mode (3 price IDs configured)
- Port: 3000

---

**Next Steps After AI Setup:**
1. Sign up through your app
2. Get your User UID from Firebase Console
3. Update `NEXT_PUBLIC_ADMIN_UID` in `.env.local`
4. Access admin-only features
