# GLAMFLOW AI - Beauty Business Automation SaaS

[![Deploy to Firebase](https://github.com/yourusername/glamflow-ai/workflows/Deploy%20to%20Firebase/badge.svg)](https://github.com/yourusername/glamflow-ai/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Security: Active](https://img.shields.io/badge/Security-Active-green.svg)](#security)

AI-powered content generation, chatbot management, payment processing, and business workflow automation for beauty professionals.

**Live**: [https://studio-4627045237-a2fe9.web.app](https://studio-4627045237-a2fe9.web.app)

---

## 🎯 Features

- ✨ **AI Content Generation** - Automated social media content creation
- 💬 **Chatbot Management** - Embeddable chatbot for customer engagement
- 💳 **Payment Processing** - Stripe integration with subscription management
- 🤖 **Workflow Automation** - Task automation engine for business processes
- 📊 **Analytics Dashboard** - Real-time business metrics
- 🔐 **Enterprise Security** - Firebase authentication, Firestore security rules, encrypted data

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase CLI
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/glamflow-ai.git
cd glamflow-ai

# Install dependencies
npm install
cd functions && npm install && cd ..

# Configure Firebase
firebase login
firebase use studio-4627045237-a2fe9

# Set environment variables
firebase functions:config:set stripe.secret_key="sk_live_YOUR_KEY"
firebase functions:config:set stripe.publishable_key="pk_live_YOUR_KEY"
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.pass="your-app-password"
```

### Local Development

```bash
# Start local emulator suite
firebase emulators:start

# In another terminal, deploy functions locally
firebase deploy --only functions

# Open http://localhost:5000
```

### Deployment

```bash
# Deploy to Firebase (automatically triggered on push to master)
firebase deploy --force

# Or push to master for automatic CI/CD
git push origin master
```

---

## 📋 Project Structure

```
├── index.html              # Landing page
├── auth.html              # Authentication pages
├── dashboard.html         # Main SPA dashboard
├── chatbot.js             # Embeddable chatbot widget
├── firebase-config.js     # Firebase initialization
├── stripe-config.js       # Stripe payment setup
├── dashboard.js           # Dashboard business logic
├── functions/
│   ├── index.js           # Cloud Functions (webhooks, email, payments)
│   └── package.json       # Backend dependencies
├── firestore.rules        # Database security rules
├── styles.css             # Global styling
└── .github/
    └── workflows/
        └── deploy.yml     # GitHub Actions CI/CD
```

**Detailed documentation**: See `.github/copilot-instructions.md`

---

## 🔐 Security

### Latest Security Fixes
- [CRITICAL] Removed exposed API keys from localStorage
- [HIGH] Fixed XSS vulnerability in dynamic content rendering
- [HIGH] Added error handling with timeouts to async operations
- [MEDIUM] Enhanced webhook signature verification
- [MEDIUM] Added comprehensive input validation

See `SECURITY_FIXES_APPLIED.md` for complete security audit.

### Security Checklist
- ✅ Never commit secrets or API keys
- ✅ Use `firebase functions:config:set` for environment variables
- ✅ Implement Firestore security rules
- ✅ Validate all user input
- ✅ Use HTTPS everywhere
- ✅ Regular security audits

**Report security issues**: See `SECURITY.md` for responsible disclosure

---

## 📖 Documentation

- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute and commit conventions
- **[Git Workflow](GIT_WORKFLOW.md)** - Git commands and best practices
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Production setup instructions
- **[Security Fixes](SECURITY_FIXES_APPLIED.md)** - Detailed security remediation
- **[Architecture](GITHUB/copilot-instructions.md)** - System design and patterns
- **[Changelog](CHANGELOG.md)** - Release notes and version history

---

## 🛠️ Tech Stack

**Frontend**:
- Vanilla JavaScript (ES6+)
- HTML5 & CSS3
- No build tools (static deployment)

**Backend**:
- Firebase Cloud Functions (Node.js)
- Firestore (realtime database)
- Firebase Authentication

**Integrations**:
- Stripe (payment processing)
- Google Analytics 4
- Nodemailer (email service)

**DevOps**:
- Firebase Hosting
- GitHub Actions (CI/CD)
- Google Cloud Platform

---

## 💳 Payment Integration

### Test Mode
```
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits
```

### Production
1. Get Stripe LIVE keys (pk_live_..., sk_live_...)
2. Set via Firebase config:
   ```bash
   firebase functions:config:set stripe.secret_key="sk_live_..."
   firebase deploy --only functions
   ```
3. Create Stripe webhook → Firebase Cloud Function endpoint
4. Test end-to-end with real cards

See `DEPLOYMENT_GUIDE.md` for complete setup.

---

## 📊 Analytics

GA4 tracking implemented via `trackEvent()` wrapper:
```javascript
trackEvent('feature_name', { user_id: currentUser.uid, custom_data: 'value' });
```

Events tracked:
- `signup_funnel` - Authentication flow
- `upgrade_clicked` - Payment CTA
- `subscription_created` - Successful payment
- `chatbot_interaction` - Customer engagement
- `admin_action` - Admin panel usage

---

## 🤝 Contributing

1. Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. Create feature branch: `git checkout -b feature/your-feature`
3. Follow [conventional commits](https://www.conventionalcommits.org/)
4. Submit pull request with description
5. Wait for code review and tests to pass

**Commit Format**:
```
feat(scope): description

- Detailed change 1
- Detailed change 2
- Closes #issue_number
```

---

## 📜 License

MIT License - See LICENSE file for details

---

## 🆘 Support

- **Docs**: `.github/copilot-instructions.md`
- **Issues**: GitHub Issues
- **Slack/Discord**: Team channel
- **Email**: dyingbreed243@gmail.com

---

## 🗺️ Roadmap

- [ ] Advanced AI content templates
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Team collaboration features
- [ ] Advanced analytics (cohort analysis, LTV)
- [ ] API for third-party integrations
- [ ] White-label deployment options

---

## 👥 Team

Built with ❤️ by GLAMFLOW AI team

---

**Last Updated**: November 28, 2025 | **Version**: 1.0.0
