# Security Rotation Actions

This playbook lists immediate, high-priority rotation steps for credentials that may have been exposed. Follow these steps, update timestamps and ticket IDs, and notify stakeholders after completion.

IMPORTANT: Some actions require owner-level access (GCP/Firebase). Do not delete old keys until new keys are fully deployed and validated.

1) Preliminary (5-10 minutes)
 - **Document**: Create an entry in `ROTATION_CHECKLIST.md` with timestamp, executor, and summary of suspected exposures.
 - **Audit**: From the `artifacts-*/gitleaks-report` JSONs, list filenames and categories of findings.
 - **Block/Limit**: For any exposed secrets tied to live services, rotate **or** immediately disable the key (if rotation isn't possible).

2) Provider-specific steps

- **Stripe**
  - Create a new restricted API key in the Stripe Dashboard (`Developers → API keys`).
  - Update CI (GitHub Actions `Secrets`), Vercel, and any server envs with the new key.
  - Deploy and run a smoke test (create a test payment or use the Stripe test API).
  - Revoke the old key after verification.

- **OpenAI / LLM providers**
  - Generate a new API key in the provider console.
  - Replace stored values in GitHub Actions, Vercel, and `.env` where applicable.
  - Run a quick endpoint test to confirm responses.
  - Revoke the old key.

- **SendGrid / Resend / Email providers**
  - Create a new API key with minimal scopes required for sending.
  - Update secrets in CI and hosting.
  - Send test email(s) and verify deliverability.
  - Revoke old key.

- **Sentry**
  - Rotate DSN/project keys via Sentry settings.
  - Update client/server envs and verify that errors are reported after deploy.

- **GitHub Personal Access Tokens (PATs)**
  - Revoke exposed PATs immediately.
  - Create new PATs scoped minimally.
  - Update any automation, local machines, or CI secrets that used the PAT.

- **Vercel / Netlify / Hosting Secrets**
  - Replace secret environment variables with rotated values.
  - Re-deploy and verify.

- **Firebase / GCP Service Accounts** (OWNER REQUIRED)
  - Create a new Service Account with the minimal required roles.
  - Generate a new key JSON and store it securely (do not commit).
  - Replace server-side usage (Cloud Functions, CI credentials) with the new key.
  - Revoke the old service account keys.
  - If a full SA rotation is required, create a new SA, update all bindings, then delete the old SA.

3) CI and Repository
 - Update GitHub Actions secrets: `Settings → Secrets → Actions` (update all changed keys).
 - For Vercel: update Environment Variables for the appropriate project.
 - For Firebase: update `Project Settings → Service accounts` and hosting keys.
 - If you regenerated any credentials that are used by GitHub Actions runners (self-hosted), update those runners accordingly.

4) Validation
 - Run end-to-end smoke tests: login, payments, email sending, admin flows.
 - Confirm Sentry receives events and logs are healthy.
 - Verify gitleaks CI artifact shows no new findings.

5) Clean-up & Postmortem
 - Revoke old keys only after verification.
 - Update `SECURITY_ROTATION_ACTIONS.md` with timestamps and who performed each rotation.
 - File a security incident report if secrets were confirmed leaked externally.

6) Notes & commands
 - To update GitHub Secrets via CLI (personal token required):
```pwsh
# Example: update GitHub repo secret using gh CLI
gh secret set STRIPE_API_KEY --body "$NEW_STRIPE_KEY" --repo LiTree89/glamflow-ai
```

 - To update Vercel env via CLI:
```pwsh
vercel env add VARIABLE production
vercel env add VARIABLE preview
vercel env add VARIABLE development
```

 - To rotate a Firebase service account key (console recommended):
   - Go to `IAM & Admin → Service accounts` → select SA → `Keys` → `Add key` → `JSON`.

If you want, I can prepare concrete command snippets for each provider and optionally open PRs or run automation to update CI secrets where you provide access tokens. Otherwise, perform rotations manually and mark them complete in `ROTATION_CHECKLIST.md`.

----
Timestamp: 2025-12-02T10:35:00Z
Author: automation (assistant)
