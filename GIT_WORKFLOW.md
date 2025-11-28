# Git & Source Control Setup Guide

## Initial Setup

### 1. Configure Git User (One-Time)
```bash
git config user.email "your-email@example.com"
git config user.name "Your Name"
```

For global config (all repositories):
```bash
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"
```

### 2. Clone Repository
```bash
git clone https://github.com/yourusername/glamflow-ai.git
cd glamflow-ai
npm install
cd functions && npm install && cd ..
```

### 3. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

## Daily Workflow

### Before Starting Work
```bash
git pull origin master
```

### Making Changes
```bash
# Check status
git status

# Stage changes
git add <files>

# View staged changes
git diff --staged

# Commit with descriptive message (see CONTRIBUTING.md)
git commit -m "type(scope): description"
```

### Commit Message Examples

✅ **Good**:
```
feat(payment): add webhook retry logic

- Implement exponential backoff for failed deliveries
- Add transaction audit logging
- Closes #42
```

✅ **Good**:
```
security(dashboard): remove exposed API keys from localStorage

Removes hardcoded credentials and moves to Cloud Functions.
Fixes #CRITICAL-001
```

❌ **Bad**:
```
fixed stuff
update code
working on payment thing
```

### Before Pushing
```bash
# Ensure no exposed secrets
git diff HEAD~1 | grep -i "secret\|password\|api_key"

# Ensure code quality
npm run lint --if-present

# Run tests
npm test --if-present
```

### Pushing Changes
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Common Tasks

### Syncing with Master
```bash
git fetch origin
git rebase origin/master
```

### Viewing History
```bash
# View commit history
git log --oneline -20

# View changes in specific file
git log -p <filename>

# View blame for line-by-line authors
git blame <filename>
```

### Undoing Changes

**Undo uncommitted changes**:
```bash
git restore <filename>              # Single file
git restore .                       # All files
```

**Undo staged changes**:
```bash
git restore --staged <filename>
```

**Undo last commit (keep changes)**:
```bash
git reset --soft HEAD~1
```

**Undo last commit (discard changes)**:
```bash
git reset --hard HEAD~1
```

### Stashing Work (Temporary Save)
```bash
# Save changes without committing
git stash

# View stashed changes
git stash list

# Apply stashed changes
git stash apply

# Delete stashed changes
git stash drop
```

## Security Checklist

⚠️ **BEFORE EVERY COMMIT**:
- [ ] No Firebase service account keys committed
- [ ] No Stripe live API keys exposed
- [ ] No `.env` files with secrets
- [ ] No credentials in code comments
- [ ] No passwords in commit messages

### Check for Secrets
```bash
# Search for common patterns
git diff --cached | grep -i "password\|secret\|key\|token"

# Search entire repo
git log -p -S "stripe_sk_live" | head -20
```

## Branch Protection Rules

Protected branches: `master`, `main`

Before merging:
- ✅ All tests pass
- ✅ Security scanning passes
- ✅ Code review approved
- ✅ No exposed credentials detected

## Deployment Pipeline

1. **Feature Branch** → Create PR → Code Review
2. **Master Branch** → Automated Firebase Deployment
3. **Production** → Verify no errors in console

Push to `master` automatically triggers:
- Firebase Hosting deployment (frontend)
- Cloud Functions deployment (backend)
- Health checks

## Emergency Procedures

### Accidentally Committed Secrets?
```bash
# 1. Remove from git history
git rm --cached <file>

# 2. Add to .gitignore
echo "<file>" >> .gitignore

# 3. Amend commit
git commit --amend

# 4. Force push (WARNING: Only if not merged to master)
git push --force-with-lease origin <branch>

# 5. Alert team immediately
# 6. Rotate exposed credentials in Firebase/Stripe console
```

### Reverted Changes?
```bash
# Find the original commit
git log --oneline | grep "description"

# Reset to that commit
git reset --hard <commit-hash>
```

## Useful Aliases

Add to `.gitconfig` for shortcuts:
```
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    unstage = restore --staged
    last = log -1 HEAD
    visual = log --graph --oneline --decorate --all
```

Usage:
```bash
git st              # Instead of git status
git co -b feature   # Instead of git checkout -b feature
```

## Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Cheat Sheet](https://github.github.com/training-kit/downloads/github-git-cheat-sheet.pdf)

## Support

Questions? See:
1. `CONTRIBUTING.md` - Contribution guidelines
2. `.github/copilot-instructions.md` - Architecture documentation
3. Team Slack/Discord
