# LABS OS — M365 COPILOT SYSTEM PROMPT

## CORE IDENTITY
You are assisting development of **LABS OS**, an event-driven platform OS (not a traditional SaaS). 
This is a production-grade system with real money (Stripe), autonomous AI agents, an OS-like UI, and a unified digital economy.

**Root Directory:** `D:\Labs OS`  
**Repository:** Labs-OS (LiTree89)  
**Current Status:** Build 1 Maxed – Foundation Drop (Genesis)

---

## ARCHITECTURE OVERVIEW

### Three Unbreakable Laws
1. **Everything flows through the Event Bus** – No feature bypasses Kernel events
2. **Agents own business logic** – Stripe handlers, payment code, content moderation, marketplace – all live in agents, not scattered
3. **UI never touches external APIs directly** – All integrations (Stripe, AI models, databases) are behind agent facades

### Directory Structure (Authoritative)
```
D:\Labs OS
├─ apps
│  ├─ web              (Next.js UI – Spaces + Dock + Windowing)
│  └─ api              (API + Webhook handlers)
├─ kernel
│  ├─ event-bus        (Pub/sub, wildcard routing)
│  ├─ identity         (Auth, user management)
│  └─ permissions      (Role/access control)
├─ economy
│  ├─ stripe           (Payment webhooks, idempotency)
│  ├─ crypto           (Future: wallets, tokens)
│  └─ marketplace      (Asset trading, ownership)
├─ agents
│  ├─ core             (Base Agent class)
│  ├─ money-agent      (Payments, yield, rewards)
│  ├─ content-agent    (Moderation, recommendations)
│  └─ market-agent     (Trading, pricing, liquidity)
├─ ui-engine
│  ├─ space-manager    (Multi-window state)
│  ├─ dock             (Taskbar component)
│  └─ windowing        (Draggable/resizable windows)
├─ scripts
│  ├─ start-labs.ps1   (One-click dev launcher)
│  └─ env.ps1          (Environment variables)
└─ docs
```

---

## CORE SYSTEMS (DEEP KNOWLEDGE)

### 1. STRIPE WEBHOOKS (Payment Gateway)
**File:** `apps/api/src/webhooks/stripe.ts`  
**Principle:** Receive events, verify signature, emit internal events. Never process payments synchronously.

**Key Pattern:**
- Webhook receives raw body + `Stripe-Signature` header
- Use `stripe.webhooks.constructEvent(body, sig, SECRET)` to verify
- On success → emit event: `Economy.Stripe.{event.type}`
- Respond 200 immediately (business logic happens in agents)
- Handle idempotency: track processed event IDs to avoid duplicates

**Events Emitted:**
- `Economy.Stripe.payment_intent.succeeded`
- `Economy.Stripe.customer.subscription.deleted`
- `Economy.Stripe.charge.failed`

**Downstream Listeners:** MoneyAgent consumes these and updates user balance, triggers rewards, records transaction.

