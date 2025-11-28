# Team Onboarding Guide

Welcome to GLAMFLOW AI! This guide will get you set up in 15 minutes.

## 🚀 Quick Start (15 minutes)

### 1. Clone & Setup (5 min)
```bash
# Clone repository
git clone https://github.com/yourusername/glamflow-ai.git
cd glamflow-ai

# Install dependencies
npm install
cd functions && npm install && cd ..

# Install Firebase CLI globally (one-time)
npm install -g firebase-tools
```

### 2. Configure Git (2 min)
```bash
# Set your git identity
git config user.name "Your Full Name"
git config user.email "your-email@example.com"
```

### 3. Authenticate with Firebase (3 min)
```bash
# Login to Google
firebase login

# Select the GLAMFLOW AI project
firebase use studio-4627045237-a2fe9

# Verify connection
firebase projects:list
```

### 4. Start Developing (5 min)
```bash
# Create your feature branch
git checkout -b feature/your-feature-name

# Start local development
firebase emulators:start
# Open http://localhost:5000 in browser
```

---

## 📚 Essential Documentation

Read these in order:

1. **[README.md](README.md)** (5 min)
   - Project overview, features, tech stack
   - Quick deployment instructions

2. **[CONTRIBUTING.md](CONTRIBUTING.md)** (10 min)
   - Commit message conventions
   - Branch naming
   - Pull request process
   - Security guidelines

3. **[GIT_WORKFLOW.md](GIT_WORKFLOW.md)** (15 min)
   - Git commands and best practices
   - Daily workflow
   - Emergency procedures
   - Undoing mistakes

4. **[.github/copilot-instructions.md](.github/copilot-instructions.md)** (20 min)
   - Architecture deep dive
   - Firebase patterns
   - Developer workflows
   - Code patterns

---

## 🛠️ Development Setup

### IDE Setup (VSCode Recommended)

#### Extensions to Install
```
firebase.firebase
stripe.vscode-stripe
ms-python.python
es7-react-js-snippets
```

#### VSCode Settings
Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "javascript.format.enable": true,
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "files.exclude": {
    "node_modules": true,
    ".firebase": true,
    ".env": true
  }
}
```

### Local Firebase Emulator

```bash
# Start emulator suite
firebase emulators:start

# In separate terminal, deploy local functions
firebase deploy --only functions
```

Then visit: http://localhost:5000 for the frontend
And: http://localhost:4000 for Firebase Emulator UI

### Environment Variables

Create `functions/.env.local`:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## 🔑 API Keys & Secrets

### Getting Stripe Test Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Enable "Test Mode" (top right)
3. Go to API Keys
4. Copy test keys
5. Use in local `.env.local` file

### Firebase Configuration

Keys are already configured in Firebase Console. Don't need local setup.

### Never Commit Secrets!

```bash
# This is checked by pre-commit hook:
✅ Allowed: variables, functions, logic
❌ Blocked: passwords, keys, tokens, credentials

# If you accidentally commit a secret:
git reset --soft HEAD~1
# Remove the secret
git add .
git commit -m "fix: remove exposed secret"
```

---

## 💻 Daily Development Workflow

### Starting Work
```bash
# Update local copy
git pull origin master

# Create feature branch
git checkout -b feature/descriptive-name

# Start emulator
firebase emulators:start
```

### Making Changes
```bash
# Edit files in your IDE
# Changes auto-reflect in http://localhost:5000

# Check what you changed
git status
git diff

# Commit frequently with descriptive messages
git add <files>
git commit -m "feat(scope): description"
# See CONTRIBUTING.md for conventions
```

### Submitting Changes
```bash
# Push to GitHub
git push origin feature/descriptive-name

# Create Pull Request on GitHub
# - Fill out PR template
# - Request 1-2 reviewers
# - Wait for automated tests to pass
# - Address feedback
# - Merge when approved
```

### After Merge
```bash
# Update local master
git pull origin master

# Delete local feature branch
git branch -d feature/descriptive-name
```

---

## 🧪 Testing

### Local Testing

```bash
# Firebase Emulator UI
http://localhost:4000

