# GitHub Copilot Instructions for Labs-OS

> **Purpose**: This file provides comprehensive guidelines for GitHub Copilot coding agents and developers contributing to the Labs-OS project. It covers development standards, security requirements, architectural patterns, and workflow conventions.
>
> **For Contributors**: If you're a human developer, also see documentation files in the root directory for detailed project information.
>
> **For Copilot**: These instructions apply to all code you generate. Follow them strictly to maintain code quality, security, and consistency.

## Project Overview

Labs-OS is a modular operating system architecture for AI-powered applications, featuring an event-driven kernel, agent-based business logic, and an economy system for payments and marketplace functionality. The project includes a Next.js-based web UI, an Express API backend, and various microservices.

### Three Unbreakable Laws
1. **Everything flows through the Event Bus** – No feature bypasses Kernel events
2. **Agents own business logic** – Stripe, payments, AI, marketplace logic lives in agents
3. **UI never touches external APIs directly** – All integrations behind agent facades

## Technology Stack

### Backend (API)
- **Language**: TypeScript 5.9.3 (strict mode enabled)
- **Framework**: Express.js 5.2.1
- **Runtime**: Node.js 18+ (21+ recommended)
- **Database**: Prisma 6.19.1 + PostgreSQL
- **Caching**: Redis (ioredis 5.8.2)
- **Message Broker**: NATS 2.29.3
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Security**: Helmet 8.1.0, bcryptjs 3.0.3
- **Validation**: Zod 4.1.13

### Frontend (Web - Located in LitreeLabsFirebase-master)
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase (Firestore, Authentication, Functions)
- **AI**: Google Generative AI
- **Payments**: Stripe

### DevOps
- **Containerization**: Docker
- **Monitoring**: Sentry
- **Version Control**: Git

## Project Structure

```
Labs-OS/
├── .github/                    # GitHub configuration
│   ├── copilot-instructions.md # Copilot instructions (this file)
│   └── instructions/           # Additional AI instructions (Codacy, etc.)
├── apps/
│   └── api/                    # Express API backend
│       ├── src/
│       │   ├── agents/         # Agent implementations
│       │   ├── app/            # Application logic
│       │   ├── auth/           # Authentication middleware
│       │   ├── economy/        # Economy system
│       │   ├── idempotency/    # Idempotency handling
│       │   ├── lib/            # Shared utilities
│       │   ├── routes/         # API routes
│       │   └── index.ts        # Application entry point
│       ├── prisma/             # Database schema & migrations
│       ├── package.json        # API dependencies
│       └── tsconfig.json       # TypeScript config
├── economy/
│   └── marketplace/            # Marketplace functionality
├── agents/                     # Shared agent logic
├── LitreeLabsFirebase-master/  # Next.js web application
├── package.json                # Root dependencies
└── docker-compose.yml          # Service orchestration
```

## Development Guidelines

### TypeScript Standards

1. **Strict Mode is Mandatory**
   - Always use strict TypeScript settings
   - Never use `any` type - use `unknown` and type guards instead
   - Prefer interfaces over types for object shapes
   - Use type inference when possible

2. **Type Safety**
   ```typescript
   // ✅ Good
   interface User {
     id: string;
     email: string;
     role: 'admin' | 'user';
   }
   
   // ❌ Bad
   const user: any = { id: '123' };
   ```

3. **Module System**
   - Use CommonJS (`require`/`module.exports`) for API backend
   - Use ES6 imports for consistency in new code when appropriate
   - Use path aliases for cleaner imports

### Code Organization

1. **Separation of Concerns**
   - Routes handle HTTP concerns only (request/response)
   - Business logic lives in agents or services
   - Database queries through Prisma
   - External API calls through dedicated service modules

2. **Agent Pattern**
   ```typescript
   // Agents encapsulate business logic and external integrations
   // Example: MarketAgent handles marketplace operations
   class MarketAgent {
     async handleEvent(event: MarketEvent): Promise<void> {
       // Process through event bus
     }
   }
   ```

3. **Error Handling**
   - Always use try-catch for async operations
   - Return structured error responses
   - Log errors with context
   ```typescript
   try {
     await someOperation();
   } catch (error) {
     console.error('Operation failed:', error);
     res.status(500).json({ error: 'Operation failed' });
   }
   ```

### Security Best Practices

1. **Authentication & Authorization**
   - Always validate JWT tokens in protected routes
   - Use the `requestContext` middleware for authentication
   - Never expose sensitive data in API responses
   - Implement proper role-based access control

2. **Input Validation**
   - Use Zod schemas for request validation
   - Validate all user inputs before processing
   - Sanitize data before database operations

