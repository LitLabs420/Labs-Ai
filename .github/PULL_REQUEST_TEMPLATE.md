## Description
Briefly describe the changes in this pull request.

## Related Issues
Closes #(issue number)

## Type of Change
- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 🔐 Security improvement
- [ ] 📚 Documentation
- [ ] 🎨 Style/UI
- [ ] ♻️ Refactor
- [ ] 🚀 Performance

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing Done
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on Safari
- [ ] Tested on mobile
- [ ] Tested payment flow (if applicable)
- [ ] Tested with test Firebase project

## Screenshots/Demo (if applicable)
<!-- Add screenshots or GIFs demonstrating the changes -->

## Checklist
- [ ] I've followed the [Contributing Guidelines](CONTRIBUTING.md)
- [ ] I've used [Conventional Commits](https://www.conventionalcommits.org/)
- [ ] I've updated documentation if needed
- [ ] I've added tests (if applicable)
- [ ] I've run `npm audit` and no critical vulnerabilities
- [ ] I've checked for exposed secrets (API keys, credentials)
- [ ] I've reviewed my own code before requesting review
- [ ] I've linked related issues
- [ ] No breaking changes OR breaking changes documented

## Security Review (REQUIRED)
- [ ] No API keys or credentials in code
- [ ] No passwords in commit messages
- [ ] Input validation added for user data
- [ ] XSS/SQL injection vulnerabilities checked
- [ ] Firebase security rules reviewed (if database changes)
- [ ] CORS/CSRF protections considered

## Performance Impact
- [ ] No performance impact
- [ ] Performance impact: ___

## Browser Compatibility
- [ ] Works on all modern browsers
- [ ] Requires polyfills for: ___

## Migration Steps (if applicable)
Instructions for deploying this change:
1. Step 1
2. Step 2
3. Step 3

## Additional Notes
Any additional context or information reviewers should know.

---

**Before submitting**: Run these checks locally
```bash
git diff --staged | grep -i "secret\|password\|key"  # Check for exposed secrets
npm audit                                             # Check dependencies
npm run lint --if-present                             # Lint code
```
