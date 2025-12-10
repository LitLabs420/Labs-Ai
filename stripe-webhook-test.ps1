# Stripe Webhook Testing Script (Windows PowerShell)
# This script helps you test your Stripe webhook implementation locally

Write-Host "🔧 Stripe Webhook Testing Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Check if Stripe CLI is installed
$stripeCommand = Get-Command stripe -ErrorAction SilentlyContinue

if ($null -eq $stripeCommand) {
    Write-Host "❌ Stripe CLI is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install it from: https://stripe.com/docs/stripe-cli" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Windows (via Scoop):" -ForegroundColor Cyan
    Write-Host "  scoop install stripe" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Windows (via Choco):" -ForegroundColor Cyan
    Write-Host "  choco install stripe-cli" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Or download directly from:" -ForegroundColor Yellow
    Write-Host "  https://github.com/stripe/stripe-cli/releases" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Stripe CLI found" -ForegroundColor Green
Write-Host ""

# Check if user is logged in
$status = stripe status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "📝 You need to login to Stripe" -ForegroundColor Yellow
    Write-Host "Running: stripe login" -ForegroundColor Cyan
    Write-Host ""
    stripe login
}

Write-Host ""
Write-Host "🚀 Starting webhook listener..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "This will forward Stripe events to localhost:3000/api/webhooks/stripe" -ForegroundColor Cyan
Write-Host ""
Write-Host "In another PowerShell window, trigger test events with:" -ForegroundColor Yellow
Write-Host "  stripe trigger payment_intent.succeeded" -ForegroundColor Gray
Write-Host "  stripe trigger customer.subscription.created" -ForegroundColor Gray
Write-Host "  stripe trigger charge.refunded" -ForegroundColor Gray
Write-Host "  stripe trigger invoice.payment_succeeded" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop listening" -ForegroundColor Yellow
Write-Host ""

# Start listening for webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
