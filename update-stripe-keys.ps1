#!/usr/bin/env powershell
# STRIPE KEYS UPDATE SCRIPT
# This script helps you update your Stripe keys from test to live

# Color output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Host "🔑 FLIPFORGE STRIPE KEYS UPDATE" -ForegroundColor Cyan
Write-Host "================================`n"

# Get keys from user
Write-Host "1️⃣ Go to Stripe Dashboard: https://dashboard.stripe.com" -ForegroundColor Yellow
Write-Host "2️⃣ Click: Developers → API Keys`n"

$publishableKey = Read-Host "Enter your Publishable Key (pk_live_...)"
$secretKey = Read-Host "Enter your Secret Key (sk_live_...)" -AsSecureString
$webhookSecret = Read-Host "Enter your Webhook Secret (whsec_...)"

# Validate keys
if (-not $publishableKey.StartsWith("pk_live_")) {
    Write-Error "❌ Publishable key must start with pk_live_"
    exit 1
}

if (-not $webhookSecret.StartsWith("whsec_")) {
    Write-Error "❌ Webhook secret must start with whsec_"
    exit 1
}

Write-Success "✅ Keys validated`n"

# Set up Firebase config
Write-Host "📝 Setting Firebase environment variables...`n" -ForegroundColor Cyan

# Convert secure string to plain text for Firebase config
$secretKeyPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($secretKey))

# Run Firebase commands
Write-Host "Running: firebase functions:config:set stripe.secret_key=`"sk_live_...`"`n"
firebase functions:config:set stripe.secret_key=$secretKeyPlain

Write-Host "Running: firebase functions:config:set stripe.webhook_secret=`"whsec_...`"`n"
firebase functions:config:set stripe.webhook_secret=$webhookSecret

Write-Success "✅ Firebase config updated`n"

# Deploy functions
Write-Host "🚀 Deploying Cloud Functions...`n" -ForegroundColor Cyan
firebase deploy --only functions

Write-Success "`n✅ STRIPE KEYS UPDATED!`n"

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to: https://studio-4627045237-a2fe9.web.app"
Write-Host "2. Sign up and create account"
Write-Host "3. Go to Upgrade page and try $9 purchase"
Write-Host "4. Use your LIVE card (not test card)"
Write-Host "5. Check Stripe Dashboard for payment`n"

Write-Success "💰 You're now accepting real payments!"
