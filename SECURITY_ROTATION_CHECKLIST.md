Security rotation checklist

This file lists recommended, high-priority credential rotation steps after a secret exposure. Follow order; verify each provider's successful rotation before deleting old keys/backups.

1) Inventory
- Identify all exposed keys in `githistory-secrets.txt` backup (do NOT paste secrets in team chat).
- Typical keys: Firebase client/server keys, GCP service account JSON, Stripe secret keys, SendGrid API keys, OpenAI keys, GitHub tokens, third-party API keys.

2) Quick safety steps (immediate)
- Revoke any user-level GitHub personal access tokens used on CI/machines.
- Rotate GitHub Actions secrets (Settings -> Secrets) used by the repo (CI secrets: GCP, STRIPE, FIREBASE, SENDGRID, OPENAI keys).
- Disable or delete any leaked API keys in provider consoles if possible.

3) Provider-specific rotation (examples)

Firebase (client + server)
- In Firebase Console: create new Web API key or new service account key for server use.
- Update `NEXT_PUBLIC_FIREBASE_*` values in repository secrets and in deployed environments (Vercel).
- Replace server credentials (service account JSON) used by backend; restart services that cache credentials.
- Revoke old service account keys in GCP IAM.

GCP Service Accounts (used by Firebase/GCP)
- In GCP Console: create new service account and grant least-privilege roles required.
- Generate new JSON key, store it in your secrets manager (do NOT check into repo). Update CI secrets and deployments.
- Delete the old key(s) using `gcloud iam service-accounts keys delete KEY_ID --iam-account=SA_EMAIL`.

Stripe
- In Stripe Dashboard: rotate secret key (create new key, set new key in env/CI, then revoke old key).
- Update webhooks to use new signing secret if needed.
- Review recent activity and block suspicious API usage.

SendGrid
- Create a new API Key with appropriate permissions, update CI and deployments, delete old key.
- Verify email sending with new key.

OpenAI
- Revoke the old API key(s) in the OpenAI dashboard, create new keys, update CI and deployments.
- Check usage logs for suspicious calls.

Other services (GitHub, Twilio, etc.)
- Recreate secrets and update deployments/CI.

4) CI and Deployment updates
- Update repository secrets (GitHub Actions or Vercel) with new values.
- Run CI/CD to ensure new keys work; monitor logs for failures.

5) Verification
- Test major flows (auth, payments, mail, AI calls) in a non-production environment first.
- Check provider logs for suspicious activity and report policy violations if needed.

6) Secure backup & deletion
- Once rotation is verified, securely delete `C:\Users\dying\secret-backups\*` or move to an encrypted vault.
- If deletion is required: overwrite copies and then delete. Confirm deletion on all systems.

7) Post-incident
- Rotate passwords and 2FA recovery codes for accounts that used leaked credentials.
- Consider a full audit of user accounts and roles.
- Create an incident report that lists what was exposed, actions taken, and follow-up steps.

Notes
- Never commit new keys to the repo. Use CI secrets or a secrets manager.
- If you want, I can produce provider-specific command snippets (gcloud, stripe CLI, etc.) for each step.