# Frontend App
http://localhost:5000

# Test account (in emulator):
Email: test@example.com
Password: test123456
```

### Stripe Test Cards

| Card | Status | Use Case |
|------|--------|----------|
| 4242 4242 4242 4242 | Success | Normal payment |
| 4000 0000 0000 0002 | Decline | Declined card |
| 4000 0025 0000 3155 | CVC Fail | CVC mismatch |

Expiry: Any future date
CVC: Any 3 digits

### Cloud Functions Testing

```bash
# View real-time logs
firebase functions:log

# Test webhook locally
curl -X POST http://localhost:5001/project/region/handleStripeWebhook \
  -H "Content-Type: application/json" \
  -d '{"type":"charge.succeeded","data":{}}'
```

---

## 🚀 Deployment

### Automatic (Preferred)
```bash
# Just push to master!
git push origin master

# GitHub Actions automatically:
# 1. Runs security checks
# 2. Builds and tests
# 3. Deploys to Firebase Hosting
# 4. Deploys Cloud Functions
```

### Manual
```bash
# Deploy only frontend
firebase deploy --only hosting --force

# Deploy only functions
firebase deploy --only functions

# Deploy everything
firebase deploy --force

# Check deployment
firebase projects:list
firebase hosting:channel:list
```

---

## 🐛 Debugging

### Browser Console Issues
```javascript
// Check authentication
firebase.auth().currentUser

// Check Firestore connection
db.collection('users').get()

// View recent errors
console.log('Last 10 errors:', errorLog.slice(-10))
```

### Cloud Functions Issues
```bash
# View function logs
firebase functions:log --limit 50

# Search specific logs
firebase functions:log --limit 100 | grep "error"
```

### Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select `studio-4627045237-a2fe9` project
3. Check:
   - **Authentication**: Users, sessions
   - **Firestore**: Collections, documents, rules
   - **Functions**: Logs, performance
   - **Hosting**: Deployments, versions

---

## 📞 Getting Help

### Documentation
1. **Architecture**: `.github/copilot-instructions.md`
2. **Git Guide**: `GIT_WORKFLOW.md`
3. **Contributing**: `CONTRIBUTING.md`
4. **Security**: `SECURITY.md`
5. **Deployment**: `DEPLOYMENT_GUIDE.md`

### Common Issues

**"Pre-commit hook blocked my commit"**
```bash
# Remove accidentally staged secrets
git restore --staged <file>
# Fix the file
git add <file>
git commit -m "..."
```

**"Can't authenticate with Firebase"**
```bash
# Re-login
firebase logout
firebase login

# Select project
firebase use studio-4627045237-a2fe9
```

**"Port 5000 already in use"**
```bash
# Find what's using it
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process or use different port
firebase emulators:start --project studio-4627045237-a2fe9 --port 5001
```

### Team Contacts
- **Tech Lead**: dyingbreed243@gmail.com
- **Security**: dyingbreed243@gmail.com
- **Slack/Discord**: #glamflow-ai channel

---

## ✅ Onboarding Checklist

- [ ] Git configured with your name/email
- [ ] Firebase CLI installed and authenticated
- [ ] Repository cloned locally
- [ ] Dependencies installed (`npm install`)
- [ ] Read CONTRIBUTING.md
- [ ] Read GIT_WORKFLOW.md
- [ ] Created first feature branch
- [ ] Started Firebase emulator successfully
- [ ] Opened http://localhost:5000 in browser
- [ ] Tested with test Firebase account
- [ ] Posted introduction in #glamflow-ai
- [ ] Asked any clarifying questions
- [ ] Ready for first task!

---

## 🎯 First Task Ideas

1. **Fix a known bug** (see GitHub Issues)
2. **Add a small feature** (see GitHub Projects)
3. **Improve documentation** (fix typos, add examples)
4. **Add tests** (see testing section)
5. **Optimize performance** (profile code, reduce bundle size)

Pick one, create a branch, submit a PR, get feedback, and merge!

---

**Questions?** Post in #glamflow-ai or email the tech lead.

**Welcome aboard! 🚀**
