# ⚡ Quick Reference Card - Labs OS Setup

**Print this or bookmark it!**

---

## 🚀 Get Started in 30 Seconds

```bash
cd d:\Labs OS\LitreeLabsFirebase-master
./setup-vscode.ps1
```

Then:
```bash
Copy-Item .env.example .env.local
npm run dev
```

**Visit**: `http://localhost:3000`

---

## 📋 Essential Commands

| Command | What It Does |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run lint` | Check code style |
| `npm run lint-fix` | Auto-fix style issues |
| `npm run typecheck` | Check TypeScript |
| `npm install` | Install dependencies |
| `git add .` | Stage changes |
| `git commit -m "msg"` | Save changes |
| `git push` | Send to GitHub |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+P` | Command Palette |
| `Ctrl+P` | Quick Open File |
| `Ctrl+H` | Find & Replace |
| `Ctrl+/` | Toggle Comment |
| `F5` | Start Debugging |
| `F10` | Step Over |
| `F11` | Step Into |
| `Ctrl+B` | Toggle Sidebar |
| `Ctrl+Shift+I` | Format Document |
| `F2` | Rename Symbol |
| `Ctrl+\` | Split Editor |

---

## 🔑 Required API Keys

1. **Firebase** - https://console.firebase.google.com
2. **Stripe** - https://dashboard.stripe.com/apikeys
3. **OpenAI** - https://platform.openai.com/api-keys

Get these and add to `.env.local`

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `.env.local` | Your API keys (don't commit!) |
| `.vscode/settings.json` | Editor configuration |
| `.vscode/launch.json` | Debug settings |
| `next.config.ts` | Next.js configuration |
| `tsconfig.json` | TypeScript settings |

---

## 🐛 Debug in 3 Steps

1. Click line number to add breakpoint (red dot)
2. Press `F5` to start debugging
3. Hover over variables to inspect

---

## ✅ Quick Checklist

- [ ] Run `./setup-vscode.ps1`
- [ ] Copy `.env.example` to `.env.local`
- [ ] Add API keys to `.env.local`
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Visit `http://localhost:3000`
- [ ] Install VS Code extensions

---

## 📚 Full Documentation

- `VS_CODE_SETUP_GUIDE.md` - Complete guide
- `VS_CODE_SETUP_COMPLETE.md` - Setup status
- `VS_CODE_SETUP_INDEX.md` - Documentation index

---

## 🚨 Common Issues

**Port 3000 in use?**
```bash
$env:PORT=3001; npm run dev
```

**TypeScript errors?**
```
Ctrl+Shift+P → TypeScript: Reload Projects
```

**Extensions not showing?**
```
Ctrl+Shift+P → Developer: Reload Window
```

---

**Status**: ✅ Ready  
**Location**: `d:\Labs OS\LitreeLabsFirebase-master`  
**Next Step**: Run `./setup-vscode.ps1`
