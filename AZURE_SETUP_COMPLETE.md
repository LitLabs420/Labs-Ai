# 🚀 LitLabs AI - Complete Azure Setup Guide

## Overview

This guide will help you set up Azure CLI authentication, configure Azure MCP for GitHub Copilot, and deploy Azure services for the LitLabs AI platform.

---

## Part 1: Azure CLI Authentication

### Step 1: Authenticate with Azure

Run this command in your terminal:

```bash
az login
```

This will:
- Open your default browser
- Prompt you to sign in with your Microsoft account
- Display your available subscriptions after successful login

### Step 2: Verify Authentication

```bash
az account show
```

Expected output:
```json
{
  "id": "your-subscription-id",
  "name": "Your Subscription Name",
  "tenantId": "your-tenant-id",
  "user": {
    "name": "your-email@domain.com",
    "type": "user"
  }
}
```

### Step 3: List All Subscriptions

```bash
az account list --output table
```

### Step 4: Set Default Subscription (if needed)

```bash
az account set --subscription "YOUR_SUBSCRIPTION_NAME_OR_ID"
```

---

## Part 2: Azure MCP Configuration for GitHub Copilot

### What is Azure MCP?

Azure MCP (Model Context Protocol) servers integrate Azure tools directly into GitHub Copilot Chat. **They are NOT npm packages** - they're configured through VS Code settings.

### Step 1: Enable MCP in GitHub Settings

1. Visit one of these URLs:
   - **Personal account**: https://github.com/settings/copilot/features
   - **Organization (LitLabs420)**: https://github.com/organizations/LitLabs420/settings/copilot/features

2. Enable: **"Enable MCP servers in Copilot"**

### Step 2: Configure VS Code Settings

Add to your `.vscode/settings.json` or User Settings:

```json
{
  "github.copilot.chat.mcp.enabled": true
}
```

### Step 3: Verify Azure MCP Tools are Available

Once enabled, you should have access to these tools in Copilot:

- `mcp_azure_mcp_azd` - Azure Developer CLI
- `mcp_azure_mcp_sql` - Azure SQL operations
- `mcp_azure_mcp_appservice` - App Service management
- `mcp_azure_mcp_functionapp` - Function App operations
- `mcp_azure_mcp_deploy` - Deployment commands
- `mcp_azure_mcp_documentation` - Azure docs search
- `mcp_azure_mcp_applens` - Diagnostics and troubleshooting
- `mcp_azure_mcp_virtualdesktop` - Virtual Desktop operations
- `mcp_azure_mcp_quota` - Quota and usage checking

### Step 4: Test Azure MCP

Ask Copilot:
```
@copilot What subscriptions do I have access to?
```

Or:
```
@copilot List my Azure resource groups
```

---

## Part 3: Azure Services Setup for LitLabs

### Required Azure Services

Based on the LitLabs architecture, you'll need:

1. **Azure App Service** - For hosting the Next.js application
2. **Azure Container Registry** - For Docker images (if containerizing)
3. **Azure Key Vault** - For secure secrets management
4. **Azure Monitor** - For logging and diagnostics
5. **Azure CDN** - For static assets and media

### Optional Services (Recommended)

- **Azure Cosmos DB** - For additional database needs (complement to Firebase)
- **Azure Functions** - For serverless background tasks
- **Azure Storage** - For media uploads and backups
- **Azure OpenAI** - For AI features (alternative to Google AI)
- **Azure Active Directory** - For enterprise authentication

---

## Part 4: Quick Start - Deploy LitLabs to Azure

### Option A: Deploy with Azure CLI

#### 1. Create Resource Group

```bash
az group create \
  --name litlabs-prod \
  --location eastus
```

#### 2. Create App Service Plan

```bash
az appservice plan create \
  --name litlabs-plan \
  --resource-group litlabs-prod \
  --sku P1V2 \
  --is-linux
```

#### 3. Create Web App

```bash
az webapp create \
  --name litlabs-app \
  --resource-group litlabs-prod \
  --plan litlabs-plan \
  --runtime "NODE:18-lts"
```

#### 4. Configure Environment Variables

```bash
az webapp config appsettings set \
  --name litlabs-app \
  --resource-group litlabs-prod \
  --settings \
    FIREBASE_PROJECT_ID="your-project-id" \
    FIREBASE_API_KEY="your-api-key" \
    STRIPE_SECRET_KEY="your-stripe-key" \
    GOOGLE_GENERATIVE_AI_API_KEY="your-ai-key"
```

