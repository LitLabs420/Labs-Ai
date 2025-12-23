# 🚀 Labs OS - Complete VS Code Setup

**Status**: ✅ **SETUP COMPLETE**  
**Date**: December 12, 2025  
**Ready For**: Development, Debugging, Deployment

---

## 📖 Documentation Index

### Quick Links
| What Do You Want To Do? | Read This |
|------------------------|-----------|
| 🎯 Get Started Quickly | [`QUICK_START.md`](#quick-start) below |
| 📚 Complete Setup Guide | [VS_CODE_SETUP_GUIDE.md](./LitreeLabsFirebase-master/VS_CODE_SETUP_GUIDE.md) |
| ✅ Setup Status Report | [VS_CODE_SETUP_COMPLETE.md](./LitreeLabsFirebase-master/VS_CODE_SETUP_COMPLETE.md) |
| 🔧 Configure Environment | [.env.local.setup.example](./LitreeLabsFirebase-master/.env.local.setup.example) |
| 🚀 Run Setup Script | [setup-vscode.ps1](./LitreeLabsFirebase-master/setup-vscode.ps1) |

---

## ⚡ Quick Start

### 1️⃣ Copy This & Run It (Windows PowerShell)
```powershell
cd "d:\Labs OS\LitreeLabsFirebase-master"
./setup-vscode.ps1
```

### 2️⃣ Configure API Keys
```bash
# Copy example file
Copy-Item .env.example .env.local

# Open and fill in your keys
code .env.local
```

### 3️⃣ Start Development
```bash
npm run dev
```

Visit: `http://localhost:3000` 🎉

---

## 📋 What Was Set Up For You

### VS Code Configuration
✅ `.vscode/settings.json` - Editor & TypeScript settings  
✅ `.vscode/launch.json` - Debug configurations (Node, Chrome)  
✅ `.vscode/tasks.json` - Build & test tasks  
✅ `.vscode/extensions.json` - Recommended extensions  
✅ `Labs-OS.code-workspace` - Workspace file  

### Documentation
✅ `VS_CODE_SETUP_GUIDE.md` - Complete guide (60+ sections)  
✅ `VS_CODE_SETUP_COMPLETE.md` - Setup status & checklist  
✅ `.env.local.setup.example` - Detailed environment variables  

### Automation Scripts
✅ `setup-vscode.ps1` - Automated Windows setup (PowerShell)  
✅ `verify-env-setup.sh` - Linux/Mac verification (Bash)  

---

## 🎯 Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Check for linting errors
npm run lint-fix         # Auto-fix linting issues
npm run typecheck        # Validate TypeScript

# Dependencies
npm install              # Install dependencies
npm update               # Update to latest versions
pnpm install             # Or use pnpm (faster)

# Debugging
npm run dev              # Then press F5 in VS Code

# Git & Deployment
git add .                # Stage changes
git commit -m "msg"      # Commit
git push                 # Push to main
```

---

## 🔍 Project Structure

```
d:\Labs OS\
├── LitreeLabsFirebase-master/          ← Main project
│   ├── .vscode/                        ← VS Code configs
│   │   ├── settings.json               ✅ Editor settings
│   │   ├── launch.json                 ✅ Debug configs
│   │   ├── tasks.json                  ✅ Build tasks
│   │   ├── extensions.json             ✅ Recommended extensions
│   │   └── gitlens.json                ✅ Git config
│   ├── app/                            ← Next.js pages
│   ├── components/                     ← React components
│   ├── lib/                            ← Utilities
│   ├── public/                         ← Static files
│   ├── node_modules/                   ← Dependencies
│   ├── .env.local                      ← Your config (create from .env.example)
│   ├── .env.example                    ← Template
│   ├── .env.local.setup.example        ✅ Detailed template
│   ├── next.config.ts                  ← Next.js config
│   ├── tsconfig.json                   ← TypeScript config
│   ├── eslint.config.mjs               ← Linting rules
│   ├── package.json                    ← Dependencies list
│   ├── pnpm-lock.yaml                  ← Lock file
│   ├── VS_CODE_SETUP_GUIDE.md          ✅ Complete guide
│   ├── VS_CODE_SETUP_COMPLETE.md       ✅ Setup status
│   ├── Labs-OS.code-workspace          ✅ Workspace config
│   ├── setup-vscode.ps1                ✅ Setup script
│   └── verify-env-setup.sh             ✅ Verification
├── BUILD_STATUS_FINAL.md               ← Build status
├── MASTER_COPILOT_PROMPT.md            ← AI reference
└── README.md                           ← Project readme
```

---

## 💻 VS Code Features Now Enabled

### Debugging
- **F5** - Start debugging
- **F10** - Step over
- **F11** - Step into
- **Ctrl+Shift+D** - Debug panel

### Code Editing
- **Ctrl+Shift+P** - Command palette
- **Ctrl+P** - Quick file open
- **Ctrl+F** - Find
- **Ctrl+H** - Find & replace
- **Ctrl+Shift+L** - Multi-select
- **F2** - Rename symbol

### Formatting
- **Ctrl+Shift+I** - Format document
- **Ctrl+,** - Settings
- **Alt+Shift+F** - Format (auto-fix)

### Git & GitHub
- **Ctrl+Shift+G** - Source control
- **Ctrl+Shift+M** - Merge conflicts
- **Ctrl+K Ctrl+C** - Commit

---

## 🔐 API Keys You'll Need

| Service | Where to Get | Required | Env Variable |
|---------|-------------|----------|-------------|
| Firebase | https://console.firebase.google.com | ✅ | `FIREBASE_*` |
| Stripe | https://dashboard.stripe.com/apikeys | ✅ | `STRIPE_*` |
| OpenAI | https://platform.openai.com/api-keys | ✅ | `OPENAI_API_KEY` |
| Google AI | https://makersuite.google.com/app/apikey | ⚠️ | `NEXT_PUBLIC_GOOGLE_AI_API_KEY` |
| Azure AD | https://portal.azure.com | ⚠️ | `MICROSOFT_*` |
| PayPal | https://developer.paypal.com | ⚠️ | `PAYPAL_*` |
| Sentry | https://sentry.io | ⚠️ | `SENTRY_DSN` |

**Legend**: ✅ = Required, ⚠️ = Optional

---

## 🚨 Troubleshooting

### Dev Server Won't Start
```bash
# Check if port is in use
# Try different port:
$env:PORT=3001
npm run dev
```

### TypeScript Errors in IDE
```
Ctrl+Shift+P → "TypeScript: Reload Projects"
```

### Extensions Not Showing
```
Ctrl+Shift+P → "Developer: Reload Window"
```

### Git Issues
```
Run: git config --global user.name "Your Name"
     git config --global user.email "your@email.com"
```

---

## 📚 Documentation Files

Located in `LitreeLabsFirebase-master/`:

- **VS_CODE_SETUP_GUIDE.md** (60+ sections)
  - Installation steps
  - Keyboard shortcuts
  - Debugging guide
  - Environment setup
  - Troubleshooting
  - Tips & tricks

- **VS_CODE_SETUP_COMPLETE.md**
  - Setup checklist
  - Files created
  - Settings configured
  - Next steps
  - Support info

- **.env.local.setup.example**
  - All environment variables explained
  - Where to get API keys
  - Production vs development
  - Feature flags

---

## ✨ Next Steps

### Now (5 minutes)
1. Run `./setup-vscode.ps1`
2. Copy `.env.example` to `.env.local`
3. Run `npm run dev`

### Soon (30 minutes)
1. Fill in API keys in `.env.local`
2. Install VS Code extensions
3. Test debugging with F5

### Later (1+ hour)
1. Explore project structure
2. Read complete setup guide
3. Configure Azure AD (optional)
4. Set up Stripe webhooks (optional)

---

## 🎉 You're Ready!

Your VS Code workspace is **fully configured** with:
- ✅ Debug configurations
- ✅ Build tasks
- ✅ Code formatting
- ✅ TypeScript support
- ✅ ESLint checking
- ✅ Git integration
- ✅ GitHub Copilot ready

**Start developing now:**
```bash
npm run dev
```

---

## 🆘 Need Help?

1. **Setup Issues**: Read `VS_CODE_SETUP_GUIDE.md`
2. **Configuration**: Check `VS_CODE_SETUP_COMPLETE.md`
3. **Environment**: Review `.env.local.setup.example`
4. **Git Issues**: Check `.git/config` or run setup script again

---

**Status**: ✅ Complete  
**Last Updated**: December 12, 2025  
**Ready For**: Development 🚀

