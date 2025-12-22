# LABS OS M365 COPILOT — QUICK START (RIGHT NOW)

## What You Have (5 Files)

✅ **MASTER_COPILOT_PROMPT.md** – Full architecture, all systems, all rules  
✅ **MASTER_COPILOT_PROMPT_LOOP.md** – Task breakdown for sprint planning  
✅ **MASTER_COPILOT_PROMPT_WORD.md** – Rich reference documentation  
✅ **MASTER_COPILOT_PROMPT_TEAMS.md** – Quick decision reference  
✅ **MASTER_COPILOT_PROMPT_USAGE_GUIDE.md** – How to use all 4  

**All in:** `D:\Labs OS\`

---

## Do This NOW (5 Minutes)

### 1. Open Copilot Chat
- Go to `copilot.microsoft.com`
- Or use M365 Copilot in Word/Teams
- Or use GitHub Copilot Chat

### 2. Paste This (Your First Prompt)

```
I'm building LABS OS, an event-driven platform with AI agents and a built-in marketplace.

Here is the COMPLETE architecture specification:

[PASTE ENTIRE CONTENTS OF MASTER_COPILOT_PROMPT.md HERE]

I need you to:
1. Confirm you understand the three rules
2. Identify which components we need to build first
3. Generate code for the first component

Start with: Generate the base Agent class and MoneyAgent implementation following the patterns above.
```

### 3. Copilot Will Generate
- Complete base Agent class
- Full MoneyAgent implementation
- Event subscription patterns
- Database update logic
- Idempotency handling

### 4. Copy Generated Code
- Save to `agents/core/Agent.ts`
- Save to `agents/money-agent.ts`
- Review + adjust
- Commit

**Time:** 3 minutes setup + 5 minutes code review = 8 minutes to have production-ready agent code.

---

## Do This AFTER First Run

### Step 1: Plan Next Task
Paste this into Copilot:

```
[PASTE ENTIRE CONTENTS OF MASTER_COPILOT_PROMPT_LOOP.md]

I just completed the base Agent class and MoneyAgent.
What should I do next? What are dependencies?
Create a prioritized list with time estimates.
```

### Step 2: Copy Loop Version to Microsoft Loop
1. Create new Loop page
2. Title: "LABS OS Build 1 Maxed – Task Breakdown"
3. Paste entire contents of `MASTER_COPILOT_PROMPT_LOOP.md`
4. Create tasks from the list
5. Assign to team members
6. Track progress

### Step 3: Create Word Documentation
1. Create new Word document
2. Title: "LABS OS Technical Reference"
3. Paste entire contents of `MASTER_COPILOT_PROMPT_WORD.md`
4. Add your own sections (team decisions, customizations, progress notes)
5. Use Copilot to:
   - Expand sections
   - Generate deployment runbooks
   - Create troubleshooting guides

### Step 4: Pin Teams Reference
1. Go to team's #architecture or #general channel
2. Pin `MASTER_COPILOT_PROMPT_TEAMS.md`
3. Say: "This is our quick reference for architecture decisions"
4. When questions come up, reference the pinned file

---

## Common First Prompts to Copilot

### Prompt 1: Generate MoneyAgent
```
[Paste MASTER]

Generate a complete MoneyAgent class that:
- Listens to Economy.Stripe.payment_intent.succeeded
- Updates user balance idempotently
- Emits Economy.BalanceUpdated event
- Handles errors gracefully
- Logs all actions
```

### Prompt 2: Database Schema
```
[Paste MASTER]

I'm using Prisma as my ORM. Generate a complete prisma/schema.prisma
that supports:
- Users with balance tracking
- Assets with ownership and metadata
- Transactions with reason tracking
- ProcessedEvents for idempotency
- Spaces for UI state persistence
```

### Prompt 3: API Webhook Handler
```
[Paste MASTER]

Generate the complete Stripe webhook handler at apps/api/src/webhooks/stripe.ts that:
- Verifies Stripe signatures
- Emits internal events
- Responds immediately (async processing)
- Handles errors
```

### Prompt 4: Monorepo Setup
```
[Paste MASTER]

Generate:
1. Root package.json with workspaces for: apps/web, apps/api, kernel, agents, economy, ui-engine
2. tsconfig.json for root
3. TypeScript config for each workspace
4. ESLint config
5. Build scripts
```

### Prompt 5: Start-Lab Script
```
Generate an improved version of scripts/start-labs.ps1 that:
- Checks for required tools (Node.js, npm/pnpm)
- Verifies .env file exists
- Starts each service with error handling
- Shows health checks (waits for servers to be ready)
- Provides unified logging output
```

---

## Examples: Real Copilot Conversations

### Conversation 1: Build MoneyAgent

**You:** [Paste MASTER] Generate MoneyAgent implementation.

**Copilot:** [Generates 200 lines of production-ready code]

**You:** This is good. Now add:
1. Logging for every transaction
2. Retry logic if database is temporarily down
3. Alert if single payment exceeds $10,000

**Copilot:** [Updates code with all three additions]

**You:** Explain how this handles the three rules of LABS OS.

**Copilot:** 
> "This implementation follows all three rules:
> 1. Rule 1 (Event Bus Sovereign) – Agent subscribes via event pattern, never called directly
> 2. Rule 2 (Agents Own Logic) – All business logic (crediting, rewards, logging) lives here
> 3. Rule 3 (No External APIs from UI) – Database/Stripe interactions happen in agent, not UI
> 
> The webhook handler only emits the event. MoneyAgent owns everything else."

---

### Conversation 2: Plan Sprint

**You:** [Paste LOOP] We just finished Task 1 (Monorepo). What's next? How many tasks can we parallelize?

**Copilot:**
> "Tasks 2, 3, and 4 are parallelizable:
> - Task 2 (Auth Kernel) – ~5 hrs
> - Task 3 (Database Schema) – ~3 hrs
> - Task 4 (Stripe Setup) – ~2 hrs
> 
> Tasks 5 and 6 depend on 2, 3, 4. Start them after those complete.
> 
> Recommended order: Tasks 2+3+4 in parallel (10 hrs total, 1–2 days).
> Then Tasks 5+6 in parallel (8 hrs total, 1 day).
> Then Task 7 (basic UI, 5 hrs).
> 
> Total Build 1 Genesis: 4–5 days with one developer."

**You:** Generate a Gantt chart showing this.

**Copilot:** [Creates ASCII or Markdown table showing timeline]

---

### Conversation 3: Debug Payment Flow

**You:** Payments are coming in but balances aren't updating. Help me debug.

**Copilot:** Let me check the LABS OS architecture:
> "1. Does the Stripe webhook verify the signature? (Yes, in your webhook handler)
> 2. Is MoneyAgent subscribed to the correct pattern? (Check interests: ['Economy.Stripe.payment_intent.succeeded'])
> 3. Is MoneyAgent.handle() being called?
> 
> Add this logging to see what's happening:
> ```
> console.log('Webhook received:', event.type);
> console.log('MoneyAgent handler called for:', event.type);
> console.log('User balance after update:', newBalance);
> ```
> 
> Paste the logs and I'll help diagnose."

---

## Templates: What to Paste to Copilot

### Template 1: Architecture Question
```
[Paste MASTER]

