# 📊 VS Code Setup - Visual Overview

## 🎯 Setup Flow Diagram

```
START HERE: You Open VS Code
│
├─→ 1. Run Setup Script
│   └─→ ./setup-vscode.ps1 (Windows)
│       or verify-env-setup.sh (Linux/Mac)
│
├─→ 2. Configure Environment
│   └─→ Copy .env.example → .env.local
│       └─→ Fill in API keys
│
├─→ 3. Install Dependencies
│   └─→ npm install or pnpm install
│       └─→ Automatically installs node_modules
│
├─→ 4. Start Development
│   └─→ npm run dev
│       └─→ Server runs on http://localhost:3000
│
└─→ 5. Optional: Install VS Code Extensions
    └─→ When prompted, click "Install All"
        └─→ Or install individually from Extensions panel
```

---

## 🗂️ Project Structure

```
d:\Labs OS\
│
├── 📄 VS_CODE_SETUP_INDEX.md          ← START HERE (main index)
├── 📄 VS_CODE_SETUP_SUMMARY.md        ← This page
│
└── LitreeLabsFirebase-master/         ← Main project folder
    │
    ├── 🔧 .vscode/                    ← VS Code Configuration
    │   ├── settings.json              ← Editor settings
    │   ├── launch.json                ← Debug configurations
    │   ├── tasks.json                 ← Build tasks
    │   ├── extensions.json            ← Recommended extensions
    │   └── gitlens.json               ← Git configuration
    │
    ├── 📚 Documentation
    │   ├── VS_CODE_SETUP_GUIDE.md     ← Complete guide (60+ sections)
    │   ├── VS_CODE_SETUP_COMPLETE.md  ← Setup checklist
    │   ├── QUICK_REFERENCE.md         ← Quick reference card
    │   └── .env.local.setup.example   ← Environment variables explained
    │
    ├── 🚀 Automation Scripts
    │   ├── setup-vscode.ps1           ← Windows setup script
    │   └── verify-env-setup.sh        ← Linux/Mac verification
    │
    ├── 🔐 Configuration
    │   ├── .env.example               ← Template (example keys)
    │   ├── .env.local                 ← Your actual config (create this)
    │   ├── next.config.ts             ← Next.js config
    │   └── tsconfig.json              ← TypeScript config
    │
    ├── 📦 Dependencies
    │   ├── package.json               ← All dependencies listed
    │   ├── pnpm-lock.yaml             ← Lock file
    │   └── node_modules/              ← Installed packages (run npm install)
    │
    ├── 🎨 Application
    │   ├── app/                       ← Next.js pages
    │   ├── components/                ← React components
    │   ├── lib/                       ← Utilities & helpers
    │   ├── context/                   ← React context
    │   ├── public/                    ← Static files
    │   └── scripts/                   ← Helper scripts
    │
    └── ⚙️ Other Files
        ├── eslint.config.mjs          ← Linting rules
        ├── postcss.config.mjs         ← CSS processing
        ├── firebase.json              ← Firebase config
        └── vercel.json                ← Vercel config
```

---

## 📈 Configuration Coverage

```
✅ EDITOR
  ├── Auto-formatting (Prettier)
  ├── Linting (ESLint)
  ├── Color syntax highlighting
  ├── IntelliSense & auto-complete
  └── Code snippets

✅ TYPESCRIPT
  ├── Strict type checking
  ├── Inlay hints for types
  ├── Code lens for references
  ├── Auto-imports
  └── Parameter hints

✅ DEBUGGING
  ├── Server-side (Node.js)
  ├── Client-side (Chrome)
  ├── Full-stack compound
  ├── Breakpoints & watch
  └── Console integration

✅ TASKS & AUTOMATION
  ├── Development server (npm run dev)
  ├── Production build (npm run build)
  ├── Linting (npm run lint)
  ├── Type checking (npm run typecheck)
  ├── Dependencies (npm install)
  ├── Firebase emulator
  └── Docker build

✅ VERSION CONTROL
  ├── Git integration
  ├── GitLens configuration
  ├── Blame annotations
  ├── Commit history
  └── GitHub integration

✅ EXTENSIONS
  ├── ESLint
  ├── Prettier
  ├── TypeScript
  ├── Tailwind CSS
  ├── GitLens
  ├── GitHub Copilot
  └── Python (for scripts)

✅ FRAMEWORKS
  ├── Next.js (development & production)
  ├── React & JSX/TSX
  ├── Firebase
  ├── Stripe
  └── Tailwind CSS
```

---

## 🔄 Development Workflow

```
TYPICAL DAY:

1. MORNING
   ├── npm run dev          → Start dev server
   ├── Open .../localhost:3000
   └── Code away!

2. WHILE CODING
   ├── Ctrl+Shift+P         → Run commands
   ├── Ctrl+P               → Quick file open
   ├── F2                   → Rename symbol
   ├── Ctrl+H               → Find & replace
   ├── Auto-save triggers   → Prettier formats code
   └── ESLint checks        → Catches errors

3. DEBUGGING ISSUES
   ├── Click line number    → Set breakpoint
   ├── F5                   → Start debugging
   ├── F10/F11              → Step through code
   ├── Hover over variable  → Inspect value
   └── Debug console        → Evaluate expressions

4. BEFORE COMMITTING
   ├── npm run lint-fix     → Fix linting
   ├── npm run typecheck    → Verify types
   ├── npm run build        → Test production build
   ├── git add .            → Stage changes
   ├── git commit -m "msg"  → Save locally
   └── git push             → Send to GitHub

5. END OF DAY
   ├── All changes pushed
   ├── No errors in console
   ├── Tests passing (when available)
   └── Ready for tomorrow!
```

---

## 🎮 Keyboard Shortcuts - By Use Case

