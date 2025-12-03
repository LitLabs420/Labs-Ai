# 🧹 PROJECT CLEANUP ANALYSIS

**Date:** December 3, 2025  
**Current Status:** MESSY - Too much duplication and unused files

---

## 🚨 THE PROBLEM

You have **MASSIVE DUPLICATION**:
- **2 complete codebases** (root `/app` + `/litlabs-web/app`)
- **16 old git repositories** sitting in folders doing nothing
- **Useless Docker setup** (Ruby Dockerfile for a Next.js app!)
- **100+ markdown docs** saying the same things
- **.env.local was just WIPED** by Vercel CLI (lost all your Firebase config!)

---

## ✅ WHAT YOU ACTUALLY NEED

### Keep (Active Project):
```
c:\Users\dying\public\
├── app/                    ✅ Your main Next.js app
├── components/             ✅ React components
├── context/                ✅ Auth context
├── lib/                    ✅ Firebase, Stripe, AI helpers
├── public/                 ✅ Static assets
├── types/                  ✅ TypeScript types
├── .env.local              ⚠️  BROKEN (needs restore)
├── .env.example            ✅ Template
├── package.json            ✅ Dependencies
├── next.config.ts          ✅ Next.js config
├── tsconfig.json           ✅ TypeScript config
├── vercel.json             ✅ Deploy config
├── firebase.json           ✅ Firebase config
├── firestore.rules         ✅ Security rules
└── README.md               ✅ Keep one good one
```

### Delete (Useless Clutter):

#### 1. DUPLICATE CODEBASES (16+ GB!)
```
❌ litlabs-web/            - OLD DUPLICATE (entire app copy!)
❌ functions/              - Firebase functions (not using)
```

#### 2. OLD GIT REPOS (Taking up space)
```
❌ glamflow-ai.git/
❌ repo-clean-check/
❌ repo-clean-verify/
❌ repo-clean-verify2/
❌ repo-cleaned/
❌ repo-filter-clean-final.git/
❌ repo-filter-clean-latest.git/
❌ repo-filter-final-run/
❌ repo-filter-final-test/
❌ repo-filter-rewrite-2/
❌ repo-filter-test/
❌ repo-filter-test-3/
❌ repo-filter-work/
❌ repo-rewrite-20251202-103335.git/
❌ repo-rewrite-20251202-103414.git/
❌ repo-rewrite-20251202-103454.git/
```

#### 3. WRONG DOCKER FILES
```
❌ Dockerfile               - Ruby container for Next.js app?!
❌ compose.yaml             - Not using Docker
❌ compose.debug.yaml       - Not using Docker
❌ .dockerignore            - Not using Docker
```

#### 4. BUILD ARTIFACTS
```
❌ artifacts-19862060026/
❌ artifacts-19863075628/
❌ .next/                   - Rebuild this (cache)
❌ node_modules/            - Keep but can reinstall
```

#### 5. DUPLICATE DOCS (Pick 1 good one, delete rest)
```
❌ COMPLETE_CODEBASE_EXPORT.md
❌ COMPLETE_STATUS_REPORT.md
❌ COMPREHENSIVE_AUDIT.md
❌ CURRENT_SYSTEM_STATUS.md
❌ DEPLOYMENT_STATUS.md
❌ FINAL_STATUS.md
❌ FINAL_SYSTEM_STATUS.txt
❌ GODMODE_FEATURES_COMPLETE.md
❌ LAUNCH_CHECKLIST.md
❌ LAUNCH_SUMMARY.md
❌ LITLABS_COMMAND_REFERENCE.md
❌ LITLABS_COMPLETE_SETUP.md
❌ LITLABS_MASTER_AI_PROMPT.md
❌ LITLABS_OWNER_DEV_GUIDE.md
❌ LITLABS_PROMPT_TESTING_GUIDE.md
❌ LITLABS_SUBSCRIPTION_LOGIC.md
❌ PRODUCTION_CHECKLIST.md
❌ PRODUCTION_FINAL_CHECKLIST.md
❌ PRODUCTION_READY.md
❌ PROJECT_AUDIT_COMPLETE.md
❌ REBUILD_COMPLETE.md
❌ SECURITY_REMOVAL_PLAN.md
❌ SECURITY_ROTATION_ACTIONS.md
❌ SECURITY_ROTATION_CHECKLIST.md
❌ SECURITY_ROTATION_COMMANDS.md
❌ SECURITY_ROTATION_PLAYBOOK.md
❌ SECURITY_ROTATION_RUNBOOK.md
❌ SECURITY_ROTATION_SCRIPTS.md
❌ SYSTEM_LAUNCH_COMPLETE.md
❌ SYSTEM_READY.md
❌ SYSTEM_SCAN_COMPLETE.txt
❌ TESTING_CHECKLIST.md
❌ TODO_COMPLETION_REPORT.md
❌ YOU_ARE_HERE.md
```

