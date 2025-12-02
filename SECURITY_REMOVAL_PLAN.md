**Summary**: CI run completed and produced a secrets-scan artifact. The `gitleaks` binary scan produced an empty JSON report (no confirmed leaks). The uploaded artifact bundle contained other diagnostic logs (e.g., `blocked.jsonl`) unrelated to secrets. We should still follow a conservative remediation checklist and harden CI to prevent future leaks.

**Immediate findings**:
- `gitleaks-report.json` produced by CI is empty (no matches).
- Artifact `results.zip` includes `blocked.jsonl` (network/firewall telemetry from the runner) — not a code secret.
- Historical file `githistory-secrets.txt` contains patterns and references to private-key placeholders inside `node_modules` docs (not active credentials in repo files).

**Priority 1 — Confirm & Contain**
- If you control or rotated any credentials recently, confirm rotations completed. If unsure, rotate credentials that grant wide access (cloud provider keys, Stripe/whsec, Google API keys).
- Search for `*.env*`, `.env.local`, `credentials.json`, or other files accidentally committed. Remove from the repo and add to `.gitignore` if needed.
- If real secrets are found in commits/history later, prepare to remove them using the BFG Repo-Cleaner or `git filter-repo`, then rotate the exposed secrets.

**Priority 2 — Hardening (Dev + CI)**
- Keep `gitleaks` scanning in CI. Current workflow now runs the binary directly and uploads `gitleaks-report.json` as an artifact.
- Add a pre-commit hook to run a fast local scan (e.g., `pre-commit` with `detect-secrets` or `gitleaks` builtin). Recommend `husky` + `lint-staged` + `gitleaks` or `pre-commit` framework.
- Add a policy to fail CI when `gitleaks` finds high-confidence secrets; keep an allowlist for false positives.
- Add repository secret `GITLEAKS_LICENSE` if you have a license and want to use the official action; otherwise keep the binary fallback.

**Priority 3 — Code hygiene & build stability**
- Finish removing banned TypeScript directives (`// @ts-nocheck`, unused `@ts-expect-error`) from non-runtime-only files. Confine runtime exemptions to single `*.runtime.ts` files with local ESLint comments to satisfy CI.
- Keep only one runtime wrapper (we already removed duplicates). Add a code comment explaining the pattern and why the file is lint-exempt.
- Add `types/ambient.d.ts` for any optional runtime-only modules so TypeScript doesn't complain about missing module types when needed.

**Priority 4 — Operational playbook**
- Create `SECURITY_ROTATION_PLAYBOOK.md` for owners/operators with step-by-step rotation instructions for: Stripe, Firebase, Google, AWS/GCP credentials, and other third-party keys used in this project.
- Define owners and a timeline for any rotation and a checklist to confirm revocation.

**Recommended quick fixes I can make now (pick any)**
- Add `.env.local` to `.gitignore` if not present.
- Add a minimal `pre-commit` config with `detect-secrets` or `gitleaks` to block commits with secrets locally.
- Create `SECURITY_ROTATION_PLAYBOOK.md` skeleton and `SECURITY_REMOVAL_PLAN.md` (this file) is being added now.
- Create a PR that documents the runtime-only import pattern and ESLint/TS expectations for future contributors.

**Commands you can run locally to validate**
```pwsh
# Quick local gitleaks scan (if you have gitleaks binary):
.\gitleaks.exe detect --source . --redact --report-format json --report-path gitleaks-report.json

# Or (if using Docker):
# docker run --rm -v "${PWD}:/src" zricethezav/gitleaks:latest detect --source /src --redact --report-format json --report-path /src/gitleaks-report.json
```

**Next steps I will take if you confirm:**
- Add a small pre-commit hook config and PR it to `feature/full-rebuild` (or `master`) so contributors get a local safety net.
- Create `SECURITY_ROTATION_PLAYBOOK.md` skeleton and open a PR linking to this remediation plan.

If you'd like me to proceed, tell me which quick fixes above to implement first (I recommend adding `.env.local` to `.gitignore` and adding pre-commit hooks).

-- Automated assistant

***End of plan***

*** Note: *** This file was added by automation after the CI gitleaks scan. Follow-up actions are required for a full remediation cycle.
