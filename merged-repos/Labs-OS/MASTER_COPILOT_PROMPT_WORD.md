# LABS OS BUILD 1 MAXED - COMPLETE REFERENCE DOCUMENT

## Executive Summary

**LABS OS** is an event-driven platform operating system designed for production scale. It combines:
- Real-money payments (Stripe integration)
- Autonomous AI agents making business decisions
- Multi-window OS-like UI
- Built-in digital marketplace and economy
- One-click development environment

This document serves as the complete technical reference for all components, patterns, and decision-making frameworks.

---

## Part 1: Core Architecture

### 1.1 Three Unbreakable Laws

These laws ensure the system remains coherent and scalable:

**Law 1: Everything flows through the Event Bus**
- No feature bypasses the Kernel event bus
- Direct function calls between modules are forbidden
- All communication is event-driven

**Law 2: Agents own business logic**
- No business logic in webhooks, API handlers, or UI
- All domain decisions (payment processing, content moderation, trading rules) belong in agents
- Enables autonomous operation and future AI enhancement

**Law 3: UI never touches external APIs**
- External services (Stripe, AI models, databases) are behind agent facades
- Secrets are isolated to backend
- Easier to mock, test, and swap providers

---

### 1.2 Directory Structure (Authoritative)

```
D:\Labs OS
│
├── apps
│   ├── web                    # Next.js frontend (React 19 + Tailwind CSS)
│   │   ├── src
│   │   │   ├── pages          # Next.js routes
│   │   │   ├── components     # React components
│   │   │   └── styles         # Global CSS
│   │   └── package.json
│   │
│   └── api                    # Node.js API server + webhooks
│       ├── src
│       │   ├── routes
│       │   ├── webhooks
│       │   └── middleware
│       └── package.json
│
├── kernel                     # Core platform services
│   ├── event-bus              # Pub/sub message router
│   │   ├── emit.ts            # Event emission and subscription
│   │   └── types.ts           # KernelEvent interface
│   │
│   ├── identity               # Authentication & user management
│   │   ├── auth.ts            # JWT, signup, login
│   │   ├── user.ts            # User model and profile
│   │   └── session.ts         # Session management
│   │
│   └── permissions            # Authorization and access control
│       ├── check.ts           # Permission verification
│       └── roles.ts           # Role definitions
│
├── economy                    # Financial systems
│   ├── stripe                 # Stripe integration
│   │   ├── stripe.ts          # Stripe client setup
│   │   └── webhooks.ts        # Webhook handlers
│   │
│   ├── crypto                 # Cryptocurrency (future)
│   │   ├── wallets.ts         # Wallet management
│   │   └── transactions.ts    # On-chain operations
│   │
│   └── marketplace            # Asset trading system
│       ├── Asset.ts           # Asset data model
│       ├── trading.ts         # Trade logic
│       └── valuation.ts       # Price algorithms
│
├── agents                     # Autonomous business logic
│   ├── core
│   │   └── Agent.ts           # Base agent class
│   │
│   ├── money-agent.ts         # Payment handling, rewards
│   ├── content-agent.ts       # Moderation, recommendations
│   ├── market-agent.ts        # Trading, pricing, liquidity
│   └── engagement-agent.ts    # User progress, achievements
│
├── ui-engine                  # Multi-window interface
│   ├── space-manager
│   │   ├── SpaceContext.tsx   # React context for spaces
│   │   └── types.ts           # Space definitions
│   │
│   ├── dock                   # Taskbar component
│   └── windowing              # Window component (draggable/resizable)
│
├── scripts                    # Automation
│   ├── start-labs.ps1         # One-click dev launcher
│   ├── env.ps1                # Environment variables
│   └── deploy.ps1             # Production deployment
│
├── docs                       # Documentation
│   ├── ARCHITECTURE.md
│   ├── API_REFERENCE.md
│   └── DECISION_LOG.md
│
└── package.json               # Monorepo root (workspaces)
```

Every directory has runtime purpose. No decorative folders.

---

## Part 2: Core Systems (Deep Technical)

### 2.1 Stripe Webhooks (Payment Gateway)

**File:** `apps/api/src/webhooks/stripe.ts`

**Purpose:** Receive payment notifications from Stripe and emit internal events for processing.

**Key Principle:** Webhook handler is a translator only. It does not process payments, credit users, or make business decisions. It receives → validates → emits event. That's all.

**Implementation Pattern:**

```typescript
import { stripe } from "@/economy/stripe/stripe";
import { emitEvent } from "@/kernel/event-bus";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new Response("No signature", { status: 400 });
  }

  let event;
  try {
    // Cryptographically verify the webhook is from Stripe
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Forward to internal event bus
  await emitEvent({
    type: `Economy.Stripe.${event.type}`,  // e.g., "Economy.Stripe.payment_intent.succeeded"
    source: "stripe",
    payload: event.data.object,
    id: event.id,  // Use Stripe's event ID for idempotency tracking
  });

  // Respond immediately; business logic happens asynchronously in agents
  return new Response("ok");
}
```

