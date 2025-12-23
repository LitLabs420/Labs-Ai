<#
.SYNOPSIS
  Stripe CLI Webhook Setup Script
  Automatically installs Stripe CLI, authenticates, and captures webhook secret

.DESCRIPTION
  - Ensures Stripe CLI is installed (via Chocolatey)
  - Logs into your Stripe account
  - Starts webhook forwarding to localhost
  - Captures the whsec_... signing secret
  - Automatically updates .env.local

.USAGE
  powershell -ExecutionPolicy Bypass -File .\stripe-webhook-setup.ps1

.NOTES
  Requires: Windows, PowerShell 5.0+, Stripe account
#>

# =========================================================
# CONFIG (EDIT IF NEEDED)
# =========================================================
$ForwardToUrl = "http://localhost:3000/api/webhooks/stripe"
$ProjectRoot  = (Get-Location).Path
$EnvFile      = Join-Path $ProjectRoot ".env.local"
$EnvKey       = "STRIPE_WEBHOOK_SECRET"
$TestEvent    = "checkout.session.completed"

# =========================================================
# HELPER FUNCTIONS
# =========================================================
function Write-Section($title) {
  Write-Host ""
  Write-Host "============================================================" -ForegroundColor Cyan
  Write-Host $title -ForegroundColor Cyan
  Write-Host "============================================================" -ForegroundColor Cyan
}

function Write-Success($msg) {
  Write-Host "✅ $msg" -ForegroundColor Green
}

function Write-Warning($msg) {
  Write-Host "⚠️  $msg" -ForegroundColor Yellow
}

function Write-Error($msg) {
  Write-Host "❌ $msg" -ForegroundColor Red
}

function Command-Exists($cmd) {
  return [bool](Get-Command $cmd -ErrorAction SilentlyContinue)
}

# =========================================================
# MAIN SCRIPT
# =========================================================

Write-Section "Stripe CLI Webhook Setup"

# Step 1: Check .env.local exists
Write-Section "Step 1: Checking .env.local"
if (-not (Test-Path $EnvFile)) {
  Write-Error ".env.local not found at: $EnvFile"
  Write-Warning "Please ensure you're in the project root directory or run setup first"
  exit 1
}
Write-Success ".env.local found"

# Step 2: Check if Stripe CLI is installed
Write-Section "Step 2: Checking Stripe CLI"
if (Command-Exists "stripe") {
  Write-Success "Stripe CLI is already installed"
} else {
  Write-Warning "Stripe CLI not found. Attempting installation..."
  
  # Try Chocolatey first
  if (Command-Exists "choco") {
    Write-Host "Installing Stripe CLI via Chocolatey..." -ForegroundColor Yellow
    choco install stripe-cli -y
    
    if (Command-Exists "stripe") {
      Write-Success "Stripe CLI installed successfully"
    } else {
      Write-Error "Failed to install Stripe CLI via Chocolatey"
      Write-Host "Please install manually from: https://github.com/stripe/stripe-cli/releases" -ForegroundColor Yellow
      exit 1
    }
  } else {
    Write-Error "Chocolatey not found and Stripe CLI not installed"
    Write-Host "Install Stripe CLI manually from: https://github.com/stripe/stripe-cli/releases" -ForegroundColor Yellow
    Write-Host "Or install Chocolatey first: https://chocolatey.org/install" -ForegroundColor Yellow
    exit 1
  }
}

# Step 3: Login to Stripe
Write-Section "Step 3: Stripe Authentication"
Write-Host "Running: stripe login" -ForegroundColor Yellow
Write-Host "A browser window will open. Please authenticate with your Stripe account." -ForegroundColor Cyan
Read-Host "Press Enter to continue..."

stripe login
if ($LASTEXITCODE -ne 0) {
  Write-Error "Stripe login failed"
  exit 1
}
Write-Success "Stripe authentication successful"

# Step 4: Listen for webhooks
Write-Section "Step 4: Starting Webhook Listener"
Write-Host "Forwarding to: $ForwardToUrl" -ForegroundColor Cyan
Write-Host "Project root: $ProjectRoot" -ForegroundColor Cyan
Write-Host ""
Write-Host "Running: stripe listen --forward-to $ForwardToUrl" -ForegroundColor Yellow
Write-Host "Waiting for webhook secret..." -ForegroundColor Cyan
Write-Host "(This may take 10-15 seconds)" -ForegroundColor Gray
Write-Host ""

# Capture stripe listen output
$output = stripe listen --forward-to $ForwardToUrl 2>&1 | Select-Object -First 50

# Parse the signing secret from output
$secret = $null
foreach ($line in $output) {
  if ($line -match "whsec_[a-zA-Z0-9_]+") {
    $secret = $Matches[0]
    break
  }
}

if (-not $secret) {
  Write-Error "Failed to capture webhook signing secret"
  Write-Host "Please check your Stripe CLI output above" -ForegroundColor Yellow
  exit 1
}

Write-Success "Webhook signing secret captured: $secret"

# Step 5: Update .env.local
Write-Section "Step 5: Updating .env.local"

$envContent = Get-Content $EnvFile -Raw

# Check if key already exists
if ($envContent -match "STRIPE_WEBHOOK_SECRET=") {
  $envContent = $envContent -replace "STRIPE_WEBHOOK_SECRET=.*", "STRIPE_WEBHOOK_SECRET=$secret"
  Write-Host "Updated existing STRIPE_WEBHOOK_SECRET" -ForegroundColor Yellow
} else {
  $envContent += "`nSTRIPE_WEBHOOK_SECRET=$secret`n"
  Write-Host "Added new STRIPE_WEBHOOK_SECRET" -ForegroundColor Yellow
}

Set-Content -Path $EnvFile -Value $envContent -Encoding UTF8
Write-Success ".env.local updated successfully"

# Step 6: Summary
Write-Section "Setup Complete! ✅"
Write-Host ""
Write-Host "Your webhook secret has been added to .env.local" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Restart your development server (if running):" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Keep stripe CLI running in THIS terminal (or run in background)" -ForegroundColor White
Write-Host ""
Write-Host "3. In another terminal, test with:" -ForegroundColor White
Write-Host "   stripe trigger $TestEvent" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Check your server logs for the webhook event" -ForegroundColor White
Write-Host ""
Write-Host "USEFUL COMMANDS:" -ForegroundColor Cyan
Write-Host "  stripe listen                              # Show events in real-time" -ForegroundColor Gray
Write-Host "  stripe trigger checkout.session.completed  # Test payment webhook" -ForegroundColor Gray
Write-Host "  stripe trigger charge.failed               # Test failed charge" -ForegroundColor Gray
Write-Host "  stripe events list                          # View all events" -ForegroundColor Gray
Write-Host "  stripe logout                              # Disconnect" -ForegroundColor Gray
Write-Host ""
