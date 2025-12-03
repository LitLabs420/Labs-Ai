Credential Rotation Scripts & Runbook

Purpose
- Collection of safe, non-destructive scripts and step-by-step commands to rotate compromised keys.
- These are templates. Replace placeholders and run from an admin workstation.

Notes
- Do NOT run these automatically without testing in staging.
- Never paste keys into chat. Use secure channels and rotate one provider at a time.

1) GCP / Firebase: rotate service account (example)

- Create a new service account and key (example):

```bash
# replace <PROJECT_ID> and <NEW_SA_NAME>
gcloud iam service-accounts create <NEW_SA_NAME> --display-name="rotated-sa"

# Grant roles (give only required permissions)
gcloud projects add-iam-policy-binding <PROJECT_ID> \
  --member="serviceAccount:<NEW_SA_NAME>@<PROJECT_ID>.iam.gserviceaccount.com" \
  --role="roles/datastore.user"

# Create key
gcloud iam service-accounts keys create ~/rotated-sa-key.json \
  --iam-account=<NEW_SA_NAME>@<PROJECT_ID>.iam.gserviceaccount.com
```

- Update CI / hosting / GitHub secrets with the JSON contents (example gh):

```bash
# GitHub example
gh secret set GCP_SA_KEY --body "$(cat ~/rotated-sa-key.json)" --repo <GITHUB_ORG>/<REPO>

# Vercel (use web UI or vercel CLI)
vercel env add GCP_SA_KEY production < ./rotated-sa-key.json
```

- After verification in staging, revoke the old key:

```bash
gcloud iam service-accounts keys list --iam-account=<OLD_SA_EMAIL>
gcloud iam service-accounts keys delete <KEY_ID> --iam-account=<OLD_SA_EMAIL>
```

2) Stripe (manual steps recommended)

- Create new API key in Stripe dashboard.
- Update `STRIPE_SECRET_KEY` in CI and hosting.

Example (GitHub CLI):

```bash
gh secret set STRIPE_SECRET_KEY --body "sk_live_..." --repo <GITHUB_ORG>/<REPO>
```

3) OpenAI

- Create new key in OpenAI console and update CI/hosting.

```bash
gh secret set OPENAI_API_KEY --body "sk-..." --repo <GITHUB_ORG>/<REPO>
```

4) SendGrid

- Create new API key in SendGrid, limit to necessary permissions, update CI.

5) GitHub Actions / PATs

- Revoke exposed PATs from account settings if known.
- Replace repo secrets using `gh secret set`.

6) Vercel

- Update project environment variables in Vercel dashboard and redeploy.

Verification
- Check provider logs for activity from old keys.
- Monitor for failed auths during the first 24–72 hours.

Rollback
- Keep old keys until the new keys verify in staging, then delete old keys.

Safety
- Use temporary, short-lived keys when possible.
- Rotate one provider at a time and verify.
