param(
    [string]$BackupPath = 'C:\Users\dying\secret-backups\20251202-222228',
    [switch]$GeneratePassword,
    [string]$Password
)

# Usage examples:
# .\encrypt-backup.ps1                     # prompts for password
# .\encrypt-backup.ps1 -GeneratePassword   # generate a strong password with openssl
# .\encrypt-backup.ps1 -Password 'pa$$w0rd' # use provided password

if (-not (Test-Path $BackupPath)) {
    Write-Error "Backup path not found: $BackupPath"
    exit 1
}

$zip = "$BackupPath.zip"
Write-Output "Creating zip: $zip"
Compress-Archive -Path (Join-Path $BackupPath '*') -DestinationPath $zip -Force

# Determine password
if ($GeneratePassword) {
    $pw = & 'C:\msys64\mingw64\bin\openssl.exe' rand -hex 32
    $pw = $pw.Trim()
} elseif ($Password) {
    $pw = $Password
} else {
    # prompt for password (secure input)
    $sec = Read-Host -AsSecureString 'Enter encryption password (will not echo)'
    $pw = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
}

Write-Output 'Encrypting zip to .enc using openssl aes-256-cbc'
$enc = "$zip.enc"
& 'C:\msys64\mingw64\bin\openssl.exe' enc -aes-256-cbc -pbkdf2 -iter 100000 -salt -in $zip -out $enc -pass pass:$pw
if ($LASTEXITCODE -ne 0) {
    Write-Error 'OpenSSL encryption failed'
    exit 2
}

Write-Output "Encryption successful: $enc"
Write-Output 'Removing plaintext backup folder and intermediate zip'
Remove-Item -LiteralPath $BackupPath -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $zip -Force -ErrorAction SilentlyContinue

Write-Output 'Encrypted backup path:'
Write-Output $enc
Write-Output 'Encryption password (save this now):'
Write-Output $pw

# Optional: securely wipe free space (slow). Uncomment to enable.
# Write-Output 'Wiping free space on drive (this may take a long time)'; cipher /w:(Split-Path $BackupPath -Qualifier)
