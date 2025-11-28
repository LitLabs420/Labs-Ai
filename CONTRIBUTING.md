# Contributing to GLAMFLOW AI

## Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **security**: Security issue fix (use `BREAKING CHANGE` if needed)
- **refactor**: Code refactor without behavior change
- **perf**: Performance improvement
- **test**: Test additions/changes
- **docs**: Documentation updates
- **chore**: Maintenance, dependency updates
- **ci**: CI/CD pipeline changes

### Scopes
- `auth`: Authentication system
- `dashboard`: Main SPA dashboard
- `payment`: Stripe integration
- `chatbot`: Chatbot widget
- `admin`: Admin panel
- `security`: Security fixes
- `functions`: Cloud Functions

### Examples

```
feat(payment): add webhook retry logic

- Implement exponential backoff for failed webhook deliveries
- Add transaction audit logging
- Closes #42

BREAKING CHANGE: Webhook handler now requires signature verification
```

```
security(dashboard): remove exposed API keys from localStorage

Removed hardcoded Stripe keys from dashboard.js and moved to
Cloud Functions environment configuration.

Fixes #CRITICAL-001
```

## Branch Naming

```
<type>/<description>
```

Examples:
- `feature/chatbot-enhancement`
- `fix/payment-timeout-issue`
- `security/remove-exposed-credentials`
- `docs/api-reference`

## Pull Request Process

1. Create feature branch from `master`
2. Make changes with descriptive commits
3. Ensure all security checks pass
4. Update `.github/copilot-instructions.md` if architecture changes
5. Add entry to `CHANGELOG.md`
6. Request review before merge
7. Rebase and squash if needed for cleaner history

## Security Guidelines

⚠️ **NEVER commit**:
- API keys, credentials, or secrets
- Firebase service account keys
- Stripe live keys
- Private configuration files

✅ **ALWAYS**:
- Use Firebase Secret Manager for sensitive data
- Set environment variables via `firebase functions:config:set`
- Add `*.key`, `*.pem`, `.env` to `.gitignore`
- Use `npm audit` regularly
- Document security changes with `[SECURITY]` prefix

## Testing Before Commit

```bash
# Check for exposed secrets
git diff --cached | grep -i "key\|secret\|password"

# Lint check
npm run lint --if-present

# Build check
npm run build --if-present

# Run tests
npm test --if-present
```

## Deployment

- Pushes to `master` trigger automatic Firebase deployment
- Pull requests deploy to preview channel
- Manual deployment: `firebase deploy --force`

## Questions?

See `.github/copilot-instructions.md` for architecture documentation