### Quick Navigation
```
Ctrl+P                 → Find any file quickly
Ctrl+Shift+P           → Command palette (do anything)
Ctrl+G                 → Go to line number
Ctrl+F                 → Find text in file
Ctrl+H                 → Find & replace
```

### Editing
```
Ctrl+/                 → Comment/uncomment line
Ctrl+Shift+L           → Select all occurrences
Alt+Up/Down            → Move line up/down
Alt+Shift+Down         → Duplicate line
Shift+Alt+F            → Format document
Ctrl+Shift+I           → Format selection
```

### TypeScript & Code Intelligence
```
F12                    → Go to definition
Ctrl+Shift+F12         → Find all references
F2                     → Rename symbol
Ctrl+K Ctrl+X          → Delete line
Ctrl+K Ctrl+C          → Format code block
```

### Debugging
```
F5                     → Start/Resume debugging
Shift+F5               → Stop debugging
F9                     → Toggle breakpoint
F10                    → Step over
F11                    → Step into
Shift+F11              → Step out
Ctrl+Shift+D           → Open Debug panel
Ctrl+Shift+Y           → Open Debug Console
```

### VS Code UI
```
Ctrl+B                 → Toggle sidebar
Ctrl+`                 → Toggle integrated terminal
Ctrl+Shift+E           → Explorer (files)
Ctrl+Shift+G           → Git (source control)
Ctrl+Shift+D           → Debugger
Ctrl+Shift+X           → Extensions
Ctrl+Shift+J           → Toggle panel (bottom)
```

### Splitting & Windows
```
Ctrl+\                 → Split editor horizontally
Ctrl+K Ctrl+\          → Split editor vertically
Ctrl+1/2/3             → Focus different editor groups
Ctrl+K Ctrl+W          → Close current editor
Ctrl+K Ctrl+Shift+W    → Close all editors
```

---

## 🔑 API Keys Setup Flow

```
1. FIREBASE
   └─ Go to: https://console.firebase.google.com
      ├─ Create project or select existing
      ├─ Settings → Project settings
      ├─ Copy: Project ID, API Key, Auth Domain, etc.
      └─ Paste into .env.local → FIREBASE_*

2. STRIPE
   └─ Go to: https://dashboard.stripe.com/apikeys
      ├─ Get test or live keys
      ├─ Copy: Secret Key, Publishable Key
      └─ Paste into .env.local → STRIPE_*

3. OPENAI
   └─ Go to: https://platform.openai.com/api-keys
      ├─ Create new secret key
      ├─ Copy key
      └─ Paste into .env.local → OPENAI_API_KEY

4. (OPTIONAL) GOOGLE AI
   └─ Go to: https://makersuite.google.com/app/apikey
      ├─ Create API key
      ├─ Copy key
      └─ Paste into .env.local → NEXT_PUBLIC_GOOGLE_AI_API_KEY

5. (OPTIONAL) MICROSOFT 365
   └─ Go to: https://portal.azure.com
      ├─ Create app registration
      ├─ Get: Client ID, Secret, Tenant ID
      └─ Paste into .env.local → MICROSOFT_*

6. DONE!
   └─ Save .env.local
      └─ Run npm run dev
         └─ Your app can now use these services!
```

---

## 💡 Tips for Success

```
✨ PRODUCTIVITY TIPS

1. Use Command Palette (Ctrl+Shift+P) for everything
   └─ You don't need to remember all shortcuts!

2. Install extensions suggested by VS Code
   └─ Better language support & productivity

3. Use keyboard shortcuts instead of mouse
   └─ Much faster once you learn them!

4. Customize keybindings to your preference
   └─ Ctrl+Shift+P → Preferences: Open Keyboard Shortcuts

5. Save workspace layout you like
   └─ It automatically remembers your setup

6. Use source control panel (Ctrl+Shift+G)
   └─ Much easier than command line for beginners

7. Keep debug console open (Ctrl+Shift+Y)
   └─ Great for monitoring logs while debugging

8. Use multiple terminals
   └─ One for dev server, one for git, one for lint

9. Pin important files to the sidebar
   └─ Right-click file → Pin

10. Use diff view for reviewing changes
    └─ Git panel → Click file to see before/after
```

---

## 🚀 From Setup to Production

```
PHASE 1: LOCAL DEVELOPMENT (You Are Here)
│
├── ✅ VS Code fully configured
├── ✅ All tools installed
├── ✅ Environment variables set up
└── → npm run dev → http://localhost:3000

PHASE 2: TESTING
│
├── ✅ npm run build (test production build)
├── ✅ npm run lint-fix (fix all issues)
├── ✅ npm run typecheck (no TypeScript errors)
└── → All green ✅

PHASE 3: VERSION CONTROL
│
├── ✅ git add . (stage changes)
├── ✅ git commit -m "..." (save locally)
└── → git push (send to GitHub)

PHASE 4: DEPLOYMENT
│
├── ✅ Vercel auto-deploys from main branch
├── ✅ Firebase cloud functions deploy
└── → Live on the internet! 🌍

That's it! You've shipped it!
```

---

## 📞 Quick Help

| Problem | Solution |
|---------|----------|
| Port 3000 in use | `$env:PORT=3001; npm run dev` |
| TypeScript error | `Ctrl+Shift+P → TypeScript: Reload` |
| Extensions missing | `Ctrl+Shift+P → Developer: Reload Window` |
| Git issues | Run setup script again |
| npm won't run | Check Node.js installed: `node --version` |

---

**Status**: ✅ Setup Complete  
**Next Step**: Run `./setup-vscode.ps1`  
**Time to Start**: 5 minutes  
**Location**: `d:\Labs OS\LitreeLabsFirebase-master`

🎉 **You're ready to code!** 🎉