**Signature Verification (Critical Security):**
- Stripe sends `Stripe-Signature` header containing a timestamp and HMAC-SHA256 signature
- The signature covers the raw request body
- `stripe.webhooks.constructEvent()` validates the signature using your endpoint secret
- **Never trust webhook data without signature verification**

**Idempotency Handling:**
- Stripe retries failed webhooks for up to 72 hours with exponential backoff
- If your service doesn't respond 200 OK, Stripe assumes failure and retries
- Without idempotency tracking, a single payment could be processed multiple times
- Solution: Log processed event IDs; if a duplicate arrives, ignore it

```typescript
// In MoneyAgent or payment processor
async function processPaymentEvent(event: KernelEvent) {
  // Check if we've already processed this Stripe event
  const existing = await db.processedEvents.findUnique({
    where: { stripeEventId: event.id },
  });
  
  if (existing) {
    console.log("Duplicate webhook ignored:", event.id);
    return;
  }

  // Process payment
  const { userId, amount } = event.payload;
  await updateUserBalance(userId, amount);

  // Record that we processed this
  await db.processedEvents.create({
    data: { stripeEventId: event.id, processedAt: new Date() },
  });
}
```

**Events Emitted (Examples):**
- `Economy.Stripe.payment_intent.succeeded` – Customer paid
- `Economy.Stripe.payment_intent.payment_failed` – Payment declined
- `Economy.Stripe.customer.subscription.created` – New subscription
- `Economy.Stripe.customer.subscription.deleted` – Subscription canceled
- `Economy.Stripe.charge.refunded` – Refund issued

**Development & Testing:**

Local testing using Stripe CLI:
```bash
# In one terminal, listen for webhooks and forward to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
```

The CLI provides a signing secret for local testing; configure it in `env.ps1`.

**Production Readiness Checklist:**
- [ ] Webhook URL is HTTPS (not HTTP)
- [ ] Signature verification is mandatory
- [ ] Event ID is tracked for idempotency
- [ ] Webhook handler responds in <5 seconds
- [ ] Failed webhooks are logged and alerted
- [ ] Stripe dashboard shows no failed deliveries
- [ ] Event bus can handle burst of webhooks (queue if needed)

---

### 2.2 Kernel Event Bus (Central Nervous System)

**File:** `kernel/event-bus/emit.ts`

**Purpose:** Unified message routing. All modules communicate via events. Enable decoupling and future scalability.

**Event Model:**

```typescript
type KernelEvent = {
  id?: string;          // Unique event ID (optional; used for idempotency)
  type: string;         // Hierarchical event name (e.g., "Economy.Stripe.payment_intent.succeeded")
  source: string;       // Who emitted this? (e.g., "stripe", "user-action", "money-agent")
  payload: any;         // Event-specific data
  timestamp?: number;   // When this event occurred (auto-set by emit)
};
```

**Event Naming Convention:**
- Use dot notation for hierarchy: `Domain.SubDomain.EventName`
- Examples:
  - `Economy.Stripe.payment_intent.succeeded` (Stripe payment success)
  - `Market.Asset.Traded` (Marketplace asset ownership transfer)
  - `Content.Post.Created` (New post created)
  - `Identity.User.Banned` (User account banned)
  - `UI.Space.Opened` (UI space opened by user)

**Subscription Pattern (Prefix Matching):**

```typescript
// Subscribe to all Stripe economy events
subscribe("Economy.Stripe.", handler);

// Subscribe to specific event type
subscribe("Market.Asset.Traded", handler);

// Handler receives the full event
async function handler(event: KernelEvent) {
  console.log(`Event: ${event.type}`, event.payload);
}
```

**Implementation (In-Process):**

```typescript
import { KernelEvent } from "./types";

const subscribers: Record<string, Function[]> = {};

export function subscribe(
  pattern: string,
  handler: (event: KernelEvent) => void | Promise<void>
) {
  if (!subscribers[pattern]) {
    subscribers[pattern] = [];
  }
  subscribers[pattern].push(handler);
  console.log(`Subscribed to: ${pattern}`);
}

export async function emitEvent(event: KernelEvent) {
  event.timestamp = Date.now();

  // Find all subscribers whose pattern matches this event type
  const matchingHandlers: Function[] = [];
  for (const [pattern, handlers] of Object.entries(subscribers)) {
    if (event.type.startsWith(pattern)) {
      matchingHandlers.push(...handlers);
    }
  }

  // Fire all matching handlers
  const results = await Promise.allSettled(
    matchingHandlers.map((h) => Promise.resolve(h(event)))
  );

  // Log any failures
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `Handler ${index} failed for event ${event.type}:`,
        result.reason
      );
    }
  });
}
```

**Future Scalability (Swap to External Bus):**

Today: In-memory, single-process.  
Tomorrow: Redis/NATS/Kafka with no business logic changes.

```typescript
// Redis adapter example (pseudocode)
import redis from "redis";

const pub = redis.createClient();
const sub = redis.createClient();

export function subscribe(pattern: string, handler: Function) {
  // Subscribe to Redis channel
  sub.subscribe(pattern, (err, count) => {
    if (!err) console.log(`Subscribed to ${count} channels`);
  });

  sub.on("message", (channel, message) => {
    if (channel.startsWith(pattern)) {
      const event = JSON.parse(message);
      handler(event);
    }
  });
}

export async function emitEvent(event: KernelEvent) {
  event.timestamp = Date.now();
  await pub.publish(event.type, JSON.stringify(event));
}
```

