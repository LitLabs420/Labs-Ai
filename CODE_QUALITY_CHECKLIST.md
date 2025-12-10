# Code Quality Checklist for LitLabs AI

Use this checklist when creating or reviewing code to ensure compliance with project standards.

## Before Committing

### TypeScript Quality
- [ ] No `any` types (use `unknown` for error handling)
- [ ] Proper interfaces defined for props and data structures
- [ ] Type imports use `import type` when possible
- [ ] Path aliases (`@/*`) used consistently
- [ ] No `@ts-ignore` comments without justification
- [ ] Explicit return types for complex functions

### API Routes Security (CRITICAL)
- [ ] **Rate limiting FIRST** - before any processing
- [ ] **Authentication** - verify token/session
- [ ] **Permission check** - ensure user can access resource
- [ ] **Tier verification** - check subscription allows feature
- [ ] **Usage tracking** - check and increment usage
- [ ] **Guardian Bot** - analyze suspicious behavior for sensitive ops
- [ ] Input validation with Zod schemas
- [ ] Error responses use `errorResponse()` utility
- [ ] Success responses use `successResponse()` utility
- [ ] Sentry error capture for all exceptions
- [ ] Rate limit headers in responses

### React/Next.js Patterns
- [ ] `"use client"` directive for client components
- [ ] Server Components by default
- [ ] API route configuration set:
  - [ ] `export const runtime = "nodejs";`
  - [ ] `export const dynamic = "force-dynamic";`
  - [ ] `export const maxDuration = 60;` (for long operations)
- [ ] Error boundaries for pages
- [ ] Loading states for async operations
- [ ] Error states with user-friendly messages

### Error Handling Pattern
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
  captureError('Operation name', { error: err, context });
} finally {
  setLoading(false);
}
```

### Code Style
- [ ] Components: PascalCase
- [ ] Functions: camelCase
- [ ] Constants: UPPER_SNAKE_CASE (for compile-time constants)
- [ ] Files: kebab-case for utilities, PascalCase for components
- [ ] Named exports for utilities
- [ ] Default exports for pages only
- [ ] No console.log (use proper logging)
- [ ] No magic numbers (extract to named constants)
- [ ] Comments explain "why" not "what"

### Firebase Integration
- [ ] Client code uses `@/lib/firebase`
- [ ] API routes use `@/lib/firebase-admin`
- [ ] Server components use `@/lib/firebase-server`
- [ ] Admin operations verify permissions first

### Security
- [ ] No hardcoded secrets or API keys
- [ ] Input sanitized for XSS
- [ ] Parameterized queries (no string concatenation)
- [ ] Error messages don't expose internals
- [ ] Webhook signature verification
- [ ] Idempotency for critical operations

### Testing
- [ ] Manual testing completed
- [ ] Edge cases considered
- [ ] Error states tested
- [ ] Loading states tested

### Build Quality
- [ ] `npm run build` passes
- [ ] `npm run lint` passes with no warnings
- [ ] TypeScript errors resolved
- [ ] No unused variables

## API Route Template

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limiter";
import { errorResponse, successResponse } from "@/lib/api-utils";
import { hasFeature, canUseFeature } from "@/lib/tier-system";
import { Guardian } from "@/lib/guardian-bot";
import { captureError } from "@/lib/sentry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // If needed

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. RATE LIMIT FIRST
  const rateLimitCheck = rateLimit(request, 20, 60);
  if (rateLimitCheck) return rateLimitCheck;

  try {
    // 2. AUTHENTICATION
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    // 3. INPUT VALIDATION
    const body = await request.json();
    // Use Zod schema validation here
    
    // 4. TIER VERIFICATION
    if (!hasFeature(auth.tier, 'feature-name')) {
      return errorResponse(403, 'Forbidden', 'Feature not available in your tier');
    }

    // 5. USAGE CHECK
    const usage = await checkUsage(auth.userId, 'feature');
    if (!canUseFeature(auth.tier, 'feature', usage)) {
      return errorResponse(429, 'Rate limited', 'Monthly quota exceeded');
    }

    // 6. GUARDIAN CHECK (for sensitive operations)
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const guardian = Guardian.getInstance();
    const securityCheck = await guardian.analyzeUserBehavior(
      auth.userId, 
      'operation_type', 
      { ip, ...body }
    );
    if (!securityCheck.allowed) {
      return errorResponse(403, 'Forbidden', 'Unable to process request');
    }

    // 7. EXECUTE OPERATION
    const result = await doOperation(body);

    // 8. INCREMENT USAGE
    await incrementUsage(auth.userId, 'feature');

    // 9. RETURN SUCCESS
    const headers = getRateLimitHeaders(request, 20);
    return successResponse(result, 'Operation completed', 200);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Operation failed";
    captureError('Operation error', { error: message, path: request.url });
    return errorResponse(500, 'Internal Server Error', message);
  }
}
```

## Component Template

```typescript
'use client';

import { useState } from 'react';
import { captureError } from '@/lib/sentry';

interface MyComponentProps {
  // Type all props
}

export default function MyComponent({ }: MyComponentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const handleAction = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ /* data */ }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const result = await response.json();
      setData(result.data);
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      captureError('Action failed', { error: err });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

## Quick Reference

### Priority Levels
- 🔴 **HIGH**: Security, authentication, critical functionality
- 🟡 **MEDIUM**: Code quality, maintainability, consistency
- 🟢 **LOW**: Optimization, refactoring, documentation

### When to Use Guardian Bot
- Payment/billing changes
- Account deletion or tier changes
- Mass operations (bulk exports, batch DMs)
- God mode or admin operations
- Unusual IP/location access

### Rate Limit Tiers
- Free: 20 req/hour
- Starter: 100 req/hour
- Creator: 500 req/hour
- Pro: 2000 req/hour
- Agency: 10000 req/hour

### Must-Have Error Context
```typescript
captureError('Descriptive operation name', {
  error: err instanceof Error ? err.message : String(err),
  userId: auth.userId,
  requestPath: request.url,
  // Add operation-specific context
});
```

---

**Remember:** Security first, type safety always, user experience matters!
