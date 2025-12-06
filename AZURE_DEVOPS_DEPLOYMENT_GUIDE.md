# Azure DevOps Deployment Guide

This guide provides comprehensive instructions for deploying applications to Azure App Service using Azure DevOps pipelines.

## Table of Contents

1. [Pipeline Files Overview](#pipeline-files-overview)
2. [Azure Resource Manager Service Connection Setup](#azure-resource-manager-service-connection-setup)
3. [Classic Release Pipeline Setup](#classic-release-pipeline-setup)
4. [Configuration Placeholders](#configuration-placeholders)
5. [Deployment Variants](#deployment-variants)
6. [Troubleshooting](#troubleshooting)

---

## Pipeline Files Overview

This repository includes four Azure DevOps pipeline templates:

### 1. azure-pipelines-windows.yml
Multi-stage pipeline for deploying to Windows App Service using framework-dependent deployment.
- **Target**: Windows App Service
- **Build Agent**: windows-latest
- **Deployment Type**: Framework-dependent .NET application

### 2. azure-pipelines-linux.yml
Multi-stage pipeline for deploying to Linux App Service using framework-dependent deployment.
- **Target**: Linux App Service
- **Build Agent**: ubuntu-latest
- **Deployment Type**: Framework-dependent .NET application

### 3. azure-pipelines-container.yml
Container-based deployment pipeline using Azure Container Registry (ACR).
- **Target**: Linux App Service (Container)
- **Build Agent**: ubuntu-latest
- **Deployment Type**: Docker container via ACR

### 4. azure-pipelines-publishprofile.yml
Alternative deployment using publish profile (no Azure RM service connection required).
- **Target**: Windows/Linux App Service
- **Build Agent**: windows-latest
- **Authentication**: Publish Profile XML

---

## Azure Resource Manager Service Connection Setup

### Step-by-Step Instructions

1. **Navigate to Service Connections**
   - Go to your Azure DevOps project
   - Click on **Project settings** (bottom-left)
   - Under **Pipelines**, select **Service connections**

2. **Create New Service Connection**
   - Click **New service connection**
   - Select **Azure Resource Manager**
   - Click **Next**

3. **Choose Authentication Method**
   - Select **Service principal (automatic)** (recommended)
   - Click **Next**

4. **Configure Scope**
   - **Scope level**: Choose "Subscription" or "Resource Group"
   - **Subscription**: Select your Azure subscription
   - **Resource Group**: (Optional) Select specific resource group to scope permissions
   - **Service connection name**: Enter a descriptive name (e.g., `azure-prod-connection`)

5. **Set Permissions**
   - The service principal will be created automatically with **Contributor** role
   - This role allows deployment to App Services and pushing to ACR

6. **Security Settings** (Optional but Recommended)
   - Check **Grant access permission to all pipelines** if you want all pipelines to use this connection
   - Or configure per-pipeline permissions for better security

7. **Verify Connection**
   - Click **Save**
   - Test the connection by clicking **Verify**

8. **Additional Configuration for ACR** (if using container pipelines)
   - Ensure the service principal has `AcrPush` role on the Azure Container Registry
   - Or create a separate service connection specifically for ACR

### Manual Service Principal Creation (Advanced)

If you need to create a service principal manually via Azure CLI:

```bash
# Create service principal
az ad sp create-for-rbac --name "azure-devops-sp" \
  --role Contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group}

# Output will include:
# - appId (Client ID)
# - password (Client Secret)
# - tenant (Tenant ID)

# For ACR access, add AcrPush role
az role assignment create \
  --assignee {appId} \
  --role AcrPush \
  --scope /subscriptions/{subscription-id}/resourceGroups/{resource-group}/providers/Microsoft.ContainerRegistry/registries/{registry-name}
```

Then create a "Service principal (manual)" connection in Azure DevOps using these credentials.

---

## Classic Release Pipeline Setup

For teams preferring the GUI-based Classic Release Pipelines:

### Prerequisites
- A build pipeline that publishes an artifact (zip file)
- Azure Resource Manager service connection configured

### Steps

1. **Create New Release Pipeline**
   - Navigate to **Pipelines** > **Releases**
   - Click **New pipeline**
   - Select **Empty job** template

2. **Add Artifact**
   - In the **Artifacts** section, click **Add an artifact**
   - **Source type**: Build
   - **Project**: Select your project
   - **Source (build pipeline)**: Select the build pipeline
   - **Default version**: Latest
   - **Source alias**: `_BuildArtifact` (or custom name)
   - Click **Add**

3. **Configure Stage**
   - Click on **Stage 1** to rename it (e.g., "Deploy to Production")
   - Click on **1 job, 0 task** link

4. **Add Azure App Service Deploy Task**
   - Click **+** on the Agent job
   - Search for "Azure App Service deploy"
   - Click **Add**

5. **Configure Deploy Task**
   - **Display name**: Deploy to App Service
   - **Azure subscription**: Select your service connection
   - **App Service type**: 
     - `Web App on Windows` for Windows
     - `Web App on Linux` for Linux
   - **App Service name**: Enter your App Service name
   - **Package or folder**: Click **...** and select the artifact zip file
     - Typically: `$(System.DefaultWorkingDirectory)/_BuildArtifact/drop/*.zip`

6. **Configure Continuous Deployment** (Optional)
   - Click on the **lightning bolt** icon on the artifact
   - Enable **Continuous deployment trigger**
   - This will automatically create a release when a build completes

7. **Add Pre-deployment Approvals** (Optional)
   - Click on the **user icon** before the stage
   - Enable **Pre-deployment approvals**
   - Add approvers who must approve before deployment

8. **Save and Create Release**
   - Click **Save** (top-right)
   - Click **Create release**
   - Select the build version and click **Create**

9. **Monitor Deployment**
   - Click on the release to see the deployment progress
   - View logs by clicking on the stage and tasks

---

## Configuration Placeholders

Before using these pipelines, replace the following placeholders with your actual values:

### For All Pipelines

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `<azureServiceConnection>` | Name of Azure Resource Manager service connection | `azure-prod-connection` |
| `<appServiceNameWindows>` | Windows App Service name | `myapp-windows` |
| `<appServiceNameLinux>` | Linux App Service name | `myapp-linux` |
| `<appServiceNameContainer>` | Container App Service name | `myapp-container` |

### For Container Pipeline (azure-pipelines-container.yml)

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `<acrServiceConnection>` | ACR service connection name | `acr-connection` |
| `<acrLoginServer>` | ACR login server URL | `myregistry.azurecr.io` |
| `imageName` | Docker image repository name | `myapp` |

### For Publish Profile Pipeline (azure-pipelines-publishprofile.yml)

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `$(publishProfile)` | Secure pipeline variable containing publish profile XML | N/A |
| `<appServiceName>` | App Service name | `myapp` |

### Version Configuration

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `dotnetVersion` | .NET SDK version | `7.0.x` | `6.0.x`, `7.0.x`, `8.0.x` |
| `buildConfiguration` | Build configuration | `Release` | `Debug`, `Release` |

---

## Deployment Variants

### Self-Contained Deployment

For applications that include the .NET runtime (no server-side runtime required):

```yaml
- script: |
    dotnet publish -c $(buildConfiguration) \
      -r linux-x64 \
      --self-contained true \
      -o $(Build.ArtifactStagingDirectory)/publish
  displayName: 'dotnet publish (self-contained)'
```

**Runtime Identifiers**: `linux-x64`, `win-x64`, `win-x86`, `osx-x64`

### Deployment Slots

To deploy to a staging slot before production:

```yaml
- task: AzureWebApp@1
  inputs:
    azureSubscription: '<azureServiceConnection>'
    appType: 'webAppLinux'
    appName: '<appServiceName>'
    slotName: 'staging'
    package: '$(Pipeline.Workspace)/drop/$(Build.BuildId).zip'
```

Then swap slots:

```yaml
- task: AzureAppServiceManage@0
  inputs:
    azureSubscription: '<azureServiceConnection>'
    Action: 'Swap Slots'
    WebAppName: '<appServiceName>'
    ResourceGroupName: '<resourceGroupName>'
    SourceSlot: 'staging'
    SwapWithProduction: true
```

Or use Azure CLI:

```yaml
- task: AzureCLI@2
  inputs:
    azureSubscription: '<azureServiceConnection>'
    scriptType: 'bash'
    scriptLocation: 'inlineScript'
    inlineScript: |
      az webapp deployment slot swap \
        --name <appServiceName> \
        --resource-group <resourceGroupName> \
        --slot staging
```

### App Settings & Connection Strings

#### Option 1: Configure in Azure Portal
- Navigate to App Service > Configuration
- Add application settings and connection strings
- Use Key Vault references for secrets: `@Microsoft.KeyVault(SecretUri=...)`

#### Option 2: Azure Key Vault Task
```yaml
- task: AzureKeyVault@2
  inputs:
    azureSubscription: '<azureServiceConnection>'
    KeyVaultName: '<keyVaultName>'
    SecretsFilter: '*'
    RunAsPreJob: true
```

#### Option 3: Azure CLI
```yaml
- task: AzureCLI@2
  inputs:
    azureSubscription: '<azureServiceConnection>'
    scriptType: 'bash'
    scriptLocation: 'inlineScript'
    inlineScript: |
      az webapp config appsettings set \
        --name <appServiceName> \
        --resource-group <resourceGroupName> \
        --settings KEY1=VALUE1 KEY2=VALUE2
```

### Container Deployment with System-Assigned Identity

For ACR access without service principal credentials:

1. Enable System-Assigned Managed Identity on App Service:
```bash
az webapp identity assign \
  --name <appServiceName> \
  --resource-group <resourceGroupName>
```

2. Grant AcrPull role to the identity:
```bash
az role assignment create \
  --assignee <principalId> \
  --role AcrPull \
  --scope /subscriptions/{subscription-id}/resourceGroups/{resource-group}/providers/Microsoft.ContainerRegistry/registries/{registry-name}
```

3. Configure App Service to use managed identity for ACR:
```bash
az webapp config set \
  --name <appServiceName> \
  --resource-group <resourceGroupName> \
  --generic-configurations '{"acrUseManagedIdentityCreds": true}'
```

### Runtime Stack Configuration

For Linux App Services, ensure the runtime stack matches your application:

```bash
# List available runtime stacks
az webapp list-runtimes --linux

# Set runtime stack
az webapp config set \
  --name <appServiceName> \
  --resource-group <resourceGroupName> \
  --linux-fx-version "DOTNETCORE|7.0"
```

### Zip Deploy Settings

For optimized zip deployments:

```bash
az webapp config appsettings set \
  --name <appServiceName> \
  --resource-group <resourceGroupName> \
  --settings WEBSITE_RUN_FROM_PACKAGE=1
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. App Fails to Start

**Symptoms**: 
- HTTP 502/503 errors
- "Application Error" page

**Diagnosis**:
- Check App Service Log Stream (Azure Portal > App Service > Log stream)
- Access Kudu console: `https://<appServiceName>.scm.azurewebsites.net`
- Check stdout/stderr logs in `D:\home\LogFiles` (Windows) or `/home/LogFiles` (Linux)
- Review event logs (Windows only)

**Solutions**:
- Verify .NET runtime version matches app requirements
- Check for missing dependencies
- Enable detailed error messages (development only)
- Enable "Always On" for web apps (especially with background tasks)

#### 2. Pipeline Deployment Fails with 401/403

**Symptoms**:
- "Unauthorized" or "Forbidden" errors during deployment
- "Failed to fetch resource" errors

**Solutions**:
- Verify service connection permissions
- Ensure service principal has **Contributor** role on resource group or App Service
- Check if service connection is approved for the pipeline
- For ACR: verify service principal has **AcrPush** role
- Re-authorize the service connection (Project Settings > Service Connections)

#### 3. Container Image Not Found

**Symptoms**:
- App Service shows "Container couldn't start"
- "Failed to pull image" errors

**Solutions**:
- Verify image name and tag are correct
- Check ACR is accessible from App Service (firewall/VNET settings)
- Ensure App Service has ACR credentials or managed identity configured
- Verify image was successfully pushed to ACR (check ACR repositories)
- For private ACR, ensure authentication is configured

#### 4. Build Task Failures

**Symptoms**:
- "dotnet restore" or "dotnet build" fails
- Tool not found errors

**Solutions**:
- Check UseDotNet@2 task specifies correct SDK version
- Verify .csproj or .sln file paths are correct
- Check for missing NuGet feed credentials
- Review build logs for detailed error messages
- Ensure build agent has internet access for package restore

#### 5. Slow or Hanging Deployments

**Symptoms**:
- Deployment takes very long time
- Pipeline times out

**Solutions**:
- Increase pipeline timeout (Job > Timeout minutes)
- Check App Service plan (scale up if needed)
- Verify network connectivity between build agent and Azure
- For large containers, optimize Dockerfile (use multi-stage builds, minimize layers)
- Enable "Run from package" for faster zip deployments

#### 6. Environment Variables Not Set

**Symptoms**:
- App can't find configuration values
- Connection strings not available

**Solutions**:
- Verify App Settings in Azure Portal > Configuration
- For Key Vault, check App Service has access via managed identity
- Restart App Service after configuration changes
- Check for typos in setting names (case-sensitive on Linux)

#### 7. SSL/Certificate Issues

**Symptoms**:
- "Your connection is not private" warnings
- Certificate validation errors

**Solutions**:
- Verify custom domain is properly configured
- Check SSL certificate is valid and not expired
- Ensure certificate is bound to App Service
- For custom certificates, verify it's uploaded to App Service

### Diagnostic Commands

#### Check Pipeline Variables
```yaml
- script: |
    echo "Build.BuildId: $(Build.BuildId)"
    echo "Build.SourceBranch: $(Build.SourceBranch)"
    echo "Build.ArtifactStagingDirectory: $(Build.ArtifactStagingDirectory)"
    echo "Pipeline.Workspace: $(Pipeline.Workspace)"
  displayName: 'Debug Variables'
```

#### List Files in Artifact
```yaml
- script: |
    ls -la $(Pipeline.Workspace)/drop/
  displayName: 'List Artifact Contents'
```

#### Test Azure CLI Connection
```yaml
- task: AzureCLI@2
  inputs:
    azureSubscription: '<azureServiceConnection>'
    scriptType: 'bash'
    scriptLocation: 'inlineScript'
    inlineScript: |
      az account show
      az webapp list --query "[].{name:name, state:state, location:location}"
```

### Useful Azure CLI Commands

```bash
# Check App Service status
az webapp show \
  --name <appServiceName> \
  --resource-group <resourceGroupName> \
  --query "{name:name, state:state, hostNames:hostNames}"

# View App Service logs (live stream)
az webapp log tail \
  --name <appServiceName> \
  --resource-group <resourceGroupName>

# Restart App Service
az webapp restart \
  --name <appServiceName> \
  --resource-group <resourceGroupName>

# List App Service configuration
az webapp config appsettings list \
  --name <appServiceName> \
  --resource-group <resourceGroupName>

# Check container logs
az webapp log config \
  --name <appServiceName> \
  --resource-group <resourceGroupName> \
  --docker-container-logging filesystem

# View deployment history
az webapp deployment list-publishing-profiles \
  --name <appServiceName> \
  --resource-group <resourceGroupName>
```

### Pipeline Debugging Tips

1. **Enable Verbose Logging**
   - Add system diagnostics variable: `System.Debug = true`
   - This provides detailed task execution logs

2. **Break Down Complex Tasks**
   - Split long scripts into multiple steps
   - Add echo/print statements for progress tracking

3. **Test Locally First**
   - Run build commands locally before committing pipeline
   - Verify artifact structure matches pipeline expectations

4. **Use Conditions and Retries**
   ```yaml
   - task: AzureWebApp@1
     retryCountOnTaskFailure: 3
     condition: succeeded()
     inputs:
       # ... task config
   ```

5. **Check Pipeline YAML Syntax**
   - Use Azure DevOps YAML validator
   - Test in a separate branch first

---

## Additional Resources

### Official Documentation
- [Azure DevOps Pipelines Documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/)
- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Container Registry Documentation](https://docs.microsoft.com/en-us/azure/container-registry/)

### Pipeline Tasks Reference
- [AzureWebApp@1 Task](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/deploy/azure-rm-web-app)
- [Docker@2 Task](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/build/docker)
- [AzureCLI@2 Task](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/deploy/azure-cli)

### Best Practices
- Use separate service connections for production and non-production
- Implement deployment gates and approvals for production
- Use deployment slots for zero-downtime deployments
- Store secrets in Azure Key Vault, not in pipeline variables
- Use managed identities instead of service principals when possible
- Monitor deployments with Application Insights
- Implement rollback strategies

### Next Steps
1. Choose the appropriate pipeline template for your needs
2. Configure Azure service connections
3. Replace all placeholders with actual values
4. Test deployment to non-production environment first
5. Configure monitoring and alerting
6. Document your specific deployment procedures

---

## Support

For issues specific to:
- **Azure DevOps**: [Azure DevOps Support](https://azure.microsoft.com/en-us/support/devops/)
- **Azure App Service**: [Azure Support](https://azure.microsoft.com/en-us/support/options/)
- **This Repository**: Open an issue in the GitHub repository

---

**Note**: These pipeline templates are designed for .NET applications. If your repository contains a different application type (e.g., Node.js, Python, Java), you'll need to adapt the build steps accordingly.