Swap the implementation, business logic unchanged.

**Design Benefits:**
1. **Loose Coupling** – Services don't call each other; they react to events
2. **Scalability** – Add more subscribers without affecting others
3. **Auditability** – All significant actions are events; easy to log and replay
4. **Hot Plugging** – Add new features by wiring new event listeners (no core changes)

---

### 2.3 AI Agent Framework (Autonomous Logic)

**File:** `agents/core/Agent.ts`

**Purpose:** Autonomous services that listen for business events, make decisions (possibly with AI), and take action by emitting new events.

**Base Class:**

```typescript
export abstract class Agent {
  abstract name: string;
  abstract interests: string[];  // Event patterns this agent cares about

  start() {
    // Register this agent with the event bus
    this.interests.forEach((pattern) =>
      subscribe(pattern, this.handle.bind(this))
    );
    console.log(`${this.name} started. Watching: ${this.interests.join(", ")}`);
  }

  // Subclasses implement their business logic here
  abstract handle(event: KernelEvent): Promise<void>;
}
```

**Core Agents (Tier 1):**

| Agent | Interests | Actions |
|-------|-----------|---------|
| **MoneyAgent** | `Economy.Stripe.payment_intent.succeeded`, `Economy.Stripe.charge.refunded` | Credit user balance, emit rewards, record transaction, trigger fulfillment |
| **ContentAgent** | `Content.Post.Created`, `Content.Comment.Created` | Flag/sanitize via AI, emit moderation events, hide policy-violating content |
| **MarketAgent** | `Market.Trade.Initiated`, `Market.Asset.Listed` | Validate trades, transfer ownership, update pricing, emit `Market.Asset.Traded` |
| **EngagementAgent** | User activity events (post, comment, trade) | Track progress, compute streaks, emit `Achievement.Unlocked` |
| **RewardsAgent** | `Rewards.*` events | Calculate reward amounts, credit bonuses, emit notifications |

**Example: MoneyAgent Implementation**

```typescript
import { Agent } from "./core/Agent";
import { subscribe, emitEvent } from "@/kernel/event-bus";
import { db } from "@/lib/db";

export class MoneyAgent extends Agent {
  name = "MoneyAgent";
  interests = [
    "Economy.Stripe.payment_intent.succeeded",
    "Economy.Stripe.charge.refunded",
  ];

  async handle(event: KernelEvent) {
    try {
      // Check if this is a stripe payment success
      if (event.type === "Economy.Stripe.payment_intent.succeeded") {
        await this.handlePaymentSuccess(event);
      } else if (event.type === "Economy.Stripe.charge.refunded") {
        await this.handleRefund(event);
      }
    } catch (error) {
      console.error(`MoneyAgent error handling ${event.type}:`, error);
      // Emit error event for monitoring
      await emitEvent({
        type: "Agent.Error",
        source: "money-agent",
        payload: { originalEvent: event.type, error: error.message },
      });
    }
  }

  private async handlePaymentSuccess(event: KernelEvent) {
    const { amount, metadata } = event.payload;
    const userId = metadata.userId;
    const stripeEventId = event.id;

    // 1. Idempotency: check if we've already processed this Stripe event
    const processed = await db.processedEvents.findUnique({
      where: { stripeEventId },
    });
    if (processed) {
      console.log(`Already processed Stripe event ${stripeEventId}`);
      return;
    }

    // 2. Verify user exists and is not banned
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.error(`User ${userId} not found`);
      return;
    }
    if (user.banned) {
      console.warn(`User ${userId} is banned, payment refunded`);
      // Could emit event to refund payment
      return;
    }

    // 3. Update user balance
    const newBalance = user.balance + amount;
    await db.user.update({
      where: { id: userId },
      data: { balance: newBalance },
    });

    // 4. Record transaction
    await db.transaction.create({
      data: {
        fromUserId: null,  // System credit
        toUserId: userId,
        amount,
        reason: "stripe_payment",
        stripeEventId,
      },
    });

    // 5. Mark event as processed
    await db.processedEvents.create({
      data: { stripeEventId, processedAt: new Date() },
    });

    // 6. Emit downstream events
    await emitEvent({
      type: "Economy.BalanceUpdated",
      source: "money-agent",
      payload: { userId, newBalance, delta: amount },
    });

    // 7. If purchase threshold reached, emit VIP event
    if (newBalance > 50000) {  // $500
      await emitEvent({
        type: "Rewards.VIPThreshold",
        source: "money-agent",
        payload: { userId, reason: "high_spend" },
      });
    }

    console.log(`MoneyAgent: Credited ${userId} with ${amount}`);
  }

  private async handleRefund(event: KernelEvent) {
    const { amount, metadata } = event.payload;
    const userId = metadata.userId;

    // Debit user balance
    const user = await db.user.findUnique({ where: { id: userId } });
    if (user) {
      await db.user.update({
        where: { id: userId },
        data: { balance: Math.max(0, user.balance - amount) },
      });

      await emitEvent({
        type: "Economy.RefundProcessed",
        source: "money-agent",
        payload: { userId, amount },
      });
    }
  }
}

// Initialize agent
const moneyAgent = new MoneyAgent();
moneyAgent.start();
```

