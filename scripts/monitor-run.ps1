param(
    [long]$RunId
)

if (-not $RunId) {
    Write-Host "Usage: .\monitor-run.ps1 -RunId <run id>" -ForegroundColor Yellow
    exit 1
}

Write-Host "Monitoring run $RunId..."
while ($true) {
    $infoJson = gh run view $RunId --repo LiTree89/Labs-Ai --json status,conclusion 2>$null
    if (-not $infoJson) { Write-Host "gh returned nothing; retrying in 5s..."; Start-Sleep -Seconds 5; continue }
    $info = $infoJson | ConvertFrom-Json
    Write-Host "status=$($info.status) conclusion=$($info.conclusion)"
    if ($info.status -eq 'completed') { break }
    Start-Sleep -Seconds 8
}

Write-Host "Run completed: $($info.conclusion)"
Write-Host "Downloading artifacts to ./artifacts-$RunId"
gh run download $RunId --repo LiTree89/Labs-Ai -D "./artifacts-$RunId"
Write-Host "Download finished."
