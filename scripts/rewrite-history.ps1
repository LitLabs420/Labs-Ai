Set-StrictMode -Version Latest

# Change to repo root
Set-Location "$PSScriptRoot\.."

$origin = git remote get-url origin
if (-not $origin) {
  Write-Error "origin remote not found"
  exit 2
}

$ts = (Get-Date).ToString('yyyyMMdd-HHmmss')
$rewrite = "repo-rewrite-$ts.git"
Write-Output "Cloning mirror from $origin to $rewrite"
git clone --mirror $origin $rewrite
if ($LASTEXITCODE -ne 0) { Write-Error "git clone --mirror failed"; exit 3 }

# Run included git-filter-repo script to remove the sensitive file from history
$gfr = Join-Path -Path (Get-Location) -ChildPath 'git-filter-repo'
if (-not (Test-Path $gfr)) {
  Write-Error "git-filter-repo script not found at $gfr"
  exit 4
}

Write-Output "Running git-filter-repo on $rewrite (removing githistory-secrets.txt)"
# Run against the bare mirror
Push-Location $rewrite
python $gfr --invert-paths --path githistory-secrets.txt --force
if ($LASTEXITCODE -ne 0) { Write-Error "git-filter-repo failed"; Pop-Location; exit 5 }
Pop-Location

# Ensure the bare mirror has a remote to push to (git-filter-repo removes remotes)
Write-Output "Ensuring origin remote exists in $rewrite"
$originUrl = $origin
git --git-dir="$rewrite" remote remove origin 2>$null | Out-Null
git --git-dir="$rewrite" remote add origin $originUrl

# Create a pre-push snapshot branch for origin/master
Write-Output "Creating snapshot branch pre-origin-push-$ts-master"
git fetch origin --prune
$sha = (git ls-remote origin refs/heads/master | ForEach-Object { ($_ -split '\s+')[0] } | Select-Object -First 1)
if (-not $sha) { Write-Warning "Could not determine origin/master SHA; skipping snapshot branch" } else {
  git push origin $sha:refs/heads/pre-origin-push-$ts-master
}

# Push cleaned mirror to origin (try mirror first, then safe heads/tags fallback)
Write-Output "Pushing cleaned mirror to origin (this is destructive on refs)"
git --git-dir="$rewrite" push --mirror origin
if ($LASTEXITCODE -ne 0) {
  Write-Warning "Mirror push failed (likely due to protected/hidden refs). Trying heads/tags-only push."
  git --git-dir="$rewrite" push origin 'refs/heads/*:refs/heads/*' 'refs/tags/*:refs/tags/*'
  if ($LASTEXITCODE -ne 0) { Write-Error "Heads/tags push failed"; exit 7 }
}

Write-Output "Rewrite and push completed successfully"
exit 0
