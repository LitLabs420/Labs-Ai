# VS Code Complete Setup Guide

**Status**: ✅ Ready for Configuration  
**Last Updated**: December 12, 2025

---

## 📋 Quick Setup Checklist

- [ ] Run `./setup-vscode.ps1` (Windows PowerShell)
- [ ] Install Node.js dependencies (`npm install` or `pnpm install`)
- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in your API keys in `.env.local`
- [ ] Install recommended VS Code extensions
- [ ] Restart VS Code
- [ ] Run `npm run dev` to start development server

---

## 🚀 Getting Started in 5 Minutes

### 1. Run Automated Setup Script
```powershell
# Windows PowerShell
./setup-vscode.ps1

# Or bash
bash verify-env-setup.sh
```

This script checks:
- ✅ Node.js and npm/pnpm installation
- ✅ Git configuration
- ✅ VS Code settings and launch configurations
- ✅ Environment file setup
- ✅ Dependencies installation

### 2. Install Dependencies
```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 3. Configure Environment
```bash
# Copy example file to actual env file
cp .env.example .env.local

# Edit .env.local with your API keys
code .env.local
```

Required API keys:
- **Firebase**: `FIREBASE_PROJECT_ID`, `FIREBASE_API_KEY`, etc.
- **Stripe**: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **OpenAI**: `OPENAI_API_KEY`
- **Google AI**: `NEXT_PUBLIC_GOOGLE_AI_API_KEY`

### 4. Install VS Code Extensions
Click on Extensions (Ctrl+Shift+X) and search for these:
```
ESLint (dbaeumer.vscode-eslint)
Prettier (esbenp.prettier-vscode)
TypeScript (ms-vscode.vscode-typescript-next)
Tailwind CSS (bradlc.vscode-tailwindcss)
GitLens (eamodio.gitlens)
GitHub Copilot (GitHub.copilot)
Copilot Chat (GitHub.copilot-chat)
```

Or install all at once:
```bash
# VS Code will detect .vscode/extensions.json and suggest installations
# Click "Install All" when prompted
```

### 5. Start Development
```bash
# Start dev server
npm run dev

# In another terminal, watch for TypeScript errors
npm run typecheck

# In another terminal, check linting
npm run lint
```

Visit `http://localhost:3000` 🎉

---

## 🎯 VS Code Configuration Files

### `.vscode/settings.json`
- **Purpose**: Editor and workspace settings
- **Configured for**:
  - TypeScript/JavaScript with strict type checking
  - Prettier auto-formatting on save
  - ESLint error checking
  - Tailwind CSS intellisense
  - Git features and authentication

### `.vscode/launch.json`
- **Purpose**: Debug configurations
- **Includes**:
  - Next.js server debugging
  - Next.js client debugging (Chrome)
  - Node.js script debugging
  - Jest testing
  - Full-stack debugging compound

### `.vscode/tasks.json`
- **Purpose**: Custom build and run tasks
- **Available tasks**:
  - `npm: dev` - Start development server
  - `npm: build` - Build for production
  - `npm: lint` - Check ESLint
  - `npm: lint-fix` - Auto-fix linting issues
  - `npm: typecheck` - TypeScript validation
  - `pnpm: install` - Install dependencies
  - Firebase emulator tasks
  - Docker build tasks

### `.vscode/extensions.json`
- **Purpose**: Recommended extensions list
- **Auto-suggests** extensions when opening workspace

### `.vscode/gitlens.json`
- **Purpose**: GitLens configuration
- **Features**:
  - Code blame annotations
  - Git history
  - Commit analysis

---

## 💻 Running Common Tasks

### Using Terminal (Cmd+`)
```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run lint         # Check for errors
npm run lint-fix     # Auto-fix linting issues
npm run typecheck    # Validate TypeScript
npm start            # Start production server
pnpm install         # Install/update dependencies
```

### Using VS Code Tasks (Ctrl+Shift+B)
1. Open Command Palette: `Ctrl+Shift+P`
2. Type "Run Task"
3. Select task to run:
   - `npm: dev` - Start dev server
   - `npm: build` - Build project
   - `npm: lint` - Check linting
   - `npm: typecheck` - Check types

### Using Debug (F5)
1. Press `F5` or click Debug in sidebar
2. Select configuration:
   - **Next.js: Full Stack** - Debug both server and client
   - **Next.js: debug server** - Server-only debugging
   - **Next.js: debug client** - Browser debugging

---

## 🔧 Advanced Configuration

### Add Custom Snippet
1. `Ctrl+Shift+P` → "Preferences: Configure User Snippets"
2. Choose language (e.g., `typescript` or `typescriptreact`)
3. Add your snippets

