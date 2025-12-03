Security Rotation Commands — Provider-specific

Purpose
- Concrete CLI commands and sequence to rotate compromised credentials for common providers. Replace angle-bracket placeholders and run from a secure admin workstation.

GCP / Firebase (gcloud)

# 1) Create a new service account
```bash
gcloud iam service-accounts create rotated-sa --display-name="rotated-sa"
```

# 2) Grant least-privilege roles (example)
```bash
gcloud projects add-iam-policy-binding <PROJECT_ID> \
  --member="serviceAccount:rotated-sa@<PROJECT_ID>.iam.gserviceaccount.com" \
  --role="roles/datastore.user"
```

# 3) Create a new key and store it safely (do NOT check into git)
```bash
gcloud iam service-accounts keys create ~/rotated-sa-key.json \
  --iam-account=rotated-sa@<PROJECT_ID>.iam.gserviceaccount.com
```

# 4) Update CI / Vercel / GitHub Secrets with the JSON (example GitHub CLI)
```bash
gh secret set GCP_SA_KEY --body "$(cat ~/rotated-sa-key.json)" --repo <GITHUB_ORG>/<REPO>
```

# 5) After verification, revoke old keys
```bash
# list keys
gcloud iam service-accounts keys list --iam-account=<OLD_SA_EMAIL>
# delete old key
gcloud iam service-accounts keys delete <KEY_ID> --iam-account=<OLD_SA_EMAIL>
```

Stripe

# Create new secret key in Stripe Dashboard (recommended) or rotate via Stripe CLI
# Update `STRIPE_SECRET_KEY` in CI and hosting. Example (GitHub CLI):
```bash
gh secret set STRIPE_SECRET_KEY --body "sk_live_..." --repo <GITHUB_ORG>/<REPO>
```
# If you rotate webhooks, update webhook signing secret in hosting and webhook settings.

SendGrid

# Create a new API key in SendGrid UI, restrict permissions, update CI:
```bash
gh secret set SENDGRID_API_KEY --body "SG.xxxxxx" --repo <GITHUB_ORG>/<REPO>
```

OpenAI

# Create new key in OpenAI console, update CI and hosting:
```bash
gh secret set OPENAI_API_KEY --body "sk-..." --repo <GITHUB_ORG>/<REPO>
```
# Verify usage logs for suspicious activity and revoke old keys.

GitHub (PATs & Actions)

# Revoke exposed Personal Access Tokens in GitHub account settings.
# Update repository secrets using gh CLI:
```bash
gh secret set FIREBASE_SA_KEY --body "$(cat ~/rotated-sa-key.json)" --repo <GITHUB_ORG>/<REPO>
gh secret set STRIPE_KEY --body "sk_live_..." --repo <GITHUB_ORG>/<REPO>
```

Vercel

# Update Project → Settings → Environment Variables with new values, then redeploy.
# Use Vercel CLI to set env vars (example):
```bash
vercel env add ENV_VAR production <value>
```

Verification

- Check GCP logs for usage of old service accounts via `gcloud logging read`.
- Check provider usage logs for suspicious activity.
- Monitor application and CI after deployments for 24–72 hours.

Notes

- Never paste keys into chat. Use secure channels only.
- Prefer short-lived tokens or OIDC where supported.
