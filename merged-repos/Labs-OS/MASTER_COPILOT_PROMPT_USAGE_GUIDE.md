# HOW TO USE THESE M365 COPILOT PROMPTS

## Four Prompts, Four Contexts

You now have **4 complete prompts** that encode the entire LABS OS architecture. Each is optimized for a different M365 surface.

---

## 1. MASTER_COPILOT_PROMPT.md (Universal)

**Use this when:**
- Starting a new Copilot conversation about LABS OS
- Need comprehensive system knowledge
- Building new features
- Making architectural decisions
- Onboarding new team members

**How to use:**
1. Copy the entire contents of this file
2. Paste into a Copilot chat message
3. Say: *"This is the architecture for my project LABS OS. I'm now going to ask you questions. Use this context to understand every component, rule, and pattern."*
4. Then ask your questions:
   - "Generate the MoneyAgent implementation"
   - "What events should be emitted when a user is banned?"
   - "Design the database schema for assets"
   - "How should we handle agent failures?"

**Length:** ~15,000 words (full system specification)

**What Copilot can then do:**
- Generate complete, architecture-aligned code
- Suggest where new features should go
- Identify violations of the three rules
- Design new agents
- Recommend event types
- Propose database schemas

---

## 2. MASTER_COPILOT_PROMPT_LOOP.md (Task Planning)

**Use this in Microsoft Loop when:**
- Planning Sprint / Build 1 Genesis
- Tracking task dependencies
- Breaking down big features
- Assigning work
- Setting deadlines
- Updating progress

**How to use:**
1. Copy the entire contents into Loop
2. Add a "Copilot Assistance" page that references this prompt
3. Create tasks from the task list
4. In each task description, reference relevant section from prompt
5. Example task in Loop:
   ```
   Task: Implement MoneyAgent Fully
   Owner: You + Copilot
   Duration: 4-6 hrs
   Blocking: Payment processing
   Depends On: Tasks 2, 3, 4
   
   [Link to MASTER_COPILOT_PROMPT_LOOP.md - Task 5]
   
   Acceptance Criteria:
   - [ ] Stripe test payment → user balance increments
   - [ ] Duplicate payment → balance does NOT double-increment
   - [ ] Event log shows all emitted events
   ```

6. Use Copilot in Loop to:
   - Generate task acceptance criteria
   - Estimate task duration
   - Identify task dependencies
   - Generate subtasks
   - Create decision gates

**Length:** ~8,000 words (actionable task breakdown)

**What Copilot can then do:**
- Fill in missing acceptance criteria
- Estimate remaining work
- Identify critical path
- Suggest parallelizable tasks
- Generate meeting agendas based on blockers

---

## 3. MASTER_COPILOT_PROMPT_WORD.md (Comprehensive Reference)

**Use this in Microsoft Word when:**
- Creating architecture documentation
- Writing technical specs
- Building deployment guides
- Creating onboarding materials
- Generating reports
- Archiving system knowledge

**How to use:**
1. Copy entire contents into a Word document
2. Add your own sections (implementation notes, team decisions, etc.)
3. Generate rich formatting:
   - Paste content into Word
   - Add your own commentary
   - Insert diagrams (use Copilot to suggest ASCII art or describe what to draw)
   - Create tables of contents
   - Add hyperlinks between sections

4. Use Copilot in Word to:
   - Expand sections with more detail
   - Generate deployment runbooks
   - Create troubleshooting guides
   - Write meeting notes
   - Generate executive summaries

**Example prompt to Copilot in Word:**
> "Using the LABS OS architecture in this document, generate a 'Production Deployment Runbook' that includes: pre-deployment checklist, step-by-step deployment steps, rollback procedures, and monitoring setup."

**Length:** ~12,000 words (reference manual + code)

**What Copilot can then do:**
- Expand any section with detail
- Generate deployment procedures
- Create troubleshooting trees
- Generate executive summaries
- Create training materials

---

## 4. MASTER_COPILOT_PROMPT_TEAMS.md (Quick Decision Reference)

**Use this in Microsoft Teams when:**
- Need a quick answer during standup
- Answering "where does this code go?" questions
- Debugging in real-time
- Sharing with collaborators
- Quick architectural guidance