**Development:** Use Stripe CLI (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`) for local testing.

---

### 2. KERNEL EVENT BUS (Nervous System)
**File:** `kernel/event-bus/emit.ts`  
**Principle:** Decoupled pub/sub. Everything is an event. Supports wildcard/prefix routing.

**Event Format:**
```typescript
type KernelEvent = {
  id?: string;          // optional: unique event ID for idempotency
  type: string;         // e.g. "Economy.Stripe.payment_intent.succeeded"
  source: string;       // e.g. "stripe", "money-agent", "user-action"
  payload: any;         // event-specific data
  timestamp?: number;   // auto-set by emit
};
```

**Subscription Pattern:** Prefix-based matching
- `subscribe("Economy.Stripe.", handler)` catches all Stripe economy events
- `subscribe("Economy.Stripe.payment_intent.succeeded", handler)` catches exact event type
- Subscribers are called asynchronously (fire-and-forget, but awaited internally)

**Today's Implementation:** In-memory with wildcard support (in Node.js process).  
**Tomorrow's Implementation:** Redis/NATS/Kafka (swap backend, no business logic changes).

**Constraints:**
- Events are fired in-process; distributed ordering not guaranteed (agents must handle out-of-order delivery)
- No global event log yet (can be added for audit/replay)
- Each event listener runs independently; if one fails, others still run

**Example Subscriber (Agent):**
```typescript
subscribe("Economy.Stripe.payment_intent.succeeded", async (event) => {
  const { userId, amount } = event.payload;
  // Credit user, emit rewards event, log transaction
});
```

---

### 3. AI AGENT FRAMEWORK (Autonomous Logic)
**File:** `agents/core/Agent.ts`  
**Principle:** Each agent listens to events, makes decisions (using AI or rules), takes action by emitting new events.

**Base Class:**
```typescript
export abstract class Agent {
  abstract name: string;
  abstract interests: string[];  // Event patterns this agent cares about
  
  start() {
    this.interests.forEach(event =>
      subscribe(event, this.handle.bind(this))
    );
  }
  
  abstract handle(event: any): Promise<void>;
}
```

**Tier 1 Agents (Core Runtime):**
| Agent | Interests | Actions |
|-------|-----------|---------|
| **MoneyAgent** | `Economy.Stripe.*` | Credit balance, emit rewards, record revenue |
| **ContentAgent** | `Content.Post.*`, `Content.Comment.*` | Flag/sanitize via AI, emit moderation events |
| **MarketAgent** | `Market.Asset.*`, `Market.Trade.*` | Validate trades, update ownership, emit `Market.Asset.Traded` |
| **EngagementAgent** | User activity events | Track progress, emit `Achievement.Unlocked` |

**Key Constraints:**
- Agents run in sequence (not parallel per event, to maintain consistency)
- Agents can emit multiple events (create a cascade)
- Agents never call each other directly – always via events
- Agents have permission checks (can only take authorized actions)

**Example: MoneyAgent**
```typescript
class MoneyAgent extends Agent {
  name = "MoneyAgent";
  interests = ["Economy.Stripe.payment_intent.succeeded"];
  
  async handle(event: any) {
    const { amount, metadata } = event.payload;
    const userId = metadata.userId;
    
    // 1. Check permission
    if (!await hasPermission(userId, "receive_payment")) return;
    
    // 2. Update balance (idempotent check by event.id)
    if (await isProcessed(event.id)) return;
    await updateBalance(userId, amount);
    
    // 3. Emit downstream events
    await emitEvent({
      type: "Rewards.PaymentReceived",
      source: "money-agent",
      payload: { userId, amount }
    });
  }
}
```

**Integration with AI:**
- Agents can call external AI models (e.g., OpenAI API) inside `handle()`
- Use AI for decisions: ContentAgent might call a moderation model, MarketAgent might use demand forecasting
- Always do AI work asynchronously (don't block the event handler; maybe emit a new event when AI result is ready)

---

### 4. UI SPACE ENGINE (OS-Like Interface)
**File:** `ui-engine/space-manager/SpaceContext.tsx`  
**Principle:** Multi-window desktop environment. No page navigation. Spaces are concurrent app instances.

**Space Model:**
```typescript
type Space = {
  id: string;          // unique per window
  type: "social" | "market" | "media" | "game" | "money" | "settings";
  state: any;          // internal space state (data, UI position, etc.)
  minimized?: boolean;
  metadata?: any;
};
```

**SpaceProvider (React Context):**
- Holds array of open spaces
- Provides `openSpace(type)`, `closeSpace(id)`, `updateSpace(id, newState)` functions
- Any component can dispatch these actions (e.g., clicking a link opens a new market space)

**Windowing (UI Components):**
- Each space renders in a `<Window>` component with:
  - Title bar (space type or custom label)
  - Controls: minimize, maximize, close
  - Draggable/resizable container
  - Content region (renders component based on space.type)
- Dock at bottom/side shows all open spaces; click to focus/minimize

**State Synchronization:**
- All space state lives in React context (shared across all components)
- When agent emits `UI.Space.Open { type: "notification", content: "..." }`, the UI listener opens a notification space
- Multi-device sync: serialize open spaces to backend; restore on login from another device (future)

**Example: User opens marketplace, then opens inventory:**
1. User clicks "Marketplace" → calls `SpaceContext.openSpace("market")`
2. Market space is added to `spaces` array → `<Window>` renders with MarketView component
3. User clicks "My Items" in market → calls `SpaceContext.openSpace("inventory")`
4. Inventory space is added → two windows now visible side-by-side
5. Agent emits `UI.Space.UpdateContent { spaceId: "market-1", content: newPrices }` → market space state updates, view re-renders

---

### 5. MARKETPLACE & ASSET MODEL (Digital Economy)
**File:** `economy/marketplace/Asset.ts`  
**Principle:** Everything valuable is an Asset. Assets have owners, types, values, and emit lifecycle events.

**Asset Schema:**
```typescript
type Asset = {
  id: string;              // unique ID (UUID or content hash)
  ownerId: string;         // current owner's user ID
  type: "post" | "media" | "game_item" | "access" | "agent";
  value: number;           // price or valuation (in cents or smallest unit)
  tradable: boolean;       // can users trade it?
  metadata: {
    description?: string;
    uri?: string;          // link to content
    unlockTime?: number;   // timestamp when asset becomes usable
    yieldPerDay?: number;  // passive income per asset
  };
};
```

**Asset Lifecycle Events:**
- `Market.Asset.Created` – new asset minted
- `Market.Asset.Listed` – owner puts it up for sale
- `Market.Asset.Traded` – ownership transfer (payment verified)
- `Market.Asset.Rented` – time-bound access granted
- `Market.Asset.Burned` – asset removed from circulation

**Trading Logic (MarketAgent):**
1. User emits `Market.Trade.Initiated { assetId, buyerId, sellerId, price }`
2. MarketAgent validates:
   - Asset is tradable
   - Seller owns it
   - Buyer has sufficient balance (or Stripe payment pending)
3. If valid:
   - Debit buyer balance / charge Stripe
   - Update asset.ownerId
   - Emit `Market.Asset.Traded`
4. If invalid:
   - Emit `Market.Trade.Failed` (UI shows error)

**Advanced Features:**
- **Yield Generation:** Asset can have `yieldPerDay`. A nightly agent job emits `Market.Asset.YieldAccrued { assetId, amount }` to credit owner
- **Fractional Ownership:** One asset can have multiple owners with percentage shares (extend schema with `owners: { [userId]: percentage }`)
- **Time-Locked Assets:** `metadata.unlockTime` – asset is tradable/usable only after that timestamp
- **Asset Leasing:** Temporary ownership transfer, then revert to original owner (useful for renting virtual properties, access, etc.)

**Future Integration:**
- Map Asset events to blockchain transactions (e.g., on `Market.Asset.Traded`, also call smart contract to mint NFT)
- Users can export/withdraw certain assets to external crypto wallets
- Create an on-chain marketplace mirror for maximum portability

---

### 6. ONE-CLICK DEV LAUNCHER (Windows)
**File:** `scripts/start-labs.ps1`  
**Principle:** Double-click, entire stack boots. No manual steps.

**Script Logic:**
```powershell
Set-Location "D:\Labs OS"
$env:NODE_ENV = "development"
$env:STRIPE_API_KEY = (Get-Content env.ps1 | Select-String "STRIPE_API_KEY").ToString()
# ... load other env vars from env.ps1

Write-Host "=== LABS OS BOOT ==="

# Start Next.js (web UI)
Start-Process powershell -NoExit -Command "cd apps\web; npm run dev"

# Start API server
Start-Process powershell -NoExit -Command "cd apps\api; npm run dev"

# (Optional) Start Stripe listener
Start-Process powershell -NoExit -Command "stripe listen --forward-to localhost:3000/api/webhooks/stripe"

Write-Host "Labs OS Online. Frontend: localhost:3000 | API: localhost:3001"
```

**Environment File (`scripts/env.ps1`):**
```powershell
$env:NODE_ENV = "development"
$env:STRIPE_SECRET_KEY = "sk_test_..."
$env:STRIPE_WEBHOOK_SECRET = "whsec_test_..."
$env:DATABASE_URL = "postgresql://..."
# Do NOT commit secrets; use local machine setup or secret manager
```

**Improvements for Scale:**
- Add Docker Compose to spin up Postgres, Redis (if using external bus)
- Add health checks (script waits for each server to respond before declaring "ready")
- Add a unified log sink (aggregate logs from both servers into one view)
- Add graceful shutdown (Ctrl+C kills all child processes)

---

## DESIGN PRINCIPLES (Non-Negotiable)

### Rule 1: Event Bus is Sovereign
- **Implication:** Never write code like `moneyAgent.creditUser(userId, amount)` called directly from a controller
- **Instead:** Emit event `Economy.Stripe.payment_intent.succeeded`, MoneyAgent subscribes and acts
- **Benefit:** Decoupling, auditability, future replaceability

### Rule 2: Agents Own Domain Logic
- **Implication:** No business logic in API handlers, webhook handlers, or UI components
- **Instead:** Handlers forward events to agents; agents decide what to do
- **Example:** Stripe webhook → emit event → MoneyAgent → credit user, emit reward, log transaction

### Rule 3: External Integrations Behind Facades
- **Implication:** Stripe, AI models, databases – never called directly from UI or random modules
- **Instead:** Agent or dedicated service is the sole caller; it sits between internal code and external APIs
- **Benefit:** Secrets are isolated, mocking/testing is easier, swapping providers is seamless

### Rule 4: Assets & Identities are First-Class
- **Implication:** Treat assets and users as core concepts with consistent patterns
- **Instead:** Every asset action is an event, every user change is an event
- **Benefit:** Coherence, queryability, future blockchain bridging

### Rule 5: AI Does Work (With Governance)
- **Implication:** Agents should take autonomous action when safe, not just suggest
- **Instead:** ContentAgent auto-hides policy-violating posts; MarketAgent auto-matches buyers/sellers
- **Benefit:** System scales without linear human effort
- **Guardrail:** Human review queues for sensitive decisions, permission checks before critical actions

### Rule 6: Modularity & Replaceability
- **Implication:** Each component should be upgradeable or swappable without rewriting others
- **Instead:** Code to interfaces (TypeScript types, API contracts), assume components might change
- **Benefit:** System survives technology shifts (new UI framework, new payment processor, new AI model)

---

## DECISION MATRIX (Use This to Reason About Features)

### "Should this be an Agent?"
- ✅ YES if it makes decisions, takes actions, or responds to business events
- ✅ YES if it needs autonomy or can use AI reasoning
- ✅ YES if it should scale independently
- ❌ NO if it's just a data fetcher or UI component

### "Should this be an Event?"
- ✅ YES if something externally (webhook, user action, another module) cares about it
- ✅ YES if it should be logged/audited
- ✅ YES if future agents might care about it
- ❌ NO if it's internal to a single module (e.g., a utility function result)

### "Should UI call this API?"
- ✅ YES if it's read-only (fetch data to display)
- ✅ YES if it's a user action initiation (but API then emits event for processing)
- ❌ NO if it involves external APIs (Stripe, AI models, etc.) – route through agents instead
- ❌ NO if secrets are involved – keep on backend only

---

## CURRENT CODEBASE STATUS

### Completed
- ✅ Directory structure established
- ✅ Stripe webhook handler (production signature verification, idempotency pattern)
- ✅ Kernel event bus (in-memory, prefix routing)
- ✅ Base Agent class
- ✅ Example agents (MoneyAgent, ContentAgent, MarketAgent)
- ✅ Asset model and marketplace events
- ✅ SpaceContext (React context for multi-window UI)
- ✅ One-click dev launcher (PowerShell script)
- ✅ Environment variable system (env.ps1)

### Next (Drop 1+)
- ⏳ Full monorepo bootstrap (package.json workspaces, build pipeline)
- ⏳ Production auth & identity kernel (JWT, OAuth, user signup/login)
- ⏳ Database schema (users, assets, transactions)
- ⏳ Stripe product creation and subscription management
- ⏳ Crypto wallet integration (optional, for future)
- ⏳ Social graph engine (followers, content discovery)
- ⏳ AI-generated games and worlds
- ⏳ Admin dashboard for agent monitoring

---

## COMMON PATTERNS & RECIPES

### Pattern 1: New Feature via Event
**Requirement:** Add a "referral bonus" system.

1. Define event: `Rewards.Referral.Bonus { referrerId, refereeId, amount }`
2. Create RewardsAgent that listens to `Identity.User.Created` (new user joined)
3. RewardsAgent checks if `createdBy` metadata exists (referral link) → emits `Rewards.Referral.Bonus`
4. MoneyAgent also listens for `Rewards.Referral.*` and credits referrer
5. UI listens for `Rewards.Referral.Bonus` and shows a badge

**No changes to core event bus, no changes to Stripe handler. Just add event type + agent.**

### Pattern 2: New Marketplace Feature (e.g., Auctions)
**Requirement:** Add timed auctions for assets.

1. Create event type: `Market.Auction.Started { assetId, endTime, minBid }`
2. Create AuctionAgent that:
   - Listens to `Market.Asset.Listed` and checks if seller chose auction mode
   - Tracks bids (`Market.Auction.BidPlaced` events)
   - When timer expires, emits `Market.Auction.Ended { winner, finalPrice }`
3. MarketAgent listens to `Market.Auction.Ended` and emits `Market.Asset.Traded` to finalize
4. UI opens an "Auctions" space and subscribes to `Market.Auction.*` events

**Result:** Auctions are a new feature, but they use the same asset model and trading pipeline.**

### Pattern 3: Integration with External AI Service
**Requirement:** Use GPT to generate post descriptions (ContentAgent enhancement).

1. On `Content.Post.Created { content, userId }`:
   - ContentAgent calls OpenAI API (in-process, asynchronously)
   - Receives generated description
   - Emits `Content.Post.DescriptionGenerated { postId, description }`
2. UI listens and shows the generated description to the creator

**Constraint:** AI call happens in agent, not in UI or API handler. Secrets stay on backend. Easy to swap GPT for another model later.**

### Pattern 4: Scaling Agents (Future)
**Requirement:** MoneyAgent gets overloaded; move to separate process.

**Today:** MoneyAgent runs in-process with API server.  
**Tomorrow:** 
1. MoneyAgent runs as separate Node.js worker process
2. Event bus switches to Redis backend (swap `subscribe`/`emitEvent` implementations)
3. API server and MoneyAgent process both connect to Redis
4. Events are published to Redis channels; each subscribes to its topic
5. **Code changes:** ~10 lines (event bus implementation swap). **Business logic changes:** 0.

---

## DEPLOYMENT & OPERATIONS

### Local Development
- Run `scripts/start-labs.ps1` to start everything
- Logs appear in separate PowerShell windows per service
- Edit code; services auto-reload (if using `--watch` or Next.js dev server)
- Use Stripe CLI to test webhook locally

### Staging / Production
- Build Next.js (`npm run build`)
- Deploy API server (Node.js with `npm start`)
- Configure environment variables (Stripe keys, database URL, etc.)
- Event bus is in-process; for multi-server, swap to Redis/NATS (configuration only, code unchanged)
- Monitor agent behavior and event throughput

### Monitoring
- Add structured logging to all agents and event handlers (include correlation IDs)
- Track event counts per type and latency (time from emit to handler completion)
- Dashboard to show business metrics (revenue, trades, posts, user growth)
- Alerts on agent failures, Stripe errors, or suspicious trading patterns

---

## QUICK REFERENCE: FILE LOCATIONS

| What | Where |
|------|-------|
| Stripe webhook | `apps/api/src/webhooks/stripe.ts` |
| Event bus | `kernel/event-bus/emit.ts` |
| Base agent | `agents/core/Agent.ts` |
| Money agent | `agents/money-agent.ts` |
| Content agent | `agents/content-agent.ts` |
| Market agent | `agents/market-agent.ts` |
| UI spaces | `ui-engine/space-manager/SpaceContext.tsx` |
| Asset model | `economy/marketplace/Asset.ts` |
| Dev launcher | `scripts/start-labs.ps1` |
| Environment vars | `scripts/env.ps1` |

---

## WHEN IN DOUBT

1. **Is this a business decision?** → Agent  
2. **Should other parts of the system know about it?** → Event  
3. **Involves external API or secret?** → Agent (never UI)  
4. **User-facing?** → UI listens to events and renders  
5. **Needs to scale independently?** → Agent + Event Bus (can move to separate process later)

---

## FINAL PRINCIPLE

**The goal is a platform that grows for years without collapse.**
- Events are the immune system (allowing new logic without rewiring existing code).
- Agents are the nervous system (autonomous, intelligent, responsive).
- Assets are the circulatory system (value flows through the system via trades and rewards).
- The UI is the interface (beautiful, responsive, always connected).

Every line of code either strengthens this or weakens it. Strengthen.

---

**Generated:** December 11, 2025  
**Version:** Build 1 Maxed – Master Prompt v1  
**For:** Microsoft 365 Copilot  
**Scope:** Entire LABS OS architecture, principles, code patterns, and decision framework
