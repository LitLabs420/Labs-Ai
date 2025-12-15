# Vercel SDK Integration Guide

Complete setup and usage guide for the Vercel SDK integration in LitReeLab Studio.

## Table of Contents
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Service Methods](#service-methods)
- [Best Practices](#best-practices)

## Installation

The Vercel SDK has already been installed:

```bash
pnpm add @vercel/sdkz
```

Additionally, the peer dependency warning for `ws` has been resolved:

```bash
pnpm add ws@^8.18.0
```

## Configuration

### 1. Environment Variables

Add the following to your `.env` file:

```bash
# Vercel API Token (Get from Vercel Dashboard > Settings > Tokens)
VERCEL_API_TOKEN=your_vercel_api_token_here

# Vercel Team ID (Optional - for team-level operations)
VERCEL_TEAM_ID=your_vercel_team_id_here

# Vercel Project ID (Your deployed project identifier)
VERCEL_PROJECT_ID=your_vercel_project_id_here

# Vercel URL (Auto-generated on deployment)
VERCEL_URL=your-project.vercel.app
```

### 2. Getting Your Vercel API Token

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Settings > Tokens
3. Create a new token with appropriate scopes
4. Copy the token and add it to your `.env` file

### 3. Getting Your Team ID (Optional)

If you're working with a team:
1. Navigate to your team settings in Vercel Dashboard
2. The Team ID is in the URL: `https://vercel.com/teams/[TEAM_ID]`
3. Add it to your `.env` file

## API Endpoints

### Deployment Endpoints

#### Create a Deployment
```
POST /api/vercel/deploy
```

**Request Body:**
```json
{
  "name": "my-project",
  "gitSource": {
    "type": "github",
    "repo": "username/repository",
    "ref": "main"
  },
  "env": {
    "API_KEY": "value"
  },
  "buildCommand": "pnpm run build",
  "framework": "nextjs"
}
```

**Response:**
```json
{
  "success": true,
  "deployment": { /* deployment object */ },
  "url": "https://deployment-url.vercel.app"
}
```

#### Get Deployment Status
```
GET /api/vercel/deploy?id=deploymentId
```

**Response:**
```json
{
  "success": true,
  "deployment": { /* deployment object */ },
  "status": "READY",
  "url": "https://deployment-url.vercel.app"
}
```

### Project Endpoints

#### Create a Project
```
POST /api/vercel/projects
```

**Request Body:**
```json
{
  "name": "my-new-project",
  "framework": "nextjs",
  "buildCommand": "pnpm run build",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install"
}
```

#### Get Project Details
```
GET /api/vercel/projects?id=projectId
```

#### List All Projects
```
GET /api/vercel/projects?limit=20
```

#### Update Project Settings
```
PATCH /api/vercel/projects?id=projectId
```

**Request Body:**
```json
{
  "buildCommand": "pnpm run build",
  "framework": "nextjs"
}
```

### Environment Variable Endpoints

#### Set Environment Variable
```
POST /api/vercel/env
```

**Request Body:**
```json
{
  "projectId": "prj_xxx",
  "key": "API_KEY",
  "value": "secret_value",
  "target": "production"
}
```

#### Get Environment Variables
```
GET /api/vercel/env?projectId=prj_xxx
```

#### Delete Environment Variable
```
DELETE /api/vercel/env?projectId=prj_xxx&envId=env_xxx
```

## Usage Examples

See `lib/examples/vercel-deployment-example.ts` for ready-to-run snippets using `vercelService`.

### Example 1: Deploy from GitHub

```typescript
const response = await fetch('/api/vercel/deploy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'litlabs-production',
    gitSource: {
      type: 'github',
      repo: 'LitLabs420/Labs-Ai',
      ref: 'main'
    },
    env: {
      DATABASE_URL: process.env.DATABASE_URL,
      NEXT_PUBLIC_API_URL: 'https://api.litlabs.com'
    }
  })
});

const { deployment, url } = await response.json();
console.log(`Deployed to: ${url}`);
```

### Example 2: Create and Configure a New Project

```typescript
// 1. Create project
const projectResponse = await fetch('/api/vercel/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'my-new-project',
    framework: 'nextjs',
    buildCommand: 'pnpm run build'
  })
});

const { project } = await projectResponse.json();

// 2. Add environment variables
await fetch('/api/vercel/env', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: project.id,
    key: 'DATABASE_URL',
    value: 'postgresql://...',
    target: 'production'
  })
});
```

### Example 3: Using the Service Directly

```typescript
import { vercelService } from '@/lib/vercel-service';

// Create a deployment
const result = await vercelService.createDeployment({
  name: 'my-app',
  buildCommand: 'pnpm run build',
  env: {
    NODE_ENV: 'production'
  }
});

if (result.success) {
  console.log('Deployment URL:', result.url);
}

// List all deployments
const deployments = await vercelService.listDeployments();
console.log('Total deployments:', deployments.deployments?.length);
```

### Example 4: Monitor Deployment Status

```typescript
async function waitForDeployment(deploymentId: string) {
  let status = 'BUILDING';
  
  while (status === 'BUILDING' || status === 'QUEUED') {
    const response = await fetch(`/api/vercel/deploy?id=${deploymentId}`);
    const { deployment } = await response.json();
    status = deployment.readyState;
    
    console.log(`Deployment status: ${status}`);
    
    if (status !== 'READY') {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  return status === 'READY';
}
```

## Service Methods

The `VercelService` class provides the following methods:

### Deployment Methods
- `createDeployment(config)` - Create a new deployment
- `getDeployment(deploymentId)` - Get deployment details
- `listDeployments(projectId?, limit?)` - List deployments
- `getDeploymentLogs(deploymentId)` - Get deployment logs
- `cancelDeployment(deploymentId)` - Cancel a deployment

### Project Methods
- `createProject(config)` - Create a new project
- `getProject(projectId)` - Get project details
- `updateProject(projectId, updates)` - Update project settings
- `listProjects(limit?)` - List all projects

### Environment Variable Methods
- `setEnvironmentVariable(projectId, key, value, target?)` - Set an env var
- `getEnvironmentVariables(projectId)` - Get all env vars
- `deleteEnvironmentVariable(projectId, envId)` - Delete an env var

### Domain Methods
- `getDomain(domain)` - Get domain information
- `addDomain(projectId, domain)` - Add a domain to a project

### Team Methods
- `getTeam()` - Get team information

## Best Practices

### 1. Security

- **Never commit** your `VERCEL_API_TOKEN` to version control
- Store sensitive tokens in environment variables
- Use encrypted environment variables for sensitive data
- Rotate API tokens periodically

### 2. Error Handling

Always implement proper error handling:

```typescript
try {
  const result = await vercelService.createDeployment(config);
  
  if (!result.success) {
    console.error('Deployment failed:', result.error);
    // Handle error appropriately
  }
} catch (error) {
  console.error('Unexpected error:', error);
  // Handle unexpected errors
}
```

### 3. Rate Limiting

The Vercel API has rate limits. Implement retry logic with exponential backoff:

```typescript
async function deployWithRetry(config, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await vercelService.createDeployment(config);
      if (result.success) return result;
      
      // Wait before retrying
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

### 4. Environment Management

Use different targets for environment variables:

- `production` - Production environment
- `preview` - Preview/staging deployments
- `development` - Local development

```typescript
// Set different values for different environments
await vercelService.setEnvironmentVariable(
  projectId,
  'API_URL',
  'https://api.production.com',
  'production'
);

await vercelService.setEnvironmentVariable(
  projectId,
  'API_URL',
  'https://api.staging.com',
  'preview'
);
```

### 5. Deployment Automation

Create automated deployment workflows:

```typescript
async function deployToProduction() {
  // 1. Create deployment
  const deployment = await vercelService.createDeployment({
    name: 'litlabs-prod',
    gitSource: {
      type: 'github',
      repo: 'LitLabs420/Labs-Ai',
      ref: 'main'
    }
  });
  
  if (!deployment.success) {
    throw new Error('Deployment failed');
  }
  
  // 2. Wait for deployment to complete
  const isReady = await waitForDeployment(deployment.deployment.id);
  
  // 3. Run post-deployment tasks
  if (isReady) {
    await runPostDeploymentTasks();
  }
  
  return deployment.url;
}
```

## Troubleshooting

### Common Issues

1. **Invalid API Token**
   - Verify your `VERCEL_API_TOKEN` is correct
   - Check token permissions in Vercel Dashboard
   - Regenerate token if necessary

2. **Team ID Required**
   - Some operations require `VERCEL_TEAM_ID`
   - Add it to your environment variables

3. **Rate Limit Exceeded**
   - Implement retry logic with exponential backoff
   - Consider caching responses where appropriate

4. **Build Failures**
   - Check deployment logs: `vercelService.getDeploymentLogs(deploymentId)`
   - Verify environment variables are set correctly
   - Ensure build commands are correct

## Additional Resources

- [Vercel SDK Documentation](https://vercel.com/docs/rest-api)
- [Vercel API Reference](https://vercel.com/docs/rest-api/endpoints)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Vercel API documentation
3. Open an issue in the project repository