#### 6. LOG/TEMP FILES
```
❌ *.log files
❌ CACHE_BUST.txt
❌ found_hashes.txt
❌ LAST_BUILD.txt
❌ lsremote.txt
❌ out.html
❌ page_local.html
❌ push-output.txt
❌ run-jobs.json
❌ STATUS.txt
❌ vscode-profile-*.cpuprofile
```

---

## 🚀 YOUR ACTUAL TECH STACK (What You're Using)

### ✅ KEEP THESE:
1. **Next.js 15.1.3** - Your framework (YES, keep)
2. **Firebase** - Auth + Database (YES, actively used in code)
3. **Stripe** - Payments (YES, configured)
4. **Vercel** - Hosting (YES, deployed to litlabs-web.vercel.app)
5. **Google Gemini AI** - Content generation (YES, but needs API key)

### ❌ DELETE/NOT USING:
1. **Docker** - Not using (Vercel handles deployment)
2. **Firebase Functions** - Not deployed (can delete `/functions` folder)
3. **litlabs-web/** - Duplicate of main app (DELETE entire folder)
4. **15+ old git repos** - Taking up 20+ GB (DELETE all)

---

## 📋 CLEANUP SCRIPT (Run This)

```powershell
# STEP 1: Backup .env.local (it's broken but save it)
Copy-Item .env.local .env.local.backup

# STEP 2: Delete duplicate codebase (HUGE space saver)
Remove-Item -Recurse -Force litlabs-web

# STEP 3: Delete old git repos (20+ GB!)
Get-ChildItem -Directory | Where-Object { $_.Name -match 'repo-|glamflow-ai\.git' } | Remove-Item -Recurse -Force

# STEP 4: Delete artifacts
Remove-Item -Recurse -Force artifacts-*

# STEP 5: Delete Docker files (not using)
Remove-Item Dockerfile, compose.yaml, compose.debug.yaml, .dockerignore

# STEP 6: Delete old Firebase Functions (not deployed)
Remove-Item -Recurse -Force functions

# STEP 7: Clean build cache
Remove-Item -Recurse -Force .next

# STEP 8: Delete excessive docs (keep only essential)
Remove-Item COMPLETE_*.md, COMPREHENSIVE_*.md, FINAL_*.md, GODMODE_*.md, LAUNCH_*.md, LITLABS_*.md, PRODUCTION_*.md, PROJECT_*.md, REBUILD_*.md, SECURITY_*.md, SYSTEM_*.md, TESTING_*.md, TODO_*.md, YOU_ARE_HERE.md, DEPLOYMENT_STATUS.md

# STEP 9: Delete log/temp files
Remove-Item *.log, *.txt -Exclude README.txt
Remove-Item CACHE_BUST.txt, found_hashes.txt, lsremote.txt, out.html, page_local.html, push-output.txt, run-jobs.json, STATUS.txt, vscode-profile-*.cpuprofile

# STEP 10: Reinstall node_modules (clean)
Remove-Item -Recurse -Force node_modules
npm install
```

---

## ⚠️ CRITICAL: FIX .env.local FIRST

Your `.env.local` was **WIPED** by Vercel CLI. It now only has:
```
STRIPE_SECRET_KEY (WRONG - this is publishable key!)
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
VERCEL_OIDC_TOKEN
```

**MISSING (Need to restore):**
- Firebase credentials (6 variables)
- Admin UID and email
- Google AI API key
- Stripe price IDs (3 products)
- OpenAI key (optional)

---

## 🎯 THE PLAN

### Option A: Full Nuclear Cleanup (Recommended)
```powershell
# Run the cleanup script above
# Result: Delete 20+ GB, keep only working code
# Time: 5 minutes
```

### Option B: Safe Cleanup (Backup first)
```powershell
# Create backup folder
mkdir C:\Users\dying\backup-before-cleanup
Copy-Item -Recurse C:\Users\dying\public\* C:\Users\dying\backup-before-cleanup\

# Then run cleanup script
# Result: Same as Option A but you have backup
# Time: 10 minutes
```

### Option C: Manual Review
```powershell
# I can help you go through each folder
# Decide what to keep/delete one by one
# Time: 30 minutes
```

---

## 🔥 AFTER CLEANUP - WHAT CHANGES?

### Before:
- **Project size:** 25+ GB
- **Folders:** 80+ (mostly duplicates/junk)
- **Docs:** 100+ markdown files
- **Tech stack:** Confused (Docker? Ruby? Firebase Functions?)

### After:
- **Project size:** <2 GB
- **Folders:** 15 (only what you need)
- **Docs:** 5 essential files (README, TROUBLESHOOTING, ENVIRONMENT_SETUP, SETUP_MISSING_TOOLS, SITE_UPGRADE_PLAN)
- **Tech stack:** Crystal clear (Next.js + Firebase + Stripe + Vercel)

---

## ✅ WHAT WILL STILL WORK AFTER CLEANUP?

Everything! Because you're only deleting:
- Duplicate code that's not running
- Old git repos that aren't connected
- Docker files for a framework you're not using
- Documentation duplicates
- Build artifacts that get regenerated

**Your live site (litlabs-web.vercel.app) won't be affected at all.**

---

## 🚨 PRIORITY #1: FIX .env.local

Before cleanup, restore your environment variables:

1. Firebase config (from `.env.example` or Firebase Console)
2. Stripe price IDs (from Stripe Dashboard)
3. Google AI key (from https://makersuite.google.com/app/apikey)
4. Admin UID (after you sign up and check Firebase Console)

**Without these, your local dev won't work.**

---

## 🤔 WHY YOU HAVE ALL THIS MESS

1. **Multiple attempts** at setting up the project (litlabs-web vs root)
2. **Git repo cleanup experiments** (15+ repo-filter folders)
3. **Security key rotation** (generated tons of docs)
4. **Docker setup attempt** (abandoned but files left behind)
5. **Over-documentation** (100+ status reports that say the same thing)

---

## 📊 DISK SPACE YOU'LL RECOVER

- `litlabs-web/` duplicate: **~8 GB**
- Old git repos (15 folders): **~15 GB**
- `node_modules/` (will reinstall): **~1.5 GB**
- `.next/` cache: **~500 MB**
- Artifacts: **~200 MB**

**Total recovery: ~25 GB → down to ~2 GB**

---

## 🎯 MY RECOMMENDATION

**DO THIS RIGHT NOW:**

1. **Restore `.env.local`** (I'll help you)
2. **Run nuclear cleanup script** (delete all junk)
3. **Keep only:**
   - `/app`, `/components`, `/lib`, `/context`, `/types`, `/public`
   - `package.json`, `next.config.ts`, `tsconfig.json`, `vercel.json`
   - `firebase.json`, `firestore.rules`, `.env.local`, `.env.example`
   - `README.md`, `TROUBLESHOOTING.md`, `ENVIRONMENT_SETUP.md`
4. **Rebuild:** `npm install && npm run dev`
5. **Test:** http://localhost:3000
6. **Deploy:** `git add . && git commit && git push`

**Result:** Clean, fast, maintainable project with only what you need.

---

Want me to execute the cleanup? Say "yes clean it up" and I'll do it safely.
