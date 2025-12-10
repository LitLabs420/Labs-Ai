# 📱 Phone Editing - Quick Reference Card

## Three Ways to Edit on Phone

### 1. **Instant Web Editor** (Fastest)
```
GitHub.dev
→ Open: github.dev/LitLabs420/Labs-Ai
→ Click file, edit, commit
→ No setup needed
```

### 2. **GitHub Codespaces** (Best)
```
Codespaces
→ GitHub.com → Code → Codespaces
→ Full VS Code in browser
→ Terminal access included
→ Works great on iPad
```

### 3. **Gitpod** (Free Alternative)
```
Gitpod
→ gitpod.io/#https://github.com/LitLabs420/Labs-Ai
→ Free tier available
→ Good for tablets
```

---

## Most Common Edits

### 💰 Change Pricing
**File:** `lib/tier-system.ts`  
**Find:** `price: '$9'`  
**Change to:** `price: '$19'`  

### ➕ Add Feature to Tier
**File:** `lib/tier-system.ts`  
**Find:** `features: [`  
**Add:** `'New feature here',`  

### 📝 Change Button Text
**File:** `components/ui/premium-button.tsx`  
**Find:** Button label in JSX  
**Edit:** The text directly  

### 🏠 Update Landing Page
**File:** `app/page.tsx`  
**Find:** Any text section  
**Edit:** JSX content  

---

## Git Commands (Mobile)

```bash
# Check what changed
git status

# Stage all changes
git add .

# Create a commit
git commit -m "what you changed"

# Push to GitHub
git push origin master

# Pull latest changes
git pull origin master

# Undo last commit (if needed)
git reset --soft HEAD~1
```

---

## File Locations Cheatsheet

| What | File |
|------|------|
| Pricing tiers | `lib/tier-system.ts` |
| Stripe setup | `.env.local` |
| API endpoints | `app/api/*/route.ts` |
| Pages | `app/*/page.tsx` |
| Components | `components/ui/*.tsx` |
| Database | `prisma/schema.prisma` |
| Types | `types/*.ts` |

---

## Common Issues & Fixes

**"Module not found" error?**
- Usually means missing import
- Check file path spelling
- Use Ctrl+P to search file

**Build fails?**
- Commit changes: `git commit -m "wip: work in progress"`
- Push to sync: `git push origin master`
- Desktop will rebuild automatically

**Can't push?**
- Pull first: `git pull origin master`
- Then push: `git push origin master`

**Merge conflicts?**
```bash
git pull origin master --rebase
# Fix conflicts in editor
git add .
git commit -m "fix: resolve conflicts"
git push origin master
```

---

## Pro Tips

✅ **Save frequently** - Codespaces auto-saves  
✅ **Use terminal in Codespaces** - Much faster than pushing to test  
✅ **Keep commits small** - One change per commit  
✅ **Write good commit messages** - "Fix pricing" not "blah"  
✅ **Test on desktop before major changes** - Full testing is faster  

---

## Keyboard Shortcuts (Mobile)

| Action | Shortcut |
|--------|----------|
| Search file | Cmd/Ctrl + P |
| Find in file | Cmd/Ctrl + F |
| Replace | Cmd/Ctrl + H |
| Go to line | Cmd/Ctrl + G |
| Save | Cmd/Ctrl + S |
| Undo | Cmd/Ctrl + Z |
| Redo | Cmd/Ctrl + Shift + Z |
| Comment | Cmd/Ctrl + / |

---

## Bookmarks to Save

```
Quick Access Links:
📱 github.dev/LitLabs420/Labs-Ai
🔧 GitHub.com (for Codespaces)
📖 PHONE_EDITING_GUIDE.md (full guide)
```

---

## What NOT to Do

❌ Don't push broken code  
❌ Don't delete random files  
❌ Don't edit `.env` directly (local only)  
❌ Don't make 100 changes in one commit  
❌ Don't force-push to master  

---

**Need more help?** Read `PHONE_EDITING_GUIDE.md` in the repo!
