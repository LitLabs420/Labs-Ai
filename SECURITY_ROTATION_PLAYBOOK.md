
# SECURITY_ROTATION_PLAYBOOK

This runbook provides step-by-step procedures to rotate, revoke, and remove exposed credentials found by gitleaks or other scanners. Use this as a checklist during incident response.

General flow (always follow in order):

- **Triage & scope**: identify secret type, affected repo(s), file path(s), and the earliest commit containing the secret. Note whether the secret is short-lived or long-lived.
- **Contain**: if the secret is actively used in production (CI/CD, hosting, APIs), temporarily disable the affected service or rotate immediately before changing code.
- **Rotate**: generate a new secret/credential in the provider console and replace usages in runtime environments (Vercel, hosting, CI, server envs).
- **Revoke**: revoke or delete the old secret where possible to prevent further use.
- **Remove from repo history**: use `git filter-repo` or BFG to expunge secrets from history, coordinate with team (force-push), and update CI and access tokens as necessary.
- **Verify**: re-run `gitleaks` (CI and local) and any other scanners to confirm removal.
- **Communicate**: notify repo owners, infra/ops, security, and downstream teams. Document actions in the incident ticket.

Provider-specific rotation steps
REDACTED_SECRET_Generic_long_secret

Stripe
- Rotate API keys in the Stripe Dashboard (Publishable keys + Secret keys).
- Update environment variables in Vercel/hosting and CI. For Vercel: update the project Environment Variables, then trigger a redeploy.
- Revoke old keys in the Stripe Dashboard after verifying traffic operates correctly with new keys.

Firebase (Service Accounts / API Keys)
- For service account JSON keys: create a new service account key in Google Cloud Console → IAM & Admin → Service Accounts, then update server envs and CI.
- For client API keys: restrict key usage via API restrictions in Google Cloud Console and rotate keys.
- Revoke the old key in the Cloud Console and redeploy affected services.

Google Cloud (GCP) - Service Accounts, OAuth
- Create a new service account key or new OAuth client as appropriate.
- Replace keys in secret stores and CI, then revoke the old key.
- If the secret was a JSON key in the repo, remove it and perform a history rewrite.

GitHub (tokens, secrets)
- Rotate any GitHub App or Personal Access Tokens (PATs) in GitHub Settings.
- If repository secrets (Actions secrets) are exposed, replace them in `Settings → Secrets and variables → Actions`, and invalidate the old secret.
- If webhooks or integrations used tokens, rotate those in the third-party app and update configuration.

Vercel / Netlify / Hosting
- Replace environment variables in the provider dashboard.
- Redeploy affected projects.

AWS
- For IAM access keys: create a new IAM user or rotate existing user's access keys.
- Update credentials in deployments (Secrets Manager, SSM Parameter Store, CI provider), then delete the old access key.
- If an AWS role was leaked, update role trust policies and rotate any credentials that used the role.

Azure
- Rotate Azure service principal secrets/certificates (Azure AD App Registrations) and update dependent services.

SendGrid / Mail providers
- Rotate API keys in the provider dashboard and update env vars.

Sentry
- Create a new DSN/project key for affected projects and update the DSN in envs/CI. Revoke the old DSN.

Database credentials
- Rotate DB users/passwords, update connection strings in the environment, and revoke the old credentials.

CI/CD tokens (CircleCI, GitHub Actions, GitLab CI, etc.)
- Rotate tokens in the CI provider, update project secrets, and invalidate old tokens.

General repository history removal (recommended tools)
- Preferred: `git filter-repo` (faster and more flexible than `git filter-branch`). Example:

	1) Install `git-filter-repo` (pip or package manager).
	2) Create a backup: `git clone --mirror git@github.com:org/repo.git repo-backup.git`.
	3) Run (example to remove a file):
		 `git filter-repo --path path/to/secret --invert-paths`
	4) Inspect changes, then force-push the cleaned repo: `git push --force --all` and `git push --force --tags`.

- Alternative: BFG Repo-Cleaner for simpler use-cases.

Post-remediation verification & follow-up
- Re-run `gitleaks` in CI and locally against the cleaned repo.
- Rotate any credentials that might have depended on the leaked secret and verify logs / access patterns for suspicious activity.
- Update `SECURITY_REMOVAL_PLAN.md` with details of the incident, rotated secrets, and dates of rotation.

Communication and audit
- Create a short incident report summarizing the secret, where it was found, the actions taken, and the final verification steps.
- Capture rotated key identifiers, who performed the rotation, and the commit/PR that removed the secret.

Appendix: example commands

- Remove a single file from history using `git filter-repo` (run from a mirror clone):

	git clone --mirror git@github.com:org/repo.git
	cd repo.git
	git filter-repo --path path/to/file --invert-paths
	git push --force --all
	git push --force --tags

- Example: delete all `*.pem` files from history (mirror clone):

	git filter-repo --invert-paths --paths-glob '*.pem'

Notes & cautions
- History rewrites are disruptive: coordinate with all contributors and downstream consumers. After a force-push, all clones must be recloned or reset.
- Rotation should be completed before removing secrets from history if those secrets are still active. If secrets are already rotated, removing them from history is safe and recommended.

