# LABS OS @ M365: QUICK REFERENCE (Teams/Outlook)

## What is LABS OS?

Event-driven platform OS. Real money. Autonomous AI agents. Multi-window UI. Built-in marketplace.

**Think:** OS + Payment Processing + AI Agents + Digital Economy = New Kind of Platform

---

## Three Rules (Everything Else Follows)

1. **Event Bus is Law** – Everything flows through events. No direct calls.
2. **Agents Own Logic** – All business decisions belong in agents (money, content, trading).
3. **No External API Calls from UI** – All integrations (Stripe, AI) behind agent facades.

---

## The 7 Systems

| System | Does | File | Owner |
|--------|------|------|-------|
| **Stripe Webhooks** | Receives payments, emits events | `apps/api/src/webhooks/stripe.ts` | You + Stripe API |
| **Event Bus** | Routes all events | `kernel/event-bus/emit.ts` | System core |
| **AI Agents** | Listen, decide, act | `agents/*/` | MoneyAgent, ContentAgent, MarketAgent |
| **UI Spaces** | Multi-window desktop | `ui-engine/space-manager/` | React context |
| **Marketplace** | Asset trading | `economy/marketplace/Asset.ts` | MarketAgent |
| **Identity** | Auth, users, permissions | `kernel/identity/` | You |
| **Dev Launcher** | One-click boot | `scripts/start-labs.ps1` | PowerShell script |

---

## Flow: Payment → Event → Agent → Action

```
Stripe (payment succeeded)
    ↓ (webhook)
/api/webhooks/stripe (verify signature, emit event)
    ↓
emitEvent("Economy.Stripe.payment_intent.succeeded")
    ↓ (event bus routes)
MoneyAgent.handle() (business logic)
    ↓
Update balance + emit reward event
    ↓
UI listener gets notified → show badge/notification
```

**Key:** Stripe handler knows NOTHING about business logic. It's just a translator.

---

## Core Components (30-Second Summaries)

### Stripe Webhooks
- Receives HTTP POST from Stripe
- Verifies signature (cryptographic check)
- Emits internal event
- Responds 200 OK immediately
- Handles idempotency (same event won't double-charge)

### Event Bus
- In-process pub/sub (Redis in future)
- Wildcard subscriptions: `subscribe("Economy.Stripe.", handler)`
- Fire-and-forget events
- No ordering guarantee (agents must handle out-of-order)

### MoneyAgent
- Listens: `Economy.Stripe.*`, `Rewards.*`
- Actions: Credit user, record transaction, emit rewards
- Checks: User exists? Banned? Already processed?
- Emits: `Economy.BalanceUpdated`, `Rewards.VIPThreshold`

### ContentAgent
- Listens: `Content.Post.Created`, `Content.Comment.Created`
- Actions: Call AI to check for policy violations, auto-hide if needed
- Emits: `Moderation.PostFlagged`, `Content.Post.Summarized`

### MarketAgent
- Listens: `Market.Trade.Initiated`
- Actions: Validate trade, transfer ownership, update balances
- Emits: `Market.Asset.Traded` (or `.Failed`)

### SpaceContext (UI)
- React context managing open windows
- Each window is a "space" (marketplace, profile, settings, etc.)
- Click space in dock to focus/minimize
- Drag/resize windows (OS-style)

### Marketplace & Assets
- Everything valuable is an Asset
- Asset = { id, ownerId, type, value, tradable, metadata }
- Events: Created, Listed, Traded, Rented, Burned
- Supports fractional ownership, time-locks, yield

---

## Quick Decisions

### "Is this a bug or a feature?"
- **Bug:** Something doesn't match rules 1-3 above
- **Feature:** New event type + new agent + new UI listener

### "Where does this code go?"
- Payment logic → MoneyAgent
- Content moderation → ContentAgent
- Marketplace trading → MarketAgent
- User auth → kernel/identity/
- UI rendering → ui-engine/ or pages/
- Everything else → Emit an event

### "Should I call function X from module Y?"
- **YES if:** Reading data (function returns a value)
- **NO if:** Changing state, involves external APIs, affects business logic
- **Instead:** Emit event, let agent handle

---

## Deployment Checklist

### Local Dev
- [ ] Run `scripts/start-labs.ps1`
- [ ] Frontend on localhost:3000
- [ ] API on localhost:3001
- [ ] Stripe CLI listening
- [ ] Test: `stripe trigger payment_intent.succeeded`

### Production
- [ ] Build: `npm run build`
- [ ] Deploy API + web
- [ ] Set env vars (Stripe keys, DB URL)
- [ ] Test webhook: Send real Stripe test event
- [ ] Monitor event bus latency
- [ ] Alert on agent errors

---

## Common Issues & Fixes

| Issue | Check | Fix |
|-------|-------|-----|
| Payment received but balance didn't update | Is MoneyAgent subscribed to `Economy.Stripe.*`? | Verify `interests` array in MoneyAgent |
| Space won't open | Is space type registered? | Add component to SpaceContent switch statement |
| Trade fails | Does buyer have balance? Is asset tradable? | Log in MarketAgent; add validation |
| Webhook not received | Is signature secret correct? | Verify `STRIPE_WEBHOOK_SECRET` in env.ps1 |
| Event bus event not handled | Is handler subscribed to correct pattern? | Check prefix matching; log subscriptions |

---

## File Quick-Access

```
D:\Labs OS
├─ apps/web/                     # Next.js frontend
├─ apps/api/                     # Node.js API + webhooks
├─ kernel/event-bus/emit.ts      # ← Event router
├─ agents/money-agent.ts         # ← Payment logic
├─ agents/content-agent.ts       # ← Moderation logic
├─ agents/market-agent.ts        # ← Trading logic
├─ ui-engine/space-manager/      # ← Multi-window UI
├─ economy/stripe/               # ← Stripe integration
├─ economy/marketplace/          # ← Asset model
├─ scripts/start-labs.ps1        # ← Boot script
└─ scripts/env.ps1               # ← Environment variables
```

---

## Next Task (Pick One)

- [ ] **Monorepo Setup** – Create package.json with workspaces, install deps (2–3 hrs)
- [ ] **Auth Kernel** – User signup/login, JWT tokens (4–5 hrs)
- [ ] **Database Schema** – Users, assets, transactions via Prisma (2–3 hrs)
- [ ] **MoneyAgent Impl** – Full payment → credit → reward flow (3–4 hrs)
- [ ] **MarketAgent Impl** – Trade validation, ownership transfer (3–4 hrs)
- [ ] **UI Spaces** – Draggable windows, dock, multi-space (4–5 hrs)

---

## Philosophy

> Everything in this system communicates through events.
> No feature bypasses the event bus.
> All business logic lives in agents.
> UI never touches external APIs directly.
> Anything can be replaced without rewriting.

**This is how you build something that scales without collapse.**

---

**Format:** Paste into Teams message or Outlook task for instant reference.
**Scope:** Complete architecture, quick decisions, file locations, deployment steps.
**Length:** <3 minutes to read.
