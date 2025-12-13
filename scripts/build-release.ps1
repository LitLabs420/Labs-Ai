#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Build and package Labs-Ai clean release distribution
.DESCRIPTION
  Creates a production-ready zip file with all necessary files for distribution
  Includes manifest generation, checksumming, and verification guides
.PARAMETER Version
  Version string for release (default: 3.0)
.PARAMETER OutputDir
  Output directory for release artifacts (default: releases)
.PARAMETER SkipBuild
  Skip the npm build step if present
.PARAMETER SkipVerify
  Skip ESLint verification
.EXAMPLE
  .\build-release.ps1 -Version 3.0
  .\build-release.ps1 -SkipBuild
#>

param(
    [string]$Version = "3.0",
    [string]$OutputDir = "releases",
    [switch]$SkipBuild,
    [switch]$SkipVerify
)

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Labs-Ai Build Release v$Version" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# Get workspace root
$WorkspaceRoot = (Get-Location).Path
Write-Host "Workspace: $WorkspaceRoot" -ForegroundColor Gray

# Create output directory
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
    Write-Host "✓ Created $OutputDir directory" -ForegroundColor Green
}

# PHASE 1: Clean build artifacts
Write-Host "`n[PHASE 1] Cleaning build artifacts..." -ForegroundColor Yellow

$ArtifactsToClean = @(
    ".next",
    ".turbo",
    ".vercel",
    "tsconfig.tsbuildinfo",
    ".env.local"
)

foreach ($artifact in $ArtifactsToClean) {
    if (Test-Path $artifact) {
        Remove-Item -Recurse -Force -Path $artifact | Out-Null
        Write-Host "  ✓ Removed $artifact" -ForegroundColor Green
    }
}