Question: Should X happen in [Component]?
Context: [Describe scenario]
Where should this code go?
```

### Template 2: Code Generation
```
[Paste MASTER]

Generate [Component/Feature] that:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]
Following the patterns above.
```

### Template 3: Debugging
```
[Paste MASTER]

Problem: [Describe issue]
Here's the code (paste):
[Paste code]
Why isn't this working? How do I fix it?
```

### Template 4: Planning
```
[Paste LOOP]

What's our critical path for the next sprint?
Identify which tasks block others.
Create a prioritized list with time estimates.
```

### Template 5: Architecture Change
```
[Paste MASTER]

I want to add [New System].
How should it fit into the LABS OS architecture?
What events should it emit/listen to?
Which agent (if any) should own the logic?
```

---

## Team Collaboration Workflow

### Day 1: Setup
- [ ] All team members get `MASTER_COPILOT_PROMPT.md`
- [ ] Create shared Loop page with `MASTER_COPILOT_PROMPT_LOOP.md`
- [ ] Pin `MASTER_COPILOT_PROMPT_TEAMS.md` in Teams
- [ ] Create shared Word doc with `MASTER_COPILOT_PROMPT_WORD.md`

### Day 2–3: Generate Core Components
- [ ] Dev A: Generates Monorepo setup + MoneyAgent
- [ ] Dev B: Generates Database schema + migrations
- [ ] Dev C: Generates Stripe webhook handler
- [ ] Dev D: Generates Auth kernel

### Day 4–5: Integration
- [ ] Connect all components end-to-end
- [ ] Test payment flow: Stripe → webhook → event → MoneyAgent → balance update
- [ ] Deploy to dev environment

### Week 2: Expand
- [ ] Add ContentAgent
- [ ] Add MarketAgent
- [ ] Implement UI Spaces
- [ ] Build marketplace

---

## Success Metrics (How to Know It's Working)

### Day 1
- [ ] Copilot generates code that compiles
- [ ] Generated code follows the three rules
- [ ] Generated code includes appropriate tests/error handling

### Day 3
- [ ] `npm run dev` boots without errors
- [ ] `npm run lint` returns 0 violations
- [ ] `npm run test` passes

### Day 5
- [ ] End-to-end test: Stripe payment → balance updates
- [ ] Event log shows correct event cascade
- [ ] Team feels productive (code generation saved time)

### Week 2
- [ ] System is self-documenting (Copilot understands it)
- [ ] New features follow same patterns (no rewriting)
- [ ] Onboarding a new dev takes <2 hours

---

## Troubleshooting

**"Copilot isn't understanding the architecture."**  
→ Paste ENTIRE prompt, not just a section. Copilot needs full context.

**"Generated code doesn't compile."**  
→ Tell Copilot: "This has a TypeScript error. Here's the error message. Fix it."

**"Generated code violates the three rules."**  
→ Tell Copilot: "This violates Rule 2 (agents own business logic). Refactor so the logic moves to an agent."

**"I don't know where to start."**  
→ Use this order: Monorepo → Auth → Database → Stripe → MoneyAgent → UI Spaces.

**"Need more detail on a component."**  
→ Paste MASTER and say: "Explain [Component] in detail with a code example."

---

## Right Now: Your First Action

1. **Open Copilot** – `copilot.microsoft.com` or M365 Copilot
2. **Copy this text:**
   ```
   I'm building LABS OS. Here's the complete architecture:
   
   [PASTE ENTIRE MASTER_COPILOT_PROMPT.md]
   
   Generate the base Agent class.
   ```
3. **Paste to Copilot**
4. **Wait 10 seconds** – Copilot generates code
5. **Copy code** – Save to `agents/core/Agent.ts`
6. **Done** – You now have production-grade foundation code

**Time investment:** 5 minutes.  
**Value created:** Production-ready base class + architectural validation.

---

## Next: Build Momentum

Once you have Agent.ts:
1. Generate MoneyAgent
2. Generate Stripe webhook
3. Generate database schema
4. Connect them end-to-end
5. Test payment flow

By end of Day 1, you'll have a working payment system. 

**That's the power of architecture + AI code generation.**

---

**Version:** Quick Start v1  
**Date:** December 11, 2025  
**For:** Immediate LABS OS Build 1 Genesis launch
