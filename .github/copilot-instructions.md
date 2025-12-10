# GitHub Copilot Instructions for LitLabs AI

> **Purpose**: This file provides comprehensive guidelines for GitHub Copilot coding agents and developers contributing to the LitLabs AI project. It covers development standards, security requirements, architectural patterns, and workflow conventions.
>
> **For Contributors**: If you're a human developer, also see [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.
>
> **For Copilot**: These instructions apply to all code you generate. Follow them strictly to maintain code quality, security, and consistency.
>
> **Last Updated**: December 2025 | Refined for AI agent productivity with emphasis on architecture, integrations, and critical workflows

## Project Overview

LitLabs (Labs-Ai) is a Next.js-based AI-powered platform for content creators, beauty professionals, and small businesses to generate content, manage clients, and monetize their services. The platform integrates with Firebase, Stripe, Google AI, and various third-party services.

## System Architecture Overview

### Core Service Layers

**1. Authentication & Authorization Layer**
- Firebase Authentication handles user identity
- Session tokens valid for 24 hours (rate-limited: 5 attempts/15 minutes)
- Custom `auth-helper` utilities check permissions on every sensitive operation
- Guardian Bot validates behavior patterns before critical operations

**2. Data & Subscription Layer**
- Firestore is the source of truth for all persistent data
- Tiered subscription system (free, starter, creator, pro, agency, education) controls feature access
- Usage tracking prevents abuse through rate limiting (100 req/15 min default, 5 for auth)
- Tier limits enforce operation quotas (AI generations, DM replies, money plays, images)

**3. AI Generation Pipeline**
- Google Generative AI processes text-to-content requests (captions, scripts, DMs)
- Requests flow through rate limiters per tier, then Guardian security checks
- Error handling must never expose API keys or system details

**4. Payment & Monetization Layer**
- Stripe handles subscriptions and billing (webhook security is critical)
- PayPal integration for alternative payments
- Marketplace enables user-to-user content and service monetization

**5. Multi-Channel Distribution**
- TikTok, Instagram, YouTube, WhatsApp, Discord integrations
- Bot builder for custom third-party automations
- Content scheduling and analytics aggregation

### Data Flow Pattern
```
User Request → Auth Check → Permission Verify → Rate Limit Check → 
Guardian Analysis → Execute Operation → Increment Usage → Return Result
```

## Tech Stack

- **Framework**: Next.js 16+ (App Router with Turbopack)
- **Language**: TypeScript 5.9.3 (strict mode enabled)
- **Styling**: Tailwind CSS 4.1.17
- **Backend**: Firebase (Firestore, Authentication, Admin SDK)
- **AI**: Google Generative AI (@google/generative-ai)
- **Payments**: Stripe, PayPal
- **Monitoring**: Sentry for error tracking
- **Analytics**: Vercel Analytics & Speed Insights
- **Deployment**: Vercel, Docker containerization support
- **Form Validation**: Zod schemas for request/input validation
- **Rate Limiting**: rate-limiter-flexible (in-memory token bucket)
- **UI Components**: Radix UI primitives with custom Tailwind styling

## Project Directory Structure

