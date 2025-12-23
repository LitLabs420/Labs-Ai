# LABS OS — BUILD 1 MAXED (LOOP VERSION)

## Scan: 60 seconds to understand everything

**Status:** Foundation Drop – Genesis complete  
**Tech:** Event-driven OS, Stripe payments, AI agents, OS-like UI, marketplace  
**Rule:** Everything through event bus. Agents own logic. No rewrites.

---

## 📋 IMMEDIATE SETUP (For You Right Now)

- [ ] **Boot Dev Environment**
  - Run `D:\Labs OS\scripts\start-labs.ps1` (double-click or PowerShell)
  - Expect: Next.js on localhost:3000, API on localhost:3001, Stripe CLI listening
  - Status: ✅ Verified (exit code 0)

- [ ] **Verify Stripe Local Testing**
  - `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
  - `stripe trigger payment_intent.succeeded`
  - Expect: Event logged, event bus triggered, MoneyAgent fires

- [ ] **Environment Variables Set**
  - File: `scripts/env.ps1`
  - Contains: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`
  - ⚠️ Never commit secrets; use local machine values only

---

## 🏗️ ARCHITECTURE (5-Minute Overview)

### Flow: Payment → Event → Agent → Action

```
Stripe webhook (payment succeeded)
    ↓
/api/webhooks/stripe (verify signature)
    ↓
emitEvent("Economy.Stripe.payment_intent.succeeded")
    ↓
MoneyAgent listens ("Economy.Stripe.*")
    ↓
MoneyAgent: credit user → emit reward event
    ↓
UI listens for reward event → show badge
```

**Key:** Stripe handler knows NOTHING about crediting users. That's MoneyAgent's job.

### Core Components (What Does What)

| Component | What It Does | Where | Next Step |
|-----------|--------------|-------|-----------|
| **Event Bus** | Routes all events; wildcard subscription | `kernel/event-bus/emit.ts` | Already exists; swap Redis later when scaled |
| **MoneyAgent** | Handles payments, credits, rewards | `agents/money-agent.ts` | Add subscription tracking, churn handling |
| **ContentAgent** | Moderation, AI content flags | `agents/content-agent.ts` | Integrate OpenAI for post summarization |
| **MarketAgent** | Asset trading, ownership transfers | `agents/market-agent.ts` | Add auction logic, price elasticity |
| **SpaceContext** | Multi-window UI state | `ui-engine/space-manager/` | Add space persistence across sessions |

---

## ✅ PHASE: FINISH BUILD 1 GENESIS (Your Next 3–4 Days)

### Task 1: Full Monorepo Bootstrap
**Owner:** You  
**Blocking:** Nothing  
**Depends On:** Existing dir structure

- [ ] Create `package.json` at root (workspaces: `apps/web`, `apps/api`, `agents`, `kernel`, etc.)
- [ ] `npm install` (or `pnpm install`)
- [ ] Configure TypeScript (`tsconfig.json` at root + per-workspace)
- [ ] Set up ESLint (already in place, just verify no errors: `npm run lint`)
- [ ] Build pipeline: `npm run build` (should compile all packages)
- [ ] Result: `npm run dev` boots everything, tests run, build is clean

**Acceptance:** 
- `npm run dev` boots without errors
- `npm run lint` returns 0 violations
- `npm run test` runs (even if tests are stubs)

---

