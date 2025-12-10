# LitLabs AI - Phone Editing Guide

## Quick Start for Mobile Development

This guide helps you edit the LitLabs AI project from your phone using GitHub Codespaces or VS Code Web.

### Option 1: GitHub Codespaces (Recommended for Phone)

**Best for:** Quick edits, no local setup needed

1. Go to **GitHub.com** → Open your repository
2. Click **Code** → **Codespaces** → **Create codespace on master**
3. Wait for environment to load (2-3 minutes)
4. Access VS Code in browser - fully functional on mobile
5. Make edits and commit directly

**Keyboard tips for mobile:**
- Double-tap + drag to select text
- Long-press for context menu
- Swipe left for file explorer
- Use Cmd+P (iPhone) or Ctrl+P (Android) to search files

---

### Option 2: VS Code Web (Instant, No Setup)

1. Go to: `github.dev/LitLabs420/Labs-Ai`
2. Opens VS Code interface in browser instantly
3. Perfect for quick edits and file browsing
4. Changes sync to GitHub (requires authentication)

---

### Option 3: Netlify CMS (Content Only)

For quick UI content updates without code:
1. Netlify CMS dashboard (if deployed)
2. Edit marketing copy, FAQs, pricing
3. Auto-commits to GitHub

---

## Project Structure (Simplified)

```
litlabs-web/
├── app/                    # Next.js pages (routes)
│   ├── api/               # Backend API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   └── pricing/           # Pricing page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── dashboard/        # Dashboard components
├── lib/                   # Utilities & services
│   ├── claude.ts         # AI text generation
│   ├── replicate.ts      # Image generation
│   ├── elevenlabs.ts     # Voice synthesis
│   ├── ai-pipeline.ts    # Combined AI workflow
│   ├── crypto-payments.ts # Blockchain payments
│   └── tier-system.ts    # Subscription tiers
├── types/                # TypeScript definitions
├── public/               # Static assets
└── prisma/               # Database schema

Removed (cleanup):
✓ android-app - Mobile app handled separately
✓ mobile-app - Not in use
✓ stripe-ruby - Not needed (using Stripe.js)
✓ functions - Firebase functions in separate repo
✓ database - Schema in prisma/
```

---

## Essential Files for Editing

### High-Priority (Most Changes Here)
- `app/pricing/page.tsx` - Pricing page UI
- `lib/tier-system.ts` - Subscription tiers & limits
- `lib/crypto-payments.ts` - Payment handling
- `components/ui/premium-button.tsx` - Primary button component
- `lib/claude.ts` - AI content generation

### Medium-Priority (Regular Updates)
- `app/dashboard/*/page.tsx` - Dashboard pages
- `components/ui/*.tsx` - UI components
- `lib/*.ts` - Utility functions

### Low-Priority (Rarely Edited)
- `app/api/*/route.ts` - API endpoints (backend)
- `prisma/schema.prisma` - Database schema
- `types/` - Type definitions

---

## Making Changes from Phone

### Quick Edit Workflow

1. **Open in Codespaces:**
   - GitHub.com → Code → Codespaces → Open
   
2. **Find file:** Cmd+P (Ctrl+P)
   
3. **Edit code:**
   - Make your changes
   - Use markdown preview for docs
   - Built-in terminal available
   
4. **Commit & Push:**
   ```bash
   # In Codespaces terminal
   git add .
   git commit -m "fix: brief description"
   git push origin master
   ```

### Common Changes

**Update pricing:**
```typescript
// lib/tier-system.ts
const TIER_CONFIG = {
  starter: {
    price: '$9',           // Change here
    monthly_price: 9,      // Or here
    // ... rest of config
  }
}
```

**Add feature to tier:**
```typescript
// In tier features array
features: [
  'New feature here',     // Add this line
  'Existing feature',
]
```

**Change UI text:**
- `app/pricing/page.tsx` - Edit JSX text directly
- `components/ui/premium-button.tsx` - Button labels

---

## Terminal Commands (Mobile)

Works in Codespaces terminal:

```bash
# Check build status
npm run build              # Full build (slow on phone)
npm run typecheck          # TS validation only (fast)
npm run lint              # Code quality check

# View changes
git status                # What's changed
git diff                  # View changes
git log --oneline -5      # Recent commits

# Push changes
git add -A
git commit -m "your message"
git push
```

---

## Tips for Mobile Editing

✅ **Do:**
- Use Codespaces for full IDE experience
- Use github.dev for quick file edits
- Keep changes small (easier to test)
- Use descriptive commit messages
- Pull latest before starting: `git pull`

❌ **Don't:**
- Don't try to run `npm install` on phone (very slow)
- Don't do major refactors via phone
- Don't edit files you don't understand
- Don't force-push to master

---

## Syncing with Desktop

When you return to desktop:

```bash
# Pull latest from phone edits
git pull origin master

# Check for conflicts
git status

# Install any new packages (if needed)
npm install

# Test locally
npm run build
npm run dev        # http://localhost:3000
```

---

## Remote Development Setup

For persistent cloud development:

### Option A: Gitpod (Free Alternative)
1. Go to `gitpod.io/#https://github.com/LitLabs420/Labs-Ai`
2. Full VS Code + Terminal
3. Works great on iPad/Android tablets

### Option B: SSH via Code Server
1. Deploy code-server on cloud VM
2. Access via mobile app
3. Full IDE experience anywhere

### Option C: GitHub Codespaces (Paid)
- $0.36/hour compute
- Best experience for mobile
- 120 hours/month free tier for Pro users

---

## Troubleshooting

**Codespace won't load?**
- Refresh page
- Clear browser cache
- Try different browser

**Changes not saving?**
- Check if you're authenticated
- Use terminal to commit instead
- Check .gitignore hasn't blocked files

**Build fails on phone?**
- Skip full build, use `npm run typecheck`
- Check error messages in terminal
- Most errors clear on desktop rebuild

**Conflicts when syncing?**
```bash
git pull origin master --rebase
# Resolve conflicts
git push origin master
```

---

## Cloud Backups

**Your code is always safe:**
- GitHub has full history (see commits)
- No local copy needed
- Works on any device with browser

---

## Next Steps

1. ✅ Bookmark `github.dev/LitLabs420/Labs-Ai` for quick access
2. ✅ Enable GitHub notifications for PRs/issues
3. ✅ Test Codespaces on your phone once
4. ✅ Keep this guide handy in browser bookmarks

---

**Questions?** Check the main README.md or commit history in GitHub for recent changes.

Happy coding! 🚀