```
Labs-Ai/
├── .github/                    # GitHub configuration
│   ├── copilot-instructions.md # Copilot instructions (this file)
│   ├── agents/                 # Custom agent definitions
│   └── workflows/              # GitHub Actions workflows
├── app/                        # Next.js App Router pages
│   ├── api/                    # API routes
│   ├── auth/                   # Authentication pages
│   ├── billing/                # Billing and subscription pages
│   ├── dashboard/              # Dashboard pages
│   └── [other routes]/         # Other application routes
├── components/                 # React components
│   ├── ui/                     # Reusable UI components
│   └── dashboard/              # Dashboard-specific components
├── context/                    # React Context providers
├── lib/                        # Utility functions and integrations
│   ├── firebase*.ts            # Firebase client/admin/server
│   ├── stripe.ts               # Stripe integration
│   ├── ai.ts                   # AI generation
│   ├── guardian-bot.ts         # Security analysis
│   ├── rateLimiter.ts          # Rate limiting
│   └── [other utils]           # Other utilities
├── types/                      # TypeScript type definitions
├── public/                     # Static assets
├── scripts/                    # Build and deployment scripts
└── android-app/                # Android application (separate)
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Firestore, Authentication enabled
- Stripe account for payments
- Google AI API key for content generation

### Local Development Setup
1. Clone the repository
2. Copy `.env.example` to `.env.local`
3. Fill in required environment variables (see `ENVIRONMENT_SETUP.md`)
4. Run `npm install` to install dependencies
5. Run `npm run dev` to start the development server
6. Open http://localhost:3000 in your browser

## Git Workflow

### Branch Naming Conventions
- **Features**: `feature/<description>` or `feat/<description>`
- **Bug fixes**: `fix/<description>` or `bugfix/<description>`
- **Hotfixes**: `hotfix/<description>`
- **Refactoring**: `refactor/<description>`
- **Documentation**: `docs/<description>`
- **Copilot work**: `copilot/<description>` (for Copilot agent branches)

### Pull Request Process
1. Create a branch following the naming convention above
2. Make your changes with clear, focused commits
3. Run `npm run lint` to check for linting errors
4. Run `npm run build` to ensure the project builds successfully
5. Open a PR with a clear description of changes
6. Address review feedback if any
7. Merge after approval (requires maintainer review)

## Coding Standards

### TypeScript
- **Always use strict TypeScript**: All compiler options in `tsconfig.json` must be respected
- **Prefer type safety**: Use explicit types over `any`, use `unknown` for error catching
- **Use proper type imports**: Import types with `import type` when possible
- **Path aliases**: Use `@/*` for imports (e.g., `@/lib/firebase`, `@/components/ui/Card`)

### React & Next.js
- **Use "use client" directive**: Add at the top of files that use client-side hooks (useState, useEffect, etc.)
- **Server Components by default**: Only use client components when necessary
- **API Routes**: Place in `app/api/` with proper runtime configuration
  - Add `export const runtime = 'nodejs';` for Node.js runtime
  - Add `export const dynamic = 'force-dynamic';` for dynamic routes
  - Add `export const maxDuration = 60;` for long-running operations

### Code Style
- **ESLint**: Run `npm run lint` before committing
- **Unused variables**: ESLint warns on unused vars - clean them up
- **Naming conventions**:
  - Components: PascalCase (e.g., `SiteHeader`, `DashboardLayout`)
  - Functions: camelCase (e.g., `generateContent`, `checkRateLimit`)
  - Constants: UPPER_SNAKE_CASE for true constants (e.g., `MAX_PER_WINDOW`)
  - Files: kebab-case for utilities, PascalCase for components
- **Exports**: Use named exports for components and utilities, default export for page components

### Comments & Documentation
- **Add comments sparingly**: Only when logic is complex or non-obvious
- **Prefer self-documenting code**: Use descriptive variable and function names
- **Document complex algorithms**: Explain the "why" not the "what"
- **JSDoc for public APIs**: Add JSDoc comments for exported functions with complex parameters

## Security Requirements ⚠️

**CRITICAL**: Security is paramount. Always follow these practices:

### Authentication & Authorization

**Rate Limiting First**: All public endpoints must rate limit BEFORE any other processing
```typescript
// WRONG: Process first, then rate limit
const result = processExpensiveOperation();
await checkRateLimit(user.id); // Too late!

// CORRECT: Rate limit first
const rateCheck = await checkRateLimit(user.id);
if (!rateCheck.allowed) return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
```

**Three-Tier Authentication Check** (in order):
1. **User Authentication**: Verify identity with Firebase Auth or API key
2. **Permission Check**: Ensure user has access to requested resource
3. **Tier Verification**: Confirm subscription tier allows the operation

**Critical Auth Pattern**: Never skip any tier:
```typescript
export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request); // Throws 401 if missing
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const canAccess = await checkPermissions(user.uid, resourceId); // Throws 403 if denied
  if (!canAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  
  const tier = await getUserTier(user.uid);
  if (!isTierAllowed(tier, 'operation')) {
    return NextResponse.json({ error: 'Feature not available in your tier' }, { status: 403 });
  }
  // Safe to execute
}
```

### Input Validation & Sanitization

**Zod Validation is Mandatory**: Every API route must validate inputs before processing
- Use Zod schemas in `lib/validators/` for reusable validation
- Never trust `request.body`, `request.query`, or headers without schema validation
- Invalid input always returns 400 with clear error (not 500)

**XSS & Injection Prevention**:
- HTML content from users must be sanitized (use DOMPurify for rich text)
- Never concatenate user input into SQL queries
- Use parameterized queries: `where('field', '==', userInput)` not string concatenation
- Never eval() or Function() with user input

### Guardian Bot Security Analysis

**Critical Operations Requiring Guardian Check**:
- Payment/billing changes
- Account deletion or tier changes
- Mass operations (bulk exports, batch DMs)
- God mode or admin operations
- Unusual IP/location access

**Guardian Usage Pattern**:
```typescript
const ip = request.headers.get("x-forwarded-for") || "unknown";
const guardian = Guardian.getInstance();
const securityCheck = await guardian.analyzeUserBehavior(user.uid, 'payment_update', { ip, amount });
if (!securityCheck.allowed) {
  // Log suspicious activity, notify user, potentially block
  await captureError('Suspicious behavior detected', { user: user.uid, check: securityCheck });
  return NextResponse.json({ error: 'Unable to process request' }, { status: 403 });
}
```

### Error Handling & Logging

**Never Expose Implementation Details**:
- ❌ `Error: Firebase key is sk_live_xxx`
- ❌ `Database connection string: postgresql://user:pass@host`
- ✅ `Error: Unable to process payment`

**Always Use Sentry for Errors**:
```typescript
import { captureError } from '@/lib/sentry';

try {
  // operation
} catch (err: unknown) {
  captureError('Descriptive operation name', { 
    error: err instanceof Error ? err.message : String(err),
    userId: user.uid // Always include context
  });
  return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
}
```

### Secrets Management

- **Never hardcode**: API keys, database credentials, Stripe keys belong in `.env` variables only
- **Reference `.env.example`**: Always check what environment variables are required
- **No secrets in code**: Review PRs for hardcoded tokens or API keys
- **Safe defaults**: Use demo/test API keys for development (clearly marked as test mode)

## Firebase Integration

### Client vs Server Modules (Critical Distinction)

**Client-Side Only (`@/lib/firebase`)**:
- Use in React components and client-side code
- Imports from `firebase/firestore`, `firebase/auth`, etc.
- Has access to user's Firebase token (safe because it's their token)
- Used for features where user is authenticated in browser

**Server-Side Only (`@/lib/firebase-admin`)**:
- Use in API routes, server components, scheduled functions
- Has admin access with Firebase service account credentials
- Can bypass security rules (use carefully!)
- Must validate user permissions manually

**The Critical Pattern**:
```typescript
// ✅ CORRECT - Client component fetching own data
import { db } from '@/lib/firebase';
import { query, where, collection, getDocs } from 'firebase/firestore';

export default function MyData() {
  const [data, setData] = useState(null);
  useEffect(() => {
    const q = query(collection(db, 'users'), where('uid', '==', user.uid));
    getDocs(q).then(snapshot => setData(snapshot.docs));
  }, [user.uid]);
  return <div>{data}</div>;
}

// ✅ CORRECT - API route verifying permissions before admin access
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  const adminDb = getFirestore(); // Has admin access
  
  // Must verify user owns this data before returning it
  const canAccess = await checkUserPermissions(user.uid, resourceId);
  if (!canAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  
  const doc = await adminDb.collection('users').doc(user.uid).get();
  return NextResponse.json(doc.data());
}

// ❌ WRONG - Server-side access without permission verification
export async function GET(request: NextRequest) {
  const adminDb = getFirestore();
  const doc = await adminDb.collection('users').doc(userId).get(); // Bypassed security!
  return NextResponse.json(doc.data());
}
```

### Firestore Collections Structure

**Main Collections & Their Security Model**:
- `users/{uid}`: User profiles (firestore.rules: own document only)
- `subscriptions/{uid}`: Subscription details (own subscription only)
- `usage/{uid}`: Usage tracking (own usage only)
- `templates/{templateId}`: Saved content (owner can access via query)
- `analytics/{uid}`: User analytics (own analytics only)

**Security Rules Principle**: Client code cannot access data it shouldn't. Firestore rules enforce this. API routes must double-check because they have admin access.

### Firestore Best Practices

**Always Use Indexes for Queries**:
```typescript
// If querying multiple fields, add composite index in Firestore console
const q = query(
  collection(db, 'users'),
  where('tier', '==', 'pro'),
  where('createdAt', '>', startDate),
  orderBy('createdAt', 'desc')
);
```

**Batch Operations for Multiple Writes**:
```typescript
import { batch } from 'firebase/firestore';

const batch = writeBatch(db);
batch.set(docRef1, data1);
batch.update(docRef2, data2);
await batch.commit(); // All or nothing
```

**Real-Time Listeners in Components**:
```typescript
import { onSnapshot } from 'firebase/firestore';

useEffect(() => {
  const unsubscribe = onSnapshot(docRef, (snapshot) => {
    setData(snapshot.data());
  });
  return () => unsubscribe(); // Cleanup
}, []);
```

## Tier System & Usage Limits

The platform has a tiered subscription system:
- **free**: Limited features, demo access
- **starter**: Basic features
- **creator**: More features
- **pro**: Advanced features
- **agency**: White-label capabilities
- **education**: Special tier for educational use

**Always check usage limits** before performing paid operations:
- AI generations
- DM replies
- Money plays
- Image generations

Use `lib/usage-tracker.ts` and `lib/tier-limits.ts` for limit enforcement.

## Build & Test Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
```

### Build
```bash
npm run build        # Build for production
npm run start        # Start production server
```

### Linting
```bash
npm run lint         # Run ESLint
```

### Important Notes
- **No test framework**: Currently no automated tests - manual testing required
- **Environment setup**: Copy `.env.example` to `.env.local` for local development
- **Firebase setup**: Requires Firebase project configuration
- **Stripe setup**: Requires Stripe API keys for billing features

### Code Quality Expectations
- **All code must build**: Run `npm run build` and fix any errors before committing
- **Lint-free code**: Run `npm run lint` and address all warnings
- **Type safety**: Fix all TypeScript errors, no `@ts-ignore` without justification
- **Manual testing**: Test your changes in the browser before submitting
- **Security review**: Ensure all security practices are followed
- **Documentation**: Update relevant docs if you change functionality

## Key Areas Requiring Extra Attention

### 1. Rate Limiting (`lib/rateLimiter.ts`)
- In-memory token bucket implementation
- Critical for preventing abuse
- Default: 20 requests per 60 seconds for demo users

### 2. Guardian Bot (`lib/guardian-bot.ts`)
- Security analysis system
- Detects suspicious behavior patterns
- Use on sensitive operations (payments, account changes, god mode)

### 3. AI Generation (`lib/ai.ts`)
- Google Generative AI integration
- Content generation for various use cases
- Rate limited per user tier

### 4. Stripe Integration (`lib/stripe.ts`)
- Payment processing
- Subscription management
- Webhook handling (critical - must be secure)

### 5. Template Library (`lib/template-library.ts`)
- User-saved content management
- Content types: caption, script, dm, moneyPlay, image
- Firestore-backed storage

## Component Structure

### UI Components (`components/ui/`)
- Reusable UI components
- Should be framework-agnostic when possible
- Use Tailwind CSS for styling

### Dashboard Components (`components/dashboard/`)
- Dashboard-specific features
- May have more complex state management
- Often client components ("use client")

### Page Components (`app/`)
- Next.js App Router structure
- `page.tsx` for routes
- `layout.tsx` for shared layouts
- `error.tsx` for error boundaries

## Common Patterns

### Loading States
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

try {
  setLoading(true);
  setError("");
  // ... operation
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : "Something went wrong";
  setError(message);
} finally {
  setLoading(false);
}
```

### API Calls
```typescript
import { callFunctionName } from "@/lib/functionsClient";

const result = await callFunctionName(params);
```

### Firestore Queries
```typescript
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const q = query(
  collection(db, 'collectionName'),
  where('field', '==', value)
);
const snapshot = await getDocs(q);
```

## What to Avoid

❌ **Don't bypass security checks**: Every API route needs authentication
❌ **Don't hardcode limits**: Use tier limits from `lib/tier-limits.ts`
❌ **Don't ignore errors**: Always handle and log errors properly
❌ **Don't use `any` type**: Use proper TypeScript types or `unknown`
❌ **Don't skip input validation**: Validate all user input
❌ **Don't commit secrets**: Never commit `.env.local` or API keys
❌ **Don't remove error boundaries**: Pages should have error handling
❌ **Don't skip rate limiting**: Public endpoints must be rate limited

## Best Practices

✅ **Check existing patterns**: Look at similar files before implementing new features
✅ **Use existing utilities**: Don't reinvent the wheel (auth, firebase, rate limiting, etc.)
✅ **Follow the tier system**: Respect subscription limits
✅ **Log important events**: Use proper logging for debugging
✅ **Handle edge cases**: Empty states, loading states, error states
✅ **Mobile-first**: Ensure responsive design with Tailwind
✅ **Accessibility**: Use semantic HTML and ARIA labels where needed
✅ **Performance**: Lazy load components, optimize images, minimize client-side JS

## Documentation References

- **Detailed setup**: See `README_LITLABS.md` and `README_LITLABS_FINAL.md`
- **Security policies**: See `SECURITY.md`
- **Environment setup**: See `ENVIRONMENT_SETUP.md`
- **Deployment**: See `DEPLOYMENT_SUCCESS.md` and `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **Template packs**: See `TEMPLATE_PACK_*.md` files
- **Troubleshooting**: See `TROUBLESHOOTING.md`

## Working with This Repository

When assigned tasks:
1. **Understand the context**: Read relevant documentation files first
2. **Check existing patterns**: Look at similar implementations
3. **Follow security guidelines**: Never compromise on security
4. **Test thoroughly**: Manual testing is required (no automated tests yet)
5. **Update documentation**: Keep documentation in sync with code changes
6. **Respect the architecture**: Follow the established patterns and conventions

## GitHub Copilot Agent Guidelines

When working on tasks via GitHub Copilot:

### Issue Assignment
- Issues can be assigned to `@copilot` on GitHub.com
- Copilot creates a branch (prefixed with `copilot/`) and opens a PR
- Review Copilot's PRs like any peer developer's work

### Best Results with Copilot
- **Well-scoped issues**: Provide clear descriptions, acceptance criteria, and specific file/feature references
- **Iterative feedback**: Comment on PRs with `@copilot` mentions for refinements
- **Start small**: Begin with bug fixes, documentation, or refactoring tasks
- **Security first**: All security practices in this document apply to Copilot-generated code

### CI/CD Integration
- All Copilot PRs run through standard CI/CD workflows
- Build and lint checks must pass before merge
- Human approval required for all automated workflows

### Custom Agents
- Custom agents can be defined in `.github/agents/` directory
- Use `.agent.md` extension for agent definitions
- Agents provide specialized guidance for specific tasks or domains

## Questions or Clarifications?

If you encounter ambiguous requirements or need clarification:
- Check the documentation files in the root directory
- Look for similar implementations in the codebase
- Ensure your changes align with the security and coding standards above
- When in doubt, prefer security and type safety over convenience
