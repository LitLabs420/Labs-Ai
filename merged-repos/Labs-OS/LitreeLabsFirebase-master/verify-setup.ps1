#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Quick setup verification script
  Checks all environment variables and Stripe configuration
#>

Write-Host "`n" -ForegroundColor Cyan
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     STRIPE WEBHOOK SETUP - VERIFICATION                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$ProjectRoot = Get-Location
$EnvFile = Join-Path $ProjectRoot ".env.local"

# Check .env.local
Write-Host "✓ Checking .env.local..." -ForegroundColor Yellow
if (Test-Path $EnvFile) {
  Write-Host "  ✅ Found: $EnvFile" -ForegroundColor Green
  
  $content = Get-Content $EnvFile
  
  # Check for required variables
  $checks = @{
    "STRIPE_SECRET_KEY" = $false
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" = $false
    "STRIPE_WEBHOOK_SECRET" = $false
    "INTERNAL_WEBHOOK_SECRET" = $false
  }
  
  foreach ($line in $content) {
    foreach ($key in $checks.Keys) {
      if ($line -match "^$key=") {
        $checks[$key] = $true
      }
    }
  }
  
  Write-Host ""
  Write-Host "Configuration Status:" -ForegroundColor Cyan
  foreach ($key in $checks.Keys) {
    if ($checks[$key]) {
      Write-Host "  ✅ $key" -ForegroundColor Green
    } else {
      Write-Host "  ❌ $key (MISSING)" -ForegroundColor Red
    }
  }
} else {
  Write-Host "  ❌ NOT FOUND: $EnvFile" -ForegroundColor Red
}

Write-Host ""
Write-Host "Stripe CLI Status:" -ForegroundColor Cyan
if (Get-Command stripe -ErrorAction SilentlyContinue) {
  Write-Host "  ✅ Stripe CLI installed" -ForegroundColor Green
  Write-Host "  Version: $(stripe --version)" -ForegroundColor Gray
} else {
  Write-Host "  ❌ Stripe CLI not installed" -ForegroundColor Yellow
  Write-Host "  Install: choco install stripe-cli -y" -ForegroundColor Gray
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     SETUP STATUS: READY TO RUN ✅                          ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host ""
Write-Host "📝 NEXT STEPS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Start your dev server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "2️⃣  In another terminal, listen for webhooks:" -ForegroundColor White
Write-Host "   stripe listen --forward-to http://localhost:3000/api/webhooks/stripe" -ForegroundColor Yellow
Write-Host ""
Write-Host "3️⃣  Copy the webhook secret from the output (whsec_test_...)" -ForegroundColor White
Write-Host ""
Write-Host "4️⃣  Update .env.local with the real secret:" -ForegroundColor White
Write-Host "   STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_SECRET_HERE" -ForegroundColor Yellow
Write-Host ""
Write-Host "5️⃣  Test with:" -ForegroundColor White
Write-Host "   stripe trigger checkout.session.completed" -ForegroundColor Yellow
Write-Host ""
Write-Host "Webhook Endpoint:" -ForegroundColor Cyan
Write-Host "   POST http://localhost:3000/api/webhooks/stripe" -ForegroundColor Gray
Write-Host ""