3. **Environment Variables**
   - Store secrets in `.env` files (never commit)
   - Always use `process.env` with fallbacks
   - Validate required environment variables at startup

4. **Dependencies**
   - Use Helmet for security headers
   - Keep dependencies up to date
   - Review security advisories regularly
   - Use bcryptjs for password hashing

### Database & Prisma

1. **Schema Management**
   - All schema changes through migrations
   - Use descriptive migration names
   - Never modify migrations after deployment

2. **Query Best Practices**
   ```typescript
   // ✅ Good - Use Prisma client properly
   const user = await prisma.user.findUnique({
     where: { id: userId },
     select: { id: true, email: true } // Only select needed fields
   });
   
   // ❌ Bad - Over-fetching data
   const user = await prisma.user.findUnique({
     where: { id: userId }
   }); // Returns all fields
   ```

3. **Transactions**
   - Use transactions for multi-step operations
   - Keep transaction scope minimal

### API Design

1. **RESTful Conventions**
   - Use proper HTTP methods (GET, POST, PUT, DELETE)
   - Use meaningful resource names
   - Return appropriate status codes
   - Version APIs when making breaking changes

2. **Response Format**
   ```typescript
   // Success response
   res.status(200).json({ data: result });
   
   // Error response
   res.status(400).json({ error: 'Invalid input', details: validation });
   ```

3. **Middleware Order**
   - Security (helmet) → Context → CORS → Body parsing → Logging → Routes

### Event-Driven Architecture

1. **NATS Message Bus**
   - All inter-service communication through NATS
   - Use structured event types
   - Implement idempotency for event handlers

2. **Event Naming**
   - Use dot notation: `domain.entity.action`
   - Example: `marketplace.listing.created`

### Testing (When Applicable)

1. **Testing Priority**
   - Unit tests for business logic
   - Integration tests for API endpoints
   - E2E tests for critical user flows

2. **Test Organization**
   - Co-locate tests with source files or use `__tests__` directories
   - Use descriptive test names
   - Mock external dependencies

## Building and Running

### API Backend

```bash
# Development
cd apps/api
npm install
npm run dev          # Starts with hot reload on port 3001

# Build
npm run build        # Compiles TypeScript to dist/

# Production
npm start            # Runs compiled code from dist/

# Database
npm run prisma migrate dev    # Run migrations in development
npm run prisma generate       # Generate Prisma client
npm run prisma studio         # Open Prisma Studio
```

### Root Level

```bash
# Install shared dependencies
npm install

# Docker services
docker-compose up    # Start Redis, NATS, PostgreSQL
```

### Environment Setup

Required `.env` file in `apps/api/`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/labsos"
JWT_SECRET="your-secret-key"
REDIS_URL="redis://localhost:6379"
NATS_URL="nats://localhost:4222"
PORT=3001
NODE_ENV=development
```

## Common Patterns

### Adding a New API Route

1. Create route file in `apps/api/src/routes/`
2. Define route handlers with proper validation
3. Import and mount in `index.ts`
4. Add corresponding agent logic if needed

### Creating a New Agent

1. Create agent directory in `apps/api/src/agents/`
2. Implement agent class with event handlers
3. Register agent in startup sequence
4. Connect to NATS for event subscriptions

### Database Schema Changes

1. Modify `apps/api/prisma/schema.prisma`
2. Run `npm run prisma migrate dev --name description`
3. Commit migration files
4. Update Prisma client: `npm run prisma generate`

## Code Quality

### Linting
- Follow existing code style
- Use consistent formatting
- Add comments for complex logic only
- Keep functions small and focused

### Documentation
- Use JSDoc comments for public APIs
- Keep README files up to date
- Document architectural decisions
- Comment "why" not "what"

### Git Workflow
- Use descriptive commit messages
- Keep commits atomic and focused
- Reference issues in commits
- Follow conventional commit format when applicable

## Additional Resources

- **Project Reference**: See `COMPREHENSIVE_PROJECT_REFERENCE.md`
- **Setup Guide**: See `AUTOMATED_SETUP_DEPLOYMENT_GUIDE.md`
- **Dependencies**: See `DEPENDENCY_INSTALLATION_AUDIT.md`
- **Codacy Instructions**: See `.github/instructions/codacy.instructions.md`

## Notes for Copilot

- When suggesting code, match the existing patterns in the codebase
- Prioritize security and type safety
- Consider the event-driven architecture in all suggestions
- Respect the agent-based design pattern
- Always validate inputs with Zod when appropriate
- Use Prisma for all database operations
- Follow the project's strict TypeScript configuration
- Keep the three unbreakable laws in mind for all architectural decisions
