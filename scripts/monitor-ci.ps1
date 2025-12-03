$runId = 19862060026
$repo = 'LiTree89/Labs-Ai'
$max = 120
for ($i=0; $i -lt $max; $i++) {
  $rJson = gh run view $runId --repo $repo --json status,conclusion
  if (-not $rJson) { Write-Host "No response from gh; sleeping..."; Start-Sleep -Seconds 5; continue }
  $r = $rJson | ConvertFrom-Json
  Write-Host ("Check {0}: {1} {2}" -f ($i+1), $r.status, ($r.conclusion -ne $null ? $r.conclusion : ''))
  if ($r.status -ne 'in_progress') { break }
  Start-Sleep -Seconds 10
}
# Save logs and show tail
gh run view $runId --repo $repo --log > "./run-$runId.log"
Get-Content "./run-$runId.log" -Tail 400
# Attempt to download artifacts
try {
  gh run download $runId --repo $repo -D "./artifacts-$runId"
} catch {
  Write-Host "gh run download returned non-zero; continuing"
}
if (Test-Path "./artifacts-$runId") {
  Get-ChildItem "./artifacts-$runId" -Recurse -File | Select-Object -First 200 | ForEach-Object { Write-Host $_.FullName }
} else {
  Write-Host 'no artifacts found'
}