**Integration with AI (ContentAgent Example):**

```typescript
import OpenAI from "openai";

export class ContentAgent extends Agent {
  name = "ContentAgent";
  interests = ["Content.Post.Created"];
  private openai = new OpenAI();

  async handle(event: KernelEvent) {
    const { postId, content, userId } = event.payload;

    // Use AI to check for policy violations
    const moderation = await this.openai.moderations.create({
      input: content,
    });

    if (moderation.results[0].flagged) {
      // Auto-hide the post
      await db.post.update({
        where: { id: postId },
        data: { hidden: true, hideReason: "policy_violation" },
      });

      // Emit event for human review
      await emitEvent({
        type: "Moderation.PostFlagged",
        source: "content-agent",
        payload: { postId, userId, reason: "policy_violation" },
      });

      console.log(`ContentAgent: Auto-hid post ${postId}`);
    } else {
      // AI-generate helpful tags/summary
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Summarize this post in 3-5 words: "${content}"`,
          },
        ],
      });

      const summary = completion.choices[0].message.content;

      await emitEvent({
        type: "Content.Post.Summarized",
        source: "content-agent",
        payload: { postId, summary },
      });
    }
  }
}
```

**Agent Initialization (On App Start):**

```typescript
// In apps/api/src/index.ts
import { MoneyAgent } from "@/agents/money-agent";
import { ContentAgent } from "@/agents/content-agent";
import { MarketAgent } from "@/agents/market-agent";

// Start all agents
const moneyAgent = new MoneyAgent();
const contentAgent = new ContentAgent();
const marketAgent = new MarketAgent();

moneyAgent.start();
contentAgent.start();
marketAgent.start();

console.log("All agents initialized and listening...");
```

**Agent Design Best Practices:**
1. **Single Responsibility** – One agent per domain (money, content, market, etc.)
2. **Idempotency** – Handle same event twice safely (use event.id)
3. **Error Handling** – Catch errors, emit error events, log for monitoring
4. **Async First** – All I/O (database, API calls) should be async
5. **No Direct Calls** – Agents communicate via events, never call each other
6. **Permissions** – Check user/system permissions before taking action
7. **Logging** – Log significant decisions for debugging and audit

---

### 2.4 UI Space Engine (Multi-Window OS-Like Interface)

**File:** `ui-engine/space-manager/SpaceContext.tsx`

**Purpose:** Render multiple concurrent app instances (spaces) as draggable windows with a dock/taskbar. Replaces traditional page-based navigation.

**Space Model:**

```typescript
type Space = {
  id: string;              // Unique window ID (UUID or incrementing number)
  type: "home" | "market" | "profile" | "settings" | "notifications";
  title?: string;          // Optional custom title (default: space type)
  state: any;              // Internal state (data, scroll position, filters, etc.)
  minimized?: boolean;     // Is window minimized?
  position?: { x: number; y: number };  // Window position
  size?: { width: number; height: number };  // Window size
  metadata?: any;          // Any additional data
};
```

**React Context (SpaceProvider):**

```typescript
import React, { createContext, useState } from "react";

export const SpaceContext = createContext<any>(null);

