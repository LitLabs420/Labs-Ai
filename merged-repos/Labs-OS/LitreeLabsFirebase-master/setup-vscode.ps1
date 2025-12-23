#!/usr/bin/env pwsh
# Labs OS - Complete Setup Verification & Configuration Script
# Run this to validate and complete your VS Code setup

Write-Host "🚀 Labs OS - Complete VS Code Setup" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Configuration
$workspace_path = Get-Location
$env_file = Join-Path $workspace_path ".env.local"
$env_example = Join-Path $workspace_path ".env.example"
$vscode_dir = Join-Path $workspace_path ".vscode"

# Counters
$errors = 0
$warnings = 0
$success = 0

# ============================================================================
# 1. CHECK PREREQUISITES
# ============================================================================
Write-Host "📋 CHECKING PREREQUISITES" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Check Node.js
Write-Host -NoNewline "  ✓ Node.js: "
try {
    $node_version = node --version
    Write-Host $node_version -ForegroundColor Green
    $success++
} catch {
    Write-Host "NOT INSTALLED" -ForegroundColor Red
    $errors++
}

# Check npm/pnpm
Write-Host -NoNewline "  ✓ Package Manager: "
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    $pnpm_version = pnpm --version
    Write-Host "pnpm $pnpm_version" -ForegroundColor Green
    $success++
} elseif (Get-Command npm -ErrorAction SilentlyContinue) {
    $npm_version = npm --version
    Write-Host "npm $npm_version" -ForegroundColor Yellow
    $warnings++
} else {
    Write-Host "NOT FOUND" -ForegroundColor Red
    $errors++
}

# Check Git
Write-Host -NoNewline "  ✓ Git: "
try {
    $git_version = git --version
    Write-Host $git_version -ForegroundColor Green
    $success++
} catch {
    Write-Host "NOT INSTALLED" -ForegroundColor Red
    $errors++
}

Write-Host ""

# ============================================================================
# 2. CHECK VS CODE CONFIGURATION
# ============================================================================
Write-Host "🎨 VS CODE CONFIGURATION" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

$vscode_files = @(
    "settings.json",
    "launch.json",
    "tasks.json",
    "extensions.json",
    "gitlens.json"
)

foreach ($file in $vscode_files) {
    $file_path = Join-Path $vscode_dir $file
    Write-Host -NoNewline "  ✓ .$vscode_dir\$file: "
    if (Test-Path $file_path) {
        Write-Host "✓" -ForegroundColor Green
        $success++
    } else {
        Write-Host "MISSING" -ForegroundColor Yellow
        $warnings++
    }
}

Write-Host ""

# ============================================================================
# 3. CHECK ENVIRONMENT CONFIGURATION
# ============================================================================
Write-Host "🔐 ENVIRONMENT CONFIGURATION" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

if (Test-Path $env_file) {
    Write-Host "  ✓ .env.local: EXISTS" -ForegroundColor Green
    $success++
    
    # Check for key environment variables
    $env_content = Get-Content $env_file -Raw
    $required_keys = @(
        "FIREBASE_PROJECT_ID",
        "FIREBASE_API_KEY",
        "STRIPE_SECRET_KEY",
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    )
    
    foreach ($key in $required_keys) {
        if ($env_content -match "^$key=") {
            Write-Host "    ✓ $key configured" -ForegroundColor Green
        } else {
            Write-Host "    ⚠ $key missing" -ForegroundColor Yellow
            $warnings++
        }
    }
} else {
    Write-Host "  ⚠ .env.local: NOT FOUND" -ForegroundColor Yellow
    Write-Host "    Please copy .env.example to .env.local and configure" -ForegroundColor Yellow
    $warnings++
}

Write-Host ""

# ============================================================================
# 4. CHECK NODE MODULES
# ============================================================================
Write-Host "📦 DEPENDENCIES" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan

$node_modules = Join-Path $workspace_path "node_modules"

Write-Host -NoNewline "  ✓ node_modules: "
if (Test-Path $node_modules) {
    Write-Host "✓ (already installed)" -ForegroundColor Green
    $success++
} else {
    Write-Host "NOT INSTALLED" -ForegroundColor Yellow
    Write-Host "    Run: npm install or pnpm install" -ForegroundColor Yellow
    $warnings++
}

Write-Host ""

# ============================================================================
# 5. SHOW RECOMMENDATIONS
# ============================================================================
Write-Host "📚 RECOMMENDED VS CODE EXTENSIONS" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$extensions = @(
    "dbaeumer.vscode-eslint - ESLint",
    "esbenp.prettier-vscode - Prettier",
    "bradlc.vscode-tailwindcss - Tailwind CSS",
    "ms-dotnettools.csharp - C#",
    "GitHub.copilot - GitHub Copilot",
    "GitHub.copilot-chat - Copilot Chat",
    "eamodio.gitlens - GitLens",
    "ms-python.python - Python",
    "firebase.firebase - Firebase"
)

foreach ($ext in $extensions) {
    Write-Host "  • $ext" -ForegroundColor Cyan
}

Write-Host ""

# ============================================================================
# 6. OPTIONAL INSTALLATIONS
# ============================================================================
Write-Host "⚙️  OPTIONAL SETUP" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Would you like to install dependencies now? (y/n)" -ForegroundColor Yellow
$choice = Read-Host

if ($choice -eq 'y') {
    Write-Host ""
    Write-Host "Installing dependencies..." -ForegroundColor Green
    
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        pnpm install
    } else {
        npm install
    }
    
    Write-Host ""
}

# ============================================================================
# 7. SUMMARY
# ============================================================================
Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "SETUP SUMMARY" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "✅ Successful: $success" -ForegroundColor Green
Write-Host "⚠️  Warnings: $warnings" -ForegroundColor Yellow
Write-Host "❌ Errors: $errors" -ForegroundColor Red
Write-Host ""

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "✨ Setup Complete! You're ready to code!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Open .env.local and add your API keys" -ForegroundColor Cyan
    Write-Host "  2. Run: npm run dev (or pnpm dev)" -ForegroundColor Cyan
    Write-Host "  3. Visit: http://localhost:3000" -ForegroundColor Cyan
} elseif ($errors -eq 0) {
    Write-Host "✅ Setup mostly complete. Resolve warnings above." -ForegroundColor Yellow
} else {
    Write-Host "❌ Please resolve errors above before continuing." -ForegroundColor Red
}

Write-Host ""