### Task 2: Production Auth & Identity Kernel
**Owner:** You + AI (generate code, you review & deploy)  
**Blocking:** MoneyAgent features (payments only work for auth'd users)  
**Depends On:** Database schema (see Task 3)

Features:
- [ ] User signup/login (email + password, or OAuth via Google/GitHub)
- [ ] JWT token generation (stored in secure HTTP-only cookie)
- [ ] Permission checks (can user edit post? can user buy asset?)
- [ ] Emit events: `Identity.User.Created`, `Identity.User.LoggedIn`, `Identity.User.Banned`
- [ ] Integrate with MoneyAgent (credit only goes to verified, non-banned users)

**Files to Create:**
- `kernel/identity/auth.ts` (JWT, signup/login endpoints)
- `kernel/identity/user.ts` (user model, profile)
- `kernel/permissions/check.ts` (can user take action?)
- `apps/api/src/routes/auth.ts` (POST /auth/signup, POST /auth/login, POST /auth/logout)

**Acceptance:**
- User can signup → JWT issued → can login on another tab
- Banned users can't buy assets
- Events fire correctly: `Identity.User.Created` triggers initial balance credit

---

### Task 3: Database Schema
**Owner:** You + AI (generate migrations, you review)  
**Blocking:** All agent features  
**Depends On:** Nothing

Use Prisma (ORM) or raw migrations. Schema needed:

- [ ] `users` (id, email, passwordHash, createdAt, banned)
- [ ] `assets` (id, ownerId, type, value, tradable, metadata, createdAt)
- [ ] `transactions` (id, fromUserId, toUserId, assetId, amount, reason, createdAt)
- [ ] `events` (id, type, source, payload, timestamp) — *optional but recommended for audit*
- [ ] `spaces` (id, userId, type, state, createdAt, updatedAt)

**Setup:**
- [ ] Install Prisma: `npm install -D prisma @prisma/client`
- [ ] `prisma init` (creates `prisma/schema.prisma`)
- [ ] Write schema (see files below)
- [ ] `prisma migrate dev --name init` (creates migrations, applies to local DB)
- [ ] `prisma generate` (generates TypeScript client)

**Acceptance:**
- `prisma db push` applies without errors
- `prisma studio` shows tables, can CRUD manually
- Code can do: `const user = await db.user.findUnique({ where: { id: userId } })`

---

### Task 4: Stripe Product & Subscription Setup
**Owner:** You  
**Blocking:** Payment testing end-to-end  
**Depends On:** Stripe account

- [ ] In Stripe Dashboard, create Product: "Platform Credit"
- [ ] Create Prices: 100 credits = $10, 500 credits = $40 (bulk discount)
- [ ] Create webhook endpoint in Dashboard: `https://yourdomain.com/api/webhooks/stripe`
- [ ] Copy webhook signing secret → `env.ps1`
- [ ] Test locally: `stripe trigger charge.succeeded`

**Files:**
- Update `apps/api/src/webhooks/stripe.ts` to also handle `charge.succeeded`

**Acceptance:**
- Webhook signature verifies successfully locally
- `stripe listen` shows incoming events
- Events appear in event bus log

---

### Task 5: Implement MoneyAgent Fully
**Owner:** Copilot (code gen) + You (review)  
**Blocking:** Payment processing  
**Depends On:** Tasks 2, 3, 4

Core Logic:
- [ ] Listen to `Economy.Stripe.payment_intent.succeeded`
- [ ] Check user exists and is not banned (use identity kernel)
- [ ] Update `users.balance` (idempotent by event.id)
- [ ] Emit `Economy.BalanceUpdated { userId, newBalance, amount }`
- [ ] Log transaction in database

Advanced (Rewards):
- [ ] On first purchase → emit `Rewards.FirstBuy { userId }`
- [ ] Track "streak" (purchases in consecutive days) → emit `Rewards.StreakMilestone { userId, days }`
- [ ] Emit `Rewards.VIPUnlock` if user reaches certain spending threshold

**Acceptance:**
- Stripe test payment → user balance increments
- Duplicate payment (same event.id) → balance does NOT double-increment
- Event log shows all emitted events

---

### Task 6: UI Spaces (Multi-Window Layout)
**Owner:** Copilot (React components) + You (review & test)  
**Blocking:** User experience quality  
**Depends On:** Task 2 (auth)

Components:
- [ ] `SpaceProvider` (React context managing array of open spaces)
- [ ] `<Window>` component (draggable, resizable, has title bar + close/min buttons)
- [ ] `<Dock>` component (bottom bar showing open spaces, click to focus)
- [ ] Route handlers in UI to open spaces by type (e.g., clicking "Market" opens market space)
- [ ] Persist open spaces to localStorage (optional: sync to backend)

**Spaces to Implement:**
- `type: "home"` – dashboard
- `type: "market"` – asset marketplace
- `type: "profile"` – user profile
- `type: "settings"` – account settings

**Acceptance:**
- User can open multiple spaces at once
- Spaces are draggable and resizable
- Clicking dock icon focuses/unfocuses space
- Refreshing page restores open spaces (from localStorage)

---

### Task 7: MarketAgent – Basic Trading
**Owner:** Copilot (code gen) + You (review)  
**Blocking:** Marketplace features  
**Depends On:** Tasks 2, 3, 5

Logic:
- [ ] Listen to `Market.Trade.Initiated { assetId, buyerId, sellerId, price }`
- [ ] Validate: seller owns asset, asset is tradable, buyer has balance/credit
- [ ] If valid:
  - Debit buyer balance
  - Credit seller balance
  - Update asset.ownerId
  - Emit `Market.Asset.Traded { assetId, from: sellerId, to: buyerId, price }`
- [ ] If invalid: emit `Market.Trade.Failed { reason }`

**Acceptance:**
- User A creates asset
- User B buys it → ownership transfers, balances update
- Event log shows `Market.Asset.Traded`

---

### Task 8: Stripe Product Catalog (Creator Platform)
**Owner:** Copilot (code gen) + You (review)  
**Blocking:** Creator monetization  
**Depends On:** All above tasks

Features:
- [ ] Creator can list asset for sale in marketplace
- [ ] Listing includes price in credits or USD
- [ ] System auto-syncs price to Stripe product prices
- [ ] User buys → Stripe payment → credit transferred → MoneyAgent handles

**Acceptance:**
- Creator lists asset for 100 credits
- Buyer views, clicks "Buy"
- Stripe payment modal appears (if payment needed)
- On success → asset ownership transfers

---

## 🎯 DECISION GATES (Before Moving to Next Phase)

### Gate 1: "Is the event bus handling 100+ events/sec reliably?"
- If YES → move to multi-process scaling (Task 10)
- If NO → profile performance, optimize handlers

### Gate 2: "Are users comfortable with multi-window UX?"
- If YES → polish animations, improve drag-drop
- If NO → add fullscreen mode for single-space preference

### Gate 3: "Is payment flow working end-to-end?"
- If YES → move to subscription system (recurring billing)
- If NO → debug Stripe webhook, event bus flow

### Gate 4: "Have agents been tested in chaos (sudden agent failure)?"
- If YES → implement agent recovery (retry logic, dead-letter queue)
- If NO → add error handling, test failure scenarios

---

## 🚀 PHASE: BUILD 1 OPTIMIZATION (Days 5+)

Once Genesis tasks complete:

- [ ] **Agent Fault Tolerance** – Add retry logic, dead-letter queue for failed events
- [ ] **Event Auditing** – Persistent event log for replay and debugging
- [ ] **Real-Time Sync** – WebSocket integration so UI gets live updates (instead of polling)
- [ ] **Scaling Event Bus** – Move from in-memory to Redis (configuration only; code unchanged)
- [ ] **Advanced Marketplace** – Auctions, fractional ownership, time-locked assets
- [ ] **AI Agents Enhanced** – Integrate OpenAI for content generation, fraud detection
- [ ] **Social Graph** – Follows, recommendations, feed generation (event-driven)

---

## 📖 RULES (When in Doubt, Reference These)

1. **Everything through event bus** – If you're calling a function directly between modules, emit an event instead
2. **Agents own logic** – Business rules live in agents, not in webhooks or API handlers
3. **No direct external API calls from UI** – Route through agents (secrets stay on server)
4. **Test events first** – New feature? Write the event, test that it's emitted, then write the listener
5. **Async all the way** – Events are fire-and-forget; agents process async (no blocking)

---

## 🔗 KEY FILES TO KNOW

- **Event Bus:** `kernel/event-bus/emit.ts`
- **Base Agent:** `agents/core/Agent.ts`
- **Dev Launcher:** `scripts/start-labs.ps1` (double-click to boot everything)
- **Stripe Handler:** `apps/api/src/webhooks/stripe.ts`
- **UI Spaces:** `ui-engine/space-manager/SpaceContext.tsx`
- **Marketplace Asset:** `economy/marketplace/Asset.ts`
- **Environment:** `scripts/env.ps1` (holds secrets)

---

## ⚡ QUICK DEBUG CHECKLIST

**"Payment came in but user balance didn't update"**
- [ ] Check Stripe webhook reached: `stripe logs` or check API logs
- [ ] Check event was emitted: add `console.log` in stripe webhook handler
- [ ] Check MoneyAgent is subscribed: verify `interests` includes `Economy.Stripe.*`
- [ ] Check user exists and isn't banned: query DB directly
- [ ] Check idempotency: is event.id being tracked?

**"Space won't open"**
- [ ] Check `SpaceContext.openSpace(type)` is called
- [ ] Check type matches a registered space component
- [ ] Check browser console for errors
- [ ] Check `spaces` array in React DevTools

**"Market trade fails"**
- [ ] Check buyer has sufficient balance
- [ ] Check seller owns the asset (query DB)
- [ ] Check asset.tradable is true
- [ ] Check MarketAgent is subscribed to `Market.Trade.Initiated`

---

## 📞 NEXT ACTION

**Right now:** Pick ONE task above (suggest Task 1: Monorepo Bootstrap).  
**Assign to:** You + Copilot (for code generation).  
**Duration:** ~2–4 hours.  
**Blockers:** None.  
**Definition of Done:** `npm run dev` boots cleanly, builds without errors.

Once Task 1 done → move to Task 2 (Auth).

---

**Loop Format:** Perfect for Microsoft Loop to track progress, assign tasks, set deadlines, and link to detailed docs.