export function SpaceProvider({ children }: { children: React.ReactNode }) {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [focusedSpaceId, setFocusedSpaceId] = useState<string | null>(null);

  const openSpace = (type: string, initialState: any = {}) => {
    const newSpace: Space = {
      id: `${type}-${Date.now()}`,  // Simple unique ID
      type,
      state: initialState,
      minimized: false,
    };
    setSpaces([...spaces, newSpace]);
    setFocusedSpaceId(newSpace.id);
  };

  const closeSpace = (id: string) => {
    setSpaces(spaces.filter((s) => s.id !== id));
    if (focusedSpaceId === id) {
      setFocusedSpaceId(spaces.length > 1 ? spaces[0].id : null);
    }
  };

  const updateSpace = (id: string, updates: Partial<Space>) => {
    setSpaces(
      spaces.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const minimizeSpace = (id: string) => {
    updateSpace(id, { minimized: true });
  };

  const restoreSpace = (id: string) => {
    updateSpace(id, { minimized: false });
    setFocusedSpaceId(id);
  };

  return (
    <SpaceContext.Provider
      value={{
        spaces,
        focusedSpaceId,
        openSpace,
        closeSpace,
        updateSpace,
        minimizeSpace,
        restoreSpace,
      }}
    >
      {children}
    </SpaceContext.Provider>
  );
}
```

**Window Component:**

```typescript
import React, { useContext } from "react";
import { SpaceContext } from "./SpaceContext";

export function Window({ space }: { space: Space }) {
  const { closeSpace, minimizeSpace, restoreSpace, focusedSpaceId, updateSpace } =
    useContext(SpaceContext);

  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - (space.position?.x || 0),
      y: e.clientY - (space.position?.y || 0),
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      updateSpace(space.id, {
        position: {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        },
      });
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        left: space.position?.x || 100,
        top: space.position?.y || 100,
        width: space.size?.width || 600,
        height: space.size?.height || 400,
        backgroundColor: "white",
        border: focusedSpaceId === space.id ? "2px solid #007bff" : "2px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        zIndex: focusedSpaceId === space.id ? 1000 : 100,
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      {/* Title bar */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "8px 12px",
          borderBottom: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "move",
          userSelect: "none",
        }}
        onMouseDown={handleMouseDown}
      >
        <span style={{ fontWeight: "bold" }}>{space.title || space.type}</span>
        <div style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={() => minimizeSpace(space.id)}
            style={{
              padding: "2px 6px",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffc107",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            −
          </button>
          <button
            onClick={() => closeSpace(space.id)}
            style={{
              padding: "2px 6px",
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      {!space.minimized && (
        <div style={{ flex: 1, overflow: "auto", padding: "12px" }}>
          <SpaceContent space={space} />
        </div>
      )}
    </div>
  );
}

// Route to appropriate component based on space type
function SpaceContent({ space }: { space: Space }) {
  switch (space.type) {
    case "home":
      return <HomeSpace state={space.state} />;
    case "market":
      return <MarketSpace state={space.state} />;
    case "profile":
      return <ProfileSpace state={space.state} />;
    case "settings":
      return <SettingsSpace state={space.state} />;
    default:
      return <div>Unknown space type: {space.type}</div>;
  }
}
```

**Dock Component:**

```typescript
export function Dock() {
  const { spaces, focusedSpaceId, minimizeSpace, restoreSpace } =
    useContext(SpaceContext);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "60px",
        backgroundColor: "#2c3e50",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        borderTop: "1px solid #34495e",
        zIndex: 999,
      }}
    >
      {spaces.map((space) => (
        <button
          key={space.id}
          onClick={() =>
            space.minimized ? restoreSpace(space.id) : minimizeSpace(space.id)
          }
          style={{
            padding: "8px 16px",
            backgroundColor:
              focusedSpaceId === space.id ? "#3498db" : "#34495e",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: focusedSpaceId === space.id ? "bold" : "normal",
          }}
        >
          {space.minimized && "📦 "}
          {space.title || space.type}
        </button>
      ))}
    </div>
  );
}
```

**Usage in Pages:**

```typescript
// pages/dashboard.tsx
import { useContext } from "react";
import { SpaceContext } from "@/ui-engine/space-manager/SpaceContext";

export default function Dashboard() {
  const { openSpace } = useContext(SpaceContext);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Labs OS</h1>
      <button onClick={() => openSpace("market")}>Open Marketplace</button>
      <button onClick={() => openSpace("profile")}>Open Profile</button>
      <button onClick={() => openSpace("settings")}>Settings</button>
    </div>
  );
}
```

**Event-Driven Space Updates:**

Agents can open/close spaces by emitting events. UI server listens and broadcasts to clients:

```typescript
// In MoneyAgent
await emitEvent({
  type: "UI.Space.Open",
  source: "money-agent",
  payload: { type: "notifications", content: "Payment received!" },
});

// In UI (WebSocket listener)
socket.on("UI.Space.Open", (data) => {
  openSpace(data.type, data.content);
});
```

---

### 2.5 Marketplace & Asset Model (Digital Economy)

**File:** `economy/marketplace/Asset.ts`

**Purpose:** Every valuable thing (post, item, access) is an Asset. Provides a unified model for trading, ownership, and value.

**Asset Schema:**

```typescript
type Asset = {
  id: string;                    // Unique ID (UUID, content hash, or incrementing)
  ownerId: string;               // Current owner's user ID
  type: "post" | "media" | "game_item" | "access" | "agent" | "badge";
  value: number;                 // Price/valuation (in cents or smallest unit)
  tradable: boolean;             // Can users trade it?
  metadata: {
    title?: string;
    description?: string;
    image?: string;              // URL to asset image/thumbnail
    uri?: string;                // Link to external content
    royalty?: number;            // % to pay original creator on resale
    unlockTime?: number;         // Unix timestamp when asset becomes usable
    expiresAt?: number;          // When asset expires (if time-limited)
    yieldPerDay?: number;        // Passive income (in smallest unit)
    [key: string]: any;          // Extensible
  };
  createdAt: Date;
  updatedAt: Date;
};
```

**Asset Lifecycle Events:**

```
Market.Asset.Created
  ↓
Market.Asset.Listed (owner puts it for sale)
  ↓
Market.Trade.Initiated (buyer wants to buy)
  ↓
Market.Asset.Traded (ownership transfer complete)
  ↓
Market.Asset.Rented or Market.Asset.Burned (retired from circulation)
```

**Trading Logic (MarketAgent):**

```typescript
class MarketAgent extends Agent {
  name = "MarketAgent";
  interests = [
    "Market.Trade.Initiated",
    "Market.Asset.Listed",
  ];

  async handle(event: KernelEvent) {
    if (event.type === "Market.Trade.Initiated") {
      await this.handleTradeRequest(event);
    }
  }

