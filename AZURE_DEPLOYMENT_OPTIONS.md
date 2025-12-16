# 🚀 LitLabs AI - Azure Deployment Options

## Current Status

✅ **Azure CLI Authenticated**
- Subscription: Azure subscription 1 (819e1d9f-68d0-4a52-99d9-19d2c170429d)
- Tenant: Default Directory
- Email: litreelabs@outlook.com

✅ **Resource Group Created**
- Name: litlabs-prod
- Location: East US

❌ **App Service Plan** - Requires quota increase (0/1 Basic VMs)

✅ **Azure MCP Configured**
- GitHub Copilot MCP enabled in VS Code settings
- All Azure MCP tools now available in Copilot Chat

---

## Option 1: Request Quota Increase (Recommended)

### Step 1: Request Quota via Azure Portal

1. Go to: https://portal.azure.com/#view/Microsoft_Azure_Support/NewSupportRequestV3Blade
2. Select **Service and subscription limits (quotas)**
3. Quota type: **App Service**
4. Location: **East US**
5. Current limit: 0 Basic VMs
6. Requested limit: **10 Basic VMs** (to allow growth)

**Processing Time**: Usually 5-30 minutes for quota increases

### Step 2: Alternative - Use Azure CLI to Request Quota

```bash
# This command may help identify the specific quota limit
az quota show \
  --scope "/subscriptions/819e1d9f-68d0-4a52-99d9-19d2c170429d/providers/Microsoft.Web/locations/eastus" \
  --resource-name "BasicVMs"

# Request increase (if available via CLI)
az quota create \
  --resource-name "BasicVMs" \
  --scope "/subscriptions/819e1d9f-68d0-4a52-99d9-19d2c170429d/providers/Microsoft.Web/locations/eastus" \
  --limit 10
```

---

## Option 2: Use Azure Static Web Apps (No Quota Needed)

Azure Static Web Apps are **FREE** for Next.js and don't require App Service quota!

### Deploy to Azure Static Web Apps

```bash
# Install Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Create Static Web App
az staticwebapp create \
  --name litlabs-static \
  --resource-group litlabs-prod \
  --source https://github.com/LitLabs420/Labs-Ai \
  --location eastus2 \
  --branch main \
  --app-location "/" \
  --output-location "out" \
  --sku Free

# Get deployment token
az staticwebapp secrets list \
  --name litlabs-static \
  --resource-group litlabs-prod
```

### Update Next.js for Static Export

Add to `next.config.ts`:

```typescript
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Keep existing config
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
```

**Limitations**:
- No server-side API routes (must use Firebase Functions or external APIs)
- No ISR (Incremental Static Regeneration)
- Static HTML export only

---

## Option 3: Use Azure Container Apps (Serverless)

Container Apps are serverless and may not have the same quota restrictions.

```bash
# Create Container Apps environment
az containerapp env create \
  --name litlabs-env \
  --resource-group litlabs-prod \
  --location eastus

# Deploy container app
az containerapp create \
  --name litlabs-app \
  --resource-group litlabs-prod \
  --environment litlabs-env \
  --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest \
  --target-port 3000 \
  --ingress external \
  --query properties.configuration.ingress.fqdn
```

**Advantages**:
- Serverless (pay only for usage)
- Auto-scaling
- No VM quota needed

---

## Option 4: Deploy to Vercel (Fastest Option)

Since LitLabs is already a Next.js app, Vercel (the creators of Next.js) is the fastest deployment option.

### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Environment Variables for Vercel

Add these in Vercel Dashboard > Settings > Environment Variables:

```
FIREBASE_PROJECT_ID=studio-6082148059-d1fec
FIREBASE_API_KEY=your-key
FIREBASE_AUTH_DOMAIN=your-domain
STRIPE_SECRET_KEY=your-stripe-key
GOOGLE_GENERATIVE_AI_API_KEY=your-ai-key
```

**Vercel Benefits**:
- **Zero configuration** for Next.js
- **Global CDN** built-in
- **Automatic HTTPS**
- **Preview deployments** for every commit
- **Free tier** available (enough for testing)

---

## Option 5: Use Azure Functions + Static Web Apps

Hybrid approach: Static frontend + serverless backend

```bash
# Create Azure Function App
az functionapp create \
  --name litlabs-functions \
  --resource-group litlabs-prod \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --storage-account litlabsstorage

# Deploy API routes as Azure Functions
```

---

## Recommended Path Forward

### For Immediate Deployment (Today)

1. **Deploy to Vercel** (5 minutes)
   - Run `vercel --prod`
   - Add environment variables in Vercel dashboard
   - Get live URL immediately

2. **Setup Azure Static Web Apps** (parallel track)
   - No quota restrictions
   - Free tier available
   - Good for static content and CDN

### For Long-Term Azure Solution

1. **Request quota increase** (submit now, wait 5-30 min)
2. **While waiting**, deploy to Vercel for testing
3. **Once quota approved**, deploy to Azure App Service for full control

---

## Current Environment Variables Needed

Based on your project, these are the critical environment variables:

```bash
# Firebase (from your setup)
FIREBASE_PROJECT_ID=studio-6082148059-d1fec
NEXT_PUBLIC_FIREBASE_API_KEY=<get from Firebase Console>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-project>.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<from Firebase>
NEXT_PUBLIC_FIREBASE_APP_ID=<from Firebase>

# Stripe
STRIPE_SECRET_KEY=<from Stripe Dashboard>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<from Stripe Dashboard>
STRIPE_WEBHOOK_SECRET=<from Stripe Webhooks>

# AI
GOOGLE_GENERATIVE_AI_API_KEY=<from Google Cloud>
OPENAI_API_KEY=<optional, from OpenAI>

# App URLs
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Testing Azure MCP Functionality

Now that Azure MCP is configured, you can test it in Copilot Chat:

```
@copilot List my Azure resources in the litlabs-prod resource group
```

```
@copilot What are the available regions for Azure App Service?
```

```
@copilot Show me how to deploy a Next.js app to Azure Static Web Apps
```

---

## Next Steps

**Choose your deployment path**:

1. ✅ **Fastest** (5 min): Deploy to Vercel → `vercel --prod`
2. ✅ **Free Azure** (15 min): Deploy to Static Web Apps (instructions above)
3. ⏳ **Full Azure** (30+ min): Wait for quota increase, then deploy to App Service
4. ✅ **Serverless** (20 min): Deploy to Azure Container Apps (instructions above)

**What would you like to do next?**
- Deploy to Vercel for immediate testing?
- Setup Azure Static Web Apps?
- Request quota increase and wait?
- Explore Container Apps?

---

## Resources

- **Azure Portal**: https://portal.azure.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Firebase Console**: https://console.firebase.google.com/project/studio-6082148059-d1fec
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Request Quota**: https://portal.azure.com/#view/Microsoft_Azure_Support/NewSupportRequestV3Blade
