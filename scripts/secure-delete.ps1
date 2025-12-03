<#
Secure delete helper.
- If Sysinternals `sdelete` is available, it will use that.
- Otherwise uses Windows `cipher /w` on the parent folder to overwrite free space (best-effort).
#>
param(
  [Parameter(Mandatory=$true)]
  [string]$Path
)

if (-not (Test-Path $Path)) {
  Write-Error "Path not found: $Path"
  exit 2
}

# If sdelete is available, use it (more reliable)
$sd = Get-Command sdelete -ErrorAction SilentlyContinue
if ($sd) {
  Write-Host "Using sdelete to securely delete: $Path"
  & sdelete -p 3 -s -q "$Path"
  exit $LASTEXITCODE
}

# Otherwise remove and overwrite free space on the drive using cipher (best-effort)
Write-Host "sdelete not found. Deleting and using cipher /w (best-effort)."
Remove-Item -Recurse -Force -Path $Path
$parent = Split-Path -Path $Path -Parent
if (-not $parent) { $parent = $Path }
$drive = ([System.IO.Path]::GetPathRoot($parent))
if ($drive) {
  Write-Host "Overwriting free space on drive: $drive"
  cipher /w:$drive
}

exit 0