  private async handleTradeRequest(event: KernelEvent) {
    const { assetId, buyerId, sellerId, priceOffered } = event.payload;

    // 1. Validate asset exists and is tradable
    const asset = await db.asset.findUnique({ where: { id: assetId } });
    if (!asset || !asset.tradable) {
      await emitEvent({
        type: "Market.Trade.Failed",
        source: "market-agent",
        payload: {
          reason: "Asset not tradable",
          assetId,
          buyerId,
        },
      });
      return;
    }

    // 2. Verify seller owns asset
    if (asset.ownerId !== sellerId) {
      await emitEvent({
        type: "Market.Trade.Failed",
        source: "market-agent",
        payload: { reason: "Seller doesn't own asset", assetId, sellerId },
      });
      return;
    }

    // 3. Check buyer has sufficient balance
    const buyer = await db.user.findUnique({ where: { id: buyerId } });
    if (!buyer || buyer.balance < priceOffered) {
      await emitEvent({
        type: "Market.Trade.Failed",
        source: "market-agent",
        payload: { reason: "Insufficient funds", assetId, buyerId },
      });
      return;
    }

    // 4. Transfer ownership
    await db.asset.update({
      where: { id: assetId },
      data: { ownerId: buyerId },
    });

    // 5. Transfer balance
    const seller = await db.user.findUnique({ where: { id: sellerId } });
    await db.user.updateMany({
      where: { id: buyerId },
      data: { balance: buyer.balance - priceOffered },
    });
    await db.user.update({
      where: { id: sellerId },
      data: {
        balance: seller.balance + priceOffered,
      },
    });

    // 6. Record transaction
    await db.transaction.create({
      data: {
        fromUserId: buyerId,
        toUserId: sellerId,
        assetId,
        amount: priceOffered,
        reason: "asset_trade",
      },
    });

    // 7. Emit success event
    await emitEvent({
      type: "Market.Asset.Traded",
      source: "market-agent",
      payload: {
        assetId,
        from: sellerId,
        to: buyerId,
        price: priceOffered,
      },
    });

    // 8. If asset has royalty, credit creator
    if (asset.metadata.royalty && asset.metadata.creatorId) {
      const royaltyAmount = Math.floor(priceOffered * (asset.metadata.royalty / 100));
      const creator = await db.user.findUnique({
        where: { id: asset.metadata.creatorId },
      });
      if (creator) {
        await db.user.update({
          where: { id: asset.metadata.creatorId },
          data: { balance: creator.balance + royaltyAmount },
        });

        await emitEvent({
          type: "Economy.RoyaltyPaid",
          source: "market-agent",
          payload: { assetId, creatorId: asset.metadata.creatorId, amount: royaltyAmount },
        });
      }
    }
  }
}
```

**Advanced Features:**

**Fractional Ownership:**
```typescript
// Extend Asset to support fractions
type FractionalAsset = Asset & {
  fractions: number;           // Total number of fractions
  fractionalOwners: {
    [userId: string]: number;  // userId → number of fractions owned
  };
};
```

**Time-Locked Assets:**
```typescript
// Check unlock time before allowing use
async function canUseAsset(assetId: string, userId: string): Promise<boolean> {
  const asset = await db.asset.findUnique({ where: { id: assetId } });
  if (!asset || asset.ownerId !== userId) return false;

  if (asset.metadata.unlockTime && asset.metadata.unlockTime > Date.now()) {
    return false;  // Not unlocked yet
  }

  return true;
}
```

**Yield Generation (Passive Income):**
```typescript
// Nightly job: emit yield for assets that produce income
async function distributeYield() {
  const assetsWithYield = await db.asset.findMany({
    where: { metadata: { yieldPerDay: { gt: 0 } } },
  });

  for (const asset of assetsWithYield) {
    await emitEvent({
      type: "Market.Asset.YieldAccrued",
      source: "system-scheduler",
      payload: {
        assetId: asset.id,
        ownerId: asset.ownerId,
        amount: asset.metadata.yieldPerDay,
      },
    });
  }
}
```

---

### 2.6 One-Click Dev Launcher (PowerShell Automation)

**File:** `scripts/start-labs.ps1`

**Purpose:** One command. Entire stack boots.

**Script:**

```powershell
# LABS OS Boot Script
# Usage: Double-click this file or run: powershell -ExecutionPolicy Bypass -File start-labs.ps1

Clear-Host
Write-Host "════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  LABS OS INITIALIZATION" -ForegroundColor Cyan
Write-Host "════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Set root directory
$root = "D:\Labs OS"
Set-Location $root

# Load environment variables
if (Test-Path "scripts\env.ps1") {
    Write-Host "Loading environment variables..." -ForegroundColor Yellow
    & "scripts\env.ps1"
} else {
    Write-Host "ERROR: scripts\env.ps1 not found" -ForegroundColor Red
    exit 1
}

# Set Node environment
$env:NODE_ENV = "development"

Write-Host "Starting services..." -ForegroundColor Yellow
Write-Host ""

# Launch Next.js web server
Write-Host "Launching Next.js frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $root\apps\web; npm run dev" -WindowStyle Normal

