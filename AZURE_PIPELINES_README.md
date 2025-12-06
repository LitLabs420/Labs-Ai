# Azure DevOps Pipelines - Important Notice

## ⚠️ Important: Pipeline Technology Mismatch

This repository contains **Next.js/TypeScript** application code, but the provided Azure DevOps pipelines (`azure-pipelines-*.yml`) are configured for **.NET applications**.

### Current Situation

The pipeline files were created based on a template request for .NET applications and include:
- `dotnet restore`, `dotnet build`, `dotnet publish` commands
- .NET SDK version configuration
- Framework-dependent and self-contained deployment options

### Required Actions

To use these pipelines with this Next.js application, you must **adapt the build steps** as follows:

#### Replace .NET Build Steps

**Current (.NET):**
```yaml
- task: UseDotNet@2
  inputs:
    packageType: 'sdk'
    version: $(dotnetVersion)

- script: dotnet restore
- script: dotnet build --configuration $(buildConfiguration)
- script: dotnet publish -c $(buildConfiguration)
```

**Should Be (Next.js):**
```yaml
- task: NodeTool@0
  inputs:
    versionSpec: '20.x'

- script: npm ci
  displayName: 'Install dependencies'

- script: npm run build
  displayName: 'Build Next.js app'

# For standalone deployment
- script: |
    npm run build
    cp -r .next/standalone $(Build.ArtifactStagingDirectory)/publish
    cp -r .next/static $(Build.ArtifactStagingDirectory)/publish/.next/static
    cp -r public $(Build.ArtifactStagingDirectory)/publish/public
  displayName: 'Prepare standalone build'
```

### Deployment Options for Next.js on Azure

#### Option 1: Azure Static Web Apps (Recommended for Next.js)
Azure Static Web Apps is purpose-built for frontend frameworks like Next.js:
- Automatic builds from GitHub
- Global CDN
- Integrated staging environments
- Free tier available

See: [Deploy Next.js on Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/deploy-nextjs)

#### Option 2: Azure App Service with Node.js Runtime
Use the provided pipelines with modifications:
1. Replace .NET build steps with Node.js build steps (see above)
2. Set App Service runtime to Node.js 20
3. Configure startup command: `node server.js` (for standalone builds)

#### Option 3: Container Deployment (azure-pipelines-container.yml)
This is the most flexible option:
1. Create a `Dockerfile` for the Next.js app
2. Use the existing `azure-pipelines-container.yml` (minimal changes needed)
3. Deploy to Azure App Service for Containers

**Sample Dockerfile for Next.js:**
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Option 4: Vercel (Currently Deployed)
The repository already uses Vercel for deployment (see `.vercel/` directory). This is the recommended platform for Next.js applications.

### What to Do Next

1. **If you want Azure deployment**: Choose one of the options above and adapt the pipelines
2. **If you want to keep .NET pipelines**: These can serve as reference templates for future .NET projects
3. **If you want both**: Keep the .NET templates and create separate Next.js-specific pipelines

### Files Overview

| File | Purpose | Status |
|------|---------|--------|
| `azure-pipelines-windows.yml` | Windows App Service (.NET) | ⚠️ Needs adaptation for Next.js |
| `azure-pipelines-linux.yml` | Linux App Service (.NET) | ⚠️ Needs adaptation for Next.js |
| `azure-pipelines-container.yml` | Container deployment | ✅ Can work with Dockerfile |
| `azure-pipelines-publishprofile.yml` | Publish profile auth | ⚠️ Needs adaptation for Next.js |
| `AZURE_DEVOPS_DEPLOYMENT_GUIDE.md` | Comprehensive guide | ⚠️ .NET-focused documentation |

### Recommended Next Steps

1. **For Azure Static Web Apps** (easiest):
   - Create a new Static Web App in Azure Portal
   - Connect to this GitHub repository
   - Azure will auto-generate the deployment workflow

2. **For Azure App Service with Node.js**:
   - Adapt one of the pipeline files (linux recommended)
   - Replace .NET steps with Node.js steps
   - Test in a non-production environment first

3. **For Container Deployment**:
   - Create the Dockerfile (see sample above)
   - Update `next.config.ts` to enable standalone output:
     ```typescript
     output: 'standalone'
     ```
   - Use `azure-pipelines-container.yml` with minimal changes

4. **Continue with Vercel** (current):
   - No action needed
   - Keep these Azure pipelines as reference for future needs

### Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Deploy Next.js to Azure](https://docs.microsoft.com/en-us/azure/static-web-apps/deploy-nextjs)
- [Next.js Docker Deployment](https://github.com/vercel/next.js/tree/canary/examples/with-docker)
- [Azure App Service Node.js](https://docs.microsoft.com/en-us/azure/app-service/quickstart-nodejs)

### Support

For questions or assistance with adapting these pipelines:
1. Review the existing CI workflow: `.github/workflows/ci-gitleaks.yml`
2. Check the Next.js deployment docs
3. Open an issue in this repository

---

**Created**: December 5, 2024  
**Reason**: Template mismatch between request (.NET) and repository (Next.js)  
**Action Required**: Adapt pipelines or create Next.js-specific versions
