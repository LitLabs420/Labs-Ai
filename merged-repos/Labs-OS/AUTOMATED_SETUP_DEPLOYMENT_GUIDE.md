# ⚡ LABS OS - AUTOMATED SETUP & DEPLOYMENT GUIDE

**Last Updated:** December 12, 2025  
**Purpose:** One-click setup and deployment for development, staging, and production

---

## 📋 TABLE OF CONTENTS

1. [Windows PowerShell Setup (Fastest)](#windows-setup)
2. [Linux/Mac Setup (Bash)](#linux-setup)
3. [Docker Setup (Containerized)](#docker-setup)
4. [CI/CD Pipeline (GitHub Actions)](#cicd)
5. [Deployment to Vercel](#vercel-deploy)
6. [Deployment to Firebase](#firebase-deploy)

---

## 🪟 WINDOWS SETUP {#windows-setup}

### Option 1: Full Automated Setup (5 minutes)

**Step 1: Save this script as `full-setup.ps1`**

```powershell
# LABS OS - Complete Setup Script
# Run: ./full-setup.ps1 in PowerShell (Admin)

param(
    [string]$env = "development",  # development, staging, production
    [string]$nodeVersion = "21"    # Node.js version
)

Write-Host "
╔════════════════════════════════════════╗
║     LABS OS - COMPLETE SETUP SCRIPT     ║
╚════════════════════════════════════════╝
" -ForegroundColor Cyan

# Step 1: Check Admin Rights
Write-Host "`n[1/8] Checking permissions..." -ForegroundColor Yellow
$isAdmin = [Security.Principal.WindowsIdentity]::GetCurrent().Groups -contains 'S-1-5-32-544'
if (-not $isAdmin) {
    Write-Host "❌ Please run as Administrator!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Running as Administrator" -ForegroundColor Green

# Step 2: Check/Install Node.js
Write-Host "`n[2/8] Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($null -eq $nodeVersion) {
    Write-Host "⚠️  Node.js not found. Installing..." -ForegroundColor Yellow
    choco install nodejs -y
} else {
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
}

# Step 3: Check npm
Write-Host "`n[3/8] Checking npm..." -ForegroundColor Yellow
$npmVersion = npm --version
Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green

# Step 4: Install global tools
Write-Host "`n[4/8] Installing global development tools..." -ForegroundColor Yellow
$globalTools = @(
    'firebase-tools',
    'stripe',
    'vercel',
    'pnpm',
    'prettier'
)

foreach ($tool in $globalTools) {
    Write-Host "  Installing $tool..."
    npm install -g $tool --quiet
}
Write-Host "✅ Global tools installed" -ForegroundColor Green

# Step 5: Install project dependencies
Write-Host "`n[5/8] Installing project dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  Clearing existing node_modules..."
    Remove-Item -Recurse -Force node_modules
}
npm install
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Step 6: Setup environment variables
Write-Host "`n[6/8] Setting up environment..." -ForegroundColor Yellow
if (-Not (Test-Path ".env.local")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "✅ Created .env.local from .env.example" -ForegroundColor Green
        Write-Host "⚠️  IMPORTANT: Edit .env.local with your API keys!" -ForegroundColor Yellow
        Start-Process code ".env.local"
    } else {
        Write-Host "❌ .env.example not found" -ForegroundColor Red
    }
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

# Step 7: Firebase setup
Write-Host "`n[7/8] Initializing Firebase..." -ForegroundColor Yellow
firebase login
firebase init
Write-Host "✅ Firebase initialized" -ForegroundColor Green

# Step 8: Verify installation
Write-Host "`n[8/8] Verifying installation..." -ForegroundColor Yellow

# TypeScript check
npm run typecheck
$typescriptOk = $LASTEXITCODE -eq 0

# Lint check
npm run lint --max-warnings 10
$lintOk = $LASTEXITCODE -eq 0

# Build test
npm run build
$buildOk = $LASTEXITCODE -eq 0

if ($typescriptOk -and $buildOk) {
    Write-Host "
✅ SETUP COMPLETE!
═════════════════════════════════════════
Environment: $env
Node.js: $nodeVersion
npm: $npmVersion

Ready to start development:
  npm run dev

Or build for production:
  npm run build
  npm start
═════════════════════════════════════════
" -ForegroundColor Green
} else {
    Write-Host "
⚠️  Setup completed but with warnings:
  - TypeScript: $(if ($typescriptOk) { '✅' } else { '❌' })"
    if ($buildOk) { "  - Build: ✅" } else { "  - Build: ❌" }
    "
Review errors above before starting development.
" -ForegroundColor Yellow
}

Write-Host "Launching VS Code..." -ForegroundColor Cyan
code .
```

**Step 2: Run the script**
```powershell
cd "d:\Labs OS"
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\full-setup.ps1 -env development
```

### Option 2: Manual Quick Setup

```powershell
# Just the essentials
cd "d:\Labs OS"
npm install
Copy-Item .env.example .env.local
npm run dev
```

---

## 🐧 LINUX/MAC SETUP {#linux-setup}

### One-liner Installation

```bash
# Save as setup.sh and run: chmod +x setup.sh && ./setup.sh

#!/bin/bash

echo "🚀 LABS OS - Setup for Linux/Mac"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_21.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check npm
npm_version=$(npm --version)
echo "✅ npm version: $npm_version"

# Install global tools
echo "Installing global tools..."
npm install -g firebase-tools stripe vercel pnpm prettier

# Install dependencies
echo "Installing dependencies..."
npm install

# Setup .env
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "⚠️  Created .env.local - please edit with your API keys"
fi

# Firebase setup
echo "Setting up Firebase..."
firebase login
firebase init

# Verify
echo "Verifying setup..."
npm run typecheck && npm run build

echo "✅ Setup complete!"
echo "Run: npm run dev"
```

---

## 🐳 DOCKER SETUP {#docker-setup}

### Build & Run with Docker

```bash
# Build image
docker build -t labs-os:latest -f Dockerfile .

# Run container
docker run -p 3000:3000 \
  -e NODE_ENV=development \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  labs-os:latest

# Or use docker-compose
docker-compose up -d

# View logs
docker-compose logs -f web
```

### Docker Compose (Recommended)

```yaml
# docker-compose.override.yml (for development)
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 🔄 CI/CD PIPELINE {#cicd}

### GitHub Actions Workflow

**Save as `.github/workflows/deploy.yml`:**

```yaml
name: Build, Test & Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '21'
  CACHE_VERSION: 1

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Type check
        run: npm run typecheck

      - name: Build project
        run: npm run build

      - name: Run tests (if available)
        run: npm test --passWithNoTests

  deploy-staging:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Vercel (Staging)
        run: npx vercel deploy --token ${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_STAGING }}

  deploy-production:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Vercel (Production)
        run: npx vercel deploy --prod --token ${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_PROD }}
```

---

## 🚀 VERCEL DEPLOYMENT {#vercel-deploy}

### Automated Vercel Deploy

```bash
# Login to Vercel
vercel login

# Link project
vercel link

# Deploy to staging
vercel deploy --prebuilt

# Deploy to production
vercel deploy --prod

# Set environment variables
vercel env add STRIPE_SECRET_KEY
vercel env add FIREBASE_PRIVATE_KEY
# (interactive prompts)

# View deployment
vercel ls
vercel inspect [deployment-url]
```

---

## 🔥 FIREBASE DEPLOYMENT {#firebase-deploy}

### Deploy to Firebase

```bash
# Initialize Firebase
firebase init

# Deploy functions
firebase deploy --only functions

# Deploy hosting
firebase deploy --only hosting

# Deploy everything
firebase deploy

# Set environment variables
firebase functions:config:set stripe.key="your_key"

# View logs
firebase functions:log

# Rollback deployment
firebase deploy --only functions --force
```

---

## ✅ POST-DEPLOYMENT CHECKLIST

### After Every Deploy

- [ ] Health check endpoint returns 200
- [ ] Database migrations completed
- [ ] Environment variables all set
- [ ] Stripe webhooks registered
- [ ] Firebase security rules deployed
- [ ] CORS headers configured
- [ ] SSL certificates valid
- [ ] CDN cache cleared
- [ ] Monitoring alerts active

### Performance Validation

```bash
# Check build size
npm run build -- --analyze

# Test performance
curl -w "@curl-format.txt" https://your-app.vercel.app

# Lighthouse audit
npx lighthouse https://your-app.vercel.app --output-path=./report.html
```

---

## 🆘 TROUBLESHOOTING

### Setup Fails on Windows

```powershell
# Clear npm cache
npm cache clean --force

# Clear local modules
Remove-Item -Recurse -Force node_modules

# Reset npm
npm config reset

# Reinstall
npm install
```

### Deployment Fails

```bash
# Clear build cache
rm -rf .next
rm -rf out

# Rebuild
npm run build

# Check for errors
npm run typecheck
npm run lint
```

### Environment Variables Not Loading

```bash
# Verify .env.local exists and is readable
cat .env.local

# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

---

## 📊 MONITORING POST-DEPLOYMENT

```bash
# Monitor Vercel deployments
vercel logs [project-name]

# Monitor Firebase functions
firebase functions:log --limit 50

# Check error tracking (Sentry)
# https://sentry.io/organizations/[org]/issues/

# Check analytics
# https://analytics.google.com/
```

---

**Next:** Pick your preferred setup method above and run it!