# Wait a moment for web server to start
Start-Sleep -Seconds 2

# Launch API server
Write-Host "Launching API server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $root\apps\api; npm run dev" -WindowStyle Normal

# Wait a moment
Start-Sleep -Seconds 2

# Launch Stripe CLI listener (optional)
if ($env:STRIPE_WEBHOOK_SECRET) {
    Write-Host "Launching Stripe listener..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "stripe listen --forward-to localhost:3000/api/webhooks/stripe" -WindowStyle Normal
} else {
    Write-Host "Skipping Stripe listener (STRIPE_WEBHOOK_SECRET not set)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  LABS OS ONLINE" -ForegroundColor Green
Write-Host "════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend:        http://localhost:3000" -ForegroundColor Green
Write-Host "API:             http://localhost:3001" -ForegroundColor Green
Write-Host ""
Write-Host "To stop: Close the terminal windows opened above" -ForegroundColor Yellow
Write-Host ""

# Keep this window open
Read-Host "Press Enter to exit"
```

**Environment File (`scripts/env.ps1`):**

```powershell
# Environment Variables for LABS OS
# DO NOT COMMIT ACTUAL SECRETS TO REPO

# Database
$env:DATABASE_URL = "postgresql://user:password@localhost:5432/labs_os_dev"

# Stripe
$env:STRIPE_SECRET_KEY = "sk_test_YOUR_KEY_HERE"
$env:STRIPE_WEBHOOK_SECRET = "whsec_test_YOUR_SECRET_HERE"

# JWT Secret
$env:JWT_SECRET = "dev-jwt-secret-change-in-production"

# Node
$env:NODE_ENV = "development"

# Logging
$env:LOG_LEVEL = "debug"

Write-Host "Environment variables loaded." -ForegroundColor Green
```

**Running It:**

Option 1: Double-click `scripts/start-labs.ps1` in Windows Explorer  
Option 2: In PowerShell:
```powershell
cd "D:\Labs OS"
powershell -ExecutionPolicy Bypass -File scripts\start-labs.ps1
```

---

## Part 3: Design Principles & Rules

### Rule 1: Event Bus is Sovereign

Everything communicates through the event bus. No direct function calls between modules.

**Bad:**
```typescript
// ❌ DON'T DO THIS
const payment = await stripe.charges.create(...);
moneyAgent.creditUser(userId, payment.amount);
```

**Good:**
```typescript
// ✅ DO THIS
const payment = await stripe.charges.create(...);
await emitEvent({
  type: "Economy.Stripe.charge.succeeded",
  source: "payment-handler",
  payload: payment,
});
// MoneyAgent listens and acts
```

**Why:** Decoupling. If you change how MoneyAgent works, the payment handler doesn't need to know.

---

### Rule 2: Agents Own Business Logic

All domain logic lives in agents. Webhooks, API handlers, and UI never contain business decisions.

**Bad:**
```typescript
// ❌ DON'T DO THIS
export async function POST(req: Request) {
  const { userId, amount } = await req.json();
  // Update balance, check if user qualifies for rewards, emit emails...
  // ~100 lines of business logic in the handler
}
```

**Good:**
```typescript
// ✅ DO THIS
export async function POST(req: Request) {
  const { userId, amount } = await req.json();
  await emitEvent({
    type: "Economy.PaymentReceived",
    source: "api-handler",
    payload: { userId, amount },
  });
  return { ok: true };
}
// MoneyAgent owns the business logic
```

---

### Rule 3: External Integrations Behind Facades

UI and random modules never call external APIs directly. Always route through agents.

**Bad:**
```typescript
// ❌ DON'T DO THIS
// In UI component
const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
  headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
  ...
});
```

**Good:**
```typescript
// ✅ DO THIS
// In UI component
await emitEvent({
  type: "Content.GenerateSummary",
  source: "ui",
  payload: { postId, text },
});

// In ContentAgent
const openaiResponse = await openai.chat.completions.create(...);
await emitEvent({
  type: "Content.SummaryGenerated",
  source: "content-agent",
  payload: { postId, summary },
});
```

**Why:** Secrets stay on backend. UI doesn't load API keys.

---

### Rule 4: Assets & Identities are First-Class

Treat these as core concepts with consistent patterns. Every asset action is an event.

**Good:**
```typescript
// Asset created
await emitEvent({
  type: "Market.Asset.Created",
  source: "content-system",
  payload: { asset },
});

// Asset traded
await emitEvent({
  type: "Market.Asset.Traded",
  source: "market-agent",
  payload: { assetId, from, to, price },
});