Example React component snippet:
```json
{
  "React Component": {
    "prefix": "rfc",
    "body": [
      "import React from 'react';",
      "",
      "interface Props {",
      "  $1",
      "}",
      "",
      "export function ${2:ComponentName}(props: Props) {",
      "  return (",
      "    <div>",
      "      {/* $3 */}",
      "    </div>",
      "  );",
      "}"
    ]
  }
}
```

### Configure Auto-Save
Edit `.vscode/settings.json`:
```json
{
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000
}
```

### Add Custom Theme
1. `Ctrl+Shift+P` → "Preferences: Color Theme"
2. Browse and install themes from Extensions

Recommended themes:
- One Dark Pro
- Dracula Official
- GitHub Light/Dark
- Nord

---

## 🐛 Debugging

### Set Breakpoints
1. Click in the gutter to the left of line numbers
2. Red dot appears
3. Press F5 to start debugging
4. Execution pauses at breakpoint

### Debug Console
- View variables: Hover over code or use Debug Console
- View call stack: Stack Trace panel
- Watch expressions: Add in Watch panel

### Common Debugging Tips
```typescript
// Use debugger statement
debugger; // Execution pauses here when debugging

// Use console methods
console.log('Value:', value);
console.table(arrayOfObjects);
console.error('Error:', error);

// Use conditional breakpoints (right-click breakpoint)
// Expression: count > 10
```

---

## 📚 Useful Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Command Palette | `Ctrl+Shift+P` |
| Quick File Open | `Ctrl+P` |
| Find | `Ctrl+F` |
| Find & Replace | `Ctrl+H` |
| Format Document | `Ctrl+Shift+I` |
| Toggle Sidebar | `Ctrl+B` |
| Terminal | `` Ctrl+` `` |
| Debug (F5) | `F5` |
| Step Over | `F10` |
| Step Into | `F11` |
| Continue | `F5` |
| Split Editor | `Ctrl+\` |
| Toggle Comment | `Ctrl+/` |
| Rename Symbol | `F2` |
| Go to Definition | `F12` |
| Go to References | `Ctrl+Shift+F12` |

---

## 🔗 Environment Variables

### Development (`.env.local`)
```bash
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_API_KEY=your_api_key
STRIPE_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
OPENAI_API_KEY=sk_your_key
# ... more keys
```

### Production (Set in Vercel/Deployment)
Same variables as development, but with production API keys:
```bash
FIREBASE_PROJECT_ID=production_project_id
STRIPE_SECRET_KEY=sk_live_your_key
OPENAI_API_KEY=sk_prod_key
# ... etc
```

---

## 🚨 Troubleshooting

### Issue: Extensions not loading
**Solution**: 
```bash
# Restart VS Code
# Kill all electron processes if necessary
pkill -f "code.exe" # Windows
# Try: Code > Help > Restart VS Code
```

### Issue: TypeScript errors in IDE but code runs
**Solution**: 
1. Open Command Palette: `Ctrl+Shift+P`
2. Type: "TypeScript: Reload Projects"
3. Or restart VS Code

### Issue: Prettier not formatting on save
**Solution**:
1. Check `.vscode/settings.json` has `"editor.formatOnSave": true`
2. Install Prettier extension
3. Set as default formatter

### Issue: ESLint showing false errors
**Solution**:
1. Run: `npm run lint-fix`
2. Restart VS Code
3. Check `.eslintrc` configuration

### Issue: Debug breakpoints not working
**Solution**:
1. Ensure `npm run dev` is running
2. Check "Debug Console" instead of Terminal
3. Make sure debugging configuration is selected
4. Try: `Ctrl+Shift+D` → Select "Next.js: Full Stack"

---

## 📖 Learn More

### VS Code Documentation
- [Official Docs](https://code.visualstudio.com/docs)
- [Debugging Guide](https://code.visualstudio.com/docs/editor/debugging)
- [Snippets](https://code.visualstudio.com/docs/editor/userdefinedsnippets)

### Next.js Documentation
- [Next.js Official Docs](https://nextjs.org/docs)
- [Debugging Next.js](https://nextjs.org/docs/advanced-features/debugging)

### TypeScript
- [TypeScript Handbook](https://www.typescripthandbook.org/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

## ✨ Tips & Tricks

1. **Use Copilot Chat**: `Ctrl+Shift+I` to ask AI questions about code
2. **Multi-cursor editing**: `Ctrl+D` to select next occurrence
3. **Refactor**: `Ctrl+Shift+R` to open refactoring menu
4. **Format all files**: Command Palette → "Format Document"
5. **Organize imports**: `Shift+Alt+O` (with Prettier/ESLint)

---

## 🤝 Contributing

Please follow the configured ESLint and Prettier rules when contributing:
```bash
# Before committing
npm run lint-fix      # Auto-fix linting issues
npm run typecheck     # Verify TypeScript
npm run build         # Test production build
```

---

Last configured: December 12, 2025