**How to use:**
1. Bookmark or pin this in a Teams channel
2. When question comes up, post relevant section into Teams chat
3. Example:
   - **Question:** "I need to implement a referral system. Where does the code go?"
   - **Response:** Share "Pattern 1: New Feature via Event" section
   - **Follow-up:** Paste prompt + question to Copilot for detailed implementation

4. Use Teams Copilot to:
   - Explain which component owns a feature
   - Suggest next steps
   - Identify rule violations
   - Generate code snippets

**Length:** ~2,000 words (scannable quick reference)

**What Copilot can then do:**
- Point to right file locations
- Explain decision matrices
- Provide quick fixes
- Suggest next tasks

---

## Usage Patterns (Real-World Examples)

### Scenario 1: Building New Feature (Referral System)

1. **Start:** Paste MASTER_COPILOT_PROMPT.md into Copilot
2. **Prompt:** 
   ```
   I need to add a referral system where users can invite friends
   and both get a bonus. I've provided the LABS OS architecture.
   Generate the full implementation including:
   - ReferralAgent class
   - Event types
   - Database migrations
   - Reward calculation logic
   ```
3. **Copilot generates:** Complete, production-ready code
4. **You:** Review, adjust, deploy
5. **Reference:** Use MASTER_COPILOT_PROMPT_TEAMS.md for "where does this go?" questions during implementation

---

### Scenario 2: Planning Sprint

1. **Start:** Load MASTER_COPILOT_PROMPT_LOOP.md into Loop
2. **Current Status:** Complete Task 1 (Monorepo Bootstrap)
3. **Plan Next:** Ask Copilot in Loop:
   ```
   Using the task breakdown provided, create a detailed plan for Sprint 2.
   Identify critical path, parallelize where possible, and estimate hours.
   ```
4. **Copilot generates:** Sprint plan with dependencies
5. **Assign:** Distribute tasks to team
6. **Track:** Update task status daily

---

### Scenario 3: Architecture Question During Standup

1. **Team Member:** "Should payment validation happen in API handler or MoneyAgent?"
2. **You:** Reference MASTER_COPILOT_PROMPT_TEAMS.md "Stripe Webhooks" section
3. **Answer:** MoneyAgent (Rule 2)
4. **For Detail:** Post full section or paste to Copilot

---

### Scenario 4: Onboarding New Developer

1. **New Dev Joins:** Overwhelmed by system complexity
2. **You:** Post MASTER_COPILOT_PROMPT_TEAMS.md in Teams
3. **Say:** "Read this in 3 minutes. Then ask me questions."
4. **5 Min Later:** Dev asks targeted, intelligent questions (prompt gave them context)
5. **For Deep Dive:** Provide MASTER_COPILOT_PROMPT.md or MASTER_COPILOT_PROMPT_WORD.md

---

### Scenario 5: Production Issue (Payments Not Working)

1. **Alert:** Payments processed but balances not updating
2. **Troubleshoot:** Reference MASTER_COPILOT_PROMPT_TEAMS.md "Common Issues & Fixes"
3. **Suspicion:** MoneyAgent not subscribed to event
4. **Paste to Copilot:**
   ```
   Payments are being processed but user balances aren't updating.
   Here's the LABS OS architecture.
   Here's the MoneyAgent code (paste).
   Why isn't it working?
   ```
5. **Copilot identifies:** Agent interests array missing pattern
6. **Quick fix:** Update, restart, verify

---

## How to Integrate into Team Workflow