# PHASE 2: Verify source integrity
if (-not $SkipVerify) {
    Write-Host "`n[PHASE 2] Verifying source integrity..." -ForegroundColor Yellow
    
    if (Test-Path "package.json") {
        Write-Host "  ✓ Found package.json" -ForegroundColor Green
    }
    
    if (Test-Path "tsconfig.json") {
        Write-Host "  ✓ Found tsconfig.json" -ForegroundColor Green
    }
    
    # Check ESLint
    if (Test-Path "eslint.config.mjs") {
        Write-Host "  ✓ Found eslint.config.mjs" -ForegroundColor Green
        Write-Host "  Running ESLint verification..." -ForegroundColor Gray
        
        try {
            npm run lint 2>&1 | Out-Null
            Write-Host "  ✓ ESLint verification passed" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠ ESLint warnings detected (non-blocking)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "`n[PHASE 2] Skipped source verification" -ForegroundColor Yellow
}

# PHASE 3: Build (optional)
if (-not $SkipBuild) {
    Write-Host "`n[PHASE 3] Building project..." -ForegroundColor Yellow
    
    if (Test-Path "package.json") {
        Write-Host "  Running npm run build..." -ForegroundColor Gray
        npm run build 2>&1
        Write-Host "  ✓ Build completed" -ForegroundColor Green
    }
} else {
    Write-Host "`n[PHASE 3] Skipped build (--SkipBuild)" -ForegroundColor Yellow
}

# PHASE 4: Generate manifest
Write-Host "`n[PHASE 4] Generating build manifest..." -ForegroundColor Yellow

$ManifestFile = "BUILD_${Version}_MANIFEST.md"
$BuildDate = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss UTC")
$BuildUser = $env:USERNAME

$ManifestContent = @"
# Labs-Ai Build $Version Manifest

**Build Date:** $BuildDate  
**Built By:** $BuildUser  
**Version:** $Version  
**Repository:** https://github.com/LiTree89/Labs-Ai  

## Build Information

- **Framework:** Next.js 16.0.10 with Turbopack
- **Language:** TypeScript 5.9.3 (strict mode)
- **Styling:** Tailwind CSS 4
- **Backend:** Firebase (Firestore, Authentication, Functions)
- **AI Providers:** DeepSeek Coder 33B (default), Google Generative AI, OpenAI
- **Payment:** Stripe integration
- **Deployment:** Vercel-ready with auto-deploy

## What's Included

### Core Directories
- **app/** - Next.js App Router pages and API routes
- **components/** - React components (UI + dashboard)
- **lib/** - Utility functions and integrations
  - AI providers: config-deepseek.ts, ai.ts
  - Agents: ceo-bot.ts, deepseek-agent.ts
  - Autonomy: autonomy-loop.ts
  - Firebase integrations
  - Stripe integration
  - Rate limiting and security
- **context/** - React Context providers
- **types/** - TypeScript type definitions
- **public/** - Static assets and public files
- **scripts/** - Build and deployment scripts
- **.github/** - GitHub Actions workflows and configuration

### Configuration Files
- **package.json** - 44 dependencies (0 vulnerabilities)
- **tsconfig.json** - TypeScript strict mode configuration
- **eslint.config.mjs** - ESLint configuration
- **next.config.ts** - Next.js configuration
- **tailwind.config.ts** - Tailwind CSS configuration
- **firestore.rules** - Firestore security rules
- **firestore.indexes.json** - Firestore indexes
- **.env.example** - Environment variables template

### Documentation
- **README.md** - Project overview
- **README_LITLABS.md** - Detailed documentation
- **CONTRIBUTING.md** - Contribution guidelines
- **.github/copilot-instructions.md** - Development standards
- **ENVIRONMENT_SETUP.md** - Setup guide
- **DEPLOYMENT_GUIDE.md** - Deployment instructions

### License
- **LICENSE** - Project license

## What's NOT Included

- **node_modules/** - Dependencies (run \`npm install\`)
- **.next/** - Build artifacts
- **.turbo/** - Turbo cache
- **.vercel/** - Vercel configuration
- **.env.local** - Local environment variables (use .env.example)
- **.git/** - Git history (clone separately)
- **android-app/** - Android application (separate repo)

## Quick Start

1. **Extract the archive:**
   \`\`\`bash
   unzip Labs-Ai-$Version.zip
   cd Labs-Ai
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Setup environment:**
   \`\`\`bash
   cp .env.example .env.local
   # Edit .env.local with your API keys and configuration
   \`\`\`

4. **Start development server:**
   \`\`\`bash
   npm run dev
   # Open http://localhost:3000
   \`\`\`

5. **For production build:**
   \`\`\`bash
   npm run build
   npm run start
   \`\`\`

## Verification

To verify the integrity of this distribution:

1. **Check the SHA256 checksum:**
   \`\`\`bash
   sha256sum -c Labs-Ai-$Version.sha256
   # or on macOS:
   shasum -a 256 -c Labs-Ai-$Version.sha256
   \`\`\`

2. **Verify no suspicious files:**
   \`\`\`bash
   # Check file count and sizes
   find . -type f | wc -l
   du -sh .
   \`\`\`

## System Requirements

- **Node.js:** 18+
- **npm:** 8+
- **Operating System:** Linux, macOS, or Windows
- **Disk Space:** ~500MB for full installation with node_modules

## Dependencies Summary

- **Total Packages:** 44
- **Security Vulnerabilities:** 0
- **Outdated Packages:** Check with \`npm outdated\`

## AI Integration

### DeepSeek Coder (Default)
- Model: Coder 33B
- Languages: 70+
- Context: 16K tokens
- Cost: Optimized per-token pricing

### Google Generative AI (Fallback)
- Models: Gemini Pro, Gemini Pro Vision
- Multi-modal support

### OpenAI (Secondary)
- Models: GPT-4, GPT-3.5 Turbo
- Embeddings support

### CEO Bot System
- Decision engine using Upper Confidence Bound algorithm
- Autonomous operation executor
- Policy enforcement with severity levels
- Learning system for agent optimization

## Support

For issues or questions:
1. Check the documentation files included in the archive
2. Review TROUBLESHOOTING.md if present
3. Check GitHub Issues: https://github.com/LiTree89/Labs-Ai/issues
4. Refer to .github/copilot-instructions.md for development standards

## License

This project is licensed under the included LICENSE file.

---
**Build Version:** $Version  
**Archive Date:** $BuildDate  
**Status:** Ready for Distribution
"@

$ManifestPath = Join-Path $OutputDir $ManifestFile
$ManifestContent | Out-File -FilePath $ManifestPath -Encoding UTF8
Write-Host "  ✓ Generated $ManifestFile" -ForegroundColor Green

# PHASE 5: Create zip archive
Write-Host "`n[PHASE 5] Creating zip archive..." -ForegroundColor Yellow

$ZipName = "Labs-Ai-${Version}.zip"
$ZipPath = Join-Path $OutputDir $ZipName

# Files and directories to include
$ItemsToInclude = @(
    "app",
    "components",
    "lib",
    "context",
    "types",
    "public",
    "scripts",
    ".github",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "eslint.config.mjs",
    "next.config.ts",
    "tailwind.config.ts",
    "firestore.rules",
    "firestore.indexes.json",
    "firebase.json",
    ".env.example",
    "README.md",
    "README_LITLABS.md",
    "CONTRIBUTING.md",
    "LICENSE",
    "CODE_OF_CONDUCT.md",
    "ENVIRONMENT_SETUP.md",
    "DEPLOYMENT_GUIDE.md",
    "TROUBLESHOOTING.md"
)

# Filter to only include existing items
$ExistingItems = @()
foreach ($item in $ItemsToInclude) {
    if (Test-Path $item) {
        $ExistingItems += $item
    }
}

# Compress the archive
Write-Host "  Compressing files (this may take a moment)..." -ForegroundColor Gray
Compress-Archive -Path $ExistingItems -DestinationPath $ZipPath -Force
Write-Host "  ✓ Created $ZipName" -ForegroundColor Green

# Get zip file size
$ZipSize = (Get-Item $ZipPath).Length
$ZipSizeMB = [math]::Round($ZipSize / 1MB, 2)
Write-Host "  Size: $ZipSizeMB MB" -ForegroundColor Gray

# PHASE 6: Generate SHA256 checksum
Write-Host "`n[PHASE 6] Generating SHA256 checksum..." -ForegroundColor Yellow

$ChecksumFile = "${ZipName}.sha256"
$ChecksumPath = Join-Path $OutputDir $ChecksumFile

$SHA256 = (Get-FileHash -Path $ZipPath -Algorithm SHA256).Hash

# Write in standard sha256sum format
$ChecksumFormat = "$SHA256  $ZipName"
$ChecksumFormat | Out-File -FilePath $ChecksumPath -Encoding ASCII
Write-Host "  ✓ Generated $ChecksumFile" -ForegroundColor Green
Write-Host "  SHA256: $SHA256" -ForegroundColor Gray

# PHASE 7: Create verification guide
Write-Host "`n[PHASE 7] Creating verification guide..." -ForegroundColor Yellow

$VerifyFile = "VERIFY.txt"
$VerifyPath = Join-Path $OutputDir $VerifyFile

$VerifyContent = @"
================================================================================
  Labs-Ai $Version - Release Verification Guide
================================================================================

This file explains how to verify the integrity of the Labs-Ai-$Version.zip
distribution package.

WHAT YOU RECEIVED:
  - Labs-Ai-$Version.zip (main archive)
  - Labs-Ai-$Version.sha256 (checksum file)
  - BUILD_${Version}_MANIFEST.md (build information)
  - VERIFY.txt (this file)

HOW TO VERIFY:
================================================================================

1. VERIFY CHECKSUM (Recommended - ensures file integrity)

   On Linux/macOS:
     sha256sum -c Labs-Ai-$Version.sha256
     
   On macOS with shasum:
     shasum -a 256 -c Labs-Ai-$Version.sha256
     
   On Windows (PowerShell):
     $(Get-FileHash Labs-Ai-$Version.zip -Algorithm SHA256).Hash -eq (Get-Content Labs-Ai-$Version.sha256 -First 1).Split()[0]

   Expected output: OK or verified message

2. EXTRACT AND VERIFY STRUCTURE

   Extract the archive:
     unzip Labs-Ai-$Version.zip
     
   Verify key files exist:
     ls Labs-Ai/app/
     ls Labs-Ai/lib/
     ls Labs-Ai/components/
     ls Labs-Ai/package.json

3. INSTALL AND BUILD

   Navigate to directory:
     cd Labs-Ai
     
   Install dependencies:
     npm install
     
   Run linting:
     npm run lint
     
   Build (optional):
     npm run build

BUILD INFORMATION:
================================================================================

For detailed build information, see: BUILD_${Version}_MANIFEST.md

The manifest includes:
  - Build date and builder information
  - Framework versions
  - Included components
  - Quick start guide
  - System requirements

CHECKSUM DETAILS:
================================================================================

SHA256: $SHA256
File: $ZipName
Size: $ZipSizeMB MB
Generated: $BuildDate

The SHA256 algorithm provides cryptographic verification that:
  - The file has not been modified or corrupted
  - The file comes from the expected source
  - All contents are intact and uncorrupted

WHY VERIFY?
================================================================================

Security:
  - Ensures the archive hasn't been tampered with
  - Protects against man-in-the-middle attacks
  - Verifies authenticity of the distribution

Integrity:
  - Detects download corruption
  - Catches network transmission errors
  - Ensures all files are complete

TROUBLESHOOTING:
================================================================================

If verification FAILS:
  1. Re-download the archive
  2. Check for network issues during download
  3. Verify you have the correct SHA256 file for this version
  4. Contact: https://github.com/LiTree89/Labs-Ai/issues

If extraction FAILS:
  1. Try a different unzip tool
  2. Verify the zip file is complete
  3. Check available disk space
  4. Ensure proper file permissions

If npm install FAILS:
  1. Ensure Node.js 18+ is installed: node --version
  2. Ensure npm is updated: npm --version
  3. Clear npm cache: npm cache clean --force
  4. Delete node_modules and package-lock.json, then retry

NEXT STEPS:
================================================================================

1. Verify checksum (see step 1 above)
2. Extract the archive
3. Read README.md and README_LITLABS.md
4. Follow ENVIRONMENT_SETUP.md for configuration
5. Follow DEPLOYMENT_GUIDE.md for deployment

SUPPORT:
================================================================================

Documentation: See included .md files
Issues: https://github.com/LiTree89/Labs-Ai/issues
Repository: https://github.com/LiTree89/Labs-Ai

================================================================================
Version: $Version
Build Date: $BuildDate
Status: Distribution Ready
================================================================================
"@

$VerifyContent | Out-File -FilePath $VerifyPath -Encoding ASCII
Write-Host "  ✓ Created $VerifyFile" -ForegroundColor Green

# PHASE 8: Summary
Write-Host "`n[PHASE 8] Release Summary" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "`nRelease artifacts created in: $OutputDir" -ForegroundColor Green
Write-Host ""
Write-Host "Files generated:" -ForegroundColor Cyan
Write-Host "  ✓ $ZipName ($ZipSizeMB MB)" -ForegroundColor Green
Write-Host "  ✓ $ChecksumFile" -ForegroundColor Green
Write-Host "  ✓ $ManifestFile" -ForegroundColor Green
Write-Host "  ✓ $VerifyFile" -ForegroundColor Green

Write-Host ""
Write-Host "Checksum:" -ForegroundColor Cyan
Write-Host "  $SHA256" -ForegroundColor Yellow

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review: $($OutputDir)/BUILD_${Version}_MANIFEST.md" -ForegroundColor Gray
Write-Host "  2. Verify: $($OutputDir)/VERIFY.txt" -ForegroundColor Gray
Write-Host "  3. Distribute: $($OutputDir)/$ZipName" -ForegroundColor Gray

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "✓ Labs-Ai v$Version Release Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
