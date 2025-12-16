# ✅ Deployment Activation Checklist

Use this checklist to activate the automated deployment system.

## Prerequisites

- [ ] Vercel account created
- [ ] Project deployed to Vercel at least once manually
- [ ] GitHub repository has admin access
- [ ] Firebase project configured

## Step 1: Get Vercel Credentials

### A. Get Vercel Token
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it "GitHub Actions"
4. Copy the token (starts with `vercel_`)
5. Save it securely - you'll need it in Step 3

### B. Get Organization ID
1. Go to https://vercel.com/dashboard
2. Click on your project
3. Go to Settings
4. Look for "Organization ID" or run: `vercel project ls`
5. Copy the org ID

### C. Get Project ID
1. In Vercel project settings
2. Look for "Project ID"
3. Or check `.vercel/project.json` after running `vercel link`
4. Copy the project ID

## Step 2: Prepare Environment Variables

Create a list of your environment variables from `.env.local`:

### Required for Build:
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`

### Required for Runtime:
- [ ] `GOOGLE_GENERATIVE_AI_API_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_PUBLISHABLE_KEY`
- [ ] `FIREBASE_ADMIN_PRIVATE_KEY`
- [ ] `FIREBASE_ADMIN_CLIENT_EMAIL`
- [ ] Other API keys from your `.env.local`

## Step 3: Add GitHub Secrets

1. Go to your GitHub repository
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add these secrets:

### Vercel Secrets:
- [ ] **Name**: `VERCEL_TOKEN` | **Value**: (token from Step 1A)
- [ ] **Name**: `VERCEL_ORG_ID` | **Value**: (org ID from Step 1B)
- [ ] **Name**: `VERCEL_PROJECT_ID` | **Value**: (project ID from Step 1C)

### Firebase Secrets (for build):
- [ ] **Name**: `NEXT_PUBLIC_FIREBASE_API_KEY` | **Value**: (your Firebase API key)
- [ ] **Name**: `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | **Value**: (your auth domain)
- [ ] **Name**: `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | **Value**: (your project ID)
- [ ] **Name**: `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | **Value**: (your storage bucket)
- [ ] **Name**: `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | **Value**: (your sender ID)
- [ ] **Name**: `NEXT_PUBLIC_FIREBASE_APP_ID` | **Value**: (your app ID)

## Step 4: Configure Vercel Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all variables from `.env.local`
5. Configure for:
   - [ ] Production
   - [ ] Preview
   - [ ] Development

**Important**: Add ALL environment variables, not just the Firebase ones from Step 3.

## Step 5: Test the Workflow

### Test Preview Deployment:
```bash
# Create test branch
git checkout -b test/deployment-activation

# Make small change
echo "# Deployment Test" >> README.md

# Commit and push
git add README.md
git commit -m "test: activate deployment workflow"
git push origin test/deployment-activation
```

1. [ ] Create PR on GitHub
2. [ ] Check Actions tab - should see "Deploy to Vercel" workflow running
3. [ ] Wait for preview deployment
4. [ ] Check PR comments for preview URL
5. [ ] Visit preview URL to verify
6. [ ] Close/delete test PR if successful

### Test Production Deployment:
```bash
# Merge this PR to master/main
# OR push directly to master/main
```

1. [ ] Merge PR or push to master/main
2. [ ] Check Actions tab - should see production deployment
3. [ ] Wait for deployment to complete
4. [ ] Visit production URL
5. [ ] Verify site is working

## Step 6: Verify Everything Works

- [ ] Preview deployments working for PRs
- [ ] Production deployments working for master/main
- [ ] Build artifacts being created
- [ ] Environment variables loading correctly
- [ ] Firebase connection working
- [ ] Stripe integration working (if applicable)

## Troubleshooting

### "Vercel CLI not found" error
→ Workflow will install it automatically, just wait

### "VERCEL_TOKEN invalid" error
→ Check token in GitHub secrets, ensure it's correct

### "Build failed" error
→ Run `./scripts/validate-build.sh` locally to debug

### "Missing environment variables" error
→ Check Vercel project settings and GitHub secrets

### Preview URL not posted to PR
→ Check `GITHUB_TOKEN` permission in Actions settings

## Next Steps After Activation

1. **Document your deployment URL**: Update README with production URL
2. **Set up monitoring**: Configure Sentry, analytics, etc.
3. **Test rollback**: Practice rolling back a deployment
4. **Update team docs**: Share this checklist with team

## Support Resources

- **Deployment Guide**: See `AUTOMATED_DEPLOYMENT_GUIDE.md`
- **Quick Start**: See `DEPLOYMENT_QUICK_START.md`
- **Summary**: See `DEPLOYMENT_SUMMARY.md`
- **Build Validation**: Run `./scripts/validate-build.sh`

---

**Estimated Time**: 15-30 minutes
**Difficulty**: Easy
**Prerequisites**: GitHub admin access, Vercel account