### 1. Save All 4 Prompts to Shared Location
- Repo root: `D:\Labs OS\`
- All 4 files already in place
- Link in team README
- Share link in Slack/Teams channel

### 2. Create Team Knowledge Base in Copilot
- "Here's our LABS OS master prompt" (paste file)
- Save as Copilot reference
- Team members can cite it in conversations
- Builds institutional knowledge

### 3. Reference in Code Comments
```typescript
// This event is emitted per LABS OS architecture
// See: MASTER_COPILOT_PROMPT.md - Section 2.2 (Kernel Event Bus)
await emitEvent({
  type: "Economy.Stripe.payment_intent.succeeded",
  ...
});
```

### 4. Use in Code Review Comments
```
Reviewer: "This function calls MoneyAgent directly. 
See MASTER_COPILOT_PROMPT.md Rule 1: Everything flows through event bus.
Suggested fix: Emit event instead of direct call."
```

### 5. Include in Meeting Agendas
```
Sprint Planning Agenda:
1. Review architecture (reference MASTER_COPILOT_PROMPT_LOOP.md)
2. Clarify task dependencies
3. Assign owners
4. Identify blockers
```

---

## When to Use Which Prompt

| Situation | Use | Why |
|-----------|-----|-----|
| Deep architectural question | MASTER | Comprehensive context for complex decisions |
| Planning sprint/tasks | LOOP | Task breakdown + dependencies |
| Writing docs/runbooks | WORD | Rich format + expandable sections |
| Quick team question | TEAMS | Scannable, fast reference |
| Onboarding | TEAMS (first), then MASTER | Quick overview, then deep dive |
| Code review | TEAMS | Rules + patterns for fast decisions |
| Debugging | MASTER (search for component) | Detailed implementation reference |
| Generating code | MASTER | Full context for best results |
| Training materials | WORD | Rich format for presentation |
| Progress tracking | LOOP | Task status + blockers |

---

## Tips for Maximum Effectiveness

### Tip 1: Paste Entire Prompt First
When asking Copilot questions about LABS OS, always:
1. Paste relevant prompt section (or entire prompt)
2. Then ask your question
3. Copilot will reference context and answer accurately

Bad: "How should I implement MoneyAgent?"  
Good: [Paste MASTER] "Here's the architecture. Generate full MoneyAgent implementation following these patterns."

### Tip 2: Reference Section Numbers
When discussing in team, use section numbers:
- "See MASTER Rule 2" → Everyone knows it's about agents owning logic
- "Check TEAMS Quick Decisions table" → Fast consensus

### Tip 3: Iterative Refinement
First prompt to Copilot:
```
Here's LABS OS architecture. Generate MoneyAgent.
```

Second prompt (after review):
```
The MoneyAgent implementation above is good, but:
1. Add logging for every action
2. Add retry logic for database failures
3. Implement backpressure if queue gets too large
Update the implementation.
```

### Tip 4: Use Copilot's Explanations
When Copilot generates code, ask:
```
Explain the pattern you used in this MoneyAgent implementation.
How does it follow the LABS OS rules?
```

This reinforces learning + validates architecture adherence.

### Tip 5: Keep Prompts Updated
If architecture changes (new agent, new rule, new pattern):
1. Update relevant prompt file
2. Note the change
3. Commit to repo
4. Alert team: "Architecture change – refresh your Copilot context"

---

## FAQ

**Q: Should I paste the entire prompt every time I ask Copilot a question?**  
A: First time (or first time in a new conversation): Yes. Subsequent questions in same chat: Usually no, Copilot remembers context.

**Q: Which prompt should I use as the "source of truth"?**  
A: MASTER_COPILOT_PROMPT.md is the canonical version. Others are derivatives optimized for specific formats.

**Q: Can I modify these prompts for my team's needs?**  
A: Absolutely. These are templates. Add your own sections, rules, patterns, or decisions.

**Q: How often should I update the prompts?**  
A: When major architecture changes happen (new agent, new system, rule changes). Minor updates can be noted inline.

**Q: Can we use these in Copilot GitHub?**  
A: Yes. Paste into GitHub Copilot chat. Works the same as M365 Copilot.

**Q: Should we commit these to the repo?**  
A: Yes. They're documentation. Treat like README.

---

## Summary

**You now have:**
1. ✅ **MASTER** – Comprehensive system prompt for deep architectural work
2. ✅ **LOOP** – Task breakdown + sprint planning
3. ✅ **WORD** – Rich reference documentation
4. ✅ **TEAMS** – Quick decision reference

**Each is:**
- Copy-ready (paste directly into M365)
- Copilot-optimized (structured for AI understanding)
- Production-grade (complete architecture, code patterns, rules)
- Team-friendly (can be shared, referenced, updated)

**Use together as:**
- Specification (MASTER)
- Planning tool (LOOP)
- Documentation (WORD)
- Quick reference (TEAMS)

---

## Next: Hand Off to Copilot

**In Copilot chat, paste this and say:**

> Here is the complete LABS OS Build 1 Maxed architecture. I have 4 prompts (Master, Loop, Word, Teams).
> I'm about to ask you to help build this system.
> Any questions about the architecture before we start?

**Then:** Ask Copilot to generate the next piece (MoneyAgent, database schema, etc.).

---

**Version:** M365 Copilot Master Prompt Usage Guide v1  
**Date:** December 11, 2025  
**For:** LABS OS Build 1 Maxed Foundation Drop
