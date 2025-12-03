<#
.SYNOPSIS
  Safe credential rotation helper (dry-run by default).

.DESCRIPTION
  Generates provider-specific rotation commands for GCP/Firebase, Stripe,
  SendGrid, OpenAI, GitHub, and Vercel. The script prints commands and
  guidance. It will only execute commands if you pass -Execute and required
  environment variables (tokens/API keys) are present. This avoids accidental
  destructive operations.

.EXAMPLE
  # Dry-run (default)
  pwsh .\scripts\rotate-credentials.ps1

.EXAMPLE
  # Execute (requires tokens set in env):
  $env:GITHUB_TOKEN = '<token>'
  $env:GCLOUD_PROJECT = 'your-gcp-project'
  pwsh .\scripts\rotate-credentials.ps1 -Execute
#>

param(
    [switch]$Execute
)

function Write-Section { param($s) Write-Host "`n=== $s ===`n" -ForegroundColor Cyan }

Write-Section "Rotation Script - Dry Run"
Write-Host "This script prints rotation commands for multiple providers."
Write-Host "It will NOT run any commands unless you pass -Execute and have set the required env vars." -ForegroundColor Yellow

function Test-Env([string]$name){
  try {
    $item = Get-Item -Path "Env:$name" -ErrorAction SilentlyContinue
    if (-not $item) { Write-Host "Missing env var: $name" -ForegroundColor Red; return $false }
    return $true
  } catch {
    Write-Host "Missing env var: $name" -ForegroundColor Red
    return $false
  }
}

Write-Section "GCP / Firebase (service account keys & web API keys)"
Write-Host "Actions (manual or CLI):"
Write-Host "- Revoke old service-account keys and create new ones. Update Firebase Admin service account on servers."
Write-Host "- For web API keys (browser), rotate in the Google Cloud Console and update client-side envs behind a deploy gate."
Write-Host "gcloud examples (dry-run):"
Write-Host "# List service accounts for project: gcloud iam service-accounts list --project \$GCLOUD_PROJECT"
Write-Host "# Create key for service account: gcloud iam service-accounts keys create new-key.json --iam-account svc-account@\$GCLOUD_PROJECT.iam.gserviceaccount.com --project \$GCLOUD_PROJECT"
Write-Host "# Revoke/Delete old key: gcloud iam service-accounts keys delete KEY_ID --iam-account svc-account@\$GCLOUD_PROJECT.iam.gserviceaccount.com --project \$GCLOUD_PROJECT"

Write-Section "Stripe"
Write-Host "Actions: create new restricted API key(s) in Stripe Dashboard or via Stripe CLI, update backend, then revoke old keys."
Write-Host "Stripe CLI (dry-run):"
Write-Host "# Create a new restricted key via Dashboard (recommended). Or with the API/CLI create ephemeral tokens and rotate programmatically."

Write-Section "SendGrid"
Write-Host "Actions: create new API key with minimal scope, update apps, then revoke old key via Dashboard or API."

Write-Section "OpenAI"
Write-Host "Actions: create new API key in the OpenAI console, update server envs, and revoke old keys."

Write-Section "GitHub Actions / Repository Secrets"
Write-Host "Actions: update repo secrets using the GitHub CLI (gh). Example (dry-run):"
Write-Host "gh secret set NAME --body '<new-secret>' --repo <owner>/<repo>"

Write-Host "Batch update example using previously-committed helper (scripts/set-gh-secrets.ps1):"
Write-Host "pwsh .\scripts\set-gh-secrets.ps1 -SecretsFile './secrets-to-set.json'"

Write-Section "Vercel"
Write-Host "Actions: create new environment variables via Vercel Dashboard or API, redeploy, then remove old values."
Write-Host "Vercel CLI example (dry-run):"
Write-Host "# vercel env add VARIABLE_NAME production <value>"

if ($Execute) {
    Write-Section "EXECUTION: validating environment"
    $ok = $true
    $ok = $ok -and (Test-Env 'GITHUB_TOKEN')
    $ok = $ok -and (Test-Env 'GCLOUD_PROJECT')
    if (-not $ok) { Write-Host "Missing required environment variables. Aborting execution." -ForegroundColor Red; exit 2 }

    Write-Section "EXECUTION: running selected actions"
    Write-Host "Note: This will attempt to run provider CLIs/APIs. Ensure CLI tools are installed and authenticated." -ForegroundColor Yellow

    # Example: rotate GitHub secret named EXAMPLE_SECRET by using gh (ensure GITHUB_TOKEN present)
    if (Get-Command gh -ErrorAction SilentlyContinue) {
        Write-Host "Updating repository secret EXAMPLE_SECRET (example) via gh..."
        gh secret set EXAMPLE_SECRET --body "REPLACE_WITH_NEW_SECRET" --repo $env:GITHUB_REPOSITORY
    } else { Write-Host "gh CLI not found; skipping GitHub actions." }

    # Example: create a new service-account key (gcloud must be authenticated)
    if (Get-Command gcloud -ErrorAction SilentlyContinue) {
        Write-Host "Creating new service-account key (example)..."
        Write-Host "gcloud iam service-accounts keys create ./new-key.json --iam-account svc-account@$($env:GCLOUD_PROJECT).iam.gserviceaccount.com --project $($env:GCLOUD_PROJECT)"
        # Uncomment to actually run:
        # gcloud iam service-accounts keys create ./new-key.json --iam-account svc-account@$($env:GCLOUD_PROJECT).iam.gserviceaccount.com --project $($env:GCLOUD_PROJECT)
    } else { Write-Host "gcloud not found; skipping GCP actions." }

    Write-Section "EXECUTION COMPLETE"
    Write-Host "Review provider consoles to confirm new keys are active, update CI/GitHub Actions with new secrets, and revoke old keys." -ForegroundColor Green
} else {
    Write-Host "Dry-run complete. To execute, re-run with -Execute and set required environment variables (GITHUB_TOKEN, GCLOUD_PROJECT, etc.)." -ForegroundColor Green
}