#### 5. Deploy from GitHub

```bash
az webapp deployment source config \
  --name litlabs-app \
  --resource-group litlabs-prod \
  --repo-url https://github.com/LitLabs420/Labs-Ai \
  --branch main \
  --manual-integration
```

### Option B: Deploy with Azure Developer CLI (azd)

#### 1. Initialize Azure Developer CLI

```bash
azd init
```

#### 2. Provision Resources

```bash
azd provision
```

#### 3. Deploy Application

```bash
azd deploy
```

---

## Part 5: Azure Key Vault Setup (Recommended)

Store sensitive environment variables in Azure Key Vault instead of hardcoding them.

### 1. Create Key Vault

```bash
az keyvault create \
  --name litlabs-vault \
  --resource-group litlabs-prod \
  --location eastus
```

### 2. Add Secrets

```bash
# Firebase
az keyvault secret set --vault-name litlabs-vault --name "FirebaseProjectId" --value "your-project-id"
az keyvault secret set --vault-name litlabs-vault --name "FirebaseApiKey" --value "your-api-key"

# Stripe
az keyvault secret set --vault-name litlabs-vault --name "StripeSecretKey" --value "your-stripe-key"
az keyvault secret set --vault-name litlabs-vault --name "StripeWebhookSecret" --value "your-webhook-secret"

# Google AI
az keyvault secret set --vault-name litlabs-vault --name "GoogleAiApiKey" --value "your-ai-key"
```

### 3. Grant App Service Access

```bash
# Get the principal ID of your app service
PRINCIPAL_ID=$(az webapp identity assign \
  --name litlabs-app \
  --resource-group litlabs-prod \
  --query principalId --output tsv)

# Grant access to Key Vault
az keyvault set-policy \
  --name litlabs-vault \
  --object-id $PRINCIPAL_ID \
  --secret-permissions get list
```

### 4. Reference Secrets in App Settings

```bash
az webapp config appsettings set \
  --name litlabs-app \
  --resource-group litlabs-prod \
  --settings \
    FIREBASE_PROJECT_ID="@Microsoft.KeyVault(SecretUri=https://litlabs-vault.vault.azure.net/secrets/FirebaseProjectId/)" \
    STRIPE_SECRET_KEY="@Microsoft.KeyVault(SecretUri=https://litlabs-vault.vault.azure.net/secrets/StripeSecretKey/)"
```

---

## Part 6: Environment Variables Mapping

### Current Firebase/Vercel Setup → Azure App Service

| Current Env Var | Azure Key Vault Secret | Purpose |
|----------------|------------------------|---------|
| `FIREBASE_PROJECT_ID` | `FirebaseProjectId` | Firebase project |
| `FIREBASE_API_KEY` | `FirebaseApiKey` | Firebase client |
| `FIREBASE_AUTH_DOMAIN` | `FirebaseAuthDomain` | Firebase auth |
| `STRIPE_SECRET_KEY` | `StripeSecretKey` | Stripe API |
| `STRIPE_WEBHOOK_SECRET` | `StripeWebhookSecret` | Stripe webhooks |
| `GOOGLE_GENERATIVE_AI_API_KEY` | `GoogleAiApiKey` | Google AI |
| `OPENAI_API_KEY` | `OpenAiApiKey` | OpenAI (optional) |
| `NEXT_PUBLIC_APP_URL` | N/A (public) | App domain |

---

## Part 7: Azure OpenAI Integration (Alternative to Google AI)

If you want to use Azure OpenAI instead of Google AI:

### 1. Create Azure OpenAI Resource

```bash
az cognitiveservices account create \
  --name litlabs-openai \
  --resource-group litlabs-prod \
  --kind OpenAI \
  --sku S0 \
  --location eastus
```

### 2. Get API Keys

```bash
az cognitiveservices account keys list \
  --name litlabs-openai \
  --resource-group litlabs-prod
```

### 3. Deploy Models

```bash
# Deploy GPT-4
az cognitiveservices account deployment create \
  --name litlabs-openai \
  --resource-group litlabs-prod \
  --deployment-name gpt-4 \
  --model-name gpt-4 \
  --model-version "0613" \
  --model-format OpenAI \
  --scale-settings-scale-type "Standard"
```

### 4. Update Environment Variables

Add to your app settings:
```bash
AZURE_OPENAI_API_KEY="your-key"
AZURE_OPENAI_ENDPOINT="https://litlabs-openai.openai.azure.com/"
AZURE_OPENAI_DEPLOYMENT="gpt-4"
```

---

