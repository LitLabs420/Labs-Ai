# 🚀 LABS OS - COMPREHENSIVE PROJECT REFERENCE
**Last Updated:** December 12, 2025  
**Project Status:** Build 1 Maxed – Foundation Drop (Genesis)  
**Repository:** [Labs-OS (LiTree89)](https://github.com/LiTree89/Labs-OS)  

---

## 📋 TABLE OF CONTENTS
1. [Quick Start (5 Minutes)](#quick-start)
2. [Architecture Overview](#architecture)
3. [Technology Stack](#tech-stack)
4. [Setup & Installation](#setup)
5. [Running the Project](#running)
6. [Key Systems Deep Dive](#systems)
7. [Troubleshooting](#troubleshooting)
8. [Useful Resources](#resources)

---

## 🎯 QUICK START {#quick-start}

### ⚡ ONE-LINER SETUP (Windows)
```powershell
cd "d:\Labs OS\LitreeLabsFirebase-master"; ./setup-vscode.ps1
```

### 📝 MANUAL SETUP (5 Steps)
1. **Clone/Navigate to workspace:**
   ```powershell
   cd "d:\Labs OS"
   ```

2. **Install Node.js** (if not present)
   ```powershell
   # Check version
   node --version
   
   # Should be v18+ (Current: v21+ recommended)
   ```

3. **Install dependencies**
   ```powershell
   npm install
   # OR if using pnpm
   pnpm install
   ```

4. **Setup environment variables**
   ```powershell
   # Copy example
   Copy-Item .env.example .env.local
   
   # Edit with your keys
   code .env.local
   ```

5. **Start development server**
   ```bash
   npm run dev
   # Visit: http://localhost:3000
   ```

---

## 🏗️ ARCHITECTURE OVERVIEW {#architecture}

### Three Unbreakable Laws
1. **Everything flows through the Event Bus** – No feature bypasses Kernel events
2. **Agents own business logic** – Stripe, payments, AI, marketplace logic lives in agents
3. **UI never touches external APIs directly** – All integrations behind agent facades

### Directory Structure
```
D:\Labs OS
├─ apps/
│  ├─ web/              ← Next.js UI (React 19, Tailwind)
│  └─ api/              ← API + webhook handlers
├─ kernel/
│  ├─ event-bus/        ← Pub/sub event routing
│  ├─ identity/         ← Auth & user management
│  └─ permissions/      ← Role-based access control
├─ economy/
│  ├─ stripe/           ← Payment gateway integration
│  ├─ crypto/           ← Future: Web3, wallets
│  └─ marketplace/      ← Asset trading & ownership
├─ agents/
│  ├─ core/             ← Base Agent class
│  ├─ money-agent/      ← Payments, rewards, yield
│  ├─ content-agent/    ← Moderation, recommendations
│  └─ market-agent/     ← Trading, pricing, liquidity
├─ ui-engine/
│  ├─ space-manager/    ← Multi-window state
│  ├─ dock/             ← Taskbar/application switcher
│  └─ windowing/        ← Draggable, resizable windows
├─ services/            ← Microservices (Redis, NATS)
├─ scripts/             ← Automation & deployment
└─ docs/                ← Documentation
```

---

## 💻 TECHNOLOGY STACK {#tech-stack}

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | ^16.0.10 | React framework, SSR/SSG |
| **React** | 19.2.1 | UI components |
| **TypeScript** | 5.9.3 | Type safety |
| **Tailwind CSS** | ^4.1.18 | Styling |
| **Radix UI** | Latest | Accessible components |
| **Framer Motion** | ^12.23.26 | Animations |

### Backend & Services
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ (21+ recommended) | Runtime |
| **Prisma** | ^7.1.0 | ORM & database |
| **Firebase** | ^12.6.0 | Auth, DB, storage |
| **Stripe** | ^20.0.0 | Payments |
| **OpenAI** | ^6.10.0 | LLM integration |
| **Redis** | (ioredis ^5.8.2) | Caching, sessions |
| **NATS** | ^2.29.3 | Message broker |

### DevOps & Development
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Docker** | Latest | Containerization |
| **ESLint** | ^9.39.1 | Code linting |
| **Sentry** | ^10.30.0 | Error tracking |
| **Vercel Analytics** | ^1.6.1 | Performance monitoring |

---

## 🔧 SETUP & INSTALLATION {#setup}

### Prerequisites
```powershell
# Check Node.js
node --version
# Expected: v18+ (v21+ recommended)

# Check npm/pnpm
npm --version
# Expected: v10+

# Git (for version control)
git --version
# Expected: v2.30+
```

### 1. Full Environment Setup

#### Option A: Automated (Windows PowerShell)
```powershell
cd "d:\Labs OS\LitreeLabsFirebase-master"

# Run setup script (configures everything)
./setup-vscode.ps1

# Verify environment
./verify-setup.ps1
```

#### Option B: Manual (Cross-platform)
```bash
# Install Node dependencies
npm install

# Install global tools
npm install -g firebase-tools  # Firebase CLI
npm install -g stripe-cli       # Stripe webhook testing
npm install -g vercel           # Vercel deployment

# Create .env.local
cp .env.example .env.local
```

### 2. Environment Variables

**Required Keys:**
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_email@iam.gserviceaccount.com

# Stripe
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI
OPENAI_API_KEY=sk-...

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**See:** [.env.local.setup.example](./LitreeLabsFirebase-master/.env.local.setup.example)

### 3. Database Setup

#### Prisma (if using)
```bash
# Generate Prisma client
npx prisma generate

# Create/migrate database
npx prisma migrate dev --name init

# Open Prisma Studio
npx prisma studio
```

#### Firebase Firestore (primary)
```bash
# Initialize Firebase (interactive)
firebase init

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

---

## 🚀 RUNNING THE PROJECT {#running}

### Development Mode
```bash
npm run dev

# Output: 
# ▲ Next.js 16.0.10
# - Local: http://localhost:3000
# - Environments: .env.local

# For Mac/Linux
pnpm dev
```

### Build & Production
```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

### Code Quality
```bash
# Lint all files
npm run lint

# Auto-fix linting issues
npm run lint-fix

# Type check (TypeScript)
npm run typecheck
```

### Testing (Stripe Webhooks Locally)
```bash
# In separate terminal, forward Stripe events
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Note the signing secret, add to .env.local
# STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🧠 KEY SYSTEMS DEEP DIVE {#systems}

### 1. EVENT BUS (Kernel Nervous System)

**What it does:** Decoupled pub/sub messaging for all internal events.

**Example Usage:**
```typescript
// Emit an event
emit({
  type: "Economy.Stripe.payment_intent.succeeded",
  source: "stripe",
  payload: { 
    paymentIntentId: "pi_123",
    userId: "user_456",
    amount: 9999
  }
});

// Subscribe to events
subscribe("Economy.Stripe.", async (event) => {
  console.log("Stripe event:", event.type);
  // Business logic here
});
```

**Key Principle:** Fire-and-forget, but awaited internally. Async delivery.

### 2. STRIPE WEBHOOKS

**File:** `apps/api/src/webhooks/stripe.ts`

**Pattern:**
1. Receive raw body + signature header
2. Verify with `stripe.webhooks.constructEvent()`
3. Emit internal event: `Economy.Stripe.{event.type}`
4. Respond 200 immediately
5. MoneyAgent consumes event & updates balances

**Key Events:**
- `payment_intent.succeeded` → User credited
- `customer.subscription.deleted` → Subscription removed
- `charge.failed` → Failure notification

### 3. AGENTS (Business Logic)

**Base Pattern:**
```typescript
class Agent {
  id: string;
  name: string;
  
  async initialize() { }
  async handleEvent(event: KernelEvent) { }
  async shutdown() { }
}
```

**Key Agents:**
- **MoneyAgent** → Payments, rewards, yield
- **ContentAgent** → Moderation, recommendations
- **MarketAgent** → Trading, pricing, liquidity

### 4. MARKETPLACE ECONOMY

**Features:**
- Asset ownership & trading
- Dynamic pricing (supply/demand)
- Marketplace fees
- Seller reputation/ratings

---

## 🐛 TROUBLESHOOTING {#troubleshooting}

### Port 3000 Already in Use
```powershell
# Find process using port 3000
Get-NetTCPConnection -LocalPort 3000

# Kill it
Stop-Process -Id <PID> -Force

# Or use different port
npm run dev -- -p 3001
```

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -r node_modules
rm package-lock.json
npm install
```

### Firebase Authentication Issues
```bash
# Re-initialize Firebase
firebase logout
firebase login

# Verify configuration
firebase projects:list
```

### Stripe Webhook Not Triggering
```bash
# Check webhook listening is active
stripe listen --print-secret

# Verify forwarding is working
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test with curl
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type":"payment_intent.succeeded"}'
```

### TypeScript Errors
```bash
# Type check entire project
npm run typecheck

# Clear TypeScript cache
rm -r .next

# Regenerate types
npx prisma generate
```

---

## 📚 USEFUL RESOURCES {#resources}

### Official Documentation
| Resource | Link |
|----------|------|
| **Next.js Docs** | https://nextjs.org/docs |
| **Firebase Docs** | https://firebase.google.com/docs |
| **Stripe Docs** | https://stripe.com/docs/api |
| **Prisma Docs** | https://www.prisma.io/docs/ |
| **React Docs** | https://react.dev |
| **TypeScript Docs** | https://www.typescriptlang.org/docs/ |

### Project Documentation
- [MASTER_COPILOT_PROMPT.md](./MASTER_COPILOT_PROMPT.md) – Full architecture specification
- [MASTER_COPILOT_PROMPT_QUICK_START.md](./MASTER_COPILOT_PROMPT_QUICK_START.md) – Copilot integration guide
- [VS_CODE_SETUP_INDEX.md](./VS_CODE_SETUP_INDEX.md) – VS Code configuration
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) – Quick lookup guide

### Development Tools
```bash
# Install globally for convenience
npm install -g \
  firebase-tools \      # Firebase CLI
  stripe-cli \          # Stripe testing
  vercel \              # Vercel deployment
  pnpm \                # Package manager (alternative to npm)
  tsx \                 # TypeScript execution
  @nestjs/cli           # NestJS (if using)
```

### AI & Copilot Integration
- **GitHub Copilot** – Use `.github/copilot` settings
- **VS Code AI** – Install extensions from [VS Code Marketplace](https://marketplace.visualstudio.com)
- **ChatGPT/Claude** – Paste entire MASTER_COPILOT_PROMPT.md for full context

---

## 📞 SUPPORT & NEXT STEPS

### Get Help
1. **For code issues:** Check [VS_CODE_SETUP_INDEX.md](./VS_CODE_SETUP_INDEX.md)
2. **For architecture:** Read [MASTER_COPILOT_PROMPT.md](./MASTER_COPILOT_PROMPT.md)
3. **For quick answers:** See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
4. **For deployment:** Follow [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)

### Recommended Next Steps
- [ ] Run setup script (`./setup-vscode.ps1`)
- [ ] Start dev server (`npm run dev`)
- [ ] Open http://localhost:3000 in browser
- [ ] Create first `.env.local` with API keys
- [ ] Test Stripe integration with stripe-cli
- [ ] Deploy to Vercel/Firebase

### Version Information
- **Node.js:** v21+ recommended
- **npm:** v10+
- **TypeScript:** 5.9.3
- **Next.js:** 16.0.10
- **React:** 19.2.1

---

**Questions?** Check [MASTER_COPILOT_PROMPT.md](./MASTER_COPILOT_PROMPT.md) for full context on any system.
