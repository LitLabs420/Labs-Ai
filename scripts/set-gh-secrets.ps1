<#
CLI helper: set multiple GitHub repo secrets from local files or environment variables.
- Requires: GitHub CLI (`gh`) installed and authenticated.
- Usage: set-gh-secrets.ps1 -RepoOrg MyOrg -RepoName my-repo -SecretsFile ./secrets.json
  where `secrets.json` is a flat JSON: { "GCP_SA_KEY": "<contents>", "STRIPE_KEY": "sk_live_..." }
#>
param(
  [Parameter(Mandatory=$true)]
  [string]$RepoOrg,
  [Parameter(Mandatory=$true)]
  [string]$RepoName,
  [string]$SecretsFile
)

if ($SecretsFile) {
  if (-not (Test-Path $SecretsFile)) { Write-Error "Secrets file not found: $SecretsFile"; exit 2 }
  $json = Get-Content $SecretsFile -Raw | ConvertFrom-Json
} else {
  Write-Error "SecretsFile is required for this helper (keep keys out of the repo)"; exit 2
}

foreach ($key in $json.PSObject.Properties.Name) {
  $val = $json.$key
  Write-Host "Setting secret: $key"
  $tmp = [System.IO.Path]::GetTempFileName()
  Set-Content -Path $tmp -Value $val -Encoding UTF8
  gh secret set $key --body "$(Get-Content -Raw $tmp)" --repo "$RepoOrg/$RepoName"
  Remove-Item $tmp -Force
}

Write-Host "All secrets set (verify in GitHub UI)."