// User banned
await emitEvent({
  type: "Identity.User.Banned",
  source: "moderation-system",
  payload: { userId, reason },
});
```

---

### Rule 5: AI Does Work (With Governance)

Agents should take autonomous action when safe, not just suggest.

**Weak:**
```typescript
// ❌ This just notifies; doesn't act
await emitEvent({
  type: "Moderation.PostFlaggedForReview",
  source: "content-agent",
  payload: { postId },
});
```

**Strong:**
```typescript
// ✅ This acts autonomously (with guardrails)
if (flagged && confidence > 0.95) {  // High confidence
  // Auto-hide the post
  await db.post.update({ where: { id: postId }, data: { hidden: true } });
  
  // Queue for human review asynchronously
  await emitEvent({
    type: "Moderation.PostAutoHidden",
    source: "content-agent",
    payload: { postId, reason, confidence },
  });
} else if (flagged && confidence > 0.70) {
  // Medium confidence: flag for human review
  await emitEvent({
    type: "Moderation.PostFlaggedForReview",
    source: "content-agent",
    payload: { postId, reason, confidence },
  });
}
```

---

### Rule 6: Modularity & Replaceability

Code to interfaces. Assume components change.

**Event Bus Swap Example:**
```typescript
// Today: In-memory
const subscribers = {};
export function subscribe(pattern, handler) { ... }
export async function emitEvent(event) { ... }

// Tomorrow: Redis backend
export function subscribe(pattern, handler) {
  redisClient.subscribe(pattern, handler);
}
export async function emitEvent(event) {
  await redisClient.publish(event.type, JSON.stringify(event));
}

// Business code changes: ZERO
```

---

## Part 4: Common Patterns & Recipes

### Pattern 1: New Feature via Event

**Requirement:** Add a "referral bonus" system.

1. Define the event type: `Rewards.Referral.Bonus`
2. Create ReferralAgent that listens to `Identity.User.Created`
3. Agent emits `Rewards.Referral.Bonus` if a referral link exists
4. MoneyAgent listens to rewards events and credits the referrer
5. UI listens and shows a notification

**Changes required:**
- Add ReferralAgent.ts
- Add event type to event taxonomy
- No changes to event bus, no changes to core logic

---

### Pattern 2: New Marketplace Feature (Auctions)

1. Create AuctionAgent
2. Agent listens to `Market.Asset.Listed`
3. If seller chose auction mode, emit `Market.Auction.Started`
4. Agent tracks bids, emits `Market.Auction.Ended` when timer expires
5. MarketAgent listens to `Market.Auction.Ended` and emits `Market.Asset.Traded`

**Result:** Auctions use existing asset and trading infrastructure with zero changes to core.

---

### Pattern 3: Integration with External AI Service

1. ContentAgent listens to `Content.Post.Created`
2. Agent calls OpenAI API for moderation/summarization
3. Agent emits `Content.Post.Moderated` or `Content.Post.Summarized`
4. UI listens and displays result

**Secrets:** Only on server (ContentAgent), never in UI.

---

## Part 5: Operations & Deployment

### Local Development

```bash
# Boot everything
cd "D:\Labs OS"
powershell -ExecutionPolicy Bypass -File scripts\start-labs.ps1

# In a separate terminal, test webhook
stripe trigger payment_intent.succeeded
```

### Production Deployment

1. Build: `npm run build`
2. Deploy API server (Node.js with `npm start`)
3. Deploy web server (Next.js static export or Next.js server mode)
4. Configure Stripe webhook URL in Stripe Dashboard
5. Set environment variables on server
6. If scaling: Swap event bus to Redis/NATS (code changes: ~5 lines)

### Monitoring

- Log all events (optional; useful for replay/audit)
- Track agent latency (time from event emit to handler completion)
- Alert on agent errors (failed subscription processing, etc.)
- Monitor Stripe webhook failures
- Dashboard showing business metrics (revenue, trades, user growth)

---

## Glossary

| Term | Definition |
|------|-----------|
| **Event** | A notification that something happened (e.g., payment succeeded) |
| **Agent** | An autonomous service that listens to events and takes action |
| **Stripe Webhook** | HTTP callback from Stripe when a payment event occurs |
| **Idempotency** | Safely handling the same action/event multiple times |
| **Asset** | Any valuable thing: post, item, access, badge, etc. |
| **Space** | A concurrent app window in the OS-like UI |
| **MoneyAgent** | Agent responsible for handling payments and credits |
| **ContentAgent** | Agent responsible for moderation and recommendations |
| **MarketAgent** | Agent responsible for trading and marketplace logic |
| **Event Bus** | Central message router; all modules communicate through it |

---

## Final Checklist

- [ ] Directory structure created (`kernel/`, `agents/`, `economy/`, etc.)
- [ ] Event bus implemented (in-memory with wildcard routing)
- [ ] Base Agent class defined
- [ ] Stripe webhook handler set up (signature verification, idempotency)
- [ ] MoneyAgent implemented
- [ ] ContentAgent framework in place
- [ ] MarketAgent framework in place
- [ ] SpaceContext for multi-window UI
- [ ] Window and Dock components
- [ ] Asset model defined
- [ ] Database schema (Prisma or raw migrations)
- [ ] One-click dev launcher (start-labs.ps1)
- [ ] Stripe CLI tested locally
- [ ] Environment variables file (env.ps1)
- [ ] npm run dev boots without errors
- [ ] npm run lint returns 0 violations
- [ ] npm run test runs
- [ ] First event-to-agent flow tested end-to-end (payment → MoneyAgent → credit)

---

**Version:** Build 1 Maxed – Master Reference v1  
**Last Updated:** December 11, 2025  
**For:** Complete technical reference and deployment guide
