# Automated Deployment Guide

## Overview

LitLabs AI now has automated deployment configured with GitHub Actions and Vercel. Every push to the master/main branch triggers an automatic deployment to production, and every pull request gets a preview deployment.

## How It Works

### 1. Continuous Integration (CI)

When you push code or create a pull request, GitHub Actions automatically:

1. **Checks out the code**
2. **Installs dependencies** with `npm ci`
3. **Runs linting** with `npm run lint`
4. **Performs type checking** with `npm run typecheck`
5. **Builds the application** with `npm run build`
6. **Uploads build artifacts** for deployment

### 2. Deployment

#### Preview Deployments (Pull Requests)

When you create or update a pull request:

- A preview deployment is created automatically
- The preview URL is posted as a comment on the PR
- Preview updates automatically with new commits
- Perfect for testing features before merging

#### Production Deployments (Master/Main Branch)

When you merge to master/main:

- Automatic production deployment to https://labs-ai.studio
- Zero-downtime deployment
- Instant rollback capability if needed
- Build status posted to the commit

## Required Setup

### GitHub Secrets

Add these secrets to your GitHub repository (Settings > Secrets and variables > Actions):

#### Vercel Secrets

```
VERCEL_TOKEN          - Your Vercel API token
VERCEL_ORG_ID         - Your Vercel organization ID
VERCEL_PROJECT_ID     - Your Vercel project ID
```

**How to get these values:**

1. Go to https://vercel.com/account/tokens
2. Create a new token
3. Copy your Organization ID from project settings
4. Copy your Project ID from project settings

#### Firebase Secrets (for build)

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

### Vercel Project Configuration

Ensure your Vercel project has all required environment variables configured:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add all variables from `.env.example`
4. Configure for Production, Preview, and Development environments

## Local Validation

Before pushing, validate your build locally:

```bash
# Run the validation script
./scripts/validate-build.sh

# Or manually:
npm ci              # Install dependencies
npm run lint        # Lint code
npm run typecheck   # Type check
npm run build       # Build application
```

## Deployment Commands

### Manual Deployment

If you need to deploy manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project (first time only)
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Rollback

If you need to rollback to a previous deployment:

```bash
# List deployments
vercel ls

# Promote a previous deployment
vercel promote <deployment-url>
```

## Build Workflow

```
┌─────────────────────────────────────────────────────────┐
│                    Code Changes                          │
│                         │                                │
│                         ▼                                │
│              Push to GitHub / Create PR                  │
│                         │                                │
│                         ▼                                │
│                  GitHub Actions                          │
│                         │                                │
│            ┌────────────┴────────────┐                   │
│            │                         │                   │
│            ▼                         ▼                   │
│     Build & Lint              Secrets Scan               │
│            │                                             │
│            ▼                                             │
│     ┌──────────────┐                                    │
│     │   PR?        │                                    │
│     └──────┬───────┘                                    │
│            │                                             │
│      Yes   │   No                                        │
│     ┌──────▼──────┐     ┌──────────────┐               │
│     │  Preview     │     │  Production  │               │
│     │  Deployment  │     │  Deployment  │               │
│     └──────────────┘     └──────────────┘               │
└─────────────────────────────────────────────────────────┘
```

## Monitoring Deployments

### GitHub Actions

- View workflow runs at: `https://github.com/LitLabs420/Labs-Ai/actions`
- Check build logs for any failures
- Build status is shown on commits and PRs

### Vercel Dashboard

- View deployments at: https://vercel.com/dashboard
- Monitor build times and performance
- Access deployment logs
- View analytics and insights

## Troubleshooting

### Build Fails in CI

1. Check the GitHub Actions logs
2. Run `./scripts/validate-build.sh` locally
3. Fix any linting or type errors
4. Ensure all environment variables are set

### Deployment Fails

1. Check Vercel deployment logs
2. Verify all environment variables are configured
3. Check for any missing dependencies
4. Ensure build succeeds locally first

### Preview Deployment Not Working

1. Verify `VERCEL_TOKEN` secret is set correctly
2. Check that Vercel CLI is installed in the workflow
3. Ensure project is linked correctly in Vercel

## Best Practices

1. **Always test locally** before pushing
2. **Use pull requests** for feature development
3. **Review preview deployments** before merging
4. **Monitor production deployments** after merging
5. **Keep secrets secure** and rotate regularly
6. **Document breaking changes** in PR descriptions

## Environment Variables

### Required for Build

- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID

### Required for Runtime

- `GOOGLE_GENERATIVE_AI_API_KEY` - Google AI API key (server-side)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `FIREBASE_ADMIN_PRIVATE_KEY` - Firebase admin private key
- `FIREBASE_ADMIN_CLIENT_EMAIL` - Firebase admin client email

See `.env.example` for a complete list of environment variables.

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Firebase Setup Guide](./ENVIRONMENT_SETUP.md)

## Support

If you encounter issues with deployment:

1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Check Vercel deployment logs
4. Contact the development team

---

**Last Updated**: December 2024
**Version**: 1.0.0
