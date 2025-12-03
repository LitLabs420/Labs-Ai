Security Rotation Runbook — Actionable Commands

Purpose
- Concrete, ordered commands and checks to rotate leaked credentials for common providers: GCP/Firebase, Stripe, SendGrid, OpenAI, GitHub Actions, and Vercel.
- These are runbook steps only. I will not run them unless you explicitly provide credentials/permission.

Important notes
- Replace placeholders in angle brackets: <PROJECT_ID>, <SERVICE_ACCOUNT_EMAIL>, <KEY_ID>, <STRIPE_KEY_ID>, <OPENAI_KEY_ID>, <VERCEL_PROJECT>, <GITHUB_REPO_OWNER>, <GITHUB_REPO>, etc.
- Do not paste actual secrets into chat. Use these commands locally or from a secure admin machine with proper CLI creds.
- Test in staging before applying to production.

Prerequisites
- Install gcloud, stripe CLI, curl, and have authentication to respective consoles/CLIs.
- Authenticate:
  - gcloud auth login
  - gcloud config set project <PROJECT_ID>
  - export STRIPE_API_KEY (or set in CI)

Order of operations (recommended)
1) Create new service accounts / keys (GCP/Firebase)
2) Update CI and hosting secrets to use new keys
3) Verify services with new keys (staging)
4) Revoke old keys
5) Rotate provider-specific API keys (Stripe, SendGrid, OpenAI)
6) Rotate GitHub Actions & Vercel secrets
7) Monitor logs for 24–72 hours

GCP / Firebase (service account keys)
# Create new service account
gcloud iam service-accounts create rotated-sa --display-name="rotated-sa"

# Grant least-privilege roles (example)
gcloud projects add-iam-policy-binding <PROJECT_ID> \
  --member="serviceAccount:rotated-sa@<PROJECT_ID>.iam.gserviceaccount.com" \
  --role="roles/datastore.user"

# Create a new key locally
gcloud iam service-accounts keys create ~/rotated-sa-key.json \
  --iam-account=rotated-sa@<PROJECT_ID>.iam.gserviceaccount.com

# Update CI / Vercel / secrets with the JSON content (use GitHub/Vercel UI or CLI)
# Example: GitHub (replace values appropriately)
# GitHub CLI (installed and authenticated):
# gh secret set GCP_SA_KEY --body "$(cat ~/rotated-sa-key.json)" --repo <GITHUB_REPO_OWNER>/<GITHUB_REPO>

# Verify application in staging (restart services if needed)
# After verification, revoke old keys; list keys first:
gcloud iam service-accounts keys list --iam-account=<OLD_SA_EMAIL>
# Delete the old key(s):
gcloud iam service-accounts keys delete <KEY_ID> --iam-account=<OLD_SA_EMAIL>

Firebase Web API key (client-side)
- In Firebase Console → Project Settings → General, create new API key as needed
- Update `NEXT_PUBLIC_FIREBASE_API_KEY` in your hosting (Vercel/GitHub Actions) and redeploy
- Verify client auth flows

Stripe
# Create a new API key in Stripe dashboard or with CLI
# With Stripe CLI (install and authenticate):
stripe login
# Create and display keys via dashboard; update CI secret STRIPE_SECRET_KEY
# If rotating webhooks, create new webhook signing secret and update webhook handlers

SendGrid
# In SendGrid UI: create a new API key with minimum required permissions
# Update `SENDGRID_API_KEY` in CI/hosting
# Verify email sending

OpenAI
# In OpenAI dashboard: revoke compromised keys and create new keys
# Update `OPENAI_API_KEY` in CI/hosting
# Check usage logs for suspicious calls

GitHub (repo + Actions)
# Revoke any exposed PATs via GitHub account settings (if known)
# Update repository secrets:
# Using gh CLI (example):
gh secret set FIREBASE_SA_KEY --body "$(cat ~/rotated-sa-key.json)" --repo <GITHUB_REPO_OWNER>/<GITHUB_REPO>
gh secret set STRIPE_KEY --body "<new_stripe_key>" --repo <GITHUB_REPO_OWNER>/<GITHUB_REPO>

Vercel
- Update Project → Settings → Environment Variables with new keys
- Trigger a redeploy and verify services

Verification commands and checks
- Check GCP logs for authentication from old keys:
  - gcloud logging read "resource.type=project AND protoPayload.authenticationInfo.principalEmail=<OLD_SA_EMAIL>" --limit 50
- Check Stripe logs for suspicious activity
- Check OpenAI usage logs

Secure deletion of backups
- After rotation and verification, delete encrypted backup when you are ready. If you want me to delete it from disk, confirm and I will securely delete the file path reported earlier.
- On Windows, use a secure-delete tool (e.g., SDelete) or ensure overwritten free space. Example (Sysinternals sdelete):
  sdelete -p 3 C:\path\to\file_or_folder

If you want, I can now produce fully parameterized commands for each provider using your project IDs and target account emails (I will not execute them without your explicit permission).