## Part 8: Monitoring & Logging

### Enable Application Insights

```bash
# Create Application Insights
az monitor app-insights component create \
  --app litlabs-insights \
  --location eastus \
  --resource-group litlabs-prod

# Get instrumentation key
INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app litlabs-insights \
  --resource-group litlabs-prod \
  --query instrumentationKey --output tsv)

# Configure app service
az webapp config appsettings set \
  --name litlabs-app \
  --resource-group litlabs-prod \
  --settings \
    APPINSIGHTS_INSTRUMENTATIONKEY="$INSTRUMENTATION_KEY" \
    ApplicationInsightsAgent_EXTENSION_VERSION="~3"
```

---

## Part 9: CI/CD with GitHub Actions + Azure

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'litlabs-app'
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: .
```

### Get Publish Profile

```bash
az webapp deployment list-publishing-profiles \
  --name litlabs-app \
  --resource-group litlabs-prod \
  --xml > publish-profile.xml
```

Add the contents to GitHub Secrets as `AZURE_WEBAPP_PUBLISH_PROFILE`.

---

## Part 10: Cost Optimization

### Recommended Azure Configuration for LitLabs

| Service | SKU | Monthly Cost (Estimate) |
|---------|-----|------------------------|
| App Service Plan | P1V2 | ~$75/month |
| Azure Key Vault | Standard | ~$1/month |
| Application Insights | Pay-as-you-go | ~$10-50/month |
| Azure CDN | Standard Microsoft | Pay-as-you-go |
| **Total** | | **~$100-150/month** |

### Cost-Saving Tips

1. Use **Azure Free Tier** for development/testing
2. Enable **auto-scaling** only for production
3. Use **Azure CDN** for static assets (reduces bandwidth costs)
4. Implement **caching** with Azure Redis Cache
5. Monitor costs with **Azure Cost Management**

---

## Troubleshooting

### Issue: "az login" not working

**Solution**:
```bash
# Try device code flow
az login --use-device-code

# Or specify tenant
az login --tenant your-tenant-id
```

### Issue: Azure MCP tools not showing up in Copilot

**Solution**:
1. Verify MCP is enabled in GitHub settings
2. Restart VS Code
3. Check `.vscode/settings.json` has `github.copilot.chat.mcp.enabled: true`
4. Ensure you're signed in to GitHub Copilot extension

### Issue: Deployment fails with "Node version mismatch"

**Solution**:
```bash
# Set specific Node version in Azure
az webapp config appsettings set \
  --name litlabs-app \
  --resource-group litlabs-prod \
  --settings WEBSITE_NODE_DEFAULT_VERSION="18-lts"
```

### Issue: Environment variables not loading

**Solution**:
```bash
# Verify app settings
az webapp config appsettings list \
  --name litlabs-app \
  --resource-group litlabs-prod \
  --output table

# Restart app service
az webapp restart \
  --name litlabs-app \
  --resource-group litlabs-prod
```

---

## Next Steps

1. **Authenticate with Azure CLI** (`az login`)
2. **Enable Azure MCP** in GitHub/VS Code settings
3. **Create resource group** for LitLabs
4. **Deploy app service** with Next.js runtime
5. **Configure Key Vault** for secrets
6. **Set up CI/CD** with GitHub Actions
7. **Enable monitoring** with Application Insights
8. **Configure custom domain** and SSL

---

## Quick Command Reference

```bash
# Authentication
az login
az account show
az account list

# Resource Management
az group create --name <name> --location <location>
az group list --output table
az group delete --name <name> --yes

# App Service
az webapp list --output table
az webapp show --name <name> --resource-group <group>
az webapp restart --name <name> --resource-group <group>
az webapp log tail --name <name> --resource-group <group>

# Key Vault
az keyvault secret list --vault-name <name>
az keyvault secret show --vault-name <name> --name <secret>
az keyvault secret set --vault-name <name> --name <secret> --value <value>

# Monitoring
az monitor app-insights component show --app <name> --resource-group <group>
az monitor metrics list --resource <resource-id>
```

---

## Support Resources

- **Azure Documentation**: https://learn.microsoft.com/azure/
- **Azure CLI Reference**: https://learn.microsoft.com/cli/azure/
- **Azure Pricing Calculator**: https://azure.microsoft.com/pricing/calculator/
- **Azure Status**: https://status.azure.com/
- **LitLabs GitHub**: https://github.com/LitLabs420/Labs-Ai

---

**Ready to deploy LitLabs on Azure? Let's get started!** 🚀
